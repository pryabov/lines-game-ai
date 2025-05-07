export const pl = {
  header: {
    title: 'Gra w Linie',
    language: 'Język',
    theme: 'Motyw'
  },
  game: {
    score: 'Wynik',
    max: 'Maks',
    nextBalls: 'Następne kule',
    resetGame: 'Nowa gra',
    help: 'Pomoc'
  },
  resetConfirm: {
    title: 'Nowa gra',
    message: 'Czy na pewno chcesz zacząć nową grę? Twój postęp zostanie utracony.',
    confirm: 'Resetuj',
    cancel: 'Anuluj'
  },
  gameOver: {
    title: 'Koniec gry',
    yourScore: 'Twój wynik',
    playAgain: 'Zagraj ponownie',
    lowScore: 'Dobra próba! Spróbuj jeszcze raz, aby poprawić swój wynik.',
    mediumScore: 'Dobra robota! Stajesz się lepszy!',
    highScore: 'Świetny wynik! Naprawdę dobrze Ci idzie!',
    excellentScore: 'Niesamowite! Jesteś mistrzem gry w Linie!'
  },
  helpDialog: {
    title: 'Jak grać',
    rules: 'Zasady gry',
    scoring: 'Punktacja',
    tips: 'Porady',
    gotIt: 'Rozumiem!',
    rulesItems: [
      'Gra toczy się na siatce 9×9, na której pojawiają się kolorowe kule.',
      'W każdej turze do planszy dodawane są 3 nowe kule o losowych kolorach.',
      'Wybierz kulę i kliknij puste pole, aby ją przenieść.',
      'Kule mogą się poruszać tylko wtedy, gdy istnieje wolna ścieżka (bez innych kul na drodze).',
      'Utwórz linie z 5 lub więcej kul tego samego koloru (poziomo, pionowo lub po przekątnej).',
      'Gdy linie są formowane, kule znikają, a Ty zdobywasz punkty.',
      'Gra kończy się, gdy plansza jest wypełniona kulami i nie ma możliwych ruchów.'
    ],
    scoringItems: [
      '5 kul w linii: 10 punktów',
      '6 kul w linii: 12 punktów',
      '7 kul w linii: 18 punktów',
      '8 kul w linii: 28 punktów',
      '9 kul w linii: 42 punkty'
    ],
    tipsItems: [
      'Planuj swoje ruchy uważnie, aby uniknąć zbyt szybkiego zapełnienia planszy.',
      'Staraj się ustawiać kilka linii jednocześnie, aby zdobywać więcej punktów.',
      'Zwracaj uwagę na następne 3 kule, które się pojawią.'
    ]
  },
  footer: {
    description: 'Gra w Linie - Ułóż 5 lub więcej kul tego samego koloru w jednej linii.'
  }
}; 