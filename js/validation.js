// js/validation.js

/**
 * 1. Validate Email
 * @param {string} email - อีเมลที่ต้องการตรวจสอบ
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateEmail(email) {
  if (!email || email.trim().length === 0) {
    return { valid: false, message: "กรุณากรอกอีเมล" };
  }

  const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!emailPattern.test(email.trim())) {
    return { valid: false, message: "รูปแบบอีเมลไม่ถูกต้อง" };
  }

  if (email.trim().length < 5) {
    return { valid: false, message: "อีเมลสั้นเกินไป" };
  }

  if (email.trim().length > 100) {
    return { valid: false, message: "อีเมลยาวเกินไป" };
  }

  return { valid: true, message: "" };
}

/**
 * 2. Validate Username
 * @param {string} name - ชื่อที่ต้องการตรวจสอบ
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateUsername(name) {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: "กรุณากรอกชื่อ" };
  }

  if (name.trim().length < 2) {
    return { valid: false, message: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร" };
  }

  if (name.trim().length > 50) {
    return { valid: false, message: "ชื่อยาวเกินไป (สูงสุด 50 ตัวอักษร)" };
  }

  if (!/^[\u0E00-\u0E7Fa-zA-Z\s]+$/.test(name.trim())) {
    return { valid: false, message: "ชื่อต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น" };
  }

  return { valid: true, message: "" };
}

/**
 * 3. Validate Gender
 * @param {string} gender - เพศที่เลือก
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateGender(gender) {
  const validGenders = ["male", "female", "other"];

  if (!gender || gender.trim().length === 0) {
    return { valid: false, message: "กรุณาเลือกเพศ" };
  }

  if (!validGenders.includes(gender)) {
    return { valid: false, message: "ค่าเพศไม่ถูกต้อง" };
  }

  return { valid: true, message: "" };
}

/**
 * 4. Validate Age
 * @param {string|number} age - อายุที่ต้องการตรวจสอบ
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateAge(age) {
  if (!age || age === "") {
    return { valid: false, message: "กรุณากรอกอายุ" };
  }

  const ageNum = parseInt(age);

  if (isNaN(ageNum)) {
    return { valid: false, message: "อายุต้องเป็นตัวเลขเท่านั้น" };
  }

  if (ageNum < 10) {
    return { valid: false, message: "อายุต้องมากกว่าหรือเท่ากับ 10 ปี" };
  }

  if (ageNum > 120) {
    return { valid: false, message: "อายุต้องไม่เกิน 120 ปี" };
  }

  return { valid: true, message: "" };
}

/**
 * 5. Validate Image File
 * @param {File} file - ไฟล์ที่อัปโหลด
 * @param {number} maxSizeMB - ขนาดไฟล์สูงสุด (MB)
 * @returns {Object} - { valid: boolean, message: string }
 */
export function validateImageFile(file, maxSizeMB = 2) {
  if (!file) {
    return { valid: true, message: "" };
  }

  if (!file.type.startsWith("image/")) {
    return { valid: false, message: "กรุณาเลือกไฟล์รูปภาพเท่านั้น" };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: `ไฟล์ใหญ่เกินไป (สูงสุด ${maxSizeMB} MB)`,
    };
  }

  const validExtensions = ["jpg", "jpeg", "png", "gif", "webp"];
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.split(".").pop();

  if (!validExtensions.includes(fileExtension)) {
    return {
      valid: false,
      message: `นามสกุลไฟล์ไม่ถูกต้อง (รองรับ: ${validExtensions.join(", ")})`,
    };
  }

  return { valid: true, message: "" };
}

/**
 * 6. Validate Profile (ตรวจสอบทั้งโปรไฟล์)
 * @param {Object} profileData - { name, gender, age }
 * @returns {Object} - { valid: boolean, errors: string[] }
 */
export function validateProfile(profileData) {
  const errors = [];

  const nameValidation = validateUsername(profileData.name);
  if (!nameValidation.valid) {
    errors.push(nameValidation.message);
  }

  const genderValidation = validateGender(profileData.gender);
  if (!genderValidation.valid) {
    errors.push(genderValidation.message);
  }

  const ageValidation = validateAge(profileData.age);
  if (!ageValidation.valid) {
    errors.push(ageValidation.message);
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}

/**
 * 7. Sanitize Input (ทำความสะอาดข้อมูล)
 * @param {string} input - ข้อมูลที่ต้องการทำความสะอาด
 * @returns {string} - ข้อมูลที่สะอาดแล้ว
 */
export function sanitizeInput(input) {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/[<>]/g, "");
}

/**
 * 8. Validate Network Connection
 * @returns {boolean} - true ถ้าออนไลน์
 */
export function isOnline() {
  return navigator.onLine;
}

/**
 * 9. Check Local Storage Available
 * @returns {boolean} - true ถ้าใช้ได้
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

/**
 * 10. Format Error Messages
 * @param {string[]} errors - อาร์เรย์ของข้อผิดพลาด
 * @returns {string} - HTML formatted errors
 */
export function formatErrorMessages(errors) {
  if (!errors || errors.length === 0) return "";

  return errors.map((err) => `• ${err}`).join("<br>");
}
