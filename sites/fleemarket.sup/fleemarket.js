document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser'); // Check if a user is logged in
    const profileButton = document.getElementById('profileButton');
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const logoutButton = document.getElementById('logoutButton');
    const loggedInUserElement = document.getElementById('loggedInUser');

    if (currentUser) {
        // User is logged in
        profileButton.style.display = 'flex'; // Show profile button
        loggedInUserElement.textContent = currentUser; // Display username
    } else {
        // User is not logged in
        profileButton.style.display = 'none'; // Hide profile button
        loggedInUserElement.textContent = '';
    }

    // Toggle hamburger menu
    profileButton.addEventListener('click', () => {
        if (hamburgerMenu.style.display === 'none') {
            hamburgerMenu.style.display = 'block';
        } else {
            hamburgerMenu.style.display = 'none';
        }
    });

    // Sign out functionality
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('currentUser'); // Remove the current user from localStorage
        location.reload(); // Reload the page to update the UI
    });
});