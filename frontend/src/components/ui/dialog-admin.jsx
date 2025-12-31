import React from "react";

const Dialog = ({ children, open, onOpenChange }) => {
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
    >
      <div 
        className="bg-white rounded-xl p-6 min-w-52 max-w-screen-md shadow-2xl transform scale-100 opacity-100 transition-all duration-300 z-50 overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()} 
      >
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

const DialogHeader = ({ children, className = "" }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

const DialogTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-bold text-gray-800 ${className}`}>{children}</h3>
);

const DialogDescription = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-500 ${className}`}>{children}</p>
);

const DialogFooter = ({ children, className }) => <div className={`flex justify-end space-x-2 pt-4 border-t ${className}`}>{children}</div>;

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,DialogFooter };
