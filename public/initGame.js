import renderGame from './renderGame.js'
const lobbySize=2;



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
socket=io();
function initSocket(){
    if(socket && socket.id){
        /* console.log(`you are already connected with the id: ${socket.id}`) */
        alert(`you are already connected with the id: ${socket.id}`)
        return 
    }
    /* socket=io(); */
    listenToPlayerCreated();
    listenToGameStarted();
}


let lobbySelect=document.getElementsByClassName("lobbyItem");
if(lobbySelect){
    lobbySelect=Array.from(lobbySelect);
}
lobbySelect.forEach((element, index)=>{
    element.addEventListener("click",(event)=>{
        /* element.getElementsByTagName("span")[0].innerHTML="asd" */
        initSocket();
    })
})

//update lobbystate
if(socket){
    socket.on('lobbyUpdate',(count)=>{
        lobbySelect[0].getElementsByTagName("span")[0].innerHTML=`${count}/2`
        if(count===lobbySize){
            lobbySelect[0].getElementsByClassName("joinLobby")[0].innerHTML=`JOINED`
            lobbySelect[0].classList.add("lobbyFull")
            console.log("game is ready")
            return 
        }
        lobbySelect[0].classList.remove("lobbyFull")

    })
}

let gameState='waiting';
function createPlayer(){
    socket.emit('newPlayer',selectedPlayer)
}
window.createPlayer=createPlayer

let currentPlayerCount=0;
function listenToPlayerCreated(){
    socket.on('playercreated',(gameState)=>{
        /* currentPlayerCount=Object.keys(gameState.players).length */
        currentPlayerCount=0;
        playerSelect.forEach(element=>element.classList.remove("alreadySelected"))
        console.log(gameState)
        for(let player in gameState.players){
            if(player!==socket.id){
                currentPlayerCount++;
                const selectedSprite=gameState.players[player].sprite;
                playerSelect[selectedSprite].classList.remove("selected")
                playerSelect[selectedSprite].classList.add("alreadySelected")
            }
            
        }
    })
}


function startGame(){
    if(currentPlayerCount===2 && socket){
        socket.emit('startgame')
    }
}
window.startGame=startGame;

function listenToGameStarted(){
    socket.on('gamestarted',(initialGameState)=>{
        if(socket && gameState!=='started'){
            gameState='started'
            renderGame(socket, initialGameState)
        }
    })
}


