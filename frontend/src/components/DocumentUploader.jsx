import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  X,
  FileText,
  Image,
  File,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import apiClient from "../api/client";
import { useUser } from "../context/UserContext";

const DocumentUploader = ({ onUpload, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const { user } = useUser();
  const [aiMessage, setAiMessage] = useState("");

  const allowedTypes = {
    "application/pdf": "PDF",
    "image/jpeg": "JPEG",
    "image/jpg": "JPG",
    "image/png": "PNG",
    "text/plain": "TXT",
    "application/msword": "DOC",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "DOCX",
  };

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    handleFiles(selectedFiles);
  };

  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) => {
      if (!allowedTypes[file.type]) {
        alert(`File type ${file.type} is not supported`);
        return false;
      }
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Maximum size is 10MB`);
        return false;
      }
      return true;
    });

    setFiles((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        id: Date.now() + Math.random(),
        status: "pending",
      })),
    ]);
  };

  const removeFile = (fileId) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const getFileIcon = (fileType) => {
    if (fileType.startsWith("image/")) return Image;
    if (fileType === "application/pdf") return FileText;
    return File;
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setAiMessage("");

    for (const fileObj of files) {
      if (fileObj.status !== "pending") continue;

      try {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id ? { ...f, status: "uploading" } : f
          )
        );

        // Upload to backend and get AI confirmation
        const response = await apiClient.uploadDocument(
          fileObj.file,
          user?.id || "default"
        );

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? { ...f, status: "completed", response }
              : f
          )
        );

        setAiMessage(
            "Your document has been successfully processed and will be considered in future conversations."
        );

        if (onUpload) onUpload(fileObj.file, response.response); // response.response is the summary text
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? { ...f, status: "error", error: error.message }
              : f
          )
        );
        setAiMessage("Sorry, I couldn't analyze your document. Please try again.");
      }
    }

    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Upload Medical Documents
              </h2>
              <p className="text-neutral-600 mt-1">
                Share your medical history, test results, or prescriptions
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-neutral-500" />
            </button>
          </div>

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? "border-primary-500 bg-primary-50"
                : "border-neutral-300 hover:border-neutral-400"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Drop files here or click to browse
            </h3>
            <p className="text-neutral-600 mb-4">
              Supported formats: PDF, JPEG, PNG, TXT, DOC, DOCX (max 10MB each)
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
              disabled={uploading}
            >
              Select Files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.txt,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-neutral-900 mb-3">
                Files to Upload ({files.length})
              </h3>
              <div className="space-y-3">
                {files.map((fileObj) => {
                  const Icon = getFileIcon(fileObj.file.type);
                  const progress = uploadProgress[fileObj.id] || 0;

                  return (
                    <div
                      key={fileObj.id}
                      className="flex items-center p-3 bg-neutral-50 rounded-lg"
                    >
                      <Icon className="w-5 h-5 text-neutral-500 mr-3" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-neutral-900">
                            {fileObj.file.name}
                          </span>
                          <span className="text-xs text-neutral-500">
                            ({Math.round(fileObj.file.size / 1024)} KB)
                          </span>
                        </div>

                        {fileObj.status === "uploading" && (
                          <div className="mt-1">
                            <div className="w-full bg-neutral-200 rounded-full h-1">
                              <div
                                className="bg-primary-600 h-1 rounded-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-neutral-500 mt-1">
                              Uploading... {progress}%
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        {fileObj.status === "pending" && (
                          <button
                            onClick={() => removeFile(fileObj.id)}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                            disabled={uploading}
                          >
                            <X className="w-4 h-4 text-neutral-500" />
                          </button>
                        )}
                        {fileObj.status === "uploading" && (
                          <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />
                        )}
                        {fileObj.status === "completed" && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                        {fileObj.status === "error" && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* AI Message */}
          {aiMessage && (
            <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-lg">
              {aiMessage}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200">
            <div className="text-sm text-neutral-600">
              Files are encrypted and securely processed
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={uploadFiles}
                disabled={
                  files.length === 0 ||
                  uploading ||
                  files.every((f) => f.status !== "pending")
                }
                className="btn-primary disabled:opacity-50"
              >
                {uploading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  `Upload ${
                    files.filter((f) => f.status === "pending").length
                  } Files`
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DocumentUploader;
