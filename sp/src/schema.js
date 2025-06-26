import { sqliteTable, int, text, unique } from "drizzle-orm/sqlite-core"

// Úkoly
export const todosTable = sqliteTable("todos", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  done: int({ mode: "boolean" }).notNull(),
})

// Hráči
export const users = sqliteTable("users", {
  id: int().primaryKey({ autoIncrement: true }),
  nickname: text().notNull().unique(),
  created_at: int().notNull(), // timestamp
})

// Lobby
export const lobbies = sqliteTable("lobbies", {
  id: int().primaryKey({ autoIncrement: true }),
  status: text().notNull(), // waiting, playing, finished
  rounds: int().notNull(),
  created_at: int().notNull(),
})

// Propojení hráčů a lobby
export const lobbyPlayers = sqliteTable("lobby_players", {
  id: int().primaryKey({ autoIncrement: true }),
  lobby_id: int().notNull(),
  user_id: int().notNull(),
  score: int().notNull().default(0),
  joined_at: int().notNull(),
}, (table) => ({
  uniqueLobbyUser: unique().on(table.lobby_id, table.user_id),
}))

// Otázky
export const questions = sqliteTable("questions", {
  id: int().primaryKey({ autoIncrement: true }),
  question: text().notNull(),
  correct_answer: text().notNull(),
  options: text().notNull(), // JSON array
})

// Průběh hry (kola)
export const gameRounds = sqliteTable("game_rounds", {
  id: int().primaryKey({ autoIncrement: true }),
  lobby_id: int().notNull(),
  question_id: int().notNull(),
  round_number: int().notNull(),
  started_at: int().notNull(),
  ended_at: int(),
})

// Odpovědi hráčů
export const answers = sqliteTable("answers", {
  id: int().primaryKey({ autoIncrement: true }),
  round_id: int().notNull(),
  user_id: int().notNull(),
  answer: text().notNull(),
  is_correct: int({ mode: "boolean" }).notNull(),
  answered_at: int().notNull(),
  points: int().notNull(),
})

// Výsledky hry
export const gameResults = sqliteTable("game_results", {
  id: int().primaryKey({ autoIncrement: true }),
  players: text().notNull(), // JSON array přezdívek hráčů
  scores: text().notNull(), // JSON array výsledků
  created_at: int(),
})