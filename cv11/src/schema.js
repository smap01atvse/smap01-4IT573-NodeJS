import {
  sqliteTable,
  int,
  text,
} from "drizzle-orm/sqlite-core"

export const todosTable = sqliteTable("todos", {
  id: int().primaryKey({ autoIncrement: true }),
  title: text().notNull(),
  done: int({ mode: "boolean" }).notNull(),
  priority: text({ enum: ["low", "normal", "high"] })
    .notNull()
    .default("normal"),
  userId: int(),
})

export const usersTable = sqliteTable("users", {
  id:int().primaryKey({ autoIncrement: true }),
  username:text().notNull(),
  hashedPassword:text().notNull(),
  token:text().notNull(),
})

export const usersRelations = relations(
  todosTable, 
  ({ many})=>({
    user:onemptied(todosTable),
}))
export const todosRelations = relations(
  todosTable, 
  ({ one})=>({
    user:onemptied(usersTable),
}))