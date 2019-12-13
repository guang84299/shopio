import { _decorator, Component, Node,ButtonComponent } from "cc";
const { ccclass, property } = _decorator;

@ccclass("modesel")
export class modesel extends Component {
   
    @property(ButtonComponent)
    mode1 = null;
    @property(ButtonComponent)
    mode2 = null;
    @property(Node)
    sel1 = null;
    @property(Node)
    sel2 = null;

    // gameControl = null;
    mainControl = null;
    type = null;
    
    start () {
       this.updateMode();
    }

    updateMode(){
        var mode = cc.storage.getStorage(cc.storage.mode);
        if(mode == 1)
        {
            this.mode1.interactable = false;
            this.sel1.active = true;

            this.mode2.interactable = true;
            this.sel2.active = false;
        }
        else{
            this.mode1.interactable = true;
            this.sel1.active = false;

            this.mode2.interactable = false;
            this.sel2.active = true;
        }
    }

    show(type){
        this.type = type;
        // this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.mainControl = cc.find("gameNode").getComponent("mainControl");
    }

    hide(){
       
        this.node.parent.destroy();
    }

    click(event:any,data:any)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "mode1")
        {
            cc.storage.setStorage(cc.storage.mode,1);
            this.updateMode();
        }
        else if(data == "mode2")
        {
            cc.storage.setStorage(cc.storage.mode,2);
            this.updateMode();
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
