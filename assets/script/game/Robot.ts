import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;
import { Player } from "./Player"
import { Astar } from "../tools/Astar"
import { config } from "../config"

@ccclass("Robot")
export class Robot extends Player {

    roadList = [];

    isExcAi = false;
    robotState = "idle";

    toWanderTime = 0;
    toIdleTime = 0;
    roadListTime = 0;
    toPostGoodsTime = 0;
    toRobTime = 0;
    toAvoidTime = 0;

    updateDirTime = 1;

    toHoldGoodsNum = 0;

    ai2Dt = 0;

    findGoodsState = 0;
    robotConfPathId = -1;

    removePath = [];
    isCanRmovePath = false;

    start () {
        this.isRobot = true;
        super.start();

        this.node.on("excAi",this.excAi.bind(this), this);
        // this.ai();
    }

    onDestroy(){
        this.node.off("excAi",this.excAi.bind(this), this);
    }

    excAi(){
        this.isExcAi = true;
    }

    updateMoveDir2(deltaTime){
        if(!this.isColl)
        {
            var p = this.node.getPosition();
            if(this.robotState == "toHoldGoods")
            {
                if(cc.isValid(this.tarGoods) && this.toHoldGoodsNum<6)
                {
                    this.toHoldGoodsTime += deltaTime;
                    var np = this.tarGoods.getPosition();
                    var dis = cc.Vec2.distance(cc.v2(np.x,np.y),cc.v2(p.x,p.z));
                    if(dis>0.05 && this.toHoldGoodsTime>0.25*2)
                        this.moveDir = cc.v2(np.x,np.z).subtract(cc.v2(p.x,p.z)).normalize();
                    if(this.toHoldGoodsTime>0.5)
                    {
                        this.toHoldGoodsNum ++;
                        this.toHoldGoodsTime = 0;
                        this.moveDir.rotate((Math.random()-0.5)*(Math.PI+Math.PI/4));

                        if(this.canPostGoods()) this.excAi();
                    }
                    cc.log("this.toHoldGoodsNum=",this.toHoldGoodsNum);
                }
                else
                {
                    if(this.roadList.length > 0)
                    {
                        var node = this.roadList[0];
                        var dis = cc.Vec2.distance(cc.v2(node.x,node.y),cc.v2(p.x,p.z));
                        if(dis<0.05 || this.roadListTime > 6)
                        {
                            this.roadList.shift();
                            if(this.roadList.length > 0)
                            {
                                node = this.roadList[0];
                                dis = cc.Vec2.distance(cc.v2(node.x,node.y),cc.v2(p.x,p.z));
                                if(dis<0.05)
                                {
                                    this.roadList.shift();
                                    if(this.roadList.length > 0)
                                        node = this.roadList[0];
                                }
                            }
                            this.roadListTime = 0;

                            if(!cc.isValid(this.tarGoods))
                            {
                                this.findGoodsState = 1;
                                this.toHoldGoodsNum = 0;
                            }
                            if(this.canPostGoods()) this.excAi();

                            this.moveDir = cc.v2(node.x,node.y).subtract(cc.v2(p.x,p.z)).normalize();
                        }
                        if(this.updateDirTime>0.05*2)
                        {
                            this.updateDirTime = 0;
                            this.moveDir = cc.v2(node.x,node.y).subtract(cc.v2(p.x,p.z)).normalize();
                        }
                        this.roadListTime += deltaTime;
                        this.toHoldGoodsTime = 0;
                    }
                    else
                    {
                        this.toHoldGoodsTime += deltaTime;
                        if(this.toHoldGoodsTime>1)
                        {
                            this.excAi();
                        }
                        else
                        {
                            if(this.isCanRmovePath && this.robotConfPath.length>1 && !cc.isValid(this.tarGoods)) 
                            {
                                this.isCanRmovePath = false;
                                this.removePath.push(this.robotConfPath[this.robotConfPathId]);
                                this.robotConfPath.splice(this.robotConfPathId,1);
                                // this.removePath.push(pa);
                            }
                            if(!cc.isValid(this.tarGoods))
                            {
                                this.findGoodsState = 1;
                                this.toHoldGoodsNum = 0;
                            }
                        }
                    }
                }
            }
            else if(this.robotState == "toWander")
            {
                 this.toWanderTime+=deltaTime;
                 if(Math.random()<0.05)
                     this.moveDir = cc.v2(Math.random()-0.5,Math.random()-0.5).normalize();

                 if(this.toWanderTime>Number(this.robotConfId.wandertime)/2)
                 {
                     this.excAi();
                 }
            }
            else if(this.robotState == "toPostGoods")
            {
                if(this.roadList.length > 0)
                {
                    var node = this.roadList[0];
                    var dis = cc.Vec2.distance(cc.v2(node.x,node.y),cc.v2(p.x,p.z));
                    if(dis<0.05 || this.roadListTime > 6)
                    {
                        this.roadList.shift();
                        if(this.roadList.length > 0)
                        {
                            node = this.roadList[0];
                            dis = cc.Vec2.distance(cc.v2(node.x,node.y),cc.v2(p.x,p.z));
                            if(dis<0.05)
                            {
                                this.roadList.shift();
                                if(this.roadList.length > 0)
                                    node = this.roadList[0];
                            }
                        }
                        // cc.log(this.roadListTime);
                        this.roadListTime = 0;
                        this.moveDir = cc.v2(node.x,node.y).subtract(cc.v2(p.x,p.z)).normalize();
                    }
                    if(this.updateDirTime>0.05)
                    {
                        this.updateDirTime = 0;
                        this.moveDir = cc.v2(node.x,node.y).subtract(cc.v2(p.x,p.z)).normalize();
                    }
                    
                    this.roadListTime += deltaTime;
                }
                else{
                    this.toPostGoodsTime += deltaTime;
                    if(this.toPostGoodsTime>1)
                    {
                        this.excAi();
                    }
                }
            }
            else if(this.robotState == "toRob")
            {
                if(cc.isValid(this.tarPlayer))
                {
                    var np = this.tarPlayer.node.getPosition();
                    this.moveDir = cc.v2(np.x,np.z).subtract(cc.v2(p.x,p.z)).normalize();
                    // cc.log("tarGoods move");
                }

                this.toRobTime += deltaTime;
                if(this.toRobTime>2)
                {
                    this.excAi();
                }
            }
            else if(this.robotState == "toAvoid")
            {
                if(cc.isValid(this.tarPlayer))
                {
                    var np = this.tarPlayer.node.getPosition();
                    this.moveDir = cc.v2(np.x,np.z).subtract(cc.v2(p.x,p.z)).normalize().multiplyScalar(-1);
                }

                this.toAvoidTime += deltaTime;
                if(this.toAvoidTime>2)
                {
                    this.excAi();
                }
            }
           
            if(this.robotState == "toIdle")
            {
                this.isMove = false; 
                this.toIdleTime+=deltaTime;
                if(this.toIdleTime>3)
                {
                    this.excAi();
                }
            }
            else{
                this.isMove = true; 
            }     
           
        }
    }

    updateMoveDir(deltaTime){
        if(!this.isColl)
        {
            if(this.robotState == "toIdle")
            {
                this.isMove = false; 
                this.toIdleTime+=deltaTime;
                if(this.toIdleTime>3)
                {
                    this.excAi();
                }
            }
            else{
                this.isMove = true; 
            }    
            var p = this.node.getPosition();
            this.updateDirTime += deltaTime;

            
            if(this.robotState == "toHoldGoods")
            {
                if(cc.isValid(this.tarGoods) && this.toHoldGoodsNum<6)
                {
                    this.toHoldGoodsTime += deltaTime;
                    var np = this.tarGoods.getPosition();
                    var dis = cc.Vec2.distance(cc.v2(np.x,np.y),cc.v2(p.x,p.z));
                    if(dis>0.01 && this.updateDirTime>0.25)
                    {
                        this.updateDirTime = 0;    
                        this.moveDir = cc.v2(np.x,np.z).subtract(cc.v2(p.x,p.z)).normalize();
                    }
                    if(this.toHoldGoodsTime>0.5)
                    {
                        this.toHoldGoodsNum ++;
                        this.toHoldGoodsTime = 0;
                        // this.moveDir.rotate((Math.random()-0.5)*(Math.PI+Math.PI/4));
                        this.moveDir.rotate(this.toHoldGoodsNum*Math.PI/18);
                        cc.log(this.toHoldGoodsNum);
                        if(this.canPostGoods()) this.excAi();
                    }
                    if(dis<0.05)
                    {
                        this.moveDir = cc.v2(0,0);
                        // this.isMove = false; 
                    }
                    this.roadList = [];
                }
                // cc.log(this.toHoldGoodsTime,this.toHoldGoodsNum,cc.isValid(this.tarGoods));
                if(cc.isValid(this.tarGoods) &&  this.toHoldGoodsNum<6) return;
            }
            else if(this.robotState == "toPostGoods")
            {
                this.isMove = false; 
                return;
            }
            else if(this.robotState == "toRob")
            {
                if(cc.isValid(this.tarPlayer) && this.updateDirTime>0.1)
                {
                    this.updateDirTime = 0;
                    var np = this.tarPlayer.node.getPosition();
                    this.moveDir = cc.v2(np.x,np.z).subtract(cc.v2(p.x,p.z)).normalize();
                }

                this.toRobTime += deltaTime;
                if(this.toRobTime>2)
                {
                    this.excAi();
                }
                return;
            }
            else if(this.robotState == "toAvoid")
            {
                this.toAvoidTime += deltaTime;
                if(this.toAvoidTime>0.2)
                {
                    this.robotState = "toIdle";
                    this.excAi();
                }
            }
           

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
                    if(this.robotState == "toHoldGoods")
                    {
                        if(!cc.isValid(this.tarGoods))
                        {
                            this.findGoodsState = 1;
                            this.toHoldGoodsNum = 0;
                        }
                    }
                }
                if(dis>2)
                {
                    this.moveDir = cc.v2(0,0);
                    this.isMove = false; 
                    this.excAi();
                    cc.log("dis>1=",dis,p.x,p.z,JSON.parse(JSON.stringify(this.roadList)));
                }
            }
            else
            {
                this.moveDir = cc.v2(0,0);
                this.isMove = false; 
                if(this.isCanRmovePath && this.robotConfPath.length>1 && !cc.isValid(this.tarGoods)) 
                {
                    this.isCanRmovePath = false;
                    this.removePath.push(this.robotConfPath[this.robotConfPathId]);
                    this.robotConfPath.splice(this.robotConfPathId,1);
                    // this.removePath.push(pa);
                }
                // cc.log("run end");
                this.excAi();
            }
           
        }
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

    getCurrVec(){
        var p = cc.v3(this.node.getPosition());
        // var dir = cc.v2(this.moveDir).multiplyScalar(5*1/50);
        // var p2 = cc.v3(p.x+dir.x,p.y,p.z+dir.y);
        // //找到可以寻路的点
        // var items = this.gcoll.excColl(p2,p);
        // if(items.length>0)
        // {
        //     var dir = items[0].dir;
        //     p.x -= dir.x;
        //     p.z -= dir.y;

        //     cc.log("gcoll",dir);
        // }
        p.x -= this.moveDir.x*1.2;
        p.z -= this.moveDir.y*1.2;
        // cc.log("gcoll",this.moveDir);
        return p;
    }

    //idle 待机  postGoods：交货   postGoodsEnd:交货完成  collectEnd: 收集完成 wanderEnd: 游荡完成

    ai(){
        if(this.robotState == "toRob" || this.robotState == "toAvoid") return;
        //判断收银
        if(Math.random()*100 <= Number(this.robotConflv.pay) && this.canPostGoods())
        {
            this.robotState = "toPostGoods";
            // var p = this.gameControl.cashier.getPosition();
            // this.findRoad(cc.v2(0,8));
            this.toPostGoodsTime = 0;
        }
        //判断拿货
        else// else if(Math.random()*100 <= Number(this.robotConflv.collect)+Number(this.robotConfId.collect))
        {
            this.robotState = "toHoldGoods";
            var p = null;
            // removePath
            if(this.robotConfPath.length > 0)
            {
                this.robotConfPathId = this.robotConfPath.length-1; 
                p = this.robotConfPath[this.robotConfPathId];//Math.floor(Math.random()*this.robotConfPath.length);
            }
            else
            {
                this.robotConfPathId = Math.floor(Math.random()*this.removePath.length);
                p = this.removePath[this.robotConfPathId];
            }
            // var pp = [cc.v2(-11,2),cc.v2(0,7)];
            this.findRoad(cc.v2(p.x,p.y));
            this.toHoldGoodsTime = 0;
            this.findGoodsState = 0;
            this.tarGoods = null;
        }
        //判断游荡
        // else if(Math.random()*100 <= Number(this.robotConflv.wander)+Number(this.robotConfId.wander))
        // {
        //     this.robotState = "toWander";   
        //     this.toWanderTime = 0;
        // }
        // else{
        //     this.robotState = "toIdle";
        //     this.idle();
        //     this.toIdleTime = 0;
        // }

        cc.log(this.robotState);
        // cc.log("robotConfPath",this.robotConfPath);

    }

    //判断抢夺和躲避
    ai2(){
        if(this.robotState == "toRob" || this.robotState == "toAvoid") return;
        if(this.robotState != "toPostGoods")
        {
            //判断抢夺
            var pla = this.findOtherPlayer(0);
            if(pla)
            {
                
                if(this.lv > pla.lv && Math.random()*100 <= Number(this.robotConfId.rob)
                && pla.currCapacity > 0
                && this.currCapacity<=Number(this.conf.Capacity))
                {
                    this.toRobTime = 0;
                    this.robotState = "toRob";   
                    this.showEmoji("attack");
                    // cc.log(this.robotState);
                }
    
                //判断躲避
                // if(this.robotState != "toRob" && 
                // this.lv < pla.lv && Math.random()*100 <= Number(this.robotConfId.avoid) )
                {
                    var anps = this.updateAstar();
                    this.ai();
                    this.toAvoidTime = 0;
                    this.robotState = "toAvoid";   

                    for(var i=0;i<anps.length;i++)
                    {
                        config.astarmap[anps[i].y][anps[i].x] = 1;
                    }

                    cc.log(this.robotState);  
                }
            }
        }
        else
        {
            //判断躲避
            var pla = this.findOtherPlayer(0);
            if(pla)
            {
                // if(this.lv < pla.lv && Math.random()*100 <= Number(this.robotConfId.avoid) )
                {
                    var anps = this.updateAstar();
                    this.ai();
                    this.toAvoidTime = 0;
                    this.robotState = "toAvoid";   

                    for(var i=0;i<anps.length;i++)
                    {
                        config.astarmap[anps[i].y][anps[i].x] = 1;
                    }

                    cc.log(this.robotState);
                }
            }
        }
       
    }

    update (deltaTime: number) {
        if(this.gameControl.isStart)
        {
            this.updateMoveDir(deltaTime);
            this.updateStep(deltaTime);
        }
        else{
            this.isMove = false; 
            this.idle();
        }
    }

    lateUpdate(dt: number){
        if(!this.gameControl.isStart) return;
        if(this.isExcAi)
        {
            this.isExcAi = false;
            this.ai();
        }

        if(this.findGoodsState == 1)
        {
            this.findGoodsState = 2;
            this.findCanHoldGoods();
        }

        // this.ai2Dt += dt;
        // if(this.ai2Dt > 0.1)
        // {
        //     this.ai2Dt = 0;
        //     this.ai2();
        // }
    }
}
