import { _decorator, Component, Node,AnimationComponent,ModelComponent } from "cc";
const { ccclass, property } = _decorator;
import { Player } from "./Player"
import { Goods } from "./Goods"
import { GBoxColl } from "../GColl/GBoxColl"
import { ani } from "../ani"

@ccclass("PlayerPack")
export class PlayerPack extends Component {

    public followTarget = null;
    public isColl = false;
    isMove = false;
    isPlayPost = false;
    isPlayDrop = false;
    isPause = false;
    moveDir = cc.v2(0,0);
    gameControl = null;
    // gcoll = null;
    goodss = [];
    goodsNode = null;
    packNode = null;

    maxGoods = null;

    tarPlayer = null;

    currDis = 0;

    tarDis = 1;
    private upDirDt = 10;
    
    start () {
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        // this.gcoll = this.node.getComponent(GBoxColl);
        this.goodsNode = cc.find("goods",this.node);
        this.packNode = cc.find("pack",this.node);
        this.lvUp(1);
        this.node.addComponent(ani);

        var material = this.packNode.getComponent(ModelComponent).material;   
        material.setProperty('albedo', this.followTarget.bodyColor); 
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
        this.playPostAni();
    }

    playPostAni(){
        if(!this.isPlayPost && !this.isPlayDrop)
        {
            this.isPlayPost = true;
            this.node.getComponent(AnimationComponent).play();
            var self = this;
            this.scheduleOnce(function(){
                self.isPlayPost = false;
            },0.5);
        }
    }

    playDropAni(){
        if(!this.isPlayDrop)
        {
            this.isPlayDrop = true;
            var material = this.packNode.getComponent(ModelComponent).material;   
            material.setProperty('albedo', new cc.Color("#ff0000")); 
            this.node.getComponent(AnimationComponent).play("animrob");
            var self = this;
            this.scheduleOnce(function(){
                self.isPlayDrop = false;
                material.setProperty('albedo', self.followTarget.bodyColor); 
            },0.5);
        }
    }



    lvUp(num){
        this.packNode.setScale(num,num,num);
        this.tarDis = num/2;
        // if(this.tarDis<1) this.tarDis = 1;
    }

    canColl(pos){
        if(!this.isColl && this.followTarget.isCanColl)
        {
            var p = this.node.getPosition();
            var dis = cc.Vec2.distance(cc.v2(pos.x,pos.z),cc.v2(p.x,p.z));
            if(dis<this.tarDis)
            {
                return true;
            }
        }
        return false;
    }

    coll(target){
        this.isColl = true;
        this.isPause = true;
        var toPos = this.node.getPosition();
        var pos = target.node.getPosition();
        var dir = cc.v2(toPos.x,toPos.z).subtract(cc.v2(pos.x,pos.z)).normalize();
        toPos.x += dir.x*2;
        toPos.z += dir.y*2;
        var self = this;
        var t1 = 0.2;
        var t2 = 0.9;
        // if(target.lv>this.followTarget.lv)
        {
            t1 = 0.2;
            t2 = 2.3;
        }
        // var anisc = this.node.getComponent(ani);

        self.scheduleOnce(function(){
            // anisc.moveTo(t1,toPos,function(){
            //     self.scheduleOnce(function(){
            //         self.isColl = false;
            //      },t2);
            // });
            self.isColl = false;
            self.dropGoods(target);
            self.isPause = false;
         },0.5);
        

        // this.followTarget.collPlayerPack(target);

    }

    //掉落商品
    dropGoods(player)
    {
        var dropNum = Math.floor(this.goodss.length/2);
        if(dropNum>8) dropNum = 8;
        for(var i=0;i<dropNum;i++)
        {
            var goods = this.goodss[i];
            goods.node.active = true;
            // goods.drop();
            this.followTarget.addScore(-Number(goods.conf.Score));

            var p = cc.v3(goods.node.getWorldPosition());
            p.y = 0;
            goods.node.setPosition(p);
            goods.node.parent = this.gameControl.goodsNode;

            var tpos = player.follow[0].node.getPosition();//this.gameControl.cashier.getPosition()
            goods.die(tpos,i*0.05+0.14,player.isPlayerSelf,player.follow[0]);
            player.addScore(Number(goods.conf.Score));
            player.addScoreAni(i*0.05+0.14,Number(goods.conf.Score));
            // goods.drop(player.node.getPosition(),i*0.05,this.followTarget.isPlayerSelf);

        }
        this.goodss.splice(0,dropNum);
        this.playDropAni();
    }

    updateMoveDir(){
        if(this.followTarget != null ) //&&  !this.isColl
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
        if(this.followTarget)//!this.isColl && 
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
        // if(this.isPause) return;
        if(this.gameControl.isStart)
        {
            this.upDirDt += deltaTime;
            if(this.upDirDt>=0.1)
            {
                this.upDirDt = 0;
                this.updateMoveDir();
                this.tarPlayer = this.followTarget.findOtherPlayer();
            }
            
            this.updateStep(deltaTime);

            //判断碰撞
            if(this.tarPlayer)
            {
                var p = this.tarPlayer.node.getPosition();
                if(this.canColl(p)) this.coll(this.tarPlayer);
            }
            
        }
       else
       {
            this.isMove = false; 
        //    this.idle();
       }
    }
}
