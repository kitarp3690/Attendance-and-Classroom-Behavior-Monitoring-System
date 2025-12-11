from rest_framework import serializers
from .models import (
    Department, Semester, Subject, Class, ClassStudent, TeacherAssignment,
    ClassSchedule, Session, Attendance, AttendanceChange,
    AttendanceReport, FaceEmbedding, Notification
)
from users.models import CustomUser


class DepartmentSerializer(serializers.ModelSerializer):
    """Serializer for Department model"""
    hod_name = serializers.SerializerMethodField()
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'hod', 'hod_name', 'contact_email']
        read_only_fields = ['id']
    
    def get_hod_name(self, obj):
        return obj.hod.get_full_name() if obj.hod else None


class SemesterSerializer(serializers.ModelSerializer):
    """Serializer for Semester model"""
    department_name = serializers.SerializerMethodField()
    semester_display = serializers.CharField(source='get_number_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Semester
        fields = ['id', 'number', 'semester_display', 'department', 'department_name', 'academic_year', 'start_date', 'end_date', 'status', 'status_display', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None


class UserSerializer(serializers.ModelSerializer):
    """Serializer for CustomUser model"""
    department_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'department', 'department_name', 'phone', 'avatar', 'date_of_birth', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer with all fields"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display', 'phone', 'avatar', 'date_of_birth', 'address', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SubjectSerializer(serializers.ModelSerializer):
    """Serializer for Subject model"""
    department_name = serializers.SerializerMethodField()
    semester_number = serializers.SerializerMethodField()
    
    class Meta:
        model = Subject
        fields = ['id', 'name', 'code', 'description', 'department', 'department_name', 'semester', 'semester_number', 'credits', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None
    
    def get_semester_number(self, obj):
        return obj.semester.number if obj.semester else None


class ClassSerializer(serializers.ModelSerializer):
    """Serializer for Class model"""
    subjects = SubjectSerializer(many=True, read_only=True)
    department_name = serializers.SerializerMethodField()
    semester_number = serializers.SerializerMethodField()
    student_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = ['id', 'name', 'section', 'description', 'academic_year', 'department', 'department_name', 'semester', 'semester_number', 'subjects', 'student_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None
    
    def get_semester_number(self, obj):
        return obj.semester.number if obj.semester else None
    
    def get_student_count(self, obj):
        return obj.enrolled_students.filter(enrollment_status='active').count()


class ClassDetailSerializer(serializers.ModelSerializer):
    """Detailed class serializer with students"""
    subjects = SubjectSerializer(many=True, read_only=True)
    department_name = serializers.SerializerMethodField()
    enrolled_students = serializers.SerializerMethodField()
    
    class Meta:
        model = Class
        fields = ['id', 'name', 'section', 'description', 'academic_year', 'department', 'department_name', 'semester', 'subjects', 'enrolled_students', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None
    
    def get_enrolled_students(self, obj):
        students = obj.enrolled_students.filter(enrollment_status='active').select_related('student')
        return [
            {
                'id': cs.student.id,
                'name': cs.student.get_full_name(),
                'username': cs.student.username,
                'enrollment_date': cs.enrollment_date
            }
            for cs in students
        ]


class ClassStudentSerializer(serializers.ModelSerializer):
    """Serializer for ClassStudent model"""
    student_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ClassStudent
        fields = ['id', 'student', 'student_name', 'class_assigned', 'class_name', 'enrollment_date', 'enrollment_status']
        read_only_fields = ['id', 'enrollment_date']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name()
    
    def get_class_name(self, obj):
        return f"{obj.class_assigned.name} - {obj.class_assigned.section}"


class ClassScheduleSerializer(serializers.ModelSerializer):
    """Serializer for ClassSchedule model"""
    class_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    day_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ClassSchedule
        fields = ['id', 'class_assigned', 'class_name', 'subject', 'subject_name', 'day_of_week', 'day_name', 'scheduled_start_time', 'scheduled_end_time', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_class_name(self, obj):
        return f"{obj.class_assigned.name} - {obj.class_assigned.section}"
    
    def get_subject_name(self, obj):
        return obj.subject.name
    
    def get_day_name(self, obj):
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        return days[obj.day_of_week] if 0 <= obj.day_of_week <= 5 else 'Unknown'


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for TeacherAssignment model"""
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    class_name = serializers.CharField(source='class_assigned.name', read_only=True)
    class_section = serializers.CharField(source='class_assigned.section', read_only=True)
    
    class Meta:
        model = TeacherAssignment
        fields = ['id', 'teacher', 'teacher_name', 'subject', 'subject_name', 'subject_code', 'class_assigned', 'class_name', 'class_section', 'semester', 'cross_department', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class SessionSerializer(serializers.ModelSerializer):
    """Serializer for Session model"""
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    class_name = serializers.CharField(source='class_assigned.name', read_only=True)
    class_section = serializers.CharField(source='class_assigned.section', read_only=True)
    department_name = serializers.SerializerMethodField()
    present_count = serializers.SerializerMethodField()
    absent_count = serializers.SerializerMethodField()
    late_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Session
        fields = ['id', 'teacher', 'teacher_name', 'subject', 'subject_name', 'subject_code', 'class_assigned', 'class_name', 'class_section', 'department', 'department_name', 'start_time', 'end_time', 'is_active', 'attendance_finalized', 'total_students', 'camera_feed_id', 'present_count', 'absent_count', 'late_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None
    
    def get_present_count(self, obj):
        return obj.attendances.filter(status='present').count()
    
    def get_absent_count(self, obj):
        return obj.attendances.filter(status='absent').count()
    
    def get_late_count(self, obj):
        return obj.attendances.filter(status='late').count()


class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for Attendance model"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    subject_name = serializers.CharField(source='session.subject.name', read_only=True)
    subject_code = serializers.CharField(source='session.subject.code', read_only=True)
    session_date = serializers.DateTimeField(source='session.start_time', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    marked_by_name = serializers.CharField(source='marked_by.get_full_name', read_only=True, allow_null=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'student', 'student_name', 'student_username', 'session', 'subject_name', 'subject_code', 'session_date', 'status', 'status_display', 'detected_time', 'marked_at', 'marked_by', 'marked_by_name', 'notes', 'confidence_score', 'is_verified']
        read_only_fields = ['id', 'marked_at']
    
    def validate_confidence_score(self, value):
        if value is not None and (value < 0 or value > 1):
            raise serializers.ValidationError("Confidence score must be between 0 and 1.")
        return value


class AttendanceChangeSerializer(serializers.ModelSerializer):
    """Serializer for AttendanceChange model"""
    changed_by_name = serializers.SerializerMethodField()
    approved_by_name = serializers.SerializerMethodField()
    attendance_info = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceChange
        fields = ['id', 'attendance', 'attendance_info', 'changed_by', 'changed_by_name', 'old_status', 'new_status', 'reason', 'notes', 'changed_at', 'approved_by', 'approved_by_name', 'approved_at']
        read_only_fields = ['id', 'changed_at']
    
    def get_changed_by_name(self, obj):
        return obj.changed_by.get_full_name() if obj.changed_by else 'System'
    
    def get_approved_by_name(self, obj):
        return obj.approved_by.get_full_name() if obj.approved_by else None
    
    def get_attendance_info(self, obj):
        return {
            'student': obj.attendance.student.get_full_name(),
            'subject': obj.attendance.session.subject.name,
            'date': obj.attendance.session.start_time.strftime('%Y-%m-%d'),
            'time': obj.attendance.session.start_time.strftime('%H:%M')
        }


class AttendanceReportSerializer(serializers.ModelSerializer):
    """Serializer for AttendanceReport model"""
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    class_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AttendanceReport
        fields = ['id', 'student', 'student_name', 'subject', 'subject_name', 'class_assigned', 'class_name', 'semester', 'total_classes_held', 'present_count', 'absent_count', 'late_count', 'percentage', 'generated_at']
        read_only_fields = ['id', 'generated_at']
    
    def get_student_name(self, obj):
        return obj.student.get_full_name()
    
    def get_subject_name(self, obj):
        return obj.subject.name
    
    def get_class_name(self, obj):
        return f"{obj.class_assigned.name} - {obj.class_assigned.section}"


class FaceEmbeddingSerializer(serializers.ModelSerializer):
    """Serializer for FaceEmbedding model"""
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    student_username = serializers.CharField(source='student.username', read_only=True)
    
    class Meta:
        model = FaceEmbedding
        fields = ['id', 'student', 'student_name', 'student_username', 'embedding_vector', 'image', 'captured_at', 'updated_at']
        read_only_fields = ['id', 'captured_at', 'updated_at']


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model"""
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'user', 'user_name', 'category', 'category_display', 'title', 'message', 'is_read', 'read_at', 'related_attendance', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class AttendanceStatisticsSerializer(serializers.Serializer):
    """Serializer for attendance statistics"""
    total = serializers.IntegerField()
    present = serializers.IntegerField()
    absent = serializers.IntegerField()
    late = serializers.IntegerField()
    percentage = serializers.FloatField()
    subject = serializers.CharField(required=False)
    date = serializers.DateField(required=False)
