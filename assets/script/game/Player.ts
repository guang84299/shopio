import { _decorator, Component, Node,SkeletalAnimationComponent } from "cc";
const { ccclass, property } = _decorator;
import { ani } from "../ani"
import { GBoxColl } from "../GColl/GBoxColl"
import { Goods } from "./Goods"

@ccclass("Player")
export class Player extends Component {
    public moveDir = cc.v2(0,0);
    protected isMove = false;
    protected isColl = false;
    protected moveSpeed = 6;

    public lv = 1;
    protected gameControl = null;
    protected state = "idle";
    protected gcoll = null;

    protected goods = [];
    protected hands = [];
    protected follow = [];
    public followTarget = null;

    protected conf = {Score:"10",Capacity:"8",Speed:"1",PlayerNum:"1"};
    protected currCapacity = 0;//当前装载量
    protected currScore = 0;//当前分数
    protected isPlayer = false;

    start () {
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.node.addComponent(ani);
        this.gcoll = this.node.getComponent(GBoxColl);
        this.gcoll.setCollcallback(this.collEnter.bind(this));

        var sockets = this.node.getComponent(SkeletalAnimationComponent).sockets;
        for(var i=0;i<sockets.length;i++)
            this.hands.push(cc.find("node",sockets[i].target));
    }

    initConf(lv){
        this.lv = lv;
        var obj = cc.res.loads["conf_player"][lv-1];
        this.conf = JSON.parse(JSON.stringify(obj));
    }

    run(){
        if(this.state != "run")
        {
            this.node.getComponent(SkeletalAnimationComponent).play("run");
            this.state = "run";
        }
    }

    idle(){
        if(this.state != "idle")
        {
            this.node.getComponent(SkeletalAnimationComponent).play("idle");
            this.state = "idle";
        }
    }

    hurt(){
        if(this.state != "hurt")
        {
            this.node.getComponent(SkeletalAnimationComponent).play("hurt");
            this.state = "hurt";

            var self = this;
            this.scheduleOnce(function(){
                self.node.getComponent(SkeletalAnimationComponent).stop();
            },0.5)
            this.dropGoods();
        }
    }

    updateDir(){
        //旋转
        if(this.moveDir.x != 0 || this.moveDir.y != 0)
        {
            var rad = cc.v2(this.moveDir).signAngle(cc.v2(0,1));
            var ang = 180/Math.PI*rad;
            this.node.setRotationFromEuler(0,ang,0);
        }
    }

    //拿商品
    holdGoods(goods:Goods){
        if(goods.state == "idle" && goods.canHold(this.lv) && this.currCapacity+Number(goods.conf.Capacity)<=Number(this.conf.Capacity))
        {
            if(this.hands.length>0)
            {
                goods.hold();
                this.goods.push(goods);
                this.currCapacity += Number(goods.conf.Capacity);

                var handIndex = this.goods.length%this.hands.length;
                var l = 1;
                if(handIndex == 1) l = -1;
                goods.node.setPosition(cc.v3(Math.random()*0.5*l,Math.random()*0.5*l,Math.random()*0.5*l));
                goods.node.parent = this.hands[handIndex];
            }
        }
    }

    //掉落商品
    dropGoods()
    {
        for(var i=0;i<this.goods.length;i++)
        {
            var goods = this.goods[i];
            goods.drop();
            this.currCapacity -= Number(goods.conf.Capacity);

            var p = cc.v3(goods.node.getWorldPosition());
            p.y = 0;
            goods.node.setPosition(p);
            goods.node.parent = this.gameControl.goodsNode;
        }

        this.goods = [];
    }

    //投放商品
    postGoods(){
        if(this.goods.length>0 && this.state != "post")
        {
            this.node.getComponent(SkeletalAnimationComponent).play("idle");
            this.state = "post";

            var goods = this.goods.pop();
            this.currCapacity -= Number(goods.conf.Capacity);

            this.addScore(Number(goods.conf.Score));
            if(!this.isPlayer)
            {
                this.followTarget.addScore(Number(goods.conf.Score));
            }

            var p = cc.v3(goods.node.getWorldPosition());
            goods.node.setPosition(p);
            goods.node.parent = this.gameControl.goodsNode;
            goods.die(this.gameControl.cashier.getPosition());

            var slef = this;
            this.scheduleOnce(function(){
                slef.state = "idle";
            },0.5);
        }
    }

    addScore(score){
        this.currScore += score;
        this.lvUp();
    }

    //判断升级 和 添加跟随者
    lvUp(){
        if(this.currScore>=Number(this.conf.Score))
        {
            if(this.lv < cc.res.loads["conf_player"].length)
            {
                this.initConf(this.lv+1);

                if(this.isPlayer)
                {
                    this.addFollowPlayer();
                }
            }
        }
    }

    //添加跟随者
    addFollowPlayer(){
         for(var i=this.follow.length;i< Number(this.conf.PlayerNum);i++)
         {
            var follow = this.gameControl.addPlayerFollow(this);
            this.follow.push(follow);
         }

         cc.log(this.lv,this.conf.PlayerNum);
    }

    //角色碰撞
    collPlayer(item){
        var toPos = this.node.getPosition();
        var pos = item.node.getPosition();
        var dir = cc.v2(toPos.x,toPos.z).subtract(cc.v2(pos.x,pos.z)).normalize();
        // var rad = this.moveDir.signAngle(dir);
        // var toDir = this.moveDir.rotate(rad/2);
        toPos.x += dir.x*1;
        toPos.z += dir.y*1;
        this.moveDir = dir;

        this.isColl = true;
        var self = this;
        var anisc = this.node.getComponent(ani);
        anisc.moveTo(0.2,toPos,function(){
            self.scheduleOnce(function(){
                self.isColl = false;
            },1);
        });

        this.hurt();
        this.updateDir();
    }
    
    //判断2个角色是否可以碰撞
    judgeColl(item){
        var b = true;
        if(this.followTarget == null)
        {
            for(var i=0;i<this.follow.length;i++)
            {
                if(this.follow[i].node == item.node) 
                {
                    b = false;
                    break;
                }
            }
        }
        else{
            if(this.followTarget.node == item.node) b = false;

            if(b)
            {
                for(var i=0;i<this.followTarget.follow.length;i++)
                {
                    if(this.followTarget.follow[i].node == item.node) 
                    {
                        b = false;
                        break;
                    }
                }
            }
        }
        return b;
    }


    collEnter(item){
        if(item.node.name == "player" || item.node.name == "robot")
        {
            if(this.judgeColl(item))
                this.collPlayer(item);
        }
        else if(this.gameControl.goodsNames.indexOf(item.node.name) != -1)
        {
            if(this.state == "run")
            this.holdGoods(item.node.getComponent(Goods));
        }
        else if(item.node.name == "Cashier")
        {
            this.postGoods();
        }
    }

    updateStep (deltaTime: number) {
        if(!this.isColl)
       {
            if(this.isMove)
            {
                this.run();
                this.updateDir();
                if(this.moveDir.x != 0 || this.moveDir.y != 0)
                {    
                    this.gcoll.applyForce(cc.v2(this.moveDir).multiplyScalar(this.moveSpeed*Number(this.conf.Speed)));
                }
            }
            else
            {
                this.idle();
                this.gcoll.applyForce(cc.v2(0,0));
            }
       }
    }
}
