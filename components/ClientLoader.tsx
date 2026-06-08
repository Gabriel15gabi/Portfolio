"use client";

import { useState, useCallback } from "react";
import Loader from "@/components/Loader";

export default function ClientLoader() {
  const [show, setShow] = useState(true);

  const handleComplete = useCallback(() => {
    setShow(false);
  }, []);

  if (!show) return null;
  return <Loader onComplete={handleComplete} />;
}
