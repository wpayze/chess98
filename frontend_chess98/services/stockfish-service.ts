export type StockfishCallback = (message: string) => void;
export class StockfishService {
  private worker: Worker | null = null;
  private fullWorker: Worker | null = null;
  private onMessageCallback: StockfishCallback | null = null;
  private analyzing: boolean = false;
  private scriptPath: string;
  private isMobile: boolean;
  private onEngineSwitch?: () => void;
  private lastAnalyzedFen: string | null = null;
  private lastAnalyzedDepth: number | null = null;

  constructor() {
    this.isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    this.scriptPath = "/stockfish-17-lite.js";
    this.initWorker();
  }

  private initWorker() {
    if (!this.worker) {
      this.worker = new Worker(this.scriptPath);
      this.worker.onmessage = (e: MessageEvent) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(e.data);
        }
      };
      this.postMessage("uci");
      this.postMessage("ucinewgame");
    }
  }

  private upgradeToFullVersion() {
    if (!this.fullWorker) return;

    this.worker?.terminate();
    this.worker = this.fullWorker;
    this.fullWorker = null;

    this.scriptPath = "/stockfish-17.js";

    this.worker.onmessage = (e: MessageEvent) => {
      if (this.onMessageCallback) {
        this.onMessageCallback(e.data);
      }
    };

    if (this.onEngineSwitch) {
      this.onEngineSwitch();
    }

    if (this.analyzing && this.lastAnalyzedFen) {
      this.postMessage("uci");
      this.postMessage("ucinewgame");
      this.postMessage(`position fen ${this.lastAnalyzedFen}`);
      this.postMessage(`go depth ${this.lastAnalyzedDepth ?? 30}`);
    }
  }

  public setOnEngineSwitch(callback: () => void) {
    this.onEngineSwitch = callback;
  }

  public setOnMessageCallback(callback: StockfishCallback) {
    this.onMessageCallback = callback;
  }

  public waitUntilReady(): Promise<void> {
    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data === "readyok") {
          this.worker?.removeEventListener("message", handler);
          resolve();
        }
      };

      if (this.worker) {
        this.worker.addEventListener("message", handler);
        this.postMessage("isready");
      } else {
        resolve(); // fallback
      }
    });
  }

  private postMessage(command: string) {
    this.worker?.postMessage(command);
  }

  private initFullWorkerIfNeeded() {
    if (this.fullWorker || this.isMobile) return;

    this.fullWorker = new Worker("/stockfish-17.js");
    this.fullWorker.onmessage = (e: MessageEvent) => {
      if (e.data === "uciok" || e.data === "readyok") {
        this.upgradeToFullVersion();
      }
    };

    this.fullWorker.postMessage("uci");
    this.fullWorker.postMessage("isready");
  }

  public startAnalysis(fen: string, depth: number = 20) {
    this.initWorker();
    this.initFullWorkerIfNeeded();

    this.postMessage(`position fen ${fen}`);
    this.postMessage(`go depth ${depth}`);
    this.analyzing = true;
    this.lastAnalyzedFen = fen;
    this.lastAnalyzedDepth = depth;
  }

  public async restartAnalysis(fen: string, depth: number = 20) {
    if (!this.worker) return;

    this.stopAnalysis();
    await this.waitUntilReady();
    this.postMessage(`position fen ${fen}`);
    this.postMessage(`go depth ${depth}`);
    this.analyzing = true;
  }

  public stopAnalysis() {
    if (this.worker && this.analyzing) {
      this.postMessage("stop");
      this.analyzing = false;
    }
  }

  public toggleAnalysis(fen: string) {
    if (this.analyzing) {
      this.stopAnalysis();
    } else {
      this.startAnalysis(fen);
    }
  }

  public terminate() {
    this.worker?.terminate();
    this.worker = null;
    this.fullWorker?.terminate();
    this.fullWorker = null;
    this.analyzing = false;
  }

  public getScriptPath(): string {
    return this.scriptPath;
  }
}
