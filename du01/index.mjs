import fs from "fs";

const filename = "instrukce.txt";

function transcribeFile(filename) {
  if (!fs.existsSync("instrukce.txt")) {
    console.log(`Soubor ${filename} neexistuje`);
    return;
  }

  fs.readFile(filename.trim(), (err, data) => {
    if (err) {
      console.log(err.toString());
    } else {
      const files = data.toString().split("\n");
      
      if(!fs.existsSync(files[0].trim())) {
        console.log("Soubor "+files[0].trim()+" neexistuje");
        return;
      }

      fs.readFile(files[0].trim(), (err, data) => {
        if (err) {
          console.log(err.toString());
          return;
        } else {
          fs.writeFile(files[1].trim(), data.toString(), () => {
            console.log("File has been modified");
          });
        }
      });
    }
  });
}

transcribeFile(filename);
