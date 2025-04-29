# Project: Faculty Feedback System
# Backend: Flask
# Frontend: HTML + TailwindCSS
# Database: SQLite

from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# Database setup
def init_db():
    if not os.path.exists('database.db'):
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute('''CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, year TEXT, branch TEXT)''')
        c.execute('''CREATE TABLE faculty (id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, password TEXT, years TEXT, branches TEXT, subjects TEXT)''')
        c.execute('''CREATE TABLE feedback (id INTEGER PRIMARY KEY, student_id INTEGER, faculty_id INTEGER, year TEXT, branch TEXT, subject TEXT, feedback_text TEXT)''')
        conn.commit()
        conn.close()

init_db()

# Routes

@app.route('/')
def index():
    return render_template('landing.html')

@app.route('/register_student', methods=['GET', 'POST'])
def register_student():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = generate_password_hash(request.form['password'])
        year = request.form['year']
        branch = request.form['branch']
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        try:
            c.execute('INSERT INTO students (name, email, password, year, branch) VALUES (?, ?, ?, ?, ?)', (name, email, password, year, branch))
            conn.commit()
            flash('Student registered successfully!', 'success')
        except sqlite3.IntegrityError:
            flash('Email already exists.', 'error')
        conn.close()
        return redirect(url_for('login'))
    return render_template('register_student.html')

@app.route('/register_faculty', methods=['GET', 'POST'])
def register_faculty():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = generate_password_hash(request.form['password'])
        years = request.form['years']
        branches = request.form['branches']
        subjects = request.form['subjects']
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        try:
            c.execute('INSERT INTO faculty (name, email, password, years, branches, subjects) VALUES (?, ?, ?, ?, ?, ?)', (name, email, password, years, branches, subjects))
            conn.commit()
            flash('Faculty registered successfully!', 'success')
        except sqlite3.IntegrityError:
            flash('Email already exists.', 'error')
        conn.close()
        return redirect(url_for('login'))
    return render_template('register_faculty.html')

@app.route('/api/faculty/<int:faculty_id>/subjects')
def get_faculty_subjects(faculty_id):
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT subjects FROM faculty WHERE id = ?', (faculty_id,))
    result = c.fetchone()
    conn.close()
    
    if result:
        subjects = [s.strip() for s in result[0].split(',')]
        return jsonify({'subjects': subjects})
    return jsonify({'subjects': []})

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        if email == 'srinukaranam2104@gmail.com' and password == '216T1A0524':
            session['user'] = 'admin'
            return redirect(url_for('dashboard_admin'))
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute('SELECT * FROM students WHERE email = ?', (email,))
        student = c.fetchone()
        c.execute('SELECT * FROM faculty WHERE email = ?', (email,))
        faculty = c.fetchone()
        conn.close()
        if student and check_password_hash(student[3], password):
            session['user'] = 'student'
            session['user_id'] = student[0]
            return redirect(url_for('dashboard_student'))
        elif faculty and check_password_hash(faculty[3], password):
            session['user'] = 'faculty'
            session['user_id'] = faculty[0]
            return redirect(url_for('dashboard_faculty'))
        else:
            flash('Invalid credentials', 'error')
    return render_template('login.html')

@app.route('/dashboard_student', methods=['GET', 'POST'])
def dashboard_student():
    if 'user' not in session or session['user'] != 'student':
        return redirect(url_for('login'))
    if request.method == 'POST':
        faculty_id = request.form['faculty_id']
        year = request.form['year']
        branch = request.form['branch']
        subject = request.form['subject']
        feedback_text = request.form['feedback']
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        c.execute('INSERT INTO feedback (student_id, faculty_id, year, branch, subject, feedback_text) VALUES (?, ?, ?, ?, ?, ?)', (session['user_id'], faculty_id, year, branch, subject, feedback_text))
        conn.commit()
        conn.close()
        flash('Feedback submitted successfully!', 'success')
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT id, name FROM faculty')
    faculties = c.fetchall()
    conn.close()
    return render_template('dashboard_student.html', faculties=faculties)

@app.route('/dashboard_faculty', methods=['GET', 'POST'])
def dashboard_faculty():
    if 'user' not in session or session['user'] != 'faculty':
        return redirect(url_for('login'))
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT year, branch, subject, feedback_text FROM feedback WHERE faculty_id = ?', (session['user_id'],))
    feedbacks = c.fetchall()
    conn.close()
    return render_template('dashboard_faculty.html', feedbacks=feedbacks)

@app.route('/dashboard_admin')
def dashboard_admin():
    if 'user' not in session or session['user'] != 'admin':
        return redirect(url_for('login'))
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT id, name, email FROM faculty')
    faculties = c.fetchall()
    conn.close()
    return render_template('dashboard_admin.html', faculties=faculties)

@app.route('/admin/view_feedback/<int:faculty_id>')
def view_faculty_feedback(faculty_id):
    if 'user' not in session or session['user'] != 'admin':
        return redirect(url_for('login'))
    
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    c.execute('SELECT year, branch, subject, feedback_text FROM feedback WHERE faculty_id = ?', (faculty_id,))
    feedbacks = c.fetchall()
    
    # Get faculty name for the page title
    c.execute('SELECT name FROM faculty WHERE id = ?', (faculty_id,))
    faculty_name = c.fetchone()[0]
    conn.close()
    
    return render_template('view_faculty_feedback.html', feedbacks=feedbacks, faculty_name=faculty_name)

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 10000))  # Use Render's $PORT or fallback to 10000
    app.run(host='0.0.0.0', port=port)