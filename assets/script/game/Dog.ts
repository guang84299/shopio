import { _decorator, Component, Node, random,ModelComponent ,SkeletalAnimationComponent} from "cc";
const { ccclass, property } = _decorator;
import { GBoxColl } from "../GColl/GBoxColl"
import { Player } from "./Player"
import { Astar } from "../tools/Astar"
import { ani } from "../ani"
import { config } from '../config';

@ccclass("Dog")
export class Dog extends Component {
    public state = "idle";
    private aniState = "idle";
    private gameControl = null;
    public isExcColl = false;
    gcoll = null;
    moveDir = cc.v2(0,0);
    isMove = false;
    tarPlayer = null;
    nerPlayer = null;
    updateDirTime = 1;

    wanderTime = 3;
    idleTime = 1;
    lookTime = 3;
    attackTime = 3;
    judgeattackTime = 3;
    moveSpeed = 2;

    roadList = [];
    pathIndex = 0;

    aiDt = 0;
    lookDt = 0;

    conf = {wander:50,attack:50};

    start () {
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.gcoll = this.node.getComponent(GBoxColl);

        var material = cc.find("RootNode/polySurface2",this.node).getComponent(ModelComponent).material;   
        material.setProperty('albedo', cc.color(10,10,10)); 
    }

    initConf(pathIndex)
    {
        this.pathIndex = pathIndex;
    }

    idle(){
        if(this.aniState != "idle")
        {
            this.aniState = "idle";
            this.isMove = false;
            this.node.getComponent(SkeletalAnimationComponent).play("idle");
        }
    }

    wander(){
        if(this.aniState != "wander")
        {
            this.aniState = "wander";
            this.node.getComponent(SkeletalAnimationComponent).play("run");
        }
    }

    attack(){
        if(this.aniState != "attack")
        {
            this.aniState = "attack";
            this.node.getComponent(SkeletalAnimationComponent).play("attack");
        }
    }

    look(){
        //寻找最近的小偷
        this.nerPlayer = this.findTarPlayer();
        this.tarPlayer = null;
        if(this.nerPlayer)
        {
            var p = this.node.getPosition();
            var p2 = this.nerPlayer.node.getWorldPosition();    
            var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
            if(dis<2)
            {
                this.tarPlayer = this.nerPlayer;
            }
        }

    }

    //寻找最近的小偷
    findTarPlayer(){
        var p = this.node.getPosition();
        var plas = this.gameControl.players;
        var tarPlayer = null;
        for(var i=0;i<plas.length;i++)
        {
            var pla = plas[i];
            if(!pla.isColl)
            {
                var p2 = pla.node.getWorldPosition();
                var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
                if(dis<3.5)
                {
                    if(!tarPlayer) tarPlayer = pla;
                    else{
                        var p3 = tarPlayer.node.getPosition();
                        var dis2 = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p3.x,p3.z));
                        if(dis<dis2)  
                        {
                            tarPlayer = pla;
                        }
                    }
                }
            }
        }
        return tarPlayer;
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

    findRoad(tarPoint){
       
        var p = cc.v3(this.node.getPosition());
        cc.log("tarPoint",tarPoint);
                
        var now = new Date().getTime();
        var astar = new Astar();
        astar.findPath({x:p.x,y:p.z},{x:tarPoint.x,y:tarPoint.y},null);
        this.roadList = astar.pathList;
        cc.log("耗时"+(new Date().getTime()-now));
        this.roadList.shift(); //JSON.parse(JSON.stringify(this.roadList))
        this.updateDirTime = 0;
    }

    ai(){
        //判断游荡
        if(this.state != "wander" && this.state != "attack" && this.wanderTime > 2 && Math.random()*100 <= this.conf.wander)
        {
            this.state = "wander";
            this.wanderTime = 0;
        }

        //判断攻击
        if(this.state != "attack" && this.judgeattackTime > 0.2)
        {
            this.judgeattackTime = 0;
            this.look();
            if(this.tarPlayer && Math.random()*100 <= this.conf.attack)
            {
                this.state = "attack";
                this.attackTime = 3;
                this.isExcColl = true;

                if(this.tarPlayer.isPlayerSelf)
                {
                    if(this.gameControl.tipNum1<3 && new Date().getTime()-cc.res.tipTime>5000)
                    {
                        this.gameControl.tipNum1 ++;
                        cc.res.showTips("注意恶犬！");
                    }
                    cc.audio.playSound("dogzhuiren");
                }
                
            }
        }
      
        if(this.state == "wander")
        {
            //如果没有路 就找到最近的路
            if(this.roadList.length == 0)
            {
                // var p1 = this.node.getPosition();
                // this.pathIndex++;
                // if(this.pathIndex>=this.gameControl.goodsConfPath.length) this.pathIndex = 0;

                var p = this.gameControl.goodsConfPath[this.pathIndex][0];
                this.findRoad(cc.v2(p.x,p.y));
                for(var i=1;i<this.gameControl.goodsConfPath[this.pathIndex].length;i++)
                {
                    var node = this.gameControl.goodsConfPath[this.pathIndex][i];
                    this.roadList.push({x:Number(node.x),y:Number(node.y)});
                }
            }
        }

        if(Math.random()<0.1)
        cc.log(this.state);
    }

    updateAi(dt){
        this.wanderTime+=dt;
        this.judgeattackTime += dt;
        this.attackTime -= dt;
        this.updateDirTime += dt;
        this.isMove = true; 
        var p = this.node.getPosition();
        if(this.state == "wander")
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
                    this.moveDir = cc.v2(node.x,node.y).subtract(cc.v2(p.x,p.z)).normalize();
                }

                if(this.roadList.length == 0)
                {
                    this.state = "idle";
                    this.moveDir = cc.v2(0,0);
                    this.isMove = false; 
                }
            }
            else{
                this.state = "idle";
                this.moveDir = cc.v2(0,0);
                this.isMove = false; 
            }
            this.wander();
        }
        else if(this.state == "attack")
        {
            if(this.attackTime>0 && this.tarPlayer)
            {
                var p1 = this.tarPlayer.node.getPosition();
                this.moveDir = cc.v2(p1.x,p1.z).subtract(cc.v2(p.x,p.z)).normalize();
            }
            else
            {
                this.state = "idle";
                this.moveDir = cc.v2(0,0);
                this.isMove = false; 
                this.isExcColl = false;
            }
            this.attack();
        }
        else{
            this.idle();
        }
    }

  
    updateStep(dt){
        if(this.isMove)
        {
            if(this.moveDir.x != 0 || this.moveDir.y != 0)
            {    
                this.updateDir(this.moveDir);
                this.gcoll.applyForce(cc.v2(this.moveDir).multiplyScalar(this.moveSpeed));
            }
        }

    }

    update (deltaTime: number) {
        if(this.gameControl.isStart)
        {
            this.updateAi(deltaTime);
            this.updateStep(deltaTime);
        }
        else{
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
