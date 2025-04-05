export type StockfishCallback = (message: string) => void;

export class StockfishService {
  private worker: Worker | null = null;
  private onMessageCallback: StockfishCallback | null = null;
  private analyzing: boolean = false;
  private scriptPath: string;

  constructor(scriptPath?: string) {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    this.scriptPath = scriptPath || (isMobile
      ? "/stockfish-17-lite-single.js"
      : "/stockfish-17.js");
  }

  /**
   * Inicializa el worker si aún no existe.
   */
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

  /**
   * Espera hasta que el motor esté listo (`readyok`).
   */
  public waitUntilReady(): Promise<void> {
    return new Promise((resolve) => {
      const handler = (e: MessageEvent) => {
        if (e.data === "readyok") {
          if (this.worker) {
            this.worker.removeEventListener("message", handler);
          }
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

  /**
   * Establece el callback para recibir respuestas del motor.
   */
  public setOnMessageCallback(callback: StockfishCallback) {
    this.onMessageCallback = callback;
  }

  /**
   * Envía un comando UCI al motor.
   */
  private postMessage(command: string) {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  /**
   * Inicia análisis para una posición dada.
   */
  public startAnalysis(fen: string, depth: number = 20) {
    this.initWorker();
    this.postMessage(`position fen ${fen}`);
    this.postMessage(`go depth ${depth}`);
    this.analyzing = true;
  }

  /**
   * Reinicia análisis después de detener y esperar readiness.
   */
  public async restartAnalysis(fen: string, depth: number = 20) {
    if (!this.worker) return;

    this.stopAnalysis();
    await this.waitUntilReady();
    this.postMessage(`position fen ${fen}`);
    this.postMessage(`go depth ${depth}`);
    this.analyzing = true;
  }

  /**
   * Detiene análisis actual si está en curso.
   */
  public stopAnalysis() {
    if (this.worker && this.analyzing) {
      this.postMessage("stop");
      this.analyzing = false;
    }
  }

  /**
   * Alterna entre analizar y detener.
   */
  public toggleAnalysis(fen: string) {
    if (this.analyzing) {
      this.stopAnalysis();
    } else {
      this.startAnalysis(fen);
    }
  }

  /**
   * Termina completamente el worker.
   */
  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.analyzing = false;
    }
  }

  /**
   * Devuelve el nombre del script cargado (para mostrar en UI).
   */
  public getScriptPath(): string {
    return this.scriptPath;
  }
}
