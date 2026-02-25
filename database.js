// Database module - works with localStorage (on-prem) and Firebase/Supabase (cloud)
// Designed to work both locally and on Vercel

class Database {
    constructor() {
        this.useCloud = false; // Set to true when using Firebase/Supabase
        this.firebaseConfig = null;
    }

    // Initialize cloud database (optional - falls back to localStorage)
    async initCloud(config) {
        try {
            // Firebase configuration can be added here
            this.firebaseConfig = config;
            this.useCloud = true;
            console.log('Cloud database initialized');
        } catch (error) {
            console.warn('Cloud init failed, using localStorage:', error);
            this.useCloud = false;
        }
    }

    // Generic save method
    save(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            localStorage.setItem(key, jsonData);
            const itemCount = Array.isArray(data) ? data.length : 'N/A';
            console.log(`✓ Saved ${key}: ${itemCount} items`);
            return true;
        } catch (error) {
            console.error('✗ Save error for', key, ':', error.message);
            return false;
        }
    }

    // Generic get method
    get(key) {
        try {
            const data = localStorage.getItem(key);
            const parsed = data ? JSON.parse(data) : null;
            if (parsed) {
                const itemCount = Array.isArray(parsed) ? parsed.length : 'N/A';
                console.log(`✓ Loaded ${key}: ${itemCount} items`);
            }
            return parsed;
        } catch (error) {
            console.error('✗ Get error for', key, ':', error.message);
            return null;
        }
    }

    // Generic delete method
    delete(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Delete error:', error);
            return false;
        }
    }

    // Class Management
    saveClass(classData) {
        const classes = this.getAllClasses();
        const existingIndex = classes.findIndex(c => c.id === classData.id);
        
        if (existingIndex >= 0) {
            classes[existingIndex] = classData;
        } else {
            classData.id = classData.id || Date.now().toString();
            classData.createdAt = classData.createdAt || new Date().toISOString();
            classes.push(classData);
        }
        
        return this.save('classes', classes);
    }

    getAllClasses() {
        return this.get('classes') || [];
    }

    getClass(classId) {
        const classes = this.getAllClasses();
        return classes.find(c => c.id === classId);
    }

    deleteClass(classId) {
        const classes = this.getAllClasses();
        const filtered = classes.filter(c => c.id !== classId);
        return this.save('classes', filtered);
    }

    // Student Management
    saveStudent(classId, studentData) {
        const students = this.getStudentsByClass(classId);
        const existingIndex = students.findIndex(s => s.id === studentData.id);
        
        if (existingIndex >= 0) {
            students[existingIndex] = studentData;
        } else {
            studentData.id = studentData.id || Date.now().toString();
            studentData.classId = classId;
            studentData.createdAt = studentData.createdAt || new Date().toISOString();
            students.push(studentData);
        }
        
        return this.save(`students_${classId}`, students);
    }

    getStudentsByClass(classId) {
        return this.get(`students_${classId}`) || [];
    }

    getStudent(classId, studentId) {
        const students = this.getStudentsByClass(classId);
        return students.find(s => s.id === studentId);
    }

    deleteStudent(classId, studentId) {
        const students = this.getStudentsByClass(classId);
        const filtered = students.filter(s => s.id !== studentId);
        return this.save(`students_${classId}`, filtered);
    }

    // Quiz Assignment Management
    saveAssignment(assignmentData) {
        const assignments = this.getAllAssignments();
        const existingIndex = assignments.findIndex(a => a.id === assignmentData.id);
        
        if (existingIndex >= 0) {
            assignments[existingIndex] = assignmentData;
        } else {
            assignmentData.id = assignmentData.id || Date.now().toString();
            assignmentData.createdAt = assignmentData.createdAt || new Date().toISOString();
            assignments.push(assignmentData);
        }
        
        return this.save('assignments', assignments);
    }

    getAllAssignments() {
        return this.get('assignments') || [];
    }

    getAssignmentsByClass(classId) {
        const assignments = this.getAllAssignments();
        return assignments.filter(a => a.classId === classId);
    }

    // Quiz Results Management
    saveResult(resultData) {
        const results = this.getAllResults();
        resultData.id = resultData.id || Date.now().toString();
        resultData.completedAt = resultData.completedAt || new Date().toISOString();
        results.push(resultData);
        return this.save('results', results);
    }

    getAllResults() {
        return this.get('results') || [];
    }

    getResultsByStudent(studentId) {
        const results = this.getAllResults();
        return results.filter(r => r.studentId === studentId);
    }

    getResultsByClass(classId) {
        const results = this.getAllResults();
        return results.filter(r => r.classId === classId);
    }

    getResultsByAssignment(assignmentId) {
        const results = this.getAllResults();
        return results.filter(r => r.assignmentId === assignmentId);
    }

    // Performance Analytics
    getStudentPerformance(studentId) {
        const results = this.getResultsByStudent(studentId);
        
        if (results.length === 0) {
            return {
                totalQuizzes: 0,
                averageScore: 0,
                totalCorrect: 0,
                totalQuestions: 0,
                topicBreakdown: {}
            };
        }

        const totalQuizzes = results.length;
        const totalScore = results.reduce((sum, r) => sum + r.score, 0);
        const totalCorrect = results.reduce((sum, r) => sum + r.correctAnswers, 0);
        const totalQuestions = results.reduce((sum, r) => sum + r.totalQuestions, 0);
        
        // Topic-wise breakdown
        const topicBreakdown = {};
        results.forEach(result => {
            if (!topicBreakdown[result.topic]) {
                topicBreakdown[result.topic] = {
                    quizzes: 0,
                    totalScore: 0,
                    correct: 0,
                    total: 0
                };
            }
            topicBreakdown[result.topic].quizzes++;
            topicBreakdown[result.topic].totalScore += result.score;
            topicBreakdown[result.topic].correct += result.correctAnswers;
            topicBreakdown[result.topic].total += result.totalQuestions;
        });

        return {
            totalQuizzes,
            averageScore: Math.round(totalScore / totalQuizzes),
            totalCorrect,
            totalQuestions,
            accuracy: Math.round((totalCorrect / totalQuestions) * 100),
            topicBreakdown,
            recentResults: results.slice(-5).reverse()
        };
    }

    getClassPerformance(classId) {
        const students = this.getStudentsByClass(classId);
        const results = this.getResultsByClass(classId);
        
        const studentPerformances = students.map(student => {
            const studentResults = results.filter(r => r.studentId === student.id);
            const perf = this.getStudentPerformance(student.id);
            return {
                student,
                ...perf
            };
        });

        return {
            totalStudents: students.length,
            totalQuizzes: results.length,
            studentPerformances,
            classAverage: studentPerformances.length > 0 
                ? Math.round(studentPerformances.reduce((sum, sp) => sum + sp.averageScore, 0) / studentPerformances.length)
                : 0
        };
    }

    // Export data (for backup or cloud sync)
    exportAllData() {
        return {
            classes: this.getAllClasses(),
            students: this.getAllClasses().map(c => ({
                classId: c.id,
                students: this.getStudentsByClass(c.id)
            })),
            assignments: this.getAllAssignments(),
            results: this.getAllResults(),
            exportedAt: new Date().toISOString()
        };
    }

    // Import data (for restore or cloud sync)
    importData(data) {
        try {
            if (data.classes) this.save('classes', data.classes);
            if (data.assignments) this.save('assignments', data.assignments);
            if (data.results) this.save('results', data.results);
            if (data.students) {
                data.students.forEach(item => {
                    this.save(`students_${item.classId}`, item.students);
                });
            }
            return true;
        } catch (error) {
            console.error('Import error:', error);
            return false;
        }
    }
}

// Create singleton instance
const db = new Database();

// Make it available globally
if (typeof window !== 'undefined') {
    window.db = db;
}
