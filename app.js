(() => {console.log("app.js 로드됨 ✅");
  // ===== DOM =====
  const $ = (sel) => document.querySelector(sel);

  const form = $("#searchForm");
  const studentNoInput = $("#studentNo");
  const studentNameInput = $("#studentName");

  const btnClear = $("#btnClear");
  const btnCopyId = $("#btnCopyId");
  const btnResetPw = $("#btnResetPw");

  const statusBox = $("#statusBox");
  const resultBox = $("#resultBox");
  const accountIdEl = $("#accountId");

  // ✅ 1단계에서 얻은 Apps Script 웹앱 URL을 여기에 붙여넣기
  // 예: https://script.google.com/macros/s/AKfycbxxxxxxx/exec
  const WEB_APP_URL = "여기에_네_웹앱_URL";

  // ===== 유틸 =====
  const normalizeStudentNo = (v) => (v ?? "").toString().trim().replace(/\s+/g, "");
  const normalizeName = (v) => (v ?? "").toString().trim().replace(/\s+/g, "");

  const setStatus = (type, msg) => {
    statusBox.className = `status status--${type}`;
    statusBox.textContent = msg;
  };

  const showResult = (id) => {
    accountIdEl.textContent = id;
    resultBox.hidden = false;
  };

  const hideResult = () => {
    resultBox.hidden = true;
    accountIdEl.textContent = "-";
  };

  // ===== API 호출 =====
  async function fetchAccountId(studentNo, name) {
    if (!WEB_APP_URL || WEB_APP_URL.includes("https://script.google.com/macros/s/AKfycby1CJOWF18HwII0n-m2fyub8SxD5G94QTAKV4ciT8z4yvv-3vXesh4YRncdrtBZ6qQ2Xw/exec")) {
      throw new Error("WEB_APP_URL_NOT_SET");
    }

    const url =
      `${WEB_APP_URL}?studentNo=${encodeURIComponent(studentNo)}` +
      `&name=${encodeURIComponent(name)}`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error("NETWORK_ERROR");

    return await res.json(); // { ok:true, id:"...
