document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = urlParams.get('id');
    if (articleId) {
        fetchArticleData(articleId);
    }
});

function fetchArticleData(articleId) {
    fetch('newsData.json')
        .then(response => response.json())
        .then(newsData => {
            const article = newsData.find(news => news.id == articleId);
            if (article) {
                displayArticle(article);
            } else {
                document.getElementById('articleContent').innerHTML = '<p>Article not found</p>';
            }
        })
        .catch(error => console.error('Error fetching article data:', error));
}

function displayArticle(article) {
    const articleContent = document.getElementById('articleContent');
    articleContent.innerHTML = `
        <h2>${article.title}</h2>
        <p>${article.content}</p>
    `;
}