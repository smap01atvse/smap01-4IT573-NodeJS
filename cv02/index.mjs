import fs from 'fs'

fs.readFile('index.html', (err, data)=>{
    if(err){
        console.log(err)
    }else{
        console.log(data.toString())
    }
})