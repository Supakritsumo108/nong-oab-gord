// js/history.js

import { getHistoryFromFirebase } from "./storage.js";
import { goToPage, showLoading, hideLoading } from "./navigation.js";

export async function loadHistoryPage() {
  goToPage("page-history");

  showLoading();
  const container = document.getElementById("history-list-container");
  container.innerHTML = "";

  const history = await getHistoryFromFirebase();
  hideLoading();

  if (history.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: #888; margin-top: 50px;">
        <p style="font-size: 3rem;">📝</p>
        <p>ยังไม่มีประวัติการประเมิน</p>
      </div>
    `;
    return;
  }

  history.forEach((item) => {
    const card = document.createElement("div");
    card.className = "history-card";

    const dateStr = item.date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    let statusColor = "#28a745";
    if (item.levelLabel && item.levelLabel.includes("รุนแรง"))
      statusColor = "#dc3545";
    else if (item.levelLabel && item.levelLabel.includes("ปานกลาง"))
      statusColor = "#fd7e14";
    else if (item.levelLabel && item.levelLabel.includes("น้อย"))
      statusColor = "#ffc107";

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
