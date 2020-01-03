import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;
import { GBoxColl } from "../GColl/GBoxColl"
import { ani } from "../ani"
import { config } from '../config';

@ccclass("Goods")
export class Goods extends Component {
    public state = "idle";
    private gameControl = null;
    public goodsId = 0;
    moveDir = cc.v2(0,0);
    gBoxColl = null;
    conf = {Require:"1",Score:"1",Capacity:"1",CapacityAdd:"0"};
    collPos = null;
    start () {
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.gBoxColl = this.node.getComponent(GBoxColl);
    }

    initConf(goodsId,collPos){
        this.goodsId = goodsId;
        this.collPos = collPos;
        var obj = cc.res.loads["conf_goods"][goodsId-1];
        this.conf = JSON.parse(JSON.stringify(obj));
    }

    drop(toP,delyTime,isPlayerSelf){
        // this.state = "idle";
        // this.gBoxColl.enable(true);

        var self = this;
        var anisc = this.node.addComponent(ani);
        var pos = this.node.getPosition();
        var dir = cc.v2(toP.x,toP.z).subtract(cc.v2(pos.x,pos.z)).normalize();
        var len = cc.Vec2.distance(cc.v2(toP.x,toP.z),cc.v2(pos.x,pos.z))*0.2;
        var to = cc.v3(pos.x+dir.x*len,toP.y+3,pos.z+dir.y*len);
        this.scheduleOnce(function(){
            anisc.moveTo(0.3,to,function(){
                anisc.moveTo(0.2,toP,function(){
                    if(cc.isValid(self.node))
                        {
                            self.node.removeComponent(ani);
                            self.state = "idle";
                            self.gBoxColl.enable(true);
                        }
                    if(isPlayerSelf)
                    cc.sdk.vibrate();
                });
            });
        },delyTime);
    }

    hold(isPlayerSelf){
        this.state = "hold";
        this.gBoxColl.enable(false);

        if(isPlayerSelf)
            cc.sdk.vibrate();

        if(this.collPos)
        {
            for(var i=0;i<this.collPos.length;i++)
            {
                var p = config.converToNodePos(cc.v2(this.collPos[i].x,this.collPos[i].z));
                config.astarmap[p.y][p.x] = 1;
            }
        }    
    }

    die(toP,delyTime,isPlayerSelf,pack){
        this.state = "die";
       
        var self = this;
        var anisc = this.node.addComponent(ani);
        var pos = this.node.getWorldPosition();
        var dir = cc.v2(toP.x,toP.z).subtract(cc.v2(pos.x,pos.z)).normalize();
        var len = cc.Vec2.distance(cc.v2(toP.x,toP.z),cc.v2(pos.x,pos.z))*0.6;
        var to = cc.v3(pos.x+dir.x*len,toP.y+5,pos.z+dir.y*len);
        this.scheduleOnce(function(){
            self.node.setPosition(pos);
            self.node.parent = self.gameControl.goodsNode;

            anisc.moveTo(0.3,to,function(){
                anisc.moveTo(0.2,toP,function(){
                    // if(cc.isValid(self.node))
                    //     self.node.destroy();
                    if(self.gameControl.isStart)
                        pack.holdGoods(self);
                    if(isPlayerSelf)
                    cc.sdk.vibrate();
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
