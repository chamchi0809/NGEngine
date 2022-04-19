import { GameEngine } from '../Engine/GameEngine';
import {GameScene} from '../Engine/AGameScene';
import {GameObject} from'../Engine/GameObject';
import { Vector2,CollisionType } from '../Engine/Transformation';
import Renderer from 'Engine/Renderer';
import Camera from 'Engine/Camera';
import { Body, IEventCollision, IMouseEvent, IPair, MouseConstraint, Vector } from 'matter-js';
//@ts-ignore
import NinjaCube from 'Assets/1x/Player.png';
//@ts-ignore
import NinjaCubeBand from 'Assets/1x/PlayerBand.png';
//@ts-ignore
import Sword from 'Assets/Sword.png';
import { ObjectLink } from 'Engine/Link';




export default class SampleScene extends GameScene{  
  player:GameObject;
  sword:GameObject;
  swordLink:ObjectLink
  isMovingLeft:boolean;
  isMovingRight:boolean;

  constructor(){
    super();    
  }

  SpawnPlayer(){
    this.player = new GameObject(new Vector2(0,0), new Vector2(120,120));
    let playerImage = new Image(),
    playerBandImage = new Image();
    playerImage.src = NinjaCube;
    playerBandImage.src = NinjaCubeBand;
    this.player.AttatchImage(playerImage);
    this.player.AttatchRigidbody(false);
    this.player.AttacthDecoration({sprite:playerBandImage,
      position:new Vector2(-67.5,+39),
      size:new Vector2(15,24)
    });
    this.gameEngine.SpawnObject(this.player);
  }
  SpawnSword(){
    let swordImage = new Image();
    swordImage.src = Sword;
    this.sword = this.gameEngine.SpawnObject(
      new GameObject(new Vector2(80,80), new Vector2(332,78).Divide(3))
      .AttatchImage(swordImage)
      .AttatchRigidbody()
      );
  }

  Start(){    
    var layer1 = Body.nextGroup(true);
    this.SpawnPlayer();
    this.SpawnSword();
    this.player.rigidBody.collisionFilter.group = layer1;
    this.sword.rigidBody.collisionFilter.group = layer1;
    this.swordLink =  new ObjectLink(50, .0015);
    this.swordLink.pointA = this.player.position;    
    this.swordLink.bodyB = this.sword.rigidBody;
    this.swordLink.pointB = new Vector2(-40,0);
    

    Renderer.bgcolor = '#999999';
    this.gameEngine.SpawnObject(
      new GameObject(new Vector2(0,-320), new Vector2(1280,400),'green')
      .AttatchRigidbody(true)
    );
  }
  
  Update(deltaTime:number){
    if(this.isMovingLeft){
      this.player.velocity = new Vector2(-2, this.player.velocity.y);
    }
    if(this.isMovingRight){
      this.player.velocity = new Vector2(+2, this.player.velocity.y);
    }
    this.swordLink.pointA = this.player.position;
    this.player.rotation = 0;
  }

  OnMouseDown(event:MouseEvent){
    this.sword.AddForce(new Vector2(.3,0));
  }

  OnCollisionEnter(event: IPair): void {    
    
  }


  OnKeyDown(event: KeyboardEvent): void {
    if(event.code === 'KeyA'){
      this.isMovingLeft = true;
    }
    if(event.code === 'KeyD'){
      this.isMovingRight = true;
    }
    if(event.code === 'KeyW'){
      this.player.AddForce(new Vector2(0,.4));
    }
  }  

  OnKeyUp(event: KeyboardEvent): void {
    if(event.code === 'KeyA'){
      this.isMovingLeft = false;
    }
    if(event.code === 'KeyD'){
      this.isMovingRight = false;
    }
  }


  
  End(){

  }

}
