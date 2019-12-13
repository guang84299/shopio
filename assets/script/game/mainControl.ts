import { _decorator, Component, Node, Prefab,LabelComponent,ProgressBarComponent ,CameraComponent} from "cc";
import { Player } from "./Player"
import { Goods } from "./Goods"
import { Robot } from "./Robot"
import { PlayerFollow } from "./PlayerFollow"
import { GBoxColl } from "../GColl/GBoxColl"
import { res } from "../res"
const { ccclass, property } = _decorator;

@ccclass("mainControl")
export class mainControl extends Component {
   
    @property(Node)
    goodsNode = null;

    upDt = 0;
    score = 0;
    num = 0;
    start () {
        cc.game.setFrameRate(30);

        // this.initMap();
       
    }

   
    initMap(){
        var i = 0;
        for(;this.num<cc.res.loads["conf_map"].length;this.num ++)
        {
            var m = cc.res.loads["conf_map"][this.num];
            var pre = cc.res.loads["conf_goods"][m.id-1].Prefab;
            var mass = Number(cc.res.loads["conf_goods"][m.id-1].Mass);
            this.score +=  Number(cc.res.loads["conf_goods"][m.id-1].Score);

            if(res.loads["prefab_game_"+pre])//pre.indexOf("Shelves") != -1 && 
            {
                var goods = cc.instantiate(res.loads["prefab_game_"+pre]);
                goods.setWorldPosition(cc.v3(Number(m.x),Number(m.y),Number(m.z)));
                goods.setWorldRotation(Number(m.rx),Number(m.ry),Number(m.rz),Number(m.rw));
                this.goodsNode.addChild(goods);
                
                goods.addComponent(Goods).initConf(m.id);
            }

            i ++;
            if(i> 30) break;
        }
        if(this.num<cc.res.loads["conf_map"].length)
        {
            this.scheduleOnce(this.initMap.bind(this),0.1);
        }
        else{
            this.initRobot();
        }
    }

    initRobot(){
        //生成robot
        // this.players = [];
       for(var i=0;i<0;i++)
       {
            var robot = cc.instantiate(res.loads["prefab_game_player"]);
            robot.setPosition(cc.v3((Math.random()-0.5)*10,0,(Math.random()-0.5)*15));
            this.goodsNode.addChild(robot);
            var robotSc = robot.addComponent(Robot);
            robotSc.initConf(1);
            robotSc.initRobotConf(15);
       }
    }

    click(event,data){
        if(data == "start")
        {
            cc.director.loadScene("game");
        }
        else if(data == "mode")
        {
            res.openUI("modesel");
        }
        else if(data == "skin")
        {
            // res.openUI("jiesuan");
        }
    }
    // update (dt: number) {
        
    //     this.upDt += dt;
    //     if(this.upDt>1/30)
    //     {
           
    //         this.upDt = 0;
    //     }
       
        
    // }
}
