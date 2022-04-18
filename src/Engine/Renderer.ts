import Camera from './Camera';

export default class Renderer{
  static canvas: HTMLCanvasElement;
  static context:CanvasRenderingContext2D;   
  static bgcolor:string;
  static width:number;
  static height:number;
  
  constructor(){
    Renderer.canvas = document.querySelector('#canvas');
    Renderer.context = Renderer.canvas.getContext('2d');        
    Renderer.width = Renderer.canvas.width;
    Renderer.height = Renderer.canvas.height;
  }
  
  static Clear(){    
    Renderer.context.clearRect(0,0,Renderer.canvas.width, Renderer.canvas.height);
  }
}