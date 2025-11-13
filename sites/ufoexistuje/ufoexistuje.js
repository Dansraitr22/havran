// Store user-submitted entries in localStorage
const SIGHTINGS_KEY = 'ufo_sightings';
const THEORIES_KEY = 'ufo_theories';

let currentCategory = '';

// Load saved entries on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEntries('sightings');
    loadEntries('theories');
});

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
    }
}
