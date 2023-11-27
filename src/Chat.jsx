import {
  Row,
  Col,
  Layout,
  Input,
  Button,
  Card,
  Flex,
  Skeleton,
  Tag,
} from 'antd'
import React from 'react'
import { useState, useReducer, useRef, useEffect } from 'react'
import { SendOutlined } from '@ant-design/icons'
const { Footer, Content } = Layout

const { TextArea } = Input

const contentStyle = {
  textAlign: 'center',
  height: 'calc(100vh - 100px)',
  lineHeight: '120px',
  color: '#fff',
  backgroundColor: '#003a8c',
  overflow: 'auto',
}

const footerStyle = {
  textAlign: 'center',
  height: 100,
  position: 'sticky',
  bottom: '0',
  padding: '0px',
  backgroundColor: '#001d66',
}

const intialChatSample = [
  { role: 'client', message: 'what is a cat ?', context: 'abcd' },
  {
    role: 'server',
    message:
      'A cat is a small carnivorous mammal that is often kept as a pet. It belongs to the Felidae family and is known for its independent nature, agility, and hunting skills. Cats have a flexible body, sharp retractable claws, keen senses, and are known for their grooming behavior. They come in various breeds, colors, and patterns, with the domestic cat being the most popular pet species.',
    context: 'abcd',
  },
]

function chatReducer(state, action) {
  if (action.type == 'add') {
    console.log(state, action)
    return [...state, action.data]
  } else if (action.type == 'remove') {
    console.log(state, action)
    return state.filter((s) => !s.isLoading)
  }
  throw Error(`unknown action type, action=${JSON.stringify(action)}`)
}

function Chat({ currentContext }) {
  const [message, setMessage] = useState('')
  const [chatList, dispatch] = useReducer(chatReducer, [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatList])

  async function getChatCompletions() {
    setError(null)
    setLoading(true)

    dispatch({
      type: 'add',
      data: { role: 'client', message: message, context: currentContext },
    })
    dispatch({ type: 'add', data: { isLoading: true } })

    let body = {
      prompt: {
        message: message,
      },
      context: currentContext,
    }

    try {
      let raw = await fetch('/chat_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!raw.ok) {
        // error processing
        throw new Error(JSON.stringify(await raw.json()))
      }

      let completion = await raw.json()

      dispatch({ type: 'remove', data: {} })
      dispatch({
        type: 'add',
        data: {
          role: 'server',
          message: completion.completion,
          context: completion.context,
        },
      })
      setMessage('')
      setLoading(false)
    } catch (ex) {
      console.log('I am here error')
      console.error(ex)
      dispatch({ type: 'remove', data: {} })
      dispatch({
        type: 'add',
        data: {
          role: 'server',
          message: 'error while fetching completion!!',
          context: currentContext,
        },
      })
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
        <Row style={{ hieght: '100%' }}>
          <Col
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: '10px',
            }}
            span={24}
          >
            <Flex vertical={true} style={{ width: '100%' }}>
              {chatList.map((chat, index) => {
                return <ChatMessageBox index={index} chat={chat} />
              })}
              <div ref={bottomRef} />
            </Flex>
          </Col>
        </Row>
      </Content>
      <Footer style={footerStyle}>
        <Row>
          <Col
            span={22}
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
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
  function getBgColor(role) {
    if (role == 'client') return '#7cb305'
    if (role == 'server') return '#91caff'
    if (role == 'error') return '#ff7875'
    if (role == 'loading') return '#91caff'
    return '#7cb305'
  }
  return (
    <>
      {chat.isLoading ? (
        <Card
          style={{
            width: '100%',
            backgroundColor: getBgColor('loading'),
            marginBottom: '10px',
            padding: '0px',
            height: '100px',
          }}
          key={index}
          loading={chat.isLoading}
        >
          <Skeleton loading={chat.isLoading} avatar active></Skeleton>
        </Card>
      ) : (
        <Card
          style={{
            width: '100%',
            backgroundColor: getBgColor(chat.role),
            marginBottom: '10px',
            padding: '0px',
          }}
          key={index}
        >
          <Row>
            <Col span={18}>
              <div>{chat.message}</div>
            </Col>
            <Col span={2} />
            <Col
              span={4}
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}
            >
              <Tag color="#262626">context: {chat.context}</Tag>
            </Col>
          </Row>
        </Card>
      )}
    </>
  )
}

export default Chat
