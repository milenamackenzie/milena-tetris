# Milena Tetris

A futuristic, web-based Tetris game built with HTML5, CSS3, and JavaScript. Features a sleek dark theme, sound effects, scoring system, and responsive controls.

![Game Screenshot](screenshot.png) <!-- Add a screenshot if available -->

## Features

- **Futuristic UI**: Dark gradient background with neon cyan and magenta accents, glassmorphism effects
- **Game Mechanics**: Classic Tetris gameplay with piece rotation, line clearing, and progressive difficulty
- **Scoring System**: Points for cleared lines, level progression every 5 lines
- **Sound Effects**: Web Audio API-generated sounds for rotations, drops, and line clears
- **Controls**: WASD and arrow keys support, space to pause
- **Responsive Design**: Adapts to different screen sizes

## How to Play

1. Click "Start Game" to begin
2. Use controls to move and rotate falling pieces:
   - **R** - Rotate piece
   - **A / ←** - Move left
   - **S / ↓** - Move down faster
   - **D / →** - Move right
   - **Space** - Pause/Resume
3. Clear horizontal lines by filling them completely
4. Score points and increase level every 5 lines cleared
5. Game ends when pieces reach the top

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/milenamackenzie/milena-tetris.git
   cd milena-tetris
   ```

2. Open `index.html` in a modern web browser

No additional dependencies required - runs entirely in the browser!

## File Structure

```
milena-tetris/
├── index.html          # Main HTML structure
├── style.css           # CSS styling for futuristic theme
├── script.js           # Game logic and mechanics
├── instructions.md     # Detailed game instructions
├── AGENTS.md           # Development guide for agentic coding
└── README.md           # This file
```

## Browser Compatibility

- Modern browsers with ES6 support
- Web Audio API for sound effects (fallback to no sound if unsupported)

## Customization

- **Colors**: Modify `colors` array in `script.js` for different piece colors
- **Speed**: Adjust `dropTime` and level progression in `script.js`
- **Sounds**: Tweak frequencies and durations in `playSound()` function
- **UI**: Update CSS variables for theme changes

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

© 2026 Made by Milena. All rights reserved.

## Credits

- Game concept: Classic Tetris
- Built with: HTML5 Canvas, CSS3, Vanilla JavaScript
- Sound generation: Web Audio API
