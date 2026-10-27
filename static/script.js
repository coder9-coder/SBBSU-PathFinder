
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("profileForm");
    const steps = Array.from(document.querySelectorAll(".wizard-step"));
    const nextButton = document.getElementById("nextButton");
    const backButton = document.getElementById("backButton");
    const submitButton = document.getElementById("submitButton");
    const stepLabel = document.getElementById("stepLabel");
    const stepTitle = document.getElementById("stepTitle");
    const progressBar = document.getElementById("progressBar");
    const errorMessage = document.getElementById("errorMessage");
    const questionContainer = document.getElementById("questionContainer");
    const profileSummary = document.getElementById("profileSummary");
    const resultsSection = document.getElementById("resultsSection");
    const courseResults = document.getElementById("courseResults");
    const aiExplanation = document.getElementById("aiExplanation");
    const resultCount = document.getElementById("resultCount");
    const demoNotice = document.getElementById("demoNotice");

    if (!form || steps.length !== 4) {
        console.error("The profile wizard could not be initialized.");
        return;
    }

    let currentStep = 0;

    const stepTitles = [
        "Your qualification",
        "Your interests",
        "Your preferences",
        "Review your profile"
    ];

    const interestQuestions = {
        technology: [{
            key: "technology_area",
            title: "Which technology area interests you most?",
            options: [
                ["software", "Software development"],
                ["computers", "Computer hardware and networks"],
                ["cybersecurity", "Cybersecurity"],
                ["unsure", "Not sure yet"]
            ]
        }],
        ai: [{
            key: "ai_area",
            title: "Which AI area interests you?",
            options: [
                ["machine_learning", "AI and machine learning"],
                ["data", "Data science and analytics"],
                ["robotics", "Robotics and intelligent systems"],
                ["unsure", "Not sure yet"]
            ]
        }],
        business: [{
            key: "business_area",
            title: "Which business area interests you?",
            options: [
                ["management", "Management and leadership"],
                ["entrepreneurship", "Entrepreneurship"],
                ["marketing", "Marketing"],
                ["unsure", "Not sure yet"]
            ]
        }],
        finance: [{
            key: "finance_area",
            title: "Which finance area interests you?",
            options: [
                ["accounting", "Accounting"],
                ["banking", "Banking and finance"],
                ["commerce", "Commerce"],
                ["unsure", "Not sure yet"]
            ]
        }],
        healthcare: [{
            key: "healthcare_area",
            title: "Which healthcare area interests you?",
            options: [
                ["laboratory", "Medical laboratory"],
                ["imaging", "Medical imaging"],
                ["patient_care", "Patient care"],
                ["unsure", "Not sure yet"]
            ]
        }],
        science: [{
            key: "science_area",
            title: "Which science area interests you?",
            options: [
                ["life_sciences", "Life sciences"],
                ["physical_sciences", "Physical sciences"],
                ["research", "Scientific research"],
                ["unsure", "Not sure yet"]
            ]
        }],
        agriculture: [{
            key: "agriculture_area",
            title: "Which agriculture area interests you?",
            options: [
                ["crop_science", "Crop science and agronomy"],
                ["horticulture", "Horticulture"],
                ["food_science", "Food science"],
                ["unsure", "Not sure yet"]
            ]
        }],
        law: [{
            key: "law_area",
            title: "Which law area interests you?",
            options: [
                ["legal_practice", "Legal practice"],
                ["corporate_law", "Corporate law"],
                ["public_service", "Public service"],
                ["unsure", "Not sure yet"]
            ]
        }],
        design: [{
            key: "design_area",
            title: "Which design area interests you?",
            options: [
                ["fashion", "Fashion design"],
                ["animation", "Animation and multimedia"],
                ["visual_design", "Visual design"],
                ["unsure", "Not sure yet"]
            ]
        }],
        humanities: [{
            key: "humanities_area",
            title: "Which humanities area interests you?",
            options: [
                ["languages", "Languages and literature"],
                ["history", "History and culture"],
                ["social_sciences", "Social sciences"],
                ["unsure", "Not sure yet"]
            ]
        }],
        education: [{
            key: "education_area",
            title: "Which education area interests you?",
            options: [
                ["teaching", "Teaching"],
                ["educational_leadership", "Educational leadership"],
                ["physical_education", "Physical education"],
                ["unsure", "Not sure yet"]
            ]
        }],
        sports: [{
            key: "sports_area",
            title: "Which sports area interests you?",
            options: [
                ["sports_training", "Sports training"],
                ["fitness", "Fitness and wellness"],
                ["physical_education", "Physical education"],
                ["unsure", "Not sure yet"]
            ]
        }]
    };

    function showError(message) {
        errorMessage.textContent = message || "";
    }

    function selectedInterests() {
        return Array.from(
            form.querySelectorAll(
                '.interest-grid input[type="checkbox"]:checked'
            )
        ).map(input => input.value);
    }

    function getFieldValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : "";
    }

    function showStep(index) {
        currentStep = Math.max(0, Math.min(index, steps.length - 1));

        steps.forEach((step, i) => {
            step.hidden = i !== currentStep;
        });

        stepLabel.textContent = `STEP ${currentStep + 1} OF ${steps.length}`;
        stepTitle.textContent = stepTitles[currentStep];
        progressBar.style.width =
            `${((currentStep + 1) / steps.length) * 100}%`;

        backButton.hidden = currentStep === 0;
        nextButton.hidden = currentStep === steps.length - 1;
        submitButton.hidden = currentStep !== steps.length - 1;

        showError("");

        if (currentStep === 3) {
            updateProfileSummary();
        }
    }

    function validateStep(index) {
        if (index === 0) {
            if (!getFieldValue("qualification")) {
                showError("Please select your current qualification.");
                return false;
            }

            if (!getFieldValue("stream")) {
                showError("Please select your stream.");
                return false;
            }

            if (!getFieldValue("level")) {
                showError("Please select the course level.");
                return false;
            }

            const marks = getFieldValue("marks");

            if (marks !== "") {
                const percentage = Number(marks);

                if (
                    !Number.isFinite(percentage) ||
                    percentage < 0 ||
                    percentage > 100
                ) {
                    showError("Enter a percentage between 0 and 100.");
                    return false;
                }
            }
        }

        if (index === 1 && selectedInterests().length === 0) {
            showError("Please select at least one interest.");
            return false;
        }

        return true;
    }

    function renderQuestions() {
        const interests = selectedInterests();
        questionContainer.replaceChildren();

        interests.forEach(interest => {
            const questions = interestQuestions[interest] || [];

            questions.forEach(question => {
                const group = document.createElement("div");
                group.className = "field-group";

                const label = document.createElement("label");
                label.textContent = question.title;
                label.htmlFor = question.key;

                const select = document.createElement("select");
                select.id = question.key;
                select.dataset.answerKey = question.key;

                const placeholder = document.createElement("option");
                placeholder.value = "";
                placeholder.textContent = "Choose an option";
                select.appendChild(placeholder);

                question.options.forEach(([value, text]) => {
                    const option = document.createElement("option");
                    option.value = value;
                    option.textContent = text;
                    select.appendChild(option);
                });

                group.append(label, select);
                questionContainer.appendChild(group);
            });
        });

        if (interests.length === 0) {
            const message = document.createElement("p");
            message.className = "field-help";
            message.textContent =
                "Select at least one interest in the previous step.";
            questionContainer.appendChild(message);
        }
    }

    function collectAnswers() {
        const answers = {};

        questionContainer.querySelectorAll("[data-answer-key]").forEach(
            element => {
                if (element.value) {
                    answers[element.dataset.answerKey] = element.value;
                }
            }
        );

        return answers;
    }

    function updateProfileSummary() {
        const details = [
            ["Qualification", getFieldValue("qualification")],
            ["Stream", getFieldValue("stream")],
            ["Study level", getFieldValue("level")],
            ["Percentage", getFieldValue("marks") || "Not provided"],
            ["Interests", selectedInterests().join(", ")]
        ];

        profileSummary.replaceChildren();

        details.forEach(([labelText, value]) => {
            const paragraph = document.createElement("p");
            const label = document.createElement("strong");

            label.textContent = `${labelText}: `;
            paragraph.append(label, document.createTextNode(value));
            profileSummary.appendChild(paragraph);
        });

        Object.entries(collectAnswers()).forEach(([key, value]) => {
            const paragraph = document.createElement("p");
            const label = document.createElement("strong");

            label.textContent = `${key.replace(/_/g, " ")}: `;
            paragraph.append(label, document.createTextNode(value));
            profileSummary.appendChild(paragraph);
        });
    }

    function createElement(tag, className, text) {
        const element = document.createElement(tag);

        if (className) {
            element.className = className;
        }

        if (text !== undefined) {
            element.textContent = text;
        }

        return element;
    }

    function renderCourses(courses) {
        courseResults.replaceChildren();

        if (!Array.isArray(courses) || courses.length === 0) {
            courseResults.appendChild(
                createElement(
                    "p",
                    "empty-state",
                    "No matching courses were found. Try changing your study level or interests."
                )
            );
            return;
        }

        courses.forEach(course => {
            const card = createElement("article", "course-card");

            const title = createElement(
                "h3",
                "",
                course.name || course.course_name || course.title || "Course"
            );

            card.appendChild(title);

            // Display only a score supplied by the backend.
            const rawScore =
                course.match_score ??
                course.matchScore ??
                course.score;

            if (
                rawScore !== undefined &&
                rawScore !== null &&
                rawScore !== "" &&
                Number.isFinite(Number(rawScore))
            ) {
                const score = Number(rawScore);

                if (score >= 0 && score <= 100) {
                    const scoreBadge = createElement(
                        "p",
                        "match-score",
                        `✦ ${score}% Match`
                    );

                    card.appendChild(scoreBadge);
                }
            }

            // Prefer a specific recommendation reason over a generic description.
            const reason =
                course.match_reason ||
                course.reason ||
                course.description;

            if (reason) {
                card.appendChild(
                    createElement("h4", "", "Why this course?")
                );

                card.appendChild(
                    createElement("p", "course-reason", reason)
                );
            }

            if (course.duration) {
                card.appendChild(
                    createElement("p", "", `Duration: ${course.duration}`)
                );
            }

            if (course.eligibility) {
                card.appendChild(
                    createElement("p", "", `Eligibility: ${course.eligibility}`)
                );
            }

            const feeFields = [
                ["Tuition Fee", "tuition_fee"],
                ["1st Semester Fee", "first_semester_fee"],
                ["2nd Semester Onwards Fee", "subsequent_semester_fee"]
            ];

            const hasFees = feeFields.some(([label, key]) =>
                course[key] !== undefined &&
                course[key] !== null &&
                course[key] !== ""
            );

            if (hasFees) {
                card.appendChild(
                    createElement("h4", "", "Fee Structure")
                );

                feeFields.forEach(([label, key]) => {
                    const value = course[key];

                    if (
                        value !== undefined &&
                        value !== null &&
                        value !== ""
                    ) {
                        const numericValue = Number(value);

                        const formattedValue = Number.isFinite(numericValue)
                            ? numericValue.toLocaleString("en-IN")
                            : String(value);

                        card.appendChild(
                            createElement(
                                "p",
                                "",
                                `${label}: ₹${formattedValue}`
                            )
                        );
                    }
                });
            }

            const subjects = course.semester_structure;

            if (Array.isArray(subjects) && subjects.length > 0) {
                card.appendChild(
                    createElement("h4", "", "Semester-wise Subjects")
                );

                subjects.forEach(semester => {
                    card.appendChild(
                        createElement(
                            "p",
                            "",
                            semester.semester
                                ? `Semester ${semester.semester}`
                                : "Semester"
                        )
                    );

                    if (Array.isArray(semester.subjects)) {
                        card.appendChild(
                            createElement(
                                "p",
                                "",
                                semester.subjects.join(", ")
                            )
                        );
                    }
                });
            }

            courseResults.appendChild(card);
        });
    }

    nextButton.addEventListener("click", () => {
        if (!validateStep(currentStep)) {
            return;
        }

        if (currentStep === 1) {
            renderQuestions();
        }

        if (currentStep === 2) {
            updateProfileSummary();
        }

        showStep(currentStep + 1);
    });

    backButton.addEventListener("click", () => {
        showStep(currentStep - 1);
    });

    form.querySelectorAll(
        '.interest-grid input[type="checkbox"]'
    ).forEach(input => {
        input.addEventListener("change", () => {
            showError("");
        });
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();
        showError("");

        if (currentStep !== 3) {
            return;
        }

        if (!validateStep(0) || !validateStep(1)) {
            return;
        }

        const payload = {
            qualification: getFieldValue("qualification"),
            stream: getFieldValue("stream"),
            level: getFieldValue("level"),
            interests: selectedInterests(),
            answers: collectAnswers()
        };

        submitButton.disabled = true;
        submitButton.textContent = "Finding matches...";
        resultsSection.hidden = true;

        try {
            const response = await fetch("/api/recommend", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to generate recommendations."
                );
            }

            resultCount.textContent =
                `${Array.isArray(data.courses) ? data.courses.length : 0} matches`;

            aiExplanation.textContent = data.explanation || "";
            aiExplanation.hidden = !data.explanation;

            demoNotice.textContent = data.notice || "";

            renderCourses(data.courses || []);

            resultsSection.hidden = false;
            resultsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        } catch (error) {
            showError(
                error.message ||
                "A connection error occurred. Please try again."
            );
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = "Find my matches ✦";
        }
    });

    showStep(0);
});


/* ===== SBBSU PATHFINDER AI CHAT ===== */

(() => {
    const toggle = document.getElementById("chatToggle");
    const panel = document.getElementById("aiChatPanel");
    const close = document.getElementById("chatClose");
    const form = document.getElementById("chatForm");
    const input = document.getElementById("chatInput");
    const send = document.getElementById("chatSend");
    const messages = document.getElementById("chatMessages");

    if (!toggle || !panel || !form || !input || !messages || !send) {
        return;
    }

    let chatHistory = [];
    let busy = false;

    function openChat() {
        panel.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        input.focus();
    }

    function closeChat() {
        panel.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
    }

    toggle.addEventListener("click", () => {
        if (panel.hidden) {
            openChat();
        } else {
            closeChat();
        }
    });

    close?.addEventListener("click", closeChat);

    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && !panel.hidden) {
            closeChat();
        }
    });

    function addMessage(text, type) {
        const bubble = document.createElement("div");
        bubble.className = `chat-bubble ${type}`;
        bubble.textContent = text;
        messages.appendChild(bubble);
        messages.scrollTop = messages.scrollHeight;
        return bubble;
    }

    function getStudentProfile() {
        const qualification =
            document.getElementById("qualification")?.value || "";

        const stream =
            document.getElementById("stream")?.value || "";

        const level =
            document.getElementById("level")?.value || "";

        const interests = Array.from(
            document.querySelectorAll(
                '#profileForm input[type="checkbox"]:checked'
            )
        ).map(item => item.value);

        const answers = {};

        document.querySelectorAll(
            "#questionContainer input:checked, " +
            "#questionContainer select, " +
            "#questionContainer textarea"
        ).forEach(element => {
            if (element.name) {
                if (element.type === "checkbox") {
                    if (!Array.isArray(answers[element.name])) {
                        answers[element.name] = [];
                    }

                    answers[element.name].push(element.value);
                } else {
                    answers[element.name] = element.value;
                }
            }
        });

        return {
            qualification,
            stream,
            level,
            interests,
            answers
        };
    }

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const message = input.value.trim();

        if (!message || busy) {
            return;
        }

        if (message.length > 2000) {
            addMessage(
                "Please keep your message under 2000 characters.",
                "bot"
            );
            return;
        }

        busy = true;
        send.disabled = true;
        input.disabled = true;

        addMessage(message, "user");
        input.value = "";

        const typing = addMessage("Thinking...", "bot typing");

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    message,
                    profile: getStudentProfile(),
                    history: chatHistory.slice(-8)
                })
            });

            const data = await response.json();
            typing.remove();

            if (!response.ok) {
                throw new Error(
                    data.error || "The chat service is unavailable."
                );
            }

            const reply = data.reply || "Please try asking again.";

            addMessage(reply, "bot");

            chatHistory.push(
                { role: "user", content: message },
                { role: "model", content: reply }
            );

            chatHistory = chatHistory.slice(-8);
        } catch (error) {
            typing.remove();

            addMessage(
                error.message ||
                "Unable to connect. Please try again.",
                "bot"
            );
        } finally {
            busy = false;
            send.disabled = false;
            input.disabled = false;
            input.focus();
        }
    });
})();
