type MoveMadeMessage = {
  type: "move_made";
  uci: string;
  san: string;
  fen: string;
  turn: "white" | "black";
  white_time: number;
  black_time: number;
};

type GameStartMessage = {
  type: "game_start";
  game_id: string;
  initial_fen: string;
  your_time: number;
  opponent_time: number;
  turn: "white" | "black";
};

type GameOverMessage = {
  type: "game_over";
  result: "white_win" | "black_win" | "draw";
  termination:
    | "checkmate"
    | "resignation"
    | "timeout"
    | "draw_agreement"
    | "stalemate"
    | "insufficient_material"
    | "fifty_move_rule"
    | "threefold_repetition";
  white_rating_change: number;
  black_rating_change: number;
};

type WaitingForOpponentMessage = {
  type: "waiting_for_opponent";
};

type DrawOfferReceivedMessage = {
  type: "draw_offer";
  from: string;
};

type DrawOfferDeclinedMessage = {
  type: "draw_offer_declined";
  from: string;
};

type ChatMessageReceived = {
  type: "chat_message";
  from: string;
  message: string;
};

type ReconnectedMessage = {
  type: "reconnected";
  message: string;
}

type IncomingMessage =
  | GameStartMessage
  | MoveMadeMessage
  | WaitingForOpponentMessage
  | GameOverMessage
  | ChatMessageReceived
  | DrawOfferReceivedMessage
  | DrawOfferDeclinedMessage
  | ReconnectedMessage
  | any;

type OutgoingMoveMessage = {
  type: "move";
  uci: string;
};

export class GameplayService {
  private socket: WebSocket | null = null;

  connect(
    gameId: string,
    userId: string,
    {
      onWaitingForOpponent,
      onGameReady,
      onMoveMade,
      onReconnected,
      onGameOver,
      onDrawOfferReceived,
      onDrawOfferDeclined,
      onChatMessage,
    }: {
      onWaitingForOpponent?: () => void;
      onGameReady?: (msg: GameStartMessage) => void;
      onMoveMade?: (msg: MoveMadeMessage) => void;
      onGameOver?: (msg: GameOverMessage) => void;
      onDrawOfferReceived?: (msg: DrawOfferReceivedMessage) => void;
      onChatMessage?: (msg: ChatMessageReceived) => void;
      onDrawOfferDeclined?: (msg: ChatMessageReceived) => void;
      onReconnected: (msg: ReconnectedMessage) => void;
    }
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
    const wsUrl =
      baseUrl.replace(/^http/, "ws") + `/ws/game/${gameId}?user_id=${userId}`;

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      console.log("WebSocket connected:", wsUrl);
    };

    this.socket.onmessage = (event) => {
      try {
        const data: IncomingMessage = JSON.parse(event.data);
        console.log({ message: data });

        switch (data.type) {
          case "waiting_for_opponent":
            onWaitingForOpponent?.();
            break;
          case "game_start":
            onGameReady?.(data);
            break;
          case "reconnected":
            onReconnected?.(data);
            break;
          case "move_made":
            onMoveMade?.(data);
            break;
          case "game_over":
            onGameOver?.(data);
            break;
          case "draw_offer":
            onDrawOfferReceived?.(data);
            break;
          case "draw_offer_declined":
            onDrawOfferDeclined?.(data);
            break;
          case "chat_message":
            onChatMessage?.(data);
            break;
          default:
            console.warn("Unhandled message type:", data);
        }
      } catch (error) {
        console.error("Invalid WebSocket message:", {event: event.data, error});
      }
    };

    this.socket.onclose = (event) => {
      console.warn("WebSocket closed:", event.reason);
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  sendResign() {
    this.send({ type: "resign" });
  }
  
  sendDrawOffer() {
    this.send({ type: "draw_offer" });
  }

  sendDrawDecline() {
    this.send({ type: "draw_decline" });
  }
  
  sendDrawAccept() {
    this.send({ type: "draw_accept" });
  }
  
  sendChatMessageWebSocket(username: string, message: string) {
    this.send({ type: "chat_message", username, message });
  }
  
  sendTimeoutCheck() {
    this.send({ type: "check_timeout" });
  }

  sendMove(uci: string) {
    const message: OutgoingMoveMessage = {
      type: "move",
      uci,
    };
    this.send(message);
  }
  
  
  private send(message: any) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not open. Message not sent:", message);
    }
  }

  disconnect() {
    this.socket?.close();
    this.socket = null;
  }
}

export const gameplayService = new GameplayService();
