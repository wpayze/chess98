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
  "time_control": "3+2"
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

> Se emite una vez que ambos jugadores se han conectado.

---

## ⚠️ Errores comunes

```json
{
  "type": "error",
  "message": "Invalid or missing time control"
}
```
