// js/accessibility.js

export function addAriaLabels() {
  document.querySelectorAll('[id*="progress"], [id*="bar"]').forEach((el) => {
    if (!el.getAttribute("role")) {
      el.setAttribute("role", "progressbar");
      el.setAttribute("aria-valuemin", "0");
      el.setAttribute("aria-valuemax", "100");
    }
  });

  document.querySelectorAll("button:not([aria-label])").forEach((btn) => {
    const text = btn.innerText || btn.textContent;
    if (text) {
      btn.setAttribute("aria-label", text.trim());
    }
  });

  document
    .querySelectorAll("input:not([aria-label]), select:not([aria-label])")
    .forEach((input) => {
      const label = input.previousElementSibling;
      if (label && label.tagName === "LABEL") {
        const labelText = label.innerText || label.textContent;
        input.setAttribute("aria-label", labelText.trim());
      }
    });

  document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
    if (!heading.getAttribute("role")) {
      heading.setAttribute("role", "heading");
      const level = heading.tagName.charAt(1);
      heading.setAttribute("aria-level", level);
    }
  });
}

export function enableKeyboardNavigation() {
  document
    .querySelectorAll("button, a, input, select, textarea")
    .forEach((el) => {
      if (!el.hasAttribute("tabindex")) {
        el.setAttribute("tabindex", "0");
      }
    });

  document.querySelectorAll('[role="button"]:not(button)').forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const swalContainer = document.querySelector(".swal2-container");
      if (swalContainer) {
        Swal.close();
      }
    }
  });
}

export function manageFocus() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === "class") {
        const target = mutation.target;
        if (
          target.classList.contains("active") &&
          target.classList.contains("slide-page")
        ) {
          const mainHeading = target.querySelector('h1, h2, [role="heading"]');
          const mainQuestion = target.querySelector('[id*="question"]');
          const firstInput = target.querySelector("input, select, button");

          if (mainQuestion) {
            mainQuestion.setAttribute("tabindex", "-1");
            mainQuestion.focus();
          } else if (mainHeading) {
            mainHeading.setAttribute("tabindex", "-1");
            mainHeading.focus();
          } else if (firstInput) {
            firstInput.focus();
          }
        }
      }
    });
  });

  document.querySelectorAll(".slide-page").forEach((page) => {
    observer.observe(page, { attributes: true });
  });
}

export function addSkipNavigation() {
  const skipLink = document.createElement("a");
  skipLink.href = "#main-content";
  skipLink.innerText = "ข้ามไปยังเนื้อหาหลัก";
  skipLink.className = "skip-link";
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 0;
    background: #0056b3;
    color: white;
    padding: 8px;
    text-decoration: none;
    z-index: 100;
  `;

  skipLink.addEventListener("focus", () => {
    skipLink.style.top = "0";
  });

  skipLink.addEventListener("blur", () => {
    skipLink.style.top = "-40px";
  });

  document.body.insertBefore(skipLink, document.body.firstChild);

  const mainContent = document.querySelector(
    ".content-wrapper, .slider-container"
  );
  if (mainContent && !mainContent.id) {
    mainContent.id = "main-content";
  }
}

export function announceToScreenReader(message, priority = "polite") {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
  announcement.textContent = message;

  document.body.appendChild(announcement);

  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

export function addFocusStyles() {
  const style = document.createElement("style");
  style.textContent = `
    /* Focus Styles */
    *:focus {
      outline: 3px solid #4da6ff !important;
      outline-offset: 2px !important;
    }

    /* ซ่อน outline เมื่อใช้ mouse */
    *:focus:not(:focus-visible) {
      outline: none !important;
    }

    /* แสดง outline เมื่อใช้ keyboard */
    *:focus-visible {
      outline: 3px solid #4da6ff !important;
      outline-offset: 2px !important;
    }

    /* Screen Reader Only Class */
    .sr-only {
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }

    /* Skip Link */
    .skip-link:focus {
      position: absolute;
      top: 0 !important;
      left: 0;
      z-index: 10000;
    }
  `;
  document.head.appendChild(style);
}

export function setupLiveRegions() {
  const liveRegion = document.createElement("div");
  liveRegion.id = "live-region";
  liveRegion.setAttribute("role", "status");
  liveRegion.setAttribute("aria-live", "polite");
  liveRegion.setAttribute("aria-atomic", "true");
  liveRegion.className = "sr-only";
  document.body.appendChild(liveRegion);

  const alertRegion = document.createElement("div");
  alertRegion.id = "alert-region";
  alertRegion.setAttribute("role", "alert");
  alertRegion.setAttribute("aria-live", "assertive");
  alertRegion.setAttribute("aria-atomic", "true");
  alertRegion.className = "sr-only";
  document.body.appendChild(alertRegion);
}

export function updateLiveRegion(message, isAlert = false) {
  const regionId = isAlert ? "alert-region" : "live-region";
  const region = document.getElementById(regionId);

  if (region) {
    region.textContent = message;

    setTimeout(() => {
      region.textContent = "";
    }, 3000);
  }
}

export function addAccessibleTooltips() {
  document.querySelectorAll("[title]").forEach((el) => {
    const title = el.getAttribute("title");
    el.setAttribute("aria-label", title);

    const tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.textContent = title;
    tooltip.style.cssText = `
      position: absolute;
      background: #333;
      color: white;
      padding: 5px 10px;
      border-radius: 5px;
      font-size: 0.9rem;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
      z-index: 1000;
    `;

    el.style.position = "relative";
    el.appendChild(tooltip);

    el.addEventListener("mouseenter", () => {
      tooltip.style.opacity = "1";
    });

    el.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });

    el.addEventListener("focus", () => {
      tooltip.style.opacity = "1";
    });

    el.addEventListener("blur", () => {
      tooltip.style.opacity = "0";
    });
  });
}

export function initAccessibility() {
  addFocusStyles();
  addAriaLabels();
  enableKeyboardNavigation();
  manageFocus();
  addSkipNavigation();
  setupLiveRegions();
  addAccessibleTooltips();
  announceToScreenReader("แอปพลิเคชันพร้อมใช้งาน กรุณาใช้ Tab เพื่อนำทาง");
}

export function checkAccessibilityScore() {
  const issues = [];

  const imagesWithoutAlt = document.querySelectorAll("img:not([alt])");
  if (imagesWithoutAlt.length > 0) {
    issues.push(`พบ ${imagesWithoutAlt.length} รูปภาพที่ไม่มี alt text`);
  }

  const buttonsWithoutLabel = document.querySelectorAll(
    "button:not([aria-label]):empty"
  );
  if (buttonsWithoutLabel.length > 0) {
    issues.push(`พบ ${buttonsWithoutLabel.length} ปุ่มที่ไม่มี label`);
  }

  const inputsWithoutLabel = document.querySelectorAll(
    "input:not([aria-label])"
  );
  const unlabeledInputs = Array.from(inputsWithoutLabel).filter((input) => {
    return (
      !input.previousElementSibling ||
      input.previousElementSibling.tagName !== "LABEL"
    );
  });
  if (unlabeledInputs.length > 0) {
    issues.push(`พบ ${unlabeledInputs.length} ช่องกรอกข้อมูลที่ไม่มี label`);
  }

  const lowContrastElements = [];
  document.querySelectorAll("*").forEach((el) => {
    const style = window.getComputedStyle(el);
    const color = style.color;
    const bgColor = style.backgroundColor;
  });

  if (issues.length > 0) {
    console.warn("⚠️ พบปัญหา Accessibility:", issues);
  }

  return {
    score: issues.length === 0 ? 100 : Math.max(0, 100 - issues.length * 10),
    issues,
  };
}
