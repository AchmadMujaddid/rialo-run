/* RIALO RUN — character & enemy drawn as cartoon sprites (no images) */
let player, ground = [], enemies = [], coins = [];
let gravity = 0.9, score = 0, worldW = 2000, camX = 0;

function setup() {
  createCanvas(960, 520);
  // World: deretan platform bawah
  for (let i = 0; i < ceil(worldW/80); i++) ground.push(new Block(i*80, height-60, 80, 60));
  // Platform tambahan
  ground.push(new Block(420, height-160, 120, 20));
  ground.push(new Block(680, height-220, 120, 20));
  ground.push(new Block(980, height-180, 120, 20));
  ground.push(new Block(1280, height-240, 120, 20));
  ground.push(new Block(1580, height-200, 120, 20));

  player = new Rialo(80, height-120);

  // Musuh jamur
  enemies.push(new Goomba(520, height-90));
  enemies.push(new Goomba(1050, height-210));
  enemies.push(new Goomba(1500, height-230));

  // Coin / logo Rialo
  coins.push(new Coin(720, height-250));
  coins.push(new Coin(1000, height-210));
  coins.push(new Coin(1320, height-270));
  coins.push(new Coin(1680, height-230));
}

function draw() {
  background(16); // night
  // Grid halus ala pixel (opsional)
  stroke(20); for (let x=0;x<width;x+=32) line(x,0,x,height); for (let y=0;y<height;y+=32) line(0,y,width,y);
  noStroke();

  // Kamera mengikut player
  camX = constrain(player.x - width*0.35, 0, worldW - width);
  push();
  translate(-camX, 0);

  // HUD
  push();
  translate(camX, 0);
  fill(255); textSize(24); text(`Score: ${score}`, 20, 34);
  pop();

  // Platform
  for (let b of ground) b.show();

  // Coins
  for (let c of coins) { c.update(); c.show(); }

  // Enemies
  for (let e of enemies) { e.update(); e.show(); }

  // Player
  player.update();
  player.show();

  // Collision ground
  player.onGround = false;
  for (let b of ground) if (player.collideRect(b)) player.land(b);

  // Enemy collision (stomp / hit)
  for (let e of enemies) {
    if (player.collideRect(e)) {
      // Jika jatuh dari atas → musuh mati, pantul
      if (player.vy > 0 && player.y + player.h - e.y < 18) {
        e.dead = true;
        player.vy = -12;
      } else {
        resetGame();
        break;
      }
    }
  }
  enemies = enemies.filter(e => !e.dead);

  // Coin collision
  for (let c of coins) {
    if (!c.collected && player.collideRect(c)) {
      c.collected = true; score++;
    }
  }
  coins = coins.filter(c => !c.collected);

  // Batas dunia
  player.x = constrain(player.x, 0, worldW - player.w);

  pop(); // end camera

  // Win banner
  if (coins.length === 0) {
    fill(255); textAlign(CENTER, CENTER); textSize(28);
    text("All Rialo logos collected! 🎉", width/2, 50);
  }
}

/* Controls */
function keyPressed() {
  if (keyCode === UP_ARROW || key === ' ') if (player.onGround) player.vy = -16;
  if (keyCode === LEFT_ARROW) player.vx = -5, player.facing = -1;
  if (keyCode === RIGHT_ARROW) player.vx = 5, player.facing = 1;
}
function keyReleased() {
  if (keyCode === LEFT_ARROW && player.vx < 0) player.vx = 0;
  if (keyCode === RIGHT_ARROW && player.vx > 0) player.vx = 0;
}

function resetGame() {
  score = 0;
  player.x = 80; player.y = height-120; player.vx = 0; player.vy = 0;
  enemies = [new Goomba(520, height-90), new Goomba(1050, height-210), new Goomba(1500, height-230)];
  coins = [new Coin(720, height-250), new Coin(1000, height-210), new Coin(1320, height-270), new Coin(1680, height-230)];
}

/* ---------- Classes ---------- */
class Rialo {
  constructor(x,y){ this.x=x; this.y=y; this.w=34; this.h=46; this.vx=0; this.vy=0; this.onGround=false; this.facing=1; }
  update(){
    this.vy += gravity;
    this.y += this.vy; this.x += this.vx;
    // ground clamp (fallback)
    if (this.y > height-106){ this.y = height-106; this.vy = 0; this.onGround = true; }
  }
  show(){
    push();
    translate(this.x + this.w/2, this.y + this.h);
    scale(this.facing, 1);
    translate(-this.w/2, -this.h);

    // Walk animation
    const t = frameCount * 0.2;
    const legSwing = this.onGround ? sin(t) * 6 * (abs(this.vx)>0?1:0) : 0;
    const armSwing = -legSwing;

    // Shadow
    noStroke(); fill(0,0,0,60); ellipse(this.w/2, this.h+6, 22, 6);

    // Body (krem Rialo)
    fill('#f5c76d'); stroke('#2b2b2b'); strokeWeight(1.4);
    rect(6, 14, this.w-12, 26, 6);

    // Head
    fill('#fff2d0'); stroke('#2b2b2b'); rect(8, -2, this.w-16, 20, 6);
    // Eyes
    fill(0); noStroke(); circle(14, 6, 3); circle(this.w-14, 6, 3);
    // Smile
    stroke(0); noFill(); arc(this.w/2, 10, 10, 6, 0, PI);

    // Hat (hitam-krem)
    noStroke(); fill('#222'); rect(6, -6, this.w-12, 6, 2); // brim
    fill('#f5c76d'); rect(10, -12, this.w-20, 6, 2);

    // Arms (swing)
    push(); translate(6, 22); rotate(radians(armSwing)); stroke('#2b2b2b'); strokeWeight(3); line(0,0, -8,8); pop();
    push(); translate(this.w-6, 22); rotate(radians(-armSwing)); stroke('#2b2b2b'); strokeWeight(3); line(0,0, 8,8); pop();

    // Legs (swing)
    push(); translate(14, 40); rotate(radians(legSwing)); stroke('#2b2b2b'); strokeWeight(4); line(0,0, 0,10); pop();
    push(); translate(this.w-14, 40); rotate(radians(-legSwing)); stroke('#2b2b2b'); strokeWeight(4); line(0,0, 0,10); pop();

    // Chest logo "R"
    noStroke(); fill('#2b2b2b'); textSize(12); textAlign(CENTER, CENTER); text('R', this.w/2, 28);
    pop();
  }
  collideRect(obj){
    return (this.x < obj.x + obj.w && this.x + this.w > obj.x &&
            this.y < obj.y + obj.h && this.y + this.h > obj.y);
  }
  land(block){
    // Land only if coming from above
    if (this.y + this.h > block.y && this.y + this.h < block.y + 25 && this.vy >= 0){
      this.y = block.y - this.h;
      this.vy = 0; this.onGround = true;
    }
  }
}

class Block {
  constructor(x,y,w,h){ this.x=x; this.y=y; this.w=w; this.h=h; }
  show(){
    // ground tile
    stroke(40); fill('#5a3820');
    rect(this.x, this.y, this.w, this.h);
    // top line
    stroke(30); line(this.x, this.y, this.x + this.w, this.y);
    // split lines
    for (let i=1;i<this.w/40;i++){ stroke(35); line(this.x+i*40, this.y, this.x+i*40, this.y+this.h); }
  }
}

class Goomba {
  constructor(x,y){ this.x=x; this.y=y; this.w=36; this.h=28; this.vx=1.6; this.dead=false; this.dir = random([1,-1]); }
  update(){
    this.x += this.vx * this.dir;
    // simple patrol
    if (random() < 0.005) this.dir *= -1;
  }
  show(){
    push();
    translate(this.x, this.y);
    // body (jamur)
    noStroke();
    fill('#b35b3d'); arc(this.w/2, 12, this.w, 26, PI, TWO_PI); // cap
    fill('#f1d7be'); rect(6, 12, this.w-12, 16, 6); // stem
    // eyes
    fill(0); ellipse(14, 20, 4, 6); ellipse(this.w-14, 20, 4, 6);
    // little feet
    fill('#5a3820'); rect(8, this.h-4, 10, 4, 2); rect(this.w-18, this.h-4, 10, 4, 2);
    pop();
  }
  get x(){ return this._x; } set x(v){ this._x=v; }
  get y(){ return this._y; } set y(v){ this._y=v; }
}

Object.defineProperty(Goomba.prototype, 'x', { get(){ return this._x; }, set(v){ this._x=v; } });
Object.defineProperty(Goomba.prototype, 'y', { get(){ return this._y; }, set(v){ this._y=v; } });
Goomba.prototype._x = 0; Goomba.prototype._y = 0;

class Coin {
  constructor(x,y){ this.x=x; this.y=y; this.w=22; this.h=22; this.collected=false; this.t=0; }
  update(){ this.t+=0.1; }
  show(){
    if (this.collected) return;
    push();
    translate(this.x, this.y);
    const bob = sin(this.t)*3;
    noStroke(); fill('#f5c76d');
    ellipse(0, bob, this.w, this.h);
    fill(0); textAlign(CENTER, CENTER); textSize(10); text('R', 0, bob+1);
    pop();
  }
}
