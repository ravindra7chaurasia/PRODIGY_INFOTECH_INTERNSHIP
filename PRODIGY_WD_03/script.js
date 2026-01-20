// Game Class
class TicTacToe {
    constructor() {
        // Game state
        this.currentPlayer = 'X';
        this.gameActive = false;
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.gameMode = null; // 'pvp' or 'pvc'
        this.difficulty = 'medium';
        this.soundEnabled = true;
        
        // Scores
        this.scores = {
            X: 0,
            O: 0,
            draws: 0,
            totalGames: 0
        };
        
        // Winning combinations
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        // DOM elements
        this.cells = document.querySelectorAll('.cell');
        this.turnDisplay = document.getElementById('turnDisplay');
        this.resultModal = document.getElementById('resultModal');
        this.modeSelection = document.getElementById('modeSelection');
        this.difficultySelection = document.getElementById('difficultySelection');
        this.gameContainer = document.getElementById('gameContainer');
        
        this.initializeEventListeners();
        this.loadScores();
    }
    
    // Initialize all event listeners
    initializeEventListeners() {
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.getAttribute('data-mode');
                this.selectMode(mode);
            });
        });
        
        // Difficulty selection
        document.querySelectorAll('.diff-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const difficulty = e.currentTarget.getAttribute('data-difficulty');
                this.selectDifficulty(difficulty);
            });
        });
        
        // Back to mode button
        document.getElementById('backToMode').addEventListener('click', () => {
            this.difficultySelection.classList.add('hidden');
            this.modeSelection.classList.remove('hidden');
        });
        
        // Game cells
        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        
        // Control buttons
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetScores());
        document.getElementById('menuBtn').addEventListener('click', () => this.backToMenu());
        
        // Modal buttons
        document.getElementById('playAgainBtn').addEventListener('click', () => {
            this.resultModal.classList.add('hidden');
            this.restartGame();
        });
        document.getElementById('modalMenuBtn').addEventListener('click', () => {
            this.resultModal.classList.add('hidden');
            this.backToMenu();
        });
        
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());
        
        // Sound toggle
        document.getElementById('soundToggle').addEventListener('click', () => this.toggleSound());
    }
    
    // Select game mode
    selectMode(mode) {
        this.gameMode = mode;
        
        if (mode === 'pvc') {
            this.modeSelection.classList.add('hidden');
            this.difficultySelection.classList.remove('hidden');
        } else {
            this.startGame();
        }
    }
    
    // Select difficulty
    selectDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.startGame();
    }
    
    // Start the game
    startGame() {
        this.modeSelection.classList.add('hidden');
        this.difficultySelection.classList.add('hidden');
        this.gameContainer.classList.remove('hidden');
        
        // Update labels for AI mode
        if (this.gameMode === 'pvc') {
            document.getElementById('playerXLabel').textContent = 'You (X)';
            document.getElementById('playerOLabel').textContent = `AI (O) - ${this.difficulty.charAt(0).toUpperCase() + this.difficulty.slice(1)}`;
        } else {
            document.getElementById('playerXLabel').textContent = 'Player X';
            document.getElementById('playerOLabel').textContent = 'Player O';
        }
        
        this.gameActive = true;
        this.updateTurnDisplay();
        this.updateScoreDisplay();
    }
    
    // Handle cell click
    handleCellClick(e) {
        const cell = e.target;
        const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
        
        if (this.gameState[cellIndex] !== '' || !this.gameActive) {
            return;
        }
        
        if (this.gameMode === 'pvc' && this.currentPlayer === 'O') {
            return; // Don't allow manual O moves in AI mode
        }
        
        this.makeMove(cellIndex, this.currentPlayer);
    }
    
    // Make a move
    makeMove(cellIndex, player) {
        this.gameState[cellIndex] = player;
        this.cells[cellIndex].textContent = player;
        this.cells[cellIndex].classList.add(player.toLowerCase());
        
        this.playSound('move');
        
        if (this.checkWinner()) {
            this.handleGameEnd(player);
        } else if (this.checkDraw()) {
            this.handleGameEnd('draw');
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updateTurnDisplay();
            
            // AI move
            if (this.gameMode === 'pvc' && this.currentPlayer === 'O' && this.gameActive) {
                setTimeout(() => {
                    this.makeAIMove();
                }, 500);
            }
        }
    }
    
    // AI Move
    makeAIMove() {
        let move;
        
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = Math.random() < 0.5 ? this.getBestMove() : this.getRandomMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }
        
        if (move !== null) {
            this.makeMove(move, 'O');
        }
    }
    
    // Get random available move
    getRandomMove() {
        const availableMoves = this.gameState
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : null;
    }
    
    // Get best move using minimax algorithm
    getBestMove() {
        // First, check if AI can win
        for (let i = 0; i < 9; i++) {
            if (this.gameState[i] === '') {
                this.gameState[i] = 'O';
                if (this.checkWinner()) {
                    this.gameState[i] = '';
                    return i;
                }
                this.gameState[i] = '';
            }
        }
        
        // Second, block player from winning
        for (let i = 0; i < 9; i++) {
            if (this.gameState[i] === '') {
                this.gameState[i] = 'X';
                if (this.checkWinner()) {
                    this.gameState[i] = '';
                    return i;
                }
                this.gameState[i] = '';
            }
        }
        
        // Third, take center if available
        if (this.gameState[4] === '') {
            return 4;
        }
        
        // Fourth, take a corner
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.gameState[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Finally, take any available space
        return this.getRandomMove();
    }
    
    // Check for winner
    checkWinner() {
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.gameState[a] && 
                this.gameState[a] === this.gameState[b] && 
                this.gameState[a] === this.gameState[c]) {
                this.highlightWinningCells(condition);
                return true;
            }
        }
        return false;
    }
    
    // Check for draw
    checkDraw() {
        return this.gameState.every(cell => cell !== '');
    }
    
    // Highlight winning cells
    highlightWinningCells(winningCombination) {
        winningCombination.forEach(index => {
            this.cells[index].classList.add('winner');
        });
        
        this.drawWinningLine(winningCombination);
    }
    
    // Draw winning line
    drawWinningLine(combination) {
        const line = document.getElementById('winningLine');
        const [a, b, c] = combination;
        
        // Determine line position and rotation
        const lineConfigs = {
            '0,1,2': { top: '16.66%', left: '50%', width: '80%', height: '5px', rotate: '0deg' },
            '3,4,5': { top: '50%', left: '50%', width: '80%', height: '5px', rotate: '0deg' },
            '6,7,8': { top: '83.33%', left: '50%', width: '80%', height: '5px', rotate: '0deg' },
            '0,3,6': { top: '50%', left: '16.66%', width: '5px', height: '80%', rotate: '0deg' },
            '1,4,7': { top: '50%', left: '50%', width: '5px', height: '80%', rotate: '0deg' },
            '2,5,8': { top: '50%', left: '83.33%', width: '5px', height: '80%', rotate: '0deg' },
            '0,4,8': { top: '50%', left: '50%', width: '5px', height: '110%', rotate: '45deg' },
            '2,4,6': { top: '50%', left: '50%', width: '5px', height: '110%', rotate: '-45deg' }
        };
        
        const key = combination.join(',');
        const config = lineConfigs[key];
        
        if (config) {
            Object.assign(line.style, {
                top: config.top,
                left: config.left,
                width: config.width,
                height: config.height,
                transform: `translate(-50%, -50%) rotate(${config.rotate})`
            });
            line.classList.add('show');
        }
    }
    
    // Handle game end
    handleGameEnd(result) {
        this.gameActive = false;
        
        setTimeout(() => {
            if (result === 'draw') {
                this.scores.draws++;
                this.showModal('draw', "It's a Draw!", "Well played by both sides!");
                this.playSound('draw');
            } else {
                this.scores[result]++;
                const winnerText = this.gameMode === 'pvc' && result === 'O' 
                    ? 'AI Wins!' 
                    : `Player ${result} Wins!`;
                const message = this.gameMode === 'pvc' && result === 'O'
                    ? 'Better luck next time!'
                    : 'Congratulations on your victory!';
                this.showModal(`winner-${result.toLowerCase()}`, winnerText, message);
                this.playSound('win');
            }
            
            this.scores.totalGames++;
            this.updateScoreDisplay();
            this.saveScores();
        }, 500);
    }
    
    // Show result modal
    showModal(iconClass, title, message) {
        const modalIcon = document.getElementById('modalIcon');
        const resultTitle = document.getElementById('resultTitle');
        const resultMessage = document.getElementById('resultMessage');
        
        modalIcon.className = `modal-icon ${iconClass}`;
        
        if (iconClass.includes('winner-x')) {
            modalIcon.innerHTML = '<i class="fas fa-times"></i>';
        } else if (iconClass.includes('winner-o')) {
            modalIcon.innerHTML = '<i class="far fa-circle"></i>';
        } else {
            modalIcon.innerHTML = '<i class="fas fa-handshake"></i>';
        }
        
        resultTitle.textContent = title;
        resultMessage.textContent = message;
        
        this.resultModal.classList.remove('hidden');
    }
    
    // Update turn display
    updateTurnDisplay() {
        const icon = this.currentPlayer === 'X' 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="far fa-circle"></i>';
        
        const playerText = this.gameMode === 'pvc' && this.currentPlayer === 'O'
            ? "AI's Turn"
            : `Player ${this.currentPlayer}'s Turn`;
        
        this.turnDisplay.innerHTML = `${icon}<span>${playerText}</span>`;
        this.turnDisplay.className = `turn-display player-${this.currentPlayer.toLowerCase()}`;
    }
    
    // Update score display
    updateScoreDisplay() {
        document.getElementById('scoreX').textContent = this.scores.X;
        document.getElementById('scoreO').textContent = this.scores.O;
        document.getElementById('scoreDraw').textContent = this.scores.draws;
        document.getElementById('totalGames').textContent = this.scores.totalGames;
        
        const xWinRate = this.scores.totalGames > 0 
            ? ((this.scores.X / this.scores.totalGames) * 100).toFixed(1) 
            : 0;
        const oWinRate = this.scores.totalGames > 0 
            ? ((this.scores.O / this.scores.totalGames) * 100).toFixed(1) 
            : 0;
        
        document.getElementById('winRateX').textContent = `${xWinRate}%`;
        document.getElementById('winRateO').textContent = `${oWinRate}%`;
    }
    
    // Restart game
    restartGame() {
        this.gameState = ['', '', '', '', '', '', '', '', ''];
        this.gameActive = true;
        this.currentPlayer = 'X';
        
        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });
        
        document.getElementById('winningLine').classList.remove('show');
        this.updateTurnDisplay();
    }
    
    // Reset scores
    resetScores() {
        if (confirm('Are you sure you want to reset all scores?')) {
            this.scores = { X: 0, O: 0, draws: 0, totalGames: 0 };
            this.updateScoreDisplay();
            this.saveScores();
            this.playSound('reset');
        }
    }
    
    // Back to main menu
    backToMenu() {
        this.gameContainer.classList.add('hidden');
        this.modeSelection.classList.remove('hidden');
        this.restartGame();
    }
    
    // Toggle theme
    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const themeIcon = document.querySelector('#themeToggle i');
        
        if (document.body.classList.contains('light-theme')) {
            themeIcon.className = 'fas fa-sun';
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.className = 'fas fa-moon';
            localStorage.setItem('theme', 'dark');
        }
    }
    
    // Toggle sound
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        const soundIcon = document.querySelector('#soundToggle i');
        const soundBtn = document.getElementById('soundToggle');
        
        if (this.soundEnabled) {
            soundIcon.className = 'fas fa-volume-up';
            soundBtn.classList.remove('muted');
        } else {
            soundIcon.className = 'fas fa-volume-mute';
            soundBtn.classList.add('muted');
        }
        
        localStorage.setItem('soundEnabled', this.soundEnabled);
    }
    
    // Play sound (Web Audio API simulation)
    playSound(type) {
        if (!this.soundEnabled) return;
        
        // You can add actual sound files here
        console.log(`Playing sound: ${type}`);
        
        // Simulated sound feedback with visual pulse
        if (type === 'move') {
            document.body.style.animation = 'none';
            setTimeout(() => {
                document.body.style.animation = '';
            }, 10);
        }
    }
    
    // Save scores to localStorage
    saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
    }
    
    // Load scores from localStorage
    loadScores() {
        const saved = localStorage.getItem('ticTacToeScores');
        if (saved) {
            this.scores = JSON.parse(saved);
        }
        
        // Load theme preference
        const theme = localStorage.getItem('theme');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
            document.querySelector('#themeToggle i').className = 'fas fa-sun';
        }
        
        // Load sound preference
        const soundEnabled = localStorage.getItem('soundEnabled');
        if (soundEnabled === 'false') {
            this.soundEnabled = false;
            document.querySelector('#soundToggle i').className = 'fas fa-volume-mute';
            document.getElementById('soundToggle').classList.add('muted');
        }
    }
}

// Initialize the game
const game = new TicTacToe();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !game.resultModal.classList.contains('hidden')) {
        game.resultModal.classList.add('hidden');
    }
    
    if (e.key === 'r' || e.key === 'R') {
        if (!game.gameContainer.classList.contains('hidden')) {
            game.restartGame();
        }
    }
});

// Add keyboard shortcuts info
console.log(`
🎮 Keyboard Shortcuts:
━━━━━━━━━━━━━━━━━━━━━
R      - Restart Game
ESC    - Close Modal
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

console.log('✅ Tic-Tac-Toe game initialized successfully!');