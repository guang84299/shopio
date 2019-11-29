import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

export const storage = {
    pice:['k','m','b','t','a','aa','ab','ac','ad','ae','af','ag','ah','ai','aj','ak','al','am','an','ao','ap','aq','ar','as','at'],
    pfix: "2048_",
    playSoundTime:0,

    music: "music",
    sound: "sound",
    vibrate: "vibrate",
    first: "first",
    coin: "coin",
    score: "score",
    lv: "lv",
    circleData: "circleData",
    showScore: "showScore",
    fuhuoNum: "fuhuoNum",

    defaultVal: {
        music:1,
        sound:1,
        vibrate:1,
        first:0,
        coin:0,
        score:0,
        lv: 0,
        circleData:[],
        showScore: 0,
        fuhuoNum: 0
    },

    setStorage: function(key,val)
    {
        if(typeof this.defaultVal[key] == "object")
            val = JSON.stringify(val);       
        cc.sys.localStorage.setItem(this.pfix+key,val);
    },
    getStorage: function(key)
    {
        var val = cc.sys.localStorage.getItem(this.pfix+key);
        if(val === null || val === "" || val === undefined)
        {
            return this.defaultVal[key];
        }
        else
        {
            if(typeof this.defaultVal[key] == "object")
                return JSON.parse(val);
            else
                return Number(val);
        
        }
    },
    uploadStorage: function(key)
    {
        var datas = {key:null};
        datas[key] = this.getStorage(key);
        var data = JSON.stringify(datas);
        cc.qianqista.uploaddatas(data);
    },

    playMusic: function(music,yinliang)
    {
        if(this.getStorage(this.music) == 1)
        {
            this.stopMusic();

            cc.loader.loadRes(music, function (err, clip)
            {
                if(!err)
                {
                    if(!yinliang) yinliang = 0.3;
                    cc.audioEngine.play(clip, true, yinliang);
                }
                else
                {
                    console.log(err);
                }
            });
            
        }
    },

    pauseMusic: function()
    {
        if(this.getStorage(this.music) == 1)
            cc.audioEngine.pauseAll();
    },

    resumeMusic: function()
    {
        if(this.getStorage(this.music) == 1)
            cc.audioEngine.resumeAll();
    },

    stopMusic: function()
    {
        cc.audioEngine.stopAll();
    },

    playSound: function(sound)
    {
        if(this.getStorage(this.sound) == 1)
        {
            var now = new Date().getTime();
            if(now-this.playSoundTime>200)
            {
                this.playSoundTime = now;
                cc.loader.loadRes(sound, function (err, clip)
                {
                    if(!err)
                    {
                        cc.audioEngine.play(clip, false, 1);
                    }
                    else
                    {
                        //console.log(err);
                    }
                });
            }

        }
    },

    scientificToNumber: function(num) {
        var str = num.toString();
        /*6e7或6e+7 都会自动转换数值*/
        var index = str.indexOf("e+");
        if (index == -1) {
            return str;
        } else {
            /*6e-7 需要手动转换*/
            var head = str.substr(0,index);
            var zero = '';
            var len = parseInt(str.substr(index+2,str.length));
            if(head.indexOf(".")>=0)
            {
                var h = head.split(".");
                head = h[0]+h[1];
                len = len - h[1].length;
            }
            for(var i=0;i<len;i++)
            {
                zero += '0';
            }
            return head + zero;
        }
    },


    castNum: function(coin)
    {
        coin = Math.floor(coin);
        var str = this.scientificToNumber(coin);
        var s = '';
        var n = 0;
        if(str.length>3)
            n = Math.floor((str.length-1)/3);
        if(n>0)
        {
            coin = (coin/Math.pow(1000,n)).toFixed(2);
        }
        str = coin+"";
        var l = str.split(".")[0].split("").reverse();
        for (var i = 0; i < l.length; i++) {
            s += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
        }
        s = s.split("").reverse().join("");
        if(n>0)
        {
            var r = str.split(".")[1];
            s = s + "." + r;
            s += this.pice[n-1];
        }
        return s;
    },

    getLabelStr: function(str,num)
    {
        var s = "";
        var len = 0;
        for (var i=0; i<str.length; i++) {
            var c = str.charCodeAt(i);
            //单字节加1
            if ((c >= 0x0001 && c <= 0x007e) || (0xff60<=c && c<=0xff9f)) {
                len++;
                if(len>=num-2)
                {
                    if(i != str.length-1)
                        s += "...";
                    break;
                }
                else
                {
                    s += str.charAt(i);
                }
            }
            else {
                len+=2;
                if(len>=num-2)
                {
                    if(i != str.length-1)
                        s += "...";
                    break;
                }
                else
                {
                    s += str.charAt(i);
                }
            }
        }
        return s;
    },

    getCountDown: function(t1,t2,fnum)
    {
        var time = t2 - t1;
        var str = "";
        if(!fnum) fnum = 3;

        if(time<=0)
        {
            if(fnum == 1)
                str = "00";
            else if(fnum == 2)
                str = "00:00";
            else if(fnum == 3)
                str = "00:00:00";

            return str;
        }

        var d = Math.floor(time/(24*60*60*1000));
        var h = Math.floor((time - d*24*60*60*1000)/(60*60*1000));
        var m = Math.floor((time - d*24*60*60*1000 - h*60*60*1000)/(60*1000));
        var s = Math.floor(((time - d*24*60*60*1000 - h*60*60*1000 - m*60*1000))/1000);
        var sd = d < 10 ? "0"+d : d;
        var sh = h < 10 ? "0"+h : h;
        var sm = m < 10 ? "0"+m : m;
        var ss = s < 10 ? "0"+s : s;


        if(fnum == 1)
            str = ss+"";
        else if(fnum == 2)
            str = sm+":"+ss;
        else if(fnum == 3)
            str = sh+":"+sm+":"+ss;
        else
        {
            if(d>0) str = sd+":"+sh+":"+sm+":"+ss;
            else str = sh+":"+sm+":"+ss;
        }

        return str;
    }
}
