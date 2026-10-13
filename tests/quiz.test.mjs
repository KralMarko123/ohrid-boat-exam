import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { selectQuestions, scoreQuiz } from '../src/quiz.mjs';
const bank = JSON.parse(readFileSync(new URL('../src/data/questions.json', import.meta.url)));

test('all 315 source questions have one marked answer and valid media', () => {
  assert.equal(bank.questions.length, 315);
  assert.equal(new Set(bank.questions.map(q => q.id)).size, 315);
  assert.deepEqual(bank.sections.map(s => s.count), [66, 116, 30, 62, 41]);
  let imageOccurrences = 0;
  for (const q of bank.questions) {
    assert.ok(q.text.trim());
    assert.ok([2, 3].includes(q.options.length));
    assert.equal(q.options.filter(o => o.correct).length, 1, q.id);
    assert.ok(bank.sections.some(s => s.id === q.sectionId));
    const images = [...q.images, ...q.options.flatMap(o => o.images)];
    imageOccurrences += images.length;
    for (const image of images) assert.ok(existsSync(new URL(`../public/${image}`, import.meta.url)), image);
    for (const o of q.options) assert.ok(o.text || o.images.length, q.id);
  }
  assert.equal(imageOccurrences, 214);
});

test('image-only answer mapping preserves source order and highlighted labels', () => {
  const motor = bank.questions.filter(q => q.sectionId === 'section-3' && [10, 13].includes(q.number));
  for (const q of motor) {
    assert.equal(q.options.length, 2);
    assert.equal(q.options[1].correct, true);
    assert.equal(q.options[0].images.length, 1);
    assert.equal(q.images.length, 0);
  }
  assert.equal(motor[0].options[0].images[0], motor[1].options[1].images[0]);
});

test('sampling returns 20 unique questions without changing the question bank', () => {
  const original = bank.questions.map(q => q.id);
  for (let i = 0; i < 100; i++) {
    const sample = selectQuestions(bank.questions);
    assert.equal(sample.length, 20);
    assert.equal(new Set(sample.map(q => q.id)).size, 20);
  }
  assert.deepEqual(bank.questions.map(q => q.id), original);
  assert.throws(() => selectQuestions([], 20), RangeError);
});

test('floating image answers follow the left-to-right Word layout, not drawing storage order', () => {
  const cases = [
    ['section-2-q39', ['images/image18.png', 'images/image17.png', 'images/image16.png']],
    ['section-2-q45', ['images/image26.png', 'images/image24.png', 'images/image25.png']],
  ];
  for (const [id, expectedImages] of cases) {
    const question = bank.questions.find(q => q.id === id);
    assert.deepEqual(question.options.map(o => o.images[0]), expectedImages);
    assert.equal(question.options.findIndex(o => o.correct), 0);
  }
});

test('70% boundary is exactly 14 out of 20; unanswered questions do not score', () => {
  const questions = bank.questions.slice(0, 20);
  const answers = {};
  assert.deepEqual(scoreQuiz(questions, answers), { correct: 0, total: 20, percentage: 0, passed: false });
  for (let i = 0; i < 13; i++) answers[questions[i].id] = questions[i].options.find(o => o.correct).id;
  assert.equal(scoreQuiz(questions, answers).passed, false);
  answers[questions[13].id] = questions[13].options.find(o => o.correct).id;
  assert.deepEqual(scoreQuiz(questions, answers), { correct: 14, total: 20, percentage: 70, passed: true });
  for (const q of questions) answers[q.id] = q.options.find(o => o.correct).id;
  assert.equal(scoreQuiz(questions, answers).percentage, 100);
});
