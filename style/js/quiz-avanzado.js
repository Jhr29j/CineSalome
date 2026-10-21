const questions = [
  {
    "q": "¿Qué relación expresa mejor la poesía patriótica de Salomé Ureña con el proyecto de nación dominicano?",
    "options": [
      "Se limita a describir paisajes sin intención social",
      "Vincula la identidad nacional con el progreso moral, cultural y educativo",
      "Defiende el aislamiento cultural del país",
      "Rechaza cualquier referencia al pasado histórico"
    ],
    "correct": 1,
    "explain": "Su poesía patriótica relaciona el amor a la nación con la educación y el progreso colectivo."
  },
  {
    "q": "En «Ruinas», ¿qué función cumple el contraste entre la antigua grandeza de Santo Domingo y su decadencia?",
    "options": [
      "Celebrar la decadencia como destino inevitable",
      "Sustituir la historia por una fantasía sin crítica",
      "Despertar conciencia histórica y estimular la regeneración nacional",
      "Proponer que se abandone el patrimonio colonial"
    ],
    "correct": 2,
    "explain": "El contraste sirve como crítica del presente y llamado a la renovación."
  },
  {
    "q": "¿Cuál es la interpretación más precisa de la fundación del Instituto de Señoritas en 1881?",
    "options": [
      "Una iniciativa para ampliar la educación intelectual y la formación docente femenina",
      "Un centro exclusivamente dedicado a la poesía",
      "Una institución de educación militar",
      "Un proyecto de enseñanza reservado a varones"
    ],
    "correct": 0,
    "explain": "La institución abrió oportunidades de formación académica y preparación de maestras."
  },
  {
    "q": "¿Qué corriente literaria ayuda a contextualizar la exaltación patriótica y el tono emotivo de su poesía?",
    "options": [
      "Naturalismo científico",
      "Vanguardismo surrealista",
      "Teatro del absurdo",
      "Romanticismo"
    ],
    "correct": 3,
    "explain": "El Romanticismo influyó en la expresión emotiva y el compromiso patriótico de su obra."
  },
  {
    "q": "¿Qué rasgo diferencia su proyecto educativo de una visión limitada a la instrucción doméstica?",
    "options": [
      "La exclusión de materias académicas",
      "La preparación intelectual de mujeres para ejercer la docencia",
      "La prohibición de que las alumnas enseñaran",
      "La sustitución de la enseñanza por ceremonias"
    ],
    "correct": 1,
    "explain": "Su iniciativa defendió una formación intelectual rigurosa y oportunidades profesionales para mujeres."
  },
  {
    "q": "¿Qué simbolizan las ruinas en el poema homónimo, más allá de su sentido arquitectónico?",
    "options": [
      "La desaparición de toda esperanza",
      "La prosperidad comercial del presente",
      "La distancia entre un pasado de esplendor y un presente que exige renovación",
      "El rechazo de cualquier memoria histórica"
    ],
    "correct": 2,
    "explain": "Las ruinas adquieren una dimensión histórica y cívica."
  },
  {
    "q": "¿Qué combinación describe mejor las dos grandes dimensiones de su legado público?",
    "options": [
      "Producción poética y reforma educativa",
      "Carrera militar y actividad diplomática",
      "Investigación médica y arquitectura",
      "Comercio marítimo y exploración"
    ],
    "correct": 0,
    "explain": "Su influencia se reconoce tanto en la literatura como en la educación dominicana."
  },
  {
    "q": "¿Qué finalidad tiene la apelación directa a la patria en poemas de tono cívico?",
    "options": [
      "Eliminar toda dimensión emocional",
      "Evitar la participación del lector",
      "Convertir el poema en una crónica neutral",
      "Personificar la nación para exhortarla a recuperar su dignidad"
    ],
    "correct": 3,
    "explain": "La personificación permite dirigirse a la patria como un sujeto capaz de levantarse y renovarse."
  },
  {
    "q": "¿Qué conclusión histórica es más razonable sobre la formación de maestras en el siglo XIX dominicano?",
    "options": [
      "No tuvo ninguna repercusión social",
      "Contribuyó a multiplicar las oportunidades educativas para otras generaciones",
      "Eliminó de inmediato todas las desigualdades",
      "Impidió la expansión de las escuelas"
    ],
    "correct": 1,
    "explain": "La formación de docentes favoreció la difusión de la enseñanza, aunque no resolvió por sí sola todas las desigualdades."
  },
  {
    "q": "¿Qué relación existe entre el uso de imágenes de sufrimiento nacional y la esperanza en su poesía patriótica?",
    "options": [
      "Son ideas incompatibles",
      "El sufrimiento se presenta como un fin en sí mismo",
      "La denuncia de la crisis funciona como impulso hacia la superación",
      "La esperanza borra toda referencia al pasado"
    ],
    "correct": 2,
    "explain": "La crítica y el dolor pueden convivir con una invitación a reconstruir la nación."
  },
  {
    "q": "¿Cuál de las siguientes afirmaciones evita una simplificación del papel de Salomé Ureña?",
    "options": [
      "Fue una autora cuya labor literaria y pedagógica se reforzaban mutuamente",
      "Solo escribió versos sin interés social",
      "Su escuela se dedicó exclusivamente a las artes escénicas",
      "Su influencia terminó en el siglo XIX sin continuidad"
    ],
    "correct": 0,
    "explain": "Sus convicciones cívicas aparecen tanto en su escritura como en sus iniciativas educativas."
  },
  {
    "q": "Al analizar «A la patria», ¿qué actitud transmite el llamado a levantar la frente y reclamar gloria?",
    "options": [
      "Resignación ante la pérdida de soberanía",
      "Indiferencia frente al futuro",
      "Nostalgia sin posibilidad de acción",
      "Exhortación a la dignidad y la acción colectiva"
    ],
    "correct": 3,
    "explain": "La voz poética impulsa a la nación a superar la humillación y afirmar su dignidad."
  },
  {
    "q": "¿Por qué sería insuficiente estudiar sus poemas sin considerar el contexto dominicano del siglo XIX?",
    "options": [
      "Porque todos sus versos son documentos legales",
      "Porque sus preocupaciones cívicas dialogan con la construcción nacional y sus desafíos",
      "Porque la literatura no admite interpretación estética",
      "Porque escribió exclusivamente sobre ciencia"
    ],
    "correct": 1,
    "explain": "El contexto histórico ayuda a comprender las preocupaciones patrióticas y reformistas presentes en sus textos."
  },
  {
    "q": "¿Cuál es la mejor diferencia entre memorizar datos de su biografía y analizar su legado?",
    "options": [
      "Analizar consiste únicamente en repetir fechas",
      "Memorizar siempre produce interpretaciones más profundas",
      "Analizar implica relacionar sus decisiones, obras e impacto social con su época",
      "Son actividades idénticas"
    ],
    "correct": 2,
    "explain": "El análisis relaciona hechos, textos, causas y consecuencias."
  },
  {
    "q": "¿Qué lectura integra mejor su pensamiento educativo y su visión de progreso?",
    "options": [
      "La educación de las mujeres es parte del desarrollo cultural y social de la nación",
      "El progreso depende únicamente de los recursos naturales",
      "La poesía debe reemplazar por completo a las escuelas",
      "La instrucción es irrelevante para el bienestar colectivo"
    ],
    "correct": 0,
    "explain": "La ampliación de la educación femenina se vinculó con un ideal más amplio de progreso nacional."
  }
];
/* ── Sistema de tandas — modo careo (revelar respuesta) ─────────────────
   15 preguntas → 3 tandas de 5.
   No hay selección ni puntos: el usuario piensa y pulsa "Ver respuesta"
   para que se ilumine la opción correcta y aparezca la explicación.
   ─────────────────────────────────────────────────────────────────────── */

const TANDA_SIZE   = 5;
const TOTAL_TANDAS = 3;

let shuffledQuestions = [];
let tanda         = 0;
let tandaQuestions = [];
let current       = 0;
let revealed      = false;

const byId         = id => document.getElementById(id);
const qCounter     = byId('qCounter');
const qText        = byId('qText');
const qOptions     = byId('qOptions');
const qFeedback    = byId('qFeedback');
const progressFill = byId('progressFill');
const revealBtn    = byId('revealAnswer');
const nextQuestion = byId('nextQuestion');

/* Fisher-Yates */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* Arranca un ciclo completo: baraja las 15 y empieza desde tanda 0 */
function initCycle() {
  shuffledQuestions = shuffle([...questions]);
  tanda = 0;
  startTanda();
}

/* Carga la tanda actual (slice de 5 del pool barajado) */
function startTanda() {
  const start    = tanda * TANDA_SIZE;
  tandaQuestions = shuffledQuestions.slice(start, start + TANDA_SIZE);
  current        = 0;

  byId('qTandaBadge').textContent = `Tanda ${tanda + 1} de ${TOTAL_TANDAS}`;
  byId('quizGame').classList.remove('hidden');
  byId('quizResult').classList.remove('show');
  byId('tandaResult').classList.remove('show');

  renderQuestion();
}

function renderQuestion() {
  revealed = false;
  const item = tandaQuestions[current];

  qCounter.textContent = `Pregunta ${current + 1} de ${TANDA_SIZE}`;
  qText.textContent    = item.q;
  qOptions.replaceChildren();
  qFeedback.textContent = '';
  qFeedback.className   = 'feedback';

  revealBtn.classList.remove('hidden');
  nextQuestion.classList.add('hidden');
  progressFill.style.width = `${current / TANDA_SIZE * 100}%`;

  /* Opciones estáticas — solo visuales, no se pueden clicar */
  item.options.forEach((option, index) => {
    const div = document.createElement('div');
    div.className   = 'option option-static';
    div.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
    qOptions.append(div);
  });
}

/* "Ver respuesta" → iluminar la correcta y mostrar explicación */
revealBtn.addEventListener('click', () => {
  if (revealed) return;
  revealed = true;
  revealBtn.classList.add('hidden');

  const item = tandaQuestions[current];
  [...qOptions.querySelectorAll('.option-static')].forEach((div, i) => {
    if (i === item.correct) div.classList.add('correct');
  });

  qFeedback.textContent = item.explain;
  qFeedback.classList.add('feedback-correct');
  progressFill.style.width = `${(current + 1) / TANDA_SIZE * 100}%`;

  const esUltima = current === TANDA_SIZE - 1;
  nextQuestion.textContent = esUltima
    ? (tanda === TOTAL_TANDAS - 1 ? 'Ver resultado final →' : 'Ver resultado de tanda →')
    : 'Siguiente pregunta →';
  nextQuestion.classList.remove('hidden');
});

/* Avanzar a la siguiente pregunta o mostrar resultado de tanda */
nextQuestion.addEventListener('click', () => {
  if (!revealed) return;
  if (current < TANDA_SIZE - 1) { current++; renderQuestion(); return; }

  byId('quizGame').classList.add('hidden');

  if (tanda === TOTAL_TANDAS - 1) {
    byId('quizResult').classList.add('show');
  } else {
    byId('tandaNextLabel').textContent = `Comenzar tanda ${tanda + 2} \u2192`;
    byId('tandaResult').classList.add('show');
  }
});

/* Siguiente tanda */
byId('nextTanda').addEventListener('click', () => {
  tanda++;
  byId('tandaResult').classList.remove('show');
  startTanda();
});

/* Repetir todo el ciclo */
byId('restartQuiz').addEventListener('click', () => {
  initCycle();
});

/* Arranque */
initCycle();

