# 🧩 WebSocket Protocol

Este documento describe los mensajes aceptados y enviados por los WebSocket del sistema de emparejamiento y juego.

---

## 🎯 Conexión: Buscar partida

**Endpoint:**  
`ws://localhost:8000/ws/find_game?user_id=<UUID>`

---

### ▶️ Enviar: Buscar partida

```json
{
  "type": "find_game",
  "time_control": "3+2",
  "time_control_str": "blitz"
}
```

- `time_control`: debe ser un valor válido según `TimeControl` (ej: `"3+2"`, `"5+0"`, etc.)

---

### ❌ Enviar: Cancelar búsqueda

```json
{
  "type": "cancel_search",
  "time_control": "3+2"
}
```

---

### ⏳ Respuesta: En espera

```json
{
  "type": "waiting_for_match"
}
```

---

### ✅ Respuesta: Match encontrado

```json
{
  "type": "match_found",
  "game_id": "UUID"
}
```

---

## 🧠 Conexión: Partida

**Endpoint:**  
`ws://localhost:8000/ws/game/<game_id>?user_id=<UUID>`

---

### 🟢 Respuesta: Inicio de partida

```json
{
  "type": "game_start",
  "game_id": "UUID",
  "initial_fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "your_time": 180,
  "opponent_time": 180
}
```

### 🟢 Respuesta: Movimiento
```json
{
  "type": "move",
  "uci": "e2e4"
}
```

## 🚩 Resignarse

### ▶️ Enviar: Rendirse

```json
{
  "type": "resign"
}
```

### ✅ Respuesta: Fin de partida

```json
{
  "type": "game_over",
  "termination": "resignation",
  "result": "black_win"
}
```

---

## 🤝 Tablas

### ▶️ Enviar: Ofrecer tablas

```json
{
  "type": "draw_offer"
}
```

### 📨 Respuesta al oponente: Oferta de tablas recibida

```json
{
  "type": "draw_offer_received",
  "from": "UUID"
}
```

---

### ▶️ Enviar: Aceptar tablas

```json
{
  "type": "draw_accept"
}
```

### ✅ Respuesta: Fin de partida por acuerdo

```json
{
  "type": "game_over",
  "termination": "draw_agreement"
}
```

---

## 💬 Chat entre jugadores

### ▶️ Enviar: Mensaje de chat

```json
{
  "type": "chat_message",
  "message": "Buena suerte!"
}
```

### 📩 Recibir: Mensaje de chat del oponente

```json
{
  "type": "chat_message",
  "from": "UUID",
  "message": "Buena suerte!"
}
```

---

## ⏱️ Verificación de timeout

### ▶️ Enviar: Chequear timeout

```json
{
  "type": "check_timeout"
}
```

### ✅ Respuesta: Fin de partida por tiempo (si aplica)

```json
{
  "type": "game_over",
  "termination": "timeout",
  "result": "black_win"
}
```