import { defenseGroups } from "./data/defenses.js";
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
const meta = sectionMeta.defenses;

renderShell(page);
initExpandablePaperGroups();

document.querySelector("#page-eyebrow").textContent = meta.eyebrow;
document.querySelector("#page-title").textContent = meta.title;
document.querySelector("#page-description").remove();

const viewToggle = document.querySelector("#view-toggle");
const categoryNav = document.querySelector("#defense-category-nav");
const defenseSections = document.querySelector("#defense-sections");
const emptyState = document.querySelector("#empty-state");
const viewStorageKey = "paper-view:defenses";
let viewMode = localStorage.getItem(viewStorageKey) || "cards";

const filterState = Object.fromEntries(
  defenseGroups.map((group) => [
    group.key,
    {
      search: "",
      publication: "",
      tag: "",
      sort: "newest"
    }
  ])
);

syncViewToggle();
renderPage();

defenseSections.addEventListener("input", (event) => {
  handleFilterEvent(event);
});

defenseSections.addEventListener("change", (event) => {
  handleFilterEvent(event);
});

viewToggle.addEventListener("click", () => {
  viewMode = viewMode === "cards" ? "table" : "cards";
  localStorage.setItem(viewStorageKey, viewMode);
  syncViewToggle();
  renderPage();
});

function renderPage() {
  defenseSections.dataset.viewMode = viewMode;
  const filteredGroups = defenseGroups.map((group) => filterGroup(group));

  renderCategoryNav(filteredGroups);
  defenseSections.innerHTML = filteredGroups.map((group) => renderGroupSection(group)).join("");

  const total = filteredGroups.reduce((sum, group) => sum + group.filteredPapers.length, 0);
  emptyState.classList.toggle("hidden", total > 0);
}

function renderCategoryNav(filteredGroups) {
  categoryNav.innerHTML = filteredGroups
    .map(
      (group) => `
        <div class="inline-nav-item">
          <a class="inline-nav-link" href="#category-${group.key}">${group.title}</a>
          <span class="section-count">${group.filteredPapers.length}</span>
        </div>
      `
    )
    .join("");
}

function renderGroupSection(group) {
  const filters = filterState[group.key];

  return `
    <section class="subsection-block" id="category-${group.key}">
      <div class="section-heading">
        <div>
          <p class="eyebrow">Defense Subtype</p>
          <h2>${group.title}</h2>
        </div>
        <p class="section-note">
          <span class="grouping-note">Grouping rule: publications starting with "arXiv" are treated as preprints.</span>
        </p>
      </div>
      <div class="filter-shell subtype-filter-shell" data-group-key="${group.key}">
        <div class="filter-field">
          <label for="search-${group.key}">Search papers</label>
          <input
            id="search-${group.key}"
            data-filter="search"
            type="search"
            value="${escapeHtml(filters.search)}"
            placeholder="Search by title, institution, publication, or tag"
          />
        </div>
        <div class="filter-field">
          <label for="publication-${group.key}">Publication</label>
          <select id="publication-${group.key}" data-filter="publication">
            <option value="">All publications</option>
            ${uniquePublications(group.papers)
              .map(
                (publication) => `
                  <option value="${escapeHtml(publication)}" ${filters.publication === publication ? "selected" : ""}>
                    ${publication}
                  </option>
                `
              )
              .join("")}
          </select>
        </div>
        <div class="filter-field">
          <label for="tag-${group.key}">Tag</label>
          <select id="tag-${group.key}" data-filter="tag">
            <option value="">All tags</option>
            ${uniqueTags(group.papers)
              .map(
                (tag) => `
                  <option value="${escapeHtml(tag)}" ${filters.tag === tag ? "selected" : ""}>
                    ${tag}
                  </option>
                `
              )
              .join("")}
          </select>
        </div>
        <div class="filter-field">
          <label for="sort-${group.key}">Sort by time</label>
          <select id="sort-${group.key}" data-filter="sort">
            <option value="newest" ${filters.sort === "newest" ? "selected" : ""}>Newest first</option>
            <option value="oldest" ${filters.sort === "oldest" ? "selected" : ""}>Oldest first</option>
            ${uniqueYears(group.papers)
              .map(
                (year) => `
                  <option value="${year}" ${filters.sort === year ? "selected" : ""}>${year}</option>
                `
              )
              .join("")}
          </select>
        </div>
      </div>
      ${renderPaperBuckets(group)}
      <div class="empty-state ${group.filteredPapers.length > 0 ? "hidden" : ""}">
        No papers match the current filters in this subtype.
      </div>
    </section>
  `;
}

function renderPaperBuckets(group) {
  const accepted = group.filteredPapers.filter((paper) => !isPreprintPaper(paper));
  const preprints = group.filteredPapers.filter((paper) => isPreprintPaper(paper));
  const buckets = [
    { title: "Accepted Papers", papers: accepted },
    { title: "Preprints", papers: preprints }
  ];

  return renderExpandableBuckets(buckets, {
    sectionLabel: group.shortTitle,
    limit: 10,
    viewMode
  });
}

function filterGroup(group) {
  const filters = filterState[group.key];

  return {
    ...group,
    filteredPapers: applyTimeMode(
      filterPapers(group.papers, filters.search, filters.publication, filters.tag),
      filters.sort
    )
  };
}

function handleFilterEvent(event) {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) {
    return;
  }

  const filterName = target.dataset.filter;
  const container = target.closest("[data-group-key]");
  const groupKey = container?.dataset.groupKey;

  if (!filterName || !groupKey || !filterState[groupKey]) {
    return;
  }

  filterState[groupKey][filterName] = target.value;
  const restore = getRestorePoint(target, groupKey, filterName);
  renderPage();
  restoreFocus(restore);
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

function getRestorePoint(target, groupKey, filterName) {
  return {
    selector: `[data-group-key="${groupKey}"] [data-filter="${filterName}"]`,
    start: target instanceof HTMLInputElement ? target.selectionStart : null,
    end: target instanceof HTMLInputElement ? target.selectionEnd : null
  };
}

function restoreFocus(restore) {
  const nextTarget = document.querySelector(restore.selector);
  if (!(nextTarget instanceof HTMLInputElement || nextTarget instanceof HTMLSelectElement)) {
    return;
  }

  nextTarget.focus();

  if (nextTarget instanceof HTMLInputElement && restore.start !== null && restore.end !== null) {
    nextTarget.setSelectionRange(restore.start, restore.end);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
