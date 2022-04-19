import { Body, Constraint, Vector, Composite } from 'matter-js';
import { GameObject } from './GameObject';
import { Vector2 } from './Transformation';
import { GameEngine } from './GameEngine';

export class ObjectLink{  
  public link:Constraint;
  get length(){
    return this.link.length;
  }
  set length(value:number){
    this.link.length = value;
  }
  get elasticity(){
    return this.link.stiffness;
  }
  set elasticity(value:number){
    this.link.stiffness = value;
  }
  get bodyA():Body{
    return this.link.bodyA;
  }
  set bodyA(value:Body){
    this.link.bodyA = value;
  }
  get bodyB():Body{
    return this.link.bodyB;
  }
  set bodyB(value:Body){
    this.link.bodyB = value;
  }
  get pointA():Vector2{
    return new Vector2(this.pointA.x, this.pointA.y);
  }
  set pointA(value){
    this.link.pointA = Vector.create(value.x, value.y);
  }
  get pointB():Vector2{
    return new Vector2(this.pointB.x, this.pointB.y);
  }
  set pointB(value){
    this.link.pointB = Vector.create(value.x, value.y);
  }

  constructor(length:number, elasticity:number)
  {    
    this.link = Constraint.create({length:length,stiffness:elasticity,pointA:{x:0,y:0},bodyB:new GameObject(new Vector2(0,0), new Vector2(0,0)).AttatchRigidbody(true).rigidBody});    
    Composite.add(GameEngine.physicsEngine.world,this.link);
    this.link.pointA = Vector.create(0,0);        
  }
}