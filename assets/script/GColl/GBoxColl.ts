import { _decorator, Component, Node, CCObject ,Vec2,ColliderComponent,RigidBodyComponent,ModelComponent} from "cc";
const { ccclass, property } = _decorator;

import { GCollControl } from './GCollControl';

@ccclass("GBoxColl")
export class GBoxColl extends Component {
    @property
    width = 1;
    @property
    height = 1;
    @property
    isStatic = true;
    @property
    mass = 1;
    @property
    damping = 0.1;
    @property
    elastic = 0;
    @property
    isCircle = true;

    velocity = cc.v2(0,0);
    elasticVelocity = cc.v2(0,0);
    collDis = 1;
    lastColl = false;

    collcallback = null;
    mesh = null;
    zOffset = 0;
    xOffset = 0;
    start () {
        this.collDis = GCollControl.ins.collMindis;
        var mesh = this.findMesh(this.node);
        this.mesh = mesh;
        this.initWh();
    }

    initWh(){
        if(this.mesh)
        {
            this.width = this.mesh.maxPosition.x - this.mesh.minPosition.x;
            this.height = this.mesh.maxPosition.z - this.mesh.minPosition.z;

            if(!this.isCircle)
            {
                var sy = this.node.getWorldRotation().y;
                if(Math.abs(sy)>0.1 && Math.abs(sy) < 0.9)
                {
                    var h = this.width;
                    var w = this.height;
                    this.width = w;
                    this.height = h;
                }

                var sx = this.node.getWorldRotation().x;
                if(sx>0.1 && sx < 0.9)
                {
                    this.width = this.mesh.maxPosition.x - this.mesh.minPosition.x;
                    this.height = this.mesh.maxPosition.y - this.mesh.minPosition.y;
                    this.zOffset = this.height/2;

                    if(sy>0.1 && sy < 0.9)
                    {
                        var h = this.width;
                        var w = this.height;
                        this.width = w;
                        this.height = h;

                        this.xOffset = this.width/2;
                        this.zOffset = 0;
                    }
                    else if(sy>-0.9 && sy < -0.1)
                    {
                        var h = this.width;
                        var w = this.height;
                        this.width = w;
                        this.height = h;

                        this.xOffset = -this.width/2;
                        this.zOffset = 0;
                    }
                }
                else if(sx>-0.9 && sx < -0.1)
                {
                    this.width = this.mesh.maxPosition.x - this.mesh.minPosition.x;
                    this.height = this.mesh.maxPosition.y - this.mesh.minPosition.y;
                    this.zOffset = -this.height/2;
                    if(sy>0.1 && sy < 0.9)
                    {
                        var h = this.width;
                        var w = this.height;
                        this.width = w;
                        this.height = h;

                        this.xOffset = -this.width/2;
                        this.zOffset = 0;
                    }
                    else if(sy>-0.9 && sy < -0.1)
                    {
                        var h = this.width;
                        var w = this.height;
                        this.width = w;
                        this.height = h;

                        this.xOffset = this.width/2;
                        this.zOffset = 0;
                    }
                }
                this.width += 0.2;
                this.height += 0.2;
            }
        }

        if(this.node.name == "player")
        {
            this.width = 0.3;
            this.height = 0.3;
        }
    }

    findMesh(node){
        var mode = node.getComponent(ModelComponent);
        if(mode) return mode.mesh;

        var nodes = node.children;
        for(var i=0;i<nodes.length;i++)
        {
            return this.findMesh(nodes[i]);
        }

        return null;
    }

    applyForce(velocity:Vec2){
        this.velocity = velocity;
    }

    getNextPos(dt)
    {
        var v = this.getAllVec();
        var p = this.node.getPosition();
        p.x += dt*v.x;
        p.z += dt*v.y;
        if(p.x>14) p.x = 14;
        if(p.x<-14) p.x = -14;
        if(p.z>14) p.z = 14;
        if(p.z<-14) p.z = -14;
        return p;
    }

    getLastPos(dt)
    {
        var v = this.getAllVec();
        var p = this.node.getPosition();
        p.x -= dt*v.x*0.01;
        p.z -= dt*v.y*0.01;
        return p;
    }

    getAllVec()
    {
        var v = cc.v2(this.velocity).add(this.elasticVelocity);
        return v;
    }

    setCollcallback(callback){
        this.collcallback = callback;
    }

    judgeColl(dt){
        var p = this.node.getPosition();
        var np = this.getNextPos(dt);
        //{collItem:colls[j],dir:dir,mdis:mdis,box:box}
        var data = this.excColl(np,p);
        // var rec = new cc.Rect(p.x-this.width/2+this.xOffset,p.z-this.height/2+this.zOffset,this.width,this.height);
        for(var i=0;i<data.length;i++)
        {
            var item = data[i].collItem;
            var v = cc.v2(this.velocity).normalize().subtract(cc.v2(item.velocity).normalize());
            this.velocity = this.velocity.subtract(v.multiplyScalar(item.velocity.length()/2));  
            // var v = cc.v2(this.velocity).normalize().add(data.dir2).normalize();
            //对方的力
            // item.velocity = item.velocity.subtract(v.multiplyScalar(this.velocity.length()/-2));

            this.velocity = this.velocity.multiplyScalar(0.5); 

            // this.elasticVelocity = data[i].dir.multiplyScalar(this.velocity.length()*2*this.elastic*item.elastic);

            if(this.collcallback) this.collcallback(item);

            var dataItem = data[i];
            if(dataItem.box)
            {
                var dis = Math.min(dataItem.box.width,dataItem.box.height);
                if(this.mass == item.mass) dis = dis/2;
                else if(this.mass > item.mass) dis = 0;
                if(dis>0)
                {
                    // if(dataItem.box.x>np.x) np.x -= dis;
                    // else np.x += dis;
                    // if(dataItem.box.y>np.z) np.z -= dis;
                    // else np.z += dis;
                    // var p1 = cc.v2(dataItem.box.x+dataItem.box.width/2,dataItem.box.y+dataItem.box.height/2);
                    // var p2 = cc.v2(dataItem.box.x-dataItem.box.width/2,dataItem.box.y-dataItem.box.height/2);
                    // var p3 = cc.v2(dataItem.box.x+dataItem.box.width/2,dataItem.box.y-dataItem.box.height/2);
                    // var p4 = cc.v2(dataItem.box.x-dataItem.box.width/2,dataItem.box.y+dataItem.box.height/2);
                    // if(rec.contains(p1))
                    //     dataItem.dir = p1.subtract(p2).normalize();
                    // else if(rec.contains(p2))  dataItem.dir = p2.subtract(p1).normalize();  
                    // else if(rec.contains(p3))  dataItem.dir = p3.subtract(p4).normalize();  
                    // else if(rec.contains(p4))  dataItem.dir = p4.subtract(p3).normalize();  
                    // dataItem.dir = cc.v2(np.x,np.z).subtract(cc.v2(dataItem.box.x,dataItem.box.y)).normalize();
                    // var dir = dataItem.dir.multiplyScalar(dis);
                    var vdir = cc.v2(this.velocity).normalize();
                    if(dataItem.box.width>dataItem.box.height)
                    {
                        np.x -= vdir.x*dis/4;
                        np.z -= vdir.y*dis*2;
                    }
                    else
                    {
                        np.x -= vdir.x*dis*2;
                        np.z -= vdir.y*dis/4;
                    }
                    // np = this.getNextPos(dt);
                    // this.node.setPosition(np);
                }           
            }
            else{
                var dir = dataItem.dir.multiplyScalar(dataItem.mdis);
                np.x += dir.x;
                np.z += dir.y;
                // this.node.setPosition(np);
            }
            // item.judgeColl(dt);
        }
    // if(this.node.name == "player" && Math.random()<0.01 && data.length>0)
    //     cc.log(data[0].box);
        this.node.setPosition(np);
       

        if(this.velocity.x>0)
        {
            this.velocity.x -= this.velocity.x*this.damping;
            if(this.velocity.x < this.damping) this.velocity.x = 0;
        }
        else{
            this.velocity.x += -this.velocity.x*this.damping;
            if(this.velocity.x > -this.damping) this.velocity.x = 0;
        }

        if(this.velocity.y>0)
        {
            this.velocity.y -= this.velocity.y*this.damping;
            if(this.velocity.y < this.damping) this.velocity.y = 0;
        }
        else{
            this.velocity.y += -this.velocity.y*this.damping;
            if(this.velocity.y > -this.damping) this.velocity.y = 0;
        }

        // var elaDamping = this.damping;
        // if(this.elasticVelocity.x>0)
        // {
        //     this.elasticVelocity.x -= this.elasticVelocity.x*elaDamping;
        //     if(this.elasticVelocity.x < this.damping) this.elasticVelocity.x = 0;
        // }
        // else{
        //     this.elasticVelocity.x += -this.elasticVelocity.x*elaDamping;
        //     if(this.elasticVelocity.x > -this.damping) this.elasticVelocity.x = 0;
        // }

        // if(this.elasticVelocity.y>0)
        // {
        //     this.elasticVelocity.y -= this.elasticVelocity.y*elaDamping;
        //     if(this.elasticVelocity.y < this.damping) this.elasticVelocity.y = 0;
        // }
        // else{
        //     this.elasticVelocity.y += -this.elasticVelocity.y*elaDamping;
        //     if(this.elasticVelocity.y > -this.damping) this.elasticVelocity.y = 0;
        // }
    }

    excColl(np,p){
        var sc = this.collDis;
        var keys = [];
        keys.push(Math.round(np.x)+"_"+Math.round(np.z));
        keys.push(Math.round(np.x+sc)+"_"+Math.round(np.z+sc));
        keys.push(Math.round(np.x-sc)+"_"+Math.round(np.z-sc));
        keys.push(Math.round(np.x+sc)+"_"+Math.round(np.z-sc));
        keys.push(Math.round(np.x-sc)+"_"+Math.round(np.z+sc));
        keys.push(Math.round(np.x)+"_"+Math.round(np.z+sc));
        keys.push(Math.round(np.x+sc)+"_"+Math.round(np.z));
        keys.push(Math.round(np.x-sc)+"_"+Math.round(np.z));
        keys.push(Math.round(np.x)+"_"+Math.round(np.z-sc));

        sc = this.collDis+1;
        keys.push(Math.round(np.x+sc)+"_"+Math.round(np.z+sc));
        keys.push(Math.round(np.x-sc)+"_"+Math.round(np.z-sc));
        keys.push(Math.round(np.x+sc)+"_"+Math.round(np.z-sc));
        keys.push(Math.round(np.x-sc)+"_"+Math.round(np.z+sc));
        keys.push(Math.round(np.x)+"_"+Math.round(np.z+sc));
        keys.push(Math.round(np.x+sc)+"_"+Math.round(np.z));
        keys.push(Math.round(np.x-sc)+"_"+Math.round(np.z));
        keys.push(Math.round(np.x)+"_"+Math.round(np.z-sc));
        
        keys = Array.from(new Set(keys));
        
        var colls = [];
        for(var i=0;i<keys.length;i++)
        {
            if(GCollControl.ins.maps[keys[i]]) colls = colls.concat(GCollControl.ins.maps[keys[i]]);
        }
        colls = Array.from(new Set((colls)));

        var rec1 = new cc.Rect(np.x-this.width/2+this.xOffset,np.z-this.height/2+this.zOffset,this.width,this.height);

        var items = [];
        
        for(var j=0;j<colls.length;j++)
        {
            if(colls[j] != this)
            {
                var p2 = colls[j].node.getPosition();
                if(this.isCircle && colls[j].isCircle)
                {
                    var judgeDis = this.width/2 + colls[j].width/2;
                    var dis = cc.Vec2.distance(cc.v2(np.x,np.z),cc.v2(p2.x,p2.z));
                    if(dis<judgeDis)
                    {
                        var dir = cc.v2(np.x,np.z).subtract(cc.v2(p2.x,p2.z)).normalize();
                        var mdis = judgeDis - dis;
                        items.push({collItem:colls[j],dir:dir,mdis:mdis,box:box});
                    }
                }
                else
                {
                    var rec2 = new cc.Rect(p2.x-colls[j].width/2+colls[j].xOffset,p2.z-colls[j].height/2+colls[j].zOffset,colls[j].width,colls[j].height);
                    if(rec1.intersects(rec2))
                    {
                        var box = new cc.Rect();
                        var dir = cc.v2(p.x,p.z).subtract(cc.v2(p2.x,p2.z)).normalize();
                        cc.Rect.intersection(box,rec1,rec2);
                        items.push({collItem:colls[j],dir:dir,box:box});
                    }
                }   
            }
            // if(j>8) break;
        }
        return items;
    }


    update (dt: number) {
        var p = this.node.getPosition();
        var key = Math.round(p.x)+"_"+Math.round(p.z);
        if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
        GCollControl.ins.maps[key].push(this); 

        if(!this.isCircle)
        {
            // var sc = this.collDis/2;
            // var key = Math.round(p.x+sc)+"_"+Math.round(p.z);
            // if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
            // GCollControl.ins.maps[key].push(this); 
            // var key = Math.round(p.x+sc)+"_"+Math.round(p.z+sc);
            // if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
            // GCollControl.ins.maps[key].push(this); 
            // var key = Math.round(p.x+sc)+"_"+Math.round(p.z-sc);
            // if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
            // GCollControl.ins.maps[key].push(this); 
            // var key = Math.round(p.x-sc)+"_"+Math.round(p.z);
            // if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
            // GCollControl.ins.maps[key].push(this); 
            // var key = Math.round(p.x-sc)+"_"+Math.round(p.z+sc);
            // if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
            // GCollControl.ins.maps[key].push(this); 
            // var key = Math.round(p.x-sc)+"_"+Math.round(p.z-sc);
            // if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
            // GCollControl.ins.maps[key].push(this); 

            var dx =  Math.floor(this.width/this.collDis/2);
            for(var i=1;i<=dx;i++)
            {
                var key = Math.round(p.x+this.collDis*i)+"_"+Math.round(p.z);
                if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
                GCollControl.ins.maps[key].push(this); 
    
                var key = Math.round(p.x+this.collDis*-i)+"_"+Math.round(p.z);
                if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
                GCollControl.ins.maps[key].push(this); 
            }
            var dy = Math.floor(this.height/this.collDis/2);
            for(var i=1;i<=dy;i++)
            {
                var key = Math.round(p.x)+"_"+Math.round(p.z+this.collDis*i);
                if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
                GCollControl.ins.maps[key].push(this); 
    
                var key = Math.round(p.x)+"_"+Math.round(p.z-this.collDis*i);
                if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
                GCollControl.ins.maps[key].push(this); 
            }
        }

    }

    lateUpdate(dt: number){
        if(!this.isStatic)
        {
            this.judgeColl(dt);
        }
    }

    public enable (enable:boolean) {
        this.enabled = enable;
    }
}
