# Implementation Guide: Model & Schema Updates

## Overview
This guide provides the exact code changes needed to implement the scenario-based system design for Khwopa Engineering College.

---

## Phase 1: Database Model Updates

### Step 1: Update CustomUser Model

**File**: `backend/attendance_and_monitoring_system/users/models.py`

Add HOD role and department field:

```python
from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('hod', 'Head of Department'),  # NEW
        ('teacher', 'Teacher'),
        ('student', 'Student')
    ]
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    
    # NEW FIELD: Link user to department
    department = models.ForeignKey(
        'attendance.Department',  # Created in next step
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    
    phone = models.CharField(max_length=15, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    
    # NEW FIELD: Track if teacher/HOD is active
    is_active_staff = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['department']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
```

### Step 2: Update Attendance Models

**File**: `backend/attendance_and_monitoring_system/attendance/models.py`

Replace entire content with updated models:

```python
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


# ==================== ORGANIZATIONAL MODELS ====================

class Department(models.Model):
    """Academic Department"""
    name = models.CharField(max_length=200, unique=True)
    code = models.CharField(max_length=50, unique=True)
    
    hod = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='managed_department',
        limit_choices_to={'role': 'teacher'}  # HOD is a teacher
    )
    
    description = models.TextField(blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class Subject(models.Model):
    """Subject/Course model"""
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    
    # NEW FIELD: Link to department
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='subjects',
        null=True,
        blank=True
    )
    
    credits = models.IntegerField(default=3, validators=[MinValueValidator(0)])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['code']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['department']),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class Class(models.Model):
    """Class/Section model"""
    name = models.CharField(max_length=100)
    section = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    academic_year = models.CharField(max_length=20, default='2024-2025')
    
    # NEW FIELD: Link to department
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='classes',
        null=True,
        blank=True
    )
    
    # NEW FIELD: Semester
    SEMESTER_CHOICES = [
        ('1', 'First'), ('2', 'Second'), ('3', 'Third'), ('4', 'Fourth'),
        ('5', 'Fifth'), ('6', 'Sixth'), ('7', 'Seventh'), ('8', 'Eighth'),
    ]
    semester = models.CharField(max_length=20, choices=SEMESTER_CHOICES, default='1')
    
    subjects = models.ManyToManyField(Subject, related_name='classes', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Classes"
        ordering = ['name', 'section']
        unique_together = ('name', 'section', 'academic_year')
        indexes = [
            models.Index(fields=['academic_year']),
            models.Index(fields=['department']),
        ]

    def __str__(self):
        return f"{self.name} - {self.section} (Sem {self.semester})"


class ClassStudent(models.Model):
    """Enrollment of students in classes"""
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='enrolled_classes',
        limit_choices_to={'role': 'student'}
    )
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='enrolled_students')
    enrollment_date = models.DateField(auto_now_add=True)
    enrollment_status = models.CharField(
        max_length=20,
        choices=[('active', 'Active'), ('dropped', 'Dropped'), ('suspended', 'Suspended')],
        default='active'
    )

    class Meta:
        unique_together = ('student', 'class_assigned')
        ordering = ['-enrollment_date']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['enrollment_status']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.class_assigned.name}"


class TeacherAssignment(models.Model):
    """Assignment of teachers to subjects and classes"""
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subject_assignments',
        limit_choices_to={'role': 'teacher'}
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_assignments')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='teacher_assignments')
    
    # NEW FIELD: Support cross-department teaching
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='teacher_assignments',
        null=True,
        blank=True
    )
    
    is_cross_department = models.BooleanField(default=False)  # NEW
    semester = models.CharField(max_length=20, default='Spring 2024')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('teacher', 'subject', 'class_assigned')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['teacher']),
            models.Index(fields=['subject']),
            models.Index(fields=['class_assigned']),
            models.Index(fields=['is_cross_department']),
        ]

    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.subject.code} ({self.class_assigned.name})"


# ==================== SCHEDULE MODELS ====================

class ClassSchedule(models.Model):
    """Class schedule with flexible timing"""
    DAY_CHOICES = [
        (0, 'Sunday'),
        (1, 'Monday'),
        (2, 'Tuesday'),
        (3, 'Wednesday'),
        (4, 'Thursday'),
        (5, 'Friday'),
    ]

    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='schedules')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='schedules')
    
    day_of_week = models.IntegerField(choices=DAY_CHOICES)  # 0=Sunday to 5=Friday
    scheduled_start_time = models.TimeField()  # HH:MM format
    scheduled_end_time = models.TimeField()
    
    is_active = models.BooleanField(default=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('class_assigned', 'subject', 'day_of_week')
        ordering = ['day_of_week', 'scheduled_start_time']
        indexes = [
            models.Index(fields=['day_of_week']),
            models.Index(fields=['class_assigned']),
            models.Index(fields=['subject']),
        ]

    def __str__(self):
        return f"{self.get_day_of_week_display()} - {self.subject.code} ({self.scheduled_start_time}-{self.scheduled_end_time})"


# ==================== ATTENDANCE MODELS ====================

class Session(models.Model):
    """Attendance session (teacher-initiated class period)"""
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions',
        limit_choices_to={'role': 'teacher'}
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='sessions')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='sessions')
    
    # NEW FIELD: Department reference for HOD reporting
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='sessions',
        null=True,
        blank=True
    )
    
    start_time = models.DateTimeField()  # When teacher starts
    end_time = models.DateTimeField(null=True, blank=True)  # When teacher ends
    is_active = models.BooleanField(default=True)
    
    # NEW FIELD: Track if attendance is finalized
    attendance_finalized = models.BooleanField(default=False)
    
    # NEW FIELD: Camera feed reference for ML pipeline
    camera_feed_id = models.CharField(max_length=100, blank=True, null=True)
    
    total_students = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['teacher']),
            models.Index(fields=['start_time']),
            models.Index(fields=['is_active']),
            models.Index(fields=['department']),
        ]

    def __str__(self):
        return f"{self.subject.code} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"

    @property
    def duration_minutes(self):
        """Calculate session duration in minutes"""
        if self.end_time:
            delta = self.end_time - self.start_time
            return int(delta.total_seconds() / 60)
        return None


class Attendance(models.Model):
    """Attendance record for a student in a session"""
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendances',
        limit_choices_to={'role': 'student'}
    )
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='attendances')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='absent')
    
    marked_at = models.DateTimeField(auto_now_add=True)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='marked_attendances'
    )
    
    # NEW FIELDS: ML/Face recognition
    detected_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When the student was detected by camera/ML"
    )
    face_recognition_score = models.FloatField(
        null=True,
        blank=True,
        help_text="ML confidence score (0-1)",
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    confidence_score = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    
    # NEW FIELD: Manual verification
    is_verified = models.BooleanField(
        default=False,
        help_text="Verified by teacher or HOD"
    )
    
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'session')
        ordering = ['-marked_at']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['session']),
            models.Index(fields=['status']),
            models.Index(fields=['is_verified']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.session.subject.code} ({self.status})"

    @property
    def is_late(self):
        """Check if student was late (arrived after session start)"""
        if self.detected_time and self.session.start_time:
            return self.detected_time > self.session.start_time
        return False


class AttendanceChange(models.Model):
    """Audit trail for attendance modifications"""
    REASON_CHOICES = [
        ('manual_correction', 'Manual Correction'),
        ('late_entry', 'Late Entry'),
        ('medical_excuse', 'Medical Excuse'),
        ('teacher_request', 'Teacher Request'),
        ('hod_approval', 'HOD Approval'),
        ('system_correction', 'System Correction'),
        ('other', 'Other'),
    ]

    attendance = models.ForeignKey(
        Attendance,
        on_delete=models.CASCADE,
        related_name='changes'
    )
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='attendance_changes'
    )
    
    old_status = models.CharField(max_length=20, choices=Attendance.STATUS_CHOICES)
    new_status = models.CharField(max_length=20, choices=Attendance.STATUS_CHOICES)
    reason = models.CharField(max_length=50, choices=REASON_CHOICES)
    notes = models.TextField(blank=True, null=True)
    changed_at = models.DateTimeField(auto_now_add=True)
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_attendance_changes',
        limit_choices_to={'role': 'hod'}
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-changed_at']
        indexes = [
            models.Index(fields=['changed_by']),
            models.Index(fields=['changed_at']),
            models.Index(fields=['approved_by']),
        ]

    def __str__(self):
        return f"{self.attendance.student.username} - {self.old_status} → {self.new_status}"


class AttendanceReport(models.Model):
    """Cached attendance statistics (performance optimization)"""
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendance_reports',
        limit_choices_to={'role': 'student'}
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE)
    semester = models.CharField(max_length=20)
    
    total_classes_held = models.IntegerField(default=0)
    present_count = models.IntegerField(default=0)
    absent_count = models.IntegerField(default=0)
    late_count = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)
    
    generated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'subject', 'class_assigned', 'semester')
        ordering = ['-generated_at']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['subject']),
            models.Index(fields=['semester']),
        ]

    def __str__(self):
        return f"{self.student.username} - {self.subject.code} ({self.percentage}%)"


class FaceEmbedding(models.Model):
    """Face embedding vectors for face recognition"""
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='embeddings',
        limit_choices_to={'role': 'student'}
    )
    embedding_vector = models.JSONField(help_text="512-dimensional embedding array")
    image = models.ImageField(upload_to='embeddings/', blank=True, null=True)
    captured_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-captured_at']
        indexes = [
            models.Index(fields=['student']),
        ]

    def __str__(self):
        return f"Embedding - {self.student.get_full_name()} ({self.captured_at.strftime('%Y-%m-%d')})"


class Notification(models.Model):
    """User notifications"""
    CATEGORY_CHOICES = [
        ('attendance', 'Attendance'),
        ('achievement', 'Achievement'),
        ('announcement', 'Announcement'),
        ('alert', 'Alert'),
        ('reminder', 'Reminder'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    related_attendance = models.ForeignKey(
        Attendance,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='notifications'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['is_read']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.title}"
```

---

## Step 3: Create and Run Migrations

```bash
cd backend\attendance_and_monitoring_system

# Create migration files
..\venv\Scripts\python.exe manage.py makemigrations

# Apply migrations
..\venv\Scripts\python.exe manage.py migrate
```

---

## Step 4: Update Django Admin Configuration

**File**: `backend/attendance_and_monitoring_system/attendance/admin.py`

```python
from django.contrib import admin
from .models import (
    Department, Subject, Class, ClassStudent, TeacherAssignment,
    ClassSchedule, Session, Attendance, AttendanceChange,
    AttendanceReport, FaceEmbedding, Notification
)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'hod', 'created_at')
    search_fields = ('name', 'code')
    list_filter = ('created_at',)


@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'department', 'credits')
    search_fields = ('code', 'name')
    list_filter = ('department', 'credits')


@admin.register(Class)
class ClassAdmin(admin.ModelAdmin):
    list_display = ('name', 'section', 'department', 'semester', 'academic_year')
    search_fields = ('name', 'section')
    list_filter = ('department', 'semester', 'academic_year')
    filter_horizontal = ('subjects',)


@admin.register(ClassStudent)
class ClassStudentAdmin(admin.ModelAdmin):
    list_display = ('student', 'class_assigned', 'enrollment_status', 'enrollment_date')
    search_fields = ('student__username', 'class_assigned__name')
    list_filter = ('enrollment_status', 'enrollment_date')


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'subject', 'class_assigned', 'is_cross_department')
    search_fields = ('teacher__username', 'subject__code')
    list_filter = ('is_cross_department', 'semester')


@admin.register(ClassSchedule)
class ClassScheduleAdmin(admin.ModelAdmin):
    list_display = ('get_day_name', 'subject', 'class_assigned', 'scheduled_start_time', 'scheduled_end_time')
    search_fields = ('subject__code', 'class_assigned__name')
    list_filter = ('day_of_week', 'is_active')
    
    def get_day_name(self, obj):
        return obj.get_day_of_week_display()
    get_day_name.short_description = 'Day'


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'subject', 'class_assigned', 'start_time', 'is_active', 'attendance_finalized')
    search_fields = ('teacher__username', 'subject__code')
    list_filter = ('is_active', 'attendance_finalized', 'start_time')
    readonly_fields = ('created_at',)


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'session', 'status', 'is_verified', 'marked_at')
    search_fields = ('student__username', 'session__subject__code')
    list_filter = ('status', 'is_verified', 'marked_at')
    readonly_fields = ('marked_at', 'created_at', 'updated_at')


@admin.register(AttendanceChange)
class AttendanceChangeAdmin(admin.ModelAdmin):
    list_display = ('attendance', 'old_status', 'new_status', 'changed_by', 'reason', 'changed_at')
    search_fields = ('attendance__student__username', 'changed_by__username')
    list_filter = ('reason', 'changed_at')
    readonly_fields = ('changed_at',)


@admin.register(AttendanceReport)
class AttendanceReportAdmin(admin.ModelAdmin):
    list_display = ('student', 'subject', 'semester', 'percentage', 'generated_at')
    search_fields = ('student__username', 'subject__code')
    list_filter = ('semester', 'generated_at')
    readonly_fields = ('generated_at',)


@admin.register(FaceEmbedding)
class FaceEmbeddingAdmin(admin.ModelAdmin):
    list_display = ('student', 'captured_at', 'updated_at')
    search_fields = ('student__username',)
    list_filter = ('captured_at',)
    readonly_fields = ('captured_at', 'updated_at')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'category', 'title', 'is_read', 'created_at')
    search_fields = ('user__username', 'title')
    list_filter = ('category', 'is_read', 'created_at')
    readonly_fields = ('created_at',)
```

**File**: `backend/attendance_and_monitoring_system/users/admin.py`

```python
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DefaultUserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(DefaultUserAdmin):
    list_display = ('username', 'get_full_name', 'role', 'department', 'is_active_staff', 'created_at')
    list_filter = ('role', 'department', 'is_active', 'is_active_staff', 'created_at')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Personal Info', {
            'fields': ('first_name', 'last_name', 'email', 'date_of_birth', 'phone', 'avatar', 'address')
        }),
        ('Role & Department', {
            'fields': ('role', 'department', 'is_active_staff')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Important Dates', {
            'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined')
```

---

## Summary of Changes

### New Models Created
1. ✅ **Department** - Academic departments with HOD management
2. ✅ **ClassSchedule** - Flexible class scheduling system
3. ✅ **AttendanceChange** - Audit trail for all modifications
4. ✅ **AttendanceReport** - Cached attendance statistics

### Model Updates
1. ✅ **CustomUser** - Added HOD role and department field
2. ✅ **Subject** - Added department reference
3. ✅ **Class** - Added department and semester fields
4. ✅ **TeacherAssignment** - Added cross-department support
5. ✅ **Session** - Added finalization and camera fields
6. ✅ **Attendance** - Added ML/verification fields

### Benefits
- ✅ Full scenario compliance
- ✅ Audit trail for all changes
- ✅ Department-based access control
- ✅ Cross-department teaching support
- ✅ Flexible scheduling support
- ✅ ML/Face recognition ready
- ✅ Performance optimization via caching

---

**Next Steps**: After migrations complete, create serializers and viewsets for new models.
