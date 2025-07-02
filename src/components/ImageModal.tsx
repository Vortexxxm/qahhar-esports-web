
import { X } from "lucide-react";
import { useEffect } from "react";

interface ImageModalProps {
  imageUrl: string | null;
  onClose: () => void;
}

const ImageModal = ({ imageUrl, onClose }: ImageModalProps) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (imageUrl) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="relative max-w-7xl max-h-[90vh] mx-4">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10"
        >
          <X className="h-8 w-8" />
        </button>
        
        <img
          src={imageUrl}
          alt="عرض الصورة"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default ImageModal;
