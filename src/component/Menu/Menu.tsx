import React, { useState, useEffect } from 'react';
import { Theme } from '../../modules/types';

interface MenuProps {
  onThemeSelect: (theme: Theme, mode: 'normal' | 'rating') => void;
}

//тип для записи в таблицу
interface GameEntry {
  gameId: number;
  theme: string;
  score: number;
  hintsUsed: number;
  wordsGuessed: number;
  isWinner: boolean;
  timestamp: string;
}

//состояние для режима игры (из локалстораге или обычный по умолчанию)
const Menu: React.FC<MenuProps> = ({ onThemeSelect }) => {
  const [gameMode, setGameMode] = useState<'normal' | 'rating'>(
    () => (localStorage.getItem('hangmanGameMode') as 'normal' | 'rating') || 'normal'
  );
  const [showTooltip, setShowTooltip] = useState(false);
  const [showGamesboard, setShowGamesboard] = useState(false);
  const [gamesboard, setGamesboard] = useState<GameEntry[]>([]);

  //загрузка истории игр при монтировании компонента
  useEffect(() => {
    const savedGamesboard = localStorage.getItem('hangmanGamesboard');
    if (savedGamesboard) {
      const games = JSON.parse(savedGamesboard);
      const sortedGames = games.sort((a: GameEntry, b: GameEntry) => { //сортирорвка: победа - очки - время
        if (a.isWinner !== b.isWinner) return a.isWinner ? -1 : 1;
        if (a.score !== b.score) return b.score - a.score;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      setGamesboard(sortedGames);
    }
  }, []);

  //массив тем
  const themes = [
    { id: 'animals', name: 'Животные', fileName: 'animals_theme.txt' },
    { id: 'countries', name: 'Страны', fileName: 'countries_theme.txt' },
    { id: 'flowers', name: 'Цветы', fileName: 'flowers_theme.txt' },
    { id: 'professions', name: 'Профессии', fileName: 'professions_theme.txt' },
    { id: 'transport', name: 'Транспорт', fileName: 'transport_theme.txt' }
  ];

  //переключение режимов игры
  const handleModeChange = () => {
    const newMode = gameMode === 'normal' ? 'rating' : 'normal';
    setGameMode(newMode);
    localStorage.setItem('hangmanGameMode', newMode);
  };

  //кнопка скрытия таблицы игр
  const toggleGamesboard = () => {
    setShowGamesboard(!showGamesboard);
  };

  return (
    <div className="menu-container">
      <h2>Виселица</h2>
      <div>Выберите тему и режим игры</div>
      
      <div className="mode-selector">
        <div className="tooltip-wrapper">
          <span
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="tooltip-icon"
          >
            ?
          </span>
          {showTooltip && (
            <div className="tooltip">
              {gameMode === 'normal' ? (
                <div>
                  <strong>Обычный режим:</strong>
                  <ul>
                    <li>1 минута на игру</li>
                    <li>+5 секунд за правильную букву</li>
                    <li>6 ошибок - поражение</li>
                    <li>одна подсказка на игру</li>
                  </ul>
                </div>
              ) : (
                <div>
                  <strong>Рейтинговый режим:</strong>
                  <ul>
                    <li>5 минут на игру</li>
                    <li>+10 очков за каждое угаданное слово</li>
                    <li>+ очки за каждую оставшуюся минуту</li>
                    <li>6 ошибок на слово</li>
                    <li>счетчик ошибок сбрасывается после каждого угаданного слова</li>
                    <li>одна подсказка на слово</li>
                    <li>подсказка стоит 5 очков</li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <button 
          onClick={handleModeChange} 
          className="mode-button"
          data-mode={gameMode}
        >
          {gameMode === 'normal' ? 'Обычный' : 'Рейтинг'}
        </button>
        
        <button onClick={toggleGamesboard} className="gamesboard-button">
          История игр
        </button>
      </div>
      
      <div className="theme-buttons">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onThemeSelect(theme, gameMode)}
            className="theme-button"
          >
            {theme.name}
          </button>
        ))}
      </div>
      
      {showGamesboard && (
        <div className="gamesboard">
          <h2>История игр</h2>
          {gamesboard.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Тема</th>
                  <th>Очки</th>
                  <th>Подсказки</th>
                  <th>Угадано слов</th>
                  <th>Результат</th>
                  <th>Дата и время</th>
                </tr>
              </thead>
              <tbody>
                {gamesboard.map((entry) => (
                  <tr key={entry.gameId} className={entry.isWinner ? 'winner-row' : 'loser-row'}>
                    <td>{entry.theme}</td>
                    <td>{entry.score}</td>
                    <td>{entry.hintsUsed}</td>
                    <td>{entry.wordsGuessed}</td>
                    <td>{entry.isWinner ? 'Победа' : 'Поражение'}</td>
                    <td>{new Date(entry.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-games-message">Пока нет сохраненных игр</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Menu;