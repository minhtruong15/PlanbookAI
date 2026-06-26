import sqlite3

def migrate():
    conn = sqlite3.connect('exam.db')
    cursor = conn.cursor()
    
    # Check exams table
    cursor.execute("PRAGMA table_info(exams)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'password' not in columns:
        print("Adding password column to exams")
        cursor.execute("ALTER TABLE exams ADD COLUMN password VARCHAR(100)")
    
    if 'exam_codes' not in columns:
        print("Adding exam_codes column to exams")
        cursor.execute("ALTER TABLE exams ADD COLUMN exam_codes JSON")

    # Check submissions table
    cursor.execute("PRAGMA table_info(submissions)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if 'exam_code' not in columns:
        print("Adding exam_code column to submissions")
        cursor.execute("ALTER TABLE submissions ADD COLUMN exam_code VARCHAR(50)")
        
    if 'correct_count' not in columns:
        print("Adding correct_count column to submissions")
        cursor.execute("ALTER TABLE submissions ADD COLUMN correct_count INTEGER DEFAULT 0")

    if 'total_questions' not in columns:
        print("Adding total_questions column to submissions")
        cursor.execute("ALTER TABLE submissions ADD COLUMN total_questions INTEGER DEFAULT 0")

    conn.commit()
    conn.close()
    print("Migration complete")

if __name__ == "__main__":
    migrate()
