export type GameStatus = 'playing' | 'win' | 'lose';

export type Theme = {
  id: string;
  name: string;
  fileName: string;
};

export const THEMES: Theme[] = [
  { id: 'animals', name: 'Животные', fileName: 'animals_theme.txt' },
  { id: 'countries', name: 'Страны', fileName: 'countries_theme.txt' },
  { id: 'flowers', name: 'Цветы', fileName: 'flowers_theme.txt' },
  { id: 'professions', name: 'Профессии', fileName: 'professions_theme.txt' },
  { id: 'transport', name: 'Транспорт', fileName: 'transport_theme.txt' },
];

