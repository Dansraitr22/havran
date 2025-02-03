const itemsForSale = JSON.parse(localStorage.getItem('itemsForSale')) || [];
const currentUser = 'user123';

function saveItems() {
    localStorage.setItem('itemsForSale', JSON.stringify(itemsForSale));
}

function addItem(name, description, price) {
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
    const itemsContainer = document.getElementById('itemsContainer');
    itemsContainer.innerHTML = ''; // Clear the container

    itemsForSale.forEach((item, index) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.innerHTML = `
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">${item.price} Kč</p>
            ${item.user === currentUser ? `<button onclick="deleteItem(${index})">Delete</button>` : ''}
        `;
        itemsContainer.appendChild(itemElement);
    });
}

function openModal() {
    document.getElementById('myModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('myModal').style.display = 'none';
}

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

document.addEventListener('DOMContentLoaded', displayItems);