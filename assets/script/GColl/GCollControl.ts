import { _decorator, Component, Node,PhysicsSystem } from "cc";
const { ccclass, property,executionOrder } = _decorator;

@ccclass("GCollControl")
@executionOrder(-1)
export class GCollControl extends Component {
    public maps = {};
    public roads = {};
    public static ins = null;

    public collMindis = 1;

    public index = 0;

    private collList = [];

    updt = 0;
    collNum = 0;

    onLoad(){
        GCollControl.ins = this;
        PhysicsSystem.instance.enable = false;
        // cc.log("PhysicsSystem.instance.maxSubStep ",cc.res );
        PhysicsSystem.instance.maxSubStep = 1;
        PhysicsSystem.instance.deltaTime = 1/30;
        // PhysicsSystem.instance.gravity = cc.v3(0,-5,0);

        this.roads = {};
    }

    add(boxColl){
        if(boxColl)
        this.collList.push(boxColl);
    }

    update(dt){
        this.maps = {};
        this.collNum = 0;
    }

    // lateUpdate(dt: number){
        
    // }

}
