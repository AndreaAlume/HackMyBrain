// Fuzzy Search con Fuse.js
let fuse;

async function loadSearchData() {
    try {
        const response = await fetch('./articoli_json/articoli.json');
        const data = await response.json();
        
        // Configurazione Fuse.js per fuzzy search
        const options = {
            keys: [
                { name: 'title', weight: 0.4 },
                { name: 'description', weight: 0.3 },
                { name: 'category', weight: 0.2 },
                { name: 'tags', weight: 0.1 }
            ],
            threshold: 0.4,
            distance: 100,
            includeScore: true,
            minMatchCharLength: 2,
            shouldSort: true
        };
        
        fuse = new Fuse(data.articles, options);
    } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
    }
}

// Gestione della search bar
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

let debounceTimer;

searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(() => {
        const query = e.target.value.trim();
        
        if (query.length < 2) {
            searchResults.classList.remove('active');
            return;
        }
        
        performSearch(query);
    }, 200);
});

function performSearch(query) {
    if (!fuse) {
        return;
    }
    
    const results = fuse.search(query);
    displayResults(results, query);
}

function highlightMatch(text, query) {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="search-result-highlight">$1</span>');
}

function displayResults(results, query) {
    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="search-no-results">
                Nessun risultato trovato per "${query}"
            </div>
        `;
        searchResults.classList.add('active');
        return;
    }
    
    const html = results.map(result => `
        <a href="${result.item.url}" class="search-result-item">
            <div class="search-result-category">${result.item.category}</div>
            <div class="search-result-title">${highlightMatch(result.item.title, query)}</div>
            <div class="search-result-description">${highlightMatch(result.item.description, query)}</div>
        </a>
    `).join('');
    
    searchResults.innerHTML = html;
    searchResults.classList.add('active');
}

// Chiudi i risultati quando si clicca fuori
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
    }
});

// Shortcuts
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
    }
    
    if (e.key === 'Escape') {
        searchResults.classList.remove('active');
        searchInput.blur();
    }
});

// Inizializza
loadSearchData();