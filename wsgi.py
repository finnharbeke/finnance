from finnance import app
if __name__ == "__main__":
    if input("running without docker? y/[n]") == 'y':
        app.run(port=5050)