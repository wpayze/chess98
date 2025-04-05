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
      this.worker = new Worker("/stockfish-17-lite-single.js");

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
