require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
const app = express();

const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Dansraitr22';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Havran';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const SERVER_SECRET = process.env.SERVER_SECRET || '';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

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

    // Prepare content
    const contentObj = {
      title: payload.title || 'Discussion Thread',
      posts: payload.posts
    };
    const contentBase64 = Buffer.from(JSON.stringify(contentObj, null, 2)).toString('base64');

    // Get existing file to obtain sha (if exists)
    let sha = undefined;
    try {
      const getRes = await octokit.repos.getContent({
        owner: GITHUB_OWNER,
        repo: GITHUB_REPO,
        path: filePath,
        ref: GITHUB_BRANCH
      });
      sha = getRes.data.sha;
    } catch (err) {
      // If not found, we'll create it
      if (err.status !== 404) throw err;
    }

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

app.listen(PORT, () => {
  console.log(`Sync server listening on port ${PORT}`);
});
