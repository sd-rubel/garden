// index.js - fetch JSON list, render cards, search & filter
(async function() {
    const config = window.APP_CONFIG;
    if (!config || !config.owner) {
        document.getElementById('messageArea').innerHTML = '<div class="error">⚠️ config.js এ সঠিক owner/repo দিন।</div>';
        return;
    }

    const grid = document.getElementById('cardsGrid');
    const messageArea = document.getElementById('messageArea');
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    let allPosts = []; // store { slug, title, description, image }
    
    // show skeletons
    function showSkeletons(count = 6) {
        grid.innerHTML = '';
        for(let i=0; i<count; i++) {
            const skel = document.createElement('div');
            skel.className = 'skeleton-card';
            skel.innerHTML = `<div class="skeleton-img"></div><div class="skeleton-text"></div><div class="skeleton-text short"></div>`;
            grid.appendChild(skel);
        }
    }
    
    function renderCards(posts) {
        if(!posts.length) {
            grid.innerHTML = '';
            messageArea.innerHTML = '<div class="empty-state">😶 কোন পোস্ট পাওয়া যায়নি। /json ফোল্ডারে JSON ফাইল যোগ করুন।</div>';
            return;
        }
        messageArea.innerHTML = '';
        grid.innerHTML = posts.map(post => `
            <div class="card" data-slug="${post.slug}">
                ${post.image ? `<img src="${post.image}" alt="${post.title}" class="card-img" loading="lazy">` : `<div class="card-img" style="background: linear-gradient(135deg, var(--primary-light), var(--primary));"></div>`}
                <div class="card-content">
                    <h3 class="card-title">${escapeHtml(post.title)}</h3>
                    <p class="card-desc">${escapeHtml(post.description?.substring(0, 120) || '')}</p>
                </div>
            </div>
        `).join('');
        // attach click events
        document.querySelectorAll('.card').forEach(card => {
            card.addEventListener('click', () => {
                const slug = card.dataset.slug;
                window.location.href = `/post.html?file=${slug}`;
            });
        });
    }
    
    function escapeHtml(str) { if(!str) return ''; return str.replace(/[&<>]/g, function(m){if(m==='&') return '&amp;'; if(m==='<') return '&lt;'; if(m==='>') return '&gt;'; return m;}); }
    
    async function fetchJsonFileList() {
        const apiUrl = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.jsonFolder}?ref=${config.branch}`;
        try {
            const response = await fetch(apiUrl);
            if(!response.ok) throw new Error(`HTTP ${response.status}`);
            const files = await response.json();
            if(!Array.isArray(files)) throw new Error('Invalid response');
            const jsonFiles = files.filter(f => f.name.endsWith('.json') && f.type === 'file');
            const postsData = [];
            for(const file of jsonFiles) {
                const slug = file.name.replace('.json', '');
                try {
                    const contentRes = await fetch(file.download_url);
                    const json = await contentRes.json();
                    postsData.push({
                        slug: slug,
                        title: json.title || slug,
                        description: json.description || '',
                        image: json.image || ''
                    });
                } catch(e) {
                    console.warn(`failed to load ${file.name}`);
                }
            }
            return postsData;
        } catch(err) {
            console.error(err);
            messageArea.innerHTML = `<div class="error">❌ GitHub API কল ব্যর্থ: ${err.message}. নিশ্চিত করুন config.js সঠিক এবং রিপোজিটরি পাবলিক।</div>`;
            return [];
        }
    }
    
    function filterPosts(searchTerm) {
        if(!searchTerm.trim()) return allPosts;
        const term = searchTerm.trim().toLowerCase();
        return allPosts.filter(p => p.title.toLowerCase().includes(term) || (p.description && p.description.toLowerCase().includes(term)));
    }
    
    // init
    showSkeletons();
    allPosts = await fetchJsonFileList();
    if(allPosts.length) {
        renderCards(allPosts);
    } else {
        grid.innerHTML = '';
        if(!document.querySelector('.error')) messageArea.innerHTML = '<div class="empty-state">📭 কোনো JSON ফাইল পাওয়া যায়নি। json ফোল্ডার চেক করুন।</div>';
    }
    
    // search event
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            const filtered = filterPosts(e.target.value);
            renderCards(filtered);
        }, 300);
    });
    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        renderCards(allPosts);
    });
})();