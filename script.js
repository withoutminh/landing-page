(function () {
  "use strict";

  const CONFIG = window.CONFIG || {};

  const $ = (id) => document.getElementById(id);

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m + ":" + (s < 10 ? "0" : "") + s;
  }

  function applyTheme() {
    const t = CONFIG.theme || {};
    const root = document.documentElement.style;
    if (t.accent) root.setProperty("--accent", t.accent);
    if (t.cardBg) root.setProperty("--card-bg", t.cardBg);
    if (t.playerBg) root.setProperty("--player-bg", t.playerBg);
    if (t.textPrimary) root.setProperty("--text-primary", t.textPrimary);
    if (t.textSecondary) root.setProperty("--text-secondary", t.textSecondary);
  }

  function applyProfile() {
    const site = CONFIG.site || {};
    const profile = CONFIG.profile || {};

    if (site.title) document.title = site.title;

    if (site.iconUrl) {
      const favicon = $("favicon");
      if (favicon) favicon.href = site.iconUrl;
    }

    if (profile.backgroundUrl) {
      $("background").style.backgroundImage = `url("${profile.backgroundUrl}")`;
    }
    if (profile.avatarUrl) {
      const avatar = $("avatar");
      avatar.src = profile.avatarUrl;
      avatar.alt = profile.name || "Avatar";
    }

    if (profile.name) $("name").textContent = profile.name;
    if (profile.quote) $("quote").textContent = profile.quote;
    if (profile.location) $("location").textContent = profile.location;
  }

  function renderSocials() {
    const container = $("socials");
    const socials = CONFIG.socials || [];
    container.innerHTML = "";

    socials.forEach((item) => {
      const a = document.createElement("a");
      a.className = "social-link";
      a.href = item.url || "#";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.title = item.name || "";
      a.setAttribute("aria-label", item.name || "Social link");

      if (item.brand) a.style.setProperty("--brand", item.brand);

      const icon = (item.icon || "").trim();
      if (/^https?:\/\//i.test(icon)) {
        const img = document.createElement("img");
        img.src = icon;
        img.alt = item.name || "";
        img.loading = "lazy";
        img.decoding = "async";
        a.appendChild(img);
      } else {
        a.innerHTML = icon;
      }

      container.appendChild(a);
    });
  }

  const DISCORD_STATUS_LABEL = {
    online: "Online",
    idle: "Idle",
    dnd: "Do Not Disturb",
    offline: "Offline",
  };

  const ACTIVITY_VERB = {
    0: "Playing",
    1: "Streaming",
    2: "Listening to",
    3: "Watching",
    5: "Competing in",
  };

  function applyDiscordData(data) {
    if (!data) return;
    const wrap = $("discord");
    wrap.hidden = false;

    const user = data.discord_user || {};
    const status = data.discord_status || "offline";
    const discordCfg = CONFIG.discord || {};

    const username = user.username || "Discord User";
    const displayName = user.global_name || user.username || "Discord User";
    const shownName =
      discordCfg.useUsername === false ? displayName : username;

    const usernameEl = $("discordUsername");
    usernameEl.textContent = shownName;
    usernameEl.dataset.copy = username;

    renderDiscordBadges();

    const dot = $("discordStatusDot");
    const statusKey = DISCORD_STATUS_LABEL[status] ? status : "offline";
    dot.className = "discord-status-dot " + statusKey;
    dot.style.backgroundImage = `url("assets/icons/${statusKey}.webp")`;

    const avatar = $("discordAvatar");
    if (user.avatar && user.id) {
      const ext = user.avatar.startsWith("a_") ? "gif" : "png";
      avatar.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
    } else {
      avatar.src = "https://cdn.discordapp.com/embed/avatars/0.png";
    }
    avatar.alt = displayName;

    const activities = Array.isArray(data.activities) ? data.activities : [];
    const activity = activities.find((a) => a.type !== 4);

    const stateEl = $("discordState");
    const subEl = $("discordStateSub");
    const img = $("activityImg");

    wrap.classList.toggle("no-activity", !activity);

    if (activity) {
      const verb = ACTIVITY_VERB[activity.type] || "Playing";
      const isSpotify =
        activity.id === "spotify:1" || activity.name === "Spotify";
      const label =
        isSpotify && activity.details ? activity.details : activity.name;
      const safeLabel = label
        ? " " + label.replace(/</g, "&lt;").replace(/>/g, "&gt;")
        : "";
      stateEl.innerHTML =
        `<span class="discord-state-text"><span class="verb">${verb}</span>${safeLabel}</span>`;
      setupActivityMarquee(stateEl);

      subEl.hidden = true;

      const assetUrl = resolveActivityImage(activity);
      if (assetUrl) {
        img.src = assetUrl;
        img.hidden = false;
      } else {
        img.hidden = true;
      }
    } else {
      stateEl.textContent = DISCORD_STATUS_LABEL[status] || "Offline";
      subEl.hidden = true;
      img.hidden = true;
    }
  }

  function resolveActivityImage(activity) {
    const assets = activity.assets;
    if (!assets) return null;
    const key = assets.large_image || assets.small_image;
    if (!key) return null;

    if (key.startsWith("spotify:")) {
      return "https://i.scdn.co/image/" + key.split(":")[1];
    }
    if (key.startsWith("mp:external/")) {
      return "https://media.discordapp.net/external/" + key.slice("mp:external/".length);
    }
    if (activity.application_id) {
      return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${key}.png`;
    }
    return null;
  }

  function setupActivityMarquee(stateEl) {
    const text = stateEl.querySelector(".discord-state-text");
    if (!text) return;

    text.classList.remove("marquee");
    text.style.removeProperty("--scroll-distance");
    text.style.removeProperty("animation-duration");

    requestAnimationFrame(() => {
      const overflow = text.scrollWidth - stateEl.clientWidth;
      if (overflow <= 2) return;

      text.style.setProperty("--scroll-distance", `-${overflow}px`);
      const seconds = Math.max(6, overflow / 30 + 4);
      text.style.animationDuration = seconds + "s";
      text.classList.add("marquee");
    });
  }

  function setupPlayerMarquee() {
    const box = $("playerInfo");
    if (!box) return;
    const text = box.querySelector(".player-info-text");
    if (!text) return;

    text.classList.remove("marquee");
    text.style.removeProperty("--scroll-distance");
    text.style.removeProperty("animation-duration");

    requestAnimationFrame(() => {
      const overflow = text.scrollWidth - box.clientWidth;
      if (overflow <= 2) return;

      text.style.setProperty("--scroll-distance", `-${overflow}px`);
      const seconds = Math.max(6, overflow / 30 + 4);
      text.style.animationDuration = seconds + "s";
      text.classList.add("marquee");
    });
  }

  function renderDiscordBadges() {
    const container = $("discordBadges");
    if (!container) return;
    const badges = (CONFIG.discord && CONFIG.discord.badges) || [];
    container.innerHTML = "";

    badges.forEach((badge) => {
      if (!badge || !badge.icon) return;
      const img = document.createElement("img");
      img.src = badge.icon;
      img.alt = badge.name || "";
      img.title = badge.name || "";
      img.loading = "lazy";
      img.decoding = "async";
      container.appendChild(img);
    });
  }

  let copyToastTimer = null;
  function showCopyToast(message) {
    let toast = $("copyToast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "copyToast";
      toast.className = "copy-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    void toast.offsetWidth;
    toast.classList.add("show");

    if (copyToastTimer) clearTimeout(copyToastTimer);
    copyToastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2000);
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  function initUsernameCopy() {
    const usernameEl = $("discordUsername");
    if (!usernameEl) return;
    usernameEl.addEventListener("click", () => {
      const text = usernameEl.dataset.copy || usernameEl.textContent || "";
      if (!text) return;
      copyToClipboard(text)
        .then(() => showCopyToast("Username copied to clipboard!"))
        .catch(() => showCopyToast("Couldn't copy — please copy manually."));
    });
  }

  function initDiscord() {
    const discord = CONFIG.discord || {};
    const userId = discord.userId;
    initUsernameCopy();
    if (!userId || /^0+$/.test(userId)) return;

    const fetchPresence = () => {
      fetch(`https://api.lanyard.rest/v1/users/${userId}`)
        .then((res) => res.json())
        .then((json) => {
          if (json && json.success && json.data) applyDiscordData(json.data);
        })
        .catch(() => {});
    };

    fetchPresence();
    setInterval(fetchPresence, 30000);
  }

  const player = {
    audio: null,
    playlist: [],
    index: 0,
    seeking: false,
    options: {},
  };

  function loadTrack(i, autoplay) {
    const list = player.playlist;
    if (!list.length) return;

    player.index = (i + list.length) % list.length;
    const track = list[player.index];

    const opts = player.options;
    const showArtist = opts.showArtist !== false;

    player.audio.src = track.audio || "";
    $("playerCover").src = track.cover || "";
    $("playerCover").alt = track.title || "Album cover";
    $("playerTitle").textContent = track.title || "";

    $("playerArtist").textContent = showArtist ? track.artist || "" : "";
    $("playerArtist").hidden = !showArtist || !track.artist;
    const sep = document.querySelector(".player-sep");
    if (sep) sep.hidden = !showArtist || !track.artist;

    setupPlayerMarquee();

    $("progressFill").style.width = "0%";
    $("currentTime").textContent = "0:00";

    if (autoplay) {
      player.audio.play().then(setPlayingUI).catch(() => {});
    }
  }

  function nextIndex() {
    const list = player.playlist;
    if (player.options.shuffle && list.length > 1) {
      let r;
      do {
        r = Math.floor(Math.random() * list.length);
      } while (r === player.index);
      return r;
    }
    return player.index + 1;
  }

  function setPlayingUI() {
    $("playBtn").classList.add("playing");
  }

  function setPausedUI() {
    $("playBtn").classList.remove("playing");
  }

  function togglePlay() {
    if (player.audio.paused) {
      player.audio.play().then(setPlayingUI).catch(() => {});
    } else {
      player.audio.pause();
      setPausedUI();
    }
  }

  function initPlayer() {
    player.audio = $("audio");
    player.playlist = CONFIG.playlist || [];
    player.options = CONFIG.music || {};

    if (!player.playlist.length) return;

    const startIndex = Math.min(
      Math.max(parseInt(player.options.startIndex, 10) || 0, 0),
      player.playlist.length - 1
    );

    loadTrack(startIndex, false);

    const configVolume = parseFloat(player.options.defaultVolume);
    player.audio.volume = isNaN(configVolume)
      ? 1
      : Math.min(Math.max(configVolume, 0), 1);

    const volume = $("volume");
    if (volume) {
      volume.value = player.audio.volume;
      volume.addEventListener("input", () => {
        player.audio.volume = parseFloat(volume.value);
      });
    }

    const muteBtn = $("muteBtn");
    if (muteBtn) {
      player.audio.muted = false;
      muteBtn.addEventListener("click", () => {
        player.audio.muted = !player.audio.muted;
        muteBtn.classList.toggle("muted", player.audio.muted);
        muteBtn.setAttribute("aria-pressed", String(player.audio.muted));
      });
    }

    $("playBtn").addEventListener("click", togglePlay);
    $("prevBtn").addEventListener("click", () => loadTrack(player.index - 1, true));
    $("nextBtn").addEventListener("click", () => loadTrack(nextIndex(), true));

    player.audio.addEventListener("ended", () => {
      loadTrack(nextIndex(), true);
    });

    player.audio.addEventListener("play", setPlayingUI);
    player.audio.addEventListener("pause", setPausedUI);

    player.audio.addEventListener("loadedmetadata", () => {
      $("duration").textContent = formatTime(player.audio.duration);
    });

    player.audio.addEventListener("timeupdate", () => {
      if (player.seeking) return;
      const cur = player.audio.currentTime;
      const dur = player.audio.duration || 0;
      const pct = dur ? (cur / dur) * 100 : 0;
      $("progressFill").style.width = pct + "%";
      $("currentTime").textContent = formatTime(cur);
    });

    const progress = $("progress");
    progress.addEventListener("click", (e) => {
      const rect = progress.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;
      const dur = player.audio.duration || 0;
      if (dur) {
        player.audio.currentTime = Math.max(0, Math.min(1, ratio)) * dur;
      }
    });
  }

  function initEnterScreen() {
    const enter = $("enterScreen");
    const page = $("page");

    const open = () => {
      enter.classList.add("hidden");
      page.classList.add("visible");
      const muteBtn = $("muteBtn");
      if (muteBtn) muteBtn.classList.add("visible");
      const autoplay = !player.options || player.options.autoplay !== false;
      if (autoplay && player.audio && player.playlist.length) {
        player.audio.play().then(setPlayingUI).catch(() => {});
      }
    };

    enter.addEventListener("click", open, { once: true });
  }

  let resizeTimer = null;
  function initResizeRemeasure() {
    window.addEventListener("resize", () => {
      applyResponsiveScale();
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        setupPlayerMarquee();
        const stateEl = $("discordState");
        if (stateEl && stateEl.querySelector(".discord-state-text")) {
          setupActivityMarquee(stateEl);
        }
      }, 150);
    });
  }

  function applyResponsiveScale() {
    const BASE_W = 1920;
    const BASE_H = 1080;

    let scale = Math.min(
      window.innerWidth / BASE_W,
      window.innerHeight / BASE_H
    );

    scale = Math.max(1, Math.min(scale, 2.5));

    document.body.style.zoom = scale;
  }

  function boot() {
    applyResponsiveScale();
    applyTheme();
    applyProfile();
    renderSocials();
    initPlayer();
    initDiscord();
    initEnterScreen();
    initResizeRemeasure();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
