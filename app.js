/* ===============================
   우리학교 구글 계정 검색 - app.js (Google Sheets 연동 버전)
   - 학번+이름 검색 -> Apps Script Web App 호출 -> 계정 ID 표시
   - PW는 표시하지 않음(초기화 요청 버튼만)
================================ */

(() => {
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

  // ✅ 너의 Apps Script 웹앱 URL
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbwD96ndYMF3Aj2oxeBc7_Q3TGL9dpBE-_QDYHChWuZDMKMlRNA3Gq707kSwfUqk03Oocg/exec";

  console.log("app.js 로드됨 ✅");

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
    // ✅ URL이 비어있거나 이상한 경우만 막기
    if (!WEB_APP_URL || !/^https:\/\/script\.google\.com\/macros\/s\//.test(WEB_APP_URL)) {
      throw new Error("WEB_APP_URL_NOT_SET");
    }

    const url =
      `${WEB_APP_URL}?studentNo=${encodeURIComponent(studentNo)}` +
      `&name=${encodeURIComponent(name)}`;

    const res = await fetch(url, { method: "GET" });
    if (!res.ok) throw new Error("NETWORK_ERROR");

    return await res.json();
  }

  // ===== 검색(버튼/엔터) =====
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const studentNo = normalizeStudentNo(studentNoInput.value);
    const name = normalizeName(studentNameInput.value);

    if (!studentNo || !name) {
      hideResult();
      setStatus("error", "학번과 이름을 모두 입력해줘!");
      return;
    }

    if (!/^\d{3,10}$/.test(studentNo)) {
      hideResult();
      setStatus("error", "학번은 숫자만 입력해줘! (예: 20301)");
      return;
    }

    hideResult();
    setStatus("idle", "찾는 중... 🔎");

    fetchAccountId(studentNo, name)
      .then((data) => {
        if (!data || typeof data !== "object") {
          hideResult();
          setStatus("error", "서버 응답 형식이 이상해. (JSON 확인 필요)");
          return;
        }

        if (!data.ok) {
          hideResult();
          if (data.error === "NOT_FOUND") {
            setStatus("error", "일치하는 정보가 없어. 학번/이름을 다시 확인해줘!");
          } else {
            setStatus("error", `조회 실패: ${data.error}`);
          }
          return;
        }

        if (!data.id) {
          hideResult();
          setStatus("error", "ID 값이 비어 있어. (시트의 계정ID 열 확인)");
          return;
        }

        setStatus("success", "찾았다! 아래에서 계정 ID 확인해줘 😊");
        showResult(data.id);
      })
      .catch((err) => {
        hideResult();
        const msg = String(err?.message || err || "");

        if (msg === "WEB_APP_URL_NOT_SET") {
          setStatus("error", "WEB_APP_URL이 비어있거나 형식이 이상해. URL을 확인해줘!");
          return;
        }

        setStatus("error", "네트워크 오류! 웹앱 URL/배포 권한을 확인해줘!");
      });
  });

  // ===== 지우기 =====
  btnClear.addEventListener("click", () => {
    studentNoInput.value = "";
    studentNameInput.value = "";
    hideResult();
    setStatus("idle", "학번과 이름을 입력한 뒤 검색하세요.");
    studentNoInput.focus();
  });

  // ===== ID 복사 =====
  btnCopyId.addEventListener("click", async () => {
    const id = accountIdEl.textContent.trim();
    if (!id || id === "-") return;

    try {
      await navigator.clipboard.writeText(id);
      setStatus("success", "ID 복사 완료! 📋");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = id;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setStatus("success", "ID 복사 완료! 📋");
    }
  });

  // ===== 비밀번호 초기화 요청(데모) =====
  btnResetPw.addEventListener("click", () => {
    const studentNo = normalizeStudentNo(studentNoInput.value);
    const name = normalizeName(studentNameInput.value);
    const id = accountIdEl.textContent.trim();

    if (!studentNo || !name || !id || id === "-") {
      setStatus("error", "먼저 검색해서 계정 ID를 확인해줘!");
      return;
    }

    setStatus("success", `비밀번호 초기화 요청 안내! (대상: ${name} / ${studentNo}) 🔐`);
    alert(
      [
        "비밀번호는 화면에 표시하지 않습니다.",
        "",
        "초기화가 필요하면 정보부/관리자 절차에 따라 처리하세요.",
        `- 학번: ${studentNo}`,
        `- 이름: ${name}`,
        `- 계정 ID: ${id}`,
      ].join("\n")
    );
  });

  // ===== 초기 상태 =====
  hideResult();
  setStatus("idle", "학번과 이름을 입력한 뒤 검색하세요.");
})();
