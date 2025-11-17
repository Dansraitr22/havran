document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('str1');
    const searchButton = document.getElementById('button1');
    const resultsContainer = document.getElementById('searchResults');

    // Trigger search when the search button is clicked
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query);
        } else {
            alert('Zadejte hledaný výraz.');
        }
    });

    // Trigger search when pressing Enter in the search input
    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent form submission
            const query = searchInput.value.trim();
            if (query) {
                performSearch(query);
            } else {
                alert('Zadejte hledaný výraz.');
            }
        }
    });

    // Perform the search
    function performSearch(query) {
        resultsContainer.innerHTML = '<p>Hledám...</p>';
        fetchAllSitesAndArticles().then(allData => {
            const results = searchArticles(query, allData);
            displayResults(results);
        }).catch(error => {
            console.error('Chyba při hledání:', error);
            resultsContainer.innerHTML = '<p>Chyba při hledání. Zkuste to prosím znovu později.</p>';
        });
    }

    // Fetch all sites and their articles
    function fetchAllSitesAndArticles() {
        return Promise.all([
            fetchKonspiraNewsData(),
            fetchZpravyNewsData(),
            fetchZooData(),
            fetchBazarData(),
            fetchDiskusionForumData(),
            fetchHtmlFiles() // Fetch links from htmlFiles.json
    ]).then(([konspiraData, zpravyData, zooData, bazarData, diskusionData, htmlFiles]) => {
            // Note: fetchDiskusionForumData returns an array of items (overview + posts)
            return [
                ...konspiraData.map(article => ({
                    ...article,
                    source: 'Konspirační Teorie',
                    tags: ['konspirace', 'mimozemšťané', 'záhady', 'teorie']
                })),
                ...zpravyData.map(article => ({
                    ...article,
                    source: 'Zpravy.cz',
                    tags: ['zprávy', 'politika', 'svět', 'ekonomika']
                })),
                ...zooData.map(article => ({
                    ...article,
                    source: 'Místní Zoo',
                    tags: ['zvířata', 'zoo', 'příroda', 'akce']
                })),
                ...bazarData.map(article => ({
                    ...article,
                    source: 'Bazar',
                    tags: ['prodej', 'předměty', 'tržiště', 'nakupování']
                })),
                // diskusionData will already contain items; ensure they have a source label
                ...((Array.isArray(diskusionData) ? diskusionData : [])).map(article => ({
                    ...article,
                    source: 'forum rozsectnik',
                    tags: article.tags || ['forum']
                })),
                ...htmlFiles.map(file => ({
                    title: file.name,
                    content: `Tags: ${file.tags.join(', ')}`,
                    link: file.path,
                    tags: file.tags
                }))
            ];
        });
    }

    // Fetch Discussion Forum threads and return an array: overview + individual posts
    function fetchDiskusionForumData() {
        return fetch('./sites/diskusion forum/discussionThread.json')
            .then(res => res.json())
            .then(data => {
                const posts = data.posts || [];
                // Overview item for the main forum
                const overview = {
                    title: 'forum rozsectnik',
                    content: `Diskusní fórum — ${posts.length} příspěvků`,
                    link: './sites/diskusion forum/forum_index.html',
                    tags: ['forum', 'diskuse', 'rozsectnik']
                };
                // Map a few recent posts as searchable items
                const postItems = posts.slice(0, 20).map(p => ({
                    title: `${p.author} — ${p.message.substring(0, 60)}${p.message.length > 60 ? '...' : ''}`,
                    content: p.message,
                    link: `./sites/diskusion forum/forum.html?postId=${encodeURIComponent(p.id)}`,
                    tags: ['forum', 'post']
                }));
                return [overview, ...postItems];
            })
            .catch(err => {
                console.error('Failed to load discussionThread.json:', err);
                return [];
            });
    }

    // Fetch links from htmlFiles.json
    function fetchHtmlFiles() {
        return fetch('./htmlFiles.json')
            .then(response => response.json())
            .then(data => data)
            .catch(error => {
                console.error('Failed to fetch htmlFiles.json:', error);
                return [];
            });
    }

    // Search articles based on query
    function searchArticles(query, allData) {
        const normalizedQuery = query.toLowerCase();
        return allData.filter(article =>
            article.title.toLowerCase().includes(normalizedQuery) ||
            article.content.toLowerCase().includes(normalizedQuery) ||
            (article.tags && article.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)))
        );
    }

    // Display search results
    function displayResults(results) {
        const resultsContainer = document.getElementById('searchResults');
        if (!results.length) {
            resultsContainer.innerHTML = '<p>Žádné výsledky.</p>';
            return;
        }
        resultsContainer.innerHTML = results.map(result => `
            <div class="search-result">
                <a href="${result.link}" target="_blank">
                ${result.title}</a>
                <p>${result.content}</p>
            </div>
        `).join('');
    }

    // Fetch Konspirační Teorie articles
    function fetchKonspiraNewsData() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = './sites/konspiračníteorie/newsData.js';
            script.onload = () => {
                if (typeof konspiraNewsData !== 'undefined') {
                    resolve(konspiraNewsData.map((news, index) => ({
                        title: news.title,
                        content: news.content,
                        link: `./sites/konspiračníteorie/newsTemplate.html?newsIndex=${index}`,
                        tags: news.tags || []
                    })));
                } else {
                    reject(new Error('konspiraNewsData is undefined.'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load newsData.js.'));
            document.head.appendChild(script);
        });
    }

    // Fetch Zpravy.cz articles
    function fetchZpravyNewsData() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = './sites/zpravy.cz/zpravy-cz-news/src/newsData.js';
            script.onload = () => {
                if (typeof zpravyNewsData !== 'undefined') {
                    resolve(zpravyNewsData.map((news, index) => ({
                        title: news.title,
                        content: news.content,
                        link: `./sites/zpravy.cz/zpravy-cz-news/src/newsTemplate.html?newsIndex=${index}`,
                        tags: news.tags || []
                    })));
                } else {
                    reject(new Error('zpravyNewsData is undefined.'));
                }
            };
            script.onerror = () => reject(new Error('Failed to load newsData.js.'));
            document.head.appendChild(script);
        });
    }

    // Fetch Local Zoo articles
    function fetchZooData() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = './sites/zoo/zoodata.js';
            script.onload = () => {
                if (typeof zooData !== 'undefined') {
                    resolve(zooData.map((item, index) => ({
                        title: item.name,
                        content: item.description,
                        link: `./sites/zoo/zooTemplate.html?itemIndex=${index}`,
                        tags: []
                    })));
                } else {
                    reject(new Error('zooData is undefined.'));
                }
            };
            script.onerror = () => {
                console.error('Failed to load zooData.js from', script.src);
                reject(new Error('Failed to load zooData.js.'));
            };
            document.head.appendChild(script);
        });
    }

    // Fetch Bazar articles
    function fetchBazarData() {
        return fetch('./sites/bazar/defaultitems.json')
            .then(response => response.json())
            .then(items => items.map((item, index) => ({
                title: item.name,
                content: item.description,
                link: `./sites/bazar/bazar.html#item-${index}`,
                tags: ['bazar', 'prodej', 'předměty']
            })))
            .catch(error => {
                console.error('Failed to fetch Bazar data:', error);
                return [];
            });
    }
});