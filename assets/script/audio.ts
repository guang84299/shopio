import { _decorator, Component, Node,AudioSourceComponent } from "cc";
const { ccclass, property } = _decorator;

export const audio = {
    playSoundTime:0,

    audioMusic: null,
    audioSounds: {},


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
                if(cc.storage.getStorage(cc.storage.sound) == 1)
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
        if(this.audioMusic)
        this.audioMusic.pause();
    },

    resumeMusic: function()
    {
        if(cc.storage.getStorage(cc.storage.sound) == 1 && this.audioMusic)
        this.audioMusic.play();
    },

    stopMusic: function()
    {
        if(this.audioMusic)
        this.audioMusic.stop();
    },

    getSoundAudio: function(sound){
        var audioSound = this.audioSounds[sound];
        if(!audioSound)
        {
            audioSound = cc.find("Canvas").addComponent(AudioSourceComponent);
            audioSound.loop = false;
            this.audioSounds[sound] = audioSound;
        }
        else{
            if(!audioSound.node) audioSound.node = cc.find("Canvas");
        }
        // cc.log("---s---",this.audioSounds);

        return audioSound;
    },

    playSound: function(sound)
    {
        if(cc.storage.getStorage(cc.storage.sound) == 1)
        {
            var now = new Date().getTime();
            if(now-this.playSoundTime>500 || sound != "coin")
            {
                this.playSoundTime = now;
                var audioSound = cc.find("Canvas/audioNode/"+sound).getComponent(AudioSourceComponent);
                if(audioSound) audioSound.play();

                // var self = this;
                // cc.loader.loadRes(sound, function (err, clip)
                // {
                //     if(!err)
                //     {

                //         clip.setCurrentTime(0);
                //         clip.playOneShot(1);
                //         // var audioSound = self.getSoundAudio(sound.split("/")[1]);
                //         // audioSound.playOneShot(clip);
                //         // cc.log("--1--",clip.duration,clip.state);
                //     }
                //     else
                //     {
                //         //console.log(err);
                //     }
                // });
            }

        }
    }
}
