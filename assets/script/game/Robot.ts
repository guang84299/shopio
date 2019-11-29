import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;
import { Player } from "./Player"

@ccclass("Robot")
export class Robot extends Player {
    start () {
        super.start();
        this.isPlayer = true;
    }

    updateMoveDir(){
        if(!this.isColl)
        {
            if(this.moveDir.x == 0 || this.moveDir.y == 0 || Math.random()<0.01)
            this.moveDir = cc.v2(Math.random()-0.5,Math.random()-0.5).normalize();
            
            var p = this.node.getPosition();
            if(Math.random()<0.03)
                this.moveDir = cc.v2(0,0).subtract(cc.v2(p.x,p.z)).normalize();
            this.isMove = true;    
        }
    }

    update (deltaTime: number) {
        this.updateMoveDir();
        this.updateStep(deltaTime);
    }
}
