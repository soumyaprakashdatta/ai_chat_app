import { Row, Col, Layout, Input, Button, Card, Flex } from 'antd'
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
  backgroundColor: '#003a8c',
}

const footerStyle = {
  textAlign: 'center',
  height: 100,
  position: 'sticky',
  bottom: '0',
  padding: '0px',
  backgroundColor: '#001d66',
}

const intialChat = [
  { role: 'client', message: 'what is a cat ?' },
  {
    role: 'server',
    message:
      'A cat is a small carnivorous mammal that is often kept as a pet. It belongs to the Felidae family and is known for its independent nature, agility, and hunting skills. Cats have a flexible body, sharp retractable claws, keen senses, and are known for their grooming behavior. They come in various breeds, colors, and patterns, with the domestic cat being the most popular pet species.',
  },
]

function Chat() {
  const [message, setMessage] = useState('')
  const [chatList, setChatList] = useState(intialChat)
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
          <Col
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: '10px',
            }}
            span={24}
          >
            <Flex vertical={true}>
              {chatList.map((chat, index) => {
                return <ChatMessageBox index={index} chat={chat} />
              })}
            </Flex>
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

function ChatMessageBox({ index, chat }) {
  console.log(index, chat)
  return (
    <Card
      style={{
        width: '100%',
        backgroundColor: chat.role == 'client' ? '#7cb305' : '#91caff',
        marginBottom: '10px',
        padding: '0px',
      }}
      key={index}
    >
      <div>{chat.message}</div>
    </Card>
  )
}

export default Chat
