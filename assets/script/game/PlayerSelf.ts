import { _decorator, Component, Node ,SystemEvent,EventTouch} from "cc";
const { ccclass, property } = _decorator;
import { Player } from "./Player"

@ccclass("PlayerSelf")
export class PlayerSelf extends Player {
    private startTouchPos = null;
    private findPlaDt = 0;
    private touchTime = 0;


    
    onLoad(){
        this.initEvent();
    }

    start () {
        var skinid = cc.storage.getStorage(cc.storage.skinid);
        if(cc.GAME.shiyongSkinId > 0) skinid = cc.GAME.shiyongSkinId;
        this.initNick("我自己",skinid);
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
        this.touchTime = new Date().getTime();
        this._tarDir = cc.v2(0,1);
    }

    onTouchMove (e:EventTouch) {
        if(!this.isColl)
        {
            let p = e.getLocation();
            this._tarDir = p.subtract(this.startTouchPos).normalize();
            this._tarDir = cc.v2(-this._tarDir.x,this._tarDir.y).rotate(Math.PI);
            // this.moveDir = p.subtract(this.startTouchPos).normalize();
            // this.moveDir = cc.v2(-this.moveDir.x,this.moveDir.y).rotate(Math.PI);
    
        }
        this.isMove = true;
    }

    onTouchEnd (e:EventTouch) {
       this.isMove = false;

       if(new Date().getTime() - this.touchTime < 200)
       {
           let p = e.getLocation();
           var dis = cc.Vec2.distance(p,this.startTouchPos);
           if(dis>=100)
           {
               this.speedUp();
           }
       }
    }

    update (deltaTime: number) {
        if(this.gameControl.isStart)
        {

            this.updateStep(deltaTime);
            this.findPlaDt += deltaTime;
            if(this.findPlaDt>0.2)
            {
                this.findPlaDt = 0;
                this.findOtherPlayer();
            } 
        }
     
    }
}
