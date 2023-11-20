import React, { useState, useEffect } from 'react'
import { Row, Col, Button, Form, Input, Upload, Alert, Card } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { DEFAULT_CONTEXT } from './const'

function ChatContext({ currentContext, setContext }) {
  let [loading, setLoading] = useState(false)
  let [error, setError] = useState(null)

  let [loadingContexts, setLoadingContexts] = useState(false)
  let [contexts, setContexts] = useState([])
  let [contextError, setContextError] = useState(null)

  const [form] = Form.useForm()

  useEffect(() => {
    fetchAvailableContexts()
  }, [])

  async function fetchAvailableContexts() {
    setLoadingContexts(true)
    try {
      let raw = await fetch('http://localhost:8000/available_contexts')
      let res = await raw.json()
      setContexts(res.contexts)
    } catch (ex) {
      console.error(`error while fetching contexts, err=${JSON.stringify(ex)}`)
      setContextError(JSON.stringify(ex))
    }
    setLoadingContexts(false)
  }

  async function submitNewForm(values) {
    let name = values.name
    let files = values.files

    const formData = new FormData()
    formData.append('name', name)
    for (let i = 0; i < files.length; i++) {
      console.log(files[i])
      formData.append('files', files[i].originFileObj)
    }

    try {
      setLoading(true)
      setError(null)
      let raw = await fetch('/upload_files', {
        method: 'POST',
        body: formData,
      })
      let res = await raw.json()
      console.log(`successfully uploaded files, res=${JSON.stringify(res)}`)
      form.resetFields()
      fetchAvailableContexts()
    } catch (ex) {
      console.error(`error while uploading files, err=${JSON.stringify(ex)}`)
      setError(JSON.stringify(ex))
    }
    setLoading(false)
  }

  const getFile = (e) => {
    if (Array.isArray(e)) {
      return e
    }
    return e && e.fileList
  }

  return (
    <Row
      style={{ backgroundColor: '#262626', color: '#fafafa', height: '100vh' }}
    >
      <Col
        span={24}
        style={{
          paddingTop: '20px',
        }}
      >
        <Row>
          <Col
            span={24}
            style={{
              textAlign: 'center',
            }}
          >
            <div>Create context</div>
          </Col>
          <Col span={24} style={{ padding: '20px' }}>
            <Form
              name="context-form"
              style={{
                maxWidth: '100%',
                backgroundColor: '#1f1f1f',
                color: '#fafafa',
                padding: '20px',
                borderRadius: '10px',
              }}
              onFinish={submitNewForm}
              autoComplete="off"
              form={form}
              layout="vertical"
            >
              <Form.Item
                label={
                  <label style={{ color: '#fafafa' }}>Enter context name</label>
                }
                name="name"
                style={{
                  color: '#fafafa',
                }}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={
                  <label style={{ color: '#fafafa' }}>
                    Select PDF files (max 3)
                  </label>
                }
                htmlFor="files"
                name="files"
                getValueFromEvent={getFile}
              >
                <Upload
                  accept=".pdf"
                  beforeUpload={(file) => false}
                  multiple={true}
                  maxCount={3}
                  showUploadList={true}
                >
                  <Button
                    icon={<UploadOutlined style={{ color: '#141414' }} />}
                  >
                    Upload
                  </Button>
                </Upload>
              </Form.Item>

              <Form.Item
                wrapperCol={{
                  offset: 8,
                  span: 16,
                }}
              >
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={loading}
                  loading={loading}
                >
                  Create
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </Col>
      <Col span={24}>
        <Row>
          <Col
            span={24}
            style={{
              textAlign: 'center',
            }}
          >
            <div>Available contexts</div>
          </Col>
          <Col span={24} style={{ padding: '20px' }}>
            {loadingContexts ? <div>Loading contexts ...</div> : null}
            {contextError ? (
              <div>Error while fetching contextx, err={contextError}</div>
            ) : null}
            <Card
              style={{
                width: '100%',
                backgroundColor: '#e6f4ff',
                marginBottom: '10px',
              }}
              key="OpenAI-GPT"
            >
              <Row>
                <Col span={18}>
                  <div>
                    {DEFAULT_CONTEXT}{' '}
                    {DEFAULT_CONTEXT == currentContext ? (
                      <span>( active )</span>
                    ) : null}
                  </div>
                </Col>
                <Col span={6}>
                  <Button
                    onClick={() => {
                      setContext(DEFAULT_CONTEXT)
                    }}
                    disabled={DEFAULT_CONTEXT == currentContext}
                  >
                    Select
                  </Button>
                </Col>
              </Row>
            </Card>

            {contexts.map((context) => (
              <Card
                style={{
                  width: '100%',
                  backgroundColor: '#b7eb8f',
                  marginBottom: '10px',
                }}
                key={context}
              >
                <Row>
                  <Col span={18}>
                    <div>
                      {context}{' '}
                      {context == currentContext ? (
                        <span>( active )</span>
                      ) : null}
                    </div>
                  </Col>
                  <Col span={6}>
                    <Button
                      onClick={() => {
                        setContext(context)
                      }}
                      disabled={context == currentContext}
                    >
                      Select
                    </Button>
                  </Col>
                </Row>
              </Card>
            ))}
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

export default ChatContext
