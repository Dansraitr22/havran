document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        document.getElementById('str1').value = query;
        document.getElementById('enteredtext').textContent = `You searched for: ${query}`;
        fetchHtmlFiles(query);
    }

    // Trigger search when the search button is clicked
    document.getElementById('button1').addEventListener('click', () => {
        const query = document.getElementById('str1').value.trim();
        if (query) {
            fetchHtmlFiles(query);
        } else {
            alert('Please enter a search term.');
        }
    });

    // Trigger search when pressing Enter in the search input
    document.getElementById('str1').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            const query = document.getElementById('str1').value.trim();
            if (query) {
                fetchHtmlFiles(query);
            } else {
                alert('Please enter a search term.');
            }
        }
    });
});

function fetchHtmlFiles(query) {
    console.log(`Fetching HTML files for query: ${query}`);
    fetch('htmlFiles.json')
        .then(response => response.json())
        .then(files => {
            console.log('Files:', files); // Debugging statement
            const promises = files.map(file => fetch(file.path).then(response => response.text()));
            Promise.all(promises)
                .then(contents => {
                    const results = files.map((file, index) => ({
                        path: file.path,
                        name: file.name,
                        content: contents[index],
                        tags: file.tags || [] // Ensure tags are included
                    }));
                    console.log('Results:', results); // Debugging statement
                    fetchAllNewsData().then(newsData => {
                        const newsResults = newsData.map((news, index) => ({
                            path: news.source === 'konspira' ? `./konspiračníteorie/newsTemplate.html?newsIndex=${index}` : `./zpravy.cz/zpravy-cz-news/src/newsTemplate.html?newsIndex=${index}`,
                            name: news.title,
                            content: news.content,
                            tags: [] // News articles may not have tags
                        }));
                        console.log('News Results:', newsResults); // Debugging statement
                        searchHtmlFiles(query, results.concat(newsResults));
                    });
                });
        })
        .catch(error => console.error('Error fetching HTML files:', error));
}

function searchHtmlFiles(query, files) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    // Perform fuzzy matching on name and content only (exclude tags)
    const filteredFiles = files.filter(file =>
        (fuzzyMatch(query, file.name) || fuzzyMatch(query, file.content)) &&
        !file.name.toLowerCase().includes('news') && // Exclude entries with "news" in their name
        !file.name.toLowerCase().includes('články') // Exclude entries with "články" in their name
    );

    if (filteredFiles.length > 0) {
        filteredFiles.forEach(file => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result-item'; // Add a class for styling
            resultElement.innerHTML = `
                <h2><a href="${file.path}" class="styled-url">${file.name}</a></h2>
                <p>${file.content.substring(0, 200)}...</p>
            `;
            resultsContainer.appendChild(resultElement);
        });
    } else {
        resultsContainer.innerHTML = '<p class="no-results">No results found</p>';
    }
}

// Fuzzy matching function
function fuzzyMatch(query, text) {
    const normalizedQuery = query.toLowerCase();
    const normalizedText = text.toLowerCase();

    // Check if the query is a substring of the text
    if (normalizedText.includes(normalizedQuery)) {
        return true;
    }

    // Check for approximate matches
    const queryWords = normalizedQuery.split(' ');
    const textWords = normalizedText.split(' ');

    return queryWords.some(queryWord =>
        textWords.some(textWord => levenshteinDistance(queryWord, textWord) <= 2)
    );
}

// Levenshtein Distance Algorithm for approximate matching
function levenshteinDistance(a, b) {
    const matrix = [];

    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1, // insertion
                    matrix[i - 1][j] + 1 // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

function fetchAllNewsData() {
    return Promise.all([fetchKonspiraNewsData(), fetchZpravyNewsData()])
        .then(([konspiraNewsData, zpravyNewsData]) => {
            konspiraNewsData.forEach(news => news.source = 'konspira');
            zpravyNewsData.forEach(news => news.source = 'zpravy');
            return konspiraNewsData.concat(zpravyNewsData);
        });
}

function fetchKonspiraNewsData() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = './konspiračníteorie/newsData.js';
        script.onload = () => {
            if (typeof konspiraNewsData !== 'undefined') {
                resolve(konspiraNewsData);
            } else {
                reject(new Error('konspiraNewsData is not defined'));
            }
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

function fetchZpravyNewsData() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = './zpravy.cz/zpravy-cz-news/src/newsData.js';
        script.onload = () => {
            if (typeof zpravyNewsData !== 'undefined') {
                resolve(zpravyNewsData);
            } else {
                reject(new Error('zpravyNewsData is not defined'));
            }
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });
}