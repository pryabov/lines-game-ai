export const ja = {
  header: {
    title: 'ラインゲーム',
    language: '言語',
    theme: 'テーマ',
  },
  game: {
    score: 'スコア',
    max: '最高',
    nextBalls: '次のボール',
    resetGame: 'リセット',
    help: 'ヘルプ',
  },
  resetConfirm: {
    title: 'ゲームリセット',
    message: '本当にゲームをリセットしますか？進行状況は失われます。',
    confirm: 'リセット',
    cancel: 'キャンセル',
  },
  gameOver: {
    title: 'ゲームオーバー',
    yourScore: 'あなたのスコア',
    playAgain: 'もう一度プレイ',
    lowScore: 'よく頑張りました！もう一度挑戦してスコアを上げましょう。',
    mediumScore: '素晴らしい！上達していますね！',
    highScore: '素晴らしいスコアです！あなたは本当に上手ですね！',
    excellentScore: '驚くべき成績！あなたはラインゲームのマスターです！',
  },
  helpDialog: {
    title: '遊び方',
    rules: 'ゲームルール',
    scoring: 'スコアリング',
    tips: 'ヒント',
    gotIt: '了解！',
    rulesItems: [
      'ゲームは9×9のグリッドで行われ、色付きのボールが表示されます。',
      '各ターンごとに、ランダムな色の3つの新しいボールがボードに追加されます。',
      'ボールを選択し、空のセルをクリックして移動させます。',
      'ボールは明確な経路がある場合にのみ移動できます（途中に他のボールがない場合）。',
      '同じ色のボールを5つ以上一列に並べます（水平、垂直、または対角線）。',
      'ラインが形成されると、ボールが消え、ポイントを獲得します。',
      'ボードがボールでいっぱいになり、これ以上移動できなくなるとゲーム終了です。',
    ],
    scoringItems: [
      '5個のボールが一列：10ポイント',
      '6個のボールが一列：12ポイント',
      '7個のボールが一列：18ポイント',
      '8個のボールが一列：28ポイント',
      '9個のボールが一列：42ポイント',
    ],
    tipsItems: [
      'ボードがすぐに埋まらないように、移動を慎重に計画しましょう。',
      '高得点を狙うために、複数のラインを同時に作るようにしましょう。',
      '次に現れる3つのボールに注意を払いましょう。',
    ],
  },
  settingsDialog: {
    title: '設定',
    theme: 'テーマ',
    selectLanguage: '言語を選択',
    ballAnimation: 'ボールの動き',
    ballAnimationStepByStep: 'ステップごと',
    ballAnimationShowPath: 'パスを表示して移動',
    ballAnimationInstant: '瞬間移動',
    close: '閉じる',
  },
  consentDialog: {
    title: 'アナリティクスの同意',
    description1:
      'ゲーム体験を改善し、ゲームの使用方法を理解するためにGoogle Analyticsを使用しています。これにより、機能や改善についてより良い決定を下すことができます。',
    description2:
      'スコア、テーマ設定、ゲーム内イベントなど、ゲーム使用に関する匿名データを収集します。すべてのデータは匿名化され、個人を特定できる情報は収集しません。',
    description3:
      'アナリティクスの収集を拒否することもでき、その選択は記憶されます。ゲームはどちらでも完璧に動作します。',
    accept: '同意する',
    decline: '拒否する',
  },
  footer: {
    description: 'ラインゲーム - 同じ色のボールを5つ以上一列に並べましょう。',
    email: 'support@lines98.fun',
    contactUs: 'お問い合わせ',
  },
};
