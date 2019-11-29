import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

enum cubeDir{
    no = 0,
    down = 1,
    left_down = 2,
    right_down = 3,
    left = 4,
    right = 5,
    right_top = 6,
    left_top = 7,
    top = 8
}

@ccclass("cubeSc")
export class cubeSc extends Component {
    
    private moveSpeed = 30;
    moveDir = cc.v2(0,0);
    testControl = null;
    maps = [];
    enterCubes = [];
    public currItem = null;
    public tarItem = null;
    endItem = null;
    openItem = null;

    lastDir = cubeDir.no;
    menCol = 18;

    scollNum = 0;

    isEnterMen = false;
    lastEnterNum = 0;

    jugeDt = 0;

    carPoints = [];
    index = 0;

    start () {
        // Your initialization goes here.
        this.testControl = cc.find("gameNode").getComponent("testControl");
        this.maps = this.testControl.maps;
        this.enterCubes = this.testControl.enterCubes;
        this.endItem = this.maps[this.maps.length/2][this.menCol];
        this.openItem = this.maps[this.maps.length/2][this.menCol+1];
        this.carPoints = this.testControl.carPoints;
       
    }

    getTarDir(){
        var row = this.currItem.row;
        var col = this.currItem.col;
        var dir = cubeDir.no;

        if(col < this.menCol)
        {
            //先找到最优终点
            var endItem = this.endItem;
            var currDis = cc.Vec2.distance(cc.v2(this.currItem.x,this.currItem.y),cc.v2(endItem.x,endItem.y));
        
            //找到离终点最近的可行走点
            //向下
            if(col+1 < this.maps[0].length && !this.maps[row][col+1].use)
            {
                var item = this.maps[row][col+1];
                var dis = cc.Vec2.distance(cc.v2(endItem.x,endItem.y),cc.v2(item.x,item.y));
                if(dis<currDis)
                {
                    currDis = dis;
                    dir = cubeDir.down;
                }
            }

             //右下
             if(col+1 < this.maps[0].length && row+1 < this.maps.length && !this.maps[row+1][col+1].use)
             {
                 var item = this.maps[row+1][col+1];
                 var dis = cc.Vec2.distance(cc.v2(endItem.x,endItem.y),cc.v2(item.x,item.y));
                 if(dis<currDis)
                 {
                     currDis = dis;
                     dir = cubeDir.right_down;
                 }
             }
              //左下
              if(col+1 < this.maps[0].length &&  row-1 > 0 && !this.maps[row-1][col+1].use)
              {
                  var item = this.maps[row-1][col+1];
                  var dis = cc.Vec2.distance(cc.v2(endItem.x,endItem.y),cc.v2(item.x,item.y));
                  if(dis<currDis)
                  {
                      currDis = dis;
                      dir = cubeDir.left_down;
                  }
              }
             //右
             if(row+1 < this.maps.length && !this.maps[row+1][col].use)
             {
                 var item = this.maps[row+1][col];
                 var dis = cc.Vec2.distance(cc.v2(endItem.x,endItem.y),cc.v2(item.x,item.y));
                 if(dis<currDis)
                 {
                     currDis = dis;
                     dir = cubeDir.right;
                 }
             }   
            //左
            if(row-1 > 0 && !this.maps[row-1][col].use)
            {
                var item = this.maps[row-1][col];
                var dis = cc.Vec2.distance(cc.v2(endItem.x,endItem.y),cc.v2(item.x,item.y));
                if(dis<currDis)
                {
                    currDis = dis;
                    dir = cubeDir.left;
                }
            }   
    
        }
       else
       {
       
        if(!this.isEnterMen)
        {
            this.isEnterMen = true;
            //进一个，开启一个格子
            this.enterCubes.push(this);   
            this.index = this.enterCubes.length-1;   
        }

        if(this.lastEnterNum != this.enterCubes.length && this.isEnterMen)//|| this.jugeDt>0.1)
        {
            this.lastEnterNum = this.enterCubes.length;
            this.jugeDt = 0;
            if(this.lastEnterNum < this.carPoints[this.index].length-1)
                this.tarItem = this.carPoints[this.index][this.lastEnterNum];

            // //向下
            // if(col+1 < this.maps[0].length && !this.maps[row][col+1].use)
            //     dir = cubeDir.down;
            // else
            // {
            //     var lastRowNum = 0;
            //     var currRowNum = 0;
            //     for(var i=0;i<this.maps.length;i++)
            //     {
            //         if(this.maps[i][col-1].use) lastRowNum++;
            //         if(this.maps[i][col].use) currRowNum++;
            //     }

            //     if(currRowNum<=lastRowNum+4)
            //     {
            //         //左
            //         if(row < this.maps.length/2)
            //         {
            //             if(row-1 > 0 && !this.maps[row-1][col].use && row+1<this.maps.length && this.maps[row+1][col].use)
            //             dir = cubeDir.left;
            //         } 
            //         //右
            //         else{
            //             if(row+1 < this.maps.length && !this.maps[row+1][col].use && row-1>0 && this.maps[row-1][col].use)   
            //                 dir = cubeDir.right;
            //         }
            //     }
            //     else{
            //         if(col == 19 || col == 18)
            //         {
            //             //左
            //             if(row <= 10)
            //             {
            //                 if(row-1 > 0 && !this.maps[row-1][col].use)
            //                 dir = cubeDir.left;
            //             } 
            //             //右
            //             else{
            //                 if(row+1 < this.maps.length && !this.maps[row+1][col].use)   
            //                     dir = cubeDir.right;
            //             }
            //         }
            //     }                
            // }    


            //右
            // else if(row+1 < this.maps.length && !this.maps[row+1][col].use )   
            //     dir = cubeDir.right;
            // //左
            // else if(row-1 > 0 && !this.maps[row-1][col].use)
            //     dir = cubeDir.left;

        }
    }
    return dir;
}

    
    findTarItem(){
        
        if(this.currItem)
        {
            var row = this.currItem.row;
            var col = this.currItem.col;

            this.lastDir = this.getTarDir();
            
            if(this.lastDir == cubeDir.down)
            {
                col = col+1;
            } 
            else if(this.lastDir == cubeDir.left_down)
            {
                col = col+1;
                row = row-1;
            }
            else if(this.lastDir == cubeDir.right_down)
            {
                col = col+1;
                row = row+1;
            } 
            else if(this.lastDir == cubeDir.left)
            {
                row = row-1;
            }  
            else if(this.lastDir == cubeDir.right)
            {
                row = row+1;
            } 
            // else if(this.lastDir == cubeDir.right_top)
            // {
            //     row = row+1;
            //     col = col-1;
            // } 
            // else if(this.lastDir == cubeDir.left_top)
            // {
            //     row = row-1;
            //     col = col-1;
            // }  
            // else if(this.lastDir == cubeDir.top)
            // {
            //     col = col-1;
            // }            
            
            if(this.lastDir != cubeDir.no)
            {
                this.tarItem = this.maps[row][col];
                this.tarItem.use = true;
                return;
            }            
        }
    }

    updatePos(dt)
    {
        var p = this.node.getPosition();
        var x = this.tarItem.x;
        var y = this.tarItem.y;
        var addSpeed = 0;//(1-this.tarItem.col/this.maps[0].length)*0;
        if(x>p.x) 
        {
            p.x += (this.moveSpeed+addSpeed)*dt;
            if(p.x>x) p.x = x;
        }
        else{
            p.x -= (this.moveSpeed+addSpeed)*dt;
            if(p.x<x) p.x = x;
        }
        if(y>p.z) 
        {
            p.z += (this.moveSpeed+addSpeed)*dt;
            if(p.z>y) p.z = y;
        }
        else{
            p.z -= (this.moveSpeed+addSpeed)*dt;
            if(p.z<y) p.z = y;
        }
        this.node.setPosition(p);

        // var dis = cc.Vec2.distance(cc.v2(x,y),cc.v2(p.x,p.z));
        if(p.x == x && p.z == y)
        // if(dis<Math.random()*0.5)
        {
            this.currItem = this.tarItem;
            this.tarItem = null;
        }
    }

    updateMen(dt){
        this.moveDir = cc.v2(0,1);
        var p = this.node.getPosition();
        for(var i=0;i< this.enterCubes.length;i++)
        {
            var c = this.enterCubes[i];
            if(c == this) continue;
            var p2 = c.node.getPosition();
            var dis = cc.Vec2.distance(cc.v2(p.x,p.z),cc.v2(p2.x,p2.z));
            if(dis<1.5)
            {
                var dir = p.subtract(p2).normalize();
                this.moveDir.x += dir.x;
                this.moveDir.y += dir.y;
            }
        }

        
        var p1 = this.node.getPosition();
        p1.x += this.moveSpeed*this.moveDir.x*dt;
        p1.z += this.moveSpeed*this.moveDir.y*dt;

        p.x += this.moveSpeed*this.moveDir.x*dt;
        if(p1.z >= 15)
        {
            this.moveDir.y-=1;
            p.z += this.moveSpeed*this.moveDir.y*dt;
        }

        if(p.z>15) p.z = 15;
        if(p.x>10) p.x = 10;
        if(p.x<-10) p.x = -10;
        this.node.setPosition(p);
    }

    update (dt: number) {
        if(this.testControl.isTouch)
        {
            
            if(this.isEnterMen)
            {
                //有目标就往目标前进
                if(this.tarItem)
                {
                    cc.log(this.tarItem);
                    this.updatePos(dt);
                }
            }
            else
            {
                //没有目标就去寻找下一个
                if(this.tarItem == null)
                {
                    this.findTarItem();
                    if(this.tarItem != null) this.currItem.use = false;
                }
                //有目标就往目标前进
                if(this.tarItem)
                {
                    this.updatePos(dt);
                }
            }

            this.jugeDt += dt;
        }
        
    }
}
