import {Hono} from 'hono'
import {serve} from '@hono/node-server'
import {logger} from 'hono/logger'
import {serveStatic} from '@hono/node-server/serve-static'
import {renderFile} from 'ejs'
import { drizzle } from "drizzle-orm/libsql"
import { todosTable } from "./src/schema.js"
import { eq,desc } from "drizzle-orm"
import { numeric } from 'drizzle-orm/pg-core'

const db = drizzle({
  connection: "file:db.sqlite",
  logger: true,
})

const todos = await db.select().from(todosTable).all()

const app=new Hono();

app.use(logger());
app.use(serveStatic({root:'public'}));

app.use(async (c,next)=>{
    console.log(c.req.path);
    await next();
})

app.get('/todos/:id/toggle', async (c)=>{
    const id=Number(c.req.param('id'));

    const todo=await db
    .select()
    .from(todosTable)
    .where(eq (todosTable.id, id))
    .get();
    
    if(!todo){
        return c.notFound();
    }
    
    const rendered=await renderFile('views/task.html',{
        title:'My todo App',
        todo,
    })

    await db
    .update(todosTable)
    .set({done: !todo.done})
    .where(eq (todosTable.id, id))

    return c.redirect('/todo/'+todo.id);
})

app.get('todo/:id', async (c)=>{
    const id=Number(c.req.param('id'));

    const todo=await db
    .select()
    .from(todosTable)
    .where(eq (todosTable.id, id))
    .get();

    if(!todo){
        return c.notFound;
    }

    const rendered=await renderFile('views/task.html',{
        title:'My todo App',
        todo,
    })

    return c.html(rendered);
})

app.get('/todos/:id/remove', async (c)=>{
    const id=Number(c.req.param('id'));

    const todo=await db
    .select()
    .from(todosTable)
    .where(eq (todosTable.id, id))
    .get();

    if(!todo){
        return c.notFound();
    }

    await db
    .delete(todosTable)
    .where(eq (todosTable.id, id))

    return c.redirect('/');
})

app.post('/todos/:id', async (c)=>{
    const id=Number(c.req.param('id'));
    //if(!priorityNum) priorityNum=0;
    
    //if(priorityNum<0||priorityNum>2) priorityNum=0;
    
    const formBody=await c.req.formData();
    let priorityNum=Number(formBody.get('priority'));

    const todo = await db
      .select()
      .from(todosTable)
      .where(eq(todosTable.id, id))
      .get()

    if(!todo){
        return c.notFound();
    }

    console.log('priorityNum',priorityNum)
    await db
      .update(todosTable)
      .set({ title: formBody.get("newTitle") , priority: priorityNum})
      .where(eq(todosTable.id, id))

    return c.redirect('/todo/'+todo.id);
})

app.get('/', async (c)=>{

    const todos=await db
    .select()
    .from(todosTable)
    .orderBy(desc(todosTable.priority))

    const rendered=await renderFile('views/index.html',{
        title:'My todo App',
        todos,
    })

    /*return c.json({text:'Hello'});*/
    return c.html(rendered);
})

app.use('/greeting', (c)=>{
    return c.text('Zdravím')
})

app.post('/todos', async (c)=>{
    const formBody=await c.req.formData();

    await db.insert(todosTable).values({
        title: formBody.get('title'),
        done: false,
    })

    return c.redirect('/');
})

serve(app,(info)=>{
    console.log('App started on htttp://localhost:'+info.port)
})