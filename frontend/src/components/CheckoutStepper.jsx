import React from "react";
import { useLocation } from "react-router-dom";

const CheckoutStepper = () => {
  const location = useLocation();

  const getStep = () => {
    if (location.pathname.includes("cart")) return 1;
    if (location.pathname.includes("select-address")) return 2;
    if (location.pathname.includes("Cust-Payment")) return 3;
    if (location.pathname.includes("summary")) return 4;
    return 1;
  };

  const step = getStep();
  const steps = ["Cart", "Address", "Payment", "Summary"];

  return (
    <div
      style={{
        // background: "#fff",
        padding: "30px 20px",
        borderBottom: "1px solid #eee",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          maxWidth: "900px",
          margin: "auto",
        }}
      >
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          const isCompleted = step > stepNumber;
          const isActive = step === stepNumber;

          return (
            <React.Fragment key={index}>
              
              {/* Step Wrapper */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {/* Circle */}
                <div
                  style={{
                    width: 45,
                    height: 45,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: "bold",
                    fontSize: "16px",
                    zIndex: 2,
                    backgroundColor: isCompleted
                      ? "#3CB815"
                      : isActive
                      ? "#fff"
                      : "#e0e0e0",
                    color: isCompleted
                      ? "#fff"
                      : isActive
                      ? "#3CB815"
                      : "#999",
                    border: isActive ? "2px solid #3CB815" : "none",
                    transition: "0.3s",
                  }}
                >
                  {isCompleted ? "✓" : stepNumber}
                </div>

                {/* Label */}
                <div
                  style={{
                    marginTop: 10,
                    fontSize: "14px",
                    fontWeight: isActive ? "600" : "500",
                    color: isActive ? "#3CB815" : "#666",
                  }}
                >
                  {label}
                </div>
              </div>

              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 4,
                    margin: "0 -5px",
                    backgroundColor:
                      step > stepNumber ? "#3CB815" : "#e0e0e0",
                    position: "relative",
                    top: "-20px",
                    zIndex: 1,
                    transition: "0.3s",
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CheckoutStepper;