/* Renders the organizer dossier, the two-club collaboration panel and the
   four-logo attribution strip. Shared by organizers.html and index.html. */
(function () {
    const DATA_URL = 'data/organizers.json';
    let request = null;

    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

    const load = () => (request ||= fetch(DATA_URL).then(response => response.json()));

    const lang = () => (document.documentElement.lang === 'ar' ? 'ar' : 'en');
    // This content ships its own Arabic, so it opts out of the site-wide auto-translator
    // (which does substring replacement and would otherwise mangle mixed-language prose).
    const pick = (source, key) => (lang() === 'ar' ? (source[key + 'Ar'] || source[key]) : source[key]);

    const brackets = tone => `<div class="bracket-tl${tone}"></div><div class="bracket-tr${tone}"></div><div class="bracket-bl${tone}"></div><div class="bracket-br${tone}"></div>`;

    const primaryLink = (href, icon, label) => href
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 border border-cyber-cyan/40 bg-cyber-cyan/10 text-cyber-cyan px-4 py-2 font-mono text-[11px] uppercase tracking-widest hover:bg-cyber-cyan hover:text-black transition-all"><i class="ph ${icon}"></i> ${escapeHtml(label)}</a>`
        : '';

    const secondaryLink = href => href
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-slate-500 px-1 py-2 font-mono text-[11px] uppercase tracking-widest border-b border-transparent hover:text-slate-200 hover:border-slate-500 transition-all"><i class="ph ph-link-simple"></i> ${escapeHtml(new URL(href).hostname.replace(/^www\./, ''))}</a>`
        : '';

    const metaRow = (icon, tone, label, value) =>
        `<div class="flex items-center gap-2"><i class="ph ${icon} ${tone}"></i> ${escapeHtml(label)}: <span class="text-white">${escapeHtml(value)}</span></div>`;

    function organizerCard(person, index, language) {
        const name = (language === 'ar' ? person.nameAr : person.nameEn) || person.nameEn || person.name || `ORGANIZER_${index + 1}`;
        const club = pick(person, 'club'), position = pick(person, 'position');
        const ctfRole = pick(person, 'ctfRole'), description = pick(person, 'description');
        const pendingText = language === 'ar'
            ? 'يجري تأكيد دور هذا المنظّم في المسابقة ونبذته وروابطه، وستُنشر هنا فور اكتمالها.'
            : 'This organizer’s CTF role, contribution and links are being confirmed and will be published here.';
        const seed = person.avatarSeed || person.nameEn || person.id || `organizer-${index + 1}`;
        const links = person.links || {};
        return `
        <article class="border border-cyber-cyan/20 bg-cyber-dark/40 p-6 md:p-8 bracket-box overflow-hidden">
            ${brackets('')}
            <div class="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start">
                <div class="relative shrink-0">
                    <div class="w-28 h-28 md:w-32 md:h-32 border-2 border-cyber-cyan p-1 bg-cyber-base flex items-center justify-center">
                        <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${encodeURIComponent(seed)}&amp;backgroundColor=060a13" alt="Avatar for ${escapeHtml(name)}" class="w-full h-full object-cover contrast-110 transition-all">
                    </div>
                    <div class="absolute -bottom-2 -right-2 bg-cyber-green text-black font-mono text-[10px] font-bold px-2 py-0.5">ORG ${String(index + 1).padStart(2, '0')}</div>
                </div>
                <div class="flex-grow text-center md:text-left min-w-0">
                    <div class="font-mono text-cyber-cyan/60 text-xs mb-1">ORGANIZER IDENTITY //</div>
                    <h2 data-organizer-index="${index}" class="font-display text-3xl md:text-4xl font-bold text-white uppercase tracking-tight glow-text-cyan mb-3 break-words">${escapeHtml(name)}</h2>
                    <div class="flex flex-wrap gap-x-6 gap-y-2 justify-center md:justify-start font-mono text-[13px] text-slate-300 mb-5">
                        ${metaRow('ph-buildings', 'text-cyber-cyan', 'CLUB', club)}
                        ${metaRow('ph-shield-check', 'text-cyber-green', 'POSITION', position)}
                    </div>
                    <p class="font-display text-[15px] leading-relaxed text-slate-300 max-w-3xl mx-auto md:mx-0 mb-6" data-no-translate>${description ? escapeHtml(description) : pendingText}</p>
                    <div class="flex flex-wrap gap-3 justify-center md:justify-start items-center">
                        ${links.linkedin || links.github || links.extra ? `
                        ${primaryLink(links.linkedin, 'ph-linkedin-logo', 'LinkedIn')}
                        ${primaryLink(links.github, 'ph-github-logo', 'GitHub')}
                        ${secondaryLink(links.extra)}` : `<span class="font-mono text-[11px] text-slate-600 uppercase tracking-widest border border-dashed border-slate-700 px-3 py-2">Links pending</span>`}
                    </div>
                </div>
                <div class="${ctfRole ? 'bg-cyber-cyan/10 border border-cyber-cyan/30' : 'border border-dashed border-slate-700'} p-4 px-6 text-center md:text-left w-full md:w-[210px] shrink-0 self-start">
                    <div class="font-mono text-[11px] ${ctfRole ? 'text-cyber-cyan/70' : 'text-slate-500'} uppercase tracking-widest mb-2">CTF Role</div>
                    <div class="font-display text-[16px] font-bold ${ctfRole ? 'text-cyber-cyan' : 'text-slate-500'} leading-snug" data-no-translate>${ctfRole ? escapeHtml(ctfRole) : (language === 'ar' ? 'قيد التأكيد' : 'To be confirmed')}</div>
                    ${person.additionalRolePending ? `<div class="font-mono text-[11px] text-cyber-cyan/60 mt-2 leading-relaxed" data-no-translate>${language === 'ar' ? '+ مهام إضافية قيد التأكيد' : '+ further duties to be confirmed'}</div>` : ''}
                    <div class="font-mono text-[11px] text-slate-500 mt-3 uppercase">Clearance: Organizer</div>
                </div>
            </div>
        </article>`;
    }

    function clubCard(club) {
        const name = pick(club, 'name') || 'PARTNER CLUB';
        const org = pick(club, 'org'), role = pick(club, 'role'), contribution = pick(club, 'contribution');
        const tone = club.pending ? 'slate-700' : 'cyber-cyan/30';
        // A club can be named but still have its contribution unconfirmed; only the
        // parts we actually have are rendered, never a stand-in description.
        const pendingCopy = lang() === 'ar'
            ? 'يجري تأكيد تفاصيل مساهمة هذا النادي مع مجلس إدارته وستُنشر هنا. لا تُفترض أي تفاصيل حتى ذلك الحين.'
            : 'This club’s contribution breakdown is being confirmed with its board and will be published here. No details are assumed in the meantime.';
        const body = contribution
            ? `<p class="font-display text-[15px] leading-relaxed text-slate-300" data-no-translate>${escapeHtml(contribution)}</p>`
            : `<p class="font-display text-[15px] leading-relaxed text-slate-400" data-no-translate>${pendingCopy}</p>`;
        return `
        <article class="border ${club.pending ? 'border-dashed border-cyber-cyan/25 bg-cyber-dark/20' : 'border-cyber-cyan/20 bg-cyber-dark/40'} p-6 md:p-8 bracket-box">
            ${brackets(club.pending ? ' border-slate-700' : '')}
            <div class="flex items-center gap-4 mb-5">
                <div class="w-12 h-12 ${club.pending ? 'border border-slate-700 text-slate-500' : 'bg-cyber-blue border border-cyber-cyan/30 text-cyber-cyan'} flex items-center justify-center text-xl"><i class="ph ${escapeHtml(club.icon || 'ph-users-three')}"></i></div>
                <div>
                    <div class="${club.pending ? 'text-slate-300' : 'text-white'} font-bold font-display">${escapeHtml(name)}</div>
                    <div class="text-slate-500 text-[11px] font-mono tracking-widest uppercase">${escapeHtml(org || '')}</div>
                </div>
            </div>
            <div class="font-mono text-[11px] ${club.pending ? 'text-cyber-cyan' : 'text-cyber-green'} uppercase tracking-widest mb-3" data-no-translate>${escapeHtml(role || 'Organizing club')}${club.pending ? (lang() === 'ar' ? ' // التفاصيل قيد التأكيد' : ' // DETAILS PENDING') : ''}</div>
            ${body}
        </article>`;
    }

    function logoStrip(logos, label) {
        const items = logos.map(logo => {
            if (logo.pending) {
                return `<div class="logo-strip__item logo-strip__item--pending" role="img" aria-label="${escapeHtml(logo.label)} logo pending">
                    <span class="logo-strip__pending-tag">LOGO PENDING</span>
                    <span class="logo-strip__pending-name">${escapeHtml(logo.label)}</span>
                </div>`;
            }
            const image = `<img src="${escapeHtml(logo.src)}" alt="${escapeHtml(logo.label)}" loading="lazy" decoding="async">`;
            // Marks drawn for light backgrounds (dark text, transparent ground) need a
            // plate so they stay legible on the dossier's near-black panel.
            const cls = `logo-strip__item${logo.plate ? ' logo-strip__item--plate' : ''}`;
            return logo.href
                ? `<a class="${cls}" href="${escapeHtml(logo.href)}">${image}</a>`
                : `<div class="${cls}">${image}</div>`;
        }).join('');
        return `<div class="logo-strip__label">${escapeHtml(label)}</div><div class="logo-strip__grid">${items}</div>`;
    }

    // Wordmarks are wide, crests are near-square. Capping every mark at the same
    // height leaves crests looking tiny beside wordmarks, so square-ish marks get a
    // taller cap to even out their optical weight.
    function balanceHeight(image) {
        const ratio = image.naturalWidth / image.naturalHeight;
        if (ratio && ratio < 1.8) image.closest('.logo-strip__item')?.classList.add('logo-strip__item--compact');
    }

    function renderLogoStrips(data) {
        document.querySelectorAll('[data-logo-strip]').forEach(host => {
            host.classList.add('logo-strip');
            host.innerHTML = logoStrip(data.logos || [], host.dataset.logoStrip || 'Organized in collaboration with');
            host.querySelectorAll('.logo-strip__item img').forEach(image => {
                if (image.complete && image.naturalWidth) balanceHeight(image);
                else image.addEventListener('load', () => balanceHeight(image), { once: true });
            });
        });
    }

    function renderOrganizers(data) {
        const roster = document.querySelector('[data-organizer-roster]');
        const clubs = document.querySelector('[data-club-grid]');
        const collaboration = document.querySelector('[data-collaboration-note]');
        const people = data.organizers || [];
        const language = lang();

        if (roster) {
            roster.innerHTML = people.length
                ? people.map((person, index) => organizerCard(person, index, language)).join('')
                : '<div class="border border-dashed border-slate-700 p-10 text-center font-mono text-xs text-slate-500 uppercase tracking-widest">No organizers published yet</div>';
        }
        if (clubs) clubs.innerHTML = (data.clubs || []).map(clubCard).join('');
        if (collaboration && data.collaboration) {
            collaboration.innerHTML = `<p class="font-display text-xl font-semibold text-white mb-3 leading-snug" data-no-translate>${escapeHtml(pick(data.collaboration, 'headline'))}</p><p class="font-display text-[15px] leading-relaxed text-slate-300" data-no-translate>${escapeHtml(pick(data.collaboration, 'body'))}</p>`;
        }
        document.querySelectorAll('[data-page-intro]').forEach(node => {
            node.setAttribute('data-no-translate', '');
            node.textContent = pick(data, 'intro') || '';
        });
        document.querySelectorAll('[data-pending-note]').forEach(node => {
            node.setAttribute('data-no-translate', '');
            node.textContent = pick(data, 'pendingNote') || '';
        });
        document.querySelectorAll('[data-organizer-count]').forEach(node => {
            node.textContent = String(people.length).padStart(2, '0');
        });
    }

    window.Organizers = { load, renderOrganizers, renderLogoStrips };

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.querySelector('[data-organizer-roster], [data-logo-strip]')) return;
        load().then(data => {
            renderLogoStrips(data);
            renderOrganizers(data);
            window.addEventListener('site-language-change', () => setTimeout(() => renderOrganizers(data), 0));
        }).catch(() => {
            document.querySelectorAll('[data-organizer-roster]').forEach(host => {
                host.innerHTML = '<div class="border border-dashed border-cyber-red/40 p-10 text-center font-mono text-xs text-cyber-red uppercase tracking-widest">Organizer manifest unavailable</div>';
            });
        });
    });
})();
