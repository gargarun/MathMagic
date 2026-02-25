// Teacher Dashboard Logic

let currentClassId = null;
let currentStudentId = null;

// Make functions globally accessible
window.switchDashboardTab = switchDashboardTab;
window.showAddClassModal = showAddClassModal;
window.showAddStudentModal = showAddStudentModal;
window.showCreateAssignmentModal = showCreateAssignmentModal;
window.closeModal = closeModal;
window.saveClass = saveClass;
window.loadClasses = loadClasses;
window.viewClass = viewClass;
window.deleteClass = deleteClass;
window.saveStudent = saveStudent;
window.deleteStudent = deleteStudent;
window.loadAssignments = loadAssignments;
window.saveAssignment = saveAssignment;
window.deleteAssignment = deleteAssignment;
window.loadReports = loadReports;
window.viewStudentReport = viewStudentReport;
window.shareReport = shareReport;
window.loadStudentsForLogin = loadStudentsForLogin;
window.studentLoginSubmit = studentLoginSubmit;
window.studentLogout = studentLogout;
window.switchStudentTab = switchStudentTab;
window.startAssignment = startAssignment;
window.startPracticeMode = startPracticeMode;
window.refreshStudentLoginDropdown = refreshStudentLoginDropdown;

// Refresh student login dropdown
function refreshStudentLoginDropdown() {
    const studentClassSelect = document.getElementById('studentClassSelect');
    if (studentClassSelect && window.db) {
        const classes = db.getAllClasses();
        console.log('Refreshing student login dropdown. Classes found:', classes.length);
        studentClassSelect.innerHTML = '<option value="">Select Your Class</option>' +
            classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
}

// Dashboard Tab Switching
function switchDashboardTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}Tab`).classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the tab
    if (tabName === 'classes') {
        loadClasses();
    } else if (tabName === 'assignments') {
        loadAssignments();
    } else if (tabName === 'reports') {
        loadReports();
    }
}

// Modal Functions
function showAddClassModal() {
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('addClassModal').classList.add('active');
    document.getElementById('className').value = '';
    document.getElementById('classDescription').value = '';
}

function showAddStudentModal() {
    document.getElementById('modalOverlay').classList.add('active');
    document.getElementById('addStudentModal').classList.add('active');
    document.getElementById('studentName').value = '';
    document.getElementById('studentEmail').value = '';
    document.getElementById('studentPhone').value = '';
}

function showCreateAssignmentModal() {
    const modal = document.getElementById('createAssignmentModal');
    const classSelect = document.getElementById('assignmentClass');
    
    // Populate class dropdown
    const classes = db.getAllClasses();
    classSelect.innerHTML = '<option value="">Select Class</option>';
    classes.forEach(cls => {
        classSelect.innerHTML += `<option value="${cls.id}">${cls.name}</option>`;
    });
    
    // Show modal
    document.getElementById('modalOverlay').classList.add('active');
    modal.classList.add('active');
    
    // Load students when class is selected
    classSelect.onchange = function() {
        loadStudentsForAssignment(this.value);
    };
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
}

// Class Management
function saveClass() {
    console.log('saveClass() called');
    
    const name = document.getElementById('className').value.trim();
    const description = document.getElementById('classDescription').value.trim();
    
    console.log('Class data:', { name, description });
    
    if (!name) {
        alert('Please enter a class name');
        return;
    }
    
    const classData = {
        name,
        description
    };
    
    console.log('Attempting to save class...');
    const saved = db.saveClass(classData);
    console.log('Save result:', saved);
    
    if (saved) {
        closeModal();
        loadClasses();
    } else {
        alert('Error saving class');
    }
}

function loadClasses() {
    const classes = db.getAllClasses();
    const classList = document.getElementById('classList');
    
    if (classes.length === 0) {
        classList.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px;">No classes yet. Create your first class!</p>';
        return;
    }
    
    classList.innerHTML = classes.map(cls => {
        const students = db.getStudentsByClass(cls.id);
        return `
            <div class="class-card">
                <div class="class-header">
                    <h3>${cls.name}</h3>
                    <span class="student-count">${students.length} students</span>
                </div>
                ${cls.description ? `<p class="class-description">${cls.description}</p>` : ''}
                <div class="class-actions">
                    <button class="btn-secondary" onclick="viewClass('${cls.id}')">View Students</button>
                    <button class="btn-danger" onclick="deleteClass('${cls.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewClass(classId) {
    currentClassId = classId;
    const classData = db.getClass(classId);
    
    document.getElementById('classDetailName').textContent = classData.name;
    showSection('classDetailView');
    loadStudents(classId);
}

function deleteClass(classId) {
    if (confirm('Are you sure you want to delete this class? All students and their data will be removed.')) {
        db.deleteClass(classId);
        loadClasses();
    }
}

// Student Management
function saveStudent() {
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const phone = document.getElementById('studentPhone').value.trim();
    
    if (!name) {
        alert('Please enter student name');
        return;
    }
    
    const studentData = {
        name,
        email,
        phone
    };
    
    if (db.saveStudent(currentClassId, studentData)) {
        closeModal();
        loadStudents(currentClassId);
    } else {
        alert('Error saving student');
    }
}

function loadStudents(classId) {
    const students = db.getStudentsByClass(classId);
    const studentsList = document.getElementById('studentsList');
    
    if (students.length === 0) {
        studentsList.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px;">No students yet. Add your first student!</p>';
        return;
    }
    
    studentsList.innerHTML = students.map(student => {
        const performance = db.getStudentPerformance(student.id);
        return `
            <div class="student-card">
                <div class="student-info">
                    <h4>${student.name}</h4>
                    ${student.email ? `<p class="student-email">${student.email}</p>` : ''}
                </div>
                <div class="student-stats">
                    <div class="stat">
                        <span class="stat-label">Quizzes</span>
                        <span class="stat-value">${performance.totalQuizzes}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Avg Score</span>
                        <span class="stat-value">${performance.averageScore}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Accuracy</span>
                        <span class="stat-value">${performance.accuracy || 0}%</span>
                    </div>
                </div>
                <div class="student-actions">
                    <button class="btn-secondary" onclick="viewStudentPerformance('${classId}', '${student.id}')">View Report</button>
                    <button class="btn-danger" onclick="deleteStudent('${classId}', '${student.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

function deleteStudent(classId, studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        db.deleteStudent(classId, studentId);
        loadStudents(classId);
    }
}

function goBackToClassDetail() {
    viewClass(currentClassId);
}

// Assignment Management
function loadStudentsForAssignment(classId) {
    const students = db.getStudentsByClass(classId);
    const selection = document.getElementById('studentSelection');
    
    if (students.length === 0) {
        selection.innerHTML = '<p style="color: #aaa;">No students in this class</p>';
        return;
    }
    
    selection.innerHTML = `
        <h4 style="margin: 15px 0 10px 0; color: #FFD700;">Select Students:</h4>
        <label style="display: block; margin-bottom: 10px; color: #e0e0e0;">
            <input type="checkbox" id="selectAllStudents" onchange="toggleAllStudents(this)"> Select All
        </label>
        ${students.map(student => `
            <label style="display: block; margin-bottom: 8px; color: #e0e0e0;">
                <input type="checkbox" class="student-checkbox" value="${student.id}"> ${student.name}
            </label>
        `).join('')}
    `;
}

function toggleAllStudents(checkbox) {
    document.querySelectorAll('.student-checkbox').forEach(cb => {
        cb.checked = checkbox.checked;
    });
}

function saveAssignment() {
    const classId = document.getElementById('assignmentClass').value;
    const topic = document.getElementById('assignmentTopic').value;
    const difficulty = document.getElementById('assignmentDifficulty').value;
    const dueDate = document.getElementById('assignmentDueDate').value;
    
    const selectedStudents = Array.from(document.querySelectorAll('.student-checkbox:checked'))
        .map(cb => cb.value);
    
    if (!classId || selectedStudents.length === 0) {
        alert('Please select a class and at least one student');
        return;
    }
    
    const assignment = {
        classId,
        topic,
        difficulty,
        dueDate,
        studentIds: selectedStudents,
        status: 'active'
    };
    
    if (db.saveAssignment(assignment)) {
        closeModal();
        loadAssignments();
        alert('Assignment created successfully!');
    } else {
        alert('Error creating assignment');
    }
}

function loadAssignments() {
    const assignments = db.getAllAssignments();
    const list = document.getElementById('assignmentsList');
    
    if (assignments.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px;">No assignments yet.</p>';
        return;
    }
    
    list.innerHTML = assignments.map(assignment => {
        const classData = db.getClass(assignment.classId);
        const results = db.getResultsByAssignment(assignment.id);
        const completionRate = assignment.studentIds.length > 0 
            ? Math.round((results.length / assignment.studentIds.length) * 100)
            : 0;
        
        // Get student completion details
        const studentDetails = assignment.studentIds.map(studentId => {
            const student = db.getStudent(assignment.classId, studentId);
            const studentResult = results.find(r => r.studentId === studentId);
            
            if (studentResult) {
                const accuracy = Math.round((studentResult.correctAnswers / studentResult.totalQuestions) * 100);
                return `
                    <div class="student-progress completed">
                        <span>✅ ${student ? student.name : 'Unknown'}</span>
                        <span class="progress-badge" style="background: #28a745;">${accuracy}% (${studentResult.score} pts)</span>
                    </div>
                `;
            } else {
                return `
                    <div class="student-progress pending">
                        <span>⏳ ${student ? student.name : 'Unknown'}</span>
                        <span class="progress-badge" style="background: #ffc107; color: #333;">Pending</span>
                    </div>
                `;
            }
        }).join('');
        
        return `
            <div class="assignment-card" style="margin-bottom: 20px;">
                <div class="assignment-header">
                    <h4>${assignment.topic.charAt(0).toUpperCase() + assignment.topic.slice(1)} - ${assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}</h4>
                    <span class="assignment-status">${assignment.status}</span>
                </div>
                <p><strong>Class:</strong> ${classData ? classData.name : 'Unknown'}</p>
                <p><strong>Students:</strong> ${assignment.studentIds.length}</p>
                <p><strong>Completed:</strong> ${results.length} / ${assignment.studentIds.length} (<span style="color: ${completionRate === 100 ? '#28a745' : '#ffc107'}; font-weight: bold;">${completionRate}%</span>)</p>
                ${assignment.dueDate ? `<p><strong>Due:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>` : ''}
                
                <div class="student-progress-list" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #444;">
                    <p style="font-weight: bold; margin-bottom: 10px; color: #FFD700;">Student Progress:</p>
                    ${studentDetails}
                </div>
            </div>
        `;
    }).join('');
}

// Reports and Performance
function loadReports() {
    const classes = db.getAllClasses();
    const list = document.getElementById('reportsList');
    
    if (classes.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px;">No classes to generate reports for.</p>';
        return;
    }
    
    list.innerHTML = classes.map(cls => {
        const performance = db.getClassPerformance(cls.id);
        return `
            <div class="report-card">
                <h4>${cls.name}</h4>
                <div class="report-stats">
                    <div class="stat">
                        <span class="stat-label">Students</span>
                        <span class="stat-value">${performance.totalStudents}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Total Quizzes</span>
                        <span class="stat-value">${performance.totalQuizzes}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Class Average</span>
                        <span class="stat-value">${performance.classAverage}</span>
                    </div>
                </div>
                <button class="btn-secondary" onclick="viewClass('${cls.id}')">View Details</button>
            </div>
        `;
    }).join('');
}

function viewStudentPerformance(classId, studentId) {
    currentClassId = classId;
    currentStudentId = studentId;
    
    const student = db.getStudent(classId, studentId);
    const performance = db.getStudentPerformance(studentId);
    
    document.getElementById('studentPerformanceName').textContent = `${student.name}'s Performance`;
    
    const content = document.getElementById('studentPerformanceContent');
    content.innerHTML = `
        <div class="performance-summary">
            <div class="perf-stat">
                <h3>${performance.totalQuizzes}</h3>
                <p>Total Quizzes</p>
            </div>
            <div class="perf-stat">
                <h3>${performance.averageScore}</h3>
                <p>Average Score</p>
            </div>
            <div class="perf-stat">
                <h3>${performance.accuracy || 0}%</h3>
                <p>Accuracy</p>
            </div>
            <div class="perf-stat">
                <h3>${performance.totalCorrect}/${performance.totalQuestions}</h3>
                <p>Correct Answers</p>
            </div>
        </div>
        
        <div class="topic-breakdown">
            <h3>Topic-wise Performance</h3>
            ${Object.entries(performance.topicBreakdown).map(([topic, data]) => `
                <div class="topic-perf-card">
                    <h4>${topic.charAt(0).toUpperCase() + topic.slice(1)}</h4>
                    <p>Quizzes: ${data.quizzes}</p>
                    <p>Average: ${Math.round(data.totalScore / data.quizzes)}</p>
                    <p>Accuracy: ${Math.round((data.correct / data.total) * 100)}%</p>
                </div>
            `).join('')}
        </div>
        
        <div class="recent-results">
            <h3>Recent Quiz Results</h3>
            ${performance.recentResults.map(result => `
                <div class="result-item">
                    <span><strong>${result.topic}</strong> - ${result.mode} (${result.difficulty})</span>
                    <span>Score: ${result.score}</span>
                    <span>${result.correctAnswers}/${result.totalQuestions} correct</span>
                    <span class="result-date">${new Date(result.completedAt).toLocaleDateString()}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    showSection('studentPerformanceView');
}

function sharePerformanceReport() {
    const student = db.getStudent(currentClassId, currentStudentId);
    const performance = db.getStudentPerformance(currentStudentId);
    const classData = db.getClass(currentClassId);
    
    const message = `
*📊 Math Tutor - Performance Report*

*Student:* ${student.name}
*Class:* ${classData.name}
*Date:* ${new Date().toLocaleDateString()}

*Overall Performance:*
✅ Total Quizzes: ${performance.totalQuizzes}
⭐ Average Score: ${performance.averageScore}
🎯 Accuracy: ${performance.accuracy || 0}%
📝 ${performance.totalCorrect}/${performance.totalQuestions} Correct Answers

*Topic-wise Breakdown:*
${Object.entries(performance.topicBreakdown).map(([topic, data]) => 
    `• ${topic}: ${Math.round(data.totalScore / data.quizzes)} avg, ${Math.round((data.correct / data.total) * 100)}% accuracy`
).join('\n')}

Keep up the great work! 🌟
`.trim();
    
    const phone = student.phone || '';
    const whatsappUrl = phone 
        ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
        : `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
}

// ===== STUDENT FUNCTIONALITY =====

let loggedInStudent = null;
let loggedInClass = null;

// Student Login
function loadStudentsForLogin() {
    const classId = document.getElementById('studentClassSelect').value;
    const studentSelect = document.getElementById('studentNameSelect');
    
    if (!classId) {
        studentSelect.innerHTML = '<option value="">Select Your Name</option>';
        return;
    }
    
    const students = db.getStudentsByClass(classId);
    studentSelect.innerHTML = '<option value="">Select Your Name</option>' +
        students.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
}

function studentLoginSubmit() {
    console.log('studentLoginSubmit() called');
    
    const classId = document.getElementById('studentClassSelect').value;
    const studentId = document.getElementById('studentNameSelect').value;
    
    console.log('Login attempt:', { classId, studentId });
    
    if (!classId || !studentId) {
        alert('Please select both class and your name');
        return;
    }
    
    loggedInClass = classId;
    loggedInStudent = studentId;
    
    // Store login session (persists across browser restarts)
    localStorage.setItem('loggedInStudent', studentId);
    localStorage.setItem('loggedInClass', classId);
    
    console.log('Fetching student and class data...');
    const student = db.getStudent(classId, studentId);
    const classData = db.getClass(classId);
    
    console.log('Student:', student);
    console.log('Class:', classData);
    
    if (!student || !classData) {
        alert('Student or class data not found. Please try again.');
        console.error('Failed to load student or class data');
        return;
    }
    
    console.log('Student logged in:', student.name, 'from', classData.name);
    
    document.getElementById('studentWelcome').textContent = `Welcome, ${student.name}! (${classData.name})`;
    
    showSection('studentDashboard');
    switchStudentTab('assignments');
}

function studentLogout() {
    loggedInStudent = null;
    loggedInClass = null;
    
    // Clear persisted login
    localStorage.removeItem('loggedInStudent');
    localStorage.removeItem('loggedInClass');
    
    console.log('Student logged out');
    showSection('studentLogin');
}

// Student Dashboard Tabs
function switchStudentTab(tabName) {
    // Remove active from all tabs and buttons
    document.querySelectorAll('#studentDashboard .dashboard-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('#studentDashboard .tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Activate selected tab
    const tabId = `student${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`;
    document.getElementById(tabId).classList.add('active');
    
    // Activate corresponding button
    event.target.classList.add('active');
    
    // Load appropriate content
    if (tabName === 'assignments') {
        loadStudentAssignments();
    } else if (tabName === 'completed') {
        loadStudentCompleted();
    }
    // practice tab doesn't need loading, it's static
}

// Load Student's Assignments
function loadStudentAssignments() {
    if (!loggedInStudent) return;
    
    const allAssignments = db.getAllAssignments();
    const studentAssignments = allAssignments.filter(a => 
        a.studentIds.includes(loggedInStudent) && a.status === 'active'
    );
    
    const results = db.getResultsByStudent(loggedInStudent);
    
    // Filter out completed assignments
    const pendingAssignments = studentAssignments.filter(assignment => {
        return !results.some(r => r.assignmentId === assignment.id);
    });
    
    const list = document.getElementById('studentAssignmentsList');
    
    if (pendingAssignments.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px;">🎉 No pending assignments! Great job!</p>';
        return;
    }
    
    list.innerHTML = pendingAssignments.map(assignment => {
        const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
        const isOverdue = dueDate && dueDate < new Date();
        
        return `
            <div class="assignment-card student-assignment-card">
                <div class="assignment-header">
                    <h4>${assignment.topic.charAt(0).toUpperCase() + assignment.topic.slice(1)} Quiz</h4>
                    ${isOverdue ? '<span class="assignment-status" style="background: #dc3545;">Overdue</span>' : '<span class="assignment-status">Pending</span>'}
                </div>
                <p><strong>Difficulty:</strong> ${assignment.difficulty.charAt(0).toUpperCase() + assignment.difficulty.slice(1)}</p>
                ${assignment.dueDate ? `<p><strong>Due:</strong> ${dueDate.toLocaleDateString()}</p>` : ''}
                <button class="btn-primary" onclick="startAssignment('${assignment.id}')">Start Assignment</button>
            </div>
        `;
    }).join('');
}

// Load Student's Completed Assignments
function loadStudentCompleted() {
    if (!loggedInStudent) return;
    
    const results = db.getResultsByStudent(loggedInStudent);
    const assignmentResults = results.filter(r => r.assignmentId);
    
    const list = document.getElementById('studentCompletedList');
    
    if (assignmentResults.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #aaa; padding: 40px;">No completed assignments yet.</p>';
        return;
    }
    
    list.innerHTML = assignmentResults.map(result => {
        const assignment = db.getAllAssignments().find(a => a.id === result.assignmentId);
        const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
        
        return `
            <div class="assignment-card">
                <div class="assignment-header">
                    <h4>${result.topic.charAt(0).toUpperCase() + result.topic.slice(1)} Quiz</h4>
                    <span class="assignment-status" style="background: #28a745;">Completed</span>
                </div>
                <p><strong>Score:</strong> ${result.score} points</p>
                <p><strong>Accuracy:</strong> ${percentage}% (${result.correctAnswers}/${result.totalQuestions})</p>
                <p><strong>Completed:</strong> ${new Date(result.completedAt).toLocaleDateString()}</p>
                ${assignment && assignment.dueDate ? 
                    `<p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>` : ''}
            </div>
        `;
    }).join('');
}

// Start Assignment
function startAssignment(assignmentId) {
    const assignment = db.getAllAssignments().find(a => a.id === assignmentId);
    
    if (!assignment) {
        alert('Assignment not found');
        return;
    }
    
    // Set game state for assignment
    gameState.studentId = loggedInStudent;
    gameState.classId = loggedInClass;
    gameState.assignmentId = assignmentId;
    
    // Set topic, mode, and difficulty from assignment
    currentTopic = assignment.topic;
    currentMode = 'quiz'; // Assignments are always quiz mode
    currentDifficulty = assignment.difficulty;
    
    // Start the game
    showSection('gameModeMenu');
    document.getElementById('topicTitle').textContent = assignment.topic.charAt(0).toUpperCase() + assignment.topic.slice(1);
    
    // Auto-start the game
    setTimeout(() => {
        startGame();
    }, 100);
}

// Practice Mode (no tracking)
function startPracticeMode(topic) {
    gameState.studentId = loggedInStudent;
    gameState.classId = loggedInClass;
    gameState.assignmentId = null; // No assignment = practice mode
    
    currentTopic = topic;
    showSection('gameModeMenu');
    document.getElementById('topicTitle').textContent = topic.charAt(0).toUpperCase() + topic.slice(1);
}

// Override endGame to return to student dashboard
const originalEndGame = endGame;
window.endGameOverride = function() {
    originalEndGame();
    
    // If student is logged in and completed an assignment, show completion message
    if (loggedInStudent && gameState.assignmentId) {
        setTimeout(() => {
            alert('✅ Assignment submitted successfully!');
            showSection('studentDashboard');
            switchStudentTab('completed');
            gameState.assignmentId = null;
        }, 2000);
    }
};

// Initialize teacher dashboard when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Verify database is accessible
    if (!window.db) {
        console.error('Database not initialized!');
        return;
    }
    
    console.log('Database initialized. Classes stored:', db.getAllClasses().length);
    
    // Populate class dropdown for student login
    const studentClassSelect = document.getElementById('studentClassSelect');
    if (studentClassSelect) {
        const classes = db.getAllClasses();
        studentClassSelect.innerHTML = '<option value="">Select Your Class</option>' +
            classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    }
    
    // Restore student session if exists (persists across browser restarts)
    const savedStudentId = localStorage.getItem('loggedInStudent');
    const savedClassId = localStorage.getItem('loggedInClass');
    
    if (savedStudentId && savedClassId) {
        const student = db.getStudent(savedClassId, savedStudentId);
        const classData = db.getClass(savedClassId);
        
        if (student && classData) {
            loggedInStudent = savedStudentId;
            loggedInClass = savedClassId;
            console.log('Restored student session:', student.name, 'from', classData.name);
            
            // Auto-show student dashboard
            document.getElementById('studentWelcome').textContent = `Welcome back, ${student.name}! (${classData.name})`;
            // Don't auto-navigate to dashboard, let user choose
        } else {
            // Clear invalid session
            console.log('Clearing invalid student session');
            localStorage.removeItem('loggedInStudent');
            localStorage.removeItem('loggedInClass');
        }
    }
    
    // Auto-load classes when dashboard is opened
    const dashboardObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'teacherDashboard' && 
                mutation.target.classList.contains('active')) {
                loadClasses();
            }
            if (mutation.target.id === 'studentDashboard' && 
                mutation.target.classList.contains('active')) {
                loadStudentAssignments();
            }
        });
    });
    
    const dashboard = document.getElementById('teacherDashboard');
    if (dashboard) {
        dashboardObserver.observe(dashboard, { attributes: true, attributeFilter: ['class'] });
    }
    
    const studentDashboard = document.getElementById('studentDashboard');
    if (studentDashboard) {
        dashboardObserver.observe(studentDashboard, { attributes: true, attributeFilter: ['class'] });
    }
});

