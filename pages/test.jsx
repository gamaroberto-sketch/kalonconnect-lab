export default function Test() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          🎉 Kalon OS Funcionando!
        </h1>
        <p className="text-gray-600 mb-8">
          Sistema de Consciência Integrada
        </p>
        <div className="space-y-4">
          <a 
            href="/login" 
            className="block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Ir para Login
          </a>
          <a 
            href="/dashboard" 
            className="block bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
          >
            Ir para Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}




