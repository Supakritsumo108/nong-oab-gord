// js/9q-assessment.js

import { goToPage } from "./navigation.js";
import { start8Q } from "./8q-assessment.js";
import { NINE_Q_CRITERIA, get9QLevel } from "./scoring-criteria.js";
import { saveAssessmentResult } from "./storage.js";

let index9Q = 0;
let score9Q = 0;

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".btn-9q-choice");

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const point = parseInt(e.currentTarget.getAttribute("data-score"));
      answer9Q(point);
    });
  });
});

export function start9Q() {
  index9Q = 0;
  score9Q = 0;
  loadUI9Q();
  goToPage("page-15");
}

function answer9Q(point) {
  score9Q += point;
  index9Q++;

  if (index9Q < NINE_Q_CRITERIA.questions.length) {
    loadUI9Q();
  } else {
    showResult9Q();
  }
}

function loadUI9Q() {
  const txt = document.getElementById("question-text-9q");
  const progressTxt = document.getElementById("progress-text-9q");

  if (txt) {
    txt.innerText = NINE_Q_CRITERIA.questions[index9Q];
  }

  if (progressTxt) {
    progressTxt.innerText = `ข้อ ${index9Q + 1} / ${
      NINE_Q_CRITERIA.questions.length
    }`;
  }
}

function showResult9Q() {
  goToPage("page-16");

  const circle = document.getElementById("circle-9q");
  const scoreTxt = document.getElementById("score-text-9q");
  const levelTxt = document.getElementById("level-9q");
  const adviceTxt = document.getElementById("advice-9q");
  const btnNext = document.getElementById("btn-next-step-9q");

  if (scoreTxt) scoreTxt.innerText = score9Q;

  if (circle) circle.className = "score-circle";
  if (levelTxt) levelTxt.className = "result-title";

  const level = get9QLevel(score9Q);

  if (level) {
    if (levelTxt) levelTxt.innerText = level.label;
    if (adviceTxt) adviceTxt.innerText = level.advice;
    if (circle) circle.classList.add(level.class);
    if (levelTxt) levelTxt.classList.add(level.class);

    if (btnNext) {
      const newBtn = btnNext.cloneNode(true);
      btnNext.parentNode.replaceChild(newBtn, btnNext);

      if (level.nextAction === "backToMenu") {
        newBtn.innerText = "กลับหน้าเมนูหลัก ➜";
        newBtn.addEventListener("click", () => goToPage("page-10"));
      } else if (level.nextAction === "go8Q") {
        newBtn.removeAttribute("data-goto");
        newBtn.innerText = "ควรประเมินการฆ่าตัวตาย (8Q) ➜";
        newBtn.addEventListener("click", () => start8Q());
      }
    }

    saveAssessmentResult("9Q", score9Q, level.label, {
      advice: level.advice,
      needSuicide: level.needSuicide,
    });
  }
}
