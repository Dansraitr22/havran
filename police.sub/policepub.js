document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');
    const crimeList = document.getElementById('crimeList');

    // Example data for local crimes
    const crimes = [
        { title: "Loupež v centru města", description: "Dnes ráno došlo k loupeži v centru města. Policie hledá svědky." },
        { title: "Dopravní nehoda", description: "Na hlavní silnici došlo k vážné dopravní nehodě. Vyšetřování probíhá." },
        { title: "Vandalismus v parku", description: "Neznámí pachatelé poškodili veřejný majetek v městském parku." }
    ];

    // Display local crimes
    function displayCrimes() {
        crimeList.innerHTML = crimes.map(crime => `
            <div class="crime-item">
                <h3>${crime.title}</h3>
                <p>${crime.description}</p>
            </div>
        `).join('');
    }

    // Search functionality
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim().toLowerCase();
        if (!query) {
            searchResults.innerHTML = '<p>Zadejte klíčové slovo pro vyhledávání.</p>';
            return;
        }

        const results = crimes.filter(crime =>
            crime.title.toLowerCase().includes(query) || crime.description.toLowerCase().includes(query)
        );

        if (results.length > 0) {
            searchResults.innerHTML = results.map(result => `
                <div class="result-item">
                    <h3>${result.title}</h3>
                    <p>${result.description}</p>
                </div>
            `).join('');
        } else {
            searchResults.innerHTML = '<p>Nebyly nalezeny žádné výsledky.</p>';
        }
    });

    // Initialize the page
    displayCrimes();
});