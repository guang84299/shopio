import { _decorator, Component, Node,LabelComponent,SpriteComponent } from "cc";
const { ccclass, property } = _decorator;
import { ani } from "../ani"
import { storage } from "../storage";

@ccclass("jiesuan2")
export class jiesuan2 extends Component {
    
    @property(LabelComponent)
    coinLabel = null;
   
    @property(Node)
    btnHome = null;
    @property(Node)
    btnLingqu = null;
    @property(Node)
    titleNode = null;

    gameControl = null;
    mainControl = null;
    type = null;
   
    useShare = false;
    start () {
        this.initUI();
        this.updateAd();
    }

    initUI(){
        var currScore = this.gameControl.playerSc.currScore;

        this.coinLabel.string = storage.castNum(currScore);
        var maxscore2 = storage.getStorage(storage.maxscore2);
        if(currScore>maxscore2)
            storage.setStorage(storage.maxscore2,currScore);

        var index = 1;  
       if(currScore>=800 && currScore<1500)  index = 2;
       else if(currScore>=1500 && currScore<2400)  index = 3;
       else if(currScore>=2400 && currScore<3200)  index = 4;
       else if(currScore>=3200)  index = 5;
       cc.res.setSpriteFrame("images/jiesuan/ImgResultTitle"+index+"/spriteFrame",this.titleNode);
    }

    updateAd(){
        this.useShare = false;
        if(cc.GAME.share)
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
        }
        cc.audio.playSound("button");
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
