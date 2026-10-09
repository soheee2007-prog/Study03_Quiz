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
}
