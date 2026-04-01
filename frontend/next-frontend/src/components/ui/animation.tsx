import { motion } from "framer-motion"

export function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <motion.div
        className="absolute inset-0 opacity-10 dark:opacity-20"
        animate={{
          background: [
            "radial-gradient(circle at 25% 25%, hsl(var(--primary)) 0%, transparent 50%)",
            "radial-gradient(circle at 75% 75%, hsl(var(--accent)) 0%, transparent 50%)",
            "radial-gradient(circle at 25% 75%, hsl(var(--primary)) 0%, transparent 50%)",
            "radial-gradient(circle at 75% 25%, hsl(var(--accent)) 0%, transparent 50%)",
          ],
        }}
        transition={{ duration: 12, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
      />
    </div>
  )
}