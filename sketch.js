let player, ground = [], enemies = [], coins = [];
let gravity = 0.8, score = 0;

function setup() {
  createCanvas(800, 400);
  player = new Rialo(100, 300);
  for (let i = 0; i < 10; i++) ground.push(new Block(i*80, 350, 80, 50));
  enemies.push(new Goomba(400, 310));
  coins.push(new Coin(250, 280));
}

function draw() {
  background(15);
  fill(255);
  textSize(20);
  text(`Score: ${score}`, 20, 30);

  for (let b of ground) b.show();
  for (let e of enemies) e.update(), e.show();
  for (let c of coins) c.update(), c.show();

  player.update();
  player.show();

  // Collision with ground
  for (let b of ground)
    if (player.hits(b)) player.land(b);

  // Enemy collision
  for (let e of enemies)
    if (player.hits(e)) {
      if (player.vy > 0) { e.dead = true; player.vy = -10; }
      else resetGame();
    }

  // Coin collision
  for (let c of coins)
    if (!c.collected && player.hits(c)) {
      c.collected = true;
      score++;
    }

  coins = coins.filter(c => !c.collected);
  enemies = enemies.filter(e => !e.dead);
}

function keyPressed() {
  if (keyCode === UP_ARROW && player.onGround) player.vy = -15;
  if (keyCode === LEFT_ARROW) player.vx = -5;
  if (keyCode === RIGHT_ARROW) player.vx = 5;
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) player.vx = 0;
}

function resetGame() {
  score = 0;
  player.x = 100;
  player.y = 300;
  enemies = [new Goomba(400, 310)];
  coins = [new Coin(250, 280)];
}

// Classes
class Rialo {
  constructor(x, y){ this.x=x; this.y=y; this.w=30; this.h=40; this.vx=0; this.vy=0; this.onGround=false; }
  update(){
    this.vy += gravity;
    this.y += this.vy;
    this.x += this.vx;
    this.onGround = false;
    if (this.y > 310){ this.y = 310; this.vy = 0; this.onGround = true; }
  }
  show(){
    fill('#f5c76d'); // warna krem seperti logo Rialo
    rect(this.x, this.y, this.w, this.h, 5);
    fill(0);
    text('R', this.x+8, this.y+25);
  }
  hits(obj){
    return (this.x < obj.x + obj.w &&
            this.x + this.w > obj.x &&
            this.y < obj.y + obj.h &&
            this.y + this.h > obj.y);
  }
  land(block){
    this.y = block.y - this.h;
    this.vy = 0;
    this.onGround = true;
  }
}

class Block { constructor(x,y,w,h){this.x=x;this.y=y;this.w=w;this.h=h;} show(){ fill('#654321'); rect(this.x,this.y,this.w,this.h);} }

class Goomba {
  constructor(x,y){ this.x=x; this.y=y; this.w=30; this.h=30; this.vx=2; this.dead=false; }
  update(){ this.x += this.vx; if (this.x<0||this.x>width-30) this.vx*=-1; }
  show(){ fill('#b35b3d'); rect(this.x,this.y,this.w,this.h,5); }
}

class Coin {
  constructor(x,y){ this.x=x; this.y=y; this.w=20; this.h=20; this.collected=false; }
  update(){}
  show(){
    if (!this.collected){
      fill('#f5c76d');
      ellipse(this.x,this.y,this.w,this.h);
      fill(0);
      text('R',this.x-4,this.y+4);
    }
  }
}
