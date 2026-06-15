import React, { createContext, useContext, useState } from "react";

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {

  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {

    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3000);

  };

  return (
    <ToastContext.Provider value={{ showToast }}>

      {children}

      {toast && (
        <div className={`toast-box ${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" && "✔"}
            {toast.type === "error" && "✖"}
            {toast.type === "warning" && "⚠"}
          </span>

          {toast.message}
        </div>
      )}

      <style>{`

        .toast-box{
          position: fixed;
          bottom: 50px;
          left: 50%;
          transform: translate(-50%, 0);
          padding: 10px 18px;
          border-radius: 30px;
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 6px 15px rgba(0,0,0,0.2);
          animation: slideUp 0.35s ease;
          z-index: 9999;
        }

        .toast-box.success{
          background: #3CB815;
        }

        .toast-box.error{
          background: #d91125;
        }

        .toast-box.warning{
          background: #f39c12;
        }

        .toast-icon{
          font-weight: bold;
        }

        @keyframes slideUp{
          from{
            transform: translate(-50%, 40px);
            opacity: 0;
          }
          to{
            transform: translate(-50%, 0);
            opacity: 1;
          }
        }

      `}</style>

    </ToastContext.Provider>
  );
};