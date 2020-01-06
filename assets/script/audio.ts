import { _decorator, Component, Node,AudioSourceComponent } from "cc";
const { ccclass, property } = _decorator;

export const audio = {
    playSoundTime:0,

    audioMusic: null,
    audioSounds: [],


    playMusic: function(music,yinliang)
    {
        if(this.audioMusic == null || !cc.find("Canvas").getComponent(AudioSourceComponent))
        {
            this.audioMusic = cc.find("Canvas").addComponent(AudioSourceComponent);
            this.audioMusic.loop = true;
            this.audioMusic.playOnAwake = true;
        }
        
        var self = this;
        cc.loader.loadRes(music, function (err, clip)
        {
            if(!err)
            {
                if(!yinliang) yinliang = 0.8;
                // self.audioMusic.volume = yinliang;
                self.audioMusic.clip = clip;
                if(cc.storage.getStorage(cc.storage.music) == 1)
                    self.audioMusic.play();
            }
            else
            {
                console.log(err);
            }
        });
    },

    pauseMusic: function()
    {
        this.audioMusic.pause();
    },

    resumeMusic: function()
    {
        if(cc.storage.getStorage(cc.storage.music) == 1)
        this.audioMusic.play();
    },

    stopMusic: function()
    {
        this.audioMusic.stop();
    },

    getSoundAudio: function(){
        var audioSound = null;
        for(var i=0;i<this.audioSounds.length;i++)
        {
            if(!this.audioSounds[i].playing)
            {
                audioSound = this.audioSounds[i];
                break;
            }
        }
        if(audioSound == null)
        {
            audioSound = cc.find("Canvas").addComponent(AudioSourceComponent);
            audioSound.loop = false;
            this.audioSounds.push(audioSound);
            cc.log("---s---",this.audioSounds.length);
        }

        return audioSound;
    },

    playSound: function(sound)
    {
        if(cc.storage.getStorage(cc.storage.sound) == 1)
        {
            var now = new Date().getTime();
            if(now-this.playSoundTime>200)
            {
                this.playSoundTime = now;
                var self = this;
                cc.loader.loadRes(sound, function (err, clip)
                {
                    if(!err)
                    {
                        var audioSound = self.getSoundAudio();
                        audioSound.playOneShot(clip);
                        cc.log(audioSound.duration);
                    }
                    else
                    {
                        //console.log(err);
                    }
                });
            }

        }
    }
}
