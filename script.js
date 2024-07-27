// Game variables
let score = 0;
let lives = 3;
let currentProblem = {};
let zombiePosition = -20;
let zombieSpeed = 0.1;
let isFiring = false;
let isGameStarted = false;
let isPaused = false;
let difficulty = 1;
let combo = 0;
let highScore = 0;
let gameStartTime = 0;
let isFirstZombie = true;
let gameDuration = 120000; // 2 minutes in milliseconds
let timeRemaining = gameDuration;
let chronometerInterval;

// Audio elements
let backgroundMusic;
let cannonSound;

// DOM elements
const gameContainer = document.getElementById('game-container');
const zombieContainer = document.getElementById('zombie-container');
const equationBubble = document.getElementById('equation-bubble');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const answerInput = document.getElementById('answer-input');
const clearBtn = document.getElementById('clear-btn');
const attackBtn = document.getElementById('attack-btn');
const numButtons = document.querySelectorAll('.num-btn');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const finalScoreDisplay = document.getElementById('final-score');
const pauseBtn = document.getElementById('pause-btn');
const cannonBarrel = document.getElementById('cannon-barrel');
const chronometerDisplay = document.getElementById('chronometer');

// Initialize audio
function initAudio() {
    backgroundMusic = new Audio('background-music.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;

    cannonSound = new Audio('cannon-sound.mp3');
    cannonSound.volume = 0.7;
}

// Play background music
function playBackgroundMusic() {
    backgroundMusic.play();
}

// Pause background music
function pauseBackgroundMusic() {
    backgroundMusic.pause();
}

// Play cannon sound
function playCannonSound() {
    cannonSound.currentTime = 0;
    cannonSound.play();
}

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
attackBtn.addEventListener('click', checkAnswer);
clearBtn.addEventListener('click', clearAnswer);
pauseBtn.addEventListener('click', togglePause);

numButtons.forEach(button => {
    button.addEventListener('click', () => {
        answerInput.value += button.textContent;
    });
});

answerInput.addEventListener('keydown', handleKeyboardInput);

// Function to handle keyboard input
function handleKeyboardInput(e) {
    if (e.key === 'Enter') {
        checkAnswer();
    } else if (e.key === 'Backspace') {
        // Allow backspace to remove characters
        return;
    } else if (!/^[0-9]$/.test(e.key)) {
        // Prevent non-numeric input
        e.preventDefault();
    }
}

// Game functions
function startGame() {
    initAudio();
    playBackgroundMusic();
    score = 0;
    lives = 3;
    zombiePosition = -20;
    zombieSpeed = 0.1;
    difficulty = 1;
    combo = 0;
    isFirstZombie = true;
    timeRemaining = gameDuration;
    updateScore();
    updateLives();
    updateChronometer();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    isGameStarted = false; // Set to false initially
    isPaused = false;
    showStartCountdown();
}

function spawnZombie() {
    zombiePosition = -20;
    updateZombiePosition();
    generateProblem();
    showZombieAndEquation();
}

function hideZombieAndEquation() {
    zombieContainer.style.visibility = 'hidden';
    equationBubble.style.visibility = 'hidden';
}

function showZombieAndEquation() {
    zombieContainer.style.visibility = 'visible';
    equationBubble.style.visibility = 'visible';
}

function showStartCountdown() {
    let countdown = 3;
    const countdownElement = document.createElement('div');
    countdownElement.id = 'countdown';
    countdownElement.style.position = 'absolute';
    countdownElement.style.top = '50%';
    countdownElement.style.left = '50%';
    countdownElement.style.transform = 'translate(-50%, -50%)';
    countdownElement.style.fontSize = '72px';
    countdownElement.style.color = '#fff';
    gameContainer.appendChild(countdownElement);

    const countdownInterval = setInterval(() => {
        if (countdown > 0) {
            countdownElement.textContent = countdown;
            countdown--;
        } else {
            countdownElement.textContent = 'Go!';
            setTimeout(() => {
                gameContainer.removeChild(countdownElement);
                isGameStarted = true;
                gameStartTime = Date.now();
                spawnZombie();
                startChronometer();
                requestAnimationFrame(gameLoop);
            }, 1000);
            clearInterval(countdownInterval);
        }
    }, 1000);
}

function generateProblem() {
    const operations = ['+', '-', 'x'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let num1, num2;

    switch (operation) {
        case '+':
            num1 = Math.floor(Math.random() * (10 * difficulty)) + 1;
            num2 = Math.floor(Math.random() * (10 * difficulty)) + 1;
            break;
        case '-':
            num1 = Math.floor(Math.random() * (10 * difficulty)) + 1;
            num2 = Math.floor(Math.random() * num1) + 1; // Ensure num2 is less than or equal to num1
            break;
        case 'x':
            num1 = Math.floor(Math.random() * (5 * difficulty)) + 1;
            num2 = Math.floor(Math.random() * (5 * difficulty)) + 1;
            break;
    }

    currentProblem = {
        question: `${num1} ${operation} ${num2}`,
        answer: operation === 'x' ? num1 * num2 : eval(`${num1} ${operation === 'x' ? '*' : operation} ${num2}`)
    };

    equationBubble.textContent = currentProblem.question;
    answerInput.value = '';
}

function checkAnswer() {
    const userAnswer = parseInt(answerInput.value);
    if (userAnswer === currentProblem.answer) {
        score += 10 * difficulty * (1 + combo * 0.1);
        combo++;
        updateScore();
        fireCannon();
        spawnZombie();
        increaseDifficulty();
    } else {
        lives--;
        combo = 0;
        updateLives();
        if (lives === 0) {
            endGame();
        }
    }
    answerInput.value = '';
}

function clearAnswer() {
    answerInput.value = '';
}

function updateZombiePosition() {
    zombieContainer.style.top = `${zombiePosition}%`;
}

function gameLoop(timestamp) {
    if (!isGameStarted || isPaused) return;

    const elapsedTime = Date.now() - gameStartTime;

    zombiePosition += zombieSpeed;
    updateZombiePosition();

    if (zombiePosition >= 80) {
        lives--;
        combo = 0;
        updateLives();
        if (lives === 0) {
            endGame();
        } else {
            spawnZombie();
        }
    }

    if (isGameStarted) {
        requestAnimationFrame(gameLoop);
    }
}

function updateScore() {
    scoreDisplay.textContent = Math.floor(score);
}

function updateLives() {
    livesDisplay.innerHTML = '❤️'.repeat(lives);
}

function endGame() {
    isGameStarted = false;
    pauseBackgroundMusic();
    gameOverScreen.classList.remove('hidden');
    finalScoreDisplay.textContent = Math.floor(score);
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    document.getElementById('high-score').textContent = Math.floor(highScore);
    stopChronometer();
}

function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? '▶️' : '⏸️';
    if (!isPaused) {
        gameStartTime = Date.now() - (gameDuration - timeRemaining);
        requestAnimationFrame(gameLoop);
        startChronometer();
        playBackgroundMusic();
    } else {
        stopChronometer();
        pauseBackgroundMusic();
    }
}

function fireCannon() {
    if (!isFiring) {
        isFiring = true;
        cannonBarrel.classList.add('firing');
        playCannonSound();
        setTimeout(() => {
            cannonBarrel.classList.remove('firing');
            isFiring = false;
        }, 500);
    }
}

function increaseDifficulty() {
    if (score > difficulty * 100) {
        difficulty++;
        zombieSpeed += 0.02;
    }
}

function startChronometer() {
    chronometerInterval = setInterval(() => {
        if (!isPaused) {
            timeRemaining -= 1000;
            updateChronometer();
            if (timeRemaining <= 0) {
                endGame();
            }
        }
    }, 1000);
}

function stopChronometer() {
    clearInterval(chronometerInterval);
}

function updateChronometer() {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);
    chronometerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Initialize the game
highScore = localStorage.getItem('highScore') || 0;
updateScore();
updateLives();
updateChronometer();
hideZombieAndEquation();