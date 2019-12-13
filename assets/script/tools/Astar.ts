import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

import { GCollControl } from '../GColl/GCollControl';

@ccclass("Astar")
export class Astar extends Object {
    
    openList:any = [];
    closeList:any = [];
    startPoint: {x:number,y:number,f:0,g:0,h:0};
    endPoint: {x:0,y:0,f:0,g:0,h:0};

    openMap = {};
    closeMap = {};
    num = 0;
    initEndNum = 0;
    initStartNum = 0;


    //{x:0,y:0,f:0,g:0,h:0}
    findPath (startPoint:any,endPoint) {
        this.startPoint = startPoint;
        this.endPoint = endPoint;

        this.startPoint.g = 0;
        this.startPoint.h = 0;
        this.startPoint.f = 0;

        // this.addOpenList(this.startPoint,this.startPoint);
        this.initStartPoint();
        this.initEndPoint();
        this.addCloseList(this.startPoint);

        while(this.findNext() && this.num < 400)
        {
            this.num ++;
        }
        // this.closeList.reverse();

        var node = this.closeList.pop();
        var list = [];
        list.push(node);
        while(node.parent)
        {
            if(GCollControl.ins.roads[node.parent.x+"_"+node.parent.y])
            cc.log("---x---",node.parent,startPoint);
            list.unshift(node.parent);
            node = node.parent;
        }    
        // if(this.num < 400 && !GCollControl.ins.roads[endPoint.x+"_"+endPoint.y])
          list.push(endPoint);
        cc.log("num="+this.num);   
        return list;
    }

    //获取开始点最近的可行走的点
    initStartPoint(){
      var end = null;
      if(this.initStartNum == 0)
        end = {x:Math.round(this.startPoint.x),y:Math.round(this.startPoint.y)};
      else if(this.initStartNum == 1)
        end = {x:Math.round(this.startPoint.x),y:Math.floor(this.startPoint.y)};  
      else if(this.initStartNum == 2)
        end = {x:Math.floor(this.startPoint.x),y:Math.floor(this.startPoint.y)}; 
      else if(this.initStartNum == 3)
        end = {x:Math.floor(this.startPoint.x),y:Math.round(this.startPoint.y)};        
      
      this.initStartNum ++;

      if(GCollControl.ins.roads[end.x+"_"+end.y] && this.initStartNum<3) this.initStartPoint();
      else{
        this.startPoint.x = end.x;
        this.startPoint.y = end.y;
      }      
  }
    //获取终点最近的可行走的点
    initEndPoint(){
        var end = {x:this.endPoint.x,y:this.endPoint.y};
        if(GCollControl.ins.roads[end.x+"_"+end.y])
        {
            var maxX = 14;
            var minX = -14;
            var maxY = 7;
            var minY = -7;
            var start = {x:this.startPoint.x,y:this.startPoint.y};
            if(end.x>start.x)
            {
                if(!GCollControl.ins.roads[(end.x-1)+"_"+end.y] && end.x-1 > minX)
                {
                    end.x-=1;
                    return;
                }
            }
            else{
                if(!GCollControl.ins.roads[(end.x+1)+"_"+end.y] && end.x+1 < maxX)
                {
                    end.x+=1;
                    return;
                }
            }

            if(end.y>start.y)
            {
                if(!GCollControl.ins.roads[end.x+"_"+(end.y-1)] && end.y-1 > minY)
                {
                    end.y-=1;
                    return;
                }
            }
            else{
                if(!GCollControl.ins.roads[end.x+"_"+(end.y+1)] && end.y-1 < maxY)
                {
                    end.y+=1;
                    return;
                }
            }
        }
        this.endPoint.x = end.x;
        this.endPoint.y = end.y;
        this.initEndNum ++;
        if(GCollControl.ins.roads[end.x+"_"+end.y] && this.initEndNum<5) this.initEndPoint();
    }

    findNext(){
        var node = this.closeList[this.closeList.length-1];
        var maxX = 14;
        var minX = -14;
        var maxY = 7;
        var minY = -7;
        //top
        var top = {x:node.x,y:node.y+1};
        if(top.x == this.endPoint.x && top.y == this.endPoint.y) return false;
        if(!GCollControl.ins.roads[top.x+"_"+top.y] && top.y < maxY)
        {
            this.addOpenList(top,node);
        }

        //bottom
        var bottom = {x:node.x,y:node.y-1};
        if(bottom.x == this.endPoint.x && bottom.y == this.endPoint.y) return false;
        if(!GCollControl.ins.roads[bottom.x+"_"+bottom.y] && bottom.y > minY)
        {
            this.addOpenList(bottom,node);
        }

        //left
        var left = {x:node.x-1,y:node.y};
        if(left.x == this.endPoint.x && left.y == this.endPoint.y) return false;
        if(!GCollControl.ins.roads[left.x+"_"+left.y] && left.x > minX)
        {
            this.addOpenList(left,node);
        }

         //right
         var right = {x:node.x+1,y:node.y};
         if(right.x == this.endPoint.x && right.y == this.endPoint.y) return false;
         if(!GCollControl.ins.roads[right.x+"_"+right.y] && right.x < maxX)
         {
             this.addOpenList(right,node);
         }

         //top right
         var topright = {x:node.x+1,y:node.y+1};
         if(topright.x == this.endPoint.x && topright.y == this.endPoint.y) return false;
         if(!GCollControl.ins.roads[topright.x+"_"+topright.y] && topright.x<maxX && topright.y<maxY)
         {
             this.addOpenList(topright,node);
         }

         //bottom right
         var bottomright = {x:node.x+1,y:node.y-1};
         if(bottomright.x == this.endPoint.x && bottomright.y == this.endPoint.y) return false;
         if(!GCollControl.ins.roads[bottomright.x+"_"+bottomright.y] && bottomright.x<maxX && bottomright.y>minY)
         {
             this.addOpenList(bottomright,node);
         }

        //top left
        var topleft = {x:node.x-1,y:node.y+1};
        if(topleft.x == this.endPoint.x && topleft.y == this.endPoint.y) return false;
        if(!GCollControl.ins.roads[topleft.x+"_"+topleft.y] && topleft.x>minX && topleft.y < maxY)
        {
            this.addOpenList(topleft,node);
        }

        //bottom left
        var bottomleft = {x:node.x-1,y:node.y-1};
        if(bottomleft.x == this.endPoint.x && bottomleft.y == this.endPoint.y) return false;
        if(!GCollControl.ins.roads[bottomleft.x+"_"+bottomleft.y] && bottomleft.x > minX && bottomleft.y > minY)
        {
            this.addOpenList(bottomleft,node);
        }
        if(this.openList.length>0)
        {
            var node = this.openList[0];
            if(!this.closeMap[node.x+"_"+node.y])
            {
                this.addCloseList(node);

                this.openList.shift();
                this.openList.sort(function(a,b){
                    return a.f - b.f;
                });
            }
                
            // this.openMap[node.x+"_"+node.y] = 0;
        }
        if(this.openList.length>0)
         return true;

        return false;
    }

   

    addOpenList(node,parent){
        if(!this.openMap[node.x+"_"+node.y] && !this.closeMap[node.x+"_"+node.y])
        {
            this.openMap[node.x+"_"+node.y] = 1;
            if(node.x - parent.x != 0 && node.y - parent.y != 0)
                node.g = this.num * 14;// Math.sqrt((node.x-parent.x)*(node.x-parent.x) + (node.y-parent.y)*(node.y-parent.y));
            else
                node.g = this.num * 10;//Math.abs(node.x - this.startPoint.x) + Math.abs(node.y - this.startPoint.y);
            node.h = Math.abs(node.x - this.endPoint.x) *10+ Math.abs(node.y - this.endPoint.y)*10;
            node.f = node.g+node.h;
            node.parent = parent;

            if(this.openList.length>0)
            {
                if(node.f>this.openList[0].f)
                    this.openList.push(node);
                else
                this.openList.unshift(node);
            }
            else
            {
                this.openList.push(node);
            }
        }
    }

    addCloseList(node){
        this.closeMap[node.x+"_"+node.y] = 1;
        this.closeList.push(node);
    }
    
}


function getHeap() {
    return new BinaryHeap(function(node) {
      return node.f;
    });
  }

  function BinaryHeap(scoreFunction) {
    this.content = [];
    this.scoreFunction = scoreFunction;
  }

  BinaryHeap.prototype = {
    push: function(element) {
      // Add the new element to the end of the array.
      this.content.push(element);

      // Allow it to sink down.
      this.sinkDown(this.content.length - 1);
    },
    pop: function() {
      // Store the first element so we can return it later.
      var result = this.content[0];
      // Get the element at the end of the array.
      var end = this.content.pop();
      // If there are any elements left, put the end element at the
      // start, and let it bubble up.
      if (this.content.length > 0) {
        this.content[0] = end;
        this.bubbleUp(0);
      }
      return result;
    },
    remove: function(node) {
      var i = this.content.indexOf(node);

      // When it is found, the process seen in 'pop' is repeated
      // to fill up the hole.
      var end = this.content.pop();

      if (i !== this.content.length - 1) {
        this.content[i] = end;

        if (this.scoreFunction(end) < this.scoreFunction(node)) {
          this.sinkDown(i);
        } else {
          this.bubbleUp(i);
        }
      }
    },
    size: function() {
      return this.content.length;
    },
    rescoreElement: function(node) {
      this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
      // Fetch the element that has to be sunk.
      var element = this.content[n];

      // When at 0, an element can not sink any further.
      while (n > 0) {

        // Compute the parent element's index, and fetch it.
        var parentN = ((n + 1) >> 1) - 1;
        var parent = this.content[parentN];
        // Swap the elements if the parent is greater.
        if (this.scoreFunction(element) < this.scoreFunction(parent)) {
          this.content[parentN] = element;
          this.content[n] = parent;
          // Update 'n' to continue at the new position.
          n = parentN;
        }
        // Found a parent that is less, no need to sink any further.
        else {
          break;
        }
      }
    },
    bubbleUp: function(n) {
      // Look up the target element and its score.
      var length = this.content.length;
      var element = this.content[n];
      var elemScore = this.scoreFunction(element);

      while (true) {
        // Compute the indices of the child elements.
        var child2N = (n + 1) << 1;
        var child1N = child2N - 1;
        // This is used to store the new position of the element, if any.
        var swap = null;
        var child1Score;
        // If the first child exists (is inside the array)...
        if (child1N < length) {
          // Look it up and compute its score.
          var child1 = this.content[child1N];
          child1Score = this.scoreFunction(child1);

          // If the score is less than our element's, we need to swap.
          if (child1Score < elemScore) {
            swap = child1N;
          }
        }

        // Do the same checks for the other child.
        if (child2N < length) {
          var child2 = this.content[child2N];
          var child2Score = this.scoreFunction(child2);
          if (child2Score < (swap === null ? elemScore : child1Score)) {
            swap = child2N;
          }
        }

        // If the element needs to be moved, swap it, and continue.
        if (swap !== null) {
          this.content[n] = this.content[swap];
          this.content[swap] = element;
          n = swap;
        }
        // Otherwise, we are done.
        else {
          break;
        }
      }
    }
  };