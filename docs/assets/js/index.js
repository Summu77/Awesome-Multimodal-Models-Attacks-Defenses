import { allPapers, collections } from "./data/all-papers.js";
import { orderedSections, sectionMeta } from "./data/sections.js";
import { renderShell } from "./modules/site-shell.js";
import { createPaperCard, papersByYear, sortPapers } from "./modules/ui.js";

renderShell(document.body.dataset.page);

const heroStats = document.querySelector("#hero-stats");
const sectionGrid = document.querySelector("#section-grid");
const featuredGrid = document.querySelector("#featured-grid");
const yearShareGrid = document.querySelector("#year-share-grid");
const yearShareNote = document.querySelector("#year-share-note");

if (heroStats) {
  const stats = [
    { label: "Total papers", value: allPapers.length },
    { label: "Research sections", value: orderedSections.length },
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
    .slice(0, 6)
    .map((paper) => createPaperCard(paper, sectionMeta[paper.section].title))
    .join("");
}

if (yearShareGrid && yearShareNote) {
  const targetYear = 2026;
  const yearlyCounts = orderedSections.map((key) => {
    const count = papersByYear(collections[key], targetYear).length;
    return {
      key,
      label: sectionMeta[key].title,
      count
    };
  });

  const total = yearlyCounts.reduce((sum, item) => sum + item.count, 0);

  yearShareNote.textContent =
    total > 0
      ? `${total} paper${total === 1 ? "" : "s"} currently tagged in ${targetYear}.`
      : `No ${targetYear} papers have been added yet. Add items with publishedAt starting with "${targetYear}" to populate this view.`;

  yearShareGrid.innerHTML = yearlyCounts
    .map((item) => {
      const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
      return `
        <article class="year-share-card">
          <div class="section-card-top">
            <div>
              <p class="section-kicker">${targetYear} Share</p>
              <h3>${item.label}</h3>
            </div>
            <span class="section-count">${percentage}%</span>
          </div>
          <p>${item.count} paper${item.count === 1 ? "" : "s"}</p>
          <div class="share-bar" aria-hidden="true">
            <span class="share-bar-fill" style="width: ${percentage}%"></span>
          </div>
        </article>
      `;
    })
    .join("");
}
