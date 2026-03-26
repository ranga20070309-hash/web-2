const firebaseConfig = {
    apiKey: "AIzaSyBHVei7sBSauONN2s7Ecn9rGjDLw-EwfEU",
    authDomain: "admin-site-ranga.firebaseapp.com",
    projectId: "admin-site-ranga",
    storageBucket: "admin-site-ranga.firebasestorage.app",
    messagingSenderId: "308380589863",
    appId: "1:308380589863:web:ea6a55d4674a35c0f1d302"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
} catch(err) {
    if (!/already exists/.test(err.message)) {
        console.error("Firebase initialization error", err);
    }
}
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', () => {
    // Basic Tab Switching Logic
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            navItems.forEach(n => n.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));

            item.classList.add('active');
            const targetId = item.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    const colorInput = document.getElementById('config-color');
    const hexDisplay = document.getElementById('color-hex-display');
    if (colorInput && hexDisplay) {
        colorInput.addEventListener('input', (e) => {
            hexDisplay.textContent = e.target.value;
        });
    }

    const saveBtn = document.getElementById('save-btn');
    const statusText = document.getElementById('connection-status');
    const dot = document.querySelector('.status-indicator .dot');

    // Load data from Firebase
    if (db) {
        db.collection('settings').doc('main').get().then(doc => {
            // Priority: Firebase DB -> Existing config.js -> Default empty
            const data = doc.exists ? doc.data() : (typeof CONFIG !== 'undefined' ? CONFIG : {});
            
            if (document.getElementById('config-name')) document.getElementById('config-name').value = data.name || '';
            if (document.getElementById('config-tabname')) document.getElementById('config-tabname').value = data.tabName || '';
            if (document.getElementById('config-title')) document.getElementById('config-title').value = data.title || '';
            if (document.getElementById('config-location')) document.getElementById('config-location').value = data.location || '';
            if (document.getElementById('config-bg')) document.getElementById('config-bg').value = data.backgroundMedia || '';
            
            if (document.getElementById('config-color') && data.primaryColor) {
                document.getElementById('config-color').value = data.primaryColor;
                document.getElementById('color-hex-display').textContent = data.primaryColor;
            }

            if (document.getElementById('config-audio-src')) document.getElementById('config-audio-src').value = data.audioSrc || '';
            if (document.getElementById('config-song-title')) document.getElementById('config-song-title').value = data.songTitle || '';
            if (document.getElementById('config-album-art')) document.getElementById('config-album-art').value = data.albumArt || '';

            if (document.getElementById('config-discord-id')) document.getElementById('config-discord-id').value = data.discordUserId || '';
            if (document.getElementById('config-discord-avatar')) document.getElementById('config-discord-avatar').value = data.fallbackDiscordAvatarUrl || '';
            if (document.getElementById('config-discord-username')) document.getElementById('config-discord-username').value = data.fallbackDiscordUsername || '';

            if (data.socials) {
                if (document.getElementById('config-spotify')) document.getElementById('config-spotify').value = data.socials.spotify || '';
                if (document.getElementById('config-tiktok')) document.getElementById('config-tiktok').value = data.socials.tiktok || '';
                if (document.getElementById('config-apple')) document.getElementById('config-apple').value = data.socials.apple || '';
            }

            if (doc.exists) {
                statusText.textContent = "Live Synced with main site";
                dot.style.backgroundColor = "#2ecc71";
                dot.style.boxShadow = "0 0 8px #2ecc71";
            } else {
                statusText.textContent = "Ready. Please publish settings.";
                dot.style.backgroundColor = "#f1c40f";
                dot.style.boxShadow = "0 0 8px #f1c40f";
            }

        }).catch(err => {
            console.error("Firebase fetch error", err);
            statusText.textContent = "Database Error! " + err.message;
            dot.style.backgroundColor = "#e74c3c";
            dot.style.boxShadow = "0 0 8px #e74c3c";
        });
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving to Database...';
            
            const newData = {
                name: document.getElementById('config-name').value,
                tabName: document.getElementById('config-tabname').value,
                title: document.getElementById('config-title').value,
                location: document.getElementById('config-location').value,
                backgroundMedia: document.getElementById('config-bg').value,
                primaryColor: document.getElementById('config-color').value,
                audioSrc: document.getElementById('config-audio-src').value,
                songTitle: document.getElementById('config-song-title').value,
                albumArt: document.getElementById('config-album-art').value,
                discordUserId: document.getElementById('config-discord-id').value,
                fallbackDiscordAvatarUrl: document.getElementById('config-discord-avatar').value,
                fallbackDiscordUsername: document.getElementById('config-discord-username').value,
                socials: {
                    spotify: document.getElementById('config-spotify').value,
                    tiktok: document.getElementById('config-tiktok').value,
                    apple: document.getElementById('config-apple').value
                }
            };

            db.collection('settings').doc('main').set(newData, { merge: true })
                .then(() => {
                    saveBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Published Changes!';
                    saveBtn.style.backgroundColor = '#2ecc71';
                    saveBtn.style.color = '#fff';
                    saveBtn.style.boxShadow = '0 0 20px rgba(46, 204, 113, 0.4)';

                    statusText.textContent = "Live Synced with main site";
                    dot.style.backgroundColor = "#2ecc71";
                    dot.style.boxShadow = "0 0 8px #2ecc71";

                    setTimeout(() => {
                        saveBtn.innerHTML = originalText;
                        saveBtn.style.backgroundColor = '';
                        saveBtn.style.boxShadow = '';
                    }, 2500);
                })
                .catch(err => {
                    console.error("Save error:", err);
                    saveBtn.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Error Saving!';
                    saveBtn.style.backgroundColor = '#e74c3c';
                    setTimeout(() => {
                        saveBtn.innerHTML = originalText;
                        saveBtn.style.backgroundColor = '';
                    }, 3000);
                });
        });
    }
});
