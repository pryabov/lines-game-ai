export const es = {
  header: {
    title: 'Juego de Líneas',
    language: 'Idioma',
    theme: 'Tema'
  },
  game: {
    score: 'Puntuación',
    max: 'Máx',
    nextBalls: 'Próximas bolas',
    resetGame: 'Reiniciar juego',
    help: 'Ayuda'
  },
  resetConfirm: {
    title: 'Reiniciar juego',
    message: '¿Estás seguro de que quieres reiniciar el juego? Tu progreso se perderá.',
    confirm: 'Reiniciar',
    cancel: 'Cancelar'
  },
  gameOver: {
    title: 'Juego terminado',
    yourScore: 'Tu puntuación',
    playAgain: 'Jugar de nuevo',
    lowScore: '¡Buen intento! Prueba de nuevo para mejorar tu puntuación.',
    mediumScore: '¡Buen trabajo! ¡Estás mejorando!',
    highScore: '¡Gran puntuación! ¡Realmente eres bueno en esto!',
    excellentScore: '¡Increíble! ¡Eres un maestro del juego de Líneas!'
  },
  helpDialog: {
    title: 'Cómo jugar',
    rules: 'Reglas del juego',
    scoring: 'Puntuación',
    tips: 'Consejos',
    gotIt: '¡Entendido!',
    rulesItems: [
      'El juego se juega en una cuadrícula de 9×9 donde aparecen bolas de colores.',
      'En cada turno, se añaden 3 nuevas bolas de colores aleatorios al tablero.',
      'Selecciona una bola y haz clic en una celda vacía para moverla.',
      'Las bolas solo pueden moverse si hay un camino libre (sin otras bolas en el camino).',
      'Forma líneas de 5 o más bolas del mismo color (horizontal, vertical o diagonalmente).',
      'Cuando se forman líneas, las bolas desaparecen y ganas puntos.',
      'El juego termina cuando el tablero está lleno de bolas y no hay más movimientos posibles.'
    ],
    scoringItems: [
      '5 bolas en línea: 10 puntos',
      '6 bolas en línea: 12 puntos',
      '7 bolas en línea: 18 puntos',
      '8 bolas en línea: 28 puntos',
      '9 bolas en línea: 42 puntos'
    ],
    tipsItems: [
      'Planifica tus movimientos cuidadosamente para evitar llenar el tablero demasiado rápido.',
      'Intenta formar múltiples líneas a la vez para obtener puntuaciones más altas.',
      'Presta atención a las próximas 3 bolas que aparecerán.'
    ]
  },
  settingsDialog: {
    title: 'Configuración',
    theme: 'Tema',
    selectLanguage: 'Seleccionar idioma',
    ballAnimation: 'Movimiento de bola',
    ballAnimationStepByStep: 'Paso a paso',
    ballAnimationShowPath: 'Mostrar ruta y mover',
    ballAnimationInstant: 'Movimiento instantáneo',
    close: 'Cerrar'
  },
  footer: {
    description: 'Juego de Líneas - Junta 5 o más bolas del mismo color en una línea',
    email: 'support@lines98.fun',
    contactUs: 'Contáctenos'
  }
}; 