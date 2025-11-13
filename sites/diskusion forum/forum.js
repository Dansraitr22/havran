document.addEventListener('DOMContentLoaded', () => {
    const postForm = document.getElementById('newPostForm');
    const postList = document.getElementById('postList');
    const loginModal = document.getElementById('loginModal');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const loggedInUserElement = document.getElementById('loggedInUser');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');

    let currentUser = localStorage.getItem('currentUser') || null;
    const posts = JSON.parse(localStorage.getItem('forumPosts')) || [];

    // Configuration: set `SYNC_ENDPOINT` to the deployed server URL that will commit updates to GitHub
    // Example: const SYNC_ENDPOINT = 'https://my-sync-server.example.com/api/thread'
    // You must deploy the server included in /server and set its SERVER_SECRET; the client
    // will send the SECRET in the 'x-server-secret' header. Replace the placeholder below.
    let SYNC_ENDPOINT = ''; // <-- set to your server URL when deployed
    const SERVER_SECRET_HEADER_NAME = 'x-server-secret';
    const SERVER_SECRET = ''; // <-- set this to match the server's SERVER_SECRET when testing

    // If running on localhost and no SYNC_ENDPOINT configured, default to local server
    try {
        const hostname = window && window.location && window.location.hostname;
        if (!SYNC_ENDPOINT && (hostname === 'localhost' || hostname === '127.0.0.1')) {
            SYNC_ENDPOINT = 'http://localhost:3000/api/thread';
            console.log('[forum] SYNC_ENDPOINT auto-set to', SYNC_ENDPOINT);
        }
    } catch (e) {
        // ignore - environment may be non-browser during build
    }

    // Compute the repository file path for this site's discussion thread.
    // The server expects paths like: "sites/<folder>/discussionThread.json"
    function computeSiteFilePath() {
        try {
            const pathname = window.location.pathname || '';
            const decoded = decodeURIComponent(pathname);
            const sitesIndex = decoded.indexOf('/sites/');
            if (sitesIndex !== -1) {
                // capture from 'sites/.../page.html' -> 'sites/...'
                const endIndex = decoded.lastIndexOf('/');
                const sitePath = decoded.substring(sitesIndex + 1, endIndex);
                return sitePath + '/discussionThread.json';
            }
        } catch (e) {
            console.warn('Could not compute site file path, falling back to diskusion forum');
        }
        // fallback to this folder's discussion file
        return 'sites/diskusion forum/discussionThread.json';
    }
    const FILE_PATH = computeSiteFilePath();

    // Debounced sync: schedule a server sync after local changes
    let __syncTimer = null;
    function scheduleSync() {
        if (!SYNC_ENDPOINT) return; // no-op if not configured
        if (__syncTimer) clearTimeout(__syncTimer);
        __syncTimer = setTimeout(syncToServer, 1000);
    }

    // Small util to create stable-ish IDs for posts/comments/replies
    function makeId(prefix = 'id') {
        return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    }

    // Ensure object and nested items have ids and timestamps
    function ensureIdsForReply(reply) {
        if (!reply.id) reply.id = makeId('r');
        if (!reply.createdAt) reply.createdAt = new Date().toISOString();
        return reply;
    }

    function ensureIdsForComment(comment) {
        if (!comment.id) comment.id = makeId('c');
        if (!comment.createdAt) comment.createdAt = new Date().toISOString();
        if (!Array.isArray(comment.replies)) comment.replies = [];
        comment.replies = comment.replies.map(ensureIdsForReply);
        return comment;
    }

    function ensureIdsForPost(post) {
        if (!post.id) post.id = makeId('p');
        if (!post.createdAt) post.createdAt = new Date().toISOString();
        if (!Array.isArray(post.comments)) post.comments = [];
        post.comments = post.comments.map(ensureIdsForComment);
        return post;
    }

    // Merge arrays by id (preferred) or by author+message signature fallback
    function sig(obj) {
        if (!obj) return '';
        const a = (obj.author || obj.username || '').toString();
        const m = (obj.message || obj.msg || '').toString();
        return `${a}::${m}`;
    }

    function mergeArraysByIdOrSig(existing = [], incoming = []) {
        const map = new Map();
        // prefer ids if present
        existing.forEach(item => {
            const key = item.id ? `id:${item.id}` : `s:${sig(item)}`;
            map.set(key, item);
        });
        incoming.forEach(item => {
            const key = item.id ? `id:${item.id}` : `s:${sig(item)}`;
            if (!map.has(key)) map.set(key, item);
            else {
                const ex = map.get(key);
                // merge deeper where necessary (comments/replies)
                if (ex.comments || item.comments) {
                    ex.comments = mergeArraysByIdOrSig(ex.comments || [], item.comments || []).map(ensureIdsForComment);
                }
                if (ex.replies || item.replies) {
                    ex.replies = mergeArraysByIdOrSig(ex.replies || [], item.replies || []).map(ensureIdsForReply);
                }
            }
        });
        return Array.from(map.values());
    }

    async function syncToServer() {
        if (!SYNC_ENDPOINT) return;
        try {
            // Fetch remote canonical thread for this site (relative path)
            let remote = null;
            try {
                const r = await fetch('./discussionThread.json', { cache: 'no-store' });
                if (r.ok) remote = await r.json();
            } catch (e) {
                // ignore fetch errors; remote may not exist yet
                remote = null;
            }

            // ensure local posts have ids and timestamps
            for (let i = 0; i < posts.length; i++) posts[i] = ensureIdsForPost(posts[i]);

            // If remote exists, ensure its posts also have ids
            if (remote && Array.isArray(remote.posts)) {
                remote.posts = remote.posts.map(ensureIdsForPost);
            }

            // Merge remote and local posts (remote first, then local incoming)
            const mergedPosts = mergeArraysByIdOrSig((remote && remote.posts) || [], posts || []).map(ensureIdsForPost);

            // Guard: avoid sending an empty posts array if there are existing remote posts
            if ((!mergedPosts || mergedPosts.length === 0) && remote && Array.isArray(remote.posts) && remote.posts.length > 0) {
                console.log('Not sending empty merged posts (remote has posts)');
                return;
            }

            const payload = {
                title: document.querySelector('#posts h2') ? document.querySelector('#posts h2').textContent : (remote && remote.title) || 'Discussion Thread',
                posts: mergedPosts,
                filePath: FILE_PATH
            };

            const res = await fetch(SYNC_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(SERVER_SECRET ? { [SERVER_SECRET_HEADER_NAME]: SERVER_SECRET } : {})
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) {
                const txt = await res.text();
                console.warn('Sync server responded with', res.status, txt);
            } else {
                console.log('Synced forum to server');
            }
        } catch (err) {
            console.error('Failed to sync to server:', err);
        }
    }

    // Function to render posts
    function renderPosts() {
        postList.innerHTML = '';
        posts.forEach((post, postIndex) => {
            // Ensure the comments array exists
            if (!post.comments) {
                post.comments = [];
            }

            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <h3>${post.username}</h3>
                <p>${post.message}</p>
                ${post.username === currentUser ? `
                    <button class="delete-post" data-post-index="${postIndex}">Delete Post</button>
                ` : ''}
                <div class="comment-section">
                    <h4>Comments:</h4>
                    <div class="comments">
                                ${post.comments.map((comment, commentIndex) => `
                                        <div class="comment">
                                            <h4>${comment.username}</h4>
                                            <p>${comment.message}</p>
                                            ${comment.username === currentUser ? `
                                                <button class="delete-comment" data-post-index="${postIndex}" data-comment-index="${commentIndex}">Delete Comment</button>
                                            ` : ''}
                                            ${comment.replies && comment.replies.length ? `
                                                <div class="replies">
                                                    ${comment.replies.map((reply, replyIndex) => `
                                                        <div class="reply">
                                                            <strong>${reply.username}</strong>: ${reply.message}
                                                            ${reply.username === currentUser ? `<button class="delete-reply" data-post-index="${postIndex}" data-comment-index="${commentIndex}" data-reply-index="${replyIndex}">Delete Reply</button>` : ''}
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            ` : ''}
                                            ${currentUser ? `<button class="reply-button" data-post-index="${postIndex}" data-comment-index="${commentIndex}">Reply</button>` : ''}
                                            <div class="reply-form-container" data-post-index="${postIndex}" data-comment-index="${commentIndex}"></div>
                                        </div>
                                    `).join('')}
                    </div>
                    ${currentUser ? `
                        <form class="commentForm" data-post-index="${postIndex}">
                            <textarea placeholder="Write a comment..." required></textarea>
                            <button type="submit">Comment</button>
                        </form>
                    ` : ''}
                </div>
            `;
            postList.appendChild(postElement);
        });

        // Add event listeners for comment forms
        document.querySelectorAll('.commentForm').forEach(form => {
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const postIndex = parseInt(form.getAttribute('data-post-index'), 10);

                // Validate postIndex
                if (isNaN(postIndex) || postIndex < 0 || postIndex >= posts.length) {
                    console.error('Invalid post index:', postIndex);
                    return;
                }

                const commentMessage = form.querySelector('textarea').value.trim();

                // Ensure the user is logged in
                if (!currentUser) {
                    alert('You must be logged in to comment.');
                    return;
                }

                // Ensure the post exists
                if (!posts[postIndex]) {
                    console.error('Post not found at index:', postIndex);
                    return;
                }

                // Ensure the comments array exists
                if (!posts[postIndex].comments) {
                    posts[postIndex].comments = [];
                }

                // Add the comment to the post
                    if (commentMessage) {
                    const newComment = ensureIdsForComment({ username: currentUser, message: commentMessage, replies: [] });
                    posts[postIndex].comments.push(newComment);
                    localStorage.setItem('forumPosts', JSON.stringify(posts));
                    scheduleSync();
                    renderPosts(); // Re-render posts
                }
            });
        });

        // Add event listeners for delete post buttons
        document.querySelectorAll('.delete-post').forEach(button => {
            button.addEventListener('click', (event) => {
                const postIndex = parseInt(button.getAttribute('data-post-index'), 10);
                deletePost(postIndex);
            });
        });

        // Add event listeners for delete comment buttons
        document.querySelectorAll('.delete-comment').forEach(button => {
            button.addEventListener('click', (event) => {
                const postIndex = parseInt(button.getAttribute('data-post-index'), 10);
                const commentIndex = parseInt(button.getAttribute('data-comment-index'), 10);
                deleteComment(postIndex, commentIndex);
            });
        });

        // Add event listeners for reply buttons (show inline reply form)
        document.querySelectorAll('.reply-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const postIndex = parseInt(button.getAttribute('data-post-index'), 10);
                const commentIndex = parseInt(button.getAttribute('data-comment-index'), 10);
                const container = document.querySelector(`.reply-form-container[data-post-index="${postIndex}"][data-comment-index="${commentIndex}"]`);
                if (container) {
                    container.innerHTML = `
                        <form class="replyForm" data-post-index="${postIndex}" data-comment-index="${commentIndex}">
                            <textarea required placeholder="Write a reply..."></textarea>
                            <button type="submit">Reply</button>
                        </form>
                    `;

                    // attach listener for this reply form
                    const rf = container.querySelector('.replyForm');
                    rf.addEventListener('submit', (ev) => {
                        ev.preventDefault();
                        const replyMessage = rf.querySelector('textarea').value.trim();
                        if (!currentUser) { alert('You must be logged in to reply.'); return; }
                        if (replyMessage) {
                            addReply(postIndex, commentIndex, { username: currentUser, message: replyMessage });
                            container.innerHTML = '';
                        }
                    });
                }
            });
        });

        // Add event listeners for delete reply buttons
        document.querySelectorAll('.delete-reply').forEach(button => {
            button.addEventListener('click', (event) => {
                const postIndex = parseInt(button.getAttribute('data-post-index'), 10);
                const commentIndex = parseInt(button.getAttribute('data-comment-index'), 10);
                const replyIndex = parseInt(button.getAttribute('data-reply-index'), 10);
                deleteReply(postIndex, commentIndex, replyIndex);
            });
        });
    }

    // Function to delete a post
    function deletePost(index) {
        if (posts[index].username === currentUser) {
            posts.splice(index, 1); // Remove the post
            localStorage.setItem('forumPosts', JSON.stringify(posts)); // Save updated posts
            scheduleSync();
            renderPosts(); // Re-render posts
        } else {
            console.error("You can only delete your own posts.");
        }
    }

    // Function to delete a comment
    function deleteComment(postIndex, commentIndex) {
        if (posts[postIndex] && posts[postIndex].comments[commentIndex]) {
            if (posts[postIndex].comments[commentIndex].username === currentUser) {
                posts[postIndex].comments.splice(commentIndex, 1); // Remove the comment
                localStorage.setItem('forumPosts', JSON.stringify(posts)); // Save updated posts
                scheduleSync();
                renderPosts(); // Re-render posts
            } else {
                console.error("You can only delete your own comments.");
            }
        } else {
            console.error("Comment not found.");
        }
    }

    // Function to add a reply to a comment
    function addReply(postIndex, commentIndex, reply) {
        if (!posts[postIndex]) { console.error('Post not found for reply'); return; }
        if (!posts[postIndex].comments[commentIndex]) { console.error('Comment not found for reply'); return; }
        if (!posts[postIndex].comments[commentIndex].replies) posts[postIndex].comments[commentIndex].replies = [];
        posts[postIndex].comments[commentIndex].replies.push(ensureIdsForReply(reply));
        localStorage.setItem('forumPosts', JSON.stringify(posts));
        scheduleSync();
        renderPosts();
    }

    // Function to delete a reply
    function deleteReply(postIndex, commentIndex, replyIndex) {
        if (!posts[postIndex] || !posts[postIndex].comments[commentIndex] || !posts[postIndex].comments[commentIndex].replies) {
            console.error('Reply not found.');
            return;
        }
        const reply = posts[postIndex].comments[commentIndex].replies[replyIndex];
        if (!reply) { console.error('Reply not found.'); return; }
        if (reply.username === currentUser) {
            posts[postIndex].comments[commentIndex].replies.splice(replyIndex, 1);
            localStorage.setItem('forumPosts', JSON.stringify(posts));
            scheduleSync();
            renderPosts();
        } else {
            console.error('You can only delete your own replies.');
        }
    }

    // Handle login
    loginButton.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    closeLoginModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        if (username && password) {
            currentUser = username;
            localStorage.setItem('currentUser', currentUser);
            loginModal.style.display = 'none';
            updateUI();
        }
    });

    // Handle logout
    logoutButton.addEventListener('click', () => {
        currentUser = null;
        localStorage.removeItem('currentUser');
        updateUI();
    });

    // Handle new post submission
    postForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const message = document.getElementById('message').value.trim();

        if (!currentUser) {
            alert('You must be logged in to post.');
            return;
        }

        if (message) {
            const newPost = ensureIdsForPost({ username: currentUser, message, comments: [] });
            posts.push(newPost);
            localStorage.setItem('forumPosts', JSON.stringify(posts));
            scheduleSync();
            renderPosts();
            postForm.reset();
        }
    });

    // Update UI based on login state
    function updateUI() {
        if (currentUser) {
            loggedInUserElement.textContent = `Logged in as: ${currentUser}`;
            loginButton.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            document.getElementById('postForm').style.display = 'block';
        } else {
            loggedInUserElement.textContent = '';
            loginButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            document.getElementById('postForm').style.display = 'none';
        }
        renderPosts();
    }

    // Initialize posts
    if (!posts.length) {
        localStorage.setItem('forumPosts', JSON.stringify(posts));
    }

    // Initialize UI
    updateUI();

    // Fetch and merge the discussion thread (merge into local posts array so comments/replies work)
    fetch('./discussionThread.json')
        .then(response => response.json())
        .then(data => {
            // Merge title into page (optional)
            const threadTitle = document.createElement('h2');
            threadTitle.textContent = data.title;
            // Insert at top of posts section
            postList.insertAdjacentElement('afterbegin', threadTitle);

            // Merge posts from JSON into our posts array if not already present.
            data.posts.forEach(jsonPost => {
                // Convert jsonPost.author -> username and ensure comments array exists
                const candidate = ensureIdsForPost({
                    username: jsonPost.author,
                    message: jsonPost.message,
                    comments: jsonPost.comments || []
                });

                // Avoid duplicates by checking id first, then author+message
                const exists = posts.some(p => (candidate.id && p.id && p.id === candidate.id) || (p.username === candidate.username && p.message === candidate.message));
                if (!exists) {
                    posts.push(candidate);
                }
            });

            // Persist merged posts
            localStorage.setItem('forumPosts', JSON.stringify(posts));
            renderPosts();
        })
        .catch(error => {
            console.error('Error loading discussion thread:', error);
        });

    // Note: automatic syncing to GitHub Pages is not possible from client-side JS alone
    // without a backend or authenticated GitHub API usage. To enable automatic
    // persistence across users we need one of the following:
    // 1) A small server or serverless endpoint that accepts thread updates and
    //    commits them to the repository using a GitHub token.
    // 2) A GitHub App / OAuth flow that allows the client to commit directly (complex).
    // If you'd like, I can help implement option (1) (Node/Express) or outline
    // a secure GitHub Actions + webhook approach.
});