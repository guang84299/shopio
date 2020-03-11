import { _decorator, Component, Node ,Vec3,tween} from "cc";
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
        tween(this.node)
            .to(time, {position:toPos}, { easing: 'cubicOut' })
            .call(function(){
                self.isMove = false;
                if(callback) callback();
            })
            .start();
    }

    bezierTo(time:number, toPos:Vec3[],callback:any)
    {
        if(!cc.isValid(this.node)) return;
        this.isMove = true;
        this.toVec = cc.v3(this.node.position);
        var self = this;
        var twenn = tween(this.node);
        for(var i=0;i<toPos.length;i++)
        {
            twenn.to(time/toPos.length, {position:toPos[i]}, { easing: 'cubicOut'});
        }
        twenn.union()
        .call(function(){
            self.isMove = false;
            if(callback) callback();
        })
        .start();            
    }

    scaleTo(time:number, toScale:Vec3,callback:any){
        if(!cc.isValid(this.node)) return;
        this.isScale = true;
        this.toScale = this.node.getScale();
        var self = this;
        // tween(this.toScale)
        //     .to(time, toScale, { easing: 'cubicOut' })
        //     .start()
        //     .call(function(){
        //         self.isScale = false;
        //         if(callback) callback();
        //     });

        tween(this.node)
        .to(time, { scale: toScale }, { easing: 'cubicOut' })
        .call(function(){
            self.isScale = false;
            if(callback) callback();
        })
        .start();
    }

    // update (deltaTime: number) {
    //     if(!cc.isValid(this.node)) return;
    //     if(this.isMove)
    //     {
    //         this.node.setPosition(this.toVec);
    //     }
    //     if(this.isScale)
    //     {
    //         this.node.setScale(this.toScale);
    //     }
    // }
}
