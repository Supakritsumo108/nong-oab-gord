// js/storage.js

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

const STORAGE_KEYS = {
  USER_PROFILE: "nong_opkot_user_profile",
  ASSESSMENT_HISTORY: "nong_opkot_assessment_history",
};

let db = null;
let auth = null;

export function initFirebase(firestoreDb, firebaseAuth) {
  db = firestoreDb;
  auth = firebaseAuth;
}

export function getUserProfile() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("❌ ดึงโปรไฟล์จาก Local ไม่สำเร็จ:", error);
    return null;
  }
}

export async function saveUserProfile(profileData) {
  if (!profileData) return;

  try {
    localStorage.setItem(
      STORAGE_KEYS.USER_PROFILE,
      JSON.stringify(profileData),
    );
  } catch (error) {
    console.error("❌ [Local] บันทึกโปรไฟล์ไม่สำเร็จ:", error);
  }

  if (auth && auth.currentUser) {
    try {
      const uid = auth.currentUser.uid;
      const userRef = doc(db, "users", uid);
      await setDoc(userRef, profileData, { merge: true });
    } catch (error) {
      console.error("🔥 Firestore Error:", error);
    }
  } else {
    console.warn("⚠️ Auth is null/not ready, saved to Local only.");
  }
}

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

      localStorage.setItem(
        STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(cloudData),
      );

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
}

export async function saveAssessmentResult(
  testName,
  score,
  level,
  additionalData = {},
) {
  try {
    const history = getAssessmentHistory();
    const newEntry = {
      id: Date.now(),
      testName,
      score,
      level,
      timestamp: new Date().toISOString(),
      ...additionalData,
    };

    history.unshift(newEntry);

    const limitedHistory = history.slice(0, 50);

    localStorage.setItem(
      STORAGE_KEYS.ASSESSMENT_HISTORY,
      JSON.stringify(limitedHistory),
    );
  } catch (error) {
    console.error("❌ [Local] บันทึกผลผิดพลาด:", error);
  }

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
    return getAssessmentHistory();
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
    return historyData;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาดในการดึงประวัติจาก Cloud:", error);
    return getAssessmentHistory();
  }
}

export async function clearAssessmentHistory() {
  localStorage.removeItem(STORAGE_KEYS.ASSESSMENT_HISTORY);

  if (db && auth && auth.currentUser) {
    try {
      const uid = auth.currentUser.uid;
      const assessmentsRef = collection(db, "users", uid, "assessments");
      const snapshot = await getDocs(assessmentsRef);

      const deletePromises = snapshot.docs.map((docItem) =>
        deleteDoc(doc(db, "users", uid, "assessments", docItem.id)),
      );

      await Promise.all(deletePromises);
    } catch (error) {
      console.error("❌ [Firebase] ลบประวัติไม่สำเร็จ:", error);
    }
  }
}

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
    return true;
  } catch (error) {
    console.error("❌ ลบรายการไม่สำเร็จ:", error);
    return false;
  }
}

export function clearAllData() {
  clearUserProfile();
  clearAssessmentHistory();
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
