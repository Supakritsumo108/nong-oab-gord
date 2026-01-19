// js/st5-assessment.js

import { goToPage } from "./navigation.js";
import { ST5_CRITERIA, getST5Level } from "./scoring-criteria.js";
import { saveAssessmentResult } from "./storage.js";
import { start2Q } from "./2q-assessment.js";
import { startRQFlow } from "./rq-assessment.js";

let currentQuestionIndexST5 = 0;
let totalScoreST5 = 0;

document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".btn-st5-choice");

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const score = parseInt(e.currentTarget.getAttribute("data-score"));
      answerST5(score);
    });
  });
});

export function startST5() {
  currentQuestionIndexST5 = 0;
  totalScoreST5 = 0;
  loadQuestionUI_ST5();
  goToPage("page-11");
}

function answerST5(score) {
  totalScoreST5 += score;
  currentQuestionIndexST5++;

  if (currentQuestionIndexST5 < ST5_CRITERIA.questions.length) {
    loadQuestionUI_ST5();
  } else {
    showResultST5();
  }
}

function loadQuestionUI_ST5() {
  const qText = document.getElementById("question-text");
  const qProgress = document.getElementById("question-progress");

  if (qText) {
    qText.innerText = ST5_CRITERIA.questions[currentQuestionIndexST5];
  }

  if (qProgress) {
    qProgress.innerText = `ข้อ ${currentQuestionIndexST5 + 1} / ${
      ST5_CRITERIA.questions.length
    }`;
  }
}

function showResultST5() {
  goToPage("page-12");

  const resultScore = document.getElementById("final-score");
  const resultLevel = document.getElementById("result-level");
  const resultAdvice = document.getElementById("result-advice");
  const scoreCircle = document.getElementById("result-score-circle");
  const btnAction = document.getElementById("btn-back-menu-st5");

  if (resultScore) resultScore.innerText = totalScoreST5;

  if (scoreCircle) scoreCircle.className = "score-circle";
  if (resultLevel) resultLevel.className = "result-title";

  const level = getST5Level(totalScoreST5);

  if (level) {
    if (resultLevel) resultLevel.innerText = level.label;
    if (resultAdvice) resultAdvice.innerText = level.advice;
    if (scoreCircle) scoreCircle.classList.add(level.class);
    if (resultLevel) resultLevel.classList.add(level.class);

    if (btnAction) {
      const newBtn = btnAction.cloneNode(true);
      btnAction.parentNode.replaceChild(newBtn, btnAction);

      if (totalScoreST5 < 8) {
        newBtn.innerText = "ทำแบบประเมิน 2Q ต่อ ➜";
        newBtn.className = "btn-next full-width";
        newBtn.addEventListener("click", () => {
          start2Q();
        });
      } else {
        newBtn.innerText = "ทำแบบประเมิน RQ ต่อ ➜";
        newBtn.className = "btn-next full-width";
        newBtn.addEventListener("click", () => {
          startRQFlow();
        });
      }
    }

    saveAssessmentResult("ST-5", totalScoreST5, level.label, {
      advice: level.advice,
    });
  }
}
