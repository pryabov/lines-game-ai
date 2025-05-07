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
  footer: {
    description: '连线游戏 - 将5个或更多同色球排成一线。'
  }
}; 