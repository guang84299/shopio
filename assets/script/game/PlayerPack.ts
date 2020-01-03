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
    // gcoll = null;
    goodss = [];
    goodsNode = null;
    packNode = null;

    maxGoods = null;

    currDis = 0;

    tarDis = 1;
    private upDirDt = 10;
    
    start () {
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        // this.gcoll = this.node.getComponent(GBoxColl);
        this.goodsNode = cc.find("goods",this.node);
        this.packNode = cc.find("pack",this.node);
        this.lvUp(0.5);
    }

    holdGoods(goods){
        this.goodss.push(goods);

        var h = this.goodss.length>20 ? 5 : Math.floor(this.goodss.length/4);
        goods.node.parent = this.goodsNode;
        var max1 = Math.max(goods.gBoxColl.height,goods.gBoxColl.width);
        if(max1>=1) 
        {
            goods.node.setRotationFromEuler(0,0,90);
            if(this.maxGoods)
            {
                var max2 = Math.max(this.maxGoods.gBoxColl.height,this.maxGoods.gBoxColl.width);
                if(max1>max2) this.maxGoods = goods;
            }
            else this.maxGoods = goods;
        }
        if(this.maxGoods && this.maxGoods != goods)
        {
            this.goodss[this.goodss.length-1] = this.maxGoods;
            this.goodss[this.goodss.length-2] = goods;
        }

        var n = 0;
        for(var i=this.goodss.length-1;i>=0;i--)
        {
            var good = this.goodss[i];
            good.node.setPosition(cc.v3((Math.random()-0.5)*0.5,0.1*(h-(n%4))+good.gBoxColl.height*0.5-0.5,(Math.random()-0.5)*0.5));
            n++;
            if(n>20) 
            {
                good.node.active = false;
            }
            if(n>23) break;
        }

    }

    lvUp(num){
        this.packNode.setScale(num,num*3,num);
        this.tarDis = num;
        if(this.tarDis<1) this.tarDis = 1;
    }

    updateMoveDir(){
        if(this.followTarget != null &&  !this.isColl)
        {
            this.isMove = false;   
            var p1 = this.node.getPosition();
            var p2 = this.followTarget.node.getPosition();
            var dis = cc.Vec2.distance(cc.v2(p1.x,p1.z),cc.v2(p2.x,p2.z));
            this.currDis = dis;
            if(dis>this.tarDis)
            {
                this.moveDir = cc.v2(p2.x,p2.z).subtract(cc.v2(p1.x,p1.z)).normalize();
                this.isMove = true;    
            }
            else
            {
                this.moveDir = cc.v2(0,0);
            }
        }
        else this.currDis = 0;
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

    getNextPos(v,dt)
    {
        var p = this.node.getPosition();
        p.x += dt*v.x;
        p.z += dt*v.y;
        if(p.x>14) p.x = 14;
        if(p.x<-14) p.x = -14;
        if(p.z>7.5) p.z = 7.5;
        if(p.z<-7.5) p.z = -7.5;
        return p;
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
                    var np = this.getNextPos(cc.v2(this.moveDir).multiplyScalar(this.followTarget.getMoveSpeed()),deltaTime);
                    this.node.setPosition(np);
                    //  this.gcoll.applyForce();
                 }
             }
             else
             {
                //  this.gcoll.applyForce(cc.v2(0,0));
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
