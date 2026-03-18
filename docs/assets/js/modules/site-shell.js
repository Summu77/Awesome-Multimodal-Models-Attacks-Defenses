const navigation = [
  { key: "home", label: "Home", href: "./index.html" },
  { key: "attacks", label: "Attacks", href: "./attacks.html" },
  { key: "defenses", label: "Defenses", href: "./defenses.html" },
  { key: "evaluations", label: "Evaluations", href: "./evaluations.html" },
  { key: "analysis", label: "Analysis", href: "./analysis.html" },
  { key: "surveys", label: "Surveys", href: "./surveys.html" }
];

export function renderShell(currentPage) {
  const header = document.querySelector("#site-header");
  const footer = document.querySelector("#site-footer");

  if (header) {
    header.innerHTML = `
      <div class="site-header">
        <a class="brand" href="./index.html" aria-label="Go to homepage">
          <span class="brand-mark">GitHub Pages</span>
          <span class="brand-name">Safety Papers for Multimodal Large Language Models</span>
        </a>
        <nav class="site-nav" aria-label="Main navigation">
          ${navigation
            .map(
              (item) => `
                <a class="nav-link ${item.key === currentPage ? "active" : ""}" href="${item.href}">
                  ${item.label}
                </a>
              `
            )
            .join("")}
        </nav>
      </div>
    `;
  }

  if (footer) {
    footer.innerHTML = `
      <div class="site-footer">
        <div class="footer-card">
          <p class="footer-copy">
            Built as a static academic collection for GitHub Pages deployment.
          </p>
          <p class="footer-copy">
            Update paper data in <code>docs/assets/js/data/</code>.
          </p>
        </div>
      </div>
    `;
  }

  renderBackToTopButton();
}

function renderBackToTopButton() {
  if (document.querySelector("#back-to-top")) {
    return;
  }

  const button = document.createElement("button");
  button.id = "back-to-top";
  button.className = "back-to-top";
  button.type = "button";
  button.setAttribute("aria-label", "Back to top");
  button.textContent = "Top";

  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  window.addEventListener("scroll", () => {
    const visible = window.scrollY > 320;
    button.classList.toggle("visible", visible);
  }, { passive: true });

  document.body.appendChild(button);
}
