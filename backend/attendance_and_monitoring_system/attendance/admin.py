from django.contrib import admin
from .models import (
    Department, Subject, Class, ClassStudent, TeacherAssignment,
    ClassSchedule, Session, Attendance, AttendanceChange,
    AttendanceReport, FaceEmbedding, Notification
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'hod', 'contact_email')
    search_fields = ('code', 'name')
    ordering = ('code',)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'credits')
    list_filter = ('department', 'created_at')
    search_fields = ('code', 'name')
    ordering = ('code',)


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'section', 'academic_year', 'get_student_count', 'get_subjects_count')
    list_filter = ('academic_year', 'created_at')
    search_fields = ('name', 'section')
    filter_horizontal = ('subjects',)

    def get_student_count(self, obj):
        return obj.enrolled_students.filter(enrollment_status='active').count()
    get_student_count.short_description = 'Active Students'

    def get_subjects_count(self, obj):
        return obj.subjects.count()
    get_subjects_count.short_description = 'Subjects'


@admin.register(ClassStudent)
class ClassStudentAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_assigned', 'enrollment_status', 'enrollment_date')
    list_filter = ('enrollment_status', 'enrollment_date', 'class_assigned')
    search_fields = ('student__username', 'class_assigned__name')
    readonly_fields = ('enrollment_date',)


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'subject', 'class_assigned', 'semester')
    list_filter = ('semester', 'created_at', 'class_assigned')
    search_fields = ('teacher__username', 'subject__code', 'class_assigned__name')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('get_subject_code', 'teacher', 'class_assigned', 'start_time', 'is_active', 'get_attendance_count')
    list_filter = ('is_active', 'start_time', 'teacher')
    search_fields = ('subject__code', 'teacher__username', 'class_assigned__name')
    readonly_fields = ('created_at', 'total_students')
    date_hierarchy = 'start_time'

    def get_subject_code(self, obj):
        return obj.subject.code
    get_subject_code.short_description = 'Subject'

    def get_attendance_count(self, obj):
        return obj.attendances.count()
    get_attendance_count.short_description = 'Attendance Count'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'get_subject_code', 'status', 'marked_at', 'get_confidence')
    list_filter = ('status', 'marked_at', 'session__subject', 'session__class_assigned')
    search_fields = ('student__username', 'session__subject__code')
    readonly_fields = ('marked_at',)
    date_hierarchy = 'marked_at'

    def get_subject_code(self, obj):
        return obj.session.subject.code
    get_subject_code.short_description = 'Subject'

    def get_confidence(self, obj):
        if obj.confidence_score:
            return f"{obj.confidence_score:.2%}"
        return "N/A"
    get_confidence.short_description = 'Confidence'


@admin.register(FaceEmbedding)
class FaceEmbeddingAdmin(admin.ModelAdmin):
    list_display = ('student', 'captured_at', 'updated_at')
    list_filter = ('captured_at', 'updated_at')
    search_fields = ('student__username',)
    readonly_fields = ('captured_at', 'updated_at')
    date_hierarchy = 'captured_at'


@admin.register(ClassSchedule)
class ClassScheduleAdmin(admin.ModelAdmin):
    list_display = ('class_assigned', 'subject', 'get_day_name', 'scheduled_start_time', 'scheduled_end_time')
    list_filter = ('day_of_week', 'class_assigned')
    search_fields = ('class_assigned__name', 'subject__name')
    ordering = ('class_assigned', 'day_of_week', 'scheduled_start_time')

    def get_day_name(self, obj):
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        return days[obj.day_of_week] if 0 <= obj.day_of_week <= 5 else 'Unknown'
    get_day_name.short_description = 'Day'


@admin.register(AttendanceChange)
class AttendanceChangeAdmin(admin.ModelAdmin):
    list_display = ('get_student_name', 'old_status', 'new_status', 'changed_by', 'changed_at', 'is_approved')
    list_filter = ('old_status', 'new_status', 'changed_at')
    search_fields = ('attendance__student__username', 'changed_by__username', 'reason')
    readonly_fields = ('changed_at', 'approved_at')
    date_hierarchy = 'changed_at'

    def get_student_name(self, obj):
        return obj.attendance.student.get_full_name()
    get_student_name.short_description = 'Student'

    def is_approved(self, obj):
        return obj.approved_at is not None
    is_approved.boolean = True
    is_approved.short_description = 'Approved'


@admin.register(AttendanceReport)
class AttendanceReportAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'class_assigned', 'semester', 'percentage', 'total_classes_held', 'generated_at')
    list_filter = ('semester', 'class_assigned', 'generated_at')
    search_fields = ('student__username', 'subject__code')
    readonly_fields = ('generated_at',)
    date_hierarchy = 'generated_at'

    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('student', 'subject', 'class_assigned')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'title', 'is_read', 'created_at')
    list_filter = ('category', 'is_read', 'created_at')
    search_fields = ('user__username', 'title', 'message')
    readonly_fields = ('created_at', 'read_at')
    date_hierarchy = 'created_at'
