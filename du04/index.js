import {Hono} from 'hono'
import {serve} from '@hono/node-server'
import {logger} from 'hono/logger'
import {serveStatic} from '@hono/node-server/serve-static'
import {renderFile} from 'ejs'

const todos=[
    {
        id:1,
        title:'Zajít na pivo',
        done:false
    },
    {
        id:2,
        title:'Doplnit skripty',
        done:false
    },
]

const app=new Hono();

app.use(logger());
app.use(serveStatic({root:'public'}));

app.use(async (c,next)=>{
    console.log(c.req.path);
    await next();
})

app.get('/todos/:id/toggle', async (c)=>{
    const id=Number(c.req.param('id'));

    const todo=todos.find((todo)=>todo.id===id);

    const rendered=await renderFile('views/task.html',{
        title:'My todo App',
        todo,
    })

    if(!todo){
        return c.notFound();
    }

    todo.done=!todo.done;

    return c.redirect('/todo/'+todo.id);
})

app.get('todo/:id', async (c)=>{
    const id=Number(c.req.param('id'));

    const todo=todos.find((todo)=>todo.id===id);

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

    const index=todos.findIndex((todo)=>{return todo.id===id});

    todos.splice(index,1);

    return c.redirect('/');
})

app.post('/todos/:id/rename', async (c)=>{
    const id=Number(c.req.param('id'));

    const formBody=await c.req.formData();

    const todo=todos.find((todo)=>todo.id===id);

    if(!todo){
        return c.notFound();
    }

    todos.find((todo)=>todo.id===id).title=formBody.get('newTitle');

    return c.redirect('/todo/'+todo.id);
})

app.get('/', async (c)=>{

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

    todos.push({
        id:todos.length+1,
        title:formBody.get('title'),
        done:false,
    });

    return c.redirect('/');
})

serve(app,(info)=>{
    console.log('App started on htttp://localhost:'+info.port)
})