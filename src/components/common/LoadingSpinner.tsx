import { motion } from "framer-motion";
export default function LoadingSpinner() {
  return (
    <div role="status" className="state-card">
      <motion.div
        className="loading-orbit"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <h2>Reading the atmosphere</h2>
      <p>Fetching the latest forecast...</p>
      <div className="skeleton" />
      <div className="skeleton" />
    </div>
  );
}
