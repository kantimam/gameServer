
import Character from './Character.js';
import Projectile from './Projectile.js';

export default function renderGame(socket){
    

    
    
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
        app.stage.sortableChildren=true;

        let sheet=PIXI.Loader.shared.resources["sprites/penguin.json"].spritesheet
        let background= new PIXI.TilingSprite(PIXI.Loader.shared.resources.ground.texture,app.renderer.width,app.renderer.height)
        
        app.stage.addChild(background)

        function createCharacter(parent, posX=100, posY=100, size=2){
          const sprite = new Character(sheet,true);
          sprite.zIndex=10;
          sprite.scale.x=size;
          sprite.scale.y=size;
          sprite.position.x=posX;
          sprite.position.y=posY;
          sprite.animationSpeed=0.167;
          sprite.play();
          parent.addChild(sprite);
          sprite.interactive=true;
          
          return sprite 
        }
        
        const sprite=createCharacter(app.stage)
    
    
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
   
          }
        })
        renderer.addEventListener('click',(event)=>{
          if(sprite.shootReady){
            console.log(Object.keys(gameState.players))
            sprite.shoot(()=>shootFromChar(sprite.getBounds(),event.clientX,event.clientY));
          }
        })
    
    
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
        app.stage.sortableChildren=true;
    
        
        let collision=0;
        let removedProjectile=0;
        app.renderer.render(app.stage);
    
    
        let gameState={
          x:0,
          y:0
        }
        
        // get data from server
        let playerState=0
        socket.on('state',(state)=>{
          gameState=state;
          for(let player in state.players){
            playerState=state.players[player];
          }
        })

        socket.on('newactor',(actor)=>{
          createCharacter(app.stage, actor.x, actor.y, actor.size)
        })

        function sendUpdatesToServer(player){
          if(player){
            socket.emit('playerMovement',{
              ...player.moveVector,animation: player.mpAnimation
             })
          }
          
        }
        app.ticker.add(() => {

          sprite.movementFromInputMultiplayer(up,right,down,left)
    
          sendUpdatesToServer(sprite)
  
          if(playerState){
            sprite.position.x=playerState.x;
            sprite.position.y=playerState.y;
            sprite.selectAnimation(playerState.animation || "idle")
          }
          
       });
    
       
       
    
      }
  return renderer
}

