/**
 * Music player module for APlayer
 * Extracted from inline scripts for caching & deduplication
 */
(function(){
  var STORAGE_KEY = 'memory-music-url';
  var musicPath = '/music';
  var defaultCover = '';
  var defaultName = '昨日重现';
  var fallbackUrl = '';  // Optionally set a fallback music URL here
  var accentColor = '#c084fc';

  var player = null;
  var configOpen = false;
  var welcomeClicked = false;

  function initPlayer(audios) {
    var container = document.getElementById('aplayer');
    if (!container || !audios || audios.length === 0) return;

    if (player) {
      try { player.destroy(); } catch(e) {}
      player = null;
    }
    container.innerHTML = '';

    player = new APlayer({
      container: container,
      mini: true,
      autoplay: false,
      theme: accentColor,
      loop: 'all',
      order: 'list',
      preload: 'auto',
      volume: 0.7,
      mutex: true,
      lrcType: 0,
      audio: audios
    });

    var icon = document.querySelector('#bg-widget-music .bg-widget-icon');
    if (icon) icon.classList.add('is-playing');

    if (welcomeClicked && player.audio && player.audio.paused) player.play();
  }

  function detectGitHubRepo() {
    var host = location.hostname;
    if (host.endsWith('.github.io')) {
      var owner = host.replace('.github.io', '');
      return { repo: owner + '/' + owner + '.github.io', branch: 'main' };
    }
    return null;
  }

  function scanMusicFolder(path) {
    var info = detectGitHubRepo();
    if (!info) return Promise.reject('not GitHub Pages');
    var api = 'https://api.github.com/repos/' + info.repo + '/contents' + path + '?ref=' + info.branch;
    return fetch(api).then(function(r) {
      if (!r.ok) throw new Error('API error');
      return r.json();
    }).then(function(files) {
      if (!Array.isArray(files)) return [];
      return files.filter(function(f) {
        return f.type === 'file' && /\.(mp3|ogg|wav|m4a|flac)$/i.test(f.name);
      }).sort(function(a, b) { return a.name.localeCompare(b.name); }).map(function(f) {
        return {
          name: f.name.replace(/\.[^.]+$/, ''),
          artist: '',
          url: f.download_url,
          cover: defaultCover
        };
      });
    });
  }

  var localUrl = localStorage.getItem(STORAGE_KEY);
  if (localUrl) {
    initPlayer([{ name: defaultName, artist: '', url: localUrl, cover: defaultCover }]);
  } else {
    scanMusicFolder(musicPath).then(function(audios) {
      if (audios.length > 0) {
        initPlayer(audios);
      } else if (fallbackUrl) {
        initPlayer([{ name: defaultName, artist: '', url: fallbackUrl, cover: defaultCover }]);
      }
    }).catch(function() {
      // Busuanzi-style fallback: show error silently or via CSS control
      var container = document.getElementById('aplayer');
      if (container) {
        container.innerHTML = '<div class="bg-widget-desc" style="padding:4px 0;font-style:italic;">音乐加载失败</div>';
      }
    });
  }

  function openConfig() {
    if (configOpen) return;
    configOpen = true;
    var input = document.getElementById('music-url-input');
    var panel = document.getElementById('music-config-panel');
    var aplayerEl = document.getElementById('aplayer');
    if (input) input.value = localStorage.getItem(STORAGE_KEY) || '';
    if (panel) panel.style.display = 'block';
    if (aplayerEl) aplayerEl.style.display = 'none';
    if (input) input.focus();
  }

  function closeConfig() {
    configOpen = false;
    var panel = document.getElementById('music-config-panel');
    var aplayerEl = document.getElementById('aplayer');
    if (panel) panel.style.display = 'none';
    if (aplayerEl) aplayerEl.style.display = '';
  }

  function saveConfig() {
    var input = document.getElementById('music-url-input');
    var url = input ? input.value.trim() : '';
    if (!url) return;
    localStorage.setItem(STORAGE_KEY, url);
    closeConfig();
    initPlayer([{ name: defaultName, artist: '', url: url, cover: defaultCover }]);
  }

  function init() {
    var configBtn = document.getElementById('music-config-btn');
    if (configBtn) configBtn.addEventListener('click', openConfig);

    var saveBtn = document.getElementById('music-save-btn');
    if (saveBtn) saveBtn.addEventListener('click', saveConfig);

    var inputEl = document.getElementById('music-url-input');
    if (inputEl) inputEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') saveConfig();
    });

    var welcomeBtn = document.getElementById('welcome-btn');
    if (welcomeBtn) {
      welcomeBtn.addEventListener('click', function() {
        welcomeClicked = true;
        if (player && player.audio && player.audio.paused) player.play();
      });
    }
  }

  // Initialize on DOMContentLoaded, or immediately if DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
