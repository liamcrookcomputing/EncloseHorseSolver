import flask
from flask import render_template, request, jsonify
from solver import solve_map

app = flask.Flask(__name__)

@app.route('/map-painter')
def home():
    return render_template('map_painter.html')

@app.route('/solve', methods=['POST'])
def solve():
    data = request.json

    grid = data["grid"]
    wall_budget = data["wallBudget"]

    result = solve_map(grid, wall_budget)

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)