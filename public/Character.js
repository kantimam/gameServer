class Character extends PIXI.AnimatedSprite{
    constructor(spriteJson, autoUpdate){
        super(spriteJson.animations['idle'], autoUpdate);
        this.spriteJson=spriteJson;
        this.currentAnimation="idle";
        this.mpAnimation="idle"
        this.speed=3;
        this.moveVector={x:0,y:0};
        this.shootCoolDown=300;
        this.shootReady=true;
    }
    setAnimation(textureArray){
        this.textures=textureArray;
    }
    selectAnimation(animationName){
        if(this.currentAnimation!==animationName){
            try{
                this.textures=this.spriteJson.animations[animationName]
                this.currentAnimation=animationName;
                this.gotoAndPlay(0)
            }
            catch{
                console.log(animationName)
            }
            
        }
    }
    moveCharacter(){
        if(this.moveVector.y){
            this.position.y+=this.moveVector.y*this.speed;
        }
        if(this.moveVector.x){
            this.position.x+=this.moveVector.x*this.speed;
        }
    }
    movementFromInput(up,right,down,left){
        if(down && right){
            this.moveVector.x=this.speed*Math.cos(45*Math.PI/180);
            this.moveVector.y=this.moveVector.x;
        }else if(down && left){
            this.moveVector.y=this.speed*Math.cos(45*Math.PI/180);
            this.moveVector.x=-this.moveVector.y;
        }else if(up && right){
            this.moveVector.y=-this.speed*Math.cos(45*Math.PI/180);
            this.moveVector.x=-this.moveVector.y;
        }else if(up && left){
            this.moveVector.x=-this.speed*Math.cos(45*Math.PI/180);
            this.moveVector.y=this.moveVector.x;
        }else if(up){
            this.selectAnimation("walkBack");
            this.moveVector.y=-this.speed;
            this.moveVector.x=0;
        }else if(right){
            this.selectAnimation("walkRight")
            this.moveVector.y=0
            this.moveVector.x=this.speed;
        }else if(down){
            this.selectAnimation("walkFront")
            this.moveVector.y=this.speed;
            this.moveVector.x=0;
        }else if(left){
            this.selectAnimation("walkLeft");
            this.moveVector.y=0
            this.moveVector.x=-this.speed;
        }
    }


    movementFromInputMultiplayer(up,right,down,left){
        if(down && right){
            this.moveVector.x=this.speed*Math.cos(45*Math.PI/180);
            this.moveVector.y=this.moveVector.x;
        }else if(down && left){
            this.moveVector.y=this.speed*Math.cos(45*Math.PI/180);
            this.moveVector.x=-this.moveVector.y;
        }else if(up && right){
            this.moveVector.y=-this.speed*Math.cos(45*Math.PI/180);
            this.moveVector.x=-this.moveVector.y;
        }else if(up && left){
            this.moveVector.x=-this.speed*Math.cos(45*Math.PI/180);
            this.moveVector.y=this.moveVector.x;
        }else if(up){
            this.mpAnimation="walkBack"
            this.moveVector.y=-this.speed;
            this.moveVector.x=0;
        }else if(right){
            this.mpAnimation="walkRight"
            this.moveVector.y=0
            this.moveVector.x=this.speed;
        }else if(down){
            this.mpAnimation="walkFront"
            this.moveVector.y=this.speed;
            this.moveVector.x=0;
        }else if(left){
            this.mpAnimation="walkLeft"
            this.moveVector.y=0
            this.moveVector.x=-this.speed;
        }
    }

    shoot(shootFunction){
        shootFunction();
        this.shootReady=false;
        setTimeout(()=>this.shootReady=true,this.shootCoolDown)
    }

}

export default Character;