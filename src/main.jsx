import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import bank from "./data/questions.json";
import { QUIZ_SIZE, PASS_PERCENT, selectQuestions, scoreQuiz } from "./quiz.mjs";
import "./styles.css";

const minCorrect = Math.ceil((QUIZ_SIZE * PASS_PERCENT) / 100);
const letters = ["А", "Б", "В"];
const sections = bank.sections;
const sectionFor = (id) => sections.find((s) => s.id === id);
const asset = (path) => `${import.meta.env.BASE_URL}${path}`;

function Icon({ name = "compass", size = 22, ...props }) {
  const paths = {
    compass: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m16 8-2.5 5.5L8 16l2.5-5.5Z" />
      </>
    ),
    book: (
      <>
        <path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z" />
      </>
    ),
    arrow: (
      <>
        <path d="M4 12h16m-6-6 6 6-6 6" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    waves: (
      <>
        <path d="M2 7c3-4 7 4 10 0s7 4 10 0M2 13c3-4 7 4 10 0s7 4 10 0M2 19c3-4 7 4 10 0s7 4 10 0" />
      </>
    ),
    engine: (
      <>
        <path d="M5 8h13l3 4v6H5L2 14V9h3M9 8V4h6M8 12h6v3h-3" />
      </>
    ),
    anchor: (
      <>
        <circle cx="12" cy="4" r="2" />
        <path d="M12 6v15M7 10h10M3 14c0 9 18 9 18 0M3 14l-2 3m20-3 2 3" />
      </>
    ),
    radio: (
      <>
        <rect x="5" y="7" width="14" height="14" rx="2" />
        <path d="M8 7V2m1 9h6m-6 4h1m4 0h1m-6 3h1m4 0h1" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 6 6" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.compass}
    </svg>
  );
}

const sectionIcons = ["compass", "waves", "engine", "anchor", "radio"];
function Brand() {
  return (
    <a className="brand" href="#/">
      <span className="brand-icon">
        <Icon name="anchor" size={26} />
      </span>
      <span>
        Испит за управувач
        <br />
        <strong>на чамец</strong>
      </span>
    </a>
  );
}
function Download({ className = "button secondary" }) {
  return (
    <a className={className} href={asset(bank.source.download)} download>
      <Icon name="download" size={18} />
      Преземи го документот
    </a>
  );
}

function LakeIllustration() {
  return (
    <svg
      className="lake-art"
      viewBox="0 0 640 510"
      role="img"
      aria-label="Илустрација на едрилица на Охридското Езеро"
    >
      <defs>
        <linearGradient id="water" x2="0" y2="1">
          <stop stopColor="#a2d2d0" />
          <stop offset="1" stopColor="#d4e9e4" />
        </linearGradient>
      </defs>
      <rect width="640" height="510" fill="#e6eeea" />
      <circle cx="482" cy="93" r="34" fill="#edc89b" />
      <path
        d="M0 220 93 133l84 78 101-129 155 146 84-100 123 91v115H0Z"
        fill="#b4ccca"
      />
      <path
        d="m0 239 125-66 145 87 129-101 128 98 113-64v122H0Z"
        fill="#7ca7aa"
      />
      <path d="M0 282q155-34 320 1t320-8v235H0Z" fill="url(#water)" />
      <g fill="none" stroke="#f4faf5" strokeWidth="2" opacity=".6">
        <path d="M31 333h153m228 18h131M69 406h187m116 38h169M238 473h80M432 307h119" />
      </g>
      <g transform="translate(226 104)">
        <path d="M94 14v259" stroke="#233f4e" strokeWidth="5" />
        <path d="m85 28-116 207H85Z" fill="#fffdf4" />
        <path d="m105 76 82 155h-82Z" fill="#f4f1e4" />
        <path d="M-46 254h248l-32 33H-14Z" fill="#173e50" />
        <path d="M-42 255h240" stroke="#f9fcf6" strokeWidth="7" />
        <path d="m94 15 25 8-25 9Z" fill="#cb7652" />
      </g>
      <path
        d="M192 413q130 13 247-3"
        fill="none"
        stroke="#75aeb0"
        strokeWidth="3"
      />
      <g transform="translate(552 417)" stroke="#315b68" fill="none">
        <circle r="30" />
        <path d="M0-22v44M-22 0h44m-7-15L7 7-15 15-7-7Z" />
        <text
          y="-39"
          textAnchor="middle"
          fontSize="10"
          fill="#315b68"
          stroke="none"
        >
          С
        </text>
      </g>
    </svg>
  );
}

function Home() {
  return (
    <>
      <section className="hero wrap">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> ОХРИД · ПОДГОТОВКА ЗА ПЛОВИДБА
          </p>
          <h1>
            Знаењето е твојот
            <br />
            <em>сигурен курс.</em>
          </h1>
          <p className="intro">
            Подготви се за испитот за управувач на чамец. Учи по области,
            провери го знаењето и направи го следниот чекор со сигурност.
          </p>
          <div className="actions">
            <a className="button primary" href="#/quiz">
              Започни пробен испит <Icon name="arrow" size={18} />
            </a>
            <a className="text-link" href="#/study">
              Разгледај ги прашањата <span>↗</span>
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <strong>315</strong>
              <span>прашања за учење</span>
            </div>
            <div>
              <strong>5</strong>
              <span>тематски области</span>
            </div>
            <div>
              <strong>{QUIZ_SIZE}</strong>
              <span>прашања по квиз</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <LakeIllustration />
          <div className="art-caption">
            <span>41°07′ С · 20°48′ И</span>
            <span>ОХРИДСКО ЕЗЕРО</span>
          </div>
        </div>
      </section>
      <section className="path-section">
        <div className="wrap">
          <div className="section-heading">
            <div>
              <p className="eyebrow">ОД ПРВОТО ПРАШАЊЕ ДО ПОДГОТВЕНОСТ</p>
              <h2>Избери го својот начин на учење</h2>
            </div>
            <p>
              Со твое темпо.
              <br />
              Без временско ограничување.
            </p>
          </div>
          <div className="learning-paths">
            <a className="path-card" href="#/study">
              <span className="step">01 / УЧИ</span>
              <Icon name="book" size={30} />
              <h3>Сите прашања, на едно место.</h3>
              <p>
                Прегледај ги петте области, сликите и точните одговори од
                документот.
              </p>
              <span className="card-link">
                Отвори ги материјалите <Icon name="arrow" size={18} />
              </span>
            </a>
            <a className="path-card" href="#/quiz?mode=practice">
              <span className="step">02 / ВЕЖБАЈ</span>
              <Icon name="compass" size={30} />
              <h3>Научи од секој одговор.</h3>
              <p>
                Одговори на прашање и веднаш провери го точниот одговор пред да
                продолжиш.
              </p>
              <span className="card-link">
                Започни со вежбање <Icon name="arrow" size={18} />
              </span>
            </a>
            <a className="path-card dark" href="#/quiz">
              <span className="step">03 / ПРОВЕРИ СЕ</span>
              <Icon name="waves" size={30} />
              <h3>Подготвен за пробен испит?</h3>
              <p>
                {QUIZ_SIZE} случајни прашања. Резултат на крај. За положување се потребни{" "}
                {minCorrect} точни одговори.
              </p>
              <span className="card-link">
                Направи пробен испит <Icon name="arrow" size={18} />
              </span>
            </a>
          </div>
        </div>
      </section>
      <section className="wrap topics-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ШТО ЌЕ НАУЧИШ</p>
            <h2>Пет области. Една цел.</h2>
          </div>
          <Download />
        </div>
        <div className="topic-list">
          {sections.map((s, i) => (
            <a key={s.id} href={`#/study?section=${s.id}`}>
              <span className="topic-number">0{i + 1}</span>
              <Icon name={sectionIcons[i]} />
              <strong>{s.title}</strong>
              <span>{s.count} прашања</span>
              <Icon name="arrow" size={19} />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function QuestionImages({ paths, option = false }) {
  return (
    paths.length > 0 && (
      <div className={option ? "option-images" : "question-images"}>
        {paths.map((path, i) => (
          <a
            key={`${path}-${i}`}
            href={asset(path)}
            target="_blank"
            rel="noreferrer"
            aria-label="Отвори ја сликата во целосна големина"
          >
            <img
              src={asset(path)}
              width={bank.media[path]?.width}
              height={bank.media[path]?.height}
              loading="lazy"
              alt={
                option
                  ? "Слика за оваа опција"
                  : `Илустрација кон прашањето${paths.length > 1 ? ` ${i + 1}` : ""}`
              }
            />
          </a>
        ))}
      </div>
    )
  );
}

function AnswerReview({ question, selected, study = false }) {
  return (
    <div className="answer-review">
      {question.options.map((o, i) => (
        <div
          key={o.id}
          className={`review-option ${o.correct ? "correct" : selected === o.id ? "incorrect" : ""}`}
        >
          <span className="option-letter">{letters[i]}</span>
          <div className="option-body">
            {o.text && <span>{o.text}</span>}
            <QuestionImages paths={o.images} option />
            {o.correct && (
              <span className="answer-tag">
                <Icon name="check" size={14} />
                {study
                  ? "Точен одговор"
                  : selected === o.id
                    ? "Твојот одговор · Точно"
                    : "Точен одговор"}
              </span>
            )}
            {!o.correct && selected === o.id && (
              <span className="answer-tag">
                <Icon name="close" size={14} />
                Твојот одговор
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Study({ route }) {
  const [search, setSearch] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    const section = new URLSearchParams(route.split("?")[1]).get("section");
    if (section)
      requestAnimationFrame(() =>
        document.getElementById(section)?.scrollIntoView(),
      );
  }, [route]);
  const query = search.trim().toLocaleLowerCase("mk");
  const filtered = bank.questions.filter((q) =>
    `${q.text} ${q.options.map((o) => o.text).join(" ")}`
      .toLocaleLowerCase("mk")
      .includes(query),
  );
  function jump(event, section) {
    event.preventDefault();
    setSearch("");
    requestAnimationFrame(() =>
      document.getElementById(section)?.scrollIntoView({ behavior: "instant" }),
    );
  }
  return (
    <div className="wrap page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">МАТЕРИЈАЛИ ЗА ПОДГОТОВКА</p>
          <h1>Прашања и одговори</h1>
          <p>Учи по области. Точните одговори се означени со зелена боја.</p>
        </div>
        <Download />
      </div>
      <div className="study-layout">
        <aside className="study-sidebar">
          <p className="eyebrow">СОДРЖИНА</p>
          <nav aria-label="Области">
            {sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} onClick={(e) => jump(e, s.id)}>
                <span>0{i + 1}</span>
                <strong>{s.title}</strong>
                <small>{s.count}</small>
              </a>
            ))}
          </nav>
          <div className="sidebar-note">
            <Icon name="book" />
            <p>
              Содржината и точните одговори се преземени од приложениот
              документ.
            </p>
            <a className="text-link" href="#/quiz">
              Провери го знаењето →
            </a>
          </div>
        </aside>
        <div className="study-content">
          <div className="search-box">
            <Icon name="search" />
            <input
              ref={inputRef}
              aria-label="Пребарај прашања и одговори"
              placeholder="Пребарај прашање или поим…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="icon-button"
                aria-label="Исчисти пребарување"
                onClick={() => {
                  setSearch("");
                  inputRef.current?.focus();
                }}
              >
                <Icon name="close" size={18} />
              </button>
            )}
          </div>
          <p className="search-count" aria-live="polite">
            {query
              ? `${filtered.length} ${filtered.length === 1 ? "пронајдено прашање" : "пронајдени прашања"}`
              : "315 прашања · 5 области"}
          </p>
          {filtered.length === 0 && (
            <div className="empty-state">
              <h2>Нема пронајдени прашања.</h2>
              <p>Пробај со друг збор или пократок поим.</p>
              <button
                className="button secondary"
                onClick={() => setSearch("")}
              >
                Прикажи ги сите прашања
              </button>
            </div>
          )}
          {sections.map((s, i) => {
            const questions = filtered.filter((q) => q.sectionId === s.id);
            return (
              questions.length > 0 && (
                <section className="study-section" id={s.id} key={s.id}>
                  <div className="study-section-title">
                    <span className="section-symbol">
                      <Icon name={sectionIcons[i]} />
                    </span>
                    <div>
                      <p className="eyebrow">
                        ОБЛАСТ 0{i + 1} · {questions.length}{" "}
                        {questions.length === 1 ? "ПРАШАЊЕ" : "ПРАШАЊА"}
                      </p>
                      <h2>{s.title}</h2>
                    </div>
                  </div>
                  {questions.map((q) => (
                    <article className="study-question" key={q.id}>
                      <p className="question-label">ПРАШАЊЕ {q.number}</p>
                      <h3>{q.text}</h3>
                      <QuestionImages paths={q.images} />
                      <AnswerReview question={q} study />
                    </article>
                  ))}
                </section>
              )
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QuizSetup({ mode, setMode, onStart }) {
  return (
    <div className="quiz-setup">
      <div className="setup-compass">
        <Icon size={42} />
      </div>
      <p className="eyebrow">ТВОЈОТ СЛЕДЕН ЧЕКОР</p>
      <h1>Провери го знаењето.</h1>
      <p className="intro">
        {QUIZ_SIZE} случајно избрани прашања од сите пет области.
        <br />
        Избери како сакаш да учиш денес.
      </p>
      <div className="mode-grid" role="group" aria-label="Режим на квиз">
        {[
          {
            id: "exam",
            title: "Пробен испит",
            icon: "waves",
            description:
              "Одговори на сите прашања. Резултатот и точните одговори ги добиваш на крај.",
          },
          {
            id: "practice",
            title: "Вежбање",
            icon: "book",
            description:
              "Провери го секој одговор веднаш и научи пред да преминеш на следното прашање.",
          },
        ].map((item) => (
          <button
            key={item.id}
            className={`mode-card ${mode === item.id ? "selected" : ""}`}
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
          >
            <span className="mode-card-top">
              <Icon name={item.icon} />
              <span className="radio-dot" />
            </span>
            <strong>{item.title}</strong>
            <span>{item.description}</span>
          </button>
        ))}
      </div>
      <div className="quiz-facts">
        <span>
          <Icon name="check" size={17} />
          Без тајмер
        </span>
        <span>{QUIZ_SIZE} прашања</span>
        <span>Праг за положување: {PASS_PERCENT}%</span>
      </div>
      <button className="button primary start-button" onClick={onStart}>
        Започни {mode === "exam" ? "пробен испит" : "со вежбање"}
        <Icon name="arrow" size={19} />
      </button>
      <p className="setup-note">Прашањата не се повторуваат во истиот квиз.</p>
    </div>
  );
}

function Quiz({ route, session, setSession }) {
  const initialMode =
    new URLSearchParams(route.split("?")[1]).get("mode") === "practice"
      ? "practice"
      : "exam";
  const [mode, setMode] = useState(initialMode);
  const questionRef = useRef(null);
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);
  function start() {
    setSession({
      mode,
      questions: selectQuestions(bank.questions),
      answers: {},
      checked: {},
      index: 0,
      finished: false,
    });
    window.scrollTo(0, 0);
  }
  function move(index) {
    setSession((s) => ({ ...s, index }));
    requestAnimationFrame(() => {
      questionRef.current?.focus();
      questionRef.current?.scrollIntoView({ block: "start" });
    });
  }
  if (!session)
    return (
      <div className="wrap page">
        <QuizSetup mode={mode} setMode={setMode} onStart={start} />
      </div>
    );
  const { questions, answers, checked, index, finished } = session;
  const total = questions.length;
  const requiredCorrect = Math.ceil((total * PASS_PERCENT) / 100);
  const isPractice = session.mode === "practice";
  const completed = questions.filter((q) =>
    isPractice ? checked[q.id] : answers[q.id],
  ).length;
  if (finished) {
    const score = scoreQuiz(questions, answers);
    return (
      <div className="wrap page result-page">
        <div className={`result-banner ${score.passed ? "passed" : ""}`}>
          <span className="result-icon">
            <Icon name={score.passed ? "check" : "book"} size={32} />
          </span>
          <p className="eyebrow">
            {isPractice ? "ВЕЖБАЊЕТО Е ЗАВРШЕНО" : "ПРОБНИОТ ИСПИТ Е ЗАВРШЕН"}
          </p>
          <h1>
            {score.passed ? "Успешно го положи квизот!" : "Уште малку вежбање."}
          </h1>
          <p>
            {score.passed
              ? "Продолжи да вежбаш за уште поголема сигурност."
              : "Прегледај ги одговорите и повтори ги областите што ти беа потешки."}
          </p>
          <div className="score-display">
            <strong>
              {score.correct}
              <span> / {total}</span>
            </strong>
            <div>
              <b>{score.percentage}% точност</b>
              <span>Праг за положување: {PASS_PERCENT}% ({requiredCorrect}/{total})</span>
            </div>
          </div>
          <div className="actions">
            <button className="button primary" onClick={() => setSession(null)}>
              Нов квиз <Icon name="arrow" size={18} />
            </button>
            <a className="button secondary" href="#/study">
              Назад кон материјалите
            </a>
          </div>
        </div>
        <div className="section-heading">
          <h2>Преглед на твоите одговори</h2>
          <span>
            {score.correct} точни · {total - score.correct} неточни
          </span>
        </div>
        {questions.map((q, i) => (
          <article className="study-question" key={q.id}>
            <p className="question-label">
              ПРАШАЊЕ {i + 1} / {total} · {sectionFor(q.sectionId).title}
            </p>
            <h3>{q.text}</h3>
            <QuestionImages paths={q.images} />
            <AnswerReview question={q} selected={answers[q.id]} />
          </article>
        ))}
      </div>
    );
  }
  const q = questions[index];
  const locked = isPractice && checked[q.id];
  const selected = answers[q.id];
  const correct = q.options.find((o) => o.correct);
  return (
    <div className="wrap page quiz-page">
      <div className="quiz-topline">
        <div>
          <p className="eyebrow">{isPractice ? "ВЕЖБАЊЕ" : "ПРОБЕН ИСПИТ"}</p>
          <h1>
            Прашање {index + 1}
            <span> / {total}</span>
          </h1>
        </div>
        <span className="completion-count">
          {completed} / {total} {isPractice ? "проверени" : "одговорени"}
        </span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Напредок на квизот"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
      >
        <span style={{ width: `${(completed / total) * 100}%` }} />
      </div>
      <div className="quiz-layout">
        <div>
          <article className="quiz-question" ref={questionRef} tabIndex={-1}>
            <p className="question-label">{sectionFor(q.sectionId).title}</p>
            <h2>{q.text}</h2>
            <QuestionImages paths={q.images} />
            <fieldset className="quiz-options">
              <legend className="sr-only">Избери еден одговор</legend>
              {q.options.map((o, i) => (
                <div
                  className={`quiz-option ${selected === o.id ? "chosen" : ""} ${locked && o.correct ? "correct" : ""} ${locked && selected === o.id && !o.correct ? "incorrect" : ""}`}
                  key={o.id}
                >
                  <label>
                    <input
                      type="radio"
                      name={q.id}
                      value={o.id}
                      checked={selected === o.id}
                      disabled={Boolean(locked)}
                      onChange={() =>
                        setSession((s) => ({
                          ...s,
                          answers: { ...s.answers, [q.id]: o.id },
                        }))
                      }
                    />
                    <span className="option-letter">{letters[i]}</span>
                    <span className="option-copy">
                      {o.text || `Слика ${letters[i]}`}
                    </span>
                    {locked && o.correct && <Icon name="check" size={20} />}
                  </label>
                  <QuestionImages paths={o.images} option />
                </div>
              ))}
            </fieldset>
            {locked && (
              <div
                className={`feedback ${selected === correct.id ? "success" : "retry"}`}
                role="status"
              >
                <strong>
                  {selected === correct.id ? "Точно!" : "Неточно."}
                </strong>{" "}
                {selected === correct.id
                  ? "Продолжи на следното прашање."
                  : `Точниот одговор е ${letters[q.options.indexOf(correct)]}${correct.text ? `: ${correct.text}` : "."}`}
              </div>
            )}
            {isPractice && !locked && (
              <button
                className="button primary check-answer"
                disabled={!selected}
                onClick={() =>
                  setSession((s) => ({
                    ...s,
                    checked: { ...s.checked, [q.id]: true },
                  }))
                }
              >
                Провери го одговорот <Icon name="check" size={18} />
              </button>
            )}
          </article>
          <div className="question-navigation">
            <button
              className="button secondary"
              disabled={index === 0}
              onClick={() => move(index - 1)}
            >
              ← Претходно
            </button>
            {index < total - 1 ? (
              <button
                className="button primary"
                onClick={() => move(index + 1)}
              >
                Следно <Icon name="arrow" size={18} />
              </button>
            ) : (
              <button
                className="button primary"
                disabled={completed !== total}
                onClick={() => {
                  setSession((s) => ({ ...s, finished: true }));
                  window.scrollTo(0, 0);
                }}
              >
                Заврши го квизот <Icon name="check" size={18} />
              </button>
            )}
          </div>
          {index === total - 1 && completed < total && (
            <p className="completion-hint" role="status">
              {isPractice ? "Провери" : "Одговори на"} ги сите {total} прашања за да
              го завршиш квизот. Преостануваат {total - completed}.
            </p>
          )}
        </div>
        <aside className="quiz-sidebar">
          <h3>Твојот напредок</h3>
          <div className="question-grid" aria-label="Навигација низ прашањата">
            {questions.map((item, i) => (
              <button
                key={item.id}
                aria-label={`Прашање ${i + 1}${(isPractice ? checked[item.id] : answers[item.id]) ? ", одговорено" : ", неодговорено"}`}
                aria-current={i === index ? "step" : undefined}
                className={`${i === index ? "current" : ""} ${(isPractice ? checked[item.id] : answers[item.id]) ? "answered" : ""}`}
                onClick={() => move(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="grid-legend">
            <span>
              <i />
              Одговорено
            </span>
            <span>
              <i />
              Неодговорено
            </span>
          </div>
          <p>
            {isPractice
              ? "Одговорот се заклучува откако ќе го провериш."
              : "Можеш да ги менуваш одговорите до завршувањето на квизот."}
          </p>
          <div className="sidebar-divider" />
          <p>
            <strong>Без временски притисок.</strong>
            <br />
            За положување се потребни најмалку {requiredCorrect} точни одговори.
          </p>
        </aside>
      </div>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(window.location.hash.slice(1) || "/");
  const [session, setSession] = useState(null);
  useEffect(() => {
    function change() {
      setRoute(window.location.hash.slice(1) || "/");
      window.scrollTo(0, 0);
    }
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  const page = route.split("?")[0];
  useEffect(() => {
    document.title = `${page === "/study" ? "Прашања и одговори · " : page === "/quiz" ? "Квиз · " : ""}Испит за управувач на чамец`;
  }, [page]);
  useEffect(() => {
    function guard(event) {
      event.preventDefault();
      event.returnValue = "";
    }
    if (session && !session.finished) {
      window.addEventListener("beforeunload", guard);
      return () => window.removeEventListener("beforeunload", guard);
    }
  }, [session]);
  return (
    <>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Прескокни до содржината
      </a>
      <header className="site-header">
        <div className="wrap header-inner">
          <Brand />
          <nav className="main-nav" aria-label="Главна навигација">
            <a href="#/" aria-current={page === "/" ? "page" : undefined}>
              Почетна
            </a>
            <a
              href="#/study"
              aria-current={page === "/study" ? "page" : undefined}
            >
              Прашања и одговори
            </a>
            <a
              href="#/quiz"
              aria-current={page === "/quiz" ? "page" : undefined}
            >
              Квиз <Icon name="arrow" size={16} />
            </a>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        {page === "/study" ? (
          <Study route={route} />
        ) : page === "/quiz" ? (
          <Quiz route={route} session={session} setSession={setSession} />
        ) : (
          <Home />
        )}
      </main>
      <footer>
        <div className="wrap footer-inner">
          <Brand />
          <p>
            Материјали за учење и самопроверка.
            <br />
            Прашањата и одговорите се според приложениот документ.
          </p>
          <span>ОХРИД · ПЛОВИ СО ЗНАЕЊЕ</span>
        </div>
      </footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
