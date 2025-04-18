// script.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize rainbow mode toggle
    const rainbowToggle = document.getElementById('rainbow-toggle');
    window.rainbowMode = rainbowToggle.checked;
    rainbowToggle.addEventListener('input', () => {
        window.rainbowMode = rainbowToggle.checked;
    });

    // Set up the background grid
    const grid = document.getElementById('bg-grid');
    const rows = 5;
    const columns = 5;
    
    // Create grid cells
    for (let i = 0; i < rows * columns; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        grid.appendChild(cell);
    }
    
    // Set grid template
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    
    // Track mouse interactions
    let lastHovered = -1;
    let mouseDown = false;
    let lastHue = 0;
    const prevDown = {};
    
    const render = (event) => {
        const [x, y] = [event.clientX, event.clientY];
        
        // Calculate which grid cell we're on
        const row = Math.floor(y * rows / window.innerHeight);
        const column = Math.floor(x * columns / window.innerWidth);
        
        // Calculate cell index
        const cellIndex = (row >= 0 && row < rows && column >= 0 && column < columns) 
            ? row * columns + column 
            : -1;
        
        // Get the hovered cell
        const hovered = cellIndex >= 0 ? grid.children[cellIndex] : null;
        
        if (cellIndex >= 0 && hovered) {
            if (!prevDown[cellIndex] && (mouseDown || window.rainbowMode)) {
                // Generate a new color with a nice hue shift for visual interest
                const hue = (lastHue + 12 + Math.floor(Math.random() * 16)) % 360;
                hovered.style.setProperty('--click-bg', `hsl(${hue}deg, 100%, 50%, 0.5)`);
                lastHue = hue;
            }
            
            // Apply classes for visual effects
            hovered.classList.add('hovered');
            hovered.classList.toggle('clicked', (mouseDown || window.rainbowMode));
            hovered.classList.toggle('hovered-fast-trans', !prevDown[cellIndex] && !(mouseDown || window.rainbowMode));
        }
        
        // Remove effects from previously hovered cell if we've moved to a new one
        if (lastHovered >= 0 && lastHovered !== cellIndex && lastHovered < grid.children.length) {
            grid.children[lastHovered].classList.remove('hovered', 'hovered-fast-trans', 'clicked');
            prevDown[lastHovered] = false;
        }
        
        // Update tracking variables
        lastHovered = cellIndex;
        if (cellIndex >= 0) {
            prevDown[cellIndex] = mouseDown || window.rainbowMode;
        }
    };
    
    // Add event listeners
    document.addEventListener('mousemove', render, { capture: true, passive: true });
    document.addEventListener('mouseleave', () => render({ clientX: -1, clientY: -1 }), { passive: true });
    document.addEventListener('mousedown', (event) => { mouseDown = true; render(event); }, { capture: true, passive: true });
    document.addEventListener('mouseup', (event) => { mouseDown = false; render(event); }, { capture: true, passive: true });
    document.addEventListener('dragend', (event) => { mouseDown = false; render(event); }, { capture: true, passive: true });
    
    // Handle window resize to ensure grid stays responsive
    window.addEventListener('resize', () => {
        // Clear grid effects on resize
        for (let i = 0; i < grid.children.length; i++) {
            grid.children[i].classList.remove('hovered', 'hovered-fast-trans', 'clicked');
            prevDown[i] = false;
        }
        lastHovered = -1;
    });
});
