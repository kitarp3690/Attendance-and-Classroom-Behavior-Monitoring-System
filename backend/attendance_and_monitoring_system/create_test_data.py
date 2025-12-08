"""
Test Data Creation Script for Khwopa Attendance System
Run this after migrations to populate database with sample data
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_and_monitoring_system.settings')
django.setup()

from attendance.models import (
    Department, Subject, Class, ClassStudent, TeacherAssignment,
    ClassSchedule, Session, Attendance, AttendanceReport
)
from users.models import CustomUser
from django.utils import timezone
from datetime import timedelta

def create_departments():
    """Create sample departments"""
    print("Creating departments...")
    
    depts = [
        {"name": "Computer Engineering", "code": "CE", "email": "ce@khwopa.edu.np"},
        {"name": "Civil Engineering", "code": "CIVIL", "email": "civil@khwopa.edu.np"},
        {"name": "Electronics Engineering", "code": "EE", "email": "ee@khwopa.edu.np"},
    ]
    
    created_depts = []
    for dept_data in depts:
        dept, created = Department.objects.get_or_create(
            code=dept_data["code"],
            defaults={
                "name": dept_data["name"],
                "contact_email": dept_data["email"]
            }
        )
        created_depts.append(dept)
        print(f"  ✓ {dept.name} ({'Created' if created else 'Already exists'})")
    
    return created_depts


def create_users(departments):
    """Create sample users"""
    print("\nCreating users...")
    
    # Create admin
    admin, created = CustomUser.objects.get_or_create(
        username="admin",
        defaults={
            "email": "admin@khwopa.edu.np",
            "first_name": "System",
            "last_name": "Admin",
            "role": "admin",
            "is_staff": True,
            "is_superuser": True
        }
    )
    if created:
        admin.set_password("admin123")
        admin.save()
    print(f"  ✓ Admin: admin / admin123")
    
    users = {"hods": [], "teachers": [], "students": []}
    
    # Create HODs for each department
    for i, dept in enumerate(departments, 1):
        hod, created = CustomUser.objects.get_or_create(
            username=f"hod_{dept.code.lower()}",
            defaults={
                "email": f"hod_{dept.code.lower()}@khwopa.edu.np",
                "first_name": f"Dr. HOD",
                "last_name": f"{dept.code}",
                "role": "hod",
                "department": dept
            }
        )
        if created:
            hod.set_password("hod123")
            hod.save()
        
        # Assign HOD to department
        dept.hod = hod
        dept.save()
        
        users["hods"].append(hod)
        print(f"  ✓ HOD: hod_{dept.code.lower()} / hod123 ({dept.name})")
    
    # Create 3 teachers for each department
    for dept in departments:
        for i in range(1, 4):
            teacher, created = CustomUser.objects.get_or_create(
                username=f"teacher_{dept.code.lower()}_{i}",
                defaults={
                    "email": f"teacher{i}_{dept.code.lower()}@khwopa.edu.np",
                    "first_name": f"Teacher{i}",
                    "last_name": dept.code,
                    "role": "teacher",
                    "department": dept
                }
            )
            if created:
                teacher.set_password("teacher123")
                teacher.save()
            users["teachers"].append(teacher)
            print(f"  ✓ Teacher: teacher_{dept.code.lower()}_{i} / teacher123")
    
    # Create 10 students for each department
    for dept in departments:
        for i in range(1, 11):
            student, created = CustomUser.objects.get_or_create(
                username=f"student_{dept.code.lower()}_{i}",
                defaults={
                    "email": f"student{i}_{dept.code.lower()}@khwopa.edu.np",
                    "first_name": f"Student{i}",
                    "last_name": dept.code,
                    "role": "student",
                    "department": dept
                }
            )
            if created:
                student.set_password("student123")
                student.save()
            users["students"].append(student)
        print(f"  ✓ Students: student_{dept.code.lower()}_1-10 / student123")
    
    return users


def create_subjects(departments):
    """Create sample subjects"""
    print("\nCreating subjects...")
    
    subjects_data = {
        "CE": [
            {"name": "Data Structures and Algorithms", "code": "CE301", "credits": 3},
            {"name": "Database Management Systems", "code": "CE302", "credits": 3},
            {"name": "Operating Systems", "code": "CE303", "credits": 3},
        ],
        "CIVIL": [
            {"name": "Structural Analysis", "code": "CV301", "credits": 3},
            {"name": "Geotechnical Engineering", "code": "CV302", "credits": 3},
        ],
        "EE": [
            {"name": "Digital Signal Processing", "code": "EE301", "credits": 3},
            {"name": "Power Systems", "code": "EE302", "credits": 3},
        ]
    }
    
    created_subjects = []
    for dept in departments:
        for subj_data in subjects_data.get(dept.code, []):
            subject, created = Subject.objects.get_or_create(
                code=subj_data["code"],
                defaults={
                    "name": subj_data["name"],
                    "department": dept,
                    "credits": subj_data["credits"]
                }
            )
            created_subjects.append(subject)
            print(f"  ✓ {subject.code}: {subject.name}")
    
    return created_subjects


def create_classes(departments, subjects):
    """Create sample classes"""
    print("\nCreating classes...")
    
    classes = []
    for dept in departments:
        for section in ['A', 'B']:
            class_obj, created = Class.objects.get_or_create(
                name="3rd Year",
                section=section,
                academic_year="2024-2025",
                department=dept,
                defaults={"semester": "Fall 2024"}
            )
            
            # Add subjects to class
            dept_subjects = [s for s in subjects if s.department == dept]
            class_obj.subjects.set(dept_subjects)
            
            classes.append(class_obj)
            print(f"  ✓ {class_obj.name} - {class_obj.section} ({dept.name})")
    
    return classes


def enroll_students(users, classes):
    """Enroll students in classes"""
    print("\nEnrolling students...")
    
    enrollments = 0
    for class_obj in classes:
        # Get students from same department
        dept_students = [u for u in users["students"] if u.department == class_obj.department]
        
        # Enroll first 5 students in section A, next 5 in section B
        start_idx = 0 if class_obj.section == 'A' else 5
        end_idx = 5 if class_obj.section == 'A' else 10
        
        for student in dept_students[start_idx:end_idx]:
            enrollment, created = ClassStudent.objects.get_or_create(
                student=student,
                class_assigned=class_obj,
                defaults={"enrollment_status": "active"}
            )
            if created:
                enrollments += 1
    
    print(f"  ✓ Total enrollments: {enrollments}")


def assign_teachers(users, classes, subjects):
    """Assign teachers to subjects and classes"""
    print("\nAssigning teachers...")
    
    assignments = 0
    for class_obj in classes:
        dept = class_obj.department
        
        # Get teachers from same department
        dept_teachers = [t for t in users["teachers"] if t.department == dept]
        
        # Get subjects for this class
        class_subjects = class_obj.subjects.all()
        
        # Assign each teacher to subjects
        for i, subject in enumerate(class_subjects):
            teacher = dept_teachers[i % len(dept_teachers)]
            
            assignment, created = TeacherAssignment.objects.get_or_create(
                teacher=teacher,
                subject=subject,
                class_assigned=class_obj,
                defaults={"semester": "Fall 2024", "cross_department": False}
            )
            if created:
                assignments += 1
    
    print(f"  ✓ Total assignments: {assignments}")


def create_schedules(classes):
    """Create class schedules"""
    print("\nCreating class schedules...")
    
    schedules = 0
    days = [0, 1, 2, 3, 4, 5]  # Sun-Fri
    times = [
        ("09:00:00", "10:30:00"),
        ("10:45:00", "12:15:00"),
        ("13:00:00", "14:30:00"),
    ]
    
    for class_obj in classes:
        class_subjects = list(class_obj.subjects.all())
        
        for i, subject in enumerate(class_subjects):
            day = days[i % len(days)]
            time_slot = times[i % len(times)]
            
            schedule, created = ClassSchedule.objects.get_or_create(
                class_assigned=class_obj,
                subject=subject,
                day_of_week=day,
                scheduled_start_time=time_slot[0],
                defaults={"scheduled_end_time": time_slot[1]}
            )
            if created:
                schedules += 1
    
    print(f"  ✓ Total schedules: {schedules}")


def main():
    """Main function to create all test data"""
    print("=" * 60)
    print("Creating Test Data for Khwopa Attendance System")
    print("=" * 60)
    
    try:
        # Create all data
        departments = create_departments()
        users = create_users(departments)
        subjects = create_subjects(departments)
        classes = create_classes(departments, subjects)
        enroll_students(users, classes)
        assign_teachers(users, classes, subjects)
        create_schedules(classes)
        
        print("\n" + "=" * 60)
        print("✅ TEST DATA CREATED SUCCESSFULLY!")
        print("=" * 60)
        
        print("\n📊 Summary:")
        print(f"  Departments: {Department.objects.count()}")
        print(f"  Users: {CustomUser.objects.count()}")
        print(f"    - Admin: 1")
        print(f"    - HODs: {CustomUser.objects.filter(role='hod').count()}")
        print(f"    - Teachers: {CustomUser.objects.filter(role='teacher').count()}")
        print(f"    - Students: {CustomUser.objects.filter(role='student').count()}")
        print(f"  Subjects: {Subject.objects.count()}")
        print(f"  Classes: {Class.objects.count()}")
        print(f"  Enrollments: {ClassStudent.objects.count()}")
        print(f"  Teacher Assignments: {TeacherAssignment.objects.count()}")
        print(f"  Class Schedules: {ClassSchedule.objects.count()}")
        
        print("\n🔐 Login Credentials:")
        print("  Admin:")
        print("    Username: admin")
        print("    Password: admin123")
        print("\n  HODs (all departments):")
        print("    Username: hod_ce / hod_civil / hod_ee")
        print("    Password: hod123")
        print("\n  Teachers (all departments):")
        print("    Username: teacher_ce_1, teacher_ce_2, etc.")
        print("    Password: teacher123")
        print("\n  Students (all departments):")
        print("    Username: student_ce_1, student_ce_2, etc.")
        print("    Password: student123")
        
        print("\n🎓 Sample Department: Computer Engineering (CE)")
        print("  - 3 Teachers")
        print("  - 10 Students (5 in section A, 5 in section B)")
        print("  - 3 Subjects (DSA, DBMS, OS)")
        print("  - 2 Classes (3rd Year A & B)")
        
        print("\n🚀 Next Steps:")
        print("  1. Start backend: python manage.py runserver")
        print("  2. Login with any credentials above")
        print("  3. Test session start/end workflow")
        print("  4. Mark attendance and test reports")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
