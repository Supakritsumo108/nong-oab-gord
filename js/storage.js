// ไฟล์: js/storage.js
// จัดการการบันทึกและดึงข้อมูลจาก localStorage และ Firebase

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ✅ ใช้ Key เดิมของคุณ
const STORAGE_KEYS = {
  USER_PROFILE: "nong_opkot_user_profile",
  ASSESSMENT_HISTORY: "nong_opkot_assessment_history",
};

let db = null;
let auth = null;

// ฟังก์ชันเริ่มต้นเชื่อมต่อ Firebase (ถูกเรียกจาก main.js)
export function initFirebase(firestoreDb, firebaseAuth) {
  db = firestoreDb;
  auth = firebaseAuth;
  console.log("🔥 Storage Module เชื่อมต่อกับ Firebase แล้ว");
}

// ======================================================
// 1. User Profile Management (สำคัญมากสำหรับการ Login)
// ======================================================

/**
 * ✅ ดึงข้อมูลจาก LocalStorage (ใช้ตอนเช็ค Login เมื่อเปิดเว็บ)
 */
export function getUserProfile() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ ดึงโปรไฟล์จาก Local ไม่สำเร็จ:", error);
    return null;
  }
}

/**
 * ✅ บันทึกข้อมูลโปรไฟล์ (ลงทั้ง Local และ Firebase)
 */
export async function saveUserProfile(profileData) {
  if (!profileData) return;

  // 1. บันทึก Local (สำคัญ! ต้องทำก่อนเพื่อให้แอปเห็นทันที)
  try {
    localStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profileData),
    );
  } catch (error) {
    console.error("❌ [Local] บันทึกโปรไฟล์ไม่สำเร็จ:", error);
  }

  // 2. บันทึก Firebase (ถ้า Login และเชื่อมต่ออยู่)
  if (auth && auth.currentUser) {
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "users", uid);

      // ✅ บันทึกทุกอย่างที่ส่งมา (รวมถึง email ที่เราเพิ่งเพิ่ม)
      await setDoc(userRef, profileData, { merge: true });

      console.log("🔥 Update Firestore Success:", profileData.email);
    } catch (error) {
      console.error("🔥 Firestore Error:", error);
    }
  } else {
    console.warn("⚠️ Auth is null/not ready, saved to Local only.");
  }
}

/**
 * ✅ ซิงค์ข้อมูลจาก Cloud มาลงเครื่อง (กรณี Login ที่เครื่องใหม่)
 */
export async function syncUserProfile() {
  if (!db || !auth || !auth.currentUser) {
    return null;
  }

  try {
    const uid = auth.currentUser.uid;
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const cloudData = docSnap.data();

      // อัปเดตลง Local ทันที
      localStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(cloudData),
      );

      console.log("☁️🔄 ซิงค์ข้อมูลโปรไฟล์จาก Cloud เรียบร้อย:", cloudData);
      return cloudData;
    } else {
      console.log("⚠️ ไม่พบข้อมูลบน Cloud (อาจเป็น User ใหม่)");
      return null;
    }
  } catch (error) {
    console.error("❌ ซิงค์ข้อมูลล้มเหลว:", error);
    return null;
  }
}

export function clearUserProfile() {
  localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
  console.log("🗑️ ลบโปรไฟล์ออกจากเครื่องแล้ว (Logout)");
}

// ======================================================
// 2. Assessment History Management (ประวัติการประเมิน)
// ======================================================

export async function saveAssessmentResult(
  testName,
  score,
  level,
  additionalData = {},
) {
  // 1. บันทึกลง Local (เพื่อให้ดูประวัติได้ทันทีไม่ต้องรอเน็ต)
  try {
    const history = getAssessmentHistory();
    const newEntry = {
      id: Date.now(), // ใช้เวลาเป็น ID ชั่วคราว
      testName,
      score,
      level,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    // เอาของใหม่ไว้บนสุด
    history.unshift(newEntry);

    // เก็บแค่ 50 รายการล่าสุดเพื่อประหยัดที่
    const limitedHistory = history.slice(0, 50);

    localStorage.setItem(
      STORAGE_KEYS.ASSESSMENT_HISTORY,
      JSON.stringify(limitedHistory),
    );
    console.log(`✅ [Local] บันทึกผล ${testName} สำเร็จ`);
  } catch (error) {
    console.error("❌ [Local] บันทึกผลผิดพลาด:", error);
  }

  // 2. บันทึกลง Firebase (ถ้ามีเน็ต)
  if (db && auth && auth.currentUser) {
    try {
      const uid = auth.currentUser.uid;
      const assessmentsRef = collection(db, "users", uid, "assessments");

      await addDoc(assessmentsRef, {
        testName: testName,
        score: score,
        level: level,
        additionalData: additionalData,
        createdAt: serverTimestamp(),
        clientTimestamp: new Date().toISOString(),
      });

      console.log(`🔥 [Firebase] บันทึกผล ${testName} ขึ้น Cloud สำเร็จ!`);
    } catch (error) {
      console.error("❌ [Firebase] บันทึกผลไม่สำเร็จ:", error);
    }
  }

  return true;
}

export function getAssessmentHistory() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ASSESSMENT_HISTORY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("❌ ดึงประวัติไม่สำเร็จ:", error);
    return [];
  }
}

export async function getHistoryFromFirebase() {
  if (!db || !auth || !auth.currentUser) {
    return getAssessmentHistory(); // ถ้าไม่ได้ Login ให้ดึงจากเครื่อง
  }

  try {
    const uid = auth.currentUser.uid;
    const q = query(
      collection(db, "users", uid, "assessments"),
      orderBy("createdAt", "desc"),
    );

    const querySnapshot = await getDocs(q);
    const historyData = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let dateObj = new Date();

      if (data.createdAt && data.createdAt.toDate) {
        dateObj = data.createdAt.toDate();
      } else if (data.clientTimestamp) {
        dateObj = new Date(data.clientTimestamp);
      }

      historyData.push({
        id: doc.id,
        ...data,
        date: dateObj,
      });
    });

    console.log(`✅ ดึงประวัติจาก Cloud ได้ ${historyData.length} รายการ`);
    return historyData;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงประวัติจาก Cloud:", error);
    // ถ้าดึง Cloud ไม่ได้ ให้เอาของ Local มาโชว์แก้ขัด
    return getAssessmentHistory();
  }
}

export async function clearAssessmentHistory() {
  // 1. ลบ Local
  localStorage.removeItem(STORAGE_KEYS.ASSESSMENT_HISTORY);
  console.log("🗑️ [Local] ลบประวัติการประเมินทั้งหมดแล้ว");

  // 2. ลบ Firebase
  if (db && auth && auth.currentUser) {
    try {
      const uid = auth.currentUser.uid;
      const assessmentsRef = collection(db, "users", uid, "assessments");
      const snapshot = await getDocs(assessmentsRef);

      const deletePromises = snapshot.docs.map((docItem) =>
        deleteDoc(doc(db, "users", uid, "assessments", docItem.id)),
      );

      await Promise.all(deletePromises);
      console.log(
        `🔥 [Firebase] ลบประวัติบน Cloud จำนวน ${deletePromises.length} รายการ สำเร็จ`,
      );
    } catch (error) {
      console.error("❌ [Firebase] ลบประวัติไม่สำเร็จ:", error);
    }
  }
}

// ======================================================
// 3. Helper Functions (ฟังก์ชันช่วยอื่นๆ)
// ======================================================

export function getAssessmentByType(testName) {
  const history = getAssessmentHistory();
  return history.filter((item) => item.testName === testName);
}

export function getLatestAssessment(testName = null) {
  const history = getAssessmentHistory();
  if (testName) {
    return history.find((item) => item.testName === testName) || null;
  }
  return history[0] || null;
}

export function deleteAssessmentById(id) {
  try {
    const history = getAssessmentHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(
      STORAGE_KEYS.ASSESSMENT_HISTORY,
      JSON.stringify(filtered),
    );
    console.log(`🗑️ ลบรายการ ID ${id} แล้ว (Local Only)`);
    return true;
  } catch (error) {
    console.error("❌ ลบรายการไม่สำเร็จ:", error);
    return false;
  }
}

export function clearAllData() {
  clearUserProfile();
  clearAssessmentHistory();
  console.log("🔄 ล้างข้อมูลในเครื่องทั้งหมดแล้ว");
}

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
