// Základní Express server s WebSockety (ws) pro kvízovou hru
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Lobby management (in-memory pro začátek)
let lobby = {
  players: [], // { ws, nickname }
  maxPlayers: 2,
  status: "waiting", // waiting | playing
};

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
        lobby.players.forEach((p) =>
          p.ws.send(JSON.stringify({ type: "game_start", players: lobby.players.map((x) => x.nickname) }))
        );
      }
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
  res.send("Quiz game server running.");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
