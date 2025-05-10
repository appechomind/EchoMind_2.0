'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MAGIC_TRICK_DURATION } from '../../constants';

export function MagicTrick({ items }) {
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClick = () => {
    if (items.length === 0) return;
    
    setIsActive(true);
    setCurrentIndex(0);

    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= items.length - 1) {
          clearInterval(interval);
          setIsActive(false);
          return 0;
        }
        return prev + 1;
      });
    }, MAGIC_TRICK_DURATION / items.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleClick}
        disabled={items.length === 0 || isActive}
        className={`w-full px-4 py-2 rounded-lg transition-colors
          ${items.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isActive
              ? 'bg-primary-600 text-white'
              : 'bg-primary-500 text-white hover:bg-primary-600'
          }`}
      >
        {isActive ? 'Magic in Progress...' : 'Start Magic Trick'}
      </motion.button>

      <AnimatePresence>
        {isActive && items[currentIndex] && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-4 aspect-square rounded-lg overflow-hidden"
          >
            <img
              src={items[currentIndex].url}
              alt={items[currentIndex].title}
              className="w-full h-full object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
} 