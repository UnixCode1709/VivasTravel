document.addEventListener('DOMContentLoaded', () => {
    const config = window.VIVAS_CONFIG || {};
    const banner = document.getElementById('cookieBanner');
    const key = 'vivas-cookie-choice-v1';
    let choice = null;
    try { choice = JSON.parse(localStorage.getItem(key)); } catch {}
    const allowed = () => choice?.value === 'all';
    const safeURL = (url) => { try { const u = new URL(url); return u.protocol === 'https:' ? u.href : null; } catch { return null; } };
    const applyPartners = () => {
        document.querySelectorAll('[data-partner]').forEach(node => {
            const entry = config.partners?.[node.dataset.partner];
            const url = safeURL(entry?.url);
            if (!url) return;
            node.replaceChildren();
            const link = document.createElement('a');
            link.className = 'btn btn-primary'; link.href = url;
            link.rel = 'sponsored noopener noreferrer'; link.target = '_blank';
            link.textContent = entry.label || 'Перейти к бронированию ↗';
            node.append(link);
        });
    };
    const enableOptionalTools = () => {
        if (!allowed()) return;
        // No third-party analytics request is made without affirmative consent.
        const id = String(config.metrikaId || '');
        if (/^\d+$/.test(id) && !document.querySelector('[data-vivas-metrika]')) {
            window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
            window.ym.l = Date.now();
            const script = document.createElement('script');
            script.src = 'https://mc.yandex.ru/metrika/tag.js'; script.async = true; script.dataset.vivasMetrika = '';
            document.head.append(script);
            window.ym(Number(id), 'init', { clickmap: false, trackLinks: true, accurateTrackBounce: true, webvisor: false });
        }
    };
    const save = (value) => {
        const wasAllowed = allowed();
        choice = { value, version: 1, date: new Date().toISOString() };
        try { localStorage.setItem(key, JSON.stringify(choice)); } catch {}
        banner.hidden = true;
        if (value === 'all') enableOptionalTools();
        else if (wasAllowed && config.metrikaId) { window.ym?.(Number(config.metrikaId), 'destruct'); location.reload(); }
    };
    if (banner) {
        banner.hidden = Boolean(choice && ['all', 'necessary'].includes(choice.value));
        banner.querySelector('[data-cookie-accept]').addEventListener('click', () => save('all'));
        banner.querySelector('[data-cookie-reject]').addEventListener('click', () => save('necessary'));
        if (config.metrikaId) banner.querySelector('.cookie-note').textContent = 'Необязательные инструменты подключаются только после вашего согласия.';
        document.querySelectorAll('[data-cookie-settings]').forEach(b => b.addEventListener('click', () => { banner.hidden = false; banner.querySelector('button').focus(); }));
    }
    for (const [name, title] of [['telegramUrl', 'Telegram'], ['maxUrl', 'MAX'], ['reviewsUrl', 'Отзывы на Яндексе']]) {
        const url = safeURL(config[name]);
        if (url) document.querySelectorAll('.footer .social-links').forEach(node => {
            const a = document.createElement('a'); a.href = url; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.textContent = title; a.className = 'text-button'; node.append(a);
        });
    }
    applyPartners(); enableOptionalTools();
});
