import { motion } from "framer-motion";

export function PageTransition({ children, className = "" }) {
  return (
    <motion.div animate={{ opacity: 1, y: 0 }} className={className} initial={{ opacity: 0, y: 18 }} transition={{ duration: 0.35, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}
