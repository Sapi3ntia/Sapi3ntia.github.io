// Morse Code Translator
class MorseCodeTranslator {
    constructor() {
        this.morseCode = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..', 
            '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
            '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
            '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', 
            '!': '-.-.--', '/': '-..-.', '(': '-.--.', ')': '-.--.-',
            '&': '.-...', ':': '---...', ';': '-.-.-.', '=': '-...-',
            '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
            '$': '...-..-', '@': '.--.--.', ' ': '/'
        };
        
        this.reverseCode = {};
        for (let key in this.morseCode) {
            this.reverseCode[this.morseCode[key]] = key;
        }
        
        this.audioContext = null;
        this.isPlaying = false;
        this.currentMode = 'dots';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.populateGuide();
    }
    
    setupEventListeners() {
        const textInput = document.getElementById('text-input');
        const morseInput = document.getElementById('morse-input');
        const playBtn = document.getElementById('play-morse');
        const stopBtn = document.getElementById('stop-morse');
        const speedSlider = document.getElementById('morse-speed');
        const speedDisplay = document.getElementById('speed-display');
        const guideToggle = document.getElementById('morse-guide-toggle');
        const clearBtn = document.getElementById('morse-clear');
        const visualModeToggle = document.getElementById('visual-mode-toggle');
        const closeGuide = document.getElementById('close-guide');
        
        if (textInput) {
            textInput.addEventListener('input', (e) => {
                const morse = this.textToMorse(e.target.value);
                if (morseInput) morseInput.value = morse;
                this.updateVisualization(morse);
                this.updatePlayButton();
            });
        }
        
        if (morseInput) {
            morseInput.addEventListener('input', (e) => {
                const text = this.morseToText(e.target.value);
                if (textInput) textInput.value = text;
                this.updateVisualization(e.target.value);
                this.updatePlayButton();
            });
        }
        
        if (playBtn) {
            playBtn.addEventListener('click', () => this.playMorse());
        }
        
        if (stopBtn) {
            stopBtn.addEventListener('click', () => this.stopMorse());
        }
        
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                if (speedDisplay) speedDisplay.textContent = `${e.target.value}x`;
            });
        }
        
        if (guideToggle) {
            guideToggle.addEventListener('click', () => this.toggleGuide());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }
        
        if (visualModeToggle) {
            visualModeToggle.addEventListener('click', () => this.toggleVisualMode());
        }
        
        if (closeGuide) {
            closeGuide.addEventListener('click', () => this.closeGuide());
        }
        
        // Guide tab functionality
        document.querySelectorAll('.guide-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                this.switchGuideTab(targetTab);
            });
        });
        
        // Copy button functionality
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const targetId = e.target.dataset.target;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.select();
                    document.execCommand('copy');
                    
                    // Visual feedback
                    const originalText = e.target.textContent;
                    e.target.textContent = '✓ Copied';
                    setTimeout(() => {
                        e.target.textContent = originalText;
                    }, 1000);
                }
            });
        });
    }
    
    textToMorse(text) {
        return text.toUpperCase().split('').map(char => {
            return this.morseCode[char] || char;
        }).join(' ');
    }
    
    morseToText(morse) {
        return morse.split(' ').map(code => {
            return this.reverseCode[code] || code;
        }).join('');
    }
    
    updateVisualization(morse) {
        const dotsContainer = document.getElementById('morse-dots');
        const waveContainer = document.getElementById('morse-wave');
        
        if (this.currentMode === 'dots' && dotsContainer) {
            dotsContainer.innerHTML = '';
            morse.split(' ').forEach(code => {
                if (code === '/') {
                    const space = document.createElement('span');
                    space.textContent = ' ';
                    space.style.marginRight = '1rem';
                    dotsContainer.appendChild(space);
                } else {
                    code.split('').forEach(symbol => {
                        const span = document.createElement('span');
                        span.textContent = symbol;
                        span.className = symbol === '.' ? 'morse-dot' : 'morse-dash';
                        dotsContainer.appendChild(span);
                    });
                    const space = document.createElement('span');
                    space.textContent = ' ';
                    space.style.marginRight = '0.5rem';
                    dotsContainer.appendChild(space);
                }
            });
        }
        
        if (this.currentMode === 'wave' && waveContainer) {
            // Simple wave visualization
            waveContainer.innerHTML = morse.replace(/\./g, '▄').replace(/-/g, '█').replace(/\//g, ' ');
        }
    }
    
    async playMorse() {
        const morseInput = document.getElementById('morse-input');
        const playBtn = document.getElementById('play-morse');
        const stopBtn = document.getElementById('stop-morse');
        const speedSlider = document.getElementById('morse-speed');
        
        if (!morseInput || !morseInput.value.trim()) return;
        
        this.isPlaying = true;
        if (playBtn) playBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const speed = speedSlider ? parseFloat(speedSlider.value) : 1;
            const dotDuration = 100 / speed; // milliseconds
            const dashDuration = dotDuration * 3;
            const pauseDuration = dotDuration;
            
            const morse = morseInput.value;
            const symbols = morse.split('');
            
            for (let i = 0; i < symbols.length && this.isPlaying; i++) {
                const symbol = symbols[i];
                const visualElements = document.querySelectorAll('.morse-dot, .morse-dash');
                
                if (symbol === '.') {
                    await this.playTone(600, dotDuration);
                    if (visualElements[i]) {
                        visualElements[i].classList.add('active');
                        setTimeout(() => visualElements[i].classList.remove('active'), dotDuration);
                    }
                } else if (symbol === '-') {
                    await this.playTone(600, dashDuration);
                    if (visualElements[i]) {
                        visualElements[i].classList.add('active');
                        setTimeout(() => visualElements[i].classList.remove('active'), dashDuration);
                    }
                } else if (symbol === ' ') {
                    await this.pause(pauseDuration);
                } else if (symbol === '/') {
                    await this.pause(pauseDuration * 7); // Word space
                }
                
                if (this.isPlaying && symbol !== ' ' && symbol !== '/') {
                    await this.pause(pauseDuration);
                }
            }
        } catch (error) {
            console.error('Error playing morse code:', error);
        }
        
        this.stopMorse();
    }
    
    playTone(frequency, duration) {
        return new Promise(resolve => {
            if (!this.audioContext) {
                resolve();
                return;
            }
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration / 1000 - 0.01);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration / 1000);
            
            setTimeout(resolve, duration);
        });
    }
    
    pause(duration) {
        return new Promise(resolve => {
            setTimeout(resolve, duration);
        });
    }
    
    stopMorse() {
        this.isPlaying = false;
        const playBtn = document.getElementById('play-morse');
        const stopBtn = document.getElementById('stop-morse');
        
        if (playBtn) playBtn.disabled = false;
        if (stopBtn) stopBtn.disabled = true;
        
        // Remove all active states
        document.querySelectorAll('.morse-dot.active, .morse-dash.active').forEach(el => {
            el.classList.remove('active');
        });
        
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }
    
    updatePlayButton() {
        const morseInput = document.getElementById('morse-input');
        const playBtn = document.getElementById('play-morse');
        
        if (playBtn && morseInput) {
            playBtn.disabled = !morseInput.value.trim() || this.isPlaying;
        }
    }
    
    toggleGuide() {
        const guide = document.getElementById('morse-guide-modal');
        if (guide) {
            guide.style.display = guide.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    closeGuide() {
        const guide = document.getElementById('morse-guide-modal');
        if (guide) {
            guide.style.display = 'none';
        }
    }
    
    toggleVisualMode() {
        const visualModeToggle = document.getElementById('visual-mode-toggle');
        const dotsContainer = document.getElementById('morse-dots');
        const waveContainer = document.getElementById('morse-wave');
        
        this.currentMode = this.currentMode === 'dots' ? 'wave' : 'dots';
        
        if (visualModeToggle) {
            visualModeToggle.textContent = this.currentMode === 'dots' ? '🌊 Wave' : '• Dots';
        }
        
        if (dotsContainer && waveContainer) {
            if (this.currentMode === 'dots') {
                dotsContainer.style.display = 'flex';
                waveContainer.style.display = 'none';
            } else {
                dotsContainer.style.display = 'none';
                waveContainer.style.display = 'flex';
            }
        }
        
        // Update visualization
        const morseInput = document.getElementById('morse-input');
        if (morseInput) {
            this.updateVisualization(morseInput.value);
        }
    }
    
    clearAll() {
        const textInput = document.getElementById('text-input');
        const morseInput = document.getElementById('morse-input');
        const dotsContainer = document.getElementById('morse-dots');
        const waveContainer = document.getElementById('morse-wave');
        
        if (textInput) textInput.value = '';
        if (morseInput) morseInput.value = '';
        if (dotsContainer) dotsContainer.innerHTML = '';
        if (waveContainer) waveContainer.innerHTML = '';
        
        this.updatePlayButton();
    }
    
    populateGuide() {
        const lettersGrid = document.getElementById('letters-grid');
        const numbersGrid = document.getElementById('numbers-grid');
        const punctuationGrid = document.getElementById('punctuation-grid');
        
        if (lettersGrid) {
            Object.keys(this.morseCode).filter(key => /[A-Z]/.test(key)).forEach(letter => {
                const item = document.createElement('div');
                item.className = 'guide-item';
                item.innerHTML = `
                    <div class="guide-letter">${letter}</div>
                    <div class="guide-code">${this.morseCode[letter]}</div>
                `;
                lettersGrid.appendChild(item);
            });
        }
        
        if (numbersGrid) {
            Object.keys(this.morseCode).filter(key => /[0-9]/.test(key)).forEach(number => {
                const item = document.createElement('div');
                item.className = 'guide-item';
                item.innerHTML = `
                    <div class="guide-letter">${number}</div>
                    <div class="guide-code">${this.morseCode[number]}</div>
                `;
                numbersGrid.appendChild(item);
            });
        }
        
        if (punctuationGrid) {
            Object.keys(this.morseCode).filter(key => !/[A-Z0-9]/.test(key) && key !== ' ').forEach(punct => {
                const item = document.createElement('div');
                item.className = 'guide-item';
                item.innerHTML = `
                    <div class="guide-letter">${punct}</div>
                    <div class="guide-code">${this.morseCode[punct]}</div>
                `;
                punctuationGrid.appendChild(item);
            });
        }
    }
    
    switchGuideTab(tabName) {
        // Hide all sections
        document.querySelectorAll('.guide-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(`${tabName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Update tab buttons
        document.querySelectorAll('.guide-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with morse translator elements
    if (document.getElementById('text-input') || document.getElementById('morse-input')) {
        new MorseCodeTranslator();
    }
}); 