const quizContainer = document.getElementById("quiz-container");
const questionsElement = document.getElementById("questions");
const submitButton = document.getElementById("submit-btn");
const resultElement = document.getElementById("result");
const navigationButtonsContainer = document.createElement("div");
const retakeButtonContainer = document.createElement("div");
const progressElement = document.createElement("div");

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let isQuizSubmitted = false;
let selectedAnswers = []; // Array to store selected answers
const questionsPerPage = 5; // Number of questions to display per page

async function loadQuestions() {
  try {
    const response = await fetch("questions.json");
    if (!response.ok) {
      throw new Error("Failed to load questions");
    }
    const data = await response.json();
    questions = data;
    displayQuestions();
  } catch (error) {
    console.error("Error loading questions:", error.message);
    // Handle loading error gracefully (e.g., display error message)
  }
}

function displayQuestions() {
  questionsElement.innerHTML = "";
  progressElement.innerHTML = "";

  const startIndex = currentQuestionIndex;
  const endIndex = Math.min(
    currentQuestionIndex + questionsPerPage,
    questions.length
  );

  if (startIndex < questions.length && !isQuizSubmitted) {
    for (let i = startIndex; i < endIndex; i++) {
      const question = questions[i];

      const questionElement = document.createElement("div");
      questionElement.classList.add("question");

      const questionNumber = document.createElement("p");
      questionNumber.textContent = `Question ${i + 1}`;

      const questionText = document.createElement("p");
      questionText.textContent = question.question;

      questionElement.appendChild(questionNumber);
      questionElement.appendChild(questionText);

      const optionsList = document.createElement("ul");

      question.options.forEach((option, optionIndex) => {
        const optionElement = document.createElement("li");
        const radioInput = document.createElement("input");
        radioInput.type = "radio";
        radioInput.name = `question${i}`;
        radioInput.value = optionIndex;

        // Check if this option was previously selected
        if (selectedAnswers[i] === optionIndex) {
          radioInput.checked = true;
        }

        radioInput.addEventListener("change", () => {
          selectedAnswers[i] = optionIndex;
          updateProgress();
        });

        const optionLabel = document.createElement("label");
        optionLabel.textContent = option;

        optionElement.appendChild(radioInput);
        optionElement.appendChild(optionLabel);

        optionsList.appendChild(optionElement);
      });

      questionElement.appendChild(optionsList);
      questionsElement.appendChild(questionElement);
    }

    if (!isQuizSubmitted) {
      createNavigationButtons();
    }
    updateProgress();
  } else {
    showResult();
  }
}

function createNavigationButtons() {
  navigationButtonsContainer.innerHTML = "";

  if (currentQuestionIndex > 0) {
    addButton(navigationButtonsContainer, "Previous", () => {
      currentQuestionIndex -= questionsPerPage;
      displayQuestions();
    });
  }

  if (currentQuestionIndex + questionsPerPage < questions.length) {
    addButton(navigationButtonsContainer, "Next", () => {
      currentQuestionIndex += questionsPerPage;
      displayQuestions();
    });
  }

  questionsElement.appendChild(navigationButtonsContainer);
}

function addButton(container, text, onClick) {
  const button = document.createElement("button");
  button.textContent = text;
  button.addEventListener("click", onClick);
  container.appendChild(button);
}

function checkAllAnswers() {
  score = 0; // Reset score before checking answers

  for (let i = 0; i < questions.length; i++) {
    if (
      selectedAnswers[i] !== undefined &&
      selectedAnswers[i] === questions[i].answer
    ) {
      score++;
    }
  }
}

function checkAnswer() {
  checkAllAnswers();

  // Submit the quiz if it's the last page of questions
  if (currentQuestionIndex + questionsPerPage >= questions.length) {
    showResult();
  } else {
    // Display a message to the user to navigate through all the questions and then submit
    alert("Please navigate through all the questions and then submit.");
  }
}

function showResult() {
  submitButton.disabled = true;
  resultElement.classList.remove("hidden");
  resultElement.textContent = `You scored ${score} out of ${questions.length}`;
  isQuizSubmitted = true;

  // Clear navigation buttons and show the retake quiz button
  navigationButtonsContainer.innerHTML = "";
  retakeButtonContainer.innerHTML = "";
  addButton(retakeButtonContainer, "Retake Quiz", () => {
    resetQuiz();
    displayQuestions();
  });

  questionsElement.appendChild(retakeButtonContainer);
}

function resetQuiz() {
  // Reset all variables
  currentQuestionIndex = 0;
  score = 0;
  isQuizSubmitted = false;
  selectedAnswers = [];
  resultElement.classList.add("hidden");

  // Clear the questions element
  questionsElement.innerHTML = "";

  // Clear the navigation buttons and retake button
  navigationButtonsContainer.innerHTML = "";
  retakeButtonContainer.innerHTML = "";

  // Enable the submit button
  submitButton.disabled = false;

  // Remove retake button container
  if (retakeButtonContainer.parentNode) {
    retakeButtonContainer.parentNode.removeChild(retakeButtonContainer);
  }
}

function updateProgress() {
  const answeredQuestions = selectedAnswers.filter(
    (answer) => answer !== undefined
  ).length;
  progressElement.textContent = `Answered: ${answeredQuestions}/${questions.length}`;
  quizContainer.insertBefore(progressElement, questionsElement);
}

submitButton.addEventListener("click", checkAnswer);

loadQuestions();
