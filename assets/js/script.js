document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Data from Config
    loadConfig();

    // 2. Initialize Music Player & Handle Overlay
    if (config.musicList && config.musicList.length > 0) {
        // Random bài hát (0 đến length-1)
        currentSongIndex = Math.floor(Math.random() * config.musicList.length);
        
        initMusicPlayer();

        // Handle Click to Enter
        const overlay = document.getElementById('enter-overlay');
        overlay.addEventListener('click', () => {
            // Fade out overlay
            overlay.classList.add('fade-out');
            
            // Animations for cards
            document.querySelectorAll('.main-card').forEach(card => {
                card.classList.add('animate');
            });

            // Play music
            playSong();
        });
    } else {
        // If no music, hide overlay on click
        document.getElementById('enter-overlay').addEventListener('click', function() {
            this.classList.add('fade-out');
            // Activate animations for cards
            document.querySelectorAll('.main-card').forEach(card => {
                card.classList.add('animate');
            });
        });
    }

    // 3. Initialize Lanyard (Discord Status)
    if (config.discordID) {
        initLanyard();
    }
});

function loadConfig() {
    // Update Text Data
    document.title = config.name;
    const userNameEl = document.getElementById('userName');
    userNameEl.innerText = config.name;

    document.getElementById('description').innerText = config.description;
    document.getElementById('location').innerText = config.location;

    // Update Images
    document.getElementById('avatar').src = config.avatar;
    
    // Background
    const bg = document.getElementById('background');
    bg.style.backgroundImage = `url('${config.background}')`;

    // Render Social Links
    const socialContainer = document.getElementById('social-links');
    socialContainer.innerHTML = '';
    config.socials.forEach(social => {
        const a = document.createElement('a');
        a.href = social.link;
        a.target = '_blank';
        
        // Auto detect class based on icon name
        if (social.icon.includes('facebook')) a.classList.add('social-facebook');
        else if (social.icon.includes('instagram')) a.classList.add('social-instagram');
        else if (social.icon.includes('spotify')) a.classList.add('social-spotify');
        else if (social.icon.includes('github')) a.classList.add('social-github');
        else if (social.icon.includes('steam')) a.classList.add('social-steam');
        else if (social.icon.includes('youtube')) a.classList.add('social-youtube');
        else if (social.icon.includes('discord')) a.classList.add('social-discord');
        
        a.innerHTML = `<i class="${social.icon}"></i>`;
        socialContainer.appendChild(a);
    });
}

// Music Player Logic
let currentSongIndex = 0;
let isPlaying = false;
let audio = new Audio();
const playBtn = document.getElementById('play-btn');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const volumeBtn = document.getElementById('volume-btn'); // Added volume button definition
const musicThumb = document.getElementById('music-thumb');
const musicName = document.getElementById('music-name');
const musicArtist = document.getElementById('music-artist');
const progressBar = document.getElementById('progress-bar');
const progressContainer = document.getElementById('progress-container');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const playingAnim = document.getElementById('playing-animation');

function initMusicPlayer() {
    loadSong(config.musicList[currentSongIndex]);

    playBtn.addEventListener('click', togglePlay);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    volumeBtn.addEventListener('click', toggleMute); // Added event listener
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', nextSong); // Auto play next
    progressContainer.addEventListener('click', setProgress);
}

// Logic Mute/Unmute
function toggleMute() {
    audio.muted = !audio.muted;
    if (audio.muted) {
        volumeBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
    } else {
        volumeBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    }
}

function loadSong(song) {
    musicName.innerText = song.name;
    musicArtist.innerText = song.artist;
    musicThumb.src = song.cover || 'assets/images/music-placeholder.png'; // Fallback
    audio.src = song.src;
}

function togglePlay() {
    if (isPlaying) {
        pauseSong();
    } else {
        playSong();
    }
}

function playSong() {
    isPlaying = true;
    audio.play();
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    musicThumb.closest('.music-thumb-wrapper').classList.add('playing');
}

function pauseSong() {
    isPlaying = false;
    audio.pause();
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    musicThumb.closest('.music-thumb-wrapper').classList.remove('playing');
}

function prevSong() {
    currentSongIndex--;
    if (currentSongIndex < 0) {
        currentSongIndex = config.musicList.length - 1;
    }
    loadSong(config.musicList[currentSongIndex]);
    if (isPlaying) playSong();
}

function nextSong() {
    currentSongIndex++;
    if (currentSongIndex > config.musicList.length - 1) {
        currentSongIndex = 0;
    }
    loadSong(config.musicList[currentSongIndex]);
    if (isPlaying) playSong();
}

function updateProgress(e) {
    const { duration, currentTime } = e.srcElement;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;

    // Time Formatting
    const durationMinutes = Math.floor(duration / 60);
    let durationSeconds = Math.floor(duration % 60);
    if (durationSeconds < 10) durationSeconds = `0${durationSeconds}`;
    
    // Avoid NaN when loading
    if (durationSeconds) {
        durationEl.innerText = `${durationMinutes}:${durationSeconds}`;
    }

    const currentMinutes = Math.floor(currentTime / 60);
    let currentSeconds = Math.floor(currentTime % 60);
    if (currentSeconds < 10) currentSeconds = `0${currentSeconds}`;
    currentTimeEl.innerText = `${currentMinutes}:${currentSeconds}`;
}

function setProgress(e) {
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

// LANYARD Discord Status Logic
function initLanyard() {
    // Updated map to point to image files instead of color codes
    const statusMap = {
        online: { icon: 'assets/images/status/online.png', text: 'Online' },
        idle: { icon: 'assets/images/status/idle.png', text: 'Idle' },
        dnd: { icon: 'assets/images/status/dnd.png', text: 'Do Not Disturb' },
        offline: { icon: 'assets/images/status/offline.png', text: 'Offline' }
    };

    const ws = new WebSocket('wss://api.lanyard.rest/socket');

    ws.onopen = () => {
        // Subscribe to user ID
        ws.send(JSON.stringify({
            op: 2,
            d: { subscribe_to_id: config.discordID }
        }));
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const { t, d } = data;

        if (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE') {
            updateDiscordStatus(d, statusMap);
        }
    };
    
    // Heartbeat (keep alive)
    setInterval(() => {
        ws.send(JSON.stringify({ op: 3 }));
    }, 30000);
}

function updateDiscordStatus(data, statusMap) {
    if (!data) return;

    // Reveal widget
    document.getElementById('discord-widget').classList.remove('d-none');

    const { discord_user, discord_status, activities } = data;

    // 1. Update Main Avatar Decoration ONLY
    if (discord_user.avatar_decoration) {
        const decorationUrl = `https://cdn.discordapp.com/avatar-decoration-presets/${discord_user.avatar_decoration}.png`;
        const decorationEl = document.getElementById('avatar-decoration');
        decorationEl.src = decorationUrl;
        decorationEl.style.display = 'block';
    } else {
        document.getElementById('avatar-decoration').style.display = 'none';
    }

    // 2. Update Widget Avatar
    const widgetAvatarUrl = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png`;
    document.getElementById('discord-avatar').src = widgetAvatarUrl;
    
    // Update username and add click logic
    const discordUsernameEl = document.getElementById('discord-username');
    discordUsernameEl.innerText = discord_user.username;

    // LOGIC: Click on Discord name to copy
    discordUsernameEl.onclick = () => {
        navigator.clipboard.writeText(discord_user.username).then(() => {
            discordUsernameEl.classList.add('copied');
            setTimeout(() => {
                discordUsernameEl.classList.remove('copied');
            }, 2000);
        });
    };

    // 3. Update Status Badge & Indicator
    const statusInfo = statusMap[discord_status] || statusMap.offline;
    
    // Widget Status Indicator (Small Avatar)
    const widgetIndicator = document.getElementById('discord-status-indicator');
    
    // Updated: Change image src instead of background color
    widgetIndicator.src = statusInfo.icon; 
    
    widgetIndicator.title = statusInfo.text; // Tooltip

    // 3.5 Update Badges
    const badgesContainer = document.getElementById('discord-badges');
    badgesContainer.innerHTML = '';
    
    // Decode Flags
    const flags = discord_user.public_flags || 0;
    const badgeMap = [
        { name: 'Discord Staff', val: 1, icon: 'staff', id: 'staff' },
        { name: 'Partner', val: 2, icon: 'partner', id: 'partner' },
        { name: 'HypeSquad Events', val: 4, icon: 'hypesquad_events', id: 'hypesquad_events' },
        { name: 'Bug Hunter Level 1', val: 8, icon: 'bughunter_1', id: 'bug_hunter_1' },
        { name: 'HypeSquad Bravery', val: 64, icon: 'bravery', id: 'hypesquad_bravery' },
        { name: 'HypeSquad Brilliance', val: 128, icon: 'brilliance', id: 'hypesquad_brilliance' },
        { name: 'HypeSquad Balance', val: 256, icon: 'balance', id: 'hypesquad_balance' },
        { name: 'Early Supporter', val: 512, icon: 'early_supporter', id: 'early_supporter' },
        { name: 'Bug Hunter Level 2', val: 16384, icon: 'bughunter_2', id: 'bug_hunter_2' },
        { name: 'Verified Bot Developer', val: 131072, icon: 'developer', id: 'developer' },
        { name: 'Certified Moderator', val: 262144, icon: 'moderator', id: 'moderator' },
        { name: 'Active Developer', val: 4194304, icon: 'active_developer', id: 'active_developer' }
    ];

    // Helper to add image
    const appendBadge = (icon, name) => {
        const img = document.createElement('img');
        
        // Only use local images from assets/images/badges/
        // If the image is not here, the badge will be broken
        img.src = `assets/images/badges/${icon}.png`;

        img.title = name;
        img.alt = name;
        img.style.width = '18px';
        img.style.height = '18px';
        badgesContainer.appendChild(img);
    };

    // 1. Auto-detected Badges
    badgeMap.forEach(badge => {
        if ((flags & badge.val) === badge.val) {
            appendBadge(badge.icon, badge.name);
        }
    });

    // 2. Nitro (Auto-detect usually unreliable in v1 without premium_type)
    if (discord_user.premium_type === 1 || discord_user.premium_type === 2) {
         appendBadge('nitro', 'Nitro');
    }

    // 3. Manual Badges (Fallback)
    if (config.manualBadges && config.manualBadges.length > 0) {
        config.manualBadges.forEach(manualId => {
            // Check if already added? simple check to allow forcing
            // Support Nitro manual
            if (manualId === 'nitro') {
                appendBadge('nitro', 'Nitro');
            } else if (manualId === 'boost') {
                appendBadge('boost', 'Server Booster');
            } else {
                 const match = badgeMap.find(b => b.id === manualId);
                 if (match) {
                     appendBadge(match.icon, match.name);
                 }
            }
        });
    }

    // Prevent duplicates visually if user puts manual + auto
    // (Actual duplicate removal logic could be added but this is simple enough)

    // 4. Update Activity
    const activityEl = document.getElementById('discord-activity');
    const activityImageEl = document.getElementById('discord-activity-image');
    const defaultIconEl = document.getElementById('discord-default-icon');

    // Updated: Added condition discord_status !== 'offline'
    // If offline, skip all activities to avoid showing old or irrelevant info (YouTube, old Spotify, etc.)
    if (discord_status !== 'offline' && activities && activities.length > 0) {
        // Find 'Playing', 'Listening' (Spotify), or 'Watching' - prioritize those over Custom Status (type 4)
        const activity = activities.find(a => a.type !== 4) || activities[0];

        // Text Update
        if (activity.type === 4) {
             // Custom Status - usually doesn't have a bold prefix
             activityEl.innerHTML = activity.state || "Doing nothing...";
        } else if (activity.type === 2) { // Spotify or Listening
             // Song details
             activityEl.innerHTML = `<span class="fw-bold text-white">Listening to</span> ${activity.details || activity.name}`;
        } else if (activity.type === 3) { // Watching
             activityEl.innerHTML = `<span class="fw-bold text-white">Watching</span> ${activity.name}`;
        } else if (activity.type === 1) { // Streaming
             activityEl.innerHTML = `<span class="fw-bold text-white">Streaming</span> ${activity.name}`;
        } else if (activity.type === 5) { // Competing
             activityEl.innerHTML = `<span class="fw-bold text-white">Competing in</span> ${activity.name}`;
        } else {
            // Default (Type 0 - Playing)
            activityEl.innerHTML = `<span class="fw-bold text-white">Playing</span> ${activity.name}`;
        }

        // Image Update
        let imageUrl = null;
        if (activity.assets && activity.assets.large_image) {
            if (activity.assets.large_image.startsWith('mp:')) {
                imageUrl = `https://media.discordapp.net/${activity.assets.large_image.replace('mp:', '')}`;
            } else if (activity.assets.large_image.startsWith('spotify:')) {
                 imageUrl = `https://i.scdn.co/image/${activity.assets.large_image.replace('spotify:', '')}`;
            } else {
                imageUrl = `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`;
            }
        } else if (data.spotify && data.spotify.album_art_url && activity.type === 2) {
             // Fallback for Spotify if no assets in activity object (unlikely but possible via Lanyard)
             imageUrl = data.spotify.album_art_url;
        }

        if (imageUrl) {
            activityImageEl.src = imageUrl;
            activityImageEl.classList.remove('d-none');
            defaultIconEl.classList.add('d-none');
        } else {
            activityImageEl.classList.add('d-none');
            defaultIconEl.classList.remove('d-none');
        }
    } else {
        // If offline, show "Offline"; if online but no activity, leave blank
        if (discord_status === 'offline') {
            activityEl.innerText = "Offline";
        } else {
            activityEl.innerText = "";
        }
        
        activityImageEl.classList.add('d-none');
        defaultIconEl.classList.remove('d-none');
    }
}