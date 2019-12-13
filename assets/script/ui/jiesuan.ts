import { _decorator, Component, Node,LabelComponent } from "cc";
const { ccclass, property } = _decorator;
import { ani } from "../ani"

@ccclass("jiesuan")
export class jiesuan extends Component {
   
    @property(Node)
    item = null;
    @property(Node)
    itemLay = null;
  

    gameControl = null;
    mainControl = null;
    type = null;
   
    start () {
       
        for(var i=0;i<this.gameControl.players.length;i++)
        {
            var pla = this.gameControl.players[i];
            
            var item = cc.instantiate(this.item);
            item.active = true;

            var rank = cc.find("rank",item).getComponent(LabelComponent);
            var nick = cc.find("nick",item).getComponent(LabelComponent);
            var score = cc.find("score",item).getComponent(LabelComponent);

            rank.string = (i+1);
            nick.string = cc.storage.getLabelStr(pla.nick,14);
            score.string = pla.currScore;
           
            this.itemLay.addChild(item);
        }
    }

    updateUI(){
        
    }
    

    show(type){
        this.type = type;
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
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
        else if(data == "home")
        {
            cc.director.loadScene("main");
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
