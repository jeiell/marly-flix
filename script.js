const themeToggle = document.getElementById('theme-toggle');
const body = document.body;
const profilesSection = document.querySelector('.profiles');
const moviesSection = document.querySelector('.movies');
const profileItems = document.querySelectorAll('.profiles-list .profile');
const selectedProfileEl = document.querySelector('.selected-profile');
const backButton = document.querySelector('.movie-back');
const playButtons = document.querySelectorAll('.movie-link[data-video], .movie-link[data-trailer]');
const playerModal = document.querySelector('.player-modal');
const playerFrame = document.querySelector('.player-frame');
const playerVideo = document.querySelector('.player-video');
const playerClose = document.querySelector('.player-close');
const playerBack = document.querySelector('.player-back');
const playerTitle = document.querySelector('.player-title');
const playerProfileEl = document.querySelector('.player-profile');
let currentProfileName = '';

function applyTheme(theme) {
    const isLight = theme === 'light';
    body.classList.toggle('light-theme', isLight);
    themeToggle.textContent = isLight ? 'Modo Escuro' : 'Modo Claro';
    themeToggle.setAttribute('aria-pressed', isLight);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
        return;
    }

    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
}

function toggleTheme() {
    const nextTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
    applyTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
}

function showMovieList(profileName) {
    currentProfileName = profileName;
    profilesSection.classList.add('hidden');
    moviesSection.classList.remove('hidden');
    selectedProfileEl.textContent = `Perfil selecionado: ${profileName}`;
    saveAppState();
}

function saveAppState() {
    const state = {
        view: moviesSection.classList.contains('hidden') ? 'profiles' : 'movies',
        profile: currentProfileName || ''
    };
    localStorage.setItem('appState', JSON.stringify(state));
}

function loadAppState() {
    const rawState = localStorage.getItem('appState');
    if (!rawState) {
        return;
    }
    try {
        const state = JSON.parse(rawState);
        if (state.view === 'movies' && state.profile) {
            showMovieList(state.profile);
        } else {
            showProfiles();
        }
    } catch (error) {
        console.warn('Estado do app inválido:', error);
    }
}

function showProfiles() {
    currentProfileName = '';
    closePlayer();
    moviesSection.classList.add('hidden');
    profilesSection.classList.remove('hidden');
    selectedProfileEl.textContent = '';
    saveAppState();
}

function normalizeTrailerUrl(url) {
    if (url.includes('youtube.com/watch')) {
        return url.replace('watch?v=', 'embed/') + '?autoplay=1&rel=0';
    }
    if (url.includes('youtu.be/')) {
        return url.replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1&rel=0';
    }
    return url;
}

function openPlayer(videoUrl, movieName) {
    const isLocalVideo = !videoUrl.startsWith('http');
    playerTitle.textContent = `Assistindo: ${movieName}`;
    if (playerProfileEl) {
        playerProfileEl.textContent = currentProfileName ? `Usuário: ${currentProfileName}` : '';
    }

    if (playerFrame) {
        playerFrame.classList.add('hidden');
        playerFrame.src = '';
    }
    if (playerVideo) {
        playerVideo.classList.add('hidden');
        playerVideo.pause();
        playerVideo.removeAttribute('src');
        playerVideo.load();
    }

    if (isLocalVideo && playerVideo) {
        playerVideo.src = videoUrl;
        playerVideo.classList.remove('hidden');
        playerVideo.load();
        playerVideo.play().catch(() => {
            /* fallback if autoplay blocked */
        });
    } else if (playerFrame) {
        playerFrame.src = normalizeTrailerUrl(videoUrl);
        playerFrame.classList.remove('hidden');
    }

    playerModal.classList.remove('hidden');
    playerModal.setAttribute('aria-hidden', 'false');
}

function closePlayer() {
    if (!playerModal) return;
    playerModal.classList.add('hidden');
    playerModal.setAttribute('aria-hidden', 'true');
    if (playerFrame) {
        playerFrame.src = '';
    }
    if (playerVideo) {
        playerVideo.pause();
        playerVideo.currentTime = 0;
        playerVideo.removeAttribute('src');
        playerVideo.load();
    }
}

if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

profileItems.forEach(profile => {
    profile.addEventListener('click', () => {
        const profileName = profile.querySelector('figcaption').textContent.trim();
        showMovieList(profileName);
    });
});

if (backButton) {
    backButton.addEventListener('click', showProfiles);
}

playButtons.forEach(button => {
    button.addEventListener('click', () => {
        const videoUrl = button.dataset.video || button.dataset.trailer;
        const movieName = button.closest('.movie-item').querySelector('figcaption').textContent.trim();
        openPlayer(videoUrl, movieName);
    });
});

if (playerClose) {
    playerClose.addEventListener('click', closePlayer);
}

if (playerBack) {
    playerBack.addEventListener('click', showProfiles);
}

loadTheme();
loadAppState();
