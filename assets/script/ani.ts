import { _decorator, Component, Node ,Vec3,tweenUtil} from "cc";
const { ccclass, property } = _decorator;

@ccclass("ani")
export class ani extends Component {
   
    private toVec: Vec3 = new Vec3(0, 0, 0);
    private toScale: Vec3 = new Vec3(0, 0, 0);
    private isMove = false;
    private isScale = false;

    start () {
        // Your initialization goes here.
    }
    moveTo(time:number, toPos:Vec3,callback:any){
        this.isMove = true;
        this.toVec = cc.v3(this.node.position);
        var self = this;
        tweenUtil(this.toVec)
            .to(time, toPos, { easing: 'Cubic-Out' })
            .start()
            .call(function(){
                self.isMove = false;
                if(callback) callback();
            });
    }

    update (deltaTime: number) {
        if(this.isMove)
        {
            this.node.setWorldPosition(this.toVec);
        }
        if(this.isScale)
        {
            this.node.setScale(this.toScale);
        }
    }
}
