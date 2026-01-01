// ไฟล์: js/sidebar.js

import { goToPage } from "./navigation.js";
import { getUserProfile } from "./storage.js";

/**
 * ✅ 0. แสดง/ซ่อน Sidebar ตามสถานะ Login และหน้าปัจจุบัน
 */
function updateSidebarVisibility(currentPageId) {
  const sidebar = document.getElementById("sidebar");
  const hamburger = document.getElementById("hamburger-btn");
  const profile = getUserProfile();

  // ✅ รายการหน้าที่ต้องแสดง Sidebar (เพิ่มหน้ากิจกรรมทั้งหมด)
  const pagesWithSidebar = [
    "page-10", // หน้าเมนูหลัก
    "page-activities", // ✅ เพิ่ม - หน้าเลือกกิจกรรม
    "page-activity-game", // ✅ เพิ่ม - หน้าเล่นเกม
    "page-activity-music", // ✅ เพิ่ม - หน้าฟังเพลง
    "page-activity-fortune", // ✅ เพิ่ม - หน้าดูดวง
    "page-history", // ประวัติการประเมิน
    "page-settings", // ตั้งค่า
  ];

  // ❌ หน้าที่ต้องซ่อน Sidebar (หน้าแบบประเมินทั้งหมด)
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

  // ตรวจสอบว่า Login แล้วและอยู่ในหน้าที่ควรแสดง Sidebar
  const shouldShowSidebar =
    profile &&
    profile.username &&
    pagesWithSidebar.includes(currentPageId) &&
    !pagesWithoutSidebar.includes(currentPageId);

  if (shouldShowSidebar) {
    // แสดง Sidebar และ Hamburger
    if (sidebar) sidebar.classList.add("visible");
    if (hamburger) hamburger.classList.add("visible");
    document.body.classList.add("sidebar-enabled");
  } else {
    // ซ่อน Sidebar และ Hamburger
    if (sidebar) {
      sidebar.classList.remove("visible", "active");
    }
    if (hamburger) {
      hamburger.classList.remove("visible", "active");
    }
    document.body.classList.remove("sidebar-enabled");

    // ซ่อน Overlay ด้วย
    const overlay = document.getElementById("sidebar-overlay");
    if (overlay) overlay.classList.remove("active");
  }
}

/**
 * ✅ 1. เปิด/ปิด Sidebar (Mobile)
 */
/**
 * ✅ เปิด/ปิด Sidebar (Mobile) - ปรับปรุงใหม่
 */
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
      document.body.classList.remove("sidebar-active"); // ✅ เพิ่มบรรทัดนี้
    } else {
      // เปิด Sidebar
      sidebar.classList.add("active");
      overlay.classList.add("active");
      hamburger.classList.add("active");
      document.body.classList.add("sidebar-active"); // ✅ เพิ่มบรรทัดนี้
    }
  }
}

/**
 * ✅ ปิด Sidebar - ปรับปรุงใหม่
 */
function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const hamburger = document.getElementById("hamburger-btn");

  if (sidebar && overlay && hamburger) {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    hamburger.classList.remove("active");
    document.body.classList.remove("sidebar-active"); // ✅ เพิ่มบรรทัดนี้
  }
}

/**
 * ✅ 3. ทำเครื่องหมาย Menu Item ที่ Active
 */
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

/**
 * ✅ 4. โหลดข้อมูลผู้ใช้ลง Sidebar
 */
function loadUserInfo() {
  const profile = getUserProfile();
  const usernameEl = document.getElementById("sidebar-username");
  const emailEl = document.getElementById("sidebar-email");
  const avatarEl = document.querySelector(".sidebar-user-avatar");

  if (profile) {
    if (usernameEl) {
      usernameEl.textContent = profile.username || "ผู้ใช้งาน";
    }

    if (emailEl) {
      emailEl.textContent = profile.email || "user@example.com";
    }

    if (avatarEl && profile.username) {
      // แสดงตัวอักษรแรกของชื่อ
      const initial = profile.username.charAt(0).toUpperCase();
      avatarEl.textContent = initial;
    }
  }
}

/**
 * ✅ 5. จัดการคลิกเมนู
 */
function handleMenuClick(e) {
  e.preventDefault();

  const menuItem = e.currentTarget;
  const menuId = menuItem.id;
  const pageId = menuItem.getAttribute("data-page");

  // ตรวจสอบว่าเป็น Coming Soon หรือไม่
  if (menuItem.classList.contains("coming-soon")) {
    Swal.fire({
      icon: "info",
      title: "เร็วๆ นี้",
      text: "ฟีเจอร์นี้กำลังพัฒนา เร็วๆ นี้นะครับ!",
      confirmButtonText: "รอคอยอยู่",
      confirmButtonColor: "#4da6ff",
    });
    return;
  }

  // ทำเครื่องหมาย Active
  setActiveMenuItem(menuId);

  // ปิด Sidebar บนมือถือ
  closeSidebar();

  // ไปยังหน้าที่ต้องการ
  if (pageId) {
    // กรณีมี data-page (หน้าปกติ)
    if (pageId === "activities") {
      goToPage("page-activities");
    } else {
      goToPage(pageId);
    }

    // ✅ อัปเดต Sidebar Visibility หลังเปลี่ยนหน้า
    setTimeout(() => {
      updateSidebarVisibility(pageId);
    }, 100);
  } else {
    // กรณีไม่มี data-page (เมนูพิเศษ)
    handleSpecialMenu(menuId);
  }
}

/**
 * ✅ 6. จัดการเมนูพิเศษ
 */
function handleSpecialMenu(menuId) {
  switch (menuId) {
    case "menu-chatbot":
      console.log("เปิดแชทบอท");
      // TODO: เปิดหน้าแชทบอท
      break;

    case "menu-consult":
      console.log("นัดปรึกษา");
      // TODO: เปิดหน้านัดปรึกษา
      break;

    case "menu-history":
      console.log("ประวัติการประเมิน");
      goToPage("page-history");
      break;

    case "menu-settings":
      console.log("ตั้งค่า");
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
            <p><strong>เวอร์ชัน:</strong> 1.0.0</p>
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

/**
 * ✅ 7. Event Listeners
 */
export function initSidebar() {
  console.log("🎨 กำลังเริ่มต้น Sidebar...");

  // ปุ่ม Hamburger
  const hamburger = document.getElementById("hamburger-btn");
  if (hamburger) {
    hamburger.addEventListener("click", toggleSidebar);
  }

  // ปุ่มปิด Sidebar
  const closeBtn = document.getElementById("sidebar-close-btn");
  if (closeBtn) {
    closeBtn.addEventListener("click", closeSidebar);
  }

  // Overlay (คลิกปิด)
  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  // Menu Items
  const menuItems = document.querySelectorAll(".sidebar-menu-item");
  menuItems.forEach((item) => {
    item.addEventListener("click", handleMenuClick);
  });

  // User Info (คลิกแสดงข้อมูล)
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

  // โหลดข้อมูลผู้ใช้
  loadUserInfo();

  // ปิด Sidebar เมื่อเปลี่ยนหน้าจอ (Responsive)
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeSidebar();
    }
  });

  // ✅ เพิ่มการตรวจสอบ Visibility เมื่อเริ่มต้น
  const activePage = document.querySelector(".slide-page.active");
  if (activePage) {
    updateSidebarVisibility(activePage.id);
  }

  console.log("✅ Sidebar เริ่มต้นเรียบร้อย");
}

/**
 * ✅ 8. Export ฟังก์ชันสำคัญ
 */
export {
  toggleSidebar,
  closeSidebar,
  setActiveMenuItem,
  loadUserInfo,
  updateSidebarVisibility, // ✅ Export ฟังก์ชันใหม่
};
