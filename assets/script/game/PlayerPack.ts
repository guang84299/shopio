import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;
import { Player } from "./Player"
import { Goods } from "./Goods"
import { GBoxColl } from "../GColl/GBoxColl"

@ccclass("PlayerPack")
export class PlayerPack extends Component {

    public followTarget = null;
    isColl = false;
    isMove = false;
    moveDir = cc.v2(0,0);
    gameControl = null;
    gcoll = null;
    goodss = [];
    private upDirDt = 10;
    start () {
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.gcoll = this.node.getComponent(GBoxColl);
    }

    holdGoods(goods){
        this.goodss.push(goods);

        var h = this.goodss.length>5 ? 5 : this.goodss.length;
        goods.node.parent = this.node;

        var n = 0;
        for(var i=this.goodss.length-1;i>=0;i--)
        {
            var good = this.goodss[i];
            good.node.setPosition(cc.v3(0,0.1*(h-n),0));
            n++;
            if(n>5) 
            {
                good.node.active = false;
            }
            if(n>8) break;
        }
    }

    updateMoveDir(){
        if(this.followTarget != null &&  !this.isColl)
        {
            this.isMove = false;   
            var p1 = this.node.getPosition();
            var p2 = this.followTarget.node.getPosition();
            var dis = cc.Vec2.distance(cc.v2(p1.x,p1.z),cc.v2(p2.x,p2.z));
            if(dis>1)
            {
                this.moveDir = cc.v2(p2.x,p2.z).subtract(cc.v2(p1.x,p1.z)).normalize();
                this.isMove = true;    
            }
            else
            {
                this.moveDir = cc.v2(0,0);
            }
        }
    }

    updateDir(dir){
        //旋转
        if(dir.x != 0 || dir.y != 0)
        {
            var rad = cc.v2(dir).signAngle(cc.v2(0,1));
            var ang = 180/Math.PI*rad;
            this.node.setRotationFromEuler(0,ang,0);
        }
    }

    updateStep (deltaTime: number)
    {
        if(!this.isColl && this.followTarget)
        {
             if(this.isMove)
             {
                 this.updateDir(this.moveDir);
                 if(this.moveDir.x != 0 || this.moveDir.y != 0)
                 {    
                     this.gcoll.applyForce(cc.v2(this.moveDir).multiplyScalar(this.followTarget.getMoveSpeed()));
                 }
             }
             else
             {
                 this.gcoll.applyForce(cc.v2(0,0));
             }
        }
    }

    update (deltaTime: number) {
        if(this.gameControl.isStart)
        {
            this.upDirDt += deltaTime;
            if(this.upDirDt>=0.1)
            {
                this.upDirDt = 0;
                this.updateMoveDir();
            }
            
            this.updateStep(deltaTime);
        }
       else
       {
            this.isMove = false; 
        //    this.idle();
       }
    }
}
