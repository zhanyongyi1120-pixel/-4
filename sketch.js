/**
 * 水底世界：課程作品展覽區
 * 技術點：Class, 陣列, Vertex, Iframe 整合
 * 創意發想：海草高度隨作品增加而成長
 */

let seaweeds = []; // 儲存海草物件的陣列
let fishes = [];   // 儲存魚群物件的陣列
let pods = [];     // 儲存作品展示氣泡物件的陣列
let bubbles = [];  // 儲存漂浮泡泡物件的陣列

let currentIframe = null; // 儲存 iframe 元素
let closeButton = null;   // 儲存關閉按鈕元素

// 模擬兩週的作品資料 (請替換為實際的作業連結)
// 'growth' 屬性用於控制海草的高度，象徵學習的成長
const assignments = [
  { week: "第一週", url: "https://zhanyongyi1120-pixel.github.io/--2/", growth: 150 },
  { week: "第二週", url: "https://zhanyongyi1120-pixel.github.io/2026330/", growth: 300 }
];

function setup() {
  // 創建全螢幕畫布
  createCanvas(windowWidth, windowHeight);
  
  // 初始化大約30株海草，密集分佈
  for (let i = 0; i < 30; i++) {
    let x = (i % 10) * (width / 10) + width / 20;
    let row = Math.floor(i / 10);
    let growth = 150 + row * 50;
    seaweeds.push(new Seaweed(x, growth));
  }
  
  // 初始化作品展示氣泡：對應兩週作業
  for (let i = 0; i < assignments.length; i++) {
    let x = (width / (assignments.length + 1)) * (i + 1);
    pods.push(new DisplayPod(x, height * 0.3, assignments[i]));
  }

  // 產生一些隨機游動的魚
  for (let i = 0; i < 8; i++) { // 增加魚的數量
    fishes.push(new Fish());
  }

  // 初始化泡泡系統
  initializeBubbles();

  // 設定 iframe 和關閉按鈕的 UI
  setupIframeUI();
}

function draw() {
  // 繪製深海漸層背景
  drawDeepSeaBackground();

  // 更新並顯示所有海草
  seaweeds.forEach(s => {
    s.update();
    s.display();
  });

  // 更新並顯示所有魚群
  fishes.forEach(f => {
    f.update();
    f.display();
  });

  // 更新並顯示所有作品展示氣泡
  pods.forEach(p => {
    p.update();
    p.display();
  });
  
  // 隨機生成新泡泡
  if (random() < 0.3) { // 每幀有30%的概率產生新泡泡
    bubbles.push(new Bubble());
  }
  
  // 更新並顯示所有泡泡，移除爆破的泡泡
  for (let i = bubbles.length - 1; i >= 0; i--) {
    bubbles[i].update();
    bubbles[i].display();
    if (bubbles[i].isBurst) {
      bubbles.splice(i, 1);
    }
  }
  
  // 顯示提示文字
  fill(255, 200);
  noStroke();
  textAlign(CENTER);
  textSize(18);
  text("點擊漂浮的「作品氣泡」查看各週練習", width / 2, 40);
}

// 繪製深海漸層背景
function drawDeepSeaBackground() {
  for (let i = 0; i <= height; i++) {
    let inter = map(i, 0, height, 0, 1);
    // 從淺藍色到深藍色再到深紫色/黑色
    let c1 = color(0, 105, 148); // 淺藍
    let c2 = color(0, 30, 80);   // 深藍
    let c3 = color(0, 5, 30);    // 深紫黑
    
    let lerpedColor;
    if (inter < 0.5) {
      lerpedColor = lerpColor(c1, c2, map(inter, 0, 0.5, 0, 1));
    } else {
      lerpedColor = lerpColor(c2, c3, map(inter, 0.5, 1, 0, 1));
    }
    stroke(lerpedColor);
    line(0, i, width, i);
  }
}

// --- 泡泡初始化系統 ---
function initializeBubbles() {
  // 初始化一些起始泡泡
  for (let i = 0; i < 20; i++) {
    bubbles.push(new Bubble());
  }
}

// --- Bubble Class (泡泡類別) ---
class Bubble {
  constructor() {
    // 泡泡從底部隨機位置開始
    this.x = random(width);
    this.y = height + random(-50, 0); // 從底部下方開始
    this.radius = random(3, 12); // 泡泡半徑
    this.velocity = random(0.5, 2); // 上升速度
    this.wobbleSpeed = random(0.03, 0.08); // 搖晃速度
    this.wobbleAmount = random(3, 8); // 搖晃幅度
    this.wobbleOffset = random(1000); // 搖晃偏移
    this.burstChance = 0.005; // 每幀爆破的概率
    this.isBurst = false; // 是否已爆破
    this.opacity = 80; // 透明度
  }

  update() {
    // 上升
    this.y -= this.velocity;
    
    // 左右搖晃
    this.x += sin(frameCount * this.wobbleSpeed + this.wobbleOffset) * 0.2;
    
    // 隨機爆破或到達頂部時爆破
    if (random() < this.burstChance || this.y < -this.radius * 2) {
      this.isBurst = true;
    }
  }

  display() {
    push();
    // 透明泡泡外框
    fill(200, 220, 255, this.opacity);
    stroke(180, 200, 255, this.opacity * 1.2);
    strokeWeight(1.5);
    circle(this.x, this.y, this.radius * 2);
    
    // 泡泡高光效果（增加錦緻感）
    noStroke();
    fill(255, 255, 255, this.opacity * 0.6);
    circle(this.x - this.radius * 0.4, this.y - this.radius * 0.4, this.radius * 0.5);
    
    pop();
  }
}

// --- Seaweed Class (海草類別) ---
class Seaweed {
  constructor(x, targetH) {
    this.x = x;
    this.h = 0; // 當前高度，從0開始生長
    this.targetH = targetH; // 目標高度
    this.segments = 20; // 海草節點數量
    this.offset = random(1000); // 隨機偏移量，使每株海草擺動不同步
    this.swaySpeed = random(0.01, 0.03); // 擺動速度
    this.swayAmount = random(10, 25); // 擺動幅度
    this.color = color(random(40, 80), random(120, 180), random(80, 120), 200); // 綠色系
  }

  update() {
    // 讓海草逐漸長到目標高度
    if (this.h < this.targetH) {
      this.h = lerp(this.h, this.targetH, 0.05); // 平滑生長
    }
  }

  display() {
    push();
    stroke(this.color);
    strokeWeight(8);
    noFill();
    beginShape();
    for (let i = 0; i <= this.segments; i++) {
      // 計算每個節點的 Y 座標
      let y = height - (i / this.segments) * this.h;
      // 使用 sin 函數控制左右搖擺，並隨節點高度增加擺動幅度
      let x = this.x + sin(frameCount * this.swaySpeed + i * 0.2 + this.offset) * (i / this.segments) * this.swayAmount;
      vertex(x, y);
    }
    endShape();
    pop();
  }
}

// --- Fish Class (魚群類別) ---
class Fish {
  constructor() {
    this.flipY = 1;  // 初始化翻轉標志
    this.reset();
  }

  reset() {
    // 隨機從左或右邊開始游動
    let fromRight = random() > 0.5;
    
    if (fromRight) {
      // 從右邊開始，向左游
      this.pos = createVector(random(width + 50, width + 200), random(height * 0.2, height * 0.8));
      this.vel = createVector(random(-2, -0.5), random(-0.2, 0.2));
      this.flipY = -1;  // 上下翻轉
    } else {
      // 從左邊開始，向右游
      this.pos = createVector(random(-200, -50), random(height * 0.2, height * 0.8));
      this.vel = createVector(random(0.5, 2), random(-0.2, 0.2));
      this.flipY = 1;   // 不翻轉
    }
    
    this.size = random(20, 50);
    this.color1 = color(random(200, 255), random(100, 150), random(50, 100), 180);
    this.color2 = color(random(50, 100), random(150, 200), random(200, 255), 180);
    this.bodyLength = this.size * 1.5;
    this.tailLength = this.size * 0.8;
    this.tailWidth = this.size * 0.6;
    this.finSize = this.size * 0.4;
  }

  update() {
    this.pos.add(this.vel);
    // 如果魚游出螢幕的左邊或右邊，則重置位置
    if (this.pos.x > width + 200 || this.pos.x < -200) {
      this.reset();
    }
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    scale(1, this.flipY);  // 上下翻轉或不翻轉
    
    let angle = this.vel.heading();
    rotate(angle);  // 直接使用速度角度，無需加 PI

    let bodyColor = lerpColor(this.color1, this.color2, sin(frameCount * 0.1 + this.pos.x * 0.01));
    
    // 魚身（主體）
    fill(bodyColor);
    stroke(0);
    strokeWeight(1.5);
    ellipse(0, 0, this.bodyLength, this.size);
    
    // 魚頭（面向右邊）
    fill(bodyColor);
    circle(this.bodyLength * 0.35, 0, this.size * 0.8);
    
    // 魚尾（規則的三角形）
    fill(lerpColor(this.color1, this.color2, 0.6));
    stroke(0);
    strokeWeight(1.5);
    beginShape();
    vertex(-this.bodyLength * 0.45, 0);
    vertex(-this.bodyLength * 0.45 - this.tailLength, -this.tailWidth);
    vertex(-this.bodyLength * 0.45 - this.tailLength, this.tailWidth);
    endShape(CLOSE);
    
    // 背鰭（上方）
    fill(lerpColor(this.color1, this.color2, 0.5));
    stroke(0);
    strokeWeight(1.5);
    beginShape();
    vertex(this.bodyLength * 0.1, -this.size * 0.5);
    vertex(0, -this.size * 0.9);
    vertex(-this.bodyLength * 0.1, -this.size * 0.5);
    endShape(CLOSE);
    
    // 腹鰭（下方）
    fill(lerpColor(this.color1, this.color2, 0.4));
    stroke(0);
    strokeWeight(1.5);
    beginShape();
    vertex(this.bodyLength * 0.1, this.size * 0.5);
    vertex(0, this.size * 0.9);
    vertex(-this.bodyLength * 0.1, this.size * 0.5);
    endShape(CLOSE);
    
    // 眼睛（在鱼頭內）
    fill(0);
    circle(this.bodyLength * 0.35, -this.size * 0.15, this.size * 0.25);
    fill(255);
    circle(this.bodyLength * 0.35, -this.size * 0.15, this.size * 0.12);

    pop();
  }
}

// --- 作品展示板 (氣泡) ---
class DisplayPod {
  constructor(x, y, data) {
    this.basePos = createVector(x, y);
    this.pos = createVector(x, y);
    this.data = data;
    this.size = 100;
    this.floatOffset = random(1000);
    this.hovered = false;
  }

  update() {
    // 漂浮感
    this.pos.y = this.basePos.y + sin(frameCount * 0.03 + this.floatOffset) * 15;
    // 檢查滑鼠是否懸停在氣泡上
    let d = dist(mouseX, mouseY, this.pos.x, this.pos.y);
    this.hovered = d < this.size / 2;
  }

  display() {
    push();
    // 畫出帶有漸層感的氣泡
    drawingContext.shadowBlur = this.hovered ? 20 : 10;
    drawingContext.shadowColor = this.hovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.5)';
    fill(255, 255, 255, this.hovered ? 180 : 100);
    stroke(255, this.hovered ? 200 : 150);
    ellipse(this.pos.x, this.pos.y, this.size);
    
    // 文字
    fill(0, 0, 0, 200); // 文字顏色
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(16);
    text(this.data.week, this.pos.x, this.pos.y - 10);
    textSize(12);
    text("點擊查看", this.pos.x, this.pos.y + 15);
    pop();
  }

  // 檢查滑鼠是否點擊到氣泡
  isClicked(mx, my) {
    let d = dist(mx, my, this.pos.x, this.pos.y);
    return d < this.size / 2;
  }
}

// --- Iframe 與 UI 控制 ---
function setupIframeUI() {
  // 建立 iframe
  currentIframe = createElement('iframe');
  currentIframe.position(width * 0.1, height * 0.1);
  currentIframe.size(width * 0.8, height * 0.8);
  currentIframe.style('border', '5px solid #007bff'); // 藍色邊框
  currentIframe.style('border-radius', '15px');      // 圓角
  currentIframe.style('box-shadow', '0 0 20px rgba(0, 123, 255, 0.8)'); // 藍色陰影
  currentIframe.style('background-color', 'rgba(255, 255, 255, 0.9)'); // 半透明背景
  currentIframe.style('z-index', '1000');            // 確保在最上層
  currentIframe.hide(); // 初始隱藏

  // 建立關閉按鈕
  closeButton = createButton('關閉展覽');
  closeButton.position(width * 0.9 - 100, height * 0.1 + 10); // 預設位置
  closeButton.style('background-color', '#dc3545'); // 紅色背景
  closeButton.style('color', 'white');
  closeButton.style('border', 'none');
  closeButton.style('padding', '10px 15px');
  closeButton.style('border-radius', '8px');
  closeButton.style('cursor', 'pointer');
  closeButton.style('z-index', '1001'); // 確保在 iframe 上方
  closeButton.mousePressed(() => {
    currentIframe.hide();
    closeButton.hide();
  });
  closeButton.hide(); // 初始隱藏
}

// 處理滑鼠點擊事件
function mousePressed() {
  pods.forEach(p => {
    if (p.isClicked(mouseX, mouseY)) {
      currentIframe.attribute('src', p.data.url); // 設定 iframe 來源
      currentIframe.show(); // 顯示 iframe
      closeButton.show();   // 顯示關閉按鈕
    }
  });
}

// 處理視窗大小改變事件
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 重新調整 iframe 和按鈕的位置和大小
  currentIframe.position(width * 0.1, height * 0.1);
  currentIframe.size(width * 0.8, height * 0.8);
  closeButton.position(width * 0.9 - 100, height * 0.1 + 10);
}
