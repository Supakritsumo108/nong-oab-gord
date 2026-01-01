// ไฟล์: js/8q-assessment.js (ปรับปรุง - แก้ปัญหาทั้งหมด)

import { goToPage, showLoading, hideLoading } from "./navigation.js";
import { EIGHT_Q_CRITERIA, get8QLevel } from "./scoring-criteria.js";
import { saveAssessmentResult } from "./storage.js";

// ตัวแปรเก็บสถานะ
let index8Q = 0;
let totalScore8Q = 0;
let isSubQuestionMode = false;
const STORAGE_KEY_PROGRESS = "nong_opkot_8q_progress";

// ✅ 1. เพิ่มตัวแปรสำหรับ Loading State
let isProcessing = false;

// --- Event Listener ---
document.addEventListener("DOMContentLoaded", () => {
  const btnNo = document.getElementById("btn-8q-no");
  const btnYes = document.getElementById("btn-8q-yes");

  if (btnNo) {
    btnNo.addEventListener("click", () => answer8Q(false));
  }
  if (btnYes) {
    btnYes.addEventListener("click", () => answer8Q(true));
  }
});

/**
 * ✅ 2. เริ่มทำแบบทดสอบ 8Q พร้อม Loading
 */
export function start8Q() {
  showLoading();

  try {
    const savedProgress = localStorage.getItem(STORAGE_KEY_PROGRESS);

    if (savedProgress) {
      // ถามว่าจะทำต่อหรือเริ่มใหม่
      hideLoading();

      Swal.fire({
        title: "พบข้อมูลค้างไว้",
        text: "คุณทำแบบประเมิน 8Q ค้างไว้ ต้องการทำต่อจากเดิมไหมครับ?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "ทำต่อ",
        cancelButtonText: "เริ่มใหม่",
        confirmButtonColor: "#4da6ff",
        cancelButtonColor: "#ff6b6b",
      }).then((result) => {
        if (result.isConfirmed) {
          // ทำต่อจากเดิม
          try {
            const data = JSON.parse(savedProgress);
            index8Q = data.index;
            totalScore8Q = data.score;
            isSubQuestionMode = data.isSub;

            loadQuestion8Q();
            goToPage("page-17");
          } catch (error) {
            console.error("Error parsing saved progress:", error);
            Swal.fire({
              icon: "error",
              title: "ข้อมูลเสียหาย",
              text: "ไม่สามารถกู้คืนข้อมูลได้ กรุณาเริ่มใหม่",
              confirmButtonText: "ตกลง",
            }).then(() => {
              resetAssessment();
              loadQuestion8Q();
              goToPage("page-17");
            });
          }
        } else {
          // เริ่มใหม่
          resetAssessment();
          loadQuestion8Q();
          goToPage("page-17");
        }
      });
      return;
    }

    // ถ้าไม่มีข้อมูลค้าง เริ่มใหม่เลย
    resetAssessment();
    loadQuestion8Q();
    hideLoading();
    goToPage("page-17");
  } catch (error) {
    hideLoading();
    console.error("Error starting 8Q:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถเริ่มแบบประเมินได้ กรุณาลองใหม่อีกครั้ง",
      confirmButtonText: "ตกลง",
    });
  }
}

/**
 * รีเซ็ตค่าเริ่มต้น
 */
function resetAssessment() {
  index8Q = 0;
  totalScore8Q = 0;
  isSubQuestionMode = false;
  localStorage.removeItem(STORAGE_KEY_PROGRESS);
}

/**
 * ✅ 3. บันทึกความคืบหน้าพร้อม Error Handling
 */
function saveProgress() {
  try {
    const data = {
      index: index8Q,
      score: totalScore8Q,
      isSub: isSubQuestionMode,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving progress:", error);
    // ไม่แสดง popup เพราะจะรบกวนการทำแบบทดสอบ
  }
}

/**
 * ✅ 4. ตอบคำถาม 8Q พร้อม Validation
 */
function answer8Q(isYes) {
  // ป้องกันการกดซ้ำ
  if (isProcessing) {
    console.warn("กำลังประมวลผล กรุณารอสักครู่");
    return;
  }

  isProcessing = true;

  try {
    // === กรณี: กำลังตอบคำถามย่อย ===
    if (isSubQuestionMode) {
      if (isYes) {
        totalScore8Q += EIGHT_Q_CRITERIA.subQuestion.scoreRisk;
      } else {
        totalScore8Q += EIGHT_Q_CRITERIA.subQuestion.scoreSafe;
      }

      isSubQuestionMode = false;
      index8Q++;

      saveProgress();
      checkNextStep();
      isProcessing = false;
      return;
    }

    // === กรณี: ตอบคำถามปกติ ===

    // 1. บวกคะแนน
    if (isYes) {
      totalScore8Q += EIGHT_Q_CRITERIA.questions[index8Q].score;
    }

    // 2. เช็คเงื่อนไขพิเศษ ข้อ 3
    if (index8Q === 2 && isYes) {
      isSubQuestionMode = true;
      saveProgress();
      loadQuestion8Q();
      isProcessing = false;
      return;
    }

    // 3. ไปข้อถัดไป
    index8Q++;
    saveProgress();
    checkNextStep();
  } catch (error) {
    console.error("Error answering question:", error);
    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถบันทึกคำตอบได้ กรุณาลองใหม่อีกครั้ง",
      confirmButtonText: "ตกลง",
    });
  } finally {
    isProcessing = false;
  }
}

/**
 * ตรวจสอบว่าจะไปข้อถัดไป หรือ จบการทำงาน
 */
function checkNextStep() {
  if (index8Q < EIGHT_Q_CRITERIA.questions.length) {
    loadQuestion8Q();
  } else {
    showResult8Q();
  }
}

/**
 * ✅ 5. โหลดคำถามพร้อม Accessibility
 */
function loadQuestion8Q() {
  const qText = document.getElementById("question-text-8q");
  const qBar = document.getElementById("q8-bar");
  const qProgressText = document.getElementById("q8-progress-text");

  // 1. จัดการข้อความคำถาม
  if (isSubQuestionMode) {
    if (qText) {
      const subText = EIGHT_Q_CRITERIA.subQuestion
        ? EIGHT_Q_CRITERIA.subQuestion.text
        : "ท่านสามารถควบคุมความอยากฆ่าตัวตายได้หรือไม่?";

      qText.innerHTML = subText;
      qText.style.color = "#d9534f";

      // ✅ Accessibility: เพิ่ม ARIA attributes
      qText.setAttribute("role", "alert");
      qText.setAttribute("aria-live", "polite");
    }
  } else {
    if (qText) {
      qText.style.color = "";
      qText.innerHTML = EIGHT_Q_CRITERIA.questions[index8Q].text;

      // ✅ Accessibility
      qText.setAttribute("role", "heading");
      qText.setAttribute("aria-level", "2");
    }
  }

  // 2. จัดการ Progress Bar
  if (qBar && qProgressText) {
    const total = EIGHT_Q_CRITERIA.questions.length;
    let currentDisplay = index8Q + 1;
    let percent = (currentDisplay / total) * 100;

    if (isSubQuestionMode) {
      percent = ((index8Q + 1.5) / total) * 100;
      qProgressText.innerText = `ข้อ 3 (เพิ่มเติม)`;
    } else {
      qProgressText.innerText = `ข้อ ${currentDisplay} / ${total}`;
    }

    qBar.style.width = percent + "%";

    // ✅ Accessibility: เพิ่ม ARIA
    qBar.setAttribute("role", "progressbar");
    qBar.setAttribute("aria-valuenow", Math.round(percent));
    qBar.setAttribute("aria-valuemin", "0");
    qBar.setAttribute("aria-valuemax", "100");
  }

  // ✅ เพิ่ม Focus Management
  if (qText) {
    qText.focus();
  }
}

/**
 * ✅ 6. แสดงผลลัพธ์พร้อม Error Handling
 */
async function showResult8Q() {
  showLoading();

  try {
    // ลบข้อมูลที่บันทึกไว้ชั่วคราว
    localStorage.removeItem(STORAGE_KEY_PROGRESS);

    goToPage("page-18");

    const circle = document.getElementById("score-circle-8q");
    const scoreText = document.getElementById("score-text-8q");
    const levelText = document.getElementById("level-text-8q");
    const messageText = document.getElementById("message-text-8q");
    const emergencyBox = document.getElementById("emergency-box");

    // Reset Class
    if (circle) circle.className = "score-circle";
    if (levelText) levelText.className = "mt-3 mb-2";

    // หาระดับจาก criteria
    const level = get8QLevel(totalScore8Q);

    if (level) {
      if (scoreText) scoreText.innerText = totalScore8Q;
      if (levelText) {
        levelText.innerText = level.label;
        levelText.style.color = level.color;
      }
      if (messageText) messageText.innerText = level.message;

      if (circle) circle.classList.add(level.class);

      // แสดงกล่องฉุกเฉิน ถ้ามีความเสี่ยงสูง
      if (emergencyBox) {
        emergencyBox.style.display = level.showEmergency ? "block" : "none";
      }

      // ✅ บันทึกผลพร้อม Error Handling
      try {
        await saveAssessmentResult("8Q", totalScore8Q, level.label, {
          message: level.message,
          showEmergency: level.showEmergency,
        });
        console.log("✅ บันทึกผล 8Q สำเร็จ");
      } catch (saveError) {
        console.error("❌ บันทึกผล 8Q ล้มเหลว:", saveError);
        // ไม่แสดง error ให้ผู้ใช้เพราะผลลัพธ์แสดงแล้ว
      }
    }

    hideLoading();
  } catch (error) {
    hideLoading();
    console.error("Error showing result:", error);

    Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถแสดงผลลัพธ์ได้ กรุณาลองใหม่อีกครั้ง",
      confirmButtonText: "ตกลง",
    }).then(() => {
      goToPage("page-10"); // กลับไปหน้าเมนู
    });
  }
}
