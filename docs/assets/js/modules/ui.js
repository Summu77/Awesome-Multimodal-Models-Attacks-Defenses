export function createPaperCard(paper, sectionLabel = "", extraClassName = "") {
  const badge = sectionLabel
    ? `<span class="paper-badge">${sectionLabel}</span>`
    : `<span class="paper-badge">Paper</span>`;
  const cardClassName = ["paper-card", extraClassName].filter(Boolean).join(" ");
  const institutions = getInstitutions(paper);
  const institutionLabel = institutions.length > 1 ? "Institutions" : "Institution";

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
      </div>
      <div class="paper-actions">
        <a class="paper-link paper-button" href="${paper.link}" target="_blank" rel="noreferrer">
          Open paper
        </a>
      </div>
    </article>
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
  const { sectionLabel = "", limit = 10 } = options;
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

      return `
        <section class="${bucketClass}">
          <div class="paper-bucket-head">
            <h3>${bucket.title}</h3>
            <span class="section-count">${bucket.papers.length}</span>
          </div>
          <div class="paper-grid">
            ${visiblePapers.map((paper) => createPaperCard(paper, sectionLabel)).join("")}
            ${hiddenPapers
              .map((paper) => createPaperCard(paper, sectionLabel, "paper-card-collapsed"))
              .join("")}
          </div>
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

export function papersByYear(items, year) {
  return items.filter((paper) => String(paper.publishedAt || "").startsWith(String(year)));
}

export function uniquePublications(items) {
  return [...new Set(items.map((item) => item.publication))].sort((a, b) =>
    b.localeCompare(a)
  );
}

export function filterPapers(items, searchText, publication) {
  const query = searchText.trim().toLowerCase();

  return items.filter((paper) => {
    const matchesPublication = publication ? paper.publication === publication : true;
    const institutionText = getInstitutions(paper).join(" ");
    const haystack = [
      paper.title,
      institutionText,
      paper.publication,
      paper.publishedAt
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = query ? haystack.includes(query) : true;
    return matchesPublication && matchesQuery;
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
