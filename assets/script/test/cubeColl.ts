import { _decorator, Component, Node,RigidBodyComponent ,ColliderComponent,ITriggerEvent} from "cc";
const { ccclass, property } = _decorator;

@ccclass("cubeColl")
export class cubeColl extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    // @property
    // serializableDummy = 0;
    rigid = null;
    upCollDt = 0;
    isOpenColl = true;
    moveDir = cc.v2(0,0);
    start () {
        // Your initialization goes here.
        this.rigid = this.node.getComponent(RigidBodyComponent);

        let Collider = this.node.getComponent(ColliderComponent);
        Collider.on('onTriggerStay', this.onTrigger, this);
    }

    private onTrigger (event: ITriggerEvent) {
        var otherPos = event.otherCollider.node.getPosition();
        var pos = this.node.getPosition();
        this.moveDir = cc.v2(pos.x,pos.z).subtract(cc.v2(otherPos.x,otherPos.z)).normalize();
        // console.log(event.type, event);
    }

    update (deltaTime: number) {
        var pos = this.node.getPosition();
        pos.x += this.moveDir.x*deltaTime*6;
        pos.z += this.moveDir.y*deltaTime*6;

        this.node.setPosition(pos);
        this.moveDir.x = 0;
        this.moveDir.y = 0;
        // var v = cc.v3();
        // this.rigid.getLinearVelocity(v)
        // if(Math.random()<0.01) cc.log(v);
    //    if(this.isOpenColl)
    //    {
    //        var v = cc.v3();
    //        this.rigid.getLinearVelocity(v)
    //        if(v.length()<0.02)
    //        {
    //             this.isOpenColl = false;
    //             this.rigid.enabled = false;
    //             this.upCollDt = 0.1;
    //        }
    //    }
    //    else
    //    {
    //         this.upCollDt -= deltaTime;
    //         if(this.upCollDt<0)
    //         {
    //             this.isOpenColl = true;
    //             this.rigid.enabled = true;
    //         }
    //    }
    }
}
