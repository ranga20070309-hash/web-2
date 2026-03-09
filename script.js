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

    document.documentElement.style.setProperty('--primary-color', CONFIG.primaryColor);
    document.documentElement.style.setProperty('--primary-glow', CONFIG.primaryColor + 'B3');

    // 360 VR Background
    const mediaUrl = CONFIG.backgroundMedia;
    const vrContainer = document.getElementById('vr-background');
    const vrFallback = document.getElementById('vr-fallback');
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl || "");

    let scene, camera, renderer, sphere, videoEl;
    let lon = 0;
    let lat = 0;
    let targetLon = 12;
    let targetLat = 0;
    let isDragging = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartLon = 0;
    let pointerStartLat = 0;

    function buildVRBackground() {
        if (!window.THREE || !vrContainer || !mediaUrl) {
            if (mediaUrl) vrFallback.style.backgroundImage = `url('${mediaUrl}')`;
            return;
        }

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            68,
            window.innerWidth / window.innerHeight,
            1,
            1100
        );

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });

        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        renderer.setSize(window.innerWidth, window.innerHeight);
        vrContainer.innerHTML = "";
        vrContainer.appendChild(renderer.domElement);

        const geometry = new THREE.SphereGeometry(500, 96, 64);
        geometry.scale(-1, 1, 1);

        let material;

        if (isVideo) {
            videoEl = document.createElement("video");
            videoEl.src = mediaUrl;
            videoEl.crossOrigin = "anonymous";
            videoEl.loop = true;
            videoEl.muted = true;
            videoEl.playsInline = true;
            videoEl.setAttribute("webkit-playsinline", "true");
            videoEl.setAttribute("playsinline", "true");
            videoEl.autoplay = true;

            const texture = new THREE.VideoTexture(videoEl);
            texture.colorSpace = THREE.SRGBColorSpace;
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false;

            material = new THREE.MeshBasicMaterial({ map: texture });

            videoEl.play().catch(() => {
                // will retry after user click
            });
        } else {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.setCrossOrigin("anonymous");

            textureLoader.load(
                mediaUrl,
                (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                },
                undefined,
                () => {
                    vrFallback.style.backgroundImage = `url('${mediaUrl}')`;
                }
            );

            const texture = textureLoader.load(mediaUrl);
            texture.colorSpace = THREE.SRGBColorSpace;
            material = new THREE.MeshBasicMaterial({ map: texture });
        }

        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        window.addEventListener("resize", onWindowResize);

        const dragSurface = document.body;

        dragSurface.addEventListener("mousedown", onPointerDown);
        dragSurface.addEventListener("mousemove", onPointerMove);
        dragSurface.addEventListener("mouseup", onPointerUp);
        dragSurface.addEventListener("mouseleave", onPointerUp);

        dragSurface.addEventListener("touchstart", onTouchStart, { passive: true });
        dragSurface.addEventListener("touchmove", onTouchMove, { passive: true });
        dragSurface.addEventListener("touchend", onPointerUp);

        animateVR();
    }

    function onWindowResize() {
        if (!camera || !renderer) return;
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onPointerDown(event) {
        isDragging = true;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        pointerStartLon = targetLon;
        pointerStartLat = targetLat;
    }

    function onPointerMove(event) {
        if (!isDragging) {
            const x = (event.clientX / window.innerWidth) - 0.5;
            const y = (event.clientY / window.innerHeight) - 0.5;
            targetLon += x * 0.08;
            targetLat += -y * 0.02;
            return;
        }

        const deltaX = event.clientX - pointerStartX;
        const deltaY = event.clientY - pointerStartY;

        targetLon = pointerStartLon - (deltaX * 0.13);
        targetLat = pointerStartLat + (deltaY * 0.08);
    }

    function onPointerUp() {
        isDragging = false;
    }

    function onTouchStart(event) {
        if (!event.touches.length) return;
        const touch = event.touches[0];
        isDragging = true;
        pointerStartX = touch.clientX;
        pointerStartY = touch.clientY;
        pointerStartLon = targetLon;
        pointerStartLat = targetLat;
    }

    function onTouchMove(event) {
        if (!event.touches.length || !isDragging) return;
        const touch = event.touches[0];

        const deltaX = touch.clientX - pointerStartX;
        const deltaY = touch.clientY - pointerStartY;

        targetLon = pointerStartLon - (deltaX * 0.12);
        targetLat = pointerStartLat + (deltaY * 0.07);
    }

    function animateVR() {
        requestAnimationFrame(animateVR);

        if (!isDragging) {
            targetLon += 0.018; // slow cinema-style left-right auto rotation
        }

        targetLat = Math.max(-22, Math.min(22, targetLat));

        lon += (targetLon - lon) * 0.05;
        lat += (targetLat - lat) * 0.05;

        const phi = THREE.MathUtils.degToRad(90 - lat);
        const theta = THREE.MathUtils.degToRad(lon);

        const x = 500 * Math.sin(phi) * Math.cos(theta);
        const y = 500 * Math.cos(phi);
        const z = 500 * Math.sin(phi) * Math.sin(theta);

        camera.lookAt(x, y, z);

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    buildVRBackground();

    // retry video playback after first interaction
    document.addEventListener("click", () => {
        if (videoEl && videoEl.paused) {
            videoEl.play().catch(() => {});
        }
    }, { once: false });

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
        document.getElementById('d-status-text').textContent = "Please add your Discord ID in config.js";
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
                playPromise.then(() => {
                    isPlaying = true;
                    updatePlayPauseIcon();
                    if (videoEl && videoEl.paused) {
                        videoEl.play().catch(() => {});
                    }
                }).catch(() => {
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

    // Views Counter
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
        .catch(() => {
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
