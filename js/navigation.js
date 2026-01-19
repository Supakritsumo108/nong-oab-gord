// js/navigation.js

import { announceToScreenReader, updateLiveRegion } from "./accessibility.js";

export function goToPage(pageId) {
  const pages = document.querySelectorAll(".slide-page");
  const targetPage = document.getElementById(pageId);

  if (!targetPage) {
    console.error(`❌ ไม่พบหน้า: ${pageId}`);
    return false;
  }

  pages.forEach((page) => {
    page.classList.remove("active");
    page.setAttribute("aria-hidden", "true");
  });

  targetPage.classList.add("active");
  targetPage.setAttribute("aria-hidden", "false");

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
  
  const pageTitle = targetPage.querySelector("h1, h2")?.innerText || "หน้าใหม่";
  announceToScreenReader(`เปลี่ยนไปยัง ${pageTitle}`);
  updateSidebarVisibilityOnPageChange(pageId);
  return true;
}

export function showLoading(message = "กำลังโหลด...") {
  const overlay = document.getElementById("loading-overlay");
  const loadingText = document.querySelector(".loading-text");

  if (overlay) {
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    overlay.setAttribute("role", "alert");
    overlay.setAttribute("aria-live", "assertive");
    overlay.setAttribute("aria-busy", "true");
  }

  if (loadingText) {
    loadingText.textContent = message;
  }

  updateLiveRegion(message, false);

  document.querySelectorAll("button, a").forEach((el) => {
    el.setAttribute("data-was-disabled", el.disabled);
    el.disabled = true;
  });
}

export function hideLoading() {
  const overlay = document.getElementById("loading-overlay");

  if (overlay) {
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute("aria-busy", "false");
  }

  document.querySelectorAll("button, a").forEach((el) => {
    const wasDisabled = el.getAttribute("data-was-disabled") === "true";
    if (!wasDisabled) {
      el.disabled = false;
    }
    el.removeAttribute("data-was-disabled");
  });
}

export function showAssessmentLoading(testName) {
  const messages = {
    "ST-5": "กำลังเริ่มแบบประเมินความเครียด...",
    "2Q": "กำลังเริ่มแบบคัดกรองซึมเศร้า...",
    "9Q": "กำลังเริ่มแบบประเมินภาวะซึมเศร้า...",
    "8Q": "กำลังเริ่มแบบประเมินความเสี่ยงฆ่าตัวตาย...",
  };

  const message = messages[testName] || "กำลังเริ่มแบบประเมิน...";
  showLoading(message);
}

export function showProgressToast(message = "บันทึกอัตโนมัติ...") {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "info",
    title: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: "#e6f7ff",
    color: "#0056b3",
  });
}

export function showSuccessToast(message = "สำเร็จ!") {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "success",
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });

  updateLiveRegion(message, false);
}

export function showErrorToast(message = "เกิดข้อผิดพลาด") {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "error",
    title: message,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
  });

  updateLiveRegion(message, true);
}

export function showWarningToast(message = "คำเตือน") {
  Swal.fire({
    toast: true,
    position: "top-end",
    icon: "warning",
    title: message,
    showConfirmButton: false,
    timer: 4000,
    timerProgressBar: true,
  });

  updateLiveRegion(message, false);
}

export function previewImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    showErrorToast("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
    event.target.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showErrorToast("ไฟล์ใหญ่เกินไป (สูงสุด 2 MB)");
    event.target.value = "";
    return;
  }

  showLoading("กำลังโหลดรูปภาพ...");

  const reader = new FileReader();

  reader.onload = function () {
    const output = document.getElementById("preview-img");
    if (output) {
      output.src = reader.result;
      showSuccessToast("อัปโหลดรูปภาพสำเร็จ");
    }
    hideLoading();
  };

  reader.onerror = function (error) {
    console.error("Error reading file:", error);
    showErrorToast("ไม่สามารถอ่านไฟล์ได้");
    hideLoading();
  };

  reader.readAsDataURL(file);
}

export function showConfirmDialog(options = {}) {
  const defaultOptions = {
    title: "ยืนยันการทำรายการ",
    text: "คุณแน่ใจหรือไม่?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "ยืนยัน",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#4da6ff",
    cancelButtonColor: "#ff6b6b",
  };

  return Swal.fire({ ...defaultOptions, ...options });
}

export function showLoadingSkeleton(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="skeleton-loading" aria-label="กำลังโหลดข้อมูล" role="status">
      <div class="skeleton-line" style="width: 80%; height: 20px; background: #e0e0e0; margin: 10px 0; border-radius: 5px;"></div>
      <div class="skeleton-line" style="width: 60%; height: 20px; background: #e0e0e0; margin: 10px 0; border-radius: 5px;"></div>
      <div class="skeleton-line" style="width: 90%; height: 20px; background: #e0e0e0; margin: 10px 0; border-radius: 5px;"></div>
    </div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    @keyframes skeleton-loading {
      0% { opacity: 1; }
      50% { opacity: 0.4; }
      100% { opacity: 1; }
    }
    .skeleton-line {
      animation: skeleton-loading 1.5s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

export function setupHistoryManagement() {
  const originalGoToPage = goToPage;

  window.goToPage = function (pageId) {
    const result = originalGoToPage(pageId);
    if (result) {
      history.pushState({ page: pageId }, "", `#${pageId}`);
    }
    return result;
  };

  window.addEventListener("popstate", (event) => {
    if (event.state && event.state.page) {
      originalGoToPage(event.state.page);
    }
  });
}

export function scrollToElement(elementId, offset = 0) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const elementPosition =
    element.getBoundingClientRect().top + window.pageYOffset;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });

  setTimeout(() => {
    element.focus();
  }, 500);
}

function updateSidebarVisibilityOnPageChange(pageId) {
  import("./sidebar.js")
    .then((module) => {
      if (module.updateSidebarVisibility) {
        module.updateSidebarVisibility(pageId);
      }
    })
    .catch((error) => {
      console.warn("⚠️ ไม่สามารถอัปเดต Sidebar:", error);
    });
}
