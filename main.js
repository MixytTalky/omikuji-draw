(function () {
  'use strict';

  const CONFIG = {
    drawThreshold: 150,
    fortunes: [
      { id: 'daikichi', rank: '大 吉', poem: '旭日東昇，光景煥然\n風平浪靜，此刻即是最好的安排。', img: './assets/result-daikichi.png' },
      { id: 'chukichi', rank: '中 吉', poem: '雲開見月，步步高升\n堅定前行，沿途風景不負所望。', img: './assets/result-daikichi.png' },
      { id: 'shokichi', rank: '小 吉', poem: '微風輕拂，新芽萌發\n微小的幸運正悄悄降臨身旁。', img: './assets/result-daikichi.png' },
      { id: 'kichi', rank: '吉',    poem: '平心靜氣，安之若素\n保持平常心，萬事自然順遂。', img: './assets/result-daikichi.png' },
      { id: 'suekichi', rank: '末 吉', poem: '迷霧漸散，曙光微露\n耐心等待，轉機即將出現在眼前。', img: './assets/result-daikichi.png' },
      { id: 'kyo',      rank: '凶',    poem: '暗潮洶湧，步步為營\n暫避鋒芒，靜待烏雲過後的晴空。', img: './assets/result-daikichi.png' },
      { id: 'daikyo',   rank: '大 凶', poem: '雷雨交加，行路艱難\n置之死地而後生，大破必有大立。', img: './assets/result-daikichi.png' },
    ]
  };

  let drawDistance = 0;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  let currentFortune = null;

  function init() {
    setupCanvas();
    setupButtons();
  }

  function setupCanvas() {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      ctx.strokeStyle = '#1C1C1E';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    
    window.addEventListener('resize', resize);
    resize();

    function startDraw(e) {
      isDrawing = true;
      const pos = getPos(e);
      lastX = pos.x; lastY = pos.y;
      document.getElementById('canvas-overlay').style.opacity = '0';
    }

    function draw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      
      const pos = getPos(e);
      const x = pos.x;
      const y = pos.y;
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();

      const dist = Math.sqrt(Math.pow(x - lastX, 2) + Math.pow(y - lastY, 2));
      drawDistance += dist;
      
      lastX = x; lastY = y;

      if (drawDistance > CONFIG.drawThreshold) {
        document.getElementById('btn-draw-lot').disabled = false;
      }
    }

    function endDraw() {
      isDrawing = false;
    }

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      let clientX = e.clientX;
      let clientY = e.clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      }
      return { x: clientX - rect.left, y: clientY - rect.top };
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', endDraw);
    
    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', endDraw);
  }

  function setupButtons() {
    document.getElementById('btn-clear').addEventListener('click', clearCanvas);
    document.getElementById('btn-draw-lot').addEventListener('click', drawLot);
    document.getElementById('btn-retry').addEventListener('click', retry);
    document.getElementById('btn-share').addEventListener('click', shareResult);
  }

  function clearCanvas() {
    const canvas = document.getElementById('paintCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawDistance = 0;
    document.getElementById('btn-draw-lot').disabled = true;
    document.getElementById('canvas-overlay').style.opacity = '1';
  }

  function drawLot() {
    const rand = Math.floor(Math.random() * CONFIG.fortunes.length);
    currentFortune = CONFIG.fortunes[rand];
    
    document.getElementById('result-image').src = currentFortune.img;
    document.getElementById('result-rank').textContent = currentFortune.rank;
    document.getElementById('result-poem').textContent = currentFortune.poem;

    switchScreen('screen-result');
  }

  function retry() {
    clearCanvas();
    switchScreen('screen-draw');
  }

  function shareResult() {
    const url = window.location.href;
    const shareText = `我在「日式手繪御神籤」抽到了【${currentFortune.rank}】⛩️\n${currentFortune.poem.replace('\n', ' ')}\n\n馬上來畫圖求籤 👉 ${url}`;
    
    if (navigator.share) {
      navigator.share({
        title: '日式手繪御神籤',
        text: shareText
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert('運勢結果已複製到剪貼簿！');
      }).catch(console.error);
    }
  }

  function switchScreen(targetId) {
    document.querySelectorAll('.screen').forEach(s => {
      s.classList.remove('active');
    });
    setTimeout(() => {
      document.getElementById(targetId).classList.add('active');
    }, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
