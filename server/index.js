require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Octokit } = require('@octokit/rest');
const app = express();

const PORT = process.env.PORT || 3000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const FILE_PATH = process.env.FILE_PATH || 'sites/diskusion forum/discussionThread.json';
const SERVER_SECRET = process.env.SERVER_SECRET || '';

if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
  console.error('Missing GITHUB_TOKEN, GITHUB_OWNER or GITHUB_REPO environment variables.');
  process.exit(1);
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

app.use(bodyParser.json({ limit: '1mb' }));
app.use(cors());

// Simple health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Endpoint to update the discussion thread file in the repo
app.post('/api/thread', async (req, res) => {
  try {
    // Basic server-side secret check to prevent abuse
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
        path: FILE_PATH,
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
      path: FILE_PATH,
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
