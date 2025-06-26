import { drizzle } from "drizzle-orm/libsql"
import { eq } from "drizzle-orm"
import { todosTable } from "./schema.js"

export const db = drizzle({
  connection:
    process.env.NODE_ENV === "test"
      ? "file::memory:"
      : "file:db.sqlite",
  logger: process.env.NODE_ENV !== "test",
})

export const getAllTodos = async () => {
  const todos = await db.select().from(todosTable).all()

  return todos
}

export const getTodoById = async (id) => {
  const todo = await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.id, id))
    .get()

  return todo
}

export const createTodo = async (values) => {
  return await db
    .insert(todosTable)
    .values(values)
    .returning(todosTable)
    .get()
}

export const updateTodo = async (id, values) => {
  await db
    .update(todosTable)
    .set(values)
    .where(eq(todosTable.id, id))
}

export const deleteTodo = async (id) => {
  await db.delete(todosTable).where(eq(todosTable.id, id))
}
