// 생성 일시: 2026-10-09 15:44 KST
// 퀴즈 앱 로직. 화면과 무관한 계산 함수는 위쪽, DOM 코드는 맨 아래에 둔다.

const CATEGORIES = ["한국사", "세계지리", "과학", "예술과 문화"];
const MODE_LABELS = { practice: "연습", speed: "스피드", hint: "힌트" };
const QUESTIONS_PER_ROUND = 10;
const SPEED_SECONDS = 15;

// 피셔-예이츠 섞기. 원본은 그대로 두고 새 배열을 돌려준다.
function shuffle(items, random = Math.random) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 문항 순서와 각 문항의 보기 순서를 섞어 한 판을 만든다.
function buildRound(questions, random = Math.random) {
  return shuffle(questions, random).map((q) => ({
    id: q.id,
    question: q.question,
    explanation: q.explanation,
    source: q.source,
    choices: shuffle(q.choices, random),
    correctChoice: q.choices[q.answer],
  }));
}

// 새 게임 상태. 카테고리 거르기는 호출하는 쪽에서 한다.
function createState(mode, category, questions, { isRetry = false, random = Math.random } = {}) {
  return {
    mode,
    category,
    round: buildRound(questions, random),
    index: 0,
    score: 0,
    answered: false,
    usedHint: false,
    hiddenChoices: [],
    wrongIds: [],
    isRetry,
  };
}

// 정답 1점, 힌트를 쓴 정답 0.5점, 오답 0점.
function scoreFor(correct, usedHint) {
  if (!correct) return 0;
  return usedHint ? 0.5 : 1;
}

// 현재 문항에 답한다. choice가 null이면 시간 초과. 이미 답했으면 null.
function answerCurrent(state, choice) {
  if (state.answered) return null;
  const current = state.round[state.index];
  const correct = choice === current.correctChoice;
  const gained = scoreFor(correct, state.usedHint);
  state.answered = true;
  state.score += gained;
  if (!correct) state.wrongIds.push(current.id);
  return { correct, gained };
}

// 다음 문항으로 넘어간다. 마지막이면 false.
function nextQuestion(state) {
  if (state.index >= state.round.length - 1) return false;
  state.index += 1;
  state.answered = false;
  state.usedHint = false;
  state.hiddenChoices = [];
  return true;
}

// 힌트를 쓴다. 오답 보기 2개를 무작위로 골라 지우고 돌려준다.
// 이미 썼거나 답한 뒤면 상태를 바꾸지 않고 빈 배열을 돌려준다.
function useHint(state, random = Math.random) {
  if (state.usedHint || state.answered) return [];
  const current = state.round[state.index];
  const wrong = current.choices.filter((c) => c !== current.correctChoice);
  const hidden = shuffle(wrong, random).slice(0, 2);
  state.usedHint = true;
  state.hiddenChoices = hidden;
  return hidden;
}

// 점수 문구. 정수면 소수점 없이 보여 준다.
function formatScore(score, total) {
  return `${score} / ${total}점`;
}

function formatRetryScore(correctCount, total) {
  return `${total}문제 중 ${correctCount}개 맞힘`;
}

function formatProgress(index, total) {
  return `${index + 1} / ${total}`;
}

// 브라우저에서만 실행한다(테스트에서는 document가 없음).
if (typeof document !== "undefined") {
  const app = document.getElementById("app");
  let state = null;
  let selectedMode = "practice";
  let timerId = null;
  let secondsLeft = 0;

  // 요소를 쉽게 만드는 도우미. 문자열은 textContent로만 넣는다.
  function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }

  function show(...nodes) {
    app.replaceChildren(...nodes);
  }

  // 스피드 모드 타이머. 시작 전에 항상 이전 타이머를 정리한다.
  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startTimer(label) {
    stopTimer();
    secondsLeft = SPEED_SECONDS;
    label.textContent = `남은 시간 ${secondsLeft}초`;
    timerId = setInterval(() => {
      secondsLeft -= 1;
      label.textContent = `남은 시간 ${secondsLeft}초`;
      if (secondsLeft <= 0) {
        stopTimer();
        const result = answerCurrent(state, null);
        if (result) renderFeedback(result, null);
      }
    }, 1000);
  }

  function renderError(message) {
    show(el("p", message));
  }

  function renderStart() {
    stopTimer();
    if (typeof QUESTIONS === "undefined") {
      renderError("문제 파일을 불러오지 못했습니다.");
      return;
    }
    const notice = el("p", "순위표에 기록되지 않음", "notice");
    notice.hidden = selectedMode !== "practice";

    // 모드 버튼. 고른 모드만 selected 표시를 한다.
    const modeList = el("div", undefined, "modes");
    const modeButtons = {};
    for (const mode of Object.keys(MODE_LABELS)) {
      const button = el("button", MODE_LABELS[mode]);
      button.classList.toggle("selected", mode === selectedMode);
      button.addEventListener("click", () => {
        selectedMode = mode;
        for (const key of Object.keys(modeButtons)) {
          modeButtons[key].classList.toggle("selected", key === mode);
        }
        notice.hidden = mode !== "practice";
      });
      modeButtons[mode] = button;
      modeList.appendChild(button);
    }

    const list = el("div", undefined, "choices");
    for (const category of CATEGORIES) {
      const button = el("button", category);
      button.addEventListener("click", () => {
        const questions = QUESTIONS.filter((q) => q.category === category);
        state = createState(selectedMode, category, questions);
        renderQuestion();
      });
      list.appendChild(button);
    }
    show(
      el("h1", "상식 퀴즈"),
      el("p", "모드를 고르세요.", "notice"),
      modeList,
      el("p", "카테고리를 고르세요.", "notice"),
      list,
      notice
    );
  }

  function renderQuestion() {
    const current = state.round[state.index];
    const list = el("div", undefined, "choices");
    const choiceButtons = new Map();
    for (const choice of current.choices) {
      const button = el("button", choice);
      button.addEventListener("click", () => {
        stopTimer();
        const result = answerCurrent(state, choice);
        if (result) renderFeedback(result, choice);
      });
      choiceButtons.set(choice, button);
      list.appendChild(button);
    }
    const nodes = [
      el("p", formatProgress(state.index, state.round.length), "progress"),
      el("h2", current.question),
      list,
    ];
    // 힌트 모드에서만 힌트 버튼을 보여 준다.
    if (state.mode === "hint") {
      const hint = el("button", "힌트", "hint");
      hint.disabled = state.usedHint;
      hint.addEventListener("click", () => {
        for (const choice of useHint(state)) {
          const button = choiceButtons.get(choice);
          button.disabled = true;
          button.classList.add("hinted");
        }
        hint.disabled = true;
      });
      nodes.push(hint);
    }
    // 스피드 모드에서만 남은 시간을 보여 주고 센다.
    if (state.mode === "speed") {
      const timer = el("p", undefined, "timer");
      nodes.splice(1, 0, timer);
      show(...nodes);
      startTimer(timer);
      return;
    }
    stopTimer();
    show(...nodes);
  }

  // 답한 뒤 화면. chosen은 고른 보기(없으면 null).
  function renderFeedback(result, chosen) {
    stopTimer();
    const current = state.round[state.index];
    const list = el("div", undefined, "choices");
    for (const choice of current.choices) {
      const button = el("button", choice);
      button.disabled = true;
      if (state.hiddenChoices.includes(choice)) button.classList.add("hinted");
      if (choice === current.correctChoice) button.classList.add("correct");
      else if (choice === chosen) button.classList.add("wrong");
      list.appendChild(button);
    }

    const link = el("a", current.source.title);
    link.href = current.source.url;
    link.target = "_blank";
    link.rel = "noopener";
    const source = el("p", "출처: ", "source");
    source.appendChild(link);

    const isLast = state.index >= state.round.length - 1;
    const next = el("button", isLast ? "결과 보기" : "다음", "next");
    next.addEventListener("click", () => {
      if (nextQuestion(state)) renderQuestion();
      else renderResult();
    });

    const verdictNodes = [];
    if (chosen === null) verdictNodes.push(el("p", "시간 초과", "verdict"));
    show(
      el("p", formatProgress(state.index, state.round.length), "progress"),
      el("h2", current.question),
      list,
      ...verdictNodes,
      el("p", result.correct ? "정답입니다." : "오답입니다.", "verdict"),
      el("p", current.explanation, "explanation"),
      source,
      next
    );
  }

  function renderResult() {
    stopTimer();
    const isPractice = state.mode === "practice";
    const total = state.round.length;
    const scoreText = state.isRetry
      ? formatRetryScore(state.score, total)
      : formatScore(state.score, total);
    const home = el("button", "처음으로", "next");
    home.addEventListener("click", renderStart);

    const nodes = [el("h1", "결과"), el("p", scoreText, "score")];
    if (isPractice) nodes.push(el("p", "순위표에 기록되지 않음", "notice"));
    // 연습 판에서 틀린 문제가 있으면 다시 풀기 버튼을 보여 준다.
    if (isPractice && state.wrongIds.length > 0) {
      const retry = el("button", "틀린 문제 다시 풀기", "next");
      retry.addEventListener("click", () => {
        const wrong = QUESTIONS.filter((q) => state.wrongIds.includes(q.id));
        state = createState("practice", state.category, wrong, { isRetry: true });
        renderQuestion();
      });
      nodes.push(retry);
    }
    nodes.push(home);
    show(...nodes);
  }

  renderStart();
}
