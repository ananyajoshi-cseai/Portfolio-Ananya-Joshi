# ⚡ Ananya Joshi | Portfolio

Welcome to the repository of my personal portfolio website! 

This space documents my journey as a first-year B.Tech CSE (AI) student at IGDTUW. It acts as a living resume showcasing my hackathon wins, research internships, open-source contributions, deployed AI projects, and technical growth.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View_Website-00FFFF?style=for-the-badge)](https://portfolio-ananya-joshi.vercel.app)
---

## Repository layout and deployment

```text
src/             Website HTML, CSS, and JavaScript
certificates/    Certificates, badges, and acceptance proofs (original filenames)
assets/          Profile image
screenshots/     README preview images
scripts/         Static build and link checks
dist/            Generated website (ignored by Git)
```

Edit `src/index.html`, `src/styles.css`, and `src/script.js`. Add credentials to
`certificates/` and link to them as `certificates/Original Filename.pdf` in the HTML.
Keep the original filename, extension, and letter case. Asset URLs are relative to
the built homepage, so preview `dist/` after building rather than opening `src/`.

With Node.js installed, run:

```sh
npm run build
npm run check
```

There are no package dependencies to install. Serve `dist/` with any static web
server, or open `dist/index.html` for a quick preview.

Vercel uses the repository root as its project Root Directory. The committed
`vercel.json` selects the static-site preset, runs `npm run build`, and publishes
`dist/`. The homepage remains at `/`; no redirect to `/src/` is required. These
build and output settings override the corresponding dashboard settings. For
other static hosts, run the same build and publish `dist/`.

The build also includes root-level copies of the certificate files and profile
image so previously shared URLs continue working. Edit only their canonical
files in `certificates/` and `assets/`; these compatibility copies are generated.
Screenshots stay at their existing paths for README and deployed image links.

## Automatic GitHub and LeetCode updates

The **Profile stats** GitHub Actions workflow refreshes both profiles daily at
**08:47 IST (03:17 UTC)**. It starts after this workflow is merged into `main`.
For an immediate refresh, open **Actions → Profile stats → Run workflow** on `main`.
GitHub may delay scheduled runs and disables schedules in public repositories
after 60 days without repository activity; re-enable the workflow if necessary.

The scheduled job is authorized to commit **only `src/data/profile-stats.json`**
to `main`. Website code changes still go through pull requests. It uses GitHub's
automatically supplied `GITHUB_TOKEN`, so no personal token or LeetCode password
is needed. Repository policies must permit this workflow to update that file;
if branch protection blocks the push, the run fails without bypassing protection.

The build renders the saved snapshot into the page. On each visit, the browser
also checks the public snapshot on GitHub, allowing daily updates to appear
without relying on a Vercel rebuild. No token is sent to visitors. Each provider
has its own last-successful-update date. If a service is unavailable, rate limited,
or returns incomplete data, its previous values and date remain visible; the
other service can still update. A partial failure marks the Actions run failed
after saving any successful provider, so it is visible in Actions.

GitHub commits, contributed repositories, total contributions and streaks use
the last year's contribution calendar; "Committed to" counts repositories with
commits. PRs, merged PRs and issues are lifetime counts visible to the workflow.
Stars are summed across all pages of owned public, non-fork repositories. A day
still in progress does not break yesterday's current streak. Private contribution
visibility follows GitHub's profile settings and API permissions.

LeetCode solved counts are unique accepted problems by difficulty; submissions
are attempts in the profile's default past-year calendar, not solved problems.
Contest rating, rank badge, percentile, badges, streak and active days come from
LeetCode's profile query. This endpoint is not a guaranteed public API and may
change or rate limit; the saved-data fallback handles failures.

To validate locally with Node.js 24, run `npm run build` and `npm run check`.
`npm run update-stats -- --provider=leetcode` refreshes only LeetCode.
`npm run update-stats` refreshes both when `GITHUB_TOKEN` is available in the
environment. Add `-- --check` to fetch/validate without writing. Unit tests cover
partial failures, invalid data, zero values, pagination, streak boundaries and
rendered stats. Pull requests also check the live queries without publishing.

## 📸 Preview images

Here is a glimpse of the portfolio interface:

<div align="center">
  <img src="screenshots/portfolio 1.jpg" alt="Hero Section" width="800"/>
  <br/><br/>
  <img src="screenshots/portfolio 2.jpg" alt="Developer Profiles & Stats" width="800"/>
  <br/><br/>
  <img src="screenshots/portfolio 3.jpg" alt="Hackathon Timeline" width="800"/>
  <br/><br/>
  <img src="screenshots/portfolio 4.jpg" alt="Projects & Certifications" width="800"/>
</div>

---

## 🚀 Features & Aesthetics

I designed this portfolio to have a high-tech, futuristic, and "cybernetic" aesthetic using deep dark modes, neon blue/cyan accents, and glassmorphism:

*   **Interactive Particle Canvas:** A dynamic, physics-based network background built from scratch using the HTML5 Canvas API to represent neural networks and nodes
*   **Custom Cursor:** A trailing neon cursor that reacts and expands when hovering over interactive elements.
*   **Glassmorphism UI:** Semi-transparent, blurred backdrop panels (`backdrop-filter`) that give a modern, sleek depth to the content.
*   **Animated Marquee:** A smooth, infinitely scrolling display of my 20+ certifications.
*   **Responsive Design:** Fully fluid layout utilizing CSS Grid and Flexbox, ensuring perfect viewing on desktops, tablets, and mobile devices.

---

## 🛠️ Tech Stack

This project was intentionally built without heavy frontend frameworks to maximize performance, practice core web APIs, and maintain complete control over the DOM.

*   **HTML5:** Semantic structure and accessibility.
*   **CSS3:** Advanced styling, CSS Variables, Keyframe Animations, Flexbox, CSS Grid, and custom scrollbars/selections.
*   **Vanilla JavaScript (ES6+):** 
    *   Canvas API rendering for the background.
    *   Intersection Observer API for scroll-reveal animations and stat counters.
    *   Custom typing text logic.
    *   DOM manipulation for the interactive cursor.

---

## 📂 Sections Included

1.  **Hero:** Animated typing text, gradient titles, and quick links.
2.  **Stats Dashboard:** Live counters reflecting my LeetCode progress, data points processed, and hackathon ranks.
3.  **About Me & Education:** Highlighting my CGPA (9.14) and academic focus at IGDTUW.
4.  **Technical Arsenal:** Categorized skills (Python, Generative AI, NLP, React, FastAPI, TigerGraph).
5.  **Developer Profiles:** Deep dives into my LeetCode (Knight), GitHub (GSSoC), and Kaggle stats.
6.  **Experience:** Detailing my ML & GenAI Internship at Anveshan Foundation, testing role at PRAM Edu, and open-source contributions.
7.  **Hackathon Journey:** A vertical timeline of my competitive building (NIT Delhi, Devcation/TigerGraph, Vihaan 9.0).
8.  **Deployed Impact (Work):** A grid of my top projects including Asar AI, Hydro-Carbon AI, HealthHack 2.0, CipherInk, and After-Feel.
9.  **Workshops & Certifications:** Documenting my continuous learning, such as the NS2ML-DE 2026 PINNs Workshop at IIT Ropar.

---

## 🤝 Collaborations & Open Source

A huge part of my journey involves building alongside amazing people. Special thanks to [Utkarsh Bharadwaj](https://utkarshbharadwaj.github.io/) for collaborating with me on **CipherInk** and **Hydro-Carbon AI**.

I actively contribute to the **GirlScript Summer of Code (GSSoC 2026)** in the AI Agents track. Feel free to check out my GitHub activity.

---

## 📬 Let's Connect

I'm currently exploring Research & Development, advanced Neural Networks (PINNs), and scalable backend architectures. I'm always open to new hackathon teams, open-source collaborations, or a chat about AI!

*   **LinkedIn:** [Ananya Joshi](https://www.linkedin.com/in/ananya-joshi-cseai/)
*   **GitHub:** [@ananyajoshi-cseai](https://github.com/ananyajoshi-cseai)
*   **LeetCode:** [ananyajoshi-cseai](https://leetcode.com/u/ananyajoshi-cseai/)
*   **Email:** ananyajoshi.cseai@gmail.com
