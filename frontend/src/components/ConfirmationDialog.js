import React from "react";

const ConfirmationDialog = ({ open, onClose, onConfirm }) => {
  if (!open) return null;

  return (
    <div className="confirmation-dialog">
      <p>Are you sure?!</p>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};

export default ConfirmationDialog;
