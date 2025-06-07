from src import create_app

app = create_app()

if __name__ == "__main__":
    # app.run(debug=True)
    app.run(host="127.0.0.1", port=9090, debug=True)

