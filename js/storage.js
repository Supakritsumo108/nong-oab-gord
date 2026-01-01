// ไฟล์: js/storage.js
// จัดการการบันทึกและดึงข้อมูลจาก localStorage และ Firebase

import {
  collection,
  addDoc,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const STORAGE_KEYS = {
  USER_PROFILE: "nong_opkot_user_profile",
  ASSESSMENT_HISTORY: "nong_opkot_assessment_history",
};

// --- ตัวแปรสำหรับเก็บ instance ของ Firebase ---
let db = null;
let auth = null;

/**
 * ฟังก์ชันสำหรับรับค่า db และ auth มาจาก main.js
 */
export function initFirebase(firestoreDb, firebaseAuth) {
  db = firestoreDb;
  auth = firebaseAuth;
  console.log("🔥 Storage Module เชื่อมต่อกับ Firebase แล้ว");
}

// ========== User Profile ==========

/**
 * บันทึกข้อมูลโปรไฟล์ผู้ใช้
 */
export function saveUserProfile(profileData) {
  try {
    localStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profileData)
    );
    console.log("✅ บันทึกโปรไฟล์สำเร็จ");
    return true;
  } catch (error) {
    console.error("❌ บันทึกโปรไฟล์ไม่สำเร็จ:", error);
    return false;
  }
}

/**
 * ดึงข้อมูลโปรไฟล์ผู้ใช้
 */
export function getUserProfile() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ ดึงโปรไฟล์ไม่สำเร็จ:", error);
    return null;
  }
}

/**
 * ลบข้อมูลโปรไฟล์
 */
export function clearUserProfile() {
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  console.log("🗑️ ลบโปรไฟล์แล้ว");
}

// ========== Assessment History ==========

/**
 * บันทึกผลการประเมิน (ลงทั้ง Local และ Firebase)
 */
export async function saveAssessmentResult(
  testName,
  score,
  level,
  additionalData = {}
) {
  // 1. ส่วนของ LocalStorage (โค้ดเดิม)
  try {
    // ดึงประวัติเก่า
    const history = getAssessmentHistory();

    // สร้างรายการใหม่
    const newEntry = {
      id: Date.now(), // ใช้ timestamp เป็น ID
      testName,
      score,
      level,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    // เพิ่มรายการใหม่เข้าไป (ใหม่สุดอยู่ด้านบน)
    history.unshift(newEntry);

    // จำกัดไว้ไม่เกิน 50 รายการ
    const limitedHistory = history.slice(0, 50);

    // บันทึกกลับลง localStorage
    localStorage.setItem(
      STORAGE_KEYS.ASSESSMENT_HISTORY,
      JSON.stringify(limitedHistory)
    );

    console.log(`✅ [Local] บันทึกผล ${testName} สำเร็จ:`, newEntry);
  } catch (error) {
    console.error("❌ [Local] บันทึกผลการประเมินไม่สำเร็จ:", error);
  }

  // 2. ส่วนของ Firebase Firestore (เพิ่มเข้ามาใหม่)
  if (db && auth && auth.currentUser) {
    try {
      const uid = auth.currentUser.uid;
      // บันทึกลง sub-collection: users/{uid}/assessments/{autoID}
      const assessmentsRef = collection(db, "users", uid, "assessments");

      await addDoc(assessmentsRef, {
        testName: testName,
        score: score,
        level: level, // บันทึก object level ลงไปทั้งก้อน
        additionalData: additionalData,
        createdAt: serverTimestamp(), // ใช้เวลาของ Server
        clientTimestamp: new Date().toISOString(),
      });

      console.log(`🔥 [Firebase] บันทึกผล ${testName} ขึ้น Cloud สำเร็จ!`);
    } catch (error) {
      console.error("❌ [Firebase] บันทึกผลไม่สำเร็จ:", error);
      // ไม่ return false เพราะ LocalStorage บันทึกได้แล้ว
    }
  } else {
    console.warn(
      "⚠️ ไม่ได้เชื่อมต่อ Firebase หรือไม่ได้ Login -> บันทึกเฉพาะในเครื่อง"
    );
  }

  return true;
}

/**
 * ดึงประวัติการประเมินทั้งหมด
 */
export function getAssessmentHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("❌ ดึงประวัติไม่สำเร็จ:", error);
    return [];
  }
}

/**
 * ดึงประวัติการประเมินแบบเฉพาะ (เช่น ST-5 เท่านั้น)
 */
export function getAssessmentByType(testName) {
  const history = getAssessmentHistory();
  return history.filter((item) => item.testName === testName);
}

/**
 * ดึงผลการประเมินล่าสุด
 */
export function getLatestAssessment(testName = null) {
  const history = getAssessmentHistory();

  if (testName) {
    return history.find((item) => item.testName === testName) || null;
  }

  return history[0] || null;
}

/**
 * ลบประวัติการประเมินทั้งหมด
 */
export function clearAssessmentHistory() {
  localStorage.removeItem(STORAGE_KEYS.ASSESSMENT_HISTORY);
  console.log("🗑️ ลบประวัติการประเมินทั้งหมดแล้ว");
}

/**
 * ลบรายการเฉพาะ
 */
export function deleteAssessmentById(id) {
  try {
    const history = getAssessmentHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(
      STORAGE_KEYS.ASSESSMENT_HISTORY,
      JSON.stringify(filtered)
    );
    console.log(`🗑️ ลบรายการ ID ${id} แล้ว`);
    return true;
  } catch (error) {
    console.error("❌ ลบรายการไม่สำเร็จ:", error);
    return false;
  }
}

// ========== Utility ==========

/**
 * ลบข้อมูลทั้งหมด (Reset ระบบ)
 */
export function clearAllData() {
  clearUserProfile();
  clearAssessmentHistory();
  console.log("🔄 ล้างข้อมูลทั้งหมดแล้ว");
}

/**
 * ตรวจสอบว่ามี localStorage support หรือไม่
 */
export function isLocalStorageAvailable() {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}
