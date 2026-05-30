(async function() {
    const config = window.APP_CONFIG;
    if(!config?.owner) { showMsg('❌ config.js ঠিক করুন'); return; }
    const grid = document.getElementById('cardsGrid');
    const msgDiv = document.getElementById('messageArea');
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    let allItems = [];

    async function fetchAllSolutions() {
        const api = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.jsonFolder}?ref=${config.branch}`;
        try {
            const res = await fetch(api);
            if(!res.ok) throw new Error();
            const files = await res.json();
            const jsonFiles = files.filter(f => f.name.endsWith('.json'));
            const items = [];
            for(const file of jsonFiles) {
                try {
                    const contentRes = await fetch(file.download_url);
                    const json = await contentRes.json();
                    const sol = json.gardening_solutions[0];
                    if(sol) {
                        items.push({
                            slug: sol.slug,
                            title: sol.title,
                            description: sol.short_description,
                            image: sol.seo?.og_image || '',
                            id: sol.id
                        });
                    }
                } catch(e) { console.warn(file.name, e); }
            }
            return items;
        } catch(e) { showMsg('গিটহাব API কল ব্যর্থ, রিপো চেক করুন'); return []; }
    }

    function renderCards(list) {
        if(!list.length) { grid.innerHTML = ''; showMsg('😶 কোনো সমাধান পাওয়া যায়নি'); return; }
        msgDiv.innerHTML = '';
        grid.innerHTML = list.map(item => `
            <div class="card-premium" data-slug="${item.slug}">
                <div class="card-img-premium" style="background: linear-gradient(135deg, var(--grad-start), var(--grad-end)); ${item.image ? `background-image: url(${item.image}); background-size: cover;` : ''}"></div>
                <div class="card-content-premium">
                    <h3 class="card-title-premium">${escapeHtml(item.title)}</h3>
                    <p class="card-desc-premium">${escapeHtml(item.description?.substring(0,120))}</p>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.card-premium').forEach(c => {
            c.addEventListener('click', () => window.location.href = `/post.html?file=${c.dataset.slug}`);
        });
    }
    function escapeHtml(s) { if(!s) return ''; return s.replace(/[&<>]/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[m];}); }
    function showMsg(txt) { msgDiv.innerHTML = `<div class="message-premium">${txt}</div>`; }
    function filter(term) { return allItems.filter(i => i.title.includes(term) || i.description.includes(term)); }

    // init
    grid.innerHTML = '<div class="loading-premium">📦 লোড হচ্ছে...</div>';
    allItems = await fetchAllSolutions();
    renderCards(allItems);
    let deb;
    searchInput.addEventListener('input', (e) => { clearTimeout(deb); deb = setTimeout(() => renderCards(filter(e.target.value)), 300); });
    clearBtn.addEventListener('click', () => { searchInput.value = ''; renderCards(allItems); });
})();