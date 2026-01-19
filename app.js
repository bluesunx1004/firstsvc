/* ===============================
   우리학교 구글 계정 검색 - app.js
   - 학번+이름 검색 -> ID 표시
   - PW는 표시하지 않음(초기화 요청 버튼만)
================================ */

(() => {
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

  // ===== 예시 데이터(테스트용) =====
  // 실제 운영에서는 여기 대신 Apps Script/API에서 조회하게 바꿀 예정
  // key = "학번|이름"
  const ACCOUNT_DB = new Map([
    ["20301|홍길동", { id: "s20301@school.edu" }],
    ["20302|김철수", { id: "s20302@school.edu" }],
    ["10115|이영희", { id: "s10115@school.edu" }],
  ]);

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

  const makeKey = (studentNo, name) => `${studentNo}|${name}`;

  // ===== 이벤트: 검색 =====
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const studentNo = normalizeStudentNo(studentNoInput.value);
    const name = normalizeName(studentNameInput.value);

    // 기본 검증
    if (!studentNo || !name) {
      hideResult();
      setStatus("error", "학번과 이름을 모두 입력해줘!");
      return;
    }

    // 학번 형식(너무 빡세지 않게 숫자만 권장)
    if (!/^\d{3,10}$/.test(studentNo)) {
      hideResult();
      setStatus("error", "학번은 숫자만 입력해줘! (예: 20301)");
      return;
    }

    // 로딩 느낌(실제 API 연동 시 여기서 fetch)
    hideResult();
    setStatus("idle", "찾는 중... 🔎");

    setTimeout(() => {
      const key = makeKey(studentNo, name);
      const row = ACCOUNT_DB.get(key);

      if (!row) {
        hideResult();
        setStatus("error", "일치하는 정보가 없어. 학번/이름을 다시 확인해줘!");
        return;
      }

      setStatus("success", "찾았다! 아래에서 계정 ID 확인해줘 😊");
      showResult(row.id);
    }, 250);
  });

  // ===== 이벤트: 지우기 =====
  btnClear.addEventListener("click", () => {
    studentNoInput.value = "";
    studentNameInput.value = "";
    hideResult();
    setStatus("idle", "학번과 이름을 입력한 뒤 검색하세요.");
    studentNoInput.focus();
  });

  // ===== 이벤트: ID 복사 =====
  btnCopyId.addEventListener("click", async () => {
    const id = accountIdEl.textContent.trim();
    if (!id || id === "-") return;

    try {
      await navigator.clipboard.writeText(id);
      setStatus("success", "ID 복사 완료! 📋");
    } catch {
      // clipboard가 막힌 환경 대비: 임시 textarea 방식
      const ta = document.createElement("textarea");
      ta.value = id;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setStatus("success", "ID 복사 완료! 📋");
    }
  });

  // ===== 이벤트: 비밀번호 초기화 요청 =====
  // 실제 운영에서는 여기서 "관리자 승인/본인확인" 후 초기화 링크 발급 흐름으로 연결
  btnResetPw.addEventListener("click", () => {
    const studentNo = normalizeStudentNo(studentNoInput.value);
    const name = normalizeName(studentNameInput.value);
    const id = accountIdEl.textContent.trim();

    if (!studentNo || !name || !id || id === "-") {
      setStatus("error", "먼저 검색해서 계정 ID를 확인해줘!");
      return;
    }

    // 데모용: 실제로는 서버/Apps Script로 요청 보내기
    setStatus(
      "success",
      `비밀번호 초기화 요청이 접수됐어! (대상: ${name} / ${studentNo}) 🔐`
    );

    alert(
      [
        "비밀번호는 화면에 표시하지 않습니다.",
        "",
        "초기화 요청이 접수되었습니다.",
        `- 학번: ${studentNo}`,
        `- 이름: ${name}`,
        `- 계정 ID: ${id}`,
        "",
        "※ 실제 운영에서는 본인 확인 후 1회용 링크/임시 비밀번호를 발급하세요.",
      ].join("\n")
    );
  });

  // ===== 초기 상태 =====
  hideResult();
  setStatus("idle", "학번과 이름을 입력한 뒤 검색하세요.");
})();
