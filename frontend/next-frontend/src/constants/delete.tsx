"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}


export default function DeleteModal({ isOpen, onClose, onConfirm}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 bg-white rounded shadow-lg"
        style={{
          width: "480px",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2
            id="delete-modal-title"
            className="text-base font-semibold text-gray-900"
            style={{ fontSize: "16px", lineHeight: "1.25", color: "#172b4d" }}
          >
            Delete issue?
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
            style={{ width: "32px", height: "32px", color: "#42526e" }}
            aria-label="Close dialog"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p
            className="text-sm"
            style={{ fontSize: "14px", lineHeight: "1.42857142857143", color: "#172b4d" }}
          >
            You're about to permanently delete this issue, its comments and attachments, and all of its data.
          </p>
          <p
            className="text-sm mt-3"
            style={{ fontSize: "14px", lineHeight: "1.42857142857143", color: "#172b4d" }}
          >
            If you're not sure, you can resolve or close this issue instead.
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200"
          style={{ borderTopColor: "#ebecf0" }}
        >
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded font-medium transition-colors"
            style={{
              height: "32px",
              padding: "0 10px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#42526e",
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              lineHeight: "32px",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#ebecf0";
              e.currentTarget.style.textDecoration = "none";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="inline-flex items-center justify-center rounded font-medium transition-colors"
            style={{
              height: "32px",
              padding: "0 10px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#ffffff",
              backgroundColor: "#de350b",
              border: "none",
              cursor: "pointer",
              lineHeight: "32px",
              borderRadius: "3px",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#bf2600";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "#de350b";
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}