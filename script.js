/* ===================================================
   Smart Virtual Coding & MCQ Simulator Core Logic
   =================================================== */

// 1. Core Question Bank: 3 Conceptual MCQs and 2 Coding Questions
const questions = [
    {
        type: "mcq",
        category: "Conceptual MCQ",
        question: "Which of the following is used to declare a block-scoped variable in JavaScript?",
        options: ["var", "let", "both var and let", "none of the above"],
        answer: "let"
    },
    {
        type: "mcq",
        category: "Conceptual MCQ",
        question: "What is the primary purpose of HTML in web development?",
        options: ["To style the webpage", "To add interactive behavior", "To structure the webpage content", "To manage database records"],
        answer: "To structure the webpage content"
    },
    {
        type: "mcq",
        category: "Conceptual MCQ",
        question: "Which array method is used to add an element to the end of an array in JavaScript?",
        options: ["pop()", "push()", "shift()", "unshift()"],
        answer: "push()"
    },
    {
        type: "code",
        category: "Coding Question",
        question: "Write a JavaScript function isPalindrome(str) that checks if a string is a palindrome (reads the same forwards and backwards).",
        placeholder: "function isPalindrome(str) {\n    // Write your code here to return true or false\n    \n}",
        keywords: ["split", "reverse", "join", "for", "while"],
        solution: "function isPalindrome(str) {\n    return str == str.split('').reverse().join('');\n}"
    },
    {
        type: "code",
        category: "Coding Question",
        question: "Write a JavaScript function findMax(arr) to find and return the maximum number in an array.",
        placeholder: "function findMax(arr) {\n    // Write your code here to return the maximum number\n    \n}",
        keywords: ["max", "for", "if", "while", "Math"],
        solution: "function findMax(arr) {\n    let max = arr[0];\n    for (let i = 1; i < arr.length; i++) {\n        if (arr[i] > max) max = arr[i];\n    }\n    return max;\n}"
    }
];

// 2. Active Session State
let currentQuestion = 0;
let score = 0;
let timer = 60;
let timerDuration = 60; // Set dynamically per question
let timerInterval;
let answersLog = [];

// Session Details
let candidateName = "";
let targetCompany = "";
let targetRole = "";
let difficultyLevel = "";
let rawDifficulty = "medium"; // 'low', 'medium', or 'high'

// Start Interview: Performs input validation and initiates sequence
function startInterview() {
    candidateName = document.getElementById("username").value.trim();
    targetCompany = document.getElementById("companyName").value.trim();
    targetRole = document.getElementById("roleName").value.trim();
    let levelSelect = document.getElementById("levelSelect");
    
    if (candidateName === "" || targetCompany === "" || targetRole === "") {
        alert("Please fill all mandatory fields (Name, Company, and Role).");
        return;
    }

    rawDifficulty = levelSelect.value;
    difficultyLevel = levelSelect.options[levelSelect.selectedIndex].text;

    // Reset session variables
    currentQuestion = 0;
    score = 0;
    answersLog = [];

    // Render Target header Details
    document.getElementById("targetDetails").innerText = `Applying for ${targetRole} at ${targetCompany}`;

    // Toggle DOM panels
    document.getElementById("startBox").style.display = "none";
    document.getElementById("interviewBox").style.display = "block";

    loadQuestion();
}

// Load Question: Renders next category, question, inputs, and configures timings
function loadQuestion() {
    if (currentQuestion >= questions.length) {
        showResult();
        return;
    }

    let activeQ = questions[currentQuestion];
    document.getElementById("category").innerText = activeQ.category + ` (${currentQuestion + 1}/${questions.length})`;
    document.getElementById("question").innerText = activeQ.question;

    // Configure specific timings dynamically based on Question Type and Difficulty Level (Concept: Multi-branch loops)
    if (activeQ.type === "mcq") {
        if (rawDifficulty === "low") {
            timerDuration = 30; // Junior gets 30s MCQ
        } else if (rawDifficulty === "high") {
            timerDuration = 10; // Senior gets 10s MCQ
        } else {
            timerDuration = 20; // Mid-Level gets 20s MCQ (as requested!)
        }
    } else {
        if (rawDifficulty === "low") {
            timerDuration = 90; // Junior gets 90s Coding
        } else if (rawDifficulty === "high") {
            timerDuration = 30; // Senior gets 30s Coding
        } else {
            timerDuration = 60; // Mid-Level gets 60s/1m Coding (as requested!)
        }
    }

    // Reset and toggle input panels based on question type
    if (activeQ.type === "mcq") {
        document.getElementById("codeContainer").style.display = "none";
        let mcqContainer = document.getElementById("mcqContainer");
        mcqContainer.style.display = "block";
        mcqContainer.innerHTML = "";

        // Dynamically create option elements
        activeQ.options.forEach((opt, idx) => {
            let label = document.createElement("label");
            label.className = "mcq-option";
            label.innerHTML = `
                <input type="radio" name="mcqOption" value="${opt}" ${idx === 0 ? 'checked' : ''}>
                <span>${opt}</span>
            `;
            mcqContainer.appendChild(label);
        });
    } else {
        document.getElementById("mcqContainer").style.display = "none";
        let codeContainer = document.getElementById("codeContainer");
        codeContainer.style.display = "block";
        document.getElementById("codeAnswer").value = activeQ.placeholder;
    }

    startTimer();
}

// Timer Loop: Decrements timer and auto-submits on timeout
function startTimer() {
    timer = timerDuration;
    document.getElementById("timer").innerText = timer;
    clearInterval(timerInterval);

    timerInterval = setInterval(function () {
        timer--;
        document.getElementById("timer").innerText = timer;

        if (timer <= 0) {
            clearInterval(timerInterval);
            nextQuestion();
        }
    }, 1000);
}

// Submit Response: Scores answer, logs review parameters, and increments index
function nextQuestion() {
    clearInterval(timerInterval);

    let activeQ = questions[currentQuestion];
    let userAnswer = "";
    let isCorrect = false;

    if (activeQ.type === "mcq") {
        let selectedOption = document.querySelector('input[name="mcqOption"]:checked');
        userAnswer = selectedOption ? selectedOption.value : "No Option Selected (Timeout)";
        isCorrect = (userAnswer === activeQ.answer);
    } else {
        userAnswer = document.getElementById("codeAnswer").value.trim();
        let lowercaseCode = userAnswer.toLowerCase();
        
        // Simple and robust syntax validation
        if (userAnswer !== "" && userAnswer !== activeQ.placeholder.trim()) {
            isCorrect = activeQ.keywords.some(word => lowercaseCode.includes(word.toLowerCase()));
        } else {
            userAnswer = "No Code Written (Timeout)";
        }
    }

    // Scoring: 20 points per question (5 questions * 20 = 100 points maximum)
    let questionScore = isCorrect ? 20 : 0;
    score += questionScore;

    // Log data for later dynamic dashboard creation
    answersLog.push({
        type: activeQ.type,
        question: activeQ.question,
        answer: userAnswer,
        score: questionScore,
        correct: isCorrect,
        expected: activeQ.type === "mcq" ? activeQ.answer : activeQ.solution
    });

    currentQuestion++;
    loadQuestion();
}

// Show Result Dashboard: Dynamically creates DOM scorecard reviews
function showResult() {
    document.getElementById("interviewBox").style.display = "none";
    document.getElementById("resultBox").style.display = "block";

    // Populates realistic candidate parameters
    document.getElementById("finalName").innerText = "Candidate: " + candidateName;
    document.getElementById("finalCompany").innerText = "Target Company: " + targetCompany;
    document.getElementById("finalRole").innerText = "Target Role: " + targetRole;
    document.getElementById("finalLevel").innerText = "Difficulty Level: " + difficultyLevel;
    document.getElementById("finalScore").innerText = `Score: ${score} / 100`;

    // Perform scorecard grading logic
    let performance = "Need Improvement";
    if (score >= 80) performance = "Excellent Performance";
    else if (score >= 60) performance = "Good Performance";
    
    document.getElementById("performance").innerText = "Performance: " + performance;

    // Dynamically render review cards (Concept: dynamic innerHTML creation)
    let reviewList = document.getElementById("reviewList");
    reviewList.innerHTML = "";

    answersLog.forEach((log) => {
        let card = document.createElement("div");
        card.className = "review-card";

        let detailsHTML = "";
        if (log.type === "mcq") {
            detailsHTML = `
                <p><b>Your Selected Option:</b> ${log.answer}</p>
                <p><b>Correct Option:</b> ${log.expected}</p>
            `;
        } else {
            detailsHTML = `
                <p><b>Your Code:</b></p>
                <pre><code>${log.answer.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
                <p><b>Sample Solution:</b></p>
                <pre><code>${log.expected}</code></pre>
            `;
        }

        card.innerHTML = `
            <h4>Q: ${log.question}</h4>
            ${detailsHTML}
            <p><b>Score:</b> ${log.score} / 20 pts (${log.correct ? 'Correct' : 'Incorrect'})</p>
            <button class="delete-btn">Delete Card</button>
        `;
        reviewList.appendChild(card);
    });
}

// EVENT DELEGATION: Listens to the parent container for clicks and deletes target card
document.getElementById("reviewList").addEventListener("click", function (event) {
    if (event.target.classList.contains("delete-btn")) {
        let card = event.target.parentElement;
        card.remove();
    }
});

// Download Transcript: Creates a text blob and saves report
function downloadReport() {
    let data = `Coding & MCQ Assessment - Transcript Report\n`;
    data += `==============================================\n`;
    data += `Candidate Name  : ${candidateName}\n`;
    data += `Target Company  : ${targetCompany}\n`;
    data += `Target Role     : ${targetRole}\n`;
    data += `Difficulty Level: ${difficultyLevel}\n`;
    data += `Total Score     : ${score} / 100\n`;
    data += `Generated At    : ${new Date().toLocaleString()}\n\n`;

    // Extract current review items from DOM
    let cards = document.querySelectorAll(".review-card");
    if (cards.length === 0) {
        data += "No review cards available.";
    } else {
        cards.forEach((card, index) => {
            let q = card.querySelector("h4").innerText;
            data += `${index + 1}. ${q}\n`;
            
            let pTags = card.querySelectorAll("p");
            let preTags = card.querySelectorAll("pre");
            
            if (preTags.length > 0) {
                // Formatting for coding answers
                data += `   Your Code:\n   ${preTags[0].innerText.replace(/\n/g, "\n   ")}\n`;
                data += `   Sample Solution:\n   ${preTags[1].innerText.replace(/\n/g, "\n   ")}\n`;
                data += `   Score: ${pTags[pTags.length - 1].innerText}\n`;
            } else {
                // Formatting for MCQs
                pTags.forEach(p => {
                    data += `   ${p.innerText}\n`;
                });
            }
            data += `----------------------------------------------\n`;
        });
    }

    let blob = new Blob([data], { type: "text/plain" });
    let a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${candidateName.replace(/\s+/g, "_")}_Interview_Report.txt`;
    a.click();
}

// Restart Reset
function restartInterview() {
    document.getElementById("resultBox").style.display = "none";
    document.getElementById("startBox").style.display = "block";
    document.getElementById("username").value = "";
    document.getElementById("companyName").value = "";
    document.getElementById("roleName").value = "";
    document.getElementById("levelSelect").value = "medium";
}