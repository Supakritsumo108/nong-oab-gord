// js/2q-assessment.js

import { goToPage } from "./navigation.js";
import { start9Q } from "./9q-assessment.js";
import { TWO_Q_CRITERIA } from "./scoring-criteria.js";
import { saveAssessmentResult } from "./storage.js";

let current2QIndex = 0;
let has2QRisk = false;

document.addEventListener("DOMContentLoaded", () => {
  const btnNo = document.getElementById("btn-2q-no");
  const btnYes = document.getElementById("btn-2q-yes");

  if (btnNo) {
    btnNo.addEventListener("click", () => answer2Q(false));
  }
  if (btnYes) {
    btnYes.addEventListener("click", () => answer2Q(true));
  }

  const btnStartReal = document.getElementById("btn-start-2q-real");
  if (btnStartReal) {
    btnStartReal.addEventListener("click", () => {
      loadQuestion2Q();
      goToPage("page-13");
    });
  }
});

export function start2Q() {
  current2QIndex = 0;
  has2QRisk = false;
  goToPage("page-2q-intro");
}

function answer2Q(isRisk) {
  if (isRisk) has2QRisk = true;
  current2QIndex++;

  if (current2QIndex < TWO_Q_CRITERIA.questions.length) {
    loadQuestion2Q();
  } else {
    showResult2Q();
  }
}

function loadQuestion2Q() {
  const qText = document.getElementById("question-text-2q");
  const qCount = document.getElementById("question-count-2q");
  const qProgress = document.getElementById("progress-2q-fill");

  const totalQuestions = TWO_Q_CRITERIA.questions.length;
  const currentQNum = current2QIndex + 1;

  if (qText) {
    qText.innerText = TWO_Q_CRITERIA.questions[current2QIndex];
  }

  if (qCount) {
    qCount.innerText = `Q: ${currentQNum}/${totalQuestions}`;
  }

  if (qProgress) {
    const progressWidth = (currentQNum / totalQuestions) * 100;
    qProgress.style.width = `${progressWidth}%`;
  }
}

function showResult2Q() {
  goToPage("page-14");

  const icon = document.getElementById("icon-result-2q");
  const title = document.getElementById("title-result-2q");
  const desc = document.getElementById("desc-result-2q");
  const btn = document.getElementById("btn-action-2q");

  const result = has2QRisk
    ? TWO_Q_CRITERIA.results.hasRisk
    : TWO_Q_CRITERIA.results.noRisk;

  if (icon) icon.innerText = result.icon;
  if (title) {
    title.innerText = result.title;
    title.style.color = result.titleColor;
  }
  if (desc) desc.innerHTML = result.description;

  if (btn) {
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    if (result.nextAction === "backToMenu") {
      newBtn.innerText = "กลับหน้าเมนูหลัก ➜";
      newBtn.addEventListener("click", () => goToPage("page-10"));
    } else if (result.nextAction === "go9Q") {
      newBtn.innerText = "ทำแบบประเมิน 9Q ต่อ ➜";
      newBtn.addEventListener("click", () => start9Q());
    }
  }

  const riskLevel = has2QRisk ? "มีความเสี่ยง" : "ปกติ";
  saveAssessmentResult("2Q", has2QRisk ? 1 : 0, riskLevel, {
    hasRisk: has2QRisk,
  });
}
