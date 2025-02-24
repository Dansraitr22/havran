document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        document.getElementById('str1').value = query;
        document.getElementById('enteredtext').textContent = `You searched for: ${query}`;
        fetchHtmlFiles(query);
    }

    document.getElementById('button1').addEventListener('click', () => {
        const query = document.getElementById('str1').value;
        fetchHtmlFiles(query);
    });
});

function fetchHtmlFiles(query) {
    fetch('htmlFiles.json')
        .then(response => response.json())
        .then(files => {
            const promises = files.map(file => fetch(file).then(response => response.text()));
            Promise.all(promises)
                .then(contents => {
                    const results = files.map((file, index) => ({
                        file,
                        content: contents[index]
                    }));
                    searchHtmlFiles(query, results);
                });
        })
        .catch(error => console.error('Error fetching HTML files:', error));
}

function searchHtmlFiles(query, files) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    const filteredFiles = files.filter(file =>
        file.file.toLowerCase().includes(query.toLowerCase()) ||
        file.content.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredFiles.length > 0) {
        filteredFiles.forEach(file => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result-item';
            resultElement.innerHTML = `
                <h2><a href="${file.file}">${file.file}</a></h2>
                <p>${file.content.substring(0, 200)}...</p>
            `;
            resultsContainer.appendChild(resultElement);
        });
    } else {
        resultsContainer.innerHTML = '<p>No results found</p>';
    }
}