var http = require('http');

var server = http.createServer(function (request, response) {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("Slasher API (v1)");
});

server.listen(5933);

console.log("Node HTTP Server started at http://localhost:5933/");
