import { _decorator, Component, Node ,ProgressBarComponent,LabelComponent,Mesh} from "cc";
const { ccclass, property } = _decorator;
import { res } from "./res";
import { storage } from "./storage";
import { sdk } from "./sdk";
import { qianqista } from "./qianqista";

cc.res = res;
cc.storage = storage;
cc.sdk = sdk;
cc.qianqista = qianqista;
cc.GAME = {};

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
        this.purls = [
            //"audio/button",
            "conf/game",
            "conf/goods",
            "conf/player",
            "conf/map",

            "prefab/game/goods2",
            "prefab/game/goods",
            "prefab/game/player",
            "prefab/game/Shelves_01",
            "prefab/game/Shelves_02",
            "prefab/game/Shelves_03",
            "prefab/game/Res101",
            "prefab/game/Res102",
            "prefab/game/Res201",
            "prefab/game/Res202",
            "prefab/game/Res301",
            "prefab/game/Res302",
            "prefab/game/Res401",
            "prefab/game/Res402",
            "prefab/game/Res403",
            "prefab/game/Res404",
           

            // "prefab/anim/baoji",

            // "prefab/ui/jiesuan",
            // "prefab/ui/toast",
        ];

        // for(var i=1;i<=1;i++)
        // {
        //    this.purls.push("prefab/game/circle"+i);
        // }

        this.totalCount = this.purls.length;
        this.loadCount = 0;
        this.nowtime = new Date().getTime();
        for(var i=0;i<2;i++)
            this.loadres();    
        
        var self = this;
        qianqista.init("1109924367","V3B4wKHqtViRhT2g","套圈缤纷乐-QQ",function(){
            var score = storage.getStorage(storage.lv);
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

        if(this.completedCount>=this.totalCount)
        {
            this.completeCallback();
        }
        else{
            this.loadres();
            //this.scheduleOnce(this.loadres.bind(this),0.1);
        }
        this.setRes(resource,index);

        if(this.canLoadVideo && this.progress>0.6)
        {
            this.canLoadVideo = false;
            sdk.videoLoad();
        }
    }

    completeCallback () {
        console.log("-----completeCallback---time:",new Date().getTime()-this.nowtime);
        this.progressTips.string = "加载完成";
        this.progressBar.progress = 1;
        //this.progressTips.string = "加载中";
        //this.progressBar.node.active = true;
        //cc.loader.loadResDir("audio", this.progressCallback.bind(this), this.completeCallback2.bind(this));

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
        else if(url.indexOf("prefab/") != -1)
            pifx = "prefab_";
        else if(url.indexOf("conf/") != -1)
        {
            pifx = "conf_"+resource.name;
            //console.error(url,cc.url.raw("resources/"+url));
            resource = resource.json;//JSON.parse(resource.text);
        }

        if(url.indexOf("conf/") != -1)
            res.loads[pifx] = resource;
        else
            res.loads[pifx+resource.data.name] = resource;

        // cc.log(res.loads);
    }

    startGame() {
        if(!this.loadNode.active && this.progressBar.progress >= 1 && !this.isStart)
        {
            this.isStart = true;
            this.progressBar.node.active = false;
            cc.director.loadScene("game");
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

            if(datas.hasOwnProperty("lv"))
                storage.setStorage(storage.lv, Number(datas.lv));

        
            console.log("datas:",datas);

        }
        else
        {
           
           
        }
    }
    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
