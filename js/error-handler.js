// js/error-handler.js

export function handleFirebaseError(error, context = "") {
  console.error(`Firebase Error (${context}):`, error);

  let title = "เกิดข้อผิดพลาด";
  let message = "ไม่สามารถดำเนินการได้ กรุณาลองใหม่อีกครั้ง";
  let icon = "error";

  switch (error.code) {
    case "auth/network-request-failed":
      title = "ไม่มีการเชื่อมต่ออินเทอร์เน็ต";
      message = "กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ตของคุณ";
      break;

    case "auth/too-many-requests":
      title = "คำขอมากเกินไป";
      message = "มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่";
      break;

    case "auth/user-disabled":
      title = "บัญชีถูกปิดใช้งาน";
      message = "บัญชีนี้ถูกระงับ กรุณาติดต่อผู้ดูแลระบบ";
      break;

    case "permission-denied":
      title = "ไม่มีสิทธิ์เข้าถึง";
      message = "คุณไม่มีสิทธิ์ในการทำรายการนี้";
      break;

    case "unavailable":
      title = "บริการไม่พร้อมใช้งาน";
      message = "เซิร์ฟเวอร์ไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่อีกครั้ง";
      break;

    default:
      if (error.message.includes("network")) {
        title = "ปัญหาการเชื่อมต่อ";
        message = "มีปัญหาเกี่ยวกับการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ต";
      }
  }

  return {
    icon,
    title,
    message,
    originalError: error,
  };
}

export function handleStorageError(error, operation = "save") {
  console.error(`Storage Error (${operation}):`, error);

  let title = "ข้อผิดพลาดการบันทึก";
  let message = "ไม่สามารถบันทึกข้อมูลได้";

  if (error.name === "QuotaExceededError") {
    title = "พื้นที่เต็ม";
    message = "พื้นที่จัดเก็บข้อมูลเต็ม กรุณาลบข้อมูลเก่าออก";
  } else if (error.message.includes("localStorage")) {
    title = "ไม่สามารถเข้าถึงการจัดเก็บ";
    message = "เบราว์เซอร์ไม่อนุญาตให้จัดเก็บข้อมูล กรุณาเปิด Cookies";
  }

  return {
    icon: "error",
    title,
    message,
    originalError: error,
  };
}

export function handleGeneralError(error, context = "") {
  console.error(`General Error (${context}):`, error);

  return {
    icon: "error",
    title: "เกิดข้อผิดพลาด",
    message: error.message || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ",
    originalError: error,
  };
}

export function showErrorAlert(errorInfo, options = {}) {
  const defaultOptions = {
    icon: errorInfo.icon || "error",
    title: errorInfo.title || "เกิดข้อผิดพลาด",
    text: errorInfo.message || "",
    confirmButtonText: "ตกลง",
    confirmButtonColor: "#4da6ff",
    footer: options.showFooter
      ? "<small>หากปัญหายังคงอยู่ กรุณาติดต่อผู้ดูแลระบบ</small>"
      : undefined,
    ...options,
  };

  return Swal.fire(defaultOptions);
}

export function logError(error, context = "", additionalData = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    additionalData,
    userAgent: navigator.userAgent,
    url: window.location.href,
  };

  console.error("Error Log:", errorLog);

  try {
    const errorLogs = JSON.parse(localStorage.getItem("error_logs") || "[]");
    errorLogs.unshift(errorLog);
    const limitedLogs = errorLogs.slice(0, 10);
    localStorage.setItem("error_logs", JSON.stringify(limitedLogs));
  } catch (e) {
    console.warn("ไม่สามารถบันทึก Error Log ได้:", e);
  }
}

export function monitorConnection() {
  window.addEventListener("online", () => {
    Swal.fire({
      icon: "success",
      title: "กลับมาออนไลน์",
      text: "การเชื่อมต่อกลับมาแล้ว",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  });

  window.addEventListener("offline", () => {
    Swal.fire({
      icon: "warning",
      title: "ไม่มีอินเทอร์เน็ต",
      text: "การเชื่อมต่อขาดหาย ข้อมูลจะถูกบันทึกในเครื่องเท่านั้น",
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    });
  });
}

export async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.warn(`การลองครั้งที่ ${i + 1} ล้มเหลว:`, error);

      if (i === maxRetries - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

export function checkSystemHealth() {
  const health = {
    online: navigator.onLine,
    localStorage: false,
    cookiesEnabled: navigator.cookieEnabled,
    timestamp: new Date().toISOString(),
  };

  try {
    const test = "__test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    health.localStorage = true;
  } catch (e) {
    health.localStorage = false;
  }

  return health;
}

export function showSystemWarning() {
  const health = checkSystemHealth();
  const issues = [];

  if (!health.online) {
    issues.push("ไม่มีการเชื่อมต่ออินเทอร์เน็ต");
  }

  if (!health.localStorage) {
    issues.push("ไม่สามารถจัดเก็บข้อมูลได้ กรุณาเปิด Cookies");
  }

  if (!health.cookiesEnabled) {
    issues.push("Cookies ถูกปิดใช้งาน");
  }

  if (issues.length > 0) {
    Swal.fire({
      icon: "warning",
      title: "ปัญหาระบบ",
      html: `
        <div style="text-align: left;">
          <p>ตรวจพบปัญหาต่อไปนี้:</p>
          <ul style="margin-left: 20px;">
            ${issues.map((issue) => `<li>${issue}</li>`).join("")}
          </ul>
          <p style="margin-top: 15px;">ระบบอาจทำงานไม่สมบูรณ์</p>
        </div>
      `,
      confirmButtonText: "เข้าใจแล้ว",
      confirmButtonColor: "#ffb74d",
    });
  }

  return health;
}

export function initGlobalErrorHandler() {
  window.addEventListener("error", (event) => {
    console.error("Global Error:", event.error);
    logError(event.error, "Global", {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });

    return true;
  });

  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);
    logError(event.reason, "Promise Rejection");

    event.preventDefault();
  });
}
