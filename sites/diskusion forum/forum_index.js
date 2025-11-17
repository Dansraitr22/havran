document.addEventListener('DOMContentLoaded', () => {
  const threadListEl = document.getElementById('threadList');
  const newThreadForm = document.getElementById('newThreadForm');
  const threadTitleInput = document.getElementById('threadTitle');

  const THREADS_KEY = 'forumThreads';
  let threads = JSON.parse(localStorage.getItem(THREADS_KEY)) || [];

  // Ensure default thread exists pointing to existing single-page forum
  if (!threads.some(t => t.id === 'default')) {
    threads.push({ id: 'default', title: 'forum rozsectnik' });
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
  }

  function makeId() {
    return 'th_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function renderThreads() {
    threadListEl.innerHTML = '';
    if (!threads.length) {
      threadListEl.innerHTML = '<p>Žádné diskuse zatím nevytvořeny.</p>';
      return;
    }
    threads.forEach(th => {
      const div = document.createElement('div');
      div.className = 'thread-item';
      div.innerHTML = `
        <strong>${th.title}</strong><br>
        <a href="./forum.html?thread=${encodeURIComponent(th.id)}">Otevřít</a>
        ${th.id !== 'default' ? `<button data-id="${th.id}" class="delete-thread">Smazat</button>` : ''}
      `;
      threadListEl.appendChild(div);
    });

    document.querySelectorAll('.delete-thread').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        threads = threads.filter(t => t.id !== id);
        localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
        // Remove associated posts storage
        localStorage.removeItem('forumPosts_' + id);
        renderThreads();
      });
    });
  }

  newThreadForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = threadTitleInput.value.trim();
    if (!title) return;
    const id = makeId();
    threads.push({ id, title });
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
    threadTitleInput.value = '';
    renderThreads();
  });

  renderThreads();
});
