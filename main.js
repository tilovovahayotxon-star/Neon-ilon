// ============================================================
// NEON SNAKE RPG — Asosiy JavaScript
// ============================================================

// ============================================================
// OVOZ TIZIMI (Web Audio API)
// ============================================================
const Audio = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx) {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { console.warn('Audio ishlamaydi'); }
    }
  },

  play(type) {
    if (!this.enabled || !this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);

    const tones = {
      eat: { f1: 600, f2: 1200, dur: 0.15, vol: 0.15, type: 'sine' },
      powerup: { f1: 400, f2: 1600, dur: 0.3, vol: 0.2, type: 'triangle' },
      die: { f1: 400, f2: 80, dur: 0.6, vol: 0.25, type: 'sawtooth' },
      click: { f1: 800, f2: 400, dur: 0.05, vol: 0.08, type: 'square' },
      buy: { f1: 500, f2: 1500, dur: 0.4, vol: 0.2, type: 'sine' },
      coin: { f1: 1200, f2: 1800, dur: 0.15, vol: 0.15, type: 'sine' },
      achievement: { f1: 800, f2: 2400, dur: 0.6, vol: 0.25, type: 'sine' },
      levelup: { f1: 400, f2: 2000, dur: 0.8, vol: 0.25, type: 'triangle' },
      spin: { f1: 300, f2: 800, dur: 0.1, vol: 0.1, type: 'square' },
      win: { f1: 600, f2: 1800, dur: 0.8, vol: 0.25, type: 'sine' },
      lose: { f1: 400, f2: 150, dur: 0.4, vol: 0.2, type: 'sawtooth' }
    };

    const t = tones[type] || tones.click;
    osc.frequency.setValueAtTime(t.f1, now);
    osc.frequency.exponentialRampToValueAtTime(t.f2, now + t.dur);
    gain.gain.setValueAtTime(t.vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + t.dur);
    osc.type = t.type;
    osc.start(now);
    osc.stop(now + t.dur);
  }
};

// ============================================================
// SAQLASH TIZIMI (localStorage)
// ============================================================
const Save = {
  key: 'neon-snake-rpg-save-v1',

  defaultData() {
    return {
      coins: 100,
      gems: 0,
      level: 1,
      xp: 0,
      totalXP: 0,
      ownedSkins: ['default'],
      ownedTrails: ['default'],
      ownedEffects: ['default'],
      equippedSkin: 'default',
      equippedTrail: 'default',
      equippedEffect: 'default',
      achievements: {},
      missions: {
        date: new Date().toDateString(),
        list: []
      },
      stats: {
        gamesPlayed: 0,
        totalScore: 0,
        bestScore: 0,
        totalLength: 0,
        totalTime: 0,
        totalFood: 0,
        comboMax: 0
      },
      settings: {
        speed: 'normal',
        gridSize: 'medium',
        walls: 'on',
        sound: 'on',
        vibration: 'off'
      }
    };
  },

  data: null,

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        this.data = { ...this.defaultData(), ...JSON.parse(raw) };
      } else {
        this.data = this.defaultData();
      }
    } catch (e) {
      this.data = this.defaultData();
    }
    Audio.enabled = this.data.settings.sound === 'on';
  },

  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.data));
    } catch (e) { console.warn('Saqlash ishlamadi'); }
  },

  reset() {
    this.data = this.defaultData();
    this.save();
  }
};

// ============================================================
// SKINLAR, TRAILLAR, EFFEKTLAR MA'LUMOTLARI
// ============================================================
const ITEMS = {
  skins: [
    { id: 'default', name: 'Neon Yashil', color: '#00ff88', price: 0, currency: 'coin', rarity: 'common', icon: '🟢', desc: 'Standart ilon' },
    { id: 'blue', name: 'Muz Ko\'k', color: '#33ccff', price: 100, currency: 'coin', rarity: 'common', icon: '🔵', desc: 'Sovuq neon' },
    { id: 'pink', name: 'Pushti Neon', color: '#ff33aa', price: 200, currency: 'coin', rarity: 'rare', icon: '🩷', desc: 'Yorqin pushti' },
    { id: 'yellow', name: 'Oltin', color: '#ffcc00', price: 400, currency: 'coin', rarity: 'rare', icon: '🟡', desc: 'Oltin ilon' },
    { id: 'purple', name: 'Binafsha', color: '#cc33ff', price: 600, currency: 'coin', rarity: 'epic', icon: '🟣', desc: 'Sirli binafsha' },
    { id: 'fire', name: 'Olov', color: '#ff5500', price: 1000, currency: 'coin', rarity: 'epic', icon: '🔴', desc: 'Olovli ilon' },
    { id: 'ice', name: 'Muz', color: '#aaddff', price: 1500, currency: 'coin', rarity: 'epic', icon: '❄️', desc: 'Muzli ilon' },
    { id: 'rainbow', name: 'Kamalak', color: 'rainbow', price: 30, currency: 'gem', rarity: 'legendary', icon: '🌈', desc: 'Rang o\'zgaruvchan' },
    { id: 'galaxy', name: 'Galaktika', color: 'galaxy', price: 50, currency: 'gem', rarity: 'legendary', icon: '🌌', desc: 'Kosmik ilon' },
    { id: 'matrix', name: 'Matrix', color: '#00ff00', price: 80, currency: 'gem', rarity: 'legendary', icon: '💊', desc: 'Yashil kod' }
  ],

  trails: [
    { id: 'default', name: 'Oddiy', color: '#00ff88', price: 0, currency: 'coin', rarity: 'common', icon: '✨', desc: 'Standart iz' },
    { id: 'sparkle', name: 'Yulduzli', color: '#ffffff', price: 150, currency: 'coin', rarity: 'common', icon: '⭐', desc: 'Yulduzlar izi' },
    { id: 'fire', name: 'Olov izi', color: '#ff5500', price: 350, currency: 'coin', rarity: 'rare', icon: '🔥', desc: 'Olovli iz' },
    { id: 'rainbow', name: 'Kamalak izi', color: 'rainbow', price: 700, currency: 'coin', rarity: 'epic', icon: '🌈', desc: 'Rangli iz' },
    { id: 'particles', name: 'Zarralar', color: '#cc33ff', price: 20, currency: 'gem', rarity: 'epic', icon: '💫', desc: 'Zarra effektlar' },
    { id: 'lightning', name: 'Chaqmoq', color: '#ffff00', price: 40, currency: 'gem', rarity: 'legendary', icon: '⚡', desc: 'Elektr izi' }
  ],

  effects: [
    { id: 'default', name: 'Oddiy', price: 0, currency: 'coin', rarity: 'common', icon: '💥', desc: 'Standart portlash' },
    { id: 'explosion', name: 'Katta portlash', price: 200, currency: 'coin', rarity: 'common', icon: '💣', desc: 'Kuchli portlash' },
    { id: 'pixels', name: 'Piksel', price: 400, currency: 'coin', rarity: 'rare', icon: '🟦', desc: 'Piksel effektlar' },
    { id: 'smoke', name: 'Tutun', price: 600, currency: 'coin', rarity: 'rare', icon: '💨', desc: 'Tutun chiqadi' },
    { id: 'shockwave', name: 'To\'lqin', price: 1000, currency: 'coin', rarity: 'epic', icon: '〰️', desc: 'Kuchli to\'lqin' },
    { id: 'supernova', name: 'Supernova', price: 25, currency: 'gem', rarity: 'legendary', icon: '🌟', desc: 'Yulduz portlashi' }
  ]
};

// ============================================================
// YUTUQLAR (ACHIEVEMENTS)
// ============================================================
const ACHIEVEMENTS = [
  { id: 'first_game', name: 'Birinchi qadam', desc: 'Birinchi o\'yinni o\'ynang', icon: '🎮', reward: 10, currency: 'coin',
    check: (s) => s.stats.gamesPlayed >= 1 },
  { id: 'first_food', name: 'Birinchi olma', desc: 'Birinchi olmani yeng', icon: '🍎', reward: 10, currency: 'coin',
    check: (s) => s.stats.totalFood >= 1 },
  { id: 'score_100', name: 'Yuz ball', desc: '100 ball to\'plang', icon: '💯', reward: 25, currency: 'coin',
    check: (s) => s.stats.bestScore >= 100 },
  { id: 'score_500', name: 'Yarim ming', desc: '500 ball to\'plang', icon: '🥈', reward: 50, currency: 'coin',
    check: (s) => s.stats.bestScore >= 500 },
  { id: 'score_1000', name: 'Ming ball', desc: '1000 ball to\'plang', icon: '🥇', reward: 100, currency: 'coin',
    check: (s) => s.stats.bestScore >= 1000 },
  { id: 'score_5000', name: 'Besh ming', desc: '5000 ball to\'plang', icon: '👑', reward: 500, currency: 'coin',
    check: (s) => s.stats.bestScore >= 5000 },
  { id: 'food_50', name: '50 olma', desc: '50 ta olma yeng', icon: '🍏', reward: 50, currency: 'coin',
    check: (s) => s.stats.totalFood >= 50 },
  { id: 'food_200', name: '200 olma', desc: '200 ta olma yeng', icon: '🍎', reward: 150, currency: 'coin',
    check: (s) => s.stats.totalFood >= 200 },
  { id: 'games_10', name: '10 o\'yin', desc: '10 marta o\'ynang', icon: '🎯', reward: 30, currency: 'coin',
    check: (s) => s.stats.gamesPlayed >= 10 },
  { id: 'games_50', name: '50 o\'yin', desc: '50 marta o\'ynang', icon: '🎲', reward: 100, currency: 'coin',
    check: (s) => s.stats.gamesPlayed >= 50 },
  { id: 'length_20', name: 'Uzun ilon', desc: 'Ilon uzunligi 20 ga yetsin', icon: '🐍', reward: 40, currency: 'coin',
    check: (s) => s.stats.totalLength >= 20 },
  { id: 'length_40', name: 'Juda uzun', desc: 'Ilon uzunligi 40 ga yetsin', icon: '🐲', reward: 150, currency: 'coin',
    check: (s) => s.stats.totalLength >= 40 },
  { id: 'time_60', name: '1 daqiqa', desc: '1 daqiqa o\'ynang', icon: '⏱️', reward: 20, currency: 'coin',
    check: (s) => s.stats.totalTime >= 60 },
  { id: 'time_300', name: '5 daqiqa', desc: '5 daqiqa o\'ynang', icon: '⏰', reward: 80, currency: 'coin',
    check: (s) => s.stats.totalTime >= 300 },
  { id: 'combo_5', name: 'Combo x5', desc: '5 ta ketma-ket combo', icon: '🔥', reward: 60, currency: 'coin',
    check: (s) => s.stats.comboMax >= 5 },
  { id: 'combo_10', name: 'Combo x10', desc: '10 ta ketma-ket combo', icon: '💥', reward: 200, currency: 'coin',
    check: (s) => s.stats.comboMax >= 10 },
  { id: 'rich_1000', name: 'Boy', desc: '1000 coin yig\'ing', icon: '💰', reward: 50, currency: 'coin',
    check: (s) => s.coins >= 1000 },
  { id: 'rich_10000', name: 'Millioner', desc: '10000 coin yig\'ing', icon: '💎', reward: 500, currency: 'coin',
    check: (s) => s.coins >= 10000 },
  { id: 'level_10', name: 'Tajribali', desc: '10-darajaga yeting', icon: '⭐', reward: 100, currency: 'coin',
    check: (s) => s.level >= 10 },
  { id: 'level_25', name: 'Usta', desc: '25-darajaga yeting', icon: '🌟', reward: 300, currency: 'coin',
    check: (s) => s.level >= 25 },
  { id: 'shopper', name: 'Xaridor', desc: '5 ta narsa sotib oling', icon: '🛒', reward: 80, currency: 'coin',
    check: (s) => (s.ownedSkins.length + s.ownedTrails.length + s.ownedEffects.length) >= 8 }
];

// ============================================================
// MISSIYALAR (kunlik)
// ============================================================
const MISSION_TEMPLATES = [
  { id: 'play_3', name: '3 marta o\'ynang', desc: 'Bugun 3 marta o\'ynang', icon: '🎮',
    target: 3, reward: 50, currency: 'coin', stat: 'gamesToday' },
  { id: 'score_300', name: '300 ball', desc: 'Bir o\'yinda 300 ball', icon: '🎯',
    target: 300, reward: 80, currency: 'coin', stat: 'scoreToday' },
  { id: 'food_30', name: '30 olma', desc: 'Bugun 30 ta olma yeng', icon: '🍎',
    target: 30, reward: 60, currency: 'coin', stat: 'foodToday' },
  { id: 'play_5', name: '5 marta o\'ynang', desc: 'Bugun 5 marta o\'ynang', icon: '🎲',
    target: 5, reward: 100, currency: 'coin', stat: 'gamesToday' },
  { id: 'score_1000', name: '1000 ball', desc: 'Bir o\'yinda 1000 ball', icon: '🏆',
    target: 1000, reward: 200, currency: 'coin', stat: 'scoreToday' },
  { id: 'time_120', name: '2 daqiqa', desc: 'Bugun 2 daqiqa o\'ynang', icon: '⏰',
    target: 120, reward: 70, currency: 'coin', stat: 'timeToday' },
  { id: 'combo_8', name: 'Combo x8', desc: 'Combo 8 ga yetsin', icon: '🔥',
    target: 8, reward: 120, currency: 'coin', stat: 'comboToday' }
];

// ============================================================
// LEADERBOARD
// ============================================================
const Leaderboard = {
  key: 'neon-snake-rpg-leaderboard',
  data: [],

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      this.data = raw ? JSON.parse(raw) : [];
    } catch (e) { this.data = []; }
  },

  save() {
    localStorage.setItem(this.key, JSON.stringify(this.data));
  },

  add(score, length, time) {
    this.data.push({
      score, length, time,
      date: new Date().toLocaleDateString('uz-UZ'),
      level: Save.data.level
    });
    this.data.sort((a, b) => b.score - a.score);
    this.data = this.data.slice(0, 10);
    this.save();
  },

  clear() {
    this.data = [];
    this.save();
  },

  render() {
    const list = document.getElementById('leaderboard-list');
    if (!list) return;
    list.innerHTML = '';

    if (this.data.length === 0) {
      list.innerHTML = '<div class="empty-leaderboard">Hali rekordlar yo\'q.<br>O\'ynab, birinchi bo\'ling! 🎮</div>';
      return;
    }

    this.data.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'score-item';
      el.style.animationDelay = (i * 0.05) + 's';
      el.innerHTML = `
        <div class="rank">#${i + 1}</div>
        <div class="score">${item.score}</div>
        <div class="date">Lv.${item.level || 1} · ${item.date}</div>
      `;
      list.appendChild(el);
    });
  }
};

// ============================================================
// TOAST (bildirishnomalar)
// ============================================================
const Toast = {
  show(message, type = 'success', duration = 3000) {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('leaving');
      setTimeout(() => el.remove(), 400);
    }, duration);
  }
};

// ============================================================
// CONFETTI (yutuq animatsiyasi)
// ============================================================
const Confetti = {
  burst(count = 50) {
    const container = document.getElementById('confettiContainer');
    const colors = ['#00ff88', '#33ccff', '#cc33ff', '#ffcc00', '#ff3355', '#ff8800'];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';

      if (Math.random() > 0.5) piece.style.borderRadius = '50%';

      container.appendChild(piece);
      setTimeout(() => piece.remove(), 5000);
    }
  }
};

// ============================================================
// LEVEL TIZIMI
// ============================================================
const Level = {
  // Level uchun kerakli XP (formula)
  xpForLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.5));
  },

  // Jami XP dan level hisoblash
  calcLevel(totalXP) {
    let level = 1;
    let remaining = totalXP;
    while (remaining >= this.xpForLevel(level) && level < 100) {
      remaining -= this.xpForLevel(level);
      level++;
    }
    return { level, currentXP: remaining, neededXP: this.xpForLevel(level) };
  },

  addXP(amount) {
    Save.data.totalXP += amount;
    const info = this.calcLevel(Save.data.totalXP);
    const oldLevel = Save.data.level;

    Save.data.level = info.level;
    Save.data.xp = info.currentXP;

    if (info.level > oldLevel) {
      this.onLevelUp(info.level);
    }

    this.updateUI();
    Save.save();
    return info;
  },

  onLevelUp(newLevel) {
    Audio.play('levelup');
    Confetti.burst(40);
    Toast.show(`🎉 LEVEL ${newLevel}! Tabriklaymiz!`, 'epic', 4000);

    // Level sovg'asi
    const reward = newLevel * 50;
    Currency.addCoins(reward, false);
    Toast.show(`+${reward} 🪙 sovg'a`, 'success');

    // Har 5 level'da gem
    if (newLevel % 5 === 0) {
      Currency.addGems(1, false);
      Toast.show(`+1 💎 sovg'a`, 'epic', 4000);
    }
  },

  updateUI() {
    const info = this.calcLevel(Save.data.totalXP);
    const badge = document.getElementById('levelBadge');
    const fill = document.getElementById('xpFillMini');
    if (badge) badge.textContent = info.level;
    if (fill) fill.style.width = (info.currentXP / info.neededXP * 100) + '%';
  }
};

// ============================================================
// VALYUTA TIZIMI
// ============================================================
const Currency = {
  addCoins(amount, animate = true) {
    Save.data.coins += amount;
    this.updateUI();
    if (animate) {
      Audio.play('coin');
      this.bump('coinCount');
    }
    Save.save();
  },

  addGems(amount, animate = true) {
    Save.data.gems += amount;
    this.updateUI();
    if (animate) {
      Audio.play('coin');
      this.bump('gemCount');
    }
    Save.save();
  },

  spendCoins(amount) {
    if (Save.data.coins < amount) {
      Toast.show('Yetarli coin yo\'q!', 'error');
      Audio.play('lose');
      return false;
    }
    Save.data.coins -= amount;
    this.updateUI();
    Save.save();
    return true;
  },

  spendGems(amount) {
    if (Save.data.gems < amount) {
      Toast.show('Yetarli gem yo\'q!', 'error');
      Audio.play('lose');
      return false;
    }
    Save.data.gems -= amount;
    this.updateUI();
    Save.save();
    return true;
  },

  updateUI() {
    const coin = document.getElementById('coinCount');
    const gem = document.getElementById('gemCount');
    if (coin) coin.textContent = Save.data.coins.toLocaleString();
    if (gem) gem.textContent = Save.data.gems.toLocaleString();
  },

  bump(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const parent = el.closest('.curr-item');
    if (parent) {
      parent.classList.add('bump');
      setTimeout(() => parent.classList.remove('bump'), 400);
    }
  }
};

// ============================================================
// ACHIEVEMENTS TIZIMI
// ============================================================
const Achievements = {
  check() {
    let unlocked = 0;
    ACHIEVEMENTS.forEach(ach => {
      if (Save.data.achievements[ach.id]) {
        unlocked++;
      } else if (ach.check(Save.data)) {
        this.unlock(ach);
        unlocked++;
      }
    });
    return unlocked;
  },

  unlock(ach) {
    Save.data.achievements[ach.id] = Date.now();

    setTimeout(() => {
      Audio.play('achievement');
      Confetti.burst(30);
      Toast.show(`🏆 ${ach.icon} ${ach.name}`, 'epic', 4000);
      if (ach.currency === 'coin') Currency.addCoins(ach.reward, false);
      else Currency.addGems(ach.reward, false);
      Save.save();
      this.render();
    }, 500);
  },

  render() {
    const list = document.getElementById('achievementsList');
    if (!list) return;
    list.innerHTML = '';

    ACHIEVEMENTS.forEach((ach, i) => {
      const unlocked = !!Save.data.achievements[ach.id];
      const el = document.createElement('div');
      el.className = 'ach-item' + (unlocked ? ' unlocked' : '');
      el.style.animationDelay = (i * 0.03) + 's';
      el.innerHTML = `
        <div class="ach-icon" style="color:${unlocked ? '#00ff88' : '#667'}">${ach.icon}</div>
        <div class="ach-info">
          <div class="ach-name">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
        </div>
        <div class="ach-progress">${unlocked ? '✓' : ''}</div>
        <div class="ach-reward">+${ach.reward} ${ach.currency === 'coin' ? '🪙' : '💎'}</div>
      `;
      list.appendChild(el);
    });

    // Progress
    const unlockedCount = Object.keys(Save.data.achievements).length;
    const progEl = document.getElementById('achProgress');
    if (progEl) progEl.textContent = `${unlockedCount}/${ACHIEVEMENTS.length}`;
  }
};

// ============================================================
// MISSIYALAR TIZIMI
// ============================================================
const Missions = {
  load() {
    const today = new Date().toDateString();
    if (Save.data.missions.date !== today) {
      // Yangi kun — yangi missiyalar
      this.generate();
      Save.data.missions.date = today;
      Save.save();
    }
  },

  generate() {
    // 3 ta tasodifiy missiya
    const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
    Save.data.missions.list = shuffled.slice(0, 3).map(m => ({
      id: m.id,
      name: m.name,
      desc: m.desc,
      icon: m.icon,
      target: m.target,
      reward: m.reward,
      currency: m.currency,
      stat: m.stat,
      progress: 0,
      claimed: false
    }));
  },

  addProgress(stat, amount) {
    Save.data.missions.list.forEach(m => {
      if (m.stat === stat && !m.claimed) {
        m.progress = Math.max(m.progress, amount);
      }
    });
  },

  increment(stat, amount) {
    Save.data.missions.list.forEach(m => {
      if (m.stat === stat && !m.claimed) {
        m.progress += amount;
      }
    });
    Save.save();
  },

  claim(id) {
    const m = Save.data.missions.list.find(x => x.id === id);
    if (!m || m.claimed || m.progress < m.target) return;

    m.claimed = true;
    if (m.currency === 'coin') Currency.addCoins(m.reward);
    else Currency.addGems(m.reward);

    Audio.play('achievement');
    Confetti.burst(30);
    Toast.show(`🎁 Missiya bajarildi! +${m.reward} ${m.currency === 'coin' ? '🪙' : '💎'}`, 'success', 4000);

    Save.save();
    this.render();
  },

  render() {
    const list = document.getElementById('missionsList');
    if (!list) return;
    list.innerHTML = '';

    if (!Save.data.missions.list.length) {
      list.innerHTML = '<div class="empty-leaderboard">Missiyalar yuklanmoqda...</div>';
      return;
    }

    Save.data.missions.list.forEach((m, i) => {
      const pct = Math.min(100, (m.progress / m.target) * 100);
      const completed = m.progress >= m.target;
      const el = document.createElement('div');
      el.className = 'mission-item' + (completed ? ' completed' : '');
      el.style.animationDelay = (i * 0.05) + 's';
      el.innerHTML = `
        <div class="mission-header">
          <div class="mission-icon">${m.icon}</div>
          <div class="mission-info">
            <div class="mission-name">${m.name}</div>
            <div class="mission-desc">${m.desc}</div>
          </div>
        </div>
        <div class="mission-progress">
          <div class="mission-fill" style="width:${pct}%"></div>
        </div>
        <div class="mission-footer">
          <div class="mission-reward">${m.progress} / ${m.target} · +${m.reward} ${m.currency === 'coin' ? '🪙' : '💎'}</div>
          <button class="mission-claim" ${!completed || m.claimed ? 'disabled' : ''}
                  onclick="Missions.claim('${m.id}')">
            ${m.claimed ? '✓ OLINDI' : completed ? 'OLISH' : 'DAVOM'}
          </button>
        </div>
      `;
      list.appendChild(el);
    });
  }
};

// ============================================================
// SHOP TIZIMI
// ============================================================
const Shop = {
  currentTab: 'skins',

  render(tab = 'skins') {
    this.currentTab = tab;
    const content = document.getElementById('shopContent');
    if (!content) return;
    content.innerHTML = '';

    const items = ITEMS[tab];
    items.forEach((item, i) => {
      const owned = this.isOwned(item.id, tab);
      const equipped = this.isEquipped(item.id, tab);
      const el = document.createElement('div');
      el.className = 'shop-item' + (owned ? ' owned' : '') + (equipped ? ' equipped' : '');
      el.style.animationDelay = (i * 0.04) + 's';

      // Preview rang
      let previewColor = item.color || '#00ff88';
      if (previewColor === 'rainbow') previewColor = 'linear-gradient(90deg,#ff0000,#ff8800,#ffff00,#00ff00,#0088ff,#8800ff)';
      else if (previewColor === 'galaxy') previewColor = 'linear-gradient(135deg,#000428,#004e92)';

      el.innerHTML = `
        <div class="rarity ${item.rarity}">${item.rarity}</div>
        <div class="preview" style="background:${previewColor.includes('gradient') ? previewColor : 'transparent'}; ${!previewColor.includes('gradient') ? 'background:' + previewColor + '20;color:' + previewColor : ''}">
          ${item.icon}
        </div>
        <div class="name">${item.name}</div>
        <div class="desc">${item.desc}</div>
        <div class="price ${item.currency === 'gem' ? 'gem' : ''}">
          ${owned ? '✓ Sotib olingan' : `${item.price} ${item.currency === 'coin' ? '🪙' : '💎'}`}
        </div>
        <button class="btn secondary buy-btn" onclick="Shop.action('${tab}', '${item.id}')">
          ${equipped ? '✓ TANLANGAN' : owned ? 'TANLASH' : 'SOTIB OLISH'}
        </button>
      `;
      content.appendChild(el);
    });
  },

  isOwned(id, tab) {
    const key = 'owned' + tab.charAt(0).toUpperCase() + tab.slice(1, -1) + 's';
    // ownedSkins, ownedTrails, ownedEffects
    const map = { skins: 'ownedSkins', trails: 'ownedTrails', effects: 'ownedEffects' };
    return Save.data[map[tab]].includes(id);
  },

  isEquipped(id, tab) {
    const map = { skins: 'equippedSkin', trails: 'equippedTrail', effects: 'equippedEffect' };
    return Save.data[map[tab]] === id;
  },

  action(tab, id) {
    Audio.play('click');
    const map = { skins: 'ownedSkins', trails: 'ownedTrails', effects: 'ownedEffects' };
    const equipMap = { skins: 'equippedSkin', trails: 'equippedTrail', effects: 'equippedEffect' };

    const owned = Save.data[map[tab]].includes(id);
    const item = ITEMS[tab].find(x => x.id === id);

    if (!owned) {
      // Sotib olish
      if (item.currency === 'coin') {
        if (!Currency.spendCoins(item.price)) return;
      } else {
        if (!Currency.spendGems(item.price)) return;
      }
      Save.data[map[tab]].push(id);
      Audio.play('buy');
      Toast.show(`🎉 ${item.name} sotib olindi!`, 'success');
      Confetti.burst(20);
      Achievements.check();
    }

    // Equip
    Save.data[equipMap[tab]] = id;
    Save.save();
    this.render(tab);
  },

  openLootbox(price, currency) {
    if (currency === 'coin') {
      if (!Currency.spendCoins(price)) return;
    } else {
      if (!Currency.spendGems(price)) return;
    }

    // Random mukofot
    const rewards = [
      { type: 'coins', amount: 50, weight: 30, icon: '🪙', name: '50 Coin' },
      { type: 'coins', amount: 150, weight: 20, icon: '🪙', name: '150 Coin' },
      { type: 'coins', amount: 500, weight: 10, icon: '🪙', name: '500 Coin' },
      { type: 'gems', amount: 1, weight: 15, icon: '💎', name: '1 Gem' },
      { type: 'gems', amount: 5, weight: 5, icon: '💎', name: '5 Gem' },
      { type: 'skin', weight: 10, icon: '🎨', name: 'Tasodifiy skin' },
      { type: 'trail', weight: 5, icon: '✨', name: 'Tasodifiy trail' },
      { type: 'effect', weight: 5, icon: '💥', name: 'Tasodifiy effekt' }
    ];

    // Weight-based random
    const totalWeight = rewards.reduce((s, r) => s + r.weight, 0);
    let rand = Math.random() * totalWeight;
    let selected = rewards[0];
    for (const r of rewards) {
      if (rand < r.weight) { selected = r; break; }
      rand -= r.weight;
    }

    // Lootbox animatsiya
    const modal = document.getElementById('lootboxModal');
    const anim = document.getElementById('lootboxAnim');
    const result = document.getElementById('lootboxResult');
    modal.classList.add('active');
    anim.classList.remove('opening');
    result.innerHTML = '';
    result.className = 'lootbox-result';

    setTimeout(() => {
      anim.classList.add('opening');

      setTimeout(() => {
        // Mukofotni berish
        let finalName = selected.name;
        let finalIcon = selected.icon;
        let cls = 'win';

        if (selected.type === 'coins') {
          Currency.addCoins(selected.amount);
        } else if (selected.type === 'gems') {
          Currency.addGems(selected.amount);
        } else if (selected.type === 'skin') {
          // Tasodifiy sotib olinmagan skin
          const available = ITEMS.skins.filter(s => !Save.data.ownedSkins.includes(s.id) && s.price > 0);
          if (available.length > 0) {
            const s = available[Math.floor(Math.random() * available.length)];
            Save.data.ownedSkins.push(s.id);
            finalName = s.name;
            finalIcon = s.icon;
            cls = 'win mega';
            Save.save();
          } else {
            Currency.addCoins(200);
            finalName = '200 Coin (hammasi bor)';
            finalIcon = '🪙';
          }
        } else if (selected.type === 'trail') {
          const available = ITEMS.trails.filter(s => !Save.data.ownedTrails.includes(s.id) && s.price > 0);
          if (available.length > 0) {
            const s = available[Math.floor(Math.random() * available.length)];
            Save.data.ownedTrails.push(s.id);
            finalName = s.name;
            finalIcon = s.icon;
            cls = 'win mega';
            Save.save();
          } else {
            Currency.addCoins(200);
            finalName = '200 Coin (hammasi bor)';
            finalIcon = '🪙';
          }
        } else if (selected.type === 'effect') {
          const available = ITEMS.effects.filter(s => !Save.data.ownedEffects.includes(s.id) && s.price > 0);
          if (available.length > 0) {
            const s = available[Math.floor(Math.random() * available.length)];
            Save.data.ownedEffects.push(s.id);
            finalName = s.name;
            finalIcon = s.icon;
            cls = 'win mega';
            Save.save();
          } else {
            Currency.addCoins(200);
            finalName = '200 Coin (hammasi bor)';
            finalIcon = '🪙';
          }
        }

        Audio.play('win');
        Confetti.burst(60);
        result.className = 'lootbox-result ' + cls;
        result.innerHTML = `
          <div>
            <span class="result-icon">${finalIcon}</span>
            <span class="result-name">${finalName}</span>
          </div>
        `;

        Achievements.check();
        Save.save();
      }, 1500);
    }, 200);
  },

  closeLootbox() {
    document.getElementById('lootboxModal').classList.remove('active');
    this.render(this.currentTab);
  }
};

// ============================================================
// KASINO
// ============================================================
const Casino = {
  currentBet: 10,
  spinning: false,

  setBet(bet) {
    this.currentBet = bet;
    document.querySelectorAll('#betSelector button').forEach(b => {
      b.classList.toggle('active', parseInt(b.dataset.bet) === bet);
    });
    const btn = document.getElementById('spinBtn');
    if (btn) btn.textContent = `🎰 SPIN (${bet} 🪙)`;
  },

  spin() {
    if (this.spinning) return;
    if (!Currency.spendCoins(this.currentBet)) return;

    this.spinning = true;
    const reels = [
      document.getElementById('reel1'),
      document.getElementById('reel2'),
      document.getElementById('reel3')
    ];
    const result = document.getElementById('slotResult');
    result.textContent = 'Aylanmoqda...';
    result.className = 'slot-result';

    const icons = ['🍎', '💎', '🌟', '🔔', '🍒', '7️⃣'];
    const finalIcons = [];

    // Har bir reelni aylantirish
    reels.forEach((r, i) => {
      r.classList.add('spinning');
      r.classList.remove('win');

      const spinInterval = setInterval(() => {
        r.textContent = icons[Math.floor(Math.random() * icons.length)];
        Audio.play('spin');
      }, 80);

      setTimeout(() => {
        clearInterval(spinInterval);
        r.classList.remove('spinning');

        const final = icons[Math.floor(Math.random() * icons.length)];
        r.textContent = final;
        finalIcons[i] = final;

        // Oxirgi reel to'xtaganda natijani tekshirish
        if (i === 2) {
          this.checkResult(finalIcons, reels, result);
        }
      }, 1000 + i * 400);
    });
  },

  checkResult(icons, reels, result) {
    const [a, b, c] = icons;
    let win = 0;
    let msg = '';
    let cls = 'lose';

    if (a === b && b === c) {
      // Uchta bir xil
      if (a === '7️⃣') {
        win = this.currentBet * 100;
        msg = `🎉🎉 JACKPOT! +${win} 🪙`;
        cls = 'mega';
      } else if (a === '🌟') {
        win = this.currentBet * 50;
        msg = `✨ SUPER! +${win} 🪙`;
        cls = 'mega';
      } else if (a === '💎') {
        win = this.currentBet * 30;
        msg = `💎 AJOYIB! +${win} 🪙`;
        cls = 'mega';
      } else {
        win = this.currentBet * 10;
        msg = `🎉 UCHTA BIR XIL! +${win} 🪙`;
        cls = 'win';
      }
      reels.forEach(r => r.classList.add('win'));
    } else if (a === b || b === c || a === c) {
      // Ikkita bir xil
      win = Math.floor(this.currentBet * 1.5);
      msg = `👍 Ikki bir xil! +${win} 🪙`;
      cls = 'win';
    } else {
      msg = `😢 Yutqazdingiz. Yana urinib ko'ring!`;
      cls = 'lose';
    }

    setTimeout(() => {
      result.textContent = msg;
      result.className = 'slot-result ' + cls;

      if (win > 0) {
        Currency.addCoins(win);
        Audio.play('win');
        if (cls === 'mega') Confetti.burst(80);
        else Confetti.burst(30);
      } else {
        Audio.play('lose');
      }

      this.spinning = false;
      Achievements.check();
      Save.save();
    }, 400);
  }
};

// ============================================================
// INVENTAR
// ============================================================
const Inventory = {
  render() {
    this.renderSection('invSkins', 'skins', 'ownedSkins', 'equippedSkin');
    this.renderSection('invTrails', 'trails', 'ownedTrails', 'equippedTrail');
    this.renderSection('invEffects', 'effects', 'ownedEffects', 'equippedEffect');
  },

  renderSection(containerId, tab, ownedKey, equipKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    ITEMS[tab].forEach(item => {
      const owned = Save.data[ownedKey].includes(item.id);
      const equipped = Save.data[equipKey] === item.id;

      const el = document.createElement('div');
      el.className = 'inv-item' + (equipped ? ' equipped' : '') + (!owned ? ' locked' : '');

      let previewColor = item.color || '#00ff88';
      el.innerHTML = `
        <div class="inv-preview" style="color:${previewColor.includes('gradient') ? '#fff' : previewColor}">${item.icon}</div>
        <div class="inv-name">${item.name}</div>
      `;

      if (owned) {
        el.addEventListener('click', () => {
          Save.data[equipKey] = item.id;
          Save.save();
          Audio.play('click');
          this.render();
          Toast.show(`✓ ${item.name} tanlandi`, 'success', 1500);
        });
      }

      container.appendChild(el);
    });
  }
};

// ============================================================
// ASOSIY O'YIN
// ============================================================
const Game = {
  canvas: null,
  ctx: null,
  cellSize: 24,
  gridW: 25,
  gridH: 25,

  snake: [],
  direction: { x: 1, y: 0 },
  nextDirection: { x: 1, y: 0 },
  food: null,
  powerups: [],
  particles: [],
  score: 0,
  speed: 1,
  baseInterval: 140,
  currentInterval: 140,
  lastMove: 0,
  running: false,
  paused: false,
  gameOver: false,
  startTime: 0,
  elapsed: 0,

  // Combo
  combo: 1,
  lastEatTime: 0,
  comboTimeout: 2000,

  // Session statistikasi
  sessionFood: 0,
  sessionComboMax: 1,

  activePowerup: null,
  powerupEnd: 0,

  rafId: null,

  // ============================================================
  // INIT
  // ============================================================
  init() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    Save.load();
    Leaderboard.load();
    Missions.load();

    // Bugungi statistikani reset
    Save.data.statsToday = Save.data.statsToday || {};
    if (Save.data.statsToday.date !== new Date().toDateString()) {
      Save.data.statsToday = {
        date: new Date().toDateString(),
        games: 0,
        score: 0,
        food: 0,
        time: 0,
        combo: 0
      };
      Save.save();
    }

    this.setupEventListeners();
    this.setupSettingsUI();
    this.generateStars();

    // UI yangilash
    Currency.updateUI();
    Level.updateUI();
    Achievements.render();
    Missions.render();
    Leaderboard.render();

    window.addEventListener('resize', () => this.resizeCanvas());
  },

  generateStars() {
    const container = document.getElementById('stars');
    if (!container) return;
    for (let i = 0; i < 60; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      container.appendChild(star);
    }
  },

  // ============================================================
  // SAHIFA ALMASHISH
  // ============================================================
  showPage(name) {
    Audio.init();
    Audio.play('click');

    document.querySelectorAll('.page').forEach(p => {
      if (p.classList.contains('active')) {
        p.classList.add('leaving');
        setTimeout(() => p.classList.remove('active', 'leaving'), 400);
      }
    });

    setTimeout(() => {
      const page = document.getElementById('page-' + name);
      if (!page) return;
      page.classList.add('active');

      // Sahifaga qarab yangilash
      switch (name) {
        case 'game':
          this.startGame();
          break;
        case 'shop':
          Shop.render(Shop.currentTab);
          break;
        case 'inventory':
          Inventory.render();
          break;
        case 'achievements':
          Achievements.render();
          break;
        case 'missions':
          Missions.render();
          break;
        case 'leaderboard':
          Leaderboard.render();
          break;
        case 'casino':
          Casino.setBet(Casino.currentBet);
          break;
      }

      if (name !== 'game' && this.running) {
        this.stopGame();
      }
    }, 100);
  },

  // ============================================================
  // CANVAS
  // ============================================================
  resizeCanvas() {
    const wrap = document.getElementById('game-canvas-wrap');
    if (!wrap || !this.canvas) return;
    const maxW = wrap.clientWidth - 40;
    const maxH = wrap.clientHeight - 40;
    const size = Math.min(maxW, maxH);
    this.canvas.width = size;
    this.canvas.height = size;
    this.cellSize = size / this.gridW;
  },

  // ============================================================
  // SOZLAMALAR UI
  // ============================================================
  setupSettingsUI() {
    document.querySelectorAll('[data-setting]').forEach(group => {
      const key = group.dataset.setting;
      group.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
          group.querySelectorAll('button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          Save.data.settings[key] = btn.dataset.value;
          Save.save();
          Audio.enabled = Save.data.settings.sound === 'on';
          Audio.play('click');
        });
      });
      // Active holatni saqlashdan tiklash
      group.querySelectorAll('button').forEach(b => {
        b.classList.toggle('active', b.dataset.value === Save.data.settings[key]);
      });
    });
  },

  resetSettings() {
    Save.data.settings = {
      speed: 'normal', gridSize: 'medium', walls: 'on', sound: 'on', vibration: 'off'
    };
    Save.save();
    this.setupSettingsUI();
    Audio.play('click');
    Toast.show('Sozlamalar qayta o\'rnatildi', 'success');
  },

  resetProgress() {
    if (!confirm('⚠ BARCHA progress (coin, level, skinlar) o\'chiriladi. Ishonchingiz komilmi?')) return;
    Save.reset();
    localStorage.removeItem(Leaderboard.key);
    Leaderboard.data = [];
    location.reload();
  },

  // ============================================================
  // INPUT
  // ============================================================
  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.running) return;
      const key = e.key.toLowerCase();

      if (key === ' ' || key === 'escape') {
        e.preventDefault();
        this.togglePause();
        return;
      }
      if (this.paused) return;

      let newDir = null;
      if (key === 'arrowup' || key === 'w') newDir = { x: 0, y: -1 };
      else if (key === 'arrowdown' || key === 's') newDir = { x: 0, y: 1 };
      else if (key === 'arrowleft' || key === 'a') newDir = { x: -1, y: 0 };
      else if (key === 'arrowright' || key === 'd') newDir = { x: 1, y: 0 };

      if (newDir) {
        e.preventDefault();
        if (newDir.x === -this.direction.x && newDir.y === -this.direction.y) return;
        this.nextDirection = newDir;
      }
    });

    // Touch
    let touchStart = null;
    this.canvas.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      touchStart = { x: t.clientX, y: t.clientY };
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (!touchStart) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.x;
      const dy = t.clientY - touchStart.y;
      if (Math.abs(dx) < 20 && Math.abs(dy) < 20) return;

      if (Math.abs(dx) > Math.abs(dy)) this.setDirection(dx > 0 ? 'right' : 'left');
      else this.setDirection(dy > 0 ? 'down' : 'up');
      touchStart = null;
    }, { passive: true });

    // Bet selector
    const betSel = document.getElementById('betSelector');
    if (betSel) {
      betSel.querySelectorAll('button').forEach(b => {
        b.addEventListener('click', () => Casino.setBet(parseInt(b.dataset.bet)));
      });
    }

    // Shop tabs
    document.querySelectorAll('.shop-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        Shop.render(tab.dataset.tab);
        Audio.play('click');
      });
    });
  },

  setDirection(dir) {
    const map = {
      up: { x: 0, y: -1 }, down: { x: 0, y: 1 },
      left: { x: -1, y: 0 }, right: { x: 1, y: 0 }
    };
    const d = map[dir];
    if (!d) return;
    if (d.x === -this.direction.x && d.y === -this.direction.y) return;
    this.nextDirection = d;
  },

  // ============================================================
  // O'YIN BOSHLASH
  // ============================================================
  startGame() {
    Audio.init();

    const speeds = { slow: 180, normal: 140, fast: 100 };
    this.baseInterval = speeds[Save.data.settings.speed] || 140;
    this.currentInterval = this.baseInterval;

    const sizes = { small: 20, medium: 25, large: 30 };
    this.gridW = sizes[Save.data.settings.gridSize] || 25;
    this.gridH = this.gridW;

    const cx = Math.floor(this.gridW / 2);
    const cy = Math.floor(this.gridH / 2);
    this.snake = [
      { x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }
    ];
    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.speed = 1;
    this.combo = 1;
    this.lastEatTime = 0;
    this.powerups = [];
    this.particles = [];
    this.activePowerup = null;
    this.powerupEnd = 0;
    this.elapsed = 0;
    this.sessionFood = 0;
    this.sessionComboMax = 1;
    this.startTime = performance.now();
    this.lastMove = 0;
    this.running = true;
    this.paused = false;
    this.gameOver = false;

    this.spawnFood();

    document.getElementById('hud-score').textContent = '0';
    document.getElementById('hud-combo').textContent = 'x1';
    document.getElementById('hud-speed').textContent = '1';
    document.getElementById('hud-time').textContent = '0s';
    document.getElementById('pause-overlay').classList.remove('active');
    document.getElementById('powerup-indicator').style.display = 'none';

    this.resizeCanvas();
    this.loop(performance.now());
  },

  stopGame() {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  },

  restart() { this.showPage('game'); },
  backToMenu() { this.stopGame(); this.showPage('menu'); },

  togglePause() {
    if (!this.running || this.gameOver) return;
    this.paused = !this.paused;
    document.getElementById('pause-overlay').classList.toggle('active', this.paused);
    Audio.play('click');
    if (!this.paused) {
      this.lastMove = performance.now();
      this.loop(performance.now());
    }
  },

  // ============================================================
  // SPAWN
  // ============================================================
  spawnFood() {
    let tries = 0;
    while (tries < 100) {
      const x = Math.floor(Math.random() * this.gridW);
      const y = Math.floor(Math.random() * this.gridH);
      if (!this.snake.some(s => s.x === x && s.y === y) &&
          !this.powerups.some(p => p.x === x && p.y === y)) {
        this.food = { x, y, born: performance.now() };
        return;
      }
      tries++;
    }
  },

  spawnPowerup() {
    if (Math.random() > 0.2) return;
    let tries = 0;
    while (tries < 50) {
      const x = Math.floor(Math.random() * this.gridW);
      const y = Math.floor(Math.random() * this.gridH);
      if (!this.snake.some(s => s.x === x && s.y === y) &&
          !this.powerups.some(p => p.x === x && p.y === y) &&
          (!this.food || this.food.x !== x || this.food.y !== y)) {
        const types = ['speed', 'slow', 'double'];
        const type = types[Math.floor(Math.random() * types.length)];
        this.powerups.push({ x, y, type, born: performance.now(), life: 8000 });
        return;
      }
      tries++;
    }
  },

  // ============================================================
  // LOOP
  // ============================================================
  loop(now) {
    if (!this.running || this.paused) return;
    this.rafId = requestAnimationFrame((t) => this.loop(t));

    this.elapsed = (now - this.startTime) / 1000;
    document.getElementById('hud-time').textContent = Math.floor(this.elapsed) + 's';

    // Combo timeout
    if (this.combo > 1 && now - this.lastEatTime > this.comboTimeout) {
      this.combo = 1;
      document.getElementById('hud-combo').textContent = 'x1';
    }

    if (now - this.lastMove >= this.currentInterval) {
      this.lastMove = now;
      this.move();
    }

    if (this.activePowerup && now > this.powerupEnd) {
      this.activePowerup = null;
      document.getElementById('powerup-indicator').style.display = 'none';
      this.currentInterval = this.baseInterval;
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      if (now - this.powerups[i].born > this.powerups[i].life) this.powerups.splice(i, 1);
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx; p.y += p.vy;
      p.vx *= 0.94; p.vy *= 0.94;
      p.life++;
      if (p.life > p.maxLife) this.particles.splice(i, 1);
    }

    this.render(now);
  },

  move() {
    this.direction = { ...this.nextDirection };
    const head = this.snake[0];
    const newHead = { x: head.x + this.direction.x, y: head.y + this.direction.y };

    const wallsOn = Save.data.settings.walls === 'on';
    if (wallsOn) {
      if (newHead.x < 0 || newHead.x >= this.gridW || newHead.y < 0 || newHead.y >= this.gridH) {
        return this.die();
      }
    } else {
      if (newHead.x < 0) newHead.x = this.gridW - 1;
      if (newHead.x >= this.gridW) newHead.x = 0;
      if (newHead.y < 0) newHead.y = this.gridH - 1;
      if (newHead.y >= this.gridH) newHead.y = 0;
    }

    if (this.snake.some(s => s.x === newHead.x && s.y === newHead.y)) return this.die();

    let ate = false;
    if (this.food && newHead.x === this.food.x && newHead.y === this.food.y) {
      ate = true;
      const now = performance.now();

      // Combo hisoblash
      if (now - this.lastEatTime < this.comboTimeout) {
        this.combo = Math.min(10, this.combo + 1);
      } else {
        this.combo = 1;
      }
      this.lastEatTime = now;
      this.sessionComboMax = Math.max(this.sessionComboMax, this.combo);

      const mult = (this.activePowerup === 'double' ? 2 : 1) * this.combo;
      const gain = 10 * mult;
      this.score += gain;
      this.sessionFood++;

      document.getElementById('hud-score').textContent = this.score;
      document.getElementById('hud-combo').textContent = 'x' + this.combo;

      if (this.combo > 1) this.showComboIndicator(this.combo);

      Audio.play('eat');
      this.spawnParticles(
        this.food.x * this.cellSize + this.cellSize / 2,
        this.food.y * this.cellSize + this.cellSize / 2,
        '#ff3355', 15
      );

      this.spawnFood();
      this.spawnPowerup();

      if (this.snake.length % 5 === 0) {
        this.speed++;
        document.getElementById('hud-speed').textContent = this.speed;
        this.baseInterval = Math.max(60, this.baseInterval - 8);
        if (!this.activePowerup) this.currentInterval = this.baseInterval;
      }
    }

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const p = this.powerups[i];
      if (newHead.x === p.x && newHead.y === p.y) {
        this.applyPowerup(p.type);
        this.powerups.splice(i, 1);
        Audio.play('powerup');
      }
    }

    this.snake.unshift(newHead);
    if (!ate) this.snake.pop();
  },

  showComboIndicator(combo) {
    const el = document.getElementById('combo-indicator');
    el.textContent = `COMBO x${combo}!`;
    el.classList.remove('combo-pop');
    void el.offsetWidth;
    el.classList.add('combo-pop');
  },

  applyPowerup(type) {
    const now = performance.now();
    const ind = document.getElementById('powerup-indicator');

    if (type === 'speed') {
      this.activePowerup = 'speed';
      this.currentInterval = Math.max(50, this.baseInterval * 0.6);
      this.powerupEnd = now + 5000;
      ind.textContent = '⚡ TEZLIK';
      ind.style.color = '#ffcc00';
      ind.style.borderColor = '#ffcc00';
      ind.style.display = 'block';
    } else if (type === 'slow') {
      this.activePowerup = 'slow';
      this.currentInterval = this.baseInterval * 1.8;
      this.powerupEnd = now + 5000;
      ind.textContent = '🐢 SEKIN';
      ind.style.color = '#33ccff';
      ind.style.borderColor = '#33ccff';
      ind.style.display = 'block';
    } else if (type === 'double') {
      this.activePowerup = 'double';
      this.powerupEnd = now + 6000;
      ind.textContent = '💎 X2 BALL';
      ind.style.color = '#cc33ff';
      ind.style.borderColor = '#cc33ff';
      ind.style.display = 'block';
    }
  },

  spawnParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = Math.random() * 4 + 1;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * s, vy: Math.sin(a) * s,
        life: 0, maxLife: 30 + Math.random() * 20,
        color, size: Math.random() * 4 + 2
      });
    }
  },

  // ============================================================
  // RENDER
  // ============================================================
  render(now) {
    const ctx = this.ctx;
    const W = this.canvas.width, H = this.canvas.height;
    const cs = this.cellSize;

    ctx.fillStyle = '#0a0a15';
    ctx.fillRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= this.gridW; i++) {
      ctx.beginPath(); ctx.moveTo(i * cs, 0); ctx.lineTo(i * cs, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cs); ctx.lineTo(W, i * cs); ctx.stroke();
    }

    if (Save.data.settings.walls === 'on') {
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.4)';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00ff88';
      ctx.shadowBlur = 15;
      ctx.strokeRect(0, 0, W, H);
      ctx.shadowBlur = 0;
    }

    // Food
    if (this.food) {
      const pulse = Math.sin(now * 0.005) * 0.2 + 0.9;
      const fx = this.food.x * cs + cs / 2;
      const fy = this.food.y * cs + cs / 2;
      ctx.shadowColor = '#ff3355';
      ctx.shadowBlur = 30 * pulse;
      ctx.fillStyle = '#ff3355';
      ctx.beginPath();
      ctx.arc(fx, fy, cs * 0.35 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ff88aa';
      ctx.beginPath();
      ctx.arc(fx - cs * 0.1, fy - cs * 0.1, cs * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }

    // Powerups
    for (const p of this.powerups) {
      const px = p.x * cs + cs / 2;
      const py = p.y * cs + cs / 2;
      const pulse = Math.sin(now * 0.008) * 0.2 + 0.9;
      const remain = 1 - (now - p.born) / p.life;
      const colors = { speed: '#ffcc00', slow: '#33ccff', double: '#cc33ff' };
      const icons = { speed: '⚡', slow: '🐢', double: '💎' };
      const c = colors[p.type];
      const alpha = remain < 0.3 ? (Math.sin(now * 0.02) * 0.5 + 0.5) : 1;

      ctx.globalAlpha = alpha;
      ctx.shadowColor = c;
      ctx.shadowBlur = 25 * pulse;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(px, py, cs * 0.4 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.font = `${cs * 0.5}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#05050a';
      ctx.fillText(icons[p.type], px, py + 1);
      ctx.globalAlpha = 1;
    }

    // Snake
    const skin = ITEMS.skins.find(s => s.id === Save.data.equippedSkin) || ITEMS.skins[0];
    const skinColor = skin.color;
    const rainbowMode = skinColor === 'rainbow';
    const galaxyMode = skinColor === 'galaxy';

    for (let i = this.snake.length - 1; i >= 0; i--) {
      const seg = this.snake[i];
      const sx = seg.x * cs;
      const sy = seg.y * cs;
      const isHead = i === 0;
      const alpha = isHead ? 1 : 0.4 + (1 - i / this.snake.length) * 0.6;

      let color = skinColor;
      if (rainbowMode) {
        const hue = (i * 20 + now * 0.1) % 360;
        color = `hsl(${hue}, 100%, 60%)`;
      } else if (galaxyMode) {
        const hues = ['#004e92', '#000428', '#4b0082', '#191970'];
        color = hues[i % hues.length];
      }

      if (isHead) {
        ctx.shadowColor = rainbowMode ? '#fff' : color;
        ctx.shadowBlur = 25;
      }

      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      const padding = isHead ? 1 : 2;
      const r = isHead ? cs * 0.4 : cs * 0.35;
      this.roundRect(ctx, sx + padding, sy + padding, cs - padding * 2, cs - padding * 2, r);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      if (isHead) {
        const eyeSize = cs * 0.12;
        const eyeOffset = cs * 0.22;
        const cx = sx + cs / 2, cy = sy + cs / 2;
        const dx = this.direction.x, dy = this.direction.y;
        const e1x = cx + dx * eyeOffset - dy * eyeOffset;
        const e1y = cy + dy * eyeOffset + dx * eyeOffset;
        const e2x = cx + dx * eyeOffset + dy * eyeOffset;
        const e2y = cy + dy * eyeOffset - dx * eyeOffset;
        ctx.fillStyle = '#05050a';
        ctx.beginPath(); ctx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2); ctx.fill();
      }
    }

    // Particles
    for (const p of this.particles) {
      const a = 1 - p.life / p.maxLife;
      ctx.globalAlpha = a;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 15;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
  },

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  },

  // ============================================================
  // O'LIM
  // ============================================================
  die() {
    if (this.gameOver) return;
    this.gameOver = true;
    this.running = false;
    Audio.play('die');

    // Zarralar portlashi
    for (const seg of this.snake) {
      this.spawnParticles(
        seg.x * this.cellSize + this.cellSize / 2,
        seg.y * this.cellSize + this.cellSize / 2,
        '#00ff88', 3
      );
    }

    this.canvas.style.animation = 'shakeIn 0.4s';
    setTimeout(() => this.canvas.style.animation = '', 400);

    const finalScore = this.score;
    const finalLength = this.snake.length;
    const finalTime = Math.floor(this.elapsed);

    // Statistika
    Save.data.stats.gamesPlayed++;
    Save.data.stats.totalScore += finalScore;
    Save.data.stats.bestScore = Math.max(Save.data.stats.bestScore, finalScore);
    Save.data.stats.totalLength = Math.max(Save.data.stats.totalLength, finalLength);
    Save.data.stats.totalTime += finalTime;
    Save.data.stats.totalFood += this.sessionFood;
    Save.data.stats.comboMax = Math.max(Save.data.stats.comboMax, this.sessionComboMax);

    // Bugungi statistika
    Save.data.statsToday.games++;
    Save.data.statsToday.score = Math.max(Save.data.statsToday.score, finalScore);
    Save.data.statsToday.food += this.sessionFood;
    Save.data.statsToday.time += finalTime;
    Save.data.statsToday.combo = Math.max(Save.data.statsToday.combo, this.sessionComboMax);

    // Missiyalar progressi
    Missions.increment('gamesToday', 1);
    Missions.addProgress('scoreToday', finalScore);
    Missions.increment('foodToday', this.sessionFood);
    Missions.increment('timeToday', finalTime);
    Missions.addProgress('comboToday', this.sessionComboMax);

    // Mukofotlar
    const coinsEarned = Math.floor(finalScore / 10) + Math.floor(finalTime / 5);
    const xpEarned = Math.floor(finalScore / 5) + finalLength;

    Currency.addCoins(coinsEarned, false);
    Level.addXP(xpEarned);

    // Leaderboard
    const isRecord = !Leaderboard.data[0] || finalScore > Leaderboard.data[0].score;
    Leaderboard.add(finalScore, finalLength, finalTime);

    // Achievements
    Achievements.check();

    // Game Over sahifasi
    setTimeout(() => {
      document.getElementById('go-score').textContent = finalScore;
      document.getElementById('go-length').textContent = finalLength;
      document.getElementById('go-time').textContent = finalTime + 's';
      document.getElementById('new-record').style.display = isRecord ? 'block' : 'none';

      // Mukofotlar paneli
      const rp = document.getElementById('rewardsPanel');
      rp.innerHTML = `
        <h3>🎁 MUKOFOTLAR</h3>
        <div class="reward-row">
          <span class="reward-name">Ball uchun</span>
          <span class="reward-value">+${Math.floor(finalScore / 10)} 🪙</span>
        </div>
        <div class="reward-row">
          <span class="reward-name">Vaqt uchun</span>
          <span class="reward-value">+${Math.floor(finalTime / 5)} 🪙</span>
        </div>
        <div class="reward-row">
          <span class="reward-name">Jami coin</span>
          <span class="reward-value">+${coinsEarned} 🪙</span>
        </div>
        <div class="reward-row">
          <span class="reward-name">XP</span>
          <span class="reward-value xp">+${xpEarned} XP</span>
        </div>
      `;

      this.showPage('gameover');
      if (isRecord) Confetti.burst(60);
    }, 800);
  },

  clearLeaderboard() {
    if (confirm('Barcha rekordlarni o\'chirishni xohlaysizmi?')) {
      Leaderboard.clear();
      Leaderboard.render();
      Audio.play('click');
    }
  }
};

// ============================================================
// ISHGA TUSHIRISH
// ============================================================
window.addEventListener('load', () => {
  Game.init();
});

window.Game = Game;
window.Shop = Shop;
window.Missions = Missions;
window.Casino = Casino;