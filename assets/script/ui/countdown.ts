import { _decorator, Component, Node,LabelComponent,SpriteComponent,BlockInputEventsComponent } from "cc";
const { ccclass, property } = _decorator;
import { ani } from "../ani"

@ccclass("countdown")
export class countdown extends Component {
   
    @property(LabelComponent)
    timeLabel = null;
    @property(LabelComponent)
    timeLabel2 = null;
    @property(Node)
    startNode = null;
    @property(Node)
    endNode = null;
    @property(Node)
    sp2 = null;
    @property(Node)
    endsp = null;
  

    gameControl = null;
    mainControl = null;
    type = null;
    
    anisc = null;
    anisc2 = null;

    anisc3 = null;
    anisc4 = null;

    num = 3;
    start () {
        if(this.type == 1)
        {
            this.startNode.active = true;
            this.endNode.active = false;

            this.anisc = this.timeLabel.node.addComponent(ani);
            this.anisc2 = this.sp2.addComponent(ani);
            this.schedule(this.updateUI1.bind(this),1,3,1);
            this.timeLabel.string = "";
        }
       else
       {
            this.startNode.active = false;
            this.endNode.active = true;

            this.node.removeComponent(SpriteComponent);
            this.node.removeComponent(BlockInputEventsComponent);

            this.num = 11;
            this.anisc3 = this.timeLabel2.node.addComponent(ani);
            this.anisc4 = this.endsp.addComponent(ani);
            this.schedule(this.updateUI2.bind(this),1,10,0);
            this.timeLabel2.string = "";
       }
    }

    updateUI1(){
        var self = this;
        this.timeLabel.string = this.num+"";
        if(this.num == 0) 
        {
            this.timeLabel.string = "";
            this.sp2.active = true;
            this.anisc2.scaleTo(0.3,cc.v3(1.3,1.3,1.3),function(){
                self.sp2.setScale(cc.v3(1,1,1));
                self.hide();
            });
            cc.audio.playSound("audio/MusGameStart");
        }
        else
        {
            this.anisc.scaleTo(0.3,cc.v3(1.3,1.3,1.3),function(){
                self.timeLabel.node.setScale(cc.v3(1,1,1));
                self.num --;
            });

            cc.audio.playSound("audio/MusCountDown");
        }
    }

    updateUI2(){
        var self = this;
        if(this.num == 11) 
        {
            this.timeLabel2.string = "";
            this.endsp.active = true;
            this.anisc4.scaleTo(0.3,cc.v3(1.3,1.3,1.3),function(){
                self.endsp.setScale(cc.v3(1,1,1));
                self.endsp.active = false;
            });
            self.num --;
        }
        else
        {
            this.timeLabel2.string = this.num+"";

            this.anisc3.scaleTo(0.3,cc.v3(1.3,1.3,1.3),function(){
                self.timeLabel2.node.setScale(cc.v3(1,1,1));
                self.num --;
                if(self.num <= 0) 
                {
                    cc.audio.playSound("audio/MusGameEnd");
                    self.hide();
                }
            });
            if(self.num>0)
            cc.audio.playSound("audio/MusCountDown");
        }
    }
    

    show(type){
        this.type = type;
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.mainControl = cc.find("gameNode").getComponent("mainControl");
    }

    hide(){
        if(this.type == 1) this.gameControl.startCountDown(); 
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
