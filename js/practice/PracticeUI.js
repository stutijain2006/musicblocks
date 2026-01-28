import { PracticeProblems } from "./PracticeProblems.js";
import { PracticeManager } from "./PracticeManager.js";
import { PracticeValidator } from "./PracticeValidator.js";

window.PracticeProblems = PracticeProblems;

export const PracticeUI = {
  open() {
    if (document.getElementById("practice-overlay")) return;

    const overlay = document.createElement("div");
    overlay.id = "practice-overlay";

    overlay.innerHTML = `
      <div class="practice-box">
        <h2>🧩 Practice Mode</h2>
        ${this.renderLevel("easy")}
        ${this.renderLevel("medium")}
        ${this.renderLevel("hard")}
        <button class="close">Close</button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll("[data-problem]").forEach(btn => {
      btn.onclick = () => {
        const level = btn.dataset.level;
        const index = btn.dataset.problem;
        const problem = PracticeProblems[level][index];

        if (PracticeValidator.validate(problem)) {
          PracticeManager.complete(problem, level);
          btn.classList.add("done");
          alert("✅ Correct!");
        } else {
          alert("❌ Try matching the picture!");
        }
      };
    });

    overlay.querySelector(".close").onclick = () => overlay.remove();
  },

  renderLevel(level) {
    return `
      <div class="practice-level ${level}">
        <h3>${level.toUpperCase()}</h3>
        ${PracticeProblems[level].map((p, i) => `
          <div class="practice-question">
            <img src="${p.image}" />
            <button 
              data-level="${level}" 
              data-problem="${i}"
              class="${PracticeManager.isDone(p.id) ? "done" : ""}">
              ${p.title}
            </button>
          </div>
        `).join("")}
      </div>
    `;
  }
};

function addPracticeTopButton() {
  const menuBtn = document.getElementById("toggleAuxBtn");
  if (!menuBtn) {
    console.warn("Practice: menu button not found yet");
    return;
  }

  // Prevent duplicate buttons
  if (document.getElementById("practice-top-btn")) return;

  const menuLi = menuBtn.closest("li");
  const ul = menuLi.parentElement;

  const li = document.createElement("li");
  const btn = document.createElement("a");

  btn.id = "practice-top-btn";
  btn.className = "tooltipped";
  btn.setAttribute("data-position", "bottom");
  btn.setAttribute("data-delay", "10");
  btn.setAttribute("data-tooltip", "Practice Challenges");
  btn.style.cursor = "pointer";

  btn.innerHTML = `<i class="material-icons md-48">extension</i>`;

  btn.onclick = () => {
    console.log("🧩 Practice button clicked");
    window.startPracticeMode();
  };

  li.appendChild(btn);
  ul.insertBefore(li, menuLi.nextSibling);

  // Re-init Materialize tooltip
  if (window.M && M.Tooltip) {
    M.Tooltip.init(btn);
  }

  console.log("✅ Practice button added");
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(addPracticeTopButton, 500);
});