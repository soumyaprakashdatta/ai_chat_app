import React from 'react'
import { useState } from 'react'

function Chat() {
  const [message, setMessage] = useState('')
  const [chatList, setChatList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function getChatCompletions() {
    setError(null)
    setLoading(true)

    let body = {
      prompt: {
        message: message,
      },
    }

    try {
      let raw = await fetch('/chat_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      let completion = await raw.text()

      const newList = [
        ...chatList,
        { role: 'client', message: message },
        { role: 'server', message: completion },
      ]
      setChatList(newList)
      setMessage('')
      setLoading(false)
    } catch (ex) {
      console.error(ex)
      setError(ex)
      setLoading(false)
    }
  }

  function handleInputText(e) {
    const value = e.target.value
    setMessage(value)
  }

  return (
    <div>
      <div>
        {chatList.map((chat, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: chat.role == 'client' ? 'yellow' : 'cyan',
              }}
            >
              <p>{chat.message}</p>
            </div>
          )
        })}
      </div>
      <div>
        <input
          type="text"
          value={message}
          placeholder="Type your message"
          onChange={handleInputText}
        />
        <div>
          <button
            onClick={() => getChatCompletions()}
            disabled={loading || message.trim().length == 0}
          >
            Send
          </button>
        </div>
      </div>
      {loading ? <div>loading data ... </div> : null}
      {error ? <div>error: {JSON.stringify(error)}</div> : null}
    </div>
  )
}

export default Chat
