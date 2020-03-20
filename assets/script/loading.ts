import { _decorator, Component, Node ,ProgressBarComponent,LabelComponent,Mesh} from "cc";
const { ccclass, property } = _decorator;
import { res } from "./res";
import { storage } from "./storage";
import { sdk } from "./sdk";
import { qianqista } from "./qianqista";
import { audio } from "./audio";

cc.res = res;
cc.storage = storage;
cc.sdk = sdk;
cc.qianqista = qianqista;
cc.audio = audio;
cc.GAME = {};
cc.GAME.judgeLixian = true;
cc.GAME.isNewUser = false;

@ccclass("loading")
export class loading extends Component {
    /* class member could be defined like this */
    // dummy = '';

    /* use `property` decorator if your want the member to be serializable */
    @property(ProgressBarComponent)
    progressBar = null;

    @property(LabelComponent)
    progressTips = null;

    @property(Node)
    loadNode = null;

    private suburls = [];
    subCount = 0;
    subTotalCount = 0;

    private purls = [];
    completedCount = 0;
    totalCount = 0;
    loadCount = 0;
    nowtime = 0;
    progress = 0;
    resource = null;

    canLoadVideo = true;

    isStart = false;

    onLoad() {
        //cc.sys.os = "web";
        // cc.game.setFrameRate(30);
        
                 
        var self = this;
        var appkey = "wx83aa5365b3b6f2be";
        var appsecret = "c2cbe456f71cb7e9826b2527284cf5a9";
        var appname = "疯狂购物3D-微信";
        if(window["qq"])
        {
            appkey = "1110216465";
            appsecret = "c4HIDQY9Jfd777pI";
            appname = "疯狂购物3D-QQ";
        }
        else if(window["wx"]){
            appkey = "wx83aa5365b3b6f2be";
            appsecret = "c2cbe456f71cb7e9826b2527284cf5a9";
            appname = "疯狂购物3D-微信";
        }
        qianqista.init(appkey,appsecret,appname,function(){
            // var score = storage.getStorage(storage.lv);
            // sdk.uploadScore(score,self.initNet.bind(self));
            self.initNet();
        },null);
        sdk.getUserInfo();
        //sdk.videoLoad();
        sdk.closeRank();
        this.canLoadVideo = true;

        if(storage.getStorage(storage.first) == 0)
        {
            storage.setStorage(storage.first,1);
            storage.setStorage(storage.music,1);
            storage.setStorage(storage.sound,1);
            storage.setStorage(storage.vibrate,1);
        }   
        
        cc.sdk.event("进入加载界面");
        if(window["wx"])
            this.loadSubpackage();
        else 
            this.loadAllRes();
     
    }

    loadSubpackage(){
        this.suburls = [
            "mode",
            "images"
        ];

        this.subTotalCount = this.suburls.length;
        this.loadSubpackageItem();
    }

    loadSubpackageItem(){
        var self = this;
        cc.loader.downloader.loadSubpackage(this.suburls[this.subCount],function(r){
            console.log("加载子包："+self.suburls[self.subCount],r);
            self.subCount ++;
            if(self.subCount>=self.subTotalCount)
            {
                cc.sdk.event("加载子包完成");
                self.loadAllRes();
            }
            else{
                self.progressBar.progress = self.progress;
                self.progressTips.string = "加载中 " + Math.floor(self.subCount/self.subTotalCount*100)+"%";
                self.loadSubpackageItem();
            }
        });
    }

    loadAllRes(){
        this.purls = [
            // "audio/button",
            "audio/coin",
            "audio/MusCountDown",
            "audio/MusGameEnd",
            "audio/MusGameStart",
            "audio/MusHurt",
            "audio/MusResult",

            "conf/game",
            "conf/goods",
            "conf/player",
            "conf/map",
            "conf/maptitle",
            "conf/robotpath",
            "conf/robotid",
            "conf/robotlv",
            "conf/playerlv",
            "conf/starlv",
            "conf/starrank",
            "conf/robotstage",
            "conf/goodspath",

            "prefab/game/player",
            "prefab/game/pack",
            "prefab/game/Res1",
            "prefab/game/Res2",
            "prefab/game/Res3",
            "prefab/game/Res4",
            "prefab/game/Res5",
            "prefab/game/Res6",
            "prefab/game/Res7",
            "prefab/game/Res8",
            "prefab/game/Res9",

            "prefab/game/cube",
            "prefab/game/dog",

            "prefab/skin/skin1",
            "prefab/skin/skin2",
            "prefab/skin/skin3",
            "prefab/skin/skin4",
            "prefab/skin/skin5",
            "prefab/skin/skin6",
            "prefab/skin/skin7",
            "prefab/skin/skin8",
            "prefab/skin/skin9",
            "prefab/skin/skin10",
            "prefab/skin/ball",
           

            "prefab/anim/ParLvUp",
            "prefab/anim/ParHurt",
            "prefab/anim/ParTrail",

            "prefab/ui/toast",
            "prefab/ui/tips",
            "prefab/ui/nick",
            "prefab/ui/score",
            "prefab/ui/countdown",
            "prefab/ui/jiesuan",
            "prefab/ui/jiesuan2",
            "prefab/ui/skin",
            "prefab/ui/lixian",
            "prefab/ui/starup",
            "prefab/ui/fuhuo",

            "prefab/ui/test"
        ];

        // for(var i=1;i<=9;i++)
        // {
        //    this.purls.push("prefab/game/Res"+i);
        // }
        this.totalCount = this.purls.length;
        for(var i=0;i<2;i++)
        this.loadres();  
        
        this.loadCount = 0;
        this.nowtime = new Date().getTime();
    }

    start () {
        // Your initialization goes here.
       
    }

    loadres() {
        var self = this;
        if(this.loadCount<this.totalCount)
        {
            var index = this.loadCount;
            var path = this.purls[index];
            if(path.indexOf("images/sheep/") != -1 || path.indexOf("anims/") != -1)
            {
                cc.loader.loadRes(this.purls[index],cc.SpriteAtlas, function(err, prefab)
                {
                    self.progressCallback(self.completedCount,self.totalCount,prefab,index);
                });
            }
            else
            {
                cc.loader.loadRes(this.purls[index], function(err, prefab)
                {
                    self.progressCallback(self.completedCount,self.totalCount,prefab,index);
                });
            }

            this.loadCount++;
        }
    }

    progressCallback(completedCount:number, totalCount:number,resource:any,index:number){
        this.progress = completedCount / totalCount;
        this.resource = resource;
        this.completedCount++;
        //this.totalCount = totalCount;

        this.progressBar.progress = this.progress;
        this.progressTips.string = "加载中 " + Math.floor(this.completedCount/this.totalCount*100)+"%";

        
        this.setRes(resource,index);

        if(this.completedCount>=this.totalCount)
        {
            this.completeCallback();
        }
        else{
            this.loadres();
            //this.scheduleOnce(this.loadres.bind(this),0.1);
        }

        if(this.canLoadVideo && this.progress>0.6)
        {
            this.canLoadVideo = false;
            // sdk.videoLoad();
        }
    }

    completeCallback () {
        console.log("-----completeCallback---time:",new Date().getTime()-this.nowtime);
        this.progressTips.string = "加载完成";
        this.progressBar.progress = 1;
        //this.progressTips.string = "加载中";
        //this.progressBar.node.active = true;
        //cc.loader.loadResDir("audio", this.progressCallback.bind(this), this.completeCallback2.bind(this));
        cc.sdk.event("加载资源完成");
        this.loadNode.active = false;
        this.startGame();
    }

    setRes(resource:any,index:number){
        var url = this.purls[index];
        var pifx = "";
        if(url.indexOf("audio/") != -1)
            pifx = "audio_";
        else if(url.indexOf("prefab/ui/") != -1)
            pifx = "prefab_ui_";
        else if(url.indexOf("prefab/anim/") != -1)
            pifx = "prefab_anim_";
        else if(url.indexOf("prefab/game/") != -1)
            pifx = "prefab_game_";
        else if(url.indexOf("prefab/skin/") != -1)
            pifx = "prefab_skin_";    
        else if(url.indexOf("prefab/") != -1)
            pifx = "prefab_";
        else if(url.indexOf("conf/") != -1)
        {
            pifx = "conf_"+resource.name;
            //console.error(url,cc.url.raw("resources/"+url));
            resource = resource.json;//JSON.parse(resource.text);
        }
cc.log(url,resource);
        if(url.indexOf("conf/") != -1)
            res.loads[pifx] = resource;
        else  if(url.indexOf("audio/") != -1)
           res.loads[pifx+resource.name] = resource; 
        else
        {
            res.loads[pifx+resource.data.name] = resource;
        }
            

        // cc.log(res.loads);
    }

    startGame() {
        if(!this.loadNode.active && this.progressBar.progress >= 1 && !this.isStart)
        {
            this.isStart = true;
            this.progressBar.node.active = false;
            cc.log(res.loads);
            cc.director.loadScene("main");
        }
    }

    initNet(){
        var self = this;
        var httpDatas = false;
        var httpControl = false;
        qianqista.datas(function(res){
            console.log('my datas:', res);
            if(res.state == 200)
            {
                self.updateLocalData(res.data);
            }
            httpDatas = true;

            if(httpDatas && httpControl)
            {
                self.loadNode.active = false;
                self.startGame();
            }

        });

        //qianqista.pdatas(function(res){
        //    self.updateLocalData2(res);
        //    httpPdatas = true;
        //
        //    if(httpDatas && httpPdatas && httpControl)
        //    {
        //        self.loadNode.active = false;
        //        self.startGame();
        //    }
        //});
        //qianqista.rankScore(function(res){
        //    self.worldrank = res.data;
        //});

        qianqista.control(function(res){
            console.log('my control:', res);
            if(res.state == 200)
            {
                cc.GAME.control = res.data;
                self.updateUIControl();
            }
            httpControl = true;

            if(httpDatas && httpControl)
            {
                self.loadNode.active = false;
                self.startGame();
            }
        });
    }

    updateUIControl(){
        cc.GAME.skipgame = null;
        cc.GAME.share = false;
        cc.GAME.lixianswitch = false;
        cc.GAME.adCheck = true;
        cc.GAME.shares = [];
        if(cc.GAME.control.length>0)
        {
            for(var i=0;i<cc.GAME.control.length;i++)
            {
                var con = cc.GAME.control[i];
                if(con.id == "skipgame")
                {
                    if(con.value)
                    {
                        //[{'name':'全民剪羊毛','appId':'wx37d536c56e3e73f7','icon1':'https://www.7q7q.top/gameicon/sheep1.png','icon2':'https://www.7q7q.top/gameicon/sheep1.png','ani':'https://www.7q7q.top/gameicon/sheepAni','aniNum':'2'},{'name':'全民剪羊毛2','appId':'wx37d536c56e3e73f7','icon1':'https://www.7q7q.top/gameicon/sheep1.png','icon2':'https://www.7q7q.top/gameicon/sheep1.png'}]
                        var s = con.value.replace(/\'/g,"\"");
                        cc.GAME.skipgame = JSON.parse(s);
                    }
                }
                else if(con.id.indexOf("share") != -1)
                {
                    if(con.id == "share")
                    {
                        cc.GAME.share = con.value == 1 ? true : false;
                    }
                    else
                    {
                        if(con.value && con.value.length>0)
                        {
                            var s = con.value.replace(/\'/g,"\"");
                            cc.GAME.shares.push(JSON.parse(s));
                        }
                    }

                }
                else if(con.id == "lixian")
                {
                    cc.GAME.lixianswitch = con.value == 1 ? true : false;
                }
                else if(con.id == "adCheck")
                {
                    cc.GAME.adCheck = con.value == 1 ? true : false;
                }
                else
                {
                    cc.GAME[con.id] = con.value;
                }
            }

        }
    }

    updateLocalData(data:any){
        if(data)
        {
            var datas = JSON.parse(data);
            // if(datas.hasOwnProperty("first"))
            //     storage.setStorage(storage.first);
            if(datas.hasOwnProperty("coin"))
            {
                var coin = Number(datas.coin);
                var coin2 = storage.getStorage(storage.coin);
                if(coin2>coin) coin = coin2;
                storage.setStorage(storage.coin,coin);
            }

            if(datas.hasOwnProperty("starlv"))
                storage.setStorage(storage.starlv, Number(datas.starlv));

            if(datas.hasOwnProperty("starexp"))
                storage.setStorage(storage.starexp, Number(datas.starexp));

            if(datas.hasOwnProperty("maxscore"))
                storage.setStorage(storage.maxscore, Number(datas.maxscore)); 

            if(datas.hasOwnProperty("maxscore2"))
                storage.setStorage(storage.maxscore2, Number(datas.maxscore2)); 

            if(datas.hasOwnProperty("speedlv"))
                storage.setStorage(storage.speedlv, Number(datas.speedlv));    

            if(datas.hasOwnProperty("capacitylv"))
                storage.setStorage(storage.capacitylv, Number(datas.capacitylv));    

            if(datas.hasOwnProperty("lixianlv"))
                storage.setStorage(storage.lixianlv, Number(datas.lixianlv)); 
                
            if(datas.hasOwnProperty("hasskin"))
                storage.setStorage(storage.hasskin, datas.hasskin);  

            if(datas.hasOwnProperty("skinid"))
                storage.setStorage(storage.skinid, Number(datas.skinid));  

            if(datas.hasOwnProperty("hasball"))
                storage.setStorage(storage.hasball, datas.hasball);  

            if(datas.hasOwnProperty("ballid"))
                storage.setStorage(storage.ballid, Number(datas.ballid));     

            if(datas.hasOwnProperty("loginday"))
                storage.setStorage(storage.loginday, Number(datas.loginday));    
                
            if(datas.hasOwnProperty("logintime"))
                storage.setStorage(storage.logintime, Number(datas.logintime));
                
            if(datas.hasOwnProperty("modewinnum"))
                storage.setStorage(storage.modewinnum, Number(datas.modewinnum));   
        
            var t1 = new Date().getTime();
            var t2 = storage.getStorage(storage.logintime);
            if(storage.isResetDay(t1,t2))
            {
                var loginday = storage.getStorage(storage.loginday);
                storage.setStorage(storage.loginday, loginday+1);   
            }
            console.log("datas:",datas);
        }
        else
        {
            cc.GAME.isNewUser = true;
        }
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
