/**
 * Falling Neon Tetris Outlines Background
 * Creates falling tetris piece outlines with neon glow effects
 */

class FallingPiece {
    constructor(shape, color, x, y, pieceSize) {
        this.shape = shape;
        this.color = color;
        this.x = x;
        this.y = y;
        this.pieceSize = pieceSize;
        this.velocity = Math.random() * 2 + 1; // 1-3 pixels per frame
        this.state = 'falling'; // 'falling', 'landed', 'fading', 'complete'
        this.landingTime = 0;
        this.opacity = 1;
        this.fadeStartTime = 0;
        this.landedY = 0; // Store Y position when landed
    }

    update(canvas) {
        switch(this.state) {
            case 'falling':
                this.y += this.velocity;
                // Check if piece has reached landing zone (bottom 20% of screen)
                const landingZone = canvas.height - (canvas.height * 0.2);
                if (this.y >= landingZone - this.shape.length * this.pieceSize) {
                    this.state = 'landed';
                    this.landedY = landingZone - this.shape.length * this.pieceSize;
                    this.landingTime = Date.now();
                }
                break;
            case 'landed':
                // Keep piece at landed position for 15 seconds
                this.y = this.landedY;
                if (Date.now() - this.landingTime > 15000) {
                    this.state = 'fading';
                    this.fadeStartTime = Date.now();
                }
                break;
            case 'fading':
                // Fade out over 2 seconds
                const fadeProgress = (Date.now() - this.fadeStartTime) / 2000;
                this.opacity = Math.max(0, 1 - fadeProgress);
                if (this.opacity <= 0) {
                    this.state = 'complete';
                }
                break;
        }
    }

    draw(ctx) {
        if (this.state === 'complete') return;

        ctx.save();
        ctx.globalAlpha = this.opacity * 0.3; // Base 30% opacity
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;

        // Draw each block outline in the piece
        this.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    const blockX = this.x + colIndex * this.pieceSize;
                    const blockY = this.y + rowIndex * this.pieceSize;
                    ctx.strokeRect(blockX, blockY, this.pieceSize, this.pieceSize);
                }
            });
        });

        ctx.restore();
    }
}

class FallingTetrisBackground {
    constructor() {
        // Tetris piece shapes
        this.pieces = [
            [[1, 1, 1, 1]], // I-piece
            [[1, 1], [1, 1]], // O-piece
            [[0, 1, 0], [1, 1, 1]], // T-piece
            [[1, 0, 0], [1, 1, 1]], // J-piece
            [[0, 0, 1], [1, 1, 1]], // L-piece
            [[1, 1, 0], [0, 1, 1]], // S-piece
            [[0, 1, 1], [1, 1, 0]]  // Z-piece
        ];

        // Neon colors: pink, blue, purple
        this.colors = ['#ff00ff', '#00ffff', '#8844ff'];
        
        // Configuration
        this.maxPieces = 5;
        this.pieceSize = 80;
        this.spawnInterval = 1500; // 1.5 seconds between spawns
        this.lastSpawnTime = 0;
        this.lastFrameTime = 0;
        
        // Active pieces
        this.activePieces = new Set();
        
        // Canvas setup
        this.canvas = null;
        this.ctx = null;
        
        this.init();
    }

    init() {
        this.createCanvas();
        this.startAnimation();
    }

    createCanvas() {
        // Remove any existing background containers
        const existingContainer = document.querySelector('.tetris-background-container');
        if (existingContainer) {
            existingContainer.remove();
        }

        // Create new container
        const container = document.createElement('div');
        container.className = 'tetris-background-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
        `;

        // Create single canvas for the background
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'tetris-bg-canvas';
        this.canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            mix-blend-mode: screen;
            filter: blur(0.5px);
        `;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        container.appendChild(this.canvas);
        document.body.appendChild(container);

        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    spawnPiece() {
        if (this.activePieces.size >= this.maxPieces) return;

        const shape = this.getRandomShape();
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // Calculate maximum X position to keep piece within screen
        const maxX = Math.floor(this.canvas.width / this.pieceSize) - shape[0].length;
        const x = Math.floor(Math.random() * Math.max(1, maxX)) * this.pieceSize;
        const y = -shape.length * this.pieceSize; // Start above screen

        const piece = new FallingPiece(shape, color, x, y, this.pieceSize);
        this.activePieces.add(piece);
    }

    getRandomShape() {
        return this.pieces[Math.floor(Math.random() * this.pieces.length)];
    }

    update(currentTime) {
        // Spawn new pieces at intervals
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnPiece();
            this.lastSpawnTime = currentTime;
        }

        // Update all active pieces
        const piecesToRemove = [];
        this.activePieces.forEach(piece => {
            piece.update(this.canvas);
            if (piece.state === 'complete') {
                piecesToRemove.push(piece);
            }
        });

        // Remove completed pieces
        piecesToRemove.forEach(piece => this.activePieces.delete(piece));
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all active pieces
        this.activePieces.forEach(piece => {
            piece.draw(this.ctx);
        });
    }

    animate(currentTime) {
        if (!this.lastFrameTime) this.lastFrameTime = currentTime;
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.update(currentTime);
        this.render();
        requestAnimationFrame(this.animate.bind(this));
    }

    startAnimation() {
        // Start with a few pieces
        for (let i = 0; i < 3; i++) {
            setTimeout(() => this.spawnPiece(), i * 500);
        }

        // Start animation loop
        requestAnimationFrame(this.animate.bind(this));
    }
}

// Initialize background when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FallingTetrisBackground();
});