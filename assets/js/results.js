// results.js - Logica della pagina dei risultati

// Variabili globali
let quizResults = null;
let newBadge = null;

// Elementi DOM
const finalScoreDisplay = document.getElementById('final-score');
const correctAnswersDisplay = document.getElementById('correct-answers');
const averageTimeDisplay = document.getElementById('average-time');
const newBadgeContainer = document.getElementById('new-badge');
const badgeImage = document.getElementById('badge-image');
const badgeName = document.getElementById('badge-name');
const retryBtn = document.getElementById('retry-btn');
const homeBtn = document.getElementById('home-btn');
const shareBtn = document.getElementById('share-btn');
const reviewList = document.getElementById('review-list');
const resultsTitle = document.getElementById('results-title');
const noPreviousAttemptsMessage = document.getElementById('no-previous-attempts');
const comparisonChart = document.getElementById('comparison-chart');

// Inizializzazione
document.addEventListener('DOMContentLoaded', init);

function init() {
    loadQuizResults();
    setupEventListeners();
    displayResults();
    checkNewBadge();
    loadReviewQuestions();
    showConfetti();
}

// Carica i risultati del quiz
function loadQuizResults() {
    const resultsData = sessionStorage.getItem('quizResults');
    if (!resultsData) {
        // Nessun risultato trovato, torna alla home
        window.location.href = 'index.html';
        return;
    }
    
    quizResults = JSON.parse(resultsData);
    console.log('Quiz results loaded:', quizResults.score, 'points,', quizResults.correctAnswers, 'correct answers');
}

// Configura gli event listeners
function setupEventListeners() {
    retryBtn.addEventListener('click', retryQuiz);
    homeBtn.addEventListener('click', goHome);
    shareBtn.addEventListener('click', shareResults);
}

// Visualizza i risultati
function displayResults() {
    // Aggiorna il titolo in base al punteggio
    updateResultsTitle();
    
    // Aggiorna i display con i risultati
    finalScoreDisplay.textContent = quizResults.score;
    correctAnswersDisplay.textContent = `${quizResults.correctAnswers}/${quizResults.totalQuestions}`;
    
    // Calcola e visualizza il tempo medio per domanda
    const validTimes = quizResults.questionTimes.filter(time => time > 0);
    const averageTime = validTimes.length > 0 
        ? validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length
        : 0;
    averageTimeDisplay.textContent = `${Math.round(averageTime)}s`;
    
    // Mostra il grafico di confronto con i tentativi precedenti
    displayComparisonChart();
}

// Aggiorna il titolo in base al punteggio
function updateResultsTitle() {
    const percentageCorrect = (quizResults.correctAnswers / quizResults.totalQuestions) * 100;
    
    if (percentageCorrect >= 90) {
        resultsTitle.textContent = 'Eccellente!';
    } else if (percentageCorrect >= 80) {
        resultsTitle.textContent = 'Ottimo lavoro!';
    } else if (percentageCorrect >= 70) {
        resultsTitle.textContent = 'Buon risultato!';
    } else if (percentageCorrect >= 60) {
        resultsTitle.textContent = 'Risultato discreto';
    } else {
        resultsTitle.textContent = 'Continua a studiare';
    }
}

// Mostra il grafico di confronto con i tentativi precedenti
function displayComparisonChart() {
    // Per questa versione semplice, mostriamo solo un messaggio
    noPreviousAttemptsMessage.classList.remove('hidden');
    
    // Nota: in una versione più completa, qui si potrebbe implementare
    // un grafico di confronto usando librerie come Chart.js
}

// Controlla se l'utente ha sbloccato un nuovo badge
function checkNewBadge() {
    // Verifica se ci sono badge nel localStorage
    const savedStats = localStorage.getItem('quizUserStats');
    if (!savedStats) return;
    
    const userStats = JSON.parse(savedStats);
    
    // Controlla se esiste un nuovo badge
    if (userStats.badges && userStats.badges.length > 0) {
        // Prendiamo l'ultimo badge guadagnato
        const latestBadge = userStats.badges[userStats.badges.length - 1];
        
        // Visualizza il nuovo badge
        newBadgeContainer.classList.remove('hidden');
        
        // Imposta l'icona e il nome del badge
        badgeName.textContent = getBadgeTitle(latestBadge);
        
        // In una versione completa, qui si potrebbe caricare un'immagine reale per il badge
        badgeImage.src = `assets/images/badges/placeholder.png`;
    }
}

// Ottieni il titolo per un badge specifico
function getBadgeTitle(badgeId) {
    const badgeTitles = {
        'rule-1': 'Esperto Regola 1',
        'rule-2': 'Esperto Regola 2',
        'rule-3': 'Esperto Regola 3',
        'rule-4': 'Esperto Regola 4',
        'rule-5': 'Esperto Regola 5',
        'rule-6': 'Esperto Regola 6',
        'rule-7': 'Esperto Regola 7',
        'rule-8': 'Esperto Regola 8',
        'rule-9': 'Esperto Regola 9',
        'rule-10': 'Esperto Regola 10',
        'rule-11': 'Esperto Regola 11',
        'rule-12': 'Esperto Regola 12',
        'rule-13': 'Esperto Regola 13',
        'rule-14': 'Esperto Regola 14',
        'rule-15': 'Esperto Regola 15',
        'rule-16': 'Esperto Regola 16',
        'rule-17': 'Esperto Regola 17',
        'streak-7': '7 Giorni Consecutivi',
        'streak-30': '30 Giorni Consecutivi',
        'master': 'Maestro del Regolamento'
    };
    
    return badgeTitles[badgeId] || 'Badge Sconosciuto';
}

// Carica le domande da rivedere (domande sbagliate)
function loadReviewQuestions() {
    // Trova le domande sbagliate
    const wrongQuestions = [];
    for (let i = 0; i < quizResults.answeredCorrectly.length; i++) {
        if (!quizResults.answeredCorrectly[i]) {
            wrongQuestions.push({
                index: i,
                question: quizResults.questions[i]
            });
        }
    }
    
    // Se non ci sono domande sbagliate, nascondi la sezione
    if (wrongQuestions.length === 0) {
        document.querySelector('.review-section').style.display = 'none';
        return;
    }
    
    // Mostra fino a 3 domande sbagliate
    const questionsToShow = wrongQuestions.slice(0, 3);
    
    // Aggiungi le domande alla lista di revisione
    questionsToShow.forEach(item => {
        const question = item.question;
        
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        
        const reviewQuestion = document.createElement('div');
        reviewQuestion.className = 'review-question';
        reviewQuestion.textContent = question.question;
        
        const reviewAnswers = document.createElement('div');
        reviewAnswers.className = 'review-answers';
        
        // Aggiungi le risposte
        for (let i = 0; i < question.options.length; i++) {
            const letterOption = String.fromCharCode(65 + i); // A, B, C
            
            const reviewAnswer = document.createElement('div');
            reviewAnswer.className = 'review-answer';
            
            // Evidenzia la risposta corretta e quella sbagliata
            if (letterOption === question.correctAnswer) {
                reviewAnswer.classList.add('correct');
            }
            
            reviewAnswer.textContent = `${letterOption}: ${question.options[i]}`;
            reviewAnswers.appendChild(reviewAnswer);
        }
        
        reviewItem.appendChild(reviewQuestion);
        reviewItem.appendChild(reviewAnswers);
        reviewList.appendChild(reviewItem);
    });
    
    // Se ci sono più di 3 domande sbagliate, mostra un messaggio
    if (wrongQuestions.length > 3) {
        const moreMessage = document.createElement('div');
        moreMessage.className = 'more-wrong-questions';
        moreMessage.textContent = `+ altre ${wrongQuestions.length - 3} domande da rivedere`;
        reviewList.appendChild(moreMessage);
    }
}

// Mostra effetto confetti per i risultati positivi
function showConfetti() {
    const percentageCorrect = (quizResults.correctAnswers / quizResults.totalQuestions) * 100;
    
    if (percentageCorrect >= 70) {
        // In una versione più completa, qui si potrebbe implementare un effetto confetti
        console.log('Confetti shown for good results!');
    }
}

// Funzione per ritentare il quiz
function retryQuiz() {
    // Ricarica la stessa modalità di quiz
    const quizSession = {
        mode: quizResults.mode,
        ruleId: quizResults.ruleId
    };
    
    sessionStorage.setItem('retryQuiz', JSON.stringify(quizSession));
    window.location.href = 'index.html?retry=true';
}

// Funzione per tornare alla home
function goHome() {
    window.location.href = 'index.html';
}

// Funzione per condividere i risultati
function shareResults() {
    // In una versione più completa, qui si potrebbe implementare la condivisione
    // Questa è una versione semplificata
    
    const text = `Ho ottenuto ${quizResults.score} punti rispondendo a ${quizResults.correctAnswers} domande su ${quizResults.totalQuestions} nel Quiz Regolamentari Calcio a 11!`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Quiz Regolamentari Calcio a 11',
            text: text,
            url: window.location.origin
        }).then(() => {
            console.log('Shared successfully');
        }).catch(err => {
            console.error('Error sharing:', err);
            alert('Condivisione non supportata su questo dispositivo.');
        });
    } else {
        // Fallback per browser che non supportano l'API Share
        alert('Condivisione non supportata su questo browser. Copia questo testo: ' + text);
    }
}
