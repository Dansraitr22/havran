document.addEventListener('DOMContentLoaded', () => {
    const API_BASE = window.SERVER_BASE || '';
    const SYNC_ENDPOINT = API_BASE + '/api/thread';
    const SERVER_SECRET = 'ilovekatie';
    
    // Multi-thread support via URL parameter ?thread=<id>
    function getThreadId() {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('thread') || 'default';
        } catch (e) { return 'default'; }
    }
    const THREAD_ID = getThreadId();
    const POSTS_KEY = 'historyForum_posts_' + THREAD_ID;
    const postForm = document.getElementById('newPostForm');
    const postList = document.getElementById('postList');
    const loginModal = document.getElementById('loginModal');
    const loginButton = document.getElementById('loginButton');
    const logoutButton = document.getElementById('logoutButton');
    const loggedInUserElement = document.getElementById('loggedInUser');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const loginForm = document.getElementById('loginForm');

    let currentUser = localStorage.getItem('currentUser') || null;
    let posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];

    // Load posts from server (fallback to local JSON) on first load
    async function loadInitialPosts() {
        try {
            let response = await fetch(API_BASE + '/api/history');
            if (!response.ok) {
                response = await fetch('./posts.json');
            }
            if (response.ok) {
                const serverData = await response.json();
                // posts.json may be either an array or an object { title, posts: [...] }
                const serverPosts = Array.isArray(serverData) ? serverData : (Array.isArray(serverData.posts) ? serverData.posts : []);
                if (serverPosts.length > 0) {
                    // Merge with local posts
                    const merged = mergePosts(posts, serverPosts);
                    posts = merged;
                    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
                }
            }
        } catch (error) {
            console.log('No posts.json found or error loading:', error);
        }
        updateUI();
    }

    function mergePosts(local, remote) {
        const map = new Map();
        const sig = (p) => `${p.username}::${p.message}`;
        local.forEach(p => map.set(sig(p), p));
        remote.forEach(p => {
            if (!map.has(sig(p))) map.set(sig(p), p);
        });
        return Array.from(map.values());
    }

    loadInitialPosts();

    // Login button click
    loginButton.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    // Close modal
    closeLoginModal.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });

    // Handle login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username && password) {
            currentUser = username;
            localStorage.setItem('currentUser', username);
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
    postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = document.getElementById('message').value.trim();

        if (message && currentUser) {
            const newPost = {
                id: 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9),
                username: currentUser,
                message: message,
                createdAt: new Date().toISOString(),
                comments: []
            };

            posts.unshift(newPost);
            localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
            syncToServer();
            document.getElementById('message').value = '';
            renderPosts();
        }
    });

    function updateUI() {
        if (currentUser) {
            loginButton.style.display = 'none';
            logoutButton.style.display = 'inline-block';
            loggedInUserElement.textContent = `Logged in as: ${currentUser}`;
            document.getElementById('postForm').style.display = 'block';
        } else {
            loginButton.style.display = 'inline-block';
            logoutButton.style.display = 'none';
            loggedInUserElement.textContent = '';
            document.getElementById('postForm').style.display = 'none';
        }
        renderPosts();
    }

    async function syncToServer() {
        console.log('[History Forum] Attempting to sync', posts.length, 'posts to server...');
        console.log('[History Forum] Posts data:', JSON.stringify(posts).substring(0, 200));
        try {
            const payload = {
                filePath: 'sites/history-enthusiasts/posts.json',
                // optional title for /api/thread endpoint
                title: 'History Enthusiasts Thread',
                posts: posts
            };
            console.log('[History Forum] Payload:', payload);
            
            const response = await fetch(SYNC_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Server-Secret': SERVER_SECRET
                },
                body: JSON.stringify(payload)
            });

            console.log('[History Forum] Response status:', response.status);
            if (!response.ok) {
                console.error('[History Forum] Sync failed:', response.status, response.statusText);
                const errorText = await response.text();
                console.error('[History Forum] Error details:', errorText);
            } else {
                const result = await response.json();
                console.log('[History Forum] Synced to server successfully:', result);
            }
        } catch (error) {
            console.error('[History Forum] Error syncing to server:', error);
        }
    }

    function renderPosts() {
        postList.innerHTML = '';
        posts.forEach(post => {
            const postDiv = document.createElement('div');
            postDiv.className = 'post';

            const postHeader = document.createElement('div');
            postHeader.className = 'post-header';
            postHeader.innerHTML = `
                <span><strong>${post.username}</strong></span>
                <span>${new Date(post.createdAt).toLocaleString()}</span>
            `;

            const postContent = document.createElement('div');
            postContent.className = 'post-content';
            postContent.textContent = post.message;

            const postActions = document.createElement('div');
            postActions.className = 'post-actions';

            if (currentUser) {
                const commentBtn = document.createElement('button');
                commentBtn.textContent = 'Comment';
                commentBtn.onclick = () => showCommentForm(post.id);
                postActions.appendChild(commentBtn);

                    // allow owners or moderators to delete
                    const isAdmin = currentUser && (currentUser.toLowerCase() === 'admin' || currentUser.toLowerCase() === 'moderator');
                    if (post.username === currentUser || isAdmin) {
                        const deleteBtn = document.createElement('button');
                        deleteBtn.textContent = 'Delete';
                        deleteBtn.className = 'delete-btn';
                        deleteBtn.onclick = () => deletePost(post.id);
                        postActions.appendChild(deleteBtn);
                    }
            }

            postDiv.appendChild(postHeader);
            postDiv.appendChild(postContent);
            postDiv.appendChild(postActions);

            // Render comments
            if (post.comments && post.comments.length > 0) {
                const commentsDiv = document.createElement('div');
                commentsDiv.className = 'comments';

                post.comments.forEach(comment => {
                    const commentDiv = document.createElement('div');
                    commentDiv.className = 'post';
                    commentDiv.innerHTML = `
                        <div class="post-header">
                            <span><strong>${comment.username}</strong></span>
                            <span>${new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <div class="post-content">${comment.message}</div>
                    `;
                    // add delete button for comment owner or admin
                    if (currentUser) {
                        const isAdmin = currentUser && (currentUser.toLowerCase() === 'admin' || currentUser.toLowerCase() === 'moderator');
                        if (comment.username === currentUser || isAdmin) {
                            const delC = document.createElement('button');
                            delC.textContent = 'Delete Comment';
                            delC.className = 'delete-comment-btn';
                            delC.style.marginTop = '8px';
                            delC.onclick = () => deleteComment(post.id, comment.id);
                            commentDiv.appendChild(delC);
                        }
                    }
                    commentsDiv.appendChild(commentDiv);
                });

                postDiv.appendChild(commentsDiv);
            }

            // Comment form (hidden by default)
            if (currentUser) {
                const commentFormDiv = document.createElement('div');
                commentFormDiv.id = `comment-form-${post.id}`;
                commentFormDiv.style.display = 'none';
                commentFormDiv.style.marginTop = '15px';
                commentFormDiv.innerHTML = `
                    <textarea id="comment-input-${post.id}" style="width:100%;padding:12px;border:2px solid #e0e0e0;border-radius:5px;font-family:inherit;font-size:14px;" rows="3"></textarea>
                    <button onclick="submitComment('${post.id}')" style="margin-top:10px;padding:10px 25px;background:#667eea;color:white;border:none;border-radius:5px;cursor:pointer;font-weight:600;">Submit Comment</button>
                `;
                postDiv.appendChild(commentFormDiv);
            }

            postList.appendChild(postDiv);
        });
    }

    window.showCommentForm = function(postId) {
        const form = document.getElementById(`comment-form-${postId}`);
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
    };

    function deleteComment(postId, commentId) {
        if (!confirm('Delete this comment?')) return;
        const post = posts.find(p => p.id === postId);
        if (!post || !post.comments) return;
        post.comments = post.comments.filter(c => c.id !== commentId);
        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
        syncToServer();
        renderPosts();
    }

    window.submitComment = function(postId) {
        const input = document.getElementById(`comment-input-${postId}`);
        const message = input.value.trim();

        if (message && currentUser) {
            const post = posts.find(p => p.id === postId);
            if (post) {
                const newComment = {
                    id: 'c_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9),
                    username: currentUser,
                    message: message,
                    createdAt: new Date().toISOString(),
                    replies: []
                };

                if (!post.comments) post.comments = [];
                post.comments.push(newComment);
                localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
                syncToServer();
                input.value = '';
                renderPosts();
            }
        }
    };

    function deletePost(postId) {
        if (confirm('Delete this post?')) {
            posts = posts.filter(p => p.id !== postId);
            localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
            syncToServer();
            renderPosts();
        }
    }
});
