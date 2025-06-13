"""
IDFS StarGuide - Database Setup
Initialize SQLite database with all required tables
"""

import sqlite3
import os
from datetime import datetime

# Database path
DB_PATH = 'data/starguide.db'

def create_database():
    """Create database and all tables"""
    
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Connect to database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Enable foreign keys
    cursor.execute("PRAGMA foreign_keys = ON")
    
    # Create users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE,
            password_hash TEXT,
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            total_xp INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_demo BOOLEAN DEFAULT FALSE,
            avatar TEXT,
            bio TEXT
        )
    """)
    
    # Create sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Create assessments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            category TEXT NOT NULL,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            time_taken INTEGER,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Create battles table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS battles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            boss_id TEXT NOT NULL,
            won BOOLEAN NOT NULL,
            player_hp INTEGER,
            boss_hp INTEGER,
            questions_answered INTEGER,
            correct_answers INTEGER,
            time_taken INTEGER,
            xp_earned INTEGER,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Create quest_progress table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS quest_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            quest_id TEXT NOT NULL,
            current_chapter INTEGER DEFAULT 1,
            completed BOOLEAN DEFAULT FALSE,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, quest_id)
        )
    """)
    
    # Create achievements table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            achievement_id TEXT NOT NULL,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, achievement_id)
        )
    """)
    
    # Create pod_memberships table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pod_memberships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            pod_id TEXT NOT NULL,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            role TEXT DEFAULT 'member',
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, pod_id)
        )
    """)
    
    # Create pod_messages table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS pod_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pod_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Create goals table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            specific TEXT,
            measurable TEXT,
            achievable TEXT,
            relevant TEXT,
            deadline DATE,
            progress INTEGER DEFAULT 0,
            completed BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Create skill_progress table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS skill_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            skill_name TEXT NOT NULL,
            level INTEGER DEFAULT 0,
            xp INTEGER DEFAULT 0,
            last_practiced TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(user_id, skill_name)
        )
    """)
    
    # Create activity_log table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS activity_log (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            activity_type TEXT NOT NULL,
            activity_data TEXT,
            xp_earned INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)
    
    # Create questions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            category TEXT NOT NULL,
            difficulty TEXT NOT NULL,
            question_type TEXT,
            question TEXT NOT NULL,
            options TEXT NOT NULL,
            correct_answer INTEGER NOT NULL,
            explanation TEXT,
            tags TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    
    # Create leaderboard view
    cursor.execute("""
        CREATE VIEW IF NOT EXISTS leaderboard AS
        SELECT 
            username,
            level,
            total_xp,
            (SELECT COUNT(*) FROM achievements WHERE user_id = users.id) as achievement_count,
            (SELECT COUNT(*) FROM battles WHERE user_id = users.id AND won = 1) as battles_won,
            created_at
        FROM users
        WHERE is_demo = FALSE
        ORDER BY total_xp DESC
    """)
    
    # Create indexes for better performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_battles_user_id ON battles(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON activity_log(user_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON activity_log(created_at)")
    
    # Insert sample questions
    sample_questions = [
        # JavaScript questions
        ("javascript", "easy", "multiple_choice", 
         "What is the correct way to declare a variable in JavaScript ES6?",
         '["var x = 5;", "let x = 5;", "variable x = 5;", "int x = 5;"]',
         1, "In ES6, 'let' is the preferred way to declare variables with block scope.", "variables,es6"),
        
        ("javascript", "easy", "multiple_choice",
         "Which method adds an element to the end of an array?",
         '["push()", "pop()", "shift()", "unshift()"]',
         0, "The push() method adds one or more elements to the end of an array.", "arrays,methods"),
        
        ("javascript", "medium", "multiple_choice",
         "What does '===' compare in JavaScript?",
         '["Only value", "Only type", "Both value and type", "Neither value nor type"]',
         2, "The === operator compares both value and type (strict equality).", "operators,comparison"),
        
        # Python questions
        ("python", "easy", "multiple_choice",
         "How do you create a list in Python?",
         '["list = {}", "list = []", "list = ()", "list = <>"]',
         1, "Lists in Python are created using square brackets [].", "data-structures,lists"),
        
        ("python", "easy", "multiple_choice",
         "Which keyword is used to define a function in Python?",
         '["function", "def", "func", "define"]',
         1, "The 'def' keyword is used to define functions in Python.", "functions,syntax"),
        
        # React questions
        ("react", "medium", "multiple_choice",
         "What is JSX?",
         '["A JavaScript extension", "A CSS framework", "A database", "A testing library"]',
         0, "JSX is a syntax extension for JavaScript used in React.", "jsx,react-basics"),
        
        ("react", "medium", "multiple_choice",
         "Which hook is used for side effects in React?",
         '["useState", "useEffect", "useContext", "useReducer"]',
         1, "useEffect is used to perform side effects in React components.", "hooks,react"),
        
        # General tech questions
        ("general", "easy", "multiple_choice",
         "What does API stand for?",
         '["Application Programming Interface", "Advanced Programming Interface", "Application Process Integration", "Automated Programming Interface"]',
         0, "API stands for Application Programming Interface.", "concepts,web"),
        
        ("general", "easy", "multiple_choice",
         "What is Git?",
         '["A programming language", "A version control system", "A database", "An operating system"]',
         1, "Git is a distributed version control system.", "tools,version-control")
    ]
    
    cursor.executemany("""
        INSERT OR IGNORE INTO questions (category, difficulty, question_type, question, options, correct_answer, explanation, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_questions)
    
    # Commit changes and close connection
    conn.commit()
    conn.close()
    
    print(f"Database created successfully at: {DB_PATH}")
    print("Tables created:")
    print("- users")
    print("- sessions")
    print("- assessments")
    print("- battles")
    print("- quest_progress")
    print("- achievements")
    print("- pod_memberships")
    print("- pod_messages")
    print("- goals")
    print("- skill_progress")
    print("- activity_log")
    print("- questions")
    print("- leaderboard (view)")
    print(f"\nSample questions inserted: {len(sample_questions)}")

if __name__ == "__main__":
    create_database()
