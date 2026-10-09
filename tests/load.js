// 생성 일시: 2026-10-09 15:34 KST
// 테스트용 불러오기 도우미. 앱 파일을 vm 컨텍스트에서 실행한다.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");

// questions.js와(있으면) script.js를 차례로 실행한 컨텍스트를 돌려준다.
function loadApp() {
  const ctx = vm.createContext({});
  for (const name of ["questions.js", "script.js"]) {
    const file = path.join(ROOT, name);
    if (!fs.existsSync(file)) continue;
    vm.runInContext(fs.readFileSync(file, "utf8"), ctx, { filename: file });
  }
  return ctx;
}

// 다른 실행 영역의 값을 비교할 수 있게 JSON 왕복으로 복사한다.
function plain(value) {
  return JSON.parse(JSON.stringify(value));
}

module.exports = { loadApp, plain };
