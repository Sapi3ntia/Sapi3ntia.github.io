document.addEventListener('DOMContentLoaded', () => {
    const rainbowGrid = document.getElementById('rainbow-grid');
    const rainbowToggle = document.getElementById('rainbow-toggle');
    
    // Setup rainbow grid
    const gridCellSize = 50; // Size of each cell in pixels
    const gridCellVisualSize = 8; // Visual size of the cell dot
    
    let isRainbowActive = false;
    let mouseMoveTimeout;
    let cellsArray = [];
    
    // Initialize grid
    function initGrid() {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const columns = Math.ceil(viewportWidth / gridCellSize);
        const rows = Math.ceil(viewportHeight / gridCellSize);
        
        // Clear existing grid
        rainbowGrid.innerHTML = '';
        cellsArray = [];
        
        // Create grid cells
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                
                // Position cell at grid coordinates with centering offset
                const offsetX = (gridCellSize - gridCellVisualSize) / 2;
                const offsetY = (gridCellSize - gridCellVisualSize) / 2;
                
                cell.style.left = `${col * gridCellSize + offsetX}px`;
                cell.style.top = `${row * gridCellSize + offsetY}px`;
                
                rainbowGrid.appendChild(cell);
                
                // Store cell reference with its position
                cellsArray.push({
                    element: cell,
                    row: row,
                    col: col,
                    x: col * gridCellSize + offsetX,
                    y: row * gridCellSize + offsetY
                });
            }
        }
    }
    
    // Generate random rainbow color
    function getRandomRainbowColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 80%, 65%)`;
    }
    
    // Handle mouse movement
    function handleMouseMove(e) {
        if (!isRainbowActive) return;
        
        const mouseX = e.clientX;
        const mouseY = e.clientY;
        
        // Calculate distances and update colors for cells around mouse
        cellsArray.forEach(cell => {
            const dx = mouseX - (cell.x + gridCellVisualSize / 2);
            const dy = mouseY - (cell.y + gridCellVisualSize / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only affect cells within certain radius
            const maxDistance = 150;
            if (distance < maxDistance) {
                const opacity = 1 - (distance / maxDistance);
                cell.element.style.opacity = opacity;
                cell.element.style.backgroundColor = getRandomRainbowColor();
                
                // Reset cell opacity after some time
                setTimeout(() => {
                    cell.element.style.opacity = 0;
                }, 2000);
            }
        });
        
        // Throttle mouse movement calculations for performance
        clearTimeout(mouseMoveTimeout);
        mouseMoveTimeout = setTimeout(() => {
            // Optional: add additional effects here if needed
        }, 50);
    }
    
    // Toggle rainbow mode
    function toggleRainbowMode() {
        isRainbowActive = rainbowToggle.checked;
        
        if (isRainbowActive) {
            rainbowGrid.style.opacity = 1;
            document.addEventListener('mousemove', handleMouseMove);
        } else {
            rainbowGrid.style.opacity = 0;
            document.removeEventListener('mousemove', handleMouseMove);
            
            // Reset all cells
            cellsArray.forEach(cell => {
                cell.element.style.opacity = 0;
            });
        }
    }
    
    // Event listeners
    rainbowToggle.addEventListener('change', toggleRainbowMode);
    
    // Initialize and handle window resizing
    initGrid();
    window.addEventListener('resize', initGrid);
    
    // Check if the toggle is initially checked from localStorage or other source
    // For example, you could use: rainbowToggle.checked = localStorage.getItem('rainbowMode') === 'true';
    // And then call toggleRainbowMode();
});
