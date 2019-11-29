import { _decorator, Component, Node, Prefab,LabelComponent } from "cc";
import { Player } from "./Player"
import { Goods } from "./Goods"
import { Robot } from "./Robot"
import { PlayerFollow } from "./PlayerFollow"
import { GBoxColl } from "../GColl/GBoxColl"
import { res } from "../res"
const { ccclass, property } = _decorator;

@ccclass("gameControl")
export class gameControl extends Component {
   
    @property(Player)
    public playerSc = null;
    @property(Node)
    goodsNode = null;
    @property(Node)
    cashier = null;

    @property(LabelComponent)
    labNum = null;


    public goodss = [];
    public players = [];
    num = 0;
    public goodsNames = "";

    upDt = 0;
    start () {
        // this.initGoods();
        // cc.game.setFrameRate(30);

        // var self = this;
        // cc.systemEvent.on(Node.EventType.TOUCH_END, function(){
        //     self.addPlatest();
        // }, this);

        // PhysicsSystem.ins.enable = true;
        this.initGoodsName();
        this.initMap();
        // this.initRobot();
    }

    initGoodsName(){
        for(var i=0;i<cc.res.loads["conf_goods"].length;i++)
        {
            this.goodsNames += cc.res.loads["conf_goods"][i].Prefab + ":";
        }
    }

    initMap(){
        var i = 0;
        for(;this.num<cc.res.loads["conf_map"].length;this.num ++)
        {
            var m = cc.res.loads["conf_map"][this.num];
            var pre = cc.res.loads["conf_goods"][m.id-1].Prefab;
            var mass = cc.res.loads["conf_goods"][m.id-1].Mass;

            if(res.loads["prefab_game_"+pre])
            {
                var goods = cc.instantiate(res.loads["prefab_game_"+pre]);
                goods.setWorldPosition(cc.v3(Number(m.x),Number(m.y),Number(m.z)));
                goods.setWorldRotation(Number(m.rx),Number(m.ry),Number(m.rz),Number(m.rw));
                goods.setWorldScale(cc.v3(Number(m.sx),Number(m.sy),Number(m.sz)));
                this.goodsNode.addChild(goods);
                this.goodss.push(goods);
                var box = goods.addComponent(GBoxColl);
                box.isCircle = false;
                box.mass = mass;
                goods.addComponent(Goods).initConf(m.id);
            }

            i ++;
            if(i> 30) break;
        }

        if(this.num<cc.res.loads["conf_map"].length)
        {
            this.scheduleOnce(this.initMap.bind(this),0.1);
        }
    }

    initRobot(){
        //生成robot
       for(var i=0;i<6;i++)
       {
            var robot = cc.instantiate(res.loads["prefab_game_player"]);
            robot.setPosition(cc.v3((Math.random()-0.5)*10,0,(Math.random()-0.5)*15));
            this.goodsNode.addChild(robot);
            var robotSc = robot.addComponent(Robot);
            robotSc.initConf(1);
            this.players.push(robotSc);
       }
    }

    addPlatest()
    {
        for(var i=0;i<10;i++)
        {
            var goods = cc.instantiate(res["prefab_game_goods"]);
            var x = (Math.random()-0.5)*10;
            var z = (Math.random()-0.5)*10;
            // if(x<0) x -= 8;
            // if(x>0) x += 8;
            
            goods.setPosition(cc.v3(x,0,z));
            this.goodsNode.addChild(goods);
            this.goodss.push(goods.getComponent(Goods));
        }
        this.num += 10;
        this.labNum.string = this.num+"";
    }

    initGoods(){
        //小商品
       for(var i=0;i<5;i++)
       {
            for(var j=0;j<6;j++)
            {
                var z = 0;
                if(j>3) z = 1.1;
                var x = j;
                if(j>3) x = j-3;
                var goods = cc.instantiate(res.loads["prefab_game_goods"]);
                goods.setPosition(cc.v3(x*1.1,0,z + (i-3)*5));
                this.goodsNode.addChild(goods);
                this.goodss.push(goods);
                goods.getComponent(Goods).initConf(4);
            }
            
       }
       for(var i=0;i<5;i++)
       {
            for(var j=0;j<6;j++)
            {
                var z = 0;
                if(j>3) z = 1.1;
                var x = j+6;
                if(j>3) x = j-3+6;
                var goods = cc.instantiate(res.loads["prefab_game_goods"]);
                goods.setPosition(cc.v3(x*1.1,0,z + (i-3)*5));
                this.goodsNode.addChild(goods);
                this.goodss.push(goods);
                goods.getComponent(Goods).initConf(4);
            }
            
       }
       //大商品
       for(var i=0;i<4;i++)
       {
            for(var j=0;j<4;j++)
            {
                var z = 0;
                if(j>2) z = 2.1;
                var x = j-5;
                if(j>2) x = j-3-5;
                var goods = cc.instantiate(res.loads["prefab_game_goods2"]);
                goods.setPosition(cc.v3(x*1.1,0,z + (i-2)*5));
                this.goodsNode.addChild(goods);
                this.goodss.push(goods);
                goods.getComponent(Goods).initConf(5);
            }
       }
       for(var i=0;i<4;i++)
       {
            for(var j=0;j<4;j++)
            {
                var z = 0;
                if(j>2) z = 2.1;
                var x = j-5+10;
                if(j>2) x = j-3-5+10;
                var goods = cc.instantiate(res.loads["prefab_game_goods2"]);
                goods.setPosition(cc.v3(x*1.1,0,z + (i-2)*5));
                this.goodsNode.addChild(goods);
                this.goodss.push(goods);
                goods.getComponent(Goods).initConf(5);
            }
            
       }

       this.players.push(this.playerSc);
       //生成robot
       for(var i=0;i<6;i++)
       {
            var robot = cc.instantiate(res.loads["prefab_game_player"]);
            robot.setPosition(cc.v3((Math.random()-0.5)*10,0,(Math.random()-0.5)*15));
            this.goodsNode.addChild(robot);
            var robotSc = robot.addComponent(Robot);
            robotSc.initConf(1);
            this.players.push(robotSc);
       }
    }

    addPlayerFollow(target){
        var p = target.node.getPosition();
        var follow = cc.instantiate(res.loads["prefab_game_player"]);
        follow.setPosition(cc.v3((Math.random()-0.5)*2+p.x,0,(Math.random()-0.5)*2+p.z));
        this.goodsNode.addChild(follow);
        var followSc = follow.addComponent(PlayerFollow);
        followSc.initConf(1);
        followSc.followTarget = target;
        return followSc;
    }

    // update (dt: number) {
        
    //     this.upDt += dt;
    //     if(this.upDt>1/30)
    //     {
           
    //         this.upDt = 0;
    //     }
       
        
    // }
}
