import { _decorator, Component, Node ,SystemEvent,EventTouch} from "cc";
const { ccclass, property } = _decorator;
import { Player } from "./Player"

@ccclass("PlayerSelf")
export class PlayerSelf extends Player {
    private startTouchPos = null;

    onLoad(){
        this.initEvent();
    }

    start () {
        this.initNick("留个名吧！");
        super.start();
        this.isPlayerSelf = true;
        this.initConf(1);
    }

    initEvent(){
        cc.systemEvent.on(SystemEvent.EventType.TOUCH_START, this.onTouchStart, this);
        cc.systemEvent.on(SystemEvent.EventType.TOUCH_MOVE, this.onTouchMove, this);
        cc.systemEvent.on(SystemEvent.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart (e:EventTouch) {
        this.startTouchPos = e.getLocation();
    }

    onTouchMove (e:EventTouch) {
        let p = e.getLocation();
        this.moveDir = p.subtract(this.startTouchPos).normalize();
        this.moveDir = cc.v2(-this.moveDir.x,this.moveDir.y).rotate(Math.PI);
        this.isMove = true;
    }

    onTouchEnd (e:EventTouch) {
       this.isMove = false;
    }

    update (deltaTime: number) {
      this.updateStep(deltaTime);
    }
}
