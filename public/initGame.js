import renderGame from './renderGame.js'

const socket = io();

let gameState='waiting';
function createPlayer(){
    socket.emit('newPlayer')
}
window.createPlayer=createPlayer

let currentPlayerCount=0;
socket.on('playercreated',(gameState)=>{
    currentPlayerCount=Object.keys(gameState.players).length
    console.log(currentPlayerCount)
})



function startGame(){
    if(currentPlayerCount===2){
        socket.emit('startgame')
    }
}
window.startGame=startGame;
socket.on('gamestarted',(initialGameState)=>{
    if(socket && gameState!=='started'){
        gameState='started'
        renderGame(socket, initialGameState)
    }
})

