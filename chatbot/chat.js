// chatbot/chat.js

import { getUserProfile } from "../js/storage.js";

const GEMINI_API_KEY = "AIzaSyDHpoI-ABRQXwARnxLJTMT67b0CVfLKK2c";

const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

let chatHistory = [];

document.addEventListener("DOMContentLoaded", () => {
  const user = getUserProfile();
  const userName = user && user.username ? user.username : "เพื่อน";

  const systemInstructionText = `
    System Context:
    คุณคือ "น้องโอบกอด" (Nong Ob-Kot)
    - บทบาท: พยาบาลสาวใจดี ผู้เชี่ยวชาญด้านการรับฟังและดูแลสุขภาพจิต
    - ผู้ใช้ชื่อ: "${userName}"
    - บุคลิก: อ่อนโยน, นุ่มนวล, สุภาพ, ขี้เล่นนิดๆ, มีความเมตตา (ใช้คำลงท้าย "ค่ะ/คะ" เสมอ)
    - การแทนตัว: แทนตัวเองว่า "น้องโอบกอด" หรือ "พยาบาล" ตามความเหมาะสม
    - ข้อห้าม: ห้ามวินิจฉัยโรคทางการแพทย์แบบหมอ (ให้คำแนะนำการดูแลใจเบื้องต้นได้), ห้ามตัดสินผู้ใช้
    - กรณีฉุกเฉิน: ถ้าผู้ใช้พูดถึงการฆ่าตัวตาย ให้แนะนำสายด่วน 1323 ด้วยความห่วงใยที่สุด
    - สไตล์การตอบ: อบอุ่น ให้กำลังใจ เหมือนพี่สาวพยาบาลคุยกับน้อง
  `;

  const namePlaceholder = document.getElementById("user-name-placeholder");
  if (namePlaceholder) namePlaceholder.innerText = userName;

  const chatInput = document.getElementById("chat-input");
  const sendBtn = document.getElementById("send-btn");
  const chatContainer = document.getElementById("chat-container");

  async function sendMessage() {
    const text = chatInput.value.trim();
    if (text === "") return;

    addMessage(text, "user");
    chatInput.value = "";
    chatInput.disabled = true;

    showTypingIndicator();

    try {
      const reply = await callGeminiAI(text);

      removeTypingIndicator();
      addMessage(reply, "bot");
    } catch (error) {
      console.error("Gemini Error:", error);
      removeTypingIndicator();
      addMessage(
        "ขอโทษครับ ระบบขัดข้องเล็กน้อย (ลองพิมพ์ใหม่อีกทีนะครับ)",
        "bot",
      );
    } finally {
      chatInput.disabled = false;
      chatInput.focus();
    }
  }

  async function callGeminiAI(userMessage) {
    let messagesToSend = [];

    if (chatHistory.length === 0) {
      messagesToSend.push({
        role: "user",
        parts: [
          {
            text:
              systemInstructionText +
              "\n\n[ข้อความเริ่มต้นจากผู้ใช้]: " +
              userMessage,
          },
        ],
      });
    } else {
      messagesToSend = [
        ...chatHistory,
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ];
    }

    const requestBody = {
      contents: messagesToSend,
    };

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      const botText = data.candidates[0].content.parts[0].text;

      if (chatHistory.length === 0) {
        chatHistory.push({
          role: "user",
          parts: [{ text: systemInstructionText + "\n" + userMessage }],
        });
      } else {
        chatHistory.push({ role: "user", parts: [{ text: userMessage }] });
      }

      chatHistory.push({ role: "model", parts: [{ text: botText }] });

      return botText;
    } else {
      throw new Error("AI ตอบกลับมาเป็นค่าว่าง");
    }
  }

  if (sendBtn) sendBtn.addEventListener("click", sendMessage);
  if (chatInput) {
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  function addMessage(text, sender) {
    const div = document.createElement("div");
    div.classList.add("message", sender);

    const formattedText = text
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/1323/g, '<a href="tel:1323" style="color: #ff5252; font-weight: bold; text-decoration: underline;">1323</a>')
      .replace(/\n/g, "<br>");

    const time = new Date().toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    div.innerHTML = `${formattedText}<span class="timestamp">${time}</span>`;
    chatContainer.appendChild(div);
    scrollToBottom();
  }

  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function showTypingIndicator() {
    const div = document.createElement("div");
    div.classList.add("message", "bot");
    div.id = "typing-indicator";
    div.innerHTML = `
            <span class="dot-flashing"></span>
            <span class="dot-flashing" style="animation-delay: 0.2s"></span>
            <span class="dot-flashing" style="animation-delay: 0.4s"></span>
            <em> กำลังคิด...</em>
        `;
    chatContainer.appendChild(div);
    scrollToBottom();
  }

  function removeTypingIndicator() {
    const typing = document.getElementById("typing-indicator");
    if (typing) typing.remove();
  }
});
