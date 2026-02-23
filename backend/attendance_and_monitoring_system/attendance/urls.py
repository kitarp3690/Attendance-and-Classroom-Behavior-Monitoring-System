from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    DepartmentViewSet, SubjectViewSet, ClassViewSet, ClassStudentViewSet,
    TeacherAssignmentViewSet, ClassScheduleViewSet, SessionViewSet,
    AttendanceViewSet, AttendanceChangeViewSet, AttendanceReportViewSet,
    FaceEmbeddingViewSet, NotificationViewSet
)

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'classes', ClassViewSet)
router.register(r'class-students', ClassStudentViewSet)
router.register(r'teacher-assignments', TeacherAssignmentViewSet)
router.register(r'class-schedules', ClassScheduleViewSet)
router.register(r'sessions', SessionViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'attendance-changes', AttendanceChangeViewSet)
router.register(r'attendance-reports', AttendanceReportViewSet)
router.register(r'embeddings', FaceEmbeddingViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
