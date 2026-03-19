"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import {
  HiOutlineFolder,
  HiOutlineCloudArrowUp,
  HiArrowDownTray,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlinePhoto,
  HiOutlineFilm,
  HiOutlineMusicalNote,
  HiOutlineCodeBracket,
  HiOutlineDocument,
} from "react-icons/hi2";
import { useAdminAuth } from "@/components/admin/AdminAuthProvider";
import DataTable, { type Column } from "@/components/admin/DataTable";
import Pagination from "@/components/admin/Pagination";
import Modal from "@/components/admin/Modal";
import EmptyState from "@/components/admin/EmptyState";

interface Document {
  id: number;
  filename: string;
  mime_type: string;
  size: number;
  entity_type: string;
  entity_id: number | null;
  description: string;
  created_at: string;
  [key: string]: unknown;
}

interface DocumentsResponse {
  documents: Document[];
  total: number;
  page: number;
  totalPages: number;
}

function getMimeIcon(mimeType: string) {
  if (mimeType.startsWith("image/"))
    return <HiOutlinePhoto className="w-4 h-4 text-pink-500" />;
  if (mimeType.startsWith("video/"))
    return <HiOutlineFilm className="w-4 h-4 text-purple-500" />;
  if (mimeType.startsWith("audio/"))
    return <HiOutlineMusicalNote className="w-4 h-4 text-orange-500" />;
  if (mimeType.includes("pdf"))
    return <HiOutlineDocumentText className="w-4 h-4 text-red-500" />;
  if (
    mimeType.includes("spreadsheet") ||
    mimeType.includes("excel") ||
    mimeType.includes("csv")
  )
    return <HiOutlineDocumentText className="w-4 h-4 text-green-500" />;
  if (mimeType.includes("json") || mimeType.includes("javascript") || mimeType.includes("xml"))
    return <HiOutlineCodeBracket className="w-4 h-4 text-blue-500" />;
  return <HiOutlineDocument className="w-4 h-4 text-gray-500" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const { token } = useAdminAuth();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    entity_type: "general",
    entity_id: "",
    description: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });
      const res = await fetch(`/api/admin/documents?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch documents");
      const data: DocumentsResponse = await res.json();
      setDocuments(data.documents);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  }, [token, page]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDownload = async (doc: Document) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const handleDelete = async (doc: Document) => {
    if (!token) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete "${doc.filename}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/documents/${doc.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed");
      fetchDocuments();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("entity_type", uploadForm.entity_type);
      if (uploadForm.entity_id)
        formData.append("entity_id", uploadForm.entity_id);
      if (uploadForm.description)
        formData.append("description", uploadForm.description);

      const res = await fetch("/api/admin/documents", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadForm({ entity_type: "general", entity_id: "", description: "" });
      fetchDocuments();
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) setSelectedFile(file);
  };

  const columns: Column<Document>[] = [
    {
      key: "filename",
      label: "Filename",
      render: (item) => (
        <span className="font-medium text-gray-900">{item.filename}</span>
      ),
    },
    {
      key: "mime_type",
      label: "Type",
      render: (item) => (
        <div className="flex items-center gap-2">
          {getMimeIcon(item.mime_type)}
          <span className="text-xs text-gray-500 truncate max-w-[120px]">
            {item.mime_type}
          </span>
        </div>
      ),
    },
    {
      key: "size",
      label: "Size",
      render: (item) => (
        <span className="text-gray-600">{formatFileSize(item.size)}</span>
      ),
    },
    {
      key: "entity_type",
      label: "Entity",
      render: (item) => (
        <div>
          <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
            {item.entity_type}
          </span>
          {item.entity_id && (
            <span className="ml-1 text-xs text-gray-400">
              #{item.entity_id}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "created_at",
      label: "Upload Date",
      render: (item) => (
        <span className="text-gray-600 whitespace-nowrap">
          {new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (item) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(item);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-primary bg-primary/5 rounded-lg hover:bg-primary/10 transition-colors"
          >
            <HiArrowDownTray className="w-3.5 h-3.5" />
            Download
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <HiOutlineTrash className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and manage files and documents
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
        >
          <HiOutlineCloudArrowUp className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {!loading && documents.length === 0 ? (
          <EmptyState
            icon={<HiOutlineFolder className="w-8 h-8" />}
            title="No documents"
            description="Upload your first document to get started."
            action={{
              label: "Upload Document",
              onClick: () => setShowUploadModal(true),
            }}
          />
        ) : (
          <>
            <DataTable columns={columns} data={documents} loading={loading} />
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              total={total}
            />
          </>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => {
          setShowUploadModal(false);
          setSelectedFile(null);
        }}
        title="Upload Document"
        size="lg"
      >
        <form onSubmit={handleUpload} className="space-y-5">
          {/* Drag-drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary/5"
                : selectedFile
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-gray-400 bg-gray-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setSelectedFile(file);
              }}
            />
            {selectedFile ? (
              <div>
                <HiOutlineDocumentText className="w-10 h-10 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
                <p className="text-xs text-primary mt-2">
                  Click to change file
                </p>
              </div>
            ) : (
              <div>
                <HiOutlineCloudArrowUp className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Drop a file here or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Any file type accepted
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Entity Type
              </label>
              <select
                value={uploadForm.entity_type}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, entity_type: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="general">General</option>
                <option value="lead">Lead</option>
                <option value="merchant">Merchant</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Entity ID{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                value={uploadForm.entity_id}
                onChange={(e) =>
                  setUploadForm({ ...uploadForm, entity_id: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g. 42"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={uploadForm.description}
              onChange={(e) =>
                setUploadForm({ ...uploadForm, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Brief description of the document..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowUploadModal(false);
                setSelectedFile(null);
              }}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
