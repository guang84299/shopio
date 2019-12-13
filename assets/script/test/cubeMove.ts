import { _decorator, Component, Node ,SystemEvent,EventTouch, RigidBodyComponent} from "cc";
const { ccclass, property } = _decorator;

@ccclass("cubeMove")
export class cubeMove extends Component {
    startTouchPos=cc.v2();
    rigid = null;
    cubeColl = null;
    onLoad(){
        this.initEvent();
    }

    start () {
        this.rigid = this.node.getComponent(RigidBodyComponent);
        this.cubeColl = this.node.getComponent("cubeColl");
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
        var moveDir = p.subtract(this.startTouchPos).normalize();
        moveDir = cc.v2(-moveDir.x,moveDir.y).rotate(Math.PI);

        this.cubeColl.moveDir = moveDir;
        var speed = 4;
        this.rigid.enabled = true;
        this.rigid.setLinearVelocity(cc.v3(moveDir.x*speed,0,moveDir.y*speed));

    }

    onTouchEnd (e:EventTouch) {
    }
}
