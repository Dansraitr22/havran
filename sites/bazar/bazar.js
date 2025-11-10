const itemsForSale = JSON.parse(localStorage.getItem('itemsForSale')) || [];
let currentUser = localStorage.getItem('currentUser') || null;

// Simulated user database (stored in localStorage for persistence)
const users = JSON.parse(localStorage.getItem('users')) || {};

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveItems() {
    localStorage.setItem('itemsForSale', JSON.stringify(itemsForSale));
}

function addItem(name, description, price) {
    if (!currentUser) {
        alert('Musíte se přihlásit, abyste mohli přidat článek.');
        return;
    }
    const item = { name, description, price, user: currentUser };
    itemsForSale.push(item);
    saveItems();
    displayItems();
}

function deleteItem(index) {
    if (itemsForSale[index].user === currentUser) {
        itemsForSale.splice(index, 1);
        saveItems();
        displayItems();
    } else {
        console.error("You can only delete your own items.");
    }
}

function displayItems() {
    console.log('Items for sale:', itemsForSale); // Debugging log
    const itemsContainer = document.getElementById('itemsContainer');
    itemsContainer.innerHTML = ''; // Clear the container

    itemsForSale.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">${item.price} $</p>
            ${item.user === currentUser ? `<button onclick="deleteItem(${index})">Odebrat článek</button>` : ''}
        `;
        itemsContainer.appendChild(itemElement);
    });

    // Display logged-in user in the top-right corner
    const loggedInUserElement = document.getElementById('loggedInUser');
    if (currentUser) {
        loggedInUserElement.textContent = `Přihlášen jako: ${currentUser}`;
    } else {
        loggedInUserElement.textContent = '';
    }
}

function loadDefaultItems() {
    fetch('./defaultitems.json')
        .then(response => {
            console.log('Fetch response:', response); // Debugging log
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(defaultItems => {
            console.log('Default items:', defaultItems); // Debugging log
            defaultItems.forEach(defaultItem => {
                const exists = itemsForSale.some(
                    item => item.name === defaultItem.name && item.description === defaultItem.description
                );
                if (!exists) {
                    itemsForSale.push(defaultItem);
                }
            });
            saveItems();
            displayItems();
        })
        .catch(error => console.error('Error loading default items:', error));
}

function openModal() {
    if (!currentUser) {
        alert('Musíte se přihlásit, abyste mohli přidat článek.');
        return;
    }
    document.getElementById('myModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
}

function openLoginModal() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (!users[username]) {
        // First-time login: save the username and password
        users[username] = password;
        saveUsers();
        alert(`Účet vytvořen pro uživatele: ${username}`);
    } else if (users[username] !== password) {
        // Incorrect password
        alert('Neplatné heslo.');
        return;
    }

    // Successful login
    currentUser = username;
    localStorage.setItem('currentUser', currentUser);
    location.reload(); // Reload the page after login
});

document.getElementById('addItemForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const name = document.getElementById('itemName').value;
    const description = document.getElementById('itemDescription').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    if (!isNaN(price)) {
        addItem(name, description, price);
        closeModal();
    } else {
        console.error("Invalid price entered.");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Refresh the global currentUser from localStorage (don't shadow the outer variable)
    currentUser = localStorage.getItem('currentUser'); // Check if a user is logged in
    const loginButton = document.getElementById('loginButton');
    const addItemButton = document.getElementById('addItemButton');
    const logoutButton = document.getElementById('logoutButton');
    const profileIcon = document.getElementById('profileIcon');
    const loggedInUserElement = document.getElementById('loggedInUser');

    if (currentUser) {
        // User is logged in
        loginButton.style.display = 'none'; // Hide "Přihlásit se" button
        addItemButton.style.display = 'inline-block'; // Show "Přidat článek" button
        logoutButton.style.display = 'inline-block'; // Show "Odhlásit se" button
        profileIcon.style.display = 'inline-block'; // Show profile icon
        loggedInUserElement.textContent = `Přihlášen jako: ${currentUser}`;
    } else {
        // User is not logged in
        loginButton.style.display = 'inline-block'; // Show "Přihlásit se" button
        addItemButton.style.display = 'none'; // Hide "Přidat článek" button
        logoutButton.style.display = 'none'; // Hide "Odhlásit se" button
        profileIcon.style.display = 'none'; // Hide profile icon
        loggedInUserElement.textContent = '';
    }

    // Load default items (if any) and then display items for sale
    // This ensures defaultitems.json is merged into local storage when the page first loads.
    loadDefaultItems();
});

// Sign out function
function signOut() {
    localStorage.removeItem('currentUser'); // Remove the current user from localStorage
    location.reload(); // Reload the page to update the UI
}

