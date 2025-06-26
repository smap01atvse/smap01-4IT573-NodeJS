import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import db from "./src/db.js"; // Importuj db z drizzle-orm
import { questions } from "./src/schema.js";
import { gameResults } from "./src/schema.js";
import { max } from "drizzle-orm";
import { sql } from 'drizzle-orm';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static(path.join(__dirname, "public")));

// Lobby management (in-memory pro začátek)
let lobby = {
  players: [], // { ws, nickname }
  maxPlayers: 2,
  status: "waiting", // waiting | playing
  rounds: 5, // Maximální počet kol
};

// Dummy otázky pro ukázku (v produkci načítej z DB)
// const questions1 = [
//   {
//     question: "Jaké je hlavní město ČR?",
//     options: ["Praha", "Brno", "Ostrava", "Plzeň"],
//     correct: "Praha",
//   },
//   {
//     question: "Kolik je 2 + 2?",
//     options: ["3", "4", "5", "22"],
//     correct: "4",
//   },
// ];

// Načti otázky z DB
const questions1 = (await db.select().from(questions).orderBy(sql`RANDOM()`).limit(lobby.rounds??5).run()).rows;

const QUESTION_TIME_LIMIT = 10000; // 10 sekund na otázku
let questionTimeout = null;

function calculateScores(answers, correctAnswer, timeStart) {
  // Seřaď odpovědi podle času
  const sorted = answers
    .filter((a) => a.answer === correctAnswer && a.time)
    .sort((a, b) => a.time - b.time);
  // První správná odpověď bonus
  const firstBonus = 50;
  // Správná odpověď základ
  const basePoints = 100;
  // Rychlost: max 50 bodů, lineárně podle času
  const maxSpeedBonus = 50;
  const timeLimit = QUESTION_TIME_LIMIT;
  // Mapování skóre podle nicku
  const scoreMap = {};
  sorted.forEach((a, idx) => {
    let score = basePoints;
    if (idx === 0) score += firstBonus;
    // Rychlostní bonus
    const timeUsed = a.time - timeStart;
    const speedBonus = Math.max(0, Math.round(maxSpeedBonus * (1 - timeUsed / timeLimit)));
    score += speedBonus;
    scoreMap[a.nickname] = score;
  });
  return scoreMap;
}

function sendResultAndNext() {
  const q = questions1[currentRound];
  // Zjisti čas začátku otázky
  const timeStart = questionStartTime;
  // Vypočítej skóre
  const scoreMap = calculateScores(answers_local, q.correct_answer, timeStart);
  // Přidej body hráčům
  lobby.players.forEach((p) => {
    p.score = (p.score || 0) + (scoreMap[p.nickname] || 0);
  });
  // Najdi hráče, kteří neodpověděli a přidej je do odpovědí s answer: null
  lobby.players.forEach((p) => {
    if (!answers_local.find((a) => a.nickname === p.nickname)) {
      answers_local.push({ nickname: p.nickname, answer: null, time: null });
    }
  });
  // Pošli výsledek a skóre
  lobby.players.forEach((p) => {
    p.ws.send(
      JSON.stringify({
        type: "result",
        correct: q.correct_answer,
        answers_local,
        scores: lobby.players.map((pl) => ({ nickname: pl.nickname, score: pl.score || 0 })),
      })
    );
  });
  // Další kolo nebo konec
  currentRound++;
  answers_local = [];
  if (currentRound < questions1.length&& currentRound < lobby.rounds) {
    setTimeout(() => sendQuestionToAll(currentRound), 2000);
  } else {
    setTimeout(() => {
      lobby.players.forEach((p) =>
        p.ws.send(
          JSON.stringify({
            type: "game_over",
            scores: lobby.players.map((pl) => ({ nickname: pl.nickname, score: pl.score || 0 })),
          })
        )
      );
      // Ulož výsledky do DB
      const result = {
        players: JSON.stringify(lobby.players.map((pl) => pl.nickname)),
        scores: JSON.stringify(lobby.players.map((pl) => pl.score || 0)),
        created_at: Date.now(),
      };
      db.insert(gameResults).values(result).run();
      // Reset lobby
      resetGame();
      lobby.status = "waiting";
      lobby.players.forEach((p) => (p.score = 0));
      lobby.players = [];
    }, 3000);
  }
}

// Funkce musí být deklarována dříve, než je použita
function sendQuestionToAll(round) {
  const q = questions1[round];
  answers_local = [];
  questionStartTime = Date.now();
  lobby.players.forEach((p) =>
    p.ws.send(
      JSON.stringify({
        type: "question",
        question: q.question,
        options: JSON.parse(q.options), // Předpokládáme, že options jsou uloženy jako JSON string
        round,
        timeLimit: QUESTION_TIME_LIMIT / 1000,
      })
    )
  );
  if (questionTimeout) clearTimeout(questionTimeout);
  questionTimeout = setTimeout(() => {
    sendResultAndNext();
  }, QUESTION_TIME_LIMIT);
}

let answers_local = [];
let currentRound = 0;
let questionStartTime = null;

function resetGame() {
  answers_local = [];
  currentRound = 0;
  lobby.players.forEach((p) => (p.score = 0));
}

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    let data;
    try {
      data = JSON.parse(message);
    } catch (e) {
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    if (data.type === "join_lobby") {
      // Kontrola unikátnosti přezdívky
      if (lobby.players.find((p) => p.nickname === data.nickname)) {
        ws.send(JSON.stringify({ type: "error", message: "Přezdívka je již obsazena." }));
        return;
      }
      if (lobby.players.length >= lobby.maxPlayers) {
        ws.send(JSON.stringify({ type: "error", message: "Lobby je plná." }));
        return;
      }
      lobby.players.push({ ws, nickname: data.nickname });
      ws.send(JSON.stringify({ type: "lobby_joined", nickname: data.nickname }));
      // Pokud jsou oba hráči, start hry
      if (lobby.players.length === lobby.maxPlayers) {
        lobby.status = "playing";
        resetGame();
        lobby.players.forEach((p) =>
          p.ws.send(JSON.stringify({ type: "game_start", players: lobby.players.map((x) => x.nickname) }))
        );
        setTimeout(() => sendQuestionToAll(currentRound), 1000);
      }
    }
    if (data.type === "answer") {
      // Pokud už čas vypršel, ignoruj odpověď
      if (!questionTimeout) return;
      // Zkontroluj, zda už hráč odpověděl
      if (answers_local.find((a) => a.nickname === data.nickname)) return;
      answers_local.push({ nickname: data.nickname, answer: data.answer, time: Date.now() });
      // Pokud odpověděli všichni před vypršením času, vyhodnoť hned
      if (answers_local.length === lobby.maxPlayers) {
        if (questionTimeout) clearTimeout(questionTimeout);
        questionTimeout = null;
        sendResultAndNext();
      }
    }
    if(data.type==="reset_lobby") {
      // Reset lobby a hry
      resetGame();
      lobby.players.forEach((p) => p.ws.send(JSON.stringify({ type: "lobby_reset" })));
      lobby.status = "waiting";
      lobby.players = [];
    }
  });

  ws.on("close", () => {
    // Odstranění hráče z lobby při odpojení
    lobby.players = lobby.players.filter((p) => p.ws !== ws);
    if (lobby.players.length < lobby.maxPlayers) {
      lobby.status = "waiting";
    }
  });
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get('/questions', async (req, res) => {
  const data = await db.select({ question: questions.question }).from(questions);
  res.json(data);
})

app.get('/leaderboard', async (req, res) => {
  // Zde bys měl načíst leaderboard z DB
  const leaderboard = await db.select({
    players: gameResults.players,
    scores: gameResults.scores,
    created_at: gameResults.created_at
  }).from(gameResults).limit(10).orderBy(gameResults.created_at, 'desc');
  res.render("results", { leaderboard });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});