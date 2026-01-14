/**
 * Milena Tetris Game Logic
 * A JavaScript implementation of Tetris with futuristic UI, sound effects, and scoring.
 */

// Canvas setup for main game area
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');

// Canvas for next piece preview
const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

// Game grid constants
const scale = 40; // Size of each grid cell in pixels (further increased for even bigger boxes, much quicker gameplay)
const rows = canvas.height / scale; // 800/40 = 20 rows
const cols = canvas.width / scale; // 800/40 = 20 columns
const nextScale = 15; // Smaller scale for next piece

// Game board: 2D array representing the grid (0 = empty, color string = occupied)
let board = Array.from({ length: rows }, () => Array(cols).fill(0));

// Tetris piece shapes: Each array represents a piece's shape
const pieces = [
    [[1, 1, 1, 1]], // I-piece
    [[1, 1], [1, 1]], // O-piece
    [[0, 1, 0], [1, 1, 1]], // T-piece
    [[1, 0, 0], [1, 1, 1]], // J-piece
    [[0, 0, 1], [1, 1, 1]], // L-piece
    [[1, 1, 0], [0, 1, 1]], // S-piece
    [[0, 1, 1], [1, 1, 0]]  // Z-piece
];

// Colors for each piece type
const colors = ['#00ffff', '#ffff00', '#ff00ff', '#00ff00', '#ff8800', '#0088ff', '#ff0088'];

// Game state variables
let gameState = 'menu'; // Possible states: 'menu', 'playing', 'paused', 'gameOver'
let score = 0; // Player's current score
let lines = 0; // Total lines cleared
let level = 1; // Current level (affects speed)
let dropCounter = 0; // Counter for piece drop timing
let dropTime = 500; // Time between automatic drops (ms), further decreased for much quicker gameplay
let lastTime = 0; // Timestamp for animation loop

// Current and next Tetris pieces
let currentPiece = randomPiece(); // Piece currently falling
let nextPiece = randomPiece(); // Next piece to appear
let pos = { x: Math.floor(cols / 2) - Math.floor(currentPiece.shape[0].length / 2), y: 0 }; // Position of current piece

// Audio context for generating sound effects
let audioContext = null;

function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(frequency, duration, type = 'sine') {
    if (!audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = type;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function randomPiece() {
    const index = Math.floor(Math.random() * pieces.length);
    return { shape: pieces[index], color: colors[index] };
}

function rotate(piece) {
    const rotated = piece.shape[0].map((_, index) => piece.shape.map(row => row[index]).reverse());
    return { shape: rotated, color: piece.color };
}

function drawPiece(ctx, piece, offset, scale) {
    for (let y = 0; y < piece.shape.length; y++) {
        for (let x = 0; x < piece.shape[y].length; x++) {
            if (piece.shape[y][x]) {
                ctx.fillStyle = piece.color;
                ctx.fillRect((offset.x + x) * scale, (offset.y + y) * scale, scale, scale);
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.strokeRect((offset.x + x) * scale, (offset.y + y) * scale, scale, scale);
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw board
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (board[y][x]) {
                ctx.fillStyle = '#333';
                ctx.fillRect(x * scale, y * scale, scale, scale);
                ctx.strokeStyle = '#666';
                ctx.strokeRect(x * scale, y * scale, scale, scale);
            }
        }
    }
    // Draw current piece
    if (currentPiece && gameState === 'playing') {
        drawPiece(ctx, currentPiece, pos, scale);
    }
}

function drawNext() {
    nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
    if (nextPiece) {
        const offset = { x: 2, y: 2 };
        drawPiece(nextCtx, nextPiece, offset, nextScale);
    }
}

function moveDown() {
    if (gameState !== 'playing') return;
    pos.y++;
    if (collide()) {
        pos.y--;
        merge();
        clearLines();
        if (gameOver()) {
            gameState = 'gameOver';
            document.getElementById('game-over').classList.remove('hidden');
            playSound(200, 0.5, 'sawtooth');
            return;
        }
        currentPiece = nextPiece;
        nextPiece = randomPiece();
    pos = { x: Math.floor(cols / 2) - Math.floor(currentPiece.shape[0].length / 2), y: 0 };
    drawNext();
        drawNext();
        playSound(400, 0.2);
    }
    dropCounter = 0;
}

function collide() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                const newX = pos.x + x;
                const newY = pos.y + y;
                if (newX < 0 || newX >= cols || newY >= rows || (board[newY] && board[newY][newX])) {
                    return true;
                }
            }
        }
    }
    return false;
}

function merge() {
    for (let y = 0; y < currentPiece.shape.length; y++) {
        for (let x = 0; x < currentPiece.shape[y].length; x++) {
            if (currentPiece.shape[y][x]) {
                board[pos.y + y][pos.x + x] = currentPiece.color;
            }
        }
    }
}

function clearLines() {
    let linesCleared = 0;
    for (let y = rows - 1; y >= 0; y--) {
        if (board[y].every(cell => cell !== 0)) {
            board.splice(y, 1);
            board.unshift(Array(cols).fill(0));
            linesCleared++;
            y++; // Check the same line again
        }
    }
    if (linesCleared > 0) {
        lines += linesCleared;
        score += linesCleared * 100 * level;
        level = Math.floor(lines / 5) + 1;
        dropTime = Math.max(50, 1000 - (level - 1) * 100);
        updateScoreboard();
        playSound(600, 0.3);
    }
}

function gameOver() {
    return board[0].some(cell => cell !== 0);
}

function updateScoreboard() {
    document.getElementById('score').textContent = `Score: ${score}`;
    document.getElementById('lines').textContent = `Lines: ${lines}`;
    document.getElementById('level').textContent = `Level: ${level}`;
}

function resetGame() {
    board = Array.from({ length: rows }, () => Array(cols).fill(0));
    score = 0;
    lines = 0;
    level = 1;
    dropTime = 1000;
    dropCounter = 0;
    currentPiece = randomPiece();
    nextPiece = randomPiece();
    pos = { x: Math.floor(cols / 2) - Math.floor(currentPiece.shape[0].length / 2), y: 0 };
    updateScoreboard();
    drawNext();
}

function gameLoop(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropTime) {
        moveDown();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.getElementById('start-btn').addEventListener('click', () => {
    if (gameState === 'menu' || gameState === 'gameOver') {
        resetGame();
        gameState = 'playing';
        document.getElementById('game-over').classList.add('hidden');
        initAudio();
        playSound(800, 0.4);
    }
});

document.getElementById('restart-btn').addEventListener('click', () => {
    resetGame();
    gameState = 'playing';
    document.getElementById('game-over').classList.add('hidden');
    playSound(800, 0.4);
});

document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;
    switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
            pos.x--;
            if (collide()) pos.x++;
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            pos.x++;
            if (collide()) pos.x--;
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            moveDown();
            break;
        case 'r':
        case 'R':
            const rotated = rotate(currentPiece);
            const original = currentPiece;
            currentPiece = rotated;
            if (collide()) currentPiece = original;
            playSound(500, 0.1);
            break;
        case ' ':
            e.preventDefault();
            gameState = gameState === 'playing' ? 'paused' : 'playing';
            break;
    }
});

// Initialize
updateScoreboard();
drawNext();
gameLoop();