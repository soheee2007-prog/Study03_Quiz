<!-- 생성 일시: 2026-10-09 15:17 KST -->

# 상식 퀴즈 웹 앱 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 서버 없이 파일을 열면 동작하는 4지선다 상식 퀴즈(카테고리 4개, 40문항, 연습, 스피드, 힌트 모드, 순위표)를 만든다.

**Architecture:** `questions.js`가 전역 상수 `QUESTIONS`를, `script.js`가 순수 계산 함수(섞기, 채점, 힌트, 순위표)와 화면 그리기 함수를 정의한다. 둘 다 일반 `<script>` 태그로 불러온다. 순수 함수는 DOM을 건드리지 않아서 Node의 `vm`으로 불러와 테스트할 수 있다.

**Tech Stack:** HTML, CSS, 바닐라 자바스크립트(빌드 도구 없음), 테스트는 Node.js 24 내장 `node --test`.

**Spec:** [PRD.md](PRD.md)

## Global Constraints

- 앱 파일은 `index.html`, `style.css`, `script.js`, `questions.js` 4개뿐이다. `tests/` 폴더는 개발용 테스트이며 앱이 불러오지 않는다.
- `file://`로 열었을 때 동작해야 한다. ES 모듈(`import`, `type="module"`), `fetch`, 외부 라이브러리와 CDN을 쓰지 않는다.
- `index.html`은 `questions.js`, `script.js` 순서로 `<script>`를 불러온다.
- `script.js`의 DOM 시작 코드는 `if (typeof document !== "undefined")` 안에서만 실행한다. 그래야 테스트에서 불러올 수 있다.
- 화면 문구, 코드 주석, 출력 메시지는 한국어로 쓴다. 완결된 문장은 마침표로 끝내고, 버튼 라벨에는 붙이지 않는다. 단순 열거에 가운뎃점(·)을 쓰지 않는다.
- 새 파일 첫 줄에 생성 일시 주석을 단다. 시각은 PowerShell `[System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, 'Korea Standard Time').ToString('yyyy-MM-dd HH:mm')`로 확인하고 `2026-10-09 15:17 KST` 형식으로 쓴다. JS는 `//`, CSS는 `/* */`, HTML은 `<!-- -->`.
- 문항 데이터에서는 문제 문장을 화면에 넣을 때 `textContent`를 쓴다(`innerHTML` 금지).
- 이 폴더는 git 저장소가 아니고, 사용자는 요청할 때만 커밋한다. 그래서 각 작업에 커밋 단계가 없다. 작업이 끝나면 결과를 보고한다.
- 고정 값: 카테고리 `["한국사", "세계지리", "과학", "예술과 문화"]`, id 접두어 `kh`, `wg`, `sc`, `ac`, 한 판 10문항, 스피드 15초, 순위표 키 `quizLeaderboard`, 조합마다 상위 5개.
- 고정 문구: "순위표에 기록되지 않음", "정답입니다.", "오답입니다.", "시간 초과", "문제 파일을 불러오지 못했습니다.", "이 브라우저에서는 순위표를 저장할 수 없습니다.", 점수 "7.5 / 10점" 형식, 다시 풀기 점수 "3문제 중 2개 맞힘" 형식, 진행 "3 / 10" 형식.

## Review Focus

1. **보기를 빠르게 두 번 누르거나, 스피드 모드에서 0초와 동시에 누름:** 점수는 한 번만 더해져야 한다. → Task 2에서 `answerCurrent`를 두 번 부르면 두 번째는 `null`을 돌려주고 점수가 그대로인지 테스트한다.
2. **보기가 섞인 뒤 힌트 사용:** 정답 보기는 절대 지워지면 안 된다. → Task 5에서 여러 난수로 반복해 지운 보기 2개에 정답이 없는지 테스트한다.
3. **localStorage에 깨진 값이 들어 있음:** 앱이 멈추지 않고 빈 순위표로 시작해야 한다. → Task 7에서 `"{깨짐"` 저장소로 `loadBoard`를 테스트한다.
4. **다시 풀기에서 또 틀림:** 다음 다시 풀기는 방금 다시 풀기에서 틀린 문제만 나와야 한다. → Task 4에서 테스트한다.
5. **다른 화면으로 나간 뒤에도 타이머가 돎:** 결과 화면이나 시작 화면에서 시간 초과 처리가 일어나면 안 된다. → Task 6의 브라우저 점검 항목으로 확인한다(타이머는 DOM 코드라 단위 테스트 대신 직접 확인).

---

## 상태와 데이터 형식 (모든 작업 공통)

```js
// 이번 판 문항 하나
RoundQuestion = {
  id, question, explanation, source,  // QUESTIONS에서 그대로
  choices: string[4],                 // 섞은 보기
  correctChoice: string               // 정답 보기 문장
}

// 게임 상태
State = {
  mode: "practice" | "speed" | "hint",
  category: string,
  round: RoundQuestion[],
  index: number,          // 현재 문항 위치(0부터)
  score: number,
  answered: boolean,      // 현재 문항에 답했는지
  usedHint: boolean,      // 현재 문항에서 힌트를 썼는지
  hiddenChoices: string[],// 힌트로 지운 보기
  wrongIds: string[],     // 이번 판에서 틀린 문항 id
  isRetry: boolean        // 틀린 문제 다시 풀기인지
}
```

---

## 1단계: 연습 모드와 점수

### Task 1: 문항 40개 작성과 데이터 점검

**Files:**
- Create: `questions.js`
- Create: `tests/questions.test.js`
- Create: `tests/load.js`

**Interfaces:**
- Produces: 전역 상수 `QUESTIONS`(PRD 2절 형식의 객체 40개). `tests/load.js`의 `loadApp() -> vm 컨텍스트`(Task 2 이후 `script.js`가 생기면 함께 불러옴), `plain(value) -> JSON 왕복한 값`(다른 실행 영역의 배열 비교용).

- [ ] **Step 1: `tests/load.js` 작성**

`loadApp()`은 `vm.createContext({})`에 `questions.js`와(파일이 있으면) `script.js`를 `vm.runInContext`로 차례로 실행하고 컨텍스트를 돌려준다. `const QUESTIONS`는 컨텍스트 속성이 아니므로 `vm.runInContext("QUESTIONS", ctx)`로 꺼낸다. `plain(v)`는 `JSON.parse(JSON.stringify(v))`. vm 안에서 만든 배열은 `assert.deepStrictEqual`에서 다른 영역으로 취급되므로 비교 전에 `plain`을 거친다.

- [ ] **Step 2: 데이터 점검 테스트 작성**

`tests/questions.test.js`에 다음을 확인하는 테스트를 쓴다.
- 전체 길이 40, 카테고리 4개 각각 10개, 카테고리 값은 고정 목록 중 하나.
- `id`가 겹치지 않고 `/^(kh|wg|sc|ac)-\d{2}$/` 형식이며, 접두어가 카테고리와 맞는다(`kh`=한국사, `wg`=세계지리, `sc`=과학, `ac`=예술과 문화).
- `choices` 길이 4, 네 보기가 서로 다르고 빈 문자열이 없다.
- `answer`가 0~3 정수.
- `question`, `explanation`, `source.title`이 비어 있지 않고, `source.url`이 `https://`로 시작한다.

- [ ] **Step 3: 테스트 실패 확인**

Run: `node --test tests/`
Expected: FAIL (`questions.js` 없음)

- [ ] **Step 4: 카테고리마다 10문항 작성 (한국사, 세계지리, 과학, 예술과 문화 순)**

문항마다 PRD 7절 "문항 규칙"을 지킨다.
- WebSearch 또는 WebFetch로 사실을 직접 확인하고, 실제로 연 페이지의 제목과 주소를 `source`에 적는다. 백과사전, 공공기관, 교과 자료를 우선한다. 확인이 안 되면 다른 문항으로 바꾼다.
- 오답 보기 3개가 정답으로 볼 여지가 없는지 따진다.
- 최상급 표현은 문제 안에 기준과 시점을 적는다(예: "2024년 기준, 면적이 가장 넓은 나라는?").
- 해설은 한 문장이다.
- 정답 위치(`answer`)를 0~3에 고르게 나눈다(어차피 섞이지만 데이터를 읽을 때 치우침을 막기 위해).

- [ ] **Step 5: 테스트 통과 확인**

Run: `node --test tests/`
Expected: PASS

- [ ] **Step 6: 사람 검토용 목록 보고**

40문항의 "문제 / 정답 / 출처 주소"를 표로 사용자에게 보여 주고, 최상급 표현이 들어간 문항을 따로 표시한다.

### Task 2: 핵심 계산 함수 (섞기, 판 만들기, 채점)

**Files:**
- Create: `script.js`
- Create: `tests/logic.test.js`

**Interfaces:**
- Consumes: `QUESTIONS`, `loadApp()`, `plain()`
- Produces (모두 `script.js`의 전역 함수와 상수):
  - `CATEGORIES`, `MODE_LABELS = { practice: "연습", speed: "스피드", hint: "힌트" }`, `QUESTIONS_PER_ROUND = 10`, `SPEED_SECONDS = 15`
  - `shuffle(items, random = Math.random) -> 새 배열` (원본 유지, Fisher-Yates)
  - `buildRound(questions, random = Math.random) -> RoundQuestion[]` (문항 순서와 각 보기 순서를 섞음)
  - `createState(mode, category, questions, { isRetry = false, random = Math.random } = {}) -> State`
  - `scoreFor(correct, usedHint) -> 1 | 0.5 | 0`
  - `answerCurrent(state, choice) -> { correct, gained } | null` (`choice`가 `null`이면 시간 초과. 이미 답했으면 아무것도 바꾸지 않고 `null`)
  - `nextQuestion(state) -> boolean` (다음 문항이 있으면 `index`를 올리고 `answered`, `usedHint`, `hiddenChoices`를 초기화한 뒤 `true`, 마지막이면 `false`)
  - `formatScore(score, total) -> string` ("7.5 / 10점", 정수면 "7 / 10점")
  - `formatRetryScore(correctCount, total) -> string` ("3문제 중 2개 맞힘")
  - `formatProgress(index, total) -> string` (`index` 0 → "1 / 10")

- [ ] **Step 1: 실패하는 테스트 작성**

`tests/logic.test.js`. 난수는 테스트 안의 `seq([0.1, 0.9, ...])` 같은 고정 수열 함수로 넣는다.
- `shuffle`: 결과가 원본과 같은 원소 집합이고 원본 배열은 바뀌지 않는다.
- `buildRound`: 한국사 10문항으로 만들면 길이 10, 각 `choices`가 원래 보기 4개와 같은 집합, `correctChoice === 원래 choices[answer]`.
- `buildRound`: 서로 다른 난수 두 개로 만든 판의 id 순서가 다르다.
- `scoreFor(true, false) === 1`, `scoreFor(true, true) === 0.5`, `scoreFor(false, true) === 0`.
- `answerCurrent`: 정답 문장을 넣으면 `{ correct: true, gained: 1 }`, 점수 1, `wrongIds` 빈 배열.
- `answerCurrent`: 오답이면 `gained: 0`, 현재 id가 `wrongIds`에 들어간다. `null`(시간 초과)도 같다.
- **(Review Focus 1)** 같은 문항에 `answerCurrent`를 두 번 부르면 두 번째는 `null`, 점수와 `wrongIds`가 그대로다.
- `nextQuestion`: 10번째 문항에서 `false`, 그 전에는 `true`이고 `answered`가 `false`로 돌아간다.
- `formatScore(7.5, 10) === "7.5 / 10점"`, `formatScore(7, 10) === "7 / 10점"`, `formatRetryScore(2, 3) === "3문제 중 2개 맞힘"`, `formatProgress(2, 10) === "3 / 10"`.

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test tests/`
Expected: FAIL (함수가 정의되지 않음)

- [ ] **Step 3: 위 Interfaces의 함수와 상수를 `script.js`에 구현**

`createState`는 `questions`를 그대로 판으로 만든다(카테고리 거르기는 호출하는 쪽에서 함). 파일 끝의 DOM 시작 부분은 아직 비워 두고 `if (typeof document !== "undefined") { }` 틀만 둔다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test tests/`
Expected: PASS (Task 1 테스트 포함)

### Task 3: 연습 모드 화면 (시작, 문제, 결과)

**Files:**
- Create: `index.html`, `style.css`
- Modify: `script.js` (DOM 부분)

**Interfaces:**
- Consumes: Task 2의 모든 함수
- Produces: `index.html`의 `<main id="app">`. `script.js`의 `renderStart()`, `renderQuestion()`, `renderFeedback(result)`, `renderResult()`, `renderError(message)`, 모듈 변수 `state`. 이후 작업은 이 함수들을 고쳐서 기능을 더한다.

- [ ] **Step 1: `index.html`과 `style.css` 작성**

`index.html`: `lang="ko"`, UTF-8, 뷰포트 메타, `style.css`, `<main id="app"></main>`, 그 뒤 `questions.js`, `script.js`. `style.css`: 휴대폰 폭에서도 보기 4개가 한 줄씩 보이는 단순한 레이아웃, 정답 보기와 고른 오답 보기를 구분하는 색, 비활성 보기 흐리게.

- [ ] **Step 2: 화면 함수 구현**

- 시작: `typeof QUESTIONS === "undefined"`이면 `renderError("문제 파일을 불러오지 못했습니다.")`. 아니면 카테고리 버튼 4개와 "순위표에 기록되지 않음" 표시. 버튼을 누르면 `createState("practice", 카테고리, 해당 카테고리 문항)` 후 `renderQuestion()`.
- 문제: `formatProgress`, 문제 문장, 보기 버튼 4개. 보기를 누르면 `answerCurrent` 후 `renderFeedback`.
- 피드백: 모든 보기 비활성화, 정답 보기와 고른 오답 보기 색 표시, "정답입니다." 또는 "오답입니다.", 해설, "출처: " + 링크(`target="_blank"`, `rel="noopener"`). [다음] 또는 마지막이면 [결과 보기].
- 결과: `formatScore(state.score, state.round.length)`, "순위표에 기록되지 않음", [처음으로].

- [ ] **Step 3: 테스트 재확인**

Run: `node --test tests/`
Expected: PASS (DOM 코드가 Node에서 실행되지 않음을 확인)

- [ ] **Step 4: 브라우저 점검 (PRD 9절 1단계 목록)**

내장 브라우저로 `file:///C:/study03_quiz/index.html`을 연다. 내장 브라우저가 `file://`을 열지 못하면 사용자에게 `index.html` 더블클릭 확인을 요청한다. PRD 9절 1단계 체크 항목 4개를 모두 확인하고, 문제 화면에 "1 / 10" 같은 진행 표시가 보이는지와 [처음으로]가 시작 화면으로 가는지도 확인한다. 콘솔 오류가 없어야 한다.

---

## 2단계: 모드 선택, 다시 풀기, 힌트, 스피드

### Task 4: 모드 선택 화면과 틀린 문제 다시 풀기

**Files:**
- Modify: `script.js`, `style.css`
- Modify: `tests/logic.test.js`

**Interfaces:**
- Consumes: `createState`, `answerCurrent`, `formatRetryScore`
- Produces: 시작 화면의 모드 선택(기본값 연습). 결과 화면의 [틀린 문제 다시 풀기].

- [ ] **Step 1: 실패하는 테스트 작성 (Review Focus 4)**

판을 만들어 3문항을 틀리고 나머지를 맞힌 뒤, `QUESTIONS.filter(q => state.wrongIds.includes(q.id))`로 `createState("practice", 카테고리, 그 목록, { isRetry: true })`를 만들면 판의 id 집합이 틀린 3개와 같다. 그 다시 풀기에서 1개를 또 틀리면 새 `wrongIds`는 그 1개뿐이다.

- [ ] **Step 2: 테스트 실행**

Run: `node --test tests/`
Expected: Task 2 구현이 맞다면 바로 PASS할 수 있다. 실패하면 `createState`가 `wrongIds`를 빈 배열로 시작하는지 고친다.

- [ ] **Step 3: 화면 구현**

- 시작 화면: 모드 3개(연습, 스피드, 힌트) 중 하나를 고르고 카테고리를 누르면 시작. "순위표에 기록되지 않음"은 연습을 골랐을 때만 표시.
- 결과 화면(연습): `wrongIds`가 비어 있지 않으면 [틀린 문제 다시 풀기]. 다시 풀기 판의 결과는 `formatRetryScore(맞힌 개수, 문항 수)`로 보여 준다. 다 맞히면 버튼이 없다.
- 결과 화면의 "순위표에 기록되지 않음"도 연습 판(다시 풀기 포함)에서만 표시한다.
- 스피드와 힌트 판의 결과 화면에는 다시 풀기 버튼이 없다.

- [ ] **Step 4: 테스트와 브라우저 점검**

Run: `node --test tests/` → PASS. 브라우저에서 PRD 9절 2단계의 모드 선택, 연습 다시 풀기 항목을 확인한다.

### Task 5: 힌트 모드

**Files:**
- Modify: `script.js`, `style.css`, `tests/logic.test.js`

**Interfaces:**
- Consumes: `State`, `scoreFor`
- Produces: `useHint(state, random = Math.random) -> string[]` (지운 오답 보기 2개. 이미 썼거나 답한 뒤면 `[]`를 돌려주고 상태를 바꾸지 않음. 쓰면 `usedHint = true`, `hiddenChoices`에 저장)

- [ ] **Step 1: 실패하는 테스트 작성**
- **(Review Focus 2)** 서로 다른 난수 수열 20가지로 `useHint`를 부르면 매번 길이 2, 서로 다르고, `correctChoice`가 들어 있지 않다.
- 두 번째 `useHint`는 `[]`이고 `hiddenChoices`가 그대로다.
- 힌트를 쓰고 정답을 고르면 `gained === 0.5`, 힌트 없이 맞히면 `1`.
- 답한 뒤 `useHint`는 `[]`.

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test tests/`
Expected: FAIL (`useHint` 없음)

- [ ] **Step 3: `useHint` 구현과 화면 연결**

힌트 모드 문제 화면에만 [힌트] 버튼. 누르면 `hiddenChoices`의 보기를 흐리게 하고 누를 수 없게 하며, 버튼을 비활성화한다. `answerCurrent`는 `state.usedHint`로 점수를 계산한다.

- [ ] **Step 4: 테스트와 브라우저 점검**

Run: `node --test tests/` → PASS. 브라우저에서 PRD 9절 2단계 힌트 항목 2개를 확인한다.

### Task 6: 스피드 모드 타이머

**Files:**
- Modify: `script.js`, `style.css`

**Interfaces:**
- Consumes: `answerCurrent(state, null)`, `SPEED_SECONDS`, `renderFeedback`
- Produces: `startTimer()`, `stopTimer()` (모듈 변수 `timerId`, `secondsLeft` 사용)

- [ ] **Step 1: 타이머 구현**

- 스피드 모드 `renderQuestion()`에서 `startTimer()`: `secondsLeft = SPEED_SECONDS`로 화면에 표시하고 1초마다 줄인다. 0이 되면 `stopTimer()` 후 `answerCurrent(state, null)`, 피드백에 "시간 초과"와 "오답입니다.", 정답, 해설을 보여 준다.
- 보기를 누르면 바로 `stopTimer()`.
- `startTimer()`는 시작 전에 항상 `stopTimer()`를 먼저 부른다. `renderStart()`와 `renderResult()`도 맨 앞에서 `stopTimer()`를 부른다. (Review Focus 5)

- [ ] **Step 2: 테스트 재확인**

Run: `node --test tests/`
Expected: PASS

- [ ] **Step 3: 브라우저 점검**

PRD 9절 2단계 스피드 항목 2개를 확인한다. 추가로 문항 도중 [처음으로]로 나가거나 결과 화면에 간 뒤 20초를 기다려도 화면이 바뀌지 않고 콘솔 오류가 없는지 확인한다.

---

## 3단계: 점수 저장과 순위표

### Task 7: 순위표 계산과 저장 함수

**Files:**
- Modify: `script.js`, `tests/logic.test.js`

**Interfaces:**
- Produces:
  - `BOARD_KEY = "quizLeaderboard"`, `BOARD_LIMIT = 5`
  - `leaderboardKey(mode, category) -> string` (`("speed", "한국사")` → `"스피드-한국사"`)
  - `addRecord(board, key, record) -> 새 board` (`record = { score, date }`. 점수 내림차순, 같은 점수는 기존 기록이 위, 상위 5개만. 원본 board는 바꾸지 않음)
  - `loadBoard(storage) -> { ok: boolean, board: object }` (`storage`는 `getItem`, `setItem`을 가진 객체)
  - `saveBoard(storage, board) -> boolean`
  - `todayString(date = new Date()) -> "YYYY-MM-DD"` (기기 현지 날짜)

- [ ] **Step 1: 실패하는 테스트 작성**

테스트용 저장소는 `Map`으로 만든 가짜 객체를 쓴다.
- `leaderboardKey("hint", "과학") === "힌트-과학"`.
- 점수 `[5, 8, 8, 3, 9, 7]`을 차례로 넣으면 남은 점수가 `[9, 8, 8, 7, 5]`이고, 두 8점 중 먼저 넣은 기록이 위다(날짜를 다르게 넣어 구분).
- `addRecord`가 원본 board를 바꾸지 않는다.
- 빈 저장소의 `loadBoard`는 `{ ok: true, board: {} }`.
- **(Review Focus 3)** 값이 `"{깨짐"`이면 `{ ok: true, board: {} }`.
- `getItem`이 예외를 던지는 저장소면 `{ ok: false, board: {} }`, `setItem`이 예외를 던지면 `saveBoard`가 `false`.
- `saveBoard` 후 `loadBoard`가 같은 board를 돌려준다.
- `todayString(new Date(2026, 9, 9)) === "2026-10-09"`.

- [ ] **Step 2: 테스트 실패 확인**

Run: `node --test tests/`
Expected: FAIL

- [ ] **Step 3: 함수 구현**

`window.localStorage` 접근 자체가 예외를 던질 수 있으므로, 화면 코드에서 저장소를 얻을 때도 `try`로 감싼다(Task 8). 이 작업의 함수들은 받은 `storage`만 쓴다.

- [ ] **Step 4: 테스트 통과 확인**

Run: `node --test tests/`
Expected: PASS

### Task 8: 순위표 화면

**Files:**
- Modify: `script.js`, `style.css`

**Interfaces:**
- Consumes: Task 7의 모든 함수
- Produces: `renderBoard(container, mode, category)` (해당 조합의 상위 5개 목록, 기록이 없으면 "아직 기록이 없습니다.")

- [ ] **Step 1: 구현**

- `getStorage()`: `try { return window.localStorage } catch { return null }`. `null`이거나 `loadBoard`의 `ok`가 `false`면 순위표 자리에 "이 브라우저에서는 순위표를 저장할 수 없습니다."를 표시하고 게임은 계속한다.
- 결과 화면: 스피드나 힌트 판이고 다시 풀기가 아니면 `addRecord(board, leaderboardKey(mode, category), { score, date: todayString() })` 후 `saveBoard`, 그리고 `renderBoard`로 이번 조합의 순위표를 보여 준다. 연습 판에는 순위표를 그리지 않는다.
- 시작 화면: [순위표] 버튼으로 모드 2개 × 카테고리 4개, 표 8개를 볼 수 있다.

- [ ] **Step 2: 테스트 재확인**

Run: `node --test tests/`
Expected: PASS

- [ ] **Step 3: 브라우저 점검**

PRD 9절 3단계 항목 4개를 확인한다. 같은 조합으로 6판 이상 해서 상위 5개만 남는지 보고, 브라우저를 닫았다 열어도 남는지 확인한다. 마지막으로 PRD 9절 1~3단계 전체 목록을 처음부터 다시 훑는다.
