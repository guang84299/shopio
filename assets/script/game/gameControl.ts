import { _decorator, Component, Node, Prefab,LabelComponent,ProgressBarComponent ,CameraComponent} from "cc";
import { Player } from "./Player"
import { Goods } from "./Goods"
import { Robot } from "./Robot"
import { PlayerFollow } from "./PlayerFollow"
import { GBoxColl } from "../GColl/GBoxColl"
import { res } from "../res"
import { config } from "../config"
const { ccclass, property } = _decorator;

@ccclass("gameControl")
export class gameControl extends Component {
   
    @property(Player)
    public playerSc = null;
    @property(Node)
    goodsNode = null;
    @property(CameraComponent)
    camera = null;
    @property(Node)
    gameUI = null;
    @property(Node)
    loadNode = null;
    @property(LabelComponent)
    timeLabel = null;

    cashier = null;

    loadPro = null;
    proTxt = null;


    public goodss = [];
    public players = [];
    num = 0;
    public goodsNames = "";
    private colors = ["#ff374b","#ffcd3d","#345aff","#80ff44","#fa6a19","#59ffff","#8f42ff",
                                "#ff4aac","#679fff","#ffa9dd","#bd6fff"];

    gameTime = 0;
    gameScore = 0;

    parentPre = [];

    upDt = 1;
    score = 0;
    isStart = false;
    start () {
        // this.initGoods();
        cc.game.setFrameRate(30);

        // var self = this;
        // cc.systemEvent.on(Node.EventType.TOUCH_END, function(){
        //     self.addPlatest();
        // }, this);

        // PhysicsSystem.ins.enable = true;
        this.loadPro = cc.find("pro",this.loadNode).getComponent(ProgressBarComponent);
        this.proTxt = cc.find("pro/txt",this.loadNode).getComponent(LabelComponent);
        this.loadNode.active = true;
        this.gameUI.active = false;


        this.gameTime = Number(cc.res.loads["conf_game"][0].Time);
        this.gameScore = Number(cc.res.loads["conf_game"][0].Score);
        this.updateTime();

        this.initMap();
    }

    updatePro(){
        var pro = this.num/cc.res.loads["conf_map"].length;
        this.loadPro.progress = pro;
        this.proTxt.string = "加载中..."+Math.floor(pro*100)+"%";

        if(pro>=1)
        {
            this.loadNode.active = false;
        }
    }

    updateTime(){
        this.timeLabel.string = cc.storage.fomatTime(this.gameTime*1000,2);
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
            var preParent = cc.res.loads["conf_goods"][m.id-1].Parent;
            var mass = Number(cc.res.loads["conf_goods"][m.id-1].Mass);
            this.score +=  Number(cc.res.loads["conf_goods"][m.id-1].Score);
            if(!this.parentPre[preParent])
                this.parentPre[preParent] = cc.instantiate(res.loads["prefab_game_"+preParent]);
            if(this.parentPre[preParent])//pre.indexOf("Shelves") != -1 && 
            {
                var goods = cc.instantiate(cc.find(pre,this.parentPre[preParent]));
                if(!goods)
                {
                    cc.log(pre,this.parentPre[preParent]);
                    continue;
                }
                goods.setWorldPosition(cc.v3(Number(m.x),Number(m.y),Number(m.z)));
                goods.setWorldRotation(Number(m.rx),Number(m.ry),Number(m.rz),Number(m.rw));
                this.goodsNode.addChild(goods);
                this.goodss.push(goods);
                var box = goods.addComponent(GBoxColl);
                box.isCircle = false;
                box.mass = mass;
                if(mass<1 && Number(m.y)<0.1)
                {
                    box.isStatic = false;
                }
                // box.enable(false);
               
                goods.addComponent(Goods).initConf(m.id);

                if(pre.indexOf("Res999") != -1)
                {
                    this.cashier = goods;
                }
                else{
                    this.goodsNames += pre + ":";
                }
            }

            i ++;
            if(i> 30) break;
        }
        if(this.num<cc.res.loads["conf_map"].length)
        {
            this.updatePro();
            this.scheduleOnce(this.initMap.bind(this),0.1);
        }
        else{
            this.initRobot();
            this.updatePro();
        }
    }

    initRobot(){
        //生成robot
        // this.players = [];

       for(var i=0;i<1;i++)
       {
            var robot = cc.instantiate(res.loads["prefab_game_player"]);
            robot.setPosition(cc.v3(0,0,1));
            this.goodsNode.addChild(robot);
            var robotSc = robot.addComponent(Robot);
            robotSc.initConf(3);
            robotSc.initRobotConf(15);
            robotSc.initNick(this.randNick());
            robotSc.bodyColor = new cc.Color(this.colors[i]);
            this.players.push(robotSc);
       }
       cc.log(this.num);
       this.parentPre = [];
       res.openUI("countdown");
    }

    randNick(){
        var nick = config.nicks[Math.floor(Math.random()*config.nicks.length)];
        for(var i=0;i<this.players.length;i++)
        {
            if(this.players[i].nick == nick)
            {
                return this.randNick();
            }
        }
        return nick;
    }

    addPlayerFollow(target){
        var p = target.node.getPosition();
        var follow = cc.instantiate(res.loads["prefab_game_player"]);
        follow.setPosition(cc.v3((Math.random()-0.5)*2+p.x,0,(Math.random()-0.5)*2+p.z));
        this.goodsNode.addChild(follow);
        var followSc = follow.addComponent(PlayerFollow);
        followSc.initConf(target.lv);
        followSc.initNick(target.nick+"-追随者");
        followSc.followTarget = target;
        followSc.bodyColor = target.bodyColor.clone();
        return followSc;
    }

    startCountDown(){
        this.isStart = true;
        for(var i=0;i<this.players.length;i++)
        {
            this.players[i].excAi();
        }

        this.players.push(this.playerSc);
        this.gameUI.active = true;
    }

    updateSelfCapacity(pro){
        var capacityPro = cc.find("capacity",this.gameUI).getComponent(ProgressBarComponent);
        var capacityLabel = cc.find("capacity/label",this.gameUI).getComponent(LabelComponent); 
        capacityPro.progress = pro;
        capacityLabel.string = Math.floor(pro*100) + "%";
    }

    updateRank(){
        var ranks = cc.find("rank",this.gameUI).children;
        this.players.sort(function(a,b){
            return b.currScore - a.currScore;
        });

        var isHasSelf = false;
        var isToScore = false;
        for(var i=0;i<ranks.length-1;i++)
        {
            var item = ranks[i];
            if(i<this.players.length)
            {
                item.active = true;
                var label = cc.find("label",item).getComponent(LabelComponent);
                label.string = cc.storage.getLabelStr((i+1) + "-" + this.players[i].currScore + " "+this.players[i].nick,14);

                if(this.playerSc == this.players[i])
                isHasSelf = true;

                if(i == 0 && this.players[i].currScore>= this.gameScore) isToScore = true;
            }
            else
            {
                item.active = false;
            }
        }

        var item = ranks[ranks.length-1];
        if(isHasSelf) item.active = false;
        else{
            item.active = true;
            var rank = 3;
            for(var i=3;i<this.players.length;i++)
            {
                if(this.playerSc == this.players[i])
                {
                    rank = i+1;
                    break;
                }
            }
            var label = cc.find("label",item).getComponent(LabelComponent);
            label.string = cc.storage.getLabelStr(rank + "-" + this.playerSc.currScore + " "+this.playerSc.nick,14);
        }

        if(isToScore) this.gameOver();
    }

    gameOver(){
        this.isStart = false;
        res.openUI("jiesuan");
    }

    update (dt: number) {
        if(this.isStart)
        {
            this.gameTime -= dt;

            this.upDt += dt;
            if(this.upDt>=1)
            {
                this.upDt = 0;
                this.updateTime();
                this.updateRank();

                if(this.gameTime<0)
                {
                    this.gameOver();
                }
            }
        }
       
       
        
    }
}
