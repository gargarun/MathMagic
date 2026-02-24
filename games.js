// Question banks for different topics and difficulties
const questionBank = {
    algebra: {
        easy: [
            { question: "Solve for x: x + 5 = 12", answer: "7", options: ["5", "7", "8", "10"] },
            { question: "What is 2x when x = 4?", answer: "8", options: ["6", "8", "10", "12"] },
            { question: "If y - 3 = 7, what is y?", answer: "10", options: ["4", "7", "10", "13"] },
            { question: "Solve: 3x = 15", answer: "5", options: ["3", "5", "12", "18"] },
            { question: "What is x + x + x when x = 2?", answer: "6", options: ["3", "4", "6", "8"] }
        ],
        medium: [
            { question: "Solve: 2x + 3 = 11", answer: "4", options: ["2", "4", "5", "7"] },
            { question: "If 3y - 5 = 10, what is y?", answer: "5", options: ["3", "5", "7", "15"] },
            { question: "Solve: 4x - 2 = 14", answer: "4", options: ["2", "3", "4", "5"] },
            { question: "What is 2(x + 3) when x = 4?", answer: "14", options: ["10", "11", "14", "16"] },
            { question: "Solve: 5x + 2 = 22", answer: "4", options: ["3", "4", "5", "6"] }
        ],
        hard: [
            { question: "Solve: 3x + 7 = 2x + 15", answer: "8", options: ["5", "8", "11", "15"] },
            { question: "If 4(x - 2) = 20, what is x?", answer: "7", options: ["5", "7", "9", "12"] },
            { question: "Solve: 2(3x - 4) = 16", answer: "4", options: ["2", "3", "4", "6"] },
            { question: "What is x if (x/2) + 5 = 11?", answer: "12", options: ["6", "8", "12", "16"] },
            { question: "Solve: 5x - 3 = 3x + 9", answer: "6", options: ["3", "6", "9", "12"] }
        ]
    },
    geometry: {
        easy: [
            { question: "How many sides does a triangle have?", answer: "3", options: ["2", "3", "4", "5"] },
            { question: "What is the sum of angles in a triangle?", answer: "180°", options: ["90°", "180°", "270°", "360°"] },
            { question: "How many sides does a rectangle have?", answer: "4", options: ["3", "4", "5", "6"] },
            { question: "What is the area of a square with side 5?", answer: "25", options: ["10", "20", "25", "30"] },
            { question: "How many degrees in a right angle?", answer: "90°", options: ["45°", "90°", "180°", "360°"] }
        ],
        medium: [
            { question: "Area of rectangle: length 8, width 5", answer: "40", options: ["13", "26", "40", "80"] },
            { question: "Perimeter of square with side 7", answer: "28", options: ["14", "21", "28", "49"] },
            { question: "If two angles of a triangle are 60° and 70°, what is the third?", answer: "50°", options: ["40°", "50°", "60°", "70°"] },
            { question: "Area of triangle: base 10, height 6", answer: "30", options: ["16", "30", "60", "120"] },
            { question: "Perimeter of rectangle: length 9, width 4", answer: "26", options: ["13", "26", "36", "52"] }
        ],
        hard: [
            { question: "Area of circle with radius 7 (use π ≈ 3.14)", answer: "153.86", options: ["43.96", "87.92", "153.86", "307.72"] },
            { question: "Volume of cube with side 4", answer: "64", options: ["16", "32", "64", "128"] },
            { question: "Area of trapezoid: bases 8 and 12, height 5", answer: "50", options: ["40", "50", "60", "100"] },
            { question: "If square's perimeter is 36, what is its area?", answer: "81", options: ["36", "72", "81", "144"] },
            { question: "Surface area of rectangular prism: 3×4×5", answer: "94", options: ["47", "60", "94", "120"] }
        ]
    },
    fractions: {
        easy: [
            { question: "What is 1/2 + 1/2?", answer: "1", options: ["1/4", "1/2", "1", "2"] },
            { question: "What is 1/4 of 12?", answer: "3", options: ["2", "3", "4", "6"] },
            { question: "Which is larger: 1/2 or 1/4?", answer: "1/2", options: ["1/4", "1/2", "Same", "Cannot tell"] },
            { question: "What is 2/4 simplified?", answer: "1/2", options: ["1/2", "1/4", "2/8", "4/8"] },
            { question: "What is 3/3?", answer: "1", options: ["0", "1", "3", "9"] }
        ],
        medium: [
            { question: "What is 2/3 + 1/3?", answer: "1", options: ["1/3", "2/3", "1", "3/6"] },
            { question: "What is 3/4 - 1/4?", answer: "1/2", options: ["1/4", "1/2", "2/4", "3/8"] },
            { question: "What is 1/2 × 1/3?", answer: "1/6", options: ["1/5", "1/6", "2/5", "2/6"] },
            { question: "Convert 0.5 to a fraction", answer: "1/2", options: ["1/4", "1/2", "2/4", "5/10"] },
            { question: "What is 5/6 - 1/3?", answer: "1/2", options: ["1/3", "1/2", "2/3", "4/9"] }
        ],
        hard: [
            { question: "What is 2/3 × 3/4?", answer: "1/2", options: ["1/2", "5/7", "6/12", "2/3"] },
            { question: "What is 5/6 ÷ 1/2?", answer: "5/3", options: ["5/12", "5/8", "10/6", "5/3"] },
            { question: "What is 3 1/2 as an improper fraction?", answer: "7/2", options: ["3/2", "5/2", "7/2", "9/2"] },
            { question: "What is 2/5 + 3/10?", answer: "7/10", options: ["5/15", "1/2", "7/10", "5/10"] },
            { question: "Simplify: 12/18", answer: "2/3", options: ["1/2", "2/3", "3/4", "6/9"] }
        ]
    },
    percentages: {
        easy: [
            { question: "What is 50% of 100?", answer: "50", options: ["25", "50", "75", "100"] },
            { question: "What is 10% of 50?", answer: "5", options: ["5", "10", "15", "20"] },
            { question: "Convert 1/4 to percentage", answer: "25%", options: ["20%", "25%", "40%", "50%"] },
            { question: "What is 100% of 75?", answer: "75", options: ["50", "75", "100", "175"] },
            { question: "What is 25% of 20?", answer: "5", options: ["4", "5", "10", "15"] }
        ],
        medium: [
            { question: "What is 30% of 80?", answer: "24", options: ["20", "24", "26", "30"] },
            { question: "If you scored 18/20, what's your percentage?", answer: "90%", options: ["80%", "85%", "90%", "95%"] },
            { question: "What is 15% of 60?", answer: "9", options: ["6", "9", "12", "15"] },
            { question: "Convert 0.75 to percentage", answer: "75%", options: ["65%", "70%", "75%", "80%"] },
            { question: "What is 20% of 150?", answer: "30", options: ["20", "25", "30", "35"] }
        ],
        hard: [
            { question: "What is 35% of 200?", answer: "70", options: ["60", "65", "70", "75"] },
            { question: "If a price increases from $80 to $100, what's the % increase?", answer: "25%", options: ["20%", "25%", "30%", "35%"] },
            { question: "What number is 45% of 160?", answer: "72", options: ["68", "70", "72", "74"] },
            { question: "A shirt costs $60 after 25% discount. What was original price?", answer: "$80", options: ["$75", "$80", "$85", "$90"] },
            { question: "What is 12.5% of 240?", answer: "30", options: ["24", "28", "30", "32"] }
        ]
    },
    integers: {
        easy: [
            { question: "What is 5 + (-3)?", answer: "2", options: ["-2", "2", "8", "-8"] },
            { question: "What is -4 + 7?", answer: "3", options: ["-3", "3", "11", "-11"] },
            { question: "What is 6 - 10?", answer: "-4", options: ["-4", "4", "-16", "16"] },
            { question: "What is -5 + (-3)?", answer: "-8", options: ["-8", "8", "-2", "2"] },
            { question: "What is 0 - 7?", answer: "-7", options: ["-7", "7", "0", "-14"] }
        ],
        medium: [
            { question: "What is -8 + 12?", answer: "4", options: ["-4", "4", "20", "-20"] },
            { question: "What is 3 × (-4)?", answer: "-12", options: ["-12", "12", "-7", "7"] },
            { question: "What is -15 ÷ 3?", answer: "-5", options: ["-5", "5", "-18", "18"] },
            { question: "What is -7 - (-4)?", answer: "-3", options: ["-3", "3", "-11", "11"] },
            { question: "What is (-2) × (-6)?", answer: "12", options: ["-12", "12", "-8", "8"] }
        ],
        hard: [
            { question: "What is -5 × 4 + 7?", answer: "-13", options: ["-13", "13", "-27", "27"] },
            { question: "What is (−6) × (−3) − 8?", answer: "10", options: ["10", "-10", "26", "-26"] },
            { question: "What is -20 ÷ (-4) + 3?", answer: "8", options: ["-8", "8", "2", "-2"] },
            { question: "What is 15 − (−5) + (−8)?", answer: "12", options: ["2", "12", "18", "28"] },
            { question: "What is (−3)² + 4?", answer: "13", options: ["1", "7", "13", "-5"] }
        ]
    },
    ratios: {
        easy: [
            { question: "Simplify the ratio 4:8", answer: "1:2", options: ["1:2", "2:4", "1:4", "2:1"] },
            { question: "If ratio is 2:3 and first number is 6, what's second?", answer: "9", options: ["6", "9", "12", "15"] },
            { question: "What is the ratio of 10 to 5?", answer: "2:1", options: ["1:2", "2:1", "5:10", "10:5"] },
            { question: "Simplify 6:9", answer: "2:3", options: ["1:2", "2:3", "3:4", "6:9"] },
            { question: "If 2:5 = x:10, what is x?", answer: "4", options: ["2", "4", "5", "20"] }
        ],
        medium: [
            { question: "If ratio of boys to girls is 3:4 and 12 boys, how many girls?", answer: "16", options: ["9", "12", "16", "20"] },
            { question: "Divide 35 in ratio 2:3", answer: "14 and 21", options: ["10 and 25", "14 and 21", "15 and 20", "12 and 23"] },
            { question: "Simplify 15:25", answer: "3:5", options: ["1:2", "3:5", "5:3", "15:25"] },
            { question: "If 4:7 = 12:x, what is x?", answer: "21", options: ["15", "18", "21", "28"] },
            { question: "What is 20% as a ratio?", answer: "1:5", options: ["1:4", "1:5", "2:10", "20:100"] }
        ],
        hard: [
            { question: "Three numbers in ratio 2:3:5. If sum is 50, find largest", answer: "25", options: ["15", "20", "25", "30"] },
            { question: "If A:B = 2:3 and B:C = 4:5, what is A:C?", answer: "8:15", options: ["2:5", "8:15", "6:15", "8:20"] },
            { question: "Divide $120 in ratio 3:5:4", answer: "$30, $50, $40", options: ["$30, $50, $40", "$40, $50, $30", "$20, $60, $40", "$36, $60, $24"] },
            { question: "If 5:8 = x:32, what is x?", answer: "20", options: ["15", "20", "25", "28"] },
            { question: "Speed ratio 60:80 simplified", answer: "3:4", options: ["1:2", "3:4", "4:5", "6:8"] }
        ]
    },
    nature: {
        easy: [
            { question: "How many petals does a daisy typically have?", answer: "34", options: ["12", "20", "34", "50"] },
            { question: "What shape are honeycomb cells?", answer: "Hexagon", options: ["Square", "Circle", "Hexagon", "Triangle"] },
            { question: "How many points does a snowflake have?", answer: "6", options: ["4", "5", "6", "8"] },
            { question: "Butterflies have this type of symmetry", answer: "Mirror", options: ["Radial", "Mirror", "None", "Spiral"] },
            { question: "Sunflower seeds arrange in a spiral pattern. True or False?", answer: "True", options: ["True", "False"] }
        ],
        medium: [
            { question: "How many spirals in a pinecone? (Fibonacci number)", answer: "8 or 13", options: ["5 or 7", "8 or 13", "10 or 15", "12 or 16"] },
            { question: "Tree branches follow which sequence?", answer: "Fibonacci", options: ["Random", "Arithmetic", "Fibonacci", "Geometric"] },
            { question: "Nautilus shell grows in which spiral?", answer: "Logarithmic", options: ["Circular", "Logarithmic", "Linear", "Square"] },
            { question: "Fibonacci sequence starts: 1, 1, 2, 3, 5, ?", answer: "8", options: ["6", "7", "8", "9"] },
            { question: "What ratio is found in flower petals?", answer: "Golden Ratio", options: ["Pi", "Golden Ratio", "Square Root 2", "Euler's Number"] }
        ],
        hard: [
            { question: "Golden ratio value (approximately)", answer: "1.618", options: ["1.414", "1.618", "2.718", "3.141"] },
            { question: "Fibonacci sequence: 1,1,2,3,5,8,13,21,?", answer: "34", options: ["29", "32", "34", "38"] },
            { question: "Fractals in nature repeat patterns at different ___", answer: "Scales", options: ["Times", "Scales", "Colors", "Speeds"] },
            { question: "How many chambers in a nautilus shell cross-section?", answer: "Spiral chambers", options: ["3", "5", "Spiral chambers", "12"] },
            { question: "Tree trunk diameter doubles, cross-section area increases by", answer: "4 times", options: ["2 times", "3 times", "4 times", "8 times"] }
        ]
    }
};

// Quiz Mode
function startQuizMode() {
    const gameContent = document.getElementById('gameContent');
    const questions = questionBank[currentTopic][currentDifficulty];
    let currentQuestionIndex = 0;
    
    function showQuestion() {
        if (currentQuestionIndex >= questions.length) {
            endGame();
            return;
        }
        
        const q = questions[currentQuestionIndex];
        totalQuestions++;
        
        gameContent.innerHTML = `
            <div class="question-card">
                <h3>Question ${currentQuestionIndex + 1} of ${questions.length}</h3>
                <p class="question-text">${q.question}</p>
                <div class="answer-options">
                    ${q.options.map(opt => `
                        <button class="answer-btn" data-answer="${opt}">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                checkAnswer(btn, q.answer);
            });
        });
    }
    
    function checkAnswer(btn, correctAnswer) {
        const allButtons = document.querySelectorAll('.answer-btn');
        allButtons.forEach(b => b.disabled = true);
        
        if (btn.dataset.answer === correctAnswer) {
            btn.classList.add('correct');
            correctAnswers++;
            const points = currentDifficulty === 'easy' ? 10 : currentDifficulty === 'medium' ? 15 : 20;
            updateScore(points);
        } else {
            btn.classList.add('incorrect');
            allButtons.forEach(b => {
                if (b.dataset.answer === correctAnswer) {
                    b.classList.add('correct');
                }
            });
        }
        
        setTimeout(() => {
            currentQuestionIndex++;
            showQuestion();
        }, 2000);
    }
    
    showQuestion();
}

// Puzzle Mode
function startPuzzleMode() {
    const gameContent = document.getElementById('gameContent');
    const questions = questionBank[currentTopic][currentDifficulty];
    let currentQuestionIndex = 0;
    
    function showPuzzle() {
        if (currentQuestionIndex >= questions.length) {
            endGame();
            return;
        }
        
        const q = questions[currentQuestionIndex];
        totalQuestions++;
        
        gameContent.innerHTML = `
            <div class="question-card">
                <h3>Puzzle ${currentQuestionIndex + 1} of ${questions.length}</h3>
                <p class="question-text">${q.question}</p>
                <input type="text" class="answer-input" placeholder="Type your answer here">
                <button class="submit-btn">Submit Answer</button>
                <div id="feedback"></div>
            </div>
        `;
        
        const input = gameContent.querySelector('.answer-input');
        const submitBtn = gameContent.querySelector('.submit-btn');
        const feedback = gameContent.querySelector('#feedback');
        
        submitBtn.addEventListener('click', () => {
            checkPuzzleAnswer(input.value.trim(), q.answer, feedback, submitBtn, input);
        });
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitBtn.click();
            }
        });
    }
    
    function checkPuzzleAnswer(userAnswer, correctAnswer, feedback, submitBtn, input) {
        submitBtn.disabled = true;
        input.disabled = true;
        
        if (userAnswer.toLowerCase() === correctAnswer.toLowerCase() || 
            userAnswer === correctAnswer) {
            feedback.className = 'feedback correct';
            feedback.textContent = '✓ Correct! Well done!';
            correctAnswers++;
            const points = currentDifficulty === 'easy' ? 15 : currentDifficulty === 'medium' ? 20 : 25;
            updateScore(points);
        } else {
            feedback.className = 'feedback incorrect';
            feedback.textContent = `✗ Incorrect. The correct answer is: ${correctAnswer}`;
        }
        
        setTimeout(() => {
            currentQuestionIndex++;
            showPuzzle();
        }, 3000);
    }
    
    showPuzzle();
}

// Challenge Mode (Timed with bonus points)
function startChallengeMode() {
    const gameContent = document.getElementById('gameContent');
    const questions = questionBank[currentTopic][currentDifficulty];
    let currentQuestionIndex = 0;
    let questionStartTime = 0;
    
    function showChallenge() {
        if (currentQuestionIndex >= questions.length) {
            endGame();
            return;
        }
        
        const q = questions[currentQuestionIndex];
        totalQuestions++;
        questionStartTime = Date.now();
        
        gameContent.innerHTML = `
            <div class="question-card">
                <h3>Challenge ${currentQuestionIndex + 1} of ${questions.length}</h3>
                <p class="question-text">${q.question}</p>
                <p style="color: #ff6b6b; font-weight: bold;">⏱️ Answer quickly for bonus points!</p>
                <div class="answer-options">
                    ${q.options.map(opt => `
                        <button class="answer-btn" data-answer="${opt}">${opt}</button>
                    `).join('')}
                </div>
            </div>
        `;
        
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                checkChallengeAnswer(btn, q.answer);
            });
        });
    }
    
    function checkChallengeAnswer(btn, correctAnswer) {
        const allButtons = document.querySelectorAll('.answer-btn');
        allButtons.forEach(b => b.disabled = true);
        
        const timeToAnswer = (Date.now() - questionStartTime) / 1000;
        let points = 0;
        
        if (btn.dataset.answer === correctAnswer) {
            btn.classList.add('correct');
            correctAnswers++;
            
            // Base points + time bonus
            const basePoints = currentDifficulty === 'easy' ? 15 : currentDifficulty === 'medium' ? 20 : 25;
            const timeBonus = timeToAnswer < 5 ? 10 : timeToAnswer < 10 ? 5 : 0;
            points = basePoints + timeBonus;
            
            updateScore(points);
        } else {
            btn.classList.add('incorrect');
            allButtons.forEach(b => {
                if (b.dataset.answer === correctAnswer) {
                    b.classList.add('correct');
                }
            });
        }
        
        setTimeout(() => {
            currentQuestionIndex++;
            showChallenge();
        }, 2000);
    }
    
    showChallenge();
}
