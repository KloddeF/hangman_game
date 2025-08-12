import React, { useState, useEffect, useCallback } from 'react';
import Menu from '../Menu/Menu';
import { GameStatus, Theme } from '../../modules/types';
import HangmanCanvas from '../HangmanCanvas/HangmanCanvas';

const Game: React.FC = () => {
  const [word, setWord] = useState(''); // загаданное слово
  const [usedLetters, setUsedLetters] = useState<string[]>([]); // использованные букавы
  const [mistakesCount, setMistakesCount] = useState(0); // счетчик ошибок
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing'); // статус игры
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null); // текущая тема

  const [timeLeft, setTimeLeft] = useState(0); // для таймера
  const [timerActive, setTimerActive] = useState(false);
  const [showTimeBonus, setShowTimeBonus] = useState(false); // анимация бонуса времени

  const [gameMode, setGameMode] = useState<'normal' | 'rating'>( // режим игры
    () => (localStorage.getItem('hangmanGameMode') as 'normal' | 'rating') || 'normal'
  );
  const [score, setScore] = useState(0); // очки и бонусы
  const [showScoreBonus, setShowScoreBonus] = useState(false);
  const [hintUsed, setHintUsed] = useState(false); // подсказки
  const [showHintTooltip, setShowHintTooltip] = useState(false);
  const [bonusPoints, setBonusPoints] = useState(0);
  const [wordsGuessed, setWordsGuessed] = useState(0); // счетчик угаданных слов

  // сохранение игры в историю
  const saveToGamesboard = useCallback((themeName: string, finalScore: number, hints: number, words: number, isWin: boolean) => {
    const gameEntry = {
      gameId: Date.now(),
      theme: themeName,
      score: finalScore,
      hintsUsed: hints,
      wordsGuessed: words,
      isWinner: isWin,
      timestamp: new Date().toISOString()
    };

    const savedGamesboard = localStorage.getItem('hangmanGamesboard');
    const gamesboard = savedGamesboard ? JSON.parse(savedGamesboard) : [];
    
    gamesboard.push(gameEntry);
    localStorage.setItem('hangmanGamesboard', JSON.stringify(gamesboard));
  }, []);

  // обработчик изменения режима игры
  const handleModeChange = useCallback((mode: 'normal' | 'rating') => {
    setGameMode(mode);
    localStorage.setItem('hangmanGameMode', mode);
  }, []);

  // эффект для таймера
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0 && gameStatus === 'playing') {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0 && gameStatus === 'playing') {
      setGameStatus('lose');
      setTimerActive(false);
    }

    return () => clearInterval(interval);
  }, [timerActive, timeLeft, gameStatus]);

  // проверка условий вина/луза
  useEffect(() => {
    if (!word || !currentTheme) return;

    const isWon = word.split('').every(letter => 
      usedLetters.includes(letter) || letter === ' '
    );
    
    if (isWon) {
      if (gameMode === 'rating') {
        const timeBonus = Math.floor(timeLeft / 60);
        const totalPoints = 10 + timeBonus;

        setBonusPoints(totalPoints);
        setWordsGuessed(prev => prev + 1);
        
        setScore(prev => {
          const newScore = prev + totalPoints;
          setShowScoreBonus(true);
          setTimeout(() => setShowScoreBonus(false), 1000);
          return newScore;
        });

        loadWord(currentTheme);
        setUsedLetters([]);
        setMistakesCount(0);
        setHintUsed(false);
      } else {
        setGameStatus('win');
        stopTimer();
      }
    }

    if (mistakesCount >= 6) {
      setGameStatus('lose');
      stopTimer();
    }
  }, [word, usedLetters, mistakesCount, currentTheme, gameMode, timeLeft]);

   // сохранение результата при завершении игры
  useEffect(() => {
    if (gameStatus !== 'playing' && gameMode === 'rating' && currentTheme) {
      const isWin = gameStatus === 'win';
      saveToGamesboard(
        currentTheme.name, 
        score, 
        hintUsed ? 1 : 0, 
        isWin ? wordsGuessed + 1 : wordsGuessed,
        isWin
      );
    }
  }, [gameStatus, gameMode, score, currentTheme, hintUsed, wordsGuessed, saveToGamesboard]);

  const stopTimer = () => {
    setTimerActive(false);
  };

   // форматирование времени
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const loadWord = useCallback(async (theme: Theme) => {
    const response = await fetch(`/wordbank/${theme.fileName}`);
    const text = await response.text();
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    const randomIndex = Math.floor(Math.random() * lines.length);
    setWord(lines[randomIndex].toUpperCase());
  }, []);

  // обработчик выбора темы
  const handleThemeSelect = useCallback(async (theme: Theme, mode: 'normal' | 'rating') => {
    handleModeChange(mode);
    setCurrentTheme(theme);
    setUsedLetters([]);
    setMistakesCount(0);
    setScore(0);
    setWordsGuessed(0);
    setHintUsed(false);
    setGameStatus('playing');
    setTimeLeft(mode === 'normal' ? 60 : 5 * 60);
    setTimerActive(true);
    await loadWord(theme);
  }, [handleModeChange, loadWord]);

  // обработчик клика по букаве
  const handleLetterClick = (letter: string) => {
    if (gameStatus !== 'playing' || usedLetters.includes(letter)) return;
    
    setUsedLetters([...usedLetters, letter]);
    if (word.includes(letter)) {
      if (gameMode === 'normal') {
        setTimeLeft(prev => Math.min(prev + 5, 60));
        setShowTimeBonus(true);
        setTimeout(() => setShowTimeBonus(false), 1000);
      }
    } else {
      setMistakesCount(prev => prev + 1);
    }
  };

  // использование подсказки
  const useHint = () => {
    if (gameMode === 'normal') {
      if (!hintUsed) {
        const hiddenLetters = word.split('')
          .filter(letter => !usedLetters.includes(letter) && letter !== ' ');
        if (hiddenLetters.length > 0) {
          const randomLetter = hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)];
          setUsedLetters([...usedLetters, randomLetter]);
          setHintUsed(true);
        }
      }
    } else {
      if (score >= 5 && !hintUsed) {
        const hiddenLetters = word.split('')
          .filter(letter => !usedLetters.includes(letter) && letter !== ' ');
        if (hiddenLetters.length > 0) {
          const randomLetter = hiddenLetters[Math.floor(Math.random() * hiddenLetters.length)];
          setUsedLetters([...usedLetters, randomLetter]);
          setScore(prev => prev - 5);
          setHintUsed(true);
        }
      }
    }
  };

  // сброс игры
  const resetGame = useCallback(async () => {
    if (!currentTheme) return;
    setUsedLetters([]);
    setMistakesCount(0);
    setScore(0);
    setWordsGuessed(0);
    setHintUsed(false);
    setGameStatus('playing');
    setTimeLeft(gameMode === 'normal' ? 60 : 5 * 60);
    setTimerActive(true);
    await loadWord(currentTheme);
  }, [currentTheme, loadWord, gameMode]);

  // рендер загаданного слова
  const renderWord = () => {
    return word.split('').map((letter, index) => (
      <span key={index}>
        {usedLetters.includes(letter) || gameStatus !== 'playing' ? letter : '*'}
      </span>
    ));
  };

  const cyrillicAlphabet = [
    ['Й', 'Ц', 'У', 'К', 'Е', 'Н', 'Г', 'Ш', 'Щ', 'З', 'Х', 'Ъ'],
    ['Ф', 'Ы', 'В', 'А', 'П', 'Р', 'О', 'Л', 'Д', 'Ж', 'Э'],
    ['Я', 'Ч', 'С', 'М', 'И', 'Т', 'Ь', 'Б', 'Ю']
  ];

  if (!currentTheme) {
    return <Menu onThemeSelect={handleThemeSelect} />;
  }

  return (
    <div className="game-container">
      <h1>Тема: {currentTheme.name}</h1>
      
      <div className="game-info">
        <div>
          Время: <strong>{formatTime(timeLeft)}</strong> / {gameMode === 'normal' ? '1:00' : '5:00'}
          {showTimeBonus && <span className="bonus">+5 сек</span>}
        </div>
        
        {gameMode === 'rating' && (
          <div>
            Очки: <strong>{score}</strong>
            {showScoreBonus && (
              <span className="bonus">
                +{bonusPoints} очков
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mistakes-hint">
        <div>Ошибки: {mistakesCount}/6</div>
        
        <div className="hint-container">
          <button
            onClick={useHint}
            disabled={
              (gameMode === 'normal' && hintUsed) || 
              (gameMode === 'rating' && (hintUsed || score < 5))
            }
            onMouseEnter={() => setShowHintTooltip(true)}
            onMouseLeave={() => setShowHintTooltip(false)}
            className="hint-button"
          >
            Подсказка
          </button>
          
          {showHintTooltip && (
            <div className="hint-tooltip">
              {gameMode === 'normal' 
                ? 'Открывает случайную букву (1 раз за игру)' 
                : `Открывает случайную букву (-5 очков, 1 раз на слово)`}
            </div>
          )}
        </div>
      </div>

      <HangmanCanvas mistakes={mistakesCount} />

      <div className="word-display">
        {renderWord()}
      </div>

      {gameStatus !== 'playing' ? (
        <div className="game-result">
          <h2>
            {gameStatus === 'win' 
              ? 'Поздравляем! Вы выиграли!' 
              : `Вы проиграли! Вы не угадали слово: ${word}`}
          </h2>
          <div className="result-buttons">
            <button onClick={resetGame} className="play-again-button">
              Играть ещё
            </button>
            <button
              onClick={() => setCurrentTheme(null)}
              className="menu-button"
            >
              В меню
            </button>
          </div>
        </div>
      ) : (
        <div className="keyboard">
          {cyrillicAlphabet.map((row, i) => (
            <div key={i} className="keyboard-row">
              {row.map(letter => (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={usedLetters.includes(letter)}
                  className={`keyboard-key ${usedLetters.includes(letter) ? 'used' : ''}`}
                >
                  {letter}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Game;