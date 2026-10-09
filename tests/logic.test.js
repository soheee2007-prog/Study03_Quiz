// 생성 일시: 2026-10-09 15:44 KST
// 핵심 계산 함수(섞기, 판 만들기, 채점) 테스트.
const test = require("node:test");
const assert = require("node:assert");
const vm = require("vm");
const { loadApp, plain } = require("./load");

const ctx = loadApp();
const QUESTIONS = plain(vm.runInContext("QUESTIONS", ctx));
const HISTORY = QUESTIONS.filter((q) => q.category === "한국사");

// 고정 수열 난수: 값을 차례로 돌려주고 끝나면 처음부터 반복한다.
function seq(values) {
  let i = 0;
  return () => values[i++ % values.length];
}

// 한국사 10문항으로 연습 모드 상태를 만든다.
function newState(random = seq([0.3, 0.7, 0.1, 0.9])) {
  return ctx.createState("practice", "한국사", HISTORY, { random });
}

test("shuffle: 같은 원소 집합이고 원본은 바뀌지 않는다", () => {
  const original = [1, 2, 3, 4, 5];
  const result = ctx.shuffle(original, seq([0.1, 0.9, 0.5]));
  assert.deepStrictEqual(plain(original), [1, 2, 3, 4, 5]);
  assert.deepStrictEqual(plain(result).sort(), [1, 2, 3, 4, 5]);
});

test("buildRound: 10문항, 보기 집합 유지, correctChoice는 원래 정답", () => {
  const round = ctx.buildRound(HISTORY, seq([0.2, 0.8, 0.4]));
  assert.strictEqual(round.length, 10);
  for (const rq of round) {
    const orig = HISTORY.find((q) => q.id === rq.id);
    assert.deepStrictEqual(plain(rq.choices).sort(), [...orig.choices].sort());
    assert.strictEqual(rq.correctChoice, orig.choices[orig.answer]);
  }
});

test("buildRound: 난수가 다르면 문항 순서가 다르다", () => {
  const a = ctx.buildRound(HISTORY, seq([0.0, 0.0, 0.0])).map((q) => q.id);
  const b = ctx.buildRound(HISTORY, seq([0.99, 0.99, 0.99])).map((q) => q.id);
  assert.notDeepStrictEqual(a, b);
});

test("scoreFor: 정답 1점, 힌트 쓴 정답 0.5점, 오답 0점", () => {
  assert.strictEqual(ctx.scoreFor(true, false), 1);
  assert.strictEqual(ctx.scoreFor(true, true), 0.5);
  assert.strictEqual(ctx.scoreFor(false, true), 0);
});

test("createState: 초기 상태", () => {
  const s = newState();
  assert.strictEqual(s.mode, "practice");
  assert.strictEqual(s.category, "한국사");
  assert.strictEqual(s.round.length, 10);
  assert.strictEqual(s.index, 0);
  assert.strictEqual(s.score, 0);
  assert.strictEqual(s.answered, false);
  assert.strictEqual(s.usedHint, false);
  assert.strictEqual(s.isRetry, false);
  assert.deepStrictEqual(plain(s.hiddenChoices), []);
  assert.deepStrictEqual(plain(s.wrongIds), []);
});

test("answerCurrent: 정답이면 1점이고 wrongIds는 비어 있다", () => {
  const s = newState();
  const r = ctx.answerCurrent(s, s.round[0].correctChoice);
  assert.deepStrictEqual(plain(r), { correct: true, gained: 1 });
  assert.strictEqual(s.score, 1);
  assert.strictEqual(s.answered, true);
  assert.deepStrictEqual(plain(s.wrongIds), []);
});

test("answerCurrent: 오답과 시간 초과(null)는 0점이고 wrongIds에 들어간다", () => {
  const s = newState();
  const wrong = s.round[0].choices.find((c) => c !== s.round[0].correctChoice);
  const r = ctx.answerCurrent(s, wrong);
  assert.deepStrictEqual(plain(r), { correct: false, gained: 0 });
  assert.deepStrictEqual(plain(s.wrongIds), [s.round[0].id]);

  const t = newState();
  const r2 = ctx.answerCurrent(t, null);
  assert.deepStrictEqual(plain(r2), { correct: false, gained: 0 });
  assert.strictEqual(t.score, 0);
  assert.deepStrictEqual(plain(t.wrongIds), [t.round[0].id]);
});

test("answerCurrent: 힌트를 쓴 정답은 0.5점", () => {
  const s = newState();
  s.usedHint = true;
  const r = ctx.answerCurrent(s, s.round[0].correctChoice);
  assert.deepStrictEqual(plain(r), { correct: true, gained: 0.5 });
  assert.strictEqual(s.score, 0.5);
});

test("answerCurrent: 같은 문항에 두 번 답하면 두 번째는 null이고 상태가 그대로다", () => {
  const s = newState();
  ctx.answerCurrent(s, s.round[0].correctChoice);
  assert.strictEqual(ctx.answerCurrent(s, s.round[0].correctChoice), null);
  assert.strictEqual(s.score, 1);

  const w = newState();
  ctx.answerCurrent(w, null);
  assert.strictEqual(ctx.answerCurrent(w, null), null);
  assert.deepStrictEqual(plain(w.wrongIds), [w.round[0].id]);
});

test("nextQuestion: 마지막 문항에서만 false, 넘어가면 문항 상태를 초기화한다", () => {
  const s = newState();
  for (let i = 0; i < 9; i++) {
    ctx.answerCurrent(s, null);
    s.usedHint = true;
    s.hiddenChoices = ["x"];
    assert.strictEqual(ctx.nextQuestion(s), true);
    assert.strictEqual(s.index, i + 1);
    assert.strictEqual(s.answered, false);
    assert.strictEqual(s.usedHint, false);
    assert.deepStrictEqual(plain(s.hiddenChoices), []);
  }
  ctx.answerCurrent(s, null);
  assert.strictEqual(ctx.nextQuestion(s), false);
  assert.strictEqual(s.index, 9);
});

test("표시 형식 함수", () => {
  assert.strictEqual(ctx.formatScore(7.5, 10), "7.5 / 10");
  assert.strictEqual(ctx.formatScore(7, 10), "7 / 10");
  assert.strictEqual(ctx.formatRetryScore(2, 3), "3문제 중 2개 맞힘");
  assert.strictEqual(ctx.formatProgress(2, 10), "3 / 10");
  assert.strictEqual(ctx.formatProgress(0, 10), "1 / 10");
});

test("상수", () => {
  assert.deepStrictEqual(plain(vm.runInContext("CATEGORIES", ctx)), ["한국사", "세계지리", "과학", "예술과 문화"]);
  assert.deepStrictEqual(plain(vm.runInContext("MODE_LABELS", ctx)), { practice: "연습", speed: "스피드", hint: "힌트" });
  assert.strictEqual(vm.runInContext("QUESTIONS_PER_ROUND", ctx), 10);
  assert.strictEqual(vm.runInContext("SPEED_SECONDS", ctx), 15);
});

test("틀린 문제 다시 풀기: 틀린 문항만 모아 새 판을 만들고, 또 틀린 것만 다시 남는다", () => {
  const s = newState();
  // 앞의 3문항은 틀리고 나머지는 맞힌다.
  for (let i = 0; i < 10; i++) {
    const rq = s.round[i];
    const wrong = rq.choices.find((c) => c !== rq.correctChoice);
    ctx.answerCurrent(s, i < 3 ? wrong : rq.correctChoice);
    ctx.nextQuestion(s);
  }
  assert.strictEqual(s.wrongIds.length, 3);

  const retryQuestions = HISTORY.filter((q) => s.wrongIds.includes(q.id));
  const retry = ctx.createState("practice", s.category, retryQuestions, { isRetry: true });
  assert.strictEqual(retry.isRetry, true);
  assert.deepStrictEqual(plain(retry.round.map((q) => q.id)).sort(), [...s.wrongIds].sort());
  assert.deepStrictEqual(plain(retry.wrongIds), []);

  // 다시 풀기에서 1개만 또 틀린다.
  for (let i = 0; i < 3; i++) {
    const rq = retry.round[i];
    const wrong = rq.choices.find((c) => c !== rq.correctChoice);
    ctx.answerCurrent(retry, i === 0 ? wrong : rq.correctChoice);
    ctx.nextQuestion(retry);
  }
  assert.deepStrictEqual(plain(retry.wrongIds), [retry.round[0].id]);
  assert.strictEqual(retry.score, 2);
});

test("useHint: 난수 수열 20가지에서 항상 서로 다른 오답 2개, 정답은 없다", () => {
  for (let k = 0; k < 20; k++) {
    const s = newState();
    const rq = s.round[0];
    const hidden = plain(ctx.useHint(s, seq([k / 20, (k * 7 % 20) / 20, ((k * 3 + 1) % 20) / 20, 0.99])));
    assert.strictEqual(hidden.length, 2);
    assert.notStrictEqual(hidden[0], hidden[1]);
    assert.ok(!hidden.includes(rq.correctChoice));
    assert.ok(hidden.every((c) => rq.choices.includes(c)));
    assert.strictEqual(s.usedHint, true);
    assert.deepStrictEqual(plain(s.hiddenChoices), hidden);
  }
});

test("useHint: 두 번째는 빈 배열이고 상태가 그대로다", () => {
  const s = newState();
  const first = plain(ctx.useHint(s, seq([0.2, 0.8])));
  assert.deepStrictEqual(plain(ctx.useHint(s, seq([0.9, 0.1]))), []);
  assert.deepStrictEqual(plain(s.hiddenChoices), first);
  assert.strictEqual(s.usedHint, true);
});

test("useHint: 답한 뒤에는 빈 배열이고 상태를 바꾸지 않는다", () => {
  const s = newState();
  ctx.answerCurrent(s, null);
  assert.deepStrictEqual(plain(ctx.useHint(s)), []);
  assert.strictEqual(s.usedHint, false);
  assert.deepStrictEqual(plain(s.hiddenChoices), []);
});

test("힌트를 쓰고 맞히면 0.5점, 쓰지 않고 맞히면 1점", () => {
  const a = newState();
  ctx.useHint(a);
  assert.strictEqual(ctx.answerCurrent(a, a.round[0].correctChoice).gained, 0.5);
  assert.strictEqual(a.score, 0.5);
  const b = newState();
  assert.strictEqual(ctx.answerCurrent(b, b.round[0].correctChoice).gained, 1);
});

test("answerCurrent: 결과 화면 목록용으로 문항별 결과를 차례로 남긴다", () => {
  const s = newState();
  const first = s.round[0];
  ctx.answerCurrent(s, first.correctChoice);
  ctx.nextQuestion(s);
  const second = s.round[1];
  ctx.useHint(s, seq([0.2, 0.6]));
  const wrong = second.choices.find((c) => c !== second.correctChoice && !s.hiddenChoices.includes(c));
  ctx.answerCurrent(s, wrong);
  ctx.nextQuestion(s);
  ctx.answerCurrent(s, null);
  ctx.answerCurrent(s, null); // 두 번째 답은 무시된다
  assert.deepStrictEqual(plain(s.results), [
    { question: first.question, correctChoice: first.correctChoice, correct: true, usedHint: false, timedOut: false },
    { question: second.question, correctChoice: second.correctChoice, correct: false, usedHint: true, timedOut: false },
    { question: s.round[2].question, correctChoice: s.round[2].correctChoice, correct: false, usedHint: false, timedOut: true },
  ]);
});

test("createState: 문항별 결과 목록은 빈 배열로 시작한다", () => {
  assert.deepStrictEqual(plain(newState().results), []);
});
