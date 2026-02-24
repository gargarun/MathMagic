// Teacher Dashboard Logic

let currentClassId = null;
let currentStudentId = null;

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
    const name = document.getElementById('className').value.trim();
    const description = document.getElementById('classDescription').value.trim();
    
    if (!name) {
        alert('Please enter a class name');
        return;
    }
    
    const classData = {
        name,
        description
    };
    
    if (db.saveClass(classData)) {
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
        
        return `
            <div class="assignment-card">
                <div class="assignment-header">
                    <h4>${assignment.topic.charAt(0).toUpperCase() + assignment.topic.slice(1)} - ${assignment.difficulty}</h4>
                    <span class="assignment-status">${assignment.status}</span>
                </div>
                <p><strong>Class:</strong> ${classData ? classData.name : 'Unknown'}</p>
                <p><strong>Students:</strong> ${assignment.studentIds.length}</p>
                <p><strong>Completed:</strong> ${results.length} / ${assignment.studentIds.length} (${completionRate}%)</p>
                ${assignment.dueDate ? `<p><strong>Due:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>` : ''}
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

// Initialize teacher dashboard when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Auto-load classes when dashboard is opened
    const dashboardObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.target.id === 'teacherDashboard' && 
                mutation.target.classList.contains('active')) {
                loadClasses();
            }
        });
    });
    
    const dashboard = document.getElementById('teacherDashboard');
    if (dashboard) {
        dashboardObserver.observe(dashboard, { attributes: true, attributeFilter: ['class'] });
    }
});
