// theme.js - persistent theme toggling
(function() {
    const STORAGE_KEY = 'blog-theme';
    const getPreferredTheme = () => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
        localStorage.setItem(STORAGE_KEY, theme);
        const btn = document.getElementById('themeToggle');
        if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    };
    const toggleTheme = () => {
        const current = document.body.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = current === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    };
    window.addEventListener('DOMContentLoaded', () => {
        const saved = getPreferredTheme();
        applyTheme(saved);
        const btn = document.getElementById('themeToggle');
        if (btn) btn.addEventListener('click', toggleTheme);
    });
})();