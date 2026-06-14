import './TransactionExitModal.css'

export default function TransactionExitModal({ open, onConfirm, onCancel }) {
  if (!open) return null

  return (
    <div className="exit-modal-overlay">
      <div className="exit-modal card">
        <h3>Transaction completed?</h3>
        <p>If yes, this chat will be moved to archives. If not, it stays in your inbox.</p>
        <div className="exit-modal-actions">
          <button className="btn btn-green" onClick={() => onConfirm(true)}>Yes, completed</button>
          <button className="btn btn-outline-dark" onClick={() => onConfirm(false)}>No, keep in inbox</button>
          <button className="btn-link" onClick={onCancel}>Stay in chat</button>
        </div>
      </div>
    </div>
  )
}
