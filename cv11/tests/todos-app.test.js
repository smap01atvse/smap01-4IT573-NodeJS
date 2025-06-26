import test from "ava"
import {testClient} from "hono/testing"
import { migrate } from "drizzle-orm/libsql/migrator"
import {
  createTodo,
  db,
  deleteTodo,
  getAllTodos,
  getTodoById,
  updateTodo,
} from "../src/db.js"
import {app} from "../src/app.js"
import {todosTable} from "../src/schema.js"
import { RelationTableAliasProxyHandler } from "drizzle-orm"

const client=testClient(app)

test.before("run migrations", async () => {
  await migrate(db, { migrationsFolder: "drizzle" })
})

test.afterEach("delete todos", async () => {
  await db.delete(todosTable)
})

test.serial("GET / returns index with title", async (t)=>{
  const response=await client['/'].$get()
  const text=await response.text()

  t.assert(text.includes("<h1>MY TODO APP</h1>"))
})

test.serial("GET / shows todos", async (t)=>{
  await createTodo({
    title: "Testovací todo!!!",
    done:false,
  })

  const response = await client['/'].$get()
  const text = await response.text()

  t.assert(text.includes("Testovací todo!!!"))
})

test.serial('POST /todos creates new todo', async (t)=>{
  const formData=new FormData()
  formData.append('title','Todo z formulare')

  const response = await app.request('/todos',{
    method: 'POST',
    body: formData,
  })

  t.is(response.status, 302)

  const location=response.headers.get('location')

  const response2=await app.request(location, {
    method: 'GET',
  })

  const text=await response2.text()

  t.assert(text.includes('Todo z formulare'))
})
