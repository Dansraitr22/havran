// Store user-submitted entries in localStorage
const SIGHTINGS_KEY = 'ufo_sightings';
const THEORIES_KEY = 'ufo_theories';

// Server sync settings (mirror pattern used by bazar)
const UFO_SYNC_ENDPOINT = 'https://havran.onrender.com/api/forum';
const UFO_SERVER_SECRET = 'ilovekatie';

let currentCategory = '';

// Load saved entries on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEntries('sightings');
    loadEntries('theories');
    loadUfoNews();
});

// Load and render site news about UFO sightings / research
function loadUfoNews() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;
    // Load static news then user-submitted server news (userNews.json)
    Promise.all([
        fetch('./newsData.json').then(r => r.ok ? r.json() : [] ).catch(() => []),
        fetch('./userNews.json').then(r => r.ok ? r.json() : [] ).catch(() => [])
    ]).then(([staticNews, userNews]) => {
        newsList.innerHTML = '';
        // show user-submitted posts first (if any) mapped to same shape
        if (Array.isArray(userNews) && userNews.length) {
            userNews.slice().reverse().forEach(u => {
                const div = document.createElement('div');
                div.className = 'sub-entry user-entry';
                const title = u.username ? `${u.username} (uživatel)` : 'Uživatel';
                div.innerHTML = `
                    <h3>${escapeHtml(title)}</h3>
                    <p>${escapeHtml(u.message || '')}</p>
                `;
                newsList.appendChild(div);
            });
        }
        // then show static news
        if (Array.isArray(staticNews)) {
            staticNews.forEach(item => {
                const div = document.createElement('div');
                div.className = 'sub-entry';
                div.innerHTML = `
                    <h3>${escapeHtml(item.title)}</h3>
                    <p>${escapeHtml(item.content)}</p>
                `;
                newsList.appendChild(div);
            });
        }
        if ((!Array.isArray(userNews) || !userNews.length) && (!Array.isArray(staticNews) || !staticNews.length)) {
            newsList.innerHTML = '<p>Novinky nejsou k dispozici.</p>';
        }
    }).catch(err => {
        console.error('Failed to load UFO news:', err);
        newsList.innerHTML = '<p>Novinky nelze načíst.</p>';
    });
}

// Simple HTML-escape helper to avoid injecting unintended markup
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function openModal(category) {
    currentCategory = category;
    const modal = document.getElementById('addModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (category === 'sightings') {
        modalTitle.textContent = 'Přidat Nové Pozorování';
    } else if (category === 'theories') {
        modalTitle.textContent = 'Přidat Novou Teorii';
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('addModal');
    modal.style.display = 'none';
    document.getElementById('addEntryForm').reset();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addModal');
    if (event.target === modal) {
        closeModal();
    }
}

// Handle form submission
document.getElementById('addEntryForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const title = document.getElementById('entryTitle').value.trim();
    const description = document.getElementById('entryDescription').value.trim();
    const author = document.getElementById('entryAuthor').value.trim() || 'Anonymní';
    
    if (title && description) {
        const entry = {
            id: Date.now().toString(),
            title: title,
            description: description,
            author: author,
            date: new Date().toLocaleDateString('cs-CZ')
        };
        
        saveEntry(currentCategory, entry);
        closeModal();
    }
});

function saveEntry(category, entry) {
    const storageKey = category === 'sightings' ? SIGHTINGS_KEY : THEORIES_KEY;
    const entries = JSON.parse(localStorage.getItem(storageKey)) || [];
    entries.push(entry);
    localStorage.setItem(storageKey, JSON.stringify(entries));
    loadEntries(category);
    // attempt to sync to server (non-blocking)
    syncUfoEntriesToServer().catch(err => console.error('UFO sync error:', err));
}

function loadEntries(category) {
    const storageKey = category === 'sightings' ? SIGHTINGS_KEY : THEORIES_KEY;
    const entries = JSON.parse(localStorage.getItem(storageKey)) || [];
    const listContainer = document.getElementById(category + '-list');
    
    // Remove only user-added entries (keep default ones)
    const userEntries = listContainer.querySelectorAll('.sub-entry.user-entry');
    userEntries.forEach(entry => entry.remove());
    
    // Add user entries
    entries.forEach(entry => {
        const entryDiv = document.createElement('div');
        entryDiv.className = 'sub-entry user-entry';
        entryDiv.innerHTML = `
            <h3>${entry.title}</h3>
            <p>${entry.description}</p>
            <p class="entry-meta">Přidal: ${entry.author} • ${entry.date}</p>
            <button class="delete-btn" onclick="deleteEntry('${category}', '${entry.id}')">Smazat</button>
        `;
        listContainer.appendChild(entryDiv);
    });
}

function deleteEntry(category, entryId) {
    if (confirm('Opravdu chcete smazat tuto položku?')) {
        const storageKey = category === 'sightings' ? SIGHTINGS_KEY : THEORIES_KEY;
        let entries = JSON.parse(localStorage.getItem(storageKey)) || [];
        entries = entries.filter(entry => entry.id !== entryId);
        localStorage.setItem(storageKey, JSON.stringify(entries));
        loadEntries(category);
        // resync after deletion
        syncUfoEntriesToServer().catch(err => console.error('UFO sync error:', err));
    }
}

// Sync local UFO entries (sightings + theories) to the server as posts
async function syncUfoEntriesToServer() {
    try {
        // Combine both categories into a single posts array
        const sightings = JSON.parse(localStorage.getItem(SIGHTINGS_KEY)) || [];
        const theories = JSON.parse(localStorage.getItem(THEORIES_KEY)) || [];
        // Map entries to a simple post shape expected by the server
        const posts = [...sightings, ...theories].map(e => ({
            id: e.id,
            username: e.author || e.authorName || 'Anonymní',
            message: (e.title ? (e.title + ' — ') : '') + (e.description || e.description || e.msg || ''),
            createdAt: new Date().toISOString()
        }));

        // Send to server; filePath will be where posts are stored for the site
        const payload = {
            posts,
            filePath: 'sites/ufoexistuje/userNews.json'
        };

        const res = await fetch(UFO_SYNC_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Server-Secret': UFO_SERVER_SECRET
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const text = await res.text();
            console.error('Failed to sync UFO entries:', res.status, text);
        } else {
            console.log('UFO entries synced to server');
        }
    } catch (err) {
        console.error('Error syncing UFO entries:', err);
        throw err;
    }
}
