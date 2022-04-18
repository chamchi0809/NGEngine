import { Vector2, CollisionType,RadToDeg,DegToRad } from './Transformation';
import { Body,Bodies,Composite,Vector, Composites } from 'matter-js';
import { GameEngine } from './GameEngine';

export enum ObjectType{
  Sprite,
  Shape,
  Text,
}

interface ObjectDecoration{
  sprite:CanvasImageSource;
  position:Vector2;
  size:Vector2;
}

export class GameObject{
  
  private _position:Vector2;
  public get position():Vector2{
    if(typeof this.rigidBody!=='undefined'){
      return new Vector2(this.rigidBody.position.x,this.rigidBody.position.y);
    }
    return this._position;
  }
  public set position(value:Vector2){
    if(typeof this.rigidBody!=='undefined'){
      Body.setPosition(this.rigidBody, Vector.create(value.x, value.y));
    }
    this._position = value;
  }
  private _rotation:number=0;
  public get rotation():number{
    if(typeof this.rigidBody!=='undefined'){
      return this.rigidBody.angle * RadToDeg;
    }
    return this._rotation;
  }
  public set rotation(value:number){
    if(typeof this.rigidBody!=='undefined'){
      Body.setAngle(this.rigidBody, value*DegToRad);
    }
    this._rotation = value;
  }  
  public get velocity():Vector2{
    if(this.CheckRigidbody()){
      return new Vector2(this.rigidBody.velocity.x, this.rigidBody.velocity.y);
    }
    return Vector2.zero;
  }
  public set velocity(v:Vector2){
    if(this.CheckRigidbody()){
      Body.setVelocity(this.rigidBody, Vector.create(v.x,v.y));
    }    
  }  
  public get angularVelocity():number{
    if(this.CheckRigidbody()){
      return this.rigidBody.angularVelocity;
    }
    return 0;
  }
  public set angularVelocity(value:number){
    if(this.CheckRigidbody()){
      Body.setAngularVelocity(this.rigidBody, value*DegToRad);
    }
  }
  public get isStatic(){
    if(this.CheckRigidbody()){
      return this.rigidBody.isStatic;
    }
    return true;
  }
  public set isStatic(value:boolean){
    if(this.CheckRigidbody()){
      Body.setStatic(this.rigidBody,value);
    }
  }  
  public get isTrigger(){
    if(this.CheckRigidbody()){
      return this.rigidBody.isSensor;
    }

    return false;
  }
  public set isTrigger(value:boolean){
    if(this.CheckRigidbody()){
      this.rigidBody.isSensor = value;
    }
  }
  public get id():number{
    if(this.rigidBody){
      return this.rigidBody.id;
    }
    return Infinity;
  }
  public size:Vector2;
  public sprite:CanvasImageSource;
  public text:string='';
  public decorations:Array<ObjectDecoration>=new Array<ObjectDecoration>(0);
  public color:string;  
  public font:string='20px serif';
  public textBaseline:CanvasTextBaseline='middle';
  public textAlign:CanvasTextAlign='center';
  public sortingOrder:number=0;
  public rigidBody:Body;  

  constructor(position:Vector2, size:Vector2, color:string='white'){
    this._position = position;
    this.size = size;    
    this.color=color;    
  }

  public AttatchImage(sprite:CanvasImageSource|HTMLElement|Element|HTMLImageElement){
    this.sprite = sprite as CanvasImageSource;
  }

  public AttatchText(text:string, font?:string, textBaseline?:CanvasTextBaseline, textAlign?:CanvasTextAlign){
    this.text = text;
    this.font = font;
    this.textBaseline=textBaseline;
    this.textAlign = textAlign;
  }

  public AttacthDecoration(decoration:ObjectDecoration){
    this.decorations.push(decoration);
  }

  public CheckRigidbody():boolean{
    return typeof this.rigidBody !== 'undefined';
  }

  public AttatchRigidbody(isStatic=false){        
    this.rigidBody = Bodies.rectangle(this._position.x, this._position.y, this.size.x, this.size.y,{isStatic:isStatic});
    Composite.add(GameEngine.physicsEngine.world, this.rigidBody);    
  }
  public RemoveRigidbody(){
    Composite.remove(GameEngine.physicsEngine.world,this.rigidBody);
  }

  public AddForce(f:Vector2){
    
    this.rigidBody.force = Vector.create(f.x,f.y);
  }

  public AddForceAtPosition(p:Vector2, f:Vector2){
    Body.applyForce(this.rigidBody, Vector.create(p.x,p.y), Vector.create(f.x,f.y));
  }

  public AddTorque(angle:number){
    this.rigidBody.torque = angle*DegToRad;
  }

  public UpdatePhysics(){
    
    if(typeof this.rigidBody !=='undefined'){
      var pos = this.rigidBody.position;
      this._position.x = pos.x;
      this._position.y = pos.y;
      this._rotation = this.rigidBody.angle*RadToDeg;
    }
  }

  public Render(context:CanvasRenderingContext2D, screenWidth:number, screenHeight:number):void{    
    context.save();
    context.translate(this._position.x, screenHeight-this._position.y);
    context.rotate(-(Math.PI/180)*this.rotation);
    context.translate(-this._position.x, -screenHeight+this._position.y);
    context.fillStyle=this.color;      
    if(this.sprite){
      context.drawImage(this.sprite, this._position.x-this.size.x/2, 
      screenHeight-this._position.y-this.size.y/2, 
      this.size.x, this.size.y);
    }else if(this.text!==''){
      context.font = this.font;            
      context.textBaseline = this.textBaseline;
      context.textAlign = this.textAlign;
      const textMetrics = context.measureText(this.text);
      const textHeight = textMetrics.actualBoundingBoxAscent-textMetrics.actualBoundingBoxDescent;      
      context.fillText(this.text, this._position.x-textMetrics.width/2, screenHeight-this._position.y+textHeight/2,this.size.x);
    }
    else{
      context.fillRect(this._position.x-this.size.x/2, screenHeight-this._position.y-this.size.y/2, this.size.x, this.size.y);    
    }

    this.decorations.forEach((el)=>{
      const posX = el.position.x;
      const posY = el.position.y;
      const width = el.size.x;
      const height = el.size.y;
      context.drawImage(el.sprite, this._position.x + posX - width/2,
      screenHeight-this._position.y - posY - height/2,
      width,height
      );
      
    })

    context.restore();    
  }

  public CollideWith(other:GameObject, colType:CollisionType):boolean{
    switch(colType){
      case CollisionType.Circle:
        return this.CircleCollision(other);
        break;
      case CollisionType.Rect:
        return this.AABBCollision(other);
        break;     
    }
    return this.AABBCollision(other);      
  }

  private AABBCollision(other:GameObject):boolean{
    const myleft = this._position.x;
    const myright = this._position.x + this.size.x;
    const mytop = this._position.y;
    const mybottom = this._position.y + this.size.y;
    const otherleft = other._position.x;
    const otherright = other._position.x + other.size.x;
    const othertop = other._position.y;
    const otherbottom = other._position.y + other.size.y;    
    if (
      mybottom < othertop ||
      mytop > otherbottom ||
      myright < otherleft ||
      myleft > otherright
    ) {
      return false;
    }
    return true;
  }

  private CircleCollision(other:GameObject):boolean{
    const dst = this._position.Subtract(other._position).Magnitude();
    return dst < this.size.x/2 + other.size.x/2;

  }
}