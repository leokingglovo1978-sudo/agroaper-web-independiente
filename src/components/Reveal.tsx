import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Aparición progresiva al hacer scroll: fundido + translateY(40px) → 0.
 * El contenido nunca depende de la animación para ser visible si el
 * usuario prefiere movimiento reducido.
 */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
