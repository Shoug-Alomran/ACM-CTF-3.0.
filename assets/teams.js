/* Team roster source.
 *
 * data/teams.json is the only roster the public site shows. localStorage is a
 * local-only scratchpad for admin.html, never a registration record: real
 * registrations live in the ctf30 tab of the ACM PSU Club Records workbook and
 * are published here by an organizer committing data/teams.json.
 */
const TEAM_KEY = 'acm-ctf-teams-draft-v3';

async function loadTeams() {
  const response = await fetch('data/teams.json');
  return response.ok ? response.json() : [];
}

/* Admin-only: the locally edited draft, falling back to what is published. */
async function loadDraftTeams() {
  const local = localStorage.getItem(TEAM_KEY);
  if (local) {
    try { return JSON.parse(local); } catch { /* fall through to published data */ }
  }
  return loadTeams();
}

function saveTeams(teams) { localStorage.setItem(TEAM_KEY, JSON.stringify(teams)); }

function teamId(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `team-${Date.now()}`;
}

/* Retire the old preview store so a stale browser cannot show a "registered"
 * team that was only ever saved locally. */
try { localStorage.removeItem('acm-ctf-teams-v2'); } catch { /* ignore */ }

window.TeamStore = { loadTeams, loadDraftTeams, saveTeams, teamId, key: TEAM_KEY };
