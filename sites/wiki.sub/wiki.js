(function(){
  const API_BASE = window.SERVER_BASE || '';
  const container = document.getElementById('wikiContainer');
  if (!container) return;
  const render = (items=[]) => {
    container.innerHTML = '';
    items.forEach(it => {
      const div = document.createElement('div');
      div.className = 'wiki-item';
      div.style.border = '1px solid #e5e7eb';
      div.style.borderRadius = '8px';
      div.style.padding = '12px';
      div.style.marginBottom = '10px';
      div.innerHTML = `
        <h2 style="margin:0 0 6px;">${it.title||''}</h2>
        <p style="margin:0 0 6px;">${it.summary||''}</p>
        ${it.link ? `<a href="${it.link}" target="_blank" rel="noopener noreferrer">Více</a>` : ''}
      `;
      container.appendChild(div);
    });
  };
  const init = async () => {
    try {
      let res = await fetch(API_BASE + '/api/wiki');
      if (!res.ok) res = await fetch('./wiki.json');
      const data = await res.json();
      render(Array.isArray(data) ? data : []);
    } catch (e) {
      render([]);
    }
  };
  init();
})();
