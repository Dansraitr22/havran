interface Item {
    name: string;
    description: string;
    price: number;
}

const itemsForSale: Item[] = [];

function addItem() {
    const name = prompt("Enter the name of the item:");
    const description = prompt("Enter a description of the item:");
    const priceString = prompt("Enter the price of the item:");

    if (name && description && priceString) {
        const price = parseFloat(priceString);
        if (!isNaN(price)) {
            const item: Item = { name, description, price };
            itemsForSale.push(item);
            console.log("Item added successfully:", item);
        } else {
            console.error("Invalid price entered.");
        }
    } else {
        console.error("All fields are required.");
    }
}

