/* ============================================================
   BANCO DE PREGUNTAS
   Cada item: img = emoji, número o ruta de imagen (ej. "img/lion.jpg")
              answer = palabra en inglés
   Para agregar más, solo añade una línea al grupo que quieras.
   ============================================================ */
const CATEGORIES = {
  animales: {
    name: "Animales", icon: "🦁",
    items: [
      { img: "🦁", answer: "Lion" }, { img: "🐘", answer: "Elephant" },
      { img: "🐒", answer: "Monkey" }, { img: "🦒", answer: "Giraffe" },
      { img: "🐯", answer: "Tiger" }, { img: "🐻", answer: "Bear" },
      { img: "🐴", answer: "Horse" }, { img: "🐍", answer: "Snake" },
      { img: "🐢", answer: "Turtle" }, { img: "🦓", answer: "Zebra" },
      { img: "🐧", answer: "Penguin" }, { img: "🐊", answer: "Crocodile" },
      { img: "🐬", answer: "Dolphin" }, { img: "🦈", answer: "Shark" },
      { img: "🦉", answer: "Owl" }, { img: "🐰", answer: "Rabbit" },
      { img: "🐶", answer: "Dog" }, { img: "🐱", answer: "Cat" }
    ]
  },
  cuerpo: {
    name: "Partes del cuerpo", icon: "🖐️",
    items: [
      { img: "👁️", answer: "Eye" }, { img: "👂", answer: "Ear" },
      { img: "👃", answer: "Nose" }, { img: "👄", answer: "Mouth" },
      { img: "🦷", answer: "Tooth" }, { img: "👅", answer: "Tongue" },
      { img: "✋", answer: "Hand" }, { img: "🦶", answer: "Foot" },
      { img: "🦵", answer: "Leg" }, { img: "💪", answer: "Arm" },
      { img: "🧠", answer: "Brain" }, { img: "🦴", answer: "Bone" },
      { img: "❤️", answer: "Heart" }
    ]
  },
  objetos: {
    name: "Objetos", icon: "🎒",
    items: [
      { img: "📚", answer: "Book" }, { img: "✏️", answer: "Pencil" },
      { img: "🪑", answer: "Chair" }, { img: "🔑", answer: "Key" },
      { img: "⏰", answer: "Clock" }, { img: "🎒", answer: "Backpack" },
      { img: "☂️", answer: "Umbrella" }, { img: "📱", answer: "Phone" },
      { img: "🛏️", answer: "Bed" }, { img: "✂️", answer: "Scissors" },
      { img: "🚪", answer: "Door" }, { img: "🪟", answer: "Window" },
      { img: "🕶️", answer: "Sunglasses" }, { img: "💡", answer: "Light bulb" }
    ]
  },
  hobbies: {
    name: "Hobbies", icon: "🎨",
    items: [
      { img: "⚽", answer: "Soccer" }, { img: "🎨", answer: "Painting" },
      { img: "🎸", answer: "Playing guitar" }, { img: "📷", answer: "Photography" },
      { img: "🏊", answer: "Swimming" }, { img: "🚴", answer: "Cycling" },
      { img: "🍳", answer: "Cooking" }, { img: "🎤", answer: "Singing" },
      { img: "💃", answer: "Dancing" }, { img: "🎮", answer: "Video games" },
      { img: "📖", answer: "Reading" }, { img: "♟️", answer: "Chess" },
      { img: "🎣", answer: "Fishing" }
    ]
  },
  numeros: {
    name: "Números", icon: "🔢", isNumber: true,
    items: [
      { img: "1", answer: "One" }, { img: "2", answer: "Two" },
      { img: "3", answer: "Three" }, { img: "4", answer: "Four" },
      { img: "5", answer: "Five" }, { img: "6", answer: "Six" },
      { img: "7", answer: "Seven" }, { img: "8", answer: "Eight" },
      { img: "9", answer: "Nine" }, { img: "10", answer: "Ten" },
      { img: "12", answer: "Twelve" }, { img: "15", answer: "Fifteen" },
      { img: "20", answer: "Twenty" }
    ]
  }
};

const QUESTIONS_PER_ROUND = 10;
const OPTIONS_PER_QUESTION = 4;

const $ = (id) => document.getElementById(id);
let player = "Jugador", score = 0, lives = 3, streak = 0, bestStreak = 0;
let questionIndex = 0, correctAnswers = 0, answered = false, round = [];
let currentCategory = "mixto";

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* Arma la partida: 10 preguntas con 4 opciones (siempre de la misma sección) */
function buildRound(key) {
  const keys = key === "mixto" ? Object.keys(CATEGORIES) : [key];
  let pool = [];
  keys.forEach(k => CATEGORIES[k].items.forEach(item => pool.push({ ...item, catKey: k })));
  return shuffle(pool).slice(0, QUESTIONS_PER_ROUND).map(item => {
    const cat = CATEGORIES[item.catKey];
    const wrong = shuffle(cat.items.filter(i => i.answer !== item.answer)).slice(0, OPTIONS_PER_QUESTION - 1);
    return {
      category: cat.name.toUpperCase(),
      img: item.img,
      isNumber: !!cat.isNumber,
      options: shuffle([item.answer, ...wrong.map(w => w.answer)]),
      answer: item.answer
    };
  });
}

function renderMenu() {
  const grid = $("menu-grid");
  grid.innerHTML = "";
  Object.entries(CATEGORIES).forEach(([key, cat]) => {
    const b = document.createElement("button");
    b.className = "cat-btn";
    b.innerHTML = `<span>${cat.icon}</span>${cat.name}`;
    b.addEventListener("click", () => startGame(key));
    grid.appendChild(b);
  });
  const mix = document.createElement("button");
  mix.className = "cat-btn wide";
  mix.innerHTML = "<span>🎲</span>Todo mezclado";
  mix.addEventListener("click", () => startGame("mixto"));
  grid.appendChild(mix);
}

function showMenu() {
  player = $("player-name").value.trim() || player || "Jugador";
  $("menu-title").textContent = `¿Qué quieres practicar, ${player}?`;
  $("start-screen").classList.add("hidden");
  $("end-screen").classList.add("hidden");
  $("game-screen").classList.add("hidden");
  $("menu-screen").classList.remove("hidden");
}

function startGame(key) {
  currentCategory = key;
  score = 0; lives = 3; streak = 0; bestStreak = 0; questionIndex = 0; correctAnswers = 0;
  round = buildRound(key);
  $("player-label").textContent = player;
  $("score").textContent = score;
  $("streak").textContent = streak;
  $("lives").textContent = "❤️❤️❤️";
  $("menu-screen").classList.add("hidden");
  $("game-screen").classList.remove("hidden");
  showQuestion();
}

function showQuestion() {
  answered = false;
  const q = round[questionIndex];
  $("category").textContent = q.category;
  $("question").textContent = "What is this?";
  const pic = $("picture");
  pic.innerHTML = "";
  pic.classList.toggle("number", q.isNumber);
  if (/\.(jpe?g|png|webp|gif|svg)$/i.test(q.img)) {
    const img = document.createElement("img");
    img.src = q.img;
    img.alt = "Imagen de la pregunta";
    pic.appendChild(img);
  } else {
    pic.textContent = q.img;
  }
  $("question-counter").textContent = `Pregunta ${questionIndex + 1} de ${round.length}`;
  const percent = Math.round(((questionIndex + 1) / round.length) * 100);
  $("progress-percent").textContent = `${percent}%`;
  $("progress-bar").style.width = `${percent}%`;
  $("feedback").textContent = "";
  $("feedback").className = "feedback";
  $("next-btn").classList.add("hidden");
  $("answers").innerHTML = "";
  q.options.forEach(option => {
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
  $("next-btn").textContent = (questionIndex === round.length - 1 || lives <= 0) ? "Ver resultado 🏆" : "Siguiente pregunta →";
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
  const section = currentCategory === "mixto" ? "Mezclado" : CATEGORIES[currentCategory].name;
  records.push({ name: player, score, section, date: new Date().toLocaleDateString() });
  records.sort((a, b) => b.score - a.score);
  records = records.slice(0, 5);
  try {
    localStorage.setItem("englishQuestScores", JSON.stringify(records));
  } catch (error) {
    console.warn("No se pudo guardar la tabla de líderes en este navegador.", error);
  }
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
    li.textContent = `${record.name} · ${record.section || ""} · ${record.date}`;
    const scoreSpan = document.createElement("span");
    scoreSpan.textContent = `${record.score} pts`;
    li.appendChild(scoreSpan);
    $("leaderboard-list").appendChild(li);
  });
}

renderMenu();
$("start-btn").addEventListener("click", showMenu);
$("next-btn").addEventListener("click", nextQuestion);
$("restart-btn").addEventListener("click", showMenu);
$("player-name").addEventListener("keydown", e => {
  if (e.key === "Enter") showMenu();
});
