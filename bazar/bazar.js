const CURRENT_VERSION = '1.0.0'; // Update this version to reset localStorage

function checkVersion() {
  const savedVersion = localStorage.getItem('version');
  if (savedVersion !== CURRENT_VERSION) {
    localStorage.clear();
    localStorage.setItem('version', CURRENT_VERSION);
  }
}

const itemsForSale = JSON.parse(localStorage.getItem('itemsForSale')) || [];

function saveItems() {
  localStorage.setItem('itemsForSale', JSON.stringify(itemsForSale));
}

function addItem(name, description, price) {
  const item = { name, description, price };
  itemsForSale.push(item);
  saveItems();
  console.log("Item added successfully:", item);
  displayItems(); // Update the display after adding a new item
}

function displayItems() {
  const itemsContainer = document.getElementById('itemsContainer');
  if (!itemsContainer) {
    console.error("itemsContainer element not found");
    return;
  }
  itemsContainer.innerHTML = ''; // Clear the container

  itemsForSale.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.className = 'item';
    itemElement.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <p><strong>Price:</strong> ${item.price} Kč</p>
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

// Check version and clear localStorage if outdated
checkVersion();

// Call displayItems to show the items when the page loads
document.addEventListener('DOMContentLoaded', displayItems);