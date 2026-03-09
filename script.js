document.addEventListener("DOMContentLoaded", () => {
    // 1. Load CONFIG setup to HTML
    document.getElementById('page-title').textContent = CONFIG.name;

    const profileNameEl = document.getElementById('profile-name');
    profileNameEl.innerHTML = CONFIG.name;
    profileNameEl.setAttribute('data-text', CONFIG.name);

    document.getElementById('profile-title').textContent = CONFIG.title;
    document.getElementById('profile-location').textContent = CONFIG.location;

    // Title Tab Scroll Animation
    const titleText = CONFIG.tabName || CONFIG.name;
    let titleIndex = 0;
    let isDeleting = false;
    setInterval(() => {
        let currentText = titleText.substring(0, titleIndex);
        if (isDeleting) {
            document.title = currentText + "|";
            titleIndex--;
            if (titleIndex < 0) { 
                isDeleting = false; 
                titleIndex = 0; 
            }
        } else {
            document.title = currentText + "|";
            titleIndex++;
            if (titleIndex > titleText.length + 3) { 
                isDeleting = true; 
                titleIndex = titleText.length; 
            }
        }
    }, 300);

    // Background Media rendering logic
    const mediaUrl = CONFIG.backgroundMedia;
    const bgVideo = document.getElementById('bg-video');
    const bgImg = document.getElementById('background-img');
    const bgOrbWrap = document.getElementById('bg-orb-wrap');

    const isVideo = mediaUrl.match(/\.(mp4|webm|ogg)$/i);

    if (isVideo) {
        bgImg.style.display = 'none';
        bgVideo.src = mediaUrl;
        bgVideo.classList.remove('hidden');
        bgVideo.style.display = 'block';
    } else {
        bgVideo.style.display = 'none';
        bgImg.style.display = 'block';
        bgImg.style.backgroundImage = `url('${mediaUrl}')`;
    }

    document.documentElement.style.setProperty('--primary-color', CONFIG.primaryColor);
    document.documentElement.style.setProperty('--primary-glow', CONFIG.primaryColor + 'B3');

    // Background 3D mouse movement
    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    if (!isTouchDevice && bgOrbWrap) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) - 0.5;
            const y = (e.clientY / window.innerHeight) - 0.5;

            // move opposite to cursor
            mouseX = -x * 42;
            mouseY = -y * 42;
        });

        function animateBackgroundOrb() {
            currentX += (mouseX - currentX) * 0.06;
            currentY += (mouseY - currentY) * 0.06;

            currentRotateY += (((currentX * 0.18)) - currentRotateY) * 0.08;
            currentRotateX += (((currentY * -0.18)) - currentRotateX) * 0.08;

            bgOrbWrap.style.transform = `
                translate3d(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px), 0)
                rotateX(${currentRotateX}deg)
                rotateY(${currentRotateY}deg)
                scale(1.02)
            `;

            requestAnimationFrame(animateBackgroundOrb);
        }

        animateBackgroundOrb();
    }

    // Setup Fallbacks while Lanyard loads
    const fallbackAvatar = CONFIG.fallbackDiscordAvatarUrl;
    document.getElementById('d-avatar').src = fallbackAvatar;
    document.getElementById('d-username').textContent = CONFIG.fallbackDiscordUsername;
    document.getElementById('d-status-indicator').style.backgroundColor = '#747f8d';
    document.getElementById('d-status-text').textContent = "Connecting to Discord...";

    // Realtime Discord Connection via Lanyard API
    const discordId = CONFIG.discordUserId;
    if (discordId !== "") {
        function connectLanyard() {
            const ws = new WebSocket('wss://api.lanyard.rest/socket');

            ws.onmessage = (event) => {
                const message = JSON.parse(event.data);

                if (message.op === 1) {
                    ws.send(JSON.stringify({
                        op: 2,
                        d: { subscribe_to_id: discordId }
                    }));
                } else if (message.op === 0) {
                    if (message.t === "INIT_STATE" || message.t === "PRESENCE_UPDATE") {
                        const data = message.d;
                        const user = data.discord_user;

                        if (user.avatar) {
                            const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
                            document.getElementById('d-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
                        } else {
                            document.getElementById('d-avatar').src = fallbackAvatar;
                        }

                        document.getElementById('d-username').textContent = "ranga____";

                        document.getElementById('d-badges').innerHTML = `
                            <span style="font-size: 1rem; margin-right: 4px;">🔥</span>
                            <span style="color: red; font-weight: bold; font-size: 0.85rem; letter-spacing: 1px;">KONG</span>
                            <div style="background: rgba(255, 0, 0, 0.7); border-radius: 50%; width: 16px; height: 16px; display: inline-flex; align-items: center; justify-content: center; margin-left: 5px;">
                                <i class="fa-solid fa-chevron-down" style="color: black; font-size: 0.6rem;"></i>
                            </div>
                        `;

                        const statusColors = { online: '#43b581', idle: '#faa61a', dnd: '#f04747', offline: '#747f8d' };
                        document.getElementById('d-status-indicator').style.backgroundColor = statusColors[data.discord_status] || '#747f8d';

                        const customStatus = data.activities.find(a => a.type === 4);
                        if (customStatus) {
                            let text = "";
                            const statusIcon = document.getElementById('d-status-icon');
                            if (customStatus.emoji) {
                                if (customStatus.emoji.id) {
                                    const ext = customStatus.emoji.animated ? 'gif' : 'png';
                                    statusIcon.src = `https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${ext}`;
                                    statusIcon.style.display = 'block';
                                } else {
                                    text += customStatus.emoji.name + " ";
                                    statusIcon.style.display = 'none';
                                }
                            } else {
                                statusIcon.style.display = 'none';
                            }
                            if (customStatus.state) text += customStatus.state;
                            document.getElementById('d-status-text').textContent = text || (data.discord_status === 'offline' ? 'Offline' : 'Online');
                        } else {
                            document.getElementById('d-status-icon').style.display = 'none';
                            document.getElementById('d-status-text').textContent = data.discord_status === 'offline' ? 'Offline' : 'Online';
                        }
                    }
                }
            };

            ws.onclose = () => {
                setTimeout(connectLanyard, 5000);
            };
        }
        connectLanyard();
    } else {
        document.getElementById('d-status-text').textContent = "Please add your Discord ID in config.js (Read Instructions)";
    }

    document.getElementById('link-spotify').href = CONFIG.socials.spotify;
    document.getElementById('link-tiktok').href = CONFIG.socials.tiktok;
    document.getElementById('link-apple').href = CONFIG.socials.apple;

    // Music Src inject
    document.getElementById('song-title-text').textContent = CONFIG.songTitle;
    document.getElementById('audio-source').src = CONFIG.audioSrc;
    const albumArtEl = document.getElementById('player-album-art');
    if (albumArtEl && CONFIG.albumArt) {
        albumArtEl.src = CONFIG.albumArt;
    }

    const audio = document.getElementById('bg-music');
    audio.load();

    // Custom Mouse Cursor Binding
    const cursor = document.getElementById('cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    const clickables = document.querySelectorAll('a, button, .discord-card, .progress-bar-bg, .player-buttons i, #enter-screen');
    clickables.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });

    const enterScreen = document.getElementById('enter-screen');
    const mainContent = document.getElementById('main-content');
    const audioToggle = document.getElementById('audio-toggle');
    const playPauseBtn = document.getElementById('play-pause-btn');

    let isPlaying = false;

    // Enter Splash logic
    enterScreen.addEventListener('click', () => {
        enterScreen.style.opacity = '0';
        setTimeout(() => {
            enterScreen.style.display = 'none';
            mainContent.classList.remove('hidden');

            const viewCounterBox = document.getElementById('view-counter-box');
            if (viewCounterBox) viewCounterBox.classList.remove('hidden');

            audio.volume = 0.5;
            let playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    isPlaying = true;
                    updatePlayPauseIcon();
                }).catch(error => {
                    console.log("Audio permission denied. Muted autoplay fallback missing.");
                });
            }
        }, 1000);
    });

    audioToggle.addEventListener('click', () => {
        audio.muted = !audio.muted;
        audioToggle.innerHTML = audio.muted ? '<i class="fa-solid fa-volume-xmark"></i>' : '<i class="fa-solid fa-volume-high"></i>';
    });

    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const vol = e.target.value / 100;
            audio.volume = vol;
            if (vol === 0) {
                audio.muted = true;
                audioToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            } else {
                audio.muted = false;
                audioToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            }
        });
    }

    // Player Math
    const progressBarBg = document.getElementById('progress-bar-bg');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    audio.addEventListener('loadedmetadata', () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBarFill.style.width = progressPercent + '%';
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    progressBarBg.addEventListener('click', (e) => {
        const width = progressBarBg.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    });

    playPauseBtn.addEventListener('click', () => {
        if (isPlaying) {
            audio.pause();
            isPlaying = false;
        } else {
            audio.play();
            isPlaying = true;
        }
        updatePlayPauseIcon();
    });

    function updatePlayPauseIcon() {
        playPauseBtn.className = isPlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }

    // Rain Generator
    const rainContainer = document.getElementById('rain-container');

    function createRaindrop() {
        if (document.hidden) return;
        const drop = document.createElement('div');
        drop.classList.add('raindrop');

        drop.style.left = Math.random() * 100 + 'vw';

        const duration = Math.random() * 0.4 + 0.3;
        drop.style.animationDuration = duration + 's';

        drop.style.opacity = Math.random() * 0.4 + 0.1;
        drop.style.height = (Math.random() * 30 + 50) + 'px';

        rainContainer.appendChild(drop);

        setTimeout(() => drop.remove(), duration * 1000);
    }

    setInterval(createRaindrop, 60);

    // Live Shared Counter for visits using API
    const uniqueKey = "guns_bio_" + CONFIG.name.replace(/[^a-zA-Z0-9]/g, '');

    let viewsCount = CONFIG.viewsStartingCount;
    document.getElementById('views').textContent = formatNumber(viewsCount);

    function formatNumber(num) {
        return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

    fetch(`https://api.counterapi.dev/v1/guns_bio_page/${uniqueKey}/up`)
        .then(response => response.json())
        .then(data => {
            const total = CONFIG.viewsStartingCount + data.count;
            viewsCount = total;
            document.getElementById('views').textContent = formatNumber(viewsCount);
        })
        .catch(err => {
            console.log("Using Local Storage for Views Counter");
            let localViews = parseInt(localStorage.getItem('fakeViewsCounter') || CONFIG.viewsStartingCount);
            localViews += Math.floor(Math.random() * 5) + 1;
            localStorage.setItem('fakeViewsCounter', localViews);
            viewsCount = localViews;
            document.getElementById('views').textContent = formatNumber(viewsCount);
        });

    setInterval(() => {
        if (Math.random() > 0.6) {
            viewsCount += Math.floor(Math.random() * 2) + 1;
            document.getElementById('views').textContent = formatNumber(viewsCount);
        }
    }, 4000);
});
