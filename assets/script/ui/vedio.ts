import { _decorator, Component, Node,tween } from "cc";
const { ccclass, property } = _decorator;

@ccclass("vedio")
export class vedio extends Component {
    loadNode = null;
    gameControl = null;
    mainControl = null;

    start () {
        this.loadNode = cc.find("load",this.node.parent);
        tween(this.loadNode)
            .by(2, {eulerAngles:cc.v3(0,0,360)}, { easing: 'cubicOut' })
            .repeatForever()
            .start();
    }

    show(){
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
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
