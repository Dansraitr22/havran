document.addEventListener('DOMContentLoaded', () => {
    const SYNC_ENDPOINT = 'https://havran.onrender.com/api/leviathan';
    const SERVER_SECRET = 'ilovekatie';
    
    const loginForm = document.getElementById('loginForm');
    const loginScreen = document.getElementById('loginScreen');
    const mainForum = document.getElementById('mainForum');
    const loginError = document.getElementById('loginError');
    
    // Password protection - "leviathan" is the access code
    const VALID_CODE = 'leviathan';
    
    // Check if already logged in
    const isLoggedIn = sessionStorage.getItem('leviathan_auth') === 'true';
    if (isLoggedIn) {
        showMainForum();
    }
    
    // Handle login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = document.getElementById('accessCode').value;
        
        if (code === VALID_CODE) {
            sessionStorage.setItem('leviathan_auth', 'true');
            sessionStorage.setItem('leviathan_user', 'Agent-' + Math.floor(Math.random() * 9999));
            showMainForum();
        } else {
            loginError.textContent = '⚠ INVALID ACCESS CODE - ACCESS DENIED ⚠';
            loginError.style.display = 'block';
            setTimeout(() => {
                loginError.style.display = 'none';
            }, 10000);
        }
    });
    
    function showMainForum() {
        loginScreen.style.display = 'none';
        mainForum.style.display = 'block';
        const username = sessionStorage.getItem('leviathan_user') || 'Agent';
        document.getElementById('loggedInUser').textContent = username;
        initializeForum();
    }
    
    // Logout
    document.getElementById('logoutButton').addEventListener('click', () => {
        sessionStorage.removeItem('leviathan_auth');
        sessionStorage.removeItem('leviathan_user');
        location.reload();
    });
    
    // Forum functionality (multi-thread support)
    function getThreadId() {
        try {
            const params = new URLSearchParams(window.location.search);
            return params.get('thread') || 'default';
        } catch (e) { return 'default'; }
    }
    
    const THREAD_ID = getThreadId();
    const POSTS_KEY = 'leviathan_posts_' + THREAD_ID;
    
    function initializeForum() {
        const postForm = document.getElementById('newPostForm');
        const postList = document.getElementById('postList');
        const currentUser = sessionStorage.getItem('leviathan_user');
        
        let posts = JSON.parse(localStorage.getItem(POSTS_KEY)) || [];
        
        // Load posts from JSON file
        async function loadInitialPosts() {
            try {
                const response = await fetch('./posts.json');
                if (response.ok) {
                    const serverPosts = await response.json();
                    if (serverPosts.length > 0) {
                        const merged = mergePosts(posts, serverPosts);
                        posts = merged;
                        localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
                    }
                }
            } catch (error) {
                console.log('No posts.json found or error loading:', error);
            }
            renderPosts();
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
        
        // Show post form for logged-in users
        document.getElementById('postForm').style.display = 'block';
        
        loadInitialPosts();
        
        // Handle new post submission
        postForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = document.getElementById('message').value.trim();
            
            if (message) {
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
        
        async function syncToServer() {
            try {
                const response = await fetch(SYNC_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Server-Secret': SERVER_SECRET
                    },
                    body: JSON.stringify({
                        filePath: 'sites/leviathan.cult/posts.json',
                        posts: posts
                    })
                });

                if (!response.ok) {
                    console.error('Sync failed:', response.statusText);
                } else {
                    console.log('Synced to server successfully');
                }
            } catch (error) {
                console.error('Error syncing to server:', error);
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
                
                const commentBtn = document.createElement('button');
                commentBtn.textContent = 'Comment';
                commentBtn.onclick = () => showCommentForm(post.id);
                
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => deletePost(post.id);
                
                postActions.appendChild(commentBtn);
                if (post.username === currentUser) {
                    postActions.appendChild(deleteBtn);
                }
                
                postDiv.appendChild(postHeader);
                postDiv.appendChild(postContent);
                postDiv.appendChild(postActions);
                
                // Render comments
                if (post.comments && post.comments.length > 0) {
                    const commentsDiv = document.createElement('div');
                    commentsDiv.className = 'comments';
                    commentsDiv.style.marginLeft = '30px';
                    commentsDiv.style.marginTop = '15px';
                    
                    post.comments.forEach(comment => {
                        const commentDiv = document.createElement('div');
                        commentDiv.className = 'post';
                        commentDiv.style.background = '#002010';
                        commentDiv.innerHTML = `
                            <div class="post-header">
                                <span><strong>${comment.username}</strong></span>
                                <span>${new Date(comment.createdAt).toLocaleString()}</span>
                            </div>
                            <div class="post-content">${comment.message}</div>
                        `;
                        commentsDiv.appendChild(commentDiv);
                    });
                    
                    postDiv.appendChild(commentsDiv);
                }
                
                // Comment form (hidden by default)
                const commentFormDiv = document.createElement('div');
                commentFormDiv.id = `comment-form-${post.id}`;
                commentFormDiv.style.display = 'none';
                commentFormDiv.style.marginTop = '15px';
                commentFormDiv.innerHTML = `
                    <textarea id="comment-input-${post.id}" style="width:100%;padding:10px;background:#000;border:2px solid #00ff88;color:#00ff88;font-family:'Courier New',monospace;" rows="3"></textarea>
                    <button onclick="submitComment('${post.id}')" style="margin-top:10px;padding:8px 20px;background:#00ff88;border:none;color:#000;font-family:'Courier New',monospace;font-weight:bold;cursor:pointer;">Submit Comment</button>
                `;
                postDiv.appendChild(commentFormDiv);
                
                postList.appendChild(postDiv);
            });
        }
        
        window.showCommentForm = function(postId) {
            const form = document.getElementById(`comment-form-${postId}`);
            form.style.display = form.style.display === 'none' ? 'block' : 'none';
        };
        
        window.submitComment = function(postId) {
            const input = document.getElementById(`comment-input-${postId}`);
            const message = input.value.trim();
            
            if (message) {
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
    }
});
