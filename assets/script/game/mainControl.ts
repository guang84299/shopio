import { _decorator, Component, Node, Prefab,LabelComponent,ProgressBarComponent ,ButtonComponent,AnimationComponent} from "cc";
import { Player } from "./Player"
import { Goods } from "./Goods"
import { Robot } from "./Robot"
import { PlayerFollow } from "./PlayerFollow"
import { GBoxColl } from "../GColl/GBoxColl"
import { res } from "../res"
import { storage } from "../storage";
const { ccclass, property } = _decorator;

@ccclass("mainControl")
export class mainControl extends Component {
   
    @property(Node)
    goodsNode = null;
    @property(Node)
    vibrateNode = null;
    @property(Node)
    musicNode = null;
    @property(LabelComponent)
    coinLabel = null;
    @property(LabelComponent)
    starlvLabel = null;
    @property(LabelComponent)
    starexpLabel = null;
    @property(ProgressBarComponent)
    starPro = null;
    @property(LabelComponent)
    maxscoreLabel = null;
    @property(ButtonComponent)
    speedUp = null;
    @property(ButtonComponent)
    lixianUp = null;
    @property(ButtonComponent)
    capacityUp = null;
    @property(Node)
    startNode = null;

    @property(Player)
    public playerSc = null;

    upDt = 0;
    score = 0;
    num = 0;

    parentPre = [];

    coin = 0;
    start () {
        cc.game.setFrameRate(30);

        this.initMap();
        this.initUI();
        
        this.updateUI();
        this.updateSpeedUp();
        this.updateCapacityUp();
        this.updateLixianUp();

        this.scheduleOnce(this.judgeSkin.bind(this),0.2);
        if(cc.GAME.judgeLixian)
        {
            cc.GAME.judgeLixian = false;
            this.updateLixian();
        }
        cc.qianqista.onshowmaincallback = this.updateLixian;

        cc.audio.playMusic("audio/music");
    }

    initUI(){
        var skinid = cc.storage.getStorage(cc.storage.skinid);
        this.playerSc.initNick("留个名吧",skinid);
        this.playerSc.bodyColor = new cc.Color("#FF5200");

        var music = storage.getStorage(storage.music);
        if(!music) cc.res.setSpriteFrame("images/main/BtnMusicOff/spriteFrame",this.musicNode);
        else cc.res.setSpriteFrame("images/main/BtnMusicOn/spriteFrame",this.musicNode);
    }

    updateSkin(){
        var skinid = cc.storage.getStorage(cc.storage.skinid);
        this.playerSc.initNick("留个名吧",skinid);
        this.playerSc.initSkin();
    }

    updateLixian(){
        this.scheduleOnce(function(){
            res.openUI("lixian");
        },1);
    }

    updateUI(){
        this.updateCoin();
        this.updateMode();

        //星级
        var starlv = storage.getStorage(storage.starlv);
        var starexp = storage.getStorage(storage.starexp);
        this.starlvLabel.string = starlv;

        var nextData = null;
        if(starlv<cc.res.loads["conf_starlv"].length) nextData = cc.res.loads["conf_starlv"][starlv-1];
        if(nextData)
        {
            this.starPro.progress = starexp/Number(nextData.experience);
            this.starexpLabel.string = starexp+"/"+nextData.experience;
        }
    }

    updateCoin(){
        this.coin = storage.getStorage(storage.coin);
        this.coinLabel.string = storage.castNum(this.coin);
    }

    updateMode(){
        var mode = storage.getStorage(storage.mode);
        if(mode == 1)
        {
            this.maxscoreLabel.string = "最高分："+storage.getStorage(storage.maxscore);
            res.setSpriteFrame("images/main/BtnGame1/spriteFrame",this.startNode);
        }
        else
        {
            this.maxscoreLabel.string = "最高分："+storage.getStorage(storage.maxscore2);
            res.setSpriteFrame("images/main/BtnGame2/spriteFrame",this.startNode);
        }
    }

    updateSpeedUp(){
        var addLabel = cc.find("add",this.speedUp.node).getComponent(LabelComponent);
        var costLabel = cc.find("coinbg/num",this.speedUp.node).getComponent(LabelComponent);
        var tishi = cc.find("tishi",this.speedUp.node);
        var ad = cc.find("ad",this.speedUp.node);

        var lv = storage.getStorage(storage.speedlv);

        var data = cc.res.loads["conf_playerlv"][lv];
        var nextData = null;
        if(lv+1<cc.res.loads["conf_playerlv"].length) nextData = cc.res.loads["conf_playerlv"][lv+1];

        
        addLabel.string = "速度+"+data.speed;
        
        if(nextData) 
        {
            costLabel.string = storage.castNum(nextData.speedcost);
            tishi.active = this.coin>=Number(nextData.speedcost) ? true : false;
        }
        else{
            costLabel.string = "0";
            tishi.active = false;
        }
    }

    toSpeedUp(){
        var lv = storage.getStorage(storage.speedlv);
        if(lv+1>=cc.res.loads["conf_playerlv"].length)
        {
            res.showToast("等级已满");return;
        }
        var nextData = cc.res.loads["conf_playerlv"][lv+1];
        if(this.coin<Number(nextData.speedcost))
        {
            res.showToast("金币不足");return;
        }

        storage.setStorage(storage.coin,this.coin-Number(nextData.speedcost));
        storage.setStorage(storage.speedlv,lv+1);

        storage.uploadStorage(storage.coin);
        storage.uploadStorage(storage.speedlv);
        this.updateCoin();

        this.updateSpeedUp();
        this.updateCapacityUp();
        this.updateLixianUp();

        cc.find("ani",this.speedUp.node).getComponent(AnimationComponent).play();
    }


    updateCapacityUp(){
        var addLabel = cc.find("add",this.capacityUp.node).getComponent(LabelComponent);
        var costLabel = cc.find("coinbg/num",this.capacityUp.node).getComponent(LabelComponent);
        var tishi = cc.find("tishi",this.capacityUp.node);
        var ad = cc.find("ad",this.capacityUp.node);

        var lv = storage.getStorage(storage.capacitylv);

        var data = cc.res.loads["conf_playerlv"][lv];
        var nextData = null;
        if(lv+1<cc.res.loads["conf_playerlv"].length) nextData = cc.res.loads["conf_playerlv"][lv+1];

        
        addLabel.string = "容量+"+data.capacity;
        
        if(nextData) 
        {
            costLabel.string = storage.castNum(nextData.capacitycost);
            tishi.active = this.coin>=Number(nextData.capacitycost) ? true : false;
        }
        else{
            costLabel.string = "0";
            tishi.active = false;
        }
    }

    toCapacityUp(){
        var lv = storage.getStorage(storage.capacitylv);
        if(lv+1>=cc.res.loads["conf_playerlv"].length)
        {
            res.showToast("等级已满");return;
        }
        var nextData = cc.res.loads["conf_playerlv"][lv+1];
        if(this.coin<Number(nextData.capacitycost))
        {
            res.showToast("金币不足");return;
        }

        storage.setStorage(storage.coin,this.coin-Number(nextData.capacitycost));
        storage.setStorage(storage.capacitylv,lv+1);

        storage.uploadStorage(storage.coin);
        storage.uploadStorage(storage.capacitylv);
        this.updateCoin();
        this.updateSpeedUp();
        this.updateCapacityUp();
        this.updateLixianUp();

        cc.find("ani",this.capacityUp.node).getComponent(AnimationComponent).play();
    }

    updateLixianUp(){
        var addLabel = cc.find("add",this.lixianUp.node).getComponent(LabelComponent);
        var costLabel = cc.find("coinbg/num",this.lixianUp.node).getComponent(LabelComponent);
        var tishi = cc.find("tishi",this.lixianUp.node);
        var ad = cc.find("ad",this.lixianUp.node);

        var lv = storage.getStorage(storage.lixianlv);

        var data = cc.res.loads["conf_playerlv"][lv];
        var nextData = null;
        if(lv+1<cc.res.loads["conf_playerlv"].length) nextData = cc.res.loads["conf_playerlv"][lv+1];

        
        addLabel.string = data.offline+"/分钟";
        
        if(nextData) 
        {
            costLabel.string = storage.castNum(nextData.offlinecost);
            tishi.active = this.coin>=Number(nextData.offlinecost) ? true : false;
        }
        else{
            costLabel.string = "0";
            tishi.active = false;
        }
    }

    toLixianUp(){
        var lv = storage.getStorage(storage.lixianlv);
        if(lv+1>=cc.res.loads["conf_playerlv"].length)
        {
            res.showToast("等级已满");return;
        }
        var nextData = cc.res.loads["conf_playerlv"][lv+1];
        if(this.coin<Number(nextData.offlinecost))
        {
            res.showToast("金币不足");return;
        }

        storage.setStorage(storage.coin,this.coin-Number(nextData.offlinecost));
        storage.setStorage(storage.lixianlv,lv+1);

        storage.uploadStorage(storage.coin);
        storage.uploadStorage(storage.lixianlv);
        this.updateCoin();
        this.updateSpeedUp();
        this.updateCapacityUp();
        this.updateLixianUp();

        cc.find("ani",this.lixianUp.node).getComponent(AnimationComponent).play();
    }
 
    judgeSkin(){
        var hasskin = storage.getStorage(storage.hasskin);
        var b = false;
        if(hasskin.indexOf(1) == -1)
        {
            var loginday = storage.getStorage(storage.loginday);
            if(loginday>0) hasskin.push(1);
            b = true;
        }
        if(hasskin.indexOf(2) == -1)
        {
            var loginday = storage.getStorage(storage.loginday);
            if(loginday>=7) hasskin.push(2);
            b = true;
        }
        if(hasskin.indexOf(3) == -1)
        {
            var modewinnum = storage.getStorage(storage.modewinnum);
            if(modewinnum>=1) hasskin.push(3);
            b = true;
        }
        if(hasskin.indexOf(4) == -1)
        {
            var maxscore = storage.getStorage(storage.maxscore);
            if(maxscore>=2000) hasskin.push(4);
            b = true;
        }
        if(hasskin.indexOf(5) == -1)
        {
            var maxscore = storage.getStorage(storage.maxscore);
            if(maxscore>=2500) hasskin.push(5);
            b = true;
        }
        if(hasskin.indexOf(6) == -1)
        {
            var modewinnum = storage.getStorage(storage.modewinnum);
            if(modewinnum>=3) hasskin.push(6);
            b = true;
        }
        if(hasskin.indexOf(7) == -1)
        {
            var starlv = storage.getStorage(storage.starlv);
            if(starlv>=5) hasskin.push(7);
            b = true;
        }
        if(hasskin.indexOf(8) == -1)
        {
            var starlv = storage.getStorage(storage.starlv);
            if(starlv>=6) hasskin.push(8);
            b = true;
        }
        if(hasskin.indexOf(9) == -1)
        {
            var starlv = storage.getStorage(storage.starlv);
            if(starlv>=7) hasskin.push(9);
            b = true;
        }
        if(hasskin.indexOf(10) == -1)
        {
            var starlv = storage.getStorage(storage.starlv);
            if(starlv>=8) hasskin.push(10);
            b = true;
        }
        storage.setStorage(storage.hasskin,hasskin);
        storage.uploadStorage(storage.hasskin);
    }

   
    initMap(){
        var i = 0;
        for(;this.num<cc.res.loads["conf_maptitle"].length;this.num ++)
        {
            var m = cc.res.loads["conf_maptitle"][this.num];
            var pre = cc.res.loads["conf_goods"][m.id-1].Prefab;
            var preParent = cc.res.loads["conf_goods"][m.id-1].Parent;
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
            }

            i ++;
            if(i> 30) break;
        }
        if(this.num<cc.res.loads["conf_maptitle"].length)
        {
            this.scheduleOnce(this.initMap.bind(this),0.01);
        }
        else{
            this.initRobot();
        }
    }

    initRobot(){
        //生成robot
        // this.players = [];
       for(var i=0;i<0;i++)
       {
            var robot = cc.instantiate(res.loads["prefab_game_player"]);
            robot.setPosition(cc.v3((Math.random()-0.5)*10,0,(Math.random()-0.5)*15));
            this.goodsNode.addChild(robot);
            var robotSc = robot.addComponent(Robot);
            robotSc.initConf(1);
            robotSc.initRobotConf(15);
       }
    }

    click(event,data){
        if(data == "start")
        {
            cc.director.loadScene("game");
        }
        else if(data == "mode")
        {
            res.openUI("modesel");
        }
        else if(data == "skin")
        {
            res.openUI("skin");
        }
        else if(data == "vibrate")
        {
            var vib = storage.getStorage(storage.vibrate);
            storage.setStorage(storage.vibrate,vib == 1 ? 0 : 1);
            if(vib) cc.res.setSpriteFrame("images/main/BtnShakeOff/spriteFrame",this.vibrateNode);
            else cc.res.setSpriteFrame("images/main/BtnShakeOn/spriteFrame",this.vibrateNode);
        }
        else if(data == "music")
        {
            var music = storage.getStorage(storage.music);
            storage.setStorage(storage.music,music == 1 ? 0 : 1);
            if(music) cc.res.setSpriteFrame("images/main/BtnMusicOff/spriteFrame",this.musicNode);
            else cc.res.setSpriteFrame("images/main/BtnMusicOn/spriteFrame",this.musicNode);

            if(music) cc.audio.pauseMusic();
            else cc.audio.resumeMusic();
        }
        else if(data == "speedUp")
        {
            this.toSpeedUp();
        }
        else if(data == "capacityUp")
        {
            this.toCapacityUp();
        }
        else if(data == "lixianUp")
        {
            this.toLixianUp();
        }

        cc.audio.playSound("audio/button");
    }
    // update (dt: number) {
        
    //     this.upDt += dt;
    //     if(this.upDt>1/30)
    //     {
           
    //         this.upDt = 0;
    //     }
       
        
    // }
}
