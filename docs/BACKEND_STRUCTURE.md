# Backend Structure Guide

Complete guide to backend architecture, models, serializers, views, and endpoints.

## 📁 Project Structure

```
backend/
├── attendance_and_monitoring_system/        # Main project folder
│   ├── settings.py                          # Django configuration
│   ├── urls.py                              # Root URL routing
│   ├── wsgi.py                              # Production server
│   ├── asgi.py                              # WebSocket server
│   ├── .env                                 # Environment variables
│   └── .env.example                         # Example env file
│
├── attendance/                              # Main app (13 models)
│   ├── models.py                            # Database models
│   ├── serializers.py                       # Data serializers
│   ├── views.py                             # API endpoints
│   ├── urls.py                              # App URL routing
│   ├── admin.py                             # Django admin config
│   ├── apps.py
│   ├── migrations/                          # Database migrations
│   └── tests.py                             # Unit tests
│
├── users/                                   # Authentication app
│   ├── models.py                            # CustomUser model
│   ├── serializers.py                       # User serializers
│   ├── views.py                             # Auth endpoints
│   ├── urls.py                              # Auth routing
│   ├── admin.py
│   └── migrations/
│
├── scripts/                                 # Utility scripts
│   ├── comprehensive_api_test.py            # API testing
│   ├── test_api.py                          # Manual tests
│   ├── fix_settings.py                      # Config fixes
│   ├── list_users.py                        # User listing
│   └── reset_passwords.py                   # Reset credentials
│
├── venv/                                    # Virtual environment
├── manage.py                                # Django management
├── requirements.txt                         # Dependencies
└── db.sqlite3                               # Local development DB
```

---

## 🗄️ Database Models

### 1. CustomUser (users/models.py)
**Purpose**: Authentication and user management

```python
class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('hod', 'Head of Department'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]
    
    role = CharField(choices=ROLE_CHOICES, max_length=20)
    department = ForeignKey(Department, on_delete=SET_NULL, null=True)
    address = CharField(max_length=255, blank=True)
    phone = CharField(max_length=20, blank=True)
    profile_picture = ImageField(upload_to='profiles/', null=True, blank=True)
```

**Key Methods**:
- `is_admin()`: Check if user is admin
- `is_hod()`: Check if user is HOD
- `is_teacher()`: Check if user is teacher
- `is_student()`: Check if user is student

**Serializer**:
```python
class CustomUserSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'role', 'department', 'phone', 'address']
```

---

### 2. Department
**Purpose**: Organize users and classes by department

```python
class Department(Model):
    name = CharField(max_length=100, unique=True)
    code = CharField(max_length=20)
    head_of_department = ForeignKey(CustomUser, on_delete=SET_NULL, 
                                    null=True, blank=True,
                                    related_name='headed_departments')
    description = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
        
    def __str__(self):
        return self.name
```

---

### 3. Subject
**Purpose**: Represent academic subjects/courses

```python
class Subject(Model):
    name = CharField(max_length=100)
    code = CharField(max_length=20, unique=True)
    credits = IntegerField(default=3)
    department = ForeignKey(Department, on_delete=CASCADE)
    description = TextField(blank=True)
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['code']
        unique_together = ['code', 'department']
        
    def __str__(self):
        return f"{self.code} - {self.name}"
```

---

### 4. Class
**Purpose**: Student classes (groups of students)

```python
class Class(Model):
    name = CharField(max_length=50)  # e.g., "BIT-1A"
    department = ForeignKey(Department, on_delete=CASCADE,
                           related_name='classes')
    semester = IntegerField(choices=[(i, f'Semester {i}') for i in range(1, 9)])
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['name', 'department']
        ordering = ['semester', 'name']
        
    def __str__(self):
        return self.name
```

---

### 5. ClassStudent
**Purpose**: Enrollment of students in classes

```python
class ClassStudent(Model):
    student = ForeignKey(CustomUser, on_delete=CASCADE,
                        related_name='class_enrollments')
    class_obj = ForeignKey(Class, on_delete=CASCADE,
                          related_name='students')
    roll_number = CharField(max_length=20)
    enrolled_date = DateField(auto_now_add=True)
    is_active = BooleanField(default=True)
    
    class Meta:
        unique_together = ['student', 'class_obj']
        
    def __str__(self):
        return f"{self.student} - {self.class_obj}"
```

---

### 6. TeacherAssignment
**Purpose**: Assign teachers to subjects in classes

```python
class TeacherAssignment(Model):
    teacher = ForeignKey(CustomUser, on_delete=CASCADE,
                        related_name='assignments')
    subject = ForeignKey(Subject, on_delete=CASCADE)
    class_assigned = ForeignKey(Class, on_delete=CASCADE)
    academic_year = CharField(max_length=20)  # e.g., "2024-2025"
    semester = IntegerField(choices=[(i, f'Semester {i}') for i in range(1, 9)])
    assigned_date = DateField(auto_now_add=True)
    
    class Meta:
        unique_together = ['teacher', 'subject', 'class_assigned', 'semester']
        
    def __str__(self):
        return f"{self.teacher} - {self.subject} in {self.class_assigned}"
```

---

### 7. ClassSchedule
**Purpose**: Time-based class schedule

```python
class ClassSchedule(Model):
    class_assigned = ForeignKey(Class, on_delete=CASCADE,
                               related_name='schedules')
    subject = ForeignKey(Subject, on_delete=CASCADE)
    teacher = ForeignKey(CustomUser, on_delete=SET_NULL, null=True)
    day_of_week = CharField(max_length=20, 
                           choices=[('Monday', 'Monday'), ..., ('Friday', 'Friday')])
    start_time = TimeField()
    end_time = TimeField()
    room_number = CharField(max_length=20, blank=True)
    
    class Meta:
        unique_together = ['class_assigned', 'subject', 'day_of_week', 'start_time']
        
    def __str__(self):
        return f"{self.class_assigned} - {self.subject} ({self.day_of_week})"
```

---

### 8. Session
**Purpose**: Attendance session instance

```python
class Session(Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    class_assigned = ForeignKey(Class, on_delete=CASCADE,
                               related_name='sessions')
    subject = ForeignKey(Subject, on_delete=CASCADE)
    start_time = DateTimeField()
    end_time = DateTimeField(null=True, blank=True)
    date = DateField()
    status = CharField(choices=STATUS_CHOICES, max_length=20, default='active')
    created_by = ForeignKey(CustomUser, on_delete=SET_NULL, null=True)
    created_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-date', '-start_time']
        indexes = [Index(fields=['class_assigned', 'date'])]
        
    def __str__(self):
        return f"{self.class_assigned} - {self.date} {self.start_time}"
```

---

### 9. Attendance
**Purpose**: Individual attendance record

```python
class Attendance(Model):
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]
    
    student = ForeignKey(CustomUser, on_delete=CASCADE,
                        related_name='attendances')
    session = ForeignKey(Session, on_delete=CASCADE,
                        related_name='attendances')
    status = CharField(choices=STATUS_CHOICES, max_length=20)
    marked_by = ForeignKey(CustomUser, on_delete=SET_NULL, null=True,
                          related_name='marked_attendances')
    marked_at = DateTimeField(auto_now_add=True)
    face_match_confidence = FloatField(null=True, blank=True)  # 0.0 - 1.0
    notes = TextField(blank=True)
    
    class Meta:
        unique_together = ['student', 'session']
        ordering = ['-marked_at']
        indexes = [Index(fields=['student', 'session'])]
        
    def __str__(self):
        return f"{self.student} - {self.session} ({self.status})"
```

---

### 10. FaceEmbedding
**Purpose**: ML face embeddings for recognition

```python
class FaceEmbedding(Model):
    student = ForeignKey(CustomUser, on_delete=CASCADE,
                        related_name='face_embeddings')
    embedding_vector = JSONField()  # 512-dim array
    image = ImageField(upload_to='face_embeddings/')
    created_at = DateTimeField(auto_now_add=True)
    updated_at = DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        
    def __str__(self):
        return f"Embedding - {self.student}"
```

---

### 11. AttendanceChange
**Purpose**: Request to modify attendance

```python
class AttendanceChange(Model):
    REQUEST_STATUS = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    attendance = ForeignKey(Attendance, on_delete=CASCADE,
                           related_name='changes')
    requested_by = ForeignKey(CustomUser, on_delete=CASCADE)
    reason = TextField()
    new_status = CharField(choices=[('present', 'Present'), 
                                   ('absent', 'Absent'),
                                   ('late', 'Late')], max_length=20)
    status = CharField(choices=REQUEST_STATUS, max_length=20, default='pending')
    approved_by = ForeignKey(CustomUser, on_delete=SET_NULL, null=True,
                            related_name='approved_changes')
    approved_at = DateTimeField(null=True, blank=True)
    rejection_reason = TextField(blank=True)
    requested_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-requested_at']
        
    def __str__(self):
        return f"Change Request - {self.attendance} ({self.status})"
```

---

### 12. AttendanceReport
**Purpose**: Periodical attendance statistics

```python
class AttendanceReport(Model):
    student = ForeignKey(CustomUser, on_delete=CASCADE,
                        related_name='reports')
    period_start = DateField()
    period_end = DateField()
    total_classes = IntegerField(default=0)
    present_count = IntegerField(default=0)
    absent_count = IntegerField(default=0)
    late_count = IntegerField(default=0)
    percentage = FloatField(default=0.0)
    generated_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['student', 'period_start', 'period_end']
        ordering = ['-period_end']
        
    def __str__(self):
        return f"{self.student} - {self.period_start} to {self.period_end}"
```

---

### 13. Notification
**Purpose**: User notifications

```python
class Notification(Model):
    CATEGORY_CHOICES = [
        ('attendance', 'Attendance'),
        ('system', 'System'),
        ('alert', 'Alert'),
        ('general', 'General'),
    ]
    
    user = ForeignKey(CustomUser, on_delete=CASCADE,
                     related_name='notifications')
    title = CharField(max_length=200)
    message = TextField()
    category = CharField(choices=CATEGORY_CHOICES, max_length=20)
    is_read = BooleanField(default=False)
    link = URLField(blank=True)  # Link to related object
    created_at = DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [Index(fields=['user', 'is_read'])]
        
    def __str__(self):
        return f"{self.title} - {self.user}"
```

---

## 🔌 API Endpoints Structure

### Authentication Endpoints (`/api/auth/`)
```python
POST   /api/auth/login/              → Login, get JWT tokens
POST   /api/auth/token/refresh/      → Refresh access token
POST   /api/auth/logout/             → Logout (client-side)
GET    /api/auth/me/                 → Get current user info
POST   /api/users/change-password/   → Change password
```

**Implementation**:
```python
class LoginView(APIView):
    """
    POST /api/auth/login/
    body: {username, password}
    response: {access_token, refresh_token, user}
    """
    
class TokenRefreshView(APIView):
    """
    POST /api/auth/token/refresh/
    body: {refresh_token}
    response: {access_token}
    """
    
class CurrentUserView(APIView):
    """
    GET /api/auth/me/
    Returns: Current authenticated user details
    """
```

### User Management (`/api/users/`)
```python
GET    /api/users/                   → List all users (Admin only)
POST   /api/users/                   → Create new user (Admin only)
GET    /api/users/{id}/              → Get user details
PUT    /api/users/{id}/              → Update user (Admin/Self)
DELETE /api/users/{id}/              → Delete user (Admin only)
GET    /api/users/me/                → Get current user profile
PUT    /api/users/me/                → Update own profile
```

**Implementation**:
```python
class UserViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Admin sees all, others see filtered
        if self.request.user.role == 'admin':
            return CustomUser.objects.all()
        return CustomUser.objects.filter(id=self.request.user.id)
```

### Department Management (`/api/attendance/departments/`)
```python
GET    /api/attendance/departments/          → List all
POST   /api/attendance/departments/          → Create
GET    /api/attendance/departments/{id}/     → Detail
PUT    /api/attendance/departments/{id}/     → Update
DELETE /api/attendance/departments/{id}/     → Delete
GET    /api/attendance/departments/{id}/statistics/  → Department stats
```

### Attendance Endpoints (`/api/attendance/`)
```python
GET    /api/attendance/attendance/                   → List attendance
POST   /api/attendance/attendance/                   → Create
POST   /api/attendance/attendance/mark_attendance/   → Mark single
POST   /api/attendance/attendance/mark_multiple/     → Mark bulk
GET    /api/attendance/attendance/statistics/        → Stats
GET    /api/attendance/attendance/by_date/           → Filter by date
```

### Session Endpoints (`/api/attendance/sessions/`)
```python
GET    /api/attendance/sessions/              → List sessions
POST   /api/attendance/sessions/              → Create
POST   /api/attendance/sessions/start_session/        → Start
POST   /api/attendance/sessions/{id}/end_session/     → End
GET    /api/attendance/sessions/active_sessions/      → Active only
```

---

## 🔐 Authentication & Permissions

### JWT Flow
```python
# In settings.py
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}

# In views.py - Custom permission classes
class IsTeacher(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'teacher'

class IsStudent(BasePermission):
    def has_permission(self, request, view):
        return request.user.role == 'student'
```

### Usage in Views
```python
class StartSessionView(APIView):
    permission_classes = [IsAuthenticated, IsTeacher]
    
    def post(self, request):
        # Only teachers can start sessions
        serializer = SessionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
```

---

## 📦 Serializers Pattern

### Basic Pattern
```python
class DepartmentSerializer(ModelSerializer):
    head_name = CharField(source='head_of_department.get_full_name', read_only=True)
    
    class Meta:
        model = Department
        fields = ['id', 'name', 'code', 'description', 'head_of_department', 'head_name']
        read_only_fields = ['id']
```

### Nested Serializer Example
```python
class SessionDetailSerializer(ModelSerializer):
    class_name = CharField(source='class_assigned.name', read_only=True)
    subject_name = CharField(source='subject.name', read_only=True)
    attendances = AttendanceSerializer(many=True, read_only=True)
    
    class Meta:
        model = Session
        fields = ['id', 'class_assigned', 'class_name', 'subject', 'subject_name',
                  'start_time', 'end_time', 'status', 'attendances']
```

---

## 🧪 Testing Structure

### Unit Tests Example
```python
# tests.py
from django.test import TestCase
from rest_framework.test import APIClient

class UserAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = CustomUser.objects.create_user(
            username='testuser',
            password='testpass123'
        )
    
    def test_login(self):
        response = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, 200)
        self.assertIn('access_token', response.data)
    
    def test_get_user(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/auth/me/')
        self.assertEqual(response.status_code, 200)
```

---

## 📝 Development Guidelines

### Adding a New Model
1. Create model in `models.py`
2. Create serializer in `serializers.py`
3. Create ViewSet in `views.py`
4. Register in `urls.py`
5. Create migrations: `python manage.py makemigrations`
6. Apply migrations: `python manage.py migrate`
7. Add to `admin.py` for Django admin
8. Write tests in `tests.py`

### Adding a New Endpoint
1. Decide ViewSet or APIView
2. Write serializer if needed
3. Implement view logic
4. Add permission classes
5. Register URL pattern
6. Write tests
7. Document in API_ENDPOINTS_DOCUMENTATION.md

---

For frontend integration details, see `FRONTEND_STRUCTURE.md`
For complete API documentation, see `API_ENDPOINTS_DOCUMENTATION.md`
