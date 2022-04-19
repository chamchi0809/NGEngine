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
import EnemyIdle from 'Assets/EnemyIdle.png';
//@ts-ignore
import EnemyHit from 'Assets/EnemyHit.png';
//@ts-ignore
import Sword from 'Assets/Sword.png';
//@ts-ignore
import SwordSfx from 'Assets/Audio/sword sound.wav'
//@ts-ignore
import DashSfx1 from 'Assets/Audio/Whoosh 6_1.wav'
//@ts-ignore 
import Base from 'Assets/Base.png'
//@ts-ignore 
import Ground from 'Assets/Ground.png'
//@ts-ignore 
import Spawner from 'Assets/Spawner.png'
import { ObjectLink } from 'Engine/Link';


interface IEnemy{
  obj:GameObject,
  hp:number
}

export default class SampleScene extends GameScene{  
  //#region object
  player:GameObject;
  sword:GameObject;
  swordLink:ObjectLink
  lowerGroundGfx:GameObject;
  lowerGroundCol:GameObject;
  upperGroundGfx:GameObject;
  upperGroundCol:GameObject;
  lowerBase:GameObject;
  upperBase:GameObject;
  lowerSpawner:GameObject;
  upperSpawner:GameObject;
  //#endregion
  //#region enemy
  upperEnemies:Array<IEnemy> = new Array<IEnemy>();
  lowerEnemies:Array<IEnemy> = new Array<IEnemy>();
  enemyHP:number;
  //#endregion
  //image
  playerBandImage:HTMLImageElement;
  playerImage:HTMLImageElement;  
  swordImage:HTMLImageElement;
  enemyIdleImage:HTMLImageElement;
  enemyHitImage:HTMLImageElement;
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
  playerUpLayer:number;
  playerDownLayer:number;
  swordLayer:number;
  enemyLayer:number;

  //audio
  sfxVolume:number=0.3;

  constructor(){
    super();    
  }

  SetLayers(){
    this.groundLayer=GameEngine.AddCollisionLayer();
    this.playerUpLayer=GameEngine.AddCollisionLayer();
    this.playerDownLayer=GameEngine.AddCollisionLayer();
    this.swordLayer=GameEngine.AddCollisionLayer();
    this.enemyLayer = GameEngine.AddCollisionLayer();
  }
  SetImages(){
    this.enemyIdleImage = new Image();
    this.enemyIdleImage.src = EnemyIdle;
    this.enemyHitImage = new Image();
    this.enemyHitImage.src = EnemyHit;
  }
  StartDash(){
    if(!this.isDashing&&!this.inDashCooldown){
      this.isDashing=true;
      this.dashDir=this.moveInput.Normalize();
      if(this.dashDir.Equals(Vector2.zero)){              
        if(this.player.flipX) this.dashDir=Vector2.left;
        else this.dashDir=Vector2.right;
      }
      var dashAudio = new Audio(DashSfx1);
      dashAudio.volume=this.sfxVolume;
      dashAudio.play();
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
      var swordAudio = new Audio(SwordSfx);      
      swordAudio.volume=this.sfxVolume;
      swordAudio.play();
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
    this.player.AttatchRigidbody(false,false,this.playerUpLayer,~this.swordLayer);
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
  SpawnEnvironment(){
    let groundImage = new Image();
    groundImage.src = Ground;
    let baseImage = new Image();
    baseImage.src = Base;
    let spawnerImage = new Image();
    spawnerImage.src = Spawner;
    
    //#region lower part
    this.lowerGroundGfx = GameEngine.SpawnObject(
      new GameObject(new Vector2(0,-240), new Vector2(1280,128))
      .AttatchImage(groundImage)      
    );
    this.lowerGroundGfx.sortingOrder=-3;
    this.lowerGroundCol = GameEngine.SpawnObject(
      new GameObject(new Vector2(0,-260), new Vector2(1280,25))
      .AttatchRigidbody(true, false, this.groundLayer)
    );
    this.lowerGroundCol.sortingOrder=-4;
    this.lowerBase = GameEngine.SpawnObject(
      new GameObject(new Vector2(-720+240,-240), new Vector2(96*3,96))
      .AttatchImage(baseImage)  
      .AttatchRigidbody(true, true)
    );
    this.lowerBase.sortingOrder=-1;
    this.lowerSpawner = GameEngine.SpawnObject(
      new GameObject(new Vector2(720-180,-180), new Vector2(220,220))
      .AttatchImage(spawnerImage)  
      .AttatchRigidbody(true, true)
    );
    this.lowerSpawner.sortingOrder=3;
    //#endregion

    //#region upper part
    this.upperGroundGfx = GameEngine.SpawnObject(
      new GameObject(new Vector2(0,240-120-30), new Vector2(1280,128))
      .AttatchImage(groundImage)      
    );
    this.upperGroundGfx.sortingOrder=-3;
    this.upperGroundGfx.flipX=true;
    this.upperGroundCol = GameEngine.SpawnObject(
      new GameObject(new Vector2(0,260-170-20), new Vector2(1280,5))
      .AttatchRigidbody(true, false, this.groundLayer, ~this.playerUpLayer)
    );
    this.upperGroundCol.sortingOrder=-4;
    this.upperBase = GameEngine.SpawnObject(
      new GameObject(new Vector2(720-240,240-120-30), new Vector2(96*3,96))
      .AttatchImage(baseImage)  
      .AttatchRigidbody(true, true)
    );
    this.upperBase.sortingOrder=-1;
    this.upperSpawner = GameEngine.SpawnObject(
      new GameObject(new Vector2(-720+180,180-30), new Vector2(220,220))
      .AttatchImage(spawnerImage)
      .AttatchRigidbody(true, true)
    );
    this.upperSpawner.sortingOrder=3;
    this.upperSpawner.flipX=true;
    //#endregion
  }
  SpawnEnemy(spawnPoint:Vector2, flipped:boolean){
    let enemy = GameEngine.SpawnObject(
      new GameObject(spawnPoint, new Vector2(172/2,110/2))
      .AttatchRigidbody(false, false, this.enemyLayer, 
        ~this.playerUpLayer&
        ~this.playerDownLayer&
        ~this.enemyLayer)
      .AttatchImage(this.enemyIdleImage)
      );
    if(flipped){
      enemy.flipX = true;
      this.upperEnemies.push({obj:enemy,hp:this.enemyHP});
    }else{
      this.lowerEnemies.push({obj:enemy,hp:this.enemyHP});
    }
    let repeat = ()=>this.SpawnEnemy(spawnPoint,flipped);
    setTimeout(repeat.bind(this), 2000);
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
    this.SetImages();  
    this.SetLayers();
    this.SpawnPlayer();
    this.SpawnSword();
    this.SpawnEnvironment();    
    GameEngine.SortObjects();
    
    this.swordLink =  new ObjectLink(30, .05);
    this.swordLink.pointA = this.player.position;    
    this.swordLink.bodyB = this.sword.rigidBody;
    this.swordLink.pointB = new Vector2(-40*5/6,0);
    this.SpawnEnemy(this.upperSpawner.position, true)
    

    Renderer.bgcolor = '#333333';
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
    
    if(this.isDashing||this.player.velocity.y > 0){
      this.player.collisionLayer = this.playerUpLayer;
    }else{
      this.player.collisionLayer = this.playerDownLayer;
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
