import { _decorator, Component, Node,ButtonComponent,SpriteComponent } from "cc";
const { ccclass, property } = _decorator;
import { storage } from "../storage";

@ccclass("shiyong")
export class shiyong extends Component {
   
    @property(Node)
    shiyongBtn = null;
    @property(Node)
    skin = null;

    gameControl = null;
    mainControl = null;

    useShare = false;

    shiyongType = 0;
    shiyongId = 0;
    
    start () {
       this.updateAd();

       var rballs = [];
       var rskins = [];
       if(Math.random()>0.5)
       {
            var hasskin = storage.getStorage(storage.hasskin);
            if(!hasskin) hasskin = [];
            for(var i=1;i<=10;i++)
            {
                if(storage.indexOf(hasskin,i) == -1) rskins.push(i);
            }

            if(rskins.length == 0)
            {
                var hasball = storage.getStorage(storage.hasball);
                if(!hasball) hasball = [];
                for(var i=1;i<=4;i++)
                {
                    if(storage.indexOf(hasball,i) == -1) rballs.push(i);
                }
                if(rballs.length == 0) rskins.push(Math.floor(Math.random()*10+1));
            }

       }
       else
       {
            var hasball = storage.getStorage(storage.hasball);
            if(!hasball) hasball = [];
            for(var i=1;i<=4;i++)
            {
                if(storage.indexOf(hasball,i) == -1) rballs.push(i);
            }

            if(rballs.length == 0)
            {
                var hasskin = storage.getStorage(storage.hasskin);
                if(!hasskin) hasskin = [];
                for(var i=1;i<=10;i++)
                {
                    if(storage.indexOf(hasskin,i) == -1) rskins.push(i);
                }
                if(rskins.length == 0) rballs.push(Math.floor(Math.random()*4+1));
            }

       }

       if(rskins.length>0) 
       {
            this.shiyongType = 1;
            this.shiyongId = rskins[Math.floor(Math.random()*rskins.length)];
            cc.res.setSpriteFrame("images/skin/ImgSkin"+this.shiyongId+"/spriteFrame",this.skin);
       }
       else 
       {
            this.shiyongType = 2;
            this.shiyongId = rballs[Math.floor(Math.random()*rballs.length)];
            cc.res.setSpriteFrame("images/skin/ball"+this.shiyongId+"/spriteFrame",this.skin);
       }
       cc.log(this.shiyongType,this.shiyongId);
    }

    updateAd(){
        this.useShare = false;
        if(cc.GAME.share)
        {
            var rad = parseInt(cc.GAME.shiyongAd);
            if(!cc.GAME.hasVideo) rad = 100;
            if(Math.random()*100 < rad)
            {
                this.useShare = true;
                this.shiyongBtn.getChildByName("share").active = true;
                this.shiyongBtn.getChildByName("video").active = false;
            }
            else
            {
                this.shiyongBtn.getChildByName("share").active = false;
                this.shiyongBtn.getChildByName("video").active = true;
            }
        }
        else
        {
            this.shiyongBtn.getChildByName("share").active = false;
            this.shiyongBtn.getChildByName("video").active = true;
        }
    }

    toShiyong(){
        
        if(this.shiyongType == 1) cc.GAME.shiyongSkinId = this.shiyongId;
        else if(this.shiyongType == 2) cc.GAME.shiyongBallId = this.shiyongId;
        this.hide();
    }

    show(){
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.mainControl = cc.find("gameNode").getComponent("mainControl");
        cc.sdk.showBanner();
        cc.sdk.event("皮肤试用界面-打开");
    }

    hide(){
       
        this.node.parent.destroy();
        cc.sdk.hideBanner();
        cc.director.loadScene("game");
    }

    click(event:any,data:any)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "shiyong")
        {
            var self = this;
            if(this.useShare)
            {
                cc.sdk.share(function(r){
                    if(r) self.toShiyong();
                });
            }
            else
            {
                cc.sdk.showVedio(function(r){
                    if(r) self.toShiyong();
                });
            }
            cc.sdk.event("皮肤试用界面-试用");
        }
       
        cc.log(data);
        cc.audio.playSound("button");
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
