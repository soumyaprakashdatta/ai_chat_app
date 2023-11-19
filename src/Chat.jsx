import { Row, Col, Layout, Input, Button } from 'antd'
import React from 'react'
import { useState } from 'react'
import { SendOutlined } from '@ant-design/icons'
const { Footer, Content } = Layout

const { TextArea } = Input

const contentStyle = {
  textAlign: 'center',
  height: 'calc(100vh - 100px)',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#108ee9',
}

const footerStyle = {
  textAlign: 'center',
  height: 100,
  position: 'sticky',
  bottom: '0',
  padding: '0px',
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
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={contentStyle}>
        <Row>
          <Col>
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
          </Col>
          {loading ? <div>loading data ... </div> : null}
          {error ? <div>error: {JSON.stringify(error)}</div> : null}
        </Row>
      </Content>
      <Footer style={footerStyle}>
        <Row>
          <Col
            span={22}
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              'align-items': 'center',
              padding: '10px',
            }}
          >
            <TextArea
              showCount
              maxLength={100}
              onChange={handleInputText}
              placeholder="Type your prompt"
              style={{ height: 60, resize: 'none' }}
              value={message}
            />
          </Col>
          <Col
            span={2}
            style={{
              padding: '10px',
            }}
          >
            <Button
              onClick={() => getChatCompletions()}
              disabled={loading || message.trim().length == 0}
              block={true}
              icon={<SendOutlined />}
              size="large"
              type="primary"
              style={{
                height: '100%',
                width: '100%',
              }}
            />
          </Col>
        </Row>
      </Footer>
    </Layout>
  )
}

export default Chat
