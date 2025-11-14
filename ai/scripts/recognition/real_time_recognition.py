import cv2
import numpy as np
from deepface import DeepFace
import os
from scipy.spatial.distance import cosine

# =======================
# Paths
# =======================
EMBEDDINGS_FOLDER = r"G:\final_year_project\Attendance-and-Classroom-Behavior-Monitoring-System\dataset\testing_embedding_512D"

# =======================
# Load embeddings
# =======================
embedding_dict = {}
for file in os.listdir(EMBEDDINGS_FOLDER):
    if file.endswith(".npy"):
        student_id = os.path.splitext(file)[0]
        embedding = np.load(os.path.join(EMBEDDINGS_FOLDER, file))
        embedding_dict[student_id] = embedding

print(f"Loaded {len(embedding_dict)} embeddings.")

# =======================
# Recognition function
# =======================
def recognize_face(face_img, threshold=0.3):
    """
    Returns the student_id with highest similarity if below threshold, else 'Unknown'.
    """
    try:
        embedding = DeepFace.represent(face_img, model_name="ArcFace", enforce_detection=False)[0]["embedding"]
        min_dist = float("inf")
        identity = "Unknown"

        for student_id, db_emb in embedding_dict.items():
            dist = cosine(embedding, db_emb)
            if dist < min_dist:
                min_dist = dist
                identity = student_id

        if min_dist > threshold:
            identity = "Unknown"
        return identity
    except Exception as e:
        print(f"Error in recognition: {e}")
        return "Error"

# =======================
# Open webcam
# =======================
cap = cv2.VideoCapture(0)
DETECTOR_BACKEND = "opencv"  # <<-- use lightweight detector

while True:
    ret, frame = cap.read()
    if not ret:
        break

    try:
        faces = DeepFace.extract_faces(
            frame,
            detector_backend=DETECTOR_BACKEND,
            enforce_detection=False
        )

        for face_data in faces:
            fa = face_data["facial_area"]
            x, y, w, h = fa["x"], fa["y"], fa["w"], fa["h"]

            # Crop and resize face
            face_img = cv2.resize(face_data["face"], (160, 160))

            # Recognize face
            identity = recognize_face(face_img, threshold=0.3)

            # Draw rectangle and label
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(frame, identity, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
    except Exception as e:
        print(f"Detection error: {e}")
        pass

    cv2.imshow("Face Recognition (ArcFace + OpenCV)", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
