const express=require('express');
const app=express();
const server = require('http').createServer(app);
const io=require('socket.io')(server)

app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});



const gameState = {
   players: {},
   projectiles: []
}
spriteArray=[1,2,3,4,5,6];
const projectileSpeed=6;
let socketId=0;
const connectionsLimit=2;
const gameResolution={x:800,y:600};
let connectionsCount=0;
let playerCount=0;
io.on('connection',(socket)=>{
    if(connectionsCount>=connectionsLimit){
        socket.emit('err',{
            message: 'this lobby is full'
        })
        socket.disconnect()
        console.log(`disconnected ${socket.id}`)
        return 
    }
    connectionsCount++;
    console.log(`user connected with the id: ${socket.id}`)
    socketId=socket.id;
    socket.on('disconnect',()=>{
        connectionsCount--;
        console.log(`disconnected userId: ${socket.id}`)
        delete gameState.players[socket.id]
    })
    socket.on('newPlayer',()=>{
        // check what sprite the other player has and pick another one
        let objectPlayerCount=Object.values(gameState.players).length;
        objectPlayerCount=objectPlayerCount? objectPlayerCount : 0;
        console.log("newPlayer")
        const newPlayer={
            id: socket.id,
            sprite: spriteArray[objectPlayerCount],
            x:Math.floor(Math.random()*600),
            y:Math.floor(Math.random()*400),
            animation: "idle",
            health: 100,
            size: 3
        }
        gameState.players[socket.id]=newPlayer
        console.log(gameState)
        /* io.sockets.emit('newactor', newPlayer); */
        io.sockets.emit('playercreated', gameState);
    })

    socket.on('startgame',()=>{
        if(connectionsCount===2){
            console.log(Object.entries(gameState.players))
            io.sockets.emit('gamestarted',gameState)
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
    socket.on('shoot',(projectile)=>{
        const currentPlayer=gameState.players[socket.id]
        if(currentPlayer){
            const angle=Math.atan2(projectile.x-currentPlayer.x, projectile.y-currentPlayer.y);
            const newprojectile={
                posX: currentPlayer.x,
                posY: currentPlayer.y,
                moveX: projectileSpeed*Math.sin(angle),
                moveY: projectileSpeed*Math.cos(angle)
            }
            gameState.projectiles.push(newprojectile)
            io.sockets.emit('newprojectile',newprojectile)
        }
        
    })
})

setInterval(() => {
    gameState.projectiles.forEach(projectile=>{
        projectile.posX+=projectile.moveX;
        projectile.posY+=projectile.moveY;
        const collisions=collisionWorld(projectile.posX,projectile.posY,gameResolution.x,gameResolution.y);
        if(collisions.top) {projectile.posY=0; projectile.moveY*=-1;}
        if(collisions.right) {projectile.posX=gameResolution.x; projectile.moveX*=-1;}
        if(collisions.bottom) {projectile.posY=gameResolution.y; projectile.moveY*=-1;}
        if(collisions.left) {projectile.posX=0; projectile.moveX*=-1;}
        
    })
    io.sockets.emit('state', gameState);
  }, 1000/60/* 1000/5 */);


function collisionWorld(actorX, actorY, containerWidth, containerHeight){
    const collisions={top:false, right:false, bottom:false, left:false}
    if(actorX>containerWidth){
        collisions.right=true;
    }
    if(actorX<0){
        collisions.left=true;
    }
    if(actorY>containerHeight){
        collisions.bottom=true;
    }
    if(actorY<0){
        collisions.top=true;
    }
    return collisions
}


  function spawnActor(){
    io.sockets.emit('newactor', {
        x:Math.floor(Math.random()*600),
        y:Math.floor(Math.random()*400),
        animation: "idle",
        health: 100,
        size: 3
    });
  }



server.listen(5000,()=>console.log(`running on port 50000`))