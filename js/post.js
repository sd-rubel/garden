(async function() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('file');
    if(!slug) { fallback('❌ কোনো ফাইল উল্লেখ করা হয়নি'); return; }
    const config = window.APP_CONFIG;
    const jsonUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.jsonFolder}/${slug}.json`;
    const templateUrl = `/main-layout.njk`;
    const mainDiv = document.getElementById('postContent');
    try {
        const [jsonRes, templateRes] = await Promise.all([fetch(jsonUrl), fetch(templateUrl)]);
        if(!jsonRes.ok) throw new Error('JSON পাওয়া যায়নি');
        const jsonData = await jsonRes.json();
        const solution = jsonData.gardening_solutions[0];
        if(!solution) throw new Error('ভুল JSON ফরম্যাট');
        const template = await templateRes.text();
        const rendered = nunjucks.renderString(template, jsonData);
        mainDiv.innerHTML = rendered;
        // SEO update from 'seo' object
        const seo = solution.seo || {};
        document.title = seo.meta_title || solution.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if(metaDesc) metaDesc.setAttribute('content', seo.meta_description || solution.short_description);
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if(ogTitle) ogTitle.setAttribute('content', seo.meta_title || solution.title);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if(ogDesc) ogDesc.setAttribute('content', seo.meta_description || solution.short_description);
        const ogImage = document.querySelector('meta[property="og:image"]');
        if(ogImage && seo.og_image) ogImage.setAttribute('content', seo.og_image);
        const keywordsMeta = document.querySelector('meta[name="keywords"]');
        if(keywordsMeta && seo.keywords) keywordsMeta.setAttribute('content', seo.keywords.join(', '));
        const canonical = document.getElementById('canonicalLink');
        if(canonical) canonical.setAttribute('href', window.location.href);
    } catch(err) {
        console.error(err);
        mainDiv.innerHTML = `<div class="loading-premium">⚠️ ${err.message}<br><a href="/">◀ হোম</a></div>`;
    }
    function fallback(msg) { mainDiv.innerHTML = `<div class="loading-premium">${msg}</div>`; }
})();