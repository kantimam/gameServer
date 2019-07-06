import renderGame from './renderGame.js'

let selectedPlayer=0;
let playerSelect=document.getElementsByClassName("playerSelect");
if(playerSelect){
    playerSelect=Array.from(playerSelect)
}
console.log(playerSelect)
playerSelect.forEach((element)=>{
    element.addEventListener("click",(event)=>{
        playerSelect[selectedPlayer].classList.remove("selected");
        element.classList.add("selected");
        selectedPlayer=element.value;
    })
})


/* function selectedPlayer(i){

} */

// connection logic
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

