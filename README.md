
# SBBSU PathFinder

Interest-based course discovery for undergraduate and postgraduate students.

## Features

- Dark, responsive user interface
- UG and PG selection
- Interest-based course matching
- Separate JSON course catalogue
- Optional server-side Gemini API explanation
- Graceful handling of missing AI service
- Flask backend and REST API
- GitHub and Render deployment structure

## Project layout

- app.py: Flask application
- recommendation.py: course matching
- ai_service.py: optional AI explanation
- data/courses.json: approved course catalogue
- templates/index.html: website structure
- static/style.css: styling
- static/script.js: frontend behaviour

## Run locally on Windows

Create a virtual environment:

    py -m venv .venv

Activate it in PowerShell:

    .\.venv\Scripts\Activate.ps1

Install packages:

    python -m pip install -r requirements.txt

Create your local .env file and start the app:

    python app.py

Open http://127.0.0.1:5000

## Official data policy

Add course records only after their official information has
been confirmed. Do not invent fees, eligibility or duration.

## Production deployment

Use a production WSGI server such as Gunicorn. Store secrets
in the hosting provider's environment settings. Never commit
.env or API keys.
