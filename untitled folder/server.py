from flask import Flask, send_from_directory, jsonify
import os

app = Flask(__name__, static_folder=".", template_folder=".")

@app.route("/")
def index():
    return send_from_directory(".", "index.html")

@app.route("/<path:path>")
def static_files(path):
    return send_from_directory(".", path)

@app.route("/api/banker", methods=["POST"])
def banker():
    return jsonify({
        "status": "SAFE",
        "message": "System is in safe state"
    })

@app.route("/api/deadlock", methods=["POST"])
def deadlock():
    return jsonify({
        "deadlock": False,
        "message": "No deadlock detected"
    })

if __name__ == "__main__":
    app.run(debug=True)
