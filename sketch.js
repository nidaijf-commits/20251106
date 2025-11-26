let table;
let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let quizState = 'loading'; // loading, playing, finished
let selectedAnswer = null;
let answerChecked = false;
let feedbackColor = 0;

// 特效相關變數
let cursorParticles = []; // 游標粒子
let clickEffects = []; // 點擊特效
let animationParticles = []; // 稱讚與鼓勵的動畫粒子

function preload() {
  // 預載入 CSV 檔案
  table = loadTable('quiz.csv', 'csv', 'header');
}

function setup() {
  createCanvas(800, 600);
  // 將 CSV 表格資料轉換為物件陣列
  if (table) {
    for (let row of table.getRows()) {
      questions.push({
        question: row.getString('question'),
        options: [
          row.getString('optionA'),
          row.getString('optionB'),
          row.getString('optionC'),
          row.getString('optionD'),
        ],
        correctAnswer: row.getString('correctAnswer'),
      });
    }
    quizState = 'playing';
  } else {
    quizState = 'error';
  }
  noCursor(); // 隱藏預設游標
}

function draw() {
  background(50, 50, 70);

  // 根據不同的遊戲狀態呼叫對應的繪圖函數
  if (quizState === 'playing') {
    displayQuestion();
  } else if (quizState === 'finished') {
    displayResult();
  } else if (quizState === 'error') {
    displayError();
  }

  // 繪製所有特效
  drawCursorEffect();
  drawClickEffects();
}

function displayQuestion() {
  if (currentQuestionIndex >= questions.length) {
    quizState = 'finished';
    return;
  }

  let q = questions[currentQuestionIndex];

  // 顯示題目
  fill(255);
  textSize(28);
  textAlign(CENTER, CENTER);
  text(q.question, width / 2, height / 4);

  // 顯示選項
  for (let i = 0; i < q.options.length; i++) {
    let option = q.options[i];
    let x = width / 2;
    let y = height / 2 + i * 60;
    let w = 400;
    let h = 50;

    // 檢查滑鼠是否懸停在選項上
    if (
      mouseX > x - w / 2 &&
      mouseX < x + w / 2 &&
      mouseY > y - h / 2 &&
      mouseY < y + h / 2
    ) {
      fill(100, 100, 150); // 懸停時的顏色
    } else {
      fill(70, 70, 100); // 預設顏色
    }

    // 如果答案已被檢查，顯示回饋
    if (answerChecked) {
      if (option === q.correctAnswer) {
        fill(0, 150, 0, 200); // 正確答案顯示綠色
      } else if (option === selectedAnswer) {
        fill(150, 0, 0, 200); // 錯誤答案顯示紅色
      }
    }

    noStroke();
    rectMode(CENTER);
    rect(x, y, w, h, 10);

    fill(255);
    textSize(20);
    textAlign(CENTER, CENTER);
    text(option, x, y);
  }
}

function displayResult() {
  let percentage = (score / questions.length) * 100;
  textAlign(CENTER, CENTER);

  if (percentage >= 80) {
    // 高分：稱讚動畫 (煙火)
    drawPraiseAnimation();
    textSize(40);
    fill(255, 223, 0); // 金色
    text('太棒了！你真是個天才！', width / 2, height / 3);
  } else {
    // 低分：鼓励動畫 (生長的植物)
    drawEncouragementAnimation();
    textSize(40);
    fill(173, 216, 230); // 淺藍色
    text('別灰心，繼續努力！', width / 2, height / 3);
  }

  textSize(32);
  fill(255);
  text(`你的分數: ${score} / ${questions.length}`, width / 2, height / 2);

  // 重置按鈕
  let btnX = width / 2;
  let btnY = height * 0.65;
  let btnW = 200;
  let btnH = 50;
  rectMode(CENTER);
  // 檢查滑鼠是否在按鈕上
  if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
      fill(0, 150, 150);
  } else {
      fill(0, 100, 100);
  }
  rect(btnX, btnY, btnW, btnH, 10);
  fill(255);
  textSize(24);
  text('重新開始', btnX, btnY);
}

function displayError() {
  fill(255, 0, 0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('錯誤：無法載入 quiz.csv 檔案', width / 2, height / 2);
  text('請確認檔案是否存在且格式正確', width / 2, height / 2 + 40);
}

function mousePressed() {
  if (quizState === 'playing' && !answerChecked) {
    let q = questions[currentQuestionIndex];
    for (let i = 0; i < q.options.length; i++) {
      let option = q.options[i];
      let x = width / 2;
      let y = height / 2 + i * 60;
      let w = 400;
      let h = 50;

      if (mouseX > x - w / 2 && mouseX < x + w / 2 && mouseY > y - h / 2 && mouseY < y + h / 2) {
        selectedAnswer = option;
        answerChecked = true;
        // 增加點擊特效
        clickEffects.push({ x: mouseX, y: mouseY, size: 0, alpha: 255 });

        if (selectedAnswer === q.correctAnswer) {
          score++;
        }

        // 延遲 1.5 秒後進入下一題
        setTimeout(() => {
          currentQuestionIndex++;
          answerChecked = false;
          selectedAnswer = null;
        }, 1500);
        break;
      }
    }
  } else if (quizState === 'finished') {
      let btnX = width / 2;
      let btnY = height * 0.65;
      let btnW = 200;
      let btnH = 50;
      if (mouseX > btnX - btnW / 2 && mouseX < btnX + btnW/2 && mouseY > btnY - btnH/2 && mouseY < btnY + btnH/2) {
          // 重置測驗
          currentQuestionIndex = 0;
          score = 0;
          quizState = 'playing';
          animationParticles = []; // 清空動畫粒子
      }
  }
}

// --- 特效與動畫 ---

function drawCursorEffect() {
  cursorParticles.push({ x: mouseX, y: mouseY, size: random(10, 20), life: 255 });
  for (let i = cursorParticles.length - 1; i >= 0; i--) {
    let p = cursorParticles[i];
    noStroke();
    fill(255, 255, 0, p.life);
    ellipse(p.x, p.y, p.size);
    p.life -= 5;
    p.size -= 0.2;
    if (p.life <= 0) {
      cursorParticles.splice(i, 1);
    }
  }
}

function drawClickEffects() {
  for (let i = clickEffects.length - 1; i >= 0; i--) {
    let effect = clickEffects[i];
    noFill();
    stroke(255, 223, 0, effect.alpha);
    strokeWeight(4);
    ellipse(effect.x, effect.y, effect.size);
    effect.size += 15;
    effect.alpha -= 15;
    if (effect.alpha <= 0) {
      clickEffects.splice(i, 1);
    }
  }
}

function drawPraiseAnimation() {
  // 簡單的煙火效果
  if (frameCount % 5 === 0) {
    animationParticles.push({
      x: random(width),
      y: random(height / 2),
      vx: random(-2, 2),
      vy: random(-2, 2),
      size: random(5, 10),
      life: 255,
      color: color(random(100, 255), random(100, 255), random(100, 255)),
    });
    let explosionX = random(width * 0.2, width * 0.8); // 爆炸中心X
    let explosionY = random(height * 0.2, height * 0.5); // 爆炸中心Y
    let numSparks = random(30, 60); // 每次爆炸產生更多粒子

    for (let i = 0; i < numSparks; i++) {
      let angle = random(TWO_PI);
      let speed = random(2, 8); // 初始速度更廣泛
      let particleColor = color(random(150, 255), random(150, 255), random(150, 255)); // 更亮的顏色
      let particleLife = random(60, 120); // 更長的生命週期

      animationParticles.push({
        x: explosionX,
        y: explosionY,
        vx: cos(angle) * speed,
        vy: sin(angle) * speed - random(1, 3), // 初始向上推力，模擬爆炸
        size: random(3, 7), // 粒子大小更小且多樣
        life: particleLife,
        originalLife: particleLife, // 記錄原始生命週期用於漸變
        color: particleColor,
        gravity: 0.15, // 模擬重力
      });
    }
  }
  for (let i = animationParticles.length - 1; i >= 0; i--) {
    let p = animationParticles[i];
    p.vy += p.gravity; // 施加重力
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 1; // 每次減少1單位生命週期
    let alpha = map(p.life, 0, p.originalLife, 0, 255); // 根據生命週期計算透明度
    p.color.setAlpha(alpha); // 設定顏色透明度
    noStroke();
    fill(p.color); // 使用已設定透明度的顏色
    ellipse(p.x, p.y, p.size);
    if (p.life <= 0) {
      animationParticles.splice(i, 1);
    }
  }
}

function drawEncouragementAnimation() {
  // 簡單的上升氣泡效果
  if (frameCount % 10 === 0) {
    animationParticles.push({
      x: random(width),
      y: height,
      vy: random(-1, -3),
      size: random(10, 30),
      life: 255,
    });
  }
  for (let i = animationParticles.length - 1; i >= 0; i--) {
    let p = animationParticles[i];
    noStroke();
    fill(173, 216, 230, p.life / 2);
    ellipse(p.x, p.y, p.size);
    p.y += p.vy;
    p.life -= 2;
    if (p.y < 0 || p.life <= 0) {
      animationParticles.splice(i, 1);
    }
  }
}
