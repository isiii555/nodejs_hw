const http = require("http");
const EventEmitter = require("events");
const emitter = new EventEmitter();
const encrypt = require("./encrypt");

let hashedPassword = "";

emitter.on("encryptString", async (data) => {
    hashedPassword = await encrypt.hashPassword(data);
    console.log(hashedPassword);
});

emitter.on("compareString",async (data) => {
    let compareResult = await encrypt.comparePassword(data,hashedPassword);
    console.log(compareResult);
});

const server = http.createServer((req,res) => {
    let body = "";
    if (req.method === "POST" && req.url === "/encrypt") {
        req.on("data",(chunk) => {
            body += chunk.toString();
            emitter.emit("encryptString",body);
        })
        req.on("end",() => {
            res.writeHead(200);
            res.end(body);
        });
    }
    else if (req.method === "POST" && req.url === "/compare" ) {
        req.on("data",(chunk) => {
            body += chunk.toString();
            emitter.emit("compareString",body);
        });
        req.on("end",() => {
            res.writeHead(200);
            res.end(body);
        });
    }
    else {
        res.statusCode = 404;
        res.end();
    }
});

const port = 3000;

server.listen(port,() => {
    console.log(`Server running on port : ${port}`)
})