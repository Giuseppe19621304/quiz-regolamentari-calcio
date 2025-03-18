// quiz.js - Logica della pagina del quiz

// Variabili globali
let currentQuiz = null;
let currentQuestionIndex = 0;
let score = 0;
let timer = null;
let timeLeft = 45;
let answeredCorrectly = [];
let questionTimes = [];
let selectedAnswer = null;

// Elementi DOM
const questionText = document.getElementById('question-text');
const optionA = document.getElementById('option-a-text');
const optionB = document.getElementById('option-b-text');
const optionC = document.getElementById('option-c-text');
const optionsContainer = document.getElementById('options-container');
const currentQuestionDisplay = document.getElementById('current-question');
const totalQuestionsDisplay = document.getElementById('total-questions');
const progressFill = document.getElementById('progress-fill');
const timerDisplay = document.getElementById('timer-value');
const currentScoreDisplay = document.getElementById('current-score');
const currentRuleDisplay = document.getElementById('current-rule');
const feedbackContainer = document.getElementById('feedback-container');
const feedbackElement = document.getElementById('feedback');
const feedbackText = document.getElementById('feedback-text');
const feedbackPoints = document.getElementById('feedback-points');
const nextBtn = document.getElementById('next-btn');
const quizModeSubtitle = document.getElementById('quiz-mode-subtitle');

// Inizializzazione
document.addEventListener('DOMContentLoaded', init);

function init() {
    loadQuizSession();
    setupEventListeners();
    startQuiz();
}

// Carica la sessione di quiz corrente
function loadQuizSession() {
    const quizSessionData = sessionStorage.getItem('currentQuiz');
    if (!quizSessionData) {
        // Nessuna sessione di quiz trovata, torna alla home
        window.location.href = 'index.html';
        return;
    }
    
    currentQuiz = JSON.parse(quizSessionData);
    console.log('Quiz session loaded:', currentQuiz.mode, currentQuiz.questions.length, 'questions');
    
    // Aggiorna il sottotitolo della pagina
    quizModeSubtitle.textContent = currentQuiz.subtitle || 'Quiz in corso';
}

// Configura gli event listeners
function setupEventListeners() {
    // Event listener per le opzioni
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            if (feedbackContainer.classList.contains('hidden')) {
                selectAnswer(option.dataset.option);
            }
        });
    });
    
    // Event listener per il pulsante "Prossima domanda"
    nextBtn.addEventListener('click', nextQuestion);
    
    // Event listener per il pulsante "Torna alla Home"
    const exitQuizBtn = document.getElementById('exit-quiz-btn');
    exitQuizBtn.addEventListener('click', () => {
        if (confirm('Sei sicuro di voler abbandonare il quiz? Il progresso non verrà salvato.')) {
            window.location.href = 'index.html';
        }
    });
}

// Avvia il quiz
function startQuiz() {
    // Inizializza le variabili
    currentQuestionIndex = 0;
    score = 0;
    answeredCorrectly = new Array(currentQuiz.questions.length).fill(false);
    questionTimes = new Array(currentQuiz.questions.length).fill(0);
    
    // Aggiorna il display
    totalQuestionsDisplay.textContent = currentQuiz.questions.length;
    currentScoreDisplay.textContent = score;
    
    // Carica la prima domanda
    loadQuestion();
}

// Carica una domanda
function loadQuestion() {
    const question = currentQuiz.questions[currentQuestionIndex];
    
    // Aggiorna il testo della domanda e delle opzioni
    questionText.textContent = question.question;
    optionA.textContent = question.options[0];
    optionB.textContent = question.options[1];
    optionC.textContent = question.options[2];
    
    // Aggiorna i display di progresso
    currentQuestionDisplay.textContent = currentQuestionIndex + 1;
    progressFill.style.width = `${((currentQuestionIndex + 1) / currentQuiz.questions.length) * 100}%`;
    
    // Mostra la regola corrente
    currentRuleDisplay.textContent = question.rule;
    
    // Resetta lo stato delle opzioni
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
    });
    
    // Nascondi il feedback
    feedbackContainer.classList.add('hidden');
    
    // Resetta il timer
    resetTimer();
    
    // Resetta l'opzione selezionata
    selectedAnswer = null;
}

// Seleziona una risposta
function selectAnswer(option) {
    // Se una risposta è già stata selezionata, ignora
    if (selectedAnswer !== null) return;
    
    // Ferma il timer
    clearInterval(timer);
    
    // Salva il tempo impiegato per rispondere
    questionTimes[currentQuestionIndex] = 20 - timeLeft;
    
    // Salva la risposta selezionata
    selectedAnswer = option;
    
    // Evidenzia l'opzione selezionata
    const selectedOption = document.querySelector(`.option[data-option="${option}"]`);
    selectedOption.classList.add('selected');
    
    // Controlla se la risposta è corretta
    const question = currentQuiz.questions[currentQuestionIndex];
    const isCorrect = option === question.correctAnswer;
    
    // Aggiorna l'array delle risposte corrette
    answeredCorrectly[currentQuestionIndex] = isCorrect;
    
    // Calcola i punti
    let points = 0;
    if (isCorrect) {
        points = 10 + Math.floor(timeLeft / 2); // Bonus per la velocità
    }
    
    // Aggiorna il punteggio
    score += points;
    currentScoreDisplay.textContent = score;
    
    // Mostra il feedback
    showFeedback(isCorrect, points);
    
    // Evidenzia la risposta corretta
    const correctOption = document.querySelector(`.option[data-option="${question.correctAnswer}"]`);
    correctOption.classList.add('correct');
    
    // Se la risposta è sbagliata, evidenzia anche quella selezionata come sbagliata
    if (!isCorrect) {
        selectedOption.classList.add('incorrect');
    }
}

// Mostra il feedback
function showFeedback(isCorrect, points) {
    feedbackContainer.classList.remove('hidden');
    feedbackElement.className = 'feedback';
    feedbackElement.classList.add(isCorrect ? 'correct' : 'incorrect');
    
    if (isCorrect) {
        feedbackText.textContent = 'Risposta corretta!';
        feedbackPoints.textContent = `+${points} punti`;
    } else {
        feedbackText.textContent = 'Risposta sbagliata!';
        feedbackPoints.textContent = '+0 punti';
    }
}

// Passa alla domanda successiva
function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < currentQuiz.questions.length) {
        // Passa alla prossima domanda
        loadQuestion();
    } else {
        // Fine del quiz
        finishQuiz();
    }
}

// Termina il quiz
function finishQuiz() {
    // Salva i risultati nella sessionStorage
    const results = {
        mode: currentQuiz.mode,
        ruleId: currentQuiz.ruleId,
        score: score,
        totalQuestions: currentQuiz.questions.length,
        correctAnswers: answeredCorrectly.filter(Boolean).length,
        questionTimes: questionTimes,
        answeredCorrectly: answeredCorrectly,
        questions: currentQuiz.questions
    };
    
    sessionStorage.setItem('quizResults', JSON.stringify(results));
    
    // Aggiorna le statistiche dell'utente
    updateUserStats();
    
    // Vai alla pagina dei risultati
    window.location.href = 'results.html';
}

// Aggiorna le statistiche dell'utente
function updateUserStats() {
    // Carica le statistiche correnti
    const savedStats = localStorage.getItem('quizUserStats');
    let userStats = savedStats ? JSON.parse(savedStats) : {
        totalCompleted: 0,
        bestScore: 0,
        currentStreak: 0,
        lastPlayed: null,
        completedRules: [],
        badges: []
    };
    
    // Aggiorna le statistiche
    userStats.totalCompleted++;
    
    if (score > userStats.bestScore) {
        userStats.bestScore = score;
    }
    
    // Aggiorna la data dell'ultimo gioco
    const today = new Date().toDateString();
    const lastPlayed = userStats.lastPlayed;
    
    if (lastPlayed !== today) {
        // Controlla se l'utente ha giocato ieri per lo streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPlayed === yesterday.toDateString()) {
            userStats.currentStreak++;
            
            // Controlla se l'utente ha sbloccato un badge di streak
            if (userStats.currentStreak === 7 && !userStats.badges.includes('streak-7')) {
                userStats.badges.push('streak-7');
            }
            
            if (userStats.currentStreak === 30 && !userStats.badges.includes('streak-30')) {
                userStats.badges.push('streak-30');
            }
        } else if (lastPlayed !== null) {
            // L'utente ha saltato almeno un giorno, azzera lo streak
            userStats.currentStreak = 1;
        } else {
            // Prima volta che l'utente gioca
            userStats.currentStreak = 1;
        }
        
        userStats.lastPlayed = today;
    }
    
    // Controlla se l'utente ha completato una regola
    if (currentQuiz.mode === 'rule' && 
        answeredCorrectly.filter(Boolean).length >= Math.floor(currentQuiz.questions.length * 0.8)) {
        // L'utente ha risposto correttamente ad almeno l'80% delle domande
        if (!userStats.completedRules.includes(currentQuiz.ruleId)) {
            userStats.completedRules.push(currentQuiz.ruleId);
            
            // Aggiungi il badge per questa regola
            const ruleBadge = `rule-${currentQuiz.ruleId}`;
            if (!userStats.badges.includes(ruleBadge)) {
                userStats.badges.push(ruleBadge);
            }
            
            // Controlla se l'utente ha sbloccato tutte le regole
            const allRules = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 'ASS', 'NFOT'];
            const unlockedAll = allRules.every(rule => 
                userStats.completedRules.includes(rule) || 
                userStats.completedRules.includes(rule.toString()));
            
            if (unlockedAll && !userStats.badges.includes('master')) {
                userStats.badges.push('master');
            }
        }
    }
    
    // Salva le statistiche aggiornate
    localStorage.setItem('quizUserStats', JSON.stringify(userStats));
}

// Resetta il timer
function resetTimer() {
    // Ferma il timer esistente, se presente
    if (timer) {
        clearInterval(timer);
    }
    
    // Imposta il timer a 45 secondi
    timeLeft = 45;
    timerDisplay.textContent = timeLeft;
    
    // Avvia il timer
    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            // Tempo scaduto, seleziona automaticamente una risposta sbagliata
            clearInterval(timer);
            
            // Trova una risposta sbagliata da selezionare
            const question = currentQuiz.questions[currentQuestionIndex];
            const correctAnswer = question.correctAnswer;
            
            // Seleziona una risposta diversa da quella corretta
            const options = ['A', 'B', 'C'];
            const wrongOptions = options.filter(opt => opt !== correctAnswer);
            
            // Seleziona la prima opzione sbagliata
            selectAnswer(wrongOptions[0]);
        }
    }, 1000);
}
