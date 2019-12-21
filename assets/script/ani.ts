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
        if(!cc.isValid(this.node)) return;
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

    scaleTo(time:number, toScale:Vec3,callback:any){
        if(!cc.isValid(this.node)) return;
        this.isScale = true;
        this.toScale = this.node.getScale();
        var self = this;
        tweenUtil(this.toScale)
            .to(time, toScale, { easing: 'Cubic-Out' })
            .start()
            .call(function(){
                self.isScale = false;
                if(callback) callback();
            });
    }

    update (deltaTime: number) {
        if(!cc.isValid(this.node)) return;
        if(this.isMove)
        {
            this.node.setPosition(this.toVec);
        }
        if(this.isScale)
        {
            this.node.setScale(this.toScale);
        }
    }
}
