document.addEventListener('DOMContentLoaded', () => {
    const selectors = {
        difficultySelect: '#difficulty',
        quizForm: '#quiz-form',
        questionContainer: '#question-container',
        questionElement: '#question',
        answersElement: '#answers',
        resultContainer: '#result',
        resultMessage: '#result-message',
        nextQuestionButton: '#next-question',
        resetScoreButton: '#reset-score',
        searchButton: '.search-bar button',
        searchInput: '.search-bar input'
    };

    const elements = {};
    for (let key in selectors) {
        elements[key] = document.querySelector(selectors[key]);
    }

    let quizData = [];
    let currentQuestionIndex = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;

    elements.quizForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const difficulty = elements.difficultySelect.value;
        quizData = await fetchQuizQuestions(difficulty);
        startQuiz();
    });

    async function fetchQuizQuestions(difficulty) {
        try {
            const apiUrl = `https://opentdb.com/api.php?amount=10&difficulty=${difficulty}&type=multiple`;
            const response = await fetch(apiUrl);
            const data = await response.json();
            return data.results;
        } catch (error) {
            console.error('Error fetching quiz questions:', error);
        }
    }

    function startQuiz() {
        elements.quizForm.classList.add('hidden');
        elements.questionContainer.classList.remove('hidden');
        loadQuestion();
    }

    function loadQuestion() {
        const question = quizData[currentQuestionIndex];
        elements.questionElement.innerHTML = decodeHTML(question.question);
        elements.answersElement.innerHTML = '';
        const allAnswers = [...question.incorrect_answers, question.correct_answer];
        shuffleArray(allAnswers);

        allAnswers.forEach(answer => {
            const button = createAnswerButton(answer, question.correct_answer);
            elements.answersElement.appendChild(button);
        });
    }

    function createAnswerButton(answer, correctAnswer) {
        const button = document.createElement('button');
        button.innerHTML = decodeHTML(answer);
        button.classList.add('btn', 'btn-primary');
        button.dataset.correct = answer === correctAnswer;
        button.addEventListener('click', checkAnswer);
        return button;
    }

    function decodeHTML(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    function checkAnswer(event) {
        const isCorrect = event.target.dataset.correct === 'true';
        if (isCorrect) {
            correctAnswers++;
            elements.resultMessage.textContent = 'Correct!';
        } else {
            incorrectAnswers++;
            elements.resultMessage.textContent = 'Incorrect!';
        }
        showResult();
    }

    function showResult() {
        elements.questionContainer.classList.add('hidden');
        elements.resultContainer.classList.remove('hidden');
        updateScore();
    }

    function updateScore() {
        elements.resultMessage.textContent += ` Score: ${correctAnswers} correct, ${incorrectAnswers} incorrect.`;
        localStorage.setItem('quizScore', JSON.stringify({ correct: correctAnswers, incorrect: incorrectAnswers }));
    }

    elements.nextQuestionButton.addEventListener('click', () => {
        elements.resultContainer.classList.add('hidden');
        elements.questionContainer.classList.remove('hidden');
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.length) {
            loadQuestion();
        } else {
            endQuiz();
        }
    });

    function endQuiz() {
        elements.resultMessage.innerHTML = `Quiz ended. Final score: ${correctAnswers} correct, ${incorrectAnswers} incorrect.`;
        elements.resultContainer.innerHTML += `<button id="restart-quiz">Restart Quiz</button>`;
        document.getElementById('restart-quiz').addEventListener('click', restartQuiz);
    }

    function restartQuiz() {
        currentQuestionIndex = 0;
        correctAnswers = 0;
        incorrectAnswers = 0;
        elements.resultContainer.classList.add('hidden');
        elements.quizForm.classList.remove('hidden');
    }

    elements.resetScoreButton.addEventListener('click', () => {
        localStorage.removeItem('quizScore');
        correctAnswers = 0;
        incorrectAnswers = 0;
        restartQuiz();
    });

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    const storedScore = localStorage.getItem('quizScore');
    if (storedScore) {
        const quizScore = JSON.parse(storedScore);
        correctAnswers = quizScore.correct;
        incorrectAnswers = quizScore.incorrect;
        updateScore();
        elements.quizForm.classList.add('hidden');
        endQuiz();
    }

    elements.searchButton.addEventListener('click', () => {
        alert(`Searching for: ${elements.searchInput.value}`);
    });
});
