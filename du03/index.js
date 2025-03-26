import http from "http";
import fs from "fs/promises";

const filename = "counter.txt";

const port = 3000;

const createFile = async (filename) => {
  try {
    await fs.writeFile(filename, "0");
  } catch (error) {
    throw error;
  }
};

const writeCounter=async (filename,num)=>{
    const counter = await readCounter(filename);
    await fs.writeFile(filename, (counter + num).toString());
    return counter.toString();
}

const readCounter = async (filename) => {
    const counter = parseInt(await fs.readFile(filename, "utf-8"));
    return counter;
};

const increaseCounter = async (filename) => {
  const counter=writeCounter(filename,1)
  return counter + 1;
};

const decreaseCounterasync = async (filename) => {
  const counter=writeCounter(filename,-1);
  return counter - 1;
};

const server = http.createServer(async (req, res) => {
  console.log("request");
  console.log("  url", req.url);
  console.log("  method", req.method);

  const name = req.url.slice(1) || "";

  res.setHeader("Content-Type", "text/html");

  try {
    await fs.access(filename);
  } catch {
    await createFile(filename);
    console.log("File created");
    res.write("OK");
    res.end();
    return;
  }

  if (name === "read") {
    console.log("Read file");

    res.write((await readCounter(filename)).toString());
    res.end();
  } else if (name === "increase") {
    const counter=await increaseCounter(filename);
    res.write("OK");
    res.end();
  } else if (name==="decrease"){
    const counter=await decreaseCounterasync(filename)
    res.write("OK");
    res.end();
  }else{
    res.write((await readCounter(filename)).toString());
    res.end();
  }

  /*res.statusCode = 200 // OK
  res.setHeader('Content-Type', 'text/html')
  res.write(`<h1>Hello, ${name}!<h1>`)
  res.end()*/
});

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
