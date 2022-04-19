import Renderer from './Renderer';
import SampleScene from '../Game/SampleScene'
import {GameScene} from './AGameScene';
import { GameObject } from './GameObject';
import { Engine, Composite, Body,Events, IEventCollision, Mouse,MouseConstraint, IMouseConstraintDefinition, Bodies } from 'matter-js';
import Camera from './Camera';
import { DegToRad, RadToDeg } from './Transformation';

export class GameEngine{
  private gameScene: GameScene;  
  private interval: number;
  static gameObjects:Array<GameObject>;
  static physicsEngine:Engine;

  constructor(scene:GameScene){
    new Renderer();  
    new Camera();
    GameEngine.gameObjects = new Array();    

    GameEngine.physicsEngine=Engine.create();   
    GameEngine.physicsEngine.world.gravity.y=-1;
    this.InitScene(scene);
    this.Start();
  }

  Start(){
    this.gameScene.Start();
    this.Resume();
  }

  Update(){    
    Renderer.Clear();
    Renderer.context.fillStyle=Renderer.bgcolor;
    Renderer.context.fillRect(0,0,Renderer.width, Renderer.height);
    Renderer.context.save();
    this.AdjustCameraToRenderer();
    Engine.update(GameEngine.physicsEngine, 1000/60);
    this.gameScene.Update(60/1000);
    this.UpdateAndRenderObjects();
    Renderer.context.restore();
  }

  public Resume(){
    this.interval = window.setInterval(this.Update.bind(this), 1000/60);
  }

  public Pause(){
    clearInterval(this.interval);
  }

  private End(){
    GameEngine.DeleteObjectAll();
    this.Pause();
  }

  private InitScene(scene:GameScene):void{
    this.gameScene = scene;           
    document.addEventListener('mousedown',this.gameScene.OnMouseDown.bind(this.gameScene),false);
    document.addEventListener('mouseup',this.gameScene.OnMouseUp.bind(this.gameScene),false);
    document.addEventListener('mousemove',this.gameScene.OnMouseMove.bind(this.gameScene),false);
    document.addEventListener('keydown', this.gameScene.OnKeyDown.bind(this.gameScene), false)
    document.addEventListener('keyup', this.gameScene.OnKeyUp.bind(this.gameScene), false)
    Events.on(GameEngine.physicsEngine, 'collisionStart', (e:IEventCollision<Body>)=>{
      if(e){
        e.pairs.forEach(el=>{
          this.gameScene.OnCollisionEnter(el);
        })        
      }
    });
    Events.on(GameEngine.physicsEngine, 'collisionActive', (e:IEventCollision<Body>)=>{
      e.pairs.forEach(el=>{
        this.gameScene.OnCollisionStay(el);
      })
    });
    Events.on(GameEngine.physicsEngine, 'collisionEnd', (e:IEventCollision<Body>)=>{
      e.pairs.forEach(el=>{
        this.gameScene.OnCollisionExit(el);
      })
    });    
  }

  public MoveScene(scene:GameScene):void{
    this.End();
    this.InitScene(scene);
    this.Start();
  }

  private AdjustCameraToRenderer(){    
    Renderer.context.setTransform(1,0,0,1,0,0);
    Renderer.context.translate(-Camera.position.x/Camera.zoom,Camera.position.y/Camera.zoom);
    Renderer.context.scale(1/Camera.zoom, 1/Camera.zoom);
    Renderer.context.translate(Renderer.width/2*Camera.zoom,(Camera.zoom-2)*(Renderer.height/2));
    Renderer.context.translate(Camera.position.x,Renderer.height-Camera.position.y);
    Renderer.context.rotate(Camera.rotation*DegToRad);    
    Renderer.context.translate(-Camera.position.x,-Renderer.height+Camera.position.y);
  }

  private UpdateAndRenderObjects():void{    
    GameEngine.gameObjects.forEach((el,i)=>{     
      el.Update(60/1000);   
      el.Render(Renderer.context, Renderer.width, Renderer.height)});
  }

  static SortObjects():void{
    GameEngine.gameObjects.sort((a,b)=>{
      return a.sortingOrder - b.sortingOrder;
    })
    console.log([...GameEngine.gameObjects]);
  }
  static GetDefaultCollisionLayer(){
    return 0x0001;
  }
  static AddCollisionLayer(){
    return Body.nextCategory();
  }

  static SpawnObject(obj:GameObject):GameObject{            
    GameEngine.gameObjects.push(obj);
    this.SortObjects();
    return obj;
  }

  static DeleteObject(obj:GameObject):void{
    const idx = GameEngine.gameObjects.indexOf(obj);
    if(idx==-1){      
      return;
    }    
    if(obj.rigidBody)
      GameEngine.gameObjects[idx].RemoveRigidbody();
    GameEngine.gameObjects.splice(idx,1);
  }

  static DeleteObjectAll():void{
    Composite.clear(GameEngine.physicsEngine.world,false);
    GameEngine.gameObjects.splice(0,GameEngine.gameObjects.length);
  }

}




