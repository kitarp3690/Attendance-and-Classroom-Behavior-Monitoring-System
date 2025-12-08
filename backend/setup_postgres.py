#!/usr/bin/env python3
"""
PostgreSQL Setup using psycopg2
Creates database and user directly without psql
"""

import sys
import os

try:
    import psycopg2
    from psycopg2 import sql, OperationalError
except ImportError:
    print("Error: psycopg2 is not installed")
    print("Installing psycopg2-binary...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
    import psycopg2
    from psycopg2 import sql, OperationalError

# Configuration
PG_HOST = "localhost"
PG_PORT = 5433
PG_USER = "postgres"
PG_PASS = "root"  # Password for postgresql18 server on port 5433
DB_NAME = "attendance_db"
DB_USER = "attendance_user"
DB_PASS = "attendance123"

def connect_postgres(password=None):
    """Connect to PostgreSQL as postgres user"""
    try:
        conn = psycopg2.connect(
            host=PG_HOST,
            port=PG_PORT,
            user=PG_USER,
            password=password if password is not None else PG_PASS,
            database="postgres"
        )
        conn.autocommit = True
        return conn
    except OperationalError as e:
        return None

def main():
    print("\n" + "="*60)
    print("PostgreSQL Database Setup (using psycopg2)")
    print("="*60 + "\n")
    
    # Try connecting without password first (trust auth)
    print("Step 1: Connecting to PostgreSQL...")
    conn = connect_postgres()
    
    if not conn:
        print("✗ Cannot connect with empty password, trying without password again...")
        # Connection might work even if password empty
        try:
            conn = psycopg2.connect(
                host=PG_HOST,
                port=PG_PORT,
                user=PG_USER,
                database="postgres",
                connect_timeout=5
            )
            conn.autocommit = True
        except Exception as e:
            print(f"✗ Connection failed: {e}")
            print("\nPlease use PgAdmin4 to manually:")
            print(f"1. Create database: {DB_NAME}")
            print(f"2. Create user: {DB_USER} with password: {DB_PASS}")
            print(f"3. Grant all privileges on {DB_NAME} to {DB_USER}")
            return False
    
    print("✓ Connected to PostgreSQL\n")
    
    cursor = conn.cursor()
    
    # Step 1: Create database
    print(f"Step 2: Creating database '{DB_NAME}'...")
    try:
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(
            sql.Identifier(DB_NAME)
        ))
        print(f"✓ Database '{DB_NAME}' created\n")
    except psycopg2.Error as e:
        if "already exists" in str(e):
            print(f"✓ Database '{DB_NAME}' already exists\n")
        else:
            print(f"✗ Error: {e}\n")
    
    # Step 2: Create user
    print(f"Step 3: Creating user '{DB_USER}'...")
    try:
        cursor.execute(sql.SQL("CREATE USER {} WITH PASSWORD %s").format(
            sql.Identifier(DB_USER)
        ), (DB_PASS,))
        print(f"✓ User '{DB_USER}' created\n")
    except psycopg2.Error as e:
        if "already exists" in str(e):
            print(f"✓ User '{DB_USER}' already exists\n")
        else:
            print(f"✗ Error: {e}\n")
    
    # Step 3: Grant database privileges
    print(f"Step 4: Granting privileges on database '{DB_NAME}'...")
    try:
        cursor.execute(sql.SQL("GRANT ALL PRIVILEGES ON DATABASE {} TO {}").format(
            sql.Identifier(DB_NAME),
            sql.Identifier(DB_USER)
        ))
        print(f"✓ Privileges granted on database\n")
    except psycopg2.Error as e:
        print(f"✗ Error: {e}\n")
    
    # Step 4: Connect to the new database and grant schema privileges
    print(f"Step 5: Granting schema privileges...")
    try:
        cursor.close()
        conn.close()
        
        # Connect to the new database
        conn = psycopg2.connect(
            host=PG_HOST,
            port=PG_PORT,
            user=PG_USER,
            password=PG_PASS,
            database=DB_NAME
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        cursor.execute(sql.SQL("GRANT ALL PRIVILEGES ON SCHEMA public TO {}").format(
            sql.Identifier(DB_USER)
        ))
        print(f"✓ Schema privileges granted\n")
    except psycopg2.Error as e:
        print(f"✗ Error: {e}\n")
    
    # Step 5: Test connection as the new user
    print(f"Step 6: Testing connection as '{DB_USER}'...")
    try:
        cursor.close()
        conn.close()
        
        test_conn = psycopg2.connect(
            host=PG_HOST,
            port=PG_PORT,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME
        )
        print(f"✓ Successfully connected as '{DB_USER}'\n")
        test_conn.close()
    except Exception as e:
        print(f"✗ Connection test failed: {e}\n")
    
    print("="*60)
    print("PostgreSQL Setup Completed!")
    print("="*60)
    print(f"\nDatabase Configuration:")
    print(f"  Database: {DB_NAME}")
    print(f"  User: {DB_USER}")
    print(f"  Password: {DB_PASS}")
    print(f"  Host: {PG_HOST}")
    print(f"  Port: {PG_PORT}")
    print(f"\nThe .env file has already been updated with these settings.")
    print("\n")
    
    return True

if __name__ == "__main__":
    main()
