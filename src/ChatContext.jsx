import React from 'react'
import { useState } from 'react'

function ChatContext() {
  let [loading, setLoading] = useState(false)
  let [error, setError] = useState(null)

  async function submitForm(e) {
    e.preventDefault()
    const name = document.getElementById('name')
    const files = document.getElementById('files')
    const formData = new FormData()
    formData.append('name', name.value)
    for (let i = 0; i < files.files.length; i++) {
      formData.append('files', files.files[i])
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
    } catch (ex) {
      console.error(`error while uploading files, err=${JSON.stringify(ex)}`)
      setError(JSON.stringify(ex))
    }
    setLoading(false)
  }

  return (
    <div>
      <div>Upload files</div>
      <form id="form" onSubmit={submitForm}>
        <div>
          <label for="name">Your name</label>
          <input name="name" id="name" placeholder="Enter your name" />
        </div>
        <div>
          <label for="files">Select files</label>
          <input id="files" type="file" multiple />
        </div>
        <button type="submit" disabled={loading}>
          Upload
        </button>
      </form>
      {loading ? <div>Uploading files ...</div> : null}
      {error ? <div>Error while uploading files, err={error}</div> : null}
    </div>
  )
}

export default ChatContext
