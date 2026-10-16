const questions = [
  {
    q: '¿En qué año nació Salomé Ureña?',
    options: ['1821', '1850', '1897', '1901'],
    correct: 1,
    explain: 'Nació el 21 de octubre de 1850 en Santo Domingo.'
  },
  {
    q: '¿En qué país nació y desarrolló su labor educativa?',
    options: ['Cuba', 'Puerto Rico', 'República Dominicana', 'México'],
    correct: 2,
    explain: 'Salomé Ureña fue una poeta y educadora dominicana.'
  },
  {
    q: '¿Qué institución fundó en 1881?',
    options: ['Una biblioteca nacional', 'El Instituto de Señoritas', 'Una escuela de medicina', 'Un periódico escolar'],
    correct: 1,
    explain: 'El Instituto de Señoritas impulsó la formación académica de mujeres y futuras maestras.'
  },
  {
    q: '¿Cuál fue uno de sus aportes más importantes?',
    options: ['La navegación marítima', 'La educación de las mujeres', 'La invención de la imprenta', 'La pintura mural'],
    correct: 1,
    explain: 'Defendió el acceso de las mujeres a la educación y a la formación intelectual.'
  },
  {
    q: '¿Cuál de estos poemas se asocia con Salomé Ureña?',
    options: ['Ruinas', 'La Odisea', 'Don Quijote', 'La casa de Bernarda Alba'],
    correct: 0,
    explain: '“Ruinas” es uno de los poemas más conocidos de Salomé Ureña.'
  },
  {
    q: '¿En qué año falleció Salomé Ureña?',
    options: ['1850', '1881', '1897', '1930'],
    correct: 2,
    explain: 'Falleció el 6 de marzo de 1897.'
  },
  {
    q: '¿Qué profesión, además de poeta, destacó en su vida?',
    options: ['Educadora', 'Astronauta', 'Arquitecta naval', 'Actriz de cine'],
    correct: 0,
    explain: 'Su trabajo como educadora fue fundamental para su legado.'
  },
  {
    q: '¿Qué buscaba promover con el Instituto de Señoritas?',
    options: ['La formación de futuras maestras', 'La enseñanza exclusiva de deportes', 'La formación militar', 'La navegación comercial'],
    correct: 0,
    explain: 'La institución ayudó a preparar mujeres para la enseñanza y la vida intelectual.'
  },
  {
    q: '¿Qué día se celebra su natalicio?',
    options: ['6 de marzo', '27 de febrero', '21 de octubre', '16 de agosto'],
    correct: 2,
    explain: 'Salomé Ureña nació el 21 de octubre de 1850.'
  },
  {
    q: '¿Qué idea resume mejor el legado de Salomé Ureña?',
    options: ['La educación y la poesía pueden transformar la sociedad', 'La historia no debe estudiarse', 'La literatura solo sirve para entretener', 'La educación debe limitarse a unos pocos'],
    correct: 0,
    explain: 'Su poesía y su labor educativa dejaron una huella importante en la cultura dominicana.'
  }
];

let current = 0;
let score = 0;
let answered = false;

const byId = id => document.getElementById(id);
const qCounter = byId('qCounter');
const qScore = byId('qScore');
const qText = byId('qText');
const qOptions = byId('qOptions');
const qFeedback = byId('qFeedback');
const progressFill = byId('progressFill');
const nextQuestion = byId('nextQuestion');

function renderQuestion() {
  answered = false;
  const item = questions[current];
  qCounter.textContent = `Pregunta ${current + 1} de ${questions.length}`;
  qText.textContent = item.q;
  qOptions.replaceChildren();
  qFeedback.textContent = '';
  nextQuestion.classList.add('hidden');
  progressFill.style.width = `${current / questions.length * 100}%`;

  item.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.className = 'option';
    button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    button.addEventListener('click', () => chooseAnswer(index, button));
    qOptions.append(button);
  });
}

function chooseAnswer(index, selectedButton) {
  if (answered) return;
  answered = true;
  const item = questions[current];
  [...qOptions.querySelectorAll('button')].forEach((button, optionIndex) => {
    button.disabled = true;
    if (optionIndex === item.correct) button.classList.add('correct');
  });

  if (index === item.correct) {
    score++;
    qScore.textContent = score;
    qFeedback.textContent = `¡Correcto! ${item.explain}`;
    qFeedback.classList.remove('feedback-wrong');
    qFeedback.classList.add('feedback-correct');
  } else {
    selectedButton.classList.add('incorrect');
    qFeedback.textContent = `Casi. ${item.explain}`;
    qFeedback.classList.remove('feedback-correct');
    qFeedback.classList.add('feedback-wrong');
  }

  progressFill.style.width = `${(current + 1) / questions.length * 100}%`;
  nextQuestion.textContent = current === questions.length - 1 ? 'Ver mi resultado →' : 'Siguiente pregunta →';
  nextQuestion.classList.remove('hidden');
}

nextQuestion.addEventListener('click', () => {
  if (!answered) return;
  if (current < questions.length - 1) {
    current++;
    renderQuestion();
    return;
  }

  byId('quizGame').classList.add('hidden');
  byId('quizResult').classList.add('show');
  byId('resultScore').textContent = `${score}/${questions.length}`;
  const percentage = score / questions.length;
  byId('resultMessage').textContent = percentage === 1
    ? '¡De película! Conoces muy bien la vida y el legado de Salomé Ureña.'
    : percentage >= 0.7
      ? '¡Muy bien! Has aprendido bastante. Repasa los detalles y vuelve a intentarlo.'
      : '¡Este es solo el primer acto! Recorre las secciones, aprende algo nuevo y vuelve a intentarlo.';
});

byId('restartQuiz').addEventListener('click', () => {
  current = 0;
  score = 0;
  qScore.textContent = '0';
  byId('quizGame').classList.remove('hidden');
  byId('quizResult').classList.remove('show');
  renderQuestion();
});

renderQuestion();
