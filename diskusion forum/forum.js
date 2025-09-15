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
                    posts[postIndex].comments.push({ username: currentUser, message: commentMessage });
                    localStorage.setItem('forumPosts', JSON.stringify(posts));
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
    }

    // Function to delete a post
    function deletePost(index) {
        if (posts[index].username === currentUser) {
            posts.splice(index, 1); // Remove the post
            localStorage.setItem('forumPosts', JSON.stringify(posts)); // Save updated posts
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
                renderPosts(); // Re-render posts
            } else {
                console.error("You can only delete your own comments.");
            }
        } else {
            console.error("Comment not found.");
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

        if (message) {
            posts.push({ username: currentUser, message, comments: [] });
            localStorage.setItem('forumPosts', JSON.stringify(posts));
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
});