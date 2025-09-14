export const zh = {
  header: {
    title: '连线游戏',
    language: '语言',
    theme: '主题'
  },
  game: {
    score: '得分',
    max: '最高',
    nextBalls: '下一组球',
    resetGame: '重新开始',
    help: '帮助'
  },
  resetConfirm: {
    title: '重新开始',
    message: '你确定要重新开始游戏吗？你的进度将会丢失。',
    confirm: '重置',
    cancel: '取消'
  },
  gameOver: {
    title: '游戏结束',
    yourScore: '你的得分',
    playAgain: '再玩一次',
    lowScore: '不错的尝试！再试一次以提高你的分数。',
    mediumScore: '做得好！你正在变得更好！',
    highScore: '太棒了！你真的很擅长这个！',
    excellentScore: '太神奇了！你是连线游戏大师！'
  },
  helpDialog: {
    title: '如何玩',
    rules: '游戏规则',
    scoring: '计分',
    tips: '技巧',
    gotIt: '明白了！',
    rulesItems: [
      '游戏在9×9的网格上进行，彩色球会出现在网格上。',
      '每回合，3个随机颜色的新球会被添加到棋盘上。',
      '选择一个球并点击空白格子来移动它。',
      '球只能在有清晰路径的情况下移动（路径上没有其他球）。',
      '形成5个或更多同色球的直线（水平、垂直或对角线）。',
      '当形成线时，球会消失，你将获得分数。',
      '当棋盘被球填满且没有可能的移动时，游戏结束。'
    ],
    scoringItems: [
      '5个球成一线：10分',
      '6个球成一线：12分',
      '7个球成一线：18分',
      '8个球成一线：28分',
      '9个球成一线：42分'
    ],
    tipsItems: [
      '仔细规划你的移动，避免过快填满棋盘。',
      '尝试同时设置多条线以获得更高分数。',
      '关注即将出现的3个球。'
    ]
  },
  settingsDialog: {
    title: '设置',
    theme: '主题',
    selectLanguage: '选择语言',
    ballAnimation: '球的移动',
    ballAnimationStepByStep: '逐步移动',
    ballAnimationShowPath: '显示路径后移动',
    ballAnimationInstant: '瞬间移动',
    close: '关闭'
  },
  consentDialog: {
    title: '分析同意',
    description1: '我们使用 Google Analytics 来改善您的游戏体验并了解我们的游戏如何被使用。这帮助我们在功能和改进方面做出更好的决定。',
    description2: '我们收集有关游戏使用的匿名数据，如分数、主题偏好和游戏内事件。所有数据都是匿名的，我们不收集任何个人身份信息。',
    description3: '您可以拒绝分析数据收集，您的选择将被记住。无论哪种方式，游戏都将完美运行。',
    accept: '接受',
    decline: '拒绝'
  },
  footer: {
    description: '连线游戏 - 将5个或更多相同颜色的球排成一线。',
    email: 'support@lines98.fun',
    contactUs: '联系我们'
  }
}; 