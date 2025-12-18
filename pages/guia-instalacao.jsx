"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function GuiaInstalacao() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para a página de guia que funciona
    router.push('/guia-novo');
  }, [router]);

  return null;
}
