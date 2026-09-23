/* Fictional card facts and illustrative inferences. No external lookup or profiling. */
(() => {
  const facts = {
    name: { label: '닉네임', value: 'zzang_hacker' },
    hobby: { label: '관심사', value: '클라이밍' },
    birthday: { label: '생년월일', value: '2003.09.14' },
    school: { label: '학교/소속', value: '서울여자대학교 · 정보보호학과' },
    photo: { label: '사진', value: '프로필 사진을 나타내는 가상 카드' },
    location: { label: '위치정보', value: '서울시 노원구 공릉동' },
  };
  const patterns = [
    { ids: ['name', 'school', 'birthday'], group: 'identity', level: 5, title: '익명의 닉네임에,\n소속과 생일이 붙었습니다.', inference: '“zzang_hacker”는 서울여자대학교 정보보호학과 소속이며, 2003년 9월 14일생인 사람일 수 있습니다.', consequence: '같은 소속 안에서도 생년월일까지 겹치는 사람은 더 좁혀집니다. 실명을 주지 않았어도, 익명으로 남긴 글이 같은 소속 안의 자신과 연결될 단서가 생깁니다.', limit: '계정 주인을 확인한 것은 아닙니다. 같은 정보를 가진 사람이 있을 수 있습니다.' },
    { ids: ['photo', 'location'], group: 'place', level: 5, title: '모습에 장소가 붙으면,\n현실의 단서가 됩니다.', inference: '실제 얼굴 사진과 공릉동이라는 위치가 함께 제공됐다면, 그 인물과 특정 지역을 연결할 수 있습니다.', consequence: '온라인의 모습을 오프라인 장소와 연결하는 단서가 될 수 있습니다. 누구에게 어느 범위까지 보이는 사진인지가 중요해집니다.', limit: '사진 속 인물을 식별하거나 분석하지 않습니다. 한 번의 위치로 집이나 이동 경로를 알 수는 없습니다.' },
    { ids: ['name', 'photo'], group: 'identity', level: 4, title: '온라인 이름과 얼굴이\n같은 사람을 가리킵니다.', inference: '실제 프로필 사진이 붙는다면, “zzang_hacker”라는 이름의 활동을 사진 속 인물과 연결할 단서가 됩니다.', consequence: '상황마다 분리해서 쓰던 온라인 정체성이 연결될 수 있습니다. 공개 범위가 다른 두 정보도 함께 쓰이면 의미가 달라집니다.', limit: '이 게임은 실제 얼굴 사진이나 계정을 검색하지 않습니다.' },
    { ids: ['name', 'school'], group: 'identity', level: 3, title: '닉네임 뒤의 사람이\n조금 더 좁혀집니다.', inference: '“zzang_hacker”라는 닉네임을 쓰는 사람의 소속이 서울여자대학교 정보보호학과일 수 있다는 단서가 생깁니다.', consequence: '온라인 이름만 있었을 때보다 계정 주인의 후보가 좁아집니다. 익명으로 쓴 글과 같은 소속 안의 자신을 분리하기가 더 어려워질 수 있습니다.', limit: '이 두 정보만으로 특정인을 확정할 수는 없습니다.' },
    { ids: ['birthday', 'school'], group: 'identity', level: 3, title: '같은 소속의 누군가가,\n특정 생일의 누군가로.', inference: '서울여자대학교 정보보호학과라는 소속 안에 2003년 9월 14일이라는 생년월일 조건이 더해집니다.', consequence: '넓은 소속 집단에서 개인을 구별할 단서가 늘어납니다. 이름을 주지 않았어도 다른 정보와 연결될 여지는 남습니다.', limit: '동일한 조건의 사람이 있을 수 있어, 이것만으로 신원을 확정하지는 못합니다.' },
    { ids: ['school', 'location'], group: 'place', level: 4, title: '소속에 장소가 더해져,\n생활권의 단서가 됩니다.', inference: '이 정보의 주인은 서울여자대학교 정보보호학과와 공릉동이라는 장소에 관련된 사람으로 묶일 수 있습니다.', consequence: '연락하거나 서비스를 제공할 지역을 좁히는 정보가 됩니다. 위치 기록이 반복되면 추정할 수 있는 생활 패턴도 더 많아질 수 있습니다.', limit: '지금 카드는 한 지역만 보여줍니다. 거주지, 등하교 경로, 현재 위치는 알 수 없습니다.' },
    { ids: ['name', 'hobby'], group: 'interest', level: 2, title: '닉네임 하나가,\n취향을 가진 대상이 됩니다.', inference: '“zzang_hacker”는 클라이밍에 관심 있는 사용자로 분류될 수 있습니다.', consequence: '그 이름을 기준으로 관심사에 맞춘 상품·체험 같은 광고나 추천을 맞출 수 있습니다. 취향 정보는 누가 무엇을 보여줄지 결정하는 데 쓰일 수 있습니다.', limit: '관심이 있다는 사실이 실제 구매 의사나 활동 이력을 뜻하지는 않습니다.' },
    { ids: ['hobby', 'location'], group: 'interest', level: 3, title: '좋아하는 것에,\n활동할 만한 지역이 붙습니다.', inference: '공릉동과 관련이 있고 클라이밍에 관심 있는 사람이라는 분류가 가능합니다.', consequence: '관심사만 있을 때보다 지역을 좁힌 광고나 제안이 가능해집니다. 단순한 취향도 위치와 만나면 더 구체적인 대상으로 이어집니다.', limit: '실제로 다니는 시설이나 방문 장소를 확인한 것은 아닙니다.' },
    { ids: ['hobby', 'school'], group: 'interest', level: 2, title: '평범한 취향이,\n소속 집단의 특징이 됩니다.', inference: '서울여자대학교 정보보호학과와 관련된 클라이밍 관심 사용자라는 조합이 만들어집니다.', consequence: '소속과 취향을 함께 기준으로 삼는 추천이나 홍보 대상이 될 수 있습니다. 정보의 사용 목적에 따라 같은 조합의 의미도 달라집니다.', limit: '동아리 가입 여부나 실제 활동 빈도는 알 수 없습니다.' },
    { ids: ['birthday', 'location'], group: 'place', level: 4, title: '생년월일과 지역이,\n같은 기록에 남습니다.', inference: '2003년 9월 14일생이며 공릉동과 관련 있는 사람이라는 조건이 만들어집니다.', consequence: '서로 다른 기록에서 같은 사람을 구별할 단서가 늘어납니다. 생일과 지역 각각을 제공할 때보다 연결된 기록이 더 구체적입니다.', limit: '한 지역만으로 거주지나 현재 위치를 확정할 수는 없습니다.' },
  ];
  function casesFor(ids, entries = {}) {
    const resolved = Object.fromEntries(Object.entries(facts).map(([id, fact]) => [id, { ...fact, value: entries[id]?.value || fact.value }]));
    const birth = resolved.birthday.value.split(/[.\-]/);
    const birthdayText = birth.length === 3 ? `${birth[0]}년 ${Number(birth[1])}월 ${Number(birth[2])}일` : resolved.birthday.value;
    const replacements = {
      'zzang_hacker': resolved.name.value,
      '서울여자대학교 정보보호학과': resolved.school.value,
      '서울여자대학교 · 정보보호학과': resolved.school.value,
      '2003년 9월 14일': birthdayText,
      '2003.09.14': resolved.birthday.value,
      '서울시 노원구 공릉동': resolved.location.value,
      '공릉동': resolved.location.value,
      '클라이밍': resolved.hobby.value,
    };
    const personalize = item => {
      const result = { ...item };
      for (const key of ['title', 'inference', 'consequence', 'limit']) result[key] = result[key].replace(/서울여자대학교 · 정보보호학과|서울여자대학교 정보보호학과|서울시 노원구 공릉동|2003년 9월 14일|2003\.09\.14|zzang_hacker|공릉동|클라이밍/g, match => replacements[match]);
      if (entries.photo?.photoUrl && item.ids.includes('photo')) result.limit = '선택한 사진은 이 브라우저에서만 표시합니다. 얼굴 인식이나 계정 검색은 하지 않으며, 한 번의 위치로 거주지나 이동 경로를 확정할 수 없습니다.';
      return result;
    };
    const selected = [...new Set(ids)].filter(id => facts[id]);
    if (!selected.length) return [{ ids: [], level: 0, title: '이번에는,\n연결할 정보가 없습니다.', inference: '게임에 건넨 개인정보 카드가 없어, 이 체험에서 구성할 프로필도 없습니다.', consequence: '정보를 제공하지 않는 것도 선택입니다. 다음에 필요한 서비스를 만났을 때는 목적과 사용 범위를 확인하고 결정할 수 있습니다.', limit: '이번 게임에서 선택한 카드에 대한 결과입니다.' }];
    if (selected.length === 1) {
      const id = selected[0], fact = resolved[id];
      return [{ ids: [id], level: {name:1,hobby:1,birthday:2,school:2,photo:3,location:3}[id], title: '카드는 한 장.\n단서는 하나 남았습니다.', inference: `제공한 ${fact.label} 카드에는 “${fact.value}”라는 정보가 담겨 있습니다.`, consequence: id === 'location' ? '한 번의 위치가 곧 생활 패턴은 아닙니다. 하지만 기록이 쌓이거나 다른 정보와 연결되면 장소의 의미가 달라질 수 있습니다.' : id === 'photo' ? entries.photo?.photoUrl ? '사진에는 모습뿐 아니라 주변 맥락이 담길 수 있습니다. 선택한 사진은 이 브라우저에서만 표시하며 얼굴이나 장소를 자동 분석하지 않습니다.' : '사진에는 모습뿐 아니라 주변 맥락이 담길 수 있습니다. 사진 속 내용을 자동 분석하지 않습니다.' : '이 정보가 어디에 보관되고, 누구에게 전달되며, 다른 기록과 연결되는지에 따라 이후의 의미가 달라질 수 있습니다.', limit: '한 장만으로 다른 개인정보나 신원을 알아낸 것은 아닙니다.' }];
    }
    const eligible = patterns.filter(item => item.ids.every(id => selected.includes(id)));
    const groups = new Set(), chosen = [];
    for (const item of eligible) if (!groups.has(item.group)) { groups.add(item.group); chosen.push(item); }
    if (chosen.length) return chosen.slice(0, 3).map(personalize);
    return [{ ids: selected, level: 2, title: '따로였던 정보가,\n같은 사람의 기록이 됩니다.', inference: selected.map(id => `${resolved[id].label}: ${resolved[id].value}`).join(' · '), consequence: '각각의 정보만 볼 때보다 여러 특징을 함께 가진 대상으로 분류할 수 있습니다. 제공하는 항목 수뿐 아니라 어떤 기록과 함께 쓰이는지 확인해야 하는 이유입니다.', limit: '이 조합만으로 이름, 거주지, 온라인 계정 등을 확정할 수는 없습니다.' }];
  }
  const chapters = [
    { label: '보상 뒤의 선택', title: '우리가 살펴본 것은,\n당신의 선택이었습니다.', paragraphs: ['이번 게임을 통해 살펴보고자 했던 것은, 당첨 여부가 아니라 보상을 얻기 위한 순간에 우리가 어떤 개인정보를 선택하게 되는지였습니다.'] },
    { label: '가볍게 느껴졌던 정보', title: '어떤 정보는,\n조금 더 가벼웠나요?', paragraphs: ['게임을 진행하며 어떤 정보는 가볍게 느껴졌고, 어떤 정보는 조금 더 고민하게 만들었을 겁니다.', '하지만 개인정보의 가치는 <strong>하나의 정보만으로 결정되지 않습니다.</strong>'] },
    { label: '연결된다는 것', title: '평범한 조각들이,\n한 사람을 설명합니다.', paragraphs: ['닉네임, 관심사, 학교, 생년월일처럼 각각은 평범해 보이는 정보도 서로 연결되면 한 사람을 더 구체적으로 설명하는 정보가 될 수 있습니다.'] },
    { label: '제공하는 것도 선택', title: '제공하는 선택이\n잘못된 것은 아닙니다.', paragraphs: ['그렇다고 개인정보를 제공하는 것 자체가 잘못된 것은 아닙니다.', '중요한 것은 왜 필요한 정보인지, 어디에 사용되는지, 무엇과 교환하고 있는지를 이해한 뒤 <strong>스스로 선택하는 것입니다.</strong>'] },
    { label: '결정하는 사람', title: '나의 정보.\n결정하는 사람도, 나.', paragraphs: ['개인정보는 무조건 숨겨야 하는 정보가 아니라, 내가 그 가치를 알고, 어떻게 사용할지 결정해야 하는 <strong>나의 정보입니다.</strong>'] },
    { label: '게임 밖으로', title: '다음 선택은,\n조금 더 주도적으로.', paragraphs: ['오늘의 작은 경험이 더 안전하고 주도적인 개인정보 이용으로 이어지길 바랍니다.'], closing: '왜 필요한지 · 어디에 쓰이는지 · 무엇과 바꾸는지' },
  ];
  window.BlackSwanStory = { facts, casesFor, chapters };
})();
