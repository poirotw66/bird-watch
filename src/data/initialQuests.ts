import { QuestData } from '@/models/QuestData';

/**
 * 初始任務資料
 * 提供遊戲開始時的基礎任務
 */
export const INITIAL_QUESTS: QuestData[] = [
  // 教學任務
  {
    id: 'tutorial_001',
    title: '賞鳥入門',
    description: '歡迎來到賞鳥世界！讓我們從基礎開始，學習如何觀察鳥類。',
    type: 'tutorial',
    difficulty: 'easy',
    objectives: [
      {
        id: 'obj_001',
        type: 'discover',
        description: '發現你的第一隻鳥',
        target: 1,
        current: 0,
        completed: false,
        optional: false
      },
      {
        id: 'obj_002',
        type: 'identify',
        description: '成功識別一隻鳥',
        target: 1,
        current: 0,
        completed: false,
        optional: false
      }
    ],
    rewards: {
      experience: 100,
      coins: 50,
      items: []
    },
    prerequisites: [],
    status: 'available',
    progress: 0,
    repeatable: false,
    story: {
      intro: '賞鳥是一項需要耐心和觀察力的活動。讓我們從最基本的開始吧！',
      completion: '做得好！你已經掌握了賞鳥的基本技巧。'
    }
  },
  {
    id: 'tutorial_002',
    title: '攝影初體驗',
    description: '學習如何拍攝鳥類照片，記錄你的發現。',
    type: 'tutorial',
    difficulty: 'easy',
    objectives: [
      {
        id: 'obj_003',
        type: 'photograph',
        description: '拍攝 3 張鳥類照片',
        target: 3,
        current: 0,
        completed: false,
        optional: false
      }
    ],
    rewards: {
      experience: 150,
      coins: 75,
      items: []
    },
    prerequisites: ['tutorial_001'],
    status: 'locked',
    progress: 0,
    repeatable: false,
    story: {
      intro: '照片是記錄鳥類的最好方式。讓我們學習如何拍攝吧！',
      completion: '很棒的照片！你已經是一位合格的鳥類攝影師了。'
    }
  },

  // 主線任務
  {
    id: 'main_001',
    title: '台灣常見鳥類',
    description: '認識台灣最常見的鳥類，建立你的鳥類圖鑑基礎。',
    type: 'main',
    difficulty: 'easy',
    objectives: [
      {
        id: 'obj_004',
        type: 'discover',
        description: '發現 5 種不同的鳥類',
        target: 5,
        current: 0,
        completed: false,
        optional: false,
        birdTypes: ['common']
      },
      {
        id: 'obj_005',
        type: 'photograph',
        description: '拍攝 5 張良好品質以上的照片',
        target: 5,
        current: 0,
        completed: false,
        optional: false,
        photoQuality: 'good'
      }
    ],
    rewards: {
      experience: 300,
      coins: 150,
      items: [
        { id: 'binoculars_basic', quantity: 1 }
      ]
    },
    prerequisites: ['tutorial_002'],
    status: 'locked',
    progress: 0,
    repeatable: false
  },
  {
    id: 'main_002',
    title: '稀有鳥類探索',
    description: '尋找台灣的稀有鳥類，擴展你的圖鑑收藏。',
    type: 'main',
    difficulty: 'medium',
    objectives: [
      {
        id: 'obj_006',
        type: 'discover',
        description: '發現 3 種稀有鳥類',
        target: 3,
        current: 0,
        completed: false,
        optional: false,
        birdTypes: ['uncommon', 'rare']
      },
      {
        id: 'obj_007',
        type: 'identify',
        description: '成功識別 10 隻鳥類',
        target: 10,
        current: 0,
        completed: false,
        optional: false
      }
    ],
    rewards: {
      experience: 500,
      coins: 250,
      items: [
        { id: 'camera_advanced', quantity: 1 }
      ]
    },
    prerequisites: ['main_001'],
    status: 'locked',
    progress: 0,
    repeatable: false
  },

  // 支線任務
  {
    id: 'side_001',
    title: '完美攝影師',
    description: '挑戰拍攝高品質的鳥類照片。',
    type: 'side',
    difficulty: 'medium',
    objectives: [
      {
        id: 'obj_008',
        type: 'photograph',
        description: '拍攝 3 張優秀品質的照片',
        target: 3,
        current: 0,
        completed: false,
        optional: false,
        photoQuality: 'excellent'
      }
    ],
    rewards: {
      experience: 400,
      coins: 200,
      title: '完美攝影師'
    },
    prerequisites: ['tutorial_002'],
    status: 'locked',
    progress: 0,
    repeatable: false
  },
  {
    id: 'side_002',
    title: '觀察大師',
    description: '展現你的觀察技巧，達到高識別準確率。',
    type: 'side',
    difficulty: 'hard',
    objectives: [
      {
        id: 'obj_009',
        type: 'identify',
        description: '連續成功識別 5 隻鳥類',
        target: 5,
        current: 0,
        completed: false,
        optional: false,
        accuracy: 100
      }
    ],
    rewards: {
      experience: 600,
      coins: 300,
      title: '觀察大師'
    },
    prerequisites: ['main_001'],
    status: 'locked',
    progress: 0,
    repeatable: false
  },

  // 每日任務
  {
    id: 'daily_001',
    title: '每日觀察',
    description: '完成今天的鳥類觀察任務。',
    type: 'daily',
    difficulty: 'easy',
    objectives: [
      {
        id: 'obj_010',
        type: 'discover',
        description: '發現 3 隻鳥類',
        target: 3,
        current: 0,
        completed: false,
        optional: false
      }
    ],
    rewards: {
      experience: 100,
      coins: 50
    },
    prerequisites: [],
    status: 'available',
    progress: 0,
    repeatable: true,
    dailyReset: true
  },
  {
    id: 'daily_002',
    title: '每日攝影',
    description: '完成今天的攝影任務。',
    type: 'daily',
    difficulty: 'easy',
    objectives: [
      {
        id: 'obj_011',
        type: 'photograph',
        description: '拍攝 5 張照片',
        target: 5,
        current: 0,
        completed: false,
        optional: false
      }
    ],
    rewards: {
      experience: 120,
      coins: 60
    },
    prerequisites: [],
    status: 'available',
    progress: 0,
    repeatable: true,
    dailyReset: true
  },

  // 收集任務
  {
    id: 'collect_001',
    title: '圖鑑收藏家',
    description: '收集完整的台灣鳥類圖鑑。',
    type: 'side',
    difficulty: 'expert',
    objectives: [
      {
        id: 'obj_012',
        type: 'collect',
        description: '解鎖所有鳥類圖鑑',
        target: 8,
        current: 0,
        completed: false,
        optional: false
      }
    ],
    rewards: {
      experience: 1000,
      coins: 500,
      gems: 10,
      title: '圖鑑大師'
    },
    prerequisites: ['main_002'],
    status: 'locked',
    progress: 0,
    repeatable: false
  },

  // 探索任務
  {
    id: 'explore_001',
    title: '棲息地探索者',
    description: '探索不同的鳥類棲息地。',
    type: 'side',
    difficulty: 'medium',
    objectives: [
      {
        id: 'obj_013',
        type: 'explore',
        description: '訪問 3 個不同的棲息地',
        target: 3,
        current: 0,
        completed: false,
        optional: false
      }
    ],
    rewards: {
      experience: 350,
      coins: 175,
      items: [
        { id: 'map_advanced', quantity: 1 }
      ]
    },
    prerequisites: ['main_001'],
    status: 'locked',
    progress: 0,
    repeatable: false
  }
];

/**
 * 獲取初始可用任務
 */
export function getInitialAvailableQuests(): QuestData[] {
  return INITIAL_QUESTS.filter(quest => quest.status === 'available');
}

/**
 * 獲取教學任務
 */
export function getTutorialQuests(): QuestData[] {
  return INITIAL_QUESTS.filter(quest => quest.type === 'tutorial');
}

/**
 * 獲取每日任務
 */
export function getDailyQuests(): QuestData[] {
  return INITIAL_QUESTS.filter(quest => quest.type === 'daily');
}

// Made with Bob
