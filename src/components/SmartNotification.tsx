
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SmartNotificationProps {
  message: string;
  type?: 'info' | 'welcome' | 'achievement';
  icon?: React.ReactNode;
  onDismiss?: () => void;
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  autoHide?: boolean;
  hideDelay?: number;
}

const SmartNotification = ({
  message,
  type = 'info',
  icon,
  onDismiss,
  position = 'top-right',
  autoHide = true,
  hideDelay = 5000
}: SmartNotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (autoHide && !isDragging) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay, isDragging]);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'welcome':
        return {
          bg: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20',
          border: 'border-purple-500/50',
          text: 'text-purple-300'
        };
      case 'achievement':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-500/50',
          text: 'text-yellow-300'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-s3m-red/20 to-red-600/20',
          border: 'border-s3m-red/50',
          text: 'text-s3m-red'
        };
    }
  };

  const typeStyles = getTypeStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: position.includes('right') ? 100 : -100 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            x: dragPosition.x,
            y: dragPosition.y
          }}
          exit={{ opacity: 0, scale: 0.8, x: position.includes('right') ? 100 : -100 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          drag
          dragMomentum={false}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={(_, info) => {
            setIsDragging(false);
            setDragPosition({ x: info.offset.x, y: info.offset.y });
          }}
          className={`fixed ${getPositionClasses()} z-50 cursor-move`}
          style={{ maxWidth: '320px' }}
        >
          <Card className={`${typeStyles.bg} ${typeStyles.border} border backdrop-blur-sm shadow-2xl overflow-hidden`}>
            <CardContent className="p-4 relative">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
              
              <div className="relative flex items-start justify-between">
                <div className="flex items-start space-x-3 rtl:space-x-reverse flex-1">
                  <div className="p-2 rounded-full bg-black/20 flex-shrink-0">
                    {icon || <Star className={`w-5 h-5 ${typeStyles.text}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${typeStyles.text} leading-relaxed`}>
                      {message}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 rtl:space-x-reverse ml-2">
                  <Button
                    onClick={handleDismiss}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-white/20 rounded-full transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Progress bar for auto-hide */}
              {autoHide && !isDragging && (
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 ${typeStyles.bg} opacity-60`}
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: hideDelay / 1000, ease: 'linear' }}
                />
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartNotification;
