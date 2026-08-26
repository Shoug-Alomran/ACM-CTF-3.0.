document.addEventListener('DOMContentLoaded', () => {
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
        control.addEventListener('click', () => {
            window.location.href = control.dataset.href;
        });
        control.addEventListener('keydown', event => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                window.location.href = control.dataset.href;
            }
        });
    });

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
});
