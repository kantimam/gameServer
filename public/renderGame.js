import Character from './Character.js';
import Projectile from './Projectile.js';

export default function renderGame(socket, initialGameState) {



  const app = new PIXI.Application();
  app.renderer.resize(window.innerWidth, window.innerHeight)
  const b = new Bump(PIXI);
  const renderer = document.getElementById("rendererDiv").appendChild(app.view);
  renderer.style.touchAction = "auto";


  PIXI.Loader.shared
    .add("sprites/penguin.json")
    .add("ground", "textures/ground.jpg")
    .load(setup);



  function setup() {
    app.stage.sortableChildren = true;

    let sheet = PIXI.Loader.shared.resources["sprites/penguin.json"].spritesheet
    let background = new PIXI.TilingSprite(PIXI.Loader.shared.resources.ground.texture, app.renderer.width, app.renderer.height)

    app.stage.addChild(background)

    function createCharacter(parent, posX = 100, posY = 100, size = 2) {
      const sprite = new Character(sheet, true);
      sprite.zIndex = 10;
      sprite.scale.x = size;
      sprite.scale.y = size;
      sprite.position.x = posX;
      sprite.position.y = posY;
      sprite.animationSpeed = 0.167;
      sprite.play();
      parent.addChild(sprite);
      sprite.interactive = true;

      return sprite
    }
    const players = {}
    /* socket.emit('newPlayer')

    socket.on('newactor', (actor) => {
      console.log(actor)
      players[actor.id]=createCharacter(app.stage, actor.x, actor.y, actor.size)
    }) */

    // create sprites for all the players

    Object.entries(initialGameState.players).forEach(entry=>{
      const key=entry[0];
      const value=entry[1]
      players[key]=createCharacter(app.stage, value.x, value.y, value.size);
    })



    console.log(initialGameState)



    let up,
      down,
      left,
      right,
      shoot = false;
    document.addEventListener('keydown', event => {

      switch (event.keyCode) {
        case 83: {

          down = true;
          break
        }
        case 68: {

          right = true;
          break
        }
        case 87: {

          up = true;
          break;
        }
        case 65: {

          left = true;
          break;
        }

      }
    })
    document.addEventListener('keyup', event => {
 
      switch (event.keyCode) {
        case 83: {
          down = false;
          break
        }
        case 68: {
          right = false;
          break
        }
        case 87: {
          up = false;
          break;
        }
        case 65: {
          left = false;
          break;
        }

      }
    })
    renderer.addEventListener('click', (event) => {
      console.log(gameState)
      console.log(players)
      if (players[socket.id] && players[socket.id].shootReady) {
        players[socket.id].shoot(() => spawnProjectileAtServer(players[socket.id].getBounds(), event.clientX, event.clientY));
      }
    })


    let projectiles = []

    function shootFromChar(bounds, mouseX, mouseY) {
      const position = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
      };
      const newProjectile = new Projectile(sheet.animations.idle)
      newProjectile.position = position;
      newProjectile.flyToMouse(position.x, position.y, mouseX, mouseY)
      newProjectile.animationSpeed = 0.167;
      newProjectile.zIndex = 1;
      newProjectile.gotoAndPlay(0);
      projectiles.push(newProjectile)
      app.stage.addChild(newProjectile)

    }

    function createProjectile(bounds, mouseX, mouseY) {
      const position = {
        x: bounds.x + bounds.width / 2,
        y: bounds.y + bounds.height / 2
      };
      const newProjectile = new Projectile(sheet.animations.idle)
      newProjectile.position = position;
      newProjectile.animationSpeed = 0.167;
      newProjectile.zIndex = 1;
      newProjectile.gotoAndPlay(0);
      projectiles.push(newProjectile)
      app.stage.addChild(newProjectile)
    }

    let projectileId = 0;

    function spawnProjectileAtServer(bounds, mouseX, mouseY) {
      socket.emit('shoot', {
        x: mouseX,
        y: mouseY,
        id: projectileId
      })
      createProjectile(bounds, mouseX, mouseY)
      projectileId++;
    }


    let collision = 0;
    let removedProjectile = 0;


    let gameState = {

    }

    // get data from server
    let projectileState = 0;
    socket.on('state', (state) => {
      gameState = state;
      /* for(let player in state.players){
        playerArray.push(state.players[player]);
        
      } */
      projectileState = state.projectiles
    })
    

    /* function sendUpdatesToServer(player){
      if(player){
        socket.emit('playerMovement',{
          ...player.moveVector,animation: player.mpAnimation
         })
      }
      
    } */

    function sendUpdatesToServer(moveVector, mpAnimation) {
        socket.emit('playerMovement', {
          ...moveVector,
          animation: mpAnimation
        })
      
    }

    function movementFromInput(up,right,down,left) {
      const speed=10;
      const moveVector={x:0,y:0}
      let mpAnimation='idle'
      if (down && right) {
        moveVector.x = speed * Math.cos(45 * Math.PI / 180);
        moveVector.y = moveVector.x;
      } else if (down && left) {
        moveVector.y = speed * Math.cos(45 * Math.PI / 180);
        moveVector.x = -moveVector.y;
      } else if (up && right) {
        moveVector.y = -speed * Math.cos(45 * Math.PI / 180);
        moveVector.x = -moveVector.y;
      } else if (up && left) {
        moveVector.x = -speed * Math.cos(45 * Math.PI / 180);
        moveVector.y = moveVector.x;
      } else if (up) {
        mpAnimation = "walkBack"
        moveVector.y = -speed;
        moveVector.x = 0;
      } else if (right) {
        mpAnimation = "walkRight"
        moveVector.y = 0
        moveVector.x = speed;
      } else if (down) {
        mpAnimation = "walkFront"
        moveVector.y = speed;
        moveVector.x = 0;
      } else if (left) {
        mpAnimation = "walkLeft"
        moveVector.y = 0
        moveVector.x = -speed;
      }
      sendUpdatesToServer(moveVector, mpAnimation)
    }
    app.renderer.render(app.stage);

    app.ticker.add(() => {
      movementFromInput(up,right,down,left)

      /* if (projectileState && projectileState.length === projectiles.length) {
        for (let i = 0; i < projectiles.length; i++) {
          projectiles[i].position.x = projectileState[i].posX;
          projectiles[i].position.y = projectileState[i].posY;
        }
      } */



      if (gameState.players/*  && Object.entries(players).legnth>0 */) {
        for (let player in gameState.players) {
          try{
            players[player].position.x = gameState.players[player].x;
            players[player].position.y = gameState.players[player].y;
            players[player].selectAnimation(gameState.players[player].animation || "idle")
          }
          catch{

          }
          
        }
      }

    });

  }
  return renderer
}