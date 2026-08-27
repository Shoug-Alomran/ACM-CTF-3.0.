(async () => {
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);

  try {
    const config = await fetch('data/ctfd.json').then(response => response.json());
    if (!config.enabled || !config.baseUrl) return;

    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/api/v1/scoreboard`, {
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const payload = await response.json();
    const rows = Array.isArray(payload.data) ? payload.data : [];
    const body = document.querySelector('main table tbody');
    if (!body || !rows.length) return;

    body.innerHTML = rows.map(entry => {
      const publicName = escapeHtml(entry.account_name);
      return `<tr class="hover:bg-cyber-cyan/5"><td class="px-3 sm:px-6 py-5 text-xl font-mono">${String(entry.pos ?? '--').padStart(2, '0')}</td><td class="px-3 sm:px-6 py-5"><span class="text-white font-bold">${publicName}</span><div class="text-[10px] text-slate-500 font-mono">CTFd // VERIFIED</div></td><td class="px-3 sm:px-6 py-5"><span class="text-cyber-green border border-cyber-green/30 px-2 py-1 font-mono text-xs">LIVE</span></td><td class="px-3 sm:px-6 py-5 text-right text-cyber-green text-xl font-mono font-bold">${Number(entry.score || 0).toLocaleString()}</td></tr>`;
    }).join('');
  } catch (error) {
    console.warn('CTFd sync unavailable; archived scoreboard retained.', error);
  }
})();
