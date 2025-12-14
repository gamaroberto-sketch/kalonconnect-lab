// components/KalonError.jsx

export function KalonError({ message }) {
  return (
    <div className="kalon-error" style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#fff',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '500px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Erro de Conexão</h2>
        <p style={{ margin: 0, opacity: 0.9 }}>{message}</p>
      </div>
    </div>
  );
}





