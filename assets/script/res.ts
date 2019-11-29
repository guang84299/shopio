import { _decorator, Component, Node ,SpriteComponent,LabelComponent,Texture2D,RenderTexture} from "cc";
const { ccclass, property } = _decorator;

export const res = {
    loads:{},
    audio_music: "",

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
        var toast = cc.instantiate(this["prefab_ui_toast"]);
        cc.find("label",toast).getComponent(LabelComponent).string = str;
        cc.find("Canvas").addChild(toast,10000);
        toast.opacity = 0;
        toast.runAction(cc.sequence(
            cc.fadeIn(0.2),
            cc.delayTime(2),
            cc.fadeOut(0.3),
            cc.removeSelf()
        ));
    },

    openUI: function(name,parent,showType)
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

    closeUI: function(name,parent)
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

    getUI: function(name,parent)
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

    openPrefab: function(path,parent,callback)
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

