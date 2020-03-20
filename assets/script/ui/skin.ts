import { _decorator, Component, Node,ButtonComponent,SpriteComponent,LabelComponent,ProgressBarComponent,ScrollViewComponent } from "cc";
import { storage } from "../storage";
const { ccclass, property } = _decorator;

@ccclass("skin")
export class skin extends Component {
   
    @property(ButtonComponent)
    btnSel = null;
    @property(ButtonComponent)
    btnLock = null;
    @property(LabelComponent)
    titleLabel = null;
    @property(LabelComponent)
    protitleLabel = null;
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

    itemConfig = [
        {id:1,type:1,desc:"明天再玩"},
        {id:2,type:2,desc:"连续登陆7天"},
        {id:3,type:1,desc:"经典模式争取第一"},
        {id:3,type:3,desc:"看视频获得"},
        {id:4,type:1,desc:"经典模式得分2000"},
        {id:1,type:3,desc:"看视频获得"},
        {id:5,type:1,desc:"经典模式得分2500"},
        {id:6,type:2,desc:"3次经典模式获得最高分奖杯"},
        {id:7,type:1,desc:"达到白金级"},
        {id:8,type:1,desc:"达到钻石级"},
        {id:2,type:3,desc:"看视频获得"},
        {id:9,type:1,desc:"达到大师级"},
        {id:4,type:3,desc:"看视频获得"},
        {id:10,type:1,desc:"达到星耀级"}
    ];//type==3 包裹皮肤
    
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
            if(this.itemConfig[i].type == 3)
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
        },0);
    }

    updateSel(index){
        if(index<0) index = 0;
        if(index>=this.itemConfig.length) index = this.itemConfig.length-1;

        this.titleLabel.string = this.itemConfig[index].desc;

        this.currScollIndex = index+1;
        
        if(this.itemConfig[index].type == 1 || this.itemConfig[index].type == 3) this.pro.node.active = false;
        else this.pro.node.active = true;

        var id = this.itemConfig[index].id;
        if(this.itemConfig[index].type == 3)
        {
            this.protitleLabel.string = "";
            if(storage.indexOf(this.hasball,id) != -1)
            {
                this.btnSel.node.active = true;
                this.btnLock.node.active = false;
                this.protitleLabel.string = "已获得";
            }
            else{
                this.btnSel.node.active = false;
                this.btnLock.node.active = true;
                this.updateAd();
            }
        }
        else
        {
            if(id == 1) 
            {
                this.protitleLabel.string = "";
            }
            else if(id == 2) 
            {
                var loginday = storage.getStorage(storage.loginday);
                this.protitleLabel.string = loginday+"/7";
                this.pro.progress = loginday/7;
            }
            else if(id == 3) 
            {
                this.protitleLabel.string = "";
            }
            else if(id == 4) 
            {
                var maxscore = storage.getStorage(storage.maxscore);
                this.protitleLabel.string = maxscore+"/2000";
                this.pro.progress = maxscore/2000;
            }
            else if(id == 5) 
            {
                var maxscore = storage.getStorage(storage.maxscore);
                this.protitleLabel.string = maxscore+"/2500";
                this.pro.progress = maxscore/2500;
            }
            else if(id == 6) 
            {
                var modewinnum = storage.getStorage(storage.modewinnum);
                this.protitleLabel.string = modewinnum+"/3";
                this.pro.progress = modewinnum/3;
            }
            else if(id == 7 || id == 8 || id == 9 || id == 10) 
            {
                var starlv = storage.getStorage(storage.starlv);
                this.protitleLabel.string = "当前："+cc.res.loads["conf_starlv"][starlv-1].name;
            }

            if(storage.indexOf(this.hasskin,id) != -1)
            {
                this.btnSel.node.active = true;
                this.btnLock.node.active = false;
                this.protitleLabel.string = "已获得";
            }
            else{
                this.btnSel.node.active = false;
                this.btnLock.node.active = true;
                this.updateAd();
            }
        }
        
       cc.log(index);
    }

    toSel(){
        var index = this.currScollIndex-1;
        if(index<0) index = 0;
        if(index>=this.itemConfig.length) index = this.itemConfig.length-1;

        var type = this.itemConfig[index].type;
        var id = this.itemConfig[index].id;

        if(type == 3)
        {
            if(id != this.ballid)
            {
                //关闭原来的
                if(this.ballid>0)
                {
                    //找到原来的关闭
                    for(var i=0;i<this.itemConfig.length;i++)
                    {
                        if(this.itemConfig[i].type == 3 && this.itemConfig[i].id == this.ballid)
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
                        if(this.itemConfig[i].type != 3 && this.itemConfig[i].id == this.skinid)
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

        var type = this.itemConfig[index].type;
        var id = this.itemConfig[index].id;
        if(type != 3)
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
        }
        else if(data == "lock")
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
            cc.sdk.event("皮肤界面-解锁按钮");
        }
        cc.log(data);
        cc.audio.playSound("button");
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
