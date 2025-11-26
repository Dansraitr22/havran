const API_BASE = window.SERVER_BASE || '';

(async function(){
    try {
        let response = await fetch(API_BASE + '/api/mysticism');
        if (!response.ok) response = await fetch('./mysticsim.json');
        const data = await response.json();
        const mysticismResultsContainer = document.getElementById('mysticismResultsContainer');
        if (mysticismResultsContainer) {
            data.forEach((news, index) => {
                const newsElement = document.createElement('div');
                newsElement.className = 'news-item';
                newsElement.innerHTML = `
                    <h2><a href="./mysticismTemplate.html?newsIndex=${index}">${news.title}</a></h2>
                    <p>${news.content.substring(0, 100)}...</p>
                `;
                mysticismResultsContainer.appendChild(newsElement);
            });
        }
        // Store the data globally for use in other pages
                window.mysticismNewsData = data;
    } catch (error) {
        console.error('Error fetching mysticism news data:', error);
    }
})();