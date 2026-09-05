/* interactions.js injects this file dynamically, so DOMContentLoaded may have
 * already fired by the time it runs. Check readyState instead of assuming the
 * event is still to come, otherwise the header, footer and i18n never render. */
(function ready(run) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
    else run();
}(() => {
    if (!document.querySelector('link[href="assets/site-shell.css"]')) {
        const shellStyles = document.createElement('link'); shellStyles.rel = 'stylesheet'; shellStyles.href = 'assets/site-shell.css'; document.head.appendChild(shellStyles);
    }
    const pageName = location.pathname.split('/').pop() || 'index.html';
    document.body.classList.add('site-shell-active');
    [...document.body.children].forEach(el => {
        if ((el.tagName === 'HEADER' && el.querySelector('nav')) || el.tagName === 'NAV' || (el.matches('div.fixed.top-0.w-full') && el.querySelector('nav'))) el.hidden = true;
    });
    const siteHeader = document.createElement('header');
    siteHeader.className = 'site-header';
    const navItems = [['index.html', 'HOME'], ['workshops.html', 'Workshops'], ['challenges.html', 'Challenges'], ['competition.html', 'Competition'], ['scoreboard.html', 'Scoreboard'], ['rules.html', 'Rules'], ['faq.html', 'FAQ'], ['teams.html', 'Teams'], ['organizers.html', 'Organizers']];
    siteHeader.innerHTML = `<div class="site-header__inner"><a class="site-header__brand" href="index.html"><svg viewBox="0 0 64 64" aria-hidden="true"><polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill="none" stroke="#00f0ff" stroke-width="3"/><path d="M24 17v30M24 19l22 7-22 7z" fill="none" stroke="#00f0ff" stroke-width="3"/></svg><span>ACM/CyberTech CTF <em>3.0</em></span></a><button class="site-header__toggle" type="button" aria-expanded="false" aria-controls="site-header-nav">MENU</button><nav id="site-header-nav" class="site-header__nav" aria-label="Main navigation">${navItems.map(([href, label]) => `<a href="${href}"${pageName === href ? ' aria-current="page"' : ''}>${label}${pageName === href ? '_' : ''}</a>`).join('')}<button class="site-header__language" type="button" data-language-toggle aria-label="Switch to Arabic">AR</button><a class="site-header__cta" href="register.html">[ REGISTER ]</a></nav></div>`;
    document.body.prepend(siteHeader);
    const shellToggle = siteHeader.querySelector('.site-header__toggle'), shellNav = siteHeader.querySelector('nav');
    shellToggle.addEventListener('click', () => { const open = shellNav.classList.toggle('is-open'); shellToggle.setAttribute('aria-expanded', String(open)) });

    let siteFooter = document.querySelector('footer');
    if (!siteFooter) {
        siteFooter = document.createElement('footer');
        siteFooter.className = 'site-credit-footer';
        document.body.appendChild(siteFooter);
    }
    if (!siteFooter.querySelector('.site-blueprint-credit')) {
        const credit = document.createElement('div');
        credit.className = 'site-blueprint-credit';
        credit.innerHTML = `Made by <a href="https://blueprint.shoug-tech.com/" target="_blank" rel="noopener noreferrer">Blueprint</a>`;
        siteFooter.appendChild(credit);
    }

    const showToast = (message) => {
        let toast = document.getElementById('site-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'site-toast';
            toast.setAttribute('role', 'status');
            Object.assign(toast.style, {
                position: 'fixed', right: '1rem', bottom: '1rem', zIndex: '9999',
                maxWidth: 'min(26rem, calc(100vw - 2rem))', padding: '0.9rem 1.1rem',
                border: '1px solid #00f0ff', background: '#060a13', color: '#00f0ff',
                fontFamily: 'JetBrains Mono, monospace', fontSize: '0.75rem',
                boxShadow: '0 0 24px rgba(0,240,255,.2)', transition: 'opacity .2s, transform .2s'
            });
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
        clearTimeout(window.siteToastTimer);
        window.siteToastTimer = setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(0.5rem)';
        }, 3200);
    };

    document.querySelectorAll('[data-toast]').forEach(control => {
        if (!control.hasAttribute('tabindex') && !['A', 'BUTTON'].includes(control.tagName)) {
            control.tabIndex = 0;
            control.setAttribute('role', 'button');
        }
        control.addEventListener('click', () => showToast(control.dataset.toast));
        control.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                showToast(control.dataset.toast);
            }
        });
    });

    document.querySelectorAll('[data-href]').forEach(control => {
        if (!control.hasAttribute('tabindex') && !['A', 'BUTTON'].includes(control.tagName)) {
            control.tabIndex = 0;
            control.setAttribute('role', 'link');
        }
        control.addEventListener('click', event => {
            if (event.target.closest('a, button, input, select, textarea')) return;
            window.location.href = control.dataset.href;
        });
        control.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                window.location.href = control.dataset.href;
            }
        });
    });

    const focusWorkshopFromHash = () => {
        if (!location.hash.startsWith('#workshop-')) return;
        const workshop = document.querySelector(location.hash);
        if (!workshop) return;
        requestAnimationFrame(() => workshop.focus({ preventScroll: true }));
    };
    focusWorkshopFromHash();
    window.addEventListener('hashchange', focusWorkshopFromHash);

    document.querySelectorAll('[data-mobile-menu]').forEach(button => {
        const menu = document.querySelector(button.dataset.mobileMenu);
        if (!menu) return;
        button.setAttribute('aria-expanded', 'false');
        button.addEventListener('click', () => {
            const open = menu.classList.toggle('hidden');
            button.setAttribute('aria-expanded', String(!open));
        });
    });

    const tokenButton = document.querySelector('[data-generate-token]');
    const tokenOutput = document.querySelector('[data-token-output]');
    if (tokenButton && tokenOutput) {
        tokenButton.addEventListener('click', () => {
            const bytes = new Uint32Array(3);
            crypto.getRandomValues(bytes);
            const parts = [...bytes].map(value => value.toString(36).toUpperCase().padStart(6, '0').slice(-6));
            tokenOutput.textContent = `ACM3-SQ-${parts.join('-')}`;
            showToast('New demo recruitment token generated locally. No invitation was sent.');
        });
    }

    // Registration is handled by the real, ACM-backed form at register.html.
    // Every CTA routes there; there is no client-side registration store.
    const REGISTRATION_PAGE = 'register.html';
    document.querySelectorAll('[data-register], a[href$="#register"]').forEach(control => {
        if (control.tagName === 'A') control.setAttribute('href', REGISTRATION_PAGE);
        control.addEventListener('click', event => {
            event.preventDefault();
            window.location.href = REGISTRATION_PAGE;
        });
    });

    if (location.hash === '#register' || new URLSearchParams(location.search).has('register')) {
        window.location.replace(REGISTRATION_PAGE);
        return;
    }

    import('./i18n.js').then(module => module.initI18n());
}));
