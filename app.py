from flask import Flask, render_template, request, jsonify, send_from_directory
import os

app = Flask(__name__, static_folder="preload")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/rankings')
def rankings():
    return render_template('rankings.html')

@app.route('/matchSet')
def setup():
    return render_template('matchSet.html')

@app.route('/teamUpload')
def teamUpload():
    return render_template('teamUpload.html')

@app.route('/analysis')
def analysis():
    return render_template('analysis.html')

@app.route('/static/<path:path>')
def send_static(path):
    return send_from_directory('static', path)

@app.route('/preload/<path:filename>')
def serve_preload(filename):
    return send_from_directory('preload', filename)


if __name__ == '__main__':
    app.run(debug=True)