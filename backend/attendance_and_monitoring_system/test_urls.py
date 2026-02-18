import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'attendance_and_monitoring_system.settings')
django.setup()

from django.urls import get_resolver

print("\n=== Available URL Patterns ===\n")
resolver = get_resolver()
for pattern in resolver.url_patterns:
    print(f"- {pattern.pattern}")
    if hasattr(pattern, 'url_patterns'):
        for sub_pattern in pattern.url_patterns:
            print(f"  └─ {sub_pattern.pattern}")
            if hasattr(sub_pattern, 'url_patterns'):
                for subsub_pattern in sub_pattern.url_patterns:
                    print(f"     └─ {subsub_pattern.pattern}")

print("\n=== Auth Endpoints ===")
from users.urls import router
for route in router.urls:
    print(f"- {route.pattern}")
