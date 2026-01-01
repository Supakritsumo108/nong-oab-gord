// ไฟล์: js/rq-assessment.js (ฉบับสมบูรณ์: Loop 3 ข้อ + หารเฉลี่ยเทียบเกณฑ์)

import { goToPage } from "./navigation.js";
import { saveAssessmentResult } from "./storage.js";

// --- ข้อมูลคำถาม 3 ข้อ ---
const RQ_QUESTIONS = [
  "ฉันเอาชนะอุปสรรคปัญหาต่างๆ ในชีวิตได้",
  "ฉันมีกำลังใจและได้รับการสนับสนุนจากคนรอบข้าง",
  "ฉันจัดการกับปัญหาและความเครียดของตนเองได้",
];

// --- ตัวแปรเก็บสถานะ ---
let currentRQIndex = 0;
let totalRQScore = 0; // คะแนนรวมดิบ (เต็ม 30)

// ทำให้ฟังก์ชัน answerRQ เรียกใช้ได้จาก HTML (onclick)
window.answerRQ = answerRQ;

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {
  // 1. ปุ่มจากหน้า Introduction -> ไปหน้าคำชี้แจง
  const btnStartIntro = document.getElementById("btn-start-rq-intro");
  if (btnStartIntro) {
    btnStartIntro.addEventListener("click", () => {
      goToPage("page-rq-instruction");
    });
  }

  // 2. ปุ่มจากหน้าคำชี้แจง -> เริ่มทำแบบทดสอบ
  const btnStartQuiz = document.getElementById("btn-start-rq-quiz");
  if (btnStartQuiz) {
    btnStartQuiz.addEventListener("click", () => {
      startRQAssessment();
    });
  }
});

/**
 * ฟังก์ชัน 1: เริ่มเข้าสู่ Flow ของ RQ
 * (ถูกเรียกใช้จาก st5-assessment.js เมื่อคะแนน ST5 >= 8)
 */
export function startRQFlow() {
  goToPage("page-rq-intro");
}

/**
 * ฟังก์ชัน 2: เริ่มทำแบบประเมิน (รีเซ็ตค่าและโหลดข้อแรก)
 */
export function startRQAssessment() {
  currentRQIndex = 0;
  totalRQScore = 0;
  loadRQQuestion();
  goToPage("page-rq-quiz");
}

/**
 * โหลดคำถามตามลำดับ
 */
function loadRQQuestion() {
  // อัปเดตข้อความคำถาม
  const questionEl = document.getElementById("rq-question-text");
  if (questionEl) {
    questionEl.innerText = RQ_QUESTIONS[currentRQIndex];
  }

  // อัปเดตเลขข้อ
  const noEl = document.getElementById("rq-current-no");
  if (noEl) {
    noEl.innerText = currentRQIndex + 1;
  }

  // อัปเดต Progress Bar
  const progressEl = document.getElementById("rq-progress-bar");
  if (progressEl) {
    const percent = ((currentRQIndex + 1) / RQ_QUESTIONS.length) * 100;
    progressEl.style.width = `${percent}%`;
  }
}

/**
 * ฟังก์ชันตอบคำถาม (เรียกจากปุ่ม 1-10 ใน HTML)
 * @param {number} score คะแนนที่เลือก
 */
function answerRQ(score) {
  console.log(`ข้อที่ ${currentRQIndex + 1} ได้คะแนน: ${score}`);
  totalRQScore += score;

  // เช็คว่าครบทุกข้อหรือยัง
  if (currentRQIndex < RQ_QUESTIONS.length - 1) {
    currentRQIndex++;
    // หน่วงเวลาเล็กน้อยให้ผู้ใช้เห็นว่ากดแล้ว
    setTimeout(() => {
      loadRQQuestion();
    }, 200);
  } else {
    // ครบ 3 ข้อ -> ไปหน้าสรุป
    showRQResult();
  }
}

/**
 * แสดงหน้าสรุปผล (ปรับปรุงใหม่ให้ตรงกับ HTML ล่าสุด)
 */
function showRQResult() {
  goToPage("page-rq-result");

  // คำนวณค่าเฉลี่ย (เต็ม 30 -> หาร 3 เหลือเต็ม 10)
  // ใช้ Math.round เพื่อปัดเศษให้เป็นจำนวนเต็ม 1-10
  const averageScore = Math.round(totalRQScore / 3);

  console.log(`Total: ${totalRQScore}, Average: ${averageScore}`);

  // อ้างอิง Element ID ตามไฟล์ index.html ล่าสุด
  const scoreText = document.getElementById("rq-result-score");
  const levelText = document.getElementById("rq-result-level");
  const msgText = document.getElementById("rq-result-msg");
  const circle = document.getElementById("rq-result-circle");

  // แสดงคะแนนเฉลี่ย
  if (scoreText) scoreText.innerText = averageScore;

  let label = "";
  let message = "";
  let colorClass = ""; // class สีจาก results.css

  // --- เกณฑ์การประเมิน (1-10) ---

  if (averageScore <= 4) {
    // 1-4 คะแนน
    label = "พลังใจน้อย";
    message =
      "เหนื่อยได้ พักได้ ไม่เป็นไรเลยนะคะ คุณยังทำได้ดีแล้ว ขอให้ค่อย ๆ เติมแรงใจให้ตัวเองนะคะ";
    colorClass = "level-severe"; // สีแดง/ส้ม
  } else if (averageScore <= 6) {
    // 5-6 คะแนน
    label = "พลังใจปานกลาง";
    message =
      "พี่ๆเข้มแข็งดีนะครับ แม้บางวันจะหนัก แต่คุณก็ผ่านมาได้เสมอ เป็นกำลังใจให้เดินต่ออย่างสบายใจนะคะ";
    colorClass = "level-mild"; // สีเหลือง
  } else {
    // 7-10 คะแนน
    label = "พลังใจยอดเยี่ยม";
    message =
      "พลังใจของคุณยอดเยี่ยมมากเลยค่ะ รักษาแรงใจดี ๆ นี้ไว้ และขอให้มีวันที่สดใสเสมอนะคะ";
    colorClass = "level-normal"; // สีเขียว
  }

  // อัปเดตหน้าจอ
  if (levelText) {
    levelText.innerText = label;
    // ล้าง class สีเก่าออกก่อน แล้วใส่สีใหม่
    levelText.className = "result-title " + colorClass;
  }

  if (msgText) msgText.innerText = message;

  if (circle) {
    circle.className = "result-circle " + colorClass;
  }

  // บันทึกผลลงเครื่อง (บันทึกทั้งคะแนนรวมและคะแนนเฉลี่ยถ้าต้องการ)
  saveAssessmentResult("RQ", averageScore, label);
}
