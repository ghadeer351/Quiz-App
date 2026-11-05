# Quizfy — Interactive Quiz App

Quizfy is a browser-based quiz application built with HTML, CSS, and vanilla JavaScript. It retrieves multiple-choice questions from the Open Trivia Database and lets users configure a timed quiz before starting.

## Features

- Choose a difficulty: Easy, Medium, or Hard
- Configure the number of questions
- Configure the quiz duration
- Fetch multiple-choice questions from the Open Trivia Database
- Shuffle answer options for each question
- Display question progress and a progress bar
- Countdown timer
- Track selected answers and calculate the final score
- Show correct and incorrect answer totals
- Restart the quiz

## Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript (ES6+)
- Fetch API, async/await, and URLSearchParams
- [Open Trivia Database API](https://opentdb.com/api_config.php)

## Run Locally

1. Clone or download the repository.
2. Open the project folder in VS Code or another editor.
3. Open `index.html` in a browser, or use a local development server.
4. Choose the quiz difficulty, time limit, and question count.
5. Select **Start Quiz**.

An internet connection is required to retrieve questions from the API.

## Project Structure

- `index.html` — screens and quiz interface
- `style.css` — responsive layout and visual styles
- `script.js` — API requests, quiz state, timer, answer handling, and rendering

## Learning Goals

This project practices asynchronous JavaScript, API integration, DOM manipulation, application state, array methods, input validation, and error handling.

## Author

**Ghadeer Debo** — [GitHub](https://github.com/ghadeer351)
