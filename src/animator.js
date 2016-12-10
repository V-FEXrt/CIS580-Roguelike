"use strict";

const sheetColumns = 10;
const defaultFrameTime = 150;
const delayTime = 1000;
module.exports = exports = Animator;

/**
 * @constructor Animator
 * Creates a new animator object
 * @param {start} desired sprites start Y index on the spritesheet
 * @param {state} the state of the entity to animate
 * @param {entityClass} the kind of entity being animated
 */
function Animator(start, state, entityClass) {
  this.start = start*sheetColumns;
  this.frame = this.start;
  this.state = state;
  this.entity = entityClass;
  this.direction = "right";
  this.timer = 0;
  this.index = {x: this.frame%sheetColumns, y: Math.floor(this.frame/sheetColumns)};
}

Animator.prototype.update = function(time){
  this.timer += time;

  if(this.state == "idle")
  {
    if(this.timer >= defaultFrameTime)
    {    
      this.timer = 0;
      if(this.direction == "right")
      {
        this.frame++;
        if(this.frame > this.start+2) this.frame -= 3;
      }
      else if(this.direction == "left")
      {
        this.frame++;
        if(this.frame > this.start+5) this.frame -= 3;
      }
      else
      {
        this.frame++;
        if(this.frame > this.start+8) this.frame -=3;
      }
    }
  }
  else if(this.state == "attacking")
  {
    if(this.timer >= defaultFrameTime)
    {    
      this.timer = 0;
      if(this.direction == "right")
      {
        this.frame++;
        if(this.frame > this.start+sheetColumns+2) this.updateState("idle");
      }
      else if(this.direction == "left")
      {
        this.frame++;
        if(this.frame > this.start+sheetColumns+5) this.updateState("idle");
      }
    }
  }
  else if(this.state == "dying")
  {
    if(this.entity == "Knight")
    {
      if(this.frame < this.start + sheetColumns*2+4)
      {
        if(this.timer >= defaultFrameTime)
        {
          this.timer = 0;
          this.frame++;
        }
      }
      else if(this.frame == this.start+sheetColumns*2+4)
      {
        if(this.timer >= defaultFrameTime + delayTime)
        {
          this.timer = 0;
          this.frame++;
        }
      }
      else 
      {
        if(this.timer >= defaultFrameTime/2)
        {
          this.frame++;
          if(this.frame > this.start+sheetColumns*2+7)
          {
             if(this.timer >= delayTime + 1000) this.updateState("dead");
             this.frame--;
          }     
          else this.timer = 0;
        }
      } 
    }
    else if(this.entity == "Archer" || this.entity == "Mage")
    {
      if(this.timer >= defaultFrameTime)
      {
        this.frame++;
        if(this.frame > this.start+sheetColumns*2+3)
        {
          if(this.timer >= delayTime + 1000) this.updateState("dead");
          this.frame--;
        }     
        else this.timer = 0;
      }
    }
  }
  else if(this.state == "dead")
  {
    
  }
  this.index = {x: this.frame%sheetColumns, y: Math.floor(this.frame/sheetColumns)};
}

Animator.prototype.updateState = function(state)
{
  this.state = state;
  if(this.state == "idle")
  {
    this.frame = this.start;
    if(this.direction == "left") this.frame+=3;
  }
  else if(this.state == "attacking")
  {
    this.frame = this.start+sheetColumns;
    if(this.direction == "left") this.frame+=3;
  }
  else if(this.state == "dying")
  {
    this.frame = this.start+sheetColumns*2;
    //create left facing death anim if(this.direction == "left")
  }
  else if(this.state == "dead")
  {
    this.frame = this.start+sheetColumns*2+7;
  }
  else if(this.state == "nothing")
  {
    
  }
}

Animator.prototype.changeDirection = function(direction)
{
  var changed = false;
  if(this.direction != direction) changed = true;
  

  if(changed)
  {
    if(this.state == "idle")
    {
      if(this.direction == "right")
      {
        if(direction == "left") this.frame += 3;
        else this.frame += 6;
      }
      else if(this.direction == "left")
      {
        if(direction == "right") this.frame -= 3;
        else this.frame += 3;
      }
      else if(this.direction == "up")
      {
        if(direction == "right") this.frame -= 6;
        else this.frame -= 3;
      }
    }
    if(this.state == "attacking")
    {
      if(this.direction == "right")
      {
        this.frame += 3;
      }
      else if(this.direction == "left")
      {
        this.frame -= 3;
      }
    }
    this.direction = direction;
    this.index = {x: this.frame%sheetColumns, y: Math.floor(this.frame/sheetColumns)};
  }
}
