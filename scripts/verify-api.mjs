const base = process.env.KOTOBA_BASE ?? "http://127.0.0.1:3100";
async function post(path, body) {
  const res = await fetch(base + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => null);
  return { path, status: res.status, json };
}
const results = [];
results.push(await post("/api/progress/session", { xp: 25, minutes: 10, reviews: 5, source: "functional-test" }));
results.push(await post("/api/progress/review", { itemId: "v-ohayou", kind: "vocab", rating: 3, correct: true, mode: "vocabulary" }));
results.push(await post("/api/progress/review", { itemId: "日", kind: "kanji", rating: 1, correct: false, mode: "kanji-quiz" }));
results.push(await post("/api/progress/kana", { char: "あ", script: "hiragana", correct: true }));
results.push(await post("/api/progress/lesson", { lessonId: "g-desu", kind: "grammar", score: 100, xp: 30 }));
results.push(await post("/api/progress/exam", { level: "N5", score: 80, total: 100, passed: true, sections: [{ id: "moji-goi", label: "Moji & Goi", correct: 8, total: 10, score: 80, points: 10 }, { id: "bunpou-dokkai", label: "Bunpou & Dokkai", correct: 6, total: 8, score: 75, points: 8 }, { id: "choukai", label: "Choukai", correct: 4, total: 6, score: 67, points: 6 }], correct: 18, answered: 24, totalQuestions: 24, durationSec: 1200, startedAt: new Date(Date.now() - 1200000).toISOString(), review: [{ questionId: "g-desu-q", prompt: "Lengkapi: 私は学生___。", selectedIndex: 0, answerIndex: 0, correct: true, explanation: "です menandai predikat nomina." }] }));
for (const r of results) {
  console.log(r.path, r.status, r.json ? Object.keys(r.json).join(",") : "no-json", r.json && r.json.error ? r.json.error : "");
}
const snapRes = await fetch(base + "/api/progress");
const snap = await snapRes.json();
console.log("snapshot status", snapRes.status);
console.log("profile", snap.profile.name, "xp", snap.profile.xp, "streak", snap.profile.streak);
console.log("cards", snap.cards.length, snap.cards.map(c => c.itemId + ":" + c.kind + ":ease=" + c.ease + ":due=" + c.dueAt).join(" | "));
console.log("kana", snap.kana.length, "lessons", snap.lessons.length, "reviews", snap.reviews.length, "exams", snap.exams.length);
console.log("stats", JSON.stringify(snap.stats));
console.log("activity", JSON.stringify(snap.activity.slice(0, 3)));
