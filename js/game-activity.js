// ไฟล์: js/game-activity.js

const GAMES_LIST = [
  // --- 🔹 ชุดที่ 1: ศิลปะและการระบาย ---
  {
    id: "fluid",
    title: "🎨 ระบายสีควัน (Fluid)",
    description: "ลากนิ้วเพื่อสร้างสีสันที่ฟุ้งกระจาย ช่วยระบายความเครียด",
    url: "https://paveldogreat.github.io/WebGL-Fluid-Simulation/",
  },
  {
    id: "silk",
    title: "✨ ศิลปะแห่งแสง (Silk)",
    description: "วาดเส้นแสงที่สมมาตรสวยงาม สร้างสมาธิและความภูมิใจ",
    url: "http://weavesilk.com/",
  },
  {
    id: "sand",
    title: "⏳ กองทรายสีสวย (Thisissand)",
    description: "โรยทรายให้เป็นชั้นๆ สร้างงานศิลปะแบบสมาธิ",
    url: "https://thisissand.com/",
  },
  {
    id: "neon",
    title: "🌌 วาดภาพอวกาศ (Neon Flames)",
    description: "วาดเส้นแสงเนบิวลาฟุ้งๆ บนท้องฟ้าจำลอง สวยงามและสงบ",
    url: "https://29a.ch/sandbox/2011/neonflames/",
  },

  // --- 🔹 ชุดที่ 2: ดนตรีและจังหวะ (ASMR) ---
  {
    id: "bongo",
    title: "🐱 Bongo Cat",
    description: "น้องแมวตีกลอง! กดปุ่มหรือจิ้มจอเพื่อให้น้องเล่นดนตรี",
    url: "https://bongo.cat/",
  },
  {
    id: "patatap",
    title: "🎹 Patatap (ดนตรีบำบัด)",
    description: "กดปุ่ม A-Z เพื่อสร้างเสียงและ Animation สุดล้ำ",
    url: "https://patatap.com/",
  },
  {
    id: "plink",
    title: "🎵 Plink (แจมดนตรี)",
    description: "เล่นดนตรีออนไลน์กับคนแปลกหน้าทั่วโลก แค่คลิกก็เป็นเพลง",
    url: "https://plink.in/",
  },

  // --- 🔹 ชุดที่ 3: ธรรมชาติและการปล่อยวาง ---
  {
    id: "neal",
    title: "🌊 ดำดิ่งลึกสุดใจ (Deep Sea)",
    description: "เลื่อนลงเพื่อสำรวจโลกใต้ทะเล ความเงียบสงบที่หาได้ยาก",
    url: "https://neal.fun/deep-sea/",
  },
  {
    id: "koalas",
    title: "🟢 Koalas to the Max",
    description: "เกมระเบิดวงกลม! ลากผ่านเพื่อแบ่งวงกลมจนเป็นภาพสวยๆ",
    url: "https://koalastothemax.com/",
  },
  {
    id: "sandspiel",
    title: "🔥 Sandspiel (กระบะทราย)",
    description: "จำลองธาตุธรรมชาติ (น้ำ ไฟ ทราย พืช) มาเล่นผสมกัน",
    url: "https://sandspiel.club/",
  },
];

export function initGameActivity() {
  renderGameList();
}

function renderGameList() {
  const container = document.getElementById("game-list-container");
  if (!container) return;

  container.innerHTML = "";

  GAMES_LIST.forEach((game) => {
    const card = document.createElement("div");
    card.className = "game-card";

    card.onclick = () => {
      window.open(game.url, "_blank");
    };

    // กำหนดไอคอน
    let icon = "🎮";
    // ศิลปะ
    if (game.id === "fluid") icon = "🎨";
    if (game.id === "silk") icon = "✨";
    if (game.id === "sand") icon = "⏳";
    if (game.id === "neon") icon = "🌌";
    // ดนตรี
    if (game.id === "bongo") icon = "🐱";
    if (game.id === "patatap") icon = "🎹";
    if (game.id === "plink") icon = "🎵";
    // ธรรมชาติ
    if (game.id === "neal") icon = "🌊";
    if (game.id === "koalas") icon = "🟢";
    if (game.id === "sandspiel") icon = "🔥";

    card.innerHTML = `
            <div class="game-icon">${icon}</div>
            <div class="game-info">
                <h3>${game.title}</h3>
                <p>${game.description}</p>
            </div>
            <div class="play-btn">ไปที่เว็บ ↗</div> 
        `;

    container.appendChild(card);
  });
}
