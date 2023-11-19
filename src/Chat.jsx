import { Row, Col, Space, Layout } from 'antd'
import React from 'react'
import { useState } from 'react'
const { Footer, Content } = Layout

const contentStyle = {
  textAlign: 'center',
  height: 750,
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#108ee9',
}

const footerStyle = {
  textAlign: 'center',
  color: '#fff',
  height: 100,
  backgroundColor: '#7dbcea',
}

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
    <Space
      direction="vertical"
      style={{ height: '100vh', width: '100%' }}
      size={[0, 48]}
    >
      <Layout>
        <Content style={contentStyle}>
          <Row>
            <Col>
              {chatList.map((chat, index) => {
                return (
                  <div
                    key={index}
                    style={{
                      backgroundColor:
                        chat.role == 'client' ? 'yellow' : 'cyan',
                    }}
                  >
                    <p>{chat.message}</p>
                  </div>
                )
              })}
            </Col>
            {loading ? <div>loading data ... </div> : null}
            {error ? <div>error: {JSON.stringify(error)}</div> : null}
          </Row>
        </Content>
        <Footer style={footerStyle}>
          <Col>
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
          </Col>
        </Footer>
      </Layout>
    </Space>
  )
}

export default Chat
