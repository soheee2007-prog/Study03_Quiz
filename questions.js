// 생성 일시: 2026-10-09 15:34 KST
// 상식 퀴즈 문항 40개. 작성 규칙은 CLAUDE.md를 따른다.
const QUESTIONS = [
  {
    id: "kh-01",
    category: "한국사",
    question: "훈민정음 해례본이 간행되어 세상에 반포된 해는?",
    choices: ["1446년","1392년","1443년","1592년"],
    answer: 0,
    explanation: "세종이 창제한 훈민정음은 1446년에 해설서 해례본이 간행되면서 반포되었다.",
    source: { title: "훈민정음 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0065805" }
  },
  {
    id: "kh-02",
    category: "한국사",
    question: "918년에 고려를 세운 인물은?",
    choices: ["궁예","왕건","견훤","이성계"],
    answer: 1,
    explanation: "왕건은 918년에 궁예를 몰아내고 즉위하여 국호를 고려로 정했다.",
    source: { title: "태조 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0059032" }
  },
  {
    id: "kh-03",
    category: "한국사",
    question: "698년에 고구려 유민을 이끌고 발해를 세운 인물은?",
    choices: ["연개소문","김유신","대조영","장보고"],
    answer: 2,
    explanation: "대조영은 698년에 진국을 세웠고, 뒤에 국호가 발해로 불렸다.",
    source: { title: "발해 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0021626" }
  },
  {
    id: "kh-04",
    category: "한국사",
    question: "임진왜란 중 1592년 한산도 대첩에서 조선 수군을 이끈 대표적인 장수는?",
    choices: ["권율","곽재우","김시민","이순신"],
    answer: 3,
    explanation: "이순신은 한산섬 앞바다에서 학익진을 펼쳐 일본 수군의 주력을 무찔렀다.",
    source: { title: "한산도대첩 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0061676" }
  },
  {
    id: "kh-05",
    category: "한국사",
    question: "전국으로 퍼진 독립 만세 운동인 삼일 운동이 일어난 해는?",
    choices: ["1919년","1905년","1910년","1945년"],
    answer: 0,
    explanation: "삼일 운동은 1919년 3월 1일을 계기로 전국에서 일어난 독립 만세 운동이다.",
    source: { title: "3·1운동 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0026772" }
  },
  {
    id: "kh-06",
    category: "한국사",
    question: "대한민국 정부가 수립되어 국내외에 선포된 해는?",
    choices: ["1945년","1948년","1950년","1953년"],
    answer: 1,
    explanation: "대한민국 정부는 1948년 8월 15일에 수립이 선포되었다.",
    source: { title: "대한민국 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0015002" }
  },
  {
    id: "kh-07",
    category: "한국사",
    question: "북한군의 남침으로 한국전쟁이 시작된 해는?",
    choices: ["1945년","1948년","1950년","1953년"],
    answer: 2,
    explanation: "한국전쟁은 1950년 6월 25일 새벽에 북한군이 38도선 전역에서 남침하면서 시작되었다.",
    source: { title: "한국전쟁 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0042143" }
  },
  {
    id: "kh-08",
    category: "한국사",
    question: "1395년에 창건되어 조선의 정궁으로 쓰인 궁궐은?",
    choices: ["창덕궁","덕수궁","경희궁","경복궁"],
    answer: 3,
    explanation: "경복궁은 1395년에 태조가 창건한 조선의 정궁이다.",
    source: { title: "경복궁 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0002434" }
  },
  {
    id: "kh-09",
    category: "한국사",
    question: "1894년 동학농민운동에서 동도대장으로 추대된 지도자는?",
    choices: ["전봉준","최시형","김구","홍경래"],
    answer: 0,
    explanation: "전봉준은 백산에 모인 동학농민군에게 동도대장으로 추대되어 농민군을 이끌었다.",
    source: { title: "전봉준 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0049437" }
  },
  {
    id: "kh-10",
    category: "한국사",
    question: "612년 살수대첩에서 을지문덕이 이끈 고구려군이 격파한 나라는?",
    choices: ["당나라","수나라","거란","후연"],
    answer: 1,
    explanation: "을지문덕은 612년 살수에서 수나라 별동대를 크게 무찔렀다.",
    source: { title: "살수대첩 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0026415" }
  },
  {
    id: "wg-01",
    category: "세계지리",
    question: "오스트레일리아(호주)의 수도는?",
    choices: ["시드니","멜버른","캔버라","퍼스"],
    answer: 2,
    explanation: "오스트레일리아의 수도는 시드니와 멜버른 사이에 세워진 계획도시 캔버라이다.",
    source: { title: "What is the capital of Australia? - Britannica", url: "https://www.britannica.com/question/What-is-the-capital-of-Australia" }
  },
  {
    id: "wg-02",
    category: "세계지리",
    question: "2020년 중국과 네팔이 함께 발표한 측정값 기준으로, 해발 고도가 가장 높은 산은?",
    choices: ["칸첸중가산","킬리만자로산","몽블랑","에베레스트산"],
    answer: 3,
    explanation: "에베레스트산은 해발 약 8,849미터로 지구에서 해발 고도가 가장 높은 산이다.",
    source: { title: "Mount Everest - Britannica", url: "https://www.britannica.com/place/Mount-Everest" }
  },
  {
    id: "wg-03",
    category: "세계지리",
    question: "2026년 현재, 더운 사막 가운데 면적이 가장 넓은 사막은?",
    choices: ["사하라 사막","고비 사막","아라비아 사막","칼라하리 사막"],
    answer: 0,
    explanation: "사하라 사막은 북아프리카에 펼쳐진 세계에서 가장 큰 더운 사막이다.",
    source: { title: "Sahara summary - Britannica", url: "https://www.britannica.com/summary/Sahara-desert-Africa" }
  },
  {
    id: "wg-04",
    category: "세계지리",
    question: "다음 중 바다에 접하지 않은 내륙국은?",
    choices: ["포르투갈","스위스","그리스","노르웨이"],
    answer: 1,
    explanation: "스위스는 독일, 오스트리아, 이탈리아, 프랑스 등에 둘러싸인 유럽의 내륙국이다.",
    source: { title: "Switzerland - Students - Britannica", url: "https://kids.britannica.com/students/article/Switzerland/277986" }
  },
  {
    id: "wg-05",
    category: "세계지리",
    question: "나일강이 흘러 들어가는 바다는?",
    choices: ["홍해","흑해","지중해","인도양"],
    answer: 2,
    explanation: "나일강은 아프리카 북동부를 지나 이집트 북쪽에서 지중해로 흘러 들어간다.",
    source: { title: "Nile River - Britannica", url: "https://www.britannica.com/place/Nile-River" }
  },
  {
    id: "wg-06",
    category: "세계지리",
    question: "파나마 운하가 이어 주는 두 바다는?",
    choices: ["대서양과 인도양","태평양과 인도양","지중해와 홍해","대서양과 태평양"],
    answer: 3,
    explanation: "파나마 운하는 파나마 지협을 가로질러 대서양과 태평양을 연결한다.",
    source: { title: "Panama Canal - Britannica", url: "https://www.britannica.com/topic/Panama-Canal" }
  },
  {
    id: "wg-07",
    category: "세계지리",
    question: "브라질의 수도는?",
    choices: ["브라질리아","리우데자네이루","상파울루","부에노스아이레스"],
    answer: 0,
    explanation: "브라질의 수도는 1960년에 리우데자네이루에서 옮겨 온 계획도시 브라질리아이다.",
    source: { title: "Brasília summary - Britannica", url: "https://www.britannica.com/summary/Brasilia" }
  },
  {
    id: "wg-08",
    category: "세계지리",
    question: "보스포루스 해협을 사이에 두고 유럽과 아시아에 걸쳐 있는 튀르키예의 도시는?",
    choices: ["앙카라","이스탄불","이즈미르","안탈리아"],
    answer: 1,
    explanation: "이스탄불은 보스포루스 해협이 시가지를 유럽 쪽과 아시아 쪽으로 나누는 도시이다.",
    source: { title: "Istanbul summary - Britannica", url: "https://www.britannica.com/summary/Istanbul" }
  },
  {
    id: "wg-09",
    category: "세계지리",
    question: "캐나다의 수도는?",
    choices: ["토론토","밴쿠버","오타와","몬트리올"],
    answer: 2,
    explanation: "캐나다의 수도는 온타리오주에 있는 오타와이다.",
    source: { title: "Ottawa - Britannica", url: "https://www.britannica.com/place/Ottawa" }
  },
  {
    id: "wg-10",
    category: "세계지리",
    question: "화산인 킬리만자로산이 있는 아프리카의 나라는?",
    choices: ["케냐","에티오피아","남아프리카공화국","탄자니아"],
    answer: 3,
    explanation: "킬리만자로산은 탄자니아 북동부에 있으며 케냐 국경과 가깝다.",
    source: { title: "Mount Kilimanjaro - Students - Britannica", url: "https://kids.britannica.com/students/article/Mount-Kilimanjaro/275271" }
  },
  {
    id: "sc-01",
    category: "과학",
    question: "물의 화학식은?",
    choices: ["CO2","O2","H2O","NaCl"],
    answer: 2,
    explanation: "물은 수소 원자 2개와 산소 원자 1개가 결합한 H2O로 나타낸다.",
    source: { title: "water summary - Britannica", url: "https://www.britannica.com/summary/water" }
  },
  {
    id: "sc-02",
    category: "과학",
    question: "식물이 광합성을 할 때 공기 중에서 흡수하는 기체는?",
    choices: ["산소","질소","수소","이산화탄소"],
    answer: 3,
    explanation: "식물은 광합성에서 이산화탄소와 물로 포도당을 만들고 산소를 내보낸다.",
    source: { title: "Photosynthesis - Britannica", url: "https://www.britannica.com/science/photosynthesis" }
  },
  {
    id: "sc-03",
    category: "과학",
    question: "진공에서 빛의 속도는 대략 얼마인가?",
    choices: ["초속 약 30만 킬로미터","초속 약 3만 킬로미터","초속 약 340미터","초속 약 3천만 킬로미터"],
    answer: 0,
    explanation: "진공에서 빛의 속도는 정확히 초속 299,792,458미터로, 대략 초속 30만 킬로미터이다.",
    source: { title: "Speed of light - Britannica", url: "https://www.britannica.com/science/speed-of-light" }
  },
  {
    id: "sc-04",
    category: "과학",
    question: "RNA에서 DNA의 티민 대신 들어가는 염기는?",
    choices: ["아데닌","우라실","구아닌","시토신"],
    answer: 1,
    explanation: "우라실은 RNA에만 들어 있고, DNA에서는 티민이 그 자리를 대신한다.",
    source: { title: "Nucleic acid - Britannica", url: "https://www.britannica.com/science/nucleic-acid" }
  },
  {
    id: "sc-05",
    category: "과학",
    question: "태양과의 평균 거리를 기준으로 2026년 현재 태양계 행성 중 태양에 가장 가까운 행성은?",
    choices: ["금성","지구","수성","화성"],
    answer: 2,
    explanation: "수성은 태양에서 평균 약 5800만 킬로미터 떨어진, 태양에 가장 가까운 행성이다.",
    source: { title: "Mercury Facts - NASA Science", url: "https://science.nasa.gov/mercury/facts/" }
  },
  {
    id: "sc-06",
    category: "과학",
    question: "원소 기호 Au가 나타내는 원소는?",
    choices: ["은","알루미늄","구리","금"],
    answer: 3,
    explanation: "Au는 금을 뜻하는 라틴어 아우룸에서 따온 금의 원소 기호이다.",
    source: { title: "Gold - Britannica", url: "https://www.britannica.com/science/gold-chemical-element" }
  },
  {
    id: "sc-07",
    category: "과학",
    question: "건조한 공기의 부피 기준으로, 2026년 현재 지구 대기에서 가장 많은 비율을 차지하는 기체는?",
    choices: ["질소","산소","아르곤","이산화탄소"],
    answer: 0,
    explanation: "질소는 건조한 공기 부피의 약 78퍼센트를 차지하는 지구 대기의 주성분이다.",
    source: { title: "Atmosphere - Britannica", url: "https://www.britannica.com/science/atmosphere" }
  },
  {
    id: "sc-08",
    category: "과학",
    question: "외부에서 힘이 작용하지 않으면 물체가 현재의 운동 상태를 유지하려는 성질을 설명하는 법칙은?",
    choices: ["작용 반작용의 법칙","관성의 법칙","만유인력의 법칙","에너지 보존 법칙"],
    answer: 1,
    explanation: "관성의 법칙은 힘이 작용하지 않으면 정지한 물체는 계속 정지하고 움직이던 물체는 같은 속도로 계속 움직인다는 법칙이다.",
    source: { title: "Newton's laws of motion - Britannica", url: "https://www.britannica.com/science/Newtons-laws-of-motion" }
  },
  {
    id: "sc-09",
    category: "과학",
    question: "25℃에서 순수한 물은 중성이다. 이때의 pH 값은?",
    choices: ["0","5","7","14"],
    answer: 2,
    explanation: "25℃에서 순수한 물은 수소 이온과 수산화 이온의 농도가 같아 pH가 7인 중성이다.",
    source: { title: "pH - Britannica", url: "https://www.britannica.com/science/pH" }
  },
  {
    id: "sc-10",
    category: "과학",
    question: "사람의 혈액에서 헤모글로빈을 이용해 산소를 운반하는 세포는?",
    choices: ["백혈구","혈소판","림프구","적혈구"],
    answer: 3,
    explanation: "적혈구는 철을 포함한 단백질인 헤모글로빈으로 산소를 폐에서 온몸의 조직으로 운반한다.",
    source: { title: "Red blood cell - Britannica", url: "https://www.britannica.com/science/red-blood-cell" }
  },
  {
    id: "ac-01",
    category: "예술과 문화",
    question: "〈모나리자〉를 그린 화가는?",
    choices: ["레오나르도 다 빈치","미켈란젤로 부오나로티","라파엘로 산치오","산드로 보티첼리"],
    answer: 0,
    explanation: "〈모나리자〉는 레오나르도 다 빈치가 1503년경부터 그리기 시작한 초상화이다.",
    source: { title: "Mona Lisa - Britannica", url: "https://www.britannica.com/topic/Mona-Lisa-painting" }
  },
  {
    id: "ac-02",
    category: "예술과 문화",
    question: "마지막 악장에 합창이 들어간 교향곡 제9번 〈합창〉을 작곡한 사람은?",
    choices: ["모차르트","베토벤","바흐","슈베르트"],
    answer: 1,
    explanation: "베토벤은 1824년에 초연된 교향곡 제9번의 마지막 악장에 실러의 시 〈환희의 송가〉를 합창으로 넣었다.",
    source: { title: "Symphony No. 9 in D Minor, Op. 125 - Britannica", url: "https://www.britannica.com/topic/Symphony-No-9-in-D-Minor" }
  },
  {
    id: "ac-03",
    category: "예술과 문화",
    question: "덴마크의 왕자가 아버지의 죽음에 복수하는 비극 〈햄릿〉을 쓴 작가는?",
    choices: ["찰스 디킨스","요한 볼프강 폰 괴테","윌리엄 셰익스피어","빅토르 위고"],
    answer: 2,
    explanation: "〈햄릿〉은 셰익스피어가 1600년경에 쓴 5막의 비극이다.",
    source: { title: "Hamlet - Britannica", url: "https://www.britannica.com/topic/Hamlet-by-Shakespeare" }
  },
  {
    id: "ac-04",
    category: "예술과 문화",
    question: "〈별이 빛나는 밤〉을 그린 화가는?",
    choices: ["클로드 모네","폴 세잔","에드바르 뭉크","빈센트 반 고흐"],
    answer: 3,
    explanation: "반 고흐는 1889년에 생레미의 요양원에 머물며 〈별이 빛나는 밤〉을 그렸다.",
    source: { title: "The Starry Night in Focus - Britannica", url: "https://www.britannica.com/topic/The-Starry-Night-in-Focus-2236376" }
  },
  {
    id: "ac-05",
    category: "예술과 문화",
    question: "스페인 내전 중 일어난 게르니카 폭격을 소재로 한 그림 〈게르니카〉를 그린 화가는?",
    choices: ["파블로 피카소","살바도르 달리","앙리 마티스","호안 미로"],
    answer: 0,
    explanation: "피카소는 1937년 파리 만국박람회의 스페인관에 걸 벽화로 〈게르니카〉를 그렸다.",
    source: { title: "Pablo Picasso - Britannica", url: "https://www.britannica.com/biography/Pablo-Picasso" }
  },
  {
    id: "ac-06",
    category: "예술과 문화",
    question: "발레 〈백조의 호수〉를 작곡한 사람은?",
    choices: ["스트라빈스키","차이콥스키","드뷔시","쇼팽"],
    answer: 1,
    explanation: "〈백조의 호수〉는 차이콥스키가 작곡한 그의 첫 발레 음악이다.",
    source: { title: "Swan Lake - Britannica", url: "https://www.britannica.com/topic/Swan-Lake-ballet-by-Tchaikovsky" }
  },
  {
    id: "ac-07",
    category: "예술과 문화",
    question: "2020년 아카데미 시상식에서 작품상을 받은 한국 영화 〈기생충〉의 감독은?",
    choices: ["박찬욱","이창동","봉준호","김기덕"],
    answer: 2,
    explanation: "봉준호 감독의 〈기생충〉은 2020년 아카데미 시상식에서 외국어 영화로는 처음으로 작품상을 받았다.",
    source: { title: "Parasite - Britannica", url: "https://www.britannica.com/topic/Parasite-2019-film" }
  },
  {
    id: "ac-08",
    category: "예술과 문화",
    question: "2012년에 유네스코 인류무형문화유산에 오른 한국의 대표 민요는?",
    choices: ["도라지타령","새타령","쾌지나 칭칭 나네","아리랑"],
    answer: 3,
    explanation: "아리랑은 2012년 12월에 유네스코 인류무형문화유산으로 등재되었다.",
    source: { title: "아리랑 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0077500" }
  },
  {
    id: "ac-09",
    category: "예술과 문화",
    question: "조선 후기 풍속화 〈씨름〉과 〈서당〉이 실린 『풍속도 화첩』을 그린 화가는?",
    choices: ["김홍도","신윤복","정선","장승업"],
    answer: 0,
    explanation: "『풍속도 화첩』은 김홍도가 〈씨름〉, 〈서당〉 등 일상 모습을 담아 그린 25점의 풍속화 모음이다.",
    source: { title: "김홍도 필 풍속도 화첩 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0013639" }
  },
  {
    id: "ac-10",
    category: "예술과 문화",
    question: "한말부터 광복 무렵까지의 시대를 배경으로 한 대하소설 『토지』를 쓴 작가는?",
    choices: ["황석영","박경리","조정래","김동리"],
    answer: 1,
    explanation: "박경리는 1969년에 집필을 시작해 1994년에 대하소설 『토지』를 완간했다.",
    source: { title: "토지 - 한국민족문화대백과사전", url: "https://encykorea.aks.ac.kr/Article/E0059209" }
  },
];
