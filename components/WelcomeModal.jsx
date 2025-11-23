"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Brain, Activity, Shield, Sparkles } from 'lucide-react';

const WelcomeModal = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="kalon-card max-w-2xl w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-4"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                <Heart className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Mapa Vibracional
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Compreenda sua coerência energética
              </p>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-pink-200 dark:border-pink-700/50"
              >
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  O Mapa Vibracional representa a coerência entre corpo, emoção, mente e espírito.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700/50"
              >
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                  Ele é calculado a partir de autoavaliação e leituras energéticas (Qest4, Hunter 4025, MetaHipnose ou frequências Rife).
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-700/50"
              >
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed font-medium">
                  Reflita: como está sua energia hoje?
                </p>
              </motion.div>
            </div>

            {/* Dimensions Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
                As Quatro Dimensões
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <Activity className="w-6 h-6 text-green-500" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Energia Física</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Vitalidade e saúde corporal</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <Heart className="w-6 h-6 text-blue-500" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Equilíbrio Emocional</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Harmonia emocional</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <Brain className="w-6 h-6 text-purple-500" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Clareza Mental</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Foco e concentração</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-pink-50 dark:bg-pink-900/20">
                  <Sparkles className="w-6 h-6 text-pink-500" />
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">Conexão Espiritual</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Propósito e transcendência</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mt-8 text-center"
            >
              <button
                onClick={onClose}
                className="kalon-button-secondary px-8 py-3"
              >
                Entendi
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;



