// Global variables
let currentTopic = '';
let currentMode = '';
let currentDifficulty = 'easy';
let score = 0;
let correctAnswers = 0;
let totalQuestions = 0;
let timerInterval = null;
let startTime = 0;
let gameState = {};
let musicPlaying = true;
let selectedSlices = 0;
let totalSlices = 8;
let selectedPercentSlices = 0;

// Music controls using Web Audio API
let audioContext;
let musicGainNode;
let currentNote = 0;
let musicInterval;

// Happy melody notes (frequencies in Hz)
const melody = [
    523.25, 587.33, 659.25, 587.33, 523.25, 587.33, 659.25, 698.46,
    783.99, 698.46, 659.25, 587.33, 523.25, 587.33, 659.25, 523.25
];

function playNote(frequency, duration) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(musicGainNode);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'triangle';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function playMelody() {
    playNote(melody[currentNote], 0.4);
    currentNote = (currentNote + 1) % melody.length;
}

function toggleMusic() {
    const btn = document.getElementById('musicToggle');
    
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        musicGainNode = audioContext.createGain();
        musicGainNode.connect(audioContext.destination);
        musicGainNode.gain.value = 0.3;
    }
    
    if (musicPlaying) {
        if (musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        }
        btn.textContent = '🔇 Music: OFF';
        musicPlaying = false;
    } else {
        musicInterval = setInterval(playMelody, 500);
        btn.textContent = '🎵 Music: ON';
        musicPlaying = true;
    }
}

function setVolume(value) {
    if (musicGainNode) {
        musicGainNode.gain.value = value / 100;
    }
}

// Initialize music
function initMusic() {
    // Music will start when user clicks the toggle button
    console.log('Click music button to start playing!');
}

// Progress tracking
const progressData = {
    algebra: 0,
    geometry: 0,
    fractions: 0,
    percentages: 0,
    integers: 0,
    ratios: 0
};

// Load progress from localStorage
function loadProgress() {
    const saved = localStorage.getItem('mathTutorProgress');
    if (saved) {
        Object.assign(progressData, JSON.parse(saved));
    }
    updateProgressDisplay();
}

// Save progress to localStorage
function saveProgress() {
    localStorage.setItem('mathTutorProgress', JSON.stringify(progressData));
    updateProgressDisplay();
}

// Update progress display
function updateProgressDisplay() {
    const progressBars = document.getElementById('progressBars');
    progressBars.innerHTML = '';
    
    for (const [topic, score] of Object.entries(progressData)) {
        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <div class="progress-label">
                <span>${topic.charAt(0).toUpperCase() + topic.slice(1)}</span>
                <span>${score} points</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${Math.min(score, 100)}%">
                    ${score > 10 ? score : ''}
                </div>
            </div>
        `;
        progressBars.appendChild(progressItem);
    }
}

// Show specific section
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    // Refresh student login dropdown when showing student login
    if (sectionId === 'studentLogin' && typeof refreshStudentLoginDropdown === 'function') {
        refreshStudentLoginDropdown();
    }
}

// Start game
function startGame() {
    score = 0;
    correctAnswers = 0;
    totalQuestions = 0;
    startTime = Date.now();
    
    document.getElementById('scoreDisplay').textContent = 'Score: 0';
    showSection('gameScreen');
    startTimer();
    
    // Load interactive game elements for algebra and geometry
    loadGameInteractive();
    
    // Load game based on mode
    if (currentMode === 'quiz') {
        startQuizMode();
    } else if (currentMode === 'puzzle') {
        startPuzzleMode();
    } else if (currentMode === 'challenge') {
        startChallengeMode();
    }
}

// Load interactive game elements during gameplay
function loadGameInteractive() {
    const gameInteractiveArea = document.getElementById('gameInteractiveArea');
    
    if (currentTopic === 'algebra') {
        gameInteractiveArea.innerHTML = `
            <div class="game-interactive-container">
                <h3 class="interactive-title">🚶 Number Line Journey</h3>
                <div class="number-line-game compact">
                    <div class="number-line-container">
                        <div class="number-line">
                            <div class="number-marker" id="numberMarker" style="left: 50%;">🧮</div>
                            <div class="number-labels" id="numberLabels"></div>
                        </div>
                    </div>
                    <div class="number-display" id="currentNumberDisplay">Current Position: <span id="currentNum">0</span></div>
                    <div class="number-line-controls">
                        <button class="control-btn subtract" onclick="moveNumberLine(-5)">-5</button>
                        <button class="control-btn subtract" onclick="moveNumberLine(-1)">-1</button>
                        <button class="control-btn add" onclick="moveNumberLine(1)">+1</button>
                        <button class="control-btn add" onclick="moveNumberLine(5)">+5</button>
                    </div>
                    <div class="operation-history" id="operationHistory">Operations: Start at 0</div>
                    <button class="reset-btn compact" onclick="resetNumberLine()">🔄 Reset</button>
                </div>
            </div>
        `;
        initNumberLine();
    } else if (currentTopic === 'geometry') {
        gameInteractiveArea.innerHTML = `
            <div class="game-interactive-container">
                <h3 class="interactive-title">📐 Shape Builder</h3>
                <div class="shape-builder-enhanced compact">
                    <div class="shape-selector compact">
                        <button class="shape-btn compact" onclick="selectShape('square')">🟦</button>
                        <button class="shape-btn compact" onclick="selectShape('rectangle')">🟥</button>
                        <button class="shape-btn compact" onclick="selectShape('triangle')">🔺</button>
                        <button class="shape-btn compact" onclick="selectShape('circle')">🟢</button>
                    </div>
                    <div class="shape-canvas compact" id="shapeCanvas">
                        <div class="shape-container" id="currentShape">
                            <div class="shape-square" id="shapeDisplay"></div>
                        </div>
                    </div>
                    <div class="shape-controls compact">
                        <div class="control-group compact">
                            <label for="dimension1"><span id="dim1Label">Side</span>: <span id="dim1Value">5</span></label>
                            <input type="range" id="dimension1" min="2" max="15" value="5" oninput="updateShape()" class="slider">
                        </div>
                        <div class="control-group compact" id="dimension2Group" style="display:none;">
                            <label for="dimension2"><span id="dim2Label">Width</span>: <span id="dim2Value">5</span></label>
                            <input type="range" id="dimension2" min="2" max="15" value="5" oninput="updateShape()" class="slider">
                        </div>
                    </div>
                    <div class="shape-info-display compact" id="shapeResults">
                        <p><strong>Area:</strong> <span id="areaResult">25</span> | <strong>Perimeter:</strong> <span id="perimeterResult">20</span></p>
                    </div>
                </div>
            </div>
        `;
        currentGeometryShape = 'square';
        updateShape();
    } else if (currentTopic === 'integers') {
        gameInteractiveArea.innerHTML = `
            <div class="game-interactive-container">
                <h3 class="interactive-title">🌡️ Temperature</h3>
                <div class="thermometer-interactive compact">
                    <div class="thermometer compact" id="thermometer" onclick="changeTemp(event)">
                        <div class="temp-marker" id="tempMarker" style="top: 150px;"></div>
                    </div>
                    <div class="temp-display" id="tempDisplay">0°C</div>
                    <p style="font-size: 0.9em; margin: 5px 0;">Click to change temperature</p>
                </div>
            </div>
        `;
    } else if (currentTopic === 'ratios') {
        gameInteractiveArea.innerHTML = `
            <div class="game-interactive-container">
                <h3 class="interactive-title">🧃 Ratio Mixer</h3>
                <div class="ratio-mixer compact">
                    <div class="ratio-bar-container compact">
                        <div class="ratio-bar blue" id="ratioBarA" style="width: 50%;"></div>
                        <div class="ratio-bar orange" id="ratioBarB" style="width: 50%;"></div>
                    </div>
                    <div class="ratio-result compact">
                        <span id="ratioDisplay">1:1</span>
                    </div>
                    <div class="ratio-controls compact">
                        <input type="range" id="partA" min="1" max="10" value="5" oninput="updateRatio()" class="slider">
                        <input type="range" id="partB" min="1" max="10" value="5" oninput="updateRatio()" class="slider">
                    </div>
                </div>
            </div>
        `;
        initRatio();
    } else if (currentTopic === 'nature') {
        gameInteractiveArea.innerHTML = `
            <div class="game-interactive-container">
                <h3 class="interactive-title">🌿 Fibonacci Garden</h3>
                <div class="fibonacci-garden compact">
                    <div class="garden-display compact">
                        <div class="flower-card compact" onclick="showFlower(3)">
                            <div class="flower-icon" style="font-size: 2.5em;">🌷</div>
                            <p style="font-size: 0.8em;">3 petals</p>
                        </div>
                        <div class="flower-card compact" onclick="showFlower(5)">
                            <div class="flower-icon" style="font-size: 2.5em;">🌼</div>
                            <p style="font-size: 0.8em;">5 petals</p>
                        </div>
                        <div class="flower-card compact" onclick="showFlower(8)">
                            <div class="flower-icon" style="font-size: 2.5em;">🌸</div>
                            <p style="font-size: 0.8em;">8 petals</p>
                        </div>
                        <div class="flower-card compact" onclick="showFlower(13)">
                            <div class="flower-icon" style="font-size: 2.5em;">🌺</div>
                            <p style="font-size: 0.8em;">13 petals</p>
                        </div>
                    </div>
                    <div class="fibonacci-display compact" id="fibonacciDisplay">
                        <div class="fib-sequence compact" id="fibSequence">1, 1, 2, 3, 5, 8, 13...</div>
                        <p class="fib-info compact" id="fibInfo">Click a flower!</p>
                    </div>
                    <canvas id="fibonacciCanvas" width="200" height="200" style="margin: 10px auto; display: block;"></canvas>
                </div>
            </div>
        `;
        initFibonacci();
    } else {
        gameInteractiveArea.innerHTML = '';
    }
}

// Timer
function startTimer() {
    const timerDisplay = document.getElementById('timerDisplay');
    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        timerDisplay.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Update score
function updateScore(points) {
    score += points;
    document.getElementById('scoreDisplay').textContent = `Score: ${score}`;
}

// End game and show results
function endGame() {
    stopTimer();
    
    // Update progress
    progressData[currentTopic] += score;
    saveProgress();
    
    // Calculate time taken
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(timeTaken / 60);
    const seconds = timeTaken % 60;
    
    // Save result to database if student session exists
    const isAssignment = gameState.assignmentId !== null && gameState.assignmentId !== undefined;
    if (typeof db !== 'undefined' && gameState.studentId && gameState.classId) {
        const resultData = {
            studentId: gameState.studentId,
            classId: gameState.classId,
            assignmentId: gameState.assignmentId || null,
            topic: currentTopic,
            mode: currentMode,
            difficulty: currentDifficulty,
            score: score,
            correctAnswers: correctAnswers,
            totalQuestions: totalQuestions,
            timeTaken: timeTaken
        };
        db.saveResult(resultData);
    }
    
    // Display results
    const finalScore = document.getElementById('finalScore');
    const resultTopic = document.getElementById('resultTopic');
    const resultMode = document.getElementById('resultMode');
    const resultDifficulty = document.getElementById('resultDifficulty');
    const resultCorrect = document.getElementById('resultCorrect');
    const resultTime = document.getElementById('resultTime');
    
    if (finalScore) finalScore.textContent = score;
    if (resultTopic) resultTopic.textContent = currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1);
    if (resultMode) resultMode.textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
    if (resultDifficulty) resultDifficulty.textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    if (resultCorrect) resultCorrect.textContent = `${correctAnswers} / ${totalQuestions}`;
    if (resultTime) resultTime.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    // Show assignment completion message if applicable
    if (isAssignment) {
        const resultsScreen = document.getElementById('resultsScreen');
        const resultsDetails = resultsScreen ? resultsScreen.querySelector('.results-details') : null;
        if (resultsDetails) {
            const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
            const existingMsg = resultsDetails.querySelector('.assignment-success-msg');
            if (!existingMsg) {
                resultsDetails.innerHTML += 
                    `<p class="assignment-success-msg" style="color: #28a745; font-weight: bold; margin-top: 20px;">✅ Assignment submitted successfully!</p>`;
            }
        }
    }
    
    showSection('resultsScreen');
    
    // Auto-redirect to student dashboard for assignments
    if (isAssignment && typeof showSection !== 'undefined') {
        setTimeout(() => {
            showSection('studentDashboard');
            if (typeof switchStudentTab === 'function') {
                switchStudentTab('completed');
            }
            // Clear assignment context
            gameState.assignmentId = null;
        }, 3000);
    }
}

// Play again
function playAgain() {
    showSection('gameModeMenu');
}

// Share on WhatsApp
function shareOnWhatsApp() {
    const message = `🎯 My 7th Grade Math Score!\n\n` +
                   `📚 Topic: ${currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1)}\n` +
                   `🎮 Mode: ${currentMode.charAt(0).toUpperCase() + currentMode.slice(1)}\n` +
                   `💪 Difficulty: ${currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1)}\n` +
                   `⭐ Score: ${score} points\n` +
                   `✅ Correct: ${correctAnswers}/${totalQuestions}\n` +
                   `⏱️ Time: ${document.getElementById('resultTime').textContent}\n\n` +
                   `Try the 7th Grade Math Tutor and beat my score!`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Learning concepts with real-life examples
const learningConcepts = {
    algebra: {
        title: "Understanding Algebra",
        interactive: true,
        content: `
            <h3>What is Algebra? 🧮</h3>
            <p>Algebra is like solving puzzles where some numbers are hidden! We use letters (like x, y) to represent these mystery numbers.</p>
            
            <div class="example-box">
                <h4><span class="emoji">🍫</span>Chocolate Bar Example</h4>
                <p>Imagine you have some chocolates in a box (let's call this 'x'). Your friend gives you 5 more chocolates.</p>
                <p>Now you have: <strong>x + 5</strong> chocolates</p>
                <p>If you count and find you have 12 chocolates total, then:</p>
                <p><strong>x + 5 = 12</strong></p>
                <p>So x must be <strong>7</strong> chocolates! (Because 7 + 5 = 12)</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">🎮</span>Video Game Points</h4>
                <p>You score the same number of points in 3 games. Your total is 15 points.</p>
                <p>Points per game = <strong>3x = 15</strong></p>
                <p>So x = <strong>5 points</strong> per game!</p>
            </div>
            
            <div class="key-points">
                <h4>💡 Key Things to Remember:</h4>
                <ul>
                    <li>Letters represent unknown numbers we need to find</li>
                    <li>Do the same thing to both sides of the equation</li>
                    <li>Work backwards: if adding, subtract; if multiplying, divide</li>
                </ul>
            </div>
        `
    },
    fractions: {
        title: "Understanding Fractions",
        interactive: true,
        content: `
            <h3>What are Fractions? 🍕</h3>
            <p>A fraction is a part of a whole. Think of it as sharing something fairly!</p>
            
            <div class="example-box">
                <h4><span class="emoji">🍕</span>Interactive Pizza Party!</h4>
                <p>Click on the pizza slices below to "eat" them and see how fractions work!</p>
                <p><strong>Top number</strong> = slices you ate</p>
                <p><strong>Bottom number</strong> = total slices</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">🍰</span>Adding Fractions - Cake Sharing</h4>
                <p>You ate 1/4 of a cake and your friend ate 2/4 of the same cake.</p>
                <p>Together you ate: <strong>1/4 + 2/4 = 3/4</strong> of the cake!</p>
                <p>When fractions have the same bottom number, just add the top numbers!</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">🧃</span>Real Life Fractions</h4>
                <p><strong>1/2</strong> = Half a juice box</p>
                <p><strong>1/4</strong> = Quarter of your allowance</p>
                <p><strong>3/4</strong> = Three-quarters of the movie finished</p>
            </div>
            
            <div class="key-points">
                <h4>💡 Key Things to Remember:</h4>
                <ul>
                    <li>Bottom number = how many equal parts total</li>
                    <li>Top number = how many parts you have</li>
                    <li>Bigger bottom number = smaller pieces</li>
                    <li>1/2 is bigger than 1/4 (half pizza vs quarter pizza!)</li>
                </ul>
            </div>
        `
    },
    geometry: {
        title: "Understanding Geometry",
        interactive: true,
        content: `
            <h3>What is Geometry? 📐</h3>
            <p>Geometry is about shapes, sizes, and spaces around us. Everything you see has a shape!</p>
            
            <div class="example-box">
                <h4><span class="emoji">🏠</span>Shapes Around Your Home</h4>
                <p><strong>Rectangles:</strong> Your phone screen, door, book</p>
                <p><strong>Circles:</strong> Pizza, clock, wheel</p>
                <p><strong>Triangles:</strong> Slice of pizza, roof of a house</p>
                <p><strong>Squares:</strong> Tiles, windows, game board</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">📏</span>Measuring Your Room</h4>
                <p>Want to know if your bed fits? Measure the area!</p>
                <p><strong>Area of rectangle = Length × Width</strong></p>
                <p>If your room is 4 meters long and 3 meters wide:</p>
                <p>Area = 4 × 3 = <strong>12 square meters</strong></p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">🎨</span>Fencing the Garden</h4>
                <p>How much fence do you need? Calculate perimeter!</p>
                <p><strong>Perimeter = Add all sides</strong></p>
                <p>Square garden with 5m sides: 5 + 5 + 5 + 5 = <strong>20 meters</strong> of fence</p>
            </div>
            
            <div class="key-points">
                <h4>💡 Key Things to Remember:</h4>
                <ul>
                    <li>Area = space inside (measured in square units)</li>
                    <li>Perimeter = distance around (add all sides)</li>
                    <li>Angles in a triangle always add up to 180°</li>
                    <li>A right angle = 90° (like a corner of a book)</li>
                </ul>
            </div>
        `
    },
    percentages: {
        title: "Understanding Percentages",
        interactive: true,
        content: `
            <h3>What are Percentages? 💯</h3>
            <p>Percentage means "out of 100". The % symbol is just a short way to say "per hundred".</p>
            
            <div class="example-box">
                <h4><span class="emoji">🍕</span>Interactive Pizza Percentages!</h4>
                <p>Click on the pizza quarters below to see percentages! Each slice = 25%</p>
                <p><strong>4 slices = 100%</strong> (the whole pizza)</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">🎯</span>Test Scores</h4>
                <p>You got 18 questions right out of 20. What's your percentage?</p>
                <p>18/20 = 90/100 = <strong>90%</strong></p>
                <p>You scored 90 out of every 100 possible points - Great job!</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">🛍️</span>Shopping Sale!</h4>
                <p>A game costs $80 and there's a 25% discount. How much do you save?</p>
                <p>25% of $80 = (25/100) × 80 = <strong>$20 off</strong></p>
                <p>Final price = $80 - $20 = <strong>$60</strong></p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">📱</span>Phone Battery</h4>
                <p>Your phone shows 50% battery. This means:</p>
                <p>Half the battery is remaining (50 out of 100)</p>
                <p>75% battery = Three-quarters full</p>
                <p>25% battery = One-quarter full (time to charge!)</p>
            </div>
            
            <div class="key-points">
                <h4>💡 Key Things to Remember:</h4>
                <ul>
                    <li>100% = the whole thing (everything)</li>
                    <li>50% = half (1/2)</li>
                    <li>25% = quarter (1/4)</li>
                    <li>To find percentage: (part ÷ total) × 100</li>
                </ul>
            </div>
        `
    },
    integers: {
        title: "Understanding Integers",
        interactive: true,
        content: `
            <h3>What are Integers? ➕➖</h3>
            <p>Integers are whole numbers that can be positive, negative, or zero.</p>
            
            <div class="example-box">
                <h4><span class="emoji">🌡️</span>Temperature</h4>
                <p>Think of a thermometer:</p>
                <p><strong>+5°C</strong> = 5 degrees above zero (warm)</p>
                <p><strong>-3°C</strong> = 3 degrees below zero (cold!)</p>
                <p>If temperature rises from -3°C to +5°C, it went up by <strong>8 degrees</strong></p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">💰</span>Allowance & Spending</h4>
                <p>You start with $10 (positive)</p>
                <p>You spend $12 - now you owe $2 (that's <strong>-2</strong>)</p>
                <p>You earn $7 - now you have $5 (<strong>-2 + 7 = +5</strong>)</p>
                <p>Negative = owing money, Positive = having money</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">🏢</span>Building Floors</h4>
                <p>Ground floor = 0</p>
                <p>3rd floor = +3 (3 floors up)</p>
                <p>Basement 2 = -2 (2 floors down)</p>
                <p>Going from -2 to +3 means going up <strong>5 floors</strong></p>
            </div>
            
            <div class="key-points">
                <h4>💡 Key Things to Remember:</h4>
                <ul>
                    <li>Adding negative = subtracting (5 + (-3) = 5 - 3 = 2)</li>
                    <li>Subtracting negative = adding (5 - (-3) = 5 + 3 = 8)</li>
                    <li>Two negatives multiply = positive (-2 × -3 = +6)</li>
                    <li>Positive × negative = negative (2 × -3 = -6)</li>
                </ul>
            </div>
        `
    },
    ratios: {
        title: "Understanding Ratios",
        interactive: true,
        content: `
            <h3>What are Ratios? ⚖️</h3>
            <p>A ratio compares two amounts. It shows how much of one thing there is compared to another.</p>
            
            <div class="example-box">
                <h4><span class="emoji">🥤</span>Making Juice</h4>
                <p>Recipe says: Mix juice and water in ratio <strong>2:3</strong></p>
                <p>This means: For every 2 cups of juice, add 3 cups of water</p>
                <p>If you use 4 cups of juice, use 6 cups of water</p>
                <p>If you use 6 cups of juice, use 9 cups of water</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">👥</span>Class Ratio</h4>
                <p>Your class has 12 boys and 18 girls</p>
                <p>Ratio = <strong>12:18</strong></p>
                <p>Simplified = <strong>2:3</strong> (divide both by 6)</p>
                <p>This means: For every 2 boys, there are 3 girls</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">🍪</span>Sharing Cookies</h4>
                <p>Share 20 cookies between you and your friend in ratio 2:3</p>
                <p>Total parts = 2 + 3 = 5 parts</p>
                <p>Each part = 20 ÷ 5 = 4 cookies</p>
                <p>You get: 2 × 4 = <strong>8 cookies</strong></p>
                <p>Friend gets: 3 × 4 = <strong>12 cookies</strong></p>
            </div>
            
            <div class="key-points">
                <h4>💡 Key Things to Remember:</h4>
                <ul>
                    <li>Ratio shows comparison, not actual amounts</li>
                    <li>Order matters: 2:3 is different from 3:2</li>
                    <li>Simplify ratios like fractions (divide by common factor)</li>
                    <li>Keep ratios in same units (don't mix meters and centimeters)</li>
                </ul>
            </div>
        `
    },
    nature: {
        title: "Math in Nature",
        interactive: true,
        content: `
            <h3>Math is Everywhere in Nature! 🌿</h3>
            <p>Nature is full of mathematical patterns, from the spirals in shells to the symmetry of flowers!</p>
            
            <div class="example-box">
                <h4><span class="emoji">🌻</span>Fibonacci in Flowers</h4>
                <p>Count the petals on flowers - they often follow Fibonacci numbers!</p>
                <p>Lily: <strong>3 petals</strong></p>
                <p>Buttercup: <strong>5 petals</strong></p>
                <p>Daisy: <strong>34 petals</strong></p>
                <p>Fibonacci sequence: 1, 1, 2, 3, 5, 8, 13, 21, 34...</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">🐚</span>Spirals in Shells</h4>
                <p>Nautilus shells grow in a perfect logarithmic spiral!</p>
                <p>Each chamber is <strong>1.618 times</strong> larger than the previous</p>
                <p>This is called the <strong>Golden Ratio</strong> (φ = 1.618)</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">❄️</span>Snowflake Symmetry</h4>
                <p>Every snowflake has <strong>6-fold symmetry</strong></p>
                <p>This comes from the hexagonal structure of ice crystals</p>
                <p>Honeycombs also use hexagons - they're the most efficient shape!</p>
            </div>
            
            <div class="example-box">
                <h4><span class="emoji">🌳</span>Fractals in Trees</h4>
                <p>Tree branches split following a fractal pattern</p>
                <p>Each branch looks like a mini version of the whole tree!</p>
                <p>Ferns, coastlines, and clouds also show fractal patterns</p>
            </div>
            
            <div class="key-points">
                <h4>💡 Key Things to Remember:</h4>
                <ul>
                    <li>Fibonacci numbers appear in petals, spirals, and branches</li>
                    <li>Golden ratio (φ ≈ 1.618) creates pleasing proportions</li>
                    <li>Symmetry is common: mirror (butterflies), radial (flowers)</li>
                    <li>Fractals repeat the same pattern at different scales</li>
                    <li>Hexagons are nature's favorite efficient shape</li>
                </ul>
            </div>
        `
    }
};

// Show learning concepts
function showLearningConcepts() {
    const concept = learningConcepts[currentTopic];
    if (concept) {
        document.getElementById('learningTitle').textContent = concept.title;
        document.getElementById('learningContent').innerHTML = concept.content;
        
        // Load interactive elements if available
        if (concept.interactive) {
            loadInteractiveElement(currentTopic);
        } else {
            document.getElementById('interactiveArea').innerHTML = '';
        }
        
        showSection('learningSection');
    }
}

// Load interactive elements based on topic
function loadInteractiveElement(topic) {
    const interactiveArea = document.getElementById('interactiveArea');
    
    switch(topic) {
        case 'fractions':
            interactiveArea.innerHTML = `
                <h3 class="interactive-title">🍕 Build Your Pizza Fraction!</h3>
                <div class="pizza-builder">
                    <div class="pizza-whole" id="pizzaWhole">
                        <div class="pizza-slice-interactive slice-1" onclick="toggleSlice(this, 1)"></div>
                        <div class="pizza-slice-interactive slice-2" onclick="toggleSlice(this, 2)"></div>
                        <div class="pizza-slice-interactive slice-3" onclick="toggleSlice(this, 3)"></div>
                        <div class="pizza-slice-interactive slice-4" onclick="toggleSlice(this, 4)"></div>
                        <div class="pizza-slice-interactive slice-5" onclick="toggleSlice(this, 5)"></div>
                        <div class="pizza-slice-interactive slice-6" onclick="toggleSlice(this, 6)"></div>
                        <div class="pizza-slice-interactive slice-7" onclick="toggleSlice(this, 7)"></div>
                        <div class="pizza-slice-interactive slice-8" onclick="toggleSlice(this, 8)"></div>
                        <div class="pizza-center">🍕</div>
                    </div>
                    <div class="fraction-display">
                        <h3>You ate:</h3>
                        <div class="fraction-number" id="fractionDisplay">0/8</div>
                        <p class="fraction-text" id="fractionText">Click slices to eat them!</p>
                    </div>
                    <button class="reset-btn" onclick="resetPizza()">🔄 Reset Pizza</button>
                </div>
            `;
            break;
            
        case 'algebra':
            interactiveArea.innerHTML = `
                <h3 class="interactive-title">🚶 Number Line Journey!</h3>
                <div class="number-line-game">
                    <p>Move forward to add, backward to subtract!</p>
                    <div class="number-line-container">
                        <div class="number-line">
                            <div class="number-marker" id="numberMarker" style="left: 50%;">🧮</div>
                            <div class="number-labels" id="numberLabels"></div>
                        </div>
                    </div>
                    <div class="number-display" id="currentNumberDisplay">
                        Current Position: <span id="currentNum" style="font-size: 2em; color: #FFD700;">0</span>
                    </div>
                    <div class="number-line-controls">
                        <button class="control-btn subtract" onclick="moveNumberLine(-5)">⬅️ -5</button>
                        <button class="control-btn subtract" onclick="moveNumberLine(-1)">⬅️ -1</button>
                        <button class="control-btn add" onclick="moveNumberLine(1)">+1 ➡️</button>
                        <button class="control-btn add" onclick="moveNumberLine(5)">+5 ➡️</button>
                    </div>
                    <div class="operation-history" id="operationHistory">
                        <strong>Your Journey:</strong> Start at 0
                    </div>
                    <button class="reset-btn" onclick="resetNumberLine()">🔄 Reset to Zero</button>
                </div>
            `;
            initNumberLine();
            break;
            
        case 'integers':
            interactiveArea.innerHTML = `
                <h3 class="interactive-title">🌡️ Temperature Explorer!</h3>
                <div class="thermometer-interactive">
                    <p>Click on the thermometer to change the temperature</p>
                    <div class="thermometer" id="thermometer" onclick="changeTemp(event)">
                        <div class="temp-marker" id="tempMarker" style="top: 150px;"></div>
                    </div>
                    <div class="temp-display" id="tempDisplay">0°C</div>
                    <p>Above 0 = Positive ➕ | Below 0 = Negative ➖</p>
                </div>
            `;
            break;
            
        case 'percentages':
            interactiveArea.innerHTML = `
                <h3 class="interactive-title">🍕 Pizza Percentage Builder!</h3>
                <div class="pizza-builder">
                    <div class="pizza-whole-percent" id="pizzaPercent">
                        <div class="pizza-slice-percent slice-percent-1" onclick="togglePercentSlice(this, 1)"></div>
                        <div class="pizza-slice-percent slice-percent-2" onclick="togglePercentSlice(this, 2)"></div>
                        <div class="pizza-slice-percent slice-percent-3" onclick="togglePercentSlice(this, 3)"></div>
                        <div class="pizza-slice-percent slice-percent-4" onclick="togglePercentSlice(this, 4)"></div>
                        <div class="pizza-center">🍕</div>
                    </div>
                    <div class="fraction-display">
                        <h3>You ate:</h3>
                        <div class="fraction-number" id="percentDisplay">0%</div>
                        <p class="fraction-text" id="percentText">Click slices to eat them! Each slice = 25%</p>
                    </div>
                    <button class="reset-btn" onclick="resetPercentPizza()">🔄 Reset Pizza</button>
                </div>
            `;
            selectedPercentSlices = 0;
            break;
            
        case 'geometry':
            interactiveArea.innerHTML = `
                <h3 class="interactive-title">📐 Interactive Shape Builder!</h3>
                <div class="shape-builder-enhanced">
                    <div class="shape-selector">
                        <button class="shape-btn" onclick="selectShape('square')">🟦 Square</button>
                        <button class="shape-btn" onclick="selectShape('rectangle')">🟥 Rectangle</button>
                        <button class="shape-btn" onclick="selectShape('triangle')">🔺 Triangle</button>
                        <button class="shape-btn" onclick="selectShape('circle')">🟢 Circle</button>
                    </div>
                    <div class="shape-canvas" id="shapeCanvas">
                        <div class="shape-container" id="currentShape">
                            <div class="shape-square" id="shapeDisplay"></div>
                        </div>
                    </div>
                    <div class="shape-controls">
                        <div class="control-group">
                            <label for="dimension1"><span id="dim1Label">Side</span>: <span id="dim1Value">5</span></label>
                            <input type="range" id="dimension1" min="2" max="15" value="5" oninput="updateShape()" class="slider">
                        </div>
                        <div class="control-group" id="dimension2Group" style="display:none;">
                            <label for="dimension2"><span id="dim2Label">Width</span>: <span id="dim2Value">5</span></label>
                            <input type="range" id="dimension2" min="2" max="15" value="5" oninput="updateShape()" class="slider">
                        </div>
                    </div>
                    <div class="shape-info-display" id="shapeResults">
                        <h4>📊 Measurements:</h4>
                        <p><strong>Area:</strong> <span id="areaResult">25</span> square units</p>
                        <p><strong>Perimeter:</strong> <span id="perimeterResult">20</span> units</p>
                        <div class="formula-display" id="formulaDisplay">
                            <p><strong>Formula:</strong> Area = side × side</p>
                        </div>
                    </div>
                </div>
            `;
            currentGeometryShape = 'square';
            updateShape();
            break;
            
        case 'ratios':
            interactiveArea.innerHTML = `
                <h3 class="interactive-title">🧃 Ratio Mixer!</h3>
                <div class="ratio-mixer">
                    <p>Adjust the sliders to see different ratios!</p>
                    <div class="ratio-display-container">
                        <div class="ratio-bar-container">
                            <div class="ratio-bar blue" id="ratioBarA" style="width: 50%;"></div>
                            <div class="ratio-bar orange" id="ratioBarB" style="width: 50%;"></div>
                        </div>
                        <div class="ratio-result">
                            <h4>Current Ratio: <span id="ratioDisplay">1:1</span></h4>
                            <p id="ratioSimplified"></p>
                        </div>
                    </div>
                    <div class="ratio-controls">
                        <div class="control-group">
                            <label>🔵 Part A: <span id="partAValue">5</span></label>
                            <input type="range" id="partA" min="1" max="10" value="5" oninput="updateRatio()" class="slider">
                        </div>
                        <div class="control-group">
                            <label>🟠 Part B: <span id="partBValue">5</span></label>
                            <input type="range" id="partB" min="1" max="10" value="5" oninput="updateRatio()" class="slider">
                        </div>
                    </div>
                    <div class="ratio-examples" id="ratioExamples">
                        <h4>🍹 Example: Making Juice</h4>
                        <p>If you use <strong>5 cups</strong> of Part A (juice),<br>you need <strong>5 cups</strong> of Part B (water)</p>
                    </div>
                    <button class="reset-btn" onclick="resetRatio()">🔄 Reset to 1:1</button>
                </div>
            `;
            initRatio();
            break;
            
        case 'nature':
            interactiveArea.innerHTML = `
                <h3 class="interactive-title">🌿 Fibonacci Garden!</h3>
                <div class="fibonacci-garden">
                    <p>Click the flowers to see their Fibonacci petal patterns!</p>
                    <div class="garden-display">
                        <div class="flower-card" onclick="showFlower(3)">
                            <div class="flower-icon" style="font-size: 4em;">🌷</div>
                            <p>Lily<br><span style="color: #FFD700;">3 petals</span></p>
                        </div>
                        <div class="flower-card" onclick="showFlower(5)">
                            <div class="flower-icon" style="font-size: 4em;">🌼</div>
                            <p>Buttercup<br><span style="color: #FFD700;">5 petals</span></p>
                        </div>
                        <div class="flower-card" onclick="showFlower(8)">
                            <div class="flower-icon" style="font-size: 4em;">🌸</div>
                            <p>Cosmos<br><span style="color: #FFD700;">8 petals</span></p>
                        </div>
                        <div class="flower-card" onclick="showFlower(13)">
                            <div class="flower-icon" style="font-size: 4em;">🌺</div>
                            <p>Aster<br><span style="color: #FFD700;">13 petals</span></p>
                        </div>
                    </div>
                    <div class="fibonacci-display" id="fibonacciDisplay">
                        <h4>Fibonacci Sequence:</h4>
                        <div class="fib-sequence" id="fibSequence">1, 1, 2, 3, 5, 8, 13, 21, 34...</div>
                        <p class="fib-info" id="fibInfo">Click a flower to explore!</p>
                    </div>
                    <div class="spiral-visual" id="spiralVisual">
                        <canvas id="fibonacciCanvas" width="300" height="300"></canvas>
                    </div>
                    <button class="reset-btn" onclick="resetFibonacci()">🔄 Reset Garden</button>
                </div>
            `;
            initFibonacci();
            break;
            
        default:
            interactiveArea.innerHTML = '';
    }
}

// Pizza slice toggle
function toggleSlice(element, sliceNum) {
    element.classList.toggle('selected');
    selectedSlices = document.querySelectorAll('.pizza-slice-interactive.selected').length;
    updateFractionDisplay();
}

function updateFractionDisplay() {
    const display = document.getElementById('fractionDisplay');
    const text = document.getElementById('fractionText');
    display.textContent = `${selectedSlices}/${totalSlices}`;
    
    if (selectedSlices === 0) {
        text.textContent = 'No slices eaten yet!';
    } else if (selectedSlices === totalSlices) {
        text.textContent = '🎉 You ate the whole pizza!';
    } else if (selectedSlices === totalSlices / 2) {
        text.textContent = '✨ That\'s half the pizza! (1/2)';
    } else if (selectedSlices === totalSlices / 4) {
        text.textContent = '✨ That\'s a quarter! (1/4)';
    } else {
        const simplified = simplifyFraction(selectedSlices, totalSlices);
        text.textContent = `${selectedSlices} out of ${totalSlices} slices eaten${simplified ? ` = ${simplified}` : ''}`;
    }
}

function simplifyFraction(num, den) {
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(num, den);
    const simplifiedNum = num / divisor;
    const simplifiedDen = den / divisor;
    if (simplifiedNum !== num) {
        return `${simplifiedNum}/${simplifiedDen}`;
    }
    return null;
}

function resetPizza() {
    document.querySelectorAll('.pizza-slice-interactive').forEach(slice => {
        slice.classList.remove('selected');
    });
    selectedSlices = 0;
    updateFractionDisplay();
}

// Temperature interactive
function changeTemp(event) {
    const thermometer = document.getElementById('thermometer');
    const marker = document.getElementById('tempMarker');
    const display = document.getElementById('tempDisplay');
    
    const rect = thermometer.getBoundingClientRect();
    const y = event.clientY - rect.top;
    const percentage = y / rect.height;
    const temp = Math.round((0.5 - percentage) * 100);
    
    marker.style.top = y + 'px';
    display.textContent = temp + '°C';
    
    if (temp > 0) {
        display.style.color = '#ff4444';
    } else if (temp < 0) {
        display.style.color = '#4444ff';
    } else {
        display.style.color = '#667eea';
    }
}

// Percentage Pizza
function togglePercentSlice(element, sliceNum) {
    element.classList.toggle('selected');
    selectedPercentSlices = document.querySelectorAll('.pizza-slice-percent.selected').length;
    updatePercentDisplay();
}

function updatePercentDisplay() {
    const display = document.getElementById('percentDisplay');
    const text = document.getElementById('percentText');
    const percentage = selectedPercentSlices * 25;
    
    display.textContent = percentage + '%';
    
    if (selectedPercentSlices === 0) {
        text.textContent = 'No slices eaten yet! Each slice = 25%';
    } else if (selectedPercentSlices === 1) {
        text.textContent = '✨ That\'s one quarter! (25% = 1/4 of the pizza)';
    } else if (selectedPercentSlices === 2) {
        text.textContent = '✨ That\'s half the pizza! (50% = 1/2)';
    } else if (selectedPercentSlices === 3) {
        text.textContent = '✨ Three quarters! (75% = 3/4 of the pizza)';
    } else if (selectedPercentSlices === 4) {
        text.textContent = '🎉 You ate the whole pizza! (100%)';
    }
}

function resetPercentPizza() {
    document.querySelectorAll('.pizza-slice-percent').forEach(slice => {
        slice.classList.remove('selected');
    });
    selectedPercentSlices = 0;
    updatePercentDisplay();
}

// ===== RATIOS MIXER GAME =====
let partAValue = 5;
let partBValue = 5;

function initRatio() {
    partAValue = 5;
    partBValue = 5;
    updateRatio();
}

function updateRatio() {
    const partASlider = document.getElementById('partA');
    const partBSlider = document.getElementById('partB');
    const partADisplay = document.getElementById('partAValue');
    const partBDisplay = document.getElementById('partBValue');
    
    if (partASlider && partBSlider) {
        partAValue = parseInt(partASlider.value);
        partBValue = parseInt(partBSlider.value);
        
        if (partADisplay) partADisplay.textContent = partAValue;
        if (partBDisplay) partBDisplay.textContent = partBValue;
    }
    
    // Update visual bars
    const total = partAValue + partBValue;
    const percentA = (partAValue / total) * 100;
    const percentB = (partBValue / total) * 100;
    
    const barA = document.getElementById('ratioBarA');
    const barB = document.getElementById('ratioBarB');
    
    if (barA) barA.style.width = percentA + '%';
    if (barB) barB.style.width = percentB + '%';
    
    // Update ratio display
    const display = document.getElementById('ratioDisplay');
    if (display) {
        display.textContent = `${partAValue}:${partBValue}`;
    }
    
    // Calculate simplified ratio
    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(partAValue, partBValue);
    const simplifiedA = partAValue / divisor;
    const simplifiedB = partBValue / divisor;
    
    const simplified = document.getElementById('ratioSimplified');
    if (simplified) {
        if (simplifiedA !== partAValue || simplifiedB !== partBValue) {
            simplified.textContent = `Simplified: ${simplifiedA}:${simplifiedB}`;
            simplified.style.color = '#28a745';
        } else {
            simplified.textContent = 'Already simplified!';
            simplified.style.color = '#FFD700';
        }
    }
    
    // Update examples
    const examples = document.getElementById('ratioExamples');
    if (examples) {
        examples.innerHTML = `
            <h4>🍹 Example: Making Juice</h4>
            <p>If you use <strong>${partAValue} cups</strong> of Part A (juice),<br>you need <strong>${partBValue} cups</strong> of Part B (water)</p>
            <p style="color: #FFD700;">Total: ${total} cups of mixed juice!</p>
        `;
    }
}

function resetRatio() {
    document.getElementById('partA').value = 5;
    document.getElementById('partB').value = 5;
    initRatio();
}

// ===== ALGEBRA NUMBER LINE GAME =====
let currentPosition = 0;
let operationHistory = [];

function initNumberLine() {
    currentPosition = 0;
    operationHistory = ['Start at 0'];
    updateNumberLine();
    drawNumberLabels();
}

function drawNumberLabels() {
    const labelsContainer = document.getElementById('numberLabels');
    if (!labelsContainer) return;
    
    labelsContainer.innerHTML = '';
    for (let i = -20; i <= 20; i += 5) {
        const label = document.createElement('div');
        label.className = 'number-label';
        label.textContent = i;
        label.style.left = ((i + 20) / 40 * 100) + '%';
        if (i === 0) label.style.fontWeight = 'bold';
        labelsContainer.appendChild(label);
    }
}

function moveNumberLine(amount) {
    currentPosition += amount;
    
    // Keep within bounds
    if (currentPosition > 20) currentPosition = 20;
    if (currentPosition < -20) currentPosition = -20;
    
    // Add to history
    const operation = amount > 0 ? `+${amount}` : `${amount}`;
    operationHistory.push(operation);
    if (operationHistory.length > 6) operationHistory.shift();
    
    updateNumberLine();
}

function updateNumberLine() {
    const marker = document.getElementById('numberMarker');
    const display = document.getElementById('currentNum');
    const history = document.getElementById('operationHistory');
    
    if (!marker || !display) return;
    
    // Update marker position (map -20 to 20 onto 0% to 100%)
    const percentage = ((currentPosition + 20) / 40 * 100);
    marker.style.left = percentage + '%';
    
    // Update display
    display.textContent = currentPosition;
    
    // Color based on value
    if (currentPosition > 0) {
        display.style.color = '#28a745';
        marker.textContent = '🎯';
    } else if (currentPosition < 0) {
        display.style.color = '#ff6b6b';
        marker.textContent = '❄️';
    } else {
        display.style.color = '#FFD700';
        marker.textContent = '🧮';
    }
    
    // Update history
    if (history) {
        const historyText = operationHistory.length > 1 
            ? '<strong>Your Journey:</strong> ' + operationHistory.join(' → ')
            : '<strong>Your Journey:</strong> Start at 0';
        history.innerHTML = historyText;
    }
}

function resetNumberLine() {
    initNumberLine();
}

// ===== OLD ALGEBRA GAME (Keep for compatibility) =====
let currentEquation = { a: 1, b: 3, c: 12 }; // represents ax + b = c

function generateEquation() {
    const equations = [
        { a: 1, b: 5, c: 12, display: 'x + 5', answer: 7 },
        { a: 2, b: 0, c: 10, display: '2x', answer: 5 },
        { a: 1, b: -3, c: 7, display: 'x - 3', answer: 10 },
        { a: 3, b: 0, c: 15, display: '3x', answer: 5 },
        { a: 2, b: 3, c: 11, display: '2x + 3', answer: 4 },
        { a: 1, b: 8, c: 15, display: 'x + 8', answer: 7 },
        { a: 4, b: -2, c: 14, display: '4x - 2', answer: 4 },
        { a: 1, b: -5, c: 10, display: 'x - 5', answer: 15 }
    ];
    return equations[Math.floor(Math.random() * equations.length)];
}

function displayEquation() {
    document.getElementById('leftContent').textContent = currentEquation.display;
    document.getElementById('rightContent').textContent = currentEquation.c;
    document.getElementById('rightValue').textContent = '= ' + currentEquation.c;
    document.getElementById('xValue').value = 0;
    document.getElementById('xDisplay').textContent = 0;
    updateEquation();
}

function updateEquation() {
    const x = parseInt(document.getElementById('xValue').value);
    document.getElementById('xDisplay').textContent = x;
    
    const leftValue = currentEquation.a * x + currentEquation.b;
    document.getElementById('leftValue').textContent = '= ' + leftValue;
    
    const message = document.getElementById('balanceMessage');
    const leftSide = document.getElementById('leftSide');
    const rightSide = document.getElementById('rightSide');
    
    if (leftValue === currentEquation.c) {
        message.textContent = '🎉 Perfect! The equation is balanced! x = ' + x;
        message.style.color = '#28a745';
        leftSide.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        rightSide.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
    } else if (leftValue < currentEquation.c) {
        message.textContent = '⬆️ Too small! Try a larger value of x';
        message.style.color = '#ffc107';
        leftSide.style.background = 'linear-gradient(135deg, #5a5a5a, #4a4a4a)';
        rightSide.style.background = 'linear-gradient(135deg, #5a5a5a, #4a4a4a)';
    } else {
        message.textContent = '⬇️ Too big! Try a smaller value of x';
        message.style.color = '#ff6b6b';
        leftSide.style.background = 'linear-gradient(135deg, #5a5a5a, #4a4a4a)';
        rightSide.style.background = 'linear-gradient(135deg, #5a5a5a, #4a4a4a)';
    }
}

function newEquation() {
    currentEquation = generateEquation();
    displayEquation();
}

// ===== GEOMETRY GAME =====
let currentGeometryShape = 'square';

function selectShape(shape) {
    currentGeometryShape = shape;
    
    // Reset sliders
    document.getElementById('dimension1').value = 5;
    document.getElementById('dimension2').value = 5;
    
    const dim2Group = document.getElementById('dimension2Group');
    
    if (shape === 'square' || shape === 'circle') {
        dim2Group.style.display = 'none';
    } else {
        dim2Group.style.display = 'block';
    }
    
    // Update labels
    const dim1Label = document.getElementById('dim1Label');
    const dim2Label = document.getElementById('dim2Label');
    
    switch(shape) {
        case 'square':
            dim1Label.textContent = 'Side';
            break;
        case 'rectangle':
            dim1Label.textContent = 'Length';
            dim2Label.textContent = 'Width';
            break;
        case 'triangle':
            dim1Label.textContent = 'Base';
            dim2Label.textContent = 'Height';
            break;
        case 'circle':
            dim1Label.textContent = 'Radius';
            break;
    }
    
    updateShape();
}

function updateShape() {
    const dim1 = parseInt(document.getElementById('dimension1').value);
    const dim2 = parseInt(document.getElementById('dimension2').value);
    
    document.getElementById('dim1Value').textContent = dim1;
    document.getElementById('dim2Value').textContent = dim2;
    
    const shapeDisplay = document.getElementById('shapeDisplay');
    const areaResult = document.getElementById('areaResult');
    const perimeterResult = document.getElementById('perimeterResult');
    const formulaDisplay = document.getElementById('formulaDisplay');
    
    let area, perimeter, formula;
    
    switch(currentGeometryShape) {
        case 'square':
            area = dim1 * dim1;
            perimeter = 4 * dim1;
            formula = `<p><strong>Area Formula:</strong> side × side = ${dim1} × ${dim1}</p>
                      <p><strong>Perimeter Formula:</strong> 4 × side = 4 × ${dim1}</p>`;
            shapeDisplay.className = 'shape-square';
            shapeDisplay.style.width = (dim1 * 20) + 'px';
            shapeDisplay.style.height = (dim1 * 20) + 'px';
            shapeDisplay.style.borderRadius = '0';
            shapeDisplay.style.background = '#667eea';
            break;
            
        case 'rectangle':
            area = dim1 * dim2;
            perimeter = 2 * (dim1 + dim2);
            formula = `<p><strong>Area Formula:</strong> length × width = ${dim1} × ${dim2}</p>
                      <p><strong>Perimeter Formula:</strong> 2(length + width) = 2(${dim1} + ${dim2})</p>`;
            shapeDisplay.className = 'shape-rectangle';
            shapeDisplay.style.width = (dim1 * 20) + 'px';
            shapeDisplay.style.height = (dim2 * 20) + 'px';
            shapeDisplay.style.borderRadius = '0';
            shapeDisplay.style.background = '#ff6b6b';
            break;
            
        case 'triangle':
            area = (dim1 * dim2) / 2;
            perimeter = Math.round(dim1 + Math.sqrt(dim1*dim1/4 + dim2*dim2) * 2);
            formula = `<p><strong>Area Formula:</strong> (base × height) ÷ 2 = (${dim1} × ${dim2}) ÷ 2</p>
                      <p><strong>Perimeter:</strong> Approximately ${perimeter} units</p>`;
            shapeDisplay.className = 'shape-triangle';
            shapeDisplay.style.width = '0';
            shapeDisplay.style.height = '0';
            shapeDisplay.style.borderLeft = (dim1 * 10) + 'px solid transparent';
            shapeDisplay.style.borderRight = (dim1 * 10) + 'px solid transparent';
            shapeDisplay.style.borderBottom = (dim2 * 20) + 'px solid #ffc107';
            shapeDisplay.style.background = 'transparent';
            break;
            
        case 'circle':
            area = Math.round(Math.PI * dim1 * dim1 * 100) / 100;
            perimeter = Math.round(2 * Math.PI * dim1 * 100) / 100;
            formula = `<p><strong>Area Formula:</strong> π × radius² = 3.14 × ${dim1}²</p>
                      <p><strong>Circumference:</strong> 2 × π × radius = 2 × 3.14 × ${dim1}</p>`;
            shapeDisplay.className = 'shape-circle';
            shapeDisplay.style.width = (dim1 * 20) + 'px';
            shapeDisplay.style.height = (dim1 * 20) + 'px';
            shapeDisplay.style.borderRadius = '50%';
            shapeDisplay.style.background = '#28a745';
            shapeDisplay.style.border = 'none';
            break;
    }
    
    areaResult.textContent = area;
    perimeterResult.textContent = perimeter;
    formulaDisplay.innerHTML = formula;
}

// Shape info (keep for compatibility)
function showShapeInfo(shape) {
    const info = document.getElementById('shapeInfo');
    
    const shapeData = {
        square: {
            title: '🟦 Square',
            area: 'Area = side × side',
            example: 'If side = 5m, Area = 5 × 5 = 25m²',
            perimeter: 'Perimeter = 4 × side = 20m'
        },
        rectangle: {
            title: '🟥 Rectangle',
            area: 'Area = length × width',
            example: 'If length = 8m, width = 5m, Area = 8 × 5 = 40m²',
            perimeter: 'Perimeter = 2(length + width) = 2(8 + 5) = 26m'
        },
        circle: {
            title: '🟢 Circle',
            area: 'Area = π × radius²',
            example: 'If radius = 7m, Area ≈ 3.14 × 7 × 7 = 153.86m²',
            perimeter: 'Circumference = 2 × π × radius ≈ 43.96m'
        }
    };
    
    const data = shapeData[shape];
    info.innerHTML = `
        <h3>${data.title}</h3>
        <p><strong>${data.area}</strong></p>
        <p>${data.example}</p>
        <p><strong>${data.perimeter}</strong></p>
    `;
}

// Start game from learning section
function startGameFromLearning() {
    showSection('gameModeMenu');
}

// Fibonacci Garden Functions
let currentFibNumber = 0;
let fibSequenceArray = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

function initFibonacci() {
    drawFibonacciSpiral();
}

function showFlower(petals) {
    currentFibNumber = petals;
    const fibInfo = document.getElementById('fibInfo');
    const fibSequence = document.getElementById('fibSequence');
    
    // Find position in Fibonacci sequence
    const position = fibSequenceArray.indexOf(petals);
    
    if (position !== -1) {
        // Highlight the number in sequence
        let highlightedSeq = fibSequenceArray.map((num, idx) => {
            if (num === petals) {
                return `<span style="color: #FFD700; font-weight: bold; font-size: 1.3em;">${num}</span>`;
            }
            return num;
        }).join(', ');
        
        fibSequence.innerHTML = highlightedSeq + '...';
        
        const flowerNames = {
            3: 'Lily',
            5: 'Buttercup',
            8: 'Cosmos',
            13: 'Aster'
        };
        
        fibInfo.innerHTML = `
            <strong>${flowerNames[petals]}</strong> has <span style="color: #FFD700;">${petals} petals</span> - 
            a Fibonacci number at position ${position + 1}!
        `;
    }
    
    drawFibonacciSpiral(petals);
}

function drawFibonacciSpiral(highlight = null) {
    const canvas = document.getElementById('fibonacciCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw spiral using Fibonacci numbers
    let x = centerX;
    let y = centerY;
    let angle = 0;
    const goldenAngle = 137.5 * (Math.PI / 180); // Golden angle in radians
    
    for (let i = 0; i < 50; i++) {
        const radius = Math.sqrt(i + 1) * 8;
        x = centerX + radius * Math.cos(angle);
        y = centerY + radius * Math.sin(angle);
        
        // Draw petals
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        
        // Highlight specific Fibonacci number
        if (highlight && i < highlight) {
            ctx.fillStyle = '#FFD700';
        } else if (i < 8) {
            ctx.fillStyle = '#4CAF50';
        } else {
            ctx.fillStyle = '#81C784';
        }
        
        ctx.fill();
        
        // Add number labels for Fibonacci positions
        if ([1, 2, 3, 5, 8, 13, 21].includes(i)) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(i.toString(), x, y);
        }
        
        angle += goldenAngle;
    }
    
    // Draw center
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#FF9800';
    ctx.fill();
}

function resetFibonacci() {
    currentFibNumber = 0;
    const fibInfo = document.getElementById('fibInfo');
    const fibSequence = document.getElementById('fibSequence');
    
    fibSequence.innerHTML = '1, 1, 2, 3, 5, 8, 13, 21, 34...';
    fibInfo.textContent = 'Click a flower to explore!';
    
    drawFibonacciSpiral();
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    showSection('mainMenu');
    initMusic();
    
    // Topic selection
    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTopic = btn.dataset.topic;
            document.getElementById('topicTitle').textContent = btn.querySelector('h3').textContent;
            showSection('gameModeMenu');
        });
    });

    // Difficulty selection
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentDifficulty = btn.dataset.difficulty;
        });
    });

    // Game mode selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentMode = btn.dataset.mode;
            startGame();
        });
    });
});
