from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from django.utils import timezone
from django.db.models import Q
from datetime import datetime, timedelta

from .models import (
    Department, Semester, Subject, Class, ClassStudent, TeacherAssignment, 
    ClassSchedule, Session, Attendance, AttendanceChange, AttendanceReport,
    FaceEmbedding, Notification
)
from .serializers import (
    DepartmentSerializer, SemesterSerializer, SubjectSerializer, ClassSerializer, ClassDetailSerializer,
    ClassStudentSerializer, TeacherAssignmentSerializer, ClassScheduleSerializer,
    SessionSerializer, AttendanceSerializer, AttendanceChangeSerializer,
    AttendanceReportSerializer, FaceEmbeddingSerializer, NotificationSerializer,
    AttendanceStatisticsSerializer
)
from users.models import CustomUser
from users.serializers import UserSerializer, UserDetailSerializer


# Custom Permission Classes
class IsDepartmentAllowed(BasePermission):
    """Only HODs and Teachers can access departments"""
    def has_permission(self, request, view):
        return request.user.role in ['admin', 'hod', 'teacher']


class DepartmentViewSet(viewsets.ModelViewSet):
    """ViewSet for Department model"""
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated, IsDepartmentAllowed]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['code', 'name']
    ordering = ['code']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Only HODs see their own department
        if user.role == 'hod':
            queryset = queryset.filter(hod=user)
        # Teachers see all departments for reference
        elif user.role == 'teacher':
            pass  # See all departments
        # Admins see all
        
        return queryset

    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get department statistics"""
        department = self.get_object()
        
        total_classes = Class.objects.filter(department=department).count()
        total_subjects = Subject.objects.filter(department=department).count()
        total_students = CustomUser.objects.filter(department=department, role='student').count()
        total_teachers = CustomUser.objects.filter(department=department, role='teacher').count()
        
        return Response({
            'department': DepartmentSerializer(department).data,
            'total_classes': total_classes,
            'total_subjects': total_subjects,
            'total_students': total_students,
            'total_teachers': total_teachers
        })


class SemesterViewSet(viewsets.ModelViewSet):
    """ViewSet for Semester model - manages 8 semesters per department"""
    queryset = Semester.objects.all().select_related('department')
    serializer_class = SemesterSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['academic_year']
    ordering_fields = ['department', 'number', 'start_date']
    ordering = ['department', 'number']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filter by department for non-admins
        if user.role == 'hod' and user.department:
            queryset = queryset.filter(department=user.department)
        elif user.role in ['teacher', 'student'] and user.department:
            queryset = queryset.filter(department=user.department)
        
        # Filter by department query param
        department_id = self.request.query_params.get('department')
        if department_id:
            queryset = queryset.filter(department_id=department_id)
        
        return queryset


class SubjectViewSet(viewsets.ModelViewSet):
    """ViewSet for Subject model"""
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'code']
    ordering_fields = ['code', 'created_at']
    ordering = ['code']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filter by department for non-admins
        if user.role in ['hod', 'teacher', 'student'] and user.department:
            queryset = queryset.filter(department=user.department)
        
        # Filter by semester query param
        semester_id = self.request.query_params.get('semester')
        if semester_id:
            queryset = queryset.filter(semester_id=semester_id)
        
        return queryset


class ClassViewSet(viewsets.ModelViewSet):
    """ViewSet for Class model"""
    queryset = Class.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'section', 'academic_year']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ClassDetailSerializer
        return ClassSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filter by department for non-admins
        if user.role in ['hod', 'teacher'] and user.department:
            queryset = queryset.filter(department=user.department)
        # Students see only their enrolled classes
        elif user.role == 'student':
            class_ids = ClassStudent.objects.filter(student=user, enrollment_status='active').values_list('class_assigned_id', flat=True)
            queryset = queryset.filter(id__in=class_ids)
        
        return queryset


class ClassStudentViewSet(viewsets.ModelViewSet):
    """ViewSet for ClassStudent model"""
    queryset = ClassStudent.objects.all().select_related('student', 'class_assigned')
    serializer_class = ClassStudentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__username', 'student__first_name', 'student__last_name', 'class_assigned__name']
    ordering_fields = ['enrollment_date']
    ordering = ['-enrollment_date']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students see only their enrollments
        if user.role == 'student':
            queryset = queryset.filter(student=user)
        # Teachers and HODs see enrollments in their department
        elif user.role in ['hod', 'teacher'] and user.department:
            queryset = queryset.filter(class_assigned__department=user.department)
        
        return queryset


class ClassScheduleViewSet(viewsets.ModelViewSet):
    """ViewSet for ClassSchedule model"""
    queryset = ClassSchedule.objects.all().select_related('class_assigned', 'subject')
    serializer_class = ClassScheduleSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['class_assigned__name', 'subject__name']
    ordering_fields = ['day_of_week', 'scheduled_start_time']
    ordering = ['class_assigned', 'day_of_week', 'scheduled_start_time']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Filter by department
        if user.role in ['hod', 'teacher'] and user.department:
            queryset = queryset.filter(class_assigned__department=user.department)
        # Students see schedules for their classes
        elif user.role == 'student':
            class_ids = ClassStudent.objects.filter(student=user, enrollment_status='active').values_list('class_assigned_id', flat=True)
            queryset = queryset.filter(class_assigned_id__in=class_ids)
        
        return queryset

    @action(detail=False, methods=['get'])
    def by_day(self, request):
        """Get schedules for a specific day"""
        day = request.query_params.get('day')
        
        if day is None:
            return Response({'error': 'day parameter is required (0-5)'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            day = int(day)
            if day < 0 or day > 5:
                return Response({'error': 'day must be between 0 and 5'}, status=status.HTTP_400_BAD_REQUEST)
            
            queryset = self.get_queryset().filter(day_of_week=day)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except ValueError:
            return Response({'error': 'day must be an integer'}, status=status.HTTP_400_BAD_REQUEST)


class TeacherAssignmentViewSet(viewsets.ModelViewSet):
    """ViewSet for TeacherAssignment model"""
    queryset = TeacherAssignment.objects.all().select_related('teacher', 'subject', 'class_assigned')
    serializer_class = TeacherAssignmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['teacher__username', 'subject__code', 'class_assigned__name']
    ordering_fields = ['created_at']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Teachers see only their assignments
        if user.role == 'teacher':
            queryset = queryset.filter(teacher=user)
        # Students can see teacher assignments for their classes
        elif user.role == 'student':
            class_ids = ClassStudent.objects.filter(student=user, enrollment_status='active').values_list('class_assigned_id', flat=True)
            queryset = queryset.filter(class_assigned_id__in=class_ids)
        
        return queryset


class SessionViewSet(viewsets.ModelViewSet):
    """ViewSet for Session model"""
    queryset = Session.objects.all().select_related('teacher', 'subject', 'class_assigned')
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['subject__code', 'teacher__username']
    ordering_fields = ['start_time', 'created_at']
    ordering = ['-start_time']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Teachers see only their sessions
        if user.role == 'teacher':
            queryset = queryset.filter(teacher=user)
        # Students see sessions for their classes
        elif user.role == 'student':
            class_ids = ClassStudent.objects.filter(student=user, enrollment_status='active').values_list('class_assigned_id', flat=True)
            queryset = queryset.filter(class_assigned_id__in=class_ids)
        
        return queryset

    @action(detail=False, methods=['post'])
    def start_session(self, request):
        """Start a new attendance session"""
        class_id = request.data.get('class_assigned')
        subject_id = request.data.get('subject')
        
        if not class_id or not subject_id:
            return Response(
                {'error': 'class_assigned and subject are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get total students in the class
        total_students = ClassStudent.objects.filter(
            class_assigned_id=class_id,
            enrollment_status='active'
        ).count()
        
        # Get department from class
        try:
            class_obj = Class.objects.get(id=class_id)
            department = class_obj.department
        except Class.DoesNotExist:
            return Response({'error': 'Class not found'}, status=status.HTTP_404_NOT_FOUND)
        
        session = Session.objects.create(
            teacher=request.user,
            subject_id=subject_id,
            class_assigned_id=class_id,
            department=department,
            start_time=timezone.now(),
            is_active=True,
            total_students=total_students
        )
        
        serializer = self.get_serializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def end_session(self, request, pk=None):
        """End an active session"""
        session = self.get_object()
        
        if not session.is_active:
            return Response(
                {'error': 'Session is already ended'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session.end_time = timezone.now()
        session.is_active = False
        session.attendance_finalized = True
        session.save()
        
        # Update attendance reports for all students in this session
        attendances = Attendance.objects.filter(session=session).select_related('student')
        for attendance in attendances:
            report, created = AttendanceReport.objects.get_or_create(
                student=attendance.student,
                subject=session.subject,
                class_assigned=session.class_assigned,
                semester=session.class_assigned.semester,
                defaults={
                    'total_classes_held': 0,
                    'present_count': 0,
                    'absent_count': 0,
                    'late_count': 0,
                    'percentage': 0.0
                }
            )
            
            # Update counts
            report.total_classes_held += 1
            if attendance.status == 'present':
                report.present_count += 1
            elif attendance.status == 'absent':
                report.absent_count += 1
            elif attendance.status == 'late':
                report.late_count += 1
            
            # Calculate percentage
            if report.total_classes_held > 0:
                report.percentage = (report.present_count / report.total_classes_held) * 100
            
            report.save()
        
        serializer = self.get_serializer(session)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def active_sessions(self, request):
        """Get all active sessions"""
        queryset = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AttendanceViewSet(viewsets.ModelViewSet):
    """ViewSet for Attendance model"""
    queryset = Attendance.objects.all().select_related('student', 'session', 'marked_by')
    serializer_class = AttendanceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__username', 'session__subject__code', 'status']
    ordering_fields = ['marked_at', 'status']
    ordering = ['-marked_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students see only their attendance
        if user.role == 'student':
            queryset = queryset.filter(student=user)
        # Teachers see attendance for their sessions
        elif user.role == 'teacher':
            queryset = queryset.filter(session__teacher=user)
        # Admins see all
        
        return queryset

    @action(detail=False, methods=['post'])
    def mark_attendance(self, request):
        """Mark or update attendance for a student with late entry detection"""
        student_id = request.data.get('student_id')
        session_id = request.data.get('session_id')
        status_value = request.data.get('status', 'present')
        confidence = request.data.get('confidence_score')
        notes = request.data.get('notes', '')
        detected_time = request.data.get('detected_time')  # AI detection time
        
        if not student_id or not session_id:
            return Response(
                {'error': 'student_id and session_id are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            session = Session.objects.get(id=session_id)
            current_time = timezone.now()
            
            # Calculate if student is late (AI-based or manual)
            if detected_time:
                detection_dt = timezone.datetime.fromisoformat(detected_time.replace('Z', '+00:00'))
            else:
                detection_dt = current_time
            
            # Auto-detect late status based on grace period
            grace_period_delta = timedelta(minutes=session.grace_period_minutes)
            grace_deadline = session.start_time + grace_period_delta
            
            # If detected after grace period, mark as late (unless manually set)
            if detection_dt > grace_deadline and status_value == 'present':
                status_value = 'late'
            
            defaults = {
                'status': status_value,
                'marked_by': request.user,
                'confidence_score': confidence,
                'notes': notes,
                'marked_at': current_time,
                'detected_time': detection_dt
            }
            
            # Add late_entry_time if status is late
            if status_value == 'late':
                defaults['late_entry_time'] = detection_dt
            
            attendance, created = Attendance.objects.update_or_create(
                student_id=student_id,
                session_id=session_id,
                defaults=defaults
            )
            
            # Generate low attendance warning if needed
            self._check_and_generate_warning(student_id, session.subject_id)
            
            serializer = self.get_serializer(attendance)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Session.DoesNotExist:
            return Response({'error': 'Session not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    def _check_and_generate_warning(self, student_id, subject_id):
        """Check attendance percentage and generate warning if below threshold"""
        threshold = 75.0  # 75% attendance threshold
        
        # Calculate attendance percentage for this subject
        total_sessions = Session.objects.filter(
            subject_id=subject_id,
            attendance_finalized=True
        ).count()
        
        if total_sessions == 0:
            return
        
        present_count = Attendance.objects.filter(
            student_id=student_id,
            session__subject_id=subject_id,
            status__in=['present', 'late']
        ).count()
        
        percentage = (present_count / total_sessions) * 100
        
        # Generate warning if below threshold
        if percentage < threshold:
            subject = Subject.objects.get(id=subject_id)
            Notification.objects.create(
                user_id=student_id,
                category='alert',
                title='Low Attendance Warning',
                message=f'Your attendance in {subject.name} is {percentage:.1f}%, below the required {threshold}%.',
                related_attendance=None
            )

    @action(detail=False, methods=['post'])
    def mark_multiple(self, request):
        """Mark attendance for multiple students"""
        attendances_data = request.data.get('attendances', [])
        session_id = request.data.get('session_id')
        
        if not session_id:
            return Response({'error': 'session_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        created_attendances = []
        for data in attendances_data:
            try:
                attendance, created = Attendance.objects.update_or_create(
                    student_id=data.get('student_id'),
                    session_id=session_id,
                    defaults={
                        'status': data.get('status', 'absent'),
                        'marked_by': request.user,
                        'confidence_score': data.get('confidence_score'),
                        'notes': data.get('notes', ''),
                        'marked_at': timezone.now()
                    }
                )
                created_attendances.append(attendance)
            except Exception as e:
                continue
        
        serializer = self.get_serializer(created_attendances, many=True)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get attendance statistics"""
        user = request.user
        subject_id = request.query_params.get('subject_id')
        class_id = request.query_params.get('class_id')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        queryset = self.get_queryset()
        
        if subject_id:
            queryset = queryset.filter(session__subject_id=subject_id)
        if class_id:
            queryset = queryset.filter(session__class_assigned_id=class_id)
        
        if start_date:
            try:
                start = datetime.fromisoformat(start_date)
                queryset = queryset.filter(marked_at__gte=start)
            except:
                pass
        
        if end_date:
            try:
                end = datetime.fromisoformat(end_date)
                queryset = queryset.filter(marked_at__lte=end)
            except:
                pass
        
        total = queryset.count()
        present = queryset.filter(status='present').count()
        absent = queryset.filter(status='absent').count()
        late = queryset.filter(status='late').count()
        
        percentage = (present / total * 100) if total > 0 else 0
        
        return Response({
            'total': total,
            'present': present,
            'absent': absent,
            'late': late,
            'percentage': round(percentage, 2)
        })

    @action(detail=False, methods=['get'])
    def by_date(self, request):
        """Get attendance records by date"""
        date_str = request.query_params.get('date')
        
        if not date_str:
            return Response({'error': 'date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            date = datetime.fromisoformat(date_str).date()
            queryset = self.get_queryset().filter(marked_at__date=date)
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class AttendanceChangeViewSet(viewsets.ModelViewSet):
    """ViewSet for AttendanceChange model"""
    queryset = AttendanceChange.objects.all().select_related('attendance', 'changed_by', 'approved_by')
    serializer_class = AttendanceChangeSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['changed_at']
    ordering = ['-changed_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # HODs see changes in their department
        if user.role == 'hod' and user.department:
            queryset = queryset.filter(attendance__session__department=user.department)
        # Teachers see changes they made
        elif user.role == 'teacher':
            queryset = queryset.filter(changed_by=user)
        # Students see changes to their attendance
        elif user.role == 'student':
            queryset = queryset.filter(attendance__student=user)
        
        return queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve an attendance change (HOD only)"""
        if request.user.role != 'hod':
            return Response({'error': 'Only HOD can approve changes'}, status=status.HTTP_403_FORBIDDEN)
        
        change = self.get_object()
        
        if change.approved_at:
            return Response({'error': 'Change already approved'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Update the attendance record
        attendance = change.attendance
        attendance.status = change.new_status
        attendance.save()
        
        # Mark as approved
        change.approved_by = request.user
        change.approved_at = timezone.now()
        change.save()
        
        serializer = self.get_serializer(change)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """Reject an attendance change (HOD only)"""
        if request.user.role != 'hod':
            return Response({'error': 'Only HOD can reject changes'}, status=status.HTTP_403_FORBIDDEN)
        
        change = self.get_object()
        
        if change.approved_at:
            return Response({'error': 'Change already processed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Just delete the change request
        change.delete()
        
        return Response({'status': 'Change request rejected'})

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending changes (HOD only)"""
        if request.user.role != 'hod':
            return Response({'error': 'Only HOD can view pending changes'}, status=status.HTTP_403_FORBIDDEN)
        
        queryset = self.get_queryset().filter(approved_at__isnull=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AttendanceReportViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for AttendanceReport model (read-only)"""
    queryset = AttendanceReport.objects.all().select_related('student', 'subject', 'class_assigned')
    serializer_class = AttendanceReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['student__username', 'subject__code', 'semester']
    ordering_fields = ['percentage', 'generated_at']
    ordering = ['-generated_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students see only their reports
        if user.role == 'student':
            queryset = queryset.filter(student=user)
        # HODs see reports for their department
        elif user.role == 'hod' and user.department:
            queryset = queryset.filter(class_assigned__department=user.department)
        # Teachers see reports for their assigned classes
        elif user.role == 'teacher':
            assigned_classes = TeacherAssignment.objects.filter(teacher=user).values_list('class_assigned_id', flat=True)
            queryset = queryset.filter(class_assigned_id__in=assigned_classes)
        
        return queryset

    @action(detail=False, methods=['get'])
    def low_attendance(self, request):
        """Get students with low attendance (below threshold)"""
        threshold = float(request.query_params.get('threshold', 75.0))
        
        queryset = self.get_queryset().filter(percentage__lt=threshold)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def regenerate(self, request):
        """Regenerate attendance reports (Admin/HOD only)"""
        if request.user.role not in ['admin', 'hod']:
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        student_id = request.data.get('student_id')
        subject_id = request.data.get('subject_id')
        class_id = request.data.get('class_id')
        semester = request.data.get('semester')
        
        if not all([student_id, subject_id, class_id, semester]):
            return Response({'error': 'All fields required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get all sessions for this class/subject/semester
        sessions = Session.objects.filter(
            class_assigned_id=class_id,
            subject_id=subject_id,
            attendance_finalized=True
        )
        
        # Get all attendances for this student
        attendances = Attendance.objects.filter(
            student_id=student_id,
            session__in=sessions
        )
        
        total = attendances.count()
        present = attendances.filter(status='present').count()
        absent = attendances.filter(status='absent').count()
        late = attendances.filter(status='late').count()
        percentage = (present / total * 100) if total > 0 else 0
        
        report, created = AttendanceReport.objects.update_or_create(
            student_id=student_id,
            subject_id=subject_id,
            class_assigned_id=class_id,
            semester=semester,
            defaults={
                'total_classes_held': total,
                'present_count': present,
                'absent_count': absent,
                'late_count': late,
                'percentage': percentage
            }
        )
        
        serializer = self.get_serializer(report)
        return Response(serializer.data)


class FaceEmbeddingViewSet(viewsets.ModelViewSet):
    """ViewSet for FaceEmbedding model"""
    queryset = FaceEmbedding.objects.all().select_related('student')
    serializer_class = FaceEmbeddingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['captured_at']
    ordering = ['-captured_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Students see only their embeddings
        if user.role == 'student':
            queryset = queryset.filter(student=user)
        
        return queryset


class NotificationViewSet(viewsets.ModelViewSet):
    """ViewSet for Notification model"""
    queryset = Notification.objects.all().select_related('user')
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'is_read']
    ordering = ['-created_at']

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all notifications as read"""
        Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now()
        )
        return Response({'status': 'all notifications marked as read'})

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get notifications filtered by category"""
        category = request.query_params.get('category')
        
        if not category:
            return Response({'error': 'category parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        queryset = self.get_queryset().filter(category=category)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
