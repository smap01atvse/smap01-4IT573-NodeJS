//import fs, { read } from 'fs'
import fs, { read } from 'fs/promises'
import util from 'util'

const readFile=(name)=>{
    return new Promise((resolve, reject)=>{
        fs.readFile(name, (error, data)=>{
            if(error){
                reject(error)
            }else{
                resolve(data.toString())
            }
        })
    })
}

const writeFile=(name, text)=>{
    return new Promise((resolve, reject)=>{
        fs.writeFile(name, text,(error)=>{
            if(error){
                reject(error);
            }else{
                resolve();
            }
        })
    })
}

readFile('instrukce.txt').then((instrukce)=>{
    const [vstup, vystup]=instrukce.trim().split(' ');
    return readFile(vstup).then((obsahVstupu)=>{
        return writeFile(vystup, obsahVstupu);
    })
})