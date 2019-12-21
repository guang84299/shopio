import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

import { config } from '../config';

@ccclass("Astar")
export class Astar extends Object {
    row = 31;
    col = 61;
    openList:any = [];
    closeList:any = [];
    pathList:any = [];
    startPoint: {x:number,y:number,f:0,g:0,h:0};
    endPoint: {x:0,y:0,f:0,g:0,h:0};

    openMap = {};
    closeMap = {};
    num = 0;
    initEndNum = 0;
    initStartNum = 0;
    currCollPos = null;
    startDir = [1,1,1,1];
    isFind = false;

    //{x:0,y:0,f:0,g:0,h:0}
    findPath (startPoint:any,endPoint,currCollPos) {
        this.row = config.astarmap.length;
        this.col =  config.astarmap[0].length;
        startPoint = config.converToNodePos(startPoint);
        endPoint = config.converToNodePos(endPoint);
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.currCollPos = currCollPos;

        this.startPoint.g = 0;
        this.startPoint.h = 0;
        this.startPoint.f = 0;
        // this.addOpenList(this.startPoint,this.startPoint);
        // this.openList = getHeap();
        this.initStartPoint();
        this.initEndPoint();
        this.addCloseList(this.startPoint);
        // this.openList.push(this.startPoint);
        // cc.log(this.startPoint,this.endPoint);
        var time = new Date().getTime();

        while(this.findNext() && this.num < 2000)
        {
            this.num ++;
        }
        // this.closeList.reverse();
        // cc.log("time1="+(new Date().getTime()-time),this.isFind);   
        
        if(this.isFind)
        {
          var node = this.closeList.pop();
          node = config.converToWorldPos(node);
          this.pathList.push(node);

          while(node.parent)
          {
              if(!config.astarmap[node.parent.y][node.parent.x])
                cc.log("---x---",node.parent,startPoint,this.startPoint);
              node.parent = config.converToWorldPos(node.parent);
              this.pathList.unshift(node.parent);
              node = node.parent;
          }    
        }
       
        endPoint = config.converToWorldPos(endPoint);
        this.pathList.push(endPoint);
        if(this.num>990)
          cc.log("--x----num="+this.num,(new Date().getTime()-time));   
        // cc.log("time2="+(new Date().getTime()-time));   
    }

    //获取开始点最近的可行走的点
    initStartPoint(){
      var end = {x:Math.round(this.startPoint.x),y:Math.round(this.startPoint.y)};
      var num = this.initStartNum++;
      if(!config.astarmap[end.y][end.x])
      {
          if(end.x-num > 0 && config.astarmap[end.y][end.x-num] && this.startDir[0])
          {
              this.startPoint.x -= num;
              return;
          }
          else this.startDir[0] = 0;
          if(end.x+num < this.col && config.astarmap[end.y][end.x+num] && this.startDir[1])
          {
              this.startPoint.x += num;
              return;
          }
          else this.startDir[1] = 0;
          if(end.y-num > 0 && config.astarmap[end.y-num][end.x] && this.startDir[2])
          {
              this.startPoint.y -= num;
              return;
          }
          else this.startDir[2] = 0;
          if(end.y+num < this.row && config.astarmap[end.y+num][end.x] && this.startDir[3])
          {
              this.startPoint.y += num;
              return;
          }
          else this.startDir[3] = 0;
      }
      
      this.initStartNum++;
      if(this.initStartNum<8) this.initStartPoint();
     
  }
    //获取终点最近的可行走的点
    initEndPoint(){
        var end = {x:this.endPoint.x,y:this.endPoint.y};
        if(config.astarmap[end.y][end.x]) return;
        var num = this.initEndNum + 1;
        if(end.x-num > 0 && config.astarmap[end.y][end.x-num])
        {
            this.endPoint.x -= num;
            return;
        }
        if(end.x+num < this.col && config.astarmap[end.y][end.x+num])
        {
            this.endPoint.x += num;
            return;
        }
        if(end.y-num > 0 && config.astarmap[end.y-num][end.x])
        {
            this.endPoint.y -= num;
            return;
        }
        if(end.y+num < this.row && config.astarmap[end.y+num][end.x])
        {
            this.endPoint.y += num;
            return;
        }
        this.initEndNum ++;
        if(this.initEndNum<8)
          this.initEndPoint();
    }

    findNext(){
        var node = this.closeList[this.closeList.length-1];
        //top
        var top = {x:node.x,y:node.y+1};
        if(top.x == this.endPoint.x && top.y == this.endPoint.y) 
        {
          this.isFind = true;
          return false;
        }
        if(top.y < this.row && config.astarmap[top.y][top.x])
        {
            this.addOpenList(top,node);
        }

        //bottom
        var bottom = {x:node.x,y:node.y-1};
        if(bottom.x == this.endPoint.x && bottom.y == this.endPoint.y) 
        {
          this.isFind = true;
          return false;
        }
        if(bottom.y > 0 && config.astarmap[bottom.y][bottom.x])
        {
            this.addOpenList(bottom,node);
        }

        //left
        var left = {x:node.x-1,y:node.y};
        if(left.x == this.endPoint.x && left.y == this.endPoint.y) 
        {
          this.isFind = true;
          return false;
        }
        if(left.x > 0 && config.astarmap[left.y][left.x])
        {
            this.addOpenList(left,node);
        }

         //right
         var right = {x:node.x+1,y:node.y};
         if(right.x == this.endPoint.x && right.y == this.endPoint.y) 
         {
          this.isFind = true;
          return false;
         }
         if( right.x < this.col && config.astarmap[right.y][right.x])
         {
             this.addOpenList(right,node);
         }

         //top right
         var topright = {x:node.x+1,y:node.y+1};
         if(topright.x == this.endPoint.x && topright.y == this.endPoint.y)
         {
          this.isFind = true;
          return false;
        }
         if(topright.x<this.col && topright.y<this.row && config.astarmap[topright.y][topright.x])
         {
             this.addOpenList(topright,node);
         }

         //bottom right
         var bottomright = {x:node.x+1,y:node.y-1};
         if(bottomright.x == this.endPoint.x && bottomright.y == this.endPoint.y)
         {
          this.isFind = true;
          return false;
        }
         if(bottomright.x<this.col && bottomright.y>0 && config.astarmap[bottomright.y][bottomright.x])
         {
             this.addOpenList(bottomright,node);
         }

        //top left
        var topleft = {x:node.x-1,y:node.y+1};
        if(topleft.x == this.endPoint.x && topleft.y == this.endPoint.y) 
        {
          this.isFind = true;
          return false;
        }
        if(topleft.x>0 && topleft.y < this.row && config.astarmap[topleft.y][topleft.x])
        {
            this.addOpenList(topleft,node);
        }

        //bottom left
        var bottomleft = {x:node.x-1,y:node.y-1};
        if(bottomleft.x == this.endPoint.x && bottomleft.y == this.endPoint.y) 
        {
          this.isFind = true;
          return false;
        }
        if(bottomleft.x > 0 && bottomleft.y > 0 && config.astarmap[bottomleft.y][bottomleft.x])
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
                this.sortOpenList();
                // this.openList.sort(function(a,b){
                //     return a.f - b.f;
                // });
            }
                
            // this.openMap[node.x+"_"+node.y] = 0;
        }
        if(this.openList.length>0)
         return true;

        return false;
    }

   sortOpenList(){
    if(this.openList.length>0)
    {
        var node = this.openList[0];
        var index = 0;
        for(var i=1;i<this.openList.length;i++)
        {
            if(this.openList[i].f< node.f)
            {
              index = i;
              node = this.openList[i];
            }
        }

        if(index != 0)
        {
            var node1 = this.openList[0];
            var node2 = this.openList[index];
            this.openList[index] = node1;
            this.openList[0] = node2;
        }
    }
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