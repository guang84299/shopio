import { _decorator, Component, Node,LabelComponent } from "cc";
const { ccclass, property } = _decorator;
import { ani } from "../ani"

@ccclass("countdown")
export class countdown extends Component {
   
    @property(LabelComponent)
    timeLabel = null;
  

    gameControl = null;
    mainControl = null;
    type = null;
    
    anisc = null;
    num = 3;
    start () {
        this.anisc = this.timeLabel.node.addComponent(ani);
        this.schedule(this.updateUI.bind(this),1,3,1);
    }

    updateUI(){
        var self = this;
        this.timeLabel.string = this.num+"";
        this.anisc.scaleTo(0.3,cc.v3(1.2,1.2,1.2),function(){
            self.timeLabel.node.setScale(cc.v3(1,1,1));

            self.num --;
            if(self.num < 0)
            {
                self.hide();
            }
        });
    }
    

    show(type){
        this.type = type;
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.mainControl = cc.find("gameNode").getComponent("mainControl");
    }

    hide(){
        this.gameControl.startCountDown(); 
        this.node.parent.destroy();
    }

    click(event:any,data:any)
    {
        if(data == "close")
        {
            this.hide();
        }
        
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
