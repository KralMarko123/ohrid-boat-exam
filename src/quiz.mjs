export const QUIZ_SIZE = 30;
export const PASS_PERCENT = 70;

export function selectQuestions(
  questions,
  count = QUIZ_SIZE,
  random = Math.random,
) {
  if (count > questions.length) throw new RangeError("Нема доволно прашања.");
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

export function scoreQuiz(questions, answers) {
  const correct = questions.filter((q) =>
    q.options.some((o) => o.correct && answers[q.id] === o.id),
  ).length;
  const percentage = questions.length
    ? Math.round((correct / questions.length) * 100)
    : 0;
  return {
    correct,
    total: questions.length,
    percentage,
    passed:
      questions.length > 0 &&
      (correct / questions.length) * 100 >= PASS_PERCENT,
  };
}
