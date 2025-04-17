from flask import Flask, render_template, request, jsonify, send_from_directory
import os
from flask import Flask
from flask_cors import CORS

app = Flask(__name__, static_folder="preload")
CORS(app)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/rankings')
def rankings():
    return render_template('rankings.html')

@app.route('/teamUpload')
def teamUpload():
    return render_template('teamUpload.html')

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)



if __name__ == '__main__':
    app.run(debug=True)