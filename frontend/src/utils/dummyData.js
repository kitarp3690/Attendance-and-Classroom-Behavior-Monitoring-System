export const dummyAdminData = {
    totalStudents: 1250,
    totalTeachers: 100,
    totalClasses: 35,
    attendanceToday: 1100,
    alerts: "3 classes below 60% attendance.",
    filterOptions: {
        semester: ["1", "2", "3", "4", "5", "6", "7", "8"],
        class: ["A", "B", "C", "D"],
        subject: ["Math", "Physics", "Chemistry"],
        teacher: ["Alice", "Bob", "Carol"],
        date: ["Today", "This week", "This month"],
    },
    attendance: [
        { id: 1, studentName: "John Doe", class: "A", subject: "Math", teacher: "Alice", date: "2025-11-13", status: "Present" },
        { id: 2, studentName: "Jane Smith", class: "B", subject: "Physics", teacher: "Bob", date: "2025-11-13", status: "Late" },
        { id: 3, studentName: "Sam Lee", class: "C", subject: "Chemistry", teacher: "Carol", date: "2025-11-13", status: "Absent" },
    ],
    charts: {
        labels: ["Week 1", "Week 2", "Week 3"],
        present: [220, 215, 230],
        absent: [5, 7, 3],
        late: [2, 3, 4]
    }
};

export const dummyTeacherData = {
    totalStudents: 70,
    attendanceToday: 67,
    filterOptions: {
        subject: ["Math", "Physics"],
        class: ["A", "B"],
        date: ["Today", "Week", "Month"],
    },
    attendance: [
        { id: 1, studentName: "John Doe", class: "A", subject: "Math", teacher: "Alice", date: "2025-11-13", status: "Present" },
        { id: 2, studentName: "Jane Smith", class: "B", subject: "Math", teacher: "Alice", date: "2025-11-13", status: "Late" },
    ],
    charts: {
        labels: ["Mon", "Tue", "Wed"],
        present: [20, 19, 20],
        absent: [1, 2, 1],
        late: [0, 1, 0]
    }
};

export const dummyStudentData = {
    subjects: ["Math", "Physics", "Chemistry"],
    summary: {
        totalClasses: 30,
        present: 25,
        absent: 3,
        late: 2,
    },
    detail: [
        { date: "11/1", status: "Present" },
        { date: "11/2", status: "Absent" },
        { date: "11/3", status: "Present" },
        { date: "11/4", status: "Late" },
    ],
    charts: {
        labels: ["Week 1", "Week 2", "Week 3"],
        present: [9, 8, 8],
        absent: [1, 0, 2],
        late: [0, 1, 0]
    }
};