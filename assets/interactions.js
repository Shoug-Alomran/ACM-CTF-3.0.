document.addEventListener('DOMContentLoaded', () => {
    if (!document.querySelector('link[href="assets/registration.css"]')) {
        const styles = document.createElement('link');
        styles.rel = 'stylesheet';
        styles.href = 'assets/registration.css';
        document.head.appendChild(styles);
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

    const modal = document.createElement('div');
    modal.className = 'registration-modal';
    modal.hidden = true;
    modal.innerHTML = `
        <section class="registration-dialog" role="dialog" aria-modal="true" aria-labelledby="registration-title">
            <header class="registration-head">
                <div><p class="registration-kicker">// OPERATOR ENROLLMENT</p><h2 id="registration-title">Register for ACM CTF 3.0</h2></div>
                <button class="registration-close" type="button" aria-label="Close registration form">×</button>
            </header>
            <form class="registration-form">
                <div class="registration-grid">
                    <div class="registration-field full"><label for="reg-team">Team name *</label><input id="reg-team" name="teamName" placeholder="Choose a unique team name" required></div>
                    <div class="registration-field full"><label for="reg-name">Team captain — full name *</label><input id="reg-name" name="captainName" autocomplete="name" required></div>
                    <div class="registration-field"><label for="reg-id">Captain — PSU student ID *</label><input id="reg-id" name="captainId" inputmode="numeric" required></div>
                    <div class="registration-field"><label for="reg-email">Captain — PSU email *</label><input id="reg-email" name="captainEmail" type="email" autocomplete="email" placeholder="name@psu.edu.sa" required></div>
                    <div class="registration-field"><label for="reg-member2">Member 2 — full name *</label><input id="reg-member2" name="member2Name" required></div>
                    <div class="registration-field"><label for="reg-member2-email">Member 2 — PSU email *</label><input id="reg-member2-email" name="member2Email" type="email" placeholder="name@psu.edu.sa" required></div>
                    <div class="registration-field"><label for="reg-member3">Member 3 — full name</label><input id="reg-member3" name="member3Name" placeholder="Optional"></div>
                    <div class="registration-field"><label for="reg-member3-email">Member 3 — PSU email</label><input id="reg-member3-email" name="member3Email" type="email" placeholder="Optional"></div>
                    <div class="registration-field full"><label for="reg-level">Team experience level *</label><select id="reg-level" name="experience" required><option value="">Select level</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
                </div>
                <label class="registration-check"><input type="checkbox" name="rules" required><span>I have read the competition rules and agree to stay within the authorized CTF environment.</span></label>
                <div class="registration-note">STATUS: The form interface is connected. Final submission storage will activate when the organizer provides the registration endpoint.</div>
                <div class="registration-result" role="status" hidden></div>
                <div class="registration-actions"><button class="registration-cancel" type="button">Cancel</button><button class="registration-submit" type="submit">[ REVIEW REGISTRATION ]</button></div>
            </form>
        </section>`;
    document.body.appendChild(modal);

    const form = modal.querySelector('form');
    const closeButton = modal.querySelector('.registration-close');
    const cancelButton = modal.querySelector('.registration-cancel');
    const result = modal.querySelector('.registration-result');
    let returnFocus = null;

    const closeRegistration = () => {
        modal.hidden = true;
        document.body.classList.remove('registration-open');
        returnFocus?.focus();
    };
    const openRegistration = trigger => {
        returnFocus = trigger || document.activeElement;
        modal.hidden = false;
        document.body.classList.add('registration-open');
        result.hidden = true;
        requestAnimationFrame(() => modal.querySelector('input')?.focus());
    };

    document.querySelectorAll('[data-register], a[href$="#register"]').forEach(control => {
        control.addEventListener('click', event => {
            event.preventDefault();
            openRegistration(control);
        });
    });
    closeButton.addEventListener('click', closeRegistration);
    cancelButton.addEventListener('click', closeRegistration);
    modal.addEventListener('click', event => { if (event.target === modal) closeRegistration(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeRegistration(); });
    form.addEventListener('submit', event => {
        event.preventDefault();
        const member3Name = form.elements.member3Name;
        const member3Email = form.elements.member3Email;
        member3Name.setCustomValidity(member3Email.value && !member3Name.value ? 'Enter the third member’s name.' : '');
        member3Email.setCustomValidity(member3Name.value && !member3Email.value ? 'Enter the third member’s PSU email.' : '');
        if (!form.reportValidity()) return;
        result.textContent = 'FORM VALIDATED // TEAM REGISTRATION READY. No data has been transmitted yet.';
        result.hidden = false;
        result.scrollIntoView({block:'nearest'});
    });

    if (location.hash === '#register' || new URLSearchParams(location.search).has('register')) {
        openRegistration(null);
    }
});
