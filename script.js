// Force scroll to top on refresh
if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

document.addEventListener("DOMContentLoaded", () => {
    // Fetch data from Firebase in the background (DO NOT use await so we don't block the site loading locally)
    if (typeof db !== 'undefined') {
        db.collection('settings').doc('main').get().then(doc => {
            if (doc.exists) {
                const dbData = doc.data();
                
                // Extremely safe merge: only merge if truthy and not empty String
                Object.keys(dbData).forEach(key => {
                    if (dbData[key] && dbData[key] !== "") {
                        if (key === 'socials' && typeof dbData[key] === 'object') {
                            CONFIG.socials = { ...CONFIG.socials, ...dbData.socials };
                        } else {
                            CONFIG[key] = dbData[key];
                        }
                    }
                });

                // Inject Custom Data Dynamically only if valid (Temporarily disabled for premium enter screen redesign)
                // if (dbData.enterVideo && dbData.enterVideo !== "") { const ev = document.querySelector('.enter-video'); if (ev) ev.src = dbData.enterVideo; }
                
                // Randomized Wallpaper Engine (Refresh Rotation)
                const cinematicPool = [
                    "https://videotourl.com/videos/1774973827309-e1cdfbb5-8624-4fb6-a917-9a584266b8cd.mp4",
                    "https://videotourl.com/videos/1774973950526-e4bd6a76-8171-4a22-a371-443fe941b7eb.mp4",
                    "https://videotourl.com/videos/1774973971708-5a99ab97-9985-4a7f-b649-a78eb3528305.mp4",
                    "https://videotourl.com/videos/1774973997025-cda5ff0c-7c94-4e0c-b339-a65cc0e65a63.mp4",
                    "https://videotourl.com/videos/1774974905871-84cceda0-4dfe-43f8-815d-8fbae1496a01.mp4",
                    "https://videotourl.com/videos/1774974930765-3040c057-d303-4138-8bb8-10d526441b65.mp4",
                    "https://videotourl.com/videos/1774974957226-e89c2a7c-8cfe-4fe2-95e0-68a3aef4ab45.mp4",
                    "https://videotourl.com/videos/1774974990569-79f68385-cb02-4d70-80c3-beb8f954a650.mp4"
                ];

                let finalPool = [...cinematicPool];
                if (dbData.dynamicWallpapers && Array.isArray(dbData.dynamicWallpapers) && dbData.dynamicWallpapers.length > 0) {
                    const validDBWP = dbData.dynamicWallpapers.filter(w => w.url && w.url !== "");
                    if (validDBWP.length > 0) finalPool = [...cinematicPool, ...validDBWP.map(w => w.url)];
                }

                // Smarter Randomization: Ensure we cycle through the pool
                let lastWP = sessionStorage.getItem('lastWallpaper');
                let poolCopy = [...finalPool];
                if (poolCopy.length > 1) poolCopy = poolCopy.filter(u => u !== lastWP);
                
                const finalWP = poolCopy[Math.floor(Math.random() * poolCopy.length)];
                sessionStorage.setItem('lastWallpaper', finalWP);

                const bgv = document.getElementById('bg-video');
                const bgi = document.getElementById('background-img');
                if (bgv) {
                    bgv.src = finalWP;
                    bgv.load();
                    bgv.play().catch(e => console.warn("Cinematic backdrop autoplay triggered."));
                }
                if (bgi) bgi.style.backgroundImage = `url(${finalWP})`;
                
                // Entrance Sequence Dynamic Strings
                const setLangText = (sel, cn, en) => {
                    const el = document.querySelector(sel);
                    if (el) {
                        const cnEl = el.querySelector('.cn'), enEl = el.querySelector('.en');
                        if (cnEl && cn) cnEl.textContent = cn;
                        if (enEl && en) enEl.textContent = en;
                    }
                };
                setLangText('#loading-text', dbData.loadingTextCN, dbData.loadingTextEN);
                setLangText('#status-text-el', dbData.statusTextCN, dbData.statusTextEN);
                setLangText('#grant-access', dbData.btnTextCN, dbData.btnTextEN);

                // Discord Custom Phrase
                if (dbData.discordChinesePhrase && dbData.discordChinesePhrase !== "") {
                    const dcp = document.querySelector('.discord-card .chinese-phrase');
                    if (dcp) dcp.textContent = dbData.discordChinesePhrase;
                }

                if (dbData.obscuraTitle && dbData.obscuraTitle !== "") { const ot = document.querySelector('.obscura-title'); if (ot) ot.textContent = dbData.obscuraTitle; }
                if (dbData.obscuraDesc && dbData.obscuraDesc !== "") { const od = document.querySelector('.obscura-description'); if (od) od.innerHTML = dbData.obscuraDesc; }
                if (dbData.obscuraDiscord && dbData.obscuraDiscord !== "") { const oi = document.querySelector('.obscura-invite-btn'); if (oi) oi.href = dbData.obscuraDiscord; }
                if (dbData.obscuraFooterTitle && dbData.obscuraFooterTitle !== "") { const ft = document.querySelector('.footer-title'); if (ft) ft.textContent = dbData.obscuraFooterTitle; }
                if (dbData.obscuraFooterDesc && dbData.obscuraFooterDesc !== "") { const fd = document.querySelector('.footer-desc'); if (fd) fd.textContent = dbData.obscuraFooterDesc; }
                if (dbData.copyrightText && dbData.copyrightText !== "") { const ct = document.querySelector('.tape-copyright p'); if (ct) ct.textContent = dbData.copyrightText; }
                if (dbData.bottomSocialTitle && dbData.bottomSocialTitle !== "") { const bst = document.querySelector('.social-title'); if (bst) bst.textContent = dbData.bottomSocialTitle; }
                
                if (dbData.latestSingle) {
                    const ls = dbData.latestSingle;
                    if (document.getElementById('ls-type')) document.getElementById('ls-type').textContent = ls.type || "LATEST SINGLE";
                    if (document.getElementById('ls-cover')) document.getElementById('ls-cover').src = ls.cover;
                    if (document.getElementById('ls-title')) document.getElementById('ls-title').textContent = ls.title;
                    if (document.getElementById('ls-artist')) document.getElementById('ls-artist').textContent = ls.artist;
                    if (document.getElementById('ls-qty')) document.getElementById('ls-qty').textContent = ls.qty || ls.streams;
                    if (document.getElementById('ls-prod')) document.getElementById('ls-prod').textContent = ls.prod;
                    if (document.getElementById('ls-mix')) document.getElementById('ls-mix').textContent = ls.mix;
                    if (document.getElementById('ls-coprod')) document.getElementById('ls-coprod').textContent = ls.coprod;
                    if (document.getElementById('ls-url')) document.getElementById('ls-url').href = ls.url;
                    
                    // Release Countdown Logic
                    const cdContainer = document.getElementById('ls-countdown-container');
                    const streamBtn = document.getElementById('ls-url');
                    
                    if (ls.releaseDate && cdContainer && streamBtn) {
                        const targetTime = new Date(ls.releaseDate).getTime();
                        
                        if (!isNaN(targetTime)) {
                            let timerInterval;
                            const updateCountdown = () => {
                                const now = new Date().getTime();
                                const diff = targetTime - now;
                                
                                if (diff > 0) {
                                    // Still counting down
                                    cdContainer.style.display = 'flex';
                                    streamBtn.style.pointerEvents = 'none';
                                    streamBtn.style.opacity = '0.4';
                                    streamBtn.innerHTML = '<i class="fa-solid fa-lock" style="font-size: 1.1rem;"></i> RELEASING SOON';
                                    
                                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                                    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                                    const secs = Math.floor((diff % (1000 * 60)) / 1000);
                                    
                                    document.getElementById('cd-days').innerText = days.toString().padStart(2, '0');
                                    document.getElementById('cd-hours').innerText = hours.toString().padStart(2, '0');
                                    document.getElementById('cd-mins').innerText = mins.toString().padStart(2, '0');
                                    document.getElementById('cd-secs').innerText = secs.toString().padStart(2, '0');
                                } else {
                                    // Countdown finished!
                                    cdContainer.style.display = 'none';
                                    streamBtn.style.pointerEvents = 'all';
                                    streamBtn.style.opacity = '1';
                                    streamBtn.innerHTML = '<i class="fa-brands fa-spotify" style="font-size: 1.1rem;"></i> STREAM SINGLE NOW';
                                    if (timerInterval) clearInterval(timerInterval);
                                }
                            };
                            
                            updateCountdown(); // Run immediately to avoid 1s flash
                            timerInterval = setInterval(updateCountdown, 1000);
                        } else {
                            // Invalid date
                            cdContainer.style.display = 'none';
                            streamBtn.style.pointerEvents = 'all';
                            streamBtn.style.opacity = '1';
                            streamBtn.innerHTML = '<i class="fa-brands fa-spotify" style="font-size: 1.1rem;"></i> STREAM SINGLE NOW';
                        }
                    } else if (cdContainer && streamBtn) {
                        cdContainer.style.display = 'none';
                        streamBtn.style.pointerEvents = 'all';
                        streamBtn.style.opacity = '1';
                        streamBtn.innerHTML = '<i class="fa-brands fa-spotify" style="font-size: 1.1rem;"></i> STREAM SINGLE NOW';
                    }
                }

                // Removed team, tape, and bottomSocials injections to restore original hardcoded versions
                
                // Also apply name and title dynamically if changed
                document.getElementById("page-title").textContent = CONFIG.name;
                const pName = document.getElementById("profile-name");
                if (pName) { pName.innerHTML = CONFIG.name; pName.setAttribute("data-text", CONFIG.name); }
                const pTitle = document.getElementById("profile-title");
                if (pTitle) pTitle.textContent = CONFIG.title;
                const pLoc = document.getElementById("profile-location");
                if (pLoc) pLoc.textContent = CONFIG.location;
                document.documentElement.style.setProperty("--primary-color", CONFIG.primaryColor);
                document.documentElement.style.setProperty("--primary-glow", CONFIG.primaryColor + "B3");
                
                // Store enter audio url globally for button click
                window.enterAudioURL = dbData.enterAudio || "";
            }
        }).catch(error => {
            console.error("Failed to load settings from Firebase:", error);
        });
    }

    // Initialize Lenis for Buttery Smooth Scrolling
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Load CONFIG
    let baseVolume = 0.5;
    let isVolumeLowered = false;
    let volumeInterval = null;

    function fadeVolume(targetVol) {
        if (volumeInterval) clearInterval(volumeInterval);
        const step = (targetVol - audio.volume) / 20;
        let count = 0;
        volumeInterval = setInterval(() => {
            const newVol = audio.volume + step;
            if (newVol >= 0 && newVol <= 1) audio.volume = newVol;
            count++;
            if (count >= 20) {
                audio.volume = targetVol;
                clearInterval(volumeInterval);
            }
        }, 25);
    }

    lenis.on('scroll', () => {
        const obscuraTitle = document.querySelector(".obscura-title");
        if (!obscuraTitle) return;
        
        const rect = obscuraTitle.getBoundingClientRect();
        const triggerPoint = window.innerHeight * 0.9; // Trigger slightly before it fully shows for smoothness
        
        if (rect.top < triggerPoint && !isVolumeLowered) {
            isVolumeLowered = true;
            fadeVolume(baseVolume * 0.2); 
        } else if (rect.top >= triggerPoint && isVolumeLowered) {
            isVolumeLowered = false;
            fadeVolume(baseVolume); 
        }
    });
    document.getElementById("page-title").textContent = CONFIG.name;

    // Dynamically update page title from CONFIG
    document.getElementById("profile-name").textContent = CONFIG.name;
    document.title = CONFIG.tabName;
    document.getElementById("profile-title").textContent = CONFIG.title;
    document.getElementById("profile-location").textContent = CONFIG.location;

    // Tab Title Animation
    const titleText = CONFIG.tabName || "@RANGA";
    let titleIndex = 0;
    let isDeleting = false;

    // Optional: Add a custom favicon if needed, for now using default.
    // To restore a standard favicon, just add <link rel="icon" ...> to index.html.

    setInterval(() => {
        const currentText = titleText.substring(0, titleIndex);

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

    document.documentElement.style.setProperty("--primary-color", CONFIG.primaryColor);
    document.documentElement.style.setProperty("--primary-glow", CONFIG.primaryColor + "B3");

    // Background media
    // Background media
    const mediaUrl = CONFIG.backgroundMedia;
    const bgVideo = document.getElementById("bg-video");
    const bgImg = document.getElementById("background-img");
    const bgMotionLayer = document.getElementById("bg-motion-layer");

    const isVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(mediaUrl || "");

    if (isVideo) {
        bgVideo.src = mediaUrl;
        bgVideo.muted = true;
        bgVideo.loop = true;
        bgVideo.setAttribute("playsinline", "");
        bgVideo.setAttribute("webkit-playsinline", "");
        bgVideo.setAttribute("autoplay", "");
        bgVideo.style.display = "block";
        bgImg.style.display = "none";
        bgVideo.load();

        const forcePlay = (vid) => {
            const p = vid.play();
            if (p !== undefined) p.catch(() => {});
        };

        // Aggressive handling for ALL videos to never freeze
        const enforceVideo = (vid) => {
            vid.muted = true;
            vid.loop = true;
            vid.setAttribute("playsinline", "");
            vid.setAttribute("webkit-playsinline", "");
            vid.setAttribute("autoplay", "");
            
            // Native loop fallback
            vid.addEventListener("ended", () => {
                vid.currentTime = 0;
                forcePlay(vid);
            });
            // Prevent auto-pausing by browser
            vid.addEventListener("pause", () => {
                if (vid.currentTime > 0 && !vid.ended) {
                    forcePlay(vid);
                }
            });
            forcePlay(vid);
        };

        enforceVideo(bgVideo);

        const enterVideo = document.querySelector('.enter-video');
        if (enterVideo) {
            enforceVideo(enterVideo);
            // On user click, we also force the 2nd screen background video to play to overcome iOS restrictions
            document.body.addEventListener("click", () => forcePlay(bgVideo), { once: true });
        }

        bgVideo.addEventListener("error", () => {
            console.log("Background video failed to load.");
        });
    } else {
        bgImg.style.display = "block";
        bgImg.style.backgroundImage = `url('${mediaUrl}')`;
        bgVideo.style.display = "none";
    }

    // Fake VR / cinema motion
    let pointerX = 0;
    let pointerY = 0;
    let currentX = 0;
    let currentY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    const autoPanStrength = isTouchDevice ? 6 : 10;
    const mouseStrengthX = 50;
    const mouseStrengthY = 25;
    const rotateStrength = 3.5;

    // Wrap the container for middle details parallax without breaking CSS animations
    const containerEl = document.querySelector(".container");
    let parallaxWrapper = null;
    if (containerEl && containerEl.parentNode) {
        parallaxWrapper = document.createElement("div");
        parallaxWrapper.style.width = "100%";
        parallaxWrapper.style.display = "flex";
        parallaxWrapper.style.flexDirection = "column";
        parallaxWrapper.style.alignItems = "center";
        parallaxWrapper.style.perspective = "1200px";
        parallaxWrapper.style.transformStyle = "preserve-3d";
        parallaxWrapper.classList.add("js-parallax-wrapper");
        
        containerEl.parentNode.insertBefore(parallaxWrapper, containerEl);
        parallaxWrapper.appendChild(containerEl);
    }

    document.addEventListener("mousemove", (e) => {
        if (isTouchDevice) return;

        const x = (e.clientX / window.innerWidth) - 0.5;
        const y = (e.clientY / window.innerHeight) - 0.5;

        pointerX = -x * mouseStrengthX;
        pointerY = -y * mouseStrengthY;
    });

    function handleOrientation(event) {
        if (!event.gamma || !event.beta) return;
        
        let x = event.gamma; // -90 to 90
        let y = event.beta;  // -180 to 180
        
        // Clamp ranges to prevent extreme flips
        if (x > 45) x = 45;
        if (x < -45) x = -45;
        
        // Assume holding phone at ~45 degrees is neutral
        y = y - 45; 
        if (y > 45) y = 45;
        if (y < -45) y = -45;
        
        const normX = x / 45; 
        const normY = y / 45; 
        
        // Responsively update the same pointer variables used for background logic
        pointerX = -normX * mouseStrengthX * 0.8;
        pointerY = -normY * mouseStrengthY * 0.8;
    }

    function animateBackground(time) {
        const t = time * 0.00022;

        const autoPanX = Math.sin(t) * autoPanStrength;
        const autoPanY = Math.sin(t * 0.45) * 1.8;

        currentX += ((autoPanX + pointerX) - currentX) * 0.04;
        currentY += ((autoPanY + pointerY) - currentY) * 0.05;

        const targetRotY = (currentX / 28) * rotateStrength;
        const targetRotX = (-currentY / 22) * rotateStrength;

        currentRotY += (targetRotY - currentRotY) * 0.04;
        currentRotX += (targetRotX - currentRotX) * 0.04;

        // Apply CSS variables for generic elements
        document.documentElement.style.setProperty('--mx', currentX);
        document.documentElement.style.setProperty('--my', currentY);
        document.documentElement.style.setProperty('--rx', currentRotX);
        document.documentElement.style.setProperty('--ry', currentRotY);

        requestAnimationFrame(animateBackground);
    }

    requestAnimationFrame(animateBackground);

    // Discord fallback
    const fallbackAvatar = CONFIG.fallbackDiscordAvatarUrl;
    document.getElementById("d-avatar").src = fallbackAvatar;
    document.getElementById("d-username").textContent = CONFIG.fallbackDiscordUsername;
    document.getElementById("d-status-indicator").style.backgroundColor = "#747f8d";
    document.getElementById("d-status-text").textContent = "Connecting to Discord...";

    // Lanyard
    const discordId = CONFIG.discordUserId;
    if (discordId !== "") {
        function connectLanyard() {
            const ws = new WebSocket("wss://api.lanyard.rest/socket");

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
                            const ext = user.avatar.startsWith("a_") ? "gif" : "png";
                            document.getElementById("d-avatar").src =
                                `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
                        } else {
                            document.getElementById("d-avatar").src = fallbackAvatar;
                        }

                        // Use global_name (Display Name) instead of username
                        document.getElementById("d-username").textContent = data.discord_user.global_name || data.discord_user.username;

                        document.getElementById("d-badges").innerHTML = ``;

                        const statusColors = {
                            online: "#43b581",
                            idle: "#faa61a",
                            dnd: "#f04747",
                            offline: "#747f8d"
                        };

                        document.getElementById("d-status-indicator").style.backgroundColor =
                            statusColors[data.discord_status] || "#747f8d";

                        const customStatus = data.activities.find((a) => a.type === 4);

                        if (customStatus) {
                            let text = "";
                            const statusIcon = document.getElementById("d-status-icon");

                            if (customStatus.emoji) {
                                if (customStatus.emoji.id) {
                                    const ext = customStatus.emoji.animated ? "gif" : "png";
                                    statusIcon.src = `https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${ext}`;
                                    statusIcon.style.display = "block";
                                } else {
                                    text += customStatus.emoji.name + " ";
                                    statusIcon.style.display = "none";
                                }
                            } else {
                                statusIcon.style.display = "none";
                            }

                            if (customStatus.state) text += customStatus.state;
                            document.getElementById("d-status-text").textContent =
                                text || (data.discord_status === "offline" ? "Offline" : "Online");
                        } else {
                            // Updated: Added fallback for when there is NO custom status set
                            const icon = document.getElementById("d-status-icon");
                            if (icon) icon.style.display = "none";
                            
                            const statusValue = data.discord_status || "offline";
                            const formattedStatus = statusValue === "dnd" ? "Do Not Disturb" : statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
                            document.getElementById("d-status-text").textContent = formattedStatus;
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
        document.getElementById("d-status-text").textContent = "Please add your Discord ID in config.js";
    }

    // Update social links
    document.getElementById("link-spotify").href = CONFIG.socials.spotify;
    document.getElementById("link-tiktok").href = CONFIG.socials.tiktok;
    document.getElementById("link-apple").href = CONFIG.socials.apple;

    // Music
    document.getElementById("song-title-text").textContent = CONFIG.songTitle;
    document.getElementById("audio-source").src = CONFIG.audioSrc;

    const albumArtEl = document.getElementById("player-album-art");
    if (albumArtEl && CONFIG.albumArt) {
        albumArtEl.src = CONFIG.albumArt;
    }

    const audio = document.getElementById("bg-music");
    audio.load();

    // Custom cursor and water tail
    const cursor = document.getElementById("cursor");
    const canvas = document.getElementById("water-tail");
    const ctx = canvas ? canvas.getContext("2d") : null;

    if (cursor) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX;
        let cursorY = mouseY;
        // Extremely realistic Rippling Water effect
        let ripples = [];
        let r_lastTime = 0;

        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });
        }

        document.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.opacity = "1";

            if (canvas) {
                let now = Date.now();
                if (now - r_lastTime > 400) { // Very slow bubble creation rate (less frequent)
                    ripples.push({
                        x: mouseX,
                        y: mouseY,
                        radius: 0,
                        maxRadius: Math.random() * 20 + 50, // Don't expand too huge
                        speed: Math.random() * 0.2 + 0.3, // Very slow expansion speed
                        life: 1, // Full opacity
                        thickness: 2 // Clear neon line thickness
                    });
                    r_lastTime = now;
                }
            }
        });

        document.addEventListener("mouseleave", () => {
            cursor.style.opacity = "0";
        });

        document.addEventListener("mouseenter", () => {
            cursor.style.opacity = "1";
        });

        function animateCursor() {
            cursorX += (mouseX - cursorX) * 0.35;
            cursorY += (mouseY - cursorY) * 0.35;

            cursor.style.left = cursorX + "px";
            cursor.style.top = cursorY + "px";

            // Draw hyper-realistic ripples
            if (ctx && canvas) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                for (let i = ripples.length - 1; i >= 0; i--) {
                    let r = ripples[i];
                    r.radius += r.speed;
                    // Ease-out life (fade slower initially, faster at the end)
                    let progress = r.radius / r.maxRadius;
                    r.life = 1 - Math.pow(progress, 1.5);
                    
                    if (r.life <= 0) {
                        ripples.splice(i, 1);
                        continue;
                    }
                    
                    // Clear realistic Neon Red ripple (No heavy blur, sharp and bright)
                    ctx.beginPath();
                    ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
                    ctx.lineWidth = r.thickness; 
                    
                    // Main bright solid red line
                    ctx.strokeStyle = `rgba(255, 0, 0, ${r.life})`; 
                    
                    // Subtle sharp neon glow
                    ctx.shadowColor = `rgba(255, 0, 0, ${r.life * 0.8})`;
                    ctx.shadowBlur = 5; // Low blur for clear edge
                    
                    ctx.stroke();
                }
            }

            requestAnimationFrame(animateCursor);
        }

        animateCursor();

        const clickables = document.querySelectorAll("a, button, .discord-card, .progress-bar-bg, .player-buttons i, input, .social-icon");
        clickables.forEach((el) => {
            el.addEventListener("mouseenter", () => cursor.classList.add("cursor-hover"));
            el.addEventListener("mouseleave", () => cursor.classList.remove("cursor-hover"));
        });

        const spotifyBox = document.querySelector(".premium-spotify-box");
        if (spotifyBox) {
            spotifyBox.addEventListener("mouseenter", () => cursor.classList.add("hide-cursor"));
            spotifyBox.addEventListener("mouseleave", () => cursor.classList.remove("hide-cursor"));
        }

        const appleBox = document.querySelector(".premium-apple-box");
        if (appleBox) {
            appleBox.addEventListener("mouseenter", () => cursor.classList.add("hide-cursor"));
            appleBox.addEventListener("mouseleave", () => cursor.classList.remove("hide-cursor"));
        }
    }

    // --- PREMIUM CHINESE CYBER ENTER SCREEN LOGIC ---
    const enterScreen = document.getElementById("enter-screen");
    const enterBtn = document.getElementById("grant-access");
    const mainContent = document.getElementById("main-content");
    const hum = document.getElementById("ambient-hum");
    const cursorGlow = document.getElementById("cursor-glow");
    
    // Restore missing UI control variables
    const audioToggle = document.getElementById("audio-toggle");
    const playPauseBtn = document.getElementById("play-pause-btn");
    const progressBarBg = document.getElementById("progress-bar-bg");
    const progressBarFill = document.getElementById("progress-bar-fill");
    const currentTimeEl = document.getElementById("current-time");
    const totalTimeEl = document.getElementById("total-time");

    // Cursor Glow Follow
    document.addEventListener("mousemove", (e) => {
        if (cursorGlow) {
            cursorGlow.style.left = e.clientX + "px";
            cursorGlow.style.top = e.clientY + "px";
            cursorGlow.style.opacity = "1";
        }
    });

    // Helper: Typewriter Effect
    function typeEffect(element, text, speed = 80) {
        return new Promise((resolve) => {
            let i = 0;
            element.innerHTML = "";
            function type() {
                if (i < text.length) {
                    element.innerHTML += text.charAt(i);
                    i++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            }
            type();
        });
    }

    // Ambient Audio Handler (Autoplay bypass)
    const playAmbience = () => {
        if (hum && hum.paused) {
            hum.volume = 0;
            hum.play().catch(() => {});
            let vol = 0;
            const fadeIn = setInterval(() => {
                if (vol < 0.3) { vol += 0.02; hum.volume = vol; }
                else { clearInterval(fadeIn); }
            }, 100);
        }
    };

    // Sequential Cinematic Load
    const initEnterSequence = async () => {
        const loadingCN = document.querySelector("#loading-text .cn");
        const loadingEN = document.querySelector("#loading-text .en");
        const statusBox = document.querySelector(".status-box");
        const fogContainer = document.getElementById("fog-container");

        // Start Fog & Try Audio
        setTimeout(() => { if (fogContainer) fogContainer.classList.add("active"); }, 500);
        document.addEventListener('mousemove', playAmbience, { once: true });
        document.addEventListener('click', playAmbience, { once: true });

        // Phase 1: Typing Loading
        await typeEffect(loadingCN, "系统加载中...", 80);
        loadingCN.innerHTML += '<span class="typing-cursor"></span>';
        
        await new Promise(r => setTimeout(r, 400));
        loadingEN.style.opacity = "1";
        loadingEN.style.transition = "opacity 2s ease";

        // Phase 2: Status Reveal (Unauthorized)
        setTimeout(() => {
            if (statusBox) {
                statusBox.classList.add("active");
                statusBox.classList.add("glitch");
            }
        }, 1000);

        // Phase 3: Exclusive Access Trigger
        setTimeout(() => {
            if (enterBtn) enterBtn.classList.add("active");
        }, 2200);
    };

    initEnterSequence();

    if (enterBtn) {
        enterBtn.addEventListener("click", () => {
            // Play Transition Audio if available
            if (window.enterAudioURL) {
                const trAudio = new Audio(window.enterAudioURL);
                trAudio.volume = 0.35; // Comfortable low volume
                trAudio.play().catch(() => {});
            }
                 // ZERO LATENCY SYSTEM SCAN: 5.0s Glide + Glow
            const enterScreen = document.getElementById("enter-screen");
            const enterContent = document.querySelector(".enter-content");

            if (enterContent) enterContent.classList.add("combo-content-fade");

            const columnCount = 20;
            const columns = [];
            const cLines = [];
            
            // EXACT 20 CHARACTERS FOR 20 COLUMNS
            // Mapping: "WELCOME" (cols 2-8), "欢迎" (cols 17-18)
            // DYNAMIC 20 CHARACTERS FROM ADMIN CONFIG
            // Padding logic ensures cinematic grid remains 100% aligned
            const rawTop = CONFIG.transTop || "  WELCOME       欢迎  ";
            const rawMid = CONFIG.transMid || " ACCESS GRANTED 授权通过";
            
            // Force exactly 20 chars by padding or slicing
            const topStr = rawTop.padEnd(20, " ").slice(0, 20);
            const midStr = rawMid.padEnd(20, " ").slice(0, 20);

            if (enterScreen) {
                for (let i = 0; i < columnCount; i++) {
                    const col = document.createElement("div");
                    col.className = "pixel-column";
                    col.style.left = (i * (100 / columnCount)) + "%";
                    
                    const welcomeChar = document.createElement("div");
                    welcomeChar.className = "welcome-msg";
                    welcomeChar.innerText = topStr[i] || " ";
                    col.appendChild(welcomeChar);

                    const accessChar = document.createElement("div");
                    accessChar.className = "access-msg";
                    accessChar.innerText = midStr[i] || " ";
                    col.appendChild(accessChar);

                    enterScreen.appendChild(col);
                    columns.push(col);
                }

                for (let i = 0; i < 20; i++) {
                    const line = document.createElement("div");
                    line.className = "constellation-line";
                    line.style.top = Math.random() * 100 + "vh";
                    line.style.left = Math.random() * 100 + "vw";
                    line.style.transform = `rotate(${Math.random() * 360}deg)`;
                    enterScreen.appendChild(line);
                    cLines.push(line);
                }

                setTimeout(() => {
                    columns.forEach((col, idx) => {
                        // Stage 1: Glow (Scan)
                        setTimeout(() => {
                            col.classList.add("column-select-glow");
                        }, idx * 150); 

                        // Stage 2: Ultra-Slow Glide
                        setTimeout(() => {
                            col.classList.add("pixel-active");
                        }, idx * 150 + 600); 
                    });

                    setTimeout(() => {
                        cLines.forEach((line, idx) => {
                            setTimeout(() => {
                                line.classList.add("constellation-active");
                            }, idx * 90); 
                        });
                        
                        // Apply High-End Glitch Fade Out to the Background Video
                        const env = enterScreen.querySelector('.enter-video');
                        if (env) env.classList.add('glitch-out');

                        enterScreen.style.background = "transparent";
                        enterScreen.style.transition = "opacity 2.5s ease 1s";
                        enterScreen.style.opacity = "0";
                    }, 1500);

                }, 500);

                enterScreen.style.pointerEvents = "none";
            }
            const humFade = setInterval(() => {
                if (hum && hum.volume > 0.02) hum.volume -= 0.02;
                else { if(hum) hum.pause(); clearInterval(humFade); }
            }, 50);

            // Sync with existing audio engine
            if (audio) {
                audio.volume = 0.5;
                audio.play().then(() => {
                    isPlaying = true;
                    if (typeof updatePlayPauseIcon === 'function') updatePlayPauseIcon();
                }).catch(() => {});
            }

            if (isVideo && typeof bgVideo !== 'undefined') {
                bgVideo.play().catch(() => {});
            }

            // SHATTERED ASSEMBLE GLITCH - Site constructs behind the columns
            setTimeout(() => {
                if (mainContent) {
                    mainContent.classList.remove("hidden");
                    mainContent.classList.add("main-glitch-active");
                    
                    const blocksToAnimate = [
                        document.querySelector(".container"),
                        document.getElementById("view-counter-box"),
                        document.getElementById("side-music-panel"),
                        document.getElementById("album-showcase"),
                        document.getElementById("obscura-section"),
                        document.querySelector(".spotify-tape-container"),
                        document.querySelector(".bottom-social-section"),
                        document.querySelector(".tape-copyright")
                    ];
                    
                    blocksToAnimate.forEach((block, index) => {
                        if (block) {
                            block.classList.remove("hidden");
                            block.style.display = (block.id === 'album-showcase') ? 'block' : '';
                            block.style.opacity = "0";
                            block.style.visibility = "visible";
                            // High-end Shattered Assemble
                            block.style.animation = `glitchEntrance 1.2s cubic-bezier(0.19, 1, 0.22, 1) ${index * 0.12}s forwards`;
                        }
                    });
                }
            }, 3000);

            // Final Enter Screen Cleanup - After the assemble sequence
            setTimeout(() => {
                enterScreen.style.display = "none";
                document.body.style.overflowY = "auto";
                document.body.classList.add("scroll-enabled");

                // Post-reveal Start Initializations
                setTimeout(() => {
                    if (typeof startDanmaku === 'function') startDanmaku();
                }, 1000);
            }, 6500);
        });
    }

    // Enforce video playback continuously
    setInterval(() => {
        if (isVideo && bgVideo.paused) {
            bgVideo.play().catch(() => {});
        }
    }, 1000);

    audioToggle.addEventListener("click", () => {
        audio.muted = !audio.muted;
        audioToggle.innerHTML = audio.muted
            ? '<i class="fa-solid fa-volume-xmark"></i>'
            : '<i class="fa-solid fa-volume-high"></i>';
    });

    const volumeSlider = document.getElementById("volume-slider");
    if (volumeSlider) {
        volumeSlider.addEventListener("input", (e) => {
            const vol = e.target.value / 100;
            baseVolume = vol; // Store user preference
            if (!isVolumeLowered) {
                audio.volume = vol;
            } else {
                audio.volume = vol * 0.2; // Keep at lowered state if scrolled down
            }

            if (vol === 0) {
                audio.muted = true;
                audioToggle.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            } else {
                audio.muted = false;
                audioToggle.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            }
        });
    }

    // Player math (Variables consolidated at the top)
    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    audio.addEventListener("loadedmetadata", () => {
        totalTimeEl.textContent = formatTime(audio.duration);
    });

    audio.addEventListener("timeupdate", () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBarFill.style.width = progressPercent + "%";
            currentTimeEl.textContent = formatTime(audio.currentTime);
        }
    });

    progressBarBg.addEventListener("click", (e) => {
        const width = progressBarBg.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        audio.currentTime = (clickX / width) * duration;
    });

    playPauseBtn.addEventListener("click", () => {
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
        playPauseBtn.className = isPlaying ? "fa-solid fa-pause" : "fa-solid fa-play";
    }

    // Rain
    const rainContainer = document.getElementById("rain-container");

    function createRaindrop() {
        if (document.hidden) return;

        const drop = document.createElement("div");
        drop.classList.add("raindrop");
        // Start from -20vw up to 130vw to account for the angled fall
        drop.style.left = (Math.random() * 150 - 20) + "vw";

        const duration = Math.random() * 0.3 + 0.2; // Faster drops
        drop.style.animationDuration = duration + "s";
        drop.style.opacity = Math.random() * 0.45 + 0.1;
        drop.style.height = (Math.random() * 40 + 60) + "px";

        // Add depth to realistic rain (some drops closer/blurred)
        const depth = Math.random();
        if (depth < 0.3) {
            drop.style.filter = "blur(1.5px)";
            drop.style.zIndex = "1";
        } else if (depth > 0.8) {
            drop.style.filter = "blur(3px)";
            drop.style.zIndex = "3";
        } else {
            drop.style.zIndex = "-1";
        }

        rainContainer.appendChild(drop);
        setTimeout(() => drop.remove(), duration * 1000);
    }

    setInterval(createRaindrop, 25);

    // Global Local Time
    function updateLocalTime() {
        const timeBox = document.getElementById("local-time");
        if (timeBox) {
            const now = new Date();
            // Format time dynamically for the user's specific timezone (country)
            const timeString = now.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true
            });
            timeBox.textContent = timeString;
        }
    }
    
    // Initialize local time
    updateLocalTime();
    setInterval(updateLocalTime, 1000);

    // --- DANMAKU BACKGROUND COMMENTS ---
    const danmakuContainer = document.getElementById("danmaku-container");
    const DANMAKU_PHRASES = [
        "你好呀～今天也要开心哦 💕", "来啦来啦！这里好可爱 🥺", "你的风格真的好特别 ✨", "好喜欢这里的感觉 💖",
        "太温柔了吧这个页面 🫶", "夜晚的感觉好适合这里 🌙", "有种霓虹梦境的感觉 ✨", "这里像一场安静的梦 💤",
        "氛围感拉满了 💫", "好像在未来城市里 🚶‍♀️", "这也太酷了吧 😭🔥", "谁设计的？太会了吧 👀",
        "我直接爱住了 💀💖", "怎么可以这么好看 😩", "我不走了 我住这里 🏠", "嘿嘿 我来踩一脚 👣",
        "路过打个卡 📍", "抱走这个页面了 🥺", "偷偷喜欢一下 🤫💗", "给你一个小心心 ❤️",
        "夜色刚刚好 节奏刚刚响 🎧", "这氛围像一首歌 in the loop 🎶", "低音一来我就上头了 🔊", "霓虹在闪 心跳在加速 💓",
        "这感觉很月石风 😏", "Just dropped by and stayed 🥺", "Leaving my vibe here ✨", "Okay but this is kinda perfect 😭",
        "I’m keeping this forever 💖", "This is my new comfort place 🏠", "I love this 💕", "So pretty ✨",
        "This is cute 🥺", "I’m obsessed 💖", "Perfect vibe 💫"
    ];

    function createDanmaku(text) {
        if (!danmakuContainer) return;
        const item = document.createElement("div");
        item.className = "danmaku-item";
        
        // Random Horizontal Distribution
        const left = 10 + Math.random() * 80;
        item.style.left = `${left}%`;
        
        // Random Speed (Variety)
        const duration = 18 + Math.random() * 12; // 18s to 30s
        item.style.animation = `danmakuFloat ${duration}s linear forwards`;
        
        // Visual Variety (Scale)
        const scale = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
        item.style.setProperty('--scale', scale);
        
        // Random horizontal drift during rising
        const horizontalDrift = (Math.random() - 0.5) * 60; // +/- 30px
        item.style.setProperty('--drift', `${horizontalDrift}px`);

        const avatarSeed = Math.floor(Math.random() * 1000);
        item.innerHTML = `
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}" class="danmaku-avatar">
            <span class="danmaku-text">${text}</span>
        `;
        
        danmakuContainer.appendChild(item);
        
        // Remove after animation
        setTimeout(() => {
            item.remove();
        }, duration * 1000);
    }

    // Spawn with random timing
    let spawnTimeout = null;
    function spawnLoop() {
        if (!danmakuContainer) return;
        const randomText = DANMAKU_PHRASES[Math.floor(Math.random() * DANMAKU_PHRASES.length)];
        createDanmaku(randomText);
        
        const nextSpawn = 2000 + Math.random() * 3000; // Every 2-5 seconds
        spawnTimeout = setTimeout(spawnLoop, nextSpawn);
    }

    function startDanmaku() {
        if (spawnTimeout) return;
        spawnLoop();
    }

    // Connect to Firebase if available for live updates
    if (typeof db !== 'undefined') {
        db.collection('live_comments').onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === "added") {
                    createDanmaku(change.doc.data().text);
                }
            });
        });
    }

    // Mobile scroll animation for premium widgets
    const premiumWidgets = document.querySelectorAll(".premium-spotify-box, .premium-apple-box");
    if (premiumWidgets.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                } else {
                    entry.target.classList.remove("in-view");
                }
            });
        }, {
            threshold: 0.3 // Trigger when 30% of the widget is visible
        });
        
        premiumWidgets.forEach(widget => observer.observe(widget));
    }

    // Scroll animation for Discord cards
    const obscuraCards = document.querySelectorAll(".discord-profile-card");
    if (obscuraCards.length > 0) {
        const cardObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        entry.target.classList.add("in-view");
                    }, index * 200); // Staggered reveal effect
                }
            });
        }, {
            threshold: 0.3
        });
        
        obscuraCards.forEach(card => cardObserver.observe(card));
    }

    // Weather Fetching (Visitor-specific via IP Geolocation)
    async function fetchWeather() {
        try {
            let lat, lon, city;
            
            // 1. Try Multiple Geolocation Services (Multi-Layer Failover)
            try {
                const geoRes = await fetch('https://ipapi.co/json/');
                const geoData = await geoRes.json();
                if (geoData.city) {
                    lat = geoData.latitude;
                    lon = geoData.longitude;
                    city = geoData.city;
                }
            } catch (e) {
                try {
                    const geoRes = await fetch('https://ipinfo.io/json?token=6f24d7768f76e3'); // Public key fallback
                    const geoData = await geoRes.json();
                    const loc = geoData.loc.split(',');
                    lat = loc[0]; lon = loc[1];
                    city = geoData.city;
                } catch (e2) {
                    // Final automatic fallback on API level
                }
            }

            // 2. Fetch High Accuracy weather
            if (lat && lon) {
                const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const data = await weatherRes.json();
                
                if (data.current_weather) {
                    document.getElementById('weather-temp').textContent = `${Math.round(data.current_weather.temperature)}°C`;
                    document.getElementById('weather-city').textContent = (city || "COLOMBO").toUpperCase();
                    const codeMap = { 0: "Clear", 1: "Mainly Clear", 2: "Partly Cloudy", 3: "Overcast", 45: "Fog", 48: "Fog", 51: "Drizzle", 61: "Rain", 71: "Snow", 95: "Thunderstorm" };
                    document.getElementById('weather-desc').textContent = codeMap[data.current_weather.weathercode] || "Clear";
                    return; // Success
                }
            }

            // 3. Fallback to wttr.in (Reliable auto-IP detection)
            const res = await fetch('https://wttr.in/?format=j1');
            const data = await res.json();
            document.getElementById('weather-temp').textContent = `${data.current_condition[0].temp_C}°C`;
            document.getElementById('weather-city').textContent = (data.nearest_area[0].areaName[0].value).toUpperCase();
            document.getElementById('weather-desc').textContent = data.current_condition[0].weatherDesc[0].value;
            
        } catch (error) {
            console.error("Critical Weather Failure:", error);
            document.getElementById('weather-temp').textContent = "ERROR";
        }
    }
    
    fetchWeather();
    setInterval(fetchWeather, 600000); // Update every 10 mins

    // Persistent & Real-Time Visitor Counter (Firestore)
    function trackLiveVisitors() {
        if (typeof db === 'undefined') return;

        // 1. Live Presence (Who's online right now)
        const visitorId = localStorage.getItem('visitor_id') || Math.random().toString(36).substring(7);
        localStorage.setItem('visitor_id', visitorId);
        const presenceRef = db.collection('presence').doc(visitorId);
        const updatePresence = () => { presenceRef.set({ lastActive: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }); };
        updatePresence(); setInterval(updatePresence, 30000);

        db.collection('presence')
            .where('lastActive', '>', new Date(Date.now() - 300000)) // Active in last 5 minutes (wider range for better reliability)
            .onSnapshot(snapshot => {
                const count = snapshot.size;
                const el = document.getElementById('live-visitors-mini');
                if (el) el.textContent = count;
            });

        // 2. Global Total Count (Increments on access)
        const statsRef = db.collection('analytics').doc('visitor_stats');
        
        // Session-based increment to prevent spam
        if (!sessionStorage.getItem('counted')) {
            sessionStorage.setItem('counted', 'true');
            statsRef.set({ 
                total_count: firebase.firestore.FieldValue.increment(1) 
            }, { merge: true }).catch(() => {
                // If doc doesn't exist, create it
                statsRef.set({ total_count: 1 });
            });
        }

        // Live update for everyone's screen
        statsRef.onSnapshot(doc => {
            if (doc.exists) {
                const total = doc.data().total_count;
                const el = document.getElementById('total-visitors');
                if (el) el.textContent = total;
            }
        });
    }

    trackLiveVisitors();

    // Scroll animation for regular elements (Title, Desc, Button)
    const scrollElements = document.querySelectorAll(".scroll-animate");
    if (scrollElements.length > 0) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                }
            });
        }, {
            threshold: 0.1
        });

        scrollElements.forEach(el => scrollObserver.observe(el));
    }

    // Realistic Wind Effect for Enter Screen
    function initWindEffect() {
        const windContainer = document.getElementById("wind-container");
        if (!windContainer) return;

        let isRunning = true;

        function createParticle(isDust) {
            if (!isRunning) return;
            const particle = document.createElement("div");
            particle.classList.add(isDust ? "wind-dust" : "wind-streak");
            
            particle.style.top = Math.random() * 100 + "%";
            
            if (!isDust) {
                particle.style.width = (Math.random() * 200 + 50) + "px";
                particle.style.animationDuration = (Math.random() * 0.5 + 0.3) + "s";
                particle.style.opacity = Math.random() * 0.3 + 0.1;
            } else {
                const size = (Math.random() * 3 + 2) + "px";
                particle.style.width = size;
                particle.style.height = size;
                particle.style.setProperty("--drift-y", (Math.random() * 40 - 20) + "vh");
                particle.style.animationDuration = (Math.random() * 1.5 + 0.5) + "s";
                particle.style.opacity = Math.random() * 0.5 + 0.2;
            }

            windContainer.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode) particle.remove();
            }, parseInt(particle.style.animationDuration) * 1000); // Wait for animation to finish
        }

        // Generate particles occasionally
        const streakInterval = setInterval(() => createParticle(false), 80);
        const dustInterval = setInterval(() => createParticle(true), 40);

        // Stop wind and clean up when entering site
        const enterBtn = document.querySelector(".enter-btn");
        if (enterBtn) {
            enterBtn.addEventListener("click", () => {
                isRunning = false;
                clearInterval(streakInterval);
                clearInterval(dustInterval);
            });
        }
    }
    
    initWindEffect();
});

// Modal Logic for Spotify and Apple Music
window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    // Auto-disable Lenis scrolling when modal opens, prevents scrolling background
    if (typeof lenis !== "undefined") lenis.stop();
    document.body.style.overflow = "hidden";
    
    modal.classList.add("modal-active");
};

window.closeModals = function() {
    const modals = document.querySelectorAll('.music-modal');
    modals.forEach(m => m.classList.remove('modal-active'));
    
    // Re-enable scrolling when modals are all closed
    if (typeof lenis !== "undefined") lenis.start();
    document.body.style.overflow = "";
};


