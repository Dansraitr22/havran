const API_BASE = window.SERVER_BASE || '';
const SYNC_ENDPOINT = API_BASE + '/api/bazar';
const SERVER_SECRET = 'ilovekatie';

const itemsForSale = JSON.parse(localStorage.getItem('itemsForSale')) || [];
let currentUser = localStorage.getItem('currentUser') || null;

// Simulated user database (stored in localStorage for persistence)
const users = JSON.parse(localStorage.getItem('users')) || {};

function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

function saveItems() {
    localStorage.setItem('itemsForSale', JSON.stringify(itemsForSale));
    syncToServer();
}

async function syncToServer() {
    try {
        const response = await fetch(SYNC_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Server-Secret': SERVER_SECRET
            },
            body: JSON.stringify({
                items: itemsForSale
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

function addItem(name, description, price, contact) {
    if (!currentUser) {
        alert('Musíte se přihlásit, abyste mohli přidat článek.');
        return;
    }
    const item = { name, description, price, contact, user: currentUser };
    itemsForSale.push(item);
    saveItems();
    displayItems();
}

async function deleteItem(index) {
    const item = itemsForSale[index];
    if (!item) return;
    if (item.user !== currentUser) {
        console.error("You can only delete your own items.");
        return;
    }
    try {
        const res = await fetch(SYNC_ENDPOINT, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-Server-Secret': SERVER_SECRET
            },
            body: JSON.stringify({ item })
        });
        if (!res.ok) {
            console.error('Server delete failed:', res.status, await res.text());
        }
    } catch (e) {
        console.error('Error calling server delete:', e);
    }
    // Always remove locally so UI updates immediately
    itemsForSale.splice(index, 1);
    saveItems();
    displayItems();
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
            <p class="contact"><strong>Kontakt:</strong> ${item.contact || 'Neuvedeno'}</p>
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

async function loadDefaultItems() {
    try {
        // Try server first
        let response = await fetch(API_BASE + '/api/bazar');
        if (!response.ok) {
            // Fallback to local file
            response = await fetch('./defaultitems.json');
        }
        console.log('Fetch response:', response); // Debugging log
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const defaultItems = await response.json();
        console.log('Default items:', defaultItems); // Debugging log
        
        // Merge server items with local items
        const itemSig = (item) => `${item.name}::${item.description}`;
        const map = new Map();
        itemsForSale.forEach(item => map.set(itemSig(item), item));
        defaultItems.forEach(item => {
            if (!map.has(itemSig(item))) {
                map.set(itemSig(item), item);
            }
        });
        
        itemsForSale.length = 0;
        itemsForSale.push(...Array.from(map.values()));
        saveItems();
        displayItems();
    } catch (error) {
        console.error('Error loading default items:', error);
        displayItems();
    }
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
    const contact = document.getElementById('itemContact').value;
    if (!isNaN(price)) {
        addItem(name, description, price, contact);
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

