// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const loadingSpinner = document.getElementById('loading-spinner');
const btnHome = document.getElementById('nav-home');
const logoBtn = document.getElementById('logo-btn');

const mobileSearchForm = document.getElementById('mobile-search-form');
const mobileSearchInput = document.getElementById('mobile-search-input');
const mobileLoadingSpinner = document.getElementById('mobile-loading-spinner');

const homeSection = document.getElementById('home-section');
const resultsSection = document.getElementById('results-section');
const queueSection = document.getElementById('queue-section'); // Replaced lyricsSection
const lyricsContainer = document.getElementById('lyrics-container');
const resultsTitle = document.getElementById('results-title');
const songList = document.getElementById('song-list');
const recentList = document.getElementById('recent-list');
const likedList = document.getElementById('liked-list');
const playLikedBtn = document.getElementById('play-liked-btn');
const queueList = document.getElementById('queue-list');

const mainContent = document.querySelector('.main-content');
const playerBar = document.getElementById('player-bar');
const btnCloseFullPlayer = document.getElementById('btn-close-full-player');
const tabQueue = document.getElementById('tab-queue');
const tabLyrics = document.getElementById('tab-lyrics');
const queuePane = document.getElementById('queue-pane');
const lyricsPane = document.getElementById('lyrics-pane');

// Player Elements
const audio = document.getElementById('audio-element');
const btnPlay = document.getElementById('btn-play');
const playIcon = document.getElementById('play-icon');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnShuffle = document.getElementById('btn-shuffle');
const btnRepeat = document.getElementById('btn-repeat');
const btnLike = document.getElementById('np-like');
const likeIcon = document.getElementById('like-icon');
const btnQueue = document.getElementById('btn-queue');
const btnDownload = document.getElementById('btn-download');
const btnDlAll = document.getElementById('btn-dl-all');
const npMiniInfo = document.getElementById('np-mini-info');

const npImage = document.getElementById('np-image');
const npTitle = document.getElementById('np-title');
const npArtist = document.getElementById('np-artist');

const npLargeCover = document.getElementById('np-large-cover');
const npLargeTitle = document.getElementById('np-large-title');
const npLargeArtist = document.getElementById('np-large-artist');
const npLargeMeta = document.getElementById('np-large-meta');
const npLargeCopyright = document.getElementById('np-large-copyright');

const timeCurrent = document.getElementById('time-current');
const timeTotal = document.getElementById('time-total');
const progressWrapper = document.getElementById('progress-wrapper');
const progressFill = document.getElementById('progress-fill');
const volumeSlider = document.getElementById('volume-slider');
const volumeIcon = document.getElementById('volume-icon');

// Mobile Controls
const btnPlayM = document.getElementById('btn-play-m');
const playIconM = document.getElementById('play-icon-m');
const btnPrevM = document.getElementById('btn-prev-m');
const btnNextM = document.getElementById('btn-next-m');
const btnShuffleM = document.getElementById('btn-shuffle-m');
const btnRepeatM = document.getElementById('btn-repeat-m');
const btnLikeM = document.getElementById('btn-like-m');
const likeIconM = document.getElementById('like-icon-m');
const btnDownloadM = document.getElementById('btn-download-m');

const timeCurrentM = document.getElementById('time-current-m');
const timeTotalM = document.getElementById('time-total-m');
const progressWrapperM = document.getElementById('progress-wrapper-m');
const progressFillM = document.getElementById('progress-fill-m');

// State
let currentQueue = [];
let currentIndex = -1;
let currentSong = null;

let currentViewContext = 'home';
let previousViewContext = 'home';

// Player State
let isRepeat = false;
let isShuffle = false;
let shuffleHistory = [];

const API_BASE = "https://api.arijitiyan.cc/song";

// Local Storage Wrappers
const getLikedSongs = () => JSON.parse(localStorage.getItem('likedSongs') || '[]');
const saveLikedSongs = (songs) => localStorage.setItem('likedSongs', JSON.stringify(songs));
const getRecentSongs = () => JSON.parse(localStorage.getItem('recentSongs') || '[]');
const saveRecentSongs = (songs) => localStorage.setItem('recentSongs', JSON.stringify(songs));

// Initialization
function init() {
    renderHome();
    audio.volume = 1;
}

// Navigation
function switchView(view) {
    if (view !== 'queue') {
        previousViewContext = view;
    }
    currentViewContext = view;

    homeSection.classList.add('hidden');
    resultsSection.classList.add('hidden');
    queueSection.classList.add('hidden');

    if (btnHome) btnHome.classList.remove('active');

    const queueIcon = btnQueue.querySelector('i');
    if (queueIcon) queueIcon.className = 'ph ph-list-dashes';

    if (view === 'home') {
        homeSection.classList.remove('hidden');
        if (btnHome) btnHome.classList.add('active');
        renderHome();
    } else if (view === 'results') {
        resultsSection.classList.remove('hidden');
    } else if (view === 'queue') {
        queueSection.classList.remove('hidden');
        if (queueIcon) queueIcon.className = 'ph ph-x';
        renderQueue();
    }
}

if (btnHome) btnHome.addEventListener('click', () => switchView('home'));
logoBtn.addEventListener('click', () => switchView('home'));

btnQueue.addEventListener('click', () => {
    if (currentViewContext === 'queue') {
        switchView(previousViewContext);
    } else {
        switchView('queue');
    }
});

btnCloseFullPlayer.addEventListener('click', () => {
    switchView(previousViewContext);
});

npMiniInfo.addEventListener('click', () => {
    if (currentViewContext !== 'queue') {
        switchView('queue');
    }
});

btnDownload.addEventListener('click', () => {
    if (currentSong) downloadSong(currentSong);
});

if (btnDownloadM) {
    btnDownloadM.addEventListener('click', () => {
        if (currentSong) downloadSong(currentSong);
    });
}

// Tabs
if (tabLyrics && tabQueue) {
    tabLyrics.addEventListener('click', () => {
        tabLyrics.classList.add('active');
        tabQueue.classList.remove('active');
        lyricsPane.classList.add('active');
        queuePane.classList.remove('active');
    });
    tabQueue.addEventListener('click', () => {
        tabQueue.classList.add('active');
        tabLyrics.classList.remove('active');
        queuePane.classList.add('active');
        lyricsPane.classList.remove('active');
    });
}

// Render Home Lists
function renderHome() {
    const recent = getRecentSongs();
    const liked = getLikedSongs();

    renderSongList(recentList, recent, 'recent');
    renderSongList(likedList, liked, 'liked');

    if (liked.length > 0) {
        playLikedBtn.style.display = 'flex';
    } else {
        playLikedBtn.style.display = 'none';
    }
}

// Render Queue View List specifically
function renderQueue() {
    renderSongList(queueList, currentQueue, 'queue');
}

// Search
async function executeSearch(query) {
    if (!query) return;

    switchView('results');
    loadingSpinner.classList.remove('hidden');
    if (mobileLoadingSpinner) mobileLoadingSpinner.classList.remove('hidden');

    resultsTitle.textContent = `Searching for "${query}"...`;
    songList.innerHTML = '';

    try {
        const res = await fetch(`${API_BASE}/api.php?q=${encodeURIComponent(query)}`);
        const data = await res.json();

        let songs = [];
        if (Array.isArray(data)) {
            songs = data;
            resultsTitle.textContent = `Search Results for "${query}"`;
        } else if (data && data.songs && Array.isArray(data.songs)) {
            songs = data.songs;
            resultsTitle.textContent = `Album: ${data.name || data.title || 'Unknown'}`;
        }

        if (songs.length === 0) {
            resultsTitle.textContent = 'No results found.';
            songList.innerHTML = '<p class="empty-state">Try searching for something else.</p>';
        } else {
            renderSongList(songList, songs, 'search');
        }

    } catch (err) {
        console.error("API Fetch Error:", err);
        resultsTitle.textContent = 'Error fetching data. Please try again.';
    } finally {
        loadingSpinner.classList.add('hidden');
        if (mobileLoadingSpinner) mobileLoadingSpinner.classList.add('hidden');
    }
}

searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    executeSearch(searchInput.value.trim());
});

if (mobileSearchForm) {
    mobileSearchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        executeSearch(mobileSearchInput.value.trim());
    });
}

// Generic Song Renderer for Lists
function renderSongList(container, songs, context) {
    if (!songs || songs.length === 0) {
        let msg = "No songs here.";
        if (context === "recent") msg = "No recent songs. Start searching and playing to see them here.";
        if (context === "liked") msg = "No liked songs yet. Click the heart icon on a player to save it.";
        container.innerHTML = `<p class="empty-state">${msg}</p>`;
        return;
    }

    container.innerHTML = '';

    songs.forEach((song, index) => {
        const title = song.song || song.title || 'Unknown Title';
        const artist = song.singers || song.primary_artists || 'Unknown Artist';
        const img = song.image || 'https://via.placeholder.com/60';
        const album = song.album || 'Unknown Album';

        const row = document.createElement('div');
        row.className = 'song-row';

        // Highlight logic
        if (currentSong && (currentSong.perma_url === song.perma_url || currentSong.id === song.id)) {
            row.classList.add('playing');
        }

        row.innerHTML = `
            <div class="song-img">
                <img src="${img}" alt="${title}">
                <div class="row-overlay"><i class="ph-fill ph-play"></i></div>
            </div>
            <div class="song-details">
                <h3 title="${title}">${title}</h3>
                <p title="${artist}">${artist}</p>
            </div>
            <div class="song-credits">
                <h5>${album}</h5>
                <span>${song.year || ''}</span>
            </div>
            <div class="song-actions">
                <button class="icon-btn row-btn-dl" title="Download"><i class="ph ph-download-simple"></i></button>
            </div>
        `;

        // Click on row to play
        row.addEventListener('click', (e) => {
            if (e.target.closest('.row-btn-dl')) return; // Ignore if DL clicked
            handlePlayRequest(song, context, songs);

            // UI visual update
            document.querySelectorAll('.song-row').forEach(r => r.classList.remove('playing'));
            row.classList.add('playing');
        });

        // Click on DL
        row.querySelector('.row-btn-dl').addEventListener('click', (e) => {
            e.stopPropagation();
            downloadSong(song);
        });

        container.appendChild(row);
    });
}

// Logic to determine queue and fetching based on click
async function handlePlayRequest(clickedSong, context, sourceList) {
    if (context === 'search' || context === 'recent') {
        // Fetch Album and play
        if (clickedSong.album_url) {
            await fetchAndPlayAlbum(clickedSong.album_url, clickedSong.perma_url);
        } else {
            // Fallback if no album URL
            startPlayback([clickedSong], 0);
        }
    } else if (context === 'liked') {
        // Playing Liked Songs directly (Queue is Liked Songs)
        // Find index of clicked song in Liked Songs
        let idx = sourceList.findIndex(s => s.perma_url === clickedSong.perma_url);
        startPlayback(sourceList, idx !== -1 ? idx : 0);
    } else if (context === 'queue') {
        // Playing from the queue directly
        let idx = sourceList.findIndex(s => s.perma_url === clickedSong.perma_url);
        if (idx !== -1) {
            playSongAt(idx);
        }
    }
}

playLikedBtn.addEventListener('click', () => {
    const liked = getLikedSongs();
    if (liked.length > 0) {
        startPlayback(liked, 0);
    }
});

async function fetchAndPlayAlbum(albumUrl, targetPermaUrl) {
    try {
        const res = await fetch(`${API_BASE}/api.php?q=${encodeURIComponent(albumUrl)}`);
        const data = await res.json();
        if (data && data.songs && Array.isArray(data.songs)) {
            // Find index of target song
            let targetIdx = data.songs.findIndex(s => s.perma_url === targetPermaUrl);
            if (targetIdx === -1) targetIdx = 0;

            startPlayback(data.songs, targetIdx);
        } else {
            console.error("Failed to parse album response.");
        }
    } catch (e) {
        console.error("Album fetch error:", e);
    }
}

// --- Player Core Logic ---
async function startPlayback(queue, startIndex) {
    if (!queue || queue.length === 0) return;

    currentQueue = queue;
    shuffleHistory = [];

    // Enable controls
    const cBtns = [btnPlay, btnPrev, btnNext, btnShuffle, btnRepeat, btnQueue, btnDownload, btnLike];
    const mBtns = [btnPlayM, btnPrevM, btnNextM, btnShuffleM, btnRepeatM, btnDownloadM, btnLikeM];
    cBtns.forEach(btn => { if (btn) btn.disabled = false });
    mBtns.forEach(btn => { if (btn) btn.disabled = false });

    // Show Player bar
    playerBar.classList.add('active');
    mainContent.classList.add('player-active');

    // Automatically open full player mostly on mobile for immediate visual
    if (window.innerWidth <= 768 && currentViewContext !== 'queue') {
        switchView('queue');
    }

    await playSongAt(startIndex);
}

// Ensure full metadata before playing
async function playSongAt(index) {
    if (index < 0 || index >= currentQueue.length) return;
    currentIndex = index;
    let song = currentQueue[index];

    // Check if we need to fetch full details
    if (!song.media_url) {
        song = await fetchFullDetails(song.perma_url);
        if (!song) {
            // Error occurred
            playNext();
            return;
        }
        // Update in queue to prevent refetching
        currentQueue[index] = song;
    }

    currentSong = song;
    updatePlayerUI(song);

    // Set Audio
    audio.src = song.media_url;
    audio.play()
        .then(() => addToRecentList(song))
        .catch(err => console.error("Auto-play prevented", err));
}

async function fetchFullDetails(perma_url) {
    try {
        const res = await fetch(`${API_BASE}/api.php?q=${encodeURIComponent(perma_url)}`);
        const data = await res.json();
        const fullSong = Array.isArray(data) ? data[0] : (data.songs ? data.songs[0] : data);
        return fullSong;
    } catch (e) {
        console.error("Error fetching full details for", perma_url, e);
        return null; // Signals failure
    }
}

function updatePlayerUI(song) {
    const title = song.song || song.title || 'Unknown';
    const artist = song.singers || song.primary_artists || 'Unknown';
    const img = song.image || 'https://via.placeholder.com/60';

    npTitle.textContent = title;
    npTitle.title = title;
    npArtist.textContent = artist;
    npArtist.title = artist;
    npImage.src = img;
    npImage.classList.remove('hidden');

    updateLikeButton();
    updateLargeQueueDetails(song);

    // Auto-fetch lyrics for queue view
    fetchLyrics();

    // Rerender queue to show what's playing
    if (!queueSection.classList.contains('hidden')) {
        renderQueue();
    }
}

function updateLargeQueueDetails(song) {
    const title = song.song || song.title || 'Unknown';
    const artist = song.singers || song.primary_artists || 'Unknown';
    const img = song.image || 'https://via.placeholder.com/300';

    npLargeCover.src = img;
    npLargeTitle.textContent = title;
    npLargeArtist.textContent = artist;

    // Meta string build
    let meta = [];
    if (song.play_count) meta.push(`${parseInt(song.play_count).toLocaleString()} Plays`);
    if (song.duration) meta.push(formatTime(song.duration));
    if (song.year) meta.push(song.year);
    if (song.language) meta.push(song.language.charAt(0).toUpperCase() + song.language.slice(1));

    npLargeMeta.textContent = meta.join(' • ');
    npLargeCopyright.textContent = song.copyright_text || '';
}

function updateLikeButton() {
    if (!currentSong) return;
    const liked = getLikedSongs();
    const isLiked = liked.some(s => s.perma_url === currentSong.perma_url);
    if (isLiked) {
        likeIcon.classList.replace('ph-heart', 'ph-fill');
        likeIcon.classList.add('ph-heart');
        likeIcon.style.color = "var(--accent-red)";
        if (likeIconM) {
            likeIconM.classList.replace('ph-heart', 'ph-fill');
            likeIconM.style.color = "var(--accent-red)";
        }
    } else {
        likeIcon.classList.replace('ph-fill', 'ph-heart');
        likeIcon.style.color = "var(--text-muted)";
        if (likeIconM) {
            likeIconM.classList.replace('ph-fill', 'ph-heart');
            likeIconM.style.color = "inherit";
        }
    }
}

// Player Action Bindings
const togglePlay = () => {
    if (!currentSong) return;
    if (audio.paused) {
        audio.play();
    } else {
        audio.pause();
    }
};

btnPlay.addEventListener('click', togglePlay);
if (btnPlayM) btnPlayM.addEventListener('click', togglePlay);

audio.addEventListener('play', () => {
    playIcon.className = 'ph-fill ph-pause';
    if (playIconM) playIconM.className = 'ph-fill ph-pause';
});

audio.addEventListener('pause', () => {
    playIcon.className = 'ph-fill ph-play';
    if (playIconM) playIconM.className = 'ph-fill ph-play';
});

btnNext.addEventListener('click', playNext);
btnPrev.addEventListener('click', playPrev);
if (btnNextM) btnNextM.addEventListener('click', playNext);
if (btnPrevM) btnPrevM.addEventListener('click', playPrev);

async function playNext() {
    if (currentQueue.length === 0) return;

    if (isShuffle) {
        // Smart Shuffle Logic
        if (currentSong && currentSong.album_url && Math.random() > 0.5) {
            try {
                const res = await fetch(`${API_BASE}/api.php?q=${encodeURIComponent(currentSong.album_url)}`);
                const data = await res.json();
                if (data && data.songs && Array.isArray(data.songs)) {
                    data.songs.forEach(newSong => {
                        const exists = currentQueue.some(s => s.perma_url === newSong.perma_url);
                        if (!exists) {
                            currentQueue.push(newSong);
                        }
                    });
                }
            } catch (e) {
                console.error("Smart Shuffle Error:", e);
            }
        }

        shuffleHistory.push(currentIndex);
        let nextIndex = getRandomUnplayedIndex();
        if (nextIndex === -1) {
            // All played, clear history except current
            shuffleHistory = [currentIndex];
            nextIndex = getRandomUnplayedIndex();
            // Fallback if still -1
            if (nextIndex === -1) nextIndex = 0;
        }
        playSongAt(nextIndex);
    } else {
        let nextIndex = currentIndex + 1;
        if (nextIndex >= currentQueue.length) nextIndex = 0; // Wrap around
        playSongAt(nextIndex);
    }
}

function playPrev() {
    if (currentQueue.length === 0) return;

    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    if (isShuffle && shuffleHistory.length > 0) {
        let prevIndex = shuffleHistory.pop();
        playSongAt(prevIndex);
    } else {
        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = currentQueue.length - 1;
        playSongAt(prevIndex);
    }
}

const toggleShuffle = () => {
    isShuffle = !isShuffle;
    btnShuffle.classList.toggle('active', isShuffle);
    if (btnShuffleM) btnShuffleM.classList.toggle('active', isShuffle);

    if (isShuffle) {
        shuffleHistory = []; // Reset history when turning on scatter
    }
};

const toggleRepeat = () => {
    isRepeat = !isRepeat;
    btnRepeat.classList.toggle('active', isRepeat);
    if (btnRepeatM) btnRepeatM.classList.toggle('active', isRepeat);
};

btnShuffle.addEventListener('click', toggleShuffle);
if (btnShuffleM) btnShuffleM.addEventListener('click', toggleShuffle);

btnRepeat.addEventListener('click', toggleRepeat);
if (btnRepeatM) btnRepeatM.addEventListener('click', toggleRepeat);

audio.addEventListener('ended', () => {
    if (isRepeat) {
        audio.currentTime = 0;
        audio.play();
    } else {
        playNext();
    }
});

function getRandomUnplayedIndex() {
    let unplayed = [];
    for (let i = 0; i < currentQueue.length; i++) {
        if (!shuffleHistory.includes(i) && i !== currentIndex) unplayed.push(i);
    }
    if (unplayed.length === 0) return -1;
    let r = Math.floor(Math.random() * unplayed.length);
    return unplayed[r];
}

// Progress Bar Updates
audio.addEventListener('timeupdate', () => {
    if (!audio.duration || isNaN(audio.duration)) return;

    const curr = audio.currentTime;
    const tot = audio.duration;

    timeCurrent.textContent = formatTime(curr);
    timeTotal.textContent = formatTime(tot);

    if (timeCurrentM) {
        timeCurrentM.textContent = formatTime(curr);
        timeTotalM.textContent = formatTime(tot);
    }

    const percentage = (curr / tot) * 100;
    progressFill.style.width = percentage + '%';
    if (progressFillM) progressFillM.style.width = percentage + '%';
});

function handleProgressClick(e, wrapper) {
    if (!audio.duration) return;
    const rect = wrapper.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * audio.duration;
    audio.currentTime = newTime;
}

progressWrapper.addEventListener('click', (e) => handleProgressClick(e, progressWrapper));
if (progressWrapperM) progressWrapperM.addEventListener('click', (e) => handleProgressClick(e, progressWrapperM));

volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    audio.volume = val;
    if (val === 0) volumeIcon.className = 'ph ph-speaker-x';
    else if (val < 0.5) volumeIcon.className = 'ph ph-speaker-low';
    else volumeIcon.className = 'ph ph-speaker-high';
});

// Like Logic
const triggerLike = () => {
    if (!currentSong) return;
    let liked = getLikedSongs();

    // Use perma_url for unique ID
    const idx = liked.findIndex(s => s.perma_url === currentSong.perma_url);
    if (idx > -1) {
        // Remove
        liked.splice(idx, 1);
    } else {
        // Add minimalist info
        liked.push({
            id: currentSong.id,
            title: currentSong.song || currentSong.title,
            singers: currentSong.singers || currentSong.primary_artists,
            image: currentSong.image,
            perma_url: currentSong.perma_url,
            album: currentSong.album,
            album_url: currentSong.album_url
        });
    }
    saveLikedSongs(liked);
    updateLikeButton();
    // Render immediately if on home screen
    if (!homeSection.classList.contains('hidden')) {
        renderHome();
    }
};

btnLike.addEventListener('click', triggerLike);
if (btnLikeM) btnLikeM.addEventListener('click', triggerLike);

// Recent Logic
function addToRecentList(song) {
    let recent = getRecentSongs();
    // Remove if already exists
    recent = recent.filter(s => s.perma_url !== song.perma_url);

    // Add to top
    recent.unshift({
        id: song.id,
        title: song.song || song.title,
        singers: song.singers || song.primary_artists,
        image: song.image,
        perma_url: song.perma_url,
        album: song.album,
        album_url: song.album_url
    });

    // Max 20 songs
    if (recent.length > 20) recent.pop();

    saveRecentSongs(recent);

    // Render immediately if on home screen
    if (!homeSection.classList.contains('hidden')) {
        renderHome();
    }
}

// Download Support
async function downloadSong(song) {
    if (!song) return;
    let url = song.media_url;

    // Fetch if needed
    if (!url) {
        const fullSong = await fetchFullDetails(song.perma_url);
        if (fullSong && fullSong.media_url) url = fullSong.media_url;
    }

    if (url) {
        const title = song.song || song.title || 'audio';
        const sanitizedName = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = `${sanitizedName}.mp4`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    } else {
        alert("Download not available currently.");
    }
}

// Lyrics Fetching
async function fetchLyrics() {
    if (!currentSong) return;
    lyricsContainer.innerHTML = '<p>Loading lyrics...</p>';

    try {
        const res = await fetch(`${API_BASE}/lyrics.php?q=${encodeURIComponent(currentSong.perma_url)}`);
        const data = await res.json();

        if (data.status && data.lyrics) {
            lyricsContainer.innerHTML = `<p>${data.lyrics}</p>`;
        } else {
            lyricsContainer.innerHTML = '<p class="empty-state">No lyrics available for this song.</p>';
        }
    } catch (e) {
        console.error("Lyrics error:", e);
        lyricsContainer.innerHTML = '<p class="empty-state">Error fetching lyrics.</p>';
    }
}

// Utils
function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' + sec : sec}`;
}

// Start
init();
