const quotes = [
    "In the digital age, technology shapes every aspect of our lives. From smartphones to smart homes, we are increasingly connected through a vast network of devices that communicate seamlessly with each other.",
    "The human brain is arguably the most complex organ in existence. With billions of neurons forming trillions of connections, it processes vast amounts of information every second of our lives.",
    "Climate change represents one of the greatest challenges facing humanity today. Rising temperatures, extreme weather events, and melting polar ice caps are just some of the consequences we're witnessing.",
    "Artificial intelligence continues to evolve at an unprecedented rate. Machine learning algorithms can now recognize patterns, make decisions, and even create art in ways that rival human capabilities.",
    "Space exploration has entered a new era with private companies joining government agencies in the race to the stars. Mars colonization, asteroid mining, and space tourism are no longer mere science fiction.",
    "The ocean depths remain one of Earth's last great frontiers. Scientists estimate that we have explored less than five percent of our oceans, leaving countless species and phenomena yet to be discovered.",
    "Renewable energy sources are revolutionizing the power industry. Solar panels, wind turbines, and hydroelectric dams are becoming increasingly efficient and cost-effective alternatives to fossil fuels.",
    "The human genome project has opened new frontiers in medicine. Understanding our genetic code allows doctors to predict, prevent, and treat diseases with unprecedented precision and effectiveness.",
    "Quantum computing promises to revolutionize information processing. By harnessing the principles of quantum mechanics, these computers could solve problems that would take traditional computers millions of years.",
    "Sustainable agriculture is crucial for feeding our growing population. Vertical farming, hydroponics, and precision agriculture are innovative solutions to maximize yield while minimizing environmental impact."
];

// Add sound effects
const successSound = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-01.mp3');

// Preload sounds
successSound.load();

// Add volume adjustment
successSound.volume = 0.5;

// Initialize everything after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80 },
            color: { value: '#6e57e0' },
            shape: { type: 'circle' },
            opacity: { 
                value: 0.5,
                random: true
            },
            size: { value: 3 },
            move: {
                enable: true,
                speed: 1,
                direction: 'none',
                random: true
            }
        }
    });

    // Theme toggle functionality
    const themeToggle = document.querySelector('.theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    // Check saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-theme', savedTheme === 'dark');
    icon.classList.toggle('fa-sun', savedTheme === 'dark');
    icon.classList.toggle('fa-moon', savedTheme === 'light');

    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        icon.classList.toggle('fa-sun');
        icon.classList.toggle('fa-moon');
    });

    // Game variables
    let words = [];
    let wordIndex = 0;
    let startTime = Date.now();
    let isTestActive = false;

    // Stats tracking
    let totalChars = 0;
    let correctChars = 0;
    let lastTypedLength = 0;
    let personalBest = localStorage.getItem('personalBest') || 0;

    const quoteElement = document.getElementById('quote');
    const messageElement = document.getElementById('message');
    const typedValueElement = document.getElementById('typed-value');
    const startButton = document.getElementById('start');
    const wpmCounter = document.getElementById('wpm-counter');
    const accuracyDisplay = document.getElementById('accuracy');

    // Reset UI state
    function resetUI() {
        typedValueElement.value = '';
        messageElement.innerText = '';
        typedValueElement.className = '';
        typedValueElement.disabled = true;
        document.getElementById('progress-bar').style.width = '0%';
        wpmCounter.textContent = '0';
        accuracyDisplay.textContent = '100%';
        totalChars = 0;
        correctChars = 0;
        lastTypedLength = 0;
    }

    function updateStats() {
        const accuracy = (correctChars / totalChars * 100 || 100).toFixed(1);
        accuracyDisplay.textContent = `${accuracy}%`;
    }

    startButton.addEventListener('click', function () {
        isTestActive = true;
        resetUI();
        
        const quoteIndex = Math.floor(Math.random() * quotes.length);
        const quote = quotes[quoteIndex];
        words = quote.split(' ');
        wordIndex = 0;

        const spanWords = words.map(word => `<span>${word} </span>`);
        quoteElement.innerHTML = spanWords.join('');
        quoteElement.childNodes[0].className = 'highlight';

        typedValueElement.disabled = false;
        typedValueElement.focus();
        startTime = new Date().getTime();
        startButton.disabled = true;

        // Add progress bar
        document.getElementById('progress-bar').style.width = '0%';
        
        // Reset stats
        totalChars = 0;
        correctChars = 0;
        updateStats();
    });

    typedValueElement.addEventListener('input', (e) => {
        if (!isTestActive) return;

        const currentWord = words[wordIndex];
        const typedValue = typedValueElement.value;
        
        // Calculate characters typed
        if (typedValue.length > lastTypedLength) {
            // New character typed
            totalChars++;
            const typedChar = typedValue[typedValue.length - 1];
            const correctChar = currentWord[typedValue.length - 1];
            if (typedChar === correctChar) {
                correctChars++;
            }
        }
        lastTypedLength = typedValue.length;

        // Calculate WPM
        const timeElapsed = (new Date().getTime() - startTime) / 1000 / 60; // in minutes
        const grossWPM = Math.round((correctChars / 5) / timeElapsed); // divide by 5 as average word length
        wpmCounter.textContent = grossWPM;

        // Update progress bar
        const progress = (wordIndex / words.length) * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;

        if (typedValue === currentWord && wordIndex === words.length - 1) {
            // Update progress bar to 100% first
            document.getElementById('progress-bar').style.width = '100%';
            
            playSound(successSound);
            const elapsedTime = (new Date().getTime() - startTime) / 1000 / 60; // in minutes
            const finalWPM = Math.round((correctChars / 5) / elapsedTime);
            const finalAccuracy = (correctChars / totalChars * 100).toFixed(1);
            
            isTestActive = false;
            typedValueElement.disabled = true;

            if (finalWPM > personalBest) {
                personalBest = finalWPM;
                localStorage.setItem('personalBest', personalBest);
            }
            
            // Show celebration instead of simple message
            setTimeout(() => showCelebration(finalWPM, finalAccuracy), 500);
        } else if (typedValue.endsWith(' ') && typedValue.trim() === currentWord) {
            typedValueElement.value = '';
            wordIndex++;
            lastTypedLength = 0;
            for (const wordElement of quoteElement.childNodes) {
                wordElement.className = '';
            }
            quoteElement.childNodes[wordIndex].className = 'highlight';
        } else {
            typedValueElement.className = currentWord.startsWith(typedValue) ? '' : 'error';
        }
        
        updateStats();
    });

    function createFirework(x, y) {
        const colors = ['#FF0000', '#FFD700', '#00FF00', '#0000FF', '#FF00FF', '#00FFFF'];
        const particles = 30;
        const container = document.getElementById('celebrationOverlay');
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'firework-particle celebration-effect';
            const color = colors[Math.floor(Math.random() * colors.length)];
            const angle = (Math.PI * 2 * i) / particles;
            const velocity = 2 + Math.random() * 2;
            
            particle.style.backgroundColor = color;
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            container.appendChild(particle);
            
            anime({
                targets: particle,
                translateX: Math.cos(angle) * 200 * Math.random(),
                translateY: Math.sin(angle) * 200 * Math.random(),
                scale: [1, 0],
                easing: 'easeOutExpo',
                duration: 1000 + Math.random() * 1000,
                complete: () => particle.remove()
            });
        }
    }

    function createConfetti() {
        const container = document.getElementById('celebrationOverlay');
        const confettiCount = 100;
        const defaults = {
            origin: { y: 0.7 }
        };

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(confettiCount * particleRatio)
            }));
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        });

        fire(0.2, {
            spread: 60,
        });

        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        });

        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        });
    }

    function showCelebration(wpm, accuracy) {
        const overlay = document.getElementById('celebrationOverlay');
        const message = document.getElementById('celebrationMessage');
        
        // Play success sound with retry on error
        playSound(successSound);
        
        message.innerHTML = `
            <div class="celebration-stats">
                <div class="stat-circle">
                    <span class="stat-value">${wpm}</span>
                    <span class="stat-label">WPM</span>
                </div>
                <div class="stat-circle">
                    <span class="stat-value">${accuracy}</span>
                    <span class="stat-label">Accuracy</span>
                </div>
            </div>
            ${wpm > 40 ? '<p class="mt-3">Amazing speed! Keep it up! 🚀</p>' : '<p class="mt-3">Great job! Keep practicing! 💪</p>'}
        `;
        
        overlay.style.display = 'flex';
        createConfetti();
        
        // Create periodic fireworks
        const fireworkInterval = setInterval(() => {
            const x = Math.random() * window.innerWidth;
            const y = Math.random() * (window.innerHeight / 2);
            createFirework(x, y);
            playSound(successSound);
        }, 800);

        setTimeout(() => clearInterval(fireworkInterval), 5000);
    }

    window.hideCelebration = function() {
        const overlay = document.getElementById('celebrationOverlay');
        overlay.style.display = 'none';
        overlay.querySelectorAll('.celebration-effect').forEach(e => e.remove());
        resetUI();
        startButton.disabled = false;
    };

    // Make sure the start button is enabled initially
    startButton.disabled = false;
    resetUI();

    // Sound management
    const musicToggle = document.getElementById('musicToggle');
    const musicOptions = document.querySelector('.music-options');
    const musicButtons = document.querySelectorAll('.music-option');
    const soundToggle = document.getElementById('soundToggle');
    const loadingScreen = document.getElementById('loading-screen');

    // Music tracks
    const musicTracks = {
        lofi: document.getElementById('lofiMusic'),
        ambient: document.getElementById('ambientMusic'),
        piano: document.getElementById('pianoMusic')
    };

    let currentMusic = null;
    let currentMusicButton = null;
    let isMuted = false;

    // Set initial volumes
    Object.values(musicTracks).forEach(track => {
        track.volume = 0.3;
    });
    successSound.volume = 0.4;

    // Music toggle dropdown
    musicToggle.addEventListener('click', () => {
        musicOptions.classList.toggle('show');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.music-dropdown')) {
            musicOptions.classList.remove('show');
        }
    });

    // Music selection handling
    musicButtons.forEach(button => {
        button.addEventListener('click', () => {
            const selectedTrack = button.dataset.music;
            
            // Deactivate previous button
            if (currentMusicButton) {
                currentMusicButton.classList.remove('active');
            }
            
            // Stop current music
            if (currentMusic) {
                currentMusic.pause();
                currentMusic.currentTime = 0;
            }

            // Play new music if it's a different track
            if (currentMusic !== musicTracks[selectedTrack]) {
                currentMusic = musicTracks[selectedTrack];
                button.classList.add('active');
                currentMusicButton = button;
                if (!isMuted) {
                    currentMusic.play().catch(console.error);
                }
            } else {
                currentMusic = null;
                currentMusicButton = null;
            }
            
            musicOptions.classList.remove('show');
        });
    });

    // Sound effects toggle (affects both music and sound effects)
    soundToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        soundToggle.querySelector('i').className = isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
        soundToggle.classList.toggle('muted', isMuted);
        
        // Toggle all audio
        if (currentMusic) {
            if (isMuted) {
                currentMusic.pause();
            } else {
                currentMusic.play().catch(console.error);
            }
        }
        
        successSound.volume = isMuted ? 0 : 0.4;
    });

    // Add loading timeout
    const MAX_LOADING_TIME = 5000; // 5 seconds maximum loading time
    let loadingTimeout = setTimeout(() => {
        hideLoadingScreen();
    }, MAX_LOADING_TIME);

    function hideLoadingScreen() {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            // Start background music
            bgMusic.play().catch(console.error);
        }, 500);
    }

    // Preload all sounds
    Promise.all([
        ...Object.values(musicTracks).map(track => 
            new Promise(resolve => {
                track.addEventListener('canplaythrough', resolve, { once: true });
                track.addEventListener('error', resolve, { once: true });
                track.load();
                setTimeout(resolve, 3000); // Timeout fallback
            })
        ),
        new Promise((resolve) => {
            successSound.addEventListener('canplaythrough', resolve, { once: true });
            successSound.addEventListener('error', resolve, { once: true });
            successSound.load();
            setTimeout(resolve, 3000);
        })
    ]).then(() => {
        clearTimeout(loadingTimeout); // Clear the timeout if everything loaded successfully
        hideLoadingScreen();
    }).catch(() => {
        // If there's any error, still hide the loading screen
        clearTimeout(loadingTimeout);
        hideLoadingScreen();
    });

    // Sound effects toggle
    let soundsEnabled = true;
    soundToggle.addEventListener('click', () => {
        soundsEnabled = !soundsEnabled;
        successSound.volume = soundsEnabled ? 0.4 : 0;
        soundToggle.querySelector('i').className = soundsEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        soundToggle.classList.toggle('muted', !soundsEnabled);
    });

    // Update existing sound play calls
    function playSound(sound) {
        if (!isMuted) {
            sound.currentTime = 0;
            sound.play().catch(console.error);
        }
    }
});