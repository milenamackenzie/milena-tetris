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
        this.velocity = Math.random() * 1 + 0.5; // 0.5-1.5 pixels per frame (slower)
        this.state = 'falling'; // 'falling', 'landed', 'fading', 'complete'
        this.landingTime = 0;
        this.opacity = 1;
        this.fadeStartTime = 0;
        this.landedY = 0; // Store Y position when landed
    }

    update(canvas, allPieces) {
        switch(this.state) {
            case 'falling':
                const nextY = this.y + this.velocity;
                
                // Check collision with bottom
                const bottomY = canvas.height - this.shape.length * this.pieceSize;
                if (nextY >= bottomY) {
                    this.state = 'landed';
                    this.landedY = bottomY;
                    this.landingTime = Date.now();
                    return true; // Signal that this piece has landed
                }
                
                // Check collision with other landed pieces
                if (this.checkCollision(nextY, allPieces)) {
                    this.state = 'landed';
                    this.landedY = this.y;
                    this.landingTime = Date.now();
                    return true; // Signal that this piece has landed
                }
                
                this.y = nextY;
                break;
            case 'landed':
                // Keep piece at landed position for 5 seconds (faster disappearance)
                this.y = this.landedY;
                if (Date.now() - this.landingTime > 5000) {
                    this.state = 'fading';
                    this.fadeStartTime = Date.now();
                }
                break;
            case 'fading':
                // Fade out over 1 second (much faster fade)
                const fadeProgress = (Date.now() - this.fadeStartTime) / 1000;
                this.opacity = Math.max(0, 1 - fadeProgress);
                if (this.opacity <= 0) {
                    this.state = 'complete';
                }
                break;
        }
        return false; // No new landing
    }

    checkCollision(testY, allPieces) {
        for (let otherPiece of allPieces) {
            if (otherPiece === this || otherPiece.state !== 'landed') continue;
            
            if (this.shapesOverlap(this.x, testY, this.shape, 
                                 otherPiece.x, otherPiece.y, otherPiece.shape)) {
                return true;
            }
        }
        return false;
    }

    shapesOverlap(x1, y1, shape1, x2, y2, shape2) {
        for (let r1 = 0; r1 < shape1.length; r1++) {
            for (let c1 = 0; c1 < shape1[r1].length; c1++) {
                if (!shape1[r1][c1]) continue;
                
                const blockX1 = x1 + c1 * this.pieceSize;
                const blockY1 = y1 + r1 * this.pieceSize;
                
                for (let r2 = 0; r2 < shape2.length; r2++) {
                    for (let c2 = 0; c2 < shape2[r2].length; c2++) {
                        if (!shape2[r2][c2]) continue;
                        
                        const blockX2 = x2 + c2 * this.pieceSize;
                        const blockY2 = y2 + r2 * this.pieceSize;
                        
                        // More precise collision detection with padding
                        const padding = 2; // Small padding to prevent overlap
                        if (Math.abs(blockX1 - blockX2) < (this.pieceSize - padding) && 
                            Math.abs(blockY1 - blockY2) < (this.pieceSize - padding)) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    draw(ctx) {
        if (this.state === 'complete') return;

        ctx.save();
        ctx.globalAlpha = this.opacity * 0.6; // Slightly dimmer for smaller pieces
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4; // Thinner for smaller pieces
        ctx.shadowBlur = 20; // Adjusted glow for smaller size
        ctx.shadowColor = this.color;
        ctx.lineCap = 'square'; // Sharp edges instead of rounded
        ctx.lineJoin = 'miter'; // Sharp corners

        // Draw complete tetris shape as one continuous outline
        this.drawPieceOutline(ctx);

        ctx.restore();
    }

    drawPieceOutline(ctx) {
        // Find all occupied cells
        const occupiedCells = [];
        this.shape.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell) {
                    occupiedCells.push({
                        x: this.x + colIndex * this.pieceSize,
                        y: this.y + rowIndex * this.pieceSize,
                        col: colIndex,
                        row: rowIndex
                    });
                }
            });
        });

        if (occupiedCells.length === 0) return;

        // Draw outline by tracing the perimeter of the shape
        ctx.beginPath();
        
        // Create a simplified outline by finding the perimeter
        let minCol = Math.min(...occupiedCells.map(c => c.col));
        let maxCol = Math.max(...occupiedCells.map(c => c.col));
        let minRow = Math.min(...occupiedCells.map(c => c.row));
        let maxRow = Math.max(...occupiedCells.map(c => c.row));

        // Simple approach: draw outer rectangle for single blocks, L-shapes, etc.
        if (occupiedCells.length === 1) {
            // Single block
            const cell = occupiedCells[0];
            ctx.rect(cell.x, cell.y, this.pieceSize, this.pieceSize);
        } else {
            // Multi-block piece - trace the outline more carefully
            this.traceShapeOutline(ctx, occupiedCells);
        }

        ctx.stroke();
    }

    traceShapeOutline(ctx, occupiedCells) {
        // Create a grid representation
        const grid = {};
        occupiedCells.forEach(cell => {
            grid[`${cell.col},${cell.row}`] = true;
        });

        // Trace outline with precision for sharp connections
        const edges = [];
        
        occupiedCells.forEach(cell => {
            const { col, row, x, y } = cell;
            
            // Check each edge with sub-pixel precision for perfect alignment
            // Top edge
            if (!grid[`${col},${row-1}`]) {
                edges.push({ x1: x, y1: y, x2: x + this.pieceSize, y2: y });
            }
            // Right edge  
            if (!grid[`${col+1},${row}`]) {
                edges.push({ x1: x + this.pieceSize, y1: y, x2: x + this.pieceSize, y2: y + this.pieceSize });
            }
            // Bottom edge
            if (!grid[`${col},${row+1}`]) {
                edges.push({ x1: x, y1: y + this.pieceSize, x2: x + this.pieceSize, y2: y + this.pieceSize });
            }
            // Left edge
            if (!grid[`${col-1},${row}`]) {
                edges.push({ x1: x, y1: y, x2: x, y2: y + this.pieceSize });
            }
        });

        // Sort edges for continuous drawing (ensures no gaps)
        const sortedEdges = this.sortEdgesForContinuity(edges);
        
        // Draw all edges as continuous paths
        sortedEdges.forEach(edge => {
            ctx.moveTo(edge.x1, edge.y1);
            ctx.lineTo(edge.x2, edge.y2);
        });
    }

    sortEdgesForContinuity(edges) {
        // Sort edges to create continuous paths without gaps
        if (edges.length <= 1) return edges;
        
        const sorted = [edges[0]];
        const remaining = edges.slice(1);
        
        while (remaining.length > 0) {
            const lastEdge = sorted[sorted.length - 1];
            const nextIndex = remaining.findIndex(edge => 
                Math.abs(edge.x1 - lastEdge.x2) < 1 && Math.abs(edge.y1 - lastEdge.y2) < 1
            );
            
            if (nextIndex >= 0) {
                sorted.push(remaining[nextIndex]);
                remaining.splice(nextIndex, 1);
            } else {
                // Add remaining edges
                sorted.push(...remaining);
                break;
            }
        }
        
        return sorted;
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

        // Brighter neon colors: pink, blue, purple
        this.colors = ['#ff00ff', '#00ffff', '#bb00ff']; // More vibrant purple
        
        // Configuration
        this.maxPieces = 50; // Much more pieces for continuous effect
        this.pieceSize = 50; // Smaller pieces
        this.spawnInterval = 1200; // Slower spawning (1.2 seconds)
        this.lastSpawnTime = 0;
        this.lastFrameTime = 0;
        this.landedPieces = []; // Track all landed pieces for stacking
        
        // Active pieces
        this.activePieces = new Set();
        
        // Canvas setup
        this.canvas = null;
        this.ctx = null;
        
        console.log('Background: Constructor initialized');
        this.init();
    }

    init() {
        console.log('Background: Initializing...');
        this.createCanvas();
        this.startAnimation();
        console.log('Background: Initialization complete');
    }

    createCanvas() {
        console.log('Background: Creating canvas...');
        
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
        
        if (!this.ctx) {
            console.error('Background: Failed to get 2D context');
            return;
        }

        this.resizeCanvas();

        container.appendChild(this.canvas);
        document.body.appendChild(container);
        console.log('Background: Canvas created and added to DOM');

        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        console.log(`Background: Resizing canvas to ${window.innerWidth}x${window.innerHeight}`);
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    spawnPiece() {
        if (this.activePieces.size >= this.maxPieces) {
            return;
        }

        const shape = this.getRandomShape();
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        
        // Smart positioning for better distribution
        const maxX = Math.floor(this.canvas.width / this.pieceSize) - shape[0].length;
        let x;
        
        // Better spawning strategy to avoid overlaps
        if (this.activePieces.size > 0) {
            // Try to find empty spawn position
            const attempts = 10;
            let foundPosition = false;
            
            for (let attempt = 0; attempt < attempts; attempt++) {
                const testX = Math.floor(Math.random() * Math.max(1, maxX)) * this.pieceSize;
                
                // Check if this position would cause immediate overlap
                const wouldOverlap = Array.from(this.activePieces).some(piece => {
                    if (piece.state !== 'falling') return false;
                    return Math.abs(piece.x - testX) < this.pieceSize * 2;
                });
                
                if (!wouldOverlap) {
                    x = testX;
                    foundPosition = true;
                    break;
                }
            }
            
            if (!foundPosition) {
                x = Math.floor(Math.random() * Math.max(1, maxX)) * this.pieceSize;
            }
        } else {
            // Random spawn for variety
            x = Math.floor(Math.random() * Math.max(1, maxX)) * this.pieceSize;
        }
        
        const y = -shape.length * this.pieceSize; // Start above screen

        const piece = new FallingPiece(shape, color, x, y, this.pieceSize);
        this.activePieces.add(piece);
        
        // Add to landed pieces list when it lands (handled in update)
        if (piece.state === 'landed') {
            this.landedPieces.push(piece);
        }
    }

    getRandomShape() {
        return this.pieces[Math.floor(Math.random() * this.pieces.length)];
    }

    update(currentTime) {
        // Spawn new pieces continuously
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnPiece();
            this.lastSpawnTime = currentTime;
        }

        // Get all pieces for collision detection (including newly landed ones)
        const allPieces = Array.from(this.activePieces);

        // Update all active pieces
        const piecesToRemove = [];
        this.activePieces.forEach(piece => {
            const hasLanded = piece.update(this.canvas, allPieces);
            if (piece.state === 'complete') {
                piecesToRemove.push(piece);
            }
        });

        // Remove completed pieces
        piecesToRemove.forEach(piece => {
            this.activePieces.delete(piece);
            // Also remove from landedPieces array if present
            const index = this.landedPieces.indexOf(piece);
            if (index > -1) {
                this.landedPieces.splice(index, 1);
            }
        });
    }

    render() {
        if (!this.ctx) {
            console.error('Background: No context available for rendering');
            return;
        }

        // Clear canvas with semi-transparent background for trail effect
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw all active pieces
        const pieceCount = this.activePieces.size;
        this.activePieces.forEach((piece, index) => {
            piece.draw(this.ctx);
        });
        
        // Debug: Log piece count periodically
        if (Math.random() < 0.01) { // 1% chance per frame
            console.log(`Background: Rendering ${pieceCount} pieces`);
        }
    }

    animate(currentTime) {
        if (!this.lastFrameTime) {
            this.lastFrameTime = currentTime;
        }
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;
        
        this.update(currentTime);
        this.render();
        requestAnimationFrame(this.animate.bind(this));
    }

    startAnimation() {
        console.log('Background: Starting animation...');
        
        // Start with initial pieces
        for (let i = 0; i < 5; i++) {
            setTimeout(() => this.spawnPiece(), i * 300); // Staggered initial spawn
        }

        // Start animation loop
        requestAnimationFrame(this.animate.bind(this));
        console.log('Background: Animation loop started');
    }
}

// Initialize background when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Background: DOM loaded, initializing...');
    try {
        new FallingTetrisBackground();
        console.log('Background: Successfully initialized');
    } catch (error) {
        console.error('Background: Failed to initialize:', error);
    }
});

// Also try immediate initialization in case DOM is already loaded
if (document.readyState === 'loading') {
    console.log('Background: DOM still loading, waiting...');
} else {
    console.log('Background: DOM already loaded, initializing immediately...');
    try {
        new FallingTetrisBackground();
        console.log('Background: Successfully initialized (immediate)');
    } catch (error) {
        console.error('Background: Failed to initialize (immediate):', error);
    }
}