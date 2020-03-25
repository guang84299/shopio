import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;
import { Player } from "./Player"
import { Astar } from "../tools/Astar"

@ccclass("Robot")
export class Robot extends Player {

    protected roadList = [];

    protected robotState = "idle";
    protected toHoldGoodsTime = 0;
    protected toRobTime = 0;
    protected toAvoidTime = 0;
    protected toAvoidDogTime = 0;
    protected judgeRobTime = 0;
    protected judgeAvoidTime = 0;
    protected judgeAvoidDogTime = 0;

    protected updateDirTime = 1;
    protected tarDog = null;

    protected aiDt = 0;

    protected pathIndex = -1;

    start () {
        this.isRobot = true;
        super.start();
    }

    onDestroy(){

    }


    findRoad(tarPoint){
       
        var p = cc.v3(this.node.getPosition());
        cc.log("tarPoint",tarPoint,p);
                
        var currCollPos = null;
        if(cc.isValid(this.currCollNode))
        {
            var p2 = this.currCollNode.getPosition();
            currCollPos = cc.v2(p2.x,p2.z);
        }
        var now = new Date().getTime();
        var astar = new Astar();
        astar.findPath({x:p.x,y:p.z},{x:tarPoint.x,y:tarPoint.y},currCollPos);
        this.roadList = astar.pathList;
        this.updateDirTime = 0;
        cc.log("耗时"+(new Date().getTime()-now));
        this.roadList.shift(); //JSON.parse(JSON.stringify(this.roadList))
    }

    ai(){
        //判断拿货 
        if(this.robotState != "toHoldGoods" && this.robotState != "toAvoid" && this.robotState != "toRob" && this.toHoldGoodsTime > 2 && Math.random()*100 <= Number(this.robotConflv.collect)+Number(this.robotConfId.collect))
        {
            this.robotState = "toHoldGoods";
            this.toHoldGoodsTime = 0;
        }

        //判断躲避
        if(this.robotState != "toAvoid" && this.robotState != "toRob" && this.judgeAvoidTime > 0)
        {
            var pla = this.findOtherPlayer();
            if(pla && Math.random()*100 <= Number(this.robotConfId.avoid)+Number(this.robotConflv.avoid))
            {
                this.tarPlayer = pla;
                this.judgeAvoidTime = 0;
                this.robotState = "toAvoid";  
                this.toAvoidTime = 2;
                this.isExcColl2 = true;
            }
        }

        //判断抢夺
        if(this.robotState != "toRob" && this.robotState != "toAvoid" && this.judgeRobTime > 0)
        {
            var pla = this.findOtherPlayerPack();
            if(pla && Math.random()*100 <= Number(this.robotConfId.rob)+Number(this.robotConflv.rob))
            {
                this.tarPlayer = pla;
                this.judgeRobTime = 0;
                this.robotState = "toRob";   
                this.showEmoji("attack");
                this.toRobTime = 2;
                this.isExcColl2 = true;
            }
        }

        //判断躲避狗
        if(this.robotState != "toAvoidDog"  && this.judgeAvoidDogTime > 0)
        {
            var pla = this.findDog();
            if(pla && Math.random()*100 <= Number(this.robotConfId.avoid)+Number(this.robotConflv.avoid))
            {
                this.tarDog = pla;
                this.judgeAvoidDogTime = 0;
                this.robotState = "toAvoidDog";  
                this.toAvoidDogTime = 2;
                this.isExcColl2 = true;
            }
        }


        if(this.robotState == "toHoldGoods")
        {
            //如果没有路 就找到最近的路
            if(this.roadList.length == 0)
            {
                if(this.pathIndex == -1)
                {
                    this.pathIndex = this.pathType;
                    // this.pathIndex = 0;
                    // //找到最近的路
                    // var p1 = this.node.getPosition();
                    // var p2 = this.gameControl.goodsConfPath[this.pathIndex][0];
                    // var dis1 = cc.Vec2.distance(cc.v2(p2.x,p2.y),cc.v2(p1.x,p1.z));
                    // for(var i=1;i<this.gameControl.goodsConfPath.length;i++)
                    // {
                    //     var p3 = this.gameControl.goodsConfPath[i][0];
                    //     var dis2 = cc.Vec2.distance(cc.v2(p3.x,p3.y),cc.v2(p1.x,p1.z));
                    //     if(dis2<dis1)
                    //     {
                    //         dis2 = dis1;
                    //         this.pathIndex = i;
                    //     }
                    // }
                }
                else{
                    this.pathIndex++;
                    if(this.pathIndex>=this.gameControl.goodsConfPath.length) this.pathIndex = 0;
                }
                var p = this.gameControl.goodsConfPath[this.pathIndex][0];
                this.findRoad(cc.v2(p.x,p.y));
                for(var i=1;i<this.gameControl.goodsConfPath[this.pathIndex].length;i++)
                {
                    var node = this.gameControl.goodsConfPath[this.pathIndex][i];
                    this.roadList.push({x:Number(node.x),y:Number(node.y)});
                }
            }
        }
        
       
       
    }

    updateAi(dt){
        this.judgeRobTime += dt;
        this.judgeAvoidTime += dt;
        this.judgeAvoidDogTime += dt;

        this.toAvoidTime -= dt;
        this.toRobTime -= dt;
        this.toAvoidDogTime -= dt;
        this.toHoldGoodsTime += dt;
        this.updateDirTime += dt;

        var p = this.node.getPosition();
        this.isMove = true; 
        if(this.robotState == "toHoldGoods")
        {
            if(this.roadList.length > 0)
            {
                var node = this.roadList[0];
                var dis = cc.Vec2.distance(cc.v2(node.x,node.y),cc.v2(p.x,p.z));
                if(dis<0.05)
                {
                    this.roadList.shift();
                    if(this.roadList.length > 0) node = this.roadList[0];
                }
                if(this.updateDirTime>0.1)
                {
                    this.updateDirTime = 0;
                    this._tarDir = cc.v2(node.x,node.y).subtract(cc.v2(p.x,p.z)).normalize();
                }

                if(this.roadList.length == 0)
                {
                    this.robotState = "toIdle";
                    this._tarDir = cc.v2(0,0);
                    this.isMove = false; 
                }
            }
            else{
                this.robotState = "toIdle";
                this._tarDir = cc.v2(0,0);
                this.isMove = false; 
            }
        }
        else if(this.robotState == "toAvoid")
        {
            if(this.toAvoidTime>0 && this.tarPlayer)
            {
                var pp = this.tarPlayer.node.getPosition();
                var p2 = this.follow[0].node.getPosition();
                // var dis1 = cc.Vec2.distance(cc.v2(pp.x,pp.z),cc.v2(p.x,p.z));
                // var dis2 = cc.Vec2.distance(cc.v2(p2.x,p2.z),cc.v2(p.x,p.z));

                if(this.lv <= this.tarPlayer.lv)
                {
                    this._tarDir = cc.v2(p.x,p.z).subtract(cc.v2(pp.x,pp.z)).normalize();
                    this.toAvoidTime = 0;
                    this.speedUp();
                }
                else
                {
                    this._tarDir = cc.v2(pp.x,pp.z).subtract(cc.v2(p.x,p.z)).normalize();
                }

            }
            else 
            {
                this.robotState = "toIdle";
                this._tarDir = cc.v2(0,0);
                this.isMove = false; 
                this.isExcColl2 = false;
            }
        }
        else if(this.robotState == "toRob")
        {
            if(this.toRobTime>0 && this.tarPlayer)
            {
                // var p1 = this.tarPlayer.node.getPosition();
                var p2 = this.tarPlayer.follow[0].node.getPosition();
                this._tarDir = cc.v2(p2.x,p2.z).subtract(cc.v2(p.x,p.z)).normalize();
            }
            else
            {
                this.robotState = "toIdle";
                this._tarDir = cc.v2(0,0);
                this.isMove = false; 
                this.isExcColl2 = false;
            }
        }
        else if(this.robotState == "toAvoidDog")
        {
            if(this.toAvoidDogTime>0 && this.tarDog)
            {
                // var p1 = this.tarPlayer.node.getPosition();
                var p2 = this.tarDog.node.getPosition();
                this._tarDir = cc.v2(p.x,p.z).subtract(cc.v2(p2.x,p2.z)).normalize();
                if(Math.random()<0.5)
                {
                    this.toAvoidDogTime = 0;
                    this.speedUp();
                }
            }
            else
            {
                this.robotState = "toIdle";
                this._tarDir = cc.v2(0,0);
                this.isMove = false; 
                this.isExcColl2 = false;
            }
        }
    }

    update (deltaTime: number) {
        if(this.gameControl.isStart)
        {
            if(!this.isColl)
            this.updateAi(deltaTime);
            this.updateStep(deltaTime);
        }
        else{
            this.isMove = false; 
            this.idle();
        }
    }

    lateUpdate(dt: number){
        if(!this.gameControl.isStart) return;
       
        this.aiDt += dt;
        if(this.aiDt > 0.1)
        {
            this.aiDt = 0;
            this.ai();
        }

    }
}
