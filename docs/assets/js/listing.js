import { collections } from "./data/all-papers.js";
import { sectionMeta } from "./data/sections.js";
import { renderShell } from "./modules/site-shell.js";
import {
  applyTimeMode,
  filterPapers,
  initExpandablePaperGroups,
  isPreprintPaper,
  renderExpandableBuckets,
  uniqueTags,
  uniquePublications,
  uniqueYears
} from "./modules/ui.js";

const page = document.body.dataset.page;
const section = document.body.dataset.section;
const meta = sectionMeta[section];
const papers = collections[section] || [];

renderShell(page);
initExpandablePaperGroups();

document.querySelector("#page-eyebrow").textContent = meta.eyebrow;
document.querySelector("#page-title").textContent = meta.title;
document.querySelector("#page-description").remove();

const publicationFilter = document.querySelector("#publication-filter");
const tagFilter = document.querySelector("#tag-filter");
const sortFilter = document.querySelector("#sort-filter");
const viewToggle = document.querySelector("#view-toggle");
const searchInput = document.querySelector("#search-input");
const paperGrid = document.querySelector("#paper-grid");
const emptyState = document.querySelector("#empty-state");
const viewStorageKey = `paper-view:${section}`;
let viewMode = localStorage.getItem(viewStorageKey) || "cards";

paperGrid.classList.remove("paper-grid");
paperGrid.classList.add("paper-bucket-stack");

syncViewToggle();

publicationFilter.innerHTML += uniquePublications(papers)
  .map((publication) => `<option value="${publication}">${publication}</option>`)
  .join("");

tagFilter.innerHTML += uniqueTags(papers)
  .map((tag) => `<option value="${tag}">${tag}</option>`)
  .join("");

sortFilter.innerHTML += uniqueYears(papers)
  .map((year) => `<option value="${year}">${year}</option>`)
  .join("");

function renderList() {
  const filtered = filterPapers(
    papers,
    searchInput.value,
    publicationFilter.value,
    tagFilter.value
  );
  const sorted = applyTimeMode(filtered, sortFilter.value);

  paperGrid.innerHTML = renderPaperBuckets(sorted, viewMode);
  paperGrid.dataset.viewMode = viewMode;

  emptyState.classList.toggle("hidden", sorted.length > 0);
}

function renderPaperBuckets(items, viewMode) {
  const accepted = items.filter((paper) => !isPreprintPaper(paper));
  const preprints = items.filter((paper) => isPreprintPaper(paper));
  const buckets = [
    {
      title: "Accepted Papers",
      papers: accepted
    },
    {
      title: "Preprints",
      papers: preprints
    }
  ];

  return renderExpandableBuckets(buckets, { limit: 10, viewMode });
}

function toggleViewMode() {
  viewMode = viewMode === "cards" ? "table" : "cards";
  localStorage.setItem(viewStorageKey, viewMode);
  syncViewToggle();
  renderList();
}

function syncViewToggle() {
  const currentLabel = viewMode === "cards" ? "Cards" : "Table";
  const nextLabel = viewMode === "cards" ? "Table" : "Cards";
  viewToggle.innerHTML = `
    <span class="view-toggle-kicker">Current view</span>
    <span class="view-toggle-mode">${currentLabel}</span>
    <span class="view-toggle-hint">Switch to ${nextLabel} view</span>
  `;
  viewToggle.setAttribute("aria-pressed", String(viewMode === "table"));
  viewToggle.dataset.viewMode = viewMode;
  viewToggle.dataset.nextView = nextLabel.toLowerCase();
  viewToggle.setAttribute(
    "aria-label",
    viewMode === "cards" ? "Switch to table view" : "Switch to card view"
  );
}

searchInput.addEventListener("input", renderList);
publicationFilter.addEventListener("change", renderList);
tagFilter.addEventListener("change", renderList);
sortFilter.addEventListener("change", renderList);
viewToggle.addEventListener("click", toggleViewMode);
renderList();
