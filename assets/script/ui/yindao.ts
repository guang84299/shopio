import { _decorator, Component, Node,ButtonComponent,SpriteComponent,tween,UITransformComponent } from "cc";
const { ccclass, property } = _decorator;
import { storage } from "../storage";

@ccclass("yindao")
export class yindao extends Component {
   
    @property(Node)
    hand = null;
    @property(Node)
    itembg = null;
   
    gameControl = null;
    mainControl = null;

    step = 0;
    start () {
        tween(this.hand)
        .to(0.5,{scale:cc.v3(1.3,1.3,1)},{ easing: 'cubicOut' })
        .to(0.5,{scale:cc.v3(1,1,1)},{ easing: 'cubicOut' })
        .delay(0.5)
        .union()
        .repeatForever()
        .start();

         this.showYindao(this.step);
    }

    showYindao(step){
        this.itembg.destroyAllChildren();
        var tar = null;
        if(step == 1)
        {
            tar = cc.find("Canvas/btnNode/skin");
        }
        else if(step == 2)
        {
            tar = cc.res.getUI("skin").node.parent;
            tar = cc.find("box/sel",tar);
        }

        if(tar)
        {
            var pos = tar.parent.getComponent(UITransformComponent).convertToWorldSpaceAR(tar.position);
            pos.x -= cc.winSize.width/2;
            pos.y -= cc.winSize.height/2;
            this.hand.position = pos;
            this.itembg.addChild(cc.instantiate(tar));
        }
    }


    show(step){
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.mainControl = cc.find("gameNode").getComponent("mainControl");
        this.step = step;
        cc.sdk.showBanner();
        cc.sdk.event("引导界面-打开");
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
       
       
        cc.log(data);
        cc.audio.playSound("button");
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
