from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.contrib import messages
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CustomUser
from .serializers import UserSerializer, UserDetailSerializer

def home(request):
    return HttpResponse("User app is working!")

def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('home')
        else:
            messages.error(request, "Invalid credentials")
    return render(request, 'login.html')


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user management
    - Admin: Can manage all users
    - HOD: Can view users in their department
    - Teacher: Can view basic info of other teachers and students in their department
    - Student: Can only view their own info
    """
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'admin':
            # Admin can see all users
            return CustomUser.objects.all()
        elif user.role == 'hod':
            # HOD can see users in their department
            return CustomUser.objects.filter(department=user.department)
        elif user.role == 'teacher':
            # Teacher can see teachers and students in their department
            return CustomUser.objects.filter(
                department=user.department,
                role__in=['teacher', 'student']
            )
        else:
            # Student can only see themselves
            return CustomUser.objects.filter(id=user.id)

    def get_serializer_class(self):
        if self.action in ['retrieve', 'me']:
            return UserDetailSerializer
        return UserSerializer

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get current user information"""
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['put', 'patch'])
    def update_me(self, request):
        """Update current user information"""
        serializer = UserDetailSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        if serializer.is_valid():
            # Don't allow role or department change through this endpoint
            if 'role' in request.data or 'department' in request.data:
                return Response(
                    {"error": "Cannot change role or department through this endpoint"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change current user password"""
        import logging
        logger = logging.getLogger(__name__)
        
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        logger.info(f"Password change request from user: {user.username}")
        logger.info(f"Request data keys: {request.data.keys()}")
        logger.info(f"Old password received: {'Yes' if old_password else 'No'}")
        logger.info(f"New password received: {'Yes' if new_password else 'No'}")

        if not old_password or not new_password:
            logger.warning("Missing old_password or new_password")
            return Response(
                {"error": "Both old_password and new_password are required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        password_check = user.check_password(old_password)
        logger.info(f"Password check result: {password_check}")
        
        if not password_check:
            logger.warning(f"Old password incorrect for user: {user.username}")
            return Response(
                {"error": "Old password is incorrect"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()
        logger.info(f"Password changed successfully for user: {user.username}")
        return Response({"message": "Password changed successfully"})

    def create(self, request, *args, **kwargs):
        """Only admin can create users"""
        if request.user.role != 'admin':
            return Response(
                {"error": "Only admin can create users"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)

    def update(self, request, *args, **kwargs):
        """Only admin can update other users"""
        if request.user.role != 'admin' and request.user.id != int(kwargs.get('pk')):
            return Response(
                {"error": "You can only update your own profile"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Only admin can delete users"""
        if request.user.role != 'admin':
            return Response(
                {"error": "Only admin can delete users"},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)
