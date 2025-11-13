Sync server for forum thread (commits to GitHub)
===============================================

This small Node/Express app accepts POST requests with the forum thread payload and commits it to your GitHub repository (useful to keep `discussionThread.json` in the repo and have GitHub Pages serve the updated content).

Security and requirements
- You must create a GitHub Personal Access Token (PAT) with `repo` scope.
- Set the following environment variables before running:
  - GITHUB_TOKEN - your PAT
  - GITHUB_OWNER - your GitHub username or org
  - GITHUB_REPO - the repository name (e.g., `havran`)
  - GITHUB_BRANCH - (optional) branch to commit to (default: `main`)
  - FILE_PATH - (optional) path to the JSON file in the repo (default: `sites/diskusion forum/discussionThread.json`)
  - SERVER_SECRET - (strongly recommended) a secret string that the client will send in `x-server-secret` header to authorize requests

Quick start (local)
1. Install dependencies:

   npm install

2. Create a `.env` file with the required variables (example):

   GITHUB_TOKEN=ghp_xxx
   GITHUB_OWNER=YourUser
   GITHUB_REPO=havran
   GITHUB_BRANCH=main
   SERVER_SECRET=some-secret-value

3. Start the server:

   npm start

The server will listen on port 10000 by default.

Endpoint
- POST /api/thread
  - Headers: `Content-Type: application/json`, `x-server-secret: <SERVER_SECRET>` (if set)
  - Body: { title: string, posts: Array }

Deployment
- Deploy to Render, Heroku, Vercel (serverless functions), or any Node host. Set the environment variables in the host's dashboard.
- Ensure CORS is configured to allow your GitHub Pages origin (or leave open if you prefer).

Client integration
- In the client (browser), call the server endpoint with the payload when posts/comments change. The code in `sites/diskusion forum/forum.js` includes `scheduleSync()` and `syncToServer()` functions; configure `SYNC_ENDPOINT` and `SERVER_SECRET` there to match your deployment.

Notes
- Keep your PAT secret. Do not embed it in client-side code.
- This server performs commits on behalf of the server identity (PAT owner).
