/* Renders the archived CTF 2.0 leaderboard from data/previous-teams.json and opens a
   per-team dossier on click. Member rosters are published for the top three only;
   every other team stays anonymous, matching the archive's privacy rule. */
(function () {
    const DATA_URL = 'data/previous-teams.json';
    const ROSTER_RANK_LIMIT = 3;

    const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));

    const isArabic = () => document.documentElement.lang === 'ar';
    const pad = value => String(value ?? '--').padStart(2, '0');
    const points = value => Number(value || 0).toLocaleString('en-US');

    function row(team, index) {
        const rank = team.rank ?? index + 1;
        const rankTone = rank === 1 ? 'text-cyber-cyan' : 'text-slate-300';
        const scoreTone = rank === 1 ? 'text-cyber-green glow-text-green' : 'text-cyber-green';
        return `
        <tr class="hover:bg-cyber-cyan/5 transition-colors group cursor-pointer focus:outline-none focus:bg-cyber-cyan/10"
            data-team-row="${escapeHtml(team.id)}" role="button" tabindex="0"
            aria-label="View dossier for team ${escapeHtml(team.name)}">
            <td class="py-5 px-3 sm:px-6 text-center font-bold ${rankTone} text-lg">${pad(rank)}</td>
            <td class="py-5 px-3 sm:px-6">
                <div class="flex flex-col">
                    <span class="text-white font-bold tracking-tight group-hover:text-cyber-cyan transition-colors" data-no-translate>${escapeHtml(team.name)}</span>
                    <span class="text-[10px] text-slate-500 uppercase">CTF 2.0 // VERIFIED</span>
                </div>
            </td>
            <td class="py-5 px-3 sm:px-6">
                <span class="text-[10px] text-cyber-green border border-cyber-green/30 px-2 py-1">FINAL</span>
                <span class="ml-3 text-[10px] text-slate-600 group-hover:text-cyber-cyan transition-colors uppercase tracking-widest">[ Details ]</span>
            </td>
            <td class="py-5 px-3 sm:px-6 text-right ${scoreTone} font-bold text-lg">${points(team.score)}</td>
        </tr>`;
    }

    function rosterBlock(team) {
        const rank = team.rank ?? 99;
        const heading = isArabic() ? 'أعضاء الفريق' : 'Team roster';
        if (rank > ROSTER_RANK_LIMIT) {
            const note = isArabic()
                ? 'تُنشر أسماء الأعضاء لأصحاب المراكز الثلاثة الأولى فقط. تبقى بقية الفرق مجهولة الهوية في الأرشيف.'
                : 'Member names are published for the top three finishers only. Every other team stays anonymous in the archive.';
            return `<div class="border border-dashed border-slate-700 p-4 font-mono text-[11px] text-slate-500 leading-relaxed" data-no-translate>${escapeHtml(note)}</div>`;
        }
        const members = team.members || [];
        if (!members.length) return '';
        const items = members.map(member => {
            const name = (isArabic() && member.nameAr) ? member.nameAr : (member.nameEn || member.name);
            const captain = /captain/i.test(member.role || '');
            return `<li class="flex items-center justify-between gap-4 border border-slate-800 bg-cyber-base/60 px-4 py-3">
                <span class="font-display text-[15px] text-white" data-no-translate>${escapeHtml(name)}</span>
                <span class="font-mono text-[10px] uppercase tracking-widest ${captain ? 'text-cyber-cyan' : 'text-slate-500'}">${escapeHtml(member.role || 'Member')}</span>
            </li>`;
        }).join('');
        return `
        <div>
            <div class="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">${escapeHtml(heading)} // ${pad(members.length)}</div>
            <ul class="space-y-2">${items}</ul>
        </div>`;
    }

    function solvesBlock(team, data) {
        const heading = isArabic() ? 'التحديات المحلولة' : 'Challenges solved';
        const solves = team.solves || [];
        if (solves.length) {
            const items = solves.map(solve => `
                <li class="flex items-center justify-between gap-4 border border-slate-800 bg-cyber-base/60 px-4 py-3">
                    <span class="min-w-0">
                        <span class="block font-display text-[15px] text-white truncate" data-no-translate>${escapeHtml(solve.challenge)}</span>
                        <span class="block font-mono text-[10px] uppercase tracking-widest text-slate-500" data-no-translate>${escapeHtml(solve.category || 'Uncategorized')}</span>
                    </span>
                    <span class="font-mono text-sm text-cyber-green shrink-0">+${points(solve.points)}</span>
                </li>`).join('');
            const total = solves.reduce((sum, solve) => sum + Number(solve.points || 0), 0);
            return `
            <div>
                <div class="flex items-baseline justify-between mb-3">
                    <span class="font-mono text-[10px] uppercase tracking-widest text-slate-500">${escapeHtml(heading)} // ${pad(solves.length)}</span>
                    <span class="font-mono text-[10px] uppercase tracking-widest text-slate-500">${escapeHtml(isArabic() ? 'المجموع' : 'Total')}: <span class="text-cyber-green">${points(total)}</span></span>
                </div>
                <ul class="space-y-2">${items}</ul>
            </div>`;
        }
        // The CTF 2.0 report records solve counts per challenge, not which team solved
        // what, so the dossier shows the board this team played rather than inventing
        // a per-team solve list.
        const note = isArabic()
            ? 'لا يسجّل تقرير CTF 2.0 التحديات التي حلّها كل فريق على حدة، بل عدد الفرق التي حلّت كل تحدٍ. في ما يلي لوحة التحديات التي خاضها هذا الفريق.'
            : 'The CTF 2.0 report records how many teams solved each challenge, not which challenges a given team solved. Below is the board this team played.';
        const board = (data.challenges || []).map(challenge => {
            const rate = Number(challenge.solveRate || 0);
            const tone = challenge.solves === 0 ? 'text-cyber-red' : (rate >= 90 ? 'text-cyber-green' : 'text-cyber-cyan');
            return `
            <li class="flex items-center justify-between gap-4 border border-slate-800 bg-cyber-base/60 px-4 py-2.5">
                <span class="font-display text-[14px] text-white min-w-0 truncate" data-no-translate>${escapeHtml(challenge.name)}</span>
                <span class="font-mono text-[11px] ${tone} shrink-0">${pad(challenge.solves)} / ${pad(data.teamCount)} <span class="text-slate-600">· ${rate}%</span></span>
            </li>`;
        }).join('');
        return `
        <div>
            <div class="font-mono text-[10px] uppercase tracking-widest text-slate-500 mb-3">${escapeHtml(isArabic() ? 'لوحة التحديات' : 'Challenge board')} // ${pad((data.challenges || []).length)}</div>
            <p class="font-display text-[13px] leading-relaxed text-slate-400 mb-4" data-no-translate>${escapeHtml(note)}</p>
            <ul class="space-y-2">${board}</ul>
        </div>`;
    }

    function dialogMarkup(team, index, data) {
        const rank = team.rank ?? index + 1;
        return `
        <div class="flex items-start justify-between gap-6 border-b border-slate-800 pb-5 mb-6">
            <div class="min-w-0">
                <div class="font-mono text-[10px] uppercase tracking-widest text-cyber-cyan/70 mb-2">CTF 2.0 // Team dossier</div>
                <h2 id="team-dossier-title" class="font-display text-3xl md:text-4xl font-bold text-white uppercase tracking-tight glow-text-cyan break-words" data-no-translate>${escapeHtml(team.name)}</h2>
                <div class="flex flex-wrap gap-x-6 gap-y-2 mt-3 font-mono text-[11px] uppercase tracking-widest text-slate-500">
                    <span>Rank: <span class="${rank === 1 ? 'text-cyber-cyan' : 'text-white'}">#${pad(rank)}</span></span>
                    <span>Points: <span class="text-cyber-green">${points(team.score)}</span></span>
                    <span>Status: <span class="text-cyber-green">Final</span></span>
                </div>
            </div>
            <button type="button" data-team-close class="shrink-0 border border-slate-700 text-slate-400 hover:text-cyber-cyan hover:border-cyber-cyan/50 transition-colors w-9 h-9 flex items-center justify-center font-mono text-lg" aria-label="Close team dossier">×</button>
        </div>
        <div class="space-y-6">
            ${solvesBlock(team, data)}
            ${rosterBlock(team)}
        </div>`;
    }

    function mountModal() {
        const modal = document.createElement('div');
        modal.hidden = true;
        modal.dataset.teamModal = '';
        modal.className = 'fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm p-4 md:p-8 overflow-y-auto';
        modal.innerHTML = `
            <section class="relative mx-auto my-auto max-w-2xl w-full bg-cyber-dark border border-cyber-cyan/30 p-6 md:p-8 bracket-box"
                     role="dialog" aria-modal="true" aria-labelledby="team-dossier-title" tabindex="-1"
                     data-team-dialog></section>`;
        document.body.appendChild(modal);
        return modal;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const body = document.querySelector('[data-archive-scoreboard] tbody');
        if (!body) return;

        const modal = mountModal();
        const dialog = modal.querySelector('[data-team-dialog]');
        let returnFocus = null;

        const close = () => {
            modal.hidden = true;
            document.body.style.overflow = '';
            returnFocus?.focus();
        };
        const open = (team, index, trigger) => {
            returnFocus = trigger || document.activeElement;
            dialog.innerHTML = dialogMarkup(team, index, archive);
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
            dialog.focus();
        };

        modal.addEventListener('click', event => {
            if (event.target === modal || event.target.closest('[data-team-close]')) close();
        });
        document.addEventListener('keydown', event => {
            if (event.key === 'Escape' && !modal.hidden) close();
        });

        let archive = {};
        fetch(DATA_URL).then(response => response.json()).then(data => {
            archive = data;
            const teams = (data.teams || []).slice().sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
            if (!teams.length) return;
            const render = () => { body.innerHTML = teams.map(row).join(''); };
            render();
            window.addEventListener('site-language-change', () => setTimeout(render, 0));

            body.addEventListener('click', event => {
                const target = event.target.closest('[data-team-row]');
                if (!target) return;
                const index = teams.findIndex(team => team.id === target.dataset.teamRow);
                if (index >= 0) open(teams[index], index, target);
            });
            body.addEventListener('keydown', event => {
                if (event.key !== 'Enter' && event.key !== ' ') return;
                const target = event.target.closest('[data-team-row]');
                if (!target) return;
                event.preventDefault();
                const index = teams.findIndex(team => team.id === target.dataset.teamRow);
                if (index >= 0) open(teams[index], index, target);
            });
        }).catch(error => console.warn('Archived scoreboard unavailable; static rows retained.', error));
    });
})();
