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
            console.log('Files:', files); // Debugging statement
            const promises = files.map(file => fetch(file.path).then(response => response.text()));
            Promise.all(promises)
                .then(contents => {
                    const results = files.map((file, index) => ({
                        path: file.path,
                        name: file.name,
                        content: contents[index]
                    }));
                    console.log('Results:', results); // Debugging statement
                    fetchAllNewsData().then(newsData => {
                        const newsResults = newsData.map((news, index) => ({
                            path: news.source === 'konspira' ? `./konspiračníteorie/newsTemplate.html?newsIndex=${index}` : `./zpravy.cz/zpravy-cz-news/src/newsTemplate.html?newsIndex=${index}`,
                            name: news.title,
                            content: news.content
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

    const filteredFiles = files.filter(file =>
        file.name.toLowerCase().includes(query.toLowerCase()) ||
        file.content.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredFiles.length > 0) {
        filteredFiles.forEach(file => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result-item';
            resultElement.innerHTML = `
                <h2><a href="${file.path}">${file.name}</a></h2>
                <p>${file.content.substring(0, 200)}...</p>
            `;
            resultsContainer.appendChild(resultElement);
        });
    } else {
        resultsContainer.innerHTML = '<p>No results found</p>';
    }
}

// Fetch and index dynamically generated content from both newsData.js files
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
            if (typeof newsData !== 'undefined') {
                resolve(newsData);
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