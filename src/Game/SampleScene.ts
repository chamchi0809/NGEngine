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
  //objects
  player:GameObject;
  playerImage:HTMLImageElement;
  playerBandImage:HTMLImageElement;
  sword:GameObject;
  swordImage:HTMLImageElement;
  swordLink:ObjectLink
  //#region input
  moveInput:Vector2;
  isMovingLeft:boolean;
  isMovingRight:boolean;
  isMovingUp:boolean;
  isMovingDown:boolean;
  //#endregion
  //#region dash
  isDashing:boolean;
  inDashCooldown:boolean;
  dashSpeed:number=20;
  dashDuration:number=200;
  dashCooldown:number=100;
  dashDir:Vector2=new Vector2(0,0);
  //#endregion
  //#region attack
  isAttacking:boolean;
  inAttackCooldown:boolean;
  wieldForce:number=.4;
  attackDuration:number=200;
  attackCooldown:number=100;
  attackDir:Vector2=new Vector2(0,0);
  //#endregion
  //#region moving
  moveSpeed:number=7;
  //#endregion
  //layers
  defLayer:number=1;
  groundLayer:number;
  playerLayer:number;
  swordLayer:number;


  constructor(){
    super();    
  }
  SetLayers(){
    this.groundLayer=GameEngine.AddCollisionLayer();
    this.playerLayer=GameEngine.AddCollisionLayer();
    this.swordLayer=GameEngine.AddCollisionLayer();
  }
  StartDash(){
    if(!this.isDashing&&!this.inDashCooldown){
      this.isDashing=true;
      this.dashDir=this.moveInput.Normalize();
      if(this.dashDir.Equals(Vector2.zero)){              
        if(this.player.flipX) this.dashDir=Vector2.left;
        else this.dashDir=Vector2.right;
      }
      
      setTimeout(this.EndDash.bind(this),this.dashDuration);
    }
  }
  EndDash(){
    this.isDashing = false;
    this.inDashCooldown=true;
    this.player.velocity=Vector2.zero;
    setTimeout(()=>this.inDashCooldown=false,this.dashCooldown)
  }
  StartAttack(){
    if(!this.isAttacking&&!this.inAttackCooldown){
      this.isAttacking=true;      
      if(this.player.flipX) this.attackDir=Vector2.left;
      else this.attackDir=Vector2.right;      
      
      setTimeout(this.EndAttack.bind(this),this.attackDuration);
    }
  }
  EndAttack(){
    this.isAttacking = false;
    this.inAttackCooldown=true;    
    setTimeout(()=>this.inAttackCooldown=false,this.attackCooldown)
  }
  SpawnPlayer(){
    this.player = new GameObject(new Vector2(0,0), new Vector2(120*5/6,120*5/6));
    this.playerImage = new Image(),
    this.playerBandImage = new Image();
    this.playerImage.src = NinjaCube;
    this.playerBandImage.src = NinjaCubeBand;
    this.player.AttatchImage(this.playerImage);
    this.player.AttatchRigidbody(false,false,this.playerLayer,~this.swordLayer);
    this.player.AttacthDecoration({sprite:this.playerBandImage,
      position:new Vector2(-67.5*5/6,+39*5/6),
      size:new Vector2(15*5/6,24*5/6)
    });    
    GameEngine.SpawnObject(this.player);
    
  }
  SpawnSword(){
    this.swordImage = new Image();
    this.swordImage.src = Sword;
    this.sword = GameEngine.SpawnObject(
      new GameObject(new Vector2(80*5/6,80*5/6), new Vector2(332*5/6,78*5/6).Divide(3))
      .AttatchImage(this.swordImage)
      .AttatchRigidbody(false,false,this.swordLayer,~this.groundLayer) 
      );

    this.sword.sortingOrder=1;
  }
  HandlePlayerMovement(){
    this.moveInput = Vector2.zero;
    if(this.isMovingLeft){
      this.moveInput.x-=1;
      this.player.flipX=true;
    }
    if(this.isMovingRight){
      this.moveInput.x+=1;
      this.player.flipX=false;
    }
    if(this.isMovingUp){
      this.moveInput.y+=1;
    }
    if(this.isMovingDown){
      this.moveInput.y-=1;
    }
    if(!this.moveInput.Equals(Vector2.zero)&&!this.isDashing){
      this.player.velocity = new Vector2(this.moveInput.x*this.moveSpeed, this.player.velocity.y);
    }
  }

  Start(){    
    
    this.SetLayers();
    this.SpawnPlayer();
    this.SpawnSword();
    GameEngine.SpawnObject(
      new GameObject(new Vector2(0,-320), new Vector2(1280,400),'green')
      .AttatchRigidbody(true,false,this.groundLayer)      
    ).sortingOrder=-3;
    GameEngine.SortObjects();
    
    this.swordLink =  new ObjectLink(30, .05);
    this.swordLink.pointA = this.player.position;    
    this.swordLink.bodyB = this.sword.rigidBody;
    this.swordLink.pointB = new Vector2(-40*5/6,0);
    

    Renderer.bgcolor = '#999999';
  }

  UpdateTrail(trail:GameObject,deltaTime:number){
    trail.alpha-=deltaTime;
    if(trail.alpha>0){
      var repeat = ()=>this.UpdateTrail(trail,deltaTime);
      setTimeout(repeat.bind(this),.1);
    }else{
      GameEngine.DeleteObject(trail);
    }

  }
  
  Update(deltaTime:number){
    this.HandlePlayerMovement();
    this.swordLink.pointA = this.player.position;
    if(this.isDashing){
      this.player.velocity = this.dashDir.Multiply(this.dashSpeed);
      let dashTrail = GameEngine.SpawnObject(
        new GameObject(Vector2.Clone(this.player.position), this.player.size)
        .AttatchImage(this.playerImage)
        .AttacthDecoration({sprite:this.playerBandImage,
          position:new Vector2(-67.5*5/6,+39*5/6),
          size:new Vector2(15*5/6,24*5/6)
        }          
        )
      );
      dashTrail.flipX=this.player.flipX;
      dashTrail.sortingOrder = this.player.sortingOrder;
      GameEngine.SortObjects();
      this.UpdateTrail(dashTrail,deltaTime/2);
    }
    if(this.isAttacking){
      this.sword.AddForce(this.attackDir.Multiply(this.wieldForce));
      let swordTrail = GameEngine.SpawnObject(
        new GameObject(Vector2.Clone(this.sword.position),
        this.sword.size)
        .AttatchImage(this.swordImage)        
      );
      swordTrail.sortingOrder=this.sword.sortingOrder;
      swordTrail.rotation=this.sword.rotation;
      this.UpdateTrail(swordTrail,deltaTime/2);
    }
    

    this.player.rotation = 0;
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
      this.isMovingUp = true;
    }
    if(event.code === 'KeyS'){
      this.isMovingDown = true;
    }
    if(event.code === 'Space'){
      this.StartDash();
    }
    if(event.code==='KeyJ'){
      this.StartAttack();
    }
  }  

  OnKeyUp(event: KeyboardEvent): void {
    if(event.code === 'KeyA'){
      this.isMovingLeft = false;
    }
    if(event.code === 'KeyD'){
      this.isMovingRight = false;
    }
    if(event.code === 'KeyW'){
      this.isMovingUp = false;
    }
    if(event.code === 'KeyS'){
      this.isMovingDown = false;
    }
  }


  
  End(){

  }

}
