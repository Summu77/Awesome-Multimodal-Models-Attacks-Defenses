import { allPapers, collections } from "./data/all-papers.js";
import { attackGroups } from "./data/attacks.js";
import { defenseGroups } from "./data/defenses.js";
import { orderedSections, sectionMeta } from "./data/sections.js";
import { renderShell } from "./modules/site-shell.js";
import { createPaperCard, isPreprintPaper, sortPapers, uniqueTags, uniqueYears } from "./modules/ui.js";

renderShell(document.body.dataset.page);

const heroStats = document.querySelector("#hero-stats");
const sectionGrid = document.querySelector("#section-grid");
const featuredGrid = document.querySelector("#featured-grid");
const institutionPrimarySelect = document.querySelector("#institution-primary-select");
const institutionSecondarySelect = document.querySelector("#institution-secondary-select");
const institutionStatusSelect = document.querySelector("#institution-status-select");
const institutionYearSelect = document.querySelector("#institution-year-select");
const institutionTagSelect = document.querySelector("#institution-tag-select");
const wordcloudPrimarySelect = document.querySelector("#wordcloud-primary-select");
const wordcloudSecondarySelect = document.querySelector("#wordcloud-secondary-select");
const wordcloudStatusSelect = document.querySelector("#wordcloud-status-select");
const wordcloudYearSelect = document.querySelector("#wordcloud-year-select");
const wordcloudTagSelect = document.querySelector("#wordcloud-tag-select");
const institutionPie = document.querySelector("#institution-pie");
const institutionCurrentLabel = document.querySelector("#institution-current-label");
const institutionTotal = document.querySelector("#institution-total");
const institutionLegendTitle = document.querySelector("#institution-legend-title");
const institutionLegendNote = document.querySelector("#institution-legend-note");
const institutionLegend = document.querySelector("#institution-legend");
const institutionEmptyState = document.querySelector("#institution-empty-state");
const wordcloudTitle = document.querySelector("#wordcloud-title");
const wordcloudNote = document.querySelector("#wordcloud-note");
const wordcloudPaperCount = document.querySelector("#wordcloud-paper-count");
const wordcloudCanvas = document.querySelector("#wordcloud-canvas");
const wordcloudEmptyState = document.querySelector("#wordcloud-empty-state");
const PIE_COLORS = [
  "#8f4f2d",
  "#3a5d70",
  "#bf8b55",
  "#6a7f4a",
  "#7b5c8e",
  "#d27c61",
  "#4f8c8d",
  "#d1a34b",
  "#8d5d5d",
  "#9ba4af"
];
const WORD_STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "in", "into", "is", "of",
  "on", "or", "the", "their", "to", "toward", "towards", "under", "using", "via", "with",
  "against", "across", "based", "large", "language", "model", "models", "multimodal",
  "vision", "visual", "pre", "training", "pretraining", "learning", "study", "new", "can",
  "llm", "mllm", "vlm", "vlms", "vlp", "vlps", "vla", "vlas", "agent", "agents"
]);
const WORD_COLORS = [
  "#8f4f2d",
  "#3a5d70",
  "#6a7f4a",
  "#b46f4b",
  "#6c567b",
  "#497d7a"
];
const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "accepted", label: "Accepted Papers" },
  { value: "preprints", label: "Preprints" }
];
const EMPTY_PIE_BACKGROUND = "conic-gradient(rgba(31, 43, 60, 0.12) 0deg 360deg)";

const institutionGroups = [
  {
    key: "attacks",
    label: "Attack",
    directions: attackGroups.map((group) => ({
      key: `attack-${group.key}`,
      label: group.title,
      papers: group.papers
    }))
  },
  {
    key: "defenses",
    label: "Defense",
    directions: defenseGroups.map((group) => ({
      key: `defense-${group.key}`,
      label: group.title,
      papers: group.papers
    }))
  },
  {
    key: "evaluations",
    label: "Evaluation",
    directions: [
      {
        key: "evaluations",
        label: "Evaluations",
        papers: collections.evaluations
      }
    ]
  },
  {
    key: "analysis",
    label: "Analysis",
    directions: [
      {
        key: "analysis",
        label: "Analysis",
        papers: collections.analysis
      }
    ]
  },
  {
    key: "surveys",
    label: "Survey",
    directions: [
      {
        key: "surveys",
        label: "Surveys",
        papers: collections.surveys
      }
    ]
  }
];
const groupMap = new Map(institutionGroups.map((group) => [group.key, group]));
const groupOptions = institutionGroups.map((group) => ({
  value: group.key,
  label: group.label
}));

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

createFilterController(
  {
    group: institutionPrimarySelect,
    direction: institutionSecondarySelect,
    status: institutionStatusSelect,
    year: institutionYearSelect,
    tag: institutionTagSelect
  },
  {
    group: "attacks",
    direction: "attack-adversarial",
    status: "all",
    year: "all",
    tag: "all"
  },
  renderInstitutionDistribution
);

createFilterController(
  {
    group: wordcloudPrimarySelect,
    direction: wordcloudSecondarySelect,
    status: wordcloudStatusSelect,
    year: wordcloudYearSelect,
    tag: wordcloudTagSelect
  },
  {
    group: "attacks",
    direction: "attack-adversarial",
    status: "all",
    year: "all",
    tag: "all"
  },
  renderWordcloud
);

function createFilterController(selects, initialState, renderPanel) {
  const { group, direction, status, year, tag } = selects;

  if (!group || !direction || !status || !year || !tag) {
    return null;
  }

  const state = { ...initialState };

  group.addEventListener("change", () => {
    const nextGroup = groupMap.get(group.value) || groupMap.get(state.group) || institutionGroups[0];
    state.group = nextGroup.key;
    state.direction = nextGroup.directions[0]?.key || "";
    state.year = "all";
    state.tag = "all";
    render();
  });

  direction.addEventListener("change", () => {
    state.direction = direction.value || state.direction;
    state.year = "all";
    state.tag = "all";
    render();
  });

  status.addEventListener("change", () => {
    state.status = status.value || state.status;
    state.year = "all";
    state.tag = "all";
    render();
  });

  year.addEventListener("change", () => {
    state.year = year.value || state.year;
    state.tag = "all";
    render();
  });

  tag.addEventListener("change", () => {
    state.tag = tag.value || state.tag;
    render();
  });

  function render() {
    const scope = resolveFilterScope(state);

    if (!scope) {
      return;
    }

    syncSelect(group, groupOptions, scope.group.key);
    syncSelect(direction, optionsFromDirections(scope.group.directions), scope.direction.key);
    syncSelect(status, STATUS_OPTIONS, scope.state.status);
    syncSelect(year, optionsWithAll(scope.availableYears, "All years"), scope.state.year);
    syncSelect(tag, optionsWithAll(scope.availableTags, "All tags"), scope.state.tag);

    renderPanel(scope);
  }

  render();
  return { state, render };
}

function resolveFilterScope(state) {
  const group = groupMap.get(state.group) || institutionGroups[0];
  const direction = group?.directions.find((item) => item.key === state.direction) || group?.directions[0];

  if (!group || !direction) {
    return null;
  }

  state.group = group.key;
  state.direction = direction.key;

  const scopedByStatus = filterPapersByStatus(direction.papers, state.status);
  const availableYears = uniqueYears(scopedByStatus);

  if (state.year !== "all" && !availableYears.includes(state.year)) {
    state.year = "all";
  }

  const scopedByYear = filterPapersByYear(scopedByStatus, state.year);
  const availableTags = uniqueTags(scopedByYear);

  if (state.tag !== "all" && !availableTags.includes(state.tag)) {
    state.tag = "all";
  }

  return {
    state,
    group,
    direction,
    availableYears,
    availableTags,
    papers: filterPapersByTag(scopedByYear, state.tag),
    statusLabel: labelForStatus(state.status),
    yearLabel: state.year === "all" ? "All years" : state.year
  };
}

function renderInstitutionDistribution(scope) {
  if (
    !institutionCurrentLabel
    || !institutionTotal
    || !institutionLegendTitle
    || !institutionLegendNote
    || !institutionLegend
    || !institutionEmptyState
    || !institutionPie
  ) {
    return;
  }

  institutionCurrentLabel.textContent = `${scope.statusLabel} · ${scope.yearLabel}`;
  institutionLegendTitle.textContent = `${scope.direction.label} · ${scope.statusLabel} · ${scope.yearLabel}`;

  const chartData = summarizeInstitutions(scope.papers);

  institutionTotal.textContent = String(chartData.total);
  institutionLegendNote.textContent = `${scope.papers.length} papers in ${scope.direction.label}.`;
  institutionEmptyState.classList.toggle("hidden", chartData.total > 0);
  institutionLegend.classList.toggle("hidden", chartData.total === 0);

  if (chartData.total === 0) {
    institutionPie.style.background = EMPTY_PIE_BACKGROUND;
    institutionLegend.innerHTML = "";
    return;
  }

  institutionPie.style.background = buildPieGradient(chartData.entries, chartData.total);
  institutionLegend.innerHTML = chartData.entries
    .map(
      (entry) => `
        <article class="institution-legend-item">
          <span class="institution-legend-dot" style="background:${entry.color}"></span>
          <div class="institution-legend-copy">
            <strong>${entry.name}</strong>
            <span>${entry.count} mentions · ${entry.share}%</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderWordcloud(scope) {
  if (
    !wordcloudTitle
    || !wordcloudNote
    || !wordcloudPaperCount
    || !wordcloudCanvas
    || !wordcloudEmptyState
  ) {
    return;
  }

  const keywords = summarizeTitleKeywords(scope.papers);

  wordcloudTitle.textContent = `${scope.direction.label} · ${scope.statusLabel} · ${scope.yearLabel}`;
  wordcloudNote.textContent = "Top keywords extracted from current paper titles.";
  wordcloudPaperCount.textContent = `${scope.papers.length} papers`;
  wordcloudEmptyState.classList.toggle("hidden", keywords.length > 0);
  wordcloudCanvas.classList.toggle("hidden", keywords.length === 0);

  if (keywords.length === 0) {
    wordcloudCanvas.innerHTML = "";
    return;
  }

  wordcloudCanvas.innerHTML = keywords
    .map(
      (entry, index) => `
        <span
          class="wordcloud-term"
          style="
            --word-size:${entry.size}rem;
            --word-opacity:${entry.opacity};
            --word-color:${WORD_COLORS[index % WORD_COLORS.length]};
          "
          title="${entry.word} · ${entry.count}"
        >
          ${entry.word}
        </span>
      `
    )
    .join("");
}

function syncSelect(select, options, value) {
  const signature = options.map((item) => `${item.value}:${item.label}`).join("|");

  if (select.dataset.optionsSignature !== signature) {
    select.innerHTML = options
      .map(
        (item) => `
          <option value="${item.value}">
            ${item.label}
          </option>
        `
      )
      .join("");
    select.dataset.optionsSignature = signature;
  }

  if (select.value !== value) {
    select.value = value;
  }
}

function optionsFromDirections(directions) {
  return directions.map((direction) => ({
    value: direction.key,
    label: direction.label
  }));
}

function optionsWithAll(values, allLabel) {
  return [
    { value: "all", label: allLabel },
    ...values.map((value) => ({ value, label: value }))
  ];
}

function labelForStatus(status) {
  if (status === "preprints") {
    return "Preprints";
  }

  if (status === "accepted") {
    return "Accepted Papers";
  }

  return "All";
}

function summarizeInstitutions(papers) {
  const counts = new Map();

  papers.forEach((paper) => {
    getInstitutions(paper).forEach((institution) => {
      counts.set(institution, (counts.get(institution) || 0) + 1);
    });
  });

  const sorted = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  const topEntries = sorted.slice(0, 9);
  const othersCount = sorted.slice(9).reduce((sum, [, count]) => sum + count, 0);
  const rankedEntries = othersCount > 0 ? [...topEntries, ["Others", othersCount]] : topEntries;
  const total = rankedEntries.reduce((sum, [, count]) => sum + count, 0);

  return {
    total,
    entries: rankedEntries.map(([name, count], index) => ({
      name,
      count,
      color: PIE_COLORS[index % PIE_COLORS.length],
      share: total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"
    }))
  };
}

function summarizeTitleKeywords(papers) {
  const counts = new Map();

  papers.forEach((paper) => {
    tokenizeTitle(paper.title).forEach((word) => {
      counts.set(word, (counts.get(word) || 0) + 1);
    });
  });

  const ranked = [...counts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 36);

  if (ranked.length === 0) {
    return [];
  }

  const maxCount = ranked[0][1];
  const minCount = ranked[ranked.length - 1][1];
  const spread = Math.max(maxCount - minCount, 1);

  return ranked.map(([word, count]) => {
    const weight = (count - minCount) / spread;
    return {
      word,
      count,
      size: (0.95 + weight * 1.55).toFixed(2),
      opacity: (0.58 + weight * 0.4).toFixed(2)
    };
  });
}

function tokenizeTitle(title) {
  return String(title || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/[\s-]+/)
    .map((token) => normalizeToken(token))
    .filter((token) => token && !WORD_STOPWORDS.has(token) && token.length > 2);
}

function normalizeToken(token) {
  if (!token) {
    return "";
  }

  let normalized = token.trim();

  if (normalized.endsWith("ies") && normalized.length > 4) {
    normalized = `${normalized.slice(0, -3)}y`;
  } else if (normalized.endsWith("s") && normalized.length > 4 && !normalized.endsWith("ss")) {
    normalized = normalized.slice(0, -1);
  }

  return normalized;
}

function filterPapersByStatus(papers, status) {
  if (status === "all") {
    return papers;
  }

  if (status === "preprints") {
    return papers.filter((paper) => isPreprintPaper(paper));
  }

  return papers.filter((paper) => !isPreprintPaper(paper));
}

function filterPapersByYear(papers, year) {
  if (year === "all") {
    return papers;
  }

  return papers.filter((paper) => String(paper.publishedAt || "").startsWith(`${year}`));
}

function filterPapersByTag(papers, tag) {
  if (tag === "all") {
    return papers;
  }

  return papers.filter((paper) => {
    if (Array.isArray(paper.Tag)) {
      return paper.Tag.includes(tag);
    }

    if (Array.isArray(paper.tag)) {
      return paper.tag.includes(tag);
    }

    if (Array.isArray(paper.tags)) {
      return paper.tags.includes(tag);
    }

    return false;
  });
}

function buildPieGradient(entries, total) {
  let currentDegree = 0;

  const segments = entries.map((entry) => {
    const segmentSize = total > 0 ? (entry.count / total) * 360 : 0;
    const start = currentDegree;
    const end = currentDegree + segmentSize;
    currentDegree = end;
    return `${entry.color} ${start}deg ${end}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
}

function getInstitutions(paper) {
  if (Array.isArray(paper.institutions)) {
    return paper.institutions.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  if (Array.isArray(paper.institution)) {
    return paper.institution.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof paper.institutions === "string" && paper.institutions.trim()) {
    return [paper.institutions.trim()];
  }

  if (typeof paper.institution === "string" && paper.institution.trim()) {
    return [paper.institution.trim()];
  }

  return [];
}
