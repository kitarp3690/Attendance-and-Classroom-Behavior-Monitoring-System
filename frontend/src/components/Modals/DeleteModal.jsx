import React from "react";
const DeleteModal = ({ open, onClose, onConfirm }) => {
    if (!open) return null;
    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>Confirm Delete?</h3>
                <button onClick={onConfirm}>Delete</button>
                <button onClick={onClose}>Cancel</button>
            </div>
        </div>
    );
};
export default DeleteModal;