const http = require("http");
const EventEmitter = require("events");
const fs = require("fs");
const path = require("path");
const emitter = new EventEmitter();
const encrypt = require("./encrypt");

let hashedPassword = "";

function logErrorToFile(error, additionalInfo = "") {
    const logFilePath = path.join(__dirname, "error.log");
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] Error: ${error.message}\nAdditional Info: ${additionalInfo}\n\n`;
    
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error("Failed to write to log file:", err);
        }
    });
}

emitter.on("errorLogger", (error, additionalInfo) => {
    console.error("Error:", error.message);
    logErrorToFile(error, additionalInfo);
});

emitter.on("encryptString", async (data) => {
    try {
        hashedPassword = await encrypt.hashPassword(data);
        console.log(hashedPassword);
    } catch (error) {
        emitter.emit("errorLogger", error, "Error occurred during encryption.");
    }
});

emitter.on("compareString", async (data) => {
    try {
        let compareResult = await encrypt.comparePassword(data, hashedPassword);
        console.log(compareResult);
    } catch (error) {
        emitter.emit("errorLogger", error, "Error occurred during comparison.");
    }
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