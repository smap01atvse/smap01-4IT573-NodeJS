import { rejects } from "assert"

const addAsync=(a,b,callback)=>{
    

    return new Promise((resolve)=>{
        setTimeout(()=>{
            if(a+b>4){
                reject("Číslo je příliš veliké")
            }
            resolve(a+b)
        },1000)
    })
}

addAsync(1,2).then((result)=>{
    console.log(result);
    return addAsync(result,3)
}).then((result)=>{
    console.log(result);
}).catch((error)=>{
    console.error(error);
})