import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;
import { Player } from "./Player"
import { Astar } from "../tools/Astar"
import { config } from "../config"

@ccclass("Robot")
export class Robot extends Player {

    roadList = [];

    robotState = "idle";

    toWanderTime = 0;
    toIdleTime = 0;
    roadListTime = 0;
    toPostGoodsTime = 0;
    toPostGoodsTime2 = 0;
    toRobTime = 0;
    toAvoidTime = 0;

    updateDirTime = 1;

    toHoldGoodsNum = 0;

    aiDt = 0;

    findGoodsState = 0;

    isCanRmovePath = false;

    start () {
        this.isRobot = true;
        super.start();

    }

    onDestroy(){
    }


    findRoad(tarPoint){
       
        var p = cc.v3(this.node.getPosition());
        cc.log("tarPoint",tarPoint);
                
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
        this.isCanRmovePath = astar.isFind;
        this.updateDirTime = 0;
        cc.log("耗时"+(new Date().getTime()-now));
        this.roadList.shift(); //JSON.parse(JSON.stringify(this.roadList))
    }

    //基础ai
    ai(){
        //判断收银
        if(this.robotState != "toPostGoods" && this.robotState != "toAvoid" && this.toPostGoodsTime2>0.5 && Math.random()*100 <= Number(this.robotConflv.pay) && this.canPostGoods())
        {
            this.robotState = "toPostGoods";
            this.toPostGoodsTime = 0;
        }

        //判断拿货 
        if(this.robotState != "toHoldGoods" && this.robotState != "toPostGoods" && this.robotState != "toAvoid" && this.robotState != "toRob" && this.toHoldGoodsTime > 2 && Math.random()*100 <= Number(this.robotConflv.collect)+Number(this.robotConfId.collect))
        {
            this.robotState = "toHoldGoods";
            //找到最近的拿货点
            var p1 = this.node.getPosition();
            if(this.gameControl.robotConfPath[this.pathType].length == 0)
            {
                this.gameControl.robotConfPath[this.pathType] = JSON.parse(JSON.stringify(this.gameControl.robotRemovePath[this.pathType]));
                this.gameControl.robotRemovePath[this.pathType] = [];
            }
            var p2 = this.gameControl.robotConfPath[this.pathType][0];
            var robotConfPathId = 0;
            for(var i=1;i<this.gameControl.robotConfPath[this.pathType].length;i++)
            {
                var p3 = this.gameControl.robotConfPath[this.pathType][i];
                var dis1 = cc.Vec2.distance(cc.v2(p1.x,p1.z),cc.v2(p2.x,p2.y));
                var dis2 = cc.Vec2.distance(cc.v2(p1.x,p1.z),cc.v2(p3.x,p3.y));
                if(dis2<dis1)
                {
                    p2 = p3;
                    robotConfPathId = i;
                }
            }
            this.gameControl.robotRemovePath[this.pathType].push(p2);
            this.gameControl.robotConfPath[this.pathType].splice(robotConfPathId,1);
            this.findRoad(cc.v2(p2.x,p2.y));
            this.toHoldGoodsTime = 0;
            this.findGoodsState = 0;
            this.tarGoods = null;
        }

        //判断躲避
        if(this.robotState != "toAvoid" && this.robotState != "toRob" && this.toAvoidTime <= 0 && Math.random()*100 <= Number(this.robotConfId.avoid)+Number(this.robotConflv.avoid))
        {
            var pla = this.findOtherPlayer();
            if(pla)
            {
                this.tarPlayer = pla;
                // var anps = this.updateAstar();
                
                // //计算离对方反方向的点
                // var p = this.node.getPosition();
                // var p2 = pla.node.getPosition();
                // var dir = cc.v2(p.x,p.z).subtract(cc.v2(p2.x,p2.z)).normalize();
                // p.x += dir.x*2;
                // p.z += dir.y*2;

                // this.findRoad(cc.v2(p.x,p.y));

                this.toAvoidTime = 1;
                this.robotState = "toAvoid";   
                // for(var i=0;i<anps.length;i++)
                // {
                //     config.astarmap[anps[i].y][anps[i].x] = 1;
                // }
            }
        }
        //躲避间隔
        if(this.toAvoidTime<=0) this.toAvoidTime = 0.3;

        //判断抢夺
        if(this.robotState != "toPostGoods" && this.robotState != "toRob" && this.robotState != "toAvoid" && this.toRobTime <= 0 && Math.random()*100 <= Number(this.robotConfId.rob)+Number(this.robotConflv.rob))
        {
            var pla = this.findOtherPlayerPack();
            if(pla) //.currCapacity > 0  && this.currCapacity<=Number(this.conf.Capacity)
            {
                this.tarPlayer = pla;
                this.toRobTime = 1;
                this.robotState = "toRob";   
                this.showEmoji("attack");
            }
        }
        //抢夺间隔
        if(this.toRobTime<=0) this.toRobTime = 0.3;

       
        if(Math.random()<0.2) cc.log(this.robotState);
    }

    updateAi(dt){
        this.isMove = true; 
        this.isExcColl = true;

        this.toRobTime -= dt;
        this.toAvoidTime -= dt;
        this.updateDirTime += dt;
        this.toHoldGoodsTime += dt;
        this.toPostGoodsTime2 += dt;


        var p = this.node.getPosition();

        if(this.robotState == "toPostGoods")
        {
            this.isMove = false; 
            this.moveDir = cc.v2(0,0);
            if(this.goods.length<=0) 
            {
                this.toPostGoodsTime += dt;
                if(this.toPostGoodsTime>0.5)
                {
                    this.toPostGoodsTime = 0;
                    this.robotState = "toHoldGoods";
                }
            }
            return;
        }
        else if(this.robotState == "toHoldGoods")
        {

            if(this.tarGoods) // && this.toHoldGoodsNum<6
            {
                var np = this.tarGoods.node.getPosition();
                var dis = cc.Vec2.distance(cc.v2(np.x,np.y),cc.v2(p.x,p.z));
                if(dis>0.02)// && this.updateDirTime>0.25
                {
                    this.updateDirTime = 0;    
                    this.moveDir = cc.v2(np.x,np.z).subtract(cc.v2(p.x,p.z)).normalize();
                    if(Math.random()<0.008)  cc.log("物品方向");
                }
                else{
                    this.moveDir = cc.v2(0,0);
                    cc.log("到达物品");
                }
                // if(this.toHoldGoodsTime>0.5)
                // {
                //     this.toHoldGoodsNum ++;
                //     this.toHoldGoodsTime = 0;
                //     // this.moveDir.rotate((Math.random()-0.5)*(Math.PI+Math.PI/4));
                //     this.moveDir.rotate(this.toHoldGoodsNum*Math.PI/18);
                //     cc.log(this.toHoldGoodsNum);
                // }
               
                return;
            }
        }
        else if(this.robotState == "toAvoid")
        {
            if(this.toAvoidTime>0 && this.tarPlayer)
            {
                var pp = this.tarPlayer.node.getPosition();
                var p2 = this.follow[0].node.getPosition();
                var dis1 = cc.Vec2.distance(cc.v2(pp.x,pp.z),cc.v2(p.x,p.z));
                var dis2 = cc.Vec2.distance(cc.v2(p2.x,p2.z),cc.v2(p.x,p.z));

                // if(dis1>dis2 && this.lv <= this.tarPlayer.lv)
                // {
                //     this.moveDir = cc.v2(p.x,p.z).subtract(cc.v2(pp.x,pp.z)).normalize();
                // }
                // else
                {
                    this.moveDir = cc.v2(pp.x,pp.z).subtract(cc.v2(p.x,p.z)).normalize();
                }

            }
            else 
            {
                this.robotState = "toIdle";
                this.moveDir = cc.v2(0,0);
                this.toAvoidTime = 1;
            }
        }
        else if(this.robotState == "toRob")
        {
            if(this.toRobTime>0 && this.tarPlayer)
            {
                var p1 = this.tarPlayer.node.getPosition();
                var p2 = this.tarPlayer.follow[0].node.getPosition();
                var dis1 = cc.Vec2.distance(cc.v2(p1.x,p1.z),cc.v2(p.x,p.z));
                var dis2 = cc.Vec2.distance(cc.v2(p2.x,p2.z),cc.v2(p.x,p.z));

                // if(dis1>dis2)
                {
                    this.moveDir = cc.v2(p2.x,p2.z).subtract(cc.v2(p.x,p.z)).normalize();
                }
                // else
                // {
                //     this.moveDir = cc.v2(p.x,p.z).subtract(cc.v2(p1.x,p1.z)).normalize();
                // }
            }
            else
            {
                this.robotState = "toIdle";
                this.moveDir = cc.v2(0,0);
                this.toRobTime = 2;
            }
        }
        else if(this.robotState == "toIdle")
        {
            this.isMove = false; 
        }



        if(this.robotState == "toHoldGoods")
        {
            this.isExcColl = false;

            if(this.roadList.length > 0)
            {
                var node = this.roadList[0];
                var dis = cc.Vec2.distance(cc.v2(node.x,node.y),cc.v2(p.x,p.z));
                if(dis<0.05)
                {
                    this.roadList.shift();
                    if(this.roadList.length > 0) node = this.roadList[0];
                    this.moveDir = cc.v2(node.x,node.y).subtract(cc.v2(p.x,p.z)).normalize();
                }
                if(this.updateDirTime>0.1)
                {
                    this.updateDirTime = 0;
                    this.moveDir = cc.v2(node.x,node.y).subtract(cc.v2(p.x,p.z)).normalize();
                }
                if(dis>2 || this.roadList.length == 0)
                {
                    this.robotState = "toIdle";
                    this.moveDir = cc.v2(0,0);
                    this.isMove = false; 
                    // if(this.roadList.length == 0)
                    // {
                    //     this.robotConfPath.splice(this.robotConfPathId,1);
                    // }
                    // else{
                    //     cc.log("dis>1=",dis);
                    // }
                }
            }
            else{
                this.robotState = "toIdle";
                this.moveDir = cc.v2(0,0);
                this.isMove = false; 
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
        this.findCanHoldGoods(0);
    }
}
