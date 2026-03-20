"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPath.current) return;

    setVisible(false);
    const id = requestAnimationFrame(() => {
      prevPath.current = pathname;
      setVisible(true);
    });

    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return (
    <div
      className="transition-[opacity,transform] duration-200 ease-out"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(6px)",
      }}
    >
      {children}
    </div>
  );
}
