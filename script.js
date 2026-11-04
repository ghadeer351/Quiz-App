// =================================
// 1. DOM ELEMENTS
const UI = {
    timer: document.querySelector("#timer"),
    progressText: document.querySelector("#progress-text"),
    questionCount: document.querySelector("#question-count"),
    progressBar: document.querySelector("#progress-bar"),
    quizQuestion: document.querySelector("#quiz-question"),
    optionsContainer: document.querySelector("#options-container"),
    nextButton: document.querySelector("#next-btn"),
    score: document.querySelector("#score"),
    correctAnswers: document.querySelector("#correct-answers"),
    incorrectAnswers: document.querySelector("#incorrect-answers"),
    resultCard: document.querySelector(".result-card"),
    restartButton: document.querySelector("#restart-btn"),
    startButton: document.querySelector("#start-btn"),
    startScreen: document.querySelector("#start-screen"),
    quizScreen: document.querySelector("#quiz-screen"),
    resultScreen: document.querySelector("#result-screen"),
    testTime: document.querySelector("#test-time"),
    questionNumber: document.querySelector("#question-number"),
    answerError: document.querySelector("#answer-error"),
    decreaseTimeButton: document.querySelector("#decrease-time"),
    increaseTimeButton: document.querySelector("#increase-time"),
    decreaseQuestionsButton: document.querySelector("#decrease-questions"),
    increaseQuestionsButton: document.querySelector("#increase-questions"),
    difficultyOptions: document.querySelector("#difficulty-options"),
};
// =================================


// =================================
// 1. CONFIGURATION
const config = {
    apiUrl: "https://opentdb.com/api.php",
    difficulties: ["easy", "medium", "hard"],
    initialQuestionCount: 10,
    maxQuestionCount: 20,
    initialQuizDuration: 300,
    minQuizDuration: 60,
    maxQuizDuration: 1200,
    quizDurationStep: 60
};

// 2. APPLICATION STATE
const state = {
    questions: [],
    userAnswers: [],
    currentQuestionIndex: 0,
    questionCount: config.initialQuestionCount,
    quizDuration: config.initialQuizDuration,
    timeRemaining: config.initialQuizDuration,
    selectedDifficulty: "medium",
    isQuizActive: false,
    isLoading: false,
    timerId: null
};

// 0. DATA PREPARATION
function shuffleArray(array) {
    const shuffled = [...array];

    for (let i = shuffled.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [shuffled[i], shuffled[randomIndex]] =
            [shuffled[randomIndex], shuffled[i]];
    }

    return shuffled;
}

function prepareQuestions(questions) {
    return questions.map(question => {
        const correctAnswer = decodeURIComponent(question.correct_answer);

        const incorrectAnswers = question.incorrect_answers.map(answer =>
            decodeURIComponent(answer)
        );

        const allAnswers = [
            correctAnswer,
            ...incorrectAnswers
        ];

        if (new Set(allAnswers).size !== allAnswers.length) {
            throw new Error("The API returned duplicate answers for a question.");
        }

        const answers = shuffleArray(allAnswers);

        return {
            category: question.category,
            type: question.type,
            difficulty: question.difficulty,
            question: decodeURIComponent(question.question),
            correctAnswer,
            incorrectAnswers,
            answers
        };
    });
}
// =================================
// 4. API FUNCTIONS

function buildApiUrl() {
    const url = new URL(config.apiUrl);

    url.searchParams.set("amount", state.questionCount);
    url.searchParams.set("type", "multiple");
    url.searchParams.set("difficulty", state.selectedDifficulty);
    url.searchParams.set("encode", "url3986");

    return url.toString();
}
async function getQuestions() {
    // 1. Send HTTP Request
    const response = await fetch(buildApiUrl());

    // 2. Check HTTP Status
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }

    // 3. Parse JSON Response
    const data = await response.json();

    // 4. Check API Response
    if (!data || typeof data !== "object") {
        throw new Error("Invalid API Response: Expected a JSON object.");
    }

    if (data.response_code !== 0) {
        const apiErrors = {
            1: "The API returned fewer questions than requested for the selected settings.",
            2: "The API request contains an invalid parameter.",
            3: "The API session token was not found.",
            4: "The API session token has no questions remaining.",
            5: "The API rate limit was exceeded."
        };
        throw new Error(
            apiErrors[data.response_code] ||
            `API Error: ${data.response_code}`
        );
    }

    // 5. Validate Questions Data
    if (!Array.isArray(data.results)) {
        throw new Error("Invalid API Response: Results must be an array");
    }

    if (data.results.length !== state.questionCount) {
        throw new Error(
            `Expected ${state.questionCount} questions, received ${data.results.length}`
        );
    }

    const invalidQuestion = data.results.some(question =>
        !question ||
        typeof question.question !== "string" ||
        question.question.trim() === "" ||
        typeof question.correct_answer !== "string" ||
        question.correct_answer.trim() === "" ||
        !Array.isArray(question.incorrect_answers) ||
        question.incorrect_answers.length !== 3 ||
        question.incorrect_answers.some(
            answer => typeof answer !== "string" || answer.trim() === ""
        ) ||
        question.type !== "multiple" ||
        question.difficulty !== state.selectedDifficulty
    );

    if (invalidQuestion) {
        throw new Error(
            "The API returned invalid questions or questions that do not match the selected settings."
        );
    }

    // 6. Return Questions
    return data.results;
}
// =================================


// =================================
// 5. UI FUNCTIONS

function showScreen(screen) {
    UI.startScreen.hidden = true;
    UI.quizScreen.hidden = true;
    UI.resultScreen.hidden = true;

    screen.hidden = false;
}

function renderOptions() {
    const currentQuestion =
        state.questions[state.currentQuestionIndex];

    UI.optionsContainer.replaceChildren();

    currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");

        button.classList.add("option");
        button.type = "button";
        button.textContent = answer;
        UI.optionsContainer.appendChild(button);
    });
}

function renderQuestion() {
    const currentQuestion =
        state.questions[state.currentQuestionIndex];

    UI.quizQuestion.textContent = currentQuestion.question;

    renderOptions();
    updateProgress();
    updateQuestionCount();
}

function updateProgress() {
    const totalQuestions = state.questions.length;
    const answeredQuestions =
        state.userAnswers.filter(answer => answer !== null).length;
    const progress = totalQuestions === 0
        ? 0
        : Math.round((answeredQuestions / totalQuestions) * 100);

    UI.progressText.textContent = `${progress}%`;
    UI.progressBar.value = progress;
}

function updateQuestionCount() {
    const current = state.currentQuestionIndex + 1;
    const total = state.questions.length;

    UI.questionCount.textContent =
        `Question ${current} of ${total}`;
}

function selectAnswer(answer, button) {
    if (
        !state.isQuizActive ||
        !button ||
        button.disabled ||
        !UI.optionsContainer.contains(button)
    ) return;

    UI.answerError.hidden = true;
    const currentIndex = state.currentQuestionIndex;

    if (state.userAnswers[currentIndex] !== null) return;

    state.userAnswers[currentIndex] = answer;

    const optionButtons =
        UI.optionsContainer.querySelectorAll(".option");

    const currentQuestion = state.questions[currentIndex];
    optionButtons.forEach(option => {
        option.disabled = true;

        if (option.textContent === currentQuestion.correctAnswer) {
            option.classList.add("correct-answer");
        }
    });

    if (answer === currentQuestion.correctAnswer) {
        button.classList.add("correct-answer");
    } else {
        button.classList.add("incorrect-answer");
    }

    updateProgress();
}

function renderResult(result) {
    UI.score.textContent = `${result.percentage}%`;

    UI.correctAnswers.textContent = result.correct;

    UI.incorrectAnswers.textContent = result.incorrect;

    UI.resultCard.classList.remove(
        "result-poor",
        "result-medium",
        "result-excellent"
    );

    if (result.percentage <= 30) {
    UI.resultCard.classList.add("result-poor");
} else if (result.percentage <= 70) {
    UI.resultCard.classList.add("result-medium");
} else {
    UI.resultCard.classList.add("result-excellent");
}
}

function updateSetupControls() {
    const timeInMinutes = state.quizDuration / 60;

    UI.testTime.textContent = `${timeInMinutes} min`;
    UI.questionNumber.textContent =
        `${state.questionCount} ${state.questionCount === 1 ? "question" : "questions"}`;

    UI.decreaseTimeButton.disabled =
        state.isLoading || state.quizDuration <= config.minQuizDuration;
    UI.increaseTimeButton.disabled =
        state.isLoading || state.quizDuration >= config.maxQuizDuration;
    UI.decreaseQuestionsButton.disabled =
        state.isLoading || state.questionCount <= 1;
    UI.increaseQuestionsButton.disabled =
        state.isLoading || state.questionCount >= config.maxQuestionCount;
}

function changeQuestionCount(change) {
    if (state.isLoading) return;

    state.questionCount = Math.min(
        config.maxQuestionCount,
        Math.max(1, state.questionCount + change)
    );
    updateSetupControls();
}

function changeQuizDuration(change) {
    if (state.isLoading) return;

    state.quizDuration = Math.min(
        config.maxQuizDuration,
        Math.max(
            config.minQuizDuration,
            state.quizDuration + change * config.quizDurationStep
        )
    );
    updateSetupControls();
}

function updateDifficultySelection() {
    UI.difficultyOptions.querySelectorAll("[data-difficulty]").forEach(button => {
        const isSelected = button.dataset.difficulty === state.selectedDifficulty;

        button.classList.toggle("is-selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
        button.disabled = state.isLoading;
    });
}

// =================================


// =================================
// 6. QUIZ LOGIC
async function startQuiz() {
    if (state.isQuizActive || state.isLoading) return;

    state.isLoading = true;
    UI.startButton.disabled = true;
    UI.startButton.textContent = "Loading...";
    UI.startButton.setAttribute("aria-busy", "true");
    updateSetupControls();
    updateDifficultySelection();

    try {
        const rawQuestions = await getQuestions();
        const questions = prepareQuestions(rawQuestions);

        state.questions = questions;
        state.userAnswers =
            new Array(state.questions.length).fill(null);
        state.currentQuestionIndex = 0;
        state.timeRemaining = state.quizDuration;

        UI.answerError.hidden = true;

        showScreen(UI.quizScreen);
        renderQuestion();
        state.isQuizActive = true;
        startTimer();
    } catch (error) {
        resetQuizState();
        showScreen(UI.startScreen);
        console.error("Failed to start quiz:", error);
        alert(`Failed to load questions: ${error.message}`);
    } finally {
        state.isLoading = false;
        UI.startButton.disabled = false;
        UI.startButton.textContent = "Start Quiz";
        UI.startButton.setAttribute("aria-busy", "false");
        updateSetupControls();
        updateDifficultySelection();
    }
}

function nextQuestion() {
    if (!state.isQuizActive) return;

    const currentIndex = state.currentQuestionIndex;

    if (state.userAnswers[currentIndex] === null) {
        UI.answerError.hidden = false;
        return;
    }

    UI.answerError.hidden = true;

    if (currentIndex === state.questions.length - 1) {
        finishQuiz();
        return;
    }

    state.currentQuestionIndex++;

    renderQuestion();
}

function calculateResult() {
    const total = state.questions.length;

    const correct = state.questions.reduce((count, question, index) => {
        return count + (
            state.userAnswers[index] === question.correctAnswer ? 1 : 0
        );
    }, 0);

    const incorrect = total - correct;

    return {
        total,
        correct,
        incorrect,
        percentage: total === 0
            ? 0
            : Math.round((correct / total) * 100)
    };
}

function finishQuiz() {
    if (!state.isQuizActive) return;

    state.isQuizActive = false;

    stopTimer();

    const result = calculateResult();

    renderResult(result);

    showScreen(UI.resultScreen);
}

// =================================


// =================================
// 7. TIMER
function updateTimerDisplay() {
    const minutes = Math.floor(state.timeRemaining / 60);
    const seconds = state.timeRemaining % 60;

    UI.timer.textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function tickTimer() {
    if (!state.isQuizActive) return;

    state.timeRemaining--;

    updateTimerDisplay();

    if (state.timeRemaining <= 0) {
        state.timeRemaining = 0;
        updateTimerDisplay();

        finishQuiz();
    }
}

function stopTimer() {
    clearInterval(state.timerId);

    state.timerId = null;
}

function startTimer() {
    stopTimer();

    updateTimerDisplay();

    state.timerId = setInterval(tickTimer, 1000);
}

// =================================
// 8. EVENT LISTENERS
function initializeApp() {
    UI.startButton.addEventListener("click", startQuiz);
    UI.difficultyOptions.addEventListener("click", event => {
        const button = event.target.closest("[data-difficulty]");

        if (
            state.isLoading ||
            !button ||
            !UI.difficultyOptions.contains(button) ||
            !config.difficulties.includes(button.dataset.difficulty)
        ) {
            return;
        }

        state.selectedDifficulty = button.dataset.difficulty;
        updateDifficultySelection();
    });
    UI.decreaseTimeButton.addEventListener("click", () => changeQuizDuration(-1));
    UI.increaseTimeButton.addEventListener("click", () => changeQuizDuration(1));
    UI.decreaseQuestionsButton.addEventListener("click", () => changeQuestionCount(-1));
    UI.increaseQuestionsButton.addEventListener("click", () => changeQuestionCount(1));

    UI.nextButton.addEventListener("click", nextQuestion);

    UI.restartButton.addEventListener("click", restartQuiz);

    UI.optionsContainer.addEventListener("click", event => {
        const button = event.target.closest(".option");

        if (!button || !UI.optionsContainer.contains(button)) return;

        selectAnswer(button.textContent, button);
    });

    updateTimerDisplay();
    updateSetupControls();
    updateDifficultySelection();

    showScreen(UI.startScreen);
}
// =================================
// 9. INITIALIZATION
function restartQuiz() {
    resetQuizState();

    showScreen(UI.startScreen);
} 

function resetQuizState() {
    stopTimer();

    state.questions = [];
    state.userAnswers = [];
    state.currentQuestionIndex = 0;
    state.timeRemaining = state.quizDuration;
    state.isQuizActive = false;
    state.isLoading = false;

    UI.optionsContainer.replaceChildren();
    UI.quizQuestion.textContent = "";
    UI.answerError.hidden = true;
    UI.questionCount.textContent = `Question 1 of ${state.questionCount}`;
    UI.progressText.textContent = "0%";
    UI.progressBar.value = 0;
    UI.resultCard.classList.remove(
        "result-poor",
        "result-medium",
        "result-excellent"
    );
    UI.score.textContent = "0%";
    UI.correctAnswers.textContent = "0";
    UI.incorrectAnswers.textContent = "0";

    updateTimerDisplay();
    updateProgress();
    updateSetupControls();
    updateDifficultySelection();
}

document.addEventListener("DOMContentLoaded", initializeApp, { once: true });