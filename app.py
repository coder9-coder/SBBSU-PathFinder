
import os
from flask import Flask, jsonify, render_template, request
from dotenv import load_dotenv
from ai_service import generate_explanation, generate_chat_reply
from recommendation import recommend_courses, load_courses
from ai_service import generate_explanation

load_dotenv()

app = Flask(__name__)


@app.get("/")
def home():
    return render_template("index.html")


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "project": "SBBSU PathFinder",
    })


@app.get("/api/catalogue-status")
def catalogue_status():
    try:
        courses = load_courses()

        return jsonify({
            "status": "ok",
            "approved_courses": len(courses),
            "fee_fields_available": all(
                all(
                    field in course
                    for field in (
                        "tuition_fee",
                        "first_semester_fee",
                        "subsequent_semester_fee",
                    )
                )
                for course in courses
            ),
        })

    except (OSError, ValueError):
        app.logger.exception("Course catalogue error")

        return jsonify({
            "error": "The course catalogue could not be loaded.",
        }), 500


@app.post("/api/recommend")
def recommend():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Please submit a valid profile.",
        }), 400

    qualification = str(
        data.get("qualification", "")
    ).strip()

    stream = str(data.get("stream", "")).strip()

    level = str(
        data.get("level", "")
    ).strip().upper()

    interests = data.get("interests", [])
    answers = data.get("answers", {})

    if not qualification:
        return jsonify({
            "error": "Please select your qualification.",
        }), 400

    if not stream:
        return jsonify({
            "error": "Please select your stream.",
        }), 400

    if level not in {"UG", "PG"}:
        return jsonify({
            "error": "Please select a valid study level.",
        }), 400

    if not isinstance(interests, list) or not interests:
        return jsonify({
            "error": "Please select at least one interest.",
        }), 400

    if not all(isinstance(item, str) for item in interests):
        return jsonify({
            "error": "The selected interests are invalid.",
        }), 400

    if not isinstance(answers, dict):
        return jsonify({
            "error": "The submitted answers are invalid.",
        }), 400

    try:
        courses = recommend_courses(
            level=level,
            stream=stream,
            interests=interests,
            qualification=qualification,
            answers=answers,
        )

        explanation = generate_explanation(
            level,
            stream,
            interests,
            courses,
            answers=answers,
        )

        return jsonify({
            "profile": {
                "qualification": qualification,
                "stream": stream,
                "level": level,
                "interests": interests,
            },
            "courses": courses,
            "explanation": explanation,
            "notice": (
                "Fees are transcribed from the supplied SBBSU fee "
                "structure. Please confirm current fees, programme "
                "availability, eligibility and admission requirements "
                "with the university before applying. Semester-wise "
                "subjects are shown only when available in the catalogue."
            ),
        })

    except (OSError, ValueError):
        app.logger.exception("Recommendation request failed")

        return jsonify({
            "error": (
                "Unable to generate recommendations. "
                "Please check the course catalogue and try again."
            ),
        }), 500

@app.post("/api/chat")
def ai_chat():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Please send a valid chat message."}), 400

    message = str(data.get("message", "")).strip()

    if not message:
        return jsonify({"error": "Please enter a message."}), 400

    if len(message) > 2000:
        return jsonify({"error": "Message is too long. Please keep it under 2000 characters."}), 400

    profile = data.get("profile", {})
    history = data.get("history", [])

    if not isinstance(profile, dict):
        profile = {}

    if not isinstance(history, list):
        history = []

    try:
        courses = load_courses()

        reply = generate_chat_reply(
            message=message,
            profile=profile,
            courses=courses,
            history=history,
        )

        return jsonify({"reply": reply})

    except (OSError, ValueError):
        app.logger.exception("AI chat request failed")
        return jsonify({
            "error": "The course catalogue is temporarily unavailable."
        }), 500
if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=int(os.getenv("PORT", "5000")),
        debug=os.getenv("FLASK_DEBUG", "false").lower() == "true",
    )
