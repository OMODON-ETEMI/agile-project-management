import os
from package import app

if __name__ == "__main__":
    debug_mode = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    app.run(host="0.0.0.0", debug=debug_mode, port=5000)
