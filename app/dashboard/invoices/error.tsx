"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Opcionalmente, registre o erro em um serviço de relatório de erros.
    console.error(error);
  }, [error]);

  return (
    <main className="flex h-full flex-col items-center justify-center">
      <h2 className="text-center">Algo deu errado!</h2>
      <button
        className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
        onClick={
          // Tentativa de recuperação: renderizar novamente a rota de faturas
          () => reset()
        }
      >
        Tente novamente
      </button>
    </main>
  );
}
