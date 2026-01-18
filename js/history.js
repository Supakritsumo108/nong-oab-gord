// สร้างไฟล์ใหม่: js/history.js

import { getHistoryFromFirebase } from "./storage.js";
import { goToPage, showLoading, hideLoading } from "./navigation.js";

/**
 * ฟังก์ชันหลักสำหรับโหลดและแสดงประวัติ
 */
export async function loadHistoryPage() {
  // 1. ไปยังหน้า History
  goToPage("page-history");

  // 2. แสดง Loading และเคลียร์ข้อมูลเก่า
  showLoading();
  const container = document.getElementById("history-list-container");
  container.innerHTML = ""; // ล้างรายการเก่า

  // 3. ดึงข้อมูล
  const history = await getHistoryFromFirebase();
  hideLoading();

  // 4. ถ้าไม่มีข้อมูล
  if (history.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #888; margin-top: 50px;">
        <p style="font-size: 3rem;">📝</p>
        <p>ยังไม่มีประวัติการประเมิน</p>
      </div>
    `;
    return;
  }

  // 5. วนลูปสร้างการ์ดรายการ
  history.forEach((item) => {
    const card = document.createElement("div");
    card.className = "history-card"; // เราจะไปเพิ่ม CSS นี้ทีหลัง

    // จัดรูปแบบวันที่ (เช่น 17 ม.ค. 2567 12:30)
    const dateStr = item.date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // กำหนดสีตามผลประเมิน (Optional: ปรับ Logic ได้ตามต้องการ)
    let statusColor = "#28a745"; // เขียว (ปกติ)
    if (item.levelLabel && item.levelLabel.includes("รุนแรง"))
      statusColor = "#dc3545"; // แดง
    else if (item.levelLabel && item.levelLabel.includes("ปานกลาง"))
      statusColor = "#fd7e14"; // ส้ม
    else if (item.levelLabel && item.levelLabel.includes("น้อย"))
      statusColor = "#ffc107"; // เหลือง

    card.innerHTML = `
      <div class="history-header">
        <span class="history-test-name">${item.testName}</span>
        <span class="history-date">${dateStr}</span>
      </div>
      <div class="history-body">
        <div class="history-score">
          คะแนน: <strong>${item.score}</strong>
        </div>
        <div class="history-result" style="color: ${statusColor};">
          ${item.levelLabel || "บันทึกเรียบร้อย"}
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}
