import renderGame from './renderGame.js'

const socket = io();

if(socket){
    renderGame(socket)
}