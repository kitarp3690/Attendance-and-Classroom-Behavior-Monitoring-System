"""
Create test data for the college scenario:
- 4 Departments (Computer, Civil, Architecture, ECA)
- 8 Semesters per department
- Sample users (Admin, HODs, Teachers, Students)
"""

import os
import django
from datetime import date, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_and_monitoring_system.settings')
django.setup()

from django.contrib.auth import get_user_model
from attendance.models import Department, Semester

User = get_user_model()

def create_departments_and_semesters():
    """Create 4 departments with 8 semesters each"""
    
    departments_data = [
        {'name': 'Computer Engineering', 'code': 'COMP'},
        {'name': 'Civil Engineering', 'code': 'CIVIL'},
        {'name': 'Architecture', 'code': 'ARCH'},
        {'name': 'Electronics, Communication & Automation', 'code': 'ECA'},
    ]
    
    print("Creating departments...")
    departments = []
    for dept_data in departments_data:
        dept, created = Department.objects.get_or_create(
            code=dept_data['code'],
            defaults={'name': dept_data['name']}
        )
        departments.append(dept)
        status = "Created" if created else "Already exists"
        print(f"  {status}: {dept.code} - {dept.name}")
    
    print("\nCreating semesters for each department...")
    academic_year = "2024-2025"
    
    for dept in departments:
        print(f"\n  Department: {dept.code}")
        for sem_number in range(1, 9):  # Semesters 1-8
            # Calculate dates (each semester is ~6 months)
            start_date = date(2024, 7, 1) + timedelta(days=180 * (sem_number - 1))
            end_date = start_date + timedelta(days=179)
            
            # Determine status
            today = date.today()
            if today < start_date:
                status = 'upcoming'
            elif start_date <= today <= end_date:
                status = 'active'
            else:
                status = 'completed'
            
            semester, created = Semester.objects.get_or_create(
                number=sem_number,
                department=dept,
                academic_year=academic_year,
                defaults={
                    'start_date': start_date,
                    'end_date': end_date,
                    'status': status
                }
            )
            
            action = "Created" if created else "Exists"
            print(f"    {action}: Semester {sem_number} ({status})")
    
    print("\n✅ Departments and semesters created successfully!")
    return departments


def create_admin_user():
    """Create admin superuser"""
    print("\nCreating admin user...")
    
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@college.edu',
            'role': 'admin',
            'first_name': 'System',
            'last_name': 'Administrator',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    
    if created:
        admin.set_password('admin123')
        admin.save()
        print(f"  ✅ Created: {admin.username} (password: admin123)")
    else:
        print(f"  ℹ️  Already exists: {admin.username}")
    
    return admin


def create_hods(departments):
    """Create HOD for each department"""
    print("\nCreating HODs...")
    
    hods = []
    for dept in departments:
        username = f"hod_{dept.code.lower()}"
        hod, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{username}@college.edu',
                'role': 'hod',
                'first_name': f'HOD',
                'last_name': dept.name.split()[0],
                'department': dept,
            }
        )
        
        if created:
            hod.set_password('hod123')
            hod.save()
            print(f"  ✅ Created: {hod.username} - {dept.name} (password: hod123)")
        else:
            print(f"  ℹ️  Already exists: {hod.username}")
        
        # Assign HOD to department
        if dept.hod != hod:
            dept.hod = hod
            dept.save()
            print(f"     Assigned as HOD of {dept.code}")
        
        hods.append(hod)
    
    return hods


def create_sample_teachers(departments):
    """Create sample teachers (2 per department)"""
    print("\nCreating sample teachers...")
    
    teachers = []
    for dept in departments:
        for i in range(1, 3):  # 2 teachers per department
            username = f"teacher_{dept.code.lower()}{i}"
            teacher, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@college.edu',
                    'role': 'teacher',
                    'first_name': f'Teacher{i}',
                    'last_name': dept.name.split()[0],
                    'department': dept,
                }
            )
            
            if created:
                teacher.set_password('teacher123')
                teacher.save()
                print(f"  ✅ Created: {teacher.username} - {dept.name} (password: teacher123)")
            else:
                print(f"  ℹ️  Already exists: {teacher.username}")
            
            teachers.append(teacher)
    
    return teachers


def create_sample_students(departments):
    """Create sample students (5 per department)"""
    print("\nCreating sample students...")
    
    students = []
    for dept in departments:
        for i in range(1, 6):  # 5 students per department
            username = f"student_{dept.code.lower()}{i}"
            student, created = User.objects.get_or_create(
                username=username,
                defaults={
                    'email': f'{username}@college.edu',
                    'role': 'student',
                    'first_name': f'Student{i}',
                    'last_name': dept.name.split()[0],
                    'department': dept,
                }
            )
            
            if created:
                student.set_password('student123')
                student.save()
                print(f"  ✅ Created: {student.username} - {dept.name} (password: student123)")
            else:
                print(f"  ℹ️  Already exists: {student.username}")
            
            students.append(student)
    
    return students


def main():
    print("=" * 70)
    print("  CREATING COLLEGE SCENARIO DATA")
    print("=" * 70)
    
    # Create departments and semesters
    departments = create_departments_and_semesters()
    
    # Create users
    admin = create_admin_user()
    hods = create_hods(departments)
    teachers = create_sample_teachers(departments)
    students = create_sample_students(departments)
    
    print("\n" + "=" * 70)
    print("  ✅ DATA CREATION COMPLETE!")
    print("=" * 70)
    print(f"\n📊 Summary:")
    print(f"  • Departments: {len(departments)}")
    print(f"  • Semesters: {Semester.objects.count()}")
    print(f"  • Admin: 1")
    print(f"  • HODs: {len(hods)}")
    print(f"  • Teachers: {len(teachers)}")
    print(f"  • Students: {len(students)}")
    print(f"  • Total Users: {User.objects.count()}")
    
    print(f"\n🔐 Login Credentials:")
    print(f"  Admin:   username='admin'    password='admin123'")
    print(f"  HODs:    username='hod_comp'  password='hod123'")
    print(f"  Teacher: username='teacher_comp1' password='teacher123'")
    print(f"  Student: username='student_comp1' password='student123'")
    
    print("\n✅ You can now start the backend server!")
    print("   Run: python manage.py runserver\n")


if __name__ == '__main__':
    main()
