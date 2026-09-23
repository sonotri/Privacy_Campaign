/* Full-length music by Blackvoid6 (CC BY 4.0). Credits: assets/music/LICENSE.txt. */
(() => {
  'use strict';
  const TRACKS = [
    { title: 'Blast', file: 'blast.mp3' },
    { title: 'Cyberfighter', file: 'cyberfighter.mp3' },
    { title: 'Incoming', file: 'incoming.mp3' },
    { title: 'Venom', file: 'venom.mp3' },
  ];
  const GAME_SCENES = new Set(['how', 'play', 'miss', 'trade', 'cancel', 'jackpot']);
  const QUIET_SCENES = new Set(['reveal', 'used', 'combining', 'combined', 'credits', 'ended']);
  function create() {
    let ctx, master, music, effects, player, preload;
    let enabled = true, screen = 'home', spinning = false, unlocked = false;
    let trackIndex = 0, failures = 0, playPending = null, timer = null;
    const voices = new Set();
    const permitted = () => enabled && !document.hidden && !QUIET_SCENES.has(screen);
    const musicPermitted = () => unlocked && permitted() && GAME_SCENES.has(screen);
    const path = index => `./assets/music/${TRACKS[index].file}`;
    const targetVolume = () => screen === 'jackpot' ? .24 : spinning ? .57 : .50;
    function setMusicLevel(fadeIn = false) {
      if (!player) return;
      // Keep each song's arrangement intact; soften the edges and duck for prizes.
      const ending = Number.isFinite(player.duration) ? Math.min(1, Math.max(0, player.duration - player.currentTime)) : 1;
      const target = musicPermitted() ? targetVolume() * ending : 0;
      if (ctx && music) {
        const at = ctx.currentTime;
        music.gain.cancelScheduledValues(at);
        if (fadeIn) music.gain.setValueAtTime(0, at);
        music.gain.setTargetAtTime(target, at, fadeIn ? .18 : .055);
      } else player.volume = Math.min(1, target * .68);
    }
    function stopTimer() { clearInterval(timer); timer = null; }
    function chooseTrack() {
      player.src = path(trackIndex); player.dataset.track = TRACKS[trackIndex].title; player.load();
    }
    function nextTrack() { trackIndex = (trackIndex + 1) % TRACKS.length; chooseTrack(); sync(); }
    function setupPlayer() {
      if (player) return;
      player = document.createElement('audio'); player.hidden = true;
      player.preload = 'auto'; player.dataset.backgroundMusic = ''; player.loop = false;
      player.setAttribute('aria-hidden', 'true'); document.body.append(player);
      player.addEventListener('playing', () => { failures = 0; setMusicLevel(true); });
      player.addEventListener('timeupdate', () => {
        setMusicLevel();
        // Cache the next complete song near the end without overlapping playback.
        if (Number.isFinite(player.duration) && player.duration - player.currentTime < 15) {
          const next = new URL(path((trackIndex + 1) % TRACKS.length), document.baseURI).href;
          if (preload?.href !== next) {
            preload?.remove(); preload = document.createElement('link');
            preload.rel = 'prefetch'; preload.as = 'audio'; preload.href = next; document.head.append(preload);
          }
        }
      });
      player.addEventListener('ended', nextTrack);
      player.addEventListener('error', () => {
        // Bounded retries: missing music must not block gameplay or loop requests.
        if (++failures < TRACKS.length) nextTrack(); else { player.pause(); stopTimer(); }
      });
      chooseTrack();
    }
    function ensureContext() {
      setupPlayer(); if (ctx) return;
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      ctx = new Audio(); master = ctx.createGain(); music = ctx.createGain(); effects = ctx.createGain();
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -12; compressor.knee.value = 16; compressor.ratio.value = 2;
      compressor.attack.value = .006; compressor.release.value = .18;
      music.gain.value = 0; effects.gain.value = .8; master.gain.value = permitted() ? .68 : 0;
      ctx.createMediaElementSource(player).connect(music);
      music.connect(compressor); effects.connect(compressor); compressor.connect(master); master.connect(ctx.destination);
    }
    function playMusic() {
      if (!player || !musicPermitted() || failures >= TRACKS.length || playPending || !player.paused || player.ended) return;
      playPending = player.play();
      playPending.then(() => { if (!musicPermitted()) player.pause(); }).catch(() => {
        // A user gesture may be required after a browser autoplay rejection.
      }).finally(() => { playPending = null; });
    }
    function sync() {
      if (!player) return;
      if (ctx && master) {
        const at = ctx.currentTime;
        master.gain.cancelScheduledValues(at); master.gain.setTargetAtTime(permitted() ? .68 : 0, at, .012);
      }
      setMusicLevel();
      if (!musicPermitted()) {
        player.pause(); stopTimer();
        if (!permitted() && ctx) for (const voice of voices) { try { voice.stop(ctx.currentTime + .035); } catch {} }
        return;
      }
      playMusic();
      if (!timer) timer = setInterval(() => { setMusicLevel(); playMusic(); }, 250);
    }
    function unlock() {
      if (!permitted()) return;
      unlocked = true;
      try {
        ensureContext();
        if (ctx?.state === 'suspended') ctx.resume().then(sync).catch(() => {});
        sync();
      } catch { /* Optional music must not block the game. */ }
    }
    function update(next) {
      enabled = next.enabled; screen = next.screen; spinning = next.spinning;
      // Navigation, mute, and a new game preserve the song's position.
      sync();
    }
    function effect(frequency = 500, duration = .08, type = 'sine') {
      if (!permitted()) return;
      unlock(); if (!ctx || !effects) return;
      try {
        const osc = ctx.createOscillator(), gain = ctx.createGain(), at = ctx.currentTime;
        osc.type = type; osc.frequency.value = frequency;
        gain.gain.setValueAtTime(.035, at); gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
        osc.connect(gain); gain.connect(effects); osc.start(at); osc.stop(at + duration + .02); voices.add(osc);
        osc.onended = () => { voices.delete(osc); osc.disconnect(); gain.disconnect(); };
      } catch { /* Optional effects. */ }
    }
    document.addEventListener('visibilitychange', () => { sync(); if (unlocked && !document.hidden) unlock(); });
    window.addEventListener('pagehide', () => { if (master && ctx) master.gain.setValueAtTime(0, ctx.currentTime); player?.pause(); stopTimer(); });
    window.addEventListener('pageshow', () => { sync(); if (unlocked && !document.hidden) unlock(); });
    return { update, unlock, effect };
  }
  window.BlackSwanAudio = { create, tracks: TRACKS };
})();
