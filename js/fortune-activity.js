// ไฟล์: js/fortune-activity.js

const FORTUNE_LINKS = [
  {
    id: "mbti",
    title: "🧠 16Personalities",
    description:
      "แบบทดสอบบุคลิกภาพระดับโลก (ภาษาไทย) เพื่อเข้าใจตัวตนที่แท้จริงของคุณ",
    url: "https://www.16personalities.com/th",
  },
  {
    id: "sista",
    title: "🍭 SistaCafe's Quiz",
    description:
      "คุณรักตัวเองมากแค่ไหน? แบบทดสอบเช็คระดับความรักที่มีให้ตัวเอง",
    url: "https://sistacafe.com/quiz/how-much-do-you-love-yourself",
  },
  {
    id: "sanook",
    title: "🎋 Quiz น่าสนใจ",
    description: "รวม Quiz หลากหลายแนวจาก Sanook เล่นง่าย ผ่อนคลายสมอง",
    url: "https://www.sanook.com/horoscope/archive/quiz/",
  },
  {
    id: "mthai",
    title: "✨ ดูดวงรายวัน",
    description:
      "เช็คดวงรายวันด้วยภาษาที่สละสลวย ให้พลังบวก และข้อคิดดีๆ ในการใช้ชีวิต (ไม่งมงาย)",
    url: "https://mthai.com/horoscope/daily",
  },
];

export function initFortuneActivity() {
  renderFortuneList();
}

function renderFortuneList() {
  const container = document.getElementById("fortune-list-container");
  if (!container) return;

  container.innerHTML = "";

  FORTUNE_LINKS.forEach((item) => {
    const card = document.createElement("div");
    card.className = "game-card";

    card.onclick = () => {
      window.open(item.url, "_blank");
    };

    // ไอคอน
    let icon = "🔮";
    if (item.id === "mbti") icon = "🧠";
    if (item.id === "sista") icon = "🍭";
    if (item.id === "sanook") icon = "🎋";
    if (item.id === "mthai") icon = "✨";

    // สีธีม (เลือกสีที่ดู Soft และสบายตา)
    let themeColor = "#ff6b8e"; // Default
    if (item.id === "mbti") themeColor = "#4298b4"; // ฟ้าอมเขียว (สงบ)
    if (item.id === "sista") themeColor = "#ff9a9e"; // ชมพูพีช (อ่อนโยน)
    if (item.id === "sanook") themeColor = "#ff7043"; // ส้มอิฐ (อบอุ่น)
    if (item.id === "mthai") themeColor = "#1e88e5"; // เขียวธรรมชาติ

    card.innerHTML = `
            <div class="game-icon" style="background: linear-gradient(135deg, #fff 0%, ${themeColor}20 100%); color: ${themeColor};">
                ${icon}
            </div>
            <div class="game-info">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
            </div>
            <div class="play-btn" style="color: ${themeColor}; border-color: ${themeColor};">ไปที่เว็บ ↗</div> 
        `;

    // Effect Hover
    card.onmouseenter = () => {
      card.querySelector(".play-btn").style.background = themeColor;
      card.querySelector(".play-btn").style.color = "white";
    };
    card.onmouseleave = () => {
      card.querySelector(".play-btn").style.background = "white";
      card.querySelector(".play-btn").style.color = themeColor;
    };

    container.appendChild(card);
  });
}
