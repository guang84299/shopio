import { _decorator, Component, Node,AnimationComponent,ModelComponent,LineComponent } from "cc";
const { ccclass, property } = _decorator;
import { Player } from "./Player"
import { Goods } from "./Goods"
import { GBoxColl } from "../GColl/GBoxColl"
import { ani } from "../ani"
import { storage } from "../storage";

@ccclass("PlayerPack")
export class PlayerPack extends Component {

    public followTarget = null;
    public isColl = false;
    isMove = false;
    isPlayPost = false;
    isPlayDrop = false;
    moveDir = cc.v2(0,0);
    gameControl = null;
    // gcoll = null;
    goodss = [];
    goodsNode = null;
    packNode = null;
    // lineNode = null;
    line = null;
    uiNodePos = null;
    uiNode = null;


    maxGoods = null;

    tarPlayer = null;

    currDis = 0;

    tarDis = 1;
    private upDirDt = 10;

    packLv = 1;

    scoreAniNum = 0;

    aniTime = 0;

    dropSpeed = [0.5,0.5,0.25,0.25,0.166,0.166,0.125,0.125,0.125,0.125,0.125,0.125];
    rotateName = "Res216,Res217,Res218,Res219,Res220,Res221,Res222,Res310,Res311,Res312,Res313";
    rotateName2 = "Res515,Res516,Res517";
    
    start () {
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        // this.gcoll = this.node.getComponent(GBoxColl);
        this.goodsNode = cc.find("goods",this.node);
        this.packNode = cc.find("pack",this.node);

        var ballId = 0;
        if(this.followTarget.isPlayerSelf)
        {
            ballId = storage.getStorage(storage.ballid);
            if(cc.GAME.shiyongBallId > 0) ballId = cc.GAME.shiyongBallId;
        }
        else 
        {
            if(Math.random()<0.4) ballId = Math.floor(Math.random()*4)+1;
        }
        if(ballId != 0)
        {
            this.packNode.destroy();
            this.packNode = cc.instantiate(cc.find("RootNode/ball"+ballId,cc.instantiate(cc.res.loads["prefab_skin_ball"])));
            this.packNode.setPosition(cc.v3(0,0,0));
            this.packNode.parent = this.node;
        }
        // this.lineNode = cc.find("line",this.node);
        this.uiNodePos =  cc.find("uiNode",this.node);
        this.uiNode = new cc.Node();
        this.uiNode.parent = this.gameControl.gameUI;

        this.lvUp(1);
        this.node.addComponent(ani);

        var material = this.packNode.getComponent(ModelComponent).material;   
        material.setProperty('albedo', this.followTarget.bodyColor); 
        // this.line = this.lineNode.getComponent(LineComponent);   
        // this.line.color.color = this.followTarget.bodyColor;
    }

    holdGoods(goods){
        this.goodss.push(goods);

        var h = this.goodss.length>12 ? 3 : Math.floor(this.goodss.length/4);
        goods.node.parent = this.goodsNode;
        var max1 = Math.max(goods.gBoxColl.height,goods.gBoxColl.width);
        if(max1>=1) 
        {
            // goods.node.setRotationFromEuler(0,0,90);
            if(this.maxGoods)
            {
                var max2 = Math.max(this.maxGoods.gBoxColl.height,this.maxGoods.gBoxColl.width);
                if(max1>max2) this.maxGoods = goods;
            }
            else this.maxGoods = goods;
        }
        else if(this.rotateName.indexOf(goods.node.name) != -1)
        {
            goods.node.setRotationFromEuler(0,0,180);
        }
        else if(this.rotateName2.indexOf(goods.node.name) != -1)
        {
            goods.node.setRotationFromEuler(0,0,90);
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
            // cc.log(i,good);
            var spre = 0.5;
            if(good.gBoxColl.height>0.5) spre = 0.8;
            good.node.setPosition(cc.v3((Math.random()-0.5)*0.5,0.1*(h-(n%4))+good.gBoxColl.height*spre-0.3,(Math.random()-0.5)*0.5));
            n++;
            if(n>12) 
            {
                good.node.active = false;
            }
            if(n>15) break;
        }
        this.playPostAni();

        // var upData = this.followTarget.getPackLv(this.packLv,true);
        // if(upData.lv != this.packLv)
        // {
        //     this.packLv = upData.lv;
        //     this.lvUp(upData.len);
        // }

        this.addScoreAni(Number(goods.conf.Score));
    }

    //新增分数动画
    addScoreAni(score){
        if(this.aniTime>0) return;
        this.aniTime = 1;
        var node = cc.res.getObjByPool("prefab_ui_score");
        node.parent = this.uiNode;
        node.setPosition(cc.v3(0,40+this.scoreAniNum*10,0));
        node.setScale(1,1,1);
        node.getComponent(cc.LabelComponent).string = "+"+score;
        if(score<20) node.getComponent(AnimationComponent).play("score1");
        else  node.getComponent(AnimationComponent).play("score2");
        this.scoreAniNum ++;
        if( this.scoreAniNum>5)  this.scoreAniNum = 0;
        // var anisc = node.getComponent(ani);
        // anisc.moveTo(1.0,cc.v3(0,200,0));
        // anisc.scaleTo(1.0,cc.v3(0.5,0.5,0.5),function(){
        //     cc.res.putObjByPool(node,"prefab_ui_score");
        // });

        this.scheduleOnce(function(){
            cc.res.putObjByPool(node,"prefab_ui_score");
        },1);

        if(this.followTarget.isPlayerSelf)
        {
            cc.audio.playSound("coin");
        } 
    }

    playPostAni(){
        if(!this.isPlayPost && !this.isPlayDrop)
        {
            // this.isPlayPost = true;
            // this.node.getComponent(AnimationComponent).play();
            // var self = this;
            // this.scheduleOnce(function(){
            //     self.isPlayPost = false;
            // },0.5);
        }
    }

    playDropAni(){
        if(!this.isPlayDrop)
        {
            this.isPlayDrop = true;
            var material = this.packNode.getComponent(ModelComponent).material;   
            material.setProperty('albedo', new cc.Color("#ff0000")); 
            // this.node.getComponent(AnimationComponent).play("animrob");
            var self = this;
            this.scheduleOnce(function(){
                self.isPlayDrop = false;
                material.setProperty('albedo', self.followTarget.bodyColor); 
            },0.5);
        }
    }



    lvUp(num){
        this.packNode.setScale(num,num*0.6,num);
        this.tarDis = num/5+0.5;
        // if(this.tarDis<1) this.tarDis = 1;
        this.uiNodePos.setPosition(cc.v3(0,num*0.6/2,0));

        this.node.setPosition(0,0,-num*0.4);//-0.25

        var goodsSc = num*0.5;
        this.goodsNode.setScale(goodsSc,goodsSc,goodsSc);
    }

    canColl(pos){
        if(!this.isColl)
        {
            var p = this.node.getWorldPosition();
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
        var toPos = this.node.getWorldPosition();
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
        var time = this.dropSpeed[target.lv-1];
        self.scheduleOnce(function(){
            // anisc.moveTo(t1,toPos,function(){
            //     self.scheduleOnce(function(){
            //         self.isColl = false;
            //      },t2);
            // });
            self.isColl = false;
            self.dropGoods(target);
         },time);

         
        
        //  if(target.isPlayerSelf)
        //  {
        //     cc.audio.playSound("rob");
        //  }

        // this.followTarget.collPlayerPack(target);

    }

    //掉落商品
    dropGoods(player)
    {
        var dropNum = 1; //Math.floor(this.goodss.length/2);
        // if(player.lv>=this.followTarget.lv)
        // {
        //     dropNum += player.lv-this.followTarget.lv;
        //     if(dropNum>8) dropNum = 8;
        // }
        // else{
        //     dropNum = 2;
        //     if(Math.abs(player.lv-this.followTarget.lv)<4) dropNum = 1;
        // }
        if(dropNum>this.goodss.length) dropNum = this.goodss.length;
        var score = 0;
        for(var i=0;i<dropNum;i++)
        {
            var goods = this.goodss[i];
            goods.node.active = true;
            // goods.drop();
            this.followTarget.addScore(-Number(goods.conf.Score));
            score += Number(goods.conf.Score);

            var p = cc.v3(goods.node.getWorldPosition());
            p.y = 0;
            goods.node.setPosition(p);
            goods.node.parent = this.gameControl.goodsNode;

            var tpos = player.follow[0].node.getWorldPosition();//this.gameControl.cashier.getPosition()
            goods.die(tpos,i*0.05+0.04,player.isPlayerSelf,player.follow[0]);
            player.addScore(Number(goods.conf.Score));
            // if(player.isPlayerSelf)
            // {
            //     this.dropSound(i*1.2+0.04);
            // }
            // player.addScoreAni(i*0.05+0.14,Number(goods.conf.Score));
            // goods.drop(player.node.getPosition(),i*0.05,this.followTarget.isPlayerSelf);

        }
        this.goodss.splice(0,dropNum);
        this.playDropAni();

        if(this.followTarget.isPlayerSelf)
        {
            if(this.gameControl.tipNum2<3 && new Date().getTime()-cc.res.tipTime>5000)
            {
                this.gameControl.tipNum2 ++;
                cc.res.showTips("你被偷了！:(");
            }
        }
        if(player.isPlayerSelf)
         {
            if(this.gameControl.tipNum3<3 && new Date().getTime()-cc.res.tipTime>5000)
            {
                this.gameControl.tipNum3 ++;
                cc.res.showTips("偷的好爽！:)");
            }

            if(this.goodss.length<=2 && this.gameControl.tipNum4<3 && new Date().getTime()-cc.res.tipTime>5000)
            {
                this.gameControl.tipNum4 ++;
                cc.res.showTips("干掉一个！");
            }

            cc.audio.playSound("rob");
            cc.sdk.vibrate(true);
         }
        // cc.log(dropNum,score);

        // var upData = this.followTarget.getPackLv(this.packLv,false);
        // if(upData.lv != this.packLv)
        // {
        //     this.packLv = upData.lv;
        //     this.lvUp(upData.len);
        // }
    }

    dropSound(time){
        this.scheduleOnce(function(){
            cc.audio.playSound("rob");
        },time);
    }

    //掉落商品
    dropGoodsDie()
    {
        var dropNum = this.goodss.length;
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

            var tpos = this.node.getWorldPosition();//this.gameControl.cashier.getPosition()
            tpos.x += (Math.random()-0.5)*2;
            tpos.z += (Math.random()-0.5)*2;
            goods.die2(tpos,i*0.05+0.04,this.followTarget.isPlayerSelf,this,i<18);
            if(i<18)
            {
                goods.node["isauto"] = true;
            }

        }
        this.goodss.splice(0,dropNum);
        this.maxGoods = null;
        this.playDropAni();

        if(this.followTarget.isPlayerSelf)
        {
            if(this.gameControl.tipNum5<3 && new Date().getTime()-cc.res.tipTime>5000)
            {
                this.gameControl.tipNum5 ++;
                cc.res.showTips("我出局了！");
            }
            this.scheduleOnce(function(){
                cc.audio.playSound("die");
            },0.5);
            cc.audio.playSound("dogyaoren");
        }
    }

    updateMoveDir(){
        if(this.followTarget != null ) //&&  !this.isColl
        {
            this.isMove = false;   
            var p1 = this.node.getPosition();
            var p2 = this.followTarget.node.getPosition();
            var dir = cc.v2(p2.x,p2.z).subtract(cc.v2(p1.x,p1.z)).normalize();
            var dis = cc.Vec2.distance(cc.v2(p1.x,p1.z),cc.v2(p2.x,p2.z));
            this.currDis = dis;
            if(dis>this.tarDis)
            {
                this.moveDir = dir;
                this.isMove = true;   
                this.line.positions = [cc.v3(p1.x,this.tarDis/2,p1.z),cc.v3(p2.x+dir.x*0.2,0.5,p2.z+dir.y*0.2)]; 
            }
            else
            {
                this.line.positions = [cc.v3(p1.x,this.tarDis/2,p1.z),cc.v3(p2.x,0.5,p2.z)];
                this.moveDir = cc.v2(0,0);
            }
            this.line.width.constant = (1.2-dis/this.tarDis)*0.3;
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

            // var rad2 = cc.v2(-dir.x,dir.y).signAngle(cc.v2(0,1));
            // var ang2 = 180/Math.PI*rad2;
            // this.lineNode.setRotationFromEuler(0,ang2,0);
        }
    }

    updateUI(){
        // var p = this.gameControl.camera.worldToScreen(this.nickNode.getWorldPosition());
        var p = cc.pipelineUtils.WorldNode3DToWorldNodeUI(this.gameControl.camera,this.uiNodePos.getWorldPosition(),this.gameControl.gameUI);
        var dis = Math.abs(this.gameControl.camera.node.getWorldPosition().z - this.node.getWorldPosition().z);
        this.uiNode.setWorldPosition(p);
        var sc = 10/dis;
        if(sc>1) sc = 1;
        this.uiNode.setScale(sc, sc, 1);
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
        if(this.gameControl.isStart)
        {
            this.upDirDt += deltaTime;
            this.aniTime -= deltaTime;
            if(this.upDirDt>=0.1)
            {
                this.upDirDt = 0;
                this.tarPlayer = this.followTarget.findOtherPlayer();
                this.updateUI();
            }
            // this.updateMoveDir();
            // this.updateStep(deltaTime);

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
