import { _decorator, Component, Node, CCObject ,Vec2,ColliderComponent,RigidBodyComponent,ModelComponent} from "cc";
const { ccclass, property } = _decorator;

import { GCollControl } from './GCollControl';
import { Player } from '../game/Player';
import { Dog } from '../game/Dog';
import { config } from '../config';

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

    rigid = null;
    collider = null;
    upCollDt = 0;
    isOpenColl = true;

    isRobot = false;
    isPlayer = false;
    isDog = false;
    robotSc = null;
    dogSc = null;

    canColl = false;

    lastAstarP = null;

    upDt = 2;

    start () {
        this.collDis = GCollControl.ins.collMindis;
        var mesh = this.findMesh(this.node);
        this.mesh = mesh;
        this.initWh();
        // this.addAstarMap();
        // this.rigid = this.node.getComponent(RigidBodyComponent);
        // this.collider = this.node.getComponent(ColliderComponent);
        // if(this.rigid) 
        // {
        //     this.rigid.linearDamping = 0.2;
        //     this.rigid.useGravity = true;
        //     this.rigid.enabled = false;

        //     // if(this.node.name == "player")
        //     // {
        //     //     this.rigid.mass = 1;
        //     // }
        // }
        // this.collider.enabled = false;
        // this.isOpenColl = false;
        var self = this;
        this.scheduleOnce(function(){
            if(self.node.name == "player")
            {
                self.isRobot = self.node.getComponent(Player).isRobot;
                self.isPlayer = true;
                if(self.isRobot) self.robotSc = self.node.getComponent(Player);
            }
            else if(self.node.name == "dog")
            {
                self.isDog = true;
                self.dogSc = self.node.getComponent(Dog);
            }
        },1);
       
        if(this.isStatic && this.mass>1 && this.node.getPosition().y<0.1)
        {
            this.canColl = true;
        }
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
            this.width = 0.5;
            this.height = 0.5;
        }
        else if(this.node.name.indexOf("Wall03") != -1)
        {
            this.width += 0.2;
            this.height += 0.2;
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
        // if(this.rigid) 
        // this.rigid.setLinearVelocity(cc.v3(velocity.x,0,velocity.y));
    }

    getNextPos(dt)
    {
        var v = this.getAllVec();
        var p = this.node.getPosition();
        p.x += dt*v.x;
        p.z += dt*v.y;
        if(p.x>50) p.x = 50;
        if(p.x<-50) p.x = -50;
        if(p.z>40) p.z =40;
        if(p.z<-40) p.z = -40;
        return p;
    }

    getNextPosByDir(dir,dt)
    {
        var v = dir;
        var p = this.node.getPosition();
        p.x += dt*v.x;
        p.z += dt*v.y;
        if(p.x>50) p.x = 50;
        if(p.x<-50) p.x = -50;
        if(p.z>40) p.z = 40;
        if(p.z<-40) p.z = -40;
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

    excCallback(item){
        if(this.collcallback) this.collcallback(item);
    }

    judgeColl3(dt){
        var p = this.node.getPosition();
        var np = this.getNextPos(dt);
        if(this.node.name == "player")
        {
             //判断碰撞
            var data = this.excColl(np,p);
            for(var i=0;i<data.length;i++)
            {
                var item = data[i].collItem;
                var dataItem = data[i];
                this.excCallback(item);
                item.excCallback(this);
               
                var v = cc.v2(this.velocity).normalize().subtract(cc.v2(item.velocity).normalize());
                this.velocity = this.velocity.subtract(cc.v2(v).multiplyScalar(item.velocity.length()*0.5));  
                //对方的力
                if(!item.isStatic && !item.isPlayer)
                {
                    var sc = this.mass/item.mass;
                    if(sc>2 || item.isPlayer) sc = 2;
                    item.velocity = cc.v2(this.velocity).multiplyScalar(sc);
                }
                if(!dataItem.box)
                {
                    var dir = dataItem.dir.multiplyScalar(dataItem.mdis);
                    np.x += dir.x;
                    np.z += dir.y;
                }
            }
        }
       
        //判断位移
        if((!this.isRobot && !this.isDog) || (this.isRobot && (this.robotSc.isExcColl || this.robotSc.isExcColl2)) || (this.isDog && this.dogSc.isExcColl))
        {
            var ap = config.converToNodePos(cc.v2(np.x,np.z));
            if(!config.astarmap[ap.y][ap.x])
            {
                //判断方向
                if(Math.abs(this.velocity.x)>Math.abs(this.velocity.y))
                {
                    var ap2 = config.converToNodePos(cc.v2(np.x,p.z));
                    if(config.astarmap[ap2.y][ap2.x])
                    {
                        p.x = np.x;
                    }
    
                    if(np.x != p.x)
                    {
                        var ap2 = config.converToNodePos(cc.v2(p.x,np.z));
                        if(config.astarmap[ap2.y][ap2.x])
                        {
                            p.z = np.z;
                        }
                    }               
                }
                else
                {
                    var ap2 = config.converToNodePos(cc.v2(p.x,np.z));
                    if(config.astarmap[ap2.y][ap2.x])
                    {
                        p.z = np.z;
                    }
                    if(np.z != p.z)
                    {
                        var ap2 = config.converToNodePos(cc.v2(np.x,p.z));
                        if(config.astarmap[ap2.y][ap2.x])
                        {
                            p.x = np.x;
                        }
                    }
                }
            }
            else p = np;
        }
        else p = np;
        this.node.setPosition(p);
    }

    judgeColl(dt){
        var p = this.node.getPosition();
        var np = this.getNextPos(dt);
        //{collItem:colls[j],dir:dir,mdis:mdis,box:box}
        var data = this.excColl(np,p);
        var cw = 0;
        var ch = 0;
        var num = 0;
        for(var i=0;i<data.length;i++)
        {
            var item = data[i].collItem;
            var dataItem = data[i];
            this.excCallback(item);
            item.excCallback(this);

            // if(item.node.getPosition().y>0.5) continue;

            var v = cc.v2(this.velocity).normalize().subtract(cc.v2(item.velocity).normalize());
            this.velocity = this.velocity.subtract(cc.v2(v).multiplyScalar(item.velocity.length()*0.5));  

            // var v = cc.v2(this.velocity).normalize().add(data.dir2).normalize();
            //对方的力
            if(!item.isStatic)
            {
                var sc = this.mass/item.mass;
                if(sc>2 || item.isPlayer) sc = 2;
                item.velocity = cc.v2(this.velocity).multiplyScalar(sc);
                // item.velocity = item.velocity.subtract(cc.v2(v).multiplyScalar(this.velocity.length()*0.5));
                // if(item.velocity.length()>5) item.velocity = item.velocity.normalize().multiplyScalar(5);
            }
            // this.velocity = this.velocity.multiplyScalar(0.9); 
            // this.elasticVelocity = data[i].dir.multiplyScalar(this.velocity.length()*2*this.elastic*item.elastic);
            
            if(dataItem.box)
            {
               
                var dis = Math.min(dataItem.box.width,dataItem.box.height);
                // if(this.mass == item.mass) dis = dis/2;
                // else if(this.mass > item.mass) dis = 0;
                if(dis>0)
                {
                    if(item.canColl)
                    {
                        num ++;
                        cw += dataItem.box.width;
                        ch += dataItem.box.height;
                        // if((this.velocity.x>0 && ip.x>np.x) || (this.velocity.x<0  && ip.x<np.x))
                        // {
                        //     if(Math.abs(np.x-p.x)>dataItem.box.width/2)
                        //     np.x -= vdir.x*dataItem.box.width;
                        // }
                        // else if((this.velocity.y>0 && ip.y>np.z) || (this.velocity.y<0  && ip.y<np.z))
                        // {
                        //     if(Math.abs(np.z-p.z)>dataItem.box.height/2)
                        //     np.z -= vdir.y*dataItem.box.height;
                        // }
                        // if(num>0)
                        // {
                        //     var cp = item.node.getPosition();
                        //     if(cp.x == lastCollP.x || cp.z == lastCollP.z)
                        //     {
                        //         num ++;
                        //         cw += dataItem.box.width;
                        //         ch += dataItem.box.height;
                        //         lastCollP = cp;
                        //     }
                        //     else{
                        //         isYIyang = false;
                        //     }
                        // }
                        // else
                        // {
                        //     num ++;
                        //     cw += dataItem.box.width;
                        //     ch += dataItem.box.height;
                        //     lastCollP = item.node.getPosition();
                        // }
                    }
                   
                    
                    // if(dataItem.box.x>np.x) np.x -= dis;
                    // else np.x += dis;
                    // if(dataItem.box.y>np.z) np.z -= dis;
                    // else np.z += dis;
                    // var p1 = cc.v2(dataItem.box.x+dataItem.box.width/2,dataItem.box.y+dataItem.box.height/2);
                    // var p2 = cc.v2(dataItem.box.x-dataItem.box.width/2,dataItem.box.y-dataItem.box.height/2);
                    // var p3 = cc.v2(dataItem.box.x+dataItem.box.width/2,dataItem.box.y-dataItem.box.height/2);
                    // var p4 = cc.v2(dataItem.box.x-dataItem.box.width/2,dataItem.box.y+dataItem.box.height/2);
                    // if(dataItem.box.x>np.x && dataItem.box.y>np.z) dataItem.dir = p3.subtract(p4).normalize();
                    // else if(dataItem.box.x<np.x && dataItem.box.y<np.z) dataItem.dir = p4.subtract(p3).normalize();
                    // else if(dataItem.box.x>np.x && dataItem.box.y<np.z) dataItem.dir = p2.subtract(p1).normalize();
                    // else if(dataItem.box.x<np.x && dataItem.box.y>np.z) dataItem.dir = p1.subtract(p2).normalize();
                                       
                    // var dir = dataItem.dir.multiplyScalar(dis);
                    // np.x += dir.x;
                    // np.z += dir.y;

                    // var vdir = cc.v2(this.velocity).normalize();
                    // //  np.x -= vdir.x*dis;
                    // //  np.z -= vdir.y*dis;

                    // if(dataItem.box.width>dataItem.box.height)
                    // {
                    //     np.x -= vdir.x*dis/2;
                    //     np.z -= vdir.y*dis;
                    // }
                    // else
                    // {
                    //     np.x -= vdir.x*dis;
                    //     np.z -= vdir.y*dis/2;
                    // }
                    // np = this.getNextPos(dt);
                    // this.node.setPosition(np);

                    // var dir = cc.v2(dataItem.box.x,dataItem.box.y).subtract(cc.v2(np.x,np.z)).normalize();
                    // np.x -= dir.x*dis;
                    // np.z -= dir.y*dis;
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
        // if(this.isRobot) 
        // {
        //     var dis = Math.min(cw,ch);
        //     if(dis>0 && isYIyang)
        //     {
        //         dis = dis/num;
        //         var vdir = cc.v2(this.velocity).normalize();
        //         if(cw>ch)
        //         {
        //             np.x -= vdir.x*dis/4;
        //             np.z -= vdir.y*dis/2;
        //         }
        //         else
        //         {
        //             np.x -= vdir.x*dis/2;
        //             np.z -= vdir.y*dis/4;
        //         }
        //     }
    
        //     // if(!isYIyang) np = p;
        //     this.node.setPosition(np);
        //     return;
        // }
        var dis = Math.min(cw,ch);
        // if(dis>0.1)
        // {
        //     dis = dis/num;
        //     var vdir = cc.v2(this.velocity).normalize();
        //     if(cw>ch)
        //     {
        //         np.x -= vdir.x*dis/2;
        //         np.z -= vdir.y*dis;
        //     }
        //     else
        //     {
        //         np.x -= vdir.x*dis;
        //         np.z -= vdir.y*dis/2;
        //     }

        //     var data = this.excColl(np,p);
        //     var canMove = true;
        //     for(var i=0;i<data.length;i++)
        //     {
        //         var item = data[i].collItem;
        //         var dataItem = data[i];
        //         if(item.isStatic && item.mass>1)
        //         {
        //             if(dataItem.box)
        //             {
        //                 var dis = Math.min(dataItem.box.width,dataItem.box.height);
        //                 if(dis>0.1) 
        //                 {
        //                     canMove = false;
        //                     break;
        //                 }
        //             }
                    
        //         }
        //     }

        //     if(!canMove)np = p;
        // }

        // if(!isYIyang && !this.isRobot) np = p;
    // if(this.node.name == "player" && Math.random()<0.01 && data.length>0)
    //     cc.log(data[0].box);

        if(dis>0)
        {
            var vlen = this.velocity.length();

            var vdir = cc.v2(this.velocity).normalize();
            var minDir = 0.5;
            if(vdir.x<0) vdir.x = -minDir;
            else  vdir.x = minDir;

            var np2 = this.getNextPosByDir(cc.v2(vdir.x,0).multiplyScalar(vlen),dt);
            var data2 = this.excColl(np2,p);
            var isHasColl = false;
            for(var i=0;i<data2.length;i++)
            {
                var item = data2[i].collItem;
                if(item.canColl)
                {
                    isHasColl = true;
                    break;
                }
            }

            if(isHasColl)
            {
                isHasColl = false;
                if(vdir.y<0) vdir.y = -minDir;
                else  vdir.y = minDir;
                np2 = this.getNextPosByDir(cc.v2(0,vdir.y).multiplyScalar(vlen),dt);
                var data2 = this.excColl(np2,p);
                for(var i=0;i<data2.length;i++)
                {
                    var item = data2[i].collItem;
                    if(item.canColl)
                    {
                        isHasColl = true;
                        break;
                    }
                }
            }

            if(isHasColl) 
            {
                if(dis>0.1 && num >= 1)
                {
                    for(var i=0;i<data.length;i++)
                    {
                        var item = data[i].collItem;
                        if(item.canColl)
                        {
                            var dataItem = data[i];
                            var v2 = cc.v2(dataItem.box.x+dataItem.box.width/2,dataItem.box.y+dataItem.box.height/2);
                            vdir = cc.v2(p.x,p.z).subtract(v2).normalize();
                            np.x += vdir.x*dataItem.box.width/2;
                            np.z += vdir.y*dataItem.box.height/2;
                            break;
                        }
                    }
                }
                else np = p;
               
            }
            else{
                np = np2;
            }
        }
        this.node.setPosition(np);
    
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

    judgeColl2(np){
        var p = this.node.getPosition();
        var data = this.excColl(np,p);

        var cw = 0;
        var ch = 0;
        var num = 0;
        for(var i=0;i<data.length;i++)
        {
            var item = data[i].collItem;
            var dataItem = data[i];
            if(item.mass>=1)
            {
                var dis = Math.min(dataItem.box.width,dataItem.box.height);
                if(dis>0)
                {
                    num ++;
                    cw += dataItem.box.width;
                    ch += dataItem.box.height;
                }
            }
        }
        var dis = Math.min(cw,ch);
        if(dis>0)
        {
            dis = dis/num;
            var vdir = cc.v2(this.velocity).normalize();
            if(cw>ch)
            {
                np.x -= vdir.x*dis/2;
                np.z -= vdir.y*dis;
            }
            else
            {
                np.x -= vdir.x*dis;
                np.z -= vdir.y*dis/2;
            }
        }
        
        return np;
    }

    judgeDrop(){
        var np = this.node.getPosition();
        var sc = this.collDis/2;
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

        keys = Array.from(new Set(keys));
        
        var colls = [];
        for(var i=0;i<keys.length;i++)
        {
            if(GCollControl.ins.maps[keys[i]]) colls = colls.concat(GCollControl.ins.maps[keys[i]]);
        }
        colls = Array.from(new Set((colls)));

        var isDrop = true;
        for(var j=0;j<colls.length;j++)
        {
            if(colls[j] != this && colls[j].mass>this.mass)
            {
                isDrop = false;
                break;
            }
        }
        return isDrop;
    }

    addAstarMap(){
        if(this.node.name == "player")
        {
            if(this.lastAstarP) config.astarmap[this.lastAstarP.y][this.lastAstarP.x] = 1;
            this.lastAstarP = null;
            var p = this.node.getPosition();
            var np = config.converToNodePos(cc.v2(p.x,p.z));
            if(config.astarmap[np.y][np.x] == 1) 
            {
                config.astarmap[np.y][np.x] = 0;
                this.lastAstarP = np;
            }
        }
    }

    update (dt: number) {
        if(this.isStatic)
        {
            this.upDt += dt;
            if(this.upDt<0.3) return;
            else this.upDt = 0;
        }
        else{
            this.upDt += dt;
            if(this.upDt<0.1) return;
            else this.upDt = 0;
        }
        var p = this.node.getPosition();
        var key = Math.round(p.x)+"_"+Math.round(p.z);
        if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
        GCollControl.ins.maps[key].push(this); 
       
        if(!this.isCircle)
        {
            var dx =  Math.floor(this.width/this.collDis/2);
            for(var i=1;i<=dx;i++)
            {
                var key = Math.round(p.x+this.collDis*i+this.xOffset)+"_"+Math.round(p.z+this.zOffset);
                if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
                GCollControl.ins.maps[key].push(this); 
                
                var key = Math.round(p.x+this.collDis*-i+this.xOffset)+"_"+Math.round(p.z+this.zOffset);
                if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
                GCollControl.ins.maps[key].push(this); 
               
            }
            var dy = Math.floor(this.height/this.collDis/2);
            for(var i=1;i<=dy;i++)
            {
                var key = Math.round(p.x+this.xOffset)+"_"+Math.round(p.z+this.collDis*i+this.zOffset);
                if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
                GCollControl.ins.maps[key].push(this); 
               
                var key = Math.round(p.x+this.xOffset)+"_"+Math.round(p.z-this.collDis*i+this.zOffset);
                if(!GCollControl.ins.maps[key])  GCollControl.ins.maps[key] = [];
                GCollControl.ins.maps[key].push(this); 
               
            }
        }
        // this.addAstarMap();
    }

    lateUpdate(dt: number){
        if(!this.isStatic)
        {
            if(this.node.name == "player") 
            {
                this.judgeColl3(1/30);
            }
            else{
                if(this.velocity.x != 0 || this.velocity.y != 0)
                {
                    // var np = this.getNextPos(dt);
                    // if(this.mass<=1) np = this.judgeColl2(np);
                    // this.node.setPosition(np);
                    if(this.mass<=1) this.judgeColl3(1/30);
                }
            }

            if(this.velocity.x != 0 || this.velocity.y != 0)
            {
                  // this.damping = 0.02;
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
            }

            // if(this.velocity.x != 0 || this.velocity.y != 0)
            //     this.judgeColl(1/30);
            // if(this.velocity.x != 0 || this.velocity.y != 0)
            // {
            //     this.rigid.enabled = true;
            //     this.collider.enabled = true;
            //     this.judgeColl(1/60);
            // }
            // else{
            //     this.rigid.enabled = false;

            // }
        }
        // else
        // {
        //     if(this.mass<=1 && this.judgeDrop())
        //     {
        //         this.isStatic = false;
        //         var np = this.node.getPosition();
        //         np.y = 0;
        //         this.node.setPosition(np);
        //     }
        // }
    }

    lateUpdate2 (dt: number){
        if(this.node.name == "player") 
        {
            this.rigid.enabled = true;
            this.collider.enabled = true;

            var p = this.node.getPosition();
            p.y = -0.01;
            this.node.setPosition(p);
            var np = this.getNextPos(dt);
            var data = this.excColl(np,p);

            for(var i=0;i<data.length;i++)
            {
                var item = data[i].collItem;
                this.excCallback(item);
                item.excCallback(this);
               
                if(item.enabled)
                {
                    item.isOpenColl = true;
                    item.upCollDt = 0.05;

                    if(item.rigid) item.rigid.enabled = true;
                    item.collider.enabled = true;
                }
                
            }
        }
        else{
            if(this.isOpenColl && this.upCollDt>0)
            {
                this.upCollDt -= dt;
                if(this.upCollDt<0)
                {
                    // if(this.rigid)
                    // {
                    //     var v = cc.v3();
                    //     this.rigid.getLinearVelocity(v);
                    //     if(v.length()<0.2)
                    //     {
                    //         this.isOpenColl = false;
                    //         if(this.rigid) this.rigid.enabled = false;
                    //         this.collider.enabled = false;
                    //     }
                    // }
                    // else
                    // {
                        if(this.rigid) this.rigid.enabled = false;
                        this.isOpenColl = false;
                        this.collider.enabled = false;
                    // }
                }
            }
        }
        // if(this.collider.enabled)
        // {
        //     GCollControl.ins.collNum++;
        //     if(Math.random()<0.01) cc.log( GCollControl.ins.collNum);
        // } 
    //     if(this.isOpenColl)
    //    {
    //        var v = cc.v3();
    //        this.rigid.getLinearVelocity(v);
    //        if(v.length()<0.02)
    //        {
    //             this.isOpenColl = false;
    //             this.rigid.enabled = false;
    //             this.upCollDt = 0.1;
    //        }
    //    }
    //    else
    //    {
    //         this.upCollDt -= dt;
    //         if(this.upCollDt<0)
    //         {
    //             this.isOpenColl = true;
    //             this.rigid.enabled = true;
    //         }
    //    }
    }

    public enable (enable:boolean) {
        // if(this.rigid) this.rigid.enabled = enable;
        // this.collider.enabled = enable;
        this.enabled = enable;
    }
}
