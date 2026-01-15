# AGENTS.md - Development Guide for Milena Tetris

This document provides guidelines and commands for agentic coding agents working on the Milena Tetris codebase.

## Project Overview

Milena Tetris is a browser-based Tetris game built with vanilla HTML5, CSS3, and JavaScript. It features a futuristic dark theme with neon accents, sound effects, and responsive design.

### File Structure
```
milena-tetris/
├── index.html          # Main HTML structure
├── style.css           # CSS styling with futuristic theme
├── script.js           # Game logic and mechanics
├── instructions.md     # Detailed game instructions
└── README.md           # Project documentation
```

## Development Commands

This is a client-side only project with no build system or testing framework. Development involves:

### Running the Game
```bash
# Open in browser (no server needed for basic development)
open index.html

# Or serve locally for better development experience
python -m http.server 8000  # Python 3
# python -m SimpleHTTPServer 8000  # Python 2
# npx serve .  # Using Node.js/serve
```

### Linting/Formatting
No formal linting is configured. For consistency:
- Use 4 spaces for indentation
- Follow existing code patterns in `script.js`
- Maintain CSS organization as shown in `style.css`

### Testing
No automated tests exist. Manual testing required:
1. Open game in browser
2. Test all keyboard controls (R, A/S/D, arrow keys, space)
3. Verify sound effects work (if browser supports Web Audio API)
4. Test responsive design on different screen sizes
5. Verify game mechanics: piece rotation, line clearing, scoring, level progression

## Code Style Guidelines

### JavaScript (`script.js`)

#### General Structure
- Use strict mode implicitly through modern JavaScript features
- Organize code logically: constants, game state, core functions, event listeners
- Use clear function names that describe actions (`moveDown`, `clearLines`, `gameOver`)

#### Variables & Constants
- `const` for unchanging values (game constants, DOM elements)
- `let` for variables that need reassignment (game state)
- Use camelCase for all variable names
- Descriptive names: `currentPiece`, `dropCounter`, `audioContext`

#### Functions
- Use `function` declarations for main game functions
- Arrow functions for callbacks and short utilities
- Keep functions focused on single responsibilities
- Return early from functions when possible

#### Data Structures
- Arrays for game board and piece shapes
- Objects for piece data and position tracking
- Use `Array.from()` for creating initialized arrays

#### Event Handling
- Use `addEventListener` for all DOM events
- Include proper key detection (case-insensitive for letter keys)
- Prevent default behavior where needed (`e.preventDefault()`)

#### Audio & Performance
- Initialize Audio Context on user interaction
- Use `requestAnimationFrame` for smooth animations
- Clean up audio nodes properly

### CSS (`style.css`)

#### Organization
- Group related selectors logically
- Use BEM-like naming for components (`.game-container`, `.start-btn`)
- Mobile-first responsive design with `@media` queries

#### Styling Patterns
- Use CSS custom properties for colors and spacing (consider for future enhancement)
- Gradient backgrounds for futuristic theme
- Box shadows for glow effects
- Flexbox for layouts

#### Units & Values
- Pixels for game elements (canvas, grid)
- Relative units for responsive text
- Consistent spacing patterns (multiples of 5px)

### HTML (`index.html`)

#### Structure
- Semantic HTML5 elements (`<main>`, `<aside>`, `<section>`)
- Accessible markup with proper heading hierarchy
- Descriptive IDs for JavaScript targeting
- Comments for complex sections

#### Accessibility
- Keyboard-only controls
- Screen reader friendly scoreboard
- High contrast colors
- Semantic button elements

## Game-Specific Conventions

### Canvas Rendering
- Use consistent scaling (`scale` variable)
- Clear canvas before each redraw
- Stroke borders for piece definition
- Color-coded pieces with neon palette

### Game Logic
- Check collisions before movement
- Use game state machine: `menu`, `playing`, `paused`, `gameOver`
- Immediate feedback for user actions (sounds, visual changes)
- Prevent invalid moves with collision detection

### Scoring System
- 100 points per line cleared × current level
- Level increases every 5 lines
- Speed increases with level progression
- Display real-time updates

## Sound Effects

### Audio Implementation
- Web Audio API for dynamic sound generation
- Different wave types for various actions
- Exponential gain ramps for smooth fade-out
- Graceful fallback if Audio Context unavailable

### Sound Design
- Rotation: Short tone (500Hz, 0.1s)
- Drop: Low sound (400Hz, 0.2s)  
- Line Clear: Success sound (600Hz, 0.3s)
- Game Over: Descending tone (200Hz, 0.5s, sawtooth)

## Browser Compatibility

### Target Browsers
- Modern browsers with ES6 support
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (responsive design)

### Feature Support
- Canvas API for rendering
- Web Audio API (optional, graceful degradation)
- CSS3 features (gradients, flexbox, backdrop-filter)
- ES6 JavaScript features

## Contributing Guidelines

### Code Review Checklist
- [ ] Game mechanics work correctly
- [ ] Sound effects function properly
- [ ] Responsive design maintained
- [ ] Keyboard controls accessible
- [ ] No JavaScript console errors
- [ ] Performance remains smooth (60fps target)

### Testing Requirements
1. Test all piece rotations and movements
2. Verify line clearing and scoring
3. Check pause/resume functionality
4. Test game over detection
5. Validate responsive breakpoints
6. Cross-browser compatibility check

## Common Tasks

### Adding New Features
1. Update game state variables if needed
2. Add UI elements to HTML/CSS
3. Implement logic in `script.js`
4. Add keyboard controls if required
5. Test thoroughly across browsers

### Bug Fixes
1. Reproduce issue consistently
2. Identify root cause (game logic vs. rendering vs. input)
3. Fix with minimal changes
4. Test edge cases
5. Verify no regressions

### Performance Optimization
- Canvas rendering optimization
- Reduce unnecessary redraws
- Optimize audio node creation
- Memory management for long sessions

## Future Enhancements

### Potential Additions
- Local high score storage
- Multiple difficulty levels
- Custom themes/color schemes
- Ghost piece preview
- Hold piece functionality
- Multiplayer mode

### Technical Debt
- Consider module system for larger codebase
- Add automated testing framework
- Implement build process for optimization
- Add TypeScript for better type safety