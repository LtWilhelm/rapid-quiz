let timeRemaining = 60;
const questionContainer = document.getElementById('question');
const timePenalty = 5;
let timer;

let questions = [];

fetch('https://opentdb.com/api.php?amount=10').then((r) => r.json()).then(r => {
  questions = r.results;
})

let answered = false;

function renderQuestion(index) {
  answered = false;
  if (index === questions.length) {
    return endQuiz();
  }

  questionContainer.innerHTML = '';

  const question = questions[index];
  const answers = [question.correct_answer, ...question.incorrect_answers].sort(() => Math.random() - .5);

  const questionEl = document.createElement('h3');
  questionEl.innerHTML = question.question;

  const answerContainer = document.createElement('ul');
  for (const answer of answers) {
    const answerEl = document.createElement('li');
    answerEl.textContent = answer;
    answerEl.addEventListener('click', (e) => {
      e.preventDefault();

      if (!answered) {
        answered = true;
        answerQuestion(index, answer, answerEl);
      }
    })

    answerContainer.appendChild(answerEl);
  }

  questionContainer.appendChild(questionEl);
  questionContainer.appendChild(answerContainer);
}

function answerQuestion(index, answer, element) {
  let outline = 'red'
  if (questions[index].correct_answer === answer) {
    correct = outline = 'green';
  } else {
    timeRemaining -= timePenalty;
  }

  element.style.borderColor = outline;

  setTimeout(() => {
    if (timeRemaining <= 0) return endQuiz;
    renderQuestion(index + 1);
  }, 1000)
}

function endQuiz() {
  clearInterval(timer);
  const formEl = document.createElement('form');
  const nameEl = document.createElement('input');
  const buttonEl = document.createElement('button');

  buttonEl.textContent = 'Submit';

  formEl.append(nameEl);
  formEl.append(buttonEl);

  formEl.addEventListener('submit', (e) => {
    e.preventDefault();

    const highScores = JSON.parse(localStorage.getItem('quiz-high-scores') || '[]');
    const lastScore = {
      name: nameEl.value,
      score: timeRemaining
    }
    highScores.push(lastScore)
    highScores.sort((a, b) => {
      a.score - b.score
    });
    localStorage.setItem('quiz-high-scores', JSON.stringify(highScores.slice(0, 10)));
    localStorage.setItem('quiz-last-score', JSON.stringify(lastScore));

    location.href = 'high-score.html'
  })

  questionContainer.innerHTML = '';
  questionContainer.append(formEl);
}

document.getElementById('start').addEventListener('click', () => {
  if (questions.length) {
    const timerEl = document.getElementById('timer');
    timerEl.textContent = `${timeRemaining} seconds remaining`

    renderQuestion(0);
    timer = setInterval(() => {
      timeRemaining--;
      if (timeRemaining <= 0) return endQuiz();
      timerEl.textContent = `${timeRemaining} seconds remaining`
    }, 1000)
  }
})
