// Fetch news from server with fallback to local JSON
(function(){
    const API_BASE = window.SERVER_BASE || '';
    const NEWS_API = API_BASE + '/api/zpravy';
    const container = document.getElementById('zpravyResultsContainer');
    if (!container) return;

    const render = (items) => {
        container.innerHTML = '';
        (items || []).forEach(news => {
            const el = document.createElement('div');
            el.className = 'news-item';
            el.innerHTML = `
                <h2>${news.title || ''}</h2>
                <p>${news.content || ''}</p>
            `;
            container.appendChild(el);
        });
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

    fetchNews().then(render);
})();

