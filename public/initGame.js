import renderGame from './renderGame.js'

const socket = io();

socket.emit('newPlayer')


  let playerState=0
  socket.on('state',(state)=>{
    for(let player in state.players){
      playerState=state.players[player];
    }
  })

console.log(playerState)
if(socket){
    renderGame(socket)
}