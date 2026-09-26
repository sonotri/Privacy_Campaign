/* Session-only card entries. No storage, upload, analytics, or external lookup. */
(() => {
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const fields = {
    name: { label: '닉네임', max: 24, placeholder: '게임에서 사용할 닉네임', hint: '이 이름이 다른 정보와 함께 보인다면 어떨까요?' },
    hobby: { label: '관심사', max: 40, placeholder: '예: 독서, 음악, 클라이밍', hint: '나를 설명하는 관심사 하나를 적어주세요.' },
    birthday: { label: '생년월일', type: 'date', hint: '생년월일 전체를 건네는 선택입니다. 교환할 날짜를 직접 작성해주세요.' },
    school: { label: '학교/소속', max: 60, placeholder: '학교·학과 또는 소속', hint: '소속이 온라인의 나와 연결된다면 어떨까요?' },
    email: { label: '이메일 주소', type: 'email', max: 254, placeholder: 'name@example.com', hint: '연락이나 여러 계정을 연결하는 단서가 될 수 있는 주소입니다.' },
    residence: { label: '거주지 정보', max: 80, placeholder: '시·구·동 정도의 거주 지역', hint: '상세 주소 대신 동네 정도로 적어주세요.' },
  };
  function create({ examples, onChange }) {
    let entries = {}, draft = null;
    const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
    const clearDraft = () => { draft = null; };
    const valid = () => {
      if (!draft || !draft.value.trim() || draft.loading) return false;
      const config = fields[draft.id];
      if (config.type === 'date') {
        const value = draft.value.replaceAll('.', '-');
        const date = new Date(`${value}T12:00:00Z`);
        return /^\d{4}-\d{2}-\d{2}$/.test(value) && value >= '1900-01-01' && value <= today() && !Number.isNaN(+date) && date.toISOString().slice(0,10) === value;
      }
      if (config.type === 'email') return draft.value.length <= config.max && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.value);
      return draft.value.trim().length <= config.max;
    };
    const get = id => entries[id] || (draft?.id === id ? draft : null);
    const fact = id => ({ ...examples[id], value: entries[id]?.value || '' });
    const editor = () => {
      if (!draft) return '';
      const field = fields[draft.id];
      return `<div class="entry-heading"><span>WRITE YOUR CARD</span><h2>${field.label},<br>무엇을 건네시겠어요?</h2></div><div class="entry-fields"><label for="card-value">${field.label}</label><input id="card-value" type="${field.type || 'text'}" value="${escape(draft.value.replaceAll(field.type === 'date' ? '.' : '\u0000', '-'))}" ${field.type === 'date' ? `min="1900-01-01" max="${today()}"` : `maxlength="${field.max}" placeholder="${field.placeholder}"`} autocomplete="off" spellcheck="false" aria-describedby="entry-hint entry-error"><p id="entry-hint">${field.hint}</p><p id="entry-error" role="status"></p><p class="entry-privacy">교환하면 입력한 내용이 마지막 연결 결과에 등장합니다.<br>서버 전송·저장 없이 이 브라우저에서만 사용하고, 마지막 이야기로 넘어갈 때 지웁니다.</p></div>`;
    };
    const art = (card, src) => {
      const entry = get(card.id);
      return `<span class="personal-card-art"><img src="${src}" alt="" width="1024" height="1536"><span class="personal-card-value">${escape(entry?.value || '직접 입력')}</span></span>`;
    };
    const input = event => {
      if (event.target.id !== 'card-value' || !draft) return;
      draft.value = event.target.value;
      const field = fields[draft.id];
      document.getElementById('entry-error').textContent = draft.value && !valid() ? field.type === 'date' ? '1900년 이후, 오늘까지의 올바른 날짜를 선택해주세요.' : field.type === 'email' ? '올바른 이메일 주소 형식으로 입력해주세요.' : `${field.max}자 이하로 입력해주세요.` : '';
      onChange();
    };
    return { escape, fact, get, art, editor, input, valid, clearDraft,
      entries: () => entries,
      select(id) { clearDraft(); if (id) draft = { id, value: '' }; },
      confirm(id) { if (draft?.id !== id || !valid() || entries[id]) return false; entries[id] = { ...draft, value: draft.value.trim().replaceAll(id === 'birthday' ? '-' : '\u0000', '.') }; draft = null; return true; },
      clear() { clearDraft(); entries = {}; },
    };
  }
  window.BlackSwanPersonal = { create, escape };
})();
