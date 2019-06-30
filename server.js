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
   projectiles: [],
}
// array of socket ids in order they connect for easier acces
playerKeys=[];
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
        //if playercount is not 0 give them another sprite from the array.... also handle bad values
        objectPlayerCount=objectPlayerCount? objectPlayerCount : 0;
        console.log("newPlayer")
        const newPlayer={
            id: socket.id,
            sprite: spriteArray[objectPlayerCount],
            x:Math.floor(Math.random()*600),
            y:Math.floor(Math.random()*400),
            height: 80,
            width: 60,
            animation: "idle",
            health: 100,
            size: 3
        }
        gameState.players[socket.id]=newPlayer
        playerKeys[objectPlayerCount]=socket.id;
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
                x: currentPlayer.x,
                y: currentPlayer.y,
                moveX: projectileSpeed*Math.sin(angle),
                moveY: projectileSpeed*Math.cos(angle),
                aliveFor: 600,  //server ticks should be 10 seconds
                height: 20,
                width: 20
            }
            gameState.projectiles.push(newprojectile)
            io.sockets.emit('newprojectile',newprojectile)
        }
        
    })
})

setInterval(() => updateGameState(), 1000/60/* 1000/5 */);


function updateGameState(){
    for(let i=gameState.projectiles.length-1;i>=0;i--){
        if(gameState.projectiles[i].aliveFor<0){
            console.log(gameState.projectiles, i)
            gameState.projectiles.splice(i,1);
        }
        else{
            gameState.projectiles[i].x+=gameState.projectiles[i].moveX;
            gameState.projectiles[i].y+=gameState.projectiles[i].moveY;
            //check for collision with map
            const collisions=collisionWorld(gameState.projectiles[i].x,gameState.projectiles[i].y,gameResolution.x,gameResolution.y);

            if(collisionActorSimple(gameState.players[playerKeys[0]], gameState.projectiles[i])){
                gameState.players[playerKeys[0]].x=40;
            }
            if(collisionActorSimple(gameState.players[playerKeys[1]], gameState.projectiles[i])){
                gameState.players[playerKeys[1]].x=40;
            }

            if(collisions.top) {gameState.projectiles[i].y=0; gameState.projectiles[i].moveY*=-1;}
            if(collisions.right) {gameState.projectiles[i].x=gameResolution.x; gameState.projectiles[i].moveX*=-1;}
            if(collisions.bottom) {gameState.projectiles[i].y=gameResolution.y; gameState.projectiles[i].moveY*=-1;}
            if(collisions.left) {gameState.projectiles[i].x=0; gameState.projectiles[i].moveX*=-1;}

            gameState.projectiles[i].aliveFor--;
        }
    }
    /* gameState.projectiles.forEach(projectile=>{
        if(projectile.aliveFor<0){

        }
        projectile.x+=projectile.moveX;
        projectile.y+=projectile.moveY;
        const collisions=collisionWorld(projectile.x,projectile.y,gameResolution.x,gameResolution.y);
        if(collisions.top) {projectile.y=0; projectile.moveY*=-1;}
        if(collisions.right) {projectile.x=gameResolution.x; projectile.moveX*=-1;}
        if(collisions.bottom) {projectile.y=gameResolution.y; projectile.moveY*=-1;}
        if(collisions.left) {projectile.x=0; projectile.moveX*=-1;}
        
    }) */
    io.sockets.emit('state', gameState);
}  


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
function collisionActorDirection(actorOne,actorTwo){
    const collisions={top:false, right:false, bottom:false, left:false}
    if(actorOne.x+actorOne.width>actorTwo.x){
        collisions.right=true;
    }
    if(actorOne.x<actorTwo.x+actorTwo.width){
        collisions.left=true;
    }
    if(actorOne.y+actorOne.height>actorTwo.y){
        collisions.bottom=true;
    }
    if(actorOne.y<actorTwo.y+actorTwo.height){
        collisions.top=true;
    }
    return collisions
}
function collisionActorSimple(actorOne,actorTwo){
    if(actorOne.x+actorOne.width>actorTwo.x ||
        actorOne.x<actorTwo.x+actorTwo.width ||
        actorOne.y+actorOne.height>actorTwo.y ||
        actorOne.y<actorTwo.y+actorTwo.height){
        
        return true
    }
    return false
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



server.listen(5000,()=>console.log(`running on port 5000`))