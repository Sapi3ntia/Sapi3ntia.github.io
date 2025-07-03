/**
 * Mini Arcade
 * A collection of simple JavaScript games
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const gameButtons = document.querySelectorAll('.game-button');
    const gameContainer = document.getElementById('game-container');
    const canvasContainer = document.getElementById('game-canvas-container');
    const backButton = document.getElementById('back-to-games');
    const currentGameTitle = document.getElementById('current-game-title');
    
    // Game state
    let currentGame = null;
    let gameCanvas = null;
    let gameInterval = null;
    
    // Initialize
    function init() {
        // Add event listeners to game buttons
        gameButtons.forEach(button => {
            button.addEventListener('click', () => {
                const gameId = button.id;
                loadGame(gameId);
            });
        });
        
        // Back button event listener
        backButton.addEventListener('click', () => {
            stopCurrentGame();
            gameContainer.classList.add('hidden');
        });
    }
    
    // Load a game
    function loadGame(gameId) {
        stopCurrentGame();
        
        // Clear canvas container
        canvasContainer.innerHTML = '';
        
        // Create new canvas
        gameCanvas = document.createElement('canvas');
        gameCanvas.width = 400;
        gameCanvas.height = 400;
        gameCanvas.style.display = 'block';
        gameCanvas.style.margin = '0 auto';
        gameCanvas.style.backgroundColor = '#000';
        gameCanvas.style.border = '2px solid var(--neon-blue)';
        gameCanvas.style.boxShadow = '0 0 10px var(--neon-blue)';
        canvasContainer.appendChild(gameCanvas);
        
        // Update UI
        gameContainer.classList.remove('hidden');
        
        // Start the selected game
        switch(gameId) {
            case 'snake-game':
                currentGameTitle.textContent = 'Snake';
                currentGame = new SnakeGame(gameCanvas);
                break;
            case 'pong-game':
                currentGameTitle.textContent = 'Pong';
                currentGame = new PongGame(gameCanvas);
                break;
            case 'memory-game':
                currentGameTitle.textContent = 'Memory';
                currentGame = new MemoryGame(gameCanvas);
                break;
            case 'tictactoe-game':
                currentGameTitle.textContent = 'Tic Tac Toe';
                currentGame = new TicTacToeGame(gameCanvas);
                break;
            case 'flappybird-game':
                currentGameTitle.textContent = 'Flappy Bird';
                currentGame = new FlappyBirdGame(gameCanvas);
                break;
            case '2048-game':
                currentGameTitle.textContent = '2048';
                currentGame = new Game2048(gameCanvas);
                break;
            case 'breakout-game':
                currentGameTitle.textContent = 'Breakout';
                currentGame = new BreakoutGame(gameCanvas);
                break;
            case 'space-race-game':
                currentGameTitle.textContent = 'Space Race';
                currentGame = new SpaceRaceGame(gameCanvas);
                break;
            case 'jet-fighter-game':
                currentGameTitle.textContent = 'Jet Fighter';
                currentGame = new JetFighterGame(gameCanvas);
                break;
            default:
                console.error('Unknown game:', gameId);
                return;
        }
        
        currentGame.start();
    }
    
    // Stop the current game
    function stopCurrentGame() {
        if (currentGame) {
            currentGame.stop();
            currentGame = null;
        }
        
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = null;
        }
    }
    
    /**
     * Snake Game Implementation
     */
    class SnakeGame {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.gridSize = 20;
            this.snake1 = [{ x: 5, y: 5 }];
            this.snake2 = [{ x: 15, y: 15 }];
            this.food = { x: 10, y: 10 };
            this.direction1 = 'right';
            this.nextDirection1 = 'right';
            this.direction2 = 'left';
            this.nextDirection2 = 'left';
            this.score1 = 0;
            this.score2 = 0;
            this.gameOver = false;
            this.interval = null;
            this.speed = 120; // milliseconds
            this.twoPlayerMode = false;
            
            // Create mode toggle button
            this.createModeToggle();
            
            // Bind key events
            this.handleKeyDown = this.handleKeyDown.bind(this);
        }
        
        createModeToggle() {
            // Create mode toggle container
            const toggleContainer = document.createElement('div');
            toggleContainer.style.marginBottom = '10px';
            toggleContainer.style.textAlign = 'center';
            
            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.textContent = '1-Player Mode';
            toggleButton.style.background = 'transparent';
            toggleButton.style.color = 'var(--neon-pink)';
            toggleButton.style.border = '1px solid var(--neon-pink)';
            toggleButton.style.padding = '5px 10px';
            toggleButton.style.borderRadius = '5px';
            toggleButton.style.fontFamily = '"Press Start 2P", cursive';
            toggleButton.style.fontSize = '0.7rem';
            toggleButton.style.cursor = 'pointer';
            
            // Add toggle button event listener
            toggleButton.addEventListener('click', () => {
                this.twoPlayerMode = !this.twoPlayerMode;
                toggleButton.textContent = this.twoPlayerMode ? '2-Player Mode' : '1-Player Mode';
                toggleButton.style.color = this.twoPlayerMode ? 'var(--neon-green)' : 'var(--neon-pink)';
                toggleButton.style.borderColor = this.twoPlayerMode ? 'var(--neon-green)' : 'var(--neon-pink)';
                
                // Reset game state when changing modes
                this.restart();
            });
            
            // Add toggle button to the container
            toggleContainer.appendChild(toggleButton);
            
            // Insert before canvas
            const canvasContainer = document.getElementById('game-canvas-container');
            canvasContainer.insertBefore(toggleContainer, this.canvas);
        }
        
        start() {
            this.placeFood();
            document.addEventListener('keydown', this.handleKeyDown);
            this.interval = setInterval(() => this.update(), this.speed);
        }
        
        stop() {
            document.removeEventListener('keydown', this.handleKeyDown);
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
        
        update() {
            if (this.gameOver) return;
            
            // Move snake 1
            this.moveSnake(this.snake1, this.direction1, this.nextDirection1);
            this.direction1 = this.nextDirection1;
            
            // In two-player mode, move snake 2 as well
            if (this.twoPlayerMode) {
                this.moveSnake(this.snake2, this.direction2, this.nextDirection2);
                this.direction2 = this.nextDirection2;
                
                // Check collision between snakes
                if (this.checkSnakeCollision(this.snake1, this.snake2)) {
                    this.gameOver = true;
                    this.winner = 'player2';
                }
                
                if (this.checkSnakeCollision(this.snake2, this.snake1)) {
                    this.gameOver = true;
                    this.winner = 'player1';
                }
            }
            
            // Check snake 1 collisions
            if (this.checkWallCollision(this.snake1) || this.checkSelfCollision(this.snake1)) {
                if (this.twoPlayerMode) {
                    this.gameOver = true;
                    this.winner = 'player2';
                } else {
                    this.handleGameOver();
                    return;
                }
            }
            
            // Check snake 2 collisions in two-player mode
            if (this.twoPlayerMode && (this.checkWallCollision(this.snake2) || this.checkSelfCollision(this.snake2))) {
                this.gameOver = true;
                this.winner = 'player1';
            }
            
            // Check if game is over in two-player mode
            if (this.twoPlayerMode && this.gameOver) {
                this.handleGameOver();
                return;
            }
            
            // Check if snake 1 ate food
            if (this.checkFood(this.snake1)) {
                this.score1 += 10;
                this.placeFood();
            } else {
                // Remove tail if food wasn't eaten
                this.snake1.pop();
            }
            
            // Check if snake 2 ate food (two-player mode)
            if (this.twoPlayerMode && this.checkFood(this.snake2)) {
                this.score2 += 10;
                this.placeFood();
            } else if (this.twoPlayerMode) {
                // Remove tail if food wasn't eaten
                this.snake2.pop();
            }
            
            // Draw everything
            this.draw();
        }
        
        moveSnake(snake, direction, nextDirection) {
            const head = { ...snake[0] };
            
            // Move head
            switch (direction) {
                case 'up':
                    head.y--;
                    break;
                case 'down':
                    head.y++;
                    break;
                case 'left':
                    head.x--;
                    break;
                case 'right':
                    head.x++;
                    break;
            }
            
            // Add new head
            snake.unshift(head);
        }
        
        checkWallCollision(snake) {
            const head = snake[0];
            return (
                head.x < 0 || 
                head.y < 0 || 
                head.x >= this.canvas.width / this.gridSize || 
                head.y >= this.canvas.height / this.gridSize
            );
        }
        
        checkSelfCollision(snake) {
            const head = snake[0];
            for (let i = 1; i < snake.length; i++) {
                if (head.x === snake[i].x && head.y === snake[i].y) {
                    return true;
                }
            }
            return false;
        }
        
        checkSnakeCollision(snake1, snake2) {
            const head = snake1[0];
            // Check if head of snake1 collides with any part of snake2
            for (let i = 0; i < snake2.length; i++) {
                if (head.x === snake2[i].x && head.y === snake2[i].y) {
                    return true;
                }
            }
            return false;
        }
        
        checkFood(snake) {
            const head = snake[0];
            return head.x === this.food.x && head.y === this.food.y;
        }
        
        placeFood() {
            const maxX = this.canvas.width / this.gridSize - 1;
            const maxY = this.canvas.height / this.gridSize - 1;
            
            let newFood;
            let validPosition;
            
            do {
                validPosition = true;
                newFood = {
                    x: Math.floor(Math.random() * maxX),
                    y: Math.floor(Math.random() * maxY)
                };
                
                // Check if food is on snake 1
                for (const segment of this.snake1) {
                    if (segment.x === newFood.x && segment.y === newFood.y) {
                        validPosition = false;
                        break;
                    }
                }
                
                // Check if food is on snake 2 in two-player mode
                if (validPosition && this.twoPlayerMode) {
                    for (const segment of this.snake2) {
                        if (segment.x === newFood.x && segment.y === newFood.y) {
                            validPosition = false;
                            break;
                        }
                    }
                }
                
            } while (!validPosition);
            
            this.food = newFood;
        }
        
        draw() {
            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
            this.ctx.lineWidth = 0.5;
            
            for (let x = 0; x < this.canvas.width; x += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
            
            for (let y = 0; y < this.canvas.height; y += this.gridSize) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
            
            // Draw snake 1
            this.ctx.fillStyle = '#00ff00';
            this.snake1.forEach((segment, index) => {
                if (index === 0) {
                    // Head with glow
                    this.ctx.shadowColor = '#00ff00';
                    this.ctx.shadowBlur = 10;
                } else {
                    this.ctx.shadowBlur = 0;
                }
                
                this.ctx.fillRect(
                    segment.x * this.gridSize,
                    segment.y * this.gridSize,
                    this.gridSize,
                    this.gridSize
                );
            });
            
            // Draw snake 2 in two-player mode
            if (this.twoPlayerMode) {
                this.ctx.fillStyle = '#00ffff';
                this.snake2.forEach((segment, index) => {
                    if (index === 0) {
                        // Head with glow
                        this.ctx.shadowColor = '#00ffff';
                        this.ctx.shadowBlur = 10;
                    } else {
                        this.ctx.shadowBlur = 0;
                    }
                    
                    this.ctx.fillRect(
                        segment.x * this.gridSize,
                        segment.y * this.gridSize,
                        this.gridSize,
                        this.gridSize
                    );
                });
            }
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Draw food
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.shadowColor = '#ff00ff';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(
                (this.food.x * this.gridSize) + (this.gridSize / 2),
                (this.food.y * this.gridSize) + (this.gridSize / 2),
                this.gridSize / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Draw scores
            if (this.twoPlayerMode) {
                // Player 1 score
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = '16px "Press Start 2P", cursive';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(`P1: ${this.score1}`, 10, 30);
                
                // Player 2 score
                this.ctx.fillStyle = '#00ffff';
                this.ctx.textAlign = 'right';
                this.ctx.fillText(`P2: ${this.score2}`, this.canvas.width - 10, 30);
                
                // Draw controls info
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.font = '8px "Press Start 2P", cursive';
                this.ctx.textAlign = 'left';
                this.ctx.fillText('P1: ↑/↓/←/→', 10, this.canvas.height - 20);
                this.ctx.textAlign = 'right';
                this.ctx.fillText('P2: W/S/A/D', this.canvas.width - 10, this.canvas.height - 20);
            } else {
                // Single player score
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '20px "Press Start 2P", cursive';
                this.ctx.textAlign = 'left';
                this.ctx.fillText(`Score: ${this.score1}`, 10, 30);
            }
        }
        
        handleKeyDown(e) {
            // Prevent default arrow key behavior to avoid page scrolling
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                e.key === 'ArrowLeft' || e.key === 'ArrowRight' || 
                e.key === 'w' || e.key === 's' || 
                e.key === 'a' || e.key === 'd' || 
                e.key === 'W' || e.key === 'S' || 
                e.key === 'A' || e.key === 'D') {
                e.preventDefault();
            }
            
            // Snake 1 controls (arrow keys)
            switch (e.key) {
                case 'ArrowUp':
                    if (this.direction1 !== 'down') {
                        this.nextDirection1 = 'up';
                    }
                    break;
                case 'ArrowDown':
                    if (this.direction1 !== 'up') {
                        this.nextDirection1 = 'down';
                    }
                    break;
                case 'ArrowLeft':
                    if (this.direction1 !== 'right') {
                        this.nextDirection1 = 'left';
                    }
                    break;
                case 'ArrowRight':
                    if (this.direction1 !== 'left') {
                        this.nextDirection1 = 'right';
                    }
                    break;
            }
            
            // Snake 2 controls (WASD keys) - only in two-player mode
            if (this.twoPlayerMode) {
                switch (e.key.toLowerCase()) {
                    case 'w':
                        if (this.direction2 !== 'down') {
                            this.nextDirection2 = 'up';
                        }
                        break;
                    case 's':
                        if (this.direction2 !== 'up') {
                            this.nextDirection2 = 'down';
                        }
                        break;
                    case 'a':
                        if (this.direction2 !== 'right') {
                            this.nextDirection2 = 'left';
                        }
                        break;
                    case 'd':
                        if (this.direction2 !== 'left') {
                            this.nextDirection2 = 'right';
                        }
                        break;
                }
            }
        }
        
        handleGameOver() {
            this.gameOver = true;
            
            // Draw game over text
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.font = '30px "Press Start 2P", cursive';
            this.ctx.textAlign = 'center';
            this.ctx.shadowColor = '#ff00ff';
            this.ctx.shadowBlur = 10;
            this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
            
            // Different messages for single-player and two-player modes
            if (this.twoPlayerMode) {
                this.ctx.fillStyle = (this.winner === 'player1') ? '#00ff00' : '#00ffff';
                this.ctx.shadowColor = (this.winner === 'player1') ? '#00ff00' : '#00ffff';
                this.ctx.font = '20px "Press Start 2P", cursive';
                this.ctx.fillText(
                    (this.winner === 'player1') ? 'Player 1 Wins!' : 'Player 2 Wins!',
                    this.canvas.width / 2,
                    this.canvas.height / 2 + 20
                );
                
                // Display scores
                this.ctx.font = '14px "Press Start 2P", cursive';
                this.ctx.fillText(
                    `P1: ${this.score1}  P2: ${this.score2}`,
                    this.canvas.width / 2,
                    this.canvas.height / 2 + 50
                );
            } else {
                this.ctx.fillStyle = '#00ffff';
                this.ctx.font = '20px "Press Start 2P", cursive';
                this.ctx.shadowColor = '#00ffff';
                this.ctx.fillText(`Score: ${this.score1}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
            }
            
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '12px "Press Start 2P", cursive';
            this.ctx.shadowBlur = 0;
            this.ctx.fillText('Click to restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
            
            // Add click listener for restart
            this.canvas.addEventListener('click', () => {
                if (this.gameOver) {
                    this.restart();
                }
            }, { once: true });
        }
        
        restart() {
            this.snake1 = [{ x: 5, y: 5 }];
            this.direction1 = 'right';
            this.nextDirection1 = 'right';
            this.score1 = 0;
            
            // Initialize snake 2 for two-player mode
            this.snake2 = [{ x: 15, y: 15 }];
            this.direction2 = 'left';
            this.nextDirection2 = 'left';
            this.score2 = 0;
            
            this.gameOver = false;
            this.winner = null;
            this.placeFood();
        }
    }
    
    /**
     * Pong Game Implementation
     */
    class PongGame {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.ballSize = 10;
            this.paddleWidth = 10;
            this.paddleHeight = 80;
            this.ball = {
                x: canvas.width / 2,
                y: canvas.height / 2,
                dx: 5,
                dy: 5
            };
            this.player1 = {
                y: canvas.height / 2 - this.paddleHeight / 2,
                score: 0
            };
            this.player2 = {
                y: canvas.height / 2 - this.paddleHeight / 2,
                score: 0,
                isComputer: true
            };
            this.keys = {
                ArrowUp: false,
                ArrowDown: false,
                w: false,
                s: false
            };
            this.interval = null;
            this.gameOver = false;
            this.twoPlayerMode = false;
            
            // Create mode toggle button
            this.createModeToggle();
            
            // Bind event handlers
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleKeyUp = this.handleKeyUp.bind(this);
        }
        
        createModeToggle() {
            // Create mode toggle container
            const toggleContainer = document.createElement('div');
            toggleContainer.style.marginBottom = '10px';
            toggleContainer.style.textAlign = 'center';
            
            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.textContent = '1-Player Mode';
            toggleButton.style.background = 'transparent';
            toggleButton.style.color = 'var(--neon-pink)';
            toggleButton.style.border = '1px solid var(--neon-pink)';
            toggleButton.style.padding = '5px 10px';
            toggleButton.style.borderRadius = '5px';
            toggleButton.style.fontFamily = '"Press Start 2P", cursive';
            toggleButton.style.fontSize = '0.7rem';
            toggleButton.style.cursor = 'pointer';
            
            // Add toggle button event listener
            toggleButton.addEventListener('click', () => {
                this.twoPlayerMode = !this.twoPlayerMode;
                this.player2.isComputer = !this.twoPlayerMode;
                toggleButton.textContent = this.twoPlayerMode ? '2-Player Mode' : '1-Player Mode';
                toggleButton.style.color = this.twoPlayerMode ? 'var(--neon-green)' : 'var(--neon-pink)';
                toggleButton.style.borderColor = this.twoPlayerMode ? 'var(--neon-green)' : 'var(--neon-pink)';
                
                // Reset game state when changing modes
                this.resetGame();
            });
            
            // Add toggle button to the container
            toggleContainer.appendChild(toggleButton);
            
            // Insert before canvas
            const canvasContainer = document.getElementById('game-canvas-container');
            canvasContainer.insertBefore(toggleContainer, this.canvas);
        }
        
        start() {
            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);
            this.interval = setInterval(() => this.update(), 1000 / 60); // 60 FPS
        }
        
        stop() {
            document.removeEventListener('keydown', this.handleKeyDown);
            document.removeEventListener('keyup', this.handleKeyUp);
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
        
        update() {
            if (this.gameOver) return;
            
            // Move player 1 paddle
            if (this.keys.ArrowUp) {
                this.player1.y = Math.max(0, this.player1.y - 7);
            }
            if (this.keys.ArrowDown) {
                this.player1.y = Math.min(this.canvas.height - this.paddleHeight, this.player1.y + 7);
            }
            
            // Move player 2 (computer or human)
            if (this.player2.isComputer) {
                // Computer AI
                const computerCenter = this.player2.y + this.paddleHeight / 2;
                const ballCenter = this.ball.y;
                
                if (computerCenter < ballCenter - 10) {
                    this.player2.y += 5;
                } else if (computerCenter > ballCenter + 10) {
                    this.player2.y -= 5;
                }
            } else {
                // Human player 2
                if (this.keys.w) {
                    this.player2.y = Math.max(0, this.player2.y - 7);
                }
                if (this.keys.s) {
                    this.player2.y = Math.min(this.canvas.height - this.paddleHeight, this.player2.y + 7);
                }
            }
            
            // Keep player2 paddle in bounds
            this.player2.y = Math.max(0, Math.min(this.canvas.height - this.paddleHeight, this.player2.y));
            
            // Move ball
            this.ball.x += this.ball.dx;
            this.ball.y += this.ball.dy;
            
            // Ball collision with top and bottom
            if (this.ball.y <= 0 || this.ball.y >= this.canvas.height - this.ballSize) {
                this.ball.dy = -this.ball.dy;
            }
            
            // Ball collision with paddles
            if (
                this.ball.x <= this.paddleWidth &&
                this.ball.y + this.ballSize >= this.player1.y &&
                this.ball.y <= this.player1.y + this.paddleHeight
            ) {
                this.ball.dx = -this.ball.dx;
                // Increase ball speed slightly
                this.ball.dx *= 1.05;
                this.ball.dy *= 1.05;
            }
            
            if (
                this.ball.x >= this.canvas.width - this.paddleWidth - this.ballSize &&
                this.ball.y + this.ballSize >= this.player2.y &&
                this.ball.y <= this.player2.y + this.paddleHeight
            ) {
                this.ball.dx = -this.ball.dx;
                // Increase ball speed slightly
                this.ball.dx *= 1.05;
                this.ball.dy *= 1.05;
            }
            
            // Ball out of bounds
            if (this.ball.x < 0) {
                // Player 2 scores
                this.player2.score++;
                this.resetBall();
            } else if (this.ball.x > this.canvas.width) {
                // Player 1 scores
                this.player1.score++;
                this.resetBall();
            }
            
            // Check if game over
            if (this.player1.score >= 5 || this.player2.score >= 5) {
                this.gameOver = true;
            }
            
            // Draw everything
            this.draw();
        }
        
        resetBall() {
            this.ball.x = this.canvas.width / 2;
            this.ball.y = this.canvas.height / 2;
            this.ball.dx = this.ball.dx > 0 ? 5 : -5;
            this.ball.dy = Math.random() > 0.5 ? 5 : -5;
        }
        
        resetGame() {
            this.ball = {
                x: this.canvas.width / 2,
                y: this.canvas.height / 2,
                dx: 5,
                dy: 5
            };
            this.player1.score = 0;
            this.player2.score = 0;
            this.player1.y = this.canvas.height / 2 - this.paddleHeight / 2;
            this.player2.y = this.canvas.height / 2 - this.paddleHeight / 2;
            this.gameOver = false;
        }
        
        draw() {
            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw center line
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            this.ctx.setLineDash([10, 10]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width / 2, 0);
            this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Draw paddles
            this.ctx.fillStyle = '#00ffff';
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 10;
            
            // Player 1 paddle
            this.ctx.fillRect(
                0,
                this.player1.y,
                this.paddleWidth,
                this.paddleHeight
            );
            
            // Player 2 paddle
            this.ctx.fillStyle = this.twoPlayerMode ? '#00ff00' : '#00ffff';
            this.ctx.shadowColor = this.twoPlayerMode ? '#00ff00' : '#00ffff';
            this.ctx.fillRect(
                this.canvas.width - this.paddleWidth,
                this.player2.y,
                this.paddleWidth,
                this.paddleHeight
            );
            
            // Draw ball
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.shadowColor = '#ff00ff';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(
                this.ball.x + this.ballSize / 2,
                this.ball.y + this.ballSize / 2,
                this.ballSize / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Draw scores
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px "Press Start 2P", cursive';
            this.ctx.textAlign = 'center';
            
            // Player 1 score
            this.ctx.fillStyle = '#00ffff';
            this.ctx.fillText(
                this.player1.score.toString(),
                this.canvas.width / 4,
                50
            );
            
            // Player 2 score
            this.ctx.fillStyle = this.twoPlayerMode ? '#00ff00' : '#00ffff';
            this.ctx.fillText(
                this.player2.score.toString(),
                (this.canvas.width / 4) * 3,
                50
            );
            
            // Draw controls info
            if (this.twoPlayerMode) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                this.ctx.font = '8px "Press Start 2P", cursive';
                this.ctx.fillText('P1: ↑/↓', 40, this.canvas.height - 20);
                this.ctx.fillText('P2: W/S', this.canvas.width - 40, this.canvas.height - 20);
            }
            
            // Draw game over if needed
            if (this.gameOver) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.font = '30px "Press Start 2P", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.shadowColor = '#ff00ff';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
                
                this.ctx.fillStyle = '#00ffff';
                this.ctx.font = '16px "Press Start 2P", cursive';
                this.ctx.shadowColor = '#00ffff';
                
                const winner = this.player1.score > this.player2.score 
                    ? (this.twoPlayerMode ? 'Player 1 Wins!' : 'You Win!') 
                    : (this.twoPlayerMode ? 'Player 2 Wins!' : 'Computer Wins!');
                    
                this.ctx.fillText(winner, this.canvas.width / 2, this.canvas.height / 2 + 20);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px "Press Start 2P", cursive';
                this.ctx.shadowBlur = 0;
                this.ctx.fillText('Click to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
                
                // Add click listener for restart
                this.canvas.addEventListener('click', () => {
                    if (this.gameOver) {
                        this.restart();
                    }
                }, { once: true });
            }
        }
        
        handleKeyDown(e) {
            // Prevent default scrolling behavior
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                e.key === 'w' || e.key === 's' || 
                e.key === 'W' || e.key === 'S') {
                e.preventDefault();
            }
            
            switch (e.key) {
                case 'ArrowUp':
                    this.keys.ArrowUp = true;
                    break;
                case 'ArrowDown':
                    this.keys.ArrowDown = true;
                    break;
                case 'w':
                case 'W':
                    this.keys.w = true;
                    break;
                case 's':
                case 'S':
                    this.keys.s = true;
                    break;
            }
        }
        
        handleKeyUp(e) {
            switch (e.key) {
                case 'ArrowUp':
                    this.keys.ArrowUp = false;
                    break;
                case 'ArrowDown':
                    this.keys.ArrowDown = false;
                    break;
                case 'w':
                case 'W':
                    this.keys.w = false;
                    break;
                case 's':
                case 'S':
                    this.keys.s = false;
                    break;
            }
        }
        
        restart() {
            this.resetGame();
        }
    }
    
    /**
     * Memory Game Implementation
     */
    class MemoryGame {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.gridSize = 4; // 4x4 grid
            this.tileSize = this.canvas.width / this.gridSize;
            this.tiles = [];
            this.flippedTiles = [];
            this.matchedTiles = [];
            this.score = 0;
            this.moves = 0;
            this.gameOver = false;
            this.symbols = [
                '🍎', '🍎', '🍌', '🍌', '🍒', '🍒', '🍓', '🍓',
                '🍊', '🍊', '🍋', '🍋', '🍉', '🍉', '🍇', '🍇'
            ];
            
            // Bind event handlers
            this.handleClick = this.handleClick.bind(this);
        }
        
        start() {
            this.initializeGame();
            this.canvas.addEventListener('click', this.handleClick);
        }
        
        stop() {
            this.canvas.removeEventListener('click', this.handleClick);
        }
        
        initializeGame() {
            // Shuffle symbols
            this.symbols = this.shuffleArray(this.symbols);
            
            // Create grid
            this.tiles = [];
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    const index = y * this.gridSize + x;
                    this.tiles.push({
                        x,
                        y,
                        symbol: this.symbols[index],
                        flipped: false,
                        matched: false
                    });
                }
            }
            
            this.draw();
        }
        
        shuffleArray(array) {
            const newArray = [...array];
            for (let i = newArray.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
            }
            return newArray;
        }
        
        handleClick(e) {
            if (this.gameOver) {
                this.restart();
                return;
            }
            
            if (this.flippedTiles.length >= 2) return;
            
            // Get click position relative to canvas
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.tileSize);
            const y = Math.floor((e.clientY - rect.top) / this.tileSize);
            
            // Get clicked tile index
            const index = this.tiles.findIndex(tile => 
                tile.x === x && tile.y === y
            );
            
            if (index === -1) return;
            
            const tile = this.tiles[index];
            
            // Don't allow clicking already flipped or matched tiles
            if (tile.flipped || tile.matched) return;
            
            // Flip the tile
            tile.flipped = true;
            this.flippedTiles.push(tile);
            
            // Check for match if we have 2 flipped tiles
            if (this.flippedTiles.length === 2) {
                this.moves++;
                
                if (this.flippedTiles[0].symbol === this.flippedTiles[1].symbol) {
                    // Match found
                    this.flippedTiles.forEach(tile => {
                        tile.matched = true;
                    });
                    this.matchedTiles.push(...this.flippedTiles);
                    this.flippedTiles = [];
                    this.score += 10;
                    
                    // Check if game is over
                    if (this.matchedTiles.length === this.tiles.length) {
                        this.gameOver = true;
                    }
                } else {
                    // No match, flip back after delay
                    setTimeout(() => {
                        this.flippedTiles.forEach(tile => {
                            tile.flipped = false;
                        });
                        this.flippedTiles = [];
                        this.draw();
                    }, 1000);
                }
            }
            
            this.draw();
        }
        
        draw() {
            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid background
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    const isEven = (x + y) % 2 === 0;
                    this.ctx.fillStyle = isEven ? '#001133' : '#000022';
                    this.ctx.fillRect(
                        x * this.tileSize,
                        y * this.tileSize,
                        this.tileSize,
                        this.tileSize
                    );
                }
            }
            
            // Draw tiles
            this.tiles.forEach(tile => {
                const x = tile.x * this.tileSize;
                const y = tile.y * this.tileSize;
                
                if (tile.matched) {
                    // Matched tile - invisible
                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0)';
                    this.ctx.fillRect(x, y, this.tileSize, this.tileSize);
                    
                    // Draw symbol
                    this.ctx.font = `${this.tileSize * 0.6}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(
                        tile.symbol,
                        x + this.tileSize / 2,
                        y + this.tileSize / 2
                    );
                } else if (tile.flipped) {
                    // Flipped tile - show symbol
                    this.ctx.fillStyle = '#00ffff';
                    this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
                    
                    // Draw symbol
                    this.ctx.font = `${this.tileSize * 0.6}px Arial`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(
                        tile.symbol,
                        x + this.tileSize / 2,
                        y + this.tileSize / 2
                    );
                } else {
                    // Face-down tile
                    this.ctx.fillStyle = '#ff00ff';
                    this.ctx.shadowColor = '#ff00ff';
                    this.ctx.shadowBlur = 5;
                    this.ctx.fillRect(x + 2, y + 2, this.tileSize - 4, this.tileSize - 4);
                    
                    // Draw pattern on back of card
                    this.ctx.strokeStyle = '#ffffff';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.moveTo(x + 10, y + 10);
                    this.ctx.lineTo(x + this.tileSize - 10, y + this.tileSize - 10);
                    this.ctx.moveTo(x + this.tileSize - 10, y + 10);
                    this.ctx.lineTo(x + 10, y + this.tileSize - 10);
                    this.ctx.stroke();
                }
            });
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Draw score and moves
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '16px "Press Start 2P", cursive';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(`Score: ${this.score}`, 10, 30);
            this.ctx.fillText(`Moves: ${this.moves}`, 10, 60);
            
            // Draw game over if needed
            if (this.gameOver) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.font = '30px "Press Start 2P", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.shadowColor = '#ff00ff';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText('You Win!', this.canvas.width / 2, this.canvas.height / 2 - 30);
                
                this.ctx.fillStyle = '#00ffff';
                this.ctx.font = '16px "Press Start 2P", cursive';
                this.ctx.shadowColor = '#00ffff';
                this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
                this.ctx.fillText(`Moves: ${this.moves}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px "Press Start 2P", cursive';
                this.ctx.shadowBlur = 0;
                this.ctx.fillText('Click to restart', this.canvas.width / 2, this.canvas.height / 2 + 90);
            }
        }
        
        restart() {
            this.flippedTiles = [];
            this.matchedTiles = [];
            this.score = 0;
            this.moves = 0;
            this.gameOver = false;
            this.initializeGame();
        }
    }
    
    /**
     * Tic Tac Toe Game Implementation
     */
    class TicTacToeGame {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.boardSize = 3;
            this.cellSize = this.canvas.width / this.boardSize;
            this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
            this.currentPlayer = 'X';
            this.gameOver = false;
            this.winner = null;
            this.winLine = null;
            this.playerXColor = '#ff00ff'; // Neon pink
            this.playerOColor = '#00ffff'; // Neon blue
            this.twoPlayerMode = true; // Tic Tac Toe is naturally 2-player
            
            // Create mode toggle for AI opponent
            this.createModeToggle();
            
            // Bind event handlers
            this.handleClick = this.handleClick.bind(this);
            
            // AI thinking time (ms)
            this.aiDelay = 600;
        }
        
        createModeToggle() {
            // Create mode toggle container
            const toggleContainer = document.createElement('div');
            toggleContainer.style.marginBottom = '10px';
            toggleContainer.style.textAlign = 'center';
            
            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.textContent = '2-Player Mode';
            toggleButton.style.background = 'transparent';
            toggleButton.style.color = 'var(--neon-green)';
            toggleButton.style.border = '1px solid var(--neon-green)';
            toggleButton.style.padding = '5px 10px';
            toggleButton.style.borderRadius = '5px';
            toggleButton.style.fontFamily = '"Press Start 2P", cursive';
            toggleButton.style.fontSize = '0.7rem';
            toggleButton.style.cursor = 'pointer';
            
            // Add toggle button event listener
            toggleButton.addEventListener('click', () => {
                this.twoPlayerMode = !this.twoPlayerMode;
                toggleButton.textContent = this.twoPlayerMode ? '2-Player Mode' : 'vs AI Mode';
                toggleButton.style.color = this.twoPlayerMode ? 'var(--neon-green)' : 'var(--neon-pink)';
                toggleButton.style.borderColor = this.twoPlayerMode ? 'var(--neon-green)' : 'var(--neon-pink)';
                
                // Reset game state when changing modes
                this.restart();
            });
            
            // Add toggle button to the container
            toggleContainer.appendChild(toggleButton);
            
            // Insert before canvas
            const canvasContainer = document.getElementById('game-canvas-container');
            canvasContainer.insertBefore(toggleContainer, this.canvas);
        }
        
        start() {
            this.canvas.addEventListener('click', this.handleClick);
            this.draw();
        }
        
        stop() {
            this.canvas.removeEventListener('click', this.handleClick);
        }
        
        handleClick(e) {
            if (this.gameOver) {
                this.restart();
                return;
            }
            
            // If it's AI's turn, don't accept clicks
            if (!this.twoPlayerMode && this.currentPlayer === 'O') {
                return;
            }
            
            // Get click position relative to canvas
            const rect = this.canvas.getBoundingClientRect();
            const x = Math.floor((e.clientX - rect.left) / this.cellSize);
            const y = Math.floor((e.clientY - rect.top) / this.cellSize);
            
            // Check if the cell is empty
            if (x >= 0 && x < this.boardSize && y >= 0 && y < this.boardSize && !this.board[y][x]) {
                // Make move
                this.makeMove(x, y);
                
                // If playing against AI and game is not over, make AI move
                if (!this.twoPlayerMode && !this.gameOver && this.currentPlayer === 'O') {
                    setTimeout(() => {
                        this.makeAIMove();
                    }, this.aiDelay);
                }
            }
        }
        
        makeMove(x, y) {
            // Place the current player's symbol
            this.board[y][x] = this.currentPlayer;
            
            // Check for win or tie
            this.checkGameState();
            
            // Switch player if game is not over
            if (!this.gameOver) {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            }
            
            // Redraw the board
            this.draw();
        }
        
        makeAIMove() {
            // Find the best move using the minimax algorithm
            const bestMove = this.findBestMove();
            
            if (bestMove) {
                this.makeMove(bestMove.x, bestMove.y);
            }
        }
        
        findBestMove() {
            // Check for any empty cells
            const emptyCells = [];
            for (let y = 0; y < this.boardSize; y++) {
                for (let x = 0; x < this.boardSize; x++) {
                    if (!this.board[y][x]) {
                        emptyCells.push({ x, y });
                    }
                }
            }
            
            if (emptyCells.length === 0) {
                return null;
            }
            
            // Simplified AI - just look for winning move or blocking move
            
            // First, check if AI can win in the next move
            for (const cell of emptyCells) {
                this.board[cell.y][cell.x] = 'O';
                const isWin = this.checkWinner() === 'O';
                this.board[cell.y][cell.x] = ''; // Reset
                
                if (isWin) {
                    return cell;
                }
            }
            
            // Then, check if player can win in the next move and block
            for (const cell of emptyCells) {
                this.board[cell.y][cell.x] = 'X';
                const isWin = this.checkWinner() === 'X';
                this.board[cell.y][cell.x] = ''; // Reset
                
                if (isWin) {
                    return cell;
                }
            }
            
            // Take center if available
            const centerCell = emptyCells.find(cell => cell.x === 1 && cell.y === 1);
            if (centerCell) {
                return centerCell;
            }
            
            // Take a corner if available
            const cornerCells = emptyCells.filter(cell => 
                (cell.x === 0 && cell.y === 0) || 
                (cell.x === 2 && cell.y === 0) || 
                (cell.x === 0 && cell.y === 2) || 
                (cell.x === 2 && cell.y === 2)
            );
            
            if (cornerCells.length > 0) {
                return cornerCells[Math.floor(Math.random() * cornerCells.length)];
            }
            
            // Take any available cell
            return emptyCells[Math.floor(Math.random() * emptyCells.length)];
        }
        
        checkGameState() {
            // Check for a winner
            const winner = this.checkWinner();
            if (winner) {
                this.gameOver = true;
                this.winner = winner;
                return;
            }
            
            // Check for a tie
            let isTie = true;
            for (let y = 0; y < this.boardSize; y++) {
                for (let x = 0; x < this.boardSize; x++) {
                    if (!this.board[y][x]) {
                        isTie = false;
                        break;
                    }
                }
                if (!isTie) break;
            }
            
            if (isTie) {
                this.gameOver = true;
                this.winner = 'tie';
            }
        }
        
        checkWinner() {
            // Check rows
            for (let y = 0; y < this.boardSize; y++) {
                if (this.board[y][0] && this.board[y][0] === this.board[y][1] && this.board[y][0] === this.board[y][2]) {
                    this.winLine = { 
                        startX: 0, 
                        startY: y * this.cellSize + this.cellSize / 2,
                        endX: this.canvas.width, 
                        endY: y * this.cellSize + this.cellSize / 2
                    };
                    return this.board[y][0];
                }
            }
            
            // Check columns
            for (let x = 0; x < this.boardSize; x++) {
                if (this.board[0][x] && this.board[0][x] === this.board[1][x] && this.board[0][x] === this.board[2][x]) {
                    this.winLine = {
                        startX: x * this.cellSize + this.cellSize / 2,
                        startY: 0,
                        endX: x * this.cellSize + this.cellSize / 2,
                        endY: this.canvas.height
                    };
                    return this.board[0][x];
                }
            }
            
            // Check diagonals
            if (this.board[0][0] && this.board[0][0] === this.board[1][1] && this.board[0][0] === this.board[2][2]) {
                this.winLine = {
                    startX: 0,
                    startY: 0,
                    endX: this.canvas.width,
                    endY: this.canvas.height
                };
                return this.board[0][0];
            }
            
            if (this.board[0][2] && this.board[0][2] === this.board[1][1] && this.board[0][2] === this.board[2][0]) {
                this.winLine = {
                    startX: this.canvas.width,
                    startY: 0,
                    endX: 0,
                    endY: this.canvas.height
                };
                return this.board[0][2];
            }
            
            return null;
        }
        
        draw() {
            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid lines
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
            this.ctx.lineWidth = 3;
            
            // Draw vertical grid lines
            for (let i = 1; i < this.boardSize; i++) {
                const x = i * this.cellSize;
                this.ctx.beginPath();
                this.ctx.moveTo(x, 0);
                this.ctx.lineTo(x, this.canvas.height);
                this.ctx.stroke();
            }
            
            // Draw horizontal grid lines
            for (let i = 1; i < this.boardSize; i++) {
                const y = i * this.cellSize;
                this.ctx.beginPath();
                this.ctx.moveTo(0, y);
                this.ctx.lineTo(this.canvas.width, y);
                this.ctx.stroke();
            }
            
            // Draw X's and O's
            for (let y = 0; y < this.boardSize; y++) {
                for (let x = 0; x < this.boardSize; x++) {
                    const cellX = x * this.cellSize;
                    const cellY = y * this.cellSize;
                    const padding = this.cellSize * 0.2;
                    
                    if (this.board[y][x] === 'X') {
                        // Draw X
                        this.ctx.strokeStyle = this.playerXColor;
                        this.ctx.lineWidth = 8;
                        this.ctx.shadowColor = this.playerXColor;
                        this.ctx.shadowBlur = 10;
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(cellX + padding, cellY + padding);
                        this.ctx.lineTo(cellX + this.cellSize - padding, cellY + this.cellSize - padding);
                        this.ctx.stroke();
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(cellX + this.cellSize - padding, cellY + padding);
                        this.ctx.lineTo(cellX + padding, cellY + this.cellSize - padding);
                        this.ctx.stroke();
                        
                        this.ctx.shadowBlur = 0;
                    } else if (this.board[y][x] === 'O') {
                        // Draw O
                        this.ctx.strokeStyle = this.playerOColor;
                        this.ctx.lineWidth = 8;
                        this.ctx.shadowColor = this.playerOColor;
                        this.ctx.shadowBlur = 10;
                        
                        this.ctx.beginPath();
                        this.ctx.arc(
                            cellX + this.cellSize / 2,
                            cellY + this.cellSize / 2,
                            this.cellSize / 2 - padding,
                            0,
                            Math.PI * 2
                        );
                        this.ctx.stroke();
                        
                        this.ctx.shadowBlur = 0;
                    }
                }
            }
            
            // Draw winning line if game is over and there's a winner
            if (this.gameOver && this.winner && this.winner !== 'tie' && this.winLine) {
                const color = this.winner === 'X' ? this.playerXColor : this.playerOColor;
                this.ctx.strokeStyle = color;
                this.ctx.lineWidth = 8;
                this.ctx.shadowColor = color;
                this.ctx.shadowBlur = 15;
                
                this.ctx.beginPath();
                this.ctx.moveTo(this.winLine.startX, this.winLine.startY);
                this.ctx.lineTo(this.winLine.endX, this.winLine.endY);
                this.ctx.stroke();
                
                this.ctx.shadowBlur = 0;
            }
            
            // Draw current player indicator
            if (!this.gameOver) {
                const color = this.currentPlayer === 'X' ? this.playerXColor : this.playerOColor;
                this.ctx.fillStyle = color;
                this.ctx.font = '20px "Press Start 2P", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`Player ${this.currentPlayer}'s Turn`, this.canvas.width / 2, 30);
            }
            
            // Draw game over message
            if (this.gameOver) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.font = '30px "Press Start 2P", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.shadowColor = '#ff00ff';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
                
                this.ctx.fillStyle = '#00ffff';
                this.ctx.font = '20px "Press Start 2P", cursive';
                this.ctx.shadowColor = '#00ffff';
                
                if (this.winner === 'tie') {
                    this.ctx.fillText('It\'s a Tie!', this.canvas.width / 2, this.canvas.height / 2 + 20);
                } else {
                    const winnerText = this.twoPlayerMode ? 
                        `Player ${this.winner} Wins!` : 
                        (this.winner === 'X' ? 'You Win!' : 'AI Wins!');
                    this.ctx.fillText(winnerText, this.canvas.width / 2, this.canvas.height / 2 + 20);
                }
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px "Press Start 2P", cursive';
                this.ctx.shadowBlur = 0;
                this.ctx.fillText('Click to play again', this.canvas.width / 2, this.canvas.height / 2 + 60);
                
                // Add click listener for restart
                this.canvas.addEventListener('click', () => {
                    if (this.gameOver) {
                        this.restart();
                    }
                }, { once: true });
            }
        }
        
        restart() {
            this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(''));
            this.currentPlayer = 'X';
            this.gameOver = false;
            this.winner = null;
            this.winLine = null;
            this.draw();
        }
    }
    
    /**
     * Flappy Bird Game Implementation
     */
    class FlappyBirdGame {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            
            // Game settings
            this.gravity = 0.5;
            this.jumpForce = -10;
            this.pipeGap = 150;
            this.pipeWidth = 60;
            this.pipeSpacing = 200;
            this.speed = 3;
            this.gameOver = false;
            this.score = 0;
            
            // Bird
            this.bird = {
                x: this.canvas.width / 4,
                y: this.canvas.height / 2,
                width: 30,
                height: 30,
                velocity: 0
            };
            
            // Pipes
            this.pipes = [];
            
            // Game loop
            this.interval = null;
            
            // Bind event handlers
            this.handleClick = this.handleClick.bind(this);
            this.handleKeyDown = this.handleKeyDown.bind(this);
        }
        
        start() {
            this.resetGame();
            this.canvas.addEventListener('click', this.handleClick);
            document.addEventListener('keydown', this.handleKeyDown);
            this.interval = setInterval(() => this.update(), 1000 / 60); // 60 FPS
        }
        
        stop() {
            this.canvas.removeEventListener('click', this.handleClick);
            document.removeEventListener('keydown', this.handleKeyDown);
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
        
        resetGame() {
            this.bird = {
                x: this.canvas.width / 4,
                y: this.canvas.height / 2,
                width: 30,
                height: 30,
                velocity: 0
            };
            
            this.pipes = [];
            this.generateInitialPipes();
            this.gameOver = false;
            this.score = 0;
        }
        
        generateInitialPipes() {
            const firstPipeX = this.canvas.width;
            
            for (let i = 0; i < 3; i++) {
                const pipeX = firstPipeX + (i * this.pipeSpacing);
                this.pipes.push(this.generatePipe(pipeX));
            }
        }
        
        generatePipe(x) {
            const minHeight = 50;
            const maxHeight = this.canvas.height - this.pipeGap - minHeight;
            const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
            
            return {
                x: x,
                topHeight: topHeight,
                bottomY: topHeight + this.pipeGap,
                width: this.pipeWidth,
                passed: false
            };
        }
        
        update() {
            if (this.gameOver) return;
            
            // Update bird velocity and position
            this.bird.velocity += this.gravity;
            this.bird.y += this.bird.velocity;
            
            // Check for collisions with ground or ceiling
            if (this.bird.y < 0) {
                this.bird.y = 0;
                this.bird.velocity = 0;
            }
            
            if (this.bird.y + this.bird.height > this.canvas.height) {
                this.handleGameOver();
                return;
            }
            
            // Update pipes
            for (let i = 0; i < this.pipes.length; i++) {
                const pipe = this.pipes[i];
                
                // Move pipe
                pipe.x -= this.speed;
                
                // Check for collision with pipe
                if (this.checkCollision(pipe)) {
                    this.handleGameOver();
                    return;
                }
                
                // Check if pipe is passed
                if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
                    pipe.passed = true;
                    this.score++;
                }
                
                // Remove pipe if it's off screen
                if (pipe.x + pipe.width < 0) {
                    // Remove the pipe
                    this.pipes.splice(i, 1);
                    i--;
                    
                    // Add a new pipe
                    const lastPipe = this.pipes[this.pipes.length - 1];
                    const newPipeX = lastPipe.x + this.pipeSpacing;
                    this.pipes.push(this.generatePipe(newPipeX));
                }
            }
            
            // Draw everything
            this.draw();
        }
        
        checkCollision(pipe) {
            // Check collision with top pipe
            if (
                this.bird.x + this.bird.width > pipe.x &&
                this.bird.x < pipe.x + pipe.width &&
                this.bird.y < pipe.topHeight
            ) {
                return true;
            }
            
            // Check collision with bottom pipe
            if (
                this.bird.x + this.bird.width > pipe.x &&
                this.bird.x < pipe.x + pipe.width &&
                this.bird.y + this.bird.height > pipe.bottomY
            ) {
                return true;
            }
            
            return false;
        }
        
        handleClick() {
            if (this.gameOver) {
                this.resetGame();
                return;
            }
            
            this.bird.velocity = this.jumpForce;
        }
        
        handleKeyDown(e) {
            if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
                e.preventDefault();
                
                if (this.gameOver) {
                    this.resetGame();
                    return;
                }
                
                this.bird.velocity = this.jumpForce;
            }
        }
        
        handleGameOver() {
            this.gameOver = true;
            this.draw();
        }
        
        draw() {
            // Clear canvas
            this.ctx.fillStyle = '#000033';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw stars (background)
            this.drawStars();
            
            // Draw pipes
            this.ctx.fillStyle = '#00ff00';
            this.ctx.shadowColor = '#00ff00';
            this.ctx.shadowBlur = 10;
            
            for (const pipe of this.pipes) {
                // Top pipe
                this.ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
                
                // Bottom pipe
                this.ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, this.canvas.height - pipe.bottomY);
            }
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Draw bird
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.shadowColor = '#ff00ff';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(
                this.bird.x + this.bird.width / 2,
                this.bird.y + this.bird.height / 2,
                this.bird.width / 2,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Add eye to bird
            this.ctx.fillStyle = '#000';
            this.ctx.shadowBlur = 0;
            this.ctx.beginPath();
            this.ctx.arc(
                this.bird.x + this.bird.width * 0.7,
                this.bird.y + this.bird.height * 0.4,
                this.bird.width / 10,
                0,
                Math.PI * 2
            );
            this.ctx.fill();
            
            // Draw score
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '30px "Press Start 2P", cursive';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.score.toString(), this.canvas.width / 2, 50);
            
            // Draw game over if needed
            if (this.gameOver) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.font = '30px "Press Start 2P", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.shadowColor = '#ff00ff';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
                
                this.ctx.fillStyle = '#00ffff';
                this.ctx.font = '16px "Press Start 2P", cursive';
                this.ctx.shadowColor = '#00ffff';
                this.ctx.fillText(
                    `Score: ${this.score}`,
                    this.canvas.width / 2,
                    this.canvas.height / 2 + 20
                );
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px "Press Start 2P", cursive';
                this.ctx.shadowBlur = 0;
                this.ctx.fillText('Click or press SPACE to play again', this.canvas.width / 2, this.canvas.height / 2 + 60);
            }
            
            // Draw instructions if not game over
            if (!this.gameOver) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.font = '10px "Press Start 2P", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Click or press SPACE to flap', this.canvas.width / 2, this.canvas.height - 20);
            }
        }
        
        drawStars() {
            // Draw random stars in the background
            this.ctx.fillStyle = '#fff';
            
            // We'll use a deterministic pattern for performance
            for (let i = 0; i < 50; i++) {
                const x = (i * 17) % this.canvas.width;
                const y = (i * 23) % this.canvas.height;
                const size = (i % 3) + 1;
                
                this.ctx.fillRect(x, y, size, size);
            }
        }
    }
    
    /**
     * Breakout Game Implementation
     */
    class BreakoutGame {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            
            // Game settings
            this.brickRowCount = 5;
            this.brickColumnCount = 8;
            this.brickWidth = 40;
            this.brickHeight = 20;
            this.brickPadding = 10;
            this.brickOffsetTop = 60;
            this.brickOffsetLeft = 30;
            this.paddleHeight = 15;
            this.paddleWidth = 80;
            this.ballRadius = 8;
            this.lives = 3;
            this.score = 0;
            this.gameOver = false;
            this.gameWon = false;
            this.speed = 5;
            
            // Colors
            this.colors = [
                '#ff00ff', // pink
                '#00ffff', // cyan
                '#00ff00', // green
                '#ffff00', // yellow
                '#ff8800'  // orange
            ];
            
            // Initialize game objects
            this.initGame();
            
            // Bind event handlers
            this.handleMouseMove = this.handleMouseMove.bind(this);
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleClick = this.handleClick.bind(this);
        }
        
        initGame() {
            // Ball
            this.ball = {
                x: this.canvas.width / 2,
                y: this.canvas.height - 30,
                dx: this.speed,
                dy: -this.speed,
                radius: this.ballRadius
            };
            
            // Paddle
            this.paddle = {
                x: (this.canvas.width - this.paddleWidth) / 2,
                y: this.canvas.height - this.paddleHeight - 10,
                width: this.paddleWidth,
                height: this.paddleHeight,
                dx: 0
            };
            
            // Bricks
            this.bricks = [];
            for (let c = 0; c < this.brickColumnCount; c++) {
                this.bricks[c] = [];
                for (let r = 0; r < this.brickRowCount; r++) {
                    this.bricks[c][r] = { 
                        x: 0, 
                        y: 0, 
                        status: 1,
                        color: this.colors[r % this.colors.length]
                    };
                }
            }
            
            // Reset game state
            this.gameOver = false;
            this.gameWon = false;
            this.score = 0;
            this.lives = 3;
        }
        
        start() {
            this.canvas.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('keydown', this.handleKeyDown);
            this.canvas.addEventListener('click', this.handleClick);
            this.interval = setInterval(() => this.update(), 1000 / 60); // 60 FPS
        }
        
        stop() {
            this.canvas.removeEventListener('mousemove', this.handleMouseMove);
            document.removeEventListener('keydown', this.handleKeyDown);
            this.canvas.removeEventListener('click', this.handleClick);
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
        
        update() {
            if (this.gameOver || this.gameWon) return;
            
            // Move paddle
            this.paddle.x += this.paddle.dx;
            
            // Keep paddle in bounds
            if (this.paddle.x < 0) {
                this.paddle.x = 0;
            } else if (this.paddle.x > this.canvas.width - this.paddle.width) {
                this.paddle.x = this.canvas.width - this.paddle.width;
            }
            
            // Move ball
            this.ball.x += this.ball.dx;
            this.ball.y += this.ball.dy;
            
            // Ball collision with walls
            if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
                this.ball.dx = -this.ball.dx;
            }
            
            if (this.ball.y - this.ball.radius < 0) {
                this.ball.dy = -this.ball.dy;
            } else if (this.ball.y + this.ball.radius > this.canvas.height) {
                this.lives--;
                
                if (this.lives <= 0) {
                    this.gameOver = true;
                } else {
                    // Reset ball position
                    this.ball.x = this.canvas.width / 2;
                    this.ball.y = this.canvas.height - 30;
                    this.ball.dx = this.speed;
                    this.ball.dy = -this.speed;
                    
                    // Reset paddle position
                    this.paddle.x = (this.canvas.width - this.paddle.width) / 2;
                }
            }
            
            // Ball collision with paddle
            if (
                this.ball.y + this.ball.radius > this.paddle.y &&
                this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
                this.ball.x + this.ball.radius > this.paddle.x &&
                this.ball.x - this.ball.radius < this.paddle.x + this.paddle.width
            ) {
                // Calculate where the ball hit the paddle (0 = left edge, 1 = right edge)
                const hitPosition = (this.ball.x - this.paddle.x) / this.paddle.width;
                
                // Adjust ball direction based on where it hit the paddle
                const maxAngle = Math.PI / 3; // 60 degrees
                const angle = (hitPosition * 2 - 1) * maxAngle;
                
                // Set new velocity based on angle, maintaining the same speed
                const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
                this.ball.dx = speed * Math.sin(angle);
                this.ball.dy = -speed * Math.cos(angle);
            }
            
            // Ball collision with bricks
            for (let c = 0; c < this.brickColumnCount; c++) {
                for (let r = 0; r < this.brickRowCount; r++) {
                    const brick = this.bricks[c][r];
                    
                    if (brick.status === 1) {
                        const brickX = c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft;
                        const brickY = r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop;
                        
                        brick.x = brickX;
                        brick.y = brickY;
                        
                        if (
                            this.ball.x + this.ball.radius > brickX &&
                            this.ball.x - this.ball.radius < brickX + this.brickWidth &&
                            this.ball.y + this.ball.radius > brickY &&
                            this.ball.y - this.ball.radius < brickY + this.brickHeight
                        ) {
                            this.ball.dy = -this.ball.dy;
                            brick.status = 0;
                            this.score += 10;
                            
                            // Check if all bricks are destroyed
                            if (this.score === this.brickRowCount * this.brickColumnCount * 10) {
                                this.gameWon = true;
                            }
                        }
                    }
                }
            }
            
            this.draw();
        }
        
        handleMouseMove(e) {
            const relativeX = e.clientX - this.canvas.getBoundingClientRect().left;
            if (relativeX > 0 && relativeX < this.canvas.width) {
                this.paddle.x = relativeX - this.paddle.width / 2;
            }
        }
        
        handleKeyDown(e) {
            if (e.key === 'ArrowLeft') {
                this.paddle.dx = -7;
            } else if (e.key === 'ArrowRight') {
                this.paddle.dx = 7;
            } else if (e.key === ' ' || e.key === 'Space') {
                if (this.gameOver || this.gameWon) {
                    this.initGame();
                }
            }
            
            // Prevent default arrow key behavior
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
            }
        }
        
        handleClick(e) {
            if (this.gameOver || this.gameWon) {
                this.initGame();
            }
        }
        
        draw() {
            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw background stars
            this.drawStars();
            
            // Draw bricks
            for (let c = 0; c < this.brickColumnCount; c++) {
                for (let r = 0; r < this.brickRowCount; r++) {
                    if (this.bricks[c][r].status === 1) {
                        const brickX = this.bricks[c][r].x;
                        const brickY = this.bricks[c][r].y;
                        
                        this.ctx.fillStyle = this.bricks[c][r].color;
                        this.ctx.shadowColor = this.bricks[c][r].color;
                        this.ctx.shadowBlur = 10;
                        this.ctx.fillRect(brickX, brickY, this.brickWidth, this.brickHeight);
                        this.ctx.shadowBlur = 0;
                        
                        // Draw brick inner highlight
                        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                        this.ctx.fillRect(brickX + 2, brickY + 2, this.brickWidth - 8, 4);
                    }
                }
            }
            
            // Draw paddle
            this.ctx.fillStyle = '#00ffff';
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 15;
            this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);
            
            // Draw ball
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.shadowColor = '#ff00ff';
            this.ctx.shadowBlur = 15;
            this.ctx.beginPath();
            this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Reset shadow
            this.ctx.shadowBlur = 0;
            
            // Draw score
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '16px "Press Start 2P", cursive';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 50);
            
            // Draw lives
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`Lives: ${this.lives}`, this.canvas.width - 10, 30);
            
            // Draw instructions
            if (!this.gameOver && !this.gameWon) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.font = '10px "Press Start 2P", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('Move with mouse or arrow keys', this.canvas.width / 2, this.canvas.height - 10);
            }
            
            // Draw game over
            if (this.gameOver) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#ff00ff';
                this.ctx.font = '30px "Press Start 2P", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.shadowColor = '#ff00ff';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 30);
                
                this.ctx.fillStyle = '#00ffff';
                this.ctx.font = '16px "Press Start 2P", cursive';
                this.ctx.shadowColor = '#00ffff';
                
                if (this.winner === 'tie') {
                    this.ctx.fillText('It\'s a Tie!', this.canvas.width / 2, this.canvas.height / 2 + 20);
                } else {
                    const winnerText = this.twoPlayerMode ? 
                        `Player ${this.winner} Wins!` : 
                        (this.winner === 'X' ? 'You Win!' : 'AI Wins!');
                    this.ctx.fillText(winnerText, this.canvas.width / 2, this.canvas.height / 2 + 20);
                }
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px "Press Start 2P", cursive';
                this.ctx.shadowBlur = 0;
                this.ctx.fillText('Click or press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
            }
            
            // Draw win message
            if (this.gameWon) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = '#00ff00';
                this.ctx.font = '30px "Press Start 2P", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.shadowColor = '#00ff00';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText('YOU WIN!', this.canvas.width / 2, this.canvas.height / 2 - 30);
                
                this.ctx.fillStyle = '#00ffff';
                this.ctx.font = '16px "Press Start 2P", cursive';
                this.ctx.shadowColor = '#00ffff';
                this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px "Press Start 2P", cursive';
                this.ctx.shadowBlur = 0;
                this.ctx.fillText('Click or press SPACE to restart', this.canvas.width / 2, this.canvas.height / 2 + 60);
            }
        }
        
        drawStars() {
            // Draw random stars in the background
            this.ctx.fillStyle = '#fff';
            
            // Use a deterministic pattern for performance
            for (let i = 0; i < 50; i++) {
                const x = (i * 19) % this.canvas.width;
                const y = (i * 17) % this.canvas.height;
                const size = (i % 3) + 1;
                
                this.ctx.fillRect(x, y, size, size);
            }
        }
    }
    
    /**
     * 2048 Game Implementation
     */
    class Game2048 {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            
            // Game grid
            this.gridSize = 4;
            this.tileSize = Math.min(canvas.width, canvas.height) / this.gridSize;
            this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
            this.score = 0;
            this.gameOver = false;
            this.gameWon = false;
            this.winningTile = 2048;
            
            // Colors
            this.tileColors = {
                0: 'rgba(0, 0, 0, 0)', // Empty
                2: '#ff00ff', // Neon pink
                4: '#ff33ff',
                8: '#ff66ff',
                16: '#ff99ff',
                32: '#00ffff', // Neon blue
                64: '#33ffff',
                128: '#66ffff',
                256: '#99ffff',
                512: '#00ff00', // Neon green
                1024: '#33ff33',
                2048: '#ffff00', // Neon yellow
                4096: '#ffff33',
                8192: '#ffff66'
            };
            
            // Bind event handlers
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleTouchStart = this.handleTouchStart.bind(this);
            this.handleTouchEnd = this.handleTouchEnd.bind(this);
        }
        
        start() {
            this.initGame();
            document.addEventListener('keydown', this.handleKeyDown);
            this.canvas.addEventListener('touchstart', this.handleTouchStart);
            this.canvas.addEventListener('touchend', this.handleTouchEnd);
            this.draw();
        }
        
        stop() {
            document.removeEventListener('keydown', this.handleKeyDown);
            this.canvas.removeEventListener('touchstart', this.handleTouchStart);
            this.canvas.removeEventListener('touchend', this.handleTouchEnd);
        }
        
        initGame() {
            // Reset grid
            this.grid = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
            this.score = 0;
            this.gameOver = false;
            this.gameWon = false;
            
            // Add initial tiles
            this.addRandomTile();
            this.addRandomTile();
        }
        
        addRandomTile() {
            const emptyCells = [];
            
            // Find all empty cells
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    if (this.grid[y][x] === 0) {
                        emptyCells.push({ x, y });
                    }
                }
            }
            
            // If there are empty cells, add a new tile (90% chance of 2, 10% chance of 4)
            if (emptyCells.length > 0) {
                const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
                this.grid[cell.y][cell.x] = Math.random() < 0.9 ? 2 : 4;
            }
        }
        
        handleKeyDown(e) {
            if (this.gameOver || this.gameWon) {
                if (e.key === 'r' || e.key === 'R') {
                    this.initGame();
                    this.draw();
                }
                return;
            }
            
            let moved = false;
            
            switch (e.key) {
                case 'ArrowUp':
                    moved = this.moveUp();
                    break;
                case 'ArrowDown':
                    moved = this.moveDown();
                    break;
                case 'ArrowLeft':
                    moved = this.moveLeft();
                    break;
                case 'ArrowRight':
                    moved = this.moveRight();
                    break;
            }
            
            if (moved) {
                this.addRandomTile();
                this.checkGameState();
                this.draw();
            }
            
            // Prevent default arrow key behavior
            if (e.key.startsWith('Arrow')) {
                e.preventDefault();
            }
        }
        
        touchStartX = 0;
        touchStartY = 0;
        
        handleTouchStart(e) {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }
        
        handleTouchEnd(e) {
            if (this.gameOver || this.gameWon) {
                this.initGame();
                this.draw();
                return;
            }
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - this.touchStartX;
            const dy = touchEndY - this.touchStartY;
            
            let moved = false;
            
            // Detect swipe direction
            if (Math.abs(dx) > Math.abs(dy)) {
                // Horizontal swipe
                if (dx > 50) {
                    moved = this.moveRight();
                } else if (dx < -50) {
                    moved = this.moveLeft();
                }
            } else {
                // Vertical swipe
                if (dy > 50) {
                    moved = this.moveDown();
                } else if (dy < -50) {
                    moved = this.moveUp();
                }
            }
            
            if (moved) {
                this.addRandomTile();
                this.checkGameState();
                this.draw();
            }
        }
        
        moveLeft() {
            let moved = false;
            
            for (let y = 0; y < this.gridSize; y++) {
                const row = this.grid[y].filter(tile => tile > 0);
                const newRow = [];
                
                // Merge tiles
                for (let i = 0; i < row.length; i++) {
                    if (row[i] === row[i + 1]) {
                        newRow.push(row[i] * 2);
                        this.score += row[i] * 2;
                        i++;
                    } else {
                        newRow.push(row[i]);
                    }
                }
                
                // Fill the rest with zeros
                while (newRow.length < this.gridSize) {
                    newRow.push(0);
                }
                
                // Check if the row has changed
                for (let x = 0; x < this.gridSize; x++) {
                    if (this.grid[y][x] !== newRow[x]) {
                        moved = true;
                    }
                }
                
                this.grid[y] = newRow;
            }
            
            return moved;
        }
        
        moveRight() {
            let moved = false;
            
            for (let y = 0; y < this.gridSize; y++) {
                const row = this.grid[y].filter(tile => tile > 0);
                const newRow = [];
                
                // Merge tiles from right to left
                for (let i = row.length - 1; i >= 0; i--) {
                    if (row[i] === row[i - 1]) {
                        newRow.unshift(row[i] * 2);
                        this.score += row[i] * 2;
                        i--;
                    } else {
                        newRow.unshift(row[i]);
                    }
                }
                
                // Fill the rest with zeros
                while (newRow.length < this.gridSize) {
                    newRow.unshift(0);
                }
                
                // Check if the row has changed
                for (let x = 0; x < this.gridSize; x++) {
                    if (this.grid[y][x] !== newRow[x]) {
                        moved = true;
                    }
                }
                
                this.grid[y] = newRow;
            }
            
            return moved;
        }
        
        moveUp() {
            let moved = false;
            
            for (let x = 0; x < this.gridSize; x++) {
                // Extract column
                const column = [];
                for (let y = 0; y < this.gridSize; y++) {
                    if (this.grid[y][x] > 0) {
                        column.push(this.grid[y][x]);
                    }
                }
                
                // Merge tiles
                const newColumn = [];
                for (let i = 0; i < column.length; i++) {
                    if (column[i] === column[i + 1]) {
                        newColumn.push(column[i] * 2);
                        this.score += column[i] * 2;
                        i++;
                    } else {
                        newColumn.push(column[i]);
                    }
                }
                
                // Fill the rest with zeros
                while (newColumn.length < this.gridSize) {
                    newColumn.push(0);
                }
                
                // Check if the column has changed and update the grid
                for (let y = 0; y < this.gridSize; y++) {
                    if (this.grid[y][x] !== newColumn[y]) {
                        moved = true;
                    }
                    this.grid[y][x] = newColumn[y];
                }
            }
            
            return moved;
        }
        
        moveDown() {
            let moved = false;
            
            for (let x = 0; x < this.gridSize; x++) {
                // Extract column
                const column = [];
                for (let y = 0; y < this.gridSize; y++) {
                    if (this.grid[y][x] > 0) {
                        column.push(this.grid[y][x]);
                    }
                }
                
                // Merge tiles from bottom to top
                const newColumn = [];
                for (let i = column.length - 1; i >= 0; i--) {
                    if (column[i] === column[i - 1]) {
                        newColumn.unshift(column[i] * 2);
                        this.score += column[i] * 2;
                        i--;
                    } else {
                        newColumn.unshift(column[i]);
                    }
                }
                
                // Fill the rest with zeros
                while (newColumn.length < this.gridSize) {
                    newColumn.unshift(0);
                }
                
                // Check if the column has changed and update the grid
                for (let y = 0; y < this.gridSize; y++) {
                    if (this.grid[y][x] !== newColumn[y]) {
                        moved = true;
                    }
                    this.grid[y][x] = newColumn[y];
                }
            }
            
            return moved;
        }
        
        checkGameState() {
            // Check for winning tile
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    if (this.grid[y][x] >= this.winningTile) {
                        this.gameWon = true;
                        return;
                    }
                }
            }
            
            // Check if there are any empty cells
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    if (this.grid[y][x] === 0) {
                        return; // Game can continue
                    }
                }
            }
            
            // Check if any moves are possible
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize - 1; x++) {
                    if (this.grid[y][x] === this.grid[y][x + 1]) {
                        return; // Horizontal merge possible
                    }
                }
            }
            
            for (let x = 0; x < this.gridSize; x++) {
                for (let y = 0; y < this.gridSize - 1; y++) {
                    if (this.grid[y][x] === this.grid[y + 1][x]) {
                        return; // Vertical merge possible
                    }
                }
            }
            
            // If we reach here, game is over
            this.gameOver = true;
        }
        
        draw() {
            // Clear canvas
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Draw grid background
            this.ctx.fillStyle = 'rgba(0, 0, 30, 0.5)';
            this.ctx.fillRect(0, 0, this.gridSize * this.tileSize, this.gridSize * this.tileSize);
            
            // Draw grid lines
            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.2)';
            this.ctx.lineWidth = 2;
            
            for (let i = 1; i < this.gridSize; i++) {
                // Vertical lines
                this.ctx.beginPath();
                this.ctx.moveTo(i * this.tileSize, 0);
                this.ctx.lineTo(i * this.tileSize, this.gridSize * this.tileSize);
                this.ctx.stroke();
                
                // Horizontal lines
                this.ctx.beginPath();
                this.ctx.moveTo(0, i * this.tileSize);
                this.ctx.lineTo(this.gridSize * this.tileSize, i * this.tileSize);
                this.ctx.stroke();
            }
            
            // Draw tiles
            for (let y = 0; y < this.gridSize; y++) {
                for (let x = 0; x < this.gridSize; x++) {
                    const value = this.grid[y][x];
                    
                    if (value > 0) {
                        const tileX = x * this.tileSize;
                        const tileY = y * this.tileSize;
                        const padding = 10;
                        
                        // Draw tile background with glow
                        this.ctx.fillStyle = this.tileColors[value] || '#ffffff';
                        this.ctx.shadowColor = this.tileColors[value] || '#ffffff';
                        this.ctx.shadowBlur = 15;
                        this.ctx.fillRect(
                            tileX + padding,
                            tileY + padding,
                            this.tileSize - padding * 2,
                            this.tileSize - padding * 2
                        );
                        
                        // Reset shadow for text
                        this.ctx.shadowBlur = 0;
                        
                        // Draw tile value
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.font = value < 1000 ? '24px "Press Start 2P", cursive' : '18px "Press Start 2P", cursive';
                        this.ctx.textAlign = 'center';
                        this.ctx.textBaseline = 'middle';
                        this.ctx.fillText(
                            value.toString(),
                            tileX + this.tileSize / 2,
                            tileY + this.tileSize / 2
                        );
                    }
                }
            }
            
            // Draw score
            this.ctx.fillStyle = '#fff';
            this.ctx.font = '16px "Press Start 2P", cursive';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, 50);
            
            // Draw game over or win message
            if (this.gameOver || this.gameWon) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                this.ctx.fillStyle = this.gameWon ? '#00ff00' : '#ff00ff';
                this.ctx.font = '30px "Press Start 2P", cursive';
                this.ctx.textAlign = 'center';
                this.ctx.shadowColor = this.gameWon ? '#00ff00' : '#ff00ff';
                this.ctx.shadowBlur = 10;
                this.ctx.fillText(
                    this.gameWon ? 'YOU WIN!' : 'GAME OVER',
                    this.canvas.width / 2,
                    this.canvas.height / 2 - 40
                );
                
                this.ctx.fillStyle = '#00ffff';
                this.ctx.font = '16px "Press Start 2P", cursive';
                this.ctx.shadowColor = '#00ffff';
                this.ctx.fillText(
                    `Score: ${this.score}`,
                    this.canvas.width / 2,
                    this.canvas.height / 2 + 10
                );
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '12px "Press Start 2P", cursive';
                this.ctx.shadowBlur = 0;
                
                const touchDevice = 'ontouchstart' in window;
                const actionText = touchDevice ? 'Tap to restart' : 'Press R to restart';
                
                this.ctx.fillText(
                    actionText,
                    this.canvas.width / 2,
                    this.canvas.height / 2 + 50
                );
            }
        }
    }
    
    /**
     * Space Race Game Implementation
     */
    class SpaceRaceGame {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.width = canvas.width;
            this.height = canvas.height;
            this.player1 = { x: this.width / 3, y: this.height - 50, score: 0 };
            this.player2 = { x: (this.width / 3) * 2, y: this.height - 50, score: 0 };
            this.playerSize = 20;
            this.playerSpeed = 4;
            this.asteroids = [];
            this.numberOfAsteroids = 15;
            this.gameOver = false;
            this.interval = null;
            this.keyStates = {}; // Initialize the keyStates object
            this.twoPlayerMode = false;

            // Create mode toggle button
            this.createModeToggle();
            
            // Bind key events
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleKeyUp = this.handleKeyUp.bind(this);
        }
        
        createModeToggle() {
            // Create mode toggle container
            const toggleContainer = document.createElement('div');
            toggleContainer.style.marginBottom = '10px';
            toggleContainer.style.textAlign = 'center';
            
            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.textContent = '1-Player Mode';
            toggleButton.style.background = 'transparent';
            toggleButton.style.color = 'var(--neon-pink)';
            toggleButton.style.border = '1px solid var(--neon-pink)';
            toggleButton.style.padding = '5px 10px';
            toggleButton.style.borderRadius = '5px';
            toggleButton.style.fontFamily = '"Press Start 2P", cursive';
            toggleButton.style.fontSize = '0.7rem';
            toggleButton.style.cursor = 'pointer';
            
            // Add toggle button event listener
            toggleButton.addEventListener('click', () => {
                this.twoPlayerMode = !this.twoPlayerMode;
                toggleButton.textContent = this.twoPlayerMode ? '2-Player Mode' : '1-Player Mode';
                toggleButton.style.color = this.twoPlayerMode ? 'var(--neon-green)' : 'var(--neon-pink)';
                toggleButton.style.borderColor = this.twoPlayerMode ? 'var(--neon-green)' : 'var(--neon-pink)';
                
                // Reset game state when changing modes
                this.restart();
            });
            
            // Add toggle button to the container
            toggleContainer.appendChild(toggleButton);
            
            // Insert before canvas
            const canvasContainer = document.getElementById('game-canvas-container');
            canvasContainer.insertBefore(toggleContainer, this.canvas);
        }
        
        start() {
            this.initGame();
            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);
            this.interval = setInterval(() => this.update(), 16); // 60 FPS
        }
        
        stop() {
            document.removeEventListener('keydown', this.handleKeyDown);
            document.removeEventListener('keyup', this.handleKeyUp);
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
            // Also clean up restart handler if it exists
            if (this.restartHandler) {
                this.canvas.removeEventListener('click', this.restartHandler);
                this.restartHandler = null;
            }
        }
        
        initGame() {
            this.player1 = { x: this.width / 3, y: this.height - 50, score: 0 };
            this.player2 = { x: (this.width / 3) * 2, y: this.height - 50, score: 0 };
            this.asteroids = [];
            this.gameOver = false;
            
            // Initialize asteroids
            for (let i = 0; i < this.numberOfAsteroids; i++) {
                this.createNewAsteroid();
            }
        }
        
        createNewAsteroid() {
            // Determine direction (left to right or right to left)
            const goingRight = Math.random() > 0.5;
            
            // Random size
            const size = 5 + Math.random() * 15;
            
            // Create asteroid
            const asteroid = {
                x: goingRight ? -size : this.width + size,
                y: 50 + Math.random() * (this.height - 150),
                size: size,
                speed: 1 + Math.random() * 3,
                goingRight: goingRight
            };
            
            this.asteroids.push(asteroid);
        }
        
        handleKeyDown(e) {
            this.keyStates[e.key] = true;
        }
        
        handleKeyUp(e) {
            this.keyStates[e.key] = false;
        }
        
        update() {
            if (this.gameOver) return;
            
            // Player 1 controls (Arrow keys)
            if (this.keyStates['ArrowUp']) {
                this.player1.y -= this.playerSpeed;
            }
            if (this.keyStates['ArrowDown']) {
                this.player1.y += this.playerSpeed;
            }
            if (this.keyStates['ArrowLeft']) {
                this.player1.x -= this.playerSpeed;
            }
            if (this.keyStates['ArrowRight']) {
                this.player1.x += this.playerSpeed;
            }
            
            // Player 2 controls (WASD)
            if (this.twoPlayerMode) {
                if (this.keyStates['w']) {
                    this.player2.y -= this.playerSpeed;
                }
                if (this.keyStates['s']) {
                    this.player2.y += this.playerSpeed;
                }
                if (this.keyStates['a']) {
                    this.player2.x -= this.playerSpeed;
                }
                if (this.keyStates['d']) {
                    this.player2.x += this.playerSpeed;
                }
            } else {
                // AI control for player 2 in single player mode
                const aiTarget = this.height - 50;
                if (Math.abs(this.player2.y - aiTarget) > this.playerSpeed) {
                    this.player2.y += this.player2.y > aiTarget ? -this.playerSpeed / 2 : this.playerSpeed / 2;
                }
            }
            
            // Keep players within bounds
            this.player1.x = Math.max(this.playerSize, Math.min(this.width - this.playerSize, this.player1.x));
            this.player1.y = Math.max(this.playerSize, Math.min(this.height - this.playerSize, this.player1.y));
            this.player2.x = Math.max(this.playerSize, Math.min(this.width - this.playerSize, this.player2.x));
            this.player2.y = Math.max(this.playerSize, Math.min(this.height - this.playerSize, this.player2.y));
            
            // Check if players reached the top
            if (this.player1.y <= this.playerSize) {
                this.player1.score++;
                this.player1.y = this.height - 50;
            }
            if (this.player2.y <= this.playerSize) {
                this.player2.score++;
                this.player2.y = this.height - 50;
            }
            
            // Update asteroids
            for (let i = 0; i < this.asteroids.length; i++) {
                const asteroid = this.asteroids[i];
                
                // Move asteroid
                if (asteroid.goingRight) {
                    asteroid.x += asteroid.speed;
                } else {
                    asteroid.x -= asteroid.speed;
                }
                
                // Check if asteroid is out of bounds
                if ((asteroid.goingRight && asteroid.x > this.width + asteroid.size) || 
                    (!asteroid.goingRight && asteroid.x < -asteroid.size)) {
                    // Recycle asteroid
                    this.asteroids.splice(i, 1);
                    this.createNewAsteroid();
                    i--;
                    continue;
                }
                
                // Check collision with player 1
                if (this.checkCollision(this.player1, asteroid)) {
                    this.player1.y = this.height - 50;
                }
                
                // Check collision with player 2
                if (this.checkCollision(this.player2, asteroid)) {
                    this.player2.y = this.height - 50;
                }
            }
            
            // Check if game end condition is met
            if (this.player1.score >= 10 || this.player2.score >= 10) {
                this.gameOver = true;
            }
            
            // Draw the game
            this.draw();
        }
        
        checkCollision(player, asteroid) {
            const dx = player.x - asteroid.x;
            const dy = player.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < (this.playerSize + asteroid.size) / 1.5;
        }
        
        draw() {
            // Clear canvas
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw stars
            this.drawStars();
            
            // Draw center divider
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.setLineDash([5, 15]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.width / 2, 0);
            this.ctx.lineTo(this.width / 2, this.height);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // Draw score
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            this.ctx.fillText(this.player1.score.toString(), this.width / 4, 30);
            this.ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
            this.ctx.fillText(this.player2.score.toString(), (this.width / 4) * 3, 30);
            
            // Draw player 1
            this.ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.moveTo(this.player1.x, this.player1.y - this.playerSize);
            this.ctx.lineTo(this.player1.x - this.playerSize / 2, this.player1.y + this.playerSize / 2);
            this.ctx.lineTo(this.player1.x + this.playerSize / 2, this.player1.y + this.playerSize / 2);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.stroke();
            
            // Draw player 2
            this.ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.moveTo(this.player2.x, this.player2.y - this.playerSize);
            this.ctx.lineTo(this.player2.x - this.playerSize / 2, this.player2.y + this.playerSize / 2);
            this.ctx.lineTo(this.player2.x + this.playerSize / 2, this.player2.y + this.playerSize / 2);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.stroke();
            
            // Draw asteroids
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (const asteroid of this.asteroids) {
                this.ctx.beginPath();
                this.ctx.arc(asteroid.x, asteroid.y, asteroid.size, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw game over message if applicable
            if (this.gameOver) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, this.height / 2 - 50, this.width, 100);
                this.ctx.fillStyle = 'rgba(255, 0, 255, 0.8)';
                this.ctx.font = '24px "Press Start 2P"';
                this.ctx.textAlign = 'center';
                
                const winner = this.player1.score > this.player2.score ? "P1" : "P2";
                this.ctx.fillText(`${winner} WINS!`, this.width / 2, this.height / 2 - 10);
                
                this.ctx.font = '12px "Press Start 2P"';
                this.ctx.fillText('Click to restart', this.width / 2, this.height / 2 + 20);
                
                // Add click to restart
                if (!this.restartHandler) {
                    this.restartHandler = () => this.restart();
                    this.canvas.addEventListener('click', this.restartHandler);
                }
            }
        }
        
        drawStars() {
            // Draw background stars
            this.ctx.fillStyle = 'white';
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                const size = Math.random() * 2;
                this.ctx.fillRect(x, y, size, size);
            }
        }
        
        restart() {
            if (this.restartHandler) {
                this.canvas.removeEventListener('click', this.restartHandler);
                this.restartHandler = null;
            }
            this.initGame();
        }
    }
    
    /**
     * Jet Fighter Game Implementation
     */
    class JetFighterGame {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.width = canvas.width;
            this.height = canvas.height;
            this.player1 = { 
                x: 50, 
                y: this.height / 2, 
                angle: 0, 
                speed: 0, 
                rotationSpeed: 0.05, 
                acceleration: 0.1, 
                score: 0, 
                missiles: [], 
                color: 'rgba(0, 255, 255, 0.8)',
                alive: true
            };
            this.player2 = { 
                x: this.width - 50, 
                y: this.height / 2, 
                angle: Math.PI, 
                speed: 0, 
                rotationSpeed: 0.05, 
                acceleration: 0.1, 
                score: 0, 
                missiles: [], 
                color: 'rgba(255, 0, 255, 0.8)',
                alive: true
            };
            this.maxMissiles = 3;
            this.missileSpeed = 5;
            this.missileSize = 3;
            this.jetSize = 15;
            this.gameOver = false;
            this.interval = null;
            this.keyStates = {}; // Initialize the keyStates object
            this.restartHandler = null;
            this.twoPlayerMode = false;
            this.previousTime = performance.now(); // Initialize with current time
            
            // Create mode toggle button
            this.createModeToggle();
            
            // Bind event handlers
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleKeyUp = this.handleKeyUp.bind(this);
            this.update = this.update.bind(this);
        }
        
        createModeToggle() {
            // Create mode toggle container
            const toggleContainer = document.createElement('div');
            toggleContainer.style.marginBottom = '10px';
            toggleContainer.style.textAlign = 'center';
            
            // Create toggle button
            const toggleButton = document.createElement('button');
            toggleButton.textContent = '1-Player Mode';
            toggleButton.style.background = 'transparent';
            toggleButton.style.color = 'var(--neon-pink)';
            toggleButton.style.border = '1px solid var(--neon-pink)';
            toggleButton.style.padding = '5px 10px';
            toggleButton.style.borderRadius = '5px';
            toggleButton.style.fontFamily = '"Press Start 2P", cursive';
            toggleButton.style.fontSize = '0.7rem';
            toggleButton.style.cursor = 'pointer';
            
            // Add toggle button event listener
            toggleButton.addEventListener('click', () => {
                this.twoPlayerMode = !this.twoPlayerMode;
                toggleButton.textContent = this.twoPlayerMode ? '2-Player Mode' : '1-Player Mode';
                toggleButton.style.color = this.twoPlayerMode ? 'var(--neon-green)' : 'var(--neon-pink)';
                toggleButton.style.borderColor = this.twoPlayerMode ? 'var(--neon-green)' : 'var(--neon-pink)';
                
                // Reset game state when changing modes
                this.restart();
            });
            
            // Add toggle button to the container
            toggleContainer.appendChild(toggleButton);
            
            // Instructions
            const instructions = document.createElement('div');
            instructions.style.marginTop = '10px';
            instructions.style.fontSize = '10px';
            instructions.style.color = 'white';
            instructions.style.fontFamily = '"Press Start 2P", cursive';
            instructions.innerHTML = 'P1: ↑↓←→ + Space<br>P2: WASD + F';
            toggleContainer.appendChild(instructions);
            
            // Insert before canvas
            const canvasContainer = document.getElementById('game-canvas-container');
            canvasContainer.insertBefore(toggleContainer, this.canvas);
        }
        
        start() {
            this.previousTime = performance.now();
            this.initGame();
            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);
            requestAnimationFrame(this.update);
        }
        
        stop() {
            document.removeEventListener('keydown', this.handleKeyDown);
            document.removeEventListener('keyup', this.handleKeyUp);
            if (this.restartHandler) {
                this.canvas.removeEventListener('click', this.restartHandler);
                this.restartHandler = null;
            }
        }
        
        initGame() {
            this.player1 = { 
                x: 50, 
                y: this.height / 2, 
                angle: 0, 
                speed: 0, 
                rotationSpeed: 0.05, 
                acceleration: 0.1, 
                score: 0, 
                missiles: [], 
                color: 'rgba(0, 255, 255, 0.8)',
                alive: true
            };
            this.player2 = { 
                x: this.width - 50, 
                y: this.height / 2, 
                angle: Math.PI, 
                speed: 0, 
                rotationSpeed: 0.05, 
                acceleration: 0.1, 
                score: 0, 
                missiles: [], 
                color: 'rgba(255, 0, 255, 0.8)',
                alive: true
            };
            this.gameOver = false;
        }
        
        handleKeyDown(e) {
            this.keyStates[e.key] = true;
            
            // Fire missiles
            if (e.key === ' ' && this.player1.alive && this.player1.missiles.length < this.maxMissiles) {
                this.fireMissile(this.player1);
            }
            if (e.key === 'f' && this.twoPlayerMode && this.player2.alive && this.player2.missiles.length < this.maxMissiles) {
                this.fireMissile(this.player2);
            }
            
            // Prevent default behavior for game keys
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd', 'f'].includes(e.key)) {
                e.preventDefault();
            }
        }
        
        handleKeyUp(e) {
            this.keyStates[e.key] = false;
        }
        
        fireMissile(player) {
            const missile = {
                x: player.x + Math.cos(player.angle) * this.jetSize,
                y: player.y + Math.sin(player.angle) * this.jetSize,
                angle: player.angle,
                speed: this.missileSpeed + player.speed
            };
            player.missiles.push(missile);
        }
        
        update(currentTime) {
            // If currentTime is undefined (first frame), use previousTime
            if (!currentTime) {
                currentTime = this.previousTime + 16.67; // Add a typical frame duration
            }
            
            // Calculate time delta
            const delta = (currentTime - this.previousTime) / 16.67; // Normalize to ~60fps
            this.previousTime = currentTime;
            
            if (!this.gameOver) {
                // Player 1 controls (Arrow keys)
                if (this.player1.alive) {
                    if (this.keyStates['ArrowLeft']) {
                        this.player1.angle -= this.player1.rotationSpeed * delta;
                    }
                    if (this.keyStates['ArrowRight']) {
                        this.player1.angle += this.player1.rotationSpeed * delta;
                    }
                    if (this.keyStates['ArrowUp']) {
                        this.player1.speed += this.player1.acceleration * delta;
                        this.player1.speed = Math.min(this.player1.speed, 3);
                    } else {
                        this.player1.speed *= 0.98; // Slow down gradually
                    }
                    if (this.keyStates['ArrowDown']) {
                        this.player1.speed -= this.player1.acceleration * delta;
                        this.player1.speed = Math.max(this.player1.speed, -1.5);
                    }
                }
                
                // Player 2 controls (WASD)
                if (this.player2.alive) {
                    if (this.twoPlayerMode) {
                        if (this.keyStates['a']) {
                            this.player2.angle -= this.player2.rotationSpeed * delta;
                        }
                        if (this.keyStates['d']) {
                            this.player2.angle += this.player2.rotationSpeed * delta;
                        }
                        if (this.keyStates['w']) {
                            this.player2.speed += this.player2.acceleration * delta;
                            this.player2.speed = Math.min(this.player2.speed, 3);
                        } else {
                            this.player2.speed *= 0.98; // Slow down gradually
                        }
                        if (this.keyStates['s']) {
                            this.player2.speed -= this.player2.acceleration * delta;
                            this.player2.speed = Math.max(this.player2.speed, -1.5);
                        }
                    } else {
                        // AI control for player 2 in single player mode
                        this.controlAI(this.player2, this.player1, delta);
                    }
                }
                
                // Update player positions
                if (this.player1.alive) {
                    this.player1.x += Math.cos(this.player1.angle) * this.player1.speed * delta;
                    this.player1.y += Math.sin(this.player1.angle) * this.player1.speed * delta;
                }
                if (this.player2.alive) {
                    this.player2.x += Math.cos(this.player2.angle) * this.player2.speed * delta;
                    this.player2.y += Math.sin(this.player2.angle) * this.player2.speed * delta;
                }
                
                // Screen wrapping
                this.wrapPosition(this.player1);
                this.wrapPosition(this.player2);
                
                // Update missiles
                this.updateMissiles(this.player1, this.player2, delta);
                this.updateMissiles(this.player2, this.player1, delta);
                
                // Check for game over
                if (this.player1.score >= 5 || this.player2.score >= 5) {
                    this.gameOver = true;
                }
            }
            
            // Draw the game
            this.draw();
            
            // Continue the game loop
            if (!this.gameOver || (this.gameOver && !this.restartHandler)) {
                requestAnimationFrame(this.update);
            }
        }
        
        controlAI(ai, target, delta) {
            // Simple AI to target the player
            const dx = target.x - ai.x;
            const dy = target.y - ai.y;
            const targetAngle = Math.atan2(dy, dx);
            
            // Find the shortest angle to rotate
            let angleDiff = targetAngle - ai.angle;
            
            // Normalize angle to [-PI, PI]
            while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
            while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
            
            // Rotate towards the target
            if (angleDiff > 0.1) {
                ai.angle += ai.rotationSpeed * delta * 0.7;
            } else if (angleDiff < -0.1) {
                ai.angle -= ai.rotationSpeed * delta * 0.7;
            }
            
            // Accelerate towards target
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 100) {
                ai.speed += ai.acceleration * delta * 0.7;
                ai.speed = Math.min(ai.speed, 2.5);
            } else {
                ai.speed *= 0.97;
            }
            
            // Fire missiles occasionally
            if (ai.missiles.length < this.maxMissiles && Math.random() < 0.01 * delta && Math.abs(angleDiff) < 0.3) {
                this.fireMissile(ai);
            }
        }
        
        wrapPosition(player) {
            if (player.x < 0) player.x += this.width;
            if (player.x > this.width) player.x -= this.width;
            if (player.y < 0) player.y += this.height;
            if (player.y > this.height) player.y -= this.height;
        }
        
        updateMissiles(player, opponent, delta) {
            for (let i = 0; i < player.missiles.length; i++) {
                const missile = player.missiles[i];
                
                // Move the missile
                missile.x += Math.cos(missile.angle) * missile.speed * delta;
                missile.y += Math.sin(missile.angle) * missile.speed * delta;
                
                // Check if missile is out of bounds
                if (missile.x < 0 || missile.x > this.width || missile.y < 0 || missile.y > this.height) {
                    // Remove missile
                    player.missiles.splice(i, 1);
                    i--;
                    continue;
                }
                
                // Check collision with opponent
                if (opponent.alive && this.checkCollision(missile, opponent)) {
                    // Hit opponent
                    opponent.alive = false;
                    player.score++;
                    
                    // Remove missile
                    player.missiles.splice(i, 1);
                    i--;
                    
                    // Reset positions after a short delay
                    setTimeout(() => {
                        this.resetPlayers();
                    }, 1500);
                    
                    continue;
                }
            }
        }
        
        resetPlayers() {
            if (this.gameOver) return;
            
            this.player1.x = 50;
            this.player1.y = this.height / 2;
            this.player1.angle = 0;
            this.player1.speed = 0;
            this.player1.missiles = [];
            this.player1.alive = true;
            
            this.player2.x = this.width - 50;
            this.player2.y = this.height / 2;
            this.player2.angle = Math.PI;
            this.player2.speed = 0;
            this.player2.missiles = [];
            this.player2.alive = true;
        }
        
        checkCollision(missile, player) {
            const dx = missile.x - player.x;
            const dy = missile.y - player.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance < this.jetSize;
        }
        
        draw() {
            // Clear canvas
            this.ctx.fillStyle = 'black';
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Draw stars
            this.drawStars();
            
            // Draw score
            this.ctx.font = '20px "Press Start 2P"';
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = this.player1.color;
            this.ctx.fillText(this.player1.score.toString(), 30, 30);
            this.ctx.fillStyle = this.player2.color;
            this.ctx.fillText(this.player2.score.toString(), this.width - 30, 30);
            
            // Draw player 1 jet if alive
            if (this.player1.alive) {
                this.drawJet(this.player1);
            }
            
            // Draw player 2 jet if alive
            if (this.player2.alive) {
                this.drawJet(this.player2);
            }
            
            // Draw missiles for player 1
            this.ctx.fillStyle = this.player1.color;
            for (const missile of this.player1.missiles) {
                this.ctx.beginPath();
                this.ctx.arc(missile.x, missile.y, this.missileSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw missiles for player 2
            this.ctx.fillStyle = this.player2.color;
            for (const missile of this.player2.missiles) {
                this.ctx.beginPath();
                this.ctx.arc(missile.x, missile.y, this.missileSize, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // Draw game over message if applicable
            if (this.gameOver) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                this.ctx.fillRect(0, this.height / 2 - 50, this.width, 100);
                
                this.ctx.font = '24px "Press Start 2P"';
                this.ctx.textAlign = 'center';
                this.ctx.fillStyle = this.player1.score > this.player2.score ? this.player1.color : this.player2.color;
                
                const winner = this.player1.score > this.player2.score ? "P1" : "P2";
                this.ctx.fillText(`${winner} WINS!`, this.width / 2, this.height / 2 - 10);
                
                this.ctx.font = '12px "Press Start 2P"';
                this.ctx.fillText('Click to restart', this.width / 2, this.height / 2 + 20);
                
                // Add click to restart
                if (!this.restartHandler) {
                    this.restartHandler = () => this.restart();
                    this.canvas.addEventListener('click', this.restartHandler);
                }
            }
        }
        
        drawJet(player) {
            this.ctx.save();
            this.ctx.translate(player.x, player.y);
            this.ctx.rotate(player.angle);
            
            // Draw jet
            this.ctx.beginPath();
            this.ctx.moveTo(this.jetSize, 0);
            this.ctx.lineTo(-this.jetSize / 2, -this.jetSize / 2);
            this.ctx.lineTo(-this.jetSize / 2, this.jetSize / 2);
            this.ctx.closePath();
            
            this.ctx.fillStyle = player.color;
            this.ctx.fill();
            this.ctx.strokeStyle = 'white';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
            
            // Draw exhaust if accelerating
            if ((player === this.player1 && this.keyStates['ArrowUp']) || 
                (player === this.player2 && ((this.twoPlayerMode && this.keyStates['w']) || (!this.twoPlayerMode && player.speed > 0.1)))) {
                this.ctx.beginPath();
                this.ctx.moveTo(-this.jetSize / 2, 0);
                this.ctx.lineTo(-this.jetSize, -this.jetSize / 4);
                this.ctx.lineTo(-this.jetSize * 2, 0);
                this.ctx.lineTo(-this.jetSize, this.jetSize / 4);
                this.ctx.closePath();
                
                this.ctx.fillStyle = 'rgba(255, 165, 0, 0.8)';
                this.ctx.fill();
            }
            
            this.ctx.restore();
        }
        
        drawStars() {
            this.ctx.fillStyle = 'white';
            for (let i = 0; i < 100; i++) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                const size = Math.random() * 2;
                this.ctx.fillRect(x, y, size, size);
            }
        }
        
        restart() {
            if (this.restartHandler) {
                this.canvas.removeEventListener('click', this.restartHandler);
                this.restartHandler = null;
            }
            this.initGame();
            requestAnimationFrame(this.update);
        }
    }
    
    /**
     * SANDBOX Game Implementation
     */
    // Initialize the arcade
    init();
});
