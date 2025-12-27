from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

DATABASE = os.path.join(os.path.dirname(__file__), 'todos.db')


def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db() as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS todos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()


@app.route('/api/todos', methods=['GET'])
def get_todos():
    with get_db() as conn:
        cursor = conn.execute('SELECT * FROM todos ORDER BY created_at DESC')
        todos = [dict(row) for row in cursor.fetchall()]
    return jsonify(todos)


@app.route('/api/todos', methods=['POST'])
def create_todo():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400

    with get_db() as conn:
        cursor = conn.execute(
            'INSERT INTO todos (title, completed) VALUES (?, ?)',
            (data['title'], False)
        )
        conn.commit()
        todo_id = cursor.lastrowid
        cursor = conn.execute('SELECT * FROM todos WHERE id = ?', (todo_id,))
        todo = dict(cursor.fetchone())

    return jsonify(todo), 201


@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.get_json()

    with get_db() as conn:
        cursor = conn.execute('SELECT * FROM todos WHERE id = ?', (todo_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Todo not found'}), 404

        updates = []
        values = []

        if 'title' in data:
            updates.append('title = ?')
            values.append(data['title'])
        if 'completed' in data:
            updates.append('completed = ?')
            values.append(data['completed'])

        if updates:
            values.append(todo_id)
            conn.execute(
                f'UPDATE todos SET {", ".join(updates)} WHERE id = ?',
                values
            )
            conn.commit()

        cursor = conn.execute('SELECT * FROM todos WHERE id = ?', (todo_id,))
        todo = dict(cursor.fetchone())

    return jsonify(todo)


@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    with get_db() as conn:
        cursor = conn.execute('SELECT * FROM todos WHERE id = ?', (todo_id,))
        if not cursor.fetchone():
            return jsonify({'error': 'Todo not found'}), 404

        conn.execute('DELETE FROM todos WHERE id = ?', (todo_id,))
        conn.commit()

    return jsonify({'message': 'Todo deleted'}), 200


if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
