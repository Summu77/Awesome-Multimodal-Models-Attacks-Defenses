import { allPapers, collections } from "./data/all-papers.js";
import { orderedSections, sectionMeta } from "./data/sections.js";
import { renderShell } from "./modules/site-shell.js";
import { createPaperCard, sortPapers } from "./modules/ui.js";

renderShell(document.body.dataset.page);

const heroStats = document.querySelector("#hero-stats");
const sectionGrid = document.querySelector("#section-grid");
const featuredGrid = document.querySelector("#featured-grid");

if (heroStats) {
  const stats = [
    { label: "Total papers", value: allPapers.length },
    {
      label: "Attack papers",
      value: collections.attacks.length
    },
    {
      label: "Defense papers",
      value: collections.defenses.length
    },
    {
      label: "Evaluation papers",
      value: collections.evaluations.length
    },
    {
      label: "Analysis papers",
      value: collections.analysis.length
    },
    {
      label: "Survey papers",
      value: collections.surveys.length
    }
  ];

  heroStats.innerHTML = stats
    .map(
      (stat) => `
        <article class="stat-card">
          <span class="stat-value">${stat.value}</span>
          <span class="stat-label">${stat.label}</span>
        </article>
      `
    )
    .join("");
}

if (sectionGrid) {
  sectionGrid.innerHTML = orderedSections
    .filter((key) => key !== "surveys")
    .map((key) => {
      const meta = sectionMeta[key];
      return `
        <article class="section-card">
          <div class="section-card-top">
            <div>
              <p class="section-kicker">${meta.eyebrow}</p>
              <h3>${meta.title}</h3>
            </div>
            <span class="section-count">${collections[key].length}</span>
          </div>
          <p>${meta.description}</p>
          <a class="text-link" href="./${meta.page}">Open section</a>
        </article>
      `;
    })
    .join("");
}

if (featuredGrid) {
  featuredGrid.innerHTML = sortPapers(allPapers, "newest")
    .slice(0, 10)
    .map((paper) => createPaperCard(paper, sectionMeta[paper.section].title))
    .join("");
}
