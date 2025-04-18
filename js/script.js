document.addEventListener('DOMContentLoaded', () => {
    // Initialize rainbow mode from localStorage or default to false
    window.rainbowMode = localStorage.getItem('rainbowMode') === 'true';
    
    // Set up grid
    const grid = document.getElementById('bg-grid');
    const rows = 5;
    const columns = 5;
    
    // Empty the grid first (in case there are any existing children)
    grid.innerHTML = '';
    
    // Create variables for tracking
    let lastHovered = -1;
    let mouseDown = false;
    let lastHue = 0;
    const prevDown = {};
    
    console.log('Creating grid cells...');
    
    // Create grid cells
    for (let i = 0; i < rows * columns; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.setAttribute('data-index', i);
        grid.appendChild(cell);
    }
    
    console.log(`Created ${grid.children.length} grid cells`);
    
    // Set up rainbow toggle
    const rainbowToggle = document.getElementById('rainbow-toggle');
    rainbowToggle.checked = window.rainbowMode;
    
    console.log(`Rainbow mode: ${window.rainbowMode}`);
    
    rainbowToggle.addEventListener('change', () => {
        window.rainbowMode = rainbowToggle.checked;
        localStorage.setItem('rainbowMode', window.rainbowMode);
        console.log(`Rainbow mode changed to: ${window.rainbowMode}`);
        
        // Update the grid cell states based on new rainbow mode
        if (!window.rainbowMode) {
            // Clear all cells when turning off rainbow mode
            Array.from(grid.children).forEach(cell => {
                cell.classList.remove('hovered', 'hovered-fast-trans', 'clicked');
            });
        } else {
            // If enabling rainbow mode, highlight the cell under the cursor
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: lastMouseX || window.innerWidth / 2,
                clientY: lastMouseY || window.innerHeight / 2
            });
            render(mouseEvent);
        }
    });
    
    // Track mouse position globally
    let lastMouseX = 0;
    let lastMouseY = 0;
    
    // Cell interaction handler
    const render = (event) => {
        const [x, y] = [event.clientX, event.clientY];
        lastMouseX = x;
        lastMouseY = y;
        
        // Calculate which cell the mouse is over
        const row = Math.floor(y * rows / window.innerHeight);
        const column = Math.floor(x * columns / window.innerWidth);
        
        // Get cell index
        const cellIndex = row >= 0 && row < rows && column >= 0 && column < columns
            ? row * columns + column
            : -1;
        
        // Update the currently hovered cell
        if (cellIndex >= 0 && cellIndex < grid.children.length) {
            const hovered = grid.children[cellIndex];
            
            // Apply color when clicked or in rainbow mode
            if (!prevDown[cellIndex] && (mouseDown || window.rainbowMode)) {
                const hue = (lastHue + 12 + Math.floor(Math.random() * 16)) % 360;
                hovered.style.setProperty('--click-bg', `hsl(${hue}deg, 100%, 50%, 0.5)`);
                lastHue = hue;
            }
            
            // Add appropriate classes
            hovered.classList.add('hovered');
            hovered.classList.toggle('clicked', (mouseDown || window.rainbowMode));
            hovered.classList.toggle('hovered-fast-trans', !prevDown[cellIndex] && !(mouseDown || window.rainbowMode));
            
            // For debugging
            if (cellIndex !== lastHovered) {
                console.log(`Hovering cell ${cellIndex}, row: ${row}, col: ${column}`);
            }
        }
        
        // Remove classes from the previously hovered cell if different
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
    
    // Mouse event listeners
    document.addEventListener('mousemove', render, { capture: true, passive: true });
    document.addEventListener('mouseleave', () => render({ clientX: -1, clientY: -1 }), { passive: true });
    document.addEventListener('mousedown', (event) => { 
        mouseDown = true; 
        render(event); 
        console.log('Mouse down');
    }, { capture: true, passive: true });
    
    document.addEventListener('mouseup', (event) => { 
        mouseDown = false; 
        render(event); 
        console.log('Mouse up');
    }, { capture: true, passive: true });
    
    document.addEventListener('dragend', (event) => { 
        mouseDown = false; 
        render(event); 
    }, { capture: true, passive: true });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        console.log('Window resized');
        // Reset the grid when window is resized
        lastHovered = -1;
        mouseDown = false;
        
        // Clear all cells
        Array.from(grid.children).forEach(cell => {
            cell.classList.remove('hovered', 'hovered-fast-trans', 'clicked');
        });
    });
    
    // For debugging - check grid state
    console.log('Grid initialized with:', {
        cells: grid.children.length,
        rainbowMode: window.rainbowMode
    });
    
    // Send a fake mousemove event to highlight cell under current cursor position
    document.dispatchEvent(new MouseEvent('mousemove', {
        clientX: window.innerWidth / 2,
        clientY: window.innerHeight / 2
    }));
});
