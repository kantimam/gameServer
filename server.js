const express=require('express');
const app=express();
const server = require('http').createServer(app);
const io=require('socket.io')(server)

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});



const gameState = {
   players: {}
}

io.on('connection',(socket)=>{
    console.log(`user connected with the id: ${socket.id}`)
    socket.on('disconnect',()=>{
        console.log(`disconnected userId: ${socket.id}`)
        delete gameState.players[socket.id]
    })
    socket.on('newPlayer',()=>{
        console.log("newPlayer")
        gameState.players[socket.id]={
            x: 100,
            y: 200,
            animation: 'idle',
            health: 100
        }
    })
    socket.on('playerMovement',(playerMovement)=>{
        const currentPlayer=gameState.players[socket.id];
        if(currentPlayer){
            currentPlayer.x+=playerMovement.x;
            currentPlayer.y+=playerMovement.y;
            currentPlayer.animation=playerMovement.animation;
        }
    })
})

setInterval(() => {
    io.sockets.emit('state', gameState);
  }, 1000/60);




setInterval(() => {
    io.sockets.emit('newactor', {
        x:Math.floor(Math.random()*600),
        y:Math.floor(Math.random()*400),
        animation: "idle",
        health: 100,
        size: 3
    });
  }, 4000);



server.listen(5000,()=>console.log(`running on port 50000`))