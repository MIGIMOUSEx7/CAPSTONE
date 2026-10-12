import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/supabaseApi'
import { useAuth } from '../context/AuthContext'
import TransactionExitModal from '../components/TransactionExitModal'
import './Chat.css'

export default function Chat() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [thread, setThread] = useState(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [showExitModal, setShowExitModal] = useState(false)
  const bottomRef = useRef(null)

  const load = () => api.chatThread(id).then(setThread).catch(console.error)

  useEffect(() => {
    load()
    const interval = setInterval(load, 5000)
    return () => clearInterval(interval)
  }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread?.messages])

  const send = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setSending(true)
    try {
      await api.sendMessage(id, text.trim())
      setText('')
      await load()
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleBack = () => setShowExitModal(true)

  const handleBackWithPref = () => {
    try {
      const key = `agriresq.no_transaction_exit_reminder.${user?.id || 'anon'}`
      const val = localStorage.getItem(key)
      if (val === '1') {
        navigate('/messages')
        return
      }
    } catch (e) {
      // ignore storage errors
    }
    setShowExitModal(true)
  }

  const handleExitConfirm = async (completed) => {
    await api.completeTransaction(id, completed)
    setShowExitModal(false)
    navigate('/messages')
  }

  return (
    <div className="app-shell">
      <div className="chat-page">
        <header className="chat-header">
          <div className="chat-header-left">
            <button type="button" className="back-btn" onClick={handleBackWithPref}>←</button>
            <h2>{thread?.marketplace_listings?.products?.crop_type || 'Chat'} — Rescue Deal</h2>
          </div>
          <button type="button" className="complete-btn" onClick={() => handleExitConfirm(true)}>
            {user?.role === 'STALL_OPERATOR' ? 'Complete & Mark Sold' : 'Mark Complete'}
          </button>
        </header>
        <div className="chat-messages">
          {thread?.messages?.map((m) => (
            <div
              key={m.id}
              className={`bubble ${m.sender_id === user?.id ? 'mine' : 'theirs'}`}
            >
              {m.message_text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
        <form className="chat-input" onSubmit={send}>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
          <button type="submit" disabled={sending}>Send</button>
        </form>
      </div>
      <TransactionExitModal
        open={showExitModal}
        onConfirm={handleExitConfirm}
        onCancel={() => setShowExitModal(false)}
        userId={user?.id}
      />
    </div>
  )
}
