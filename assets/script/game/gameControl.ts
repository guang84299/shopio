import { _decorator, Component, Node, Prefab,LabelComponent,ProgressBarComponent ,CameraComponent,AnimationComponent,ModelComponent} from "cc";
import { Player } from "./Player"
import { Goods } from "./Goods"
import { Robot } from "./Robot"
import { PlayerFollow } from "./PlayerFollow"
import { PlayerPack } from "./PlayerPack"
import { Dog } from "./Dog"
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
    public robotConfPath = [];
    public robotRemovePath = [[],[]];
    public goodsConfPath = [];
    public holdGoods = [];
    public dogs = [];
    num = 0;
    public goodsNames = "";
    private colors = ["#FF5200","#00ffd8","#fc00ff","#00ff18","#9cff00","#FFFFFF"];

    gameTime = 0;
    gameScore = 0;
    gameMode = 1;
    goodsToalNum = 0;
    holdGoodsNum = 0;

    parentPre = [];

    upDt = 1;
    addGoodsDt = 0;
    addDogDt = 0;
    score = 0;
    isStart = false;
    isCountDown = false;

    //ani
    isPlayCapacity = false;
    isPlayHurt = false;

    // tips num
    tipNum1 = 0;
    tipNum2 = 0;
    tipNum3 = 0;
    tipNum4 = 0;
    tipNum5 = 0;
    tipNum6 = 0;
    tipTime = 0;
    start () {
        // this.initGoods();
        cc.game.setFrameRate(30);

        // var self = this;
        // cc.systemEvent.on(Node.EventType.TOUCH_END, function(){
        //     self.addPlatest();
        // }, this);

        // PhysicsSystem.ins.enable = true;
        this.gameMode = cc.storage.getStorage(cc.storage.mode);

        this.loadPro = cc.find("pro",this.loadNode).getComponent(ProgressBarComponent);
        this.proTxt = cc.find("pro/txt",this.loadNode).getComponent(LabelComponent);
        this.loadNode.active = true;
        this.gameUI.active = false;

        if(this.gameMode == 1) cc.find("tip1",this.loadNode).active = true;
        else cc.find("tip2",this.loadNode).active = true;


        this.gameTime = Number(cc.res.loads["conf_game"][0].Time);
        this.gameScore = Number(cc.res.loads["conf_game"][0].Score);
        this.updateTime();

        config.astarmap =  JSON.parse(JSON.stringify(config.astarmaps));

        this.initMap();

        this.playerSc.bodyColor = new cc.Color(this.colors[0]);

        //模式切换UI
        cc.find("rank",this.gameUI).active = this.gameMode == 1 ? true : false;
        cc.find("holdpro",this.gameUI).active = this.gameMode == 1 ? false : true;
        // this.gameTime = 18;

        cc.audio.playMusic(cc.res.audio_music);
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
        if(this.gameTime<=13 && !this.isCountDown)
        {
            this.isCountDown = true;
            res.openUI("countdown",null,2);
        }
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
                if(mass>=0)
                {
                    var box = goods.addComponent(GBoxColl);
                    box.isCircle = false;
                    box.mass = mass;
                    if(mass<1 && Number(m.y)<0.1)
                    {
                        box.isStatic = false;
                    }
                }
               
                // if(mass>0 && mass<0.5)
                // {
                //     var mat = goods.getComponent(ModelComponent).material;
                //     if(mat)
                //     {
                //         cc.log(mat);
                //         mat.recompileShaders({ USE_BATCHING: true ,USE_SKINNING:true});
                //         // mat.overridePipelineStates({});
                //         cc.log(mat);
                //     }
                // }
                // box.enable(false);
               
                goods.addComponent(Goods).initConf(m.id,m.c);

                if(pre.indexOf("Res999") != -1)
                {
                    goods.setWorldPosition(cc.v3(Number(m.x),Number(m.y),Number(m.z-0.3)));
                    this.cashier = goods;
                }
                else{
                    this.goodsNames += pre + ":";
                    this.goodsToalNum ++;
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
        // this.players = [];[cc.v2(-4,5),cc.v2(-2,4),cc.v2(-3,0),cc.v2(-4.5,2.5),cc.v2(-0.5,1),cc.v2(2,3),cc.v2(3,6),cc.v2(5.5,2),cc.v2(5,4.5)];
        var pps =  [cc.v2(8,2),cc.v2(4,2.5),cc.v2(-1.5,1.2),cc.v2(-4.8,-1),cc.v2(-10.5,-0.6),cc.v2(-9,4.1),cc.v2(-0.9,5)];//[cc.v2(5,3),cc.v2(0,3),cc.v2(-2,3),cc.v2(-3,5),cc.v2(0.8,5)];
        var robotNum = 0;
         //星级
        var starlv = cc.storage.getStorage(cc.storage.starlv);
        var aiDatas = cc.res.loads["conf_robotstage"][starlv-1];
        if(this.gameMode == 1) 
        {
            robotNum = 3;
            this.robotConfPath = JSON.parse(JSON.stringify(cc.res.loads["conf_robotpath"]));
            this.goodsConfPath = JSON.parse(JSON.stringify(cc.res.loads["conf_goodspath"]));
        }
        for(var i=0;i<robotNum;i++)
       {
           var robotIds = aiDatas["AI"+(i+1)].split(",");
           var robotId = Math.floor(Math.random()*robotIds.length);
           
           var pindex = Math.floor(Math.random()*pps.length);
           var p = pps[pindex];
            var robot = cc.instantiate(res.loads["prefab_game_player"]);
            robot.setPosition(cc.v3(p.x,0,p.y));
            this.goodsNode.addChild(robot);
            var robotSc = robot.addComponent(Robot);
            robotSc.initConf(1);
            robotSc.initRobotConf(Number(robotIds[robotId]),i);//Number(robotIds[robotId])
            robotSc.initNick(this.randNick(),Math.floor(Math.random()*11));
            robotSc.bodyColor = new cc.Color(this.colors[i+1]);
            this.players.push(robotSc);
            

            pps.splice(pindex,1);
       }
       var p = pps[Math.floor(Math.random()*pps.length)];
       this.playerSc.node.setPosition(cc.v3(p.x,0,p.y));
       this.playerSc.addFollowPlayer();

       cc.log(this.num);
    //    this.camera.node.getComponent("CameraFollow").lookTarget = this.players[0].node;
       this.parentPre = [];

    //    for(var i=0;i<config.astarmap.length;i++)
    //    {
    //         for(var j=0;j<config.astarmap[0].length;j++)
    //         {
    //             if(config.astarmap[i][j]) continue;
    //             var cube = cc.instantiate(res.loads["prefab_game_cube"]);
    //             var x =(j-61/2)/2 + 0.25;
    //             var y = (i-31/2)/2 + 0.25;
    //             cube.setPosition(cc.v3(x,0,y));
    //             this.goodsNode.addChild(cube);
    //         }
    //    }
       res.openUI("countdown",null,1);
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
        var follow = cc.instantiate(res.loads["prefab_game_pack"]);

        // follow.setPosition(cc.v3((Math.random()-0.5)*0.2+p.x,0,(Math.random()-0.5)*0.2+p.z));
        // this.goodsNode.addChild(follow);
        follow.setPosition(0,0,-0.2);
        target.node.addChild(follow);
        var followSc = follow.addComponent(PlayerPack);
        // followSc.initConf(target.lv);
        // followSc.initNick(target.nick+"-追随者");
        followSc.followTarget = target;
        // followSc.bodyColor = target.bodyColor.clone();
        return followSc;
    }

    addDog(){
        if(this.dogs.length>= 3) return;
        var pps =  [cc.v2(8,2),cc.v2(4,2.5),cc.v2(-1.5,1.2),cc.v2(-4.8,-1),cc.v2(-10.5,-0.6),cc.v2(-9,4.1),cc.v2(-0.9,5)];
        var p2 = pps[Math.floor(Math.random()*pps.length)];
        var dog = cc.instantiate(res.loads["prefab_game_dog"]);
        // var p2 = config.converToNodePos(cc.v2(p.x+(Math.random()-0.5)*3,p.z+(Math.random()-0.5)*3));
        // p2 = config.converToWorldPos(p2);
        dog.setPosition(p2.x,0,p2.y);
        this.goodsNode.addChild(dog);
        var dogSc = dog.getComponent(Dog);
        dogSc.initConf(this.dogs.length);
        this.dogs.push(dogSc);
    }

    startCountDown(){
        this.isStart = true;
       

        this.players.push(this.playerSc);
        this.gameUI.active = true;
        this.updateHold(0);
        if(cc.GAME.startSpeedUp) res.showTips("开局已加速");
        else
        {
            if(this.gameMode == 1)
            {
                var strs = ["接触别人袋子可以抢夺!","尽快拿东西让自己变大！"];
                res.showTips(strs[Math.floor(Math.random()*strs.length)]);
            }
           
        }
    }

    updateSelfCapacity(pro){
        var capacityPro = cc.find("capacity",this.gameUI).getComponent(ProgressBarComponent);
        var capacityLabel = cc.find("capacity/label",this.gameUI).getComponent(LabelComponent); 
        var capacityBar = cc.find("capacity/Bar",this.gameUI);
        var capacityIcon = cc.find("capacity/icon",this.gameUI);
        capacityPro.progress = pro;
        capacityLabel.string = Math.floor(pro*100) + "%";

        if(pro>0.5 && pro <= 0.8) res.setSpriteFrame("images/game/ProGameCapacity3/spriteFrame",capacityBar);
        else if(pro>0.8) res.setSpriteFrame("images/game/ProGameCapacity2/spriteFrame",capacityBar);
        else res.setSpriteFrame("images/game/ProGameCapacity1/spriteFrame",capacityBar);

        if(pro>0.8)
        {
            res.setSpriteFrame("images/game/ImgGameCapacity2/spriteFrame",capacityIcon);
            //to do 
            if(!this.isPlayCapacity)
            {
                capacityIcon.getComponent(AnimationComponent).play();
                this.isPlayCapacity = true;
            }
        }
        else{
            res.setSpriteFrame("images/game/ImgGameCapacity1/spriteFrame",capacityIcon);
            if(this.isPlayCapacity)
            {
                capacityIcon.getComponent(AnimationComponent).stop();
                this.isPlayCapacity = false;
            }
        }
    }

    updateHold(num){
        if(this.gameMode == 1) return;
        this.holdGoodsNum += num;
        var holdpro = cc.find("holdpro",this.gameUI).getComponent(ProgressBarComponent);
        var holdproLabel = cc.find("holdpro/label",this.gameUI).getComponent(LabelComponent); 
        holdpro.progress = this.holdGoodsNum/this.goodsToalNum;
        holdproLabel.string = this.holdGoodsNum+"/"+this.goodsToalNum;
    }

    updateRank(){
        if(this.gameMode != 1) return;
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
                // item.active = true;
                var lv = cc.find("lv",item).getComponent(LabelComponent);
                var name = cc.find("name",item).getComponent(LabelComponent);
                var score = cc.find("score",item).getComponent(LabelComponent);
                lv.string = (i+1)+"";
                name.string = cc.storage.getLabelStr(this.players[i].nick,14);
                score.string = this.players[i].currScore+"";

                if(this.playerSc == this.players[i])
                isHasSelf = true;

                if(i == 0)
                {
                    if(this.players[i].currScore>= this.gameScore) isToScore = true;
                    this.players[i].showKing(true);
                }
                else
                {
                    this.players[i].showKing(false);
                }
            }
            // else
            // {
            //     item.active = false;
            // }
        }

        var item = ranks[ranks.length-1];
        // if(isHasSelf) item.active = false;
        // else{
        //     item.active = true;
            var rank = 1;
            for(var i=3;i<this.players.length;i++)
            {
                if(this.playerSc == this.players[i])
                {
                    rank = i+1;
                    this.playerSc.showKing(false);
                    break;
                }
            }
            var lv = cc.find("lv",item).getComponent(LabelComponent);
            var name = cc.find("name",item).getComponent(LabelComponent);
            var score = cc.find("score",item).getComponent(LabelComponent);
            lv.string = rank+"";
            name.string = cc.storage.getLabelStr(this.playerSc.nick,14);
            score.string = this.playerSc.currScore+"";
        // }

        if(isToScore) this.gameOver();
    }

    hurtAnimate(){
        if(!this.isPlayHurt)
        {
            this.isPlayHurt = true;
            this.node.getComponent(AnimationComponent).play();
            var self = this;
            this.scheduleOnce(function(){
                self.isPlayHurt = false;
            },0.3);
        }
    }

    gameOver(){
        this.isStart = false;
        if(this.gameMode == 1) res.openUI("jiesuan");
        else res.openUI("jiesuan2");

        cc.audio.playSound("result");
    }

    tofuhuo(){
        this.isStart = false;
        res.openUI("fuhuo");
    }

    fuhuo(){
        this.playerSc.fuhuo();
        this.isStart = true;
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

            //增加商品
            if(this.gameMode == 1)
            {
                this.addGoodsDt += dt;
                if(this.addGoodsDt > 0.3 && this.holdGoods.length>0)
                {
                    this.addGoodsDt = 0;
                    var r = Math.floor(Math.random()*this.holdGoods.length);
                    var goodsNode = this.holdGoods[r];
                    this.goodsNode.addChild(goodsNode);
                    this.holdGoods.splice(r,1);
                    goodsNode.getComponent(Goods).resetState();
                }   
                
                this.addDogDt += dt;
                if(this.addDogDt>5)
                {
                    this.addDogDt = 0;
                    this.addDog();
                }
            }
            
        }
       
       
        
    }
}
