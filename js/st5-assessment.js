// ไฟล์: js/st5-assessment.js (ฉบับสมบูรณ์: No Global Scope)

import { goToPage } from "./navigation.js";
import { ST5_CRITERIA, getST5Level } from "./scoring-criteria.js";
import { saveAssessmentResult } from "./storage.js";
import { start2Q } from "./2q-assessment.js"; // ✅ 1. เพิ่ม Import start2Q
import { startRQFlow } from "./rq-assessment.js"; // ✅ 2. เพิ่ม Import RQ

let currentQuestionIndexST5 = 0;
let totalScoreST5 = 0;

// --- 1. Event Listener (ทำงานเมื่อโหลดหน้าเว็บ) ---
document.addEventListener("DOMContentLoaded", () => {
  // ดักจับปุ่มทางเลือกทั้งหมดของ ST-5 (ที่มี class 'btn-st5-choice')
  const buttons = document.querySelectorAll(".btn-st5-choice");

  buttons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      // ดึงคะแนนจาก attribute 'data-score'
      const score = parseInt(e.currentTarget.getAttribute("data-score"));
      answerST5(score);
    });
  });
});

/**
 * เริ่มทำแบบทดสอบ ST-5
 */
export function startST5() {
  currentQuestionIndexST5 = 0;
  totalScoreST5 = 0;
  loadQuestionUI_ST5();
  goToPage("page-11");
}

/**
 * ตอบคำถาม ST-5 (Internal Function)
 */
function answerST5(score) {
  totalScoreST5 += score;
  currentQuestionIndexST5++;

  if (currentQuestionIndexST5 < ST5_CRITERIA.questions.length) {
    loadQuestionUI_ST5();
  } else {
    showResultST5();
  }
}

/**
 * โหลด UI คำถาม
 */
function loadQuestionUI_ST5() {
  const qText = document.getElementById("question-text"); // เช็ค ID ใน HTML ให้ตรง (อาจจะเป็น question-text-st5)
  const qProgress = document.getElementById("question-progress"); // เช็ค ID ใน HTML ให้ตรง

  if (qText) {
    qText.innerText = ST5_CRITERIA.questions[currentQuestionIndexST5];
  }

  if (qProgress) {
    qProgress.innerText = `ข้อ ${currentQuestionIndexST5 + 1} / ${
      ST5_CRITERIA.questions.length
    }`;
  }
}

/**
 * แสดงผลลัพธ์
 */
function showResultST5() {
  goToPage("page-12");

  const resultScore = document.getElementById("final-score");
  const resultLevel = document.getElementById("result-level");
  const resultAdvice = document.getElementById("result-advice");
  const scoreCircle = document.getElementById("result-score-circle");
  const btnAction = document.getElementById("btn-back-menu-st5");

  // แสดงคะแนน
  if (resultScore) resultScore.innerText = totalScoreST5;

  // Reset Classes
  if (scoreCircle) scoreCircle.className = "score-circle";
  if (resultLevel) resultLevel.className = "result-title";

  // หาระดับจาก criteria
  const level = getST5Level(totalScoreST5);

  if (level) {
    if (resultLevel) resultLevel.innerText = level.label;
    if (resultAdvice) resultAdvice.innerText = level.advice;
    if (scoreCircle) scoreCircle.classList.add(level.class);
    if (resultLevel) resultLevel.classList.add(level.class);

    if (btnAction) {
      // Clone เพื่อล้าง Event Listener เก่า
      const newBtn = btnAction.cloneNode(true);
      btnAction.parentNode.replaceChild(newBtn, btnAction);

      if (totalScoreST5 < 8) {
        // --- กรณีคะแนนน้อยกว่า 8: ไปทำ 2Q ---
        newBtn.innerText = "ทำแบบประเมิน 2Q ต่อ ➜";
        newBtn.className = "btn-next full-width"; // ใช้ Style ปุ่ม Next สีฟ้า
        newBtn.addEventListener("click", () => {
          start2Q();
        });
      } else {
        // --- กรณีคะแนน >= 8: ไปทำ RQ ---
        newBtn.innerText = "ทำแบบประเมิน RQ ต่อ ➜";
        // อาจจะเปลี่ยนสีปุ่มให้เด่นขึ้นถ้าต้องการ (Optional)
        newBtn.className = "btn-next full-width";
        newBtn.addEventListener("click", () => {
          startRQFlow();
        });
      }
    }

    // ✅ บันทึกผลลง localStorage
    saveAssessmentResult("ST-5", totalScoreST5, level.label, {
      advice: level.advice,
    });
  }
}
