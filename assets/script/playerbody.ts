import { _decorator, Component, Node ,EventTouch} from "cc";
import { ani } from "./ani"
import { player } from "./player"
const { ccclass, property } = _decorator;


@ccclass("playerbody")
export class playerbody extends Component {
   
    private moveSpeed = 9;
    private moveDir = cc.v2(0,0);

    public followTarget = null;
    public followTargetIndex = 0;
    public followIndex = 0;

    private gameControl = null;
    private isColl = false;

    public playerSc = null;

    onLoad(){
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.node.addComponent(ani);
    }

    start () {
        
    }

    onDestroy () {
    }

    onEnable () {
    }

    onDisable () {
    }

    coll(pos,plv){
        var toPos = this.node.getPosition();
        if(pos)
        {
            var dir = cc.v2(toPos.x,toPos.z).subtract(cc.v2(pos.x,pos.z)).normalize();
            var rad = this.moveDir.signAngle(dir);
            var toDir = this.moveDir.rotate(rad/2);
            toPos.x += toDir.x*2;
            toPos.z += toDir.y*2;
        }
        else{
            toPos.x += this.moveDir.x*1;
            toPos.z += this.moveDir.y*1;
        }
        this.isColl = true;
        var self = this;
        var anisc = this.node.getComponent(ani);
        anisc.moveTo(0.2,toPos,function(){
            self.isColl = false;
            // self.isMove = true;
        });

        if(plv>this.playerSc.lv)
            this.playerSc.dropGoods();
    }

    update (dt:number) {
        var p = this.node.getPosition();
         
        if(this.followTarget == null)
        {
           this.followTarget = this.gameControl.getFollowPoint();
           if(this.followTarget != null)
           this.followTargetIndex =  this.followTarget.followIndex;
        } 
        else
        {
            if(!this.isColl)
            {
                var p1 = this.followTarget.node.getPosition();
                if(this.followTargetIndex == 0)
                {
                    p1.x -= this.followTarget.node.getScale().x;
                }
                else if(this.followTargetIndex == 1)
                {
                    p1.x += this.followTarget.node.getScale().x;
                }
                var dis = cc.Vec2.distance(cc.v2(p1.x,p1.z),cc.v2(p.x,p.z));
                if(dis>this.followTarget.node.getScale().x/2+this.node.getScale().x/2)
                {
                    this.moveDir = cc.v2(p1.x,p1.z).subtract(cc.v2(p.x,p.z)).normalize();
                    p.x += this.moveSpeed*dt*this.moveDir.x;
                    p.z += this.moveSpeed*dt*this.moveDir.y;

                    this.node.setPosition(p);
                }

                //判断碰撞
                //和其他角色碰撞
                for(var i=0;i<this.playerSc.players.length;i++)
                {
                    var pla = this.playerSc.players[i];
                    if(pla != this.playerSc)
                    {
                            var p2 = pla.node.getPosition();
                            var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
                            if(dis<1)
                            {
                                this.coll(p2,pla.lv);
                                // pla.coll(p);
                                break;
                            }

                            //和他们的身体碰撞
                            var b = false;
                            for(var j=0;j<pla.bodys.length;j++)
                            {
                                var body = pla.bodys[j];
                                var p2 = body.node.getPosition();
                                var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
                                if(dis<1)
                                {
                                    this.coll(p2,pla.lv);
                                    // body.coll(p);
                                    b = true;
                                    break;
                                }
                            }
                            if(b) break;
                    }
                }

            }
        }

    }


    public enable () {
        this.enabled = !this.enabled;
    }
}
