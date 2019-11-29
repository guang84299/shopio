import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("NodeOut")
export class NodeOut extends Component {
    
    conf = [];
    item = [];
    start () {
       this.conf = [
        {"ID":"1","Prefab":"Shelves_01","Name":"小货架","Require":"6","Score":"25","Capacity":"1","CapacityAdd":"10"},
        {"ID":"2","Prefab":"Shelves_02","Name":"中货架","Require":"8","Score":"40","Capacity":"1","CapacityAdd":"15"},
        {"ID":"3","Prefab":"Shelves_03","Name":"大货架","Require":"9","Score":"80","Capacity":"1","CapacityAdd":"25"},
        {"ID":"4","Prefab":"Res101","Name":"纸袋子","Require":"1","Score":"1","Capacity":"1","CapacityAdd":"0"},
        {"ID":"5","Prefab":"Res102","Name":"面包","Require":"1","Score":"2","Capacity":"1","CapacityAdd":"0"},
        {"ID":"6","Prefab":"Res201","Name":"手提袋","Require":"3","Score":"4","Capacity":"1.5","CapacityAdd":"0"},
        {"ID":"7","Prefab":"Res202","Name":"平底锅","Require":"3","Score":"6","Capacity":"1.5","CapacityAdd":"0"},
        {"ID":"8","Prefab":"Res301","Name":"锅","Require":"5","Score":"10","Capacity":"2.5","CapacityAdd":"0"},
        {"ID":"9","Prefab":"Res302","Name":"速食套餐","Require":"5","Score":"10","Capacity":"2.5","CapacityAdd":"0"},
        {"ID":"10","Prefab":"Res401","Name":"床","Require":"5","Score":"10","Capacity":"2.5","CapacityAdd":"0"},
        {"ID":"11","Prefab":"Res402","Name":"椅子","Require":"5","Score":"10","Capacity":"2.5","CapacityAdd":"0"},
        {"ID":"12","Prefab":"Res403","Name":"显示器","Require":"5","Score":"10","Capacity":"2.5","CapacityAdd":"0"},
        {"ID":"13","Prefab":"Res404","Name":"桌子","Require":"5","Score":"10","Capacity":"2.5","CapacityAdd":"0"}
        ];

        this.loadNode(this.node);
        cc.sys.localStorage.setItem("item",JSON.stringify(this.item));
    }

    loadNode(node){
        var nodes = node.children;
        for(var i=0;i<nodes.length;i++)
        {
            this.loadNode(nodes[i]);
        }
        var id = this.hasNode(node.name);
        if(id>0)
        {
            var p = node.getWorldPosition();
            var ra = node.getWorldRotation();
            var sc = node.getWorldScale();
            if((p.x+"").length > 6)  p.x = p.x.toFixed(3);
            if((p.y+"").length > 6)  p.y = p.y.toFixed(3);
            if((p.z+"").length > 6) p.z = p.z.toFixed(3);
            if((ra.x+"").length > 6)  ra.x = ra.x.toFixed(3);
            if((ra.y+"").length > 6) ra.y = ra.y.toFixed(3);
            if((ra.z+"").length > 6) ra.z = ra.z.toFixed(3);
            if((ra.w+"").length > 6) ra.w = ra.w.toFixed(3);
            if((sc.x+"").length > 6) sc.x = sc.x.toFixed(3);
            if((sc.y+"").length > 6) sc.y = sc.y.toFixed(3);
            if((sc.z+"").length > 6) sc.z = sc.z.toFixed(3);
            this.item.push({id:id,x:p.x,y:p.y,z:p.z,rx:ra.x,ry:ra.y,rz:ra.z,rw:ra.w,sx:sc.x,sy:sc.y,sz:sc.z});
        }
    }

    hasNode(name){
        for(var i=0;i<this.conf.length;i++)
        {
            if(this.conf[i]["Prefab"] == name) return i+1;
        }
        return 0;
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }
}
