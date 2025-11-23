"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const WaitingRoomTransition = ({
  visible,
  headline = "Preparando sua sessão",
  message = "Aguarde enquanto conectamos você com o profissional."
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        className="fixed inset-0 z-[70] flex items-center justify-center backdrop-blur-md bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="max-w-md w-full mx-6 rounded-3xl bg-white/95 dark:bg-gray-900/95 shadow-2xl border border-white/40 dark:border-gray-700 p-8 text-center space-y-4"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
        >
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg">
            <div className="w-8 h-8 border-3 border-white/60 border-t-white rounded-full animate-spin" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
              {headline}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {message}
            </p>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default WaitingRoomTransition;













