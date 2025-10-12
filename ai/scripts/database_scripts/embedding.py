import cv2
import numpy as np
from deepface import DeepFace
import psycopg2
import os

VIDEO_PATH = r"G:\final_year_project\Attendance-and-Classroom-Behavior-Monitoring-System\dataset\students\780328.mp4"
STUDENT_ROLL = "780328"
EMBEDDINGS_FOLDER = r"G:\final_year_project\Attendance-and-Classroom-Behavior-Monitoring-System\student_embeddings"

os.makedirs(EMBEDDINGS_FOLDER, exist_ok=True)

def save_embedding_database(student_id: str, embedding:list)->None:
    """
        This function saves student's embedding in the database.\n
        Parameters:
            student_id(str): Roll_No of student
            embedding(list or bytes): The embedding vector representing the student's features.
        Returns: None
    """
    conn = psycopg2.connect(
        dbname="college_db",
        user="postgres",
        password="admin",
        host="localhost",
        port="5432"
    )
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO student_embeddings (student_id, embedding) VALUES (%s, %s)",
        (student_id, embedding)  # directly use list
    )
    conn.commit()
    cur.close()
    conn.close()

def save_embedding_file(student_id: str, embedding: list)->None:
    """
        This function saves student's embedding in the local directory.\n
        Parameters:
            student_id(str): Roll_No of student
            embedding(list or bytes): The embedding vector representing the student's features.
        Returns: None
    """
    filepath = os.path.join(EMBEDDINGS_FOLDER, f"{student_id}.npy")
    np.save(filepath, np.array(embedding))
    print(f"Saved embedding to file: {filepath}")

cap = cv2.VideoCapture(VIDEO_PATH)
frame_count = 0
processed_count = 0

while True:
    ret, frame = cap.read()
    if not ret:
        break

    frame_count += 1
    if frame_count % 10 != 0:
        continue

    try:
        faces = DeepFace.extract_faces(frame, enforce_detection=False)

        if len(faces) == 0:
            print(f"No faces detected in frame {frame_count}")
            continue

        for i, face_data in enumerate(faces):
            face_img = cv2.resize(face_data["face"], (160, 160))

            embedding = DeepFace.represent(face_img, model_name="Facenet", enforce_detection=False)[0]["embedding"]

            student_id = f"{STUDENT_ROLL}_frame{frame_count}_{i}"

            save_embedding_database(student_id, embedding)
            save_embedding_file(student_id, embedding)

            processed_count += 1

    except Exception as e:
        print(f"Error in frame {frame_count}: {e}")
        continue

cap.release()
print(f"✅ Finished! Total frames processed: {frame_count}, embeddings saved: {processed_count}")
