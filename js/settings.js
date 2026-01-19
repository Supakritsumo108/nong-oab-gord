// js/settings.js

import {
  getUserProfile,
  saveUserProfile,
  clearAssessmentHistory,
} from "./storage.js";
import { loadUserInfo } from "./sidebar.js";

let isSettingsInit = false;

export function loadSettingsPage() {
  const profile = getUserProfile();

  const nameEl = document.getElementById("setting-display-name");
  const ageEl = document.getElementById("setting-display-age");

  if (nameEl)
    nameEl.innerText = profile && profile.username ? profile.username : "Guest";
  if (ageEl)
    ageEl.innerText = profile && profile.age ? `${profile.age} ปี` : "-";
}

export function initSettings() {
  if (isSettingsInit) return;
  const btnEditName = document.getElementById("btn-edit-name");
  if (btnEditName) {
    btnEditName.addEventListener("click", async () => {
      const profile = getUserProfile() || {};
      const { value: newName } = await Swal.fire({
        title: "แก้ไขชื่อเล่น",
        input: "text",
        inputValue: profile.username || "",
        showCancelButton: true,
        confirmButtonText: "บันทึก",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#4da6ff",
        inputValidator: (value) => {
          if (!value) return "กรุณากรอกชื่อเล่น!";
        },
      });

      if (newName) {
        Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
        profile.username = newName;
        await saveUserProfile(profile);
        saveUserProfile(profile);
        loadSettingsPage();
        loadUserInfo();
        Swal.fire({
          icon: "success",
          title: "บันทึกสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }

  const btnEditAge = document.getElementById("btn-edit-age");
  if (btnEditAge) {
    btnEditAge.addEventListener("click", async () => {
      const profile = getUserProfile() || {};
      const { value: newAge } = await Swal.fire({
        title: "แก้ไขอายุ",
        input: "number",
        inputValue: profile.age || "",
        showCancelButton: true,
        confirmButtonText: "บันทึก",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#4da6ff",
        inputAttributes: { min: 1, max: 120 },
      });

      if (newAge) {
        Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
        profile.age = parseInt(newAge);
        await saveUserProfile(profile);
        saveUserProfile(profile);
        loadSettingsPage();
        loadUserInfo();
        Swal.fire({
          icon: "success",
          title: "บันทึกสำเร็จ",
          showConfirmButton: false,
          timer: 1500,
        });
      }
    });
  }

  const btnClearHistory = document.getElementById("btn-clear-history");
  if (btnClearHistory) {
    btnClearHistory.addEventListener("click", () => {
      Swal.fire({
        title: "ลบประวัติการประเมิน?",
        text: "ข้อมูลผลการประเมินทั้งหมดในเครื่องจะหายไป",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#ccc",
        confirmButtonText: "ยืนยันลบ",
        cancelButtonText: "ยกเลิก",
      }).then(async (result) => {
        if (result.isConfirmed) {
          Swal.fire({ title: 'กำลังลบข้อมูล...', didOpen: () => Swal.showLoading() });
          await clearAssessmentHistory();
          Swal.fire('ลบเรียบร้อย!', 'ประวัติของคุณถูกล้างแล้ว', 'success');
        }
      });
    });
  }

  isSettingsInit = true;
}
