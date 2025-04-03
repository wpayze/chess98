type MatchCallback = (data: { game_id: string }) => void
type CloseCallback = () => void

let socket: WebSocket | null = null
let currentTimeControl: string = ""

export function connectToMatchmaking(
  timeControl: string,
  timeControlStr: string,
  userId: string,
  onMatchFound: MatchCallback,
  onClose?: CloseCallback
) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  const wsUrl = baseUrl.replace(/^http/, "ws") + `/ws/find_game?user_id=${userId}`

  currentTimeControl = timeControl
  socket = new WebSocket(wsUrl)

  socket.onopen = () => {
    socket?.send(JSON.stringify({ type: "find_game", time_control: timeControl, time_control_str: timeControlStr }))
  }

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)

      if (data.type === "match_found") {
        onMatchFound({ game_id: data.game_id })
        disconnect()
      }
    } catch (err) {
      console.error("Error parsing WebSocket message", err)
    }
  }

  socket.onclose = () => {
    socket = null
    onClose?.()
  }

  socket.onerror = (error) => {
    console.error("WebSocket error", error)
    disconnect()
  }
}

export function disconnect() {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "cancel_search", time_control: currentTimeControl }))
    socket.close()
  }
  socket = null
}
