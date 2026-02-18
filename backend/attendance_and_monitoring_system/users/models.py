from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('hod', 'HOD'),
        ('teacher', 'Teacher'),
        ('student', 'Student')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    department = models.ForeignKey(
        'attendance.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )
    semester = models.ForeignKey(
        'attendance.Semester',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students',
        help_text='Current semester for students'
    )
    phone = models.CharField(max_length=15, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, null=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
