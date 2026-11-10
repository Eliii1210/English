const questions = [
  { category: "ANIMALES", prompt: '¿Cómo se dice “perro” en inglés?', options: ["Dog", "Cat", "Bird"], answer: "Dog" },
  { category: "ANIMALES", prompt: '¿Cómo se dice “gato” en inglés?', options: ["Fish", "Cat", "Horse"], answer: "Cat" },
  { category: "COLORES", prompt: '¿Qué color significa “blue”?', options: ["Rojo", "Azul", "Verde"], answer: "Azul" },
  { category: "ANIMALES", prompt: '¿Cómo se dice “pájaro” en inglés?', options: ["Cow", "Bird", "Dog"], answer: "Bird" },
  { category: "COLORES", prompt: '¿Cómo se dice “amarillo” en inglés?', options: ["Yellow", "Black", "White"], answer: "Yellow" },
  { category: "FRASES", prompt: '¿Qué significa “Thank you”?', options: ["Buenos días", "¿Cómo estás?", "Gracias"], answer: "Gracias" },
  { category: "ANIMALES", prompt: '¿Cómo se dice “pez” en inglés?', options: ["Fish", "Horse", "Cat"], answer: "Fish" },
  { category: "FRASES", prompt: '¿Qué significa “Good morning”?', options: ["Buenas noches", "Buenos días", "Hasta luego"], answer: "Buenos días" },
  { category: "COLORES", prompt: '¿Qué color significa “green”?', options: ["Negro", "Amarillo", "Verde"], answer: "Verde" },
  { category: "FRASES", prompt: '¿Cómo dices “¿Cómo estás?” en inglés?', options: ["How are you?", "My name is…", "Thank you"], answer: "How are you?" }
];

const $ = (id) => document.getElementById(id);
let player = "Jugador", score = 0, lives = 3, streak = 0, bestStreak = 0;
let questionIndex = 0, correctAnswers = 0, answered = false, round = [];

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function startGame() {
  player = $("player-name").value.trim() || "Jugador";
  score = 0; lives = 3; streak = 0; bestStreak = 0; questionIndex = 0; correctAnswers = 0;
  round = shuffle(questions);
  $("player-label").textContent = player;
  $("score").textContent = score;
  $("streak").textContent = streak;
  $("lives").textContent = "❤️❤️❤️";
  $("start-screen").classList.add("hidden");
  $("end-screen").classList.add("hidden");
  $("game-screen").classList.remove("hidden");
  showQuestion();
}

function showQuestion() {
  answered = false;
  const q = round[questionIndex];
  $("category").textContent = q.category;
  $("question").textContent = q.prompt;
  $("question-counter").textContent = `Pregunta ${questionIndex + 1} de ${round.length}`;
  const percent = Math.round(((questionIndex + 1) / round.length) * 100);
  $("progress-percent").textContent = `${percent}%`;
  $("progress-bar").style.width = `${percent}%`;
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("next-btn").classList.add("hidden");
  $("answers").innerHTML = "";
  shuffle(q.options).forEach(option => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.textContent = option;
    button.addEventListener("click", () => chooseAnswer(option, button));
    $("answers").appendChild(button);
  });
}

function chooseAnswer(option, button) {
  if (answered) return;
  answered = true;
  const q = round[questionIndex];
  const buttons = [...$("answers").querySelectorAll("button")];
  buttons.forEach(b => {
    b.disabled = true;
    if (b.textContent === q.answer) b.classList.add("correct");
  });

  if (option === q.answer) {
    score += 10;
    streak += 1;
    correctAnswers += 1;
    bestStreak = Math.max(bestStreak, streak);
    $("feedback").textContent = "¡Correcto! +10 puntos 🎉";
    $("feedback").classList.add("good");
  } else {
    button.classList.add("wrong");
    lives -= 1;
    streak = 0;
    $("feedback").textContent = `¡Casi! La respuesta era: ${q.answer}`;
    $("feedback").classList.add("bad");
  }

  $("score").textContent = score;
  $("streak").textContent = streak;
  $("lives").textContent = "❤️".repeat(lives) + "🖤".repeat(3 - lives);
  $("next-btn").textContent = questionIndex === round.length - 1 ? "Ver resultado 🏆" : "Siguiente pregunta →";
  $("next-btn").classList.remove("hidden");
}

function nextQuestion() {
  if (!answered) return;
  if (lives <= 0 || questionIndex >= round.length - 1) {
    finishGame();
    return;
  }
  questionIndex++;
  showQuestion();
}

function finishGame() {
  $("game-screen").classList.add("hidden");
  $("end-screen").classList.remove("hidden");
  const won = lives > 0 && correctAnswers >= 7;
  $("end-icon").textContent = lives <= 0 ? "💪" : (won ? "🏆" : "⭐");
  $("end-title").textContent = lives <= 0 ? "¡Se acabaron las vidas!" : (won ? "¡Misión cumplida!" : "¡Buen intento!");
  $("end-message").textContent = lives <= 0
    ? "No pasa nada: practica un poco y vuelve a intentarlo."
    : `¡Buen trabajo, ${player}! Cada partida te ayuda a aprender.`;
  $("final-score").textContent = score;
  $("correct-count").textContent = `${correctAnswers}/${round.length}`;
  $("best-streak").textContent = bestStreak;
  saveResult();
  renderLeaderboard();
}

function saveResult() {
  let records = [];
  try { records = JSON.parse(localStorage.getItem("englishQuestScores") || "[]"); } catch (_) {}
  records.push({ name: player, score, date: new Date().toLocaleDateString() });
  records.sort((a, b) => b.score - a.score);
  records = records.slice(0, 5);
  localStorage.setItem("englishQuestScores", JSON.stringify(records));
}

function renderLeaderboard() {
  let records = [];
  try { records = JSON.parse(localStorage.getItem("englishQuestScores") || "[]"); } catch (_) {}
  $("leaderboard-list").innerHTML = "";
  if (!records.length) {
    $("leaderboard-list").innerHTML = "<li>¡Sé el primero en jugar!</li>";
    return;
  }
  records.forEach(record => {
    const li = document.createElement("li");
    li.textContent = `${record.name} · ${record.date}`;
    const scoreSpan = document.createElement("span");
    scoreSpan.textContent = `${record.score} pts`;
    li.appendChild(scoreSpan);
    $("leaderboard-list").appendChild(li);
  });
}

$("start-btn").addEventListener("click", startGame);
$("next-btn").addEventListener("click", nextQuestion);
$("restart-btn").addEventListener("click", () => {
  $("end-screen").classList.add("hidden");
  $("start-screen").classList.remove("hidden");
});
$("player-name").addEventListener("keydown", e => {
  if (e.key === "Enter") startGame();
});
