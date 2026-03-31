/* ADMIN.JS FULL SCRIPT */
const firebaseConfig = {
    apiKey: "AIzaSyBHVei7sBSauONN2s7Ecn9rGjDLw-EwfEU", authDomain: "admin-site-ranga.firebaseapp.com",
    projectId: "admin-site-ranga", storageBucket: "admin-site-ranga.firebasestorage.app",
    messagingSenderId: "308380589863", appId: "1:308380589863:web:ea6a55d4674a35c0f1d302"
};
try{ firebase.initializeApp(firebaseConfig); } catch(e){}
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth State
    auth.onAuthStateChanged(user => {
        const overlay = document.getElementById('login-overlay');
        if (user) {
            document.body.classList.add('logged-in');
            if(overlay) overlay.style.display = 'none';
        } else {
            document.body.classList.remove('logged-in');
            if(overlay) overlay.style.display = 'flex';
        }
    });

    // Login Logic
    const loginBtn = document.getElementById('login-btn');
    if(loginBtn) loginBtn.addEventListener('click', () => {
        const email = document.getElementById('login-email').value;
        const pass = document.getElementById('login-password').value;
        const errDiv = document.getElementById('login-error');
        if(!email || !pass) { errDiv.textContent="Enter both email/password"; errDiv.style.display='block'; return;}
        
        loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Logging in...';
        auth.signInWithEmailAndPassword(email, pass).catch(err => {
            errDiv.textContent = err.message;
            errDiv.style.display = 'block';
            loginBtn.innerHTML = 'Login To Dashboard';
        });
    });

    // Logout Logic
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut();
    });

    // Credentials Update Logic
    const updateEmailBtn = document.getElementById('update-email-btn');
    if(updateEmailBtn) updateEmailBtn.addEventListener('click', () => {
        const newEmail = document.getElementById('sec-new-email').value;
        if(!newEmail) return alert("Enter a new email");
        auth.currentUser.updateEmail(newEmail).then(() => {
            alert("Username (Email) Updated Successfully!");
        }).catch(e => alert("Error: " + e.message));
    });

    const updatePassBtn = document.getElementById('update-pass-btn');
    if(updatePassBtn) updatePassBtn.addEventListener('click', () => {
        const newPass = document.getElementById('sec-new-pass').value;
        const confPass = document.getElementById('sec-confirm-pass').value;
        if(!newPass) return alert("Enter a new password");
        if(newPass !== confPass) return alert("Passwords do not match");
        
        auth.currentUser.updatePassword(newPass).then(() => {
            alert("Password Updated Successfully!");
        }).catch(e => alert("Error: " + e.message));
    });

    // Tabs
    const tabs = document.querySelectorAll('.nav-item'), contents = document.querySelectorAll('.tab-content');
    tabs.forEach(t => t.addEventListener('click', e => {
        e.preventDefault();
        tabs.forEach(n => n.classList.remove('active')); contents.forEach(c => c.classList.remove('active'));
        t.classList.add('active'); document.getElementById(t.dataset.tab).classList.add('active');
    }));

    if(document.getElementById('config-color')) document.getElementById('config-color').addEventListener('input', e => document.getElementById('color-hex-display').textContent = e.target.value);

    let teamData=[], tapeData=[], socData=[], wallpaperData=[];
    
    const renderList = (containerId, dataArray, templateFn) => {
        const c = document.getElementById(containerId); if(!c) return; c.innerHTML='';
        dataArray.forEach((item, i) => {
            const div=document.createElement('div'); div.className='card'; div.style.position='relative';
            div.innerHTML = templateFn(item, i) + `<button onclick="removeItem('${containerId}', ${i})" style="position:absolute;top:15px;right:15px;background:#e74c3c;border:none;color:#fff;padding:5px 10px;border-radius:5px;cursor:pointer;">X</button>`;
            c.appendChild(div);
        });
    };
    
    window.removeItem = (type, i) => {
        if(type==='team-container'){ teamData.splice(i,1); renderTeam(); }
        if(type==='tape-container'){ tapeData.splice(i,1); renderTape(); }
        if(type==='soc-container'){ socData.splice(i,1); renderSoc(); }
        if(type==='wallpaper-container'){ wallpaperData.splice(i,1); renderWallpaper(); }
    };
    
    window.renderTeam = () => renderList('team-container', teamData, (t,i) => `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
           <div class="form-group"><label>Name</label><input type="text" onchange="teamData[${i}].name=this.value" value="${t.name||''}"></div>
           <div class="form-group"><label>Role / Badge</label><input type="text" onchange="teamData[${i}].role=this.value" value="${t.role||''}"></div>
           <div class="form-group"><label>Bio</label><input type="text" onchange="teamData[${i}].bio=this.value" value="${t.bio||''}"></div>
           <div class="form-group"><label>Text Color</label><input type="text" onchange="teamData[${i}].color=this.value" value="${t.color||'#ffffff'}"></div>
           <div class="form-group"><label>BG Gradient 1</label><input type="color" onchange="teamData[${i}].bg1=this.value" value="${t.bg1||'#112244'}"></div>
           <div class="form-group"><label>BG Gradient 2</label><input type="color" onchange="teamData[${i}].bg2=this.value" value="${t.bg2||'#001122'}"></div>
        </div>
    `);
    window.renderTape = () => renderList('tape-container', tapeData, (t,i) => `
        <div style="display:grid;grid-template-columns:1fr;gap:10px;">
           <div class="form-group"><label>Artist/Name</label><input type="text" onchange="tapeData[${i}].artist=this.value" value="${t.artist||''}"></div>
           <div class="form-group"><label>Spotify Link URL</label><input type="text" onchange="tapeData[${i}].url=this.value" value="${t.url||''}"></div>
           <div class="form-group"><label>Album Art Image URL</label><input type="text" onchange="tapeData[${i}].img=this.value" value="${t.img||''}"></div>
        </div>
    `);
    window.renderSoc = () => renderList('soc-container', socData, (t,i) => `
        <div style="display:grid;grid-template-columns:1fr;gap:10px;">
           <div class="form-group"><label>Icon (eg. instagram, tiktok)</label><input type="text" onchange="socData[${i}].icon=this.value" value="${t.icon||''}"></div>
           <div class="form-group"><label>Display Text</label><input type="text" onchange="socData[${i}].text=this.value" value="${t.text||''}"></div>
           <div class="form-group"><label>Link URL</label><input type="text" onchange="socData[${i}].url=this.value" value="${t.url||''}"></div>
        </div>
    `);    window.renderWallpaper = () => renderList('wallpaper-container', wallpaperData, (t,i) => `
        <div style="display:grid;grid-template-columns:1fr;gap:10px;">
           <div class="form-group"><label>Wallpaper Video/Image URL</label><input type="text" onchange="wallpaperData[${i}].url=this.value" value="${t.url||''}"></div>
        </div>
    `);

    const statusText=document.getElementById('connection-status'), dot=document.querySelector('.status-indicator .dot');
    const setVal = (id, val) => { if(document.getElementById(id)) document.getElementById(id).value = val || ''; }
    
    if (db) db.collection('settings').doc('main').get().then(doc => {
        const d = doc.exists ? doc.data() : (typeof CONFIG!=='undefined'?CONFIG:{});
        
        // Setup initial default values for Arrays if DB is empty
        if (!doc.exists || !d.enterTitle) {
            d.enterVideo = "https://image2url.com/r2/default/videos/1773178239885-4fc6156d-03bd-4dd6-ae95-ba022f2a9959.mp4";
            d.enterTitle = "Welcome To My Site Buddy"; d.enterButton = "I'm Here To Look Your Site";
            d.obscuraTitle = "OBSCURA RECORDS"; d.obscuraDesc = "OBSCURA RECORDS is an independent music label focused on artist development, music production, and official releases.<br/>Our mission is to support talented artists and create high-quality music through collaboration and innovation.";
            d.obscuraDiscord = "https://discord.gg/uyvWq2UN"; d.obscuraFooterTitle = "We Are The Team Of OBSCURA";
            d.obscuraFooterDesc = "Join to the server and make music with other producers"; d.copyrightText = "COPYRIGHTED BY OBSCURA RECORDS";
            d.bottomSocialTitle = "CONTACT WITH SOCIAL MEDIA";
            d.latestSingle = {
                type: "LATEST SINGLE",
                cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e021e7234ca35ed22aa3b5d6bc4",
                title: "Echoing Funk",
                artist: "||RANGA||",
                qty: "1 Song",
                prod: "RANGA",
                mix: "SVYUXU",
                coprod: "FL4ME",
                url: "https://open.spotify.com/album/5UjUGkRTqodtoni6VLQJ4t"
            };
        }

        setVal('config-name', d.name); setVal('config-tabname', d.tabName); setVal('config-title', d.title);
        setVal('config-location', d.location); setVal('config-bg', d.backgroundMedia);
        if(d.primaryColor) { setVal('config-color', d.primaryColor); if(document.getElementById('color-hex-display')) document.getElementById('color-hex-display').textContent=d.primaryColor; }
        setVal('config-audio-src', d.audioSrc); setVal('config-song-title', d.songTitle); setVal('config-album-art', d.albumArt);
        setVal('config-discord-id', d.discordUserId); setVal('config-discord-avatar', d.fallbackDiscordAvatarUrl); 
        setVal('config-discord-username', d.fallbackDiscordUsername); setVal('config-discord-phrase', d.discordChinesePhrase || "我在等你");
        if(d.socials) { setVal('config-spotify', d.socials.spotify); setVal('config-tiktok', d.socials.tiktok); setVal('config-apple', d.socials.apple); }
        
        setVal('cfg-enter-video', d.enterVideo); setVal('cfg-enter-audio', d.enterAudio); setVal('cfg-enter-title', d.enterTitle); setVal('cfg-enter-btn', d.enterButton);
        setVal('cfg-loading-cn', d.loadingTextCN || "ULTRA SYSTEM BOOT 超级系统启动"); setVal('cfg-loading-en', d.loadingTextEN || "INITIALIZING SYSTEM...");
        setVal('cfg-status-cn', d.statusTextCN || "ONLINE 联机"); setVal('cfg-status-en', d.statusTextEN || "SYSTEM STATUS: STABLE");
        setVal('cfg-btn-cn', d.btnTextCN || "GRANT ACCESS 授权通过"); setVal('cfg-btn-en', d.btnTextEN || "ENTER TERMINAL");
        setVal('cfg-trans-top', d.transTop || "  WELCOME       欢迎  "); setVal('cfg-trans-mid', d.transMid || " ACCESS GRANTED 授权通过");

        // Obscura Info
        setVal('cfg-obs-title', d.obscuraTitle); setVal('cfg-obs-desc', d.obscuraDesc); setVal('cfg-obs-discord', d.obscuraDiscord);
        setVal('cfg-obs-footer-title', d.obscuraFooterTitle); setVal('cfg-obs-footer-desc', d.obscuraFooterDesc); setVal('cfg-obs-copyright', d.copyrightText);
        setVal('cfg-btm-soc-title', d.bottomSocialTitle);
        
        // Latest Single
        if (d.latestSingle) {
            setVal('cfg-ls-type', d.latestSingle.type || "LATEST SINGLE");
            setVal('cfg-ls-cover', d.latestSingle.cover); setVal('cfg-ls-title', d.latestSingle.title); 
            setVal('cfg-ls-artist', d.latestSingle.artist); setVal('cfg-ls-qty', d.latestSingle.qty);
            setVal('cfg-ls-prod', d.latestSingle.prod); setVal('cfg-ls-mix', d.latestSingle.mix); setVal('cfg-ls-coprod', d.latestSingle.coprod);
            setVal('cfg-ls-url', d.latestSingle.url);
            if (d.latestSingle.releaseDate) {
                const parts = d.latestSingle.releaseDate.split('T');
                setVal('cfg-ls-release-date', parts[0]);
                if (parts.length > 1) setVal('cfg-ls-release-time', parts[1]);
            }
        }
        
        // Load Dynamic Lists
        if(d.teamMembers) { teamData = d.teamMembers; renderTeam(); }
        if(d.tapeGallery) { tapeData = d.tapeGallery; renderTape(); }
        if(d.customSocials) { socData = d.customSocials; renderSoc(); }
        
        // Ensure the 4 cinematic links are there by default if empty
        if(d.dynamicWallpapers && d.dynamicWallpapers.length > 0) {
            wallpaperData = d.dynamicWallpapers;
        } else {
            wallpaperData = [
                {url: "https://videotourl.com/videos/1774973827309-e1cdfbb5-8624-4fb6-a917-9a584266b8cd.mp4"},
                {url: "https://videotourl.com/videos/1774973950526-e4bd6a76-8171-4a22-a371-443fe941b7eb.mp4"},
                {url: "https://videotourl.com/videos/1774973971708-5a99ab97-9985-4a7f-b649-a78eb3528305.mp4"},
                {url: "https://videotourl.com/videos/1774973997025-cda5ff0c-7c94-4e0c-b339-a65cc0e65a63.mp4"}
            ];
        }
        renderWallpaper();

        if(statusText){ statusText.textContent="Live Synced"; dot.style.background="#2ecc71"; }
    });

    const val = id => document.getElementById(id)?document.getElementById(id).value:'';

    const saveBtn = document.getElementById('save-btn');
    if(saveBtn) saveBtn.addEventListener('click', () => {
        const orig=saveBtn.innerHTML; saveBtn.innerHTML='Saving...';
        
        const rDate = val('cfg-ls-release-date');
        const rTime = val('cfg-ls-release-time') || '00:00';
        const finalReleaseDate = rDate ? `${rDate}T${rTime}` : '';

        const newData = {
            name:val('config-name'), tabName:val('config-tabname'), title:val('config-title'), location:val('config-location'),
            backgroundMedia:val('config-bg'), primaryColor:val('config-color'), audioSrc:val('config-audio-src'),
            songTitle:val('config-song-title'), albumArt:val('config-album-art'), discordUserId:val('config-discord-id'),
            fallbackDiscordAvatarUrl:val('config-discord-avatar'), fallbackDiscordUsername:val('config-discord-username'),
            discordChinesePhrase: val('config-discord-phrase'),
            socials: { spotify:val('config-spotify'), tiktok:val('config-tiktok'), apple:val('config-apple') },
            
            enterVideo:val('cfg-enter-video'), enterAudio:val('cfg-enter-audio'), enterTitle:val('cfg-enter-title'), enterButton:val('cfg-enter-btn'),
            loadingTextCN: val('cfg-loading-cn'), loadingTextEN: val('cfg-loading-en'),
            statusTextCN: val('cfg-status-cn'), statusTextEN: val('cfg-status-en'),
            btnTextCN: val('cfg-btn-cn'), btnTextEN: val('cfg-btn-en'),
            dynamicWallpapers: wallpaperData,
            teamMembers: teamData,
            tapeGallery: tapeData,
            customSocials: socData,
            transTop: val('cfg-trans-top'), transMid: val('cfg-trans-mid'),

            obscuraTitle:val('cfg-obs-title'), obscuraDesc:val('cfg-obs-desc'), obscuraDiscord:val('cfg-obs-discord'),
            obscuraFooterTitle:val('cfg-obs-footer-title'), obscuraFooterDesc:val('cfg-obs-footer-desc'), copyrightText:val('cfg-obs-copyright'),
            bottomSocialTitle:val('cfg-btm-soc-title'),
            latestSingle: {
                type: val('cfg-ls-type'), cover: val('cfg-ls-cover'), title: val('cfg-ls-title'), artist: val('cfg-ls-artist'), qty: val('cfg-ls-qty'),
                prod: val('cfg-ls-prod'), mix: val('cfg-ls-mix'), coprod: val('cfg-ls-coprod'), url: val('cfg-ls-url'),
                releaseDate: finalReleaseDate
            }
        };
        db.collection('settings').doc('main').set(newData,{merge:true}).then(()=>{
            saveBtn.innerHTML='<i class="fa-solid fa-check"></i> Published!'; saveBtn.style.background='#2ecc71';
            setTimeout(()=>{ saveBtn.innerHTML=orig; saveBtn.style.background=''; }, 2000);
        }).catch(e => {
            alert("Error saving: " + e.message);
            saveBtn.innerHTML = orig;
        });
    });

    // Handle Enter Screen Audio File Upload correctly
    const enterAudioFile = document.getElementById('cfg-enter-audio-file');
    const enterAudioUrlInput = document.getElementById('cfg-enter-audio');

    if (enterAudioFile) {
        enterAudioFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            // Limit to 20MB for safety (adjust as needed)
            if (file.size > 20 * 1024 * 1024) {
                alert("File is too big! Please use an MP3 smaller than 20MB.");
                return;
            }

            const originalText = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.style.background = '#f39c12';

            const metadata = {
                contentType: file.type || 'audio/mpeg'
            };

            const storagePath = 'audio/' + Date.now() + "_" + file.name;
            const storageRef = storage.ref(storagePath);
            const uploadTask = storageRef.put(file, metadata);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading ${progress}%...`;
                }, 
                (error) => {
                    console.error("Audio upload failed:", error);
                    let msg = error.message;
                    if (error.code === 'storage/unauthorized') msg = "Access Denied! Go to Firebase Console -> Storage -> Rules and set it to: allow read, write: if true;";
                    if (error.code === 'storage/retry-limit-exceeded') msg = "Request timed out. Check your internet connection.";
                    
                    alert("Upload Failed: " + msg);
                    saveBtn.innerHTML = originalText;
                    saveBtn.style.background = '';
                    saveBtn.disabled = false;
                }, 
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                        if (enterAudioUrlInput) enterAudioUrlInput.value = downloadURL;
                        saveBtn.innerHTML = 'Sound Ready!';
                        saveBtn.style.background = '#27ae60';
                        saveBtn.disabled = false;
                        setTimeout(() => { 
                            saveBtn.innerHTML = originalText;
                            saveBtn.style.background = '';
                        }, 3000);
                    }).catch(e => {
                        alert("Error getting URL: " + e.message);
                        saveBtn.innerHTML = originalText;
                        saveBtn.disabled = false;
                    });
                }
            );
        });
    }

    const bgFile = document.getElementById('config-bg-file');
    if (bgFile) {
        bgFile.addEventListener('change', function(e) {
            const file = e.target.files[0]; if(!file) return;
            
            // Large file check and warning
            if (file.size > 50 * 1024 * 1024) {
                if(!confirm("This file is over 50MB. It could significantly slow down your site and quickly use up your Firebase daily bandwidth (1GB limit). Are you sure you want to proceed?")) {
                    bgFile.value = ''; return;
                }
            }

            const originalText = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.style.background = '#f39c12';
            
            const storagePath = 'backgrounds/' + Date.now() + "_" + file.name;
            const storageRef = storage.ref(storagePath);
            const uploadTask = storageRef.put(file);

            uploadTask.on('state_changed', 
                (snapshot) => {
                    const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
                    saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Uploading ${progress}%...`;
                }, 
                (error) => {
                    alert("Upload failed: " + error.message);
                    saveBtn.disabled = false; saveBtn.innerHTML = originalText; saveBtn.style.background = '';
                }, 
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                        const bgUrlInput = document.getElementById('config-bg');
                        if (bgUrlInput) bgUrlInput.value = downloadURL;
                        saveBtn.disabled = false; saveBtn.innerHTML = 'Media Ready!'; saveBtn.style.background = '#27ae60';
                        setTimeout(() => { saveBtn.innerHTML = originalText; saveBtn.style.background = ''; }, 3000);
                    });
                }
            );
        });
    }

    // Handle Image Upload correctly with compression to save DB space natively
    const coverFile = document.getElementById('cfg-ls-cover-file');
    const coverUrlInput = document.getElementById('cfg-ls-cover');
    const coverPreview = document.getElementById('cfg-ls-cover-preview');

    if (coverFile) {
        coverFile.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 400; // Optimal for small UI boxes
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
                    } else {
                        if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to base64 jpeg for extremely small DB storage payload
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                    
                    if (coverUrlInput) coverUrlInput.value = compressedDataUrl;
                    if (coverPreview) {
                        coverPreview.src = compressedDataUrl;
                        coverPreview.style.display = 'block';
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
});
