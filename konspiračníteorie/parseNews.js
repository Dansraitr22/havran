const fs = require('fs');

fs.readFile('news.txt', 'utf8', (err, data) => {
    if (err) throw err;
    const articles = data.split('---').map(article => {
        const [title, ...content] = article.trim().split('\n');
        return { title: title.trim(), content: content.join(' ').trim() };
    });
    console.log(JSON.stringify(articles, null, 2));
});