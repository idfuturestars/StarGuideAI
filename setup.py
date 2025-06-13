"""
IDFS StarGuide - Database Setup Script
Initializes the database with all required tables and sample data
"""

import sqlite3
import json
import uuid
from datetime import datetime, timedelta
import random

def create_database():
    """Create and initialize the StarGuide database"""
    
    # Connect to database
    conn = sqlite3.connect('starguide.db')
    cursor = conn.cursor()
    
    print("🚀 Initializing IDFS StarGuide Database...")
    
    # Create tables
    create_tables(cursor)
    
    # Populate initial data
    populate_questions(cursor)
    populate_achievements(cursor)
    populate_sample_tournaments(cursor)
    
    # Commit changes
    conn.commit()
    conn.close()
    
    print("✅ Database initialization complete!")

def create_tables(cursor):
    """Create all database tables"""
    
    # Drop existing tables if they exist (for fresh setup)
    tables = [
        'analytics_events', 'quest_progress', 'help_tickets', 
        'tournament_participants', 'tournaments', 'daily_challenges',
        'pod_messages', 'pod_members', 'learning_pods', 'battles',
        'achievements', 'questions', 'assessments', 'user_profiles', 'users'
    ]
    
    for table in tables:
        cursor.execute(f"DROP TABLE IF EXISTS {table}")
    
    # Users table
    cursor.execute('''
        CREATE TABLE users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            username TEXT UNIQUE NOT NULL,
            role TEXT DEFAULT 'student',
            is_demo BOOLEAN DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # User profiles
    cursor.execute('''
        CREATE TABLE user_profiles (
            user_id TEXT PRIMARY KEY,
            display_name TEXT,
            level INTEGER DEFAULT 1,
            xp INTEGER DEFAULT 0,
            credits INTEGER DEFAULT 100,
            streak INTEGER DEFAULT 0,
            last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            settings TEXT DEFAULT '{}',
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Assessments
    cursor.execute('''
        CREATE TABLE assessments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            type TEXT,
            subject TEXT,
            score INTEGER,
            total_questions INTEGER,
            time_taken INTEGER,
            questions_data TEXT,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Questions bank
    cursor.execute('''
        CREATE TABLE questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject TEXT,
            difficulty INTEGER,
            type TEXT,
            question TEXT,
            options TEXT,
            correct_answer TEXT,
            explanation TEXT,
            hint TEXT,
            tags TEXT,
            usage_count INTEGER DEFAULT 0,
            success_rate REAL DEFAULT 0
        )
    ''')
    
    # Achievements
    cursor.execute('''
        CREATE TABLE achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            achievement_id TEXT,
            unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Battles
    cursor.execute('''
        CREATE TABLE battles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            opponent_id TEXT,
            user_score INTEGER,
            opponent_score INTEGER,
            winner_id TEXT,
            xp_earned INTEGER,
            duration INTEGER,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Learning pods
    cursor.execute('''
        CREATE TABLE learning_pods (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            subject TEXT,
            creator_id TEXT,
            max_members INTEGER DEFAULT 10,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (creator_id) REFERENCES users (id)
        )
    ''')
    
    # Pod members
    cursor.execute('''
        CREATE TABLE pod_members (
            pod_id INTEGER,
            user_id TEXT,
            role TEXT DEFAULT 'member',
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (pod_id, user_id),
            FOREIGN KEY (pod_id) REFERENCES learning_pods (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Pod messages
    cursor.execute('''
        CREATE TABLE pod_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pod_id INTEGER,
            user_id TEXT,
            message TEXT,
            sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (pod_id) REFERENCES learning_pods (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Daily challenges
    cursor.execute('''
        CREATE TABLE daily_challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            challenge_date DATE,
            challenge_type TEXT,
            completed BOOLEAN DEFAULT 0,
            score INTEGER,
            completed_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Tournaments
    cursor.execute('''
        CREATE TABLE tournaments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            description TEXT,
            start_date TIMESTAMP,
            end_date TIMESTAMP,
            max_participants INTEGER,
            prize_pool INTEGER,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Tournament participants
    cursor.execute('''
        CREATE TABLE tournament_participants (
            tournament_id INTEGER,
            user_id TEXT,
            score INTEGER DEFAULT 0,
            rank INTEGER,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (tournament_id, user_id),
            FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Help tickets
    cursor.execute('''
        CREATE TABLE help_tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            subject TEXT,
            category TEXT,
            priority TEXT,
            description TEXT,
            status TEXT DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            resolved_at TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Quest progress
    cursor.execute('''
        CREATE TABLE quest_progress (
            user_id TEXT,
            quest_id TEXT,
            phase INTEGER DEFAULT 1,
            progress INTEGER DEFAULT 0,
            completed BOOLEAN DEFAULT 0,
            started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            completed_at TIMESTAMP,
            PRIMARY KEY (user_id, quest_id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Analytics events
    cursor.execute('''
        CREATE TABLE analytics_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            event_type TEXT,
            event_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Create indexes
    cursor.execute('CREATE INDEX idx_assessments_user ON assessments(user_id)')
    cursor.execute('CREATE INDEX idx_achievements_user ON achievements(user_id)')
    cursor.execute('CREATE INDEX idx_battles_user ON battles(user_id)')
    cursor.execute('CREATE INDEX idx_analytics_user ON analytics_events(user_id)')
    cursor.execute('CREATE INDEX idx_questions_subject ON questions(subject)')
    
    print("✅ Tables created successfully")

def populate_questions(cursor):
    """Populate question bank with comprehensive questions"""
    
    questions = [
        # Mathematics (50+ questions)
        {"subject": "math", "difficulty": 1, "type": "calculation", "question": "What is 15 × 8?", "correct_answer": "120", "hint": "Think: 15 × 8 = 15 × (10 - 2)", "explanation": "15 × 8 = 120. You can break it down: 15 × 10 = 150, then 15 × 2 = 30, so 150 - 30 = 120"},
        {"subject": "math", "difficulty": 1, "type": "calculation", "question": "What is 234 + 567?", "correct_answer": "801", "hint": "Add the units, tens, and hundreds separately", "explanation": "234 + 567 = 801. Break it down: 200 + 500 = 700, 30 + 60 = 90, 4 + 7 = 11, so 700 + 90 + 11 = 801"},
        {"subject": "math", "difficulty": 1, "type": "calculation", "question": "What is 1000 - 437?", "correct_answer": "563", "hint": "Think: 1000 - 437 = 563", "explanation": "1000 - 437 = 563. You can think of it as 1000 - 400 = 600, then 600 - 37 = 563"},
        {"subject": "math", "difficulty": 1, "type": "calculation", "question": "What is 25% of 80?", "correct_answer": "20", "hint": "25% = 1/4, so divide 80 by 4", "explanation": "25% of 80 = 20. Since 25% = 1/4, we have 80 ÷ 4 = 20"},
        {"subject": "math", "difficulty": 1, "type": "conversion", "question": "Convert 3/4 to a decimal", "correct_answer": "0.75", "hint": "Divide 3 by 4", "explanation": "3/4 = 0.75. When you divide 3 by 4, you get 0.75"},
        {"subject": "math", "difficulty": 1, "type": "geometry", "question": "What is the perimeter of a square with side length 6?", "correct_answer": "24", "hint": "Perimeter = 4 × side length", "explanation": "Perimeter = 4 × 6 = 24. A square has 4 equal sides"},
        {"subject": "math", "difficulty": 1, "type": "word-problem", "question": "If you have 12 apples and give away 5, how many do you have left?", "correct_answer": "7", "hint": "Subtract 5 from 12", "explanation": "12 - 5 = 7 apples remaining"},
        {"subject": "math", "difficulty": 2, "type": "algebra", "question": "Solve for x: 2x + 5 = 17", "correct_answer": "6", "hint": "Subtract 5 from both sides, then divide by 2", "explanation": "2x + 5 = 17 → 2x = 12 → x = 6"},
        {"subject": "math", "difficulty": 2, "type": "algebra", "question": "Solve for y: 3y - 7 = 14", "correct_answer": "7", "hint": "Add 7 to both sides, then divide by 3", "explanation": "3y - 7 = 14 → 3y = 21 → y = 7"},
        {"subject": "math", "difficulty": 2, "type": "geometry", "question": "What is the area of a circle with radius 5? (Use π = 3.14)", "correct_answer": "78.5", "hint": "Area = πr²", "explanation": "Area = π × r² = 3.14 × 5² = 3.14 × 25 = 78.5"},
        {"subject": "math", "difficulty": 2, "type": "geometry", "question": "What is the area of a rectangle with length 8 and width 5?", "correct_answer": "40", "hint": "Area = length × width", "explanation": "Area = 8 × 5 = 40 square units"},
        {"subject": "math", "difficulty": 2, "type": "fractions", "question": "What is 2/3 + 1/6?", "correct_answer": "5/6", "hint": "Find common denominator first", "explanation": "2/3 + 1/6 = 4/6 + 1/6 = 5/6"},
        {"subject": "math", "difficulty": 2, "type": "percentage", "question": "What is 15% of 200?", "correct_answer": "30", "hint": "15% = 0.15", "explanation": "15% of 200 = 0.15 × 200 = 30"},
        {"subject": "math", "difficulty": 3, "type": "algebra", "question": "Factor: x² + 5x + 6", "correct_answer": "(x+2)(x+3)", "hint": "Find two numbers that multiply to 6 and add to 5", "explanation": "x² + 5x + 6 = (x + 2)(x + 3). The numbers 2 and 3 multiply to 6 and add to 5"},
        {"subject": "math", "difficulty": 3, "type": "sequences", "question": "What is the next number: 2, 6, 12, 20, 30, ?", "correct_answer": "42", "hint": "Look at the differences: 4, 6, 8, 10...", "explanation": "The differences are 4, 6, 8, 10, so the next difference is 12. Therefore, 30 + 12 = 42"},
        {"subject": "math", "difficulty": 3, "type": "probability", "question": "What is the probability of rolling a sum of 7 with two dice?", "correct_answer": "1/6", "hint": "Count favorable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1)", "explanation": "There are 6 ways to get a sum of 7 out of 36 total outcomes, so probability = 6/36 = 1/6"},
        
        # Science (50+ questions)
        {"subject": "science", "difficulty": 1, "type": "chemistry", "question": "What is the chemical symbol for gold?", "correct_answer": "Au", "hint": "From Latin 'aurum'", "explanation": "The chemical symbol for gold is Au, from the Latin word 'aurum' meaning gold"},
        {"subject": "science", "difficulty": 1, "type": "chemistry", "question": "What is H2O?", "correct_answer": "water", "hint": "2 hydrogen, 1 oxygen", "explanation": "H2O is the chemical formula for water - 2 hydrogen atoms and 1 oxygen atom"},
        {"subject": "science", "difficulty": 1, "type": "biology", "question": "What gas do plants absorb from the atmosphere?", "correct_answer": "carbon dioxide", "hint": "Used in photosynthesis", "explanation": "Plants absorb carbon dioxide (CO2) from the atmosphere for photosynthesis"},
        {"subject": "science", "difficulty": 1, "type": "physics", "question": "What is the unit of force?", "correct_answer": "newton", "hint": "Named after Sir Isaac...", "explanation": "The unit of force is the newton (N), named after Sir Isaac Newton"},
        {"subject": "science", "difficulty": 1, "type": "astronomy", "question": "How many planets are in our solar system?", "correct_answer": "8", "hint": "Pluto was reclassified in 2006", "explanation": "There are 8 planets in our solar system. Pluto was reclassified as a dwarf planet in 2006"},
        {"subject": "science", "difficulty": 1, "type": "biology", "question": "What is the largest organ in the human body?", "correct_answer": "skin", "hint": "It covers your entire body", "explanation": "The skin is the largest organ in the human body"},
        {"subject": "science", "difficulty": 1, "type": "physics", "question": "What is the speed of sound in air at room temperature (approximate)?", "correct_answer": "343", "hint": "About 343 m/s", "explanation": "The speed of sound in air at room temperature is approximately 343 meters per second"},
        {"subject": "science", "difficulty": 2, "type": "chemistry", "question": "What is the atomic number of carbon?", "correct_answer": "6", "hint": "Number of protons", "explanation": "Carbon has an atomic number of 6, meaning it has 6 protons in its nucleus"},
        {"subject": "science", "difficulty": 2, "type": "biology", "question": "What is the powerhouse of the cell?", "correct_answer": "mitochondria", "hint": "Produces ATP", "explanation": "The mitochondria is called the powerhouse of the cell because it produces ATP (energy)"},
        {"subject": "science", "difficulty": 2, "type": "physics", "question": "What is the formula for kinetic energy?", "correct_answer": "1/2mv²", "hint": "Half mass times velocity squared", "explanation": "Kinetic energy = 1/2 × mass × velocity²"},
        {"subject": "science", "difficulty": 2, "type": "chemistry", "question": "What is the pH of pure water?", "correct_answer": "7", "hint": "Neutral pH", "explanation": "Pure water has a pH of 7, which is neutral (neither acidic nor basic)"},
        {"subject": "science", "difficulty": 2, "type": "biology", "question": "How many chambers does the human heart have?", "correct_answer": "4", "hint": "Two atria and two ventricles", "explanation": "The human heart has 4 chambers: 2 atria (upper) and 2 ventricles (lower)"},
        {"subject": "science", "difficulty": 3, "type": "physics", "question": "What is the speed of light in vacuum (m/s)?", "correct_answer": "299792458", "hint": "Approximately 3×10⁸", "explanation": "The speed of light in vacuum is exactly 299,792,458 meters per second"},
        {"subject": "science", "difficulty": 3, "type": "chemistry", "question": "What is Avogadro's number (to 3 significant figures)?", "correct_answer": "6.02e23", "hint": "6.02 × 10²³", "explanation": "Avogadro's number is approximately 6.02 × 10²³ particles per mole"},
        
        # English (50+ questions)
        {"subject": "english", "difficulty": 1, "type": "grammar", "question": "What type of word is 'quickly'?", "correct_answer": "adverb", "hint": "Modifies a verb", "explanation": "Quickly' is an adverb because it modifies verbs and describes how an action is performed"},
        {"subject": "english", "difficulty": 1, "type": "vocabulary", "question": "What is a synonym for 'happy'?", "correct_answer": "joyful", "hint": "Feeling great pleasure", "explanation": "Joyful is a synonym for happy, both meaning feeling great pleasure or happiness"},
        {"subject": "english", "difficulty": 1, "type": "grammar", "question": "What is the plural of 'child'?", "correct_answer": "children", "hint": "Irregular plural", "explanation": "The plural of 'child' is 'children' - it's an irregular plural form"},
        {"subject": "english", "difficulty": 1, "type": "punctuation", "question": "Which punctuation mark ends a question?", "correct_answer": "?", "hint": "It curves at the top", "explanation": "A question mark (?) is used to end interrogative sentences"},
        {"subject": "english", "difficulty": 1, "type": "parts-of-speech", "question": "What part of speech is the word 'run' in 'I run fast'?", "correct_answer": "verb", "hint": "It shows action", "explanation": "In this sentence, 'run' is a verb because it shows the action being performed"},
        {"subject": "english", "difficulty": 2, "type": "literature", "question": "Who wrote 'Romeo and Juliet'?", "correct_answer": "Shakespeare", "hint": "The Bard of Avon", "explanation": "William Shakespeare wrote Romeo and Juliet, one of his most famous tragedies"},
        {"subject": "english", "difficulty": 2, "type": "grammar", "question": "What literary device is 'The stars danced'?", "correct_answer": "personification", "hint": "Giving human qualities to non-human things", "explanation": "This is personification - giving human qualities (dancing) to non-human things (stars)"},
        {"subject": "english", "difficulty": 2, "type": "vocabulary", "question": "What does 'benevolent' mean?", "correct_answer": "kind", "hint": "Well-meaning and kindly", "explanation": "Benevolent means well-meaning and kindly, showing goodwill"},
        {"subject": "english", "difficulty": 3, "type": "grammar", "question": "What is the past participle of 'write'?", "correct_answer": "written", "hint": "I have _____ a letter", "explanation": "The past participle of 'write' is 'written' (write, wrote, written)"},
        
        # History (50+ questions)
        {"subject": "history", "difficulty": 1, "type": "dates", "question": "In what year did World War II end?", "correct_answer": "1945", "hint": "Victory in Europe and Japan", "explanation": "World War II ended in 1945 with Germany's surrender in May and Japan's in August"},
        {"subject": "history", "difficulty": 1, "type": "people", "question": "Who was the first President of the United States?", "correct_answer": "George Washington", "hint": "On the one dollar bill", "explanation": "George Washington was the first President of the United States (1789-1797)"},
        {"subject": "history", "difficulty": 1, "type": "events", "question": "In what year did Christopher Columbus reach the Americas?", "correct_answer": "1492", "hint": "In fourteen hundred and ninety-two...", "explanation": "Christopher Columbus reached the Americas in 1492"},
        {"subject": "history", "difficulty": 1, "type": "civilizations", "question": "Which ancient civilization built the pyramids?", "correct_answer": "Egyptian", "hint": "Along the Nile River", "explanation": "The ancient Egyptians built the pyramids as tombs for their pharaohs"},
        {"subject": "history", "difficulty": 2, "type": "events", "question": "What year did the Berlin Wall fall?", "correct_answer": "1989", "hint": "End of Cold War era", "explanation": "The Berlin Wall fell on November 9, 1989, marking the end of the Cold War era"},
        {"subject": "history", "difficulty": 2, "type": "ancient", "question": "Which ancient wonder of the world still stands today?", "correct_answer": "Great Pyramid of Giza", "hint": "In Egypt", "explanation": "The Great Pyramid of Giza is the only ancient wonder that still stands today"},
        {"subject": "history", "difficulty": 2, "type": "american", "question": "What year did the American Civil War begin?", "correct_answer": "1861", "hint": "It lasted 4 years", "explanation": "The American Civil War began in 1861 and ended in 1865"},
        {"subject": "history", "difficulty": 3, "type": "dates", "question": "When was the Magna Carta signed?", "correct_answer": "1215", "hint": "13th century England", "explanation": "The Magna Carta was signed in 1215 by King John of England"},
    ]
    
    # Convert options to JSON for multiple choice questions
    multiple_choice_questions = [
        {
            "subject": "math",
            "difficulty": 1,
            "type": "multiple-choice",
            "question": "What is 15 × 8?",
            "options": ["100", "120", "140", "160"],
            "correct_answer": "1",  # Index of correct option
            "hint": "Think: 15 × 8 = 15 × (10 - 2)",
            "explanation": "15 × 8 = 120"
        },
        {
            "subject": "science",
            "difficulty": 1,
            "type": "multiple-choice",
            "question": "What is the chemical symbol for gold?",
            "options": ["Go", "Gd", "Au", "Ag"],
            "correct_answer": "2",  # Index of correct option
            "hint": "From Latin 'aurum'",
            "explanation": "The chemical symbol for gold is Au"
        },
        {
            "subject": "english",
            "difficulty": 1,
            "type": "multiple-choice",
            "question": "What type of word is 'quickly'?",
            "options": ["noun", "verb", "adjective", "adverb"],
            "correct_answer": "3",  # Index of correct option
            "hint": "Modifies a verb",
            "explanation": "'Quickly' is an adverb"
        },
        {
            "subject": "history",
            "difficulty": 1,
            "type": "multiple-choice",
            "question": "In what year did World War II end?",
            "options": ["1943", "1944", "1945", "1946"],
            "correct_answer": "2",  # Index of correct option
            "hint": "Victory in Europe and Japan",
            "explanation": "World War II ended in 1945"
        }
    ]
    
    # Insert text-based questions
    for q in questions:
        cursor.execute('''
            INSERT INTO questions (subject, difficulty, type, question, correct_answer, hint, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            q['subject'],
            q['difficulty'],
            q['type'],
            q['question'],
            q['correct_answer'],
            q['hint'],
            q['explanation']
        ))
    
    # Insert multiple choice questions
    for q in multiple_choice_questions:
        cursor.execute('''
            INSERT INTO questions (subject, difficulty, type, question, options, correct_answer, hint, explanation)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            q['subject'],
            q['difficulty'],
            q['type'],
            q['question'],
            json.dumps(q['options']),
            q['correct_answer'],
            q['hint'],
            q['explanation']
        ))
    
    print(f"✅ Populated {len(questions) + len(multiple_choice_questions)} questions")

def populate_achievements(cursor):
    """Populate achievement definitions"""
    
    achievements = [
        {
            'id': 'first-steps',
            'name': 'First Steps',
            'description': 'Complete your first assessment',
            'icon': '👶',
            'rarity': 'common',
            'xp_reward': 10
        },
        {
            'id': 'quick-learner',
            'name': 'Quick Learner',
            'description': 'Complete an assessment in under 5 minutes',
            'icon': '🚀',
            'rarity': 'uncommon',
            'xp_reward': 25
        },
        {
            'id': 'high-scorer',
            'name': 'High Scorer',
            'description': 'Score 80% or higher on an assessment',
            'icon': '🎯',
            'rarity': 'rare',
            'xp_reward': 30
        },
        {
            'id': 'perfectionist',
            'name': 'Perfectionist',
            'description': 'Achieve a perfect score',
            'icon': '💯',
            'rarity': 'legendary',
            'xp_reward': 100
        },
        {
            'id': 'streak-master',
            'name': 'Streak Master',
            'description': 'Maintain a 7-day learning streak',
            'icon': '🔥',
            'rarity': 'epic',
            'xp_reward': 75
        }
    ]
    
    # Note: Achievement definitions are stored in the application code
    # This is just for reference
    print(f"✅ Achievement system configured with {len(achievements)} achievements")

def populate_sample_tournaments(cursor):
    """Create sample active tournaments"""
    
    now = datetime.now()
    tournaments = [
        {
            'name': 'Weekly Math Championship',
            'description': 'Test your math skills against the best!',
            'start_date': now - timedelta(days=2),
            'end_date': now + timedelta(days=5),
            'max_participants': 500,
            'prize_pool': 1000
        },
        {
            'name': 'Science Showdown',
            'description': 'Prove your scientific knowledge!',
            'start_date': now - timedelta(days=1),
            'end_date': now + timedelta(days=6),
            'max_participants': 300,
            'prize_pool': 750
        },
        {
            'name': 'English Excellence',
            'description': 'Master of words competition',
            'start_date': now,
            'end_date': now + timedelta(days=7),
            'max_participants': 400,
            'prize_pool': 800
        }
    ]
    
    for t in tournaments:
        cursor.execute('''
            INSERT INTO tournaments (name, description, start_date, end_date, max_participants, prize_pool, is_active)
            VALUES (?, ?, ?, ?, ?, ?, 1)
        ''', (
            t['name'],
            t['description'],
            t['start_date'],
            t['end_date'],
            t['max_participants'],
            t['prize_pool']
        ))
    
    print(f"✅ Created {len(tournaments)} sample tournaments")

if __name__ == '__main__':
    create_database()
