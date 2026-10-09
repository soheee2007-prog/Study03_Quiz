// 생성 일시: 2026-10-09 15:34 KST
const test = require("node:test");
const assert = require("node:assert");
const vm = require("vm");
const { loadApp, plain } = require("./load");

const CATEGORIES = ["한국사", "세계지리", "과학", "예술과 문화"];
const PREFIX = { "한국사": "kh", "세계지리": "wg", "과학": "sc", "예술과 문화": "ac" };

const QUESTIONS = plain(vm.runInContext("QUESTIONS", loadApp()));

test("전체 40문항, 카테고리마다 10문항", () => {
  assert.strictEqual(QUESTIONS.length, 40);
  for (const c of CATEGORIES) {
    assert.strictEqual(QUESTIONS.filter((q) => q.category === c).length, 10, c);
  }
  for (const q of QUESTIONS) assert.ok(CATEGORIES.includes(q.category), q.id);
});

test("id는 겹치지 않고 형식과 접두어가 맞다", () => {
  const ids = QUESTIONS.map((q) => q.id);
  assert.strictEqual(new Set(ids).size, ids.length);
  for (const q of QUESTIONS) {
    assert.match(q.id, /^(kh|wg|sc|ac)-\d{2}$/);
    assert.strictEqual(q.id.slice(0, 2), PREFIX[q.category], q.id);
  }
});

test("보기는 4개이고 서로 다르며 비어 있지 않다", () => {
  for (const q of QUESTIONS) {
    assert.strictEqual(q.choices.length, 4, q.id);
    assert.strictEqual(new Set(q.choices).size, 4, q.id);
    for (const c of q.choices) {
      assert.strictEqual(typeof c, "string", q.id);
      assert.ok(c.trim() !== "", q.id);
    }
  }
});

test("answer는 0~3 정수", () => {
  for (const q of QUESTIONS) {
    assert.ok(Number.isInteger(q.answer) && q.answer >= 0 && q.answer <= 3, q.id);
  }
});

test("문제, 해설, 출처 정보가 채워져 있다", () => {
  for (const q of QUESTIONS) {
    assert.ok(q.question && q.question.trim() !== "", q.id);
    assert.ok(q.explanation && q.explanation.trim() !== "", q.id);
    assert.ok(q.source && q.source.title && q.source.title.trim() !== "", q.id);
    assert.ok(q.source.url.startsWith("https://"), q.id);
  }
});
