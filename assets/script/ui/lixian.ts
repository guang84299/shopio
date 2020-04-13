import { _decorator, Component, Node,LabelComponent,SpriteComponent } from "cc";
const { ccclass, property } = _decorator;
import { ani } from "../ani"
import { storage } from "../storage";

@ccclass("lixian")
export class lixian extends Component {
   
    @property(LabelComponent)
    coinLabel = null;
   
    @property(Node)
    btnLingqu2 = null;

    gameControl = null;
    mainControl = null;
    type = null;

    award = 0;
    useShare = false;
    start () {
        this.initUI();
        this.updateAd();
    }

    initUI(){
        var t1 = new Date().getTime();
        var t2 = storage.getStorage(storage.logintime);
        if(t2 == 0)
        {
            storage.setStorage(storage.logintime,t1);
            storage.uploadStorage(storage.logintime);
            this.hide();
            return ;
        }
        var time = (t1 - t2)/1000/60;
        if(time>=1)
        {
            if(time>120) time = 120;
            var lv = storage.getStorage(storage.lixianlv);
            var data = cc.res.loads["conf_playerlv"][lv];
            this.award = Math.floor(Number(data.offline)*time);

            this.coinLabel.string = storage.castNum(this.award);
        }

        storage.setStorage(storage.logintime,t1);
        storage.uploadStorage(storage.logintime);

        if(time<1)
        {
            this.hide();
        }
    }

    updateAd(){
        this.useShare = false;
        if(cc.GAME.share)
        {
            var rad = parseInt(cc.GAME.lixianAd);
            if(!cc.GAME.hasVideo) rad = 100;
            if(Math.random()*100 < rad)
            {
                this.useShare = true;
                this.btnLingqu2.getChildByName("share").active = true;
                this.btnLingqu2.getChildByName("video").active = false;
            }
            else
            {
                this.btnLingqu2.getChildByName("share").active = false;
                this.btnLingqu2.getChildByName("video").active = true;
            }
        }
        else
        {
            this.btnLingqu2.getChildByName("share").active = false;
            this.btnLingqu2.getChildByName("video").active = true;
        }
    }
    
    liangqu(isx2){
        if(isx2) this.award *= 2;
        storage.setStorage(storage.coin,storage.getStorage(storage.coin)+ this.award);
        storage.uploadStorage(storage.coin);
        this.mainControl.updateCoin();

        cc.res.showToast("Coin+"+ this.award);

        this.hide();
    }

    show(type){
        this.type = type;
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.mainControl = cc.find("gameNode").getComponent("mainControl");

        cc.sdk.showBanner();
        cc.sdk.event("离线界面-打开");
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
        else if(data == "liangqu")
        {
            this.liangqu(false);
        }
        else if(data == "liangqu2")
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
                    if(r == 1) self.liangqu(true);
                });
            }
            cc.sdk.event("离线界面-2倍领取");
        }
        cc.audio.playSound("button");
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
