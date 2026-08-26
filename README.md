# ACM CTF 3.0

Official static website for ACM CTF 3.0 at Prince Sultan University — workshops, competition information, challenges, rules, FAQ, team, and scoreboard.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deployment

Pushes to `main` deploy automatically through `.github/workflows/pages.yml`. The workflow also includes `workflow_dispatch`, so the **Actions → Deploy static site to GitHub Pages → Run workflow** button works for manual deployments. In the GitHub repository settings, set **Pages → Source** to **GitHub Actions**. The custom domain is declared in `CNAME` as `ctf-psu.shoug-tech.com`.

## Before launch

Replace provisional dates, registration links, team names, and official rule details once confirmed. The current scoreboard and team dashboard are front-end previews and need a competition backend for live data and authentication.

## Team administration and CTFd

- `teams.html` lists all non-rejected teams; `team.html?team=TEAM_ID` opens one team dossier.
- `admin.html` manages the browser's local team workspace. Export `teams.json` and commit it to `data/teams.json` to publish changes.
- GitHub Pages cannot securely protect an admin password or write registrations to the repository. Use CTFd or a server-side endpoint for production registration.
- Enable the future leaderboard in `data/ctfd.json`. It reads CTFd's `/api/v1/scoreboard`; never put a CTFd token in public JavaScript. Challenge flags are not a leaderboard data source.
