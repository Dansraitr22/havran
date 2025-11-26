require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
const app = express();

const PORT = process.env.PORT || 10000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'Dansraitr22';
const GITHUB_REPO = 'havran';
const GITHUB_BRANCH = 'main';
const SERVER_SECRET = process.env.SERVER_SECRET || '';
const ALLOWED_ORIGIN = 'https://dansraitr22.github.io';

if (!GITHUB_TOKEN) {
  console.error('Missing GITHUB_TOKEN environment variable. Create a fine-grained token and set GITHUB_TOKEN.');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

app.use(bodyParser.json({ limit: '1mb' }));

// Configure CORS to allow a specific origin via ALLOWED_ORIGIN env var (defaults to '*').
app.use(cors({
  origin: function(origin, callback) {
    // Allow if ALLOWED_ORIGIN is '*' or if origin matches configured value or if origin is undefined (server-to-server)
    if (!ALLOWED_ORIGIN || ALLOWED_ORIGIN === '*' || !origin || origin === ALLOWED_ORIGIN) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  }
}));

// Simple in-memory rate limiter: per-IP request count within window
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '120', 10); // requests per window per IP
const rateMap = new Map();

// Simple health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Reports API for pitevna: read/write reports.json in the repo
app.get('/api/reports', async (req, res) => {
  try {
    const filePath = 'sites/pitevna/reports.json';
    const getRes = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      ref: GITHUB_BRANCH
    });
    const decoded = Buffer.from(getRes.data.content || '', 'base64').toString('utf8');
    try {
      const json = JSON.parse(decoded);
      return res.json(Array.isArray(json) ? json : []);
    } catch {
      return res.json([]);
    }
  } catch (err) {
    if (err && err.status === 404) return res.json([]);
    console.error('Error reading reports:', err);
    return res.status(500).json({ error: 'Failed to read reports' });
  }
});

app.post('/api/reports', async (req, res) => {
  try {
    // Optional server-side secret check
    if (SERVER_SECRET) {
      const incoming = req.headers['x-server-secret'];
      if (!incoming || incoming !== SERVER_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const report = req.body || {};
    // Basic field validation to avoid malformed entries
    const required = ['deceasedName','deceasedAge','deceasedSex','date','time','doctor','specialization','externalExam','internalExam','conclusion'];
    for (const key of required) {
      if (!(key in report)) return res.status(400).json({ error: `Missing field: ${key}` });
    }

    const filePath = 'sites/pitevna/reports.json';
    let sha = undefined;
    let existing = [];
    try {
      const getRes = await octokit.repos.getContent({ owner: GITHUB_OWNER, repo: GITHUB_REPO, path: filePath, ref: GITHUB_BRANCH });
      sha = getRes.data.sha;
      const decoded = Buffer.from(getRes.data.content || '', 'base64').toString('utf8');
      try { existing = JSON.parse(decoded); } catch { existing = []; }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    const updated = [ report, ...(Array.isArray(existing) ? existing : []) ];
    const contentBase64 = Buffer.from(JSON.stringify(updated, null, 2)).toString('base64');
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: 'Update pitevna reports via sync server',
      content: contentBase64,
      sha,
      branch: GITHUB_BRANCH
    });
    return res.json({ ok: true });
  } catch (err) {
    console.error('Error writing reports:', err);
    return res.status(500).json({ error: 'Failed to write reports' });
  }
});

// Endpoint to update a discussion thread file in the repo (per-site)
app.post('/api/thread', async (req, res) => {
  try {
    // Rate limiting by IP
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateMap.get(ip) || { count: 0, first: now };
    if (now - entry.first > RATE_LIMIT_WINDOW_MS) {
      entry.count = 0; entry.first = now;
    }
    entry.count += 1;
    rateMap.set(ip, entry);
    if (entry.count > RATE_LIMIT_MAX) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Optional server-side secret check to prevent abuse
    if (SERVER_SECRET) {
      const incoming = req.headers['x-server-secret'];
      if (!incoming || incoming !== SERVER_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const payload = req.body;
    if (!payload || !Array.isArray(payload.posts)) {
      return res.status(400).json({ error: 'Invalid payload, expected { posts: [] }' });
    }

    // Determine target file path. Client should send `filePath` (e.g. "sites/diskusion forum/discussionThread.json").
    const filePath = typeof payload.filePath === 'string' ? payload.filePath.trim() : '';
    if (!filePath) return res.status(400).json({ error: 'Missing filePath in payload' });

    // Sanitize and validate the file path - only allow files under the `sites/` folder and .json files.
    if (filePath.includes('..') || !filePath.startsWith('sites/') || !filePath.endsWith('.json')) {
      return res.status(400).json({ error: 'Invalid filePath' });
    }

    // Helper: signature for deduplication (author + message)
    function sig(obj) {
      if (!obj) return '';
      const a = (obj.author || obj.username || '').toString();
      const m = (obj.message || obj.msg || '').toString();
      return `${a}::${m}`;
    }

    // Merge comments/replies arrays by signature
    function mergeComments(existingComments = [], incomingComments = []) {
      const map = new Map();
      (existingComments || []).forEach(c => map.set(sig(c), c));
      (incomingComments || []).forEach(c => {
        const key = sig(c);
        if (!map.has(key)) {
          map.set(key, c);
        } else {
          // merge nested replies
          const ex = map.get(key);
          ex.replies = mergeReplies(ex.replies || [], c.replies || []);
        }
      });
      return Array.from(map.values());
    }

    function mergeReplies(existingReplies = [], incomingReplies = []) {
      const map = new Map();
      (existingReplies || []).forEach(r => map.set(sig(r), r));
      (incomingReplies || []).forEach(r => { if (!map.has(sig(r))) map.set(sig(r), r); });
      return Array.from(map.values());
    }

    function mergePosts(existingPosts = [], incomingPosts = []) {
      const map = new Map();
      (existingPosts || []).forEach(p => map.set(sig(p), p));
      (incomingPosts || []).forEach(p => {
        const key = sig(p);
        if (!map.has(key)) {
          map.set(key, p);
        } else {
          // Merge comments into existing post
          const ex = map.get(key);
          ex.comments = mergeComments(ex.comments || [], p.comments || []);
        }
      });
      return Array.from(map.values());
    }

    // Get existing file to obtain sha and existing content (if exists)
    let sha = undefined;
    let existing = null;
    try {
      const getRes = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath,
        ref: GITHUB_BRANCH
      });
      sha = getRes.data.sha;
      // decode existing content
      if (getRes.data && getRes.data.content) {
        const decoded = Buffer.from(getRes.data.content, 'base64').toString('utf8');
        try { existing = JSON.parse(decoded); } catch (e) { existing = null; }
      }
    } catch (err) {
      // If not found, we'll create it
      if (err.status !== 404) throw err;
    }

    // Merge incoming posts with existing posts (avoid deleting old posts)
    const incoming = {
      title: payload.title || (existing && existing.title) || 'Discussion Thread',
      posts: Array.isArray(payload.posts) ? payload.posts : []
    };

    // Debug logging to help determine why overwrites occur
    const existingCount = existing && Array.isArray(existing.posts) ? existing.posts.length : 0;
    const incomingCount = Array.isArray(incoming.posts) ? incoming.posts.length : 0;
    console.log(`[sync] filePath=${filePath} existingPosts=${existingCount} incomingPosts=${incomingCount}`);

    // Safety: if client sent an empty posts array but there are existing posts, reject to avoid accidental overwrite
    if (incomingCount === 0 && existingCount > 0) {
      console.warn('[sync] incoming posts empty and existing posts present — rejecting to avoid data loss');
      return res.status(409).json({ error: 'Conflict: incoming posts empty while remote has posts. Use merge or provide posts.' });
    }

    let merged = { title: incoming.title, posts: incoming.posts };
    if (existing && Array.isArray(existing.posts)) {
      merged.posts = mergePosts(existing.posts, incoming.posts);
      // If incoming provided a title prefer it; otherwise keep existing
      merged.title = payload.title || existing.title || merged.title;
    }

    const contentBase64 = Buffer.from(JSON.stringify(merged, null, 2)).toString('base64');

    // Create or update file
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: `Update discussion thread via sync server`,
      content: contentBase64,
      sha,
      branch: GITHUB_BRANCH
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error updating thread:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// Endpoint to sync bazar items
app.post('/api/bazar', async (req, res) => {
  try {
    // Rate limiting by IP
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateMap.get(ip) || { count: 0, first: now };
    if (now - entry.first > RATE_LIMIT_WINDOW_MS) {
      entry.count = 0; entry.first = now;
    }
    entry.count += 1;
    rateMap.set(ip, entry);
    if (entry.count > RATE_LIMIT_MAX) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    // Optional server-side secret check
    if (SERVER_SECRET) {
      const incoming = req.headers['x-server-secret'];
      if (!incoming || incoming !== SERVER_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const payload = req.body;
    if (!payload || !Array.isArray(payload.items)) {
      return res.status(400).json({ error: 'Invalid payload, expected { items: [] }' });
    }

    const filePath = 'sites/bazar/defaultitems.json';

    // Get existing file
    let sha = undefined;
    let existing = [];
    try {
      const getRes = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath,
        ref: GITHUB_BRANCH
      });
      sha = getRes.data.sha;
      if (getRes.data && getRes.data.content) {
        const decoded = Buffer.from(getRes.data.content, 'base64').toString('utf8');
        try { existing = JSON.parse(decoded); } catch (e) { existing = []; }
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    console.log(`[bazar-sync] existingItems=${existing.length} incomingItems=${payload.items.length}`);

    // Merge items by signature (name + description)
    function itemSig(item) {
      return `${item.name || ''}::${item.description || ''}`;
    }

    const map = new Map();
    existing.forEach(item => map.set(itemSig(item), item));
    payload.items.forEach(item => {
      const key = itemSig(item);
      if (!map.has(key)) {
        map.set(key, item);
      }
    });

    const merged = Array.from(map.values());
    const contentBase64 = Buffer.from(JSON.stringify(merged, null, 2)).toString('base64');

    // Create or update file
    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: `Update bazar items via sync server`,
      content: contentBase64,
      sha,
      branch: GITHUB_BRANCH
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error syncing bazar:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// Endpoint for history-enthusiasts forum
app.post('/api/forum', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateMap.get(ip) || { count: 0, first: now };
    if (now - entry.first > RATE_LIMIT_WINDOW_MS) {
      entry.count = 0; entry.first = now;
    }
    entry.count += 1;
    rateMap.set(ip, entry);
    if (entry.count > RATE_LIMIT_MAX) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    if (SERVER_SECRET) {
      const incoming = req.headers['x-server-secret'];
      if (!incoming || incoming !== SERVER_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const payload = req.body;
    if (!payload || !Array.isArray(payload.posts)) {
      return res.status(400).json({ error: 'Invalid payload, expected { posts: [] }' });
    }

    const filePath = payload.filePath || 'sites/history-enthusiasts/posts.json';
    
    if (filePath.includes('..') || !filePath.startsWith('sites/') || !filePath.endsWith('.json')) {
      return res.status(400).json({ error: 'Invalid filePath' });
    }

    let sha = undefined;
    let existing = [];
    try {
      const getRes = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath,
        ref: GITHUB_BRANCH
      });
      sha = getRes.data.sha;
      if (getRes.data && getRes.data.content) {
        const decoded = Buffer.from(getRes.data.content, 'base64').toString('utf8');
        try { existing = JSON.parse(decoded); } catch (e) { existing = []; }
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    console.log(`[forum-sync] filePath=${filePath} existingPosts=${existing.length} incomingPosts=${payload.posts.length}`);

    function postSig(post) {
      return `${post.username || ''}::${post.message || ''}`;
    }

    const map = new Map();
    existing.forEach(post => map.set(postSig(post), post));
    payload.posts.forEach(post => {
      const key = postSig(post);
      if (!map.has(key)) {
        map.set(key, post);
      }
    });

    const merged = Array.from(map.values());
    const contentBase64 = Buffer.from(JSON.stringify(merged, null, 2)).toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: `Update forum posts via sync server`,
      content: contentBase64,
      sha,
      branch: GITHUB_BRANCH
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error syncing forum:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// Endpoint for leviathan forum
app.post('/api/leviathan', async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = rateMap.get(ip) || { count: 0, first: now };
    if (now - entry.first > RATE_LIMIT_WINDOW_MS) {
      entry.count = 0; entry.first = now;
    }
    entry.count += 1;
    rateMap.set(ip, entry);
    if (entry.count > RATE_LIMIT_MAX) {
      return res.status(429).json({ error: 'Rate limit exceeded' });
    }

    if (SERVER_SECRET) {
      const incoming = req.headers['x-server-secret'];
      if (!incoming || incoming !== SERVER_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    const payload = req.body;
    if (!payload || !Array.isArray(payload.posts)) {
      return res.status(400).json({ error: 'Invalid payload, expected { posts: [] }' });
    }

    const filePath = payload.filePath || 'sites/leviathan.cult/posts.json';
    
    if (filePath.includes('..') || !filePath.startsWith('sites/') || !filePath.endsWith('.json')) {
      return res.status(400).json({ error: 'Invalid filePath' });
    }

    let sha = undefined;
    let existing = [];
    try {
      const getRes = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath,
        ref: GITHUB_BRANCH
      });
      sha = getRes.data.sha;
      if (getRes.data && getRes.data.content) {
        const decoded = Buffer.from(getRes.data.content, 'base64').toString('utf8');
        try { existing = JSON.parse(decoded); } catch (e) { existing = []; }
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    console.log(`[leviathan-sync] filePath=${filePath} existingPosts=${existing.length} incomingPosts=${payload.posts.length}`);

    function postSig(post) {
      return `${post.username || ''}::${post.message || ''}`;
    }

    const map = new Map();
    existing.forEach(post => map.set(postSig(post), post));
    payload.posts.forEach(post => {
      const key = postSig(post);
      if (!map.has(key)) {
        map.set(key, post);
      }
    });

    const merged = Array.from(map.values());
    const contentBase64 = Buffer.from(JSON.stringify(merged, null, 2)).toString('base64');

    await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filePath,
      message: `Update leviathan forum via sync server`,
      content: contentBase64,
      sha,
      branch: GITHUB_BRANCH
    });

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error syncing leviathan:', err);
    return res.status(500).json({ error: err.message || String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Sync server listening on port ${PORT}`);
});
