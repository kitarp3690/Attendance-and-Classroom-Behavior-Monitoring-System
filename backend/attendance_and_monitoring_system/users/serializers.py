from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    department_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display', 'department', 'department_name', 'phone', 'avatar', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer with all fields"""
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    department_name = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'role_display', 'department', 'department_name', 'phone', 'avatar', 'date_of_birth', 'address', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_department_name(self, obj):
        return obj.department.name if obj.department else None


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name', 'role', 'department', 'phone']
    
    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, required=True, min_length=8)
    
    def validate(self, data):
        if data.get('new_password') != data.get('new_password_confirm'):
            raise serializers.ValidationError({"new_password": "Passwords must match."})
        return data
