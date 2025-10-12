import cv2
import numpy as np
from deepface import DeepFace
import os
from scipy.spatial.distance import cosine
from collections import defaultdict
import time
from sklearn.neighbors import NearestNeighbors
import threading
import queue

class OptimizedFaceRecognition:
    def __init__(self, embeddings_folder, threshold=0.25):
        self.embeddings_folder = embeddings_folder
        self.threshold = threshold
        self.embedding_dict = defaultdict(list)
        self.student_embeddings = []
        self.student_labels = []
        self.knn_model = None
        
        # Face detection setup
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Threading setup
        self.recognition_queue = queue.Queue()
        self.result_queue = queue.Queue()
        self.recognition_thread = None
        self.running = False
        
        # Performance counters
        self.frame_count = 0
        self.skip_frames = 3  # Process every 3rd frame
        
        self.load_embeddings()
        self.build_search_index()
    
    def l2_normalize(self, vec):
        """L2 normalize vector"""
        vec = np.array(vec)
        norm = np.linalg.norm(vec)
        if norm == 0:
            return vec
        return vec / norm
    
    def load_embeddings(self):
        """Load and organize embeddings by student ID"""
        print("Loading embeddings...")
        
        for file in os.listdir(self.embeddings_folder):
            if file.endswith(".npy"):
                try:
                    full_id = os.path.splitext(file)[0]
                    student_id = full_id.split("_")[0]
                    
                    embedding = np.load(os.path.join(self.embeddings_folder, file))
                    embedding = self.l2_normalize(embedding)
                    
                    self.embedding_dict[student_id].append(embedding)
                    
                except Exception as e:
                    print(f"Error loading {file}: {e}")
                    continue
        
        print(f"✅ Loaded embeddings for {len(self.embedding_dict)} students")
        
        # Print embedding statistics
        for student_id, embeddings in self.embedding_dict.items():
            print(f"Student {student_id}: {len(embeddings)} embeddings")
    
    def build_search_index(self):
        """Build KNN index for fast similarity search"""
        print("Building search index...")
        
        # Create averaged embeddings for each student
        self.averaged_embeddings = {}
        
        for student_id, embeddings in self.embedding_dict.items():
            if len(embeddings) > 0:
                # Use the best embedding (you can also average them)
                avg_embedding = np.mean(embeddings, axis=0)
                avg_embedding = self.l2_normalize(avg_embedding)
                
                self.averaged_embeddings[student_id] = avg_embedding
                self.student_embeddings.append(avg_embedding)
                self.student_labels.append(student_id)
        
        # Build KNN model
        if len(self.student_embeddings) > 0:
            self.student_embeddings = np.array(self.student_embeddings)
            self.knn_model = NearestNeighbors(n_neighbors=1, metric='cosine', algorithm='brute')
            self.knn_model.fit(self.student_embeddings)
        
        print(f"✅ Built search index with {len(self.student_labels)} students")
    
    def extract_embedding_safe(self, face_img):
        """Safely extract embedding with error handling"""
        try:
            # Ensure face image is in correct format
            if face_img.dtype != np.uint8:
                face_img = (face_img * 255).astype(np.uint8)
            
            if len(face_img.shape) == 3 and face_img.shape[2] == 3:
                face_img = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
            
            # Extract embedding
            result = DeepFace.represent(
                face_img, 
                model_name="ArcFace", 
                enforce_detection=False,
                detector_backend="skip"  # Skip detection since we already have the face
            )
            
            embedding = result[0]["embedding"]
            return self.l2_normalize(embedding)
            
        except Exception as e:
            print(f"Embedding extraction error: {e}")
            return None
    
    def recognize_face_optimized(self, face_embedding, frame_num=None):
        """Optimized face recognition with strict matching criteria"""
        if self.knn_model is None or face_embedding is None:
            return "Unknown", 1.0
        
        frame_prefix = f"[FRAME {frame_num}] " if frame_num is not None else ""
        
        try:
            print(f"{frame_prefix}=== Starting Recognition ===")
            
            # Calculate distances to ALL students
            all_student_distances = {}
            
            for student_id, embeddings in self.embedding_dict.items():
                distances = [cosine(face_embedding, emb) for emb in embeddings]
                min_dist = min(distances)
                avg_dist = np.mean(distances)
                all_student_distances[student_id] = {
                    'min': min_dist, 
                    'avg': avg_dist,
                    'count': len(distances)
                }
                print(f"{frame_prefix}[DISTANCE] Student {student_id}: Min={min_dist:.4f}, Avg={avg_dist:.4f}")
            
            # Find the best match
            best_student = min(all_student_distances.keys(), 
                             key=lambda x: all_student_distances[x]['min'])
            best_min_distance = all_student_distances[best_student]['min']
            
            # Find second best for comparison
            sorted_students = sorted(all_student_distances.items(), 
                                   key=lambda x: x[1]['min'])
            
            if len(sorted_students) >= 2:
                second_best_distance = sorted_students[1][1]['min']
                distance_gap = second_best_distance - best_min_distance
                print(f"{frame_prefix}[COMPARISON] Best: {best_student}({best_min_distance:.4f}) vs Second: {sorted_students[1][0]}({second_best_distance:.4f})")
                print(f"{frame_prefix}[GAP] Distance gap: {distance_gap:.4f}")
            else:
                distance_gap = float('inf')
            
            # Strict matching criteria
            ABSOLUTE_THRESHOLD = 0.20  # Must be below this
            RELATIVE_GAP = 0.05        # Must be significantly better than second best
            
            # Decision logic
            if best_min_distance > ABSOLUTE_THRESHOLD:
                print(f"{frame_prefix}[REJECT] Distance {best_min_distance:.4f} > absolute threshold {ABSOLUTE_THRESHOLD}")
                return "Unknown", best_min_distance
            
            if len(sorted_students) >= 2 and distance_gap < RELATIVE_GAP:
                print(f"{frame_prefix}[REJECT] Gap {distance_gap:.4f} < required gap {RELATIVE_GAP} (too ambiguous)")
                return "Unknown", best_min_distance
            
            print(f"{frame_prefix}[ACCEPT] Student {best_student} with distance {best_min_distance:.4f}")
            print(f"{frame_prefix}=== Recognition Complete ===\n")
            return best_student, best_min_distance
            
        except Exception as e:
            print(f"{frame_prefix}Recognition error: {e}")
            return "Unknown", 1.0
    
    def detect_faces_fast(self, frame):
        """Fast face detection using OpenCV"""
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray, 
            scaleFactor=1.1, 
            minNeighbors=5, 
            minSize=(80, 80),
            flags=cv2.CASCADE_SCALE_IMAGE
        )
        return faces
    
    def recognition_worker(self):
        """Background thread for face recognition"""
        while self.running:
            try:
                if not self.recognition_queue.empty():
                    face_img, face_id, frame_num = self.recognition_queue.get(timeout=0.1)
                    
                    print(f"[FRAME {frame_num}] 🔍 Starting recognition for Face ID {face_id}")
                    
                    # Extract embedding
                    embedding = self.extract_embedding_safe(face_img)
                    
                    # Recognize with frame number
                    identity, distance = self.recognize_face_optimized(embedding, frame_num)
                    
                    # Put result back
                    self.result_queue.put((face_id, identity, distance, frame_num))
                    
            except queue.Empty:
                continue
            except Exception as e:
                print(f"Recognition worker error: {e}")
    
    def start_recognition_thread(self):
        """Start background recognition thread"""
        self.running = True
        self.recognition_thread = threading.Thread(target=self.recognition_worker, daemon=True)
        self.recognition_thread.start()
    
    def stop_recognition_thread(self):
        """Stop background recognition thread"""
        self.running = False
        if self.recognition_thread:
            self.recognition_thread.join()
    
    def run_realtime(self):
        """Main real-time recognition loop"""
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        cap.set(cv2.CAP_PROP_FPS, 30)
        
        if not cap.isOpened():
            print("Error: Could not open camera")
            return
        
        self.start_recognition_thread()
        
        # Face results storage - keep track of faces and their recognition results
        face_results = {}  # {face_id: (identity, distance, timestamp)}
        next_face_id = 0
        
        # For immediate display without waiting for processing
        current_faces = []  # List of current face locations
        
        print("🎥 Starting real-time recognition. Press 'q' to quit.")
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    print("Failed to read frame")
                    break
                
                self.frame_count += 1
                print(f"\n📹 [FRAME {self.frame_count}] Processing frame...")
                
                # Process every nth frame for detection
                if self.frame_count % self.skip_frames == 0:
                    print(f"[FRAME {self.frame_count}] 🔍 Running face detection...")
                    faces = self.detect_faces_fast(frame)
                    current_faces = faces  # Update current faces
                    
                    print(f"[FRAME {self.frame_count}] 👥 Found {len(faces)} face(s)")
                    
                    # Process detected faces
                    for i, (x, y, w, h) in enumerate(faces):
                        print(f"[FRAME {self.frame_count}] 👤 Processing face {i+1}/{len(faces)} at position ({x},{y},{w},{h})")
                        
                        # Extract face region
                        face_roi = frame[y:y+h, x:x+w]
                        face_img = cv2.resize(face_roi, (160, 160))
                        
                        # Queue for recognition
                        face_id = next_face_id
                        next_face_id += 1
                        
                        if not self.recognition_queue.full():
                            self.recognition_queue.put((face_img, face_id, self.frame_count))
                            print(f"[FRAME {self.frame_count}] ⏳ Queued Face ID {face_id} for recognition")
                        else:
                            print(f"[FRAME {self.frame_count}] ⚠️ Recognition queue full, skipping face")
                        
                        # Store face location with "Recognizing..." status
                        face_results[face_id] = ("Recognizing...", 0.0, time.time(), (x, y, w, h))
                
                # Get recognition results
                while not self.result_queue.empty():
                    try:
                        face_id, identity, distance, result_frame = self.result_queue.get_nowait()
                        if face_id in face_results:
                            _, _, timestamp, location = face_results[face_id]
                            face_results[face_id] = (identity, distance, timestamp, location)
                            print(f"[FRAME {self.frame_count}] ✅ Recognition result for Face ID {face_id} (from frame {result_frame}): {identity} (distance: {distance:.4f})")
                    except queue.Empty:
                        break
                
                # Draw results - prioritize recent recognition results, fall back to current faces
                current_time = time.time()
                
                # First, draw all current faces (even without recognition results)
                for (x, y, w, h) in current_faces:
                    cv2.rectangle(frame, (x, y), (x + w, y + h), (100, 100, 100), 1)  # Gray for unprocessed
                
                # Then overlay recognition results
                for face_id, (identity, distance, timestamp, (x, y, w, h)) in list(face_results.items()):
                    # Remove old results (older than 3 seconds)
                    if current_time - timestamp > 3.0:
                        del face_results[face_id]
                        continue
                    
                    # Choose color based on result
                    if identity == "Recognizing...":
                        color = (0, 255, 255)  # Yellow for processing
                    elif identity == "Unknown":
                        color = (0, 0, 255)    # Red for unknown
                    else:
                        color = (0, 255, 0)    # Green for recognized
                    
                    # Draw rectangle and label
                    cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
                    
                    label = f"{identity}"
                    if distance > 0 and identity != "Recognizing...":
                        label += f" ({distance:.3f})"
                    
                    # Background for text
                    (label_width, label_height), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                    cv2.rectangle(frame, (x, y - label_height - 10), (x + label_width, y), color, -1)
                    cv2.putText(frame, label, (x, y - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                
                # Show frame info and stats
                info_text = f"Frame: {self.frame_count} | Students: {len(self.embedding_dict)} | Current Faces: {len(current_faces)}"
                cv2.putText(frame, info_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)
                
                # Show queue status
                queue_text = f"Queue: {self.recognition_queue.qsize()} pending"
                cv2.putText(frame, queue_text, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
                
                cv2.imshow("Optimized Face Recognition", frame)
                
                # Exit on 'q' press
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break
                    
        except KeyboardInterrupt:
            print("\n🛑 Stopping recognition...")
        
        finally:
            self.stop_recognition_thread()
            cap.release()
            cv2.destroyAllWindows()
            print("🏁 Recognition stopped.")

# =======================
# Usage
# =======================
if __name__ == "__main__":
    EMBEDDINGS_FOLDER = r"G:\final_year_project\Attendance-and-Classroom-Behavior-Monitoring-System\student_embeddings\merged"
    
    # Create and run the recognition system
    recognizer = OptimizedFaceRecognition(
        embeddings_folder=EMBEDDINGS_FOLDER,
        threshold=0.25  # Lower threshold for stricter matching
    )
    
    # Run real-time recognition
    recognizer.run_realtime()