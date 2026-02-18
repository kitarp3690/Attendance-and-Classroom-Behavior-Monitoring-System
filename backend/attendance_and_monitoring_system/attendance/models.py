
# --- Updated Models for Khwopa Engineering College Scenario ---
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    code = models.CharField(max_length=20, unique=True)
    hod = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        null=False,
        blank=False,
        related_name='headed_departments',
        limit_choices_to={'role': 'hod'}
    )
    contact_email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return f"{self.code} - {self.name}"

    class Meta:
        ordering = ['code']
        constraints = [
            models.UniqueConstraint(fields=['hod'], name='unique_hod_per_department')
        ]

class Semester(models.Model):
    """Represents semesters 1-8 for each department"""
    SEMESTER_CHOICES = [(i, f'Semester {i}') for i in range(1, 9)]
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('upcoming', 'Upcoming'),
    ]
    
    number = models.IntegerField(choices=SEMESTER_CHOICES, validators=[MinValueValidator(1), MaxValueValidator(8)])
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='semesters')
    academic_year = models.CharField(max_length=20, default='2024-2025')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('number', 'department', 'academic_year')
        ordering = ['department', 'number']
        indexes = [
            models.Index(fields=['department', 'number']),
            models.Index(fields=['academic_year']),
        ]

    def __str__(self):
        return f"{self.department.code} - Semester {self.number} ({self.academic_year})"

class Subject(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='subjects', null=True, blank=True)
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
    name = models.CharField(max_length=100)
    section = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    academic_year = models.CharField(max_length=20, default='2024-2025')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='classes', null=True, blank=True)
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='classes', null=True, blank=True)
    subjects = models.ManyToManyField(Subject, related_name='classes', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Classes"
        ordering = ['name', 'section']
        unique_together = ('name', 'section', 'academic_year')
        indexes = [
            models.Index(fields=['academic_year']),
        ]

    def __str__(self):
        return f"{self.name} - {self.section}"

class ClassStudent(models.Model):
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

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.class_assigned.name}"

class TeacherAssignment(models.Model):
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subject_assignments',
        limit_choices_to={'role': 'teacher'}
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='teacher_assignments')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='teacher_assignments')
    semester = models.ForeignKey(Semester, on_delete=models.CASCADE, related_name='teacher_assignments', null=True, blank=True)
    teaching_department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='teaching_assignments',
        null=True,
        blank=True,
        help_text="Department where this subject is taught (may differ from teacher's home department)"
    )
    cross_department = models.BooleanField(default=False, help_text="True if teacher is teaching outside their home department")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('teacher', 'subject', 'class_assigned')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['teacher']),
            models.Index(fields=['subject']),
            models.Index(fields=['class_assigned']),
        ]

    def __str__(self):
        return f"{self.teacher.get_full_name()} - {self.subject.code} ({self.class_assigned.name})"

class ClassSchedule(models.Model):
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='schedules')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='schedules')
    day_of_week = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(5)])  # 0=Sun, 5=Fri
    scheduled_start_time = models.TimeField()
    scheduled_end_time = models.TimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('class_assigned', 'subject', 'day_of_week', 'scheduled_start_time')
        ordering = ['class_assigned', 'day_of_week', 'scheduled_start_time']

    def __str__(self):
        return f"{self.class_assigned.name} - {self.subject.code} ({self.day_of_week})"

class Session(models.Model):
    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sessions',
        limit_choices_to={'role': 'teacher'}
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='sessions')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='sessions')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='sessions', null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    grace_period_minutes = models.IntegerField(
        default=10,
        validators=[MinValueValidator(0), MaxValueValidator(60)],
        help_text="Grace period in minutes before marking late (default: 10 minutes)"
    )
    is_active = models.BooleanField(default=True)
    attendance_finalized = models.BooleanField(default=False)
    total_students = models.IntegerField(default=0)
    camera_feed_id = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['teacher']),
            models.Index(fields=['start_time']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return f"{self.subject.code} - {self.start_time.strftime('%Y-%m-%d %H:%M')}"

class Attendance(models.Model):
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
    detected_time = models.DateTimeField(null=True, blank=True)
    late_entry_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Exact time student was detected if marked as late"
    )
    marked_at = models.DateTimeField(auto_now_add=True)
    marked_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='marked_attendances'
    )
    notes = models.TextField(blank=True, null=True)
    confidence_score = models.FloatField(
        null=True,
        blank=True,
        help_text="AI face recognition confidence (0-1)",
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    is_verified = models.BooleanField(default=False)

    class Meta:
        unique_together = ('student', 'session')
        ordering = ['-marked_at']
        indexes = [
            models.Index(fields=['student']),
            models.Index(fields=['session']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.session.subject.code} ({self.status})"

class AttendanceChange(models.Model):
    attendance = models.ForeignKey(Attendance, on_delete=models.CASCADE, related_name='changes')
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='attendance_changes'
    )
    old_status = models.CharField(max_length=20)
    new_status = models.CharField(max_length=20)
    reason = models.CharField(max_length=100)
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

    def __str__(self):
        return f"Change: {self.attendance} {self.old_status}->{self.new_status}"

class AttendanceReport(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='attendance_reports',
        limit_choices_to={'role': 'student'}
    )
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='attendance_reports')
    class_assigned = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='attendance_reports')
    semester = models.CharField(max_length=20)
    total_classes_held = models.IntegerField(default=0)
    present_count = models.IntegerField(default=0)
    absent_count = models.IntegerField(default=0)
    late_count = models.IntegerField(default=0)
    percentage = models.FloatField(default=0.0)
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('student', 'subject', 'class_assigned', 'semester')
        ordering = ['-generated_at']

    def __str__(self):
        return f"Report: {self.student.get_full_name()} {self.subject.code} {self.percentage}%"

class FaceEmbedding(models.Model):
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
