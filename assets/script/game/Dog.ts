import { _decorator, Component, Node, random,ParticleSystemComponent } from "cc";
const { ccclass, property } = _decorator;
import { GBoxColl } from "../GColl/GBoxColl"
import { Player } from "./Player"
import { Astar } from "../tools/Astar"
import { ani } from "../ani"
import { config } from '../config';

@ccclass("Dog")
export class Dog extends Component {
    public state = "idle";
    private gameControl = null;
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
    moveSpeed = 2.3;

    roadList = [];

    upDt = 0;
    lookDt = 0;


    start () {
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.gcoll = this.node.getComponent(GBoxColl);

    }

    idle(){
        if(this.state != "idle")
        {
            this.state = "idle";
            this.isMove = false;
        }
    }

    wander(){
        if(this.state != "wander")
        {
            this.state = "wander";
            this.isMove = true;
            this.moveDir = cc.v2(Math.random()-0.5,Math.random()-0.5).normalize();
            if(this.nerPlayer)
            {
                var p = this.node.getPosition();
                var p2 = this.nerPlayer.node.getWorldPosition();    
                this.moveDir = cc.v2(p2.x,p2.z).subtract(cc.v2(p.x,p.z)).normalize();
            }
        }
    }

    attack(){
        if(this.state != "attack")
        {
            this.state = "attack";
            this.isMove = true;
            this.upDt = 0;
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
                this.attack();
            }
            else{
                this.changeState();
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

    ai(dt){
        this.upDt += dt;
        if(this.state == "idle" && this.upDt>=this.idleTime)
        {
            this.changeState();
        }
        else if(this.state == "wander" && this.upDt>=this.wanderTime)
        {
            this.changeState();
        }
      

        this.lookDt += dt;
        if(this.lookDt>=this.lookTime)
        {
            this.lookDt = 0;
            this.look();
        }

        if(this.state == "attack")
        {
            this.updateDirTime += dt;
            if(this.roadList.length > 0)
            {
                var p = this.node.getPosition();
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
               
            }
            else{
                this.changeState();
            }
        }
    }

    changeState(){
        var r = Math.random();
        if(r<0.3) this.idle();
        else if(r<1) this.wander();
        this.upDt = 0;
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
  
    updateStep(dt){
        if(this.isMove)
        {
            if(this.moveDir.x != 0 || this.moveDir.y != 0)
            {    
                this.gcoll.applyForce(cc.v2(this.moveDir).multiplyScalar(this.moveSpeed));
            }
        }

    }

    update (deltaTime: number) {
        if(this.gameControl.isStart)
        {
            this.ai(deltaTime);
            this.updateStep(deltaTime);
        }
    }
}
