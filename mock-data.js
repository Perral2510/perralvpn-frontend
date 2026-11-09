/* =========================================================
   PerralVPN — Mock data & fake API
   All functions return Promises to simulate real network calls.
   Swap the implementation of MockAPI.* with real fetch() calls later.
   ========================================================= */

const MockDB = {
  user: {
    name: "Chưa đăng nhập",
    email: "",
    verified: false,
    avatar: "",
    joinDate: "",
    userId: "",
    balance: 0,
  },
  promos: [
    { title: "Ưu đãi tháng 8", titleEn: "August Deal", desc: "Giảm 30% tất cả gói Vĩnh Viễn", descEn: "30% off all Lifetime plans", color1: "#2F6FED", color2: "#14B8A6" },
    { title: "Gói mới ra mắt", titleEn: "New plan launched", desc: "Gói Global tốc độ x2, giá không đổi", descEn: "Global plan, 2x speed, same price", color1: "#1B4FC7", color2: "#5A8CF5" },
  ],
  quickMenu: [
    { icon: "shield", labelKey: "nav_plan" },
    { icon: "sliders", labelKey: "nav_changepro" },
    { icon: "receipt", labelKey: "nav_order" },
    { icon: "control", labelKey: "nav_control" },
  ],
  knowledgeArticles: [
    { id: 4, title: "Hướng dẫn lấy ID Apple dùng thử", titleEn: "Getting a trial Apple ID", date: "2026-07-20", content: "Vào Trang chủ, bấm 'Lấy ID Apple' để nhận tài khoản dùng thử cho App Store khu vực khác." },
  ],
  apps: {
    Android: [
      { name: "V2RayNG", version: "1.8.24", free: true, icon: "↯", url: "https://github.com/2dust/v2rayNG/releases" },
      { name: "Surfboard", version: "2.24.1", free: true, icon: "»", url: "https://github.com/getsurfboard/surfboard/releases" },
      { name: "Sing-box", version: "1.12.0", free: true, icon: "◈", url: "https://github.com/SagerNet/sing-box/releases" },
      { name: "NekoBox", version: "1.4.2", free: true, icon: "N", url: "https://github.com/MatsuriDayo/NekoBoxForAndroid/releases" },
      { name: "ClashMeta", version: "2.11.12", free: true, icon: "M", url: "https://github.com/MetaCubeX/ClashMetaForAndroid/releases" },
      { name: "Clash for Android", version: "2.5.13", free: true, icon: "C", url: "https://github.com/Kr3l/ClashForAndroid/releases" },
    ],
    iOS: [
      { name: "Sing-box", version: "1.12.0", free: true, icon: "◈", url: "https://github.com/SagerNet/sing-box/releases" },
      { name: "Shadowrocket", version: "2.2.71", free: false, icon: "✦", url: "https://apps.apple.com/app/shadowrocket/id932747118" },
      { name: "Quantumult X", version: "1.4.2", free: false, icon: "Q", url: "https://apps.apple.com/app/quantumult-x/id1442620678" },
      { name: "Surge", version: "5.18.0", free: false, icon: "S", url: "https://apps.apple.com/app/surge-5/id1442620678" },
      { name: "Stash", version: "3.13.1", free: false, icon: "◎", url: "https://apps.apple.com/app/stash/id1596060570" },
    ],
    Windows: [
      { name: "Clash for Windows", version: "0.20.39", free: true, icon: "C", url: "https://github.com/Fndroid/clash_for_windows_pkg/releases" },
      { name: "Nekoray", version: "4.0.1", free: true, icon: "N", url: "https://github.com/MatsuriDayo/nekoray/releases" },
      { name: "Netch", version: "1.9.7", free: true, icon: "◉", url: "https://github.com/netchx/Netch/releases" },
      { name: "V2RayN", version: "7.10.5", free: true, icon: "↯", url: "https://github.com/2dust/v2rayN/releases" },
      { name: "Karing", version: "1.1.0", free: true, icon: "K", url: "https://github.com/KaringX/karing/releases" },
    ],
    macOS: [
      { name: "Sing-box", version: "1.12.0", free: true, icon: "◈", url: "https://github.com/SagerNet/sing-box/releases" },
      { name: "ClashX", version: "1.118.0", free: true, icon: "C", url: "https://github.com/yichengchen/clashX/releases" },
      { name: "Quantumult X", version: "1.4.2", free: false, icon: "Q", url: "https://apps.apple.com/app/quantumult-x/id1442620678" },
      { name: "Shadowrocket", version: "2.2.71", free: false, icon: "✦", url: "https://apps.apple.com/app/shadowrocket/id932747118" },
      { name: "Karing", version: "1.1.0", free: true, icon: "K", url: "https://github.com/KaringX/karing/releases" },
    ],
    Linux: [
      { name: "Sing-box", version: "1.12.0", free: true, icon: "◈", url: "https://github.com/SagerNet/sing-box/releases" },
      { name: "Clash.Meta", version: "1.19.0", free: true, icon: "M", url: "https://github.com/MetaCubeX/ClashMetaForAndroid/releases" },
      { name: "V2Ray", version: "5.27.0", free: true, icon: "↯", url: "https://github.com/2dust/v2rayN/releases" },
    ],
  },

  nodes: [
    { name: "SG-01 Singapore", location: "Singapore", status: "online", load: 42, multiplier: "x1.0", latency: 38 },
    { name: "VN-HN-02 Hà Nội", location: "Vietnam", status: "online", load: 68, multiplier: "x1.0", latency: 12 },
    { name: "VN-HCM-01 Hồ Chí Minh", location: "Vietnam", status: "maint", load: 0, multiplier: "x0.5", latency: 15 },
    { name: "JP-TK-03 Tokyo", location: "Japan", status: "online", load: 55, multiplier: "x1.2", latency: 71 },
    { name: "US-LA-01 Los Angeles", location: "USA", status: "error", load: 0, multiplier: "x1.5", latency: 210 },
    { name: "KR-SE-02 Seoul", location: "Korea", status: "online", load: 31, multiplier: "x1.1", latency: 64 },
    { name: "HK-01 Hong Kong", location: "Hong Kong", status: "online", load: 77, multiplier: "x1.0", latency: 45 },
  ],
};

/* Simulated latency so loading/skeleton states are visible */
function delay(data, ms = 550, failRate = 0){
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (failRate && Math.random() < failRate) reject(new Error("network"));
      else resolve(JSON.parse(JSON.stringify(data)));
    }, ms);
  });
}

const MockAPI = {
  getUser: () => delay(MockDB.user),
  getPromos: () => delay(MockDB.promos),
  getQuickMenu: () => delay(MockDB.quickMenu, 200),
  getKnowledge: (query = "") => {
    const list = MockDB.knowledgeArticles.filter(a =>
      (a.title + a.content).toLowerCase().includes(query.toLowerCase())
    );
    return delay(list, 400);
  },
  getApps: () => delay(MockDB.apps),
  downloadApp: (name) => delay({ ok: true, name }, 1000),

  getNodes: () => delay(MockDB.nodes, 600),
  redeemGiftcode: (code) => {
    const ok = code.trim().toUpperCase().startsWith("DAV");
    return delay({ ok }, 800);
  },
  saveAvatar: (url) => delay({ ok: true, url }, 600),
  resetServerLink: () => delay({ ok: true }, 900),

  syncServerToApp: () => delay({ ok: true }, 900),
  login: (email, password) => {
    const ok = email.trim().length > 3 && password.length >= 6;
    return delay({ ok, token: ok ? "demo-token-" + Date.now() : null }, 800);
  },
  register: (name, email, password) => {
    const ok = name.trim().length > 1 && email.includes("@") && password.length >= 6;
    return delay({ ok }, 900);
  },
};
