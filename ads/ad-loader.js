/**
 * ads/ad-loader.js
 *
 * 廣告載入腳本 — 自建廣告卡片（模式 A）
 * 包含 4 則贊助夥伴廣告 + UTM 追蹤 + 12s 輪播 + GAS 點擊追蹤
 *
 * ⚠️ 新工具建立時，僅需修改 TOOL_SLUG 與 PROJECT_SLUG 兩個變數
 */

(function () {
  'use strict';

  // ── 工具識別（每個工具需修改此值）──
  var TOOL_SLUG    = 'tool-omikuji-draw-v1.0.0'; // 版本追蹤用
  var PROJECT_SLUG = 'omikuji-draw';              // UTM utm_source 用（= 專案資料夾名稱）

  // ── GAS 點擊追蹤 API ──
  var GAS_URL = 'https://script.google.com/macros/s/AKfycbwErP5VVl_6vI29OiH4BAfmvCwC2eYmO5QrvK-BKYmYz1M6dCGyIffxmQgFwKzZlKs/exec';

  // ── 廣告資料（共用，勿修改）──
  var ADS = [
    {
      title: '明星3缺1',
      desc: 'gametower',
      img: 'https://scontent.ftpe7-1.fna.fbcdn.net/v/t39.30808-6/648706321_1448981057013542_9064894674256098713_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=MH0HC92vLg8Q7kNvwFaQvRb&_nc_oc=AdrhM4bh7Sha--Wghetp5OWif1IgqSsYjMt9Ga7gxDTZ5a_HAsVCTnU-LxFQnGJCkQk&_nc_zt=23&_nc_ht=scontent.ftpe7-1.fna&_nc_gid=hrmRiiO0Kj1yUskP1_Q4XA&_nc_ss=7a32e&oh=00_AfzOv7XrGzIsnGs15eC4KubMhglBlbmHqLIN7iozTmrkKw&oe=69C952CA',
      url: 'https://www.gametower.com.tw/games/mobile/i371/'
    },
    {
      title: '滿貫大亨',
      desc: 'gametower',
      img: 'https://scontent.ftpe7-3.fna.fbcdn.net/v/t39.30808-6/539616014_1089253463330462_7513008573003625713_n.jpg?_nc_cat=102&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=7o_VZfypDjgQ7kNvwG4RrF6&_nc_oc=Adqq14JN3dNzKRxEandE-L7i2N-Yuz8HRrTlHL6QC_msLCbLZQxjmcRbu2z2gVnDnEg&_nc_zt=23&_nc_ht=scontent.ftpe7-3.fna&_nc_gid=K6tCugfHTAYFeFBOsKuPJA&_nc_ss=7a32e&oh=00_AfzB9tUtq9FRC8f1a_u0L7NrkxSwh8sL4h-9VXHnWFgrrg&oe=69C93DBB',
      url: 'https://www.gametower.com.tw'
    },
    {
      title: '競技麻將2',
      desc: 'cmj2',
      img: 'https://scontent.ftpe7-3.fna.fbcdn.net/v/t39.30808-6/629195011_1463303279138868_7447318853304926633_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=GQc1CEAK1oIQ7kNvwH9-aYq&_nc_oc=AdoI9uoJ-Mh5M4aKIQOLHX1oZuYuDKVqfuFI2t5jDwuHNlrG8y7qoyuQeitIHRnxdxE&_nc_zt=23&_nc_ht=scontent.ftpe7-3.fna&_nc_gid=z3mBXk_jWVBH7CJGcz9I4Q&_nc_ss=7a32e&oh=00_Afy-5peyzc6vN0x_cBMXhadMVcWyvw2pBY0YmW9oLKztfw&oe=69C93183',
      url: 'https://www.gametower.com.tw'
    },
    {
      title: 'Mythrune',
      desc: 'mythrune.net',
      img: 'https://i.pinimg.com/originals/63/ba/29/63ba2995f8893cfcf5cf46c274626a0c.jpg',
      url: 'https://mythrune.net/'
    }
  ];

  // ── UTM 參數產生（index-based，符合規範）──
  var ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];
  function utm(url, adIndex) {
    var sep = url.indexOf('?') === -1 ? '?' : '&';
    var ord = ORDINALS[adIndex] || (adIndex + 1) + 'th';
    return url + sep +
      'utm_source=' + PROJECT_SLUG +
      '&utm_medium=display' +
      '&utm_campaign=mega_traffic_2026' +
      '&utm_content=' + ord + '_banner';
  }

  // ── IP 取得（GAS 追蹤用）──
  function getIP() {
    return fetch('https://api.ipify.org?format=json')
      .then(function (r) { return r.json(); })
      .then(function (d) { return d.ip; })
      .catch(function () { return '未知IP'; });
  }

  // ── GAS 點擊追蹤初始化 ──
  function initTracker() {
    document.querySelectorAll('.ad-link').forEach(function (el) {
      el.addEventListener('click', function () {
        var adId = el.getAttribute('data-ad-id') || el.href;
        getIP().then(function (ip) {
          fetch(GAS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify({ action: 'click', ip: ip, adId: adId })
          });
        });
      });
    });
  }

  // ── 初始化 ──
  function init() {
    var slots = document.querySelectorAll('[data-ad-slot]');
    slots.forEach(function (el) {
      var slot = el.getAttribute('data-ad-slot');
      if (slot === 'sidebar') { renderSidebar(el); }
      else { renderBanner(el, slot); }
      el.classList.add('ad-loaded');
    });
    initTracker();
  }

  // ── 渲染函式 ──

  var VISIBLE_COUNT = 3;
  var ROTATE_MS = 12000;

  // Sidebar：圖文卡片 + 輪播
  function renderSidebar(el) {
    var label = document.createElement('div');
    label.className = 'ad-sponsor-label';
    label.textContent = '🤝 贊助夥伴';
    el.appendChild(label);

    var grid = document.createElement('div');
    grid.className = 'ad-grid';
    el.appendChild(grid);

    ADS.forEach(function (ad, i) {
      var card = document.createElement('a');
      card.href = utm(ad.url, i);
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.className = 'ad-link ad-card';
      card.setAttribute('data-ad-id', '廣告' + (i + 1) + '_' + ad.title);
      if (i >= VISIBLE_COUNT) card.style.display = 'none';

      var img = document.createElement('img');
      img.src = ad.img;
      img.alt = ad.title + '廣告';
      img.className = 'ad-img';
      img.loading = 'lazy';
      card.appendChild(img);

      var info = document.createElement('div');
      info.className = 'ad-label';
      info.innerHTML =
        '<span class="ad-title">' + ad.title + '</span>' +
        '<span class="ad-source">' + ad.desc + '</span>';
      card.appendChild(info);
      grid.appendChild(card);
    });

    // 輪播邏輯
    if (ADS.length > VISIBLE_COUNT) {
      var offset = 0;
      setInterval(function () {
        var cards = grid.querySelectorAll('.ad-card');
        cards.forEach(function (c) { c.style.opacity = '0'; });
        setTimeout(function () {
          offset = (offset + 1) % ADS.length;
          cards.forEach(function (c, i) {
            var show = false;
            for (var v = 0; v < VISIBLE_COUNT; v++) {
              if (i === (offset + v) % ADS.length) show = true;
            }
            c.style.display = show ? 'block' : 'none';
            if (show) c.style.opacity = '1';
          });
        }, 400);
      }, ROTATE_MS);
    }
  }

  // Header / Footer：橫幅
  function renderBanner(el, slot) {
    var adIndex = slot === 'header' ? 0 : ADS.length - 1;
    var ad = ADS[adIndex];

    var link = document.createElement('a');
    link.href = utm(ad.url, adIndex);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'ad-link';
    link.setAttribute('data-ad-id', '廣告' + (adIndex + 1) + '_' + ad.title);
    link.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 16px;text-decoration:none;width:100%;';

    var badge = document.createElement('span');
    badge.textContent = 'AD';
    badge.style.cssText = 'font-size:0.55rem;background:var(--color-surface-alt,#22263a);color:var(--color-text-muted,#8b93a8);padding:2px 6px;border-radius:4px;letter-spacing:0.08em;';
    link.appendChild(badge);

    var icon = document.createElement('img');
    icon.src = ad.img;
    icon.alt = ad.title + '廣告';
    icon.loading = 'lazy';
    icon.style.cssText = 'width:32px;height:32px;border-radius:6px;object-fit:cover;';
    link.appendChild(icon);

    var text = document.createElement('span');
    text.textContent = ad.title + ' — 立即體驗 →';
    text.style.cssText = 'font-size:0.8rem;color:var(--color-text,#e2e8f0);';
    link.appendChild(text);

    el.appendChild(link);
  }

  // ── DOM Ready ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
