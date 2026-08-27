import flask

app = flask.Flask(__name__)

@app.route('/hello')
def home():
    return "Hello World"

@app.route('/echo', methods=['POST'])
def echo():
    data = flask.request.get_json()
    return flask.jsonify(data)

if __name__ == '__main__':
    app.run(debug=True)