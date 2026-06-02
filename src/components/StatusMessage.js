import React from 'react'

export default function StatusMessage({ title, children, action }) {
  return (
    <section className="status-card" aria-live="polite">
      <h1>{title}</h1>
      {children && <p>{children}</p>}
      {action && <div className="status-action">{action}</div>}
    </section>
  )
}
