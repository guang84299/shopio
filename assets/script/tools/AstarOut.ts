import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("AstarOut")
export class AstarOut extends Component {
    maps = [];

    start () {
        this.loadNodeRow(this.node);
        cc.sys.localStorage.setItem("AstarOut",JSON.stringify(this.maps));
    }

    loadNodeRow(node){
        var nodes = node.children;
        for(var i=0;i<nodes.length;i++)
        {
            this.maps.push([]);
            this.loadNodeCol(nodes[i]);
        }
    }

    loadNodeCol(node){
        var nodes = node.children;
        for(var i=0;i<nodes.length;i++)
        {
            this.maps[this.maps.length-1].push(nodes[i].active ? 0 : 1);
        }
    }
}
