class Vector2{
  public x:number;
  public y:number;

  static get up():Vector2 {return new Vector2(0,1);}
  static get down():Vector2 {return new Vector2(0,-1);}
  static get left():Vector2{return new Vector2(-1,0);}
  static get right():Vector2{
    return new Vector2(1,0);  
  }
  static get zero():Vector2{
    return new Vector2(0,0)
  }

  constructor(x:number, y:number){
    this.x = x;
    this.y = y;
  }

  public Add(p:Vector2):Vector2{
    return new Vector2(this.x+p.x, this.y+p.y);
  }

  public Subtract(p:Vector2):Vector2{
    return new Vector2(this.x-p.x, this.y-p.y);
  }

  public Multiply(n:number):Vector2{
    return new Vector2(this.x*n, this.y*n);
  }

  public Divide(n:number):Vector2{
    return new Vector2(this.x/n, this.y/n);
  }

  public Magnitude():number{
    return Math.sqrt(this.x*this.x + this.y*this.y);
  }

  public Normalize():Vector2{
    const val = this.Divide(this.Magnitude());    
    return Number.isNaN(val.x)?Vector2.zero:val;
  }

  public Dot(p:Vector2):number{
    const ary1 = [this.x, this.y];
    const ary2 = [this.x, this.y];
    var dotprod = 0;
    for (var i = 0; i < ary1.length; i++)
        dotprod += ary1[i] * ary2[i];
    return dotprod;
  }

  static Lerp(p1:Vector2, p2:Vector2, ratio:number){
    return p1.Add(p2.Subtract(p1).Multiply(ratio));
  }

  static Clone(p:Vector2){
    return new Vector2(p.x, p.y);
  }

  public Equals(p:Vector2){
    return this.x==p.x&&this.y==p.y;
  }
}

enum CollisionType{
  Rect,
  Circle,
}

function LerpNumber(a:number, b:number, ratio:number){
  return a+(b-a)*ratio;
}
function LerpAngle(from:number, to:number, cw:boolean, progress:number)
{
    if(cw)
    {
        // Clockwise
        if(from < to)
            to -= 360;
    }
    else
    {
        // Counter-clockwise
        if(from > to)
            to += 360;
    }
    return from + (to-from)*progress;
}

const DegToRad = Math.PI/180;
const RadToDeg = 180/Math.PI;

export{CollisionType, Vector2,LerpNumber, LerpAngle,DegToRad, RadToDeg};