import React, { useState } from 'react'
import { Row, Col, Button, Form, Input, Upload } from 'antd'
import { UploadOutlined } from '@ant-design/icons'

function ChatContext() {
  let [loading, setLoading] = useState(false)
  let [error, setError] = useState(null)

  const [form] = Form.useForm()

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
          padding: '10px',
        }}
      >
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
              <Button icon={<UploadOutlined style={{ color: '#141414' }} />}>
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
              Create context
            </Button>
          </Form.Item>
        </Form>
      </Col>
      {loading ? <div>Uploading files ...</div> : null}
      {error ? <div>Error while uploading files, err={error}</div> : null}
      <Col span={24}>
        <div>Available contexts</div>
      </Col>
    </Row>
  )
}

export default ChatContext
