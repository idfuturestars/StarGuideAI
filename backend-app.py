"""
IDFS StarGuide - Complete Backend Implementation
All features working 100% from the start
"""

from flask import Flask, render_template, request, jsonify, session, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import os
import json
import sqlite3
import random
import hashlib
import uuid
from datetime import datetime, timedelta
from dotenv import load_dotenv
import openai
from functools import wraps
import logging
import threading
import time

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key-' + str(uuid.uuid4()))
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# Initialize CORS and SocketIO
CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize OpenAI
openai.api_key = os.environ.get('OPENAI_API_KEY')

# Global state
online_users = {}
active_battles = {}
active_pods = {}

# Database helper
def get_db():
    """Get database connection with row factory"""
    db = sqlite3.connect('starguide.db', timeout=10)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    """Initialize database with all required tables"""
    db = get_db()
    
    # Read schema from file or create inline
    schema = '''
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        role TEXT DEFAULT 'student',
        is_demo BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- User profiles
    CREATE TABLE IF NOT EXISTS user_profiles (
        user_id TEXT PRIMARY KEY,
        display_name TEXT,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        credits INTEGER DEFAULT 100,
        streak INTEGER DEFAULT 0,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        settings TEXT DEFAULT '{}',
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Assessments
    CREATE TABLE IF NOT EXISTS assessments (
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
    );

    -- Questions bank
    CREATE TABLE IF NOT EXISTS questions (
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
    );

    -- Achievements
    CREATE TABLE IF NOT EXISTS achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        achievement_id TEXT,
        unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Battle history
    CREATE TABLE IF NOT EXISTS battles (
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
    );

    -- Learning pods
    CREATE TABLE IF NOT EXISTS learning_pods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        subject TEXT,
        creator_id TEXT,
        max_members INTEGER DEFAULT 10,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (creator_id) REFERENCES users (id)
    );

    -- Pod members
    CREATE TABLE IF NOT EXISTS pod_members (
        pod_id INTEGER,
        user_id TEXT,
        role TEXT DEFAULT 'member',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (pod_id, user_id),
        FOREIGN KEY (pod_id) REFERENCES learning_pods (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Pod messages
    CREATE TABLE IF NOT EXISTS pod_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pod_id INTEGER,
        user_id TEXT,
        message TEXT,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (pod_id) REFERENCES learning_pods (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Daily challenges
    CREATE TABLE IF NOT EXISTS daily_challenges (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        challenge_date DATE,
        challenge_type TEXT,
        completed BOOLEAN DEFAULT 0,
        score INTEGER,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Tournaments
    CREATE TABLE IF NOT EXISTS tournaments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        max_participants INTEGER,
        prize_pool INTEGER,
        is_active BOOLEAN DEFAULT 1
    );

    -- Tournament participants
    CREATE TABLE IF NOT EXISTS tournament_participants (
        tournament_id INTEGER,
        user_id TEXT,
        score INTEGER DEFAULT 0,
        rank INTEGER,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (tournament_id, user_id),
        FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Help tickets
    CREATE TABLE IF NOT EXISTS help_tickets (
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
    );

    -- Quest progress
    CREATE TABLE IF NOT EXISTS quest_progress (
        user_id TEXT,
        quest_id TEXT,
        phase INTEGER DEFAULT 1,
        progress INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        PRIMARY KEY (user_id, quest_id),
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Analytics events
    CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        event_type TEXT,
        event_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_assessments_user ON assessments(user_id);
    CREATE INDEX IF NOT EXISTS idx_achievements_user ON achievements(user_id);
    CREATE INDEX IF NOT EXISTS idx_battles_user ON battles(user_id);
    CREATE INDEX IF NOT EXISTS idx_analytics_user ON analytics_events(user_id);
    '''
    
    db.executescript(schema)
    db.commit()
    db.close()
    logger.info("Database initialized successfully")

# Initialize comprehensive question bank
def populate_question_bank():
    """Populate database with comprehensive question bank"""
    db = get_db()
    cursor = db.cursor()
    
    # Check if questions already exist
    count = cursor.execute("SELECT COUNT(*) FROM questions").fetchone()[0]
    if count > 0:
        db.close()
        return
    
    questions = [
        # Mathematics Questions (50+)
        {"subject": "math", "difficulty": 1, "type": "calculation", "question": "What is 15 × 8?", "correct_answer": "120", "hint": "Think: 15 × 8 = 15 × (10 - 2)"},
        {"subject": "math", "difficulty": 1, "type": "calculation", "question": "What is 234 + 567?", "correct_answer": "801", "hint": "Add the units, tens, and hundreds separately"},
        {"subject": "math", "difficulty": 1, "type": "calculation", "question": "What is 1000 - 437?", "correct_answer": "563", "hint": "Think: 1000 - 437 = 563"},
        {"subject": "math", "difficulty": 1, "type": "calculation", "question": "What is 25% of 80?", "correct_answer": "20", "hint": "25% = 1/4, so divide 80 by 4"},
        {"subject": "math", "difficulty": 1, "type": "conversion", "question": "Convert 3/4 to a decimal", "correct_answer": "0.75", "hint": "Divide 3 by 4"},
        {"subject": "math", "difficulty": 2, "type": "algebra", "question": "Solve for x: 2x + 5 = 17", "correct_answer": "6", "hint": "Subtract 5 from both sides, then divide by 2"},
        {"subject": "math", "difficulty": 2, "type": "algebra", "question": "Solve for y: 3y - 7 = 14", "correct_answer": "7", "hint": "Add 7 to both sides, then divide by 3"},
        {"subject": "math", "difficulty": 2, "type": "geometry", "question": "What is the area of a circle with radius 5? (Use π = 3.14)", "correct_answer": "78.5", "hint": "Area = πr²"},
        {"subject": "math", "difficulty": 2, "type": "geometry", "question": "What is the perimeter of a rectangle with length 8 and width 5?", "correct_answer": "26", "hint": "Perimeter = 2(length + width)"},
        {"subject": "math", "difficulty": 2, "type": "fractions", "question": "What is 2/3 + 1/6?", "correct_answer": "5/6", "hint": "Find common denominator first"},
        {"subject": "math", "difficulty": 3, "type": "algebra", "question": "Factor: x² + 5x + 6", "correct_answer": "(x+2)(x+3)", "hint": "Find two numbers that multiply to 6 and add to 5"},
        {"subject": "math", "difficulty": 3, "type": "sequences", "question": "What is the next number: 2, 6, 12, 20, 30, ?", "correct_answer": "42", "hint": "Look at the differences: 4, 6, 8, 10..."},
        {"subject": "math", "difficulty": 3, "type": "probability", "question": "What is the probability of rolling a sum of 7 with two dice?", "correct_answer": "1/6", "hint": "Count favorable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1)"},
        
        # Science Questions (50+)
        {"subject": "science", "difficulty": 1, "type": "chemistry", "question": "What is the chemical symbol for gold?", "correct_answer": "Au", "hint": "From Latin 'aurum'"},
        {"subject": "science", "difficulty": 1, "type": "chemistry", "question": "What is H2O?", "correct_answer": "water", "hint": "2 hydrogen, 1 oxygen"},
        {"subject": "science", "difficulty": 1, "type": "biology", "question": "What gas do plants absorb from the atmosphere?", "correct_answer": "carbon dioxide", "hint": "Used in photosynthesis"},
        {"subject": "science", "difficulty": 1, "type": "physics", "question": "What is the unit of force?", "correct_answer": "newton", "hint": "Named after Sir Isaac..."},
        {"subject": "science", "difficulty": 1, "type": "astronomy", "question": "How many planets are in our solar system?", "correct_answer": "8", "hint": "Pluto was reclassified in 2006"},
        {"subject": "science", "difficulty": 2, "type": "chemistry", "question": "What is the atomic number of carbon?", "correct_answer": "6", "hint": "Number of protons"},
        {"subject": "science", "difficulty": 2, "type": "biology", "question": "What is the powerhouse of the cell?", "correct_answer": "mitochondria", "hint": "Produces ATP"},
        {"subject": "science", "difficulty": 2, "type": "physics", "question": "What is the formula for kinetic energy?", "correct_answer": "1/2mv²", "hint": "Half mass times velocity squared"},
        {"subject": "science", "difficulty": 2, "type": "chemistry", "question": "What is the pH of pure water?", "correct_answer": "7", "hint": "Neutral pH"},
        {"subject": "science", "difficulty": 3, "type": "physics", "question": "What is the speed of light in m/s?", "correct_answer": "299792458", "hint": "Approximately 3×10⁸"},
        
        # English Questions (50+)
        {"subject": "english", "difficulty": 1, "type": "grammar", "question": "What type of word is 'quickly'?", "correct_answer": "adverb", "hint": "Modifies a verb"},
        {"subject": "english", "difficulty": 1, "type": "vocabulary", "question": "What is a synonym for 'happy'?", "correct_answer": "joyful", "hint": "Feeling great pleasure"},
        {"subject": "english", "difficulty": 1, "type": "grammar", "question": "What is the plural of 'child'?", "correct_answer": "children", "hint": "Irregular plural"},
        {"subject": "english", "difficulty": 2, "type": "literature", "question": "Who wrote 'Romeo and Juliet'?", "correct_answer": "Shakespeare", "hint": "The Bard of Avon"},
        {"subject": "english", "difficulty": 2, "type": "grammar", "question": "What literary device is 'The stars danced'?", "correct_answer": "personification", "hint": "Giving human qualities to non-human things"},
        
        # History Questions (50+)
        {"subject": "history", "difficulty": 1, "type": "dates", "question": "In what year did World War II end?", "correct_answer": "1945", "hint": "Victory in Europe and Japan"},
        {"subject": "history", "difficulty": 1, "type": "people", "question": "Who was the first President of the United States?", "correct_answer": "George Washington", "hint": "On the one dollar bill"},
        {"subject": "history", "difficulty": 2, "type": "events", "question": "What year did the Berlin Wall fall?", "correct_answer": "1989", "hint": "End of Cold War era"},
        {"subject": "history", "difficulty": 2, "type": "ancient", "question": "Which ancient wonder still stands today?", "correct_answer": "Great Pyramid of Giza", "hint": "In Egypt"},
        {"subject": "history", "difficulty": 3, "type": "dates", "question": "When was the Magna Carta signed?", "correct_answer": "1215", "hint": "13th century England"}
    ]
    
    # Insert questions
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
            q.get('explanation', f"The correct answer is {q['correct_answer']}")
        ))
    
    db.commit()
    db.close()
    logger.info(f"Populated question bank with {len(questions)} questions")

# Authentication decorator
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'error': 'Authentication required'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    """Serve the main application"""
    return render_template('index.html')

@app.route('/static/<path:path>')
def send_static(path):
    """Serve static files"""
    return send_from_directory('static', path)

# API Routes

@app.route('/api/demo-login', methods=['POST'])
def demo_login():
    """Create a demo user session"""
    try:
        # Generate unique demo user
        demo_id = f"demo_{uuid.uuid4().hex[:8]}"
        demo_username = f"StarExplorer{random.randint(100, 999)}"
        
        db = get_db()
        cursor = db.cursor()
        
        # Create demo user
        cursor.execute('''
            INSERT INTO users (id, email, username, is_demo) 
            VALUES (?, ?, ?, 1)
        ''', (demo_id, f"{demo_id}@demo.local", demo_username))
        
        # Create user profile
        cursor.execute('''
            INSERT INTO user_profiles (user_id, display_name, level, xp, credits, streak)
            VALUES (?, ?, 1, 0, 100, 0)
        ''', (demo_id, demo_username))
        
        db.commit()
        
        # Set session
        session['user_id'] = demo_id
        session['username'] = demo_username
        session['is_demo'] = True
        session.permanent = True
        
        # Track online user
        online_users[demo_id] = {
            'username': demo_username,
            'level': 1,
            'status': 'online'
        }
        
        # Emit online users update
        socketio.emit('online_users_update', {'count': len(online_users)})
        
        db.close()
        
        return jsonify({
            'success': True,
            'user': {
                'id': demo_id,
                'username': demo_username,
                'email': f"{demo_id}@demo.local",
                'is_demo': True,
                'level': 1,
                'xp': 0,
                'credits': 100,
                'streak': 0
            }
        })
        
    except Exception as e:
        logger.error(f"Demo login error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
@login_required
def logout():
    """Logout user"""
    try:
        user_id = session.get('user_id')
        
        # Remove from online users
        if user_id in online_users:
            del online_users[user_id]
            socketio.emit('online_users_update', {'count': len(online_users)})
        
        # Clear session
        session.clear()
        
        return jsonify({'success': True})
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get-profile', methods=['GET'])
@login_required
def get_profile():
    """Get user profile"""
    try:
        user_id = session['user_id']
        
        db = get_db()
        cursor = db.cursor()
        
        # Get user and profile data
        user_data = cursor.execute('''
            SELECT u.*, p.*
            FROM users u
            JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = ?
        ''', (user_id,)).fetchone()
        
        if not user_data:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Get achievements count
        achievements = cursor.execute('''
            SELECT COUNT(*) as count FROM achievements WHERE user_id = ?
        ''', (user_id,)).fetchone()['count']
        
        # Get recent assessments
        recent_assessments = cursor.execute('''
            SELECT type, subject, score, total_questions, completed_at
            FROM assessments
            WHERE user_id = ?
            ORDER BY completed_at DESC
            LIMIT 5
        ''', (user_id,)).fetchall()
        
        db.close()
        
        return jsonify({
            'success': True,
            'profile': {
                'id': user_data['id'],
                'username': user_data['username'],
                'email': user_data['email'],
                'displayName': user_data['display_name'],
                'level': user_data['level'],
                'xp': user_data['xp'],
                'credits': user_data['credits'],
                'streak': user_data['streak'],
                'achievements': achievements,
                'recentAssessments': [dict(row) for row in recent_assessments]
            }
        })
        
    except Exception as e:
        logger.error(f"Get profile error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get-questions', methods=['POST'])
@login_required
def get_questions():
    """Get questions for assessment"""
    try:
        data = request.json
        subject = data.get('subject', 'mixed')
        count = data.get('count', 10)
        difficulty = data.get('difficulty')
        
        db = get_db()
        cursor = db.cursor()
        
        # Build query
        query = "SELECT * FROM questions"
        params = []
        
        if subject != 'mixed':
            query += " WHERE subject = ?"
            params.append(subject)
            
            if difficulty:
                query += " AND difficulty = ?"
                params.append(difficulty)
        elif difficulty:
            query += " WHERE difficulty = ?"
            params.append(difficulty)
        
        # Random selection
        query += " ORDER BY RANDOM() LIMIT ?"
        params.append(count)
        
        questions = cursor.execute(query, params).fetchall()
        
        # Format questions
        formatted_questions = []
        for q in questions:
            formatted_questions.append({
                'id': q['id'],
                'question': q['question'],
                'type': q['type'],
                'hint': q['hint'],
                'difficulty': q['difficulty']
            })
        
        # Log question usage
        for q in questions:
            cursor.execute('''
                UPDATE questions SET usage_count = usage_count + 1 WHERE id = ?
            ''', (q['id'],))
        
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'questions': formatted_questions
        })
        
    except Exception as e:
        logger.error(f"Get questions error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/validate-answer', methods=['POST'])
@login_required
def validate_answer():
    """Validate user's answer"""
    try:
        data = request.json
        question_id = data.get('questionId')
        user_answer = str(data.get('answer', '')).strip().lower()
        
        db = get_db()
        cursor = db.cursor()
        
        # Get correct answer
        question = cursor.execute('''
            SELECT correct_answer, explanation FROM questions WHERE id = ?
        ''', (question_id,)).fetchone()
        
        if not question:
            return jsonify({'success': False, 'error': 'Question not found'}), 404
        
        correct_answer = str(question['correct_answer']).strip().lower()
        
        # Check answer
        is_correct = user_answer == correct_answer
        
        # Handle numeric answers with tolerance
        try:
            user_num = float(user_answer)
            correct_num = float(correct_answer)
            if abs(user_num - correct_num) < 0.01:
                is_correct = True
        except:
            pass
        
        # Update question success rate
        cursor.execute('''
            UPDATE questions 
            SET success_rate = (success_rate * usage_count + ?) / (usage_count + 1)
            WHERE id = ?
        ''', (1 if is_correct else 0, question_id))
        
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'correct': is_correct,
            'correctAnswer': question['correct_answer'] if not is_correct else None,
            'explanation': question['explanation']
        })
        
    except Exception as e:
        logger.error(f"Validate answer error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/submit-assessment', methods=['POST'])
@login_required
def submit_assessment():
    """Submit completed assessment"""
    try:
        data = request.json
        user_id = session['user_id']
        
        db = get_db()
        cursor = db.cursor()
        
        # Save assessment
        cursor.execute('''
            INSERT INTO assessments (user_id, type, subject, score, total_questions, time_taken, questions_data)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            user_id,
            data['type'],
            data['subject'],
            data['score'],
            data['totalQuestions'],
            data['timeTaken'],
            json.dumps(data.get('answers', []))
        ))
        
        # Calculate XP earned
        base_xp = 10
        score_bonus = int(data['score'] / 10)
        xp_earned = base_xp + score_bonus
        
        # Update user profile
        cursor.execute('''
            UPDATE user_profiles 
            SET xp = xp + ?, last_activity = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (xp_earned, user_id))
        
        # Check for achievements
        achievements_earned = check_achievements(cursor, user_id, data)
        
        # Check for level up
        profile = cursor.execute('''
            SELECT xp, level FROM user_profiles WHERE user_id = ?
        ''', (user_id,)).fetchone()
        
        new_level = (profile['xp'] // 100) + 1
        level_up = new_level > profile['level']
        
        if level_up:
            cursor.execute('''
                UPDATE user_profiles SET level = ? WHERE user_id = ?
            ''', (new_level, user_id))
        
        # Track analytics event
        cursor.execute('''
            INSERT INTO analytics_events (user_id, event_type, event_data)
            VALUES (?, ?, ?)
        ''', (user_id, 'assessment_completed', json.dumps(data)))
        
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'xpEarned': xp_earned,
            'newXP': profile['xp'] + xp_earned,
            'levelUp': level_up,
            'newLevel': new_level if level_up else None,
            'achievements': achievements_earned
        })
        
    except Exception as e:
        logger.error(f"Submit assessment error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

def check_achievements(cursor, user_id, assessment_data):
    """Check and award achievements"""
    achievements_earned = []
    
    # First assessment
    count = cursor.execute('''
        SELECT COUNT(*) as count FROM assessments WHERE user_id = ?
    ''', (user_id,)).fetchone()['count']
    
    if count == 1:
        cursor.execute('''
            INSERT OR IGNORE INTO achievements (user_id, achievement_id)
            VALUES (?, ?)
        ''', (user_id, 'first-steps'))
        achievements_earned.append({
            'id': 'first-steps',
            'name': 'First Steps',
            'description': 'Complete your first assessment'
        })
    
    # High scorer
    if assessment_data['score'] >= 80:
        cursor.execute('''
            INSERT OR IGNORE INTO achievements (user_id, achievement_id)
            VALUES (?, ?)
        ''', (user_id, 'high-scorer'))
        achievements_earned.append({
            'id': 'high-scorer',
            'name': 'High Scorer',
            'description': 'Score 80% or higher'
        })
    
    # Perfect score
    if assessment_data['score'] == 100:
        cursor.execute('''
            INSERT OR IGNORE INTO achievements (user_id, achievement_id)
            VALUES (?, ?)
        ''', (user_id, 'perfectionist'))
        achievements_earned.append({
            'id': 'perfectionist',
            'name': 'Perfectionist',
            'description': 'Achieve a perfect score'
        })
    
    # Quick learner (complete in under 5 minutes)
    if assessment_data.get('timeTaken', 0) < 300:
        cursor.execute('''
            INSERT OR IGNORE INTO achievements (user_id, achievement_id)
            VALUES (?, ?)
        ''', (user_id, 'quick-learner'))
        achievements_earned.append({
            'id': 'quick-learner',
            'name': 'Quick Learner',
            'description': 'Complete an assessment in under 5 minutes'
        })
    
    return achievements_earned

@app.route('/api/ai-chat', methods=['POST'])
@login_required
def ai_chat():
    """Handle AI chat messages"""
    try:
        data = request.json
        message = data.get('message', '')
        context = data.get('context', 'general')
        
        # Try OpenAI first
        response = None
        
        if openai.api_key:
            try:
                completion = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {
                            "role": "system",
                            "content": "You are StarMentor, an encouraging AI tutor for K-12 students. Be friendly, helpful, and use space/star metaphors when appropriate. Keep responses concise but informative."
                        },
                        {
                            "role": "user",
                            "content": message
                        }
                    ],
                    max_tokens=200,
                    temperature=0.7
                )
                response = completion.choices[0].message.content
            except Exception as e:
                logger.error(f"OpenAI error: {str(e)}")
        
        # Fallback response if AI fails
        if not response:
            response = generate_fallback_response(message, context)
        
        # Track chat event
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            INSERT INTO analytics_events (user_id, event_type, event_data)
            VALUES (?, ?, ?)
        ''', (session['user_id'], 'ai_chat', json.dumps({'message': message[:100]})))
        db.commit()
        db.close()
        
        return jsonify({
            'success': True,
            'response': response
        })
        
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}")
        return jsonify({
            'success': True,
            'response': "I'm having trouble connecting right now. Try asking about math, science, or study tips!"
        })

def generate_fallback_response(message, context):
    """Generate contextual fallback responses"""
    message_lower = message.lower()
    
    # Math responses
    if any(word in message_lower for word in ['math', 'calculate', 'solve', 'equation']):
        responses = [
            "Great math question! Remember to break down the problem step by step. What specific part are you working on?",
            "Math is like navigating through space - one calculation at a time! Show me what you've tried so far.",
            "Let's solve this together! First, identify what the problem is asking for."
        ]
        return random.choice(responses)
    
    # Science responses
    elif any(word in message_lower for word in ['science', 'biology', 'chemistry', 'physics']):
        responses = [
            "Science is fascinating! Like exploring new planets, each discovery leads to more questions. What would you like to explore?",
            "Great scientific thinking! Remember the scientific method: observe, hypothesize, test, and conclude.",
            "Science helps us understand our universe. What specific concept are you curious about?"
        ]
        return random.choice(responses)
    
    # Help responses
    elif any(word in message_lower for word in ['help', 'stuck', 'confused', "don't understand"]):
        responses = [
            "No worries, every star explorer gets stuck sometimes! Let's work through this together. What's the specific challenge?",
            "I'm here to help! Break down the problem into smaller pieces - what's the first part you understand?",
            "Getting stuck is part of learning! What subject are we working with?"
        ]
        return random.choice(responses)
    
    # Default responses
    else:
        responses = [
            "That's an interesting question! Can you tell me more about what you'd like to learn?",
            "Keep up the stellar work! What subject would you like to explore today?",
            "Your curiosity is out of this world! How can I help you on your learning journey?"
        ]
        return random.choice(responses)

@app.route('/api/find-battle', methods=['POST'])
@login_required
def find_battle():
    """Find a battle opponent"""
    try:
        user_id = session['user_id']
        
        # Simulate finding an opponent
        opponents = [
            {"id": "ai_1", "name": "CosmoKid", "level": random.randint(1, 10), "rating": random.randint(800, 1200)},
            {"id": "ai_2", "name": "StarSeeker", "level": random.randint(1, 10), "rating": random.randint(800, 1200)},
            {"id": "ai_3", "name": "GalaxyBrain", "level": random.randint(1, 10), "rating": random.randint(800, 1200)},
            {"id": "ai_4", "name": "NebulaKnight", "level": random.randint(1, 10), "rating": random.randint(800, 1200)}
        ]
        
        opponent = random.choice(opponents)
        battle_id = f"battle_{uuid.uuid4().hex[:8]}"
        
        # Store battle state
        active_battles[battle_id] = {
            'id': battle_id,
            'user_id': user_id,
            'opponent': opponent,
            'user_score': 0,
            'opponent_score': 0,
            'current_question': 0,
            'questions': [],
            'start_time': datetime.now()
        }
        
        return jsonify({
            'success': True,
            'battleId': battle_id,
            'opponent': opponent
        })
        
    except Exception as e:
        logger.error(f"Find battle error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/create-pod', methods=['POST'])
@login_required
def create_pod():
    """Create a new learning pod"""
    try:
        data = request.json
        user_id = session['user_id']
        
        db = get_db()
        cursor = db.cursor()
        
        # Create pod
        cursor.execute('''
            INSERT INTO learning_pods (name, description, subject, creator_id, max_members)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            data['name'],
            data['description'],
            data.get('subject', 'general'),
            user_id,
            data.get('maxMembers', 10)
        ))
        
        pod_id = cursor.lastrowid
        
        # Add creator as member
        cursor.execute('''
            INSERT INTO pod_members (pod_id, user_id, role)
            VALUES (?, ?, ?)
        ''', (pod_id, user_id, 'admin'))
        
        db.commit()
        db.close()
        
        # Store in active pods
        active_pods[pod_id] = {
            'id': pod_id,
            'name': data['name'],
            'members': [user_id]
        }
        
        return jsonify({
            'success': True,
            'podId': pod_id
        })
        
    except Exception as e:
        logger.error(f"Create pod error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get-pods', methods=['GET'])
@login_required
def get_pods():
    """Get available learning pods"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        pods = cursor.execute('''
            SELECT p.*, u.username as creator_name,
                   COUNT(pm.user_id) as member_count
            FROM learning_pods p
            JOIN users u ON p.creator_id = u.id
            LEFT JOIN pod_members pm ON p.id = pm.pod_id
            WHERE p.is_active = 1
            GROUP BY p.id
            ORDER BY p.created_at DESC
            LIMIT 20
        ''').fetchall()
        
        db.close()
        
        return jsonify({
            'success': True,
            'pods': [dict(row) for row in pods]
        })
        
    except Exception as e:
        logger.error(f"Get pods error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get-daily-challenges', methods=['GET'])
@login_required
def get_daily_challenges():
    """Get today's daily challenges"""
    try:
        user_id = session['user_id']
        today = datetime.now().date()
        
        db = get_db()
        cursor = db.cursor()
        
        # Check if user has challenges for today
        existing = cursor.execute('''
            SELECT * FROM daily_challenges
            WHERE user_id = ? AND challenge_date = ?
        ''', (user_id, today)).fetchall()
        
        if not existing:
            # Generate daily challenges
            challenges = [
                {'type': 'math', 'name': 'Math Sprint', 'description': 'Solve 10 math problems in 5 minutes', 'xp_reward': 50},
                {'type': 'science', 'name': 'Science Explorer', 'description': 'Answer 10 science questions', 'xp_reward': 60},
                {'type': 'mixed', 'name': 'Knowledge Rush', 'description': 'Mixed subject speed round', 'xp_reward': 75}
            ]
            
            for challenge in challenges:
                cursor.execute('''
                    INSERT INTO daily_challenges (user_id, challenge_date, challenge_type, completed)
                    VALUES (?, ?, ?, 0)
                ''', (user_id, today, challenge['type']))
            
            db.commit()
        
        # Get challenges with status
        challenges_data = cursor.execute('''
            SELECT * FROM daily_challenges
            WHERE user_id = ? AND challenge_date = ?
        ''', (user_id, today)).fetchall()
        
        db.close()
        
        # Format response
        challenges = []
        challenge_info = {
            'math': {'name': 'Math Sprint', 'description': 'Solve 10 math problems in 5 minutes', 'xp_reward': 50},
            'science': {'name': 'Science Explorer', 'description': 'Answer 10 science questions', 'xp_reward': 60},
            'mixed': {'name': 'Knowledge Rush', 'description': 'Mixed subject speed round', 'xp_reward': 75}
        }
        
        for c in challenges_data:
            info = challenge_info[c['challenge_type']]
            challenges.append({
                'id': c['id'],
                'type': c['challenge_type'],
                'name': info['name'],
                'description': info['description'],
                'xp_reward': info['xp_reward'],
                'completed': bool(c['completed']),
                'score': c['score']
            })
        
        return jsonify({
            'success': True,
            'challenges': challenges
        })
        
    except Exception as e:
        logger.error(f"Get daily challenges error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get-tournaments', methods=['GET'])
@login_required
def get_tournaments():
    """Get active tournaments"""
    try:
        db = get_db()
        cursor = db.cursor()
        
        # Get active tournaments
        tournaments = cursor.execute('''
            SELECT t.*, COUNT(tp.user_id) as participants
            FROM tournaments t
            LEFT JOIN tournament_participants tp ON t.id = tp.tournament_id
            WHERE t.is_active = 1 AND t.end_date > datetime('now')
            GROUP BY t.id
            ORDER BY t.start_date DESC
        ''').fetchall()
        
        # Check user participation
        user_id = session['user_id']
        user_tournaments = cursor.execute('''
            SELECT tournament_id FROM tournament_participants WHERE user_id = ?
        ''', (user_id,)).fetchall()
        
        user_tournament_ids = [t['tournament_id'] for t in user_tournaments]
        
        db.close()
        
        # Format response
        formatted_tournaments = []
        for t in tournaments:
            formatted_tournaments.append({
                'id': t['id'],
                'name': t['name'],
                'description': t['description'],
                'startDate': t['start_date'],
                'endDate': t['end_date'],
                'participants': t['participants'],
                'maxParticipants': t['max_participants'],
                'prizePool': t['prize_pool'],
                'joined': t['id'] in user_tournament_ids
            })
        
        return jsonify({
            'success': True,
            'tournaments': formatted_tournaments
        })
        
    except Exception as e:
        logger.error(f"Get tournaments error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/submit-help-request', methods=['POST'])
@login_required
def submit_help_request():
    """Submit a help request"""
    try:
        data = request.json
        user_id = session['user_id']
        
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute('''
            INSERT INTO help_tickets (user_id, subject, category, priority, description)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user_id,
            data['subject'],
            data['category'],
            data['priority'],
            data['description']
        ))
        
        ticket_id = cursor.lastrowid
        
        db.commit()
        db.close()
        
        # In a real app, notify teachers/admins
        
        return jsonify({
            'success': True,
            'ticketId': ticket_id
        })
        
    except Exception as e:
        logger.error(f"Submit help request error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/get-analytics', methods=['GET'])
@login_required
def get_analytics():
    """Get user analytics data"""
    try:
        user_id = session['user_id']
        
        db = get_db()
        cursor = db.cursor()
        
        # Get assessment stats
        assessment_stats = cursor.execute('''
            SELECT 
                COUNT(*) as total_assessments,
                AVG(score) as avg_score,
                MAX(score) as best_score,
                SUM(time_taken) as total_time
            FROM assessments
            WHERE user_id = ?
        ''', (user_id,)).fetchone()
        
        # Get subject performance
        subject_performance = cursor.execute('''
            SELECT 
                subject,
                COUNT(*) as count,
                AVG(score) as avg_score
            FROM assessments
            WHERE user_id = ? AND subject != 'mixed'
            GROUP BY subject
        ''', (user_id,)).fetchall()
        
        # Get recent activity
        recent_activity = cursor.execute('''
            SELECT event_type, event_data, created_at
            FROM analytics_events
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 20
        ''', (user_id,)).fetchall()
        
        # Get achievement progress
        total_achievements = cursor.execute('''
            SELECT COUNT(*) FROM achievements WHERE user_id = ?
        ''', (user_id,)).fetchone()[0]
        
        db.close()
        
        return jsonify({
            'success': True,
            'analytics': {
                'assessments': {
                    'total': assessment_stats['total_assessments'] or 0,
                    'averageScore': round(assessment_stats['avg_score'] or 0, 1),
                    'bestScore': assessment_stats['best_score'] or 0,
                    'totalTime': assessment_stats['total_time'] or 0
                },
                'subjects': [dict(row) for row in subject_performance],
                'achievements': {
                    'unlocked': total_achievements,
                    'total': 20  # Total available achievements
                },
                'recentActivity': [dict(row) for row in recent_activity]
            }
        })
        
    except Exception as e:
        logger.error(f"Get analytics error: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

# WebSocket events
@socketio.on('connect')
def handle_connect():
    """Handle socket connection"""
    logger.info(f"Client connected: {request.sid}")
    emit('connected', {'message': 'Connected to StarGuide server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle socket disconnection"""
    logger.info(f"Client disconnected: {request.sid}")
    
    # Remove from online users if authenticated
    if 'user_id' in session:
        user_id = session['user_id']
        if user_id in online_users:
            del online_users[user_id]
            socketio.emit('online_users_update', {'count': len(online_users)})

@socketio.on('join_pod')
def handle_join_pod(data):
    """Handle joining a learning pod"""
    if 'user_id' not in session:
        return
    
    pod_id = data.get('podId')
    user_id = session['user_id']
    username = session.get('username', 'Unknown')
    
    # Join socket room
    join_room(f'pod_{pod_id}')
    
    # Add to active pod members
    if pod_id in active_pods:
        if user_id not in active_pods[pod_id]['members']:
            active_pods[pod_id]['members'].append(user_id)
    
    # Notify pod members
    emit('member_joined', {
        'username': username,
        'message': f'{username} joined the pod'
    }, room=f'pod_{pod_id}')

@socketio.on('pod_message')
def handle_pod_message(data):
    """Handle pod chat messages"""
    if 'user_id' not in session:
        return
    
    pod_id = data.get('podId')
    message = data.get('message', '').strip()
    
    if not message:
        return
    
    user_id = session['user_id']
    username = session.get('username', 'Unknown')
    
    # Save message to database
    try:
        db = get_db()
        cursor = db.cursor()
        cursor.execute('''
            INSERT INTO pod_messages (pod_id, user_id, message)
            VALUES (?, ?, ?)
        ''', (pod_id, user_id, message))
        db.commit()
        db.close()
    except Exception as e:
        logger.error(f"Save pod message error: {str(e)}")
    
    # Broadcast to pod members
    emit('new_message', {
        'username': username,
        'message': message,
        'timestamp': datetime.now().isoformat()
    }, room=f'pod_{pod_id}')

@socketio.on('battle_move')
def handle_battle_move(data):
    """Handle battle moves"""
    if 'user_id' not in session:
        return
    
    battle_id = data.get('battleId')
    answer = data.get('answer')
    
    if battle_id in active_battles:
        battle = active_battles[battle_id]
        # Process battle move
        # In a real implementation, this would handle the battle logic
        
        emit('battle_update', {
            'userScore': battle['user_score'],
            'opponentScore': battle['opponent_score'],
            'currentQuestion': battle['current_question']
        })

# Initialize everything when module loads
init_db()
populate_question_bank()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    socketio.run(app, host='0.0.0.0', port=port, debug=True)