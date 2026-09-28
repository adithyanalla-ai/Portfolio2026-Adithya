"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

// The game's code is only downloaded when the Play section approaches the viewport.
const PacmanGame = dynamic(() => import("./PacmanGame").then((m) => m.PacmanGame), {
  ssr: false,
  loading: () => <GameSkeleton />,
});

function GameSkeleton() {
  return <div className="mx-auto aspect-[19/21] w-full max-w-[28.5rem] animate-pulse rounded-2xl border border-line bg-surface-raised" />;
}

export function ArcadeLoader() {
  const ref = useRef<HTMLDivElement>(null);
  const [load, setLoad] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setLoad(true), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref}>{load ? <PacmanGame /> : <GameSkeleton />}</div>;
}
