// ไฟล์: js/2q-assessment.js (ฉบับปรับปรุง: No Global Scope)

import { goToPage } from "./navigation.js";
import { start9Q } from "./9q-assessment.js";
import { TWO_Q_CRITERIA } from "./scoring-criteria.js";
import { saveAssessmentResult } from "./storage.js";

let current2QIndex = 0;
let has2QRisk = false;

// --- 1. ส่วน Event Listener (ทำงานอัตโนมัติเมื่อเว็บโหลดเสร็จ) ---
document.addEventListener("DOMContentLoaded", () => {
  // ผูกปุ่มคำตอบ 2Q (ต้องมี ID ใน HTML: btn-2q-no และ btn-2q-yes)
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
      loadQuestion2Q(); // โหลดคำถามแรก
      goToPage("page-13"); // ไปหน้าทำแบบประเมินจริง
    });
  }
});

/**
 * เริ่มทำแบบทดสอบ 2Q
 */
export function start2Q() {
  current2QIndex = 0;
  has2QRisk = false;
  goToPage("page-2q-intro"); // ✅ เปลี่ยนไปหน้า Intro ก่อน
}

/**
 * ตอบคำถาม 2Q
 */
function answer2Q(isRisk) {
  if (isRisk) has2QRisk = true;
  current2QIndex++;

  if (current2QIndex < TWO_Q_CRITERIA.questions.length) {
    loadQuestion2Q();
  } else {
    showResult2Q();
  }
}

/**
 * โหลดคำถาม
 */
function loadQuestion2Q() {
  const qText = document.getElementById("question-text-2q");
  const qCount = document.getElementById("question-count-2q"); // ✅ เพิ่มตัวแปรสำหรับเลขข้อ
  const qProgress = document.getElementById("progress-2q-fill"); // ✅ เพิ่มตัวแปรสำหรับ Progress Bar

  const totalQuestions = TWO_Q_CRITERIA.questions.length;
  const currentQNum = current2QIndex + 1; // เลขข้อปัจจุบัน (เริ่มจาก 1)

  if (qText) {
    qText.innerText = TWO_Q_CRITERIA.questions[current2QIndex];
  }

  // ✅ อัปเดตเลขข้อ
  if (qCount) {
    qCount.innerText = `Q: ${currentQNum}/${totalQuestions}`;
  }

  // ✅ อัปเดต Progress Bar
  if (qProgress) {
    const progressWidth = (currentQNum / totalQuestions) * 100;
    qProgress.style.width = `${progressWidth}%`;
  }
}

/**
 * แสดงผลลัพธ์
 */
function showResult2Q() {
  goToPage("page-14");

  const icon = document.getElementById("icon-result-2q");
  const title = document.getElementById("title-result-2q");
  const desc = document.getElementById("desc-result-2q");
  const btn = document.getElementById("btn-action-2q");

  // เลือกผลลัพธ์จาก criteria
  const result = has2QRisk
    ? TWO_Q_CRITERIA.results.hasRisk
    : TWO_Q_CRITERIA.results.noRisk;

  // แสดงผล UI
  if (icon) icon.innerText = result.icon;
  if (title) {
    title.innerText = result.title;
    title.style.color = result.titleColor;
  }
  if (desc) desc.innerHTML = result.description;

  // จัดการปุ่ม Action (ล้าง Event เก่า + ใส่ Event ใหม่)
  if (btn) {
    const newBtn = btn.cloneNode(true); // Clone เพื่อล้าง event listeners เก่า
    btn.parentNode.replaceChild(newBtn, btn);

    // เปลี่ยนข้อความปุ่ม
    if (result.nextAction === "backToMenu") {
      newBtn.innerText = "กลับหน้าเมนูหลัก ➜";
      // ใช้ addEventListener แทน .onclick
      newBtn.addEventListener("click", () => goToPage("page-10"));
    } else if (result.nextAction === "go9Q") {
      newBtn.innerText = "ทำแบบประเมิน 9Q ต่อ ➜";
      // ใช้ addEventListener แทน .onclick
      newBtn.addEventListener("click", () => start9Q());
    }
  }

  // ✅ บันทึกผลลง localStorage
  const riskLevel = has2QRisk ? "มีความเสี่ยง" : "ปกติ";
  saveAssessmentResult("2Q", has2QRisk ? 1 : 0, riskLevel, {
    hasRisk: has2QRisk,
  });
}
