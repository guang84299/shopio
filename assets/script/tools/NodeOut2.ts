import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("NodeOut2")
export class NodeOut2 extends Component {
    
    maps = [];

    start () {
        // Your initialization goes here.
        this.loadNode(this.node);
        cc.sys.localStorage.setItem("item2",JSON.stringify(this.maps));
    }

    loadNode(node){
        var nodes = node.children;
        for(var i=0;i<nodes.length;i++)
        {
            this.loadNode(nodes[i]);
        }
        var arr = node.name.split("_");
        if(arr.length == 2)
        {
            var lv = Number(arr[0])-1;
            var num = Number(arr[1])-1;

            if(!this.maps[lv]) this.maps[lv] = [];

            var p = node.getWorldPosition();
            p.x = Math.floor(p.x);
            p.y = Math.floor(p.z);
            
            this.maps[lv][num] = {x:p.x,y:p.y};
        }
    }
}
