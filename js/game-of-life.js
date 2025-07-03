// Conway's Game of Life
class GameOfLife {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.populationChart = null;
        this.chartCtx = null;
        this.grid = [];
        this.nextGrid = [];
        this.rows = 30;
        this.cols = 50;
        this.cellSize = 0;
        this.isRunning = false;
        this.animationId = null;
        this.generation = 0;
        this.population = 0;
        this.maxPopulation = 0;
        this.speed = 200;
        this.populationHistory = [];
        this.isDarkTheme = false;
        
        this.init();
    }
    
    init() {
        this.canvas = document.getElementById('gol-canvas');
        this.populationChart = document.getElementById('population-chart');
        
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.chartCtx = this.populationChart ? this.populationChart.getContext('2d') : null;
        
        this.setupEventListeners();
        this.initializeGrid();
        this.updateCellSize();
        this.render();
        this.updateStats();
    }
    
    setupEventListeners() {
        // Control buttons
        const startBtn = document.getElementById('gol-start');
        const pauseBtn = document.getElementById('gol-pause');
        const stepBtn = document.getElementById('gol-step');
        const clearBtn = document.getElementById('gol-clear');
        const resetBtn = document.getElementById('gol-reset');
        const helpToggle = document.getElementById('gol-help-toggle');
        const themeToggle = document.getElementById('gol-theme-toggle');
        const closeHelp = document.getElementById('close-help');
        
        // Controls
        const speedSlider = document.getElementById('gol-speed');
        const speedDisplay = document.getElementById('gol-speed-display');
        const gridSizeSelect = document.getElementById('grid-size');
        const patternSelect = document.getElementById('pattern-select');
        const applyPatternBtn = document.getElementById('apply-pattern');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => this.start());
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => this.pause());
        }
        
        if (stepBtn) {
            stepBtn.addEventListener('click', () => this.step());
        }
        
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clear());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.reset());
        }
        
        if (helpToggle) {
            helpToggle.addEventListener('click', () => this.toggleHelp());
        }
        
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        if (closeHelp) {
            closeHelp.addEventListener('click', () => this.closeHelp());
        }
        
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.speed = parseInt(e.target.value);
                if (speedDisplay) speedDisplay.textContent = `${this.speed}ms`;
            });
        }
        
        if (gridSizeSelect) {
            gridSizeSelect.addEventListener('change', (e) => {
                const [cols, rows] = e.target.value.split('x').map(Number);
                this.resizeGrid(cols, rows);
            });
        }
        
        if (applyPatternBtn) {
            applyPatternBtn.addEventListener('click', () => {
                const pattern = patternSelect ? patternSelect.value : 'random';
                this.applyPattern(pattern);
            });
        }
        
        // Canvas click events
        if (this.canvas) {
            this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
        }
        
        // Window resize
        window.addEventListener('resize', () => this.updateCellSize());
    }
    
    initializeGrid() {
        this.grid = [];
        this.nextGrid = [];
        
        for (let i = 0; i < this.rows; i++) {
            this.grid[i] = [];
            this.nextGrid[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = false;
                this.nextGrid[i][j] = false;
            }
        }
    }
    
    updateCellSize() {
        if (!this.canvas) return;
        
        const maxWidth = Math.min(800, window.innerWidth - 100);
        const maxHeight = Math.min(480, window.innerHeight - 300);
        
        this.cellSize = Math.min(
            Math.floor(maxWidth / this.cols),
            Math.floor(maxHeight / this.rows)
        );
        
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
    }
    
    resizeGrid(newCols, newRows) {
        this.cols = newCols;
        this.rows = newRows;
        this.initializeGrid();
        this.updateCellSize();
        this.render();
        this.reset();
    }
    
    handleCanvasClick(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.grid[row][col] = !this.grid[row][col];
            this.render();
            this.updateStats();
        }
    }
    
    handleCanvasHover(e) {
        if (!this.canvas) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
    
    countNeighbors(row, col) {
        let count = 0;
        
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < this.rows && 
                    newCol >= 0 && newCol < this.cols && 
                    this.grid[newRow][newCol]) {
                    count++;
                }
            }
        }
        
        return count;
    }
    
    step() {
        // Apply Conway's Game of Life rules
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const neighbors = this.countNeighbors(i, j);
                const currentCell = this.grid[i][j];
                
                if (currentCell) {
                    // Live cell
                    this.nextGrid[i][j] = neighbors === 2 || neighbors === 3;
                } else {
                    // Dead cell
                    this.nextGrid[i][j] = neighbors === 3;
                }
            }
        }
        
        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
        
        this.generation++;
        this.updateStats();
        this.render();
        this.updateChart();
    }
    
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateButtons();
        
        const gameLoop = () => {
            if (!this.isRunning) return;
            
            this.step();
            setTimeout(() => {
                this.animationId = requestAnimationFrame(gameLoop);
            }, this.speed);
        };
        
        this.animationId = requestAnimationFrame(gameLoop);
    }
    
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.updateButtons();
    }
    
    clear() {
        this.initializeGrid();
        this.render();
        this.reset();
    }
    
    reset() {
        this.pause();
        this.generation = 0;
        this.population = 0;
        this.maxPopulation = 0;
        this.populationHistory = [];
        this.updateStats();
        this.updateChart();
        this.updateButtons();
    }
    
    updateButtons() {
        const startBtn = document.getElementById('gol-start');
        const pauseBtn = document.getElementById('gol-pause');
        const stepBtn = document.getElementById('gol-step');
        
        if (startBtn) startBtn.disabled = this.isRunning;
        if (pauseBtn) pauseBtn.disabled = !this.isRunning;
        if (stepBtn) stepBtn.disabled = this.isRunning;
    }
    
    updateStats() {
        this.population = 0;
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.grid[i][j]) this.population++;
            }
        }
        
        this.maxPopulation = Math.max(this.maxPopulation, this.population);
        
        const genDisplay = document.getElementById('generation-count');
        const popDisplay = document.getElementById('population-count');
        const maxPopDisplay = document.getElementById('max-population');
        
        if (genDisplay) genDisplay.textContent = this.generation;
        if (popDisplay) popDisplay.textContent = this.population;
        if (maxPopDisplay) maxPopDisplay.textContent = this.maxPopulation;
        
        // Add to history
        this.populationHistory.push(this.population);
        if (this.populationHistory.length > 100) {
            this.populationHistory.shift();
        }
    }
    
    render() {
        if (!this.ctx) return;
        
        // Clear canvas
        this.ctx.fillStyle = this.isDarkTheme ? '#000' : '#fff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid lines
        this.ctx.strokeStyle = this.isDarkTheme ? '#333' : '#ddd';
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= this.rows; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.cellSize);
            this.ctx.lineTo(this.canvas.width, i * this.cellSize);
            this.ctx.stroke();
        }
        
        for (let j = 0; j <= this.cols; j++) {
            this.ctx.beginPath();
            this.ctx.moveTo(j * this.cellSize, 0);
            this.ctx.lineTo(j * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        // Draw live cells
        this.ctx.fillStyle = this.isDarkTheme ? '#00d4ff' : '#00a0cc';
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.grid[i][j]) {
                    this.ctx.fillRect(
                        j * this.cellSize + 1,
                        i * this.cellSize + 1,
                        this.cellSize - 2,
                        this.cellSize - 2
                    );
                }
            }
        }
    }
    
    updateChart() {
        if (!this.chartCtx || this.populationHistory.length === 0) return;
        
        const width = this.populationChart.width;
        const height = this.populationChart.height;
        
        // Clear chart
        this.chartCtx.fillStyle = this.isDarkTheme ? '#1a1a2e' : '#f0f0f0';
        this.chartCtx.fillRect(0, 0, width, height);
        
        // Draw axes
        this.chartCtx.strokeStyle = this.isDarkTheme ? '#555' : '#999';
        this.chartCtx.lineWidth = 1;
        
        // Y-axis
        this.chartCtx.beginPath();
        this.chartCtx.moveTo(30, 10);
        this.chartCtx.lineTo(30, height - 20);
        this.chartCtx.stroke();
        
        // X-axis
        this.chartCtx.beginPath();
        this.chartCtx.moveTo(30, height - 20);
        this.chartCtx.lineTo(width - 10, height - 20);
        this.chartCtx.stroke();
        
        if (this.populationHistory.length < 2) return;
        
        // Draw population line
        const maxPop = Math.max(...this.populationHistory, 1);
        const chartWidth = width - 40;
        const chartHeight = height - 30;
        
        this.chartCtx.strokeStyle = this.isDarkTheme ? '#00d4ff' : '#00a0cc';
        this.chartCtx.lineWidth = 2;
        this.chartCtx.beginPath();
        
        this.populationHistory.forEach((pop, index) => {
            const x = 30 + (index / (this.populationHistory.length - 1)) * chartWidth;
            const y = height - 20 - (pop / maxPop) * chartHeight;
            
            if (index === 0) {
                this.chartCtx.moveTo(x, y);
            } else {
                this.chartCtx.lineTo(x, y);
            }
        });
        
        this.chartCtx.stroke();
        
        // Draw labels
        this.chartCtx.fillStyle = this.isDarkTheme ? '#00d4ff' : '#333';
        this.chartCtx.font = '10px Arial';
        this.chartCtx.fillText('0', 5, height - 15);
        this.chartCtx.fillText(maxPop.toString(), 5, 15);
    }
    
    applyPattern(pattern) {
        this.clear();
        
        const centerRow = Math.floor(this.rows / 2);
        const centerCol = Math.floor(this.cols / 2);
        
        switch (pattern) {
            case 'random':
                for (let i = 0; i < this.rows; i++) {
                    for (let j = 0; j < this.cols; j++) {
                        this.grid[i][j] = Math.random() < 0.3;
                    }
                }
                break;
                
            case 'glider':
                const glider = [
                    [0, 1, 0],
                    [0, 0, 1],
                    [1, 1, 1]
                ];
                this.placePattern(glider, centerRow - 1, centerCol - 1);
                break;
                
            case 'blinker':
                const blinker = [
                    [1, 1, 1]
                ];
                this.placePattern(blinker, centerRow, centerCol - 1);
                break;
                
            case 'toad':
                const toad = [
                    [0, 1, 1, 1],
                    [1, 1, 1, 0]
                ];
                this.placePattern(toad, centerRow, centerCol - 2);
                break;
                
            case 'beacon':
                const beacon = [
                    [1, 1, 0, 0],
                    [1, 1, 0, 0],
                    [0, 0, 1, 1],
                    [0, 0, 1, 1]
                ];
                this.placePattern(beacon, centerRow - 2, centerCol - 2);
                break;
                
            case 'clear':
                // Already cleared
                break;
        }
        
        this.render();
        this.updateStats();
    }
    
    placePattern(pattern, startRow, startCol) {
        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[i].length; j++) {
                const row = startRow + i;
                const col = startCol + j;
                
                if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                    this.grid[row][col] = pattern[i][j] === 1;
                }
            }
        }
    }
    
    toggleHelp() {
        const help = document.getElementById('gol-help-modal');
        if (help) {
            help.style.display = help.style.display === 'none' ? 'block' : 'none';
        }
    }
    
    closeHelp() {
        const help = document.getElementById('gol-help-modal');
        if (help) {
            help.style.display = 'none';
        }
    }
    
    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        const themeToggle = document.getElementById('gol-theme-toggle');
        
        if (themeToggle) {
            themeToggle.textContent = this.isDarkTheme ? '☀️ Light' : '🌙 Dark';
        }
        
        this.render();
        this.updateChart();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on a page with game of life elements
    if (document.getElementById('gol-canvas')) {
        new GameOfLife();
    }
}); 