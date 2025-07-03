/**
 * Interactive Periodic Table
 */

document.addEventListener('DOMContentLoaded', () => {
    initPeriodicTable();
});

function initPeriodicTable() {
    const periodicTableGrid = document.querySelector('.periodic-table-grid');
    const atomCanvas = document.getElementById('atom-canvas');
    const ctx = atomCanvas.getContext('2d');
    
    // Canvas dimensions
    const canvasWidth = atomCanvas.width;
    const canvasHeight = atomCanvas.height;
    
    // Current selected element
    let selectedElement = null;
    
    // Animation properties
    let electrons = [];
    let animationFrame;
    let lastFrameTime = 0;
    
    // Generate the periodic table
    generatePeriodicTable();
    
    // Draw empty atom visualization
    drawAtom(null);
    
    /**
     * Generate the periodic table grid with all elements
     */
    function generatePeriodicTable() {
        // Clear the grid
        periodicTableGrid.innerHTML = '';
        
        // Add each element to the grid
        elementsData.forEach(element => {
            // Create element div
            const elementDiv = document.createElement('div');
            elementDiv.className = `element ${element.category.replace(/\s+/g, '-').toLowerCase()}`;
            elementDiv.style.gridColumn = element.position.column;
            elementDiv.style.gridRow = element.position.row;
            elementDiv.style.color = getCategoryColor(element.category);
            
            // Add element content
            elementDiv.innerHTML = `
                <div class="element-atomic-number">${element.atomicNumber}</div>
                <div class="element-symbol">${element.symbol}</div>
                <div class="element-name">${element.name}</div>
            `;
            
            // Add click event
            elementDiv.addEventListener('click', () => {
                showElementDetails(element);
                
                // Add active class to selected element
                document.querySelectorAll('.element').forEach(el => {
                    el.classList.remove('active');
                });
                elementDiv.classList.add('active');
            });
            
            // Add hover effect with glow
            elementDiv.addEventListener('mouseover', () => {
                elementDiv.style.boxShadow = `0 0 15px ${getCategoryColor(element.category)}`;
                elementDiv.style.transform = 'scale(1.08)';
                elementDiv.style.zIndex = '10';
            });
            
            elementDiv.addEventListener('mouseout', () => {
                if (selectedElement !== element) {
                    elementDiv.style.boxShadow = 'none';
                    elementDiv.style.transform = 'scale(1)';
                    elementDiv.style.zIndex = '1';
                }
            });
            
            // Add to grid
            periodicTableGrid.appendChild(elementDiv);
        });
    }
    
    /**
     * Show element details when clicked
     */
    function showElementDetails(element) {
        selectedElement = element;
        
        // Update the details panel
        document.querySelector('.element-symbol-large').textContent = element.symbol;
        document.querySelector('.element-symbol-large').style.color = getCategoryColor(element.category);
        document.querySelector('.element-symbol-large').style.textShadow = `0 0 10px ${getCategoryColor(element.category)}`;
        document.querySelector('.element-name-large').textContent = element.name;
        document.getElementById('atomic-number').textContent = element.atomicNumber;
        document.getElementById('atomic-mass').textContent = element.atomicMass;
        document.getElementById('category').textContent = element.category;
        document.getElementById('state').textContent = element.state;
        document.getElementById('electron-config').textContent = element.electronConfiguration;
        
        // Draw atom visualization
        drawAtom(element);
    }
    
    /**
     * Draw atom visualization
     */
    function drawAtom(element) {
        // Cancel any existing animation
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
        
        // Clear the electrons array
        electrons = [];
        
        // If no element selected, draw nothing
        if (!element) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            
            // Draw instruction text
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.textAlign = 'center';
            ctx.font = '14px "Press Start 2P", cursive';
            ctx.fillText('Select an element', canvasWidth/2, canvasHeight/2);
            return;
        }
        
        // Parse electron configuration to get electrons per shell
        const electronShells = parseElectronConfiguration(element.electronConfiguration);
        
        // Create electrons for animation
        createElectrons(electronShells);
        
        // Start animation
        lastFrameTime = performance.now();
        animateAtom();
    }
    
    /**
     * Parse electron configuration to get number of electrons per shell
     */
    function parseElectronConfiguration(config) {
        // Simple parsing for common format
        const shells = [0, 0, 0, 0, 0, 0, 0];
        
        // Count electrons in each shell based on notation
        const parts = config.split(' ');
        parts.forEach(part => {
            if (part.includes('s') || part.includes('p') || part.includes('d') || part.includes('f')) {
                const shellNum = parseInt(part[0]) - 1;
                const electronNum = parseInt(part.match(/\d+$/)[0] || '0');
                if (shellNum >= 0 && shellNum < shells.length) {
                    shells[shellNum] += electronNum;
                }
            }
        });
        
        // Return only shells with electrons
        return shells.filter(count => count > 0);
    }
    
    /**
     * Create electrons for each shell
     */
    function createElectrons(shells) {
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        const maxShells = shells.length;
        const maxRadius = Math.min(canvasWidth, canvasHeight) * 0.4;
        
        // Create electrons for each shell
        shells.forEach((electronCount, shellIndex) => {
            const radius = 15 + (shellIndex + 1) * (maxRadius / (maxShells + 1));
            
            // Limit visible electrons to 12 per shell for performance and clarity
            const visibleElectrons = Math.min(electronCount, 12);
            
            for (let i = 0; i < visibleElectrons; i++) {
                // Distribute electrons evenly around shell
                const angle = (i / visibleElectrons) * Math.PI * 2;
                // Speed decreases with larger shells
                const speedFactor = 1.2 - (shellIndex / maxShells) * 0.8;
                // Direction alternates between shells for visual interest
                const direction = shellIndex % 2 === 0 ? 1 : -1;
                
                electrons.push({
                    shell: shellIndex,
                    radius,
                    angle,
                    speed: 0.001 * speedFactor * direction,
                    x: centerX + radius * Math.cos(angle),
                    y: centerY + radius * Math.sin(angle),
                    color: getElectronColor(shellIndex),
                    size: 4 - shellIndex * 0.3, // Electrons in outer shells appear smaller
                    opacity: 1.0
                });
            }
        });
    }
    
    /**
     * Animate the atom visualization with time-based animation
     */
    function animateAtom() {
        const currentTime = performance.now();
        const deltaTime = currentTime - lastFrameTime;
        lastFrameTime = currentTime;
        
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;
        
        // Clear canvas with slight motion blur effect for smoother animation
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        
        // Draw nucleus
        const nucleusRadius = 12;
        const nucleusGlow = 8 + Math.sin(currentTime * 0.002) * 3; // Pulsing effect
        
        // Draw nucleus glow
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, nucleusRadius + nucleusGlow
        );
        gradient.addColorStop(0, '#ff00ff');
        gradient.addColorStop(0.7, 'rgba(255, 0, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 0, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, nucleusRadius + nucleusGlow, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Draw solid nucleus
        ctx.beginPath();
        ctx.arc(centerX, centerY, nucleusRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ff00ff';
        ctx.fill();
        
        // Draw electron shells
        const uniqueShells = [...new Set(electrons.map(e => e.shell))];
        uniqueShells.forEach(shellIndex => {
            ctx.beginPath();
            ctx.arc(centerX, centerY, electrons.find(e => e.shell === shellIndex).radius, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        
        // Update and draw electrons
        electrons.forEach(electron => {
            // Update position based on deltaTime for smooth animation
            electron.angle += electron.speed * deltaTime;
            electron.x = centerX + electron.radius * Math.cos(electron.angle);
            electron.y = centerY + electron.radius * Math.sin(electron.angle);
            
            // Add slight oscillation to electron radius for visual interest
            const radiusVariation = Math.sin(currentTime * 0.003 + electron.angle * 3) * 2;
            const drawRadius = electron.radius + radiusVariation;
            
            // Draw electron trail (motion blur effect)
            ctx.beginPath();
            const trailLength = 0.3; // Length of the trail in radians
            ctx.arc(centerX, centerY, drawRadius, electron.angle - trailLength, electron.angle);
            ctx.strokeStyle = `rgba(${hexToRgb(electron.color)}, 0.3)`;
            ctx.lineWidth = electron.size * 0.7;
            ctx.stroke();
            
            // Draw electron
            ctx.beginPath();
            ctx.arc(electron.x, electron.y, electron.size, 0, Math.PI * 2);
            ctx.fillStyle = electron.color;
            ctx.fill();
            
            // Draw electron glow
            const electronGlow = ctx.createRadialGradient(
                electron.x, electron.y, 0,
                electron.x, electron.y, electron.size * 2
            );
            electronGlow.addColorStop(0, electron.color);
            electronGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            
            ctx.beginPath();
            ctx.arc(electron.x, electron.y, electron.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = electronGlow;
            ctx.fill();
        });
        
        // Continue animation
        animationFrame = requestAnimationFrame(animateAtom);
    }
    
    /**
     * Get category color based on element category
     */
    function getCategoryColor(category) {
        const categoryColors = {
            'Alkali Metal': '#ff0000',
            'Alkaline Earth Metal': '#ff8800',
            'Transition Metal': '#ffcc00',
            'Post-transition Metal': '#88cc00',
            'Metalloid': '#00cc00',
            'Nonmetal': '#00ccaa',
            'Halogen': '#00aaff',
            'Noble Gas': '#0066ff',
            'Lanthanide': '#cc00ff',
            'Actinide': '#ff00cc'
        };
        
        return categoryColors[category] || '#ffffff';
    }
    
    /**
     * Get electron color based on shell index
     */
    function getElectronColor(shellIndex) {
        const shellColors = [
            '#ffff00', // Yellow for 1st shell
            '#00ffff', // Cyan for 2nd shell
            '#00ff00', // Green for 3rd shell
            '#ff00ff', // Magenta for 4th shell
            '#ff8800', // Orange for 5th shell
            '#0088ff', // Blue for 6th shell
            '#ff0088'  // Pink for 7th shell
        ];
        
        return shellColors[shellIndex % shellColors.length];
    }
    
    /**
     * Convert hex color to RGB format
     */
    function hexToRgb(hex) {
        // Remove # if present
        hex = hex.replace('#', '');
        
        // Parse r, g, b values
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }
}

/**
 * Elements data with properties
 */
const elementsData = [
    { 
        atomicNumber: 1, 
        symbol: 'H', 
        name: 'Hydrogen', 
        atomicMass: '1.008', 
        category: 'Nonmetal', 
        state: 'Gas',
        electronConfiguration: '1s1',
        position: { row: 1, column: 1 }
    },
    { 
        atomicNumber: 2, 
        symbol: 'He', 
        name: 'Helium', 
        atomicMass: '4.0026', 
        category: 'Noble Gas', 
        state: 'Gas',
        electronConfiguration: '1s2',
        position: { row: 1, column: 18 }
    },
    { 
        atomicNumber: 3, 
        symbol: 'Li', 
        name: 'Lithium', 
        atomicMass: '6.94', 
        category: 'Alkali Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s1',
        position: { row: 2, column: 1 }
    },
    { 
        atomicNumber: 4, 
        symbol: 'Be', 
        name: 'Beryllium', 
        atomicMass: '9.0122', 
        category: 'Alkaline Earth Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2',
        position: { row: 2, column: 2 }
    },
    { 
        atomicNumber: 5, 
        symbol: 'B', 
        name: 'Boron', 
        atomicMass: '10.81', 
        category: 'Metalloid', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p1',
        position: { row: 2, column: 13 }
    },
    { 
        atomicNumber: 6, 
        symbol: 'C', 
        name: 'Carbon', 
        atomicMass: '12.011', 
        category: 'Nonmetal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p2',
        position: { row: 2, column: 14 }
    },
    { 
        atomicNumber: 7, 
        symbol: 'N', 
        name: 'Nitrogen', 
        atomicMass: '14.007', 
        category: 'Nonmetal', 
        state: 'Gas',
        electronConfiguration: '1s2 2s2 2p3',
        position: { row: 2, column: 15 }
    },
    { 
        atomicNumber: 8, 
        symbol: 'O', 
        name: 'Oxygen', 
        atomicMass: '15.999', 
        category: 'Nonmetal', 
        state: 'Gas',
        electronConfiguration: '1s2 2s2 2p4',
        position: { row: 2, column: 16 }
    },
    { 
        atomicNumber: 9, 
        symbol: 'F', 
        name: 'Fluorine', 
        atomicMass: '18.998', 
        category: 'Halogen', 
        state: 'Gas',
        electronConfiguration: '1s2 2s2 2p5',
        position: { row: 2, column: 17 }
    },
    { 
        atomicNumber: 10, 
        symbol: 'Ne', 
        name: 'Neon', 
        atomicMass: '20.180', 
        category: 'Noble Gas', 
        state: 'Gas',
        electronConfiguration: '1s2 2s2 2p6',
        position: { row: 2, column: 18 }
    },
    { 
        atomicNumber: 11, 
        symbol: 'Na', 
        name: 'Sodium', 
        atomicMass: '22.990', 
        category: 'Alkali Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s1',
        position: { row: 3, column: 1 }
    },
    { 
        atomicNumber: 12, 
        symbol: 'Mg', 
        name: 'Magnesium', 
        atomicMass: '24.305', 
        category: 'Alkaline Earth Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2',
        position: { row: 3, column: 2 }
    },
    { 
        atomicNumber: 13, 
        symbol: 'Al', 
        name: 'Aluminum', 
        atomicMass: '26.982', 
        category: 'Post-transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p1',
        position: { row: 3, column: 13 }
    },
    { 
        atomicNumber: 14, 
        symbol: 'Si', 
        name: 'Silicon', 
        atomicMass: '28.085', 
        category: 'Metalloid', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p2',
        position: { row: 3, column: 14 }
    },
    { 
        atomicNumber: 15, 
        symbol: 'P', 
        name: 'Phosphorus', 
        atomicMass: '30.974', 
        category: 'Nonmetal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p3',
        position: { row: 3, column: 15 }
    },
    { 
        atomicNumber: 16, 
        symbol: 'S', 
        name: 'Sulfur', 
        atomicMass: '32.06', 
        category: 'Nonmetal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p4',
        position: { row: 3, column: 16 }
    },
    { 
        atomicNumber: 17, 
        symbol: 'Cl', 
        name: 'Chlorine', 
        atomicMass: '35.45', 
        category: 'Halogen', 
        state: 'Gas',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p5',
        position: { row: 3, column: 17 }
    },
    { 
        atomicNumber: 18, 
        symbol: 'Ar', 
        name: 'Argon', 
        atomicMass: '39.948', 
        category: 'Noble Gas', 
        state: 'Gas',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6',
        position: { row: 3, column: 18 }
    },
    { 
        atomicNumber: 19, 
        symbol: 'K', 
        name: 'Potassium', 
        atomicMass: '39.098', 
        category: 'Alkali Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s1',
        position: { row: 4, column: 1 }
    },
    { 
        atomicNumber: 20, 
        symbol: 'Ca', 
        name: 'Calcium', 
        atomicMass: '40.078', 
        category: 'Alkaline Earth Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2',
        position: { row: 4, column: 2 }
    },
    { 
        atomicNumber: 21, 
        symbol: 'Sc', 
        name: 'Scandium', 
        atomicMass: '44.956', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d1',
        position: { row: 4, column: 3 }
    },
    { 
        atomicNumber: 22, 
        symbol: 'Ti', 
        name: 'Titanium', 
        atomicMass: '47.867', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d2',
        position: { row: 4, column: 4 }
    },
    { 
        atomicNumber: 23, 
        symbol: 'V', 
        name: 'Vanadium', 
        atomicMass: '50.942', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d3',
        position: { row: 4, column: 5 }
    },
    { 
        atomicNumber: 24, 
        symbol: 'Cr', 
        name: 'Chromium', 
        atomicMass: '51.996', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s1 3d5',
        position: { row: 4, column: 6 }
    },
    { 
        atomicNumber: 25, 
        symbol: 'Mn', 
        name: 'Manganese', 
        atomicMass: '54.938', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d5',
        position: { row: 4, column: 7 }
    },
    { 
        atomicNumber: 26, 
        symbol: 'Fe', 
        name: 'Iron', 
        atomicMass: '55.845', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d6',
        position: { row: 4, column: 8 }
    },
    { 
        atomicNumber: 27, 
        symbol: 'Co', 
        name: 'Cobalt', 
        atomicMass: '58.933', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d7',
        position: { row: 4, column: 9 }
    },
    { 
        atomicNumber: 28, 
        symbol: 'Ni', 
        name: 'Nickel', 
        atomicMass: '58.693', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d8',
        position: { row: 4, column: 10 }
    },
    { 
        atomicNumber: 29, 
        symbol: 'Cu', 
        name: 'Copper', 
        atomicMass: '63.546', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s1 3d10',
        position: { row: 4, column: 11 }
    },
    { 
        atomicNumber: 30, 
        symbol: 'Zn', 
        name: 'Zinc', 
        atomicMass: '65.38', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10',
        position: { row: 4, column: 12 }
    },
    { 
        atomicNumber: 31, 
        symbol: 'Ga', 
        name: 'Gallium', 
        atomicMass: '69.723', 
        category: 'Post-transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p1',
        position: { row: 4, column: 13 }
    },
    { 
        atomicNumber: 32, 
        symbol: 'Ge', 
        name: 'Germanium', 
        atomicMass: '72.63', 
        category: 'Metalloid', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p2',
        position: { row: 4, column: 14 }
    },
    { 
        atomicNumber: 33, 
        symbol: 'As', 
        name: 'Arsenic', 
        atomicMass: '74.922', 
        category: 'Metalloid', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p3',
        position: { row: 4, column: 15 }
    },
    { 
        atomicNumber: 34, 
        symbol: 'Se', 
        name: 'Selenium', 
        atomicMass: '78.971', 
        category: 'Nonmetal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p4',
        position: { row: 4, column: 16 }
    },
    { 
        atomicNumber: 35, 
        symbol: 'Br', 
        name: 'Bromine', 
        atomicMass: '79.904', 
        category: 'Halogen', 
        state: 'Liquid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p5',
        position: { row: 4, column: 17 }
    },
    { 
        atomicNumber: 36, 
        symbol: 'Kr', 
        name: 'Krypton', 
        atomicMass: '83.798', 
        category: 'Noble Gas', 
        state: 'Gas',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6',
        position: { row: 4, column: 18 }
    },
    { 
        atomicNumber: 37, 
        symbol: 'Rb', 
        name: 'Rubidium', 
        atomicMass: '85.468', 
        category: 'Alkali Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1',
        position: { row: 5, column: 1 }
    },
    { 
        atomicNumber: 38, 
        symbol: 'Sr', 
        name: 'Strontium', 
        atomicMass: '87.62', 
        category: 'Alkaline Earth Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2',
        position: { row: 5, column: 2 }
    },
    { 
        atomicNumber: 39, 
        symbol: 'Y', 
        name: 'Yttrium', 
        atomicMass: '88.906', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d1',
        position: { row: 5, column: 3 }
    },
    { 
        atomicNumber: 40, 
        symbol: 'Zr', 
        name: 'Zirconium', 
        atomicMass: '91.224', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d2',
        position: { row: 5, column: 4 }
    },
    { 
        atomicNumber: 41, 
        symbol: 'Nb', 
        name: 'Niobium', 
        atomicMass: '92.906', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d4',
        position: { row: 5, column: 5 }
    },
    { 
        atomicNumber: 42, 
        symbol: 'Mo', 
        name: 'Molybdenum', 
        atomicMass: '95.95', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d5',
        position: { row: 5, column: 6 }
    },
    { 
        atomicNumber: 43, 
        symbol: 'Tc', 
        name: 'Technetium', 
        atomicMass: '98', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d5',
        position: { row: 5, column: 7 }
    },
    { 
        atomicNumber: 44, 
        symbol: 'Ru', 
        name: 'Ruthenium', 
        atomicMass: '101.07', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d7',
        position: { row: 5, column: 8 }
    },
    { 
        atomicNumber: 45, 
        symbol: 'Rh', 
        name: 'Rhodium', 
        atomicMass: '102.91', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s1 4d8',
        position: { row: 5, column: 9 }
    },
    { 
        atomicNumber: 46, 
        symbol: 'Pd', 
        name: 'Palladium', 
        atomicMass: '106.42', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 4d10',
        position: { row: 5, column: 10 }
    },
    { 
        atomicNumber: 47, 
        symbol: 'Ag', 
        name: 'Silver', 
        atomicMass: '107.87', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10',
        position: { row: 5, column: 11 }
    },
    { 
        atomicNumber: 48, 
        symbol: 'Cd', 
        name: 'Cadmium', 
        atomicMass: '112.41', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10',
        position: { row: 5, column: 12 }
    },
    { 
        atomicNumber: 49, 
        symbol: 'In', 
        name: 'Indium', 
        atomicMass: '114.82', 
        category: 'Post-transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p1',
        position: { row: 5, column: 13 }
    },
    { 
        atomicNumber: 50, 
        symbol: 'Sn', 
        name: 'Tin', 
        atomicMass: '118.71', 
        category: 'Post-transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p2',
        position: { row: 5, column: 14 }
    },
    { 
        atomicNumber: 51, 
        symbol: 'Sb', 
        name: 'Antimony', 
        atomicMass: '121.76', 
        category: 'Metalloid', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p3',
        position: { row: 5, column: 15 }
    },
    { 
        atomicNumber: 52, 
        symbol: 'Te', 
        name: 'Tellurium', 
        atomicMass: '127.6', 
        category: 'Metalloid', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p4',
        position: { row: 5, column: 16 }
    },
    { 
        atomicNumber: 53, 
        symbol: 'I', 
        name: 'Iodine', 
        atomicMass: '126.9', 
        category: 'Halogen', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p5',
        position: { row: 5, column: 17 }
    },
    { 
        atomicNumber: 54, 
        symbol: 'Xe', 
        name: 'Xenon', 
        atomicMass: '131.29', 
        category: 'Noble Gas', 
        state: 'Gas',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6',
        position: { row: 5, column: 18 }
    },
    { 
        atomicNumber: 55, 
        symbol: 'Cs', 
        name: 'Cesium', 
        atomicMass: '132.91', 
        category: 'Alkali Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s1',
        position: { row: 6, column: 1 }
    },
    { 
        atomicNumber: 56, 
        symbol: 'Ba', 
        name: 'Barium', 
        atomicMass: '137.33', 
        category: 'Alkaline Earth Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2',
        position: { row: 6, column: 2 }
    },
    { 
        atomicNumber: 57, 
        symbol: 'La', 
        name: 'Lanthanum', 
        atomicMass: '138.91', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 5d1',
        position: { row: 8, column: 3 }
    },
    { 
        atomicNumber: 58, 
        symbol: 'Ce', 
        name: 'Cerium', 
        atomicMass: '140.12', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f1 5d1',
        position: { row: 8, column: 4 }
    },
    { 
        atomicNumber: 59, 
        symbol: 'Pr', 
        name: 'Praseodymium', 
        atomicMass: '140.91', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f3',
        position: { row: 8, column: 5 }
    },
    { 
        atomicNumber: 60, 
        symbol: 'Nd', 
        name: 'Neodymium', 
        atomicMass: '144.24', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f4',
        position: { row: 8, column: 6 }
    },
    { 
        atomicNumber: 61, 
        symbol: 'Pm', 
        name: 'Promethium', 
        atomicMass: '145', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f5',
        position: { row: 8, column: 7 }
    },
    { 
        atomicNumber: 62, 
        symbol: 'Sm', 
        name: 'Samarium', 
        atomicMass: '150.36', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f6',
        position: { row: 8, column: 8 }
    },
    { 
        atomicNumber: 63, 
        symbol: 'Eu', 
        name: 'Europium', 
        atomicMass: '151.96', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f7',
        position: { row: 8, column: 9 }
    },
    { 
        atomicNumber: 64, 
        symbol: 'Gd', 
        name: 'Gadolinium', 
        atomicMass: '157.25', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f7 5d1',
        position: { row: 8, column: 10 }
    },
    { 
        atomicNumber: 65, 
        symbol: 'Tb', 
        name: 'Terbium', 
        atomicMass: '158.93', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f9',
        position: { row: 8, column: 11 }
    },
    { 
        atomicNumber: 66, 
        symbol: 'Dy', 
        name: 'Dysprosium', 
        atomicMass: '162.50', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f10',
        position: { row: 8, column: 12 }
    },
    { 
        atomicNumber: 67, 
        symbol: 'Ho', 
        name: 'Holmium', 
        atomicMass: '164.93', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f11',
        position: { row: 8, column: 13 }
    },
    { 
        atomicNumber: 68, 
        symbol: 'Er', 
        name: 'Erbium', 
        atomicMass: '167.26', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f12',
        position: { row: 8, column: 14 }
    },
    { 
        atomicNumber: 69, 
        symbol: 'Tm', 
        name: 'Thulium', 
        atomicMass: '168.93', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f13',
        position: { row: 8, column: 15 }
    },
    { 
        atomicNumber: 70, 
        symbol: 'Yb', 
        name: 'Ytterbium', 
        atomicMass: '173.05', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14',
        position: { row: 8, column: 16 }
    },
    { 
        atomicNumber: 71, 
        symbol: 'Lu', 
        name: 'Lutetium', 
        atomicMass: '174.97', 
        category: 'Lanthanide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d1',
        position: { row: 8, column: 17 }
    },
    { 
        atomicNumber: 72, 
        symbol: 'Hf', 
        name: 'Hafnium', 
        atomicMass: '178.49', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d2',
        position: { row: 6, column: 4 }
    },
    { 
        atomicNumber: 73, 
        symbol: 'Ta', 
        name: 'Tantalum', 
        atomicMass: '180.95', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d3',
        position: { row: 6, column: 5 }
    },
    { 
        atomicNumber: 74, 
        symbol: 'W', 
        name: 'Tungsten', 
        atomicMass: '183.84', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d4',
        position: { row: 6, column: 6 }
    },
    { 
        atomicNumber: 75, 
        symbol: 'Re', 
        name: 'Rhenium', 
        atomicMass: '186.21', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d5',
        position: { row: 6, column: 7 }
    },
    { 
        atomicNumber: 76, 
        symbol: 'Os', 
        name: 'Osmium', 
        atomicMass: '190.23', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d6',
        position: { row: 6, column: 8 }
    },
    { 
        atomicNumber: 77, 
        symbol: 'Ir', 
        name: 'Iridium', 
        atomicMass: '192.22', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d7',
        position: { row: 6, column: 9 }
    },
    { 
        atomicNumber: 78, 
        symbol: 'Pt', 
        name: 'Platinum', 
        atomicMass: '195.08', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s1 4f14 5d9',
        position: { row: 6, column: 10 }
    },
    { 
        atomicNumber: 79, 
        symbol: 'Au', 
        name: 'Gold', 
        atomicMass: '196.97', 
        category: 'Transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10',
        position: { row: 6, column: 11 }
    },
    { 
        atomicNumber: 80, 
        symbol: 'Hg', 
        name: 'Mercury', 
        atomicMass: '200.59', 
        category: 'Transition Metal', 
        state: 'Liquid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10',
        position: { row: 6, column: 12 }
    },
    { 
        atomicNumber: 81, 
        symbol: 'Tl', 
        name: 'Thallium', 
        atomicMass: '204.38', 
        category: 'Post-transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p1',
        position: { row: 6, column: 13 }
    },
    { 
        atomicNumber: 82, 
        symbol: 'Pb', 
        name: 'Lead', 
        atomicMass: '207.2', 
        category: 'Post-transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p2',
        position: { row: 6, column: 14 }
    },
    { 
        atomicNumber: 83, 
        symbol: 'Bi', 
        name: 'Bismuth', 
        atomicMass: '208.98', 
        category: 'Post-transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p3',
        position: { row: 6, column: 15 }
    },
    { 
        atomicNumber: 84, 
        symbol: 'Po', 
        name: 'Polonium', 
        atomicMass: '209', 
        category: 'Post-transition Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p4',
        position: { row: 6, column: 16 }
    },
    { 
        atomicNumber: 85, 
        symbol: 'At', 
        name: 'Astatine', 
        atomicMass: '210', 
        category: 'Halogen', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p5',
        position: { row: 6, column: 17 }
    },
    { 
        atomicNumber: 86, 
        symbol: 'Rn', 
        name: 'Radon', 
        atomicMass: '222', 
        category: 'Noble Gas', 
        state: 'Gas',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6',
        position: { row: 6, column: 18 }
    },
    { 
        atomicNumber: 87, 
        symbol: 'Fr', 
        name: 'Francium', 
        atomicMass: '223', 
        category: 'Alkali Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s1',
        position: { row: 7, column: 1 }
    },
    { 
        atomicNumber: 88, 
        symbol: 'Ra', 
        name: 'Radium', 
        atomicMass: '226', 
        category: 'Alkaline Earth Metal', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2',
        position: { row: 7, column: 2 }
    },
    { 
        atomicNumber: 89, 
        symbol: 'Ac', 
        name: 'Actinium', 
        atomicMass: '227', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 6d1',
        position: { row: 9, column: 3 }
    },
    { 
        atomicNumber: 90, 
        symbol: 'Th', 
        name: 'Thorium', 
        atomicMass: '232.04', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 6d2',
        position: { row: 9, column: 4 }
    },
    { 
        atomicNumber: 91, 
        symbol: 'Pa', 
        name: 'Protactinium', 
        atomicMass: '231.04', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f2 6d1',
        position: { row: 9, column: 5 }
    },
    { 
        atomicNumber: 92, 
        symbol: 'U', 
        name: 'Uranium', 
        atomicMass: '238.03', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f3 6d1',
        position: { row: 9, column: 6 }
    },
    { 
        atomicNumber: 93, 
        symbol: 'Np', 
        name: 'Neptunium', 
        atomicMass: '237', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f4 6d1',
        position: { row: 9, column: 7 }
    },
    { 
        atomicNumber: 94, 
        symbol: 'Pu', 
        name: 'Plutonium', 
        atomicMass: '244', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f6',
        position: { row: 9, column: 8 }
    },
    { 
        atomicNumber: 95, 
        symbol: 'Am', 
        name: 'Americium', 
        atomicMass: '243', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f7',
        position: { row: 9, column: 9 }
    },
    { 
        atomicNumber: 96, 
        symbol: 'Cm', 
        name: 'Curium', 
        atomicMass: '247', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f7 6d1',
        position: { row: 9, column: 10 }
    },
    { 
        atomicNumber: 97, 
        symbol: 'Bk', 
        name: 'Berkelium', 
        atomicMass: '247', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f9',
        position: { row: 9, column: 11 }
    },
    { 
        atomicNumber: 98, 
        symbol: 'Cf', 
        name: 'Californium', 
        atomicMass: '251', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f10',
        position: { row: 9, column: 12 }
    },
    { 
        atomicNumber: 99, 
        symbol: 'Es', 
        name: 'Einsteinium', 
        atomicMass: '252', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f11',
        position: { row: 9, column: 13 }
    },
    { 
        atomicNumber: 100, 
        symbol: 'Fm', 
        name: 'Fermium', 
        atomicMass: '257', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f12',
        position: { row: 9, column: 14 }
    },
    { 
        atomicNumber: 101, 
        symbol: 'Md', 
        name: 'Mendelevium', 
        atomicMass: '258', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f13',
        position: { row: 9, column: 15 }
    },
    { 
        atomicNumber: 102, 
        symbol: 'No', 
        name: 'Nobelium', 
        atomicMass: '259', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14',
        position: { row: 9, column: 16 }
    },
    { 
        atomicNumber: 103, 
        symbol: 'Lr', 
        name: 'Lawrencium', 
        atomicMass: '266', 
        category: 'Actinide', 
        state: 'Solid',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 7p1',
        position: { row: 9, column: 17 }
    },
    { 
        atomicNumber: 104, 
        symbol: 'Rf', 
        name: 'Rutherfordium', 
        atomicMass: '267', 
        category: 'Transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d2',
        position: { row: 7, column: 4 }
    },
    { 
        atomicNumber: 105, 
        symbol: 'Db', 
        name: 'Dubnium', 
        atomicMass: '268', 
        category: 'Transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d3',
        position: { row: 7, column: 5 }
    },
    { 
        atomicNumber: 106, 
        symbol: 'Sg', 
        name: 'Seaborgium', 
        atomicMass: '269', 
        category: 'Transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d4',
        position: { row: 7, column: 6 }
    },
    { 
        atomicNumber: 107, 
        symbol: 'Bh', 
        name: 'Bohrium', 
        atomicMass: '270', 
        category: 'Transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d5',
        position: { row: 7, column: 7 }
    },
    { 
        atomicNumber: 108, 
        symbol: 'Hs', 
        name: 'Hassium', 
        atomicMass: '277', 
        category: 'Transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d6',
        position: { row: 7, column: 8 }
    },
    { 
        atomicNumber: 109, 
        symbol: 'Mt', 
        name: 'Meitnerium', 
        atomicMass: '278', 
        category: 'Transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d7',
        position: { row: 7, column: 9 }
    },
    { 
        atomicNumber: 110, 
        symbol: 'Ds', 
        name: 'Darmstadtium', 
        atomicMass: '281', 
        category: 'Transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d8',
        position: { row: 7, column: 10 }
    },
    { 
        atomicNumber: 111, 
        symbol: 'Rg', 
        name: 'Roentgenium', 
        atomicMass: '282', 
        category: 'Transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d9',
        position: { row: 7, column: 11 }
    },
    { 
        atomicNumber: 112, 
        symbol: 'Cn', 
        name: 'Copernicium', 
        atomicMass: '285', 
        category: 'Transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10',
        position: { row: 7, column: 12 }
    },
    { 
        atomicNumber: 113, 
        symbol: 'Nh', 
        name: 'Nihonium', 
        atomicMass: '286', 
        category: 'Post-transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p1',
        position: { row: 7, column: 13 }
    },
    { 
        atomicNumber: 114, 
        symbol: 'Fl', 
        name: 'Flerovium', 
        atomicMass: '289', 
        category: 'Post-transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p2',
        position: { row: 7, column: 14 }
    },
    { 
        atomicNumber: 115, 
        symbol: 'Mc', 
        name: 'Moscovium', 
        atomicMass: '290', 
        category: 'Post-transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p3',
        position: { row: 7, column: 15 }
    },
    { 
        atomicNumber: 116, 
        symbol: 'Lv', 
        name: 'Livermorium', 
        atomicMass: '293', 
        category: 'Post-transition Metal', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p4',
        position: { row: 7, column: 16 }
    },
    { 
        atomicNumber: 117, 
        symbol: 'Ts', 
        name: 'Tennessine', 
        atomicMass: '294', 
        category: 'Halogen', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p5',
        position: { row: 7, column: 17 }
    },
    { 
        atomicNumber: 118, 
        symbol: 'Og', 
        name: 'Oganesson', 
        atomicMass: '294', 
        category: 'Noble Gas', 
        state: 'Synthetic',
        electronConfiguration: '1s2 2s2 2p6 3s2 3p6 4s2 3d10 4p6 5s2 4d10 5p6 6s2 4f14 5d10 6p6 7s2 5f14 6d10 7p6',
        position: { row: 7, column: 18 }
    }
]; 