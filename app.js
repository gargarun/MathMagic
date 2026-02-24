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
    
    // Load game based on mode
    if (currentMode === 'quiz') {
        startQuizMode();
    } else if (currentMode === 'puzzle') {
        startPuzzleMode();
    } else if (currentMode === 'challenge') {
        startChallengeMode();
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
    document.getElementById('finalScore').textContent = score;
    document.getElementById('resultTopic').textContent = currentTopic.charAt(0).toUpperCase() + currentTopic.slice(1);
    document.getElementById('resultMode').textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
    document.getElementById('resultDifficulty').textContent = currentDifficulty.charAt(0).toUpperCase() + currentDifficulty.slice(1);
    document.getElementById('resultCorrect').textContent = `${correctAnswers} / ${totalQuestions}`;
    document.getElementById('resultTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    showSection('resultsScreen');
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
                <h3 class="interactive-title">📐 Shape Calculator!</h3>
                <div class="shape-builder">
                    <div style="text-align: center; width: 100%;">
                        <p>Click shapes to see their properties!</p>
                        <div style="display: flex; gap: 20px; justify-content: center; margin: 20px;">
                            <div class="draggable-shape" onclick="showShapeInfo('square')" style="width: 100px; height: 100px; background: #667eea;">
                                <p style="color: white; text-align: center; line-height: 100px; margin: 0;">Square</p>
                            </div>
                            <div class="draggable-shape" onclick="showShapeInfo('rectangle')" style="width: 120px; height: 80px; background: #ff6b6b;">
                                <p style="color: white; text-align: center; line-height: 80px; margin: 0;">Rectangle</p>
                            </div>
                            <div class="draggable-shape" onclick="showShapeInfo('circle')" style="width: 100px; height: 100px; background: #28a745; border-radius: 50%;">
                                <p style="color: white; text-align: center; line-height: 100px; margin: 0;">Circle</p>
                            </div>
                        </div>
                        <div id="shapeInfo" class="fraction-display" style="max-width: 400px; margin: 20px auto;">
                            <p>Click a shape to see how to calculate its area!</p>
                        </div>
                    </div>
                </div>
            `;
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

// Shape info
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
    showSection('gameScreen');
    startGame();
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
