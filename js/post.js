// post.js - load JSON, render with Nunjucks, update SEO
(async function() {
    const urlParams = new URLSearchParams(window.location.search);
    const fileSlug = urlParams.get('file');
    if(!fileSlug) {
        document.getElementById('postContent').innerHTML = '<div class="message-area">❌ কোন পোস্ট সিলেক্ট করা হয়নি। হোমে ফিরে যান।</div>';
        return;
    }
    
    const config = window.APP_CONFIG;
    if(!config?.owner) {
        document.getElementById('postContent').innerHTML = '<div class="error">config.js error</div>';
        return;
    }
    
    const jsonUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${config.jsonFolder}/${fileSlug}.json`;
    const templateUrl = `/main-layout.njk`;
    
    const contentDiv = document.getElementById('postContent');
    contentDiv.innerHTML = '<div class="loading-spinner">📖 কন্টেন্ট আনছে...</div>';
    
    try {
        const [jsonRes, templateRes] = await Promise.all([fetch(jsonUrl), fetch(templateUrl)]);
        if(!jsonRes.ok) throw new Error('JSON না পাওয়া');
        if(!templateRes.ok) throw new Error('Template না পাওয়া');
        
        const postData = await jsonRes.json();
        const templateString = await templateRes.text();
        
        // client-side nunjucks render
        const renderedHtml = nunjucks.renderString(templateString, postData);
        contentDiv.innerHTML = renderedHtml;
        
        // update SEO
        document.title = `${postData.title || fileSlug} | ডায়নামিক ব্লগ`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if(metaDesc) metaDesc.setAttribute('content', postData.description || '');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        if(ogTitle) ogTitle.setAttribute('content', postData.title);
        const ogDesc = document.querySelector('meta[property="og:description"]');
        if(ogDesc) ogDesc.setAttribute('content', postData.description);
        const ogImage = document.querySelector('meta[property="og:image"]');
        if(ogImage && postData.image) ogImage.setAttribute('content', postData.image);
        
        // back button logic
        const backBtn = document.getElementById('backButton');
        if(backBtn) backBtn.addEventListener('click', () => { window.location.href = '/'; });
        
    } catch(err) {
        console.error(err);
        contentDiv.innerHTML = `<div class="message-area">⚠️ পোস্ট লোড করতে ব্যর্থ: ${err.message}<br><a href="/">◀ হোমে ফিরুন</a></div>`;
    }
})();