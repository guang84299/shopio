import { _decorator, Component, Node ,SpriteComponent,LabelComponent,Texture2D,NodePool} from "cc";
const { ccclass, property } = _decorator;

export const res = {
    loads:{},
    audio_music: "",
    nodePools: {},

    getObjByPool: function(name){
        if(!this.nodePools[name]) this.nodePools[name] = new cc.NodePool();
        let obj = null;
        if (this.nodePools[name].size() > 0) { // 通过 size 接口判断对象池中是否有空闲的对象
            obj = this.nodePools[name].get();
        } else { // 如果没有空闲对象，也就是对象池中备用对象不够时，我们就用 cc.instantiate 重新创建
            obj = cc.instantiate(this.loads[name]);
        }
        return obj;
    },

    putObjByPool: function(obj,name){
        if(!this.nodePools[name]) this.nodePools[name] = new cc.NodePool();
        this.nodePools[name].put(obj); 
    },

    setSpriteFrame: function(url,sp)
    {
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            if(!err && sp && cc.isValid(sp))
            {
                var sf = sp.getComponent(SpriteComponent);
                if(sf) sf.spriteFrame = spriteFrame;
                //sp.getComponent("cc.Sprite").spriteFrame = spriteFrame;
            }
        });
    },

    setSpriteFrameAtlas: function(atlasUrl,url,sp)
    {
        cc.loader.loadRes(atlasUrl,cc.SpriteAtlas, function(err, atlas)
        {
            if(!err && sp && cc.isValid(sp))
            {
                sp.getComponent(SpriteComponent).spriteFrame = atlas.getSpriteFrame(url);
            }

        });
    },

    setTexture: function(url,material)
    {
        cc.loader.loadRes(url, Texture2D, function (err, texture) {
            if(!err && material)
            {
                material.setProperty('albedoMap', texture);
            }
        });
    },

    loadPic: function(url,sp)
    {
        cc.loader.load({url: url, type: 'png'}, function (err, tex) {
            if(err)
            {
                cc.log(err);
            }
            else
            {
                if(cc.isValid(sp))
                {
                    var spriteFrame = new cc.SpriteFrame(tex);
                    sp.getComponent(SpriteComponent).spriteFrame = spriteFrame;
                }
            }
        });
    },

    showToast: function(str)
    {
        var toast = cc.instantiate(this.loads["prefab_ui_toast"]);
        cc.find("label",toast).getComponent(LabelComponent).string = str;
        cc.find("Canvas").addChild(toast,10000);
        toast.getComponent(SpriteComponent).scheduleOnce(function(){
            toast.destroy();
        },1.7)
    },

    openUI: function(name,parent?:Node,showType?:any)
    {
        if(!parent) parent = cc.find("Canvas/uiNode");
        if(parent)
        {
            var node = parent.getChildByName("ui_"+name);
            if(node)
            {
                //node.active = true;
                node.getChildByName("bg").getComponent(name).show(showType);
                return;
            }

            if(parent["opening_"+name])
            {
                return;
            }
        }
        parent["opening_"+name] = true;
        cc.loader.loadRes("prefab/ui/"+name, function(err, prefab)
        {
            parent["opening_"+name] = false;
            if(err)
            {
                console.log("init error "+name,err);
            }
            else
            {
                var node = cc.instantiate(prefab);
                node.name = "ui_"+name;
                parent.addChild(node);
                node.getChildByName("bg").getComponent(name).show(showType);
            }
        });
    },

    closeUI: function(name,parent?:Node)
    {
        if(!parent) parent = cc.find("Canvas/uiNode");
        if(parent)
        {
            var node = parent.getChildByName("ui_"+name);
            if(node)
            {
                node.destroy();
            }
        }
    },

    getUI: function(name,parent?:Node)
    {
        if(!parent) parent = cc.find("Canvas/uiNode");
        if(parent)
        {
            var node = parent.getChildByName("ui_"+name);
            if(node)
            {
                return node.getChildByName("bg").getComponent(name);
            }
        }
        return null;
    },

    openPrefab: function(path,parent?:Node,callback?:any)
    {
        if(!parent) parent = cc.find("Canvas/uiNode");
        cc.loader.loadRes("prefab/"+path, function(err, prefab)
        {
            if(err)
            {
                console.log("init error "+path,err);
            }
            else
            {
                var node = cc.instantiate(prefab);
                parent.addChild(node);
                if(callback)callback(node);
            }
        });
    },
};

