// app.js - Funzionalità principale dell'app Quiz

// Variabili globali
let quizData = null;
let userStats = {
    totalCompleted: 0,
    bestScore: 0,
    currentStreak: 0,
    lastPlayed: null,
    completedRules: [],
    badges: []
};

// Elementi DOM
const quickModeBtn = document.getElementById('quick-mode');
const ruleModeBtn = document.getElementById('rule-mode');
const examModeBtn = document.getElementById('exam-mode');
const dailyModeBtn = document.getElementById('daily-mode');
const rulesScreen = document.getElementById('rules-screen');
const homeScreen = document.getElementById('home-screen');
const rulesGrid = document.getElementById('rules-grid');
const backToHomeBtn = document.getElementById('back-to-home');

// Inizializzazione
document.addEventListener('DOMContentLoaded', init);

async function init() {
    await loadQuizData();
    loadUserStats();
    updateStatsDisplay();
    setupEventListeners();
    checkDailyStreak();
}

// Carica i dati del quiz
async function loadQuizData() {
    try {
        const response = await fetch('data/questions.json');
        quizData = await response.json();
        console.log('Quiz data loaded:', quizData.totalQuestions, 'questions');
    } catch (error) {
        console.error('Error loading quiz data:', error);
        alert('Errore nel caricamento delle domande. Riprova più tardi.');
    }
}

// Carica le statistiche utente dal localStorage
function loadUserStats() {
    const savedStats = localStorage.getItem('quizUserStats');
    if (savedStats) {
        userStats = JSON.parse(savedStats);
        console.log('User stats loaded from localStorage');
    }
}

// Salva le statistiche utente nel localStorage
function saveUserStats() {
    localStorage.setItem('quizUserStats', JSON.stringify(userStats));
}

// Aggiorna la visualizzazione delle statistiche
function updateStatsDisplay() {
    document.getElementById('total-completed').textContent = userStats.totalCompleted;
    document.getElementById('best-score').textContent = userStats.bestScore;
    document.getElementById('current-streak').textContent = userStats.currentStreak;
    
    // Aggiorna i badge
    updateBadgesDisplay();
}

// Aggiorna la visualizzazione dei badge
function updateBadgesDisplay() {
    const badgesContainer = document.getElementById('earned-badges');
    badgesContainer.innerHTML = '';
    
    if (userStats.badges && userStats.badges.length > 0) {
        userStats.badges.forEach(badge => {
            const badgeElement = document.createElement('div');
            badgeElement.className = 'badge';
            badgeElement.innerHTML = `<i class="fas ${getBadgeIcon(badge)}"></i>`;
            badgeElement.title = getBadgeTitle(badge);
            badgesContainer.appendChild(badgeElement);
        });
    } else {
        // Badge bloccato di esempio
        const lockedBadge = document.createElement('div');
        lockedBadge.className = 'badge locked';
        lockedBadge.innerHTML = '<i class="fas fa-lock"></i>';
        badgesContainer.appendChild(lockedBadge);
    }
}

// Ottieni l'icona per un badge specifico
function getBadgeIcon(badgeId) {
    const badgeIcons = {
        'rule-1': 'fa-field-hockey',
        'rule-2': 'fa-whistle',
        'rule-3': 'fa-stopwatch',
        'rule-4': 'fa-tshirt',
        'rule-5': 'fa-user-referee',
        'rule-6': 'fa-flag',
        'rule-7': 'fa-stopwatch',
        'rule-8': 'fa-baseball',
        'rule-9': 'fa-football-ball',
        'rule-10': 'fa-running',
        'rule-11': 'fa-referee',
        'rule-12': 'fa-hand-paper',
        'rule-13': 'fa-bullhorn',
        'rule-14': 'fa-flag-checkered',
        'rule-15': 'fa-user-injured',
        'rule-16': 'fa-ruler',
        'rule-17': 'fa-futbol',
        'streak-7': 'fa-calendar-check',
        'streak-30': 'fa-calendar-star',
        'master': 'fa-trophy'
    };
    
    return badgeIcons[badgeId] || 'fa-medal';
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

// Configura event listeners
function setupEventListeners() {
    quickModeBtn.addEventListener('click', () => startQuiz('quick'));
    examModeBtn.addEventListener('click', () => startQuiz('exam'));
    dailyModeBtn.addEventListener('click', () => startQuiz('daily'));
    ruleModeBtn.addEventListener('click', showRulesScreen);
    backToHomeBtn.addEventListener('click', showHomeScreen);
}

// Mostra la schermata di selezione delle regole
function showRulesScreen() {
    homeScreen.classList.add('hidden');
    rulesScreen.classList.remove('hidden');
    
    // Popola la griglia delle regole
    populateRulesGrid();
}

// Popola la griglia delle regole
function populateRulesGrid() {
    rulesGrid.innerHTML = '';
    
    // Ottieni tutte le regole uniche dal dataset
    const rules = new Set();
    quizData.questions.forEach(q => {
        if (q.rule && !isNaN(q.rule)) {
            rules.add(parseInt(q.rule));
        }
    });
    
    // Converti il Set in un array e ordina
    const sortedRules = Array.from(rules).sort((a, b) => a - b);
    
    // Crea le card per ogni regola
    sortedRules.forEach(rule => {
        const ruleCard = document.createElement('div');
        ruleCard.className = 'rule-card';
        
        // Aggiungi la classe 'completed' se l'utente ha completato questa regola
        if (userStats.completedRules && userStats.completedRules.includes(rule)) {
            ruleCard.classList.add('completed');
        }
        
        ruleCard.innerHTML = `<h3>Regola ${rule}</h3>`;
        ruleCard.addEventListener('click', () => startQuiz('rule', rule));
        
        rulesGrid.appendChild(ruleCard);
    });
    
    // Aggiungi anche le regole speciali NFOT e ASS
    const specialRules = ['ASS', 'NFOT'];
    specialRules.forEach(rule => {
        const ruleCard = document.createElement('div');
        ruleCard.className = 'rule-card';
        
        // Aggiungi la classe 'completed' se l'utente ha completato questa regola
        if (userStats.completedRules && userStats.completedRules.includes(rule)) {
            ruleCard.classList.add('completed');
        }
        
        ruleCard.innerHTML = `<h3>${rule}</h3>`;
        ruleCard.addEventListener('click', () => startQuiz('rule', rule));
        
        rulesGrid.appendChild(ruleCard);
    });
}

// Mostra la schermata principale
function showHomeScreen() {
    rulesScreen.classList.add('hidden');
    homeScreen.classList.remove('hidden');
}

// Controlla lo streak giornaliero
function checkDailyStreak() {
    const today = new Date().toDateString();
    
    if (!userStats.lastPlayed) {
        // Prima volta che l'utente gioca
        userStats.currentStreak = 0;
    } else {
        const lastPlayed = new Date(userStats.lastPlayed);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastPlayed.toDateString() === yesterday.toDateString()) {
            // L'utente ha giocato ieri, mantieni lo streak
        } else if (lastPlayed.toDateString() === today) {
            // L'utente ha già giocato oggi
        } else {
            // L'utente ha saltato almeno un giorno, azzera lo streak
            userStats.currentStreak = 0;
        }
    }
    
    saveUserStats();
}

// Avvia il quiz
function startQuiz(mode, ruleId = null) {
    // Prepara i parametri del quiz
    let numQuestions = 10;
    let filterFunction = null;
    let subtitle = '';
    
    switch (mode) {
        case 'quick':
            numQuestions = 10;
            subtitle = 'Quiz Rapido';
            break;
        case 'exam':
            numQuestions = 30;
            subtitle = 'Esame Completo';
            break;
        case 'daily':
            numQuestions = 5;
            subtitle = 'Sfida Quotidiana';
            // Usa un seed basato sulla data per generare sempre le stesse domande in un giorno
            const today = new Date();
            const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
            Math.seedrandom(seed.toString());
            break;
        case 'rule':
            numQuestions = 10;
            subtitle = `Regola ${ruleId}`;
            filterFunction = (q) => q.rule == ruleId;
            break;
    }
    
    // Filtra le domande se necessario
    let availableQuestions = quizData.questions;
    if (filterFunction) {
        availableQuestions = quizData.questions.filter(filterFunction);
    }
    
    // Mescola e seleziona le domande
    const shuffledQuestions = shuffleArray(availableQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(numQuestions, shuffledQuestions.length));
    
    // Salva le domande nella sessionStorage
    const quizSession = {
        mode: mode,
        ruleId: ruleId,
        questions: selectedQuestions,
        subtitle: subtitle
    };
    
    sessionStorage.setItem('currentQuiz', JSON.stringify(quizSession));
    
    // Reindirizza alla pagina del quiz
    window.location.href = 'quiz.html';
}

// Funzione per mescolare un array (algoritmo Fisher-Yates)
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Polyfill per seedrandom
Math.seedrandom = function(seed) {
    let mw = seed;
    
    // Funzione hash semplice
    mw = ((mw >>> 16) ^ mw) * 0x45d9f3b;
    mw = ((mw >>> 16) ^ mw) * 0x45d9f3b;
    mw = (mw >>> 16) ^ mw;
    
    // Sovrascrive Math.random
    const next = () => {
        mw = (mw * 9301 + 49297) % 233280;
        return mw / 233280;
    };
    
    Math.random = next;
};