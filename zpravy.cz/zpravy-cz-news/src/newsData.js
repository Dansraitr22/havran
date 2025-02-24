document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        document.getElementById('str1').value = query;
        document.getElementById('enteredtext').textContent = `You searched for: ${query}`;
        fetchNewsData(query);
    }

    document.getElementById('button1').addEventListener('click', () => {
        const query = document.getElementById('str1').value;
        fetchNewsData(query);
    });
});

function fetchNewsData(query) {
    fetch('newsData.json')
        .then(response => response.json())
        .then(newsData => {
            searchNews(query, newsData);
        })
        .catch(error => console.error('Error fetching news data:', error));
}

function searchNews(query, newsData) {
    const resultsContainer = document.getElementById('searchResults');
    resultsContainer.innerHTML = '';

    const filteredNews = newsData.filter(news => 
        news.title.toLowerCase().includes(query.toLowerCase()) || 
        news.content.toLowerCase().includes(query.toLowerCase())
    );

    if (filteredNews.length > 0) {
        filteredNews.forEach(news => {
            const newsElement = document.createElement('div');
            newsElement.className = 'news-item';
            newsElement.innerHTML = `
                <h2>${news.title}</h2>
                <p>${news.content}</p>
            `;
            resultsContainer.appendChild(newsElement);
        });
    } else {
        resultsContainer.innerHTML = '<p>No results found</p>';
    }
}