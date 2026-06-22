'use client';

import React, { useEffect, useState } from 'react';
import { FileText, Download, Trash2, UploadCloud, X, Loader2 } from 'lucide-react';
import { propertiesApi } from '@/api/properties';
import { formatDate } from '@/utils/formatDate';
import { getCloudinaryDownloadUrl } from '@/utils/cloudinary';

export type DocType = 'SOI' | 'Contract' | 'Other';

export interface PropertyDocument {
  _id?: string;
  // apiClient transforms backend `_id` → `id`, so documents loaded via the API
  // expose `id` instead of `_id`. Both are accepted everywhere below.
  id?: string;
  fileUrl: string;
  fileName: string;
  type?: DocType;
  uploadedAt?: string;
}

export interface StagedDocument {
  file: File;
  type: DocType;
}

interface Props {
  // Required only for immediate (non-deferred) uploads.
  propertyId?: string;
  documents?: PropertyDocument[] | null;
  // Only owner/admin (or assigned agent) should see upload + delete controls.
  canManage?: boolean;
  // Bubble updated list up so parents (e.g. the modal) can refresh their state.
  onChange?: (docs: PropertyDocument[]) => void;
  // Deferred mode: used during property CREATE, where no id exists yet.
  // Files are only staged (not uploaded); the parent uploads them after the
  // property is created and receives the staged list via onStagedChange.
  deferred?: boolean;
  onStagedChange?: (staged: StagedDocument[]) => void;
}

const DOC_TYPES: DocType[] = ['SOI', 'Contract', 'Other'];

const typeBadgeClasses: Record<DocType, string> = {
  SOI: 'bg-blue-100 text-blue-800',
  Contract: 'bg-purple-100 text-purple-800',
  Other: 'bg-gray-100 text-gray-700',
};

interface StagedFile {
  file: File;
  type: DocType;
}

export default function PropertyDocuments({
  propertyId,
  documents,
  canManage = false,
  onChange,
  deferred = false,
  onStagedChange,
}: Props) {
  const [docs, setDocs] = useState<PropertyDocument[]>(documents ?? []);
  const [staged, setStaged] = useState<StagedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep local list in sync if the parent supplies a new documents prop.
  useEffect(() => {
    setDocs(documents ?? []);
  }, [documents]);

  // In manage mode (edit), fetch the authoritative document list straight from
  // the backend so it never depends on whatever list the parent happened to
  // load. This guarantees existing documents always show in the edit modal.
  useEffect(() => {
    if (deferred || !canManage || !propertyId) return;
    let active = true;
    setIsLoadingDocs(true);
    propertiesApi
      .getPropertyDocuments(propertyId)
      .then((list) => {
        if (active) setDocs(list ?? []);
      })
      .catch((err) => {
        if (active) setError(err?.message || 'Could not load documents.');
      })
      .finally(() => {
        if (active) setIsLoadingDocs(false);
      });
    return () => {
      active = false;
    };
  }, [propertyId, canManage, deferred]);

  // In deferred (create) mode, bubble staged files up to the parent form.
  useEffect(() => {
    if (deferred && onStagedChange) onStagedChange(staged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staged, deferred]);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    const incoming: StagedFile[] = Array.from(fileList).map((file) => ({ file, type: 'Other' }));
    setStaged((prev) => [...prev, ...incoming]);
  };

  const updateStagedType = (index: number, type: DocType) => {
    setStaged((prev) => prev.map((s, i) => (i === index ? { ...s, type } : s)));
  };

  const removeStaged = (index: number) => {
    setStaged((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (staged.length === 0) return;
    setIsUploading(true);
    setError(null);
    try {
      const files = staged.map((s) => s.file);
      const types = staged.map((s) => s.type);
      const updated = await propertiesApi.uploadDocuments(propertyId, files, types);
      const next = updated ?? [];
      setDocs(next);
      setStaged([]);
      onChange?.(next);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload documents. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId?: string) => {
    if (!docId) return;
    if (!window.confirm('Delete this document? This cannot be undone.')) return;
    setDeletingId(docId);
    setError(null);
    try {
      const updated = await propertiesApi.deleteDocument(propertyId, docId);
      const next = updated ?? [];
      setDocs(next);
      onChange?.(next);
    } catch (err: any) {
      setError(err?.message || 'Failed to delete document. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing documents list / empty state (hidden during create/deferred) */}
      {deferred ? null : isLoadingDocs && docs.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading documents…
        </p>
      ) : docs.length === 0 ? (
        <p className="text-sm text-gray-500">No documents uploaded yet</p>
      ) : (
        <ul className="space-y-2">
          {docs.map((doc) => {
            const docType = (doc.type as DocType) || 'Other';
            // Backend `_id` may have been transformed to `id` by the API client.
            const docId = doc._id || doc.id;
            return (
              <li
                key={docId || doc.fileUrl}
                className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5"
              >
                <FileText className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{doc.fileName}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${typeBadgeClasses[docType]}`}>
                      {docType}
                    </span>
                    {doc.uploadedAt && (
                      <span className="text-xs text-gray-400">{formatDate(doc.uploadedAt)}</span>
                    )}
                  </div>
                </div>
                <a
                  href={getCloudinaryDownloadUrl(doc.fileUrl, doc.fileName)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  aria-label={`Download ${doc.fileName}`}
                >
                  <Download className="h-4 w-4" />
                </a>
                {canManage && (
                  <button
                    type="button"
                    onClick={() => handleDelete(docId)}
                    disabled={deletingId === docId}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-red-500 hover:bg-red-50 disabled:opacity-50"
                    aria-label={`Delete ${doc.fileName}`}
                  >
                    {deletingId === docId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Upload controls (owner/admin only) */}
      {canManage && (
        <div className="space-y-3">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center transition hover:border-gray-400">
            <UploadCloud className="mb-1 h-6 w-6 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Click to add documents</span>
            <span className="text-xs text-gray-400">PDF, PNG or JPG · up to 10 files</span>
            <input
              type="file"
              multiple
              accept="application/pdf,image/png,image/jpeg"
              className="hidden"
              onChange={(e) => {
                handleFilesSelected(e.target.files);
                e.target.value = ''; // allow re-selecting the same file
              }}
            />
          </label>

          {/* Staged files awaiting upload, each with its own type selector */}
          {staged.length > 0 && (
            <div className="space-y-2">
              {staged.map((s, index) => (
                <div key={`${s.file.name}-${index}`} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <FileText className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="min-w-0 flex-1 truncate text-sm text-gray-700">{s.file.name}</span>
                  <select
                    value={s.type}
                    onChange={(e) => updateStagedType(index, e.target.value as DocType)}
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeStaged(index)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Remove staged file"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}

              {deferred ? (
                <p className="text-xs text-gray-500">
                  These files will be uploaded automatically once the property is created.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" /> Upload {staged.length} file{staged.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
