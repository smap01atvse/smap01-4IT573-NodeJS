import fs from 'fs'

fs.readFile("instrukce.txt", (err, data)=>{
    if(err){
        console.log(err)
    }else{
        const files=data.toString().split('\n');
        files.forEach((filename)=>{
            console.log(filename);
            if(!fs.existsSync(filename)){
                console.log(`Soubor ${filename} neexistuje`);
                return;
            }
        })

        fs.readFile(files[0],(data,err)=>{
            if(err){
                console.log(err);
                return;
            }else{
                fs.writeFile(files[1],data.toString(),()=>{
                    console.log('File has been modified');
                });
            }
        })
    }
})