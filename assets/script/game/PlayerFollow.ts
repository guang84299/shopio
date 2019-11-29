import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;
import { Player } from "./Player"

@ccclass("PlayerFollow")
export class PlayerFollow extends Player {

    private upDirDt = 10;
    start () {
        super.start();
    }

    updateMoveDir(){
        if(this.followTarget != null &&  !this.isColl)
        {
            var p1 = this.node.getPosition();
            var p2 = this.followTarget.node.getPosition();
            this.moveDir = cc.v2(p2.x,p2.z).subtract(cc.v2(p1.x,p1.z)).normalize();

            if(Math.random()<0.1)
            this.moveDir = cc.v2(Math.random()-0.5,Math.random()-0.5).normalize();

            this.isMove = true;    
        }
    }

    update (deltaTime: number) {
        this.upDirDt += deltaTime;
        if(this.upDirDt>=1)
        {
            this.upDirDt = 0;
            this.updateMoveDir();
        }
        
        this.updateStep(deltaTime);
    }
}
