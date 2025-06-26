let ws;
let nickname = "";
let timerInterval = null;
let timeLeft = 0;

const loginDiv = document.getElementById("login");
const gameDiv = document.getElementById("game");
const joinBtn = document.getElementById("joinBtn");
const nicknameInput = document.getElementById("nickname");
const loginError = document.getElementById("login-error");
const playersDiv = document.getElementById("players");
const questionSection = document.getElementById("question-section");
const questionDiv = document.getElementById("question");
const optionsDiv = document.getElementById("options");
const timerDiv = document.getElementById("timer");
const resultDiv = document.getElementById("result");
const scoreDiv = document.getElementById("score");
const leaderboardBtn = document.getElementById("leaderboard");
const endResult = document.getElementById("endResult");

leaderboardBtn.onclick = () => {
  window.open("/leaderboard");
}

joinBtn.onclick = () => {
  nickname = nicknameInput.value.trim();
  if (!nickname) {
    loginError.textContent = "Zadej přezdívku!";
    return;
  }
  leaderboardBtn.style.display = "none"; // Skrýt tlačítko leaderboardu, pokud není dokončena hra
  ws = new WebSocket(`ws://${window.location.host}`);
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "join_lobby", nickname }));
  };
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === "error") {
      loginError.textContent = msg.message;
    }
    if (msg.type === "lobby_joined") {
      loginDiv.style.display = "none";
      gameDiv.style.display = "block";
      resultDiv.textContent = "Čekám na soupeře...";
    }
    if (msg.type === "game_start") {
      resultDiv.textContent = "Hra začíná!";
      playersDiv.textContent = `Hráči: ${msg.players.join(", ")}`;
    }
    if (msg.type === "question") {
      resultDiv.textContent = "";
      questionSection.style.display = "block";
      questionDiv.textContent = msg.question;
      optionsDiv.innerHTML = "";
      timeLeft = msg.timeLimit;
      timerDiv.textContent = `Čas: ${timeLeft}s`;
      // Vykresli tlačítka
      msg.options.forEach((opt) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => {
          if (timeLeft <= 0) return; // Po čase neodesílat
          ws.send(JSON.stringify({ type: "answer", nickname, answer: opt }));
          optionsDiv.innerHTML = "Odpověď odeslána...";
          clearInterval(timerInterval);
          timerDiv.textContent = "Odpověď odeslána.";
        };
        optionsDiv.appendChild(btn);
      });
      // Spusť časovač
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        timeLeft--;
        timerDiv.textContent = `Čas: ${timeLeft}s`;
        if (timeLeft <= 0) {
          clearInterval(timerInterval);
          // Zablokuj tlačítka
          Array.from(optionsDiv.children).forEach((btn) => (btn.disabled = true));
          timerDiv.textContent = "Čas vypršel!";
        }
      }, 1000);
    }
    if (msg.type === "result") {
      console.log("Received result:", msg);
      if (timerInterval) clearInterval(timerInterval);
      questionSection.style.display = "none";
      resultDiv.innerHTML = `<b>Správná odpověď:</b> ${msg.correct}<br>`;
      resultDiv.innerHTML += "<b>Odpovědi hráčů:</b><ul>" +
        msg.answers_local.map(a => `<li>${a.nickname}: ${a.answer}</li>`).join("") + "</ul>";
      scoreDiv.innerHTML = "<b>Skóre:</b> " + msg.scores.map(s => `${s.nickname}: ${s.score}`).join(", ");
    }
    if (msg.type === "game_over") {
      resultDiv.innerHTML = "<b>Konec hry!</b><br>Výsledné skóre:<br>" +
      msg.scores.map(s => `${s.nickname}: ${s.score}`).join("<br>");
      questionSection.style.display = "none";
      leaderboardBtn.style.display = "block"; // Zobrazit tlačítko leaderboardu
      endResult.style.display = "block";
      // Najdi pořadí a skóre hráče
      const sorted = [...msg.scores].sort((a, b) => b.score - a.score);
      const myIndex = sorted.findIndex(s => s.nickname === nickname);
      const myScore = sorted[myIndex]?.score ?? 0;
      endResult.innerHTML = `<b>Gratuluji, skončil jsi na ${myIndex+1}. místě s ${myScore} body.</b>`;
    }
    // Další typy zpráv: otázka, odpověď, skóre, atd.
  };
  ws.onclose = () => {
    resultDiv.textContent = "Spojení se serverem bylo ukončeno.";
  };
};
