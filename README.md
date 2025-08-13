# Live DDoS Attack Map

A real-time DDoS attack visualization map showing Layer 7 attacks across countries. The map displays animated arcs representing attacks, with glowing dots traveling along curved paths.

## Features

- Real-time simulation of attacks.
- Randomized attack origin, target, and magnitude.
- Animated arcs with moving dots to represent attack traffic.
- Glow and pulse effects for better 3D appearance.
- Supports multiple countries with dynamic animations.
- Frontend served directly from FastAPI.

## Requirements

- Python 3.10+
- Packages listed in `requirements.txt`.

## Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd <repository-folder>

    Create a virtual environment (recommended):

python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows

    Install required Python modules:

pip install -r requirements.txt

    Set your Cloudflare API token (optional if you want real attack data):

export CLOUDFLARE_API_TOKEN="your_token_here"   # Linux/macOS
set CLOUDFLARE_API_TOKEN=your_token_here        # Windows

Running the Project

Start the FastAPI backend:

uvicorn main:app --reload

The frontend will now be served directly at http://127.0.0.1:8000/. Open this URL in your browser to view the live map.
Project Structure

.
├── backend/
│   └── fetch.py          # Fetches attacks from Cloudflare or generates mock data
├── main.py               # FastAPI server
├── static/
│   ├── index.html        # Frontend HTML
│   ├── style.css         # CSS for map and animations
│   └── script.js         # Frontend JavaScript for map animation
├── requirements.txt      # Python dependencies
└── README.md

Dependencies

Python packages:

    fastapi

    httpx

    apscheduler

    uvicorn

    python-dotenv (optional, if using .env files for API token)

Frontend libraries (included via CDN):

    Leaflet.js

    Leaflet.curve plugin

Notes

    The animation generates random attacks every few seconds while letting old attacks finish.

    You can adjust refreshAttacks interval or animation duration in static/script.js for smoother effects.

    For real attack data, ensure the Cloudflare API token is valid and fetch function is enabled.

    Save the File: Save the file with the name README.md in your project directory.

📄 Step 2: Create the requirements.txt File

    Open a Text Editor: Use the same text editor.

    Copy the Content Below:

    fastapi==0.114.0
    httpx==1.8.6
    apscheduler==3.12.1
    uvicorn==0.25.0
    python-dotenv==1.0.0

    Save the File: Save the file with the name requirements.txt in your project directory.

📦 Step 3: Create the ZIP Archive

    Prepare the Folder Structure:

        Ensure your project directory contains the following files:

            README.md

            requirements.txt

            main.py

            backend/fetch.py

            static/index.html

            static/style.css

            static/script.js

    Compress the Directory:

        Windows:

            Right-click the project folder.

            Select Send to > Compressed (zipped) folder.

            Name the ZIP file (e.g., ddos-map.zip).

        macOS:

            Right-click the project folder.

            Select Compress "folder name".

            A ZIP file will be created in the same location.

        Linux:

            Open a terminal.

            Navigate to the parent directory of your project folder.

            Run the command:

            zip -r ddos-map.zip ddos-map/

            This will create a ddos-map.zip file in the current directory.

Once you've completed these steps, you'll have a ZIP file (ddos-map.zip) containing all the necessary files for your project. You can now share or deploy this ZIP as needed.
You said:
i have the working project just put all the informstion for the readme.md on a copiable window
ChatGPT said:

Absolutely! Here's a full, ready-to-copy README.md for your project:

# Live DDoS Attack Map

A real-time DDoS attack visualization map showing Layer 7 attacks across countries. The map displays animated arcs representing attacks, with glowing dots traveling along curved paths.

## Features

- Real-time simulation of attacks.
- Randomized attack origin, target, and magnitude.
- Animated arcs with moving dots to represent attack traffic.
- Glow and pulse effects for better 3D appearance.
- Supports multiple countries with dynamic animations.
- Frontend served directly from FastAPI.

## Requirements

- Python 3.10+
- Packages listed in `requirements.txt`.

## Installation

1. Clone this repository:

```bash
git clone <repository-url>
cd <repository-folder>

    Create a virtual environment (recommended):

python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows

    Install required Python modules:

pip install -r requirements.txt

    Set your Cloudflare API token (optional if you want real attack data):

export CLOUDFLARE_API_TOKEN="your_token_here"   # Linux/macOS
set CLOUDFLARE_API_TOKEN=your_token_here        # Windows

Running the Project

Start the FastAPI backend:

uvicorn main:app --reload

The frontend will now be served directly at http://127.0.0.1:8000/. Open this URL in your browser to view the live map.
Project Structure

.
├── backend/
│   └── fetch.py          # Fetches attacks from Cloudflare or generates mock data
├── main.py               # FastAPI server
├── static/
│   ├── index.html        # Frontend HTML
│   ├── style.css         # CSS for map and animations
│   └── script.js         # Frontend JavaScript for map animation
├── requirements.txt      # Python dependencies
└── README.md

Dependencies

Python packages:

    fastapi

    httpx

    apscheduler

    uvicorn

    python-dotenv (optional, if using .env files for API token)

Frontend libraries (included via CDN):

    Leaflet.js

    Leaflet.curve plugin

Notes

    The animation generates random attacks every few seconds while letting old attacks finish.

    You can adjust refreshAttacks interval or animation duration in static/script.js for smoother effects.

    For real attack data, ensure the Cloudflare API token is valid and fetch function is enabled.
