# ACM CTF 3.0

Official static website for ACM CTF 3.0 at Prince Sultan University — workshops, competition information, challenges, rules, FAQ, team, and scoreboard.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Deployment

Pushes to `main` deploy automatically through `.github/workflows/pages.yml`. In the GitHub repository settings, set **Pages → Source** to **GitHub Actions**. The custom domain is declared in `CNAME` as `ctf-psu.shoug-tech.com`.

## Before launch

Replace provisional dates, registration links, team names, and official rule details once confirmed. The current scoreboard and team dashboard are front-end previews and need a competition backend for live data and authentication.
