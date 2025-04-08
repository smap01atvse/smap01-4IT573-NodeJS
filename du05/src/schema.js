import { sqliteTable, int, text } from "drizzle-orm/sqlite-core"

export const todosTable = sqliteTable("todos", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  priority: int().default(0).notNull(),
  done: int({ mode: "boolean" }).notNull(),
})