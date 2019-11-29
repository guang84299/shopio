import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;
import { GBoxColl } from "../GColl/GBoxColl"
import { ani } from "../ani"

@ccclass("Goods")
export class Goods extends Component {
    public state = "idle";
    // private gameControl = null;
    public goodsId = 0;
    moveDir = cc.v2(0,0);
    gBoxColl = null;
    conf = {Require:"1",Score:"1",Capacity:"1",CapacityAdd:"0"};

    start () {
        // this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.gBoxColl = this.node.getComponent(GBoxColl);
    }

    initConf(goodsId){
        this.goodsId = goodsId;
        var obj = cc.res.loads["conf_goods"][goodsId-1];
        this.conf = JSON.parse(JSON.stringify(obj));
    }

    drop(){
        this.state = "idle";
        this.gBoxColl.enable(true);
    }

    hold(){
        this.state = "hold";
        this.gBoxColl.enable(false);
    }
  
    die(toP){
        this.state = "die";
        var self = this;
        var anisc = this.node.addComponent(ani);
        anisc.moveTo(0.5,cc.v3(toP.x,toP.y,toP.z),function(){
            self.node.destroy();
        });
    }

    canHold(lv:Number){
        return lv >= Number(this.conf.Require);
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
