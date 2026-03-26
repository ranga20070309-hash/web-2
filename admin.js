/* ADMIN.JS FULL SCRIPT */
const firebaseConfig = {
    apiKey: "AIzaSyBHVei7sBSauONN2s7Ecn9rGjDLw-EwfEU", authDomain: "admin-site-ranga.firebaseapp.com",
    projectId: "admin-site-ranga", storageBucket: "admin-site-ranga.firebasestorage.app",
    messagingSenderId: "308380589863", appId: "1:308380589863:web:ea6a55d4674a35c0f1d302"
};
try{ firebase.initializeApp(firebaseConfig); } catch(e){}
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    // Tabs
    const tabs = document.querySelectorAll('.nav-item'), contents = document.querySelectorAll('.tab-content');
    tabs.forEach(t => t.addEventListener('click', e => {
        e.preventDefault();
        tabs.forEach(n => n.classList.remove('active')); contents.forEach(c => c.classList.remove('active'));
        t.classList.add('active'); document.getElementById(t.dataset.tab).classList.add('active');
    }));

    if(document.getElementById('config-color')) document.getElementById('config-color').addEventListener('input', e => document.getElementById('color-hex-display').textContent = e.target.value);

    let teamData=[], tapeData=[], socData=[];
    
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
    };
    
    const renderTeam = () => renderList('team-container', teamData, (t,i) => `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
           <div class="form-group"><label>Name</label><input type="text" onchange="teamData[${i}].name=this.value" value="${t.name||''}"></div>
           <div class="form-group"><label>Role / Badge</label><input type="text" onchange="teamData[${i}].role=this.value" value="${t.role||''}"></div>
           <div class="form-group"><label>Bio</label><input type="text" onchange="teamData[${i}].bio=this.value" value="${t.bio||''}"></div>
           <div class="form-group"><label>Text Color</label><input type="text" onchange="teamData[${i}].color=this.value" value="${t.color||'#ffffff'}"></div>
           <div class="form-group"><label>BG Gradient 1</label><input type="color" onchange="teamData[${i}].bg1=this.value" value="${t.bg1||'#112244'}"></div>
           <div class="form-group"><label>BG Gradient 2</label><input type="color" onchange="teamData[${i}].bg2=this.value" value="${t.bg2||'#001122'}"></div>
        </div>
    `);
    const renderTape = () => renderList('tape-container', tapeData, (t,i) => `
        <div style="display:grid;grid-template-columns:1fr;gap:10px;">
           <div class="form-group"><label>Artist/Name</label><input type="text" onchange="tapeData[${i}].artist=this.value" value="${t.artist||''}"></div>
           <div class="form-group"><label>Spotify Link URL</label><input type="text" onchange="tapeData[${i}].url=this.value" value="${t.url||''}"></div>
           <div class="form-group"><label>Album Art Image URL</label><input type="text" onchange="tapeData[${i}].img=this.value" value="${t.img||''}"></div>
        </div>
    `);
    const renderSoc = () => renderList('soc-container', socData, (t,i) => `
        <div style="display:grid;grid-template-columns:1fr;gap:10px;">
           <div class="form-group"><label>Icon (eg. instagram, tiktok)</label><input type="text" onchange="socData[${i}].icon=this.value" value="${t.icon||''}"></div>
           <div class="form-group"><label>Display Text</label><input type="text" onchange="socData[${i}].text=this.value" value="${t.text||''}"></div>
           <div class="form-group"><label>Link URL</label><input type="text" onchange="socData[${i}].url=this.value" value="${t.url||''}"></div>
        </div>
    `);    const statusText=document.getElementById('connection-status'), dot=document.querySelector('.status-indicator .dot');
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
                cover: "https://image-cdn-ak.spotifycdn.com/image/ab67616d00001e021e7234ca35ed22aa3b5d6bc4",
                title: "Echoing Funk",
                streams: "142,500+",
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
        setVal('config-discord-id', d.discordUserId); setVal('config-discord-avatar', d.fallbackDiscordAvatarUrl); setVal('config-discord-username', d.fallbackDiscordUsername);
        if(d.socials) { setVal('config-spotify', d.socials.spotify); setVal('config-tiktok', d.socials.tiktok); setVal('config-apple', d.socials.apple); }
        
        setVal('cfg-enter-video', d.enterVideo); setVal('cfg-enter-title', d.enterTitle); setVal('cfg-enter-btn', d.enterButton);
        setVal('cfg-obs-title', d.obscuraTitle); setVal('cfg-obs-desc', d.obscuraDesc); setVal('cfg-obs-discord', d.obscuraDiscord);
        setVal('cfg-obs-footer-title', d.obscuraFooterTitle); setVal('cfg-obs-footer-desc', d.obscuraFooterDesc); setVal('cfg-obs-copyright', d.copyrightText);
        setVal('cfg-btm-soc-title', d.bottomSocialTitle);
        
        if (d.latestSingle) {
            setVal('cfg-ls-cover', d.latestSingle.cover); setVal('cfg-ls-title', d.latestSingle.title); setVal('cfg-ls-streams', d.latestSingle.streams);
            setVal('cfg-ls-prod', d.latestSingle.prod); setVal('cfg-ls-mix', d.latestSingle.mix); setVal('cfg-ls-coprod', d.latestSingle.coprod);
            setVal('cfg-ls-url', d.latestSingle.url);
        }

        if(statusText){ statusText.textContent="Live Synced"; dot.style.background="#2ecc71"; }
    });

    const val = id => document.getElementById(id)?document.getElementById(id).value:'';

    const saveBtn = document.getElementById('save-btn');
    if(saveBtn) saveBtn.addEventListener('click', () => {
        const orig=saveBtn.innerHTML; saveBtn.innerHTML='Saving...';
        const newData = {
            name:val('config-name'), tabName:val('config-tabname'), title:val('config-title'), location:val('config-location'),
            backgroundMedia:val('config-bg'), primaryColor:val('config-color'), audioSrc:val('config-audio-src'),
            songTitle:val('config-song-title'), albumArt:val('config-album-art'), discordUserId:val('config-discord-id'),
            fallbackDiscordAvatarUrl:val('config-discord-avatar'), fallbackDiscordUsername:val('config-discord-username'),
            socials: { spotify:val('config-spotify'), tiktok:val('config-tiktok'), apple:val('config-apple') },
            
            enterVideo:val('cfg-enter-video'), enterTitle:val('cfg-enter-title'), enterButton:val('cfg-enter-btn'),
            obscuraTitle:val('cfg-obs-title'), obscuraDesc:val('cfg-obs-desc'), obscuraDiscord:val('cfg-obs-discord'),
            obscuraFooterTitle:val('cfg-obs-footer-title'), obscuraFooterDesc:val('cfg-obs-footer-desc'), copyrightText:val('cfg-obs-copyright'),
            bottomSocialTitle:val('cfg-btm-soc-title'),
            latestSingle: {
                cover: val('cfg-ls-cover'), title: val('cfg-ls-title'), streams: val('cfg-ls-streams'),
                prod: val('cfg-ls-prod'), mix: val('cfg-ls-mix'), coprod: val('cfg-ls-coprod'), url: val('cfg-ls-url')
            }
        };
        db.collection('settings').doc('main').set(newData,{merge:true}).then(()=>{
            saveBtn.innerHTML='Published!'; saveBtn.style.background='#2ecc71';
            setTimeout(()=>{ saveBtn.innerHTML=orig; saveBtn.style.background=''; }, 2000);
        });
    });
});
