// Fetch news from server with fallback to local JSON
(function(){
    const API_BASE = window.SERVER_BASE || '';
    const NEWS_API = API_BASE + '/api/zpravy';
    const containerA = document.getElementById('zpravyResultsContainer');
    const containerB = document.getElementById('zpravyNewsContent');

    const render = (items) => {
        if (containerA) {
            containerA.innerHTML = '';
            (items || []).forEach(news => {
                const el = document.createElement('div');
                el.className = 'news-item';
                el.innerHTML = `
                    <h2>${news.title || ''}</h2>
                    <p>${news.content || ''}</p>
                `;
                containerA.appendChild(el);
            });
        } else if (containerB) {
            containerB.innerHTML = '';
            (items || []).forEach((news, index) => {
                const el = document.createElement('div');
                el.className = 'news-item';
                el.innerHTML = `
                    <h2><a href="./newsTemplate.html?newsIndex=${index}">${news.title || ''}</a></h2>
                    <p>${(news.content||'').substring(0,100)}...</p>
                `;
                containerB.appendChild(el);
            });
        }
    };

    const fetchNews = async () => {
        try {
            const res = await fetch(NEWS_API);
            if (!res.ok) throw new Error('API error');
            const data = await res.json();
            return Array.isArray(data) ? data : [];
        } catch {
            try {
                const res2 = await fetch('./news.json');
                const data2 = await res2.json();
                return Array.isArray(data2) ? data2 : [];
            } catch {
                return [];
            }
        }
    };

    fetchNews().then(data => { window.zpravyNewsData = data; render(data); });
})();

