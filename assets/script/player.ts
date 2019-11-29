import { _decorator, Component, Node ,EventTouch,SkeletalAnimationComponent, SystemEvent, Mat4,game, macro,PhysicsSystem,LabelComponent} from "cc";
import { ani } from "./ani"
import { GBoxColl } from "./GColl/GBoxColl"
const { ccclass, property } = _decorator;


@ccclass("player")
export class player extends Component {
   
    private startTouchPos = null;
    private moveDir = null;
    private isMove = false;
    private isColl = false;
    private moveSpeed = 6;

    public followIndex = 0;
    public lv = 1;

    public follows = [];
    public bodys = [];

    private cashierDt = 0;
    private score = 0;

    private gameControl = null;
    public players = null;
    private currAni = "idle";

    private gcoll = null;
    onLoad(){
        // cc.game.setFrameRate(30);
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.players = this.gameControl.players; 
        this.node.addComponent(ani);

        this.gcoll = this.node.getComponent(GBoxColl);
    }

    start () {
        
    }

    onDestroy () {
        this._removeEvents();
    }

    onEnable () {
        this._addEvents();
    }

    onDisable () {
        this._removeEvents();
    }

    private _addEvents () {
        cc.systemEvent.on(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
        cc.systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
        cc.systemEvent.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private _removeEvents () {
        cc.systemEvent.off(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
        cc.systemEvent.off(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
        cc.systemEvent.off(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart (e:EventTouch) {
        this.startTouchPos = e.getLocation();
    }

    onTouchMove (e:EventTouch) {
        let p = e.getLocation();
        this.moveDir = p.subtract(this.startTouchPos).normalize();
        this.isMove = true;
    }

    onTouchEnd (e:EventTouch) {
       this.isMove = false;
    }

    getFollowPoint(){
        if(this.followIndex<2)
        {
            this.followIndex ++;
            return this;
        }

        for(var i=0;i<this.bodys.length;i++)
        {
            var body = this.bodys[i];
            if(body.followIndex<2)
            {
                body.followIndex ++;
                return body;
            }
        }  
            
        for(var i=0;i<this.follows.length;i++)
        {
            var goods = this.follows[i];
            if(goods.followIndex<2)
            {
                goods.followIndex ++;
                return goods;
            }
        }  
        return null;
    }

    canAddGoods(){
        if(this.follows.length>this.lv) return false;
        return true;
    }

    addScore(lv){
        this.score += lv;
        var upNum = this.score - (this.lv-1)*5;
        if(upNum>=5)
        {
            this.lv += 1;
            var p1 = this.node.getPosition();
            var playerbody = cc.instantiate(this.gameControl.playerbody);
            playerbody.setPosition(cc.v3(p1.x+Math.random(),p1.y,p1.z+Math.random()));
            this.gameControl.goodsNode.addChild(playerbody);
            var playerbodySc = playerbody.getComponent("playerbody");
            playerbodySc.playerSc = this;
            this.bodys.push(playerbodySc);
        }
    }

    dropGoods(){
        for(var i=0;i<this.follows.length;i++)
        {
            var goods = this.follows[i];
            goods.drop();
        }
        this.follows = [];
    }

    resetFollow(){
        this.followIndex = 0;
        for(var i=0;i<this.follows.length;i++)
        {
            var goods = this.follows[i];
            goods.followIndex = 0;
        }
        for(var i=0;i<this.bodys.length;i++)
        {
            var body = this.bodys[i];
            body.followIndex = 0;
        }  
        for(var i=0;i<this.bodys.length;i++)
        {
            var body = this.bodys[i];
            body.followTarget = this.getFollowPoint();
            if(body.followTarget != null)
            body.followTargetIndex =  body.followTarget.followIndex;
        }
        for(var i=0;i<this.follows.length;i++)
        {
            var goods = this.follows[i];
            goods.followTarget = this.getFollowPoint();
             if(goods.followTarget != null)
             goods.followTargetIndex =  goods.followTarget.followIndex;
        }
    }

    coll(pos,plv){
        var toPos = this.node.getPosition();
        if(pos)
        {
            var dir = cc.v2(toPos.x,toPos.z).subtract(cc.v2(pos.x,pos.z)).normalize();
            var rad = this.moveDir.signAngle(dir);
            var toDir = this.moveDir.rotate(rad/2);
            toPos.x += toDir.x*2;
            toPos.z += toDir.y*2;
        }
        else{
            toPos.x += this.moveDir.x*1;
            toPos.z += this.moveDir.y*1;
        }
        this.isColl = true;
        var self = this;
        var anisc = this.node.getComponent(ani);
        anisc.moveTo(0.2,toPos,function(){
            self.isColl = false;
            // self.isMove = true;
        });

        if(plv>this.lv)
            this.dropGoods();
    }

    update (dt:number) {
       if(this.isMove && !this.isColl)
       {
        //    var p = this.node.getPosition();
        //    p.x += this.moveSpeed*dt*this.moveDir.x;
        //    p.z -= this.moveSpeed*dt*this.moveDir.y;

        //    if(p.x>15) p.x = 15;
        //    if(p.x<-15) p.x = -15;
        //    if(p.z>20) p.z = 20;
        //    if(p.z<-20) p.z = -20;

        //    this.node.setPosition(p);

           


        //    //和其他角色碰撞
        //    for(var i=0;i<this.players.length;i++)
        //    {
        //        var pla = this.players[i];
        //        if(pla != this)
        //        {
        //             var p2 = pla.node.getPosition();
        //             var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
        //             if(dis<1)
        //             {
        //                 this.isMove = false;
        //                 this.coll(p2,pla.lv);
        //                 // pla.coll(p);
        //                 break;
        //             }

        //             //和他们的身体碰撞
        //             var b = false;
        //             for(var j=0;j<pla.bodys.length;j++)
        //             {
        //                 var body = pla.bodys[j];
        //                 var p2 = body.node.getPosition();
        //                 var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
        //                 if(dis<1)
        //                 {
        //                     this.isMove = false;
        //                     this.coll(p2,pla.lv);
        //                     // body.coll(p);
        //                     b = true;
        //                     break;
        //                 }
        //             }
        //             if(b) break;
        //        }
        //    }
       }
       if(this.isMove)
       {
            if(this.currAni != "run")
            {
                this.node.getComponent(SkeletalAnimationComponent).crossFade("run",0.1);
                this.currAni = "run";
            }

            //旋转
            if(this.moveDir.x != 0 || this.moveDir.y != 0)
            {
                var rad = cc.v2(this.moveDir).signAngle(cc.v2(0,1));
                var ang = 180/Math.PI*rad;
                this.node.setRotationFromEuler(0,180-ang,0);

                this.gcoll.applyForce(cc.v2(-this.moveDir.x,this.moveDir.y).rotate(Math.PI).multiplyScalar(this.moveSpeed));
            }
            
       }
       else
       {
            if(this.currAni != "idle")
            {
                this.node.getComponent(SkeletalAnimationComponent).crossFade("idle",0.1);
                this.currAni = "idle";
            }
            this.gcoll.applyForce(cc.v2(0,0));
       }

       //投放
    //    this.cashierDt += dt;
    //    if(this.cashierDt>0.1)
    //    {
    //        this.cashierDt = 0;

    //        var p1 = this.node.getPosition();
    //        var p2 = this.gameControl.cashier.getPosition();

    //        var dis = cc.Vec2.distance(cc.v2(p1.x,p1.z),cc.v2(p2.x,p2.z));
    //        if(dis<2)
    //        {
    //            if(this.follows.length>0)
    //            {
    //                for(var i=0;i<this.follows.length;i++)
    //                {
    //                    var goods = this.follows[i];
    //                    goods.die(p2);
    //                    this.follows.shift();
    //                    this.addScore(goods.lv);
    //                    this.resetFollow();
    //                    break;
    //                }
                   
                   
    //            }
    //        }
    //    }

       
    }


    public enable () {
        this.enabled = !this.enabled;
    }
}
