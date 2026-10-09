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
    // 5초 이하에서는 빨간색으로 보여 준다.
    const paint = () => {
      label.textContent = `남은 시간 ${secondsLeft}초`;
      label.classList.toggle("urgent", secondsLeft <= 5);
    };
    paint();
    timerId = setInterval(() => {
      secondsLeft -= 1;
      paint();
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
    const list = el("div", undefined, "choices");
    for (const category of CATEGORIES) {
      const button = el("button", category);
      button.addEventListener("click", () => renderModeSelect(category));
      list.appendChild(button);
    }
    show(el("h1", "상식 퀴즈"), el("p", "카테고리를 고르세요.", "notice"), list);
  }

  // 모드마다 규칙 한 줄. 연습 모드에만 순위표 안내를 붙인다.
  const MODE_RULES = {
    practice: "시간 제한과 힌트 없음, 맞히면 1점",
    speed: `문항마다 ${SPEED_SECONDS}초, 시간이 지나면 오답`,
    hint: "문항마다 힌트 1번, 힌트를 쓰고 맞히면 0.5점",
  };

  function renderModeSelect(category) {
    const list = el("div", undefined, "choices");
    for (const mode of Object.keys(MODE_LABELS)) {
      const button = el("button", undefined, "mode-card");
      button.append(el("strong", MODE_LABELS[mode]), el("span", MODE_RULES[mode]));
      if (mode === "practice") button.append(el("span", "순위표에 기록되지 않음", "badge"));
      button.addEventListener("click", () => {
        const questions = QUESTIONS.filter((q) => q.category === category);
        state = createState(mode, category, questions);
        renderQuestion();
      });
      list.appendChild(button);
    }
    const back = el("button", "뒤로", "back");
    back.addEventListener("click", renderStart);
    show(el("h2", `${category} · 모드를 고르세요`), list, back);
  }

  // 문제 화면 위쪽 줄: 카테고리와 모드, 진행, 점수(스피드 모드는 남은 시간까지).
  function statusBar(timer) {
    const bar = el("div", undefined, "status");
    bar.append(
      el("span", `${state.category} · ${MODE_LABELS[state.mode]}`),
      el("span", formatProgress(state.index, state.round.length)),
      el("span", `점수 ${state.score}`)
    );
    if (timer) bar.append(timer);
    return bar;
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
    // 스피드 모드에서만 남은 시간을 위쪽 줄에 보여 준다.
    const timer = state.mode === "speed" ? el("span", undefined, "timer") : null;
    const nodes = [statusBar(timer), el("h2", current.question), list];
    // 힌트 모드에서만 힌트 버튼을 보여 준다.
    if (state.mode === "hint") {
      const hint = el("button", "힌트 (오답 2개 지우기)", "hint");
      hint.addEventListener("click", () => {
        for (const choice of useHint(state)) {
          const button = choiceButtons.get(choice);
          button.disabled = true;
          button.classList.add("hinted");
        }
        hint.textContent = "힌트 사용함";
        hint.disabled = true;
      });
      nodes.push(hint);
    }
    show(...nodes);
    if (timer) startTimer(timer);
    else stopTimer();
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
    // 스피드 모드는 멈춘 남은 시간을 그대로 보여 준다.
    let stopped = null;
    if (state.mode === "speed") {
      stopped = el("span", `남은 시간 ${secondsLeft}초`, "timer");
      stopped.classList.toggle("urgent", secondsLeft <= 5);
    }
    show(
      statusBar(stopped),
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
