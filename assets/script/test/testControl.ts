import { _decorator, Component, Node,Prefab } from "cc";
const { ccclass, property } = _decorator;

@ccclass("testControl")
export class testControl extends Component {
   
    @property(Prefab)
    public cube = null;
    @property(Prefab)
    public cube2 = null;

    @property(Node)
    public cubeNode = null;

    public cubes = [];
    public maps = [];
    public enterCubes = [];

    public isTouch = false;

    public isCube1 = true;

    public carPoints = [];

    start () {
        // Your initialization goes here.
        
        var self = this;
        cc.systemEvent.on(Node.EventType.TOUCH_START, function(){
            self.isTouch = true;
        }, this);
        // cc.systemEvent.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        cc.systemEvent.on(Node.EventType.TOUCH_END, function(){
            self.isTouch = false;
        }, this);

       
        this.initData();
        
        var sx = -10;
        var sy = 0;
        for(var i=0;i<200;i++)
        {
            var ps = [];
            for(var j=0;j<20;j++)
            {
                ps.push({x:sx+j*1+(j%2)*0.5,y:sy+j*1});
                // ps.push({x:10,y:0});
            }
            this.carPoints.push(ps);
        }
       
    }

    initData(){
        this.maps = [];
        this.cubes = [];
        this.enterCubes = [];
        var sx = -10;
        var sy = -10;
        for(var i=0;i<20;i++)
        {
            var cols = [];
            for(var j=0;j<24;j++)
            {
                var flag = false;
                if(j == 18 && (i<9 || i>11))
                    flag = true;

                var open = true;
                if(j > 18)
                {
                    open = false; 
                    // flag = true;
                }
                       
                
                var rx = (Math.random()-0.5)*0.0;
                var ry = (Math.random()-0.5)*0.0;
                cols.push({row:i,col:j,x:sx+i*1+rx+(j%2)*0.5,y:sy+j*1+ry,use:flag,open:open,num:0});
            }
            this.maps.push(cols);
        }

        this.cubeNode.destroyAllChildren();
        for(var i=0;i<150;i++)
        {
            var cube = null;
            if(this.isCube1)cube = cc.instantiate(this.cube);
            else cube = cc.instantiate(this.cube2);
            
            cube.active = true;
            var item  = this.randMapItem();
            var x = item.x;
            var z = item.y;
            cube.setPosition(cc.v3(x,1,z));
            this.cubeNode.addChild(cube);
            cube.getComponent("cubeSc").currItem = item;
            this.cubes.push(cube);
        }
    }

    randMapItem(){
        var row = Math.floor(Math.random()*this.maps.length);
        var col = Math.floor(Math.random()*18);

        if(!this.maps[row][col].use)
        {
            this.maps[row][col].use = true;
            return this.maps[row][col];
        }
        else{
            return this.randMapItem();
        }
    }

    reset(){
        this.initData();
    }
   
    changeCube(){
        this.isCube1 = !this.isCube1;
        this.reset();
    }
    // update (dt: number) {
        
    // }
}
