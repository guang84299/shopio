import { _decorator, Component, Node,SkeletalAnimationComponent,ModelComponent,Color,LabelComponent} from "cc";
const { ccclass, property } = _decorator;
import { ani } from "../ani"
import { GBoxColl } from "../GColl/GBoxColl"
import { GCollControl } from '../GColl/GCollControl';
import { Goods } from "./Goods"
import { config } from '../config';

@ccclass("Player")
export class Player extends Component {
    public moveDir = cc.v2(0,1);
    protected isMove = false;
    public isColl = false;
    public isCanColl = true;
    public isExcColl = false;
    public isExcColl2 = false;
    public isBorn = false;
    public isExcAni = true;
    protected delSpeed = 2.5;
    protected moveSpeed = 2.5;
    protected _tarDir = cc.v2(0,1);

    public lv = 1;
    protected gameControl = null;
    protected state = "idle";
    protected gcoll = null;
    protected isPause = false;

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
    protected robotConfId = {ID:1,range:1,collect:0,wander:0,rob:0,avoid:0,capacitylimit:60,wandertime:10,speed:1};
    protected robotConflv = {lv:1,pay:90,collect:80,wander:80,rob:0,avoid:0};

    
    protected tarGoods = null;
    protected tarPlayer = null;

    public bodyColor = Color.WHITE.clone();
    protected uiNick = null;
    protected nickNode = null;
    protected kingNode = null;
    protected jiantouNode = null;
    protected nick = "";
    protected skinId = 0;

    protected currCollNode = null;
    protected currEmojiType = "";

    protected isPostGoods = false;

    protected lastLvSoce = 0;

    pathType = 0;

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

            if(this.isRobot)
            {
                this.jiantouNode = cc.instantiate(cc.res.loads["prefab_ui_jiantou"]);
                this.jiantouNode.parent = this.gameControl.gameUI;
                this.jiantouNode.active = false;
            }
        }
        this.kingNode = cc.find("king",this.nickNode);

        this.initSkin();

        var clips = this.node.getComponent(SkeletalAnimationComponent).clips;
        if(clips)
        {
            clips[clips.length-2].speed = 3;
            // clips[clips.length-1].speed = 1;
        }

        if(this.isRobot) this.addFollowPlayer();
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
        }  
        
        if(this.isPlayerSelf)
        {
            var lv = cc.storage.getStorage(cc.storage.speedlv);
            var data = cc.res.loads["conf_playerlv"][lv];
            this.moveSpeed = this.delSpeed*(1+Number(data.speed)/100);
            if(cc.GAME.startSpeedUp) this.moveSpeed *= 1.5;

            var lv = cc.storage.getStorage(cc.storage.capacitylv);
            var data = cc.res.loads["conf_playerlv"][lv];
            this.conf.Capacity = Number(this.conf.Capacity)*(1+Number(data.capacity)/100) + "";
        }
        if(this.uiNick)
        {
            this.uiNick.getComponent(LabelComponent).string = "Lv."+this.lv+" "+this.nick;
        }
    }

    initRobotConf(id,pathType){
        if(id && id <= cc.res.loads["conf_robotid"].length)
        {
            var obj = cc.res.loads["conf_robotid"][id-1];
            this.robotConfId = JSON.parse(JSON.stringify(obj));
            this.delSpeed = Number(this.robotConfId.speed);
            this.moveSpeed = this.delSpeed;
        }

        var obj = cc.res.loads["conf_robotlv"][this.lv-1];
        this.robotConflv = JSON.parse(JSON.stringify(obj));
        this.pathType = pathType;

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
            this.gcoll.applyForce(cc.v2(0,0));
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
            },1.1)//1.3

            this.showEmoji("hurt");
        }
    }

    die(){
        if(this.state != "die")
        {
            this.node.getComponent(SkeletalAnimationComponent).play("hurt");
            this.state = "die";
            this.isPause = true;

            this.follow[0].dropGoodsDie();

            var self = this;
            this.scheduleOnce(function(){
                // self.node.getComponent(SkeletalAnimationComponent).stop();
                if(self.isPlayerSelf) self.gameControl.tofuhuo();
                else self.fuhuo();
            },1.1)//1.3           
            this.showEmoji("hurt");
        }
    }

    fuhuo(){
        var pps = [cc.v2(17.2,-3),cc.v2(-0.5,9.4),cc.v2(-12,15),cc.v2(0,-10),cc.v2(14.7,9.2),cc.v2(-15.8,-8.3),cc.v2(-0.0,2.7)];
        var p = pps[ Math.floor(Math.random()*pps.length)];
        this.node.setPosition(cc.v3(p.x,0,p.y));
        this.isPause = false;
        this.idle();
        this.isBorn = true;

        var self = this;
        this.scheduleOnce(function(){
            self.isBorn = false;
        },3) ;
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
                if(!goods.node["isauto"])
                {
                    // var autogoods = cc.instantiate(goods.node);
                    this.gameControl.holdGoods.push({node:goods.node,data:{goodsId:goods.goodsId,collPos:goods.collPos,delPos:goods.delPos,delRoa:goods.delRoa}});
                }
                

                goods.hold(this.isPlayerSelf);
                this.goods.push(goods);
                this.currCapacity += Number(goods.conf.Capacity);

                var handIndex = this.goods.length%this.hands.length;
                var l = 1;
                if(handIndex == 1) l = -1;
                var rlen = Math.round(this.goods.length/8);
                goods.node.setPosition(cc.v3(Math.random()*0.2*rlen*l,Math.random()*0.2*rlen*l,Math.random()*0.2*rlen*l));
                goods.node.parent = this.hands[handIndex];
                if(this.goods.length>2) this.goods[this.goods.length-1].node.active = false;

                if(this.isRobot)
                {
                    this.tarGoods = null;
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
    dropGoods(player)
    {
        var dropNum = Math.floor(this.goods.length/2);
        for(var i=0;i<dropNum;i++)
        {
            var goods = this.goods[i];
            // goods.drop();
            this.currCapacity -= Number(goods.conf.Capacity);

            var p = cc.v3(goods.node.getWorldPosition());
            p.y = 0;
            goods.node.setPosition(p);
            goods.node.parent = this.gameControl.goodsNode;

            goods.drop(player.node.getPosition(),i*0.05,this.isPlayerSelf);
        }
        if(this.isPlayerSelf)
        {
            this.gameControl.updateSelfCapacity(this.currCapacity/Number(this.conf.Capacity));
        }
        this.goods.splice(0,dropNum);
    }

    //投放商品
    postGoods(){
        if(this.goods.length>0 && !this.isPostGoods)//this.state != "post")
        {
            if(this.state == "run")
                this.node.getComponent(SkeletalAnimationComponent).play("runpost");
            else this.node.getComponent(SkeletalAnimationComponent).play("post");
            // this.state = "post";
            this.isPostGoods = true;

            var len = this.goods.length;
            if(len>3) len = 3;
            for(var i=0;i<len;i++)
            {
                var goods = this.goods.pop();
                goods.node.active = true;
                this.currCapacity -= Number(goods.conf.Capacity);
    
                this.addScore(Number(goods.conf.Score));
                // if(!this.isPlayerSelf && !this.isRobot)
                // {
                //     this.followTarget.addScore(Number(goods.conf.Score));
                // }
    
               
                var tpos = this.follow[0].node.getWorldPosition();//this.gameControl.cashier.getPosition()
                goods.die(tpos,i*0.05+0.14,this.isPlayerSelf,this.follow[0]);
            }

            if(this.isPlayerSelf)
            {
                this.gameControl.updateSelfCapacity(this.currCapacity/Number(this.conf.Capacity));
                this.gameControl.updateHold(len);
            }
           
            var slef = this;
            this.scheduleOnce(function(){
                // slef.idle();
                slef.isPostGoods = false;
                if(slef.goods.length==0)slef.idle();
            },0.5);

            // if(len>0) this.showEmoji("post");
        }
        else{
            // if(this.state != "post")
            // if(this.goods.length<=0 && !this.isPostGoods)
            //     this.idle();
        }
    }    

    
    //显示表情
    showEmoji(type){
        if(Math.random()<0.8 || !this.isExcAni) return;

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

        if(this.isPlayerSelf)
        cc.audio.playSound("emoji"+Math.floor(Math.random()*4+1));
    }
    hideEmoji(){
        var emojibg = cc.find("emojibg",this.uiNick);
        emojibg.active = false;
    }

    //显示王冠
    showKing(isShow){
        this.kingNode.active = isShow;
    }

    //寻找附近是否有别的角色
    findOtherPlayer(){
        if(this.follow[0].isColl) return;
        var p = this.follow[0].node.getWorldPosition();
        var plas = this.gameControl.players;
        var tarPlayer = null;
        for(var i=0;i<plas.length;i++)
        {
            var pla = plas[i];
            if(pla != this)
            {
                var p2 = pla.node.getPosition();
                var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
                if(dis<2.5)
                {
                    if(!tarPlayer) tarPlayer = pla;
                    else{
                        var p3 = tarPlayer.node.getPosition();
                        var dis2 = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p3.x,p3.z));
                        if(dis<dis2)  tarPlayer = pla;
                    }
                }
            }
        }
        return tarPlayer;
    }

    //寻找附近背包
    findOtherPlayerPack(){
        var p = this.node.getPosition();
        var plas = this.gameControl.players;
        var tarPlayer = null;
        for(var i=0;i<plas.length;i++)
        {
            var pla = plas[i];
            if(pla != this && !pla.follow[0].isColl)
            {
                var p2 = pla.follow[0].node.getWorldPosition();
                var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
                if(dis<2.5)
                {
                    if(!tarPlayer) tarPlayer = pla;
                    else{
                        var p3 = tarPlayer.node.getPosition();
                        var dis2 = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p3.x,p3.z));
                        if(dis<dis2)  tarPlayer = pla;
                    }
                }
            }
        }
        return tarPlayer;
    }

    //寻找附近是否有狗
    findDog(){
        var p = this.node.getPosition();
        var plas = this.gameControl.dogs;
        var tarPlayer = null;
        for(var i=0;i<plas.length;i++)
        {
            var pla = plas[i];
            var p2 = pla.node.getWorldPosition();
            var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
            if(dis<2.5)
            {
                if(!tarPlayer) tarPlayer = pla;
                else{
                    var p3 = tarPlayer.node.getPosition();
                    var dis2 = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p3.x,p3.z));
                    if(dis<dis2)  tarPlayer = pla;
                }
            }
        }
        return tarPlayer;
    }

    //动态设置Astar路障
    updateAstar(){
        var p = this.node.getPosition();
        var plas = this.gameControl.players;
        var anps = [];
        for(var i=0;i<plas.length;i++)
        {
            var pla = plas[i];
            if(pla != this)
            {
                var p2 = pla.node.getPosition();
                var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
                if(dis<3)
                {
                    var np = config.converToNodePos(cc.v2(p2.x,p2.z));
                    if(config.astarmap[np.y][np.x] == 1) 
                    {
                        anps.push(np);
                        config.astarmap[np.y][np.x] = 0;
                    }
                    np = config.converToNodePos(cc.v2(p2.x+0.5,p2.z));
                    if(config.astarmap[np.y][np.x] == 1) 
                    {
                        anps.push(np);
                        config.astarmap[np.y][np.x] = 0;
                    }
                    np = config.converToNodePos(cc.v2(p2.x-0.5,p2.z));
                    if(config.astarmap[np.y][np.x] == 1) 
                    {
                        anps.push(np);
                        config.astarmap[np.y][np.x] = 0;
                    }
                    np = config.converToNodePos(cc.v2(p2.x+0.5,p2.z+0.5));
                    if(config.astarmap[np.y][np.x] == 1) 
                    {
                        anps.push(np);
                        config.astarmap[np.y][np.x] = 0;
                    }
                    np = config.converToNodePos(cc.v2(p2.x+0.5,p2.z-0.5));
                    if(config.astarmap[np.y][np.x] == 1) 
                    {
                        anps.push(np);
                        config.astarmap[np.y][np.x] = 0;
                    }
                    np = config.converToNodePos(cc.v2(p2.x-0.5,p2.z-0.5));
                    if(config.astarmap[np.y][np.x] == 1) 
                    {
                        anps.push(np);
                        config.astarmap[np.y][np.x] = 0;
                    }
                    np = config.converToNodePos(cc.v2(p2.x-0.5,p2.z+0.5));
                    if(config.astarmap[np.y][np.x] == 1) 
                    {
                        anps.push(np);
                        config.astarmap[np.y][np.x] = 0;
                    }
                    np = config.converToNodePos(cc.v2(p2.x,p2.z+0.5));
                    if(config.astarmap[np.y][np.x] == 1) 
                    {
                        anps.push(np);
                        config.astarmap[np.y][np.x] = 0;
                    }
                    np = config.converToNodePos(cc.v2(p2.x,p2.z-0.5));
                    if(config.astarmap[np.y][np.x] == 1) 
                    {
                        anps.push(np);
                        config.astarmap[np.y][np.x] = 0;
                    }
                }
            }
        }
        return anps;
    }

    //判断能否收银
    canPostGoods(){
        return this.currCapacity/Number(this.conf.Capacity)*100 >= Number(this.robotConfId.capacitylimit);
    }

    addScore(score){
        this.currScore += score;
        if(score>0) this.lvUp();
        else this.lvDown();
    }

    //判断升级 和 添加跟随者
    lvUp(){
        if(this.currScore>=Number(this.conf.Score))
        {
            if(this.lv < cc.res.loads["conf_player"].length)
            {
                this.lastLvSoce = Number(this.conf.Score);
                this.initConf(this.lv+1);

                // if(this.isPlayerSelf || this.isRobot)
                // {
                //     this.follow[0].lvUp(Number(this.conf.PlayerNum));
                // }
                this.follow[0].lvUp(Number(this.conf.PlayerNum));

                this.showEmoji("lvup");

                if(this.isExcAni)
                {
                    var node = cc.res.getObjByPool("prefab_anim_ParLvUp");
                    node.parent = this.node;
                    node.setPosition(cc.v3(0,-0.9,0));
                    this.scheduleOnce(function(){
                        // cc.res.putObjByPool(node,"prefab_anim_ParLvUp");
                        node.destroy();
                    },2);
                }
               

                if(this.isPlayerSelf)
                {
                    if(this.gameControl.tipNum6<3 && new Date().getTime()-cc.res.tipTime>5000)
                    {
                        this.gameControl.tipNum6 ++;
                        cc.res.showTips("Level Up ！");
                    }
                }
            }
        }
    }
    //降级
    lvDown(){
        if(this.currScore<this.lastLvSoce)
        {
            if(this.lv>1)
            {
                this.initConf(this.lv-1);
                this.follow[0].lvUp(Number(this.conf.PlayerNum));
            }
        }
    }

    // getPackLv(lv,isAdd){
    //     var conf = cc.res.loads["conf_player"][lv-1];
    //     if(isAdd)
    //     {
    //         if(this.currScore>=Number(conf.Score))
    //         {
    //             if(lv < cc.res.loads["conf_player"].length)
    //             {
    //                 lv++;
    //                 conf = cc.res.loads["conf_player"][lv-1];
    //                 return {lv:lv,len:Number(conf.PlayerNum)};
    //             }
    //         }
    //     }
    //     else
    //     {
    //         if(this.currScore<Number(conf.Score))
    //         {
    //             if(lv > 1)
    //             {
    //                 lv--;
    //                 conf = cc.res.loads["conf_player"][lv-1];
    //                 return {lv:lv,len:Number(conf.PlayerNum)};
    //             }
    //         }
    //     }

    //     return {lv:lv,len:Number(conf.PlayerNum)};
    // }

    //添加跟随者
    addFollowPlayer(){
        //  for(var i=this.follow.length;i< Number(this.conf.PlayerNum)-1;i++)
        //  {
            var follow = this.gameControl.addPlayerFollow(this);
            this.follow.push(follow);
        //  }

        //  cc.log(this.lv,this.conf.PlayerNum);
    }

    //角色碰撞
    collPlayer(item,playNum){
        if(!this.isCanColl) return;
        this.isCanColl = false;

        this.isExcColl = true;
        this.isColl = true;
        var toPos = this.node.getPosition();
        var pos = item.node.getPosition();
        var dir = cc.v2(toPos.x,toPos.z).subtract(cc.v2(pos.x,pos.z)).normalize();
      
        toPos.x += dir.x*0.3;
        toPos.z += dir.y*0.3;
        this.moveDir = dir;
        this._tarDir = dir;
        this.moveSpeed *= 3;

        var self = this;       
        this.updateDir(cc.v2(-dir.x,-dir.y));

        var player = item.node.getComponent(Player);
        if(player && player.lv>this.lv)
        {
            self.scheduleOnce(function(){
                self.isColl = false;
                self.moveSpeed = self.delSpeed;
                self.isExcColl = false;
                self.scheduleOnce(function(){
                    self.isCanColl = true;
                },0.5);
            },0.6);//1.7
            // self.scheduleOnce(function(){
            //     self.dropGoods(player);
            // },0.4);
        }
        else{
            var t = 0.1;
            if(player && player.lv==this.lv)
                t = 0.2;
            self.scheduleOnce(function(){
                self.isColl = false;
                self.moveSpeed = self.delSpeed;
                self.isExcColl = false;
                self.scheduleOnce(function(){
                    self.isCanColl = true;
                },0.5);
            },t);//1.7           
        }
        this.hurt();

        // if(true)
        // {
        //     var node = cc.res.getObjByPool("prefab_anim_ParHurt");
        //     node.parent = this.gameControl.goodsNode;
        //     var pp = this.node.getPosition();
        //     node.setPosition(cc.v3(pp.x,1,pp.z));
        //     this.scheduleOnce(function(){
        //         // cc.res.putObjByPool(node,"prefab_anim_ParLvUp");
        //         node.destroy();
        //     },1);
        // }       

        this.node.getComponent(SkeletalAnimationComponent).pause();
        this.scheduleOnce(function(){
            self.isPause = false;
            self.node.getComponent(SkeletalAnimationComponent).resume();
            if(this.isPlayerSelf) 
            cc.audio.playSound("hurt");
        },0.1);

        
        if(this.isPlayerSelf) 
        {
            cc.sdk.vibrate();
            this.gameControl.hurtAnimate();
        }

    }

    //袋子被碰撞
    collPlayerPack(item){
        this.collPlayer(item,1);
        item.collPlayer(this,2);
    }

    //加速
    speedUp(){
        if(!this.isCanColl || !this.node) return;
        this.isCanColl = false;
        this.isExcColl = true;
        this.moveSpeed *= 5;

        this.isColl = true;
        this.updateDir(this._tarDir);
        this.node.getComponent(SkeletalAnimationComponent).pause();
        this.scheduleOnce(function(){
            self.node.getComponent(SkeletalAnimationComponent).resume();
            if(this.isPlayerSelf) 
            cc.audio.playSound("hurt");
        },0.1);

        var self = this;       
        var t = 0.4;
        this.scheduleOnce(function(){
            self.isColl = false;
            self.moveSpeed = self.delSpeed;
            self.isExcColl = false;
            self.scheduleOnce(function(){
                self.isCanColl = true;
            },0.5);
        },t);//1.7

        if(this.isPlayerSelf) 
        {
            cc.sdk.vibrate();
            this.gameControl.hurtAnimate();
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
                this.collPlayer(item,0);
        }
        else if(this.gameControl.goodsNames.indexOf(item.node.name) != -1)
        {
            if(this.state == "run")
            this.holdGoods(item.node.getComponent(Goods));
        }
        else if(item.node.name == "dog")
        {
            // this.postGoods();
            this.die();
        }
        this.currCollNode = item.node;
    }

    getMoveSpeed(){
        // if(this.follow[0].currDis>= this.follow[0].tarDis)
            return this.moveSpeed*Number(this.conf.Speed);
        // return this.moveSpeed;
    }

    updateStep (deltaTime: number) {
        if(this.isPause) return;
        if(!this.isColl)
       {
            if(this.isMove)
            {
                if(this._tarDir.x != 0 || this._tarDir.y != 0)
                {
                    var st = 0.3;
                    var ang = this._tarDir.signAngle(this.moveDir);
                    // if(ang>=0)
                    // {
                    //     if(ang>st) ang = st;
                    // }
                    // else{
                    //     if(ang<-st) ang = -st;
                    // }
                    this.moveDir.rotate(-ang/5);
                }

                this.run();
                this.updateDir(this.moveDir);

                if(this._tarDir.x != 0 || this._tarDir.y != 0)
                {    
                    this.gcoll.applyForce(cc.v2(this._tarDir).multiplyScalar(this.getMoveSpeed()));
                }
               
            }
            else
            {
                this.gcoll.applyForce(cc.v2(0,0));
                this.idle();
            }
            this.postGoods();
       }
       else
       {
            if(this._tarDir.x != 0 || this._tarDir.y != 0)
            {    
                this.gcoll.applyForce(cc.v2(this._tarDir).multiplyScalar(this.getMoveSpeed()));
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

        if(this.isRobot)
        {
            var b = false;
            var offdis = 20;
            if(p.x>cc.winSize.width)
            {
                p.x = cc.winSize.width-offdis;
                b = true;
            }
            else
            {
                if(p.x < 0) 
                {
                    p.x = offdis;
                    b = true;
                }
            }
            if(p.y>cc.winSize.height)
            {
                p.y = cc.winSize.height-offdis;
                b = true;
            }
            else 
            {
                if(p.y < 0) 
                {
                    p.y = offdis;
                    b = true;
                }
            }
            if(b)
            {
                var rad = cc.v2(p.x-cc.winSize.width/2,p.y-cc.winSize.height/2).normalize().signAngle(cc.v2(0,1));
                var ang = 180/Math.PI*rad;
                this.jiantouNode.setRotationFromEuler(0,0,-ang);

                this.jiantouNode.setWorldPosition(p);
            }
            this.jiantouNode.active = b;
            this.isExcAni = !b;
            
        }
    }
}
