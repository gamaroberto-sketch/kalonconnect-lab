import { generateClientLink } from "@/utils/generateClientLink";

export default function DebugOrigin() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🔍 Debug Origin</h1>

      <pre className="bg-gray-100 p-4 rounded text-sm">
        {typeof window !== "undefined"
          ? JSON.stringify(
              {
                href: window.location.href,
                origin: window.location.origin,
                host: window.location.host,
                port: window.location.port,
                protocol: window.location.protocol,
              },
              null,
              2
            )
          : "Aguardando client-side..."}
      </pre>

      <h2 className="font-bold mt-6">Environment:</h2>
      <pre className="bg-gray-100 p-4 rounded text-sm">
        {JSON.stringify(
          {
            NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
            NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
            NODE_ENV: process.env.NODE_ENV,
          },
          null,
          2
        )}
      </pre>

      <h2 className="font-bold mt-6">Generated Link:</h2>
      <pre className="bg-gray-100 p-4 rounded text-sm">
        {typeof window !== "undefined"
          ? generateClientLink("test-client", "test-123")
          : "Carregando..."}
      </pre>
    </div>
  );
}





