# Quizfy — Interactive Quiz App

Quizfy is a browser-based multiple-choice quiz application built with HTML, CSS, and vanilla JavaScript. Users can choose a difficulty, configure the number of questions and quiz duration, and answer questions retrieved from the Open Trivia Database.

## Features

### Quiz setup
- Choose between Easy, Medium, and Hard difficulty levels.
- Set the number of questions (1–20).
- Set the quiz duration (1–20 minutes).

### During the quiz
- Fetch multiple-choice questions from the Open Trivia Database.
- Shuffle answer options for each question.
- Display the current question number and completion progress.
- Select one answer per question.
- Show correct and incorrect answer feedback after selection.
- Require an answer before moving to the next question.
- Run a countdown timer and finish automatically when time expires.

### Results
- Calculate the final score and percentage.
- Display correct and incorrect answer totals.
- Change the result card presentation based on the score.
- Restart the quiz and return to the setup screen.

## Built With

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Fetch API, async/await, and URL API
- DOM manipulation and event delegation
- [Open Trivia Database API](https://opentdb.com/api_config.php)

## How It Works

1. The user selects the difficulty, question count, and time limit.
2. The app builds an API request using the selected settings.
3. It validates the API response and checks that the returned questions match the requested configuration.
4. The question data is prepared, answer options are shuffled, and the quiz begins.
5. User answers and the timer are tracked in application state.
6. At the end of the quiz, the app calculates and displays the result.

The app requests multiple-choice questions and uses URL encoding supported by the API. An internet connection is required to load questions.

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/ghadeer351/Quiz-App.git
   ```

2. Open the project folder in your code editor.
3. Open `index.html` in a browser, or run it with a local development server.
4. Choose the quiz settings and select **Start Quiz**.

No API key is required for the Open Trivia Database endpoint used by this project.

## Project Structure

```text
Quiz-App/
├── index.html   # Setup, quiz, and result screens
├── style.css    # Layout and visual styling
├── script.js    # API handling, quiz state, timer, and rendering
└── README.md
```

## JavaScript Concepts Practiced

- Fetching data from an external API.
- Asynchronous JavaScript with `async/await`.
- Managing application state with objects and arrays.
- Transforming and validating API data.
- Array methods such as `map()`, `filter()`, and `reduce()`.
- DOM rendering and event delegation.
- Timer management with `setInterval()` and `clearInterval()`.
- Handling loading states and API errors.

## Current Scope

Quizfy currently uses questions from the Open Trivia Database. It does not include user accounts, saved quiz history, a backend, or a database.

## Author

**Ghadeer Debo** · [GitHub Profile](https://github.com/ghadeer351)
