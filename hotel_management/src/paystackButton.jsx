import React from "react";
import { PaystackButton } from "react-paystack";

const PaystackPay = ({ amount, email, onSuccess, onClose }) => {
  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY; // Your Paystack Public Key
  // Convert amount to kobo (smallest currency unit for Naira)
  const amountInKobo = amount * 100;

  const componentProps = {
    email,
    amount: amountInKobo,
    publicKey,
    text: "Pay Now",
    onSuccess: (response) => {
      console.log("Payment Successful!", response);
      if (onSuccess) onSuccess(response);
    },
    onClose: () => {
      console.log("Payment closed.");
      if (onClose) onClose();
    },
  };

  return <PaystackButton className="paystack-button" {...componentProps} />;
};

export default PaystackPay;
