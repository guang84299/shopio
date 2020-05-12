import { _decorator, Component, Node,LabelComponent,SpriteComponent } from "cc";
const { ccclass, property } = _decorator;
import { ani } from "../ani"
import { storage } from "../storage";

@ccclass("jiesuan")
export class jiesuan extends Component {
   
    @property(Node)
    item = null;
    @property(Node)
    itemLay = null;

    @property(LabelComponent)
    coinLabel = null;
    @property(LabelComponent)
    rankLabel = null;

    @property(Node)
    btnHome = null;
    @property(Node)
    btnLingqu = null;

    @property(LabelComponent)
    starLabel = null;
  

    gameControl = null;
    mainControl = null;
    type = null;
   
    useShare = false;
    start () {
        this.initUI();
        this.updateAd();
    }

    initUI(){
        var myRank = 0;
        for(var i=0;i<this.gameControl.players.length;i++)
        {
            var pla = this.gameControl.players[i];
            
            var item = cc.instantiate(this.item);
            item.active = true;

            var icon = cc.find("icon",item);
            var rank = cc.find("rank",item).getComponent(LabelComponent);
            var nick = cc.find("nick",item).getComponent(LabelComponent);
            var score = cc.find("score",item).getComponent(LabelComponent);

            rank.string = (i+1);
            nick.string = cc.storage.getLabelStr(pla.nick,14);
            score.string = pla.currScore;

            if(i == 0)
            {
                cc.res.setSpriteFrame("images/game/ImgGameFirst/spriteFrame",icon);
                nick.color = new cc.Color("#ff9c00");
                score.color = new cc.Color("#ff9c00");
            }
            else if(i == 1)
            {
                cc.res.setSpriteFrame("images/game/ImgGameSecond/spriteFrame",icon);
                nick.color = new cc.Color("#96b5c8");
                score.color = new cc.Color("#96b5c8");
            }
            else if(i == 2)
            {
                cc.res.setSpriteFrame("images/game/ImgGameThird/spriteFrame",icon);
                nick.color = new cc.Color("#d07741");
                score.color = new cc.Color("#d07741");
            }
            else{
                icon.getComponent(SpriteComponent).color = new cc.Color("#000000");
                icon.opacity = 100;
                if(pla == this.gameControl.playerSc)
                {
                    nick.color = new cc.Color("#ffe25b");
                    score.color = new cc.Color("#ffe25b");
                }
                else
                {
                    nick.color = new cc.Color("#ffffff");
                    score.color = new cc.Color("#ffffff");
                }
            }
           
            this.itemLay.addChild(item);

            if(pla == this.gameControl.playerSc)
            {
                myRank = (i+1);
            }
        }

        this.rankLabel.string = myRank;
        this.coinLabel.string = storage.castNum(this.gameControl.playerSc.currScore);

        var maxscore = storage.getStorage(storage.maxscore);
        if(this.gameControl.playerSc.currScore>maxscore)
            storage.setStorage(storage.maxscore,this.gameControl.playerSc.currScore);

        var exp = Number(cc.res.loads["conf_starrank"][myRank-1].experience);  
        this.starLabel.string = exp;
        
        //星级升级
        var starlv = storage.getStorage(storage.starlv);
        var starexp = storage.getStorage(storage.starexp);
        starexp += exp;
        var nextData = null;
        if(starlv<cc.res.loads["conf_starlv"].length) nextData = cc.res.loads["conf_starlv"][starlv-1];
        if(nextData)
        {
            //升级
            if(starexp>=Number(nextData.experience))
            {
                starexp = starexp - Number(nextData.experience);
                storage.setStorage(storage.starlv,starlv+1);
                storage.uploadStorage(storage.starlv);

                this.scheduleOnce(function(){
                    cc.res.openUI("starup");
                },1);
            }
        }
        storage.setStorage(storage.starexp,starexp);
        storage.uploadStorage(storage.starexp);

        // if(myRank == 1)
        // {
            var modewinnum = storage.getStorage(storage.modewinnum);
            storage.setStorage(storage.modewinnum,modewinnum+1);
            storage.uploadStorage(storage.modewinnum);
        // }
    }

    updateAd(){
        this.useShare = false;
        var videoPath = cc.storage.getStorage(cc.storage.videoPath);
        if(cc.GAME.share && videoPath.path)
        {
            var rad = parseInt(cc.GAME.jiesuanAd);
            if(!cc.GAME.hasVideo) rad = 100;
            if(Math.random()*100 < rad)
            {
                this.useShare = true;
                this.btnLingqu.getChildByName("share").active = true;
                this.btnLingqu.getChildByName("video").active = false;
            }
            else
            {
                this.btnLingqu.getChildByName("share").active = false;
                this.btnLingqu.getChildByName("video").active = true;
            }
        }
        else
        {
            this.btnLingqu.getChildByName("share").active = false;
            this.btnLingqu.getChildByName("video").active = true;
        }
    }

    liangqu(isX2){
        var award = this.gameControl.playerSc.currScore;
        if(isX2) 
        {
            award *= 2;
            this.btnLingqu.active = false;
            storage.setStorage(storage.coin,storage.getStorage(storage.coin)+award);
            storage.uploadStorage(storage.coin);
    
            cc.res.showToast("金币+"+award);
        }
        else
        {
            if(this.btnLingqu.active)
            {
                this.btnHome.active = false;
                this.btnLingqu.active = false;

                storage.setStorage(storage.coin,storage.getStorage(storage.coin)+award);
                storage.uploadStorage(storage.coin);
        
                cc.res.showToast("金币+"+award);
            }
            var self = this;
            this.scheduleOnce(function(){
                self.hide();
                cc.director.loadScene("main");
            },0.2);
        }
       
    }
    

    show(type){
        this.type = type;
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.mainControl = cc.find("gameNode").getComponent("mainControl");
        cc.sdk.showBanner();
        cc.sdk.event("结算界面-经典模式打开");
    }

    hide(){
        this.node.parent.destroy();
        cc.sdk.hideBanner();
    }

    click(event:any,data:any)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "home")
        {
            this.liangqu(false);
        }
        else if(data == "liangqu")
        {
            var self = this;
            if(this.useShare)
            {
                cc.sdk.share(function(r){
                    if(r) self.liangqu(true);
                });
            }
            else
            {
                cc.sdk.showVedio(function(r){
                    if(r) self.liangqu(true);
                });
            }
            cc.sdk.event("结算界面-经典模式-双倍领取");
        }
        cc.audio.playSound("button");
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
