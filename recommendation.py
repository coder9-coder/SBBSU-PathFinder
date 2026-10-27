
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_FILE = BASE_DIR / "data" / "courses.json"
COSTS_FILE = BASE_DIR / "data" / "costs.json"

REQUIRED_FIELDS = (
    "id",
    "name",
    "level",
    "institute",
    "duration_display",
    "eligibility_display",
    "interests",
    "status",
)

FEE_FIELDS = (
    "tuition_fee",
    "first_semester_fee",
    "subsequent_semester_fee",
)

INTEREST_ALIASES = {
    "finance and accounting": "finance",
    "accounting": "finance",
    "financial services": "finance",
    "commerce": "finance",
    "computer": "technology",
    "computers": "technology",
    "computer science": "technology",
    "information technology": "technology",
    "artificial intelligence": "ai",
    "machine learning": "ai",
    "medical": "healthcare",
    "biology": "science",
    "research": "science",
    "farming": "agriculture",
    "law and legal studies": "law",
    "arts": "design",
    "creative": "design",
}


def normalize(value):
    value = str(value or "").strip().casefold()
    return " ".join(value.replace("_", " ").split())


def normalize_interest(value):
    normalized = normalize(value)
    return INTEREST_ALIASES.get(normalized, normalized)


def load_costs():
    if not COSTS_FILE.exists():
        raise OSError("Fee catalogue is missing: data/costs.json")

    with COSTS_FILE.open("r", encoding="utf-8") as file:
        records = json.load(file)

    if not isinstance(records, list):
        raise ValueError("data/costs.json must contain a JSON list.")

    costs = {}

    for item in records:
        if not isinstance(item, dict):
            continue

        course_id = str(item.get("course_id", "")).strip()

        if not course_id or course_id in costs:
            continue

        costs[course_id] = {
            field: item.get(field)
            if isinstance(item.get(field), (int, float))
            and not isinstance(item.get(field), bool)
            else None
            for field in FEE_FIELDS
        }

    return costs


def load_courses():
    if not DATA_FILE.exists():
        raise OSError("Course catalogue is missing: data/courses.json")

    with DATA_FILE.open("r", encoding="utf-8") as file:
        courses = json.load(file)

    if not isinstance(courses, list):
        raise ValueError("data/courses.json must contain a JSON list.")

    costs = load_costs()
    approved = []
    seen_ids = set()

    for course in courses:
        if not isinstance(course, dict):
            continue

        if course.get("status") != "approved":
            continue

        if not all(
            course.get(field) not in (None, "")
            for field in REQUIRED_FIELDS
        ):
            continue

        if course.get("level") not in {"UG", "PG"}:
            continue

        course_id = str(course.get("id", "")).strip()

        if not course_id or course_id in seen_ids:
            continue

        if not isinstance(course.get("interests"), list):
            continue

        record = dict(course)
        record["id"] = course_id

        record["interests"] = [
            normalize_interest(item)
            for item in course["interests"]
            if str(item).strip()
        ]

        fee_record = costs.get(course_id, {})

        for field in FEE_FIELDS:
            record[field] = fee_record.get(field)

        if any(record[field] is None for field in FEE_FIELDS):
            record["fee_display"] = (
                "Some fee details are unavailable; "
                "confirm with the university."
            )
        else:
            record["fee_display"] = (
                f"Tuition fee: ₹{record['tuition_fee']:,.0f}; "
                f"first semester: ₹{record['first_semester_fee']:,.0f}; "
                f"subsequent semesters: "
                f"₹{record['subsequent_semester_fee']:,.0f}"
            )

        semesters = record.get("semester_structure", [])

        if not isinstance(semesters, list):
            record["semester_structure"] = []

        seen_ids.add(course_id)
        approved.append(record)

    return approved


def recommend_courses(
    level,
    stream,
    interests,
    qualification=None,
    answers=None,
):
    requested_level = normalize(level).upper()
    requested_stream = normalize(stream)
    requested_qualification = normalize(qualification)

    if requested_level not in {"UG", "PG"}:
        raise ValueError("Select a valid study level: UG or PG.")

    if not isinstance(interests, list):
        raise ValueError("Interests must be a list.")

    requested_interests = {
        normalize_interest(item)
        for item in interests
        if str(item).strip()
    }

    if not requested_interests:
        return []

    matches = []

    for course in load_courses():
        if course["level"] != requested_level:
            continue

        allowed_streams = course.get("streams", [])

        if allowed_streams and requested_stream:
            normalized_streams = {
                normalize(item) for item in allowed_streams
            }

            if requested_stream not in normalized_streams:
                continue

        allowed_qualifications = course.get(
            "allowed_qualifications", []
        )

        if allowed_qualifications and requested_qualification:
            normalized_qualifications = {
                normalize(item) for item in allowed_qualifications
            }

            if requested_qualification not in normalized_qualifications:
                continue

        course_interests = {
            normalize_interest(item)
            for item in course.get("interests", [])
        }

        matched_interests = requested_interests & course_interests

        if not matched_interests:
            continue

        score = round(
            len(matched_interests) / len(requested_interests) * 100
        )

        result = dict(course)
        result["matched_interests"] = sorted(matched_interests)
        result["score"] = score
        result["match_score"] = score

        result["match_reason"] = (
            "Matches your interests in "
            + ", ".join(sorted(matched_interests))
            + "."
        )

        result["selected_qualification"] = qualification or ""
        result["selected_stream"] = stream or ""
        result["selected_interests"] = sorted(requested_interests)

        matches.append(result)

    matches.sort(
        key=lambda item: (
            -item["score"],
            item["name"].casefold(),
        )
    )

    return matches
