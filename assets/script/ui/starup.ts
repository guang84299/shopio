import { _decorator, Component, Node,LabelComponent,SpriteComponent } from "cc";
const { ccclass, property } = _decorator;
import { ani } from "../ani"
import { storage } from "../storage";

@ccclass("starup")
export class starup extends Component {
    
    @property(LabelComponent)
    starlvLabel = null;
    @property(Node)
    starlvname = null;

    gameControl = null;
    mainControl = null;
    type = null;
   
    start () {
        this.initUI();
        
    }

    initUI(){
        var starlv = storage.getStorage(storage.starlv);
        this.starlvLabel.string = starlv;

        cc.res.setSpriteFrame("images/starup/ImgLv"+starlv+"/spriteFrame",this.starlvname);

        cc.sdk.event("升星-"+starlv);
    }

    updateUI(){
        
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
            this.hide();
        }
        cc.audio.playSound("button");
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
