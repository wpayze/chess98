export type StockfishCallback = (message: string) => void;

export class StockfishService {
  private worker: Worker | null = null;
  private onMessageCallback: StockfishCallback | null = null;
  private analyzing: boolean = false;

  /**
   * Inicializa el worker si aún no existe.
   * Usa stockfish-17-lite-single.js directamente (ya es un worker).
   */
  private initWorker() {
    if (!this.worker) {
      const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      const workerScript = isMobile
        ? "/stockfish-17-lite-single.js"
        : "/stockfish-17.js";
  
      this.worker = new Worker(workerScript);
  
      this.worker.onmessage = (e: MessageEvent) => {
        if (this.onMessageCallback) {
          this.onMessageCallback(e.data);
        }
      };
  
      this.postMessage("uci");
      this.postMessage("ucinewgame");
    }
  }  

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
   * Envía un mensaje (comando UCI) al motor.
   */
  private postMessage(command: string) {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  /**
   * Inicia el análisis continuo con la posición actual (FEN).
   */
  public startAnalysis(fen: string, depth: number = 20) {
    this.initWorker();
    this.postMessage(`position fen ${fen}`);
    this.postMessage(`go depth ${depth}`);
    this.analyzing = true;
  }

  public async restartAnalysis(fen: string, depth: number = 20) {
    if (!this.worker) return;

    this.stopAnalysis(); // Detenemos el actual
    await this.waitUntilReady(); // Esperamos que esté listo

    // Recién ahí arrancamos el nuevo análisis
    this.postMessage(`position fen ${fen}`);
    this.postMessage(`go depth ${depth}`);
    this.analyzing = true;
  }

  /**
   * Detiene el análisis si está en curso.
   */
  public stopAnalysis() {
    if (this.worker && this.analyzing) {
      this.postMessage("stop");
      this.analyzing = false;
    }
  }

  /**
   * Alterna entre analizar y detener análisis.
   */
  public toggleAnalysis(fen: string) {
    if (this.analyzing) {
      this.stopAnalysis();
    } else {
      this.startAnalysis(fen);
    }
  }

  /**
   * Termina el worker completamente.
   */
  public terminate() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.analyzing = false;
    }
  }
}
