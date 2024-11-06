const Modal = ({ open, onClose, children }) => {
  if (!open) return null; // Only render the modal when it's open

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 flex justify-center items-center transition-colors bg-black/20"
    >
      <div
        onClick={(e) => e.stopPropagation()} // Prevents click from propagating to the background
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
      >
        {children}
      </div>
    </div>
  );
};

export default Modal;
