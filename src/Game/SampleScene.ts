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
    
  }

  Start(){    
    this.SpawnPlayer();

    Renderer.bgcolor = '#999999';
    let ground = new GameObject(new Vector2(0,-320),new Vector2(1280,400),'green');
    ground.AttatchRigidbody(true);
    this.gameEngine.SpawnObject(ground);
  }
  
  Update(deltaTime:number){
    
  }

  OnCollisionEnter(event: IPair): void {    
    
  }


  OnKeyDown(event: KeyboardEvent): void {
    
  }  

  OnKeyUp(event: KeyboardEvent): void {

  }


  
  End(){

  }

}
