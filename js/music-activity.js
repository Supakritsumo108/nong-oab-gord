// js/music-activity.js

const MUSIC_LIST = [
  // 🍃 ธรรมชาติ
  {
    id: "eKFTSSKCzWA",
    title: "เสียงฝนตกเบาๆ (Rain Sounds)",
    category: "nature",
  },
  {
    id: "wtwduwSYsR8",
    title: "เสียงธรรมชาติบำบัด",
    category: "nature",
  },
  { id: "bn9F19Hi1Lk", title: "เสียงคลื่นทะเล (Ocean)", category: "nature" },
  { id: "ipf7ifVSeDU", title: "ธรรมชาติยามเช้า (Morning)", category: "nature" },

  // 🎹 เปียโน/บรรเลง
  {
    id: "CBSlu_VMS9U",
    title: "jazz lofi mix [3 hours]",
    category: "piano",
  },
  {
    id: "lTRiuFIWV54",
    title: "Lofi Study/Relax",
    category: "piano",
  },
  {
    id: "lTRiuFIWV54",
    title: "1 A.M Study Session",
    category: "piano",
  },
  {
    id: "2x2CDVKD9RA",
    title: "Disney Piano Collection",
    category: "piano",
  },
  {
    id: "HGl75kurxok",
    title: "Piano Ghibli Collection",
    category: "piano",
  },

  // 🧘 สมาธิ
  {
    id: "lXKAGsgSlzE",
    title: "ดนตรีบำบัดความเครียด",
    category: "meditation",
  },
  {
    id: "8Me10kjwEDw",
    title: "ดนตรีหลับลึก (Deep Sleep)",
    category: "meditation",
  },
  {
    id: "34pFjZoSMKM",
    title: "ดนตรีเพื่อสมาธิ4",
    category: "meditation",
  },

  // 🎸 เพลงไทยฟังสบาย
  {
    id: "W3gnEpiMe1Y",
    title: "รวมเพลงฮีลใจ ความหมายดี",
    category: "thai",
  },
  {
    id: "qngCJf9V6g8",
    title: "เพลงรัก ฟังสบายๆ",
    category: "thai",
  },
  {
    id: "cpGAny9aDrs",
    title: "รวมเพลงฮีลใจ ฟังสบายคลายเครียด",
    category: "thai",
  },
  {
    id: "js9qaN97Lt8",
    title: "รวมเพลงฮีลใจ ฟังแล้วอารมณ์ดี",
    category: "thai",
  },
  {
    id: "4MuXyJofM-0",
    title: "รวมเพลงเพราะๆ ฟังสบายๆ ให้ธรรมชาติฮีลใจ",
    category: "thai",
  },

  // 🎸 5. เพลงสากลฟังสบาย
  {
    id: "0p40NRti4R4",
    title: "Healing with Acoustic Songs 2025",
    category: "inter",
  },
];

let currentCategory = "all";
let currentPlayingId = null;

export function initMusicActivity() {
  renderPlaylist();
  setupFilters();
}

function renderPlaylist() {
  const container = document.getElementById("music-playlist");
  if (!container) return;

  container.innerHTML = "";

  const filteredList =
    currentCategory === "all"
      ? MUSIC_LIST
      : MUSIC_LIST.filter((item) => item.category === currentCategory);

  filteredList.forEach((music) => {
    const card = document.createElement("div");
    card.className = `music-card ${currentPlayingId === music.id ? "playing" : ""}`;
    card.onclick = () => playMusic(music.id);

    const thumbUrl = `https://img.youtube.com/vi/${music.id}/mqdefault.jpg`;

    let catLabel = "ทั่วไป";
    if (music.category === "nature") catLabel = "ธรรมชาติ";
    if (music.category === "piano") catLabel = "ดนตรีบรรเลง";
    if (music.category === "meditation") catLabel = "สมาธิ";
    if (music.category === "thai") catLabel = "เพลงไทยฟังสบาย";
    if (music.category === "inter") catLabel = "เพลงสากลฟังสบาย";

    card.innerHTML = `
            <img src="${thumbUrl}" alt="${music.title}" class="music-thumb">
            <div class="music-info">
                <div class="music-title">${music.title}</div>
                <div class="music-category">หมวด: ${catLabel}</div>
            </div>
            <div class="playing-icon">🎵</div>
        `;

    container.appendChild(card);
  });
}

function playMusic(youtubeId) {
  const player = document.getElementById("main-youtube-player");
  const placeholder = document.getElementById("youtube-player-placeholder");

  if (player && placeholder) {
    player.style.display = "block";
    placeholder.style.display = "none";

    player.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`;

    currentPlayingId = youtubeId;
    renderPlaylist();

    document
      .querySelector(".video-container")
      .scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function setupFilters() {
  const buttons = document.querySelectorAll(".filter-btn");
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.getAttribute("data-category");
      renderPlaylist();
    });
  });
}
