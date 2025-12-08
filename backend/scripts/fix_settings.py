import re

# Read the settings file
with open('attendance_and_monitoring_system/attendance_and_monitoring_system/settings.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Find all occurrences of REST_FRAMEWORK =
rest_framework_pattern = r'# Django REST Framework Configuration\nREST_FRAMEWORK = \{'
matches = list(re.finditer(rest_framework_pattern, content))

print(f"Found {len(matches)} REST_FRAMEWORK blocks")

if len(matches) >= 2:
    # Find the end of the first block (find the CORS Configuration or Logging Configuration after it)
    first_match_start = matches[0].start()
    
    # Find the first occurrence of "# Logging Configuration" after the first REST_FRAMEWORK
    logging_pattern = r'# Logging Configuration'
    logging_matches = list(re.finditer(logging_pattern, content))
    
    if len(logging_matches) >= 1:
        first_logging_start = logging_matches[0].start()
        
        # Remove everything from first REST_FRAMEWORK to first Logging Configuration
        new_content = content[:first_match_start] + content[first_logging_start:]
        
        # Now add port 5174 to CORS_ALLOWED_ORIGINS
        cors_pattern = r'(CORS_ALLOWED_ORIGINS = \[\s*"http://localhost:5173",\s*"http://127\.0\.0\.1:5173",)'
        cors_replacement = r'\1\n    "http://localhost:5174",\n    "http://127.0.0.1:5174",'
        
        new_content = re.sub(cors_pattern, cors_replacement, new_content)
        
        # Fix duplicate JTI_CLAIM
        jti_pattern = r"'JTI_CLAIM': 'jti',\s*'TOKEN_TYPE_CLAIM': 'token_type',\s*'JTI_CLAIM': 'jti',"
        jti_replacement = "'JTI_CLAIM': 'jti',\n    'TOKEN_TYPE_CLAIM': 'token_type',"
        
        new_content = re.sub(jti_pattern, jti_replacement, new_content)
        
        # Write back
        with open('attendance_and_monitoring_system/attendance_and_monitoring_system/settings.py', 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print("✓ Removed duplicate REST_FRAMEWORK and SIMPLE_JWT blocks")
        print("✓ Added port 5174 to CORS_ALLOWED_ORIGINS")
        print("✓ Fixed duplicate JTI_CLAIM")
    else:
        print("Could not find Logging Configuration marker")
else:
    print("Did not find duplicate blocks")
