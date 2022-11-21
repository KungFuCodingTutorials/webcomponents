const http = require('http');
const fsPromises = require('fs/promises');
const helpers = require('./helpers');

const server = {};

server.httpServer = http.createServer(async function(req,res){
    try{
        await server.logic(req,res);
    } catch(e){
        console.error(e);
    }
});

server.start = server.httpServer.listen(3000,'localhost',function(){
    console.log('Server running');
})


server.logic = async function(req,res){
    try{
        let html = await fsPromises.readFile(__dirname+'/index.html','utf-8');
        const data = {
            "title" : "Some title"
        };
        let finalHtml = await helpers.interpolate(html,data)
        res.setHeader('Content-type','text/html');
        res.writeHead(200);
        res.end(finalHtml);

    } catch(e){
        console.error(e);
    }
}



server.init = async function(){
    try{
        server.start();
    } catch(e){
        console.error(e);
    }
}


module.exports = server;

