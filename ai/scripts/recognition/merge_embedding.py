import os
import numpy as np
from collections import defaultdict

# =======================
# Paths
# =======================
EMBEDDINGS_FOLDER = r"G:\final_year_project\Attendance-and-Classroom-Behavior-Monitoring-System\student_embeddings\test"
MERGED_FOLDER = r"G:\final_year_project\Attendance-and-Classroom-Behavior-Monitoring-System\student_embeddings\merged"
os.makedirs(MERGED_FOLDER, exist_ok=True)

# =======================
# Group embeddings by base ID
# =======================
embeddings_dict = defaultdict(list)

for file in os.listdir(EMBEDDINGS_FOLDER):
    if file.endswith(".npy"):
        filepath = os.path.join(EMBEDDINGS_FOLDER, file)
        embedding = np.load(filepath)

        # Base student ID (remove (1), (2), etc.)
        student_id = os.path.splitext(file)[0].split("(")[0]

        embeddings_dict[student_id].append(embedding)

print(f"✅ Found {len(embeddings_dict)} students to merge.")

# =======================
# Merge and Save
# =======================
for student_id, embeddings in embeddings_dict.items():
    if len(embeddings) == 0:
        continue

    # Average all embeddings of this student
    merged_embedding = np.mean(embeddings, axis=0)

    save_path = os.path.join(MERGED_FOLDER, f"{student_id}.npy")
    np.save(save_path, merged_embedding)
    print(f"✅ Merged {len(embeddings)} files → {save_path}")

print("🎯 All embeddings merged successfully!")
