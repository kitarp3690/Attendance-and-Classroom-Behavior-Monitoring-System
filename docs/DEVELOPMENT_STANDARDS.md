# Development Standards & Best Practices

Code style guides, naming conventions, and development best practices for the entire project.

## 🐍 Backend Python Standards

### Code Style (PEP 8)

#### Line Length
```python
# Maximum 100 characters per line (Django convention)
# Break long lines at logical points
user_data = {
    'name': get_user_name(user_id),
    'email': get_user_email(user_id),
    'role': get_user_role(user_id),
}
```

#### Imports
```python
# Group imports in this order with blank lines
import os                              # Standard library
import sys
from datetime import datetime

from django.db import models           # Django imports
from django.utils import timezone
from rest_framework import serializers

from .models import CustomUser          # Local imports
from .serializers import UserSerializer
```

#### Naming Conventions
```python
# Classes: PascalCase
class CustomUser(AbstractUser):
    pass

# Functions/Methods: snake_case
def get_user_attendance():
    pass

# Constants: UPPER_SNAKE_CASE
DEFAULT_PAGE_SIZE = 20
MAX_UPLOAD_SIZE = 52428800  # 50MB

# Private variables: _leading_underscore
_internal_cache = {}

# Global variables: Avoid if possible
```

### Django Models

#### Model Example
```python
class Attendance(models.Model):
    """Record of student attendance in a session."""
    
    STATUS_CHOICES = [
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    ]
    
    student = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='attendances',
        help_text='Student who attended'
    )
    session = models.ForeignKey(
        Session,
        on_delete=models.CASCADE,
        related_name='attendances',
        help_text='Session during which attendance was taken'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        help_text='Attendance status'
    )
    face_match_confidence = models.FloatField(
        null=True,
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(1)],
        help_text='Confidence score from face recognition (0.0-1.0)'
    )
    marked_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'session']
        ordering = ['-marked_at']
        indexes = [
            models.Index(fields=['student', 'session']),
        ]
        verbose_name = 'Attendance Record'
        verbose_name_plural = 'Attendance Records'
    
    def __str__(self):
        return f"{self.student} - {self.session} ({self.status})"
    
    def mark_present(self):
        """Mark attendance as present."""
        self.status = 'present'
        self.save()
```

**Model Best Practices**:
- ✅ Use descriptive field names
- ✅ Always include `help_text` for clarity
- ✅ Use `related_name` for reverse relationships
- ✅ Define `Meta` class with `ordering`, `indexes`
- ✅ Implement `__str__()` method
- ✅ Add docstrings to custom methods
- ❌ Don't use generic names like `data`, `value`

### Serializers

```python
class AttendanceSerializer(serializers.ModelSerializer):
    """Serializer for Attendance records."""
    
    student_name = serializers.CharField(
        source='student.get_full_name',
        read_only=True,
        help_text='Full name of the student'
    )
    session_date = serializers.DateField(
        source='session.date',
        read_only=True
    )
    
    class Meta:
        model = Attendance
        fields = [
            'id',
            'student',
            'student_name',
            'session',
            'session_date',
            'status',
            'face_match_confidence',
            'marked_at',
        ]
        read_only_fields = ['id', 'marked_at']
    
    def validate_status(self, value):
        """Validate attendance status."""
        if value not in ['present', 'absent', 'late']:
            raise serializers.ValidationError(
                "Invalid status. Must be 'present', 'absent', or 'late'."
            )
        return value
```

**Serializer Best Practices**:
- ✅ Use explicit `fields` list
- ✅ Define `read_only_fields` for auto-generated fields
- ✅ Add custom validation with `validate_*` methods
- ✅ Include `help_text` for API documentation
- ✅ Nest serializers for related objects when needed
- ❌ Don't use `'__all__'` - be explicit

### Views & ViewSets

```python
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action

class AttendanceViewSet(viewsets.ModelViewSet):
    """
    API endpoint for attendance management.
    
    Supports CRUD operations and custom actions:
    - mark_attendance: Mark attendance for students
    - statistics: Get attendance statistics
    """
    
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['student', 'session', 'status']
    ordering_fields = ['marked_at', 'student']
    
    def get_queryset(self):
        """Filter queryset based on user role."""
        user = self.request.user
        
        if user.role == 'student':
            # Students can only see their own attendance
            return Attendance.objects.filter(student=user)
        elif user.role == 'teacher':
            # Teachers see attendance for their classes
            return Attendance.objects.filter(
                session__class_assigned__in=user.assignments.values('class_assigned')
            )
        else:
            # Admin/HOD sees all
            return Attendance.objects.all()
    
    @action(detail=False, methods=['post'])
    def mark_attendance(self, request):
        """
        Mark attendance for a student.
        
        POST body:
        {
            "student_id": 1,
            "session_id": 1,
            "status": "present"
        }
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(marked_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get attendance statistics for current user."""
        total = self.get_queryset().count()
        present = self.get_queryset().filter(status='present').count()
        percentage = (present / total * 100) if total > 0 else 0
        
        return Response({
            'total': total,
            'present': present,
            'percentage': round(percentage, 2)
        })
```

**ViewSet Best Practices**:
- ✅ Use proper `permission_classes`
- ✅ Override `get_queryset()` for user-specific data
- ✅ Use `@action` decorator for custom endpoints
- ✅ Return proper HTTP status codes
- ✅ Include docstrings with API documentation
- ✅ Validate user permissions
- ❌ Don't put all logic in views - use service layer

### Testing

```python
from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

class AttendanceTestCase(TestCase):
    """Tests for Attendance API."""
    
    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        
        # Create test user
        self.user = get_user_model().objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            role='teacher'
        )
        
        # Create test data
        self.department = Department.objects.create(name='BIT')
        self.class_obj = Class.objects.create(
            name='BIT-1A',
            department=self.department
        )
    
    def test_mark_attendance(self):
        """Test marking attendance."""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'student_id': 1,
            'status': 'present'
        }
        
        response = self.client.post(
            '/api/attendance/attendance/mark_attendance/',
            data,
            format='json'
        )
        
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['status'], 'present')
    
    def test_unauthorized_access(self):
        """Test that unauthenticated users get 401."""
        response = self.client.get('/api/attendance/attendance/')
        self.assertEqual(response.status_code, 401)
```

---

## 🔧 Frontend JavaScript Standards

### Code Style

#### Naming Conventions
```javascript
// Variables & Functions: camelCase
const userName = 'John';
function getUserData() { }

// Components: PascalCase
function UserProfile() { }
const AttendanceTable = () => {};

// Constants: UPPER_SNAKE_CASE
const API_TIMEOUT = 30000;
const DEFAULT_PAGE_SIZE = 20;

// Private functions: _leading_underscore
const _validateEmail = (email) => { };
```

#### Imports
```javascript
// Order: standard lib → external packages → local imports
import React, { useState, useEffect } from 'react';
import axios from 'axios';

import { getUserData } from '../utils/api';
import UserCard from '../components/UserCard';
```

### React Components

#### Functional Component Pattern
```jsx
/**
 * AttendanceTable - Display attendance records with filtering
 * @param {Array} data - Attendance records
 * @param {Function} onUpdate - Callback when record is updated
 * @param {Object} filters - Filter state
 * @returns {JSX.Element}
 */
function AttendanceTable({ data, onUpdate, filters }) {
  const [sortBy, setSortBy] = useState('marked_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Effect hook with cleanup
  useEffect(() => {
    const timer = setTimeout(() => {
      // Debounced search
    }, 300);

    return () => clearTimeout(timer);
  }, [filters.search]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleUpdate = async (id, newData) => {
    try {
      await api.patch(`/attendance/${id}/`, newData);
      onUpdate(id, newData);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  if (!data || data.length === 0) {
    return <div className="empty-state">No records found</div>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th onClick={() => handleSort('student')}>Student</th>
          <th onClick={() => handleSort('status')}>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((record) => (
          <tr key={record.id}>
            <td>{record.student_name}</td>
            <td>
              <span className={`badge badge-${record.status}`}>
                {record.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AttendanceTable;
```

#### Custom Hooks Pattern
```javascript
/**
 * useAttendance - Custom hook for attendance data management
 * @returns {Object} - { data, loading, error, refetch }
 */
function useAttendance(sessionId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/attendance/?session=${sessionId}`);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [sessionId]);

  const refetch = useCallback(async () => {
    await fetchAttendance();
  }, [sessionId]);

  return { data, loading, error, refetch };
}
```

**Best Practices**:
- ✅ Use functional components with hooks
- ✅ Use `useCallback` to prevent unnecessary rerenders
- ✅ Use `useEffect` for side effects with proper cleanup
- ✅ Extract custom hooks for reusable logic
- ✅ Add JSDoc comments for component props
- ❌ Don't use `var` - use `const`/`let`
- ❌ Don't put large components in a single file

### API Calls Pattern

```javascript
// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.VITE_API_URL,
  timeout: 30000,
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle errors globally
    if (error.response?.status === 401) {
      // Token expired, try refresh
    }
    return Promise.reject(error);
  }
);

// Export organized endpoints
export const attendanceAPI = {
  getAll: (params) => api.get('/attendance/', { params }),
  getById: (id) => api.get(`/attendance/${id}/`),
  create: (data) => api.post('/attendance/', data),
  update: (id, data) => api.put(`/attendance/${id}/`, data),
  delete: (id) => api.delete(`/attendance/${id}/`),
};

export default api;
```

---

## 🧪 Testing Standards

### Backend Unit Tests
```python
# Pattern: Arrange → Act → Assert
class UserAPITestCase(TestCase):
    def test_create_user(self):
        # Arrange
        user_data = {
            'username': 'newuser',
            'email': 'new@example.com',
        }
        
        # Act
        response = self.client.post('/api/users/', user_data)
        
        # Assert
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data['username'], 'newuser')
```

### Frontend Component Tests
```jsx
import { render, screen, userEvent } from '@testing-library/react';
import AttendanceTable from './AttendanceTable';

describe('AttendanceTable', () => {
  test('renders table with attendance data', () => {
    const data = [
      { id: 1, student: 'John', status: 'present' }
    ];
    
    render(<AttendanceTable data={data} />);
    
    expect(screen.getByText('John')).toBeInTheDocument();
  });

  test('handles sorting on column click', async () => {
    const user = userEvent.setup();
    render(<AttendanceTable data={mockData} />);
    
    const header = screen.getByText('Student');
    await user.click(header);
    
    // Assert sorted data
  });
});
```

---

## 📝 Documentation Standards

### Code Comments
```python
# ✅ Good: Explains WHY, not WHAT
def calculate_attendance_percentage(present, total):
    """
    Calculate attendance percentage with special handling for zero classes.
    Returns 0% if no classes scheduled (avoid division by zero).
    """
    if total == 0:
        return 0
    return (present / total) * 100

# ❌ Bad: Obvious comment
def get_user():
    # Get the user  ← This is obvious from code
    return User.objects.first()
```

### Docstrings
```python
def mark_attendance_bulk(session_id, attendance_data):
    """
    Mark attendance for multiple students in a session.
    
    Args:
        session_id (int): ID of the attendance session
        attendance_data (list): List of dicts with student_id and status
            Example: [
                {'student_id': 1, 'status': 'present'},
                {'student_id': 2, 'status': 'absent'},
            ]
    
    Returns:
        dict: {
            'success': list of created attendance records,
            'failed': list of failed records with error reasons
        }
    
    Raises:
        Session.DoesNotExist: If session not found
        ValueError: If invalid status provided
    """
```

---

## 🔄 Git Workflow

### Commit Messages
```
# Format: <type>(<scope>): <subject>
# Types: feat, fix, docs, style, refactor, test, chore

✅ Good:
feat(attendance): add face recognition matching
fix(auth): resolve JWT token refresh bug
docs(api): update endpoint documentation

❌ Bad:
update code
fixed stuff
changes made
```

### Branch Naming
```
feature/user-management
bugfix/token-refresh-issue
docs/api-documentation
```

---

## ✅ Code Review Checklist

### Backend PRs
- [ ] Follows PEP 8 style guide
- [ ] Models have proper Meta class and `__str__`
- [ ] Serializers validate input properly
- [ ] Views have proper permission classes
- [ ] All endpoints tested
- [ ] Documentation updated
- [ ] No hardcoded values (use env variables)
- [ ] Error handling implemented
- [ ] Database migrations included

### Frontend PRs
- [ ] Follows naming conventions (camelCase/PascalCase)
- [ ] Components properly documented with JSDoc
- [ ] Proper error handling and loading states
- [ ] API calls use try-catch or `.catch()`
- [ ] No console.log left in production code
- [ ] Responsive design tested
- [ ] Accessibility considerations (ARIA labels, keyboard nav)
- [ ] No unused imports or variables
- [ ] Component tests included

---

For specific backend patterns, see `BACKEND_STRUCTURE.md`  
For specific frontend patterns, see `FRONTEND_STRUCTURE.md`  
For design standards, see `DESIGN_GUIDE.md`
