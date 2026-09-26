/* Session-only card entries. No storage, upload, analytics, or external lookup. */
(() => {
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (char) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[char],
    );
  const fields = {
    name: { label: "닉네임", max: 24, placeholder: "실명 or 별명", hint: "" },
    hobby: {
      label: "관심사",
      max: 40,
      placeholder: "예: 독서, 음악, 클라이밍",
      hint: " ",
    },
    birthday: {
      label: "생년월일",
      max: 24,
      placeholder: "예: 2003/09/14",
      hint: " ",
    },
    school: {
      label: "학교/소속",
      max: 60,
      placeholder: "학교·학과 또는 소속",
      hint: " ",
    },
    email: {
      label: "이메일 주소",
      type: "email",
      max: 254,
      placeholder: "name@example.com",
      hint: " ",
    },
    residence: {
      label: "거주지 정보",
      max: 80,
      placeholder: "서울시/공릉동",
      hint: "",
    },
  };
  function create({ examples, onChange }) {
    let entries = {},
      draft = null;
    const clearDraft = () => {
      draft = null;
    };
    const valid = () => {
      if (!draft || !draft.value.trim() || draft.loading) return false;
      const config = fields[draft.id];
      if (config.type === "email")
        return (
          draft.value.length <= config.max &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.value)
        );
      return draft.value.trim().length <= config.max;
    };
    const get = (id) => entries[id] || (draft?.id === id ? draft : null);
    const fact = (id) => ({ ...examples[id], value: entries[id]?.value || "" });
    const editor = () => {
      if (!draft) return "";
      const field = fields[draft.id];
      return `<div class="entry-heading"><span>WRITE YOUR CARD</span><h2>${field.label},<br>무엇을 건네시겠어요?</h2></div><div class="entry-fields"><label for="card-value">${field.label}</label><input id="card-value" type="${field.type || "text"}" value="${escape(draft.value)}" maxlength="${field.max}" placeholder="${field.placeholder}" autocomplete="off" spellcheck="false" aria-describedby="entry-hint entry-error"><p id="entry-hint">${field.hint}</p><p id="entry-error" role="status"></p><p class="entry-privacy">교환한 정보는 마지막 결과 화면에 반영됩니다.</p></div>`;
    };
    const art = (card, src) => {
      const entry = get(card.id);
      return `<span class="personal-card-art"><img src="${src}" alt="" width="1024" height="1536"><span class="personal-card-value">${escape(entry?.value || "직접 입력")}</span></span>`;
    };
    const input = (event) => {
      if (event.target.id !== "card-value" || !draft) return;
      draft.value = event.target.value;
      const field = fields[draft.id];
      document.getElementById("entry-error").textContent =
        draft.value && !valid()
          ? field.type === "email"
            ? "올바른 이메일 주소 형식으로 입력해주세요."
            : `${field.max}자 이하로 입력해주세요.`
          : "";
      onChange();
    };
    return {
      escape,
      fact,
      get,
      art,
      editor,
      input,
      valid,
      clearDraft,
      entries: () => entries,
      select(id) {
        clearDraft();
        if (id) draft = { id, value: "" };
      },
      confirm(id) {
        if (draft?.id !== id || !valid() || entries[id]) return false;
        entries[id] = { ...draft, value: draft.value.trim() };
        draft = null;
        return true;
      },
      clear() {
        clearDraft();
        entries = {};
      },
    };
  }
  window.BlackSwanPersonal = { create, escape };
})();
