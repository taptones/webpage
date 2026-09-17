/* Orffian — site behaviour. No dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────── language ─────────────── */
  var LANGS = ['ko', 'en'];
  var STORE = 'orffian:lang';

  function readLang() {
    var q = new URLSearchParams(location.search).get('lang');
    if (LANGS.indexOf(q) > -1) return q;
    try {
      var saved = localStorage.getItem(STORE);
      if (LANGS.indexOf(saved) > -1) return saved;
    } catch (e) { /* private mode */ }
    return (navigator.language || 'ko').toLowerCase().indexOf('ko') === 0 ? 'ko' : 'en';
  }

  function setLang(lang) {
    if (LANGS.indexOf(lang) < 0) lang = 'ko';
    var root = document.documentElement;
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    document.querySelectorAll('[data-set-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.setLang === lang));
    });
    try { localStorage.setItem(STORE, lang); } catch (e) { /* ignore */ }
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  setLang(readLang());
  document.querySelectorAll('[data-set-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.setLang); });
  });

  /* ─────────────── header ─────────────── */
  var header = document.getElementById('siteHeader');
  var hero = document.querySelector('.hero');

  if (header && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }, { rootMargin: '-72px 0px 0px 0px', threshold: 0 }).observe(hero);
  }

  var navToggle = document.querySelector('.nav-toggle');
  if (navToggle && header) {
    navToggle.addEventListener('click', function () {
      var open = header.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    header.querySelectorAll('.site-nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        header.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ─────────────── 12-note keyboard ─────────────── */
  // Which notes each level turns on. Straight from the deck:
  // 3 = C-E-G triad, 5 = C major pentatonic, 7 = the major scale, 12 = chromatic.
  var LEVELS = {
    3:  ['C', 'E', 'G'],
    5:  ['C', 'D', 'E', 'G', 'A'],
    7:  ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    12: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  };
  var CAPTION = {
    3:  { ko: '<b>3음</b> · 도–미–솔 세 음만 켜 두면 아이는 누를 곳을 고민하지 않고 박자에 집중합니다.',
          en: '<b>3 notes</b> · with only C–E–G lit, a child stops hunting for keys and settles into the beat.' },
    5:  { ko: '<b>5음</b> · 5음 음계는 어떤 순서로 눌러도 어울려서, 틀린 음이라는 경험을 줄입니다.',
          en: '<b>5 notes</b> · a pentatonic set sounds right in any order, so there are far fewer wrong notes.' },
    7:  { ko: '<b>7음</b> · 온음계 전체. 멜로디를 따라 연주하며 음계 구조를 익힙니다.',
          en: '<b>7 notes</b> · the full major scale — melodies can be followed and the scale learned.' },
    12: { ko: '<b>12음</b> · 반음까지 모두 열린 상태. 배열은 그대로이므로 익힌 위치 감각이 유지됩니다.',
          en: '<b>12 notes</b> · every semitone open. The layout never moves, so learned positions still hold.' }
  };

  var demo = document.getElementById('kbdDemo');
  if (demo) {
    var keys = Array.prototype.slice.call(demo.querySelectorAll('.key'));
    var caption = document.getElementById('kbdCaption');
    var levelButtons = Array.prototype.slice.call(demo.querySelectorAll('.seg button'));
    var playBtn = document.getElementById('kbdPlay');
    var level = 5;
    var demoTimers = [];

    function clearDemo() {
      demoTimers.forEach(clearTimeout);
      demoTimers = [];
      keys.forEach(function (k) { k.classList.remove('is-hit'); });
    }

    function paintCaption() {
      if (!caption) return;
      var lang = document.documentElement.getAttribute('data-lang') || 'ko';
      caption.innerHTML = CAPTION[level][lang];
    }

    function applyLevel(next) {
      level = next;
      clearDemo();
      var on = LEVELS[level];
      keys.forEach(function (k) {
        var isOn = on.indexOf(k.dataset.note) > -1;
        k.classList.toggle('is-on', isOn);
        k.disabled = !isOn;
        k.setAttribute('aria-disabled', String(!isOn));
      });
      levelButtons.forEach(function (b) {
        b.setAttribute('aria-pressed', String(Number(b.dataset.level) === level));
      });
      paintCaption();
    }

    function hit(key) {
      if (!key || !key.classList.contains('is-on')) return;
      key.classList.remove('is-hit');
      void key.offsetWidth;            // restart the animation
      key.classList.add('is-hit');
      var t = setTimeout(function () { key.classList.remove('is-hit'); }, 260);
      demoTimers.push(t);
    }

    levelButtons.forEach(function (b) {
      b.addEventListener('click', function () { applyLevel(Number(b.dataset.level)); });
    });
    keys.forEach(function (k) {
      k.addEventListener('click', function () { hit(k); });
    });

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        clearDemo();
        var on = LEVELS[level];
        // walk up the active set and back down — the shape of a warm-up exercise
        var order = on.concat(on.slice(0, -1).reverse());
        order.forEach(function (note, i) {
          var t = setTimeout(function () {
            hit(keys.filter(function (k) { return k.dataset.note === note; })[0]);
          }, i * (reduceMotion ? 0 : 320));
          demoTimers.push(t);
        });
      });
    }

    document.addEventListener('langchange', paintCaption);
    applyLevel(level);
  }

  /* ─────────────── ensemble playhead ─────────────── */
  var ensemble = document.getElementById('ensemble');
  if (ensemble) {
    var ensBtn = document.getElementById('ensPlay');
    var beat = 0;
    var timer = null;

    function paintBeat(n) {
      ensemble.querySelectorAll('[data-beat]').forEach(function (cell) {
        cell.classList.toggle('is-beat', Number(cell.dataset.beat) === n);
      });
    }

    function stop() {
      clearInterval(timer);
      timer = null;
      paintBeat(0);
      if (ensBtn) ensBtn.setAttribute('aria-pressed', 'false');
    }

    function start() {
      beat = 0;
      timer = setInterval(function () {
        beat = beat % 4 + 1;
        paintBeat(beat);
      }, 700);
      beat = 1;
      paintBeat(1);
      if (ensBtn) ensBtn.setAttribute('aria-pressed', 'true');
    }

    if (ensBtn) {
      ensBtn.addEventListener('click', function () { timer ? stop() : start(); });
    }
    // don't leave it ticking off-screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting && timer) stop();
      }, { threshold: 0 }).observe(ensemble);
    }
  }

  /* ─────────────── count-up on the market stat ─────────────── */
  var counter = document.querySelector('[data-count-to]');
  if (counter && 'IntersectionObserver' in window && !reduceMotion) {
    var target = Number(counter.dataset.countTo);
    new IntersectionObserver(function (entries, obs) {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      var start = performance.now();
      var dur = 1100;
      (function step(now) {
        var p = Math.min(1, (now - start) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        counter.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(step);
      })(start);
    }, { threshold: 0.4 }).observe(counter);
  }
})();
