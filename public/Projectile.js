class Projectile extends PIXI.AnimatedSprite{
    constructor(spriteArray, moveVector={x:0,y:0}, autoUpdate){
        super(spriteArray, autoUpdate);
        this.moveVector=moveVector;
        this.aliveFor=3000;
        this.speed=10;
        /* setTimeout(()=>this.removeFromParent(),this.aliveFor) */
    }
    updatePosition(){
        this.position.x+=this.moveVector.x;
        this.position.y+=this.moveVector.y;
    }
    flyToMouse(originX, originY, mouseX, mouseY){
        const angle=Math.atan2(mouseX-originX, mouseY-originY);
        this.moveVector.x=this.speed*Math.sin(angle);
        this.moveVector.y=this.speed*Math.cos(angle);

    }
    removeFromParent(){
        if(this.parent){
            this.parent.removeChild(this)

        }
    }
    
   

}

export default Projectile;