# Awesome-Multimodal-Models-Attacks-Defenses

An academic GitHub Pages website for curated multimodal attack, defense, evaluation, and survey papers.

This project is still under active development. We welcome collaboration, feedback, and issue reports.

Website: https://summu77.github.io/Awesome-Multimodal-Models-Attacks-Defenses/

## Website structure

The site is published from `docs/` and is intentionally lightweight:

- `docs/index.html`: homepage
- `docs/attacks.html`: attack papers
- `docs/defenses.html`: defense papers
- `docs/evaluations.html`: benchmarks and evaluation papers
- `docs/analysis.html`: analysis papers
- `docs/surveys.html`: surveys and meta studies
- `docs/assets/js/index.js`: homepage metrics and yearly share view
- `docs/assets/js/attacks.js`: grouped renderer for the attack page
- `docs/assets/js/defenses.js`: grouped renderer for the defense page
- `docs/assets/css/main.css`: shared styling
- `docs/assets/js/listing.js`: reusable section page renderer
- `docs/assets/js/data/*.js`: modular paper data files

Attack papers are further split into four subcategories:

- `docs/assets/js/data/attacks/adversarial.js`
- `docs/assets/js/data/attacks/jailbreak.js`
- `docs/assets/js/data/attacks/backdoor.js`
- `docs/assets/js/data/attacks/other.js`

Defense papers are further split into four subcategories:

- `docs/assets/js/data/defenses/adversarial.js`
- `docs/assets/js/data/defenses/jailbreak.js`
- `docs/assets/js/data/defenses/backdoor.js`
- `docs/assets/js/data/defenses/other.js`

## Paper schema

Each paper entry uses six fields:

```js
{
  title: "Paper title",
  institutions: ["Institution A", "Institution B"],
  publication: "Conference / Journal / arXiv + year",
  publishedAt: "YYYY-MM or YYYY-MM-DD",
  Tag: ["Tag A", "Tag B"],
  link: "https://..."
}
```

Every page reads paper cards from these standalone data files. The page templates do not store paper content directly.
`Tag` is optional in practice and may be an empty array `[]`; the site hides empty tags automatically.
For compatibility, the site also accepts a single `institution` string, but `institutions` is the preferred format for new entries.

## Add new papers

1. Open the matching data file in `docs/assets/js/data/`.
2. Add a new object to the exported array.
3. Set `publishedAt` so the site can sort papers by time.
4. Commit and push to GitHub.

## Deploy with GitHub Pages

1. Go to the repository settings on GitHub.
2. Open `Pages`.
3. Set the source to `Deploy from a branch`.
4. Choose the default branch and the `/docs` folder.
5. Save the settings.

## Local preview

From the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/docs/`.
