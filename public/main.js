
import Character from './Character.js';
import Projectile from './Projectile.js';


const socket = io();

socket.emit('newPlayer')




const app = new PIXI.Application();
app.renderer.resize(window.innerWidth,window.innerHeight )
console.log(app.renderer.width)
const b=new Bump(PIXI);
const renderer=document.getElementById("rendererDiv").appendChild(app.view);
renderer.style.touchAction="auto";


PIXI.Loader.shared
  .add("sprites/penguin.json")
  .add("ground","textures/ground.jpg")
  .load(setup);



function setup() {

    let sheet=PIXI.Loader.shared.resources["sprites/penguin.json"].spritesheet

    let background= new PIXI.TilingSprite(PIXI.Loader.shared.resources.ground.texture,app.renderer.width,app.renderer.height)
    app.stage.addChild(background)
    let sprite = new Character(sheet,true);
    sprite.zIndex=10;
    console.log(sprite.zIndex)
    sprite.scale.x=2;
    sprite.scale.y=2;
    sprite.animationSpeed=0.167;



    let up, 
        down, 
        left, 
        right, 
        shoot=false;
    document.addEventListener('keydown',event=>{
    
      switch(event.keyCode){
        case 83:{

          down=true; 
          break
        }
        case 68:{

          right=true; 
          break
        }
        case 87:{

          up=true; 
          break;
        }
        case 65:{
 
          left=true; 
          break;
        }
        /* case 32:{
          shoot=true;
          break;
        } */
      }
    })
     document.addEventListener('keyup',event=>{
       sprite.moveVector={x:0,y:0}
       switch(event.keyCode){
        case 83:{
          down=false; 
          break
        }
        case 68:{
          right=false;
          break
        }
        case 87:{
          up=false; 
          break;
        }
        case 65:{
          left=false;  
          break;
        }
        /* case 32:{
          shoot=false;
          break;
        } */
      }
    })
    renderer.addEventListener('click',(event)=>{
      if(sprite.shootReady){
        sprite.shoot(()=>shootFromChar(sprite.getBounds(),event.clientX,event.clientY));
      }
    })

    sprite.play(sprite);

    let projectiles=[]
    function shootFromChar(bounds, mouseX, mouseY){
      const position={x: bounds.x+bounds.width/2,y: bounds.y+bounds.height/2};
      const newProjectile=new Projectile(sheet.animations.idle)
      newProjectile.position=position;
      newProjectile.flyToMouse(position.x,position.y,mouseX,mouseY)
      newProjectile.animationSpeed=0.167;
      newProjectile.zIndex=1;
      newProjectile.gotoAndPlay(0);
      projectiles.push(newProjectile)
      app.stage.addChild(newProjectile)

    }
    app.stage.addChild(sprite);
    app.stage.sortableChildren=true;
    sprite.interactive=true;
    console.log(projectiles)

    
    let collision=0;
    let removedProjectile=0;
    app.renderer.render(app.stage);


    const gameState={
      x:0,
      y:0
    }
    let playerState=0
    socket.on('state',(state)=>{
      /* console.log(state.players) */
      for(let player in state.players){
        playerState=state.players[player];
      }
    })
    function sendUpdatesToServer(player){
      if(player){
        socket.emit('playerMovement',{
          ...player.moveVector,animation: player.mpAnimation
         })
      }
      
    }
    app.ticker.add(() => {
      // send changes to server

      //set character movement
      /* sprite.movementFromInput(up,right,down,left) */
      sprite.movementFromInputMultiplayer(up,right,down,left)

      sendUpdatesToServer(sprite)
      /* sprite.moveCharacter() */
      if(playerState){
        sprite.position.x=playerState.x;
        sprite.position.y=playerState.y;
        sprite.selectAnimation(playerState.animation || "idle")
      }
      

   
      for(let i=projectiles.length-1;i>=0;i--){
        projectiles[i].updatePosition();
        b.contain(projectiles[i], {x: 0, y: 0, width: app.renderer.width, height: app.renderer.height},true,(data)=>{
          if(data.has("bottom") || data.has("top")){
            projectiles[i].moveVector.y*=-1;
          }
          if(data.has("left") || data.has("right")){
            projectiles[i].moveVector.x*=-1;
            /* removedProjectile=projectiles.splice(i,1)[0];
            removedProjectile.parent.removeChild(removedProjectile) */
          }
        })
      }
      collision=b.contain(sprite, {x: 0, y: 0, width: app.renderer.width, height: app.renderer.height});
   });

   
   

  }