// ไฟล์: js/sidebar.js

import { goToPage } from "./navigation.js";
import { getUserProfile } from "./storage.js";
import { loadHistoryPage } from "./history.js";
import { initSettings, loadSettingsPage } from "./settings.js";

function updateSidebarVisibility(currentPageId) {
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.getElementById("hamburger-btn");
  const profile = getUserProfile();

  // รายการหน้าที่ต้องแสดง Sidebar (เพิ่มหน้ากิจกรรมทั้งหมด)
  const pagesWithSidebar = [
    "page-10", // หน้าเมนูหลัก
    "page-activities",
    "page-activity-game",
    "page-activity-music",
    "page-activity-fortune",
    "page-history",
    "page-settings",
  ];

  // หน้าที่ต้องซ่อน Sidebar (หน้าแบบประเมินทั้งหมด)
  const pagesWithoutSidebar = [
    "page-11", // ST-5 Quiz
    "page-12", // ST-5 Result
    "page-rq-intro",
    "page-rq-instruction",
    "page-rq-quiz",
    "page-rq-result",
    "page-2q-intro",
    "page-13", // 2Q Quiz
    "page-14", // 2Q Result
    "page-15", // 9Q Quiz
    "page-16", // 9Q Result
    "page-17", // 8Q Quiz
    "page-18", // 8Q Result
  ];

  const shouldShowSidebar =
    profile &&
    profile.username &&
    pagesWithSidebar.includes(currentPageId) &&
    !pagesWithoutSidebar.includes(currentPageId);

  if (shouldShowSidebar) {
    if (sidebar) sidebar.classList.add("visible");
    if (hamburger) hamburger.classList.add("visible");
    document.body.classList.add("sidebar-enabled");
  } else {
    if (sidebar) {
      sidebar.classList.remove("visible", "active");
    }
    if (hamburger) {
      hamburger.classList.remove("visible", "active");
    }
    document.body.classList.remove("sidebar-enabled");

    const overlay = document.getElementById("sidebar-overlay");
    if (overlay) overlay.classList.remove("active");
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const hamburger = document.getElementById("hamburger-btn");

  if (sidebar && overlay && hamburger) {
    const isActive = sidebar.classList.contains("active");

    if (isActive) {
      // ปิด Sidebar
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      hamburger.classList.remove("active");
      document.body.classList.remove("sidebar-active");
    } else {
      // เปิด Sidebar
      sidebar.classList.add("active");
      overlay.classList.add("active");
      hamburger.classList.add("active");
      document.body.classList.add("sidebar-active");
    }
  }
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const hamburger = document.getElementById("hamburger-btn");

  if (sidebar && overlay && hamburger) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    hamburger.classList.remove("active");
    document.body.classList.remove("sidebar-active");
  }
}

function setActiveMenuItem(menuId) {
  // ลบ active ออกจากทุก item
  document.querySelectorAll(".sidebar-menu-item").forEach((item) => {
    item.classList.remove("active");
  });

  // เพิ่ม active ให้ item ที่เลือก
  const activeItem = document.getElementById(menuId);
  if (activeItem) {
    activeItem.classList.add("active");
  }
}

function loadUserInfo() {
  const profile = getUserProfile();
  const sidebarName = document.getElementById("sidebar-username");
  const sidebarEmail = document.getElementById("sidebar-email");
  const sidebarAvatar = document.querySelector(".sidebar-user-avatar");
  const mainPageName = document.getElementById("display-name");

  if (profile) {
    const displayName = profile.username || "ผู้ใช้งาน";
    if (sidebarName) sidebarName.textContent = displayName;
    if (sidebarEmail)
      sidebarEmail.textContent = profile.email || "user@example.com";
    if (sidebarAvatar) {
      if (profile.profileImage) {
        // ✅ กรณีมีรูปภาพ
        sidebarAvatar.innerHTML = `<img src="${profile.profileImage}" alt="Profile" style="width: 100%; height: 100%; object-fit: cover;">`;
        sidebarAvatar.style.backgroundColor = "transparent";
        sidebarAvatar.style.display = "block";
        sidebarAvatar.style.overflow = "hidden";
      } else {
        // ❌ กรณีไม่มีรูปภาพ
        sidebarAvatar.innerHTML = "";
        sidebarAvatar.textContent = displayName.charAt(0).toUpperCase();
        sidebarAvatar.style.backgroundColor = "white";
        sidebarAvatar.style.display = "flex";
      }
    }

    if (mainPageName) {
      mainPageName.textContent = displayName;
    }
  } else {
    // กรณี Guest / ยังไม่ Login
    if (sidebarName) sidebarName.textContent = "ผู้เยี่ยมชม";
    if (sidebarEmail) sidebarEmail.textContent = "กรุณาเข้าสู่ระบบ";
    if (mainPageName) mainPageName.textContent = "ผู้เยี่ยมชม";
    if (sidebarAvatar) {
      sidebarAvatar.innerHTML = "👤";
      sidebarAvatar.style.backgroundColor = "white";
    }
  }
}

// ✅ จุดที่แก้ไขหลัก: ปรับปรุง Logic การคลิกเมนู
function handleMenuClick(e) {
  const menuItem = e.currentTarget;

  // 1. เช็คก่อนว่าเป็นเมนู Coming Soon หรือไม่
  if (menuItem.classList.contains("coming-soon")) {
    e.preventDefault(); // ห้ามเปลี่ยนหน้า
    Swal.fire({
      icon: "info",
      title: "เร็วๆ นี้",
      text: "ฟีเจอร์นี้กำลังพัฒนา เร็วๆ นี้นะครับ!",
      confirmButtonText: "กลับสู่หน้าหลัก ➜",
      confirmButtonColor: "#4da6ff",
    });
    return;
  }

  // 2. ✅ เช็คว่าเป็นลิงก์จริงหรือไม่ (เช่น chatbot/chat.html)
  const targetLink = menuItem.getAttribute("href");
  // ถ้ามีลิงก์ และลิงก์ไม่ใช่เครื่องหมาย # -> ปล่อยให้ Browser ทำงานปกติ (เปลี่ยนหน้า)
  if (
    targetLink &&
    targetLink !== "#" &&
    !targetLink.startsWith("javascript")
  ) {
    return;
  }

  // 3. ถ้าไม่ใช่ลิงก์จริง (เป็น #) ให้ใช้ระบบ SPA เดิม (ห้ามเปลี่ยนหน้า)
  e.preventDefault();

  const menuId = menuItem.id;
  const pageId = menuItem.getAttribute("data-page");

  setActiveMenuItem(menuId);
  closeSidebar();

  if (pageId) {
    if (pageId === "activities") {
      goToPage("page-activities");
    } else {
      goToPage(pageId);
    }

    // อัปเดต Sidebar Visibility หลังเปลี่ยนหน้า
    setTimeout(() => {
      updateSidebarVisibility(pageId);
    }, 100);
  } else {
    // กรณีไม่มี data-page (เมนูพิเศษ)
    handleSpecialMenu(menuId);
  }
}

function handleSpecialMenu(menuId) {
  switch (menuId) {
    // case "menu-chatbot":  <-- ไม่ต้องใช้แล้ว เพราะ href ทำงานแล้ว

    case "menu-consult":
      console.log("นัดปรึกษา");
      break;

    case "menu-history":
      console.log("📂 เปิดหน้าประวัติการประเมิน");
      loadHistoryPage();
      break;

    case "menu-settings":
      console.log("⚙️ เปิดหน้าตั้งค่า");
      initSettings();
      loadSettingsPage();
      goToPage("page-settings");
      break;

    case "menu-about":
      console.log("เกี่ยวกับ");
      Swal.fire({
        title: "เกี่ยวกับน้องโอบกอด",
        html: `
          <div style="text-align: left; padding: 10px;">
            <p><strong>น้องโอบกอด</strong> คือแอปพลิเคชันสำหรับคัดกรอง ประเมิน และดูแลสุขภาพจิตใจ</p>
            <br>
            <p><strong>พัฒนาโดย:</strong><br>วิทยาลัยพยาบาลบรมราชชนนี กรุงเทพ</p>
            <br>
            <p><strong>เวอร์ชัน:</strong> 1.1.0</p>
          </div>
        `,
        confirmButtonText: "ปิด",
        confirmButtonColor: "#4da6ff",
      });
      break;

    default:
      console.log("เมนูไม่รู้จัก:", menuId);
  }
}

export function initSidebar() {
  console.log("🎨 กำลังเริ่มต้น Sidebar...");

  const hamburger = document.getElementById("hamburger-btn");
  if (hamburger) {
    hamburger.addEventListener("click", toggleSidebar);
  }

  const closeBtn = document.getElementById("sidebar-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeSidebar);
  }

  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  const menuItems = document.querySelectorAll(".sidebar-menu-item");
  menuItems.forEach((item) => {
    item.addEventListener("click", handleMenuClick);
  });

  const userInfo = document.getElementById("sidebar-user-info");
  if (userInfo) {
    userInfo.addEventListener("click", () => {
      const profile = getUserProfile();
      if (profile) {
        Swal.fire({
          title: "ข้อมูลผู้ใช้",
          html: `
            <div style="text-align: left; padding: 10px;">
              <p><strong>ชื่อ:</strong> ${profile.username || "-"}</p>
              <p><strong>อีเมล:</strong> ${profile.email || "-"}</p>
              <p><strong>เพศ:</strong> ${
                profile.gender === "male"
                  ? "ชาย"
                  : profile.gender === "female"
                    ? "หญิง"
                    : "อื่นๆ"
              }</p>
              <p><strong>อายุ:</strong> ${profile.age || "-"} ปี</p>
            </div>
          `,
          confirmButtonText: "ปิด",
          confirmButtonColor: "#4da6ff",
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "ไม่พบข้อมูล",
          text: "กรุณาเข้าสู่ระบบก่อน",
          confirmButtonText: "ตกลง",
        });
      }
    });
  }

  loadUserInfo();

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });

  const activePage = document.querySelector(".slide-page.active");
  if (activePage) {
    updateSidebarVisibility(activePage.id);
  }
}

export {
  toggleSidebar,
  closeSidebar,
  setActiveMenuItem,
  loadUserInfo,
  updateSidebarVisibility,
};

