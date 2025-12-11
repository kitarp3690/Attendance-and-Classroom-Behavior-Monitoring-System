export function getRoleFromSession() {
    return sessionStorage.getItem("role");
}

export function getSidebarMenu(role) {
    switch (role) {
        case "admin":
            return [
                { icon: "fa fa-home", text: "Dashboard", active: true },
                { icon: "fa fa-users", text: "Manage Users" },
                { icon: "fa fa-building", text: "Manage Classes" },
                { icon: "fa fa-book", text: "Manage Subjects" },
                { icon: "fa fa-calendar-alt", text: "Manage Semesters" },
                { icon: "fa fa-random", text: "Assign Subjects to Teachers" },
                { icon: "fa fa-list", text: "View All Attendance" },
                { icon: "fa fa-chart-bar", text: "Attendance Summary" },
                { icon: "fa fa-file", text: "Reports" },
                { icon: "fa fa-cog", text: "Settings" },
            ];
        case "hod":
            return [
                { icon: "fa fa-home", text: "Dashboard", active: true },
                { icon: "fa fa-users", text: "Manage Teachers" },
                { icon: "fa fa-check-square", text: "Approvals" },
                { icon: "fa fa-chart-bar", text: "Department Analytics" },
                { icon: "fa fa-calendar", text: "Class Schedule" },
            ];
        case "teacher":
            return [
                { icon: "fa fa-home", text: "Dashboard", active: true },
                { icon: "fa fa-play", text: "Start/End Class Session" },
                { icon: "fa fa-edit", text: "View/Edit Attendance" },
                { icon: "fa fa-chart-bar", text: "Attendance Reports" },
            ];
        case "student":
            return [
                { icon: "fa fa-home", text: "Dashboard", active: true },
                { icon: "fa fa-book", text: "View Attendance" },
                { icon: "fa fa-bell", text: "Notifications" },
            ];
        default:
            return [];
    }
}