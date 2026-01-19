// js/main.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInAnonymously,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  saveUserProfile,
  getUserProfile,
  initFirebase,
  clearUserProfile,
} from "./storage.js";
import { goToPage, showLoading, hideLoading } from "./navigation.js";
import { start2Q } from "./2q-assessment.js";
import { startST5 } from "./st5-assessment.js";
import { initGameActivity } from "./game-activity.js";
import { initMusicActivity } from "./music-activity.js";
import { initFortuneActivity } from "./fortune-activity.js";
import {
  initSidebar,
  loadUserInfo,
  updateSidebarVisibility,
} from "./sidebar.js";

const firebaseConfig = {
  apiKey: "AIzaSyDWp_S_WWCMR0PSU5zngs_szmO8retUxHE",
  authDomain: "nong-op-kot.firebaseapp.com",
  projectId: "nong-op-kot",
  storageBucket: "nong-op-kot.firebasestorage.app",
  messagingSenderId: "277210564838",
  appId: "1:277210564838:web:f3bbf6d7cf0b2d1c9ad327",
};

let app, auth, db;
let currentProfileImageBase64 = null;

function initializeFirebase() {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    initFirebase(db, auth);
    return true;
  } catch (error) {
    console.error("❌ Firebase ล้มเหลว:", error);
    showOfflineWarning();
    return false;
  }
}

function showOfflineWarning() {
  Swal.fire({
    icon: "warning",
    title: "โหมดออฟไลน์",
    text: "ไม่สามารถเชื่อมต่อ Firebase ได้ ข้อมูลจะถูกบันทึกในเครื่องเท่านั้น",
    confirmButtonText: "เข้าใจแล้ว",
    confirmButtonColor: "#ffb74d",
  });
}

function validateEmail(email) {
  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailPattern.test(email)) {
    return { valid: false, message: "รูปแบบอีเมลไม่ถูกต้อง" };
  }

  if (email.length < 5 || email.length > 100) {
    return { valid: false, message: "อีเมลยาวเกินไปหรือสั้นเกินไป" };
  }

  return { valid: true };
}

function validateProfile(name, gender, age) {
  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push("กรุณากรอกชื่อ");
  } else if (name.trim().length < 2) {
    errors.push("ชื่อต้องมีอย่างน้อย 2 ตัวอักษร");
  } else if (name.trim().length > 50) {
    errors.push("ชื่อยาวเกินไป (สูงสุด 50 ตัวอักษร)");
  } else if (!/^[\u0E00-\u0E7Fa-zA-Z\s]+$/.test(name.trim())) {
    errors.push("ชื่อต้องเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น");
  }

  if (!gender || !["male", "female", "other"].includes(gender)) {
    errors.push("กรุณาเลือกเพศ");
  }

  const ageNum = parseInt(age);
  if (!age || isNaN(ageNum)) {
    errors.push("กรุณากรอกอายุ");
  } else if (ageNum < 10 || ageNum > 120) {
    errors.push("อายุต้องอยู่ระหว่าง 10-120 ปี");
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

async function handleLogin() {
  const emailInput = document.getElementById("email");
  const email = emailInput.value.trim();

  if (!email) {
    Swal.fire({
      icon: "warning",
      title: "แจ้งเตือน",
      text: "กรุณากรอกอีเมลก่อนครับ",
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#ffb74d",
    });
    return;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    Swal.fire({
      icon: "error",
      title: "อีเมลไม่ถูกต้อง",
      text: emailValidation.message,
      confirmButtonText: "ลองใหม่",
    });
    return;
  }

  showLoading();

  try {
    if (!navigator.onLine) {
      throw new Error("ไม่มีการเชื่อมต่ออินเทอร์เน็ต");
    }

    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);

    let oldData = null;
    if (!querySnapshot.empty) {
      oldData = querySnapshot.docs[0].data();
    }

    await setDoc(
      doc(db, "users", user.uid),
      {
        email: email,
        loginAt: new Date(),
        uid: user.uid,
      },
      { merge: true },
    );

    hideLoading();

    let titleMsg = "ยินดีต้อนรับสมาชิกใหม่ครับ!";
    let textMsg = "กำลังพาเข้าสู่ระบบ...";

    if (oldData) {
      titleMsg = "ยินดีต้อนรับกลับครับ!";
      textMsg = "กำลังดึงข้อมูลเดิม...";
      restoreUserData(oldData);
    } else {
      const newUserProfile = {
        email: email,
        uid: user.uid,
        username: "",
        age: "",
        gender: "",
      };
      saveUserProfile(newUserProfile);
    }

    Swal.fire({
      icon: "success",
      title: titleMsg,
      text: textMsg,
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    }).then(() => {
      goToPage("page-2");
      if (updateSidebarVisibility) {
        setTimeout(() => {
          updateSidebarVisibility("page-2");
        }, 200);
      }
    });
  } catch (error) {
    hideLoading();
    console.error("Login Error:", error);

    let errorMessage = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";

    if (
      error.message.includes("network") ||
      error.message.includes("อินเทอร์เน็ต")
    ) {
      errorMessage =
        "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้ กรุณาตรวจสอบการเชื่อมต่อ";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่";
    }

    Swal.fire({
      icon: "error",
      title: "เข้าสู่ระบบไม่สำเร็จ",
      text: errorMessage,
      confirmButtonText: "ลองอีกครั้ง",
      footer: "<small>หากปัญหายังคงอยู่ กรุณาติดต่อผู้ดูแลระบบ</small>",
    });
  }
}

function restoreUserData(oldData) {
  if (oldData.username)
    document.getElementById("user-name").value = oldData.username;
  if (oldData.gender)
    document.getElementById("user-gender").value = oldData.gender;
  if (oldData.age) document.getElementById("user-age").value = oldData.age;

  if (oldData.profileImage) {
    const previewImg = document.getElementById("preview-img");
    if (previewImg) previewImg.src = oldData.profileImage;
    currentProfileImageBase64 = oldData.profileImage;
  }

  saveUserProfile(oldData);
}

async function handleSaveProfile() {
  const name = document.getElementById("user-name").value.trim();
  const gender = document.getElementById("user-gender").value;
  const age = document.getElementById("user-age").value;

  const validation = validateProfile(name, gender, age);
  if (!validation.valid) {
    Swal.fire({
      icon: "warning",
      title: "ข้อมูลไม่ถูกต้อง",
      html: validation.errors.map((err) => `• ${err}`).join("<br>"),
      confirmButtonText: "แก้ไข",
    });
    return;
  }

  const user = auth.currentUser;

  const localUser = getUserProfile();

  if (!user && !localUser) {
    Swal.fire({
      icon: "error",
      title: "เซสชันหมดอายุ",
      text: "กรุณา Login ใหม่ครับ",
      confirmButtonText: "กลับหน้าแรก",
    }).then(() => {
      goToPage("page-1");
    });
    return;
  }

  showLoading();

  try {
    const profileData = {
      username: name,
      gender: gender,
      age: parseInt(age),
      updatedAt: new Date(),
    };

    const fileInput = document.getElementById("profile-upload");
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];

      if (file.size > 2 * 1024 * 1024) {
        hideLoading();
        Swal.fire({
          icon: "error",
          title: "ไฟล์ใหญ่เกินไป",
          text: "กรุณาเลือกรูปภาพที่มีขนาดไม่เกิน 2 MB",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        hideLoading();
        Swal.fire({
          icon: "error",
          title: "ไฟล์ไม่ถูกต้อง",
          text: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
          confirmButtonText: "ตกลง",
        });
        return;
      }

      profileData.profileImage = await toBase64(file);
    } else if (currentProfileImageBase64) {
      profileData.profileImage = currentProfileImageBase64;
    }

    if (user) {
      await setDoc(doc(db, "users", user.uid), profileData, { merge: true });
    }

    const emailToKeep = localUser && localUser.email ? localUser.email : "";
    const uidToKeep = user ? user.uid : localUser ? localUser.uid : "";

    saveUserProfile({
      ...profileData,
      email: emailToKeep,
      uid: uidToKeep,
    });

    hideLoading();

    const displayName = document.getElementById("display-name");
    if (displayName) displayName.innerText = name;

    Swal.fire({
      icon: "success",
      title: "บันทึกข้อมูลเรียบร้อย!",
      text: "กำลังพาท่านไปหน้าถัดไป...",
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    }).then(() => {
      goToPage("page-3");
      if (loadUserInfo) loadUserInfo();
      if (updateSidebarVisibility) {
        setTimeout(() => {
          updateSidebarVisibility("page-3");
        }, 200);
      }
    });
  } catch (error) {
    hideLoading();
    console.error("Save Profile Error:", error);

    Swal.fire({
      icon: "error",
      title: "บันทึกไม่สำเร็จ",
      text: "เกิดข้อผิดพลาด: " + error.message,
      confirmButtonText: "ลองอีกครั้ง",
    });
  }
}

const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function handleImagePreview(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    Swal.fire({
      icon: "error",
      title: "ไฟล์ไม่ถูกต้อง",
      text: "กรุณาเลือกไฟล์รูปภาพเท่านั้น",
      confirmButtonText: "ตกลง",
    });
    event.target.value = "";
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    Swal.fire({
      icon: "error",
      title: "ไฟล์ใหญ่เกินไป",
      text: "กรุณาเลือกรูปภาพที่มีขนาดไม่เกิน 2 MB",
      confirmButtonText: "ตกลง",
    });
    event.target.value = "";
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const output = document.getElementById("preview-img");
    if (output) {
      output.src = reader.result;
      currentProfileImageBase64 = reader.result;
    }
  };
  reader.onerror = function () {
    Swal.fire({
      icon: "error",
      title: "อ่านไฟล์ไม่สำเร็จ",
      text: "กรุณาลองใหม่อีกครั้ง",
      confirmButtonText: "ตกลง",
    });
  };
  reader.readAsDataURL(file);
}

function handlePrivacyValidation() {
  const checkbox = document.getElementById("policy-agree");
  if (!checkbox || !checkbox.checked) {
    Swal.fire({
      icon: "warning",
      title: "คำชี้แจง",
      text: "กรุณายอมรับนโยบายความเป็นส่วนตัวก่อนครับ",
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#ffb74d",
    });
    return;
  }
  goToPage("page-6");
}

window.closeMenu = function () {
  const hamburger = document.getElementById("hamburger-btn");
  const navMenu = document.getElementById("nav-menu");

  if (hamburger) hamburger.classList.remove("active");
  if (navMenu) navMenu.classList.remove("active");
};

function checkAutoLogin() {
  const user = getUserProfile();

  if (user && user.email) {
    if (loadUserInfo) loadUserInfo();

    goToPage("page-10");

    if (updateSidebarVisibility) {
      setTimeout(() => {
        updateSidebarVisibility("page-10");
      }, 100);
    }
  } else {
    console.log("👤 ยังไม่ได้ Login หรือ Session หมดอายุ");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initializeFirebase();
  initSidebar();
  checkAutoLogin();

  document.body.addEventListener("click", (e) => {
    const targetBtn = e.target.closest("[data-goto]");

    if (targetBtn) {
      const pageId = targetBtn.getAttribute("data-goto");
      if (pageId) {
        goToPage(pageId);
      }
    }
  });

  window.addEventListener("online", () => {
    console.log("✅ กลับมาออนไลน์");
  });

  window.addEventListener("offline", () => {
    console.log("⚠️ ตัดการเชื่อมต่อ");
    Swal.fire({
      icon: "warning",
      title: "ไม่มีอินเทอร์เน็ต",
      text: "การเชื่อมต่อขาดหาย ข้อมูลจะถูกบันทึกในเครื่องเท่านั้น",
      confirmButtonText: "เข้าใจแล้ว",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
    });
  });

  const loginBtn = document.getElementById("login-btn");
  if (loginBtn) {
    loginBtn.addEventListener("click", handleLogin);
  }

  const saveProfileBtn = document.getElementById("save-profile-btn");
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", handleSaveProfile);
  }

  const profileUploadInput = document.getElementById("profile-upload");
  if (profileUploadInput) {
    profileUploadInput.addEventListener("change", handleImagePreview);
  }

  const acceptPolicyBtn = document.getElementById("btn-accept-policy");
  if (acceptPolicyBtn) {
    acceptPolicyBtn.addEventListener("click", handlePrivacyValidation);
  }

  const btnMenu2Q = document.getElementById("btn-menu-2q");
  if (btnMenu2Q) {
    btnMenu2Q.addEventListener("click", () => {
      start2Q();
    });
  }

  const btnMenuST5 = document.getElementById("btn-menu-st5");
  if (btnMenuST5) {
    btnMenuST5.addEventListener("click", () => {
      startST5();
    });
  }

  const btnActivityGame = document.getElementById("btn-activity-game");
  if (btnActivityGame) {
    btnActivityGame.addEventListener("click", () => {
      goToPage("page-activity-game");
      initGameActivity();
    });
  }

  const btnActivityMusic = document.getElementById("btn-activity-music");
  if (btnActivityMusic) {
    btnActivityMusic.addEventListener("click", () => {
      goToPage("page-activity-music");
      initMusicActivity();
    });
  }

  const btnActivityFortune = document.getElementById("btn-activity-fortune");
  if (btnActivityFortune) {
    btnActivityFortune.addEventListener("click", () => {
      goToPage("page-activity-fortune");
      initFortuneActivity();
    });
  }

  const logoutBtn = document.getElementById("menu-logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();

      Swal.fire({
        title: "ยืนยันการออกจากระบบ?",
        text: "คุณต้องเข้าสู่ระบบใหม่ในครั้งถัดไป",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ff6b6b",
        cancelButtonColor: "#a5a5a5",
        confirmButtonText: "ออกจากระบบ",
        cancelButtonText: "ยกเลิก",
      }).then((result) => {
        if (result.isConfirmed) {
          clearUserProfile();

          Swal.fire({
            icon: "success",
            title: "ออกจากระบบเรียบร้อย",
            showConfirmButton: false,
            timer: 1000,
          }).then(() => {
            window.location.reload();
          });
        }
      });
    });
  }
});
