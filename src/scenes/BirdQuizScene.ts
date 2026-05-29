import { Scene } from '@/core/Scene';
import { inputManager } from '@/core/InputManager';
import { eventBus, GameEvents } from '@/core/EventSystem';
import { TAIWAN_BIRD_CATALOG } from '@/data/taiwanBirdCatalog';
import { birdImageLoader } from '@/utils/birdImageLoader';
import { birdCallLoader } from '@/utils/birdCallLoader';
import { getViewport } from '@/utils/viewport';
import { drawPanel, roundRectPath } from '@/utils/canvasUi';
import { theme } from '@/utils/uiTheme';
import { HomeScene } from '@/scenes/HomeScene';
import type { SimpleBirdData } from '@/data/simpleBirds';

type QuizPromptType = 'image' | 'audio';
type QuizDifficulty = 'easy' | 'normal' | 'hard';

type QuizQuestion = {
  promptType: QuizPromptType;
  correctBird: SimpleBirdData;
  options: SimpleBirdData[];
  correctIndex: number;
};

type LeaderboardRecord = {
  score: number;
  correctCount: number;
  totalQuestions: number;
  difficulty: QuizDifficulty;
  playedAt: string;
};

type LeaderboardStorage = {
  records: LeaderboardRecord[];
};

type DifficultyConfig = {
  id: QuizDifficulty;
  label: string;
  totalQuestions: number;
  optionCount: number;
  imagePromptChance: number;
  scorePerCorrect: number;
};

export class BirdQuizScene extends Scene {
  private readonly storageKey: string = 'bird-quiz-leaderboard-v1';
  private readonly difficultyConfigs: DifficultyConfig[] = [
    {
      id: 'easy',
      label: '簡單',
      totalQuestions: 6,
      optionCount: 3,
      imagePromptChance: 0.8,
      scorePerCorrect: 10,
    },
    {
      id: 'normal',
      label: '普通',
      totalQuestions: 10,
      optionCount: 4,
      imagePromptChance: 0.6,
      scorePerCorrect: 12,
    },
    {
      id: 'hard',
      label: '困難',
      totalQuestions: 12,
      optionCount: 4,
      imagePromptChance: 0.35,
      scorePerCorrect: 16,
    },
  ];

  private selectedDifficultyIndex: number = 1;
  private isSelectingDifficulty: boolean = true;
  private totalQuestions: number = 10;
  private optionCount: number = 4;
  private imagePromptChance: number = 0.6;
  private scorePerCorrect: number = 10;
  private currentQuestionIndex: number = 0;
  private score: number = 0;
  private correctCount: number = 0;
  private question: QuizQuestion | null = null;
  private selectedIndex: number | null = null;
  private showingResult: boolean = false;
  private resultTimer: number = 0;
  private readonly resultDurationSeconds: number = 1.1;
  private isFinished: boolean = false;
  private mouseWasDown: boolean = false;

  private optionRects: Array<{ x: number; y: number; w: number; h: number }> = [];
  private soundButtonRect: { x: number; y: number; w: number; h: number } | null = null;
  private difficultyRects: Array<{ x: number; y: number; w: number; h: number }> = [];
  private difficultyStartRect: { x: number; y: number; w: number; h: number } | null = null;

  private audioContext: AudioContext | null = null;
  private htmlAudio: HTMLAudioElement | null = null;
  private currentCallPath: string | null = null;
  private audioAvailability = new Map<string, boolean>();
  private leaderboardRecords: LeaderboardRecord[] = [];
  /** Correct-answer birds already used this round (no repeat questions). */
  private usedCorrectBirdIds = new Set<string>();

  constructor() {
    super('BirdQuizScene');
  }

  public onEnter(): void {
    this.loadLeaderboard();
    this.isSelectingDifficulty = true;
    this.selectedDifficultyIndex = 1;
    this.applyDifficultyConfig(this.difficultyConfigs[this.selectedDifficultyIndex]);
    this.resetRoundState();
  }

  private resetRoundState(): void {
    this.currentQuestionIndex = 0;
    this.score = 0;
    this.correctCount = 0;
    this.selectedIndex = null;
    this.showingResult = false;
    this.resultTimer = 0;
    this.isFinished = false;
    this.mouseWasDown = false;
    this.question = null;
    this.optionRects = [];
    this.soundButtonRect = null;
    this.usedCorrectBirdIds.clear();
  }

  public onExit(): void {
    this.clear();
    this.stopBirdCallPlayback();
  }

  public update(deltaTime: number): void {
    super.update(deltaTime);

    if (inputManager.isKeyJustPressed('Escape')) {
      this.stopBirdCallPlayback();
      eventBus.emit(GameEvents.SCENE_LOAD_REQUEST, { scene: new HomeScene() });
      return;
    }

    if (this.isSelectingDifficulty) {
      this.handleDifficultySelectionInput();
      return;
    }

    if (this.isFinished) {
      if (
        inputManager.isKeyJustPressed('Enter') ||
        inputManager.isKeyJustPressed('Space')
      ) {
        eventBus.emit(GameEvents.SCENE_LOAD_REQUEST, { scene: new HomeScene() });
      }
      return;
    }

    if (!this.question) {
      this.generateQuestion();
      return;
    }

    if (this.showingResult) {
      this.resultTimer += deltaTime;
      if (this.resultTimer >= this.resultDurationSeconds) {
        this.advanceQuestion();
      }
      return;
    }

    this.handleKeyboardAnswer();
    this.handlePointerInput();
  }

  private handleDifficultySelectionInput(): void {
    if (
      inputManager.isKeyJustPressed('ArrowUp') ||
      inputManager.isKeyJustPressed('KeyW')
    ) {
      this.selectedDifficultyIndex =
        (this.selectedDifficultyIndex - 1 + this.difficultyConfigs.length) %
        this.difficultyConfigs.length;
    }
    if (
      inputManager.isKeyJustPressed('ArrowDown') ||
      inputManager.isKeyJustPressed('KeyS')
    ) {
      this.selectedDifficultyIndex =
        (this.selectedDifficultyIndex + 1) % this.difficultyConfigs.length;
    }
    if (
      inputManager.isKeyJustPressed('Enter') ||
      inputManager.isKeyJustPressed('Space')
    ) {
      this.startRoundByDifficulty(this.selectedDifficultyIndex);
      return;
    }

    const mouseDown = inputManager.isMouseButtonDown(0);
    const justClicked = mouseDown && !this.mouseWasDown;
    this.mouseWasDown = mouseDown;
    if (!justClicked) return;
    const { x, y } = inputManager.getMousePosition();

    for (let i = 0; i < this.difficultyRects.length; i++) {
      const rect = this.difficultyRects[i];
      if (x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h) {
        this.selectedDifficultyIndex = i;
        return;
      }
    }
    if (this.difficultyStartRect) {
      const r = this.difficultyStartRect;
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        this.startRoundByDifficulty(this.selectedDifficultyIndex);
      }
    }
  }

  private startRoundByDifficulty(index: number): void {
    const config = this.difficultyConfigs[index];
    this.applyDifficultyConfig(config);
    this.isSelectingDifficulty = false;
    this.resetRoundState();
    this.generateQuestion();
  }

  private applyDifficultyConfig(config: DifficultyConfig): void {
    this.totalQuestions = config.totalQuestions;
    this.optionCount = config.optionCount;
    this.imagePromptChance = config.imagePromptChance;
    this.scorePerCorrect = config.scorePerCorrect;
  }

  private getSelectedDifficulty(): DifficultyConfig {
    return this.difficultyConfigs[this.selectedDifficultyIndex];
  }

  private handleKeyboardAnswer(): void {
    const keyMap = ['Digit1', 'Digit2', 'Digit3', 'Digit4'];
    for (let index = 0; index < keyMap.length; index++) {
      if (index >= this.optionCount) break;
      if (inputManager.isKeyJustPressed(keyMap[index])) {
        this.submitAnswer(index);
        return;
      }
    }

    if (this.question?.promptType === 'audio' && inputManager.isKeyJustPressed('KeyP')) {
      this.playBirdCall(this.question.correctBird);
    }
  }

  private handlePointerInput(): void {
    const mouseDown = inputManager.isMouseButtonDown(0);
    const justClicked = mouseDown && !this.mouseWasDown;
    this.mouseWasDown = mouseDown;
    if (!justClicked) return;

    const { x, y } = inputManager.getMousePosition();

    if (this.question?.promptType === 'audio' && this.soundButtonRect) {
      const b = this.soundButtonRect;
      if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) {
        this.playBirdCall(this.question.correctBird);
        return;
      }
    }

    for (let index = 0; index < this.optionRects.length; index++) {
      const r = this.optionRects[index];
      if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) {
        this.submitAnswer(index);
        return;
      }
    }
  }

  private submitAnswer(optionIndex: number): void {
    if (!this.question || this.showingResult) return;
    if (optionIndex < 0 || optionIndex >= this.question.options.length) return;

    this.selectedIndex = optionIndex;
    this.showingResult = true;
    this.resultTimer = 0;

    if (optionIndex === this.question.correctIndex) {
      this.score += this.scorePerCorrect;
      this.correctCount += 1;
    }
  }

  private advanceQuestion(): void {
    this.stopBirdCallPlayback();
    this.currentQuestionIndex += 1;
    this.selectedIndex = null;
    this.showingResult = false;
    this.resultTimer = 0;

    if (this.currentQuestionIndex >= this.totalQuestions) {
      this.isFinished = true;
      this.saveRecord({
        score: this.score,
        correctCount: this.correctCount,
        totalQuestions: this.totalQuestions,
        difficulty: this.getSelectedDifficulty().id,
        playedAt: new Date().toISOString(),
      });
      this.question = null;
      this.optionRects = [];
      this.soundButtonRect = null;
      return;
    }

    this.generateQuestion();
  }

  private pickCorrectBirdForQuestion(): SimpleBirdData {
    let pool = TAIWAN_BIRD_CATALOG.filter((bird) => !this.usedCorrectBirdIds.has(bird.id));
    if (pool.length === 0) {
      this.usedCorrectBirdIds.clear();
      pool = [...TAIWAN_BIRD_CATALOG];
    }
    const correctBird = pool[Math.floor(Math.random() * pool.length)];
    this.usedCorrectBirdIds.add(correctBird.id);
    return correctBird;
  }

  private generateQuestion(): void {
    const correctBird = this.pickCorrectBirdForQuestion();
    const distractors = TAIWAN_BIRD_CATALOG
      .filter((bird) => bird.id !== correctBird.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(1, this.optionCount - 1));
    const options = [correctBird, ...distractors].sort(() => Math.random() - 0.5);
    const correctIndex = options.findIndex((bird) => bird.id === correctBird.id);
    const promptType: QuizPromptType =
      Math.random() < this.imagePromptChance ? 'image' : 'audio';

    this.question = { promptType, correctBird, options, correctIndex };
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  private stopBirdCallPlayback(): void {
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      this.htmlAudio.currentTime = 0;
      this.htmlAudio.src = '';
      this.htmlAudio = null;
      this.currentCallPath = null;
    }
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }

  private playBirdCall(bird: SimpleBirdData): void {
    const birdCallPath = birdCallLoader.getCallPath(bird.id);
    if (!birdCallPath) {
      this.playSyntheticBirdCall(bird);
      return;
    }
    const knownAvailability = this.audioAvailability.get(bird.id);
    if (knownAvailability !== false) {
      this.playBirdCallAudioFile(bird.id, birdCallPath, bird);
      return;
    }

    this.playSyntheticBirdCall(bird);
  }

  private playBirdCallAudioFile(
    birdId: string,
    filePath: string,
    bird: SimpleBirdData,
  ): void {
    if (!this.htmlAudio || this.currentCallPath !== filePath) {
      this.htmlAudio = new Audio(filePath);
      this.htmlAudio.preload = 'auto';
      this.currentCallPath = filePath;
    }
    const audio = this.htmlAudio;

    audio.currentTime = 0;
    void audio.play()
      .then(() => {
        this.audioAvailability.set(birdId, true);
      })
      .catch(() => {
        this.audioAvailability.set(birdId, false);
        this.playSyntheticBirdCall(bird);
      });
  }

  private playSyntheticBirdCall(bird: SimpleBirdData): void {
    const audio = this.getAudioContext();
    if (audio.state === 'suspended') {
      void audio.resume();
    }

    const now = audio.currentTime;
    const hash = this.hashBirdId(bird.id);
    const notes = [
      440 + (hash % 140),
      540 + ((hash >> 1) % 180),
      620 + ((hash >> 2) % 220),
    ];

    for (let i = 0; i < notes.length; i++) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = i % 2 === 0 ? 'triangle' : 'sine';
      oscillator.frequency.value = notes[i];
      oscillator.connect(gain);
      gain.connect(audio.destination);

      const start = now + i * 0.16;
      const end = start + 0.14;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, end);

      oscillator.start(start);
      oscillator.stop(end);
    }
  }

  private hashBirdId(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash;
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const { width: vw, height: vh } = getViewport(ctx);
    this.optionRects = [];
    this.soundButtonRect = null;
    this.difficultyRects = [];
    this.difficultyStartRect = null;

    const bg = ctx.createLinearGradient(0, 0, 0, vh);
    bg.addColorStop(0, '#1e2f24');
    bg.addColorStop(1, '#101a17');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, vw, vh);

    drawPanel(ctx, 14, 12, Math.min(vw - 28, 760), 74, { title: '問答模式' });
    ctx.fillStyle = theme.text;
    ctx.font = `15px ${theme.font}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      `題目 ${Math.min(this.currentQuestionIndex + 1, this.totalQuestions)}/${this.totalQuestions}  ·  分數 ${this.score}`,
      30,
      66,
    );

    if (this.isSelectingDifficulty) {
      this.renderDifficultySelection(ctx, vw, vh);
      return;
    }

    if (this.isFinished) {
      this.renderFinished(ctx, vw, vh);
      return;
    }
    if (!this.question) return;

    const contentW = Math.min(vw - 28, 760);
    const contentX = (vw - contentW) / 2;
    const questionBoxY = 100;
    const questionBoxH = Math.min(290, vh * 0.42);
    drawPanel(ctx, contentX, questionBoxY, contentW, questionBoxH, { title: '題目' });

    if (this.question.promptType === 'image') {
      this.renderImagePrompt(ctx, contentX, questionBoxY, contentW, questionBoxH);
    } else {
      this.renderAudioPrompt(ctx, contentX, questionBoxY, contentW, questionBoxH);
    }

    this.renderOptions(ctx, contentX, contentW, questionBoxY + questionBoxH + 14);
  }

  private renderDifficultySelection(
    ctx: CanvasRenderingContext2D,
    vw: number,
    vh: number,
  ): void {
    const panelW = Math.min(700, vw - 40);
    const panelH = Math.min(460, vh - 120);
    const panelX = (vw - panelW) / 2;
    const panelY = (vh - panelH) / 2;
    drawPanel(ctx, panelX, panelY, panelW, panelH, { title: '選擇難度' });

    const rowsTop = panelY + 66;
    const rowH = 58;
    for (let i = 0; i < this.difficultyConfigs.length; i++) {
      const config = this.difficultyConfigs[i];
      const y = rowsTop + i * (rowH + 10);
      const x = panelX + 18;
      const w = panelW - 36;
      this.difficultyRects.push({ x, y, w, h: rowH });
      const selected = i === this.selectedDifficultyIndex;
      roundRectPath(ctx, x, y, w, rowH, 12);
      ctx.fillStyle = selected ? 'rgba(110, 207, 138, 0.23)' : 'rgba(255,255,255,0.06)';
      ctx.fill();
      ctx.strokeStyle = selected ? 'rgba(110, 207, 138, 0.72)' : 'rgba(143,196,160,0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = theme.text;
      ctx.font = `bold 18px ${theme.font}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `${config.label} · ${config.totalQuestions} 題 · ${config.optionCount} 選項`,
        x + 16,
        y + rowH / 2,
      );
    }

    const startW = 230;
    const startH = 50;
    const startX = panelX + panelW - startW - 18;
    const startY = panelY + panelH - startH - 18;
    this.difficultyStartRect = { x: startX, y: startY, w: startW, h: startH };
    roundRectPath(ctx, startX, startY, startW, startH, 12);
    ctx.fillStyle = 'rgba(110, 207, 138, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(110, 207, 138, 0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.font = `bold 17px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.fillText('開始問答', startX + startW / 2, startY + startH / 2);

    const selected = this.getSelectedDifficulty();
    const best = this.getBestScore(selected.id);
    const rankTop = panelY + 268;
    ctx.fillStyle = theme.textMuted;
    ctx.font = `14px ${theme.font}`;
    ctx.textAlign = 'left';
    ctx.fillText(
      `目前難度歷史最佳：${best !== null ? `${best} 分` : '尚無紀錄'}`,
      panelX + 20,
      rankTop,
    );

    const topRecords = this.getTopRecords(selected.id, 3);
    for (let i = 0; i < topRecords.length; i++) {
      const row = topRecords[i];
      const rowY = rankTop + 26 + i * 22;
      const dateText = row.playedAt.slice(0, 10);
      ctx.fillText(
        `${i + 1}. ${row.score} 分  (${row.correctCount}/${row.totalQuestions})  ${dateText}`,
        panelX + 20,
        rowY,
      );
    }

    ctx.textAlign = 'center';
    ctx.fillText(
      '方向鍵 / W S 選擇難度，Enter / Space 開始，Esc 回首頁',
      panelX + panelW / 2,
      panelY + panelH - 54,
    );
  }

  private renderImagePrompt(
    ctx: CanvasRenderingContext2D,
    boxX: number,
    boxY: number,
    boxW: number,
    boxH: number,
  ): void {
    if (!this.question) return;
    ctx.fillStyle = theme.textMuted;
    ctx.font = `14px ${theme.font}`;
    ctx.textAlign = 'left';
    ctx.fillText('看圖猜鳥種', boxX + 16, boxY + 58);

    const img = birdImageLoader.getMedium(this.question.correctBird.id);
    const imageAreaX = boxX + 16;
    const imageAreaY = boxY + 72;
    const imageAreaW = boxW - 32;
    const imageAreaH = boxH - 90;

    roundRectPath(ctx, imageAreaX, imageAreaY, imageAreaW, imageAreaH, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fill();

    if (!img) {
      ctx.fillStyle = theme.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText('圖片載入中...', imageAreaX + imageAreaW / 2, imageAreaY + imageAreaH / 2);
      return;
    }

    const scale = Math.min(imageAreaW / img.width, imageAreaH / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const drawX = imageAreaX + (imageAreaW - drawW) / 2;
    const drawY = imageAreaY + (imageAreaH - drawH) / 2;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }

  private renderAudioPrompt(
    ctx: CanvasRenderingContext2D,
    boxX: number,
    boxY: number,
    boxW: number,
    boxH: number,
  ): void {
    if (!this.question) return;
    ctx.fillStyle = theme.textMuted;
    ctx.font = `14px ${theme.font}`;
    ctx.textAlign = 'left';
    ctx.fillText('聽聲猜鳥種', boxX + 16, boxY + 58);

    const buttonW = 220;
    const buttonH = 54;
    const buttonX = boxX + (boxW - buttonW) / 2;
    const buttonY = boxY + (boxH - buttonH) / 2 + 12;
    this.soundButtonRect = { x: buttonX, y: buttonY, w: buttonW, h: buttonH };

    roundRectPath(ctx, buttonX, buttonY, buttonW, buttonH, 12);
    ctx.fillStyle = 'rgba(110, 207, 138, 0.22)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(110, 207, 138, 0.78)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = theme.text;
    ctx.font = `bold 18px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('播放鳥叫聲 (P)', buttonX + buttonW / 2, buttonY + buttonH / 2);
  }

  private renderOptions(
    ctx: CanvasRenderingContext2D,
    boxX: number,
    boxW: number,
    startY: number,
  ): void {
    if (!this.question) return;

    const optionH = 54;
    const gap = 10;
    for (let i = 0; i < this.question.options.length; i++) {
      const y = startY + i * (optionH + gap);
      this.optionRects.push({ x: boxX, y, w: boxW, h: optionH });

      const isSelected = this.selectedIndex === i;
      const isCorrect = this.showingResult && i === this.question.correctIndex;
      const isWrongPick =
        this.showingResult && isSelected && i !== this.question.correctIndex;

      roundRectPath(ctx, boxX, y, boxW, optionH, 12);
      if (isCorrect) {
        ctx.fillStyle = 'rgba(76, 175, 80, 0.35)';
      } else if (isWrongPick) {
        ctx.fillStyle = 'rgba(239, 83, 80, 0.35)';
      } else if (isSelected) {
        ctx.fillStyle = 'rgba(110, 207, 138, 0.24)';
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.06)';
      }
      ctx.fill();

      ctx.strokeStyle = 'rgba(143, 196, 160, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = theme.text;
      ctx.font = `bold 17px ${theme.font}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      const option = this.question.options[i];
      ctx.fillText(`${i + 1}. ${option.name}`, boxX + 18, y + optionH / 2);
    }

    if (this.showingResult && this.selectedIndex !== null) {
      const correctBirdName = this.question.options[this.question.correctIndex].name;
      const message =
        this.selectedIndex === this.question.correctIndex
          ? '答對了！'
          : `答錯了，正確答案是：${correctBirdName}`;
      ctx.fillStyle = theme.text;
      ctx.font = `bold 16px ${theme.font}`;
      ctx.textAlign = 'center';
      ctx.fillText(message, boxX + boxW / 2, startY + 4 * 64 + 24);
    }
  }

  private renderFinished(ctx: CanvasRenderingContext2D, vw: number, vh: number): void {
    const panelW = Math.min(vw - 40, 560);
    const panelH = 320;
    const panelX = (vw - panelW) / 2;
    const panelY = (vh - panelH) / 2;
    drawPanel(ctx, panelX, panelY, panelW, panelH, { title: '問答完成' });

    ctx.fillStyle = theme.text;
    ctx.font = `bold 38px ${theme.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${this.score} 分`, panelX + panelW / 2, panelY + 106);
    ctx.font = `16px ${theme.font}`;
    ctx.fillStyle = theme.textMuted;
    ctx.fillText(
      `答對 ${this.correctCount}/${this.totalQuestions}`,
      panelX + panelW / 2,
      panelY + 142,
    );

    const difficulty = this.getSelectedDifficulty();
    const best = this.getBestScore(difficulty.id);
    ctx.fillText(
      `${difficulty.label} 模式最佳：${best !== null ? `${best} 分` : '尚無紀錄'}`,
      panelX + panelW / 2,
      panelY + 168,
    );

    const overallTop = this.getTopRecords(undefined, 3);
    for (let i = 0; i < overallTop.length; i++) {
      const row = overallTop[i];
      const difficultyLabel = this.difficultyConfigs.find((d) => d.id === row.difficulty)?.label ?? row.difficulty;
      ctx.fillText(
        `${i + 1}. ${row.score} 分 (${difficultyLabel})`,
        panelX + panelW / 2,
        panelY + 196 + i * 20,
      );
    }

    ctx.fillText('按 Enter / Space 回到首頁', panelX + panelW / 2, panelY + 278);
    ctx.fillText('按 Esc 可隨時離開問答模式', panelX + panelW / 2, panelY + 302);
  }

  private loadLeaderboard(): void {
    try {
      const raw = window.localStorage.getItem(this.storageKey);
      if (!raw) {
        this.leaderboardRecords = [];
        return;
      }
      const parsed = JSON.parse(raw) as LeaderboardStorage;
      if (!parsed.records || !Array.isArray(parsed.records)) {
        this.leaderboardRecords = [];
        return;
      }
      this.leaderboardRecords = parsed.records
        .filter((record) => typeof record.score === 'number')
        .slice(0, 50);
    } catch {
      this.leaderboardRecords = [];
    }
  }

  private saveRecord(record: LeaderboardRecord): void {
    this.leaderboardRecords = [...this.leaderboardRecords, record]
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);
    const payload: LeaderboardStorage = { records: this.leaderboardRecords };
    window.localStorage.setItem(this.storageKey, JSON.stringify(payload));
  }

  private getTopRecords(
    difficulty?: QuizDifficulty,
    limit: number = 5,
  ): LeaderboardRecord[] {
    return this.leaderboardRecords
      .filter((record) => (difficulty ? record.difficulty === difficulty : true))
      .slice(0, limit);
  }

  private getBestScore(difficulty: QuizDifficulty): number | null {
    const first = this.getTopRecords(difficulty, 1)[0];
    return first ? first.score : null;
  }
}

