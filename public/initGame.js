import renderGame from './renderGame.js'

let selectedPlayer=0;
let playerSelect=document.getElementsByClassName("playerSelect");
if(playerSelect){
    playerSelect=Array.from(playerSelect)
}
playerSelect.forEach((element)=>{
    element.addEventListener("click",(event)=>{
        if(element.classList.contains("alreadySelected")){
            alert("this character is already taken!")
            return 
        }
        else{
            playerSelect[selectedPlayer].classList.remove("selected");
            element.classList.add("selected");
            selectedPlayer=element.value;
        } 
    })
})

// connect to socket
let socket;

let lobbySelect=document.getElementsByClassName("lobbyItem");
if(lobbySelect){
    lobbySelect=Array.from(lobbySelect);
}
lobbySelect.forEach((element, index)=>{
    element.addEventListener("click",(event)=>{

    })
})
/* function selectedPlayer(i){

} */

// connection logic
/* const socket = io(); */

let gameState='waiting';
function createPlayer(){
    socket.emit('newPlayer',selectedPlayer)
}
window.createPlayer=createPlayer

let currentPlayerCount=0;
socket.on('playercreated',(gameState)=>{
    /* currentPlayerCount=Object.keys(gameState.players).length */
    currentPlayerCount=0;
    playerSelect.forEach(element=>element.classList.remove("alreadySelected"))
    for(let player in gameState.players){
        if(player!==socket.id){
            currentPlayerCount++;
            const selectedSprite=gameState.players[player].sprite;
            playerSelect[selectedSprite].classList.remove("selected")
            playerSelect[selectedSprite].classList.add("alreadySelected")
        }
        
    }
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

