import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

export const qianqista = {
    gameId: "", //游戏id
    secret: "",//密匙
    gameName: "",//游戏名
    channel: "",//渠道
    openid: "",
    userName: "",
    session_key: "",
    power: 0,//授权状态
    url: "https://game.7q7q.top/sta/",
    url2: "https://game.7q7q.top/sheep/",
    avatarUrl: "",//头像
    state: 0, //0 未初始化 1已经初始化
    updatePower: false,
    initcallback: null,
    logincallback: null,
    showcallback: null,
    hidecallback: null,
    onshowmaincallback: null,
    fromid:"",
    pkfromid:"",
    sharetime:0,
    sharenum:0,
    init: function(gameId,secret,gameName,initcallback,showcallback)
    {
        this.gameId = gameId;
        this.secret = secret;
        this.gameName = gameName;
        this.initcallback = initcallback;
        this.showcallback = showcallback;
        var self = this;
        if(window["wx"])
        {
            var opts = wx.getLaunchOptionsSync();
            if(opts)
            {
                var path = opts.path;
                var query = opts.query;
                var scene = opts.scene;
                if(path && path.indexOf('channel=') != -1)
                {
                    this.channel = path.substr(path.indexOf("channel=")+8);
                    if(this.channel.length>16)
                    {
                        this.channel = this.channel.substr(0,15);
                    }
                }
                if(this.channel == "" || this.channel == null)
                {
                    if(query && query.channel && query.channel.length > 0)
                        this.channel = query.channel;
                }
                if(this.channel == "" || this.channel == null)
                {
                    this.channel = scene+"";
                }

                if(query && query.fromid && query.fromid.length > 0)
                {
                    this.fromid = query.fromid;
                    console.log('fromid:', query.fromid);
                }
                var sto_channel = cc.sys.localStorage.getItem("channel");
                if(!sto_channel)
                    cc.sys.localStorage.setItem("channel",this.channel);
            }

            console.log('opts:', opts);
            console.log('channel:', this.channel);

            wx.onShow(function(res){
                self.open();

                if(self.sharecallback)
                {
                    var t = new Date().getTime();
                    if(self.sharetime && t - self.sharetime > 3000)//&& self.sharenum>=1
                    {
                        self.sharecallback(true);
                        self.sharenum++;
                    }
                    else
                    {
                        self.sharenum++;
                        self.sharecallback(false);
                        //wx.showToast({
                        //    title: '分享失败！',
                        //    icon: 'none',
                        //    duration: 2000
                        //})
                        cc.res.showToast("请分享到不同的群！");
                    }
                    self.sharecallback = null;
                }

                console.log('onShow:', res);
                console.log('power:', self.power);

                var query = res.query;
                if(query && query.fromid && query.fromid.length > 0)
                {
                    self.pkfromid = query.fromid;
                }
                if(self.power == 1 && query && query.channel && query.channel == "shareonline" && self.pkfromid)
                {
                    if(self.showcallback)
                        self.showcallback();
                }

                if(self.isHide)
                {
                    self.isHide = false;
                    //if(cc.myscene == "game")
                    //    cc.storage.playMusic(cc.res.audio_music);
                    //else if(cc.myscene == "main")
                    //    cc.storage.playMusic(cc.res.audio_bgm);
                    //if(cc.myscene == "main")
                    //    cc.storage.playMusic(cc.res.audio_music);

                }
                if(self.onshowmaincallback)
                    self.onshowmaincallback(res.scene);
            });

            wx.onHide(function(){
                if(self.hidecallback)
                    self.hidecallback();
                self.isHide = true;
            });
        }
        else
        {
            if(cc.sys.browserType == "chrome")
            {
                this.openid = "test001";
                this.userName = "哈哈";
                this.avatarUrl = "https://game.7q7q.top/img/wxgame/49234a872c294891aa98877d51679180.png";
                this.fromid = "test002";
                this.pkfromid = "test002";
            }
            else
            {
                this.openid = "test002";
                this.userName = "嘿嘿";
                this.avatarUrl = "https://game.7q7q.top/img/wxgame/1b6474f6563845c4a5afd5b9a797c017.png";
                this.fromid = "test001";
            }
        }
    },

    setHideCallback: function(hidecallback)
    {
        this.hidecallback = hidecallback;
    },

    login: function(isSuccess, userInfo,callback)
    {
        this.logincallback = callback;
        if(isSuccess)
        {
            if(!userInfo)
                console.error("--------","userInfo is null");
            this.userName = userInfo.nickName;
            this.power = 1;
            this.avatarUrl = userInfo.avatarUrl;
            console.log('userInfo:', userInfo);
        }
        else
        {
            this.updatePower = true;
        }

        var self = this;
        this.getOpenId(function(){
            self.state = 1;
            self.initdata();
            console.log('----init end ----');
        });
    },

    initdata: function()
    {
        if(this.state == 1)
        {
            var self = this;
            this.sendRequest("init",{gameId:this.gameId,gameName:this.gameName,
                channel:this.channel,openid:this.openid,userName:this.userName,power:this.power},function(res){
                console.log("init:",res);
                if(self.initcallback)
                    self.initcallback();

                //初始化成功上传分享来源获取金币
                //初始化成功上传分享来源获取金币
                if(self.fromid && self.fromid.length>1 && self.fromid != self.openid)
                {
                    //var data = {};
                    //if(self.channel == "sharegun")
                    //    data.guninvitelist = self.openid;
                    //else
                    //    data.invitelist = self.openid;
                    //
                    //var datas = JSON.stringify(data);
                    self.sendRequest("datas",{gameId:self.gameId,openid:self.fromid},function(res){
                        if(res.state == 200)
                        {
                            var json = JSON.parse(res.data);
                            var ginvitelists = {ginvitelist:null};
                            var ginvitelist = json.ginvitelist == undefined ? [] : json.ginvitelist;
                            var inviteitem = {openid:self.openid,name:self.userName,pic:self.avatarUrl};
                            var ishave = false;
                            for(var i=0;i<ginvitelist.length;i++)
                            {
                                if(ginvitelist[i].openid == inviteitem.openid)
                                {
                                    ishave = true;
                                    break;
                                }
                            }
                            if(!ishave)
                            {
                                ginvitelist.push(inviteitem);
                                ginvitelists.ginvitelist = ginvitelist;
                                var datas = JSON.stringify(ginvitelists);
                                console.log("upload invitelist:",datas);
                                self.sendRequest("uploaddatas",{gameId:self.gameId,openid:self.fromid,datas:datas},function(res){
                                    console.log("upload invitelist:",res);
                                });
                            }

                            //加倍列表
                            var jiabeilists = {gjiabeilist:null};
                            var jiabeilist = json.gjiabeilist == undefined ? [] : json.gjiabeilist;
                            var inviteitem = {openid:self.openid,name:self.userName,pic:self.avatarUrl};
                            var ishave = false;
                            for(var i=0;i<jiabeilist.length;i++)
                            {
                                if(jiabeilist[i].openid == inviteitem.openid)
                                {
                                    ishave = true;
                                    break;
                                }
                            }
                            if(!ishave)
                            {
                                jiabeilist.push(inviteitem);
                                jiabeilists.gjiabeilist = jiabeilist;
                                var datas = JSON.stringify(jiabeilists);
                                console.log("upload jiabeilist:",datas);
                                self.sendRequest("uploaddatas",{gameId:self.gameId,openid:self.fromid,datas:datas},function(res){
                                    console.log("upload jiabeilist:",res);
                                });
                            }
                        }
                    });

                }
                //if(self.fromid && self.fromid.length>1)
                //{
                //    var data = {};
                //    if(self.channel == "sharegun")
                //        data.guninvitelist = self.openid;
                //    else
                //        data.invitelist = self.openid;
                //
                //    var datas = JSON.stringify(data);
                //    self.sendRequest("uploaddatas",{gameId:self.gameId,openid:self.fromid,datas:datas},function(res){
                //        console.log("upload invitelist:",res);
                //    });
                //}

            });
            if(this.updatePower && this.power == 1)
            {
                this.updatePower = false;
                this.sendRequest("power",{gameId:this.gameId,
                    channel:this.channel,openid:this.openid,power:this.power},function(res){
                    console.log("power:",res);
                });
            }

            if(this.power == 1 && self.channel == "shareonline")
            {
                if(this.logincallback)
                    this.logincallback();
            }

            if(this.power == 1)
            {
                this.pdatas(function(pres){
                    if(pres.state == 1)
                    {
                        self.paddUser(function(res){

                        },cc.storage.getToalCoin()/cc.config.totalCoinRate);
                    }
                });
            }
        }
    },

    open: function()
    {
        if(this.state == 1)
        {
            this.sendRequest("open",{gameId:this.gameId,channel:this.channel},function(res){
                console.log("open:",res);
            });
        }
    },
    //支付统计
    pay: function(money)
    {
        if(this.state == 1)
        {
            this.sendRequest("pay",{gameId:this.gameId,channel:this.channel,
                openid:this.openid,money:money},function(res){
                console.log("pay:",res);
            });
        }
    },

    //分享统计
    share: function(isSuccess)
    {
        if(this.state == 1)
        {
            var shareNum = 0;
            if(isSuccess)
                shareNum = 1;
            this.sendRequest("share",{gameId:this.gameId,channel:this.channel,
                openid:this.openid,share:shareNum},function(res){
                console.log("share:",res);
            });
        }
    },

    //事件统计
    event: function(eventId)
    {
        if(this.state == 1)
        {
            this.sendRequest("event",{gameId:this.gameId,channel:this.channel,
                openid:this.openid,eventId:eventId},function(res){
                console.log("event:",res);
            });
        }
    },

    //获取控制数据
    control: function(callback)
    {
        this.sendRequest("control",{gameId:this.gameId},function(res){
            console.log("control:",res);
            if(callback)
                callback(res);
        });
    },

    //获取用户数据
    datas: function(callback)
    {
        if(this.state == 1)
        {
            this.sendRequest("datas",{gameId:this.gameId,openid:this.openid},function(res){
                console.log("datas:",res);
                if(callback)
                    callback(res);
            });
        }
    },

    //上传用户数据  数据格式：json字符串 '{\"score\":100}'
    uploaddatas: function(datas,callback)
    {
        if(this.state == 1)
        {
            var self = this;
            this.httpPost("uploaddatas",{gameId:this.gameId,openid:this.openid,datas:datas},function(res){
                console.log("uploaddatas:",res);
                if(callback)
                    callback(res);
            });
        }
    },
    guid:function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    getOpenId: function(callback)
    {
        var self = this;
        if(window["wx"])
        {
            var funname = "jscode2sessionzijie";
            if(window["qq"]) funname = "jscode2sessionqq";
            wx.login({
                force:  false,
                success: function(res)
                {
                    console.log('login:', res);
                    self.sendRequest(funname,{gameId:self.gameId,gameSecret:self.secret,jsCode:res.code},function(r){
                        if(r.state == 200)
                        {
                            var msg = JSON.parse(r.msg);
                            self.session_key = msg.session_key;
                            self.openid = msg.openid;
                            if(!self.openid)
                            {
                                var openid = cc.sys.localStorage.getItem("shopio_openid");
                                if(!openid)
                                {
                                    openid = self.guid();
                                    cc.sys.localStorage.setItem("shopio_openid",openid);
                                }
                                self.openid = openid;
                            }
                            console.error('openid:', self.openid);
                        }
                        if(callback)
                            callback();
                        console.log('jscode2session:', r);
                    });
                },
                fail: function(){
                    var openid = cc.sys.localStorage.getItem("shopio_openid");
                    if(!openid)
                    {
                        openid = self.guid();
                        cc.sys.localStorage.setItem("shopio_openid",openid);
                    }
                    self.openid = openid;
                    console.error('openid:', self.openid);
                    if(callback)
                            callback();
                }
            });
        }
        else{
            if(callback)
                callback();
        }

    },
    //获取群id
    getGrpupId: function(encryptedData,iv,callback)
    {
        if(this.state == 1)
        {
            var self = this;
            if(window["wx"])
            {
                var funname = "groupid";
                if(window["qq"]) funname = "groupidqq";

                self.httpPost(funname,{encryptedData:encryptedData,sessionkey:self.session_key,iv:iv},function(r){
                    if(r.state == 200)
                    {
                        var msg = r.data;
                        var b = (msg == null || msg == "null") ? false : true;
                        console.log('groupid:', msg.openGId);
                        if(callback)
                        {
                            if(b == true)
                            {
                                callback(b,msg.openGId,msg.watermark.timestamp*1000);
                            }
                            else
                            {
                                callback(b);
                            }
                        }

                    }
                    console.log('groupid:', r);
                });
            }
        }
    },


    sendRequest: function(path, data, handler){
        var xhr = cc.loader.getXMLHttpRequest();
        var params = "?";
        for (var k in data) {
            if (params != "?") {
                params += "&";
            }
            params += k + "=" + data[k];
        }
        var requestURL = this.url + path + encodeURI(params);
        console.log("RequestURL:" + requestURL);

        xhr.open("GET", requestURL, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                try {
                    var ret = JSON.parse(xhr.responseText);
                    if (handler !== null) {
                        handler(ret);
                    }
                } catch (e) {
                    console.log("sendRequest Err:" + e);
                } finally {}
            }
        };
        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 5000; // 5 seconds for timeout
        // var btoa = btoa("test:test");
        // var btoa = require('buffer').Buffer.from('test:test').toString('base64');
        // xhr.setRequestHeader("Authorization", "Basic " + btoa);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8");
        }
        xhr.send();
        return xhr;
    },

    httpPost: function (url, params, handler) {
        var xhr = cc.loader.getXMLHttpRequest();
        var requestURL = this.url + url;
        console.log("RequestURL:" + requestURL,params);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                try {
                    var ret = JSON.parse(xhr.responseText);
                    if (handler !== null) {
                        handler(ret);
                    }
                } catch (e) {
                    console.log("sendRequest Err:" + e);
                } finally {}
            }
        };
        xhr.open("POST", requestURL, true);
        //xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }

        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 5000;// 5 seconds for timeout

        //var datas = "";
        //var i = 0;
        //for (var k in params) {
        //    if (i != 0) {
        //        datas += "&";
        //    }
        //    datas += k + "=" + params[k];
        //    i++;
        //}
        //
        //xhr.send(datas);
        xhr.send(params);
    },

    pdatas: function(callback)
    {
        if(this.state == 1)
        {
            this.sendRequest2("datas",{openid:this.openid},function(res){
                console.log("pdatas:",res);
                if(callback)
                    callback(res);
            });
        }
    },

    paddUser: function(callback,score)
    {
        if(this.state == 1)
        {
            if(this.avatarUrl.length < 5 || this.power == 0)
            {
                if(callback)
                    callback(null);
                return;
            }
            var aurl = this.avatarUrl;
            aurl = aurl.replace(/&/g,"---");
            this.httpPost2("addUser",{openid:this.openid,nick:this.userName,avatarUrl:aurl,score:score},function(res){
                console.log("addUser:",res);
                if(callback)
                    callback(res);
            });
        }
    },

    pupdateInfo: function(callback)
    {
        if(this.state == 1)
        {
            if(this.avatarUrl.length < 5)
            {
                if(callback)
                    callback(null);
                return;
            }
            var aurl = this.avatarUrl;
            aurl = aurl.replace(/&/g,"---");
            this.httpPost2("updateInfo",{openid:this.openid,nick:this.userName,avatarUrl:aurl},function(res){
                console.log("updateInfo:",res);
                if(callback)
                    callback(res);
            });
        }
    },

    uploadScore: function(score)
    {
        if(this.state == 1)
        {
            //score = score > 10000000 ? 10000 : score;
            score = Math.floor(score);
            this.sendRequest2("uploadScore",{openid:this.openid,score:score},function(res){
                console.log("uploadScore:",res);
            });
        }
    },


    rankScore: function(callback)
    {
        if(this.state == 1)
        {
            this.sendRequest2("rankScore",{openid:this.openid,rows:50},function(res){
                console.log("rankScore:",res);
                if(callback)
                    callback(res);
            });
        }
    },

    rankSelf: function(callback)
    {
        if(this.state == 1)
        {
            this.sendRequest2("rankSelf",{openid:this.openid},function(res){
                console.log("rankSelf:",res);
                if(callback)
                    callback(res);
            });
        }
    },


    subTime: function(callback)
    {
        if(this.state == 1)
        {
            this.sendRequest2("subTime",{},function(res){
                console.log("subTime:",res);
                if(callback)
                    callback(res);
            });
        }
    },

    updateUnionId: function(callback)
    {
        if(this.state == 1)
        {
            this.sendRequest2("updateUnionId",{openid:this.openid,unionId:this.unionId},function(res){
                console.log("updateUnionId:",res);
                if(callback)
                    callback(res);
            });
        }
    },

    randRobot: function(callback)
    {
        if(this.state == 1)
        {
            this.sendRequest2("rankScore",{page:10+Math.floor(Math.random()*40),rows:4},function(res){
                console.log("rankScore:",res);
                if(callback)
                    callback(res);
            });
        }
    },



    sendRequest2: function(path, data, handler){
        var xhr = cc.loader.getXMLHttpRequest();
        var params = "?";
        for (var k in data) {
            if (params != "?") {
                params += "&";
            }
            params += k + "=" + data[k];
        }
        var requestURL = this.url2 + path + encodeURI(params);
        console.log("RequestURL:" + requestURL);

        xhr.open("GET", requestURL, true);

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                try {
                    var ret = JSON.parse(xhr.responseText);
                    if (handler !== null) {
                        handler(ret);
                    }
                } catch (e) {
                    console.log("sendRequest Err:" + e,requestURL);
                } finally {}
            }
        };
        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 5000; // 5 seconds for timeout
        // var btoa = btoa("test:test");
        // var btoa = require('buffer').Buffer.from('test:test').toString('base64');
        // xhr.setRequestHeader("Authorization", "Basic " + btoa);
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8");
        }
        xhr.send();
        return xhr;
    },

    httpPost2: function (url, params, handler) {
        var xhr = cc.loader.getXMLHttpRequest();
        var requestURL = this.url2 + url;
        console.log("RequestURL:" + requestURL);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                try {
                    var ret = JSON.parse(xhr.responseText);
                    if (handler !== null) {
                        handler(ret);
                    }
                } catch (e) {
                    console.log("sendRequest Err:" + e);
                } finally {}
            }
        };
        xhr.open("POST", requestURL, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        if (cc.sys.isNative) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }

        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 5000;// 5 seconds for timeout
        //
        var datas = "";
        var i = 0;
        for (var k in params) {
            if (i != 0) {
                datas += "&";
            }
            datas += k + "=" + params[k];
            i++;
        }
        xhr.send(datas);
        //xhr.send(params);
    }
}
