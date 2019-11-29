import { _decorator, Component, Node ,EventTouch,ColliderComponent,RigidBodyComponent, SystemEvent, game, macro} from "cc";
import { player } from "./player"
import { ani } from "./ani"
import { GBoxColl } from "./GColl/GBoxColl"
const { ccclass, property } = _decorator;


@ccclass("goods")
export class goods extends Component {
   
    private playerSc = null;

    private collider = null;
    public state = "tree";
    private moveSpeed = 6;

    private updateDt = 0;

    public followTarget = null;
    public followTargetIndex = 0;
    public followIndex = 0;

    private gameControl = null;
    private players = null;
    private selPlayer = null;

    public lv = 0;

    moveDir = cc.v2(0,0);
    quadTree = null;
    meshBox = null;
    maxCollNum  =0 ;

    gBoxColl = null;
    onLoad(){
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.playerSc = this.gameControl.playerSc;
        this.players = this.gameControl.players;
        this.quadTree = this.gameControl.quadTree;
        this.meshBox =  this.gameControl.meshBox;

    }

    start () {
      var p1 = this.node.getPosition();
      this.moveDir = cc.v2(0,0).subtract(cc.v2(p1.x,p1.z)).normalize();
      this.gBoxColl = this.node.getComponent(GBoxColl);
      // this.gBoxColl.applyForce(this.moveDir.multiplyScalar(5));
    }

    onDestroy () {
       
    }

    onEnable () {
      
    }

    onDisable () {
        
    }

    drop(){
      this.followTarget = null;
      this.followTargetIndex = 0;
      this.state = "idle";
    }

    die(toP){
        this.state = "die";
        var self = this;

        var anisc = this.node.addComponent(ani);
        anisc.moveTo(0.5,cc.v3(toP.x,toP.y+3,toP.z),function(){
          self.node.destroy();
        });
    }

    getNextPos(dt)
    {
        var p = this.node.getPosition();
        this.moveDir = cc.v2(0,0).subtract(cc.v2(p.x,p.z)).normalize();
        p.x += this.moveSpeed*dt*this.moveDir.x;
        p.z += this.moveSpeed*dt*this.moveDir.y;

        var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(0,0));
        if(dis<0.1) 
        {
          p.x = 0;
          p.z = 0;
        }
        return p;
    }

    updatePos(p,moveDir,dt){
      p.x += this.moveSpeed*dt*moveDir.x;
      p.z += this.moveSpeed*dt*moveDir.y;
      this.node.setPosition(p);


    }



    update (dt:number) {
      if(this.state == "idle")
      {
          for(var i=0;i<this.players.length;i++)
          {
            var playerSc = this.players[i];
            if(playerSc.lv >= this.lv && playerSc.canAddGoods())
            {
              var p1 = playerSc.node.getPosition();
              var p2 = this.node.getPosition();
              var dis = cc.Vec2.distance(cc.v2(p1.x,p1.z),cc.v2(p2.x,p2.z));
              if(dis<this.node.getScale().z/2+playerSc.node.getScale().z)
              {
                  this.state = "follow";
                  playerSc.follows.push(this);
                  this.selPlayer = playerSc;
                  break;
              }
            }
          }
      }
      else if(this.state == "follow")
      {
          var p = this.node.getPosition();
         
          if(this.followTarget == null)
          {
             this.followTarget = this.selPlayer.getFollowPoint();
             if(this.followTarget != null)
             this.followTargetIndex =  this.followTarget.followIndex;
          } 
          else
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
                var moveDir = cc.v2(p1.x,p1.z).subtract(cc.v2(p.x,p.z)).normalize();
                p.x += this.moveSpeed*dt*moveDir.x;
                p.z += this.moveSpeed*dt*moveDir.y;

                this.node.setPosition(p);
            }
          }
      }
      

      this.updateDt+=dt;
      
    }

    lateUpdate(dt: number){
      if(this.state == "tree")
      {
        // this.updateDir(dt);
        var p = this.node.getPosition();
        // p.x += this.moveSpeed*dt*this.moveDir.x;
        // p.z += this.moveSpeed*dt*this.moveDir.y;

        // this.node.setPosition(p);

        var dis = cc.Vec2.distance(cc.v2(0,0),cc.v2(p.x,p.z));
        if(dis<0.2)
        {
          //  this.node.getComponent(GBoxColl).applyForce(cc.v2(0,0));
          //  this.state = "end";
        }
        else{
          this.moveDir = cc.v2(0,0).subtract(cc.v2(p.x,p.z)).normalize();
          // this.gBoxColl.applyForce(this.moveDir.multiplyScalar(8));
        }
      }

    }


    public enable () {
        this.enabled = !this.enabled;
    }
}
