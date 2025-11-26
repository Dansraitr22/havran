(function(){
  const statusMsg = document.getElementById('statusMsg');
  const container = document.getElementById('newsContainer');
  const searchInput = document.getElementById('searchInput');
  const categorySelect = document.getElementById('categorySelect');

  const API_BASE = window.SERVER_BASE || '';
  const NEWS_API = API_BASE + '/api/news';

  const loadTemplateFile = async () => {
    try {
      const res = await fetch('./newsTemplate.html');
      if (!res.ok) return null;
      const html = await res.text();
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.querySelector('#newsItemTemplateFile');
    } catch { return null; }
  };

  const getTemplate = async () => {
    const inline = document.getElementById('newsItemTemplate');
    const external = await loadTemplateFile();
    return external || inline;
  };

  const render = async (items) => {
    container.innerHTML = '';
    const tpl = await getTemplate();
    if (!tpl) return;
    items.forEach(item => {
      const node = tpl.content.cloneNode(true);
      node.querySelector('.category').textContent = item.category || '';
      node.querySelector('.date').textContent = item.date || '';
      node.querySelector('.title').textContent = item.title || '';
      node.querySelector('.summary').textContent = item.summary || '';
      const a = node.querySelector('.link');
      if (a) a.href = item.link || '#';
      container.appendChild(node);
    });
  };

  const fetchNews = async () => {
    statusMsg.hidden = false;
    statusMsg.textContent = 'Načítání…';
    try {
      const res = await fetch(NEWS_API);
      if (!res.ok) throw new Error('API není dostupné');
      const data = await res.json();
      statusMsg.hidden = true;
      return Array.isArray(data) ? data : [];
    } catch (e) {
      // Fallback to local JSON for static hosting
      try {
        const res2 = await fetch('./news.json');
        const data2 = await res2.json();
        statusMsg.hidden = true;
        return Array.isArray(data2) ? data2 : [];
      } catch {
        statusMsg.textContent = 'Nepodařilo se načíst zprávy.';
        return [];
      }
    }
  };

  const applyFilters = (items) => {
    const q = (searchInput.value || '').toLowerCase();
    const cat = categorySelect.value || '';
    return items.filter(it => {
      const matchesText = !q || (it.title || '').toLowerCase().includes(q) || (it.summary || '').toLowerCase().includes(q);
      const matchesCat = !cat || (it.category === cat);
      return matchesText && matchesCat;
    });
  };

  let allItems = [];

  const init = async () => {
    allItems = await fetchNews();
    await render(applyFilters(allItems));
  };

  searchInput.addEventListener('input', () => render(applyFilters(allItems)));
  categorySelect.addEventListener('change', () => render(applyFilters(allItems)));

  init();
})();
