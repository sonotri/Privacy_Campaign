(() => {
  'use strict';
  const app = document.getElementById('app');
  const announcer = document.getElementById('announcer');
  const homeMarkup = app.innerHTML;
  const cards = [
    { id: 'name', name: '닉네임', stars: 1, file: 'name_card.png', detail: '온라인에서 나를 구별하는 이름' },
    { id: 'hobby', name: '관심사', stars: 1, file: 'hobby_card.png', detail: '내 취향과 관심을 보여주는 정보' },
    { id: 'birthday', name: '생년월일', stars: 2, file: 'birthday_card.png', detail: '나이와 생일을 알려주는 정보' },
    { id: 'school', name: '학교/소속', stars: 2, file: 'school_affiliation_card.png', detail: '내가 속한 학교나 단체에 관한 정보' },
    { id: 'email', name: '이메일 주소', stars: 3, file: 'email_card.png', detail: '연락과 계정 연결에 쓰이는 주소' },
    { id: 'residence', name: '거주지 정보', stars: 3, file: 'residence_card.png', detail: '내가 생활하는 지역을 보여주는 정보' },
  ];
  const symbols = [{ name: '백조', file: 'swan.png' }, { name: '열쇠', file: 'key.png' }, { name: '별', file: 'star.png' }];
  const { facts: exampleFacts, casesFor: buildCases, chapters } = window.BlackSwanStory;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const freshState = () => ({ screen: 'home', spins: 1, rounds: 0, used: [], selected: [], reels: [0, 1, 2], spinning: false, won: false, lastTrade: null, receipt: null, caseIndex: 0, chapter: 0 });
  let state = freshState();
  const personal = window.BlackSwanPersonal.create({ examples: exampleFacts, onChange: refreshEntry });
  const esc = personal.escape;
  const casesFor = ids => buildCases(ids, personal.entries());
  let viewTimers = [], soundOn = true;
  const soundtrack = window.BlackSwanAudio.create();
  const syncSoundtrack = () => soundtrack.update({ enabled: soundOn, screen: state.screen, spinning: state.spinning });
  const usedCards = () => state.used.map(id => cards.find(card => card.id === id));
  const availableCards = () => cards.filter(card => !state.used.includes(card.id));
  const bonus = () => cards.filter(card => state.selected.includes(card.id)).reduce((sum, card) => sum + card.stars, 0);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const later = (fn, ms) => viewTimers.push(setTimeout(fn, ms));
  const say = message => { announcer.textContent = message; };
  const asset = file => `./assets/${file}`;
  const stars = n => '★'.repeat(n);
  const icon = '<span aria-hidden="true">✦</span>';
  // Decode supplied images during the opening screen so later views appear promptly.
  const imageCache = [...cards.map(card => card.file), ...symbols.map(symbol => symbol.file), 'roulette.png'].map(file => {
    const image = new Image(); image.decoding = 'async'; image.src = asset(file); return image;
  });

  function beep(frequency = 500, duration = .08, type = 'sine') {
    soundtrack.effect(frequency, duration, type);
  }
  function go(screen) {
    viewTimers.forEach(clearTimeout); viewTimers = [];
    if (screen === 'credits' || screen === 'ended') personal.clear();
    state.screen = screen; render();
    if (!app.querySelector('dialog[open]')) app.focus({ preventScroll: true }); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function footer() { return ''; }
  function cardMarkup(card, mode = 'select') {
    const used = state.used.includes(card.id), selected = state.selected.includes(card.id);
    if (mode === 'select') return `<button class="data-card ${used ? 'used' : ''} ${selected ? 'selected' : ''}" data-card="${card.id}" aria-pressed="${selected}" aria-label="${card.name}, 교환 가치 별 ${card.stars}개, SPIN ${card.stars}회${used ? ', 교환 완료' : ''}" ${used ? 'disabled' : ''}>${personal.art(card, asset(card.file))}<span class="selection-mark" aria-hidden="true">${used ? '✓' : selected ? '✓' : '+'}</span><span class="card-caption"><strong>${card.name}</strong><span>${used ? '교환 완료' : `SPIN ×${card.stars}`}</span></span></button>`;
    return `<figure class="review-card">${personal.art(card, asset(card.file))}<figcaption>${card.name}<span>SPIN +${card.stars}</span></figcaption></figure>`;
  }
  function howTo() {
    return `<section class="briefing-screen" aria-labelledby="briefing-title">
      <div class="briefing-topline"><span class="eyebrow">[ HOW TO PLAY? ]</span><span class="briefing-edition">BLACK SWAN / ROULETTE</span></div>
      <div class="briefing-main">
        <div class="briefing-copy"><span class="briefing-overline">THREE OF A KIND</span><h1 id="briefing-title">같은 심볼 3개,<br><em>JACKPOT.</em></h1><p>룰렛을 돌려 같은 심볼 3개를 맞춰보세요. <br>세 개의 심볼이 일치하면<br class="desktop-break"> 보상을 획득할 수 있습니다!</p><div class="briefing-reward"><span aria-hidden="true">✦</span><div><small>YOUR REWARD</small><strong>같은 심볼 3개 = 상품 당첨</strong></div></div></div>
        <div class="briefing-demo" aria-label="백조 심볼 3개가 일치하는 당첨 예시">
          <div class="demo-orbit" aria-hidden="true"></div><div class="demo-orbit inner" aria-hidden="true"></div>
          <div class="demo-label"><span>WINNING COMBINATION</span><b>01 — 02 — 03</b></div>
          <div class="demo-cards">${[0, 1, 2].map(i => `<div class="demo-card" style="--card-index:${i}"><img src="${asset('swan.png')}" alt="${i + 1}번째 백조 심볼" width="1254" height="1254"><span>${String(i + 1).padStart(2, '0')}</span></div>`).join('')}</div>
          <div class="demo-payline" aria-hidden="true"><i></i><span>✦</span><i></i></div><div class="demo-match">MATCH <span>×3</span></div>
        </div>
      </div>
      <div class="briefing-launch"><button class="launch-button" data-action="play">룰렛 시작하기 <span aria-hidden="true">→</span></button><p class="launch-caption"><span>첫 SPIN 1회 제공</span><span class="caption-divider" aria-hidden="true">·</span><span>추가 기회는 카드로 교환</span></p></div>
      <details class="game-rules"><summary>게임 규칙</summary><ul><li>처음에 SPIN 1회를 받습니다. 첫 두 회에는 세 심볼이 서로 겹치지 않습니다.</li><li>세 번째 회부터 같은 심볼 3개가 나오면 당첨이며, 1회당 당첨 확률은 1/9입니다.</li><li>카드의 ★는 교환 가치입니다. 한 장씩, 한 번만 교환하며 ★ 하나당 SPIN 1회를 받습니다. BONUS는 이 총횟수를 뜻합니다.</li><li>남은 SPIN을 모두 사용한 뒤 다음 카드를 교환할 수 있습니다. 처음 받은 1회를 포함해 최대 13회입니다.</li><li>당첨, 직접 중단, 또는 SPIN과 카드 소진 시 종료합니다. 당첨 후 남은 SPIN은 사용하지 않습니다.</li></ul></details>
    </section>${footer(1)}`;
  }
  function playScreen() {
    const missed = state.screen === 'miss';
    const canTrade = missed && !state.spins && availableCards().length > 0;
    const exhausted = missed && !state.spins && !canTrade;
    const offer = canTrade && state.rounds >= 2 && availableCards().some(card => card.stars > 1);
    const receipt = cards.find(card => card.id === state.receipt);
    return `<section class="play-screen immersive-play"><div class="game-hud"><div><span class="eyebrow">YOUR CHANCE</span><div class="spin-count"><strong>${String(state.spins).padStart(2, '0')}</strong><span>SPINS LEFT</span></div></div><div class="round-count">ROUND <b>${String(state.rounds + (!state.spinning && !missed ? 1 : 0)).padStart(2, '0')}</b><span>남은 카드 ${availableCards().length} / 6</span></div></div>
      <div class="machine ${state.spinning ? 'is-spinning' : ''}"><img class="machine-frame" src="${asset('roulette.png')}" alt="네온 룰렛 머신" width="1672" height="941"><div class="reels" aria-label="룰렛 심볼">${state.reels.map((value, index) => `<div class="reel reel-${index}" data-reel="${index}"><img src="${asset(symbols[value].file)}" alt="${index + 1}번 심볼: ${symbols[value].name}" width="1254" height="1254"></div>`).join('')}</div><button class="spin-hotspot" data-action="spin" aria-label="룰렛 돌리기, 남은 SPIN ${state.spins}회" ${state.spinning || !state.spins ? 'disabled' : ''}><span>${state.spinning ? 'SPINNING…' : 'SPIN'}</span></button><div class="spin-status" aria-live="polite">${state.spinning ? '세 개의 심볼이 멈추는 중…' : missed ? 'MISS · 세 심볼이 일치하지 않았습니다' : 'SPIN을 눌러 행운을 확인하세요'}</div></div>
      <div class="round-feedback" aria-live="polite"><div class="round-message"><span>${receipt ? 'TRADE CONFIRMED' : offer ? 'BLACK SWAN' : exhausted ? 'LAST SPIN' : missed ? 'MISS' : 'MATCH THREE'}</span><p>${receipt ? `${receipt.name} → <strong>SPIN +${receipt.stars}</strong>` : offer ? '조금 더 가치 있는 정보라면,<br><strong>BONUS SPIN을 드릴게요.</strong>' : exhausted ? '모든 기회를 사용했습니다.<br>이제, 당신의 선택을 확인하세요.' : missed && state.spins ? `아직 <strong>${state.spins}번</strong>의 기회가 남아 있습니다.` : missed ? '남은 SPIN을 모두 사용했습니다.<br>카드 한 장으로 기회를 이어갈까요?' : '같은 심볼 3개를 맞추면 JACKPOT!'}</p></div>${missed && state.spins ? '<button class="quiet-primary" data-action="spin">한 번 더 SPIN</button>' : exhausted ? '<button class="quiet-primary" data-action="finish">나의 선택 확인</button>' : ''}</div>
      <div class="play-bottom"><span>${offer ? '★★ 총 2회 · ★★★ 총 3회' : 'BLACK SWAN ROULETTE'}</span>${!exhausted ? `<button class="text-button" data-action="${canTrade ? 'cancel' : 'finish'}" ${state.spinning ? 'disabled' : ''}>여기서 마치기</button>` : ''}</div></section>${canTrade ? exchangeDialog() : ''}`;
  }
  function exchangeDialog() {
    return `<dialog class="exchange-dialog" aria-labelledby="exchange-title" aria-describedby="exchange-description"><span class="scene-label">NEXT CHANCE</span><h1 id="exchange-title">한 번 더<br>도전할까요?</h1><p id="exchange-description">남은 SPIN이 없습니다.<br>보유한 카드로 다음 기회를 교환할 수 있습니다.</p><button class="exchange-cta" data-action="trade" autofocus>카드로 기회 교환 <span aria-hidden="true">→</span></button><button class="story-back" data-action="cancel">여기서 마치기</button></dialog>`;
  }
  function resultSymbols() {
    return `<div class="symbol-example result-symbols">${state.reels.map(value => `<img src="${asset(symbols[value].file)}" alt="${symbols[value].name}" width="1254" height="1254">`).join('')}</div>`;
  }
  function missScreen() { return playScreen(); }
  function tradeScreen() {
    const selected = cards.find(card => state.selected.includes(card.id));
    return `<section class="trade-screen"><header class="section-header"><div class="eyebrow">[ YOUR DATA ]</div><h1>어떤 기회와 바꾸시겠어요?</h1><p>교환할 개인정보 카드 <strong>한 장</strong>을 선택하세요.</p></header><div class="trade-legend"><span>★ <b>SPIN ×1</b></span><span>★★ <b>SPIN ×2</b></span><span>★★★ <b>SPIN ×3</b></span></div><p class="exchange-note">별은 게임 안에서의 교환 가치입니다. 도전 횟수가 늘어나며, 1회당 당첨 확률은 같습니다.</p><div class="card-grid">${cards.map(card => cardMarkup(card)).join('')}</div><div id="card-editor" class="card-editor">${personal.editor()}</div><div class="trade-bar"><div><span id="selected-count">${selected ? selected.name : '카드 한 장을 선택하세요'}</span><strong id="trade-bonus">+${bonus()} <small>SPINS</small></strong></div><button class="primary" id="confirm-trade" data-action="confirm-trade" ${personal.valid() ? '' : 'disabled'}>입력한 정보로 교환</button></div><div class="trade-bottom"><p class="small">교환할 카드의 내용을 직접 작성해주세요. 입력 내용은 이 브라우저에서만 사용합니다.</p><button class="text-button" data-action="cancel">교환 중단하기</button></div></section>${footer(1)}`;
  }

  function cancelScreen() {
    return `<section class="panel cancel-panel"><div class="big-glyph">◇</div><div class="eyebrow">[TRADE CANCELLED]</div><h1>교환을 중단합니다.</h1><p>남은 정보는 그대로 유지됩니다.</p><div class="remaining-chip">유지한 카드 <b>${availableCards().length}</b><span>사용한 카드 <b>${state.used.length}</b></span></div><div class="actions"><button class="primary" data-action="finish">나의 선택 확인하기 →</button><button class="text-button" data-action="${state.spins ? 'play' : 'trade'}">${state.spins ? '남은 SPIN으로 돌아가기' : '카드 선택으로 돌아가기'}</button></div></section>${footer(1)}`;
  }
  function jackpotScreen() {
    return `<section class="jackpot-screen"><div class="jackpot-sparks" aria-hidden="true">${Array.from({ length: 16 }, (_, i) => `<i style="--i:${i}">✦</i>`).join('')}</div><button class="jackpot-touch" data-action="finish"><span class="eyebrow">THREE OF A KIND</span><h1>JACKPOT!</h1>${resultSymbols()}<span class="reward-badge">${icon} 상품 당첨 ${icon}</span><p>이 화면을 운영진에게 보여주세요.</p><span class="small">당첨으로 룰렛이 종료됩니다. 남은 SPIN ${state.spins}회</span><span class="touch-prompt">화면을 터치해주세요</span><span class="small">키보드는 Enter를 눌러 계속할 수 있습니다.</span></button></section>${footer(1)}`;
  }
  function revealScreen() {
    const count = state.used.length;
    return `<section class="reveal-scene"><div class="reveal-kicker"><del>BLACK SWAN ROULETTE</del><span>CONSENT TEST</span></div><div class="reveal-main"><p class="scene-label">THE GAME IS OVER</p><h1>룰렛은 끝났습니다.<br><em>선택은 남았습니다.</em></h1><p class="reveal-line">${count ? `당신은 <strong>${count}장의 정보</strong>를 건넸습니다.<br>이제 그 정보들을, 다른 쪽에서 바라봅니다.` : '당신은 정보를 건네지 않았습니다.<br>그 선택도 이 경험의 일부입니다.'}</p></div><button class="story-next" data-action="used">${count ? '내가 건넨 정보 보기' : '나의 선택 돌아보기'}<span aria-hidden="true">→</span></button><span class="scene-footnote">${state.won ? '당첨 이후에도, 교환한 카드의 기록은 남아 있습니다.' : count ? '보상을 얻지 못해도, 교환한 카드의 기록은 남아 있습니다.' : '이번 게임에서 사용한 개인정보 카드 0장'}</span></section>`;
  }
  function usedScreen() {
    const used = usedCards(), earned = used.reduce((sum, card) => sum + card.stars, 0);
    const kept = availableCards();
    return `<section class="evidence-screen"><header class="evidence-header"><span class="scene-label">01 / YOUR EXCHANGE</span><h1>${used.length ? `당신에게는 <em>${earned}번의 기회.</em><br>상대에게는 <em>${used.length}장의 정보.</em>` : '여섯 장 모두,<br>당신에게 남았습니다.'}</h1><p>${used.length ? '보상을 기다리는 동안, 다음 정보들이 같은 사람의 기록으로 모였습니다.' : '정보를 제공하지 않고 게임을 마쳤습니다.'}</p></header>
      <div class="evidence-ledger">${used.map((card, i) => `<article class="evidence-row" style="--entry:${i}"><span class="evidence-order">${String(i + 1).padStart(2, '0')}</span><img src="${asset(card.file)}" alt="" width="1024" height="1536"><div><span>${card.name}</span><strong>${esc(personal.fact(card.id).value)}</strong></div><span class="evidence-price">+${card.stars} SPIN</span></article>`).join('') || '<div class="no-evidence">아직 연결할 정보가 없습니다.</div>'}</div>
      ${kept.length && used.length ? `<p class="kept-line">남겨둔 정보 <strong>${kept.map(card => card.name).join(' · ')}</strong></p>` : ''}
      <div class="evidence-question"><h2>${used.length >= 2 ? '하지만, 따로 건넨 정보가<br>서로 연결된다면?' : used.length ? '이 한 장은,<br>어떤 단서로 남을까요?' : '다음에 정보를 요청받는다면,<br>무엇을 먼저 확인할까요?'}</h2><button class="story-next" data-action="combine">${used.length >= 2 ? '정보 연결하기' : '이 선택의 의미 보기'}<span aria-hidden="true">→</span></button></div>
      <p class="scene-footnote">직접 작성해 교환한 내용입니다. 외부 검색 없이, 교환한 정보끼리만 연결합니다.</p></section>`;
  }

  function graphMarkup(used) {
    const positions = used.length === 1 ? [[50, 14]] : used.map((_, i) => { const a = -Math.PI / 2 + i * Math.PI * 2 / used.length; return [50 + Math.cos(a) * 35, 50 + Math.sin(a) * 35]; });
    const pairs = new Set();
    casesFor(state.used).forEach(rule => rule.ids.forEach((id, i) => rule.ids.slice(i + 1).forEach(other => pairs.add([used.findIndex(c => c.id === id), used.findIndex(c => c.id === other)].sort((a, b) => a - b).join(':')))));
    return `<div class="data-graph"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${positions.map(([x, y]) => `<line x1="${x}" y1="${y}" x2="50" y2="50"/>`).join('')}${[...pairs].map(pair => { const [a, b] = pair.split(':').map(Number); return `<line class="data-link" x1="${positions[a][0]}" y1="${positions[a][1]}" x2="${positions[b][0]}" y2="${positions[b][1]}"/>`; }).join('')}</svg><div class="graph-center"><span>PROFILE</span><small>${used.length} DATA</small></div>${used.map((card, i) => `<div class="graph-node" style="--x:${positions[i][0]}%;--y:${positions[i][1]}%;--delay:${i * .14}s"><strong>${card.name}</strong></div>`).join('')}${used.length === 0 ? '<p class="graph-empty">연결할 개인정보가 없습니다.</p>' : ''}</div>`;
  }
  function combinedScreen(loading) {
    const used = usedCards();
    if (loading) return `<section class="linking-scene"><span class="scene-label">02 / CONNECTING THE DOTS</span><h1>${used.length > 1 ? 'COMBINING DATA' : '당신의 선택을 살펴봅니다'}</h1>${graphMarkup(used)}<p>${used.length > 1 ? '따로였던 정보가, 한 사람을 향합니다.' : used.length ? '정보의 의미는, 쓰이는 맥락에 따라 달라집니다.' : '이번에는 연결할 개인정보가 없습니다.'}</p><button class="text-button" data-action="show-conclusion">결과 바로 보기</button></section>`;
    const cases = casesFor(state.used), item = cases[state.caseIndex];
    const last = state.caseIndex === cases.length - 1;
    return `<section class="dossier-screen" aria-labelledby="conclusion-title"><header class="dossier-header"><span class="scene-label">${used.length >= 2 ? 'PROFILE CREATED' : used.length ? 'ONE PIECE OF DATA' : 'NO DATA SHARED'}</span><span>연결 ${String(state.caseIndex + 1).padStart(2, '0')} / ${String(cases.length).padStart(2, '0')}</span></header>
      <div class="dossier-layout"><aside class="dossier-sources"><h2>당신이 건넨 정보</h2><div class="source-chain">${item.ids.map(id => `<div class="source-fact" data-source="${id}"><span>${exampleFacts[id].label}</span><strong>${esc(personal.fact(id).value)}</strong></div>`).join('') || '<p class="source-empty">사용한 카드 없음</p>'}</div><div class="connection-terminal"><span aria-hidden="true">↓</span>${item.ids.length > 1 ? '함께 연결하면' : '이 선택으로부터'}</div></aside>
      <article class="conclusion" tabindex="-1"><span class="conclusion-label">${item.ids.length > 1 ? '추정할 수 있는 것' : '남은 정보의 의미'}</span><h1 id="conclusion-title">${esc(item.title).replaceAll('\n', '<br>')}</h1><blockquote>${esc(item.inference)}</blockquote><div class="consequence"><h2>왜 달라질까요?</h2><p>${esc(item.consequence)}</p></div><p class="inference-limit">${esc(item.limit)}</p></article></div>
      <footer class="dossier-footer"><div class="scenario-risk"><span>정보 ${item.ids.length > 1 ? '결합 ' : ''}위험도</span><strong aria-label="${item.level}/5">${'★'.repeat(item.level)}<i>${'☆'.repeat(5-item.level)}</i></strong><small>교환 가치와 별개의 교육용 시나리오 지표</small></div><nav aria-label="정보 연결 결과"><button class="story-back" data-action="case-prev" ${!state.caseIndex ? 'disabled' : ''}>이전</button><button class="story-next" data-action="${last ? 'credits' : 'case-next'}">${last ? '마지막 이야기' : '다른 연결 보기'}<span aria-hidden="true">→</span></button></nav></footer></section>`;
  }
  function creditsScreen() {
    const chapter = chapters[state.chapter];
    return `<section class="reading-room" aria-labelledby="chapter-title" aria-live="polite"><header class="reading-header"><span>CONSENT TEST</span><span>${String(state.chapter + 1).padStart(2, '0')} / ${String(chapters.length).padStart(2, '0')}</span></header><article class="reading-page" tabindex="-1"><span class="chapter-label">${chapter.label}</span><h1 id="chapter-title">${chapter.title.replaceAll('\n', '<br>')}</h1><div class="chapter-copy">${chapter.paragraphs.map(text => `<p>${text}</p>`).join('')}</div></article><footer class="reading-footer">${state.chapter === 0 ? '<p class="session-cleared">입력한 내용과 선택한 정보는 이 게임에서 지웠습니다.</p>' : ''}<div class="reading-progress" style="--chapters:${chapters.length}" aria-label="총 ${chapters.length}장 중 ${state.chapter+1}장">${chapters.map((_,i)=>`<span class="${i < state.chapter ? 'complete' : i === state.chapter ? 'active' : ''}"></span>`).join('')}</div><div class="reading-autoplay"><span>5초 후 자동으로 이어집니다</span><button class="story-back" data-action="end">이야기 건너뛰기</button></div></footer></section>`;
  }
  function endedScreen() {
    return `<section class="end-scene"><span class="scene-label">BLACK SWAN / CONSENT TEST</span><h1>당신의 정보.<br><em>당신의 선택.</em></h1><p>게임이 끝났습니다.</p><div><button class="story-back" data-action="read-again">마지막 이야기 다시 읽기</button><button class="story-back" data-action="restart">처음으로</button></div><p class="music-credit">Music by <a href="https://blackvoid6.com/" target="_blank" rel="noopener noreferrer">Blackvoid6</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a></p></section>`;
  }
  function render() {
    const screens = { home: () => homeMarkup, how: howTo, play: playScreen, miss: missScreen, trade: tradeScreen, cancel: cancelScreen, jackpot: jackpotScreen, reveal: revealScreen, used: usedScreen, combining: () => combinedScreen(true), combined: () => combinedScreen(false), credits: creditsScreen, ended: endedScreen };
    app.innerHTML = screens[state.screen](); document.body.dataset.screen = state.screen;
    syncSoundtrack();
    const exchange = app.querySelector('.exchange-dialog');
    if (exchange) { exchange.showModal(); exchange.addEventListener('cancel', event => { event.preventDefault(); void action('cancel'); }); }
    document.body.classList.toggle('in-story', ['reveal', 'used', 'combining', 'combined', 'credits', 'ended'].includes(state.screen));
    if (state.screen === 'combining') later(() => { if (state.screen === 'combining') go('combined'); }, reducedMotion ? 150 : 2600);
    if (state.screen === 'credits') later(() => {
      if (state.screen !== 'credits') return;
      if (state.chapter < chapters.length - 1) { state.chapter++; go('credits'); }
      else go('ended');
    }, 5000);
    if (state.screen === 'jackpot') later(() => document.querySelector('.jackpot-touch')?.focus({ preventScroll: true }), 50);
  }
  function randomIndex(maxExclusive) {
    const values = new Uint32Array(1); let value;
    const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive;
    do { crypto.getRandomValues(values); value = values[0]; } while (value >= limit);
    return value % maxExclusive;
  }
  const randomSymbol = () => randomIndex(symbols.length);
  function drawOutcome(distinctSymbols) {
    if (!distinctSymbols) return [randomSymbol(), randomSymbol(), randomSymbol()];
    const remaining = symbols.map((_, index) => index), outcome = [];
    while (remaining.length) outcome.push(remaining.splice(randomIndex(remaining.length), 1)[0]);
    return outcome;
  }
  async function rollReel(index, result) {
    const reel = document.querySelector(`[data-reel="${index}"]`);
    if (!reel) return;
    const finalImage = () => `<img src="${asset(symbols[result].file)}" alt="${index + 1}번 심볼: ${symbols[result].name}" width="1254" height="1254">`;
    reel.setAttribute('aria-label', `${index + 1}번 릴 회전 중`);
    if (reducedMotion || !reel.animate) {
      await wait(150 + index * 100);
    } else {
      // A continuous strip gives each card real travel, acceleration, and a springy stop.
      // The final symbol is already drawn independently; animation never changes the odds.
      const turns = 24 + index * 7;
      const sequence = Array.from({ length: turns + 1 }, (_, step) => step === turns ? result : (state.reels[index] + step) % symbols.length);
      const strip = document.createElement('div');
      strip.className = 'reel-strip';
      strip.setAttribute('aria-hidden', 'true');
      strip.innerHTML = sequence.map(value => `<img src="${asset(symbols[value].file)}" alt="" width="1254" height="1254" draggable="false">`).join('');
      reel.replaceChildren(strip);
      const distance = turns * 100;
      const animation = strip.animate([
        { transform: 'translateY(0%)', offset: 0, easing: 'cubic-bezier(.45,0,1,1)' },
        { transform: `translateY(-${distance * .1}%)`, offset: .18, easing: 'linear' },
        { transform: `translateY(-${distance * .78}%)`, offset: .7, easing: 'cubic-bezier(.1,.55,.3,1)' },
        { transform: `translateY(-${distance + 4}%)`, offset: .965, easing: 'ease-out' },
        { transform: `translateY(-${distance}%)`, offset: 1 },
      ], { duration: 2700 + index * 650, fill: 'forwards' });
      try { await animation.finished; } catch { /* Still settle on the drawn result if interrupted. */ }
      animation.cancel();
    }
    reel.innerHTML = finalImage();
    reel.classList.add('stopped');
    reel.setAttribute('aria-label', `${index + 1}번 심볼: ${symbols[result].name}`);
    beep(420 + index * 210, .18, 'triangle');
    const status = document.querySelector('.spin-status');
    if (status) status.textContent = index === 2 ? '세 개의 심볼을 확인하세요!' : `${index + 1}번째 심볼 확정 · ${symbols[result].name}`;
  }
  async function spin() {
    if (!['play', 'miss'].includes(state.screen) || state.spinning || state.spins < 1) return;
    const spinState = state;
    state.screen = 'play'; state.receipt = null; state.spinning = true; state.spins--; state.rounds++;
    // The first two chances use each symbol exactly once; normal odds begin on spin three.
    const outcome = drawOutcome(state.rounds <= 2); render(); say('룰렛을 돌립니다.');
    document.querySelector('.machine')?.setAttribute('aria-busy', 'true');
    let tick = 0;
    const cycle = reducedMotion ? null : setInterval(() => {
      beep(160 + (tick++ % 5) * 42, .035, 'triangle');
    }, 105);
    try {
      await Promise.all(outcome.map((result, index) => rollReel(index, result)));
    } finally { clearInterval(cycle); }
    if (state !== spinState) return;
    const machine = document.querySelector('.machine');
    machine?.classList.remove('is-spinning');
    machine?.classList.add('spin-complete');
    machine?.setAttribute('aria-busy', 'false');
    // Keep the finished reels visible briefly before opening the result screen.
    await wait(reducedMotion ? 100 : 700);
    if (state !== spinState) return;
    state.reels = outcome; state.spinning = false; state.won = outcome.every(value => value === outcome[0]);
    say(`${outcome.map(i => symbols[i].name).join(', ')}. ${state.won ? '잭팟! 상품에 당첨되었습니다.' : '미당첨입니다.'}`);
    go(state.won ? 'jackpot' : 'miss');
    if (state.won) [523, 659, 784, 1046].forEach((hz, i) => later(() => beep(hz, .25), i * 140));
  }
  function refreshEntry() {
    if (state.screen !== 'trade') return;
    const card = cards.find(card => state.selected.includes(card.id));
    const button = document.getElementById('confirm-trade');
    button.disabled = !personal.valid();
    button.textContent = card ? `이 정보로 SPIN ${card.stars}회 교환` : '입력한 정보로 교환';
    if (card) document.querySelector(`[data-card="${card.id}"] .personal-card-art`).outerHTML = personal.art(card, asset(card.file));
  }
  function toggleCard(id, focus = true) {
    if (state.screen !== 'trade' || state.spins !== 0 || state.used.includes(id) || !cards.some(card => card.id === id)) return;
    state.selected = state.selected.includes(id) ? [] : [id];
    personal.select(state.selected[0]);
    render(); refreshEntry();
    const card = cards.find(card => state.selected.includes(card.id));
    if (card && focus) document.getElementById('card-value')?.focus({ preventScroll: false });
    beep(600, .04); say(card ? `${card.name} 선택. 내용을 직접 작성한 뒤 교환하세요.` : '선택을 해제했습니다.');
  }
  function confirmTrade() {
    if (state.screen !== 'trade' || state.spins !== 0 || state.selected.length !== 1) return;
    const card = cards.find(card => card.id === state.selected[0] && !state.used.includes(card.id));
    if (!card || !personal.confirm(card.id)) return;
    state.used.push(card.id); state.lastTrade = card.id; state.selected = []; state.spins += card.stars;
    state.receipt = card.id; go('play'); beep(740, .2, 'triangle'); say(`교환 완료. ${card.name}, SPIN ${card.stars}회.`);
  }
  async function action(name) {
    if (state.spinning) return;
    switch (name) {
      case 'start': if (state.screen === 'home') go('how'); break;
      case 'play': if (['how', 'miss', 'cancel'].includes(state.screen)) { state.selected = []; go(state.spins ? 'play' : 'trade'); } break;
      case 'spin': await spin(); break;
      case 'trade': if (['miss', 'cancel'].includes(state.screen) && state.spins === 0 && availableCards().length) { state.selected = []; go('trade'); } break;
      case 'confirm-trade': confirmTrade(); break;
      case 'cancel': if (['trade', 'miss'].includes(state.screen)) { personal.clearDraft(); state.selected = []; go('cancel'); } break;
      case 'finish': if (['play', 'miss', 'cancel', 'jackpot'].includes(state.screen)) { state.selected = []; go('reveal'); } break;
      case 'used': if (state.screen === 'reveal') go('used'); break;
      case 'combine': if (state.screen === 'used') { state.caseIndex = 0; go('combining'); } break;
      case 'show-conclusion': if (state.screen === 'combining') go('combined'); break;
      case 'case-next': if (state.screen === 'combined' && state.caseIndex < casesFor(state.used).length - 1) { state.caseIndex++; go('combined'); } break;
      case 'case-prev': if (state.screen === 'combined' && state.caseIndex > 0) { state.caseIndex--; go('combined'); } break;
      case 'credits': if (state.screen === 'combined') { state.chapter = 0; go('credits'); } break;
      case 'end': if (state.screen === 'credits') go('ended'); break;
      case 'read-again': if (state.screen === 'ended') { state.chapter = 0; go('credits'); } break;
      case 'restart': if (state.screen === 'ended') { personal.clear(); state = freshState(); go('home'); say('새 게임을 시작합니다.'); } break;
    }
  }
  app.addEventListener('input', personal.input);
  window.addEventListener('pagehide', () => { personal.clear(); state = freshState(); go('home'); });
  app.addEventListener('click', event => {
    if (state.screen === 'home' && event.target.closest('.home-art')) { void action('start'); return; }
    const card = event.target.closest('[data-card]'); if (card && !card.disabled) return toggleCard(card.dataset.card);
    const button = event.target.closest('[data-action]'); if (button && !button.disabled) { beep(440, .04); void action(button.dataset.action); }
  });
  document.getElementById('sound-toggle').addEventListener('click', event => {
    soundOn = !soundOn; const button = event.currentTarget;
    syncSoundtrack();
    button.setAttribute('aria-pressed', String(soundOn)); button.setAttribute('aria-label', soundOn ? '음악과 효과음 끄기' : '음악과 효과음 켜기'); button.querySelector('span').textContent = soundOn ? 'ON' : 'OFF'; beep(660, .15);
  });
  const fullscreen = document.getElementById('fullscreen-toggle');
  if (!document.fullscreenEnabled) fullscreen.hidden = true;
  fullscreen.addEventListener('click', async () => { try { if (document.fullscreenElement) await document.exitFullscreen(); else await document.documentElement.requestFullscreen(); } catch { say('현재 브라우저에서는 전체 화면을 사용할 수 없습니다.'); } });
  document.addEventListener('fullscreenchange', () => fullscreen.setAttribute('aria-label', document.fullscreenElement ? '전체 화면 종료' : '전체 화면'));
  document.addEventListener('keydown', event => {
    if (event.repeat || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.code === 'Space' && ['play', 'miss'].includes(state.screen) && !event.target.closest('button,a')) { event.preventDefault(); void spin(); }
    if (state.screen === 'combined' && ['ArrowLeft', 'ArrowRight'].includes(event.key)) { event.preventDefault(); void action(event.key === 'ArrowLeft' ? 'case-prev' : 'case-next'); }
  });

  // Agent actions share the visible interface's guarded transitions.
  if (document.modelContext?.registerTool) {
    const lifecycle = new AbortController();
    const snapshot = () => ({ screen: state.screen, spins: state.spins, rounds: state.rounds, usedCards: [...state.used], selectedCards: [...state.selected], spinning: state.spinning, won: state.won, caseIndex: state.caseIndex, chapter: state.chapter });
    const register = tool => { try { Promise.resolve(document.modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); } catch {} };
    register({ name: 'read_roulette_state', title: '현재 게임 상태 확인', description: '현재 화면, 남은 SPIN과 선택·교환한 카드 종류를 읽습니다.', inputSchema: { type: 'object', properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true }, execute: snapshot });
    register({ name: 'advance_roulette', title: '게임 화면에서 행동하기', description: '현재 표시된 행동을 실행합니다. confirm-trade는 카드를 소비하고 SPIN을 추가합니다. spin은 SPIN 1회를 소비하고 결과까지 기다립니다.', inputSchema: { type: 'object', properties: { action: { type: 'string', enum: ['start', 'play', 'spin', 'trade', 'confirm-trade', 'cancel', 'finish', 'used', 'combine', 'show-conclusion', 'case-next', 'case-prev', 'credits', 'end', 'read-again', 'restart'] } }, required: ['action'], additionalProperties: false }, annotations: { readOnlyHint: false }, async execute(input) {
      if (!input || typeof input.action !== 'string' || Object.keys(input).some(key => key !== 'action') || !Array.from(app.querySelectorAll('[data-action]')).some(button => button.dataset.action === input.action && !button.disabled)) throw new Error('현재 화면에서 사용할 수 없는 행동입니다.');
      await action(input.action); return snapshot();
    } });
    register({ name: 'select_privacy_cards', title: '교환할 카드 선택', description: '카드 한 장만 선택합니다. 실제 교환은 confirm-trade 행동으로 완료합니다.', inputSchema: { type: 'object', properties: { cardIds: { type: 'array', maxItems: 1, uniqueItems: true, items: { type: 'string', enum: cards.map(card => card.id) } } }, required: ['cardIds'], additionalProperties: false }, annotations: { readOnlyHint: false }, execute(input) {
      if (state.screen !== 'trade' || !input || !Array.isArray(input.cardIds) || input.cardIds.length > 1 || state.spins !== 0 || Object.keys(input).some(key => key !== 'cardIds') || new Set(input.cardIds).size !== input.cardIds.length || input.cardIds.some(id => !availableCards().some(card => card.id === id))) throw new Error('현재 교환 가능한 카드만 선택할 수 있습니다.');
      personal.select(input.cardIds[0]); state.selected = [...input.cardIds]; render(); refreshEntry(); return snapshot();
    } });
    window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
  }
})();
