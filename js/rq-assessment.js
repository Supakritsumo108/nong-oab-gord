// js/rq-assessment.js

import { goToPage } from "./navigation.js";
import { saveAssessmentResult } from "./storage.js";

const RQ_QUESTIONS = [
  "ฉันเอาชนะอุปสรรคปัญหาต่างๆ ในชีวิตได้",
  "ฉันมีกำลังใจและได้รับการสนับสนุนจากคนรอบข้าง",
  "ฉันจัดการกับปัญหาและความเครียดของตนเองได้",
];

let currentRQIndex = 0;
let totalRQScore = 0;

window.answerRQ = answerRQ;

document.addEventListener("DOMContentLoaded", () => {
  const btnStartIntro = document.getElementById("btn-start-rq-intro");
  if (btnStartIntro) {
    btnStartIntro.addEventListener("click", () => {
      goToPage("page-rq-instruction");
    });
  }

  const btnStartQuiz = document.getElementById("btn-start-rq-quiz");
  if (btnStartQuiz) {
    btnStartQuiz.addEventListener("click", () => {
      startRQAssessment();
    });
  }
});

export function startRQFlow() {
  goToPage("page-rq-intro");
}

export function startRQAssessment() {
  currentRQIndex = 0;
  totalRQScore = 0;
  loadRQQuestion();
  goToPage("page-rq-quiz");
}

function loadRQQuestion() {
  const questionEl = document.getElementById("rq-question-text");
  if (questionEl) {
    questionEl.innerText = RQ_QUESTIONS[currentRQIndex];
  }

  const noEl = document.getElementById("rq-current-no");
  if (noEl) {
    noEl.innerText = currentRQIndex + 1;
  }

  const progressEl = document.getElementById("rq-progress-bar");
  if (progressEl) {
    const percent = ((currentRQIndex + 1) / RQ_QUESTIONS.length) * 100;
    progressEl.style.width = `${percent}%`;
  }
}

/**
 * @param {number} score คะแนนที่เลือก
 */
function answerRQ(score) {
  totalRQScore += score;

  if (currentRQIndex < RQ_QUESTIONS.length - 1) {
    currentRQIndex++;
    setTimeout(() => {
      loadRQQuestion();
    }, 200);
  } else {
    showRQResult();
  }
}

function showRQResult() {
  goToPage("page-rq-result");
  const averageScore = Math.round(totalRQScore / 3);
  const scoreText = document.getElementById("rq-result-score");
  const levelText = document.getElementById("rq-result-level");
  const msgText = document.getElementById("rq-result-msg");
  const circle = document.getElementById("rq-result-circle");

  if (scoreText) scoreText.innerText = averageScore;

  let label = "";
  let message = "";
  let colorClass = "";


  if (averageScore <= 4) {
    label = "พลังใจน้อย";
    message =
      "เหนื่อยได้ พักได้ ไม่เป็นไรเลยนะคะ คุณยังทำได้ดีแล้ว ขอให้ค่อย ๆ เติมแรงใจให้ตัวเองนะคะ";
    colorClass = "level-severe";
  } else if (averageScore <= 6) {
    label = "พลังใจปานกลาง";
    message =
      "พี่ๆเข้มแข็งดีนะครับ แม้บางวันจะหนัก แต่คุณก็ผ่านมาได้เสมอ เป็นกำลังใจให้เดินต่ออย่างสบายใจนะคะ";
    colorClass = "level-mild";
  } else {
    label = "พลังใจยอดเยี่ยม";
    message =
      "พลังใจของคุณยอดเยี่ยมมากเลยค่ะ รักษาแรงใจดี ๆ นี้ไว้ และขอให้มีวันที่สดใสเสมอนะคะ";
    colorClass = "level-normal";
  }

  if (levelText) {
    levelText.innerText = label;
    levelText.className = "result-title " + colorClass;
  }

  if (msgText) msgText.innerText = message;

  if (circle) {
    circle.className = "result-circle " + colorClass;
  }

  saveAssessmentResult("RQ", averageScore, label);
}
