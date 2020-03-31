import { _decorator, Component, Node,ButtonComponent,SpriteComponent,LabelComponent,ProgressBarComponent,ScrollViewComponent } from "cc";
import { storage } from "../storage";
const { ccclass, property } = _decorator;

@ccclass("skin")
export class skin extends Component {
   
    @property(ButtonComponent)
    btnSel = null;
    @property(ButtonComponent)
    btnLock = null;
    @property(ButtonComponent)
    btnLockCoin = null;
    @property(LabelComponent)
    titleLabel = null;
    @property(LabelComponent)
    protitleLabel = null;
    @property(LabelComponent)
    costLabel = null;
    @property(ProgressBarComponent)
    pro = null;
    @property(Node)
    item = null;
    @property(Node)
    item2 = null;
    @property(Node)
    listNode = null;
    @property(ScrollViewComponent)
    scroll = null;

    // gameControl = null;
    mainControl = null;
    type = null;

    isNeedScoll = false;
    skinid = 0;
    ballid = 0;
    hasskin = [];
    hasball = [];
    currScollIndex = 1;

    useShare = false;

    //type 1:完成一局 2：金币  3：看视频  itemtype: 1皮肤 2袋子
    itemConfig = [
        {id:1,itemtype:1,type:1,desc:"完成一局",cost:1},//明天再玩 1
        {id:2,itemtype:1,type:2,desc:"2000金币",cost:2000},//连续登陆7天 2
        {id:3,itemtype:1,type:2,desc:"4000金币",cost:4000},//经典模式争取第一 1
        {id:3,itemtype:2,type:3,desc:"看视频获得",cost:1},//看视频获得 3
        {id:4,itemtype:1,type:3,desc:"看视频获得",cost:1}, //经典模式得分2000 1
        {id:1,itemtype:2,type:2,desc:"5000金币",cost:5000},
        {id:5,itemtype:1,type:2,desc:"6000金币",cost:6000},
        {id:6,itemtype:1,type:2,desc:"4000金币",cost:4000},//3次经典模式获得最高分奖杯 2
        {id:7,itemtype:1,type:2,desc:"4000金币",cost:4000},//达到白金级 1
        {id:8,itemtype:1,type:2,desc:"8000金币",cost:8000},
        {id:2,itemtype:2,type:2,desc:"4000金币",cost:4000},
        {id:9,itemtype:1,type:3,desc:"看视频获得",cost:1},
        {id:4,itemtype:2,type:3,desc:"看视频获得",cost:1},
        {id:10,itemtype:1,type:2,desc:"20000金币",cost:20000}
    ];
    
    start () {
        this.skinid = storage.getStorage(storage.skinid);
        this.hasskin = storage.getStorage(storage.hasskin);
        if(!this.hasskin) this.hasskin = [];

        this.ballid = storage.getStorage(storage.ballid);
        this.hasball = storage.getStorage(storage.hasball);
        if(!this.hasball) this.hasball = [];

        for(var i=0;i<this.itemConfig.length;i++)
        {
            var cid = this.itemConfig[i].id;
            var item = cc.instantiate(this.item);
            item.active = true;
            var sel = cc.find("sel",item);
            var lock = cc.find("lock",item);
            var mode = cc.find("mode",item);
            lock.active = true;
            if(this.itemConfig[i].itemtype == 2)
            {
                mode.setScale(1.5,1.5,1.5);
                cc.res.setSpriteFrame("images/skin/ball"+cid+"/spriteFrame",mode);
                if(storage.indexOf(this.hasball,cid) != -1)  lock.active = false;
                if(cid == this.ballid)
                {
                    sel.active = true;
                }
                else
                {
                    sel.active = false;
                }
            }
            else{
                cc.res.setSpriteFrame("images/skin/ImgSkin"+cid+"/spriteFrame",mode);
                if(storage.indexOf(this.hasskin,cid) != -1)  lock.active = false;
                if(cid == this.skinid)
                {
                    sel.active = true;
                }
                else
                {
                    sel.active = false;
                }
            }
           

            this.listNode.addChild(item);
        }
        var item2 = cc.instantiate(this.item2);
        this.listNode.addChild(item2);
        var item2 = cc.instantiate(this.item2);
        this.listNode.addChild(item2);


        var self = this;
        // this.scroll.node.on('scrolling', function(){

        // });
        this.scroll.node.on('touch-up', function(){
            self.isNeedScoll = true;
        });
        this.scroll.node.on('scroll-ended', function(){
            if(self.isNeedScoll)
            {
                self.isNeedScoll = false;
                self.scheduleOnce(function(){
                    var dis = self.scroll.getScrollOffset().x;
                    var dis2 = Math.round(-dis/250)*250;
                    self.scroll.scrollToOffset(cc.v3(dis2,0,0),0,true);
                    self.updateSel(Math.floor(dis2/250));
                },0);
            }
        });

        self.scheduleOnce(function(){
            var dis2 = self.skinid*250;
            if(dis2>1) dis2 -= 250;
            self.scroll.scrollToOffset(cc.v3(dis2,0,0),0,true);
            self.updateSel(Math.floor(dis2/250));

            if(cc.GAME.yindaoStep == 1)
            {
                cc.GAME.yindaoStep = 2;
                cc.res.openUI("yindao",null,2);
            }
        },0);
       
    }

    updateSel(index){
        if(index<0) index = 0;
        if(index>=this.itemConfig.length) index = this.itemConfig.length-1;

        this.titleLabel.string = this.itemConfig[index].desc;

        this.currScollIndex = index+1;
        
        this.pro.node.active = false;

        var id = this.itemConfig[index].id;
        var type = this.itemConfig[index].type; 
        var cost = this.itemConfig[index].cost; 
        this.protitleLabel.string = "";
       
        var items = this.hasskin;
        if(this.itemConfig[index].itemtype == 2)
            items = this.hasball;

        if(storage.indexOf(items,id) != -1)
        {
            this.btnSel.node.active = true;
            this.btnLock.node.active = false;
            this.btnLockCoin.node.active = false;
            this.protitleLabel.string = "已获得";
        }
        else{
            this.btnSel.node.active = false;
            this.btnLock.node.active = false;
            this.btnLockCoin.node.active = false;
            if(type == 1)
            {
                
            }
            else if(type == 2)
            {
                this.btnLockCoin.node.active = true;
                this.costLabel.string = cost+"";
            }
            else if(type == 3)
            {
                this.btnLock.node.active = true;
                this.updateAd();
            }
        }
        for(var i=0;i<this.itemConfig.length;i++)
        {
            var item = this.listNode.children[i];
            item.getComponent(SpriteComponent).color = cc.color(255,255,255);
        }
        var item = this.listNode.children[index];
        item.getComponent(SpriteComponent).color = cc.color(4,221,82);
       cc.log(index);
    }

    toSel(){
        var index = this.currScollIndex-1;
        if(index<0) index = 0;
        if(index>=this.itemConfig.length) index = this.itemConfig.length-1;

        var itemtype = this.itemConfig[index].itemtype;
        var id = this.itemConfig[index].id;

        if(itemtype == 2)
        {
            if(id != this.ballid)
            {
                //关闭原来的
                if(this.ballid>0)
                {
                    //找到原来的关闭
                    for(var i=0;i<this.itemConfig.length;i++)
                    {
                        if(this.itemConfig[i].itemtype == 2 && this.itemConfig[i].id == this.ballid)
                        {
                            var item = this.listNode.children[i];
                            cc.find("sel",item).active = false;
                        }
                    }
                }
            
                var item = this.listNode.children[index];
                var sel = cc.find("sel",item);
                sel.active = true;

                this.ballid = id;
                storage.setStorage(storage.ballid,this.ballid);
                // this.mainControl.updateSkin();
            }
        }
        else
        {
            if(id != this.skinid)
            {
                //关闭原来的
                if(this.skinid>0)
                {
                    //找到原来的关闭
                    for(var i=0;i<this.itemConfig.length;i++)
                    {
                        if(this.itemConfig[i].itemtype == 1 && this.itemConfig[i].id == this.skinid)
                        {
                            var item = this.listNode.children[i];
                            cc.find("sel",item).active = false;
                        }
                    }
                }
            
                var item = this.listNode.children[index];
                var sel = cc.find("sel",item);
                sel.active = true;

                this.skinid = id;
                storage.setStorage(storage.skinid,this.skinid);
                this.mainControl.updateSkin();
            }
        }
    }

    toLock(){
        var index = this.currScollIndex-1;
        if(index<0) index = 0;
        if(index>=this.itemConfig.length) index = this.itemConfig.length-1;

        var id = this.itemConfig[index].id;
        var itemtype = this.itemConfig[index].itemtype;
        if(itemtype == 1)
        {
            this.hasskin.push(id);
            storage.setStorage(storage.hasskin,this.hasskin);
            storage.uploadStorage(storage.hasskin);
        }
        else
        {
            this.hasball.push(id);
            storage.setStorage(storage.hasball,this.hasball);
            storage.uploadStorage(storage.hasball);
        }
        
        var item = this.listNode.children[index];
         cc.find("lock",item).active = false;
        this.updateSel(this.currScollIndex-1);
    }

    clickLock(){
        var index = this.currScollIndex-1;
        if(index<0) index = 0;
        if(index>=this.itemConfig.length) index = this.itemConfig.length-1;
        var type = this.itemConfig[index].type;
        if(type == 2)
        {
            var cost = this.itemConfig[index].cost;
            var coin = storage.getStorage(storage.coin);
            if(coin<cost)
            {
                cc.res.showToast("金币不足");
            }
            else
            {
                storage.setStorage(storage.coin,(coin-cost));
                storage.uploadStorage(storage.coin);
                this.toLock();
                this.mainControl.updateCoin();
            }
        }
        else if(type == 3)
        {
            var self = this;
            if(this.useShare)
            {
                cc.sdk.share(function(r){
                    if(r) self.toLock();
                });
            }
            else
            {
                cc.sdk.showVedio(function(r){
                    if(r) self.toLock();
                });
            }
        }
    }

    updateAd(){
        this.useShare = false;
        if(cc.GAME.share)
        {
            var rad = parseInt(cc.GAME.skinAd);
            if(!cc.GAME.hasVideo) rad = 100;
            if(Math.random()*100 < rad)
            {
                this.useShare = true;
                this.btnLock.node.getChildByName("share").active = true;
                this.btnLock.node.getChildByName("video").active = false;
            }
            else
            {
                this.btnLock.node.getChildByName("share").active = false;
                this.btnLock.node.getChildByName("video").active = true;
            }
        }
        else
        {
            this.btnLock.node.getChildByName("share").active = false;
            this.btnLock.node.getChildByName("video").active = true;
        }
    }

    show(type){
        this.type = type;
        // this.gameControl = cc.find("gameNode").getComponent("gameControl");
        this.mainControl = cc.find("gameNode").getComponent("mainControl");
        cc.sdk.showBanner();
        cc.sdk.event("皮肤界面-打开");
    }

    hide(){
       
        this.node.parent.destroy();
        cc.sdk.hideBanner();
    }

    click(event:any,data:any)
    {
        if(data == "close")
        {
            this.hide();
        }
        else if(data == "sel")
        {
           this.toSel();
           if(cc.GAME.yindaoStep == 2)
           {
                cc.res.closeUI("yindao");
                cc.GAME.yindaoStep = 3;
           }
        }
        else if(data == "lock")
        {
           this.clickLock();
            cc.sdk.event("皮肤界面-解锁按钮");
        }
        cc.log(data);
        cc.audio.playSound("button");
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
