export function AuthAside({ title, body }: { title: string; body: string }) {
  return (
    <aside className="auth-aside" aria-hidden="true">
      <div className="auth-aside-content">
        <span className="brand-mark" aria-hidden="true" style={{ fontSize: 48 }}>Q</span>
        <h2>{title}</h2>
        <p>{body}</p>
      </div>
    </aside>
  );
}

