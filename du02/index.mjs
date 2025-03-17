import fs from "fs/promises";

const filename = "instrukce.txt";

let num = 0;

async function readNum(filename) {
  let temp = 0;

  temp = await fs.readFile(filename.trim(), "utf-8");
  return parseInt(temp);
}

function createFiles(num) {
  let promiseField = [];

  for (let i = 0; i < num; i++) {
    promiseField.push(fs.writeFile(`${i}.txt`, ""));
  }

  return Promise.all(promiseField);
}

let tempError=null;
try {
  num = await readNum(filename);

  createFiles(num).then(() => {});
} catch (error) {
  console.log(error);
  tempError = error;
} finally {
  if (tempError === null&&!isNaN(num)) {
    console.log(`Files created: ${num}`);
  }
}
