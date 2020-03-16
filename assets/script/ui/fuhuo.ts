import { _decorator, Component, Node,ButtonComponent,SpriteComponent } from "cc";
const { ccclass, property } = _decorator;

@ccclass("fuhuo")
export class fuhuo extends Component {
   
    @property(Node)
    fuhuoBtn = null;
    // @property(ButtonComponent)
    // mode2 = null;
    // @property(Node)
    // sel1 = null;
    // @property(Node)
    // sel2 = null;

    gameControl = null;
    mainControl = null;

    useShare = false;
    
    start () {
       this.updateAd();
    }

    updateAd(){
        this.useShare = false;
        if(cc.GAME.share)
        {
            var rad = parseInt(cc.GAME.fuhuoAd);
            if(!cc.GAME.hasVideo) rad = 100;
            if(Math.random()*100 < rad)
            {
                this.useShare = true;
                this.fuhuoBtn.getChildByName("share").active = true;
                this.fuhuoBtn.getChildByName("video").active = false;
            }
            else
            {
                this.fuhuoBtn.getChildByName("share").active = false;
                this.fuhuoBtn.getChildByName("video").active = true;
            }
        }
        else
        {
            this.fuhuoBtn.getChildByName("share").active = false;
            this.fuhuoBtn.getChildByName("video").active = true;
        }
    }

    fuhuo(){
        this.gameControl.fuhuo();
        this.hide();
    }

    toOver(){
        this.gameControl.gameOver();
    }

    show(){
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
            this.toOver();
            this.hide();
        }
        else if(data == "fuhuo")
        {
            var self = this;
            if(this.useShare)
            {
                cc.sdk.share(function(r){
                    if(r) self.fuhuo();
                });
            }
            else
            {
                cc.sdk.showVedio(function(r){
                    if(r) self.fuhuo();
                });
            }
        }
       
        cc.log(data);
        cc.audio.playSound("button");
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
