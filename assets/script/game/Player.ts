import { _decorator, Component, Node,SkeletalAnimationComponent,ModelComponent,Color,LabelComponent} from "cc";
const { ccclass, property } = _decorator;
import { ani } from "../ani"
import { GBoxColl } from "../GColl/GBoxColl"
import { GCollControl } from '../GColl/GCollControl';
import { Goods } from "./Goods"
import { config } from '../config';

@ccclass("Player")
export class Player extends Component {
    public moveDir = cc.v2(0,0);
    protected isMove = false;
    protected isColl = false;
    protected moveSpeed = 4;
    protected isCanColl = true;

    public lv = 1;
    protected gameControl = null;
    protected state = "idle";
    protected gcoll = null;

    protected goods = [];
    protected hands = [];
    protected skinNodes = [];
    protected follow = [];
    public followTarget = null;

    protected conf = {Score:"10",Capacity:"8",Speed:"1",PlayerNum:"1"};
    protected currCapacity = 0;//当前装载量
    public currScore = 0;//当前分数
    protected isPlayerSelf = false;
    protected isFollowPlayer = false;
    public isRobot = false;  
    protected robotId = 0;
    protected robotConfId = {ID:1,range:1,collect:0,wander:0,rob:0,avoid:0,capacitylimit:60,wandertime:10};
    protected robotConflv = {lv:1,pay:90,collect:80,wander:80,rob:0,avoid:0};
    protected robotConfPath = [];

    protected toHoldGoodsTime = 0;
    protected tarGoods = null;
    protected tarPlayer = null;

    public bodyColor = Color.WHITE.clone();
    protected uiNick = null;
    protected nickNode = null;
    protected kingNode = null;
    protected nick = "";
    protected skinId = 0;

    protected currCollNode = null;
    protected currEmojiType = "";

    start () {
        this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.node.addComponent(ani);
        this.gcoll = this.node.getComponent(GBoxColl);
        if(this.gcoll) this.gcoll.setCollcallback(this.collEnter.bind(this));

        var sockets = this.node.getComponent(SkeletalAnimationComponent).sockets;
        if(sockets.length>=2)
        {
            for(var i=0;i<2;i++)
            this.hands.push(cc.find("node",sockets[i].target));
        }
        for(var i=2;i<sockets.length;i++)
            this.skinNodes.push(cc.find("node",sockets[i].target));

        var material = cc.find("RootNode/player_01",this.node).getComponent(ModelComponent).material;   
        material.setProperty('albedo', this.bodyColor); 

        this.nickNode = cc.find("head",this.node);

        if(this.gameControl)
        {
            this.uiNick = cc.instantiate(cc.res.loads["prefab_ui_nick"]);
            this.uiNick.parent = this.gameControl.gameUI;
            this.uiNick.getComponent(LabelComponent).string = "Lv.1 "+this.nick;
        }
        this.kingNode = cc.find("king",this.nickNode);

        this.initSkin();
    }

    initNick(nick,skinId){
        //昵称
        this.nick = nick;
        this.skinId = skinId;
    }

    initConf(lv){
        this.lv = lv;
        var obj = cc.res.loads["conf_player"][lv-1];
        this.conf = JSON.parse(JSON.stringify(obj));

        if(this.isRobot)
        {
            var obj = cc.res.loads["conf_robotlv"][this.lv-1];
            this.robotConflv = JSON.parse(JSON.stringify(obj));

            this.robotConfPath = JSON.parse(JSON.stringify(cc.res.loads["conf_robotpath"][this.lv-1]));
        }  
        
        if(this.isPlayerSelf)
        {
            var lv = cc.storage.getStorage(cc.storage.speedlv);
            var data = cc.res.loads["conf_playerlv"][lv];
            this.moveSpeed = this.moveSpeed*(1+Number(data.speed)/100);

            var lv = cc.storage.getStorage(cc.storage.capacitylv);
            var data = cc.res.loads["conf_playerlv"][lv];
            this.conf.Capacity = Number(this.conf.Capacity)*(1+Number(data.capacity)/100) + "";
        }
        if(this.uiNick)
        {
            this.uiNick.getComponent(LabelComponent).string = "Lv."+this.lv+" "+this.nick;
        }
    }

    initRobotConf(id){
        if(id && id < cc.res.loads["conf_robotid"].length)
        {
            var obj = cc.res.loads["conf_robotid"][id-1];
            this.robotConfId = JSON.parse(JSON.stringify(obj));
        }

        var obj = cc.res.loads["conf_robotlv"][this.lv-1];
        this.robotConflv = JSON.parse(JSON.stringify(obj));

        this.robotConfPath = JSON.parse(JSON.stringify(cc.res.loads["conf_robotpath"][this.lv-1]));
    }

    initSkin(){
        if(!this.skinId) return;
        var skin = cc.instantiate(cc.res.loads["prefab_skin_skin"+this.skinId]);
        var skins = [];
        for(var i=0;i<skin.children.length;i++)
            skins.push(skin.children[i]);
        this.skinNodes[0].destroyAllChildren();
        this.skinNodes[1].destroyAllChildren();
        this.skinNodes[2].destroyAllChildren();
        this.skinNodes[3].destroyAllChildren();
        this.skinNodes[4].destroyAllChildren();

        for(var i=0;i<skins.length;i++)
        {
            var skinItem = skins[i];
            skinItem.setPosition(cc.v3(0,0,0));
            skinItem.setRotation(0,0,0,0);
            if(skinItem.name == "Bip001 Head Socket")
            {
                skinItem.parent = this.skinNodes[0];
            }
            else if(skinItem.name == "Bip001 Neck Socket")
            {
                skinItem.parent = this.skinNodes[1];
            }
            else if(skinItem.name == "Bip001 Spine Socket")
            {
                skinItem.parent = this.skinNodes[2];
            }
            else if(skinItem.name == "Bip001 L Foot Socket")
            {
                skinItem.parent = this.skinNodes[3];
            }
            else if(skinItem.name == "Bip001 R Foot Socket")
            {
                skinItem.parent = this.skinNodes[4];
            }

        }
    }

    run(){
        if(this.state != "run" && this.state != "post")
        {
            this.node.getComponent(SkeletalAnimationComponent).play("run");
            this.state = "run";
        }
    }

    idle(){
        if(this.state != "idle")
        {   
            var index = Math.floor(Math.random()*2+1);
            this.node.getComponent(SkeletalAnimationComponent).play("idle"+index);
            this.state = "idle";
            this.showEmoji("idle");
        }
    }

    hurt(){
        if(this.state != "hurt")
        {
            this.node.getComponent(SkeletalAnimationComponent).play("hurt");
            this.state = "hurt";

            var self = this;
            this.scheduleOnce(function(){
                // self.node.getComponent(SkeletalAnimationComponent).stop();
                self.idle();
            },1.1)
            this.dropGoods();

            this.showEmoji("hurt");
        }
    }

    updateDir(dir){
        //旋转
        if(dir.x != 0 || dir.y != 0)
        {
            var rad = cc.v2(dir).signAngle(cc.v2(0,1));
            var ang = 180/Math.PI*rad;
            this.node.setRotationFromEuler(0,ang,0);
        }
    }

    //拿商品
    holdGoods(goods:Goods){
        if(goods.state == "idle" && goods.canHold(this.lv) && this.currCapacity+Number(goods.conf.Capacity)<=Number(this.conf.Capacity))
        {
            if(this.hands.length>0)
            {
                goods.hold(this.isPlayerSelf);
                this.goods.push(goods);
                this.currCapacity += Number(goods.conf.Capacity);

                var handIndex = this.goods.length%this.hands.length;
                var l = 1;
                if(handIndex == 1) l = -1;
                goods.node.setPosition(cc.v3(Math.random()*0.2*l,Math.random()*0.2*l,Math.random()*0.2*l));
                goods.node.parent = this.hands[handIndex];

                if(this.isRobot)
                {
                    // this.tarGoods = null;
                    // this.node.emit("excAi");
                    this.toHoldGoodsTime = 0;
                    var tarNode = this.findCanHoldGoods(0);
                    if(!tarNode)
                    {
                        this.node.emit("excAi");
                    }
                }
                else if(this.isPlayerSelf)
                {
                    this.gameControl.updateSelfCapacity(this.currCapacity/Number(this.conf.Capacity));
                }

                this.showEmoji("get");
            }
        }
    }

    //掉落商品
    dropGoods()
    {
        var dropNum = Math.floor(this.goods.length/2);
        for(var i=0;i<dropNum;i++)
        {
            var goods = this.goods[i];
            goods.drop();
            this.currCapacity -= Number(goods.conf.Capacity);

            var p = cc.v3(goods.node.getWorldPosition());
            p.y = 0;
            goods.node.setPosition(p);
            goods.node.parent = this.gameControl.goodsNode;
        }
        if(this.isPlayerSelf)
        {
            this.gameControl.updateSelfCapacity(this.currCapacity/Number(this.conf.Capacity));
        }
        this.goods.splice(0,dropNum);
    }

    //投放商品
    postGoods(){
        if(this.goods.length>0 && this.state != "post")
        {
            this.node.getComponent(SkeletalAnimationComponent).play("post");
            this.state = "post";

            var len = this.goods.length;
            for(var i=0;i<len;i++)
            {
                var goods = this.goods.pop();
                this.currCapacity -= Number(goods.conf.Capacity);
    
                this.addScore(Number(goods.conf.Score));
                if(!this.isPlayerSelf && !this.isRobot)
                {
                    this.followTarget.addScore(Number(goods.conf.Score));
                }
    
                var p = cc.v3(goods.node.getWorldPosition());
                goods.node.setPosition(p);
                goods.node.parent = this.gameControl.goodsNode;
                goods.die(this.gameControl.cashier.getPosition(),i*0.05,this.isPlayerSelf);

                this.addScoreAni(i*0.05,Number(goods.conf.Score));
            }

            if(this.isPlayerSelf)
            {
                this.gameControl.updateSelfCapacity(this.currCapacity/Number(this.conf.Capacity));
                this.gameControl.updateHold(len);
            }
           
            var slef = this;
            this.scheduleOnce(function(){
                slef.idle();
                if(slef.goods.length == 0)
                    slef.node.emit("excAi");
            },0.5);

            if(len>0) this.showEmoji("post");
        }
    }    

    //新增分数动画
    addScoreAni(time,score){
        var slef = this;
        this.scheduleOnce(function(){
            var node = cc.res.getObjByPool("prefab_ui_score");
            node.parent = slef.uiNick;
            node.setPosition(cc.v3(0,40,0));
            node.setScale(2,2,2);
            node.getComponent(LabelComponent).string = "+"+score;
    
            var anisc = node.getComponent(ani);
            anisc.moveTo(1.0,cc.v3(0,200,0));
            anisc.scaleTo(1.0,cc.v3(0.5,0.5,0.5),function(){
                cc.res.putObjByPool(node,"prefab_ui_score");
            });

            slef.gameControl.playPostAni();
            if(slef.isPlayerSelf) cc.audio.playSound("audio/coin");
        },time);

        
    }
    //显示表情
    showEmoji(type){
        if(Math.random()<0.3) return;

        var emojibg = cc.find("emojibg",this.uiNick);
        if(emojibg.active && this.currEmojiType == type) return;
        var sp = cc.find("emojibg/emoji",this.uiNick);
        if(type == "idle") cc.res.setSpriteFrame("images/emoji/idle/"+Math.floor(Math.random()*7+1)+"/spriteFrame",sp);
        else if(type == "attack") cc.res.setSpriteFrame("images/emoji/attack/"+Math.floor(Math.random()*7+1)+"/spriteFrame",sp);
        else if(type == "get") cc.res.setSpriteFrame("images/emoji/get/"+Math.floor(Math.random()*6+1)+"/spriteFrame",sp);
        else if(type == "hurt") cc.res.setSpriteFrame("images/emoji/hurt/"+Math.floor(Math.random()*8+1)+"/spriteFrame",sp);
        else if(type == "lvup") cc.res.setSpriteFrame("images/emoji/lvup/"+Math.floor(Math.random()*4+1)+"/spriteFrame",sp);
        else if(type == "post") cc.res.setSpriteFrame("images/emoji/post/"+Math.floor(Math.random()*6+1)+"/spriteFrame",sp);
        emojibg.active = true;
        this.currEmojiType = type;
        this.unschedule(this.hideEmoji.bind(this));
        this.scheduleOnce(this.hideEmoji.bind(this),2);
    }
    hideEmoji(){
        var emojibg = cc.find("emojibg",this.uiNick);
        emojibg.active = false;
    }

    //显示王冠
    showKing(isShow){
        this.kingNode.active = isShow;
    }

    //寻找附近可拿商品
    findCanHoldGoods(num){
        var p = this.node.getPosition();
        var end = {x:p.x,y:p.z};
        if(num == 1) end.y+=1;
        else if(num == 2) end.y-=1;
        else if(num == 3) end.x-=1;
        else if(num == 4) end.x+=1;
        // else if(num == 5) end.y+=2;
        // else if(num == 6) end.y-=2;
        // else if(num == 7) end.x-=2;
        // else if(num == 8) end.x+=2;
        // else if(num == 9) end.y+=3;
        // else if(num == 10) end.y-=3;
        // else if(num == 11) end.x-=3;
        // else if(num == 12) end.x+=3;
        var items = GCollControl.ins.maps[Math.round(end.x)+"_"+Math.round(end.y)];
        this.tarGoods = null;
        if(items && items.length>0)
        {
            for(var i=0;i<items.length;i++)
            {
                if(this.gameControl.goodsNames.indexOf(items[i].node.name) != -1)
                {
                    var goods = items[i].node.getComponent(Goods);
                    if(goods.state == "idle" && goods.canHold(this.lv) 
                    && this.currCapacity+Number(goods.conf.Capacity)<=Number(this.conf.Capacity)
                    && config.judgeWall(cc.v2(p.x,p.z),cc.v2(end.x,end.y)))
                    {
                        this.tarGoods = goods.node;
                        break;
                    }
                }
            }
        }
        num ++;
        if(!this.tarGoods && num<4)
        {
            return this.findCanHoldGoods(num);
        }
        else{
            return this.tarGoods;
        }
    }

    //寻找附近是否有别的角色
    findOtherPlayer(num){
        var p = this.node.getPosition();
        var end = {x:p.x,y:p.z};
        if(num == 1) end.y+=1;
        else if(num == 2) end.y-=1;
        else if(num == 3) end.x-=1;
        else if(num == 4) end.x+=1;
        else if(num == 5) end.y+=2;
        else if(num == 6) end.y-=2;
        else if(num == 7) end.x-=2;
        else if(num == 8) end.x+=2;
        var items = GCollControl.ins.maps[Math.round(end.x)+"_"+Math.round(end.y)];
        this.tarPlayer = null;
        if(items && items.length>0)
        {
            for(var i=0;i<items.length;i++)
            {
                if("player".indexOf(items[i].node.name) != -1)
                {
                    var pla = items[i].node.getComponent(Player);
                    if(pla != this)
                    {
                        if(pla.isPlayerSelf || pla.isRobot || (pla.isFollowPlayer && pla.followTarget != this))
                        {
                            this.tarPlayer = pla;
                            break;
                        }
                    }
                }
            }
        }
        num ++;
        if(!this.tarPlayer && num<8)
        {
            return this.findOtherPlayer(num);
        }
        else{
            return this.tarPlayer;
        }
    }

    //判断能否收银
    canPostGoods(){
        return this.currCapacity/Number(this.conf.Capacity)*100 >= Number(this.robotConfId.capacitylimit);
    }

    addScore(score){
        this.currScore += score;
        this.lvUp();
    }

    //判断升级 和 添加跟随者
    lvUp(){
        if(this.currScore>=Number(this.conf.Score))
        {
            if(this.lv < cc.res.loads["conf_player"].length)
            {
                this.initConf(this.lv+1);

                if(this.isPlayerSelf || this.isRobot)
                {
                    this.addFollowPlayer();
                }

                this.showEmoji("lvup");

                var node = cc.res.getObjByPool("prefab_anim_ParLvUp");
                node.parent = this.node;
                node.setPosition(cc.v3(0,-0.9,0));
                this.scheduleOnce(function(){
                    // cc.res.putObjByPool(node,"prefab_anim_ParLvUp");
                    node.destroy();
                },2);
            }
        }
    }

    //添加跟随者
    addFollowPlayer(){
         for(var i=this.follow.length;i< Number(this.conf.PlayerNum)-1;i++)
         {
            var follow = this.gameControl.addPlayerFollow(this);
            this.follow.push(follow);
         }

         cc.log(this.lv,this.conf.PlayerNum);
    }

    //角色碰撞
    collPlayer(item){
        if(!this.isCanColl) return;
        this.isCanColl = false;
        var toPos = this.node.getPosition();
        var pos = item.node.getPosition();
        var dir = cc.v2(toPos.x,toPos.z).subtract(cc.v2(pos.x,pos.z)).normalize();
        var rad = 0;
        if(this.moveDir.x != 0 || this.moveDir.y != 0)
        rad = this.moveDir.signAngle(dir);
        // var toDir = this.moveDir.rotate(rad/2);
        dir.rotate((Math.random()-0.5)*rad);
        toPos.x += dir.x*0.3;
        toPos.z += dir.y*0.3;
        this.moveDir = dir;

        this.isColl = true;
        var self = this;
        // var anisc = this.node.getComponent(ani);
       
        this.updateDir(cc.v2(-dir.x,-dir.y));

        var player = item.node.getComponent(Player);
        if(player && player.lv>this.lv)
        {
            // anisc.moveTo(0.1,toPos,function(){
            //     self.scheduleOnce(function(){
            //         self.isColl = false;
            //     },1);
            // });
            self.scheduleOnce(function(){
                self.isColl = false;
                self.scheduleOnce(function(){
                    self.isCanColl = true;
                },1);
            },1);
            this.hurt();

            if(this.isPlayerSelf) 
            {
                cc.sdk.vibrate(true);
                cc.log("coll my player");
            }
        }
        else{
            // anisc.moveTo(0.1,toPos,function(){
            //     self.isColl = false;
            // });
            self.scheduleOnce(function(){
                self.isColl = false;
                self.scheduleOnce(function(){
                    self.isCanColl = true;
                },1);
            },0.1);
            
            this.node.emit("excAi");

            if(this.isPlayerSelf) 
            {
                cc.sdk.vibrate();
                cc.log("coll my player2");
            }
        }
    }
    
    //判断2个角色是否可以碰撞
    judgeColl(item){
        var b = true;
        if(this.followTarget == null)
        {
            for(var i=0;i<this.follow.length;i++)
            {
                if(this.follow[i].node == item.node) 
                {
                    b = false;
                    break;
                }
            }
        }
        else{
            if(this.followTarget.node == item.node) b = false;

            if(b)
            {
                for(var i=0;i<this.followTarget.follow.length;i++)
                {
                    if(this.followTarget.follow[i].node == item.node) 
                    {
                        b = false;
                        break;
                    }
                }
            }
        }
        return b;
    }


    collEnter(item){
        if(item.node.name == "player")
        {
            if(this.judgeColl(item))
                this.collPlayer(item);
        }
        else if(this.gameControl.goodsNames.indexOf(item.node.name) != -1)
        {
            if(this.state == "run")
            this.holdGoods(item.node.getComponent(Goods));
        }
        else if(item.node.name == this.gameControl.cashier.name)
        {
            this.postGoods();
        }
        this.currCollNode = item.node;
    }

    updateStep (deltaTime: number) {
        if(!this.isColl)
       {
            if(this.isMove)
            {
                this.run();
                this.updateDir(this.moveDir);
                if(this.moveDir.x != 0 || this.moveDir.y != 0)
                {    
                    this.gcoll.applyForce(cc.v2(this.moveDir).multiplyScalar(this.moveSpeed*Number(this.conf.Speed)));
                }
            }
            else
            {
                this.idle();
                this.gcoll.applyForce(cc.v2(0,0));
            }
       }
       this.updateNick();
    }

    updateNick(){
        // var p = this.gameControl.camera.worldToScreen(this.nickNode.getWorldPosition());
        var p = cc.pipelineUtils.WorldNode3DToWorldNodeUI(this.gameControl.camera,this.nickNode.getWorldPosition(),this.gameControl.gameUI);
        var dis = Math.abs(this.gameControl.camera.node.getWorldPosition().z - this.node.getWorldPosition().z);
        this.uiNick.setWorldPosition(p);
        var sc = 10/dis;
        if(sc>1) sc = 1;
        this.uiNick.setScale(sc, sc, 1);
    }
}
