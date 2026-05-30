(function() {
    const storageKey = 'taqwa-theme';
    const applyTheme = (theme) => {
        if(theme === 'dark') document.body.classList.add('dark');
        else document.body.classList.remove('dark');
        localStorage.setItem(storageKey, theme);
        const btn = document.getElementById('themeToggle');
        if(btn) btn.innerHTML = theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    };
    const getPreferred = () => localStorage.getItem(storageKey) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    window.addEventListener('DOMContentLoaded', () => {
        applyTheme(getPreferred());
        const btn = document.getElementById('themeToggle');
        if(btn) btn.addEventListener('click', () => {
            const newTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
            applyTheme(newTheme);
        });
    });
})();