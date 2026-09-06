
const $ = id => document.getElementById(id);
const STATS = {STR:"근력", ARC:"신비", END:"체력", SPD:"속도", LCK:"행운"};

/* ══════════ 1. 보정 라이브러리 ══════════
   f: multi(%) flat reduc reducMul trueFlat crit critDmg(%) affSet finalMul
   opts: 변형 | max: 스택 | t2: 특성 T2 | sim: 시뮬레이션 자동 제어 태그        */
const MODS = [
{g:"기어", key:"gear", tiles:true, cap:4, items:[
  {n:"행운의 뿔", opts:[["기본 +5%",{multi:5}],["CP 50 소모 +45%",{multi:45}]]},
  {n:"결정화된 가시", opts:[["기본 +5",{flat:5}],["CP 60 소모 +40",{flat:40}]]},
  {n:"피어나는 눈꽃", opts:[["기본 트루 +5",{trueFlat:5}],["CP 100 소모 +35",{trueFlat:35}]]},
  {n:"세월의 장", opts:[["치명타 +5",{crit:5}],["CP 50 소모 +45",{crit:45}]]},
  {n:"감염된 신체", note:"대상 착용 시", opts:[["방어력 +15",{reduc:15}],["CP 50 소모 +165",{reduc:165}]]},
  {n:"쉐도우 건틀렛", note:"흡혈 전용, 피해 영향 없음", f:{}},
  {n:"엘레멘튜리 리소넌스", note:"기어 색 = 스킬 속성", f:{multi:10}},
  {n:"포레스트 참", opts:[["숲 +15%",{multi:15}],["자연 속성 +25%",{multi:25}],["숲+자연 +40%",{multi:40}]]},
  {n:"불칸 너클", note:"화염 속성", f:{multi:15}},
  {n:"샤드 오브 블라이트", note:"어둠 속성", f:{multi:20}},
  {n:"밴드 오브 크러싱 포스", opts:[["방어 중인 적 +25%",{multi:25}],["2턴 지속 +10%",{multi:10}],["둘 다 +35%",{multi:35}]]},
  {n:"래미즈칸 아이돌", note:"막기·패링 후 1턴", f:{multi:15}},
  {n:"배인글로리우스 로켓", sim:"vain", opts:[["1턴차 +15%",{multi:15}],["2턴차 +10%",{multi:10}],["3턴차 +5%",{multi:5}]]},
  {n:"포커스드 마인드", sim:"medi", note:"명상 다음 턴", f:{multi:20}},
  {n:"스파이크드 스틸 볼", note:"35% 확률 추가타", f:{multi:35}},
  {n:"에버비팅 드럼", note:"20% 확률 · 적 2명↑", f:{multi:25}},
  {n:"임퓨어 크라운", f:{multi:5}},
  {n:"크리스탈 스패어", f:{crit:5}},
  {n:"프로즌 디아뎀", note:"얼음 스킬당", f:{crit:5}, max:10, unit:"스택"},
  {n:"티어 블러드 크리스탈", note:"출혈 적용당", f:{crit:5}, max:5, unit:"스택"},
  {n:"글래밍 캐럿", note:"턴당 +1", f:{crit:1}, max:6, unit:"턴"},
  {n:"크리스탈라이즈드 스타", note:"치명타마다 행운 +10", f:{crit:10}, max:5, unit:"스택"},
  {n:"야툴 워레스 (과열)", sim:"heat", note:"5턴당 1스택 · +8%", f:{multi:8}, max:10, unit:"스택"},
  {n:"코아귤레이트 핑거 네일", sim:"coag", note:"대상 착용 · 턴당 방어 +1.5%", f:{reducMul:1.015}, max:10, unit:"턴"},
  {n:"마그마 참", note:"대상 착용 · 화염 −10%", f:{reduc:11.11}},
  {n:"몰튼 캐라피스", note:"대상 착용 · 체력 40%↓", f:{reduc:17.65}},
  {n:"위키드 크라운", note:"대상 착용 · 도트 한정", f:{reduc:566.67}},
  {n:"에그 셸멧", note:"대상 착용 · 방어 +10%", f:{reducMul:1.10}},
  {n:"레빗 펠트", note:"대상 착용 · 연속 공격당", f:{reducMul:1.05}, max:6, unit:"스택"},
  {n:"데저트 에스커쳔", note:"3스택 시 다음 피해 무효", f:{finalMul:0}},
  {n:"에스펙트 오브 맬라답션", note:"대상 착용", opts:[["같은 속성 −35%",{multi:-35}],["다른 속성 +30%",{multi:30}]]}
]},
{g:"유물 · 인챈트", key:"art", tiles:true, cap:2, items:[
  {n:"스텔리안 코어", note:"체력 95%↑", f:{multi:30, crit:15}},
  {n:"시프팅 아워글래스", note:"버프당 +20%", f:{multi:20}, max:5, unit:"스택"},
  {n:"에이션트 인시그니아", note:"바위 · P2에선 트루 한정 버그", f:{}},
  {n:"인페르노", note:"화상 걸린 적", f:{multi:20}},
  {n:"리퍼", note:"대상 체력 비례 최대", f:{multi:25}},
  {n:"커스드", opts:[["저주 대상 +30%",{multi:30}],["분열 대상 +20%",{multi:20}]]},
  {n:"스펙트랄", note:"50% 확률 방어력 절반 무시", f:{reducMul:0.5}},
  {n:"프로스트", note:"추위 대상 폭발 기본 10", f:{}}
]},
{g:"기어 특성 (오브)", sub:"T1/T2 · 최대 10개 중첩", tier:true, items:[
  {n:"[Heavy Hand] 2NRG 이상 스킬", f:{multi:5}, t2:{multi:9}},
  {n:"[Cleave] 체력 절반 이하 대상", f:{multi:7}, t2:{multi:11}},
  {n:"[Momentum] 연속 공격 턴", sim:"momentum", note:"최대 3스택", f:{multi:2}, t2:{multi:4}},
  {n:"[Fleet] 전투 첫 턴", sim:"fleet", f:{multi:10}, t2:{multi:16}},
  {n:"[Opportunist] 나보다 늦게 행동", f:{multi:5}, t2:{multi:8}},
  {n:"[Fleeting] 회피 성공 다음 공격", f:{multi:8}, t2:{multi:14}},
  {n:"[Devastating] 치명타 피해", f:{critDmg:10}, t2:{critDmg:16}},
  {n:"[Fortunate] 치명타 확률", note:"최대 25", f:{crit:2}, t2:{crit:4}},
  {n:"[Sunder] 대상 DR 감소", f:{reduc:-3}, t2:{reduc:-5}},
  {n:"[Stalwart] 대상 체력 절반 이상", f:{reduc:5}, t2:{reduc:8}}
]},
{g:"버프 · 디버프", items:[
  {n:"취약 (Vulnerable)", note:"받는 피해 +20%", f:{multi:20}},
  {n:"골절 (Fractured)", note:"물리·마법 +35%", f:{multi:35}},
  {n:"헥스 (Hexed)", note:"해당 타수 2배", f:{finalMul:2}},
  {n:"약화 (Weakened)", note:"내가 걸린 경우", f:{multi:-20}},
  {n:"분열 (Sundered)", note:"저항 무효 → Affinity 1", f:{affSet:1}},
  {n:"저주 아귀 (Cursemaw)", note:"스택당 방어 −5%", f:{reducMul:0.95}, max:10, unit:"스택"},
  {n:"명상 반동", note:"포커스드 마인드 · 받는 피해 +15%", f:{multi:15}}
]},
{g:"종족", items:[
  {n:"Inferion (공격, 화상 보유)", f:{multi:20}},
  {n:"Boreas (공격)", note:"스택당 +20%", f:{multi:20}, max:7, unit:"스택"},
  {n:"Corvolus (마법·신성)", note:"패치노트 기재 부호 반전 버그", f:{multi:-10}},
  {n:"Inferion (대상 방어, 화상)", f:{reduc:17.65}},
  {n:"Boreas (대상 방어) 7스택", note:"실질 약 35% 감소", f:{reduc:53.85}},
  {n:"Amorus (대상 방어)", f:{multi:15}},
  {n:"Lentum (대상 방어)", f:{multi:20}},
  {n:"아이스블러드", note:"스택당 +20%, 최대 200%", f:{multi:20}, max:10, unit:"스택"}
]},
{g:"커럽션", items:[
  {n:"노치 소모", note:"소모 1스택당 +10%", f:{multi:10}, max:3, unit:"스택"},
  {n:"용기 (Courage)", note:"스택당 +1.75%", f:{multi:1.75}, max:40, unit:"스택"},
  {n:"쉐도우플레임", note:"화상·유령 불꽃 한정", f:{multi:30}},
  {n:"유죄 (Condemned)", note:"수치 미공개", f:{}}
]}
];

/* ══════════ 2. 슈퍼 클래스 ══════════
   스킬: b 기본 피해량 | h 타수 | c 코스트 | cd 쿨타임 | e 속성 | s [[스탯, 분모]] | x 비고
   분모 0 = 트렐로 미표기                                                        */
const CLASSES = {
"— 클래스 없음 —":{p:[],k:[]},
"공용":{p:[],k:[
  {n:"Strike", b:5, h:1, c:0, cd:0, e:"물리", s:[["STR",75]], x:"근력 25 마일스톤이면 6.5"},
  {n:"Magic Missile", b:5, h:1, c:0, cd:0, e:"마법", s:[["ARC",75]], x:"분모 추정치 — 확인 필요"}
]},
"몽크 (선·주먹)":{p:[
  {n:"Flaming Overdrive", note:"대상 화상 스택당 +1%, 최대 15%", f:{multi:15}},
  {n:"Flame Fists", note:"화상·영혼 불꽃 대상 +20%", f:{multi:20}},
  {n:"명상 후 다음 기술", sim:"medi", f:{multi:10}},
  {n:"마스터리 Blazing Barrage 강화", f:{multi:20}},
  {n:"마스터리 Flame Drop 강화", note:"화상 소모 시 최대 +25% 추가", f:{multi:25}}
],k:[
  {n:"Blazing Barrage", b:2, h:8, c:2, cd:5, e:"화염", s:[["STR",0]]},
  {n:"Flame Drop", b:15, h:1, c:3, cd:5, e:"화염", s:[["STR",60]]},
  {n:"Fire Sutra (버프 +15%)", b:0, h:1, c:1, cd:6, e:"화염", s:[], x:"공격 아님 — 피해량 +15% 버프"},
  {n:"Holy Mantra (버프)", b:0, h:1, c:2, cd:6, e:"신성", s:[]}
]},
"브롤러 (중립·주먹)":{p:[
  {n:"Crusher", note:"새 디버프마다 +7%, 3턴", f:{multi:7}, max:5, unit:"스택"},
  {n:"취약 대상 추가 피해", f:{multi:25}},
  {n:"마스터리 Oppression", note:"대상 디버프 개수당 +5%", f:{multi:5}, max:8, unit:"개"}
],k:[
  {n:"Crushing Strike", b:7, h:1, c:1, cd:6, e:"물리", s:[["STR",50]]},
  {n:"Party Table", b:1.5, h:6, c:2, cd:5, e:"물리", s:[["STR",50]]},
  {n:"Burst Combo", b:3, h:4, c:2, cd:6, e:"물리", s:[["STR",50],["STR",75]], x:"첫타 근력/50, 이후 근력/75"}
]},
"다크레이서 (악·주먹)":{p:[
  {n:"Darkborne", note:"모든 스킬 +15%", f:{multi:15}},
  {n:"다크 코어 소모", note:"코어당 +5% (소환수)", f:{multi:5}, max:6, unit:"개"},
  {n:"마스터리 전체 강화", f:{multi:10}}
],k:[
  {n:"Dark Smite", b:2, h:4, c:2, cd:4, e:"어둠", s:[["ARC",75]]},
  {n:"Darkcore Eruption", b:3, h:1, c:1, cd:4, e:"어둠", s:[["ARC",55]], x:"타수 = 소모한 코어 개수"},
  {n:"Call Darkbeast (소환)", b:0, h:1, c:1, cd:4, e:"어둠", s:[["ARC",4]]},
  {n:"└ Pounce", b:6, h:1, c:0, cd:0, e:"물리", s:[["ARC",105]]},
  {n:"└ Void Bite", b:11, h:1, c:2, cd:3, e:"저주", s:[["ARC",105]]},
  {n:"└ Shade Roar", b:9, h:1, c:3, cd:7, e:"어둠", s:[["ARC",109]]}
]},
"팔라딘 (선·검)":{p:[
  {n:"마스터리 Holy Crash 강화", f:{multi:25}}
],k:[
  {n:"Holy Crash", b:11, h:1, c:2, cd:6, e:"신성", s:[["STR",0],["END",0]], x:"계수 분모 미표기"},
  {n:"Pure Resonation", b:10, h:1, c:2, cd:8, e:"신성", s:[["STR",100],["END",100]]},
  {n:"Sacred Call (버프)", b:0, h:1, c:2, cd:7, e:"신성", s:[]}
]},
"블레이드 댄서 (중립·검)":{p:[
  {n:"Duel Blader", note:"양손 지참 +15%", f:{multi:15}},
  {n:"마스터리 Unending Flow", note:"연속 공격당 +5%, 최대 50%", f:{multi:5}, max:10, unit:"스택"}
],k:[
  {n:"Impaling Strike", b:14, h:1, c:1, cd:4, e:"물리", s:[["STR",80]]},
  {n:"Flowing Dance", b:1.75, h:12, c:3, cd:6, e:"물리", s:[["STR",75],["SPD",75]]},
  {n:"Simple Domain (반사)", b:0, h:1, c:2, cd:6, e:"물리", s:[["STR",60]], x:"반사 스킬 기본 피해량 × 1.6"}
]},
"버서커 (악·검)":{p:[
  {n:"Bloodlust 진입", note:"체력 50% 미만 +20%", f:{multi:20}},
  {n:"Bloodlust 스택", note:"스택당 +10%, 최대 8 (마스터리 15%)", f:{multi:10}, max:8, unit:"스택"},
  {n:"체력 30% 미만", note:"마스터리 시 60%", f:{multi:40}},
  {n:"Head Splitter 후속 버프", f:{multi:10}},
  {n:"마스터리 The Big Sword", note:"스트라이크 +40%", f:{multi:40}}
],k:[
  {n:"Head Splitter", b:16, h:1, c:2, cd:5, e:"물리", s:[["STR",50]]},
  {n:"Carnage", b:1, h:20, c:3, cd:7, e:"어둠", s:[["STR",100]], x:"추가 소모 에너지 1당 +20%, 최대 +100%"},
  {n:"Rage Empower (버프)", b:0, h:1, c:1, cd:5, e:"물리", s:[]}
]},
"세인트 (선·창)":{p:[
  {n:"마스터리 Light Burst 강화", f:{multi:30}},
  {n:"마스터리 One For All", note:"피해량 −30%", f:{multi:-30}}
],k:[
  {n:"Light Burst", b:9, h:1, c:2, cd:5, e:"신성", s:[["ARC",75]]},
  {n:"Cleansing Prayer (치유)", b:0, h:1, c:2, cd:5, e:"신성", s:[["STR",80],["ARC",80]]},
  {n:"Holy Grace (치유)", b:0, h:1, c:2, cd:5, e:"신성", s:[["STR",100],["ARC",100]]}
]},
"랜서 (중립·창)":{p:[
  {n:"Rallying Shout", note:"팀 피해량 +15%", f:{multi:15}},
  {n:"Empowered Piercer 충전", note:"최대 +38%", f:{multi:38}},
  {n:"막기 보정", note:"주 스탯 체력 아닐 때 최대 +10%", f:{multi:10}}
],k:[
  {n:"Discharge", b:10, h:1, c:3, cd:4, e:"마법", s:[["STR",80],["SPD",80]]},
  {n:"Empowered Piercer", b:15, h:1, c:2, cd:6, e:"물리", s:[["STR",80],["SPD",80]]},
  {n:"Rallying Shout (버프)", b:0, h:1, c:2, cd:7, e:"물리", s:[]}
]},
"임패일러 (악·창)":{p:[
  {n:"Bloody Berserker", note:"잃은 체력 1%당 +1%, 최대 100%", f:{multi:1}, max:100, unit:"%"},
  {n:"마스터리 Blood Eruption 강화", note:"주고받는 피해 +20%", f:{multi:20}}
],k:[
  {n:"Rending Barrage", b:5.6, h:3, c:2, cd:5, e:"물리", s:[["STR",75],["ARC",75]], x:"추가타 13.5 별도"},
  {n:"Bloody Burst", b:5, h:2, c:1, cd:4, e:"물리", s:[["STR",75],["ARC",75]]},
  {n:"Blood Eruption", b:15.6, h:1, c:3, cd:9, e:"마법", s:[["STR",0],["ARC",0]], x:"분모 미표기 · 강화 시 65/65"}
]},
"레인저 (선·단검)":{p:[
  {n:"Verdant Archer", note:"마스터리 시 버프 15%", f:{multi:15}}
],k:[
  {n:"Flourish", b:11, h:1, c:2, cd:6, e:"자연", s:[["ARC",60],["SPD",80]]},
  {n:"Perennial Canopy", b:4, h:1, c:2, cd:7, e:"자연", s:[["ARC",70],["SPD",100]]},
  {n:"Stinger", b:5, h:1, c:2, cd:4, e:"독", s:[["ARC",70],["SPD",100]], x:"광역 10 별도"},
  {n:"Enrichment (버프)", b:0, h:1, c:1, cd:5, e:"자연", s:[["ARC",0]]}
]},
"로그 (중립·단검)":{p:[
  {n:"Blader", note:"피해량 +20%", f:{multi:20}},
  {n:"마스터리 Vital Strike", note:"출혈 대상 +20%", f:{multi:20}}
],k:[
  {n:"Slash Barrage", b:16, h:1, c:2, cd:5, e:"물리", s:[["STR",80]]},
  {n:"Dagger Spread", b:10, h:1, c:2, cd:5, e:"물리", s:[["STR",65]]},
  {n:"Poison Trap", b:5, h:1, c:1, cd:7, e:"독", s:[["SPD",40],["LCK",30]]}
]},
"어쌔신 (악·단검)":{p:[
  {n:"은신 중 Stealth Strike", note:"피해량 2배", f:{finalMul:2}},
  {n:"마스터리 Shadow Master", note:"은신 중 +30%", f:{multi:30}},
  {n:"Shadow Form 다음 공격", note:"치명타 확률 +20", f:{crit:20}}
],k:[
  {n:"Stealth Strike", b:10, h:1, c:2, cd:6, e:"물리", s:[["STR",75]]},
  {n:"Poison Fan", b:3.5, h:4, c:2, cd:5, e:"독", s:[["STR",200],["ARC",80],["LCK",100]]},
  {n:"Shadow Form (버프)", b:0, h:1, c:1, cd:7, e:"어둠", s:[]}
]},
"라이온하트 (중립·도끼)":{p:[
  {n:"용기 스택", note:"스택당 +1.75%, 최대 40", f:{multi:1.75}, max:40, unit:"스택"}
],k:[
  {n:"Daybreak", b:12, h:1, c:2, cd:6, e:"화염", s:[["STR",75]]},
  {n:"Cauterisation (버프)", b:0, h:1, c:1, cd:5, e:"화염", s:[]},
  {n:"Benumb (버프)", b:0, h:1, c:2, cd:6, e:"화염", s:[]}
]},
"시타델 (선·망치)":{p:[
  {n:"마스터리 Grand Guard", note:"방어 버프 40%↑ 시 +10%", f:{multi:10}},
  {n:"Crucible 강화", note:"방어력 버프만큼 피해량 버프", f:{multi:40}}
],k:[
  {n:"Crucible", b:8, h:2, c:2, cd:4, e:"신성", s:[["STR",0]], x:"계수 분모 미표기"},
  {n:"Blinding Vow (버프)", b:0, h:1, c:2, cd:7, e:"신성", s:[]},
  {n:"Sanctified Protection (버프)", b:0, h:1, c:3, cd:8, e:"신성", s:[]}
]},
"아비터 (중립·망치)":{p:[
  {n:"Arbiter's Mantle", note:"스트라이크 기본 10 / 신비 150", f:{}}
],k:[
  {n:"Litigate", b:10, h:1, c:2, cd:4, e:"저주", s:[["ARC",90]]},
  {n:"Injunction", b:2, h:1, c:2, cd:6, e:"저주", s:[["ARC",185]], x:"강화 시 기본 5"},
  {n:"Pronouncement", b:5, h:1, c:5, cd:8, e:"저주", s:[["ARC",85]], x:"카르마 보유 시 기본 25"}
]},
"엘리멘탈리스트 (선·지팡이)":{p:[
  {n:"화염 디버프 대상", f:{multi:15}},
  {n:"마스터리 Element Mastery", note:"마법·화염·얼음·자연·신성·어둠 +15%", f:{multi:15}}
],k:[
  {n:"Blaze", b:10, h:1, c:1, cd:5, e:"화염", s:[["ARC",70]]},
  {n:"Lightning Crash", b:16, h:1, c:3, cd:7, e:"마법", s:[["ARC",65]], x:"계수 분모 = 65 − 2.5 × 추가 소모 에너지"},
  {n:"Gale Uplift", b:5, h:2, c:2, cd:12, e:"자연", s:[["ARC",75]]}
]},
"헥서 (중립·지팡이)":{p:[],k:[
  {n:"Dark Glare", b:11, h:1, c:2, cd:4, e:"어둠", s:[["ARC",75]]},
  {n:"Inverse Abyss", b:0, h:1, c:3, cd:6, e:"저주", s:[["ARC",65]]},
  {n:"Abyss Anchor (버프)", b:0, h:1, c:2, cd:11, e:"저주", s:[]}
]},
"네크로맨서 (악·지팡이)":{p:[
  {n:"소환수 피해량 버프", note:"5%씩, 최대 10%", f:{multi:10}},
  {n:"스켈레톤 재소환", note:"직전 사망 시 +30%", f:{multi:30}},
  {n:"마스터리 Final Goodbye", note:"팀원 사망 시 +10%", f:{multi:10}}
],k:[
  {n:"Darklight Drain", b:8, h:1, c:2, cd:5, e:"어둠", s:[["ARC",75]]},
  {n:"Call Skeleton (소환)", b:0, h:1, c:1, cd:8, e:"어둠", s:[["ARC",4]]},
  {n:"└ Smack", b:9, h:1, c:0, cd:0, e:"물리", s:[["ARC",50]]},
  {n:"└ Bone Spray", b:20, h:1, c:2, cd:4, e:"물리", s:[["ARC",50]]},
  {n:"Raise Dead", b:0, h:1, c:3, cd:16, e:"어둠", s:[]}
]}
};

const ELEM_DEFAULT = 1;

/* ══════════ 3. 렌더 ══════════ */
const rowsOf = [];   // {el, item, grp}

function ctlHTML(it, grp){
  let h = "";
  if (it.opts) h += '<select class="opt">' + it.opts.map((o,k)=>'<option value="'+k+'">'+o[0]+'</option>').join("") + '</select>';
  if (it.t2 || grp.tier) h += '<select class="tier"><option value="0">T1</option><option value="1">T2</option></select>';
  if (it.max) h += '<input type="number" class="stk" value="1" min="1" max="'+it.max+'" step="1" title="'+(it.unit||"개")+'">';
  else if (it.t2 || grp.tier) h += '<input type="number" class="stk" value="1" min="1" max="10" step="1" title="개수">';
  return h;
}

MODS.forEach(grp => {
  if (grp.tiles){
    const host = $("tiles_" + grp.key);
    grp.items.forEach(it => {
      const b = document.createElement("div");
      b.className = "tile"; b.setAttribute("role","button");
      b.setAttribute("tabindex","0"); b.setAttribute("aria-pressed","false");
      b.addEventListener("keydown", e => {
        if (e.key === "Enter" || e.key === " "){ e.preventDefault(); b.click(); }
      });
      b.innerHTML = '<span class="tn">' + it.n + '</span>' +
        (it.note ? '<span class="tnote">' + it.note + '</span>' : "") +
        '<span class="tctl" hidden>' + ctlHTML(it, grp) + '</span>' +
        '<span class="tv"></span>';
      b.addEventListener("click", e => {
        if (e.target.closest(".tctl")) return;
        const on = b.getAttribute("aria-pressed") === "true";
        if (!on && host.querySelectorAll('[aria-pressed="true"]').length >= grp.cap){
          $("cap_" + grp.key).textContent = grp.g + "는 최대 " + grp.cap + "개까지 선택할 수 있습니다.";
          return;
        }
        $("cap_" + grp.key).textContent = "";
        b.setAttribute("aria-pressed", on ? "false" : "true");
        b.querySelector(".tctl").hidden = on;
        calc();
      });
      host.appendChild(b);
      rowsOf.push({el:b, item:it, grp:grp, tile:true});
    });
  } else {
    const box = document.createElement("div");
    box.className = "mgroup";
    box.innerHTML = "<h3>" + grp.g + (grp.sub ? " <em>· " + grp.sub + "</em>" : "") + "</h3>";
    grp.items.forEach((it, ii) => {
      const id = "m_" + grp.g.replace(/\W/g,"") + "_" + ii;
      const row = document.createElement("div");
      row.className = "mrow off";
      row.innerHTML = '<input type="checkbox" id="'+id+'">' +
        '<label class="nm" for="'+id+'">' + it.n + (it.note ? ' <span class="en">'+it.note+'</span>' : "") + '</label>' +
        '<span class="ctl">' + ctlHTML(it, grp) + '</span><span class="eff"></span>';
      box.appendChild(row);
      rowsOf.push({el:row, item:it, grp:grp, tile:false});
    });
    $("mods").appendChild(box);
  }
});

/* 클래스 패시브는 선택된 클래스에 맞춰 동적으로 */
let clsRows = [];
function renderClassPassives(){
  const host = $("clsPassives");
  host.innerHTML = "";
  clsRows = [];
  const c = CLASSES[$("cls").value];
  if (!c || !c.p.length) return;
  const box = document.createElement("div");
  box.className = "mgroup";
  box.style.marginTop = "12px";
  box.innerHTML = "<h3>클래스 패시브 · 마스터리</h3>";
  c.p.forEach((it, ii) => {
    if (!it.f || !Object.keys(it.f).length) {
      const p = document.createElement("div");
      p.className = "mrow off";
      p.innerHTML = '<span></span><span style="color:var(--ink-faint);font-size:12px">' + it.n +
        (it.note ? ' — ' + it.note : "") + '</span><span></span><span class="eff">계산 대상 아님</span>';
      box.appendChild(p); return;
    }
    const id = "cp_" + ii;
    const row = document.createElement("div");
    row.className = "mrow off";
    row.innerHTML = '<input type="checkbox" id="'+id+'">' +
      '<label class="nm" for="'+id+'">' + it.n + (it.note ? ' <span class="en">'+it.note+'</span>' : "") + '</label>' +
      '<span class="ctl">' + ctlHTML(it, {}) + '</span><span class="eff"></span>';
    box.appendChild(row);
    clsRows.push({el:row, item:it, grp:{}, tile:false});
  });
  host.appendChild(box);
}

/* ── 계수 행 ── */
const scalers = $("scalers");
function addScaler(stat="STR", div=75){
  const row = document.createElement("div");
  row.className = "scalerow";
  row.innerHTML =
    '<label><span class="k">스탯</span><select class="sStat">' +
      Object.entries(STATS).map(([k,v])=>'<option value="'+k+'">'+v+' ('+k+')</option>').join("") +
    '</select></label>' +
    '<label><span class="k">계수 <span class="en">divisor</span></span><input type="number" class="sDiv" step="1"></label>' +
    '<button type="button" class="btn del">삭제</button>';
  row.querySelector(".sStat").value = stat;
  row.querySelector(".sDiv").value = div;
  row.querySelector(".del").addEventListener("click", () => { row.remove(); calc(); });
  scalers.appendChild(row);
}
$("addScale").addEventListener("click", () => { addScaler("ARC", 80); calc(); });

/* ══════════ 4. 보정 집계 ══════════ */
const FSUF = {multi:"%", critDmg:"%", reduc:"", flat:"", trueFlat:"", crit:""};
const EMPTY = () => ({multi:0, flat:0, reduc:0, reducMul:1, trueFlat:0, crit:0, critDmg:0, affSet:null, finalMul:1});

function readRow(r, ctx){
  const it = r.item;
  const cb = r.tile ? null : r.el.querySelector("input[type=checkbox]");
  let on = r.tile ? r.el.getAttribute("aria-pressed") === "true" : (cb && cb.checked);
  const optSel = r.el.querySelector(".opt"), tierSel = r.el.querySelector(".tier"), stk = r.el.querySelector(".stk");
  let optIdx = optSel ? +optSel.value : 0;
  let n = stk ? Math.max(1, parseInt(stk.value) || 1) : 1;

  // 시뮬레이션 컨텍스트가 있으면 턴 의존 항목을 덮어씀
  if (ctx && it.sim && on){
    if (it.sim === "fleet")    on = ctx.turn === 1;
    if (it.sim === "momentum") { n = Math.min(3, ctx.combo); on = ctx.combo > 0; }
    if (it.sim === "vain")     { optIdx = Math.min(2, ctx.turn - 1); on = ctx.turn <= 3; }
    if (it.sim === "coag")     n = Math.min(it.max, ctx.turn);
    if (it.sim === "heat")     { n = Math.min(it.max, Math.floor(ctx.turn / 5)); on = n > 0; }
    if (it.sim === "medi")     on = ctx.afterMeditate;
  }

  const f = it.opts ? it.opts[optIdx][1]
          : (tierSel && tierSel.value === "1" && it.t2) ? it.t2 : (it.f || {});
  const eff = Object.entries(f).map(([k,v]) =>
      k === "reducMul" ? "×" + Math.pow(v,n).toFixed(3)
    : k === "finalMul" ? "×" + v
    : k === "affSet"   ? "→" + v
    : (v*n > 0 ? "+" : "") + +(v*n).toFixed(2) + FSUF[k]).join(" ");
  return {on, f, n, eff, optIdx};
}

function collectMods(ctx){
  const acc = EMPTY(), lines = [];
  const all = rowsOf.concat(clsRows);
  all.forEach(r => {
    const {on, f, n, eff} = readRow(r, ctx);
    if (!ctx){
      const effEl = r.el.querySelector(r.tile ? ".tv" : ".eff");
      if (effEl) effEl.textContent = eff || (r.tile ? "" : "—");
      if (!r.tile) r.el.classList.toggle("off", !on);
    }
    if (!on) return;
    for (const [k,v] of Object.entries(f)){
      if (k === "reducMul") acc.reducMul *= Math.pow(v,n);
      else if (k === "finalMul") acc.finalMul *= v;
      else if (k === "affSet") acc.affSet = v;
      else acc[k] += v*n;
    }
    if (eff) lines.push([r.item.n + (n > 1 ? " ×" + n : ""), eff]);
  });
  if (!ctx){
    $("bd").innerHTML = lines.length
      ? lines.map(([a,b]) => "<li><span>"+a+"</span><b>"+b+"</b></li>").join("")
      : '<li class="empty">선택한 항목 없음 — 직접 입력값만 반영됩니다.</li>';
    ["gear","art"].forEach(k => {
      const grp = MODS.find(g => g.key === k);
      $(k === "gear" ? "gearCnt" : "artCnt").textContent =
        $("tiles_"+k).querySelectorAll('[aria-pressed="true"]').length + "/" + grp.cap;
    });
  }
  return acc;
}

/* ══════════ 4-b. 파티 ══════════ */
const PARTY_BUFFS = [
  ["없음", {}, ""],
  ["랜서 [Rallying Shout]", {multi:15}, "팀 피해량 +15% · 방어 +10% · 속도 +25%"],
  ["시타델 [Blinding Vow]", {multi:10}, "방어 버프 10%, 경감량만큼 피해 버프"],
  ["임패일러 [Blood Eruption 강화]", {multi:20}, "3턴 간 주고받는 피해 +20%"],
  ["취약 부여", {multi:20}, "대상이 받는 피해 +20%"],
  ["골절 부여", {multi:35}, "물리·마법 피해 +35%"],
  ["헥스 부여", {finalMul:2}, "해당 타수 피해 2배"],
  ["분열 부여", {affSet:1}, "대상 저항 전부 무효"],
  ["아비터 [Affidavit]", {}, "카르마 적재 — Pronouncement 기본 25로"],
  ["세인트·팔라딘 (힐·탱)", {}, "피해 기여 없음"]
];
const partyEl = $("party");
for (let i = 0; i < 3; i++){
  const row = document.createElement("div");
  row.className = "mrow";
  row.style.gridTemplateColumns = "58px minmax(0,1fr) 96px auto";
  row.innerHTML = '<span style="font-size:11.5px;color:var(--ink-faint)">파티원 ' + (i+1) + '</span>' +
    '<select class="pbuff">' + PARTY_BUFFS.map((b,k)=>'<option value="'+k+'">'+b[0]+'</option>').join("") + '</select>' +
    '<input type="number" class="pdmg" value="0" min="0" step="5" title="턴당 기여 피해량">' +
    '<span class="eff" style="font-size:10.5px"></span>';
  partyEl.appendChild(row);
}
function partyAcc(){
  const acc = EMPTY(); let allyDmg = 0; const lines = [];
  partyEl.querySelectorAll(".mrow").forEach(r => {
    const b = PARTY_BUFFS[+r.querySelector(".pbuff").value];
    const d = parseFloat(r.querySelector(".pdmg").value) || 0;
    allyDmg += d;
    r.querySelector(".eff").textContent = b[2] || "";
    for (const [k,v] of Object.entries(b[1])){
      if (k === "finalMul") acc.finalMul *= v;
      else if (k === "affSet") acc.affSet = v;
      else acc[k] += v;
    }
    if (Object.keys(b[1]).length) lines.push([b[0], ""]);
  });
  return {acc, allyDmg, lines};
}
function mergeAcc(a, b){
  const o = EMPTY();
  for (const k of Object.keys(o)){
    if (k === "reducMul" || k === "finalMul") o[k] = a[k] * b[k];
    else if (k === "affSet") o[k] = b.affSet !== null ? b.affSet : a.affSet;
    else o[k] = a[k] + b[k];
  }
  return o;
}

/* ══════════ 4-c. 도트 ══════════ */
function dotPerTurn(){
  const hp = num("tgtHP"), mul = parseFloat($("tgtType").value);
  const burn = num("dotBurn") * 0.007 * hp;
  const bleed = (+$("dotBleed").value) * 0.03 * hp;
  const poison = num("dotPoison") * 1;
  return (burn + bleed + poison) * mul;
}

/* ══════════ 5. 계산 ══════════ */
const num = id => parseFloat($(id).value) || 0;
const fmt = n => (Math.abs(n) >= 100 ? n.toFixed(1) : n.toFixed(2));

function scaleMul(){
  let scale = 0, parts = [];
  scalers.querySelectorAll(".scalerow").forEach(r => {
    const s = r.querySelector(".sStat").value;
    const d = parseFloat(r.querySelector(".sDiv").value) || 0;
    if (d > 0){ scale += num(s)/d; parts.push(STATS[s] + "/" + d); }
  });
  return {mul: 1 + scale, parts};
}

function critParts(M){
  const c = Math.max(0, num("LCK") * parseFloat($("lckMode").value) + num("critAdd") + M.crit) / 100;
  const n = Math.floor(c), f = c - n;
  const bonus = (num("LCK") >= 25 ? 1.10 : 1) + M.critDmg / 100;
  const lo = n === 0 ? 1 : (1 + n) * bonus;
  const hi = (2 + n) * bonus;
  return {c, f, n, lo, hi, expected: lo*(1-f) + hi*f, bonus};
}

// 하나의 타격을 파이프라인에 통과시킴
function resolve(M, over){
  const base = over && over.base !== undefined ? over.base : num("base");
  const sc = over && over.scale !== undefined ? over.scale : scaleMul().mul;
  const scaled = base * sc;
  const multi = 1 + (num("multi") + M.multi) / 100;
  const aff = M.affSet !== null ? M.affSet : num("aff");
  const beforeDR = (scaled + num("flat") + M.flat - num("dflat")) * multi * aff * M.finalMul;
  const R = (num("reduc") + M.reduc) * M.reducMul;
  const drMult = R >= 0 ? 100/(100+R) : Math.min(2, 2 - 100/(100+Math.abs(R)));
  const afterDR = beforeDR * drMult;
  const trueDmg = (num("trueFlat") + M.trueFlat) * num("truedr") * (1 + num("trueMulti")/100);
  return {scaled, beforeDR, R, drMult, afterDR, trueDmg, final: afterDR + trueDmg};
}

/* ══════════ 6. 시뮬레이션 ══════════ */
const simRows = $("simrows");
function actionOptions(){
  const c = CLASSES[$("cls").value] || {k:[]};
  const uni = CLASSES["공용"].k;
  const list = [["명상","명상 (에너지 +2)"],["방어","방어"],["대기","대기"]];
  uni.concat($("cls").value === "공용" ? [] : c.k).forEach(s => list.push(["s:"+s.n, s.n + "  ("+s.c+"NRG · CD"+s.cd+")"]));
  return list;
}
function addTurn(pick){
  const row = document.createElement("div");
  row.className = "simrow";
  row.innerHTML = '<span class="tn"></span>' +
    '<select class="act">' + actionOptions().map(([v,l]) => '<option value="'+v+'">'+l+'</option>').join("") + '</select>' +
    '<span class="st"></span><span class="dmg">—</span>';
  if (pick) row.querySelector(".act").value = pick;
  simRows.appendChild(row);
}
$("addTurn").addEventListener("click", () => { addTurn(); calc(); });
$("clearTurns").addEventListener("click", () => { simRows.innerHTML = ""; calc(); });

function refreshActions(){
  const opts = actionOptions();
  simRows.querySelectorAll(".act").forEach(sel => {
    const cur = sel.value;
    sel.innerHTML = opts.map(([v,l]) => '<option value="'+v+'">'+l+'</option>').join("");
    sel.value = opts.some(o => o[0] === cur) ? cur : "대기";
  });
}

function skillByName(n){
  for (const c of Object.values(CLASSES)){ const f = c.k.find(s => s.n === n); if (f) return f; }
  return null;
}

function runSim(){
  const rows = [...simRows.querySelectorAll(".simrow")];
  if (!rows.length){ $("simTotal").textContent = "—"; return null; }
  const perTurn = num("nrgPerTurn");
  const P = partyAcc(), dot = dotPerTurn(), hp0 = num("tgtHP");
  let nrg = 1, combo = 0, total = 0, cds = {}, afterMeditate = false, last = null, hp = hp0, killTurn = 0;

  rows.forEach((row, i) => {
    const turn = i + 1;
    nrg += perTurn;
    for (const k in cds) if (cds[k] > 0) cds[k]--;
    const act = row.querySelector(".act").value;
    row.querySelector(".tn").textContent = "T" + turn;
    let dmg = 0, st = "", bad = false;

    if (act === "명상"){ nrg += 2; combo = 0; st = "명상 · NRG " + nrg; afterMeditate = true; }
    else if (act === "방어" || act === "대기"){ combo = 0; st = act + " · NRG " + nrg; afterMeditate = false; }
    else {
      const sk = skillByName(act.slice(2));
      if (!sk){ st = "?"; }
      else if (nrg < sk.c){ bad = true; st = "⚠ 에너지 부족 (" + nrg + "/" + sk.c + ")"; combo = 0; afterMeditate = false; }
      else if (cds[sk.n] > 0){ bad = true; st = "⚠ 쿨타임 " + cds[sk.n] + "턴"; combo = 0; afterMeditate = false; }
      else {
        nrg -= sk.c; cds[sk.n] = sk.cd; combo++;
        const M = mergeAcc(collectMods({turn, combo, afterMeditate}), P.acc);
        const sc = sk.s.length ? 1 + sk.s.reduce((a,[st2,d]) => a + (d > 0 ? num(st2)/d : 0), 0) : scaleMul().mul;
        const r = resolve(M, {base: sk.b, scale: sc});
        const k = critParts(M);
        dmg = (r.afterDR * k.expected + r.trueDmg) * sk.h;
        st = "NRG " + nrg + " · " + sk.h + "타" + (combo > 1 ? " · 연속 " + combo : "");
        last = {turn, sk, M, r, k, dmg};
        afterMeditate = false;
      }
    }
    const extra = dot + P.allyDmg;
    const turnTotal = dmg + extra;
    if (extra > 0) st += (st ? " · " : "") + "도트·파티 +" + fmt(extra);
    hp -= turnTotal;
    if (hp <= 0 && !killTurn){ killTurn = turn; st += " · 처치"; }
    row.classList.toggle("bad", bad);
    row.querySelector(".st").textContent = st;
    row.querySelector(".dmg").textContent = turnTotal ? fmt(turnTotal) : "—";
    total += turnTotal;
  });
  $("simTotal").textContent = fmt(total) +
    (killTurn ? "   (T" + killTurn + " 처치)" : "   (남은 HP " + fmt(Math.max(0, hp)) + ")");
  SIM = {total, killTurn, left: Math.max(0, hp), seq: rows.map((row,i) => ({
    t: "T" + (i+1),
    label: row.querySelector(".act").selectedOptions[0].textContent.split("  (")[0],
    dmg: row.querySelector(".dmg").textContent,
    bad: row.classList.contains("bad")
  }))};
  return last;
}
let SIM = null;

/* ══════════ 7. 메인 ══════════ */
function calc(){
  const M = mergeAcc(collectMods(null), partyAcc().acc);
  const k = critParts(M);
  const r = resolve(M);
  const hits = Math.max(1, Math.round(num("hits")));
  const parts = scaleMul().parts;

  $("s1").textContent = fmt(r.scaled);
  $("s2").textContent = fmt(r.beforeDR);
  $("s3").textContent = "×" + r.drMult.toFixed(3);
  const Rs = (+r.R.toFixed(2)).toString();
  $("s3f").textContent = r.R >= 0
    ? "100 / (100 + " + Rs + ") — " + ((1-r.drMult)*100).toFixed(1) + "% 감소"
    : "2 − 100 / (100 + " + Rs.slice(1) + ") — " + ((r.drMult-1)*100).toFixed(1) + "% 증폭";
  $("s3li").className = r.R >= 0 ? "dr" : "amp";
  $("s4").textContent = fmt(r.afterDR);
  $("s5").textContent = "+" + fmt(r.trueDmg);
  $("s6").textContent = fmt(r.final);

  $("normal").textContent = fmt(r.final * hits);
  $("crit").textContent = fmt((r.afterDR * k.hi + r.trueDmg) * hits);
  $("critx").textContent = "×" + k.hi.toFixed(2);
  const expPerHit = r.afterDR * k.expected + r.trueDmg;

  const tier = ["크리티컬","슈퍼 크리티컬","울트라 크리티컬","메가 크리티컬","최상위"];
  const cc = k.c * 100;
  $("critNote").textContent = "치명타 확률 " + cc.toFixed(1) + "% — " +
    (k.c >= 1
      ? "확정 " + tier[Math.min(k.n-1,4)] + " (×" + ((1+k.n)*k.bonus).toFixed(2) + "), " +
        (k.f*100).toFixed(0) + "% 확률로 " + tier[Math.min(k.n,4)] + " (×" + k.hi.toFixed(2) + ")"
      : cc.toFixed(0) + "% 확률로 크리티컬 (×" + k.hi.toFixed(2) + ")") +
    (num("LCK") >= 25 ? " · 행운 25 마일스톤 +10% 반영" : "");

  runSim();
  renderCard(M, r, k, hits, expPerHit);
  tabDots();
}

/* ══════════ 7-b. 빌드 카드 ══════════ */
function pressedIn(key){
  const grp = MODS.find(g => g.key === key);
  return rowsOf.filter(x => x.grp === grp && x.el.getAttribute("aria-pressed") === "true");
}
function renderCard(M, r, k, hits, expPerHit){
  const cls = $("cls").value, si = $("skill").value;
  const sk = si !== "" ? CLASSES[cls].k[+si] : null;
  $("cardTitle").textContent = (cls === "— 클래스 없음 —" ? "직접 입력 빌드" : cls) + (sk ? " · " + sk.n : "");
  const parts = scaleMul().parts;
  $("cardSub").textContent =
    (sk ? sk.e + " · " + sk.c + "NRG · CD" + sk.cd + " · " : "") +
    "기본 " + num("base") + " × " + hits + "타" +
    (parts.length ? " · " + parts.join(" + ") : " · 계수 없음") +
    " · Multi +" + (num("multi") + M.multi).toFixed(0) + "%";

  $("cardNums").innerHTML =
    '<div><div class="l">타당 기대</div><div class="v">' + fmt(expPerHit) + '</div></div>' +
    '<div><div class="l">전체 타수</div><div class="v gold">' + fmt(expPerHit * hits) + '</div></div>' +
    '<div><div class="l">치명타</div><div class="v">' + (k.c*100).toFixed(0) + '<span style="font-size:13px">%</span> ×' + k.hi.toFixed(1) + '</div></div>' +
    (SIM ? '<div><div class="l">' + (SIM.killTurn ? "T" + SIM.killTurn + " 처치" : "시퀀스 총합") +
      '</div><div class="v">' + fmt(SIM.total) + '</div></div>' : "");

  const maxStat = Math.max(150, ...Object.keys(STATS).map(s => num(s)));
  $("cardStats").innerHTML = Object.entries(STATS).map(([kk,label]) => {
    const v = num(kk), ms = v >= 110 ? "110" : v >= 60 ? "60" : v >= 25 ? "25" : "";
    return '<div class="statbar"><span>' + label + '</span>' +
      '<span class="track"><span class="fill" style="width:' + Math.min(100, v/maxStat*100).toFixed(1) + '%"></span></span>' +
      '<span class="n">' + v + (ms ? ' <em>' + ms + '</em>' : "") + '</span></div>';
  }).join("");

  const slotHTML = (list, cap) => {
    const cells = list.map(x => '<div class="slot"><b>' + x.item.n + '</b><i>' +
      (x.el.querySelector(".tv").textContent || "—") + '</i></div>');
    while (cells.length < cap) cells.push('<div class="slot empty">빈 칸</div>');
    return cells.join("");
  };
  const g = pressedIn("gear"), a = pressedIn("art");
  $("cardGearCnt").textContent = g.length + "/4";
  $("cardGear").innerHTML = slotHTML(g, 4);
  $("cardArt").innerHTML = slotHTML(a, 2);

  const chips = [];
  rowsOf.concat(clsRows).forEach(x => {
    if (x.tile) return;
    const cb = x.el.querySelector("input[type=checkbox]");
    if (!cb || !cb.checked) return;
    const stk = x.el.querySelector(".stk"), tier = x.el.querySelector(".tier");
    chips.push("<b>" + x.item.n + "</b>" + (tier ? " " + tier.selectedOptions[0].textContent : "") +
      (stk && +stk.value > 1 ? " ×" + stk.value : ""));
  });
  partyEl.querySelectorAll(".mrow").forEach((row, i) => {
    const b = PARTY_BUFFS[+row.querySelector(".pbuff").value];
    if (b[0] !== "없음") chips.push("파티 " + (i+1) + " · <b>" + b[0] + "</b>");
  });
  $("cardBuffs").innerHTML = chips.length
    ? chips.map(c => "<li>" + c + "</li>").join("")
    : '<li class="none">선택한 특성·버프 없음</li>';

  $("cardSeq").innerHTML = SIM && SIM.seq.length
    ? SIM.seq.map(s => '<li class="' + (s.bad ? "miss" : "") + '"><span class="t">' + s.t +
        '</span><span>' + s.label + '</span><span class="d">' + s.dmg + '</span></li>').join("")
    : '<li><span class="t">—</span><span style="color:var(--ink-faint)">행동 시뮬레이션이 비어 있습니다</span><span></span></li>';
}

/* ── 탭 ── */
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", String(b === btn)));
    document.querySelectorAll(".tabpane").forEach(p => { p.hidden = p.dataset.p !== btn.dataset.t; });
  });
});
function tabDots(){
  const dot = (t, unused) => {
    const d = document.querySelector('.tab[data-t="'+t+'"] .dot');
    if (d) d.hidden = !unused;
  };
  const noParty = [...partyEl.querySelectorAll(".pbuff")].every(s => s.value === "0");
  dot("battle", noParty && !num("dotBurn") && !num("dotPoison") && $("dotBleed").value === "0");
  dot("sim", simRows.querySelectorAll(".simrow").length === 0);
  dot("solve", !$("solveOut").innerHTML.trim());
}

$("copyBuild").addEventListener("click", () => {
  const txt = [
    "【" + $("cardTitle").textContent + "】",
    $("cardSub").textContent, "",
    "스탯: " + Object.entries(STATS).map(([k,v]) => v + " " + num(k)).join(" / "),
    "기어: " + (pressedIn("gear").map(x => x.item.n).join(", ") || "없음"),
    "유물·인챈트: " + (pressedIn("art").map(x => x.item.n).join(", ") || "없음"),
    "버프: " + ([...$("cardBuffs").querySelectorAll("li")].map(l => l.textContent).join(", ")),
    "", "행동: " + (SIM ? SIM.seq.map(s => s.t + " " + s.label + " (" + s.dmg + ")").join(" → ") : "—"),
    "", "타당 기대 " + $("cardNums").textContent
  ].join("\n");
  navigator.clipboard.writeText(txt).then(
    () => { $("copyBuild").textContent = "복사됨"; setTimeout(() => $("copyBuild").textContent = "텍스트로 복사", 1400); },
    () => { $("copyBuild").textContent = "복사 실패"; }
  );
});

/* ══════════ 8. 빌드 역산 ══════════ */
const LCKM = () => parseFloat($("lckMode").value);

function statScale(stats){
  let s = 0;
  scalers.querySelectorAll(".scalerow").forEach(r => {
    const st = r.querySelector(".sStat").value;
    const d = parseFloat(r.querySelector(".sDiv").value) || 0;
    if (d > 0) s += stats[st] / d;
  });
  return 1 + s;
}
function accOf(list){
  const a = EMPTY();
  list.forEach(c => {
    for (const [k,v] of Object.entries(c.f)){
      if (k === "reducMul") a.reducMul *= Math.pow(v, c.n);
      else if (k === "finalMul") a.finalMul *= v;
      else if (k === "affSet") a.affSet = v;
      else a[k] += v * c.n;
    }
  });
  return a;
}
function dmgWith(acc, stats){
  const hits = Math.max(1, Math.round(num("hits")));
  const scaled = num("base") * statScale(stats);
  const multi = 1 + (num("multi") + acc.multi) / 100;
  const aff = acc.affSet !== null ? acc.affSet : num("aff");
  const beforeDR = (scaled + num("flat") + acc.flat - num("dflat")) * multi * aff * acc.finalMul;
  const R = (num("reduc") + acc.reduc) * acc.reducMul;
  const dr = R >= 0 ? 100/(100+R) : Math.min(2, 2 - 100/(100+Math.abs(R)));
  const after = beforeDR * dr;
  const t = (num("trueFlat") + acc.trueFlat) * num("truedr") * (1 + num("trueMulti")/100);
  const c = Math.max(0, stats.LCK * LCKM() + num("critAdd") + acc.crit) / 100;
  const n = Math.floor(c), f = c - n;
  const bonus = (stats.LCK >= 25 ? 1.10 : 1) + acc.critDmg / 100;
  const lo = n === 0 ? 1 : (1+n) * bonus, hi = (2+n) * bonus;
  return (after * (lo*(1-f) + hi*f) + t) * hits;
}

// ponytail: 슬롯은 단일 특성으로 전부 채운다고 가정 (혼합 조합 탐색은 생략).
function candidates(){
  const slots = Math.max(0, Math.round(num("traitSlots")));
  const useCP = $("useCP").checked, useCond = $("useCond").checked;
  const out = [];
  MODS.forEach(grp => {
    grp.items.forEach((it, ii) => {
      const kind = grp.key === "gear" ? "gear" : grp.key === "art" ? "art"
                 : grp.tier ? "trait" : "cond";
      if (kind === "cond" && !useCond) return;
      if (kind === "trait"){
        if (!it.t2 || slots < 1) return;
        const f = {};
        for (const [k,v] of Object.entries(it.t2)) f[k] = (k === "crit") ? Math.min(v*slots, 25) : v*slots;
        out.push({kind, gid:"t"+ii, label:it.n + " T2 × " + slots, f, n:1, item:it, copies:slots});
        return;
      }
      const push = (f, label, optIdx) => {
        if (!f || !Object.keys(f).length) return;
        if (!useCP && /CP /.test(label)) return;
        out.push({kind, gid:grp.g+ii, label:it.n + (optIdx !== undefined ? " · " + it.opts[optIdx][0] : ""),
                  f, n: it.max || 1, item:it, optIdx});
      };
      if (it.opts) it.opts.forEach((o,k) => push(o[1], o[0], k));
      else push(it.f, "");
    });
  });
  CLASSES[$("cls").value].p.forEach((it, ii) => {
    if (!$("useCond").checked) return;
    if (!it.f || !Object.keys(it.f).length) return;
    out.push({kind:"cond", gid:"cp"+ii, label:"[클래스] " + it.n, f:it.f, n:it.max || 1, item:it, cls:ii});
  });
  return out;
}

function allocStats(acc, budget){
  const s = {STR:7, ARC:7, END:7, SPD:7, LCK:7};
  let left = Math.max(0, Math.round(budget));
  const step = left > 60 ? 5 : 1;
  while (left > 0){
    const inc = Math.min(step, left);
    let best = null, bestD = -Infinity;
    for (const k of Object.keys(s)){
      s[k] += inc;
      const d = dmgWith(acc, s);
      if (d > bestD){ bestD = d; best = k; }
      s[k] -= inc;
    }
    s[best] += inc; left -= inc;
  }
  return s;
}

function greedyPick(stats, pool, caps){
  const chosen = [], used = {gear:0, art:0, trait:0, cond:0}, seen = new Set();
  let cur = dmgWith(accOf(chosen), stats);
  for(;;){
    let best = null, bestD = cur;
    pool.forEach(c => {
      if (seen.has(c.gid)) return;
      if (used[c.kind] >= caps[c.kind]) return;
      const d = dmgWith(accOf(chosen.concat([c])), stats);
      if (d > bestD + 1e-9){ bestD = d; best = c; }
    });
    if (!best) break;
    chosen.push(best); seen.add(best.gid); used[best.kind]++; cur = bestD;
  }
  return chosen;
}

function solve(){
  const goal = num("goal"), budget = num("budget"), slots = Math.round(num("traitSlots"));
  const pool = candidates();
  const caps = {gear:4, art:2, trait: slots > 0 ? 1 : 0, cond: 99};
  let stats = allocStats(EMPTY(), budget), chosen = [];
  for (let pass = 0; pass < 3; pass++){
    chosen = greedyPick(stats, pool, caps);
    stats = allocStats(accOf(chosen), budget);
  }
  let dmg = dmgWith(accOf(chosen), stats);

  // 목표를 넘겼다면 필요 없는 항목부터 덜어냄
  const trimmed = [];
  if (dmg >= goal){
    let cur = chosen.slice();
    let changed = true;
    while (changed){
      changed = false;
      for (let i = 0; i < cur.length; i++){
        const test = cur.slice(); const [rm] = test.splice(i,1);
        if (dmgWith(accOf(test), stats) >= goal){ trimmed.push(rm); cur = test; changed = true; break; }
      }
    }
    chosen = cur; dmg = dmgWith(accOf(chosen), stats);
  }

  // 기여도 정렬
  const full = accOf(chosen), baseline = dmgWith(EMPTY(), stats);
  const contrib = chosen.map(c => {
    const without = chosen.filter(x => x !== c);
    return {c, d: dmg - dmgWith(accOf(without), stats)};
  }).sort((a,b) => b.d - a.d);

  const nextUp = pool.filter(c => !chosen.some(x => x.gid === c.gid))
    .map(c => ({c, d: dmgWith(accOf(chosen.concat([c])), stats) - dmg}))
    .sort((a,b) => b.d - a.d).slice(0,3).filter(x => x.d > 0.01);

  render(chosen, contrib, nextUp, stats, dmg, goal, baseline, trimmed, slots);
  window.__build = {chosen, stats};
}

function render(chosen, contrib, nextUp, stats, dmg, goal, baseline, trimmed, slots){
  const ok = dmg >= goal;
  const groupOf = k => ({gear:"기어", art:"유물·인챈트", trait:"특성", cond:"상황·버프"})[k];
  const byKind = {};
  chosen.forEach(c => (byKind[c.kind] = byKind[c.kind] || []).push(c));

  // 행동 로직
  const plan = [];
  const skName = $("skill").value !== "" ? CLASSES[$("cls").value].k[+$("skill").value] : null;
  const has = re => chosen.some(c => re.test(c.label));
  if (has(/CP /)) plan.push("커럽션 폼에 진입해 커럽트 파워를 먼저 쌓는다 — 소모형 기어는 턴당 한 번만 발동한다.");
  if (has(/Fleet/)) plan.push("1턴차에 메인 스킬을 넣는다 (Fleet은 전투 첫 턴에만 붙는다).");
  if (has(/Momentum/)) plan.push("공격을 끊지 않는다 — 연속 공격 3턴째에 Momentum이 최대가 된다.");
  if (has(/포커스드 마인드|명상/)) plan.push("메인 스킬 직전 턴에 명상한다 (받는 피해 +15%는 감수).");
  if (has(/과열|야툴/)) plan.push("과열 스택은 5턴마다 1개 — 장기전에서만 값을 한다. 회복을 받으면 1스택 깎인다.");
  if (has(/취약|골절|헥스|분열/)) plan.push("디버프를 먼저 깔고 그다음 턴에 메인 스킬을 넣는다.");
  if (skName) plan.push("메인 스킬 " + skName.n + " — " + skName.c + " NRG, 쿨타임 " + skName.cd +
    "턴. 쿨 도는 동안은 0코스트 스킬이나 명상으로 에너지를 모은다.");
  if (!plan.length) plan.push("조건부 요소가 없어 순수 스탯·기어 빌드다. 순서에 관계없이 같은 값이 나온다.");

  const li = (a, b) => "<li><span>" + a + "</span><b>" + b + "</b></li>";
  $("solveOut").innerHTML =
    '<div class="breakdown" style="margin-top:14px;border-color:' + (ok ? "var(--gold)" : "var(--warn)") + '">' +
      '<h4>' + (ok ? "목표 달성" : "목표 미달") + '</h4>' +
      '<div style="display:flex;gap:18px;align-items:baseline;margin-bottom:10px">' +
        '<span style="font-family:JetBrains Mono,monospace;font-size:28px;font-weight:700;color:' +
          (ok ? "var(--good)" : "var(--warn)") + '">' + fmt(dmg) + '</span>' +
        '<span style="font-size:11.5px;color:var(--ink-faint)">목표 ' + fmt(goal) +
          ' · 맨몸 ' + fmt(baseline) + ' → ×' + (dmg/Math.max(baseline,.001)).toFixed(2) + '</span></div>' +

      '<h4>스탯 배분</h4><ul>' +
        Object.entries(stats).map(([k,v]) => li(STATS[k], v + (v >= 110 ? "  (110 마일스톤)" : v >= 60 ? "  (60)" : v >= 25 ? "  (25)" : ""))).join("") +
      '</ul>' +

      Object.keys(byKind).map(k =>
        '<h4 style="margin-top:12px">' + groupOf(k) + ' (' + byKind[k].length + ')</h4><ul>' +
        byKind[k].map(c => {
          const d = contrib.find(x => x.c === c);
          return li(c.label, "+" + fmt(d ? d.d : 0));
        }).join("") + '</ul>').join("") +

      (trimmed.length ? '<h4 style="margin-top:12px">없어도 목표를 넘김</h4><ul>' +
        trimmed.map(c => li(c.label, "생략")).join("") + '</ul>' : "") +

      (!ok && nextUp.length ? '<h4 style="margin-top:12px">다음으로 효율 높은 수단</h4><ul>' +
        nextUp.map(x => li(x.c.label, "+" + fmt(x.d))).join("") + '</ul>' : "") +

      '<h4 style="margin-top:12px">행동 로직</h4><ol style="margin:0;padding-left:18px;font-size:11.5px;color:var(--ink-soft);line-height:1.7">' +
        plan.map(p => "<li>" + p + "</li>").join("") + '</ol>' +

      '<div style="margin-top:12px"><button type="button" class="btn pri" id="applyBuild">이 빌드를 계산기에 적용</button></div>' +
    '</div>';

  $("applyBuild").addEventListener("click", () => applyBuild(chosen, stats, slots));
}

function applyBuild(chosen, stats, slots){
  Object.entries(stats).forEach(([k,v]) => $(k).value = v);
  rowsOf.concat(clsRows).forEach(r => {
    if (r.tile){ r.el.setAttribute("aria-pressed","false"); r.el.querySelector(".tctl").hidden = true; }
    else { const cb = r.el.querySelector("input[type=checkbox]"); if (cb) cb.checked = false; }
  });
  chosen.forEach(c => {
    const r = rowsOf.concat(clsRows).find(x => x.item === c.item);
    if (!r) return;
    if (r.tile){ r.el.setAttribute("aria-pressed","true"); r.el.querySelector(".tctl").hidden = false; }
    else { const cb = r.el.querySelector("input[type=checkbox]"); if (cb) cb.checked = true; }
    const opt = r.el.querySelector(".opt"), tier = r.el.querySelector(".tier"), stk = r.el.querySelector(".stk");
    if (opt && c.optIdx !== undefined) opt.value = c.optIdx;
    if (tier) tier.value = "1";
    if (stk) stk.value = c.copies || c.n || 1;
  });
  calc();
  window.scrollTo({top:0, behavior:"smooth"});
}
$("solve").addEventListener("click", solve);

/* ── 클래스/스킬 선택 ── */
$("cls").innerHTML = Object.keys(CLASSES).map(n => '<option value="'+n+'">'+n+'</option>').join("");
function fillSkills(){
  const c = CLASSES[$("cls").value];
  $("skill").innerHTML = '<option value="">— 직접 입력 —</option>' +
    c.k.map((s,i) => '<option value="'+i+'">'+s.n+'</option>').join("");
}
$("cls").addEventListener("change", () => { fillSkills(); renderClassPassives(); refreshActions(); calc(); });
$("skill").addEventListener("change", () => {
  const c = CLASSES[$("cls").value], i = $("skill").value;
  if (i === ""){ $("skillInfo").textContent = "베이스 클래스는 상위 슈퍼 클래스의 스킬을 그대로 따릅니다."; return; }
  const s = c.k[+i];
  $("base").value = s.b; $("hits").value = s.h;
  scalers.innerHTML = "";
  if (s.s.length) s.s.forEach(([st,d]) => addScaler(st, d)); else addScaler("STR", 0);
  $("skillInfo").textContent = s.n + " — " + s.c + " NRG · 쿨타임 " + s.cd + "턴 · " + s.e + " 속성" +
    (s.s.length ? " · 계수 " + s.s.map(([st,d]) => STATS[st] + "/" + (d || "?")).join(" + ") : "") +
    (s.x ? "  |  " + s.x : "");
  calc();
});

$("elem").addEventListener("change", e => { if (e.target.value !== "0"){ $("aff").value = e.target.value; calc(); } });
document.addEventListener("input", calc);
document.addEventListener("change", calc);

$("drtable").innerHTML = [
  [0,"기준"],[25,""],[50,""],[100,"절반 감소"],[150,""],[200,""],[300,"75% 감소"],
  [566.67,"위키드 크라운"],[-50,"증폭"],[-100,"증폭"],[-1000,"상한 2배"]
].map(([r,note]) => {
  const m = r >= 0 ? 100/(100+r) : Math.min(2, 2 - 100/(100+Math.abs(r)));
  const pct = r >= 0 ? (1-m)*100 : (m-1)*100;
  return "<tr><td class='num'>"+r+"</td><td class='num'>×"+m.toFixed(3)+"</td><td class='num'>"+
    (r >= 0 ? "−" : "+")+pct.toFixed(1)+"%</td><td>"+note+"</td></tr>";
}).join("");

fillSkills(); renderClassPassives(); addScaler("STR", 75);
addTurn("s:Strike"); addTurn("명상"); addTurn("s:Strike");
$("aff").value = ELEM_DEFAULT;
calc();
