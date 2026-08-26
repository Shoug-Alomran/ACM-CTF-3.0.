const TEAM_KEY = 'acm-ctf-teams-v2';
async function loadTeams(){
  const local=localStorage.getItem(TEAM_KEY);
  if(local){try{return JSON.parse(local)}catch{}}
  const response=await fetch('data/teams.json');
  return response.ok?response.json():[];
}
function saveTeams(teams){localStorage.setItem(TEAM_KEY,JSON.stringify(teams));}
function teamId(name){return name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'')||`team-${Date.now()}`;}
window.TeamStore={loadTeams,saveTeams,teamId,key:TEAM_KEY};
