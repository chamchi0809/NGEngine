import { IEventCollision,Body, IPair, IMouseEvent, MouseConstraint } from 'matter-js';
import { GameEngine } from './GameEngine';
import Renderer from './Renderer';

export abstract class GameScene{
    
    

  constructor(){
    
  }
  abstract Start(): void;
  abstract Update(deltaTime:number): void;
  abstract End(): void;
  OnKeyDown(event:KeyboardEvent):void{

  }
  OnKeyUp(event:KeyboardEvent):void{

  }
  OnMouseDown(event:MouseEvent):void{

  }
  OnMouseUp(event:MouseEvent):void{
    
  }
  OnMouseMove(event:MouseEvent):void{
    
  }    
  OnCollisionEnter(event:IPair):void{

  }
  OnCollisionStay(event:IPair):void{

  }
  OnCollisionExit(event:IPair):void{

  }
}