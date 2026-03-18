export function createPaperCard(paper, sectionLabel = "", extraClassName = "") {
  const badge = sectionLabel
    ? `<span class="paper-badge">${sectionLabel}</span>`
    : `<span class="paper-badge">Paper</span>`;
  const cardClassName = ["paper-card", extraClassName].filter(Boolean).join(" ");
  const institutions = getInstitutions(paper);
  const tags = getTags(paper);
  const institutionLabel = institutions.length > 1 ? "Institutions" : "Institution";
  const tagBlock = tags.length
    ? `
        <div class="paper-tag-group">
          <span class="paper-tag-label">Tags</span>
          <div class="paper-tags">
            ${tags.map((tag) => `<span class="paper-tag">${tag}</span>`).join("")}
          </div>
        </div>
      `
    : "";

  return `
    <article class="${cardClassName}">
      <div class="paper-card-top">
        ${badge}
        <span class="paper-publication">${paper.publication}</span>
      </div>
      <div class="paper-front-copy">
        <h3 class="paper-title">${paper.title}</h3>
        <p class="paper-institution"><strong>${institutionLabel}:</strong> ${institutions.join("; ")}</p>
        <p class="paper-meta"><strong>Published:</strong> ${formatPublishedAt(paper.publishedAt)}</p>
        ${tagBlock}
      </div>
      <div class="paper-actions">
        <a class="paper-link paper-button" href="${paper.link}" target="_blank" rel="noreferrer">
          Open paper
        </a>
      </div>
    </article>
  `;
}

export function createPaperTable(papers, sectionLabel = "") {
  if (papers.length === 0) {
    return "";
  }

  const showTags = papers.some((paper) => getTags(paper).length > 0);

  return `
    <div class="paper-table-shell">
      <table class="paper-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Institutions</th>
            <th>Published</th>
            <th>Publication</th>
            ${showTags ? "<th>Tags</th>" : ""}
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          ${papers
            .map((paper) => createPaperTableRow(paper, sectionLabel, "", { showTags }))
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function initExpandablePaperGroups() {
  if (document.body.dataset.expandablePaperGroupsBound === "true") {
    return;
  }

  document.body.dataset.expandablePaperGroupsBound = "true";

  document.addEventListener("click", (event) => {
    const toggle = event.target.closest('[data-action="toggle-paper-group"]');

    if (!toggle) {
      return;
    }

    const group = toggle.closest(".expandable-paper-group");

    if (!group) {
      return;
    }

    const expanded = group.classList.toggle("expanded");
    toggle.textContent = expanded ? toggle.dataset.lessLabel : toggle.dataset.moreLabel;
  });
}

export function isPreprintPaper(paper) {
  return String(paper.publication || "").trim().toLowerCase().startsWith("arxiv");
}

export function renderExpandableBuckets(buckets, options = {}) {
  const { sectionLabel = "", limit = 10, viewMode = "cards" } = options;
  const nonEmptyBuckets = buckets.filter((bucket) => bucket.papers.length > 0);
  const total = nonEmptyBuckets.reduce((sum, bucket) => sum + bucket.papers.length, 0);
  let remainingVisible = total > limit ? limit : Number.POSITIVE_INFINITY;

  const sections = nonEmptyBuckets
    .map((bucket) => {
      const visibleCount = Math.min(bucket.papers.length, remainingVisible);
      const hiddenCount = bucket.papers.length - visibleCount;
      const visiblePapers = bucket.papers.slice(0, visibleCount);
      const hiddenPapers = bucket.papers.slice(visibleCount);

      remainingVisible = Math.max(remainingVisible - visibleCount, 0);

      const bucketClass =
        visiblePapers.length === 0 && hiddenPapers.length > 0
          ? "paper-bucket bucket-hidden-until-expand"
          : "paper-bucket";
      const content =
        viewMode === "table"
          ? renderTableBucketContent(visiblePapers, hiddenPapers, sectionLabel)
          : renderCardBucketContent(visiblePapers, hiddenPapers, sectionLabel);

      return `
        <section class="${bucketClass}">
          <div class="paper-bucket-head">
            <h3>${bucket.title}</h3>
            <span class="section-count">${bucket.papers.length}</span>
          </div>
          ${content}
        </section>
      `;
    })
    .join("");

  const toggle =
    total > limit
      ? `
          <div class="paper-expand-actions">
            <button
              class="paper-expand-toggle"
              type="button"
              data-action="toggle-paper-group"
              data-more-label="Show more (${total - limit})"
              data-less-label="Show less"
            >
              Show more (${total - limit})
            </button>
          </div>
        `
      : "";

  return `<div class="expandable-paper-group">${sections}${toggle}</div>`;
}

export function formatPublishedAt(value) {
  if (!value) {
    return "Unknown";
  }

  const [year, month = "01", day = "01"] = value.split("-");
  const date = new Date(`${year}-${month}-${day}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (value.split("-").length === 2) {
    return new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "short"
    }).format(date);
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function sortPapers(items, sortMode = "newest") {
  const sorted = [...items];

  sorted.sort((left, right) => {
    const leftTime = parsePublishedAt(left.publishedAt);
    const rightTime = parsePublishedAt(right.publishedAt);
    return sortMode === "oldest" ? leftTime - rightTime : rightTime - leftTime;
  });

  return sorted;
}

export function uniqueYears(items) {
  return [...new Set(items.map((item) => extractPublishedYear(item.publishedAt)).filter(Boolean))]
    .sort((left, right) => Number(right) - Number(left));
}

export function applyTimeMode(items, timeMode = "newest") {
  if (timeMode === "oldest" || timeMode === "newest") {
    return sortPapers(items, timeMode);
  }

  if (/^\d{4}$/.test(timeMode)) {
    return sortPapers(
      items.filter((paper) => extractPublishedYear(paper.publishedAt) === timeMode),
      "newest"
    );
  }

  return sortPapers(items, "newest");
}

export function papersByYear(items, year) {
  return items.filter((paper) => String(paper.publishedAt || "").startsWith(String(year)));
}

export function uniquePublications(items) {
  return [...new Set(items.map((item) => publicationCategory(item.publication)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}

export function uniqueTags(items) {
  return [...new Set(items.flatMap((item) => getTags(item)).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
}

export function filterPapers(items, searchText, publication, tag = "") {
  const query = searchText.trim().toLowerCase();

  return items.filter((paper) => {
    const matchesPublication = publication
      ? publicationCategory(paper.publication) === publication
      : true;
    const matchesTag = tag ? getTags(paper).includes(tag) : true;
    const institutionText = getInstitutions(paper).join(" ");
    const tagText = getTags(paper).join(" ");
    const haystack = [
      paper.title,
      institutionText,
      tagText,
      paper.publication,
      paper.publishedAt
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = query ? haystack.includes(query) : true;
    return matchesPublication && matchesTag && matchesQuery;
  });
}

function parsePublishedAt(value) {
  if (!value) {
    return 0;
  }

  const [year, month = "01", day = "01"] = value.split("-");
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function extractPublishedYear(value) {
  const year = String(value || "").trim().slice(0, 4);
  return /^\d{4}$/.test(year) ? year : "";
}

function publicationCategory(value) {
  const raw = String(value || "").trim();

  if (!raw) {
    return "";
  }

  return raw
    .replace(/\b(19|20)\d{2}\b/g, "")
    .replace(/[\s/,-]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function getInstitutions(paper) {
  if (Array.isArray(paper.institutions)) {
    return paper.institutions.filter(Boolean);
  }

  if (Array.isArray(paper.institution)) {
    return paper.institution.filter(Boolean);
  }

  if (typeof paper.institutions === "string" && paper.institutions.trim()) {
    return [paper.institutions.trim()];
  }

  if (typeof paper.institution === "string" && paper.institution.trim()) {
    return [paper.institution.trim()];
  }

  return ["Unknown"];
}

function getTags(paper) {
  if (Array.isArray(paper.Tag)) {
    return paper.Tag.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  if (Array.isArray(paper.tag)) {
    return paper.tag.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  if (Array.isArray(paper.tags)) {
    return paper.tags.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof paper.Tag === "string" && paper.Tag.trim()) {
    return [paper.Tag.trim()];
  }

  if (typeof paper.tag === "string" && paper.tag.trim()) {
    return [paper.tag.trim()];
  }

  if (typeof paper.tags === "string" && paper.tags.trim()) {
    return [paper.tags.trim()];
  }

  return [];
}

function createPaperTableRow(paper, sectionLabel = "", extraClassName = "", options = {}) {
  const institutions = getInstitutions(paper);
  const tags = getTags(paper);
  const { showTags = false } = options;
  const rowClassName = ["paper-row", extraClassName].filter(Boolean).join(" ");
  const tagCell = showTags
    ? `
        <td class="paper-table-tags">
          ${tags.length ? tags.map((tag) => `<span class="paper-tag table-tag">${tag}</span>`).join("") : ""}
        </td>
      `
    : "";

  return `
    <tr class="${rowClassName}">
      <td class="paper-table-title">${paper.title}</td>
      <td>${institutions.join("; ")}</td>
      <td>${formatPublishedAt(paper.publishedAt)}</td>
      <td>${paper.publication}</td>
      ${tagCell}
      <td>
        <a class="paper-table-link" href="${paper.link}" target="_blank" rel="noreferrer">Open</a>
      </td>
    </tr>
  `;
}

function renderCardBucketContent(visiblePapers, hiddenPapers, sectionLabel) {
  return `
    <div class="paper-grid">
      ${visiblePapers.map((paper) => createPaperCard(paper, sectionLabel)).join("")}
      ${hiddenPapers
        .map((paper) => createPaperCard(paper, sectionLabel, "paper-card-collapsed"))
        .join("")}
    </div>
  `;
}

function renderTableBucketContent(visiblePapers, hiddenPapers, sectionLabel) {
  const showTags = [...visiblePapers, ...hiddenPapers].some((paper) => getTags(paper).length > 0);

  return `
    <div class="paper-table-shell">
      <table class="paper-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Institutions</th>
            <th>Published</th>
            <th>Publication</th>
            ${showTags ? "<th>Tags</th>" : ""}
            <th>Link</th>
          </tr>
        </thead>
        <tbody>
          ${visiblePapers
            .map((paper) => createPaperTableRow(paper, sectionLabel, "", { showTags }))
            .join("")}
          ${hiddenPapers
            .map((paper) =>
              createPaperTableRow(paper, sectionLabel, "paper-row-collapsed", { showTags })
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}
