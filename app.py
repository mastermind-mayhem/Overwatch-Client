from flask import Flask, render_template, request, jsonify, send_from_directory
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/rankings')
def rankings():
    return render_template('rankings.html')

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(debug=True)