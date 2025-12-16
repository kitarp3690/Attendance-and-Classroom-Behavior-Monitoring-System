export function getRoleFromSession() {
    return sessionStorage.getItem("role");
}

export function getSidebarMenu(role) {
    switch (role) {
        case "admin":
            return [
                { icon: "fa fa-home", text: "Dashboard", path: "/admin/dashboard" },
                { icon: "fa fa-users", text: "Manage Users", path: "/admin/users" },
                { icon: "fa fa-building", text: "Manage Departments", path: "/admin/departments" },
                { icon: "fa fa-book", text: "Manage Subjects", path: "/admin/subjects" },
                { icon: "fa fa-calendar-alt", text: "Manage Semesters", path: "/admin/semesters" },
                { icon: "fa fa-user-tie", text: "Assign HOD", path: "/admin/assign-hod" },
                { icon: "fa fa-chalkboard-teacher", text: "Assign Teachers", path: "/admin/assign-teachers" },
                { icon: "fa fa-file", text: "Reports", path: "/admin/reports" },
            ];
        case "hod":
            return [
                { icon: "fa fa-home", text: "Dashboard", path: "/hod/dashboard" },
                { icon: "fa fa-check-square", text: "Approve Changes", path: "/hod/approve-changes" },
                { icon: "fa fa-chart-bar", text: "Department Analytics", path: "/hod/analytics" },
                { icon: "fa fa-file", text: "Reports", path: "/hod/reports" },
            ];
        case "teacher":
            return [
                { icon: "fa fa-home", text: "Dashboard", path: "/teacher/dashboard" },
                { icon: "fa fa-play", text: "Session Management", path: "/teacher/sessions" },
                { icon: "fa fa-edit", text: "View/Edit Attendance", path: "/teacher/view-attendance" },
                { icon: "fa fa-chart-bar", text: "Reports", path: "/teacher/reports" },
            ];
        case "student":
            return [
                { icon: "fa fa-home", text: "Dashboard", path: "/student/dashboard" },
                { icon: "fa fa-book", text: "View Attendance", path: "/student/attendance" },
                { icon: "fa fa-bell", text: "Notifications", path: "/student/notifications" },
            ];
        default:
            return [];
    }
}