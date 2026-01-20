// Stopwatch Class
class Stopwatch {
    constructor() {
        // Time variables
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.milliseconds = 0;
        this.running = false;
        this.interval = null;
        
        // Lap tracking
        this.laps = [];
        this.lapStartTime = 0;
        this.totalElapsedTime = 0;
        
        // DOM elements
        this.hoursDisplay = document.getElementById('hours');
        this.minutesDisplay = document.getElementById('minutes');
        this.secondsDisplay = document.getElementById('seconds');
        this.millisecondsDisplay = document.getElementById('milliseconds');
        
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.lapBtn = document.getElementById('lapBtn');
        this.clearLapsBtn = document.getElementById('clearLapsBtn');
        
        this.lapList = document.getElementById('lapList');
        this.progressCircle = document.getElementById('progressCircle');
        this.progressText = document.getElementById('progressText');
        
        // Statistics
        this.totalLapsDisplay = document.getElementById('totalLaps');
        this.fastestLapDisplay = document.getElementById('fastestLap');
        this.slowestLapDisplay = document.getElementById('slowestLap');
        this.averageLapDisplay = document.getElementById('averageLap');
        
        this.initializeEventListeners();
        this.createSVGGradient();
    }
    
    // Create SVG gradient for progress circle
    createSVGGradient() {
        const svg = document.querySelector('.progress-ring svg');
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'gradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('style', 'stop-color:#6366f1;stop-opacity:1');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('style', 'stop-color:#8b5cf6;stop-opacity:1');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.insertBefore(defs, svg.firstChild);
    }
    
    // Initialize event listeners
    initializeEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.pause());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.lapBtn.addEventListener('click', () => this.recordLap());
        this.clearLapsBtn.addEventListener('click', () => this.clearLaps());
    }
    
    // Start the stopwatch
    start() {
        if (!this.running) {
            this.running = true;
            this.lapStartTime = Date.now() - this.totalElapsedTime;
            
            this.interval = setInterval(() => {
                this.totalElapsedTime = Date.now() - this.lapStartTime;
                this.updateTime();
                this.updateProgress();
            }, 10);
            
            this.updateButtons();
            this.progressText.textContent = 'Running';
            document.body.classList.add('running');
        }
    }
    
    // Pause the stopwatch
    pause() {
        if (this.running) {
            this.running = false;
            clearInterval(this.interval);
            this.updateButtons();
            this.progressText.textContent = 'Paused';
            document.body.classList.remove('running');
        }
    }
    
    // Reset the stopwatch
    reset() {
        this.running = false;
        clearInterval(this.interval);
        
        this.hours = 0;
        this.minutes = 0;
        this.seconds = 0;
        this.milliseconds = 0;
        this.totalElapsedTime = 0;
        
        this.updateDisplay();
        this.updateButtons();
        this.progressText.textContent = 'Ready';
        this.progressCircle.style.strokeDashoffset = 565.48;
        document.body.classList.remove('running');
    }
    
    // Update time calculations
    updateTime() {
        this.milliseconds = Math.floor((this.totalElapsedTime % 1000) / 10);
        this.seconds = Math.floor((this.totalElapsedTime / 1000) % 60);
        this.minutes = Math.floor((this.totalElapsedTime / (1000 * 60)) % 60);
        this.hours = Math.floor(this.totalElapsedTime / (1000 * 60 * 60));
        
        this.updateDisplay();
    }
    
    // Update display
    updateDisplay() {
        this.hoursDisplay.textContent = this.pad(this.hours);
        this.minutesDisplay.textContent = this.pad(this.minutes);
        this.secondsDisplay.textContent = this.pad(this.seconds);
        this.millisecondsDisplay.textContent = this.pad(this.milliseconds);
    }
    
    // Update progress circle
    updateProgress() {
        const seconds = this.totalElapsedTime / 1000;
        const progress = (seconds % 60) / 60;
        const offset = 565.48 - (progress * 565.48);
        this.progressCircle.style.strokeDashoffset = offset;
    }
    
    // Pad numbers with leading zero
    pad(number) {
        return number < 10 ? '0' + number : number;
    }
    
    // Update button states
    updateButtons() {
        if (this.running) {
            this.startBtn.disabled = true;
            this.pauseBtn.disabled = false;
            this.lapBtn.disabled = false;
        } else {
            this.startBtn.disabled = false;
            this.pauseBtn.disabled = true;
            this.lapBtn.disabled = true;
        }
    }
    
    // Record lap time
    recordLap() {
        if (this.running) {
            const lapTime = this.totalElapsedTime;
            const lapObject = {
                number: this.laps.length + 1,
                time: lapTime,
                total: lapTime
            };
            
            this.laps.push(lapObject);
            this.displayLap(lapObject);
            this.updateStatistics();
            this.animateLapButton();
        }
    }
    
    // Display lap in the list
    displayLap(lap) {
        // Remove "no laps" message
        const noLaps = this.lapList.querySelector('.no-laps');
        if (noLaps) {
            noLaps.remove();
        }
        
        const lapItem = document.createElement('div');
        lapItem.className = 'lap-item';
        
        const lapNumber = document.createElement('div');
        lapNumber.className = 'lap-number';
        lapNumber.textContent = `#${lap.number}`;
        
        const lapTime = document.createElement('div');
        lapTime.className = 'lap-time';
        lapTime.textContent = this.formatTime(lap.time);
        
        const lapTotal = document.createElement('div');
        lapTotal.className = 'lap-total';
        lapTotal.textContent = `Total: ${this.formatTime(lap.total)}`;
        
        lapItem.appendChild(lapNumber);
        lapItem.appendChild(lapTime);
        lapItem.appendChild(lapTotal);
        
        this.lapList.insertBefore(lapItem, this.lapList.firstChild);
        
        // Animate the new lap
        setTimeout(() => {
            lapItem.style.animation = 'slideIn 0.3s ease';
        }, 10);
    }
    
    // Format time for display
    formatTime(milliseconds) {
        const ms = Math.floor((milliseconds % 1000) / 10);
        const s = Math.floor((milliseconds / 1000) % 60);
        const m = Math.floor((milliseconds / (1000 * 60)) % 60);
        const h = Math.floor(milliseconds / (1000 * 60 * 60));
        
        if (h > 0) {
            return `${this.pad(h)}:${this.pad(m)}:${this.pad(s)}.${this.pad(ms)}`;
        } else {
            return `${this.pad(m)}:${this.pad(s)}.${this.pad(ms)}`;
        }
    }
    
    // Update statistics
    updateStatistics() {
        const lapTimes = this.laps.map(lap => lap.time);
        
        // Total laps
        this.totalLapsDisplay.textContent = this.laps.length;
        
        if (lapTimes.length > 0) {
            // Fastest lap
            const fastest = Math.min(...lapTimes);
            this.fastestLapDisplay.textContent = this.formatTime(fastest);
            
            // Slowest lap
            const slowest = Math.max(...lapTimes);
            this.slowestLapDisplay.textContent = this.formatTime(slowest);
            
            // Average lap
            const average = lapTimes.reduce((a, b) => a + b, 0) / lapTimes.length;
            this.averageLapDisplay.textContent = this.formatTime(average);
            
            // Highlight fastest and slowest
            this.highlightLaps(fastest, slowest);
        }
    }
    
    // Highlight fastest and slowest laps
    highlightLaps(fastest, slowest) {
        const lapItems = this.lapList.querySelectorAll('.lap-item');
        lapItems.forEach(item => {
            item.classList.remove('fastest', 'slowest');
            const badges = item.querySelectorAll('.lap-badge');
            badges.forEach(badge => badge.remove());
        });
        
        this.laps.forEach((lap, index) => {
            const lapItem = lapItems[lapItems.length - 1 - index];
            if (lapItem) {
                if (lap.time === fastest && this.laps.length > 1) {
                    lapItem.classList.add('fastest');
                    const badge = document.createElement('div');
                    badge.className = 'lap-badge fastest';
                    badge.textContent = 'Fastest';
                    lapItem.appendChild(badge);
                }
                if (lap.time === slowest && this.laps.length > 1) {
                    lapItem.classList.add('slowest');
                    const badge = document.createElement('div');
                    badge.className = 'lap-badge slowest';
                    badge.textContent = 'Slowest';
                    lapItem.appendChild(badge);
                }
            }
        });
    }
    
    // Animate lap button
    animateLapButton() {
        this.lapBtn.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.lapBtn.style.transform = 'scale(1)';
        }, 100);
    }
    
    // Clear all laps
    clearLaps() {
        this.laps = [];
        this.lapList.innerHTML = `
            <div class="no-laps">
                <i class="fas fa-flag-checkered"></i>
                <p>No lap times recorded yet</p>
            </div>
        `;
        
        this.totalLapsDisplay.textContent = '0';
        this.fastestLapDisplay.textContent = '--:--:--';
        this.slowestLapDisplay.textContent = '--:--:--';
        this.averageLapDisplay.textContent = '--:--:--';
    }
}

// Theme Toggle
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
    body.classList.add('light-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    
    if (body.classList.contains('light-theme')) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'dark');
    }
});

// Initialize Stopwatch
const stopwatch = new Stopwatch();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        if (stopwatch.running) {
            stopwatch.pause();
        } else {
            stopwatch.start();
        }
    } else if (e.code === 'KeyR') {
        stopwatch.reset();
    } else if (e.code === 'KeyL' && stopwatch.running) {
        stopwatch.recordLap();
    }
});

// Add keyboard shortcuts info
console.log(`
🎯 Keyboard Shortcuts:
━━━━━━━━━━━━━━━━━━━━━
Space  - Start/Pause
R      - Reset
L      - Record Lap
━━━━━━━━━━━━━━━━━━━━━
`);

// Page load animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Prevent context menu on buttons (optional)
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('contextmenu', (e) => e.preventDefault());
});

console.log('✅ Stopwatch initialized successfully!');