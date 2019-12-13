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
  
    die(toP,delyTime){
        this.state = "die";
        var self = this;
        var anisc = this.node.addComponent(ani);
        var pos = this.node.getPosition();
        var dir = cc.v2(toP.x,toP.z).subtract(cc.v2(pos.x,pos.z)).normalize();
        var len = cc.Vec2.distance(cc.v2(toP.x,toP.z),cc.v2(pos.x,pos.z))*0.6;
        var to = cc.v3(pos.x+dir.x*len,toP.y+2,pos.z+dir.y*len);
        this.scheduleOnce(function(){
            anisc.moveTo(0.3,to,function(){
                anisc.moveTo(0.2,toP,function(){
                    self.node.destroy();
                });
            });
        },delyTime);
       
    }

    canHold(lv:Number){
        return lv >= Number(this.conf.Require);
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
