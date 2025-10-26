// @ts-nocheck
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiService } from '@/services';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { copyToClipboard } from '@/utils';
import { downloadFile } from '@/lib/utils';
import { CustomAlertDialog } from '@/components/custom-alert-dialog';

interface KnowledgeBaseSource {
  source_id: string;
  file_url: string;
  filename: string;
  type: string;
  file_size: number;
}

interface KnowledgeBase {
  knowledge_base_id: string;
  knowledge_base_name: string;
  knowledge_base_sources?: KnowledgeBaseSource[];
  auto_crawling_paths?: string[];
  enable_auto_refresh?: boolean;
  status?: string;
  error_messages?: string[];
  user_modified_timestamp?: number;
  created_at?: string;
  updated_at?: string;
  description?: string;
  file_count?: number;
  total_size?: number;
}

interface Document {
  id: string;
  type: 'file' | 'web' | 'text';
  name: string;
  content?: string;
  url?: string;
  file?: File;
  size?: number;
}

export default function KnowledgeBasesManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [knowledgeBases, setKnowledgeBases] = useState<KnowledgeBase[]>([]);
  const [loadingKnowledgeBases, setLoadingKnowledgeBases] = useState(false);
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<KnowledgeBase | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{ title: string; message: string } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newKnowledgeBaseData, setNewKnowledgeBaseData] = useState({
    name: '',
    documents: [] as Document[]
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [showAddOptionsModal, setShowAddOptionsModal] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editKnowledgeBaseData, setEditKnowledgeBaseData] = useState({
    name: '',
    documents: [] as Document[]
  });
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const [deletingSourceId, setDeletingSourceId] = useState<string | null>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const fetchKnowledgeBases = async () => {
    try {
      setLoadingKnowledgeBases(true);
      const data = await apiService.getKnowledgeBases();
      setKnowledgeBases(data);

      const kbFromUrl = searchParams.get('kb');

      if (kbFromUrl && data.length > 0) {
        const kbToSelect = data.find((kb: KnowledgeBase) => kb.knowledge_base_id === kbFromUrl);
        if (kbToSelect) {
          setSelectedKnowledgeBase(kbToSelect);
          return;
        }
      }

      if (data.length > 0) {
        const firstKb = data[0];
        setSelectedKnowledgeBase(firstKb);
        router.replace(`?kb=${encodeURIComponent(firstKb.knowledge_base_id)}`);
      }
    } catch (error) {
      console.error('Error fetching knowledge bases:', error);
    } finally {
      setLoadingKnowledgeBases(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBases();
  }, []);

  const handleSelectKnowledgeBase = (kb: KnowledgeBase) => {
    setSelectedKnowledgeBase(kb);
    router.push(`?kb=${encodeURIComponent(kb.knowledge_base_id)}`);
  };

  const handleOpenCreateModal = () => {
    setNewKnowledgeBaseData({ name: '', documents: [] });
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewKnowledgeBaseData({ name: '', documents: [] });
    setShowDropdown(false);
  };

  const handleAddClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleAddFile(Array.from(files));
    }
    setShowDropdown(false);
  };

  const handleAddFile = (files: File[]) => {
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setErrorAlert({
          title: 'Archivo muy grande',
          message: `El archivo ${file.name} excede el límite de 100MB`
        });
        return false;
      }
      return true;
    });

    const newDocuments: Document[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: 'file',
      name: file.name,
      file: file,
      size: file.size
    }));

    setNewKnowledgeBaseData({
      ...newKnowledgeBaseData,
      documents: [...newKnowledgeBaseData.documents, ...newDocuments]
    });
  };

  const handleRemoveDocument = (documentId: string) => {
    setNewKnowledgeBaseData({
      ...newKnowledgeBaseData,
      documents: newKnowledgeBaseData.documents.filter((doc) => doc.id !== documentId)
    });
  };

  const handleSaveKnowledgeBase = async () => {
    try {
      if (!newKnowledgeBaseData.name.trim()) {
        setErrorAlert({
          title: 'Error de validación',
          message: 'El nombre de la base de conocimiento es requerido'
        });
        return;
      }

      if (newKnowledgeBaseData.documents.length === 0) {
        setErrorAlert({
          title: 'Error de validación',
          message: 'Debes agregar al menos un documento'
        });
        return;
      }

      setIsSaving(true);

      const formData = new FormData();

      formData.append('knowledge_base_name', newKnowledgeBaseData.name);

      const files = newKnowledgeBaseData.documents.filter((doc) => doc.type === 'file' && doc.file);
      files.forEach((doc) => {
        if (doc.file) {
          formData.append('knowledge_base_files', doc.file);
        }
      });

      const urls = newKnowledgeBaseData.documents.filter((doc) => doc.type === 'web' && doc.url).map((doc) => doc.url);
      formData.append('knowledge_base_urls', JSON.stringify(urls));

      const texts = newKnowledgeBaseData.documents
        .filter((doc) => doc.type === 'text' && doc.content)
        .map((doc) => ({
          title: doc.name,
          content: doc.content
        }));
      formData.append('knowledge_base_texts', JSON.stringify(texts));

      formData.append('enable_auto_refresh', 'false');
      formData.append('auto_crawling_paths', JSON.stringify([]));

      await apiService.createKnowledgeBase(formData);

      await fetchKnowledgeBases();
      handleCloseCreateModal();
    } catch (error: any) {
      setErrorAlert({
        title: 'Error al crear base de conocimiento',
        message: error.response?.data?.message || 'Ocurrió un error al crear la base de conocimiento'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteKnowledgeBase = async () => {
    if (!selectedKnowledgeBase) return;

    try {
      setIsDeleting(true);
      await apiService.deleteKnowledgeBase(selectedKnowledgeBase.knowledge_base_id);

      const updatedKbs = knowledgeBases.filter(
        (kb) => kb.knowledge_base_id !== selectedKnowledgeBase.knowledge_base_id
      );
      setKnowledgeBases(updatedKbs);

      if (updatedKbs.length > 0) {
        setSelectedKnowledgeBase(updatedKbs[0]);
        router.replace(`?kb=${encodeURIComponent(updatedKbs[0].knowledge_base_id)}`);
      } else {
        setSelectedKnowledgeBase(null);
        router.replace('/knowledge-bases');
      }

      setShowDeleteDialog(false);
    } catch (error: any) {
      setErrorAlert({
        title: 'Error al eliminar',
        message: error.response?.data?.message || 'No se pudo eliminar la base de conocimiento'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!selectedKnowledgeBase) return;

    setEditKnowledgeBaseData({
      name: selectedKnowledgeBase.knowledge_base_name,
      documents: []
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditKnowledgeBaseData({ name: '', documents: [] });
    setShowEditDropdown(false);
  };

  const handleEditFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleEditAddFile(Array.from(files));
    }
    setShowEditDropdown(false);
  };

  const handleEditAddFile = (files: File[]) => {
    const MAX_FILE_SIZE = 100 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        setErrorAlert({
          title: 'Archivo muy grande',
          message: `El archivo ${file.name} excede el límite de 100MB`
        });
        return false;
      }
      return true;
    });

    const newDocuments: Document[] = validFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: 'file',
      name: file.name,
      file: file,
      size: file.size
    }));

    setEditKnowledgeBaseData({
      ...editKnowledgeBaseData,
      documents: [...editKnowledgeBaseData.documents, ...newDocuments]
    });
  };

  const handleRemoveEditDocument = (documentId: string) => {
    setEditKnowledgeBaseData({
      ...editKnowledgeBaseData,
      documents: editKnowledgeBaseData.documents.filter((doc) => doc.id !== documentId)
    });
  };

  const handleSaveEditKnowledgeBase = async () => {
    if (!selectedKnowledgeBase) return;

    try {
      if (editKnowledgeBaseData.documents.length === 0) {
        setErrorAlert({
          title: 'Error de validación',
          message: 'Debes agregar al menos un documento'
        });
        return;
      }

      setIsSaving(true);

      const formData = new FormData();

      const files = editKnowledgeBaseData.documents.filter((doc) => doc.type === 'file' && doc.file);
      files.forEach((doc) => {
        if (doc.file) {
          formData.append('knowledge_base_files', doc.file);
        }
      });

      await apiService.addKnowledgeBaseSources(selectedKnowledgeBase.knowledge_base_id, formData);

      await fetchKnowledgeBases();
      handleCloseEditModal();
    } catch (error: any) {
      setErrorAlert({
        title: 'Error al agregar archivos',
        message: error.response?.data?.message || 'Ocurrió un error al agregar los archivos'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSource = async (sourceId: string) => {
    if (!selectedKnowledgeBase) return;

    try {
      setDeletingSourceId(sourceId);
      await apiService.deleteKnowledgeBaseSource(selectedKnowledgeBase.knowledge_base_id, sourceId);
      await fetchKnowledgeBases();
    } catch (error: any) {
      setErrorAlert({
        title: 'Error al eliminar',
        message: error.response?.data?.message || 'No se pudo eliminar el source'
      });
    } finally {
      setDeletingSourceId(null);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    if (bytes < k) return bytes + ' B';
    if (bytes < k * k) return (bytes / k).toFixed(0) + ' K';
    return (bytes / (k * k)).toFixed(1) + ' MB';
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return (
      date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }) +
      ' ' +
      date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    );
  };

  const getFileExtension = (filename: string) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
  };

  const getFileColor = (extension: string) => {
    const colors: { [key: string]: string } = {
      PDF: '#FF0000',
      DOCX: '#FF8447',
      DOC: '#FF8447',
      XLSX: '#00A651',
      XLS: '#00A651',
      PPTX: '#D04424',
      PPT: '#D04424',
      TXT: '#808080',
      CSV: '#00A651'
    };
    return colors[extension.toUpperCase()] || '#94A3B8';
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'file':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        );
      case 'web':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        );
      case 'text':
        return (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  if (loadingKnowledgeBases) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Cargando bases de conocimiento...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Base de Conocimiento</h2>
          <Button size="sm" onClick={handleOpenCreateModal} className="h-8 w-8 rounded-full p-0">
            +
          </Button>
        </div>

        <div className="overflow-y-auto p-2">
          {knowledgeBases.map((kb) => (
            <button
              key={kb.knowledge_base_id}
              onClick={() => handleSelectKnowledgeBase(kb)}
              className={`mb-1 w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                selectedKnowledgeBase?.knowledge_base_id === kb.knowledge_base_id
                  ? 'bg-gray-100 font-medium'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="truncate">{kb.knowledge_base_name}</span>
              </div>
            </button>
          ))}

          {knowledgeBases.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">No hay bases de conocimiento disponibles</div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
        {selectedKnowledgeBase ? (
          <div className="ml-2 flex h-full w-full">
            <div className="flex h-full w-full flex-col rounded-md bg-white p-6">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center">
                    <div className="text-text-strong-950 text-lg font-medium leading-normal">
                      {selectedKnowledgeBase.knowledge_base_name}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="text-text-sub-600 text-xs font-normal leading-none">
                      ID: {selectedKnowledgeBase.knowledge_base_id.substring(0, 8)}...
                      {selectedKnowledgeBase.knowledge_base_id.slice(-3)}
                    </div>
                    <button onClick={() => copyToClipboard(selectedKnowledgeBase.knowledge_base_id)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4.99961 4.4V2.6C4.99961 2.44087 5.06282 2.28826 5.17535 2.17574C5.28787 2.06321 5.44048 2 5.59961 2H12.7996C12.9587 2 13.1114 2.06321 13.2239 2.17574C13.3364 2.28826 13.3996 2.44087 13.3996 2.6V11C13.3996 11.1591 13.3364 11.3117 13.2239 11.4243C13.1114 11.5368 12.9587 11.6 12.7996 11.6H10.9996V13.4C10.9996 13.7312 10.7296 14 10.3954 14H3.20381C3.12469 14.0005 3.04625 13.9853 2.973 13.9554C2.89976 13.9254 2.83315 13.8813 2.777 13.8256C2.72086 13.7698 2.67629 13.7035 2.64584 13.6305C2.6154 13.5575 2.59969 13.4791 2.59961 13.4L2.60141 5C2.60141 4.6688 2.87141 4.4 3.20561 4.4H4.99961ZM3.80141 5.6L3.79961 12.8H9.79961V5.6H3.80141ZM6.19961 4.4H10.9996V10.4H12.1996V3.2H6.19961V4.4Z"
                          fill="var(--icon-soft-400)"
                        />
                      </svg>
                    </button>
                    {selectedKnowledgeBase.status === 'complete' && (
                      <div className="ml-4 flex items-center">
                        <span className="mr-1">•</span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
                          <path
                            d="M8.50005 12.3791L15.3941 5.48438L16.4553 6.54488L8.50005 14.5001L3.72705 9.72712L4.78755 8.66663L8.50005 12.3791Z"
                            fill="#1FC16B"
                          />
                        </svg>
                        <div className="text-text-sub-600 ml-1 text-xs font-normal leading-none">
                          Subido el: {formatDate(selectedKnowledgeBase.user_modified_timestamp)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div
                    onClick={handleOpenEditModal}
                    className="relative inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-white p-2 shadow hover:bg-primary/90"
                    style={{ cursor: 'pointer', backgroundColor: 'var(--bg-strong-950)' }}
                  >
                    <div className="flex items-center justify-center px-1" style={{ cursor: 'pointer' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <path
                          d="M5.23023 11.7L12.0761 4.85415L11.1216 3.8997L4.27578 10.7455V11.7H5.23023ZM5.78981 13.05H2.92578V10.186L10.6444 2.46735C10.771 2.3408 10.9426 2.26971 11.1216 2.26971C11.3006 2.26971 11.4723 2.3408 11.5989 2.46735L13.5084 4.37692C13.635 4.5035 13.7061 4.67516 13.7061 4.85415C13.7061 5.03313 13.635 5.20479 13.5084 5.33137L5.78981 13.05ZM2.92578 14.4H15.0758V15.75H2.92578V14.4Z"
                          fill="var(--icon-white-0)"
                        />
                      </svg>
                      <div className="text-text-white-0 ml-1 text-sm font-medium leading-tight">Editar</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDeleteDialog(true)}
                    className="flex h-9 w-10 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path
                        d="M13.75 5.5H17.5V7H16V16.75C16 16.9489 15.921 17.1397 15.7803 17.2803C15.6397 17.421 15.4489 17.5 15.25 17.5H4.75C4.55109 17.5 4.36032 17.421 4.21967 17.2803C4.07902 17.1397 4 16.9489 4 16.75V7H2.5V5.5H6.25V3.25C6.25 3.05109 6.32902 2.86032 6.46967 2.71967C6.61032 2.57902 6.80109 2.5 7 2.5H13C13.1989 2.5 13.3897 2.57902 13.5303 2.71967C13.671 2.86032 13.75 3.05109 13.75 3.25V5.5ZM14.5 7H5.5V16H14.5V7ZM7.75 9.25H9.25V13.75H7.75V9.25ZM10.75 9.25H12.25V13.75H10.75V9.25ZM7.75 4V5.5H12.25V4H7.75Z"
                        fill="#525866"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div data-orientation="horizontal" role="none" className="mb-8 h-[1px] w-full shrink-0 bg-border"></div>
              <div className="flex-grow overflow-auto">
                <div className="flex flex-col gap-2">
                  {selectedKnowledgeBase.knowledge_base_sources?.map((source) => (
                    <div
                      key={source.source_id}
                      className="border-stroke-soft-200 flex h-14 flex-col items-start justify-center gap-4 rounded-lg border bg-white px-3 py-2 transition-all duration-300 ease-in-out"
                    >
                      <div className="flex w-full items-center justify-start gap-3">
                        <div className="relative h-8 w-8">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M24.2 31.4H7.8C5.4804 31.4 3.6 29.5196 3.6 27.2V4.8C3.6 2.4804 5.4804 0.6 7.8 0.6H16.471C17.5737 0.6 18.6321 1.03361 19.4178 1.80722L27.1467 9.41728C27.9485 10.2067 28.4 11.2849 28.4 12.4101V27.2C28.4 29.5196 26.5196 31.4 24.2 31.4Z"
                              fill="white"
                              stroke="#CACFD8"
                              strokeWidth="1.2"
                            />
                            <path d="M18 1V7.8C18 9.56731 19.4327 11 21.2 11H28" stroke="#CACFD8" strokeWidth="1.2" />
                            <path
                              d="M0 17C0 15.3431 1.34315 14 3 14H27C28.6569 14 30 15.3431 30 17V25C30 26.6569 28.6569 28 27 28H3C1.34315 28 0 26.6569 0 25V17Z"
                              fill={getFileColor(getFileExtension(source.filename))}
                            />
                            <text
                              x="15"
                              y="21"
                              fontFamily="Arial, sans-serif"
                              fontSize="9"
                              fill="white"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {getFileExtension(source.filename).substring(0, 4)}
                            </text>
                          </svg>
                        </div>
                        <div className="flex flex-grow flex-col items-start justify-start gap-1">
                          <div className="text-text-strong-950 w-full text-sm font-medium leading-tight">
                            {source.filename}
                          </div>
                          <div className="flex w-full items-center justify-start gap-1">
                            <div className="text-text-sub-600 text-xs font-normal leading-none">
                              {formatFileSize(source.file_size)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            onClick={() => downloadFile(source.file_url, source.filename)}
                            className="cursor-pointer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M3.25 15.25H16.75V16.75H3.25V15.25ZM10.75 10.879L15.3032 6.325L16.3638 7.3855L10 13.75L3.63625 7.38625L4.69675 6.325L9.25 10.8775V2.5H10.75V10.879Z"
                                fill="#0e121b"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay bases de conocimiento</h3>
              <p className="mt-1 text-sm text-gray-500">Comienza creando una nueva base de conocimiento</p>
              <div className="mt-6">
                <Button onClick={handleOpenCreateModal}>
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Base de Conocimiento
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="flex max-h-[90vh] w-[840px] flex-col overflow-visible rounded-[10px] border border-gray-200 bg-white p-0 shadow-md">
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 pt-4">
            <div className="text-text-strong-950 text-lg font-medium leading-normal">Agregar Base de Conocimiento</div>
            <button onClick={handleCloseCreateModal} className="ml-auto text-sm font-medium text-[#0d111b]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M9.99956 8.93949L13.7121 5.22699L14.7726 6.28749L11.0601 9.99999L14.7726 13.7125L13.7121 14.773L9.99956 11.0605L6.28706 14.773L5.22656 13.7125L8.93906 9.99999L5.22656 6.28749L6.28706 5.22699L9.99956 8.93949Z"
                  fill="var(--icon-sub-600)"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5">
            <div className="mt-5 flex h-16 flex-col gap-1">
              <div className="text-text-strong-950 text-sm font-medium leading-normal">
                Nombre de la Base de Conocimiento
              </div>
              <input
                className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Ingresar"
                maxLength={40}
                value={newKnowledgeBaseData.name}
                onChange={(e) => setNewKnowledgeBaseData({ ...newKnowledgeBaseData, name: e.target.value })}
              />
            </div>

            <div className="text-text-strong-950 text-sm font-medium leading-normal">Documentos</div>

            <div className="relative">
              <button
                onClick={() => setShowAddOptionsModal(true)}
                className="inline-flex h-10 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M9.25 9.25V4.75H10.75V9.25H15.25V10.75H10.75V15.25H9.25V10.75H4.75V9.25H9.25Z"
                    fill="currentColor"
                  />
                </svg>
                <span>Agregar</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              multiple
              accept="image/bmp,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,message/rfc822,application/epub+zip,image/heic,text/html,image/jpeg,image/png,text/markdown,.md,text/x-markdown,application/vnd.ms-outlook,application/vnd.oasis.opendocument.text,text/x-org,application/pkcs7-signature,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/x-rst,application/rtf,image/tiff,text/plain,text/tab-separated-values,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/xml"
              type="file"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {newKnowledgeBaseData.documents.length > 0 && (
              <div className="mt-2 space-y-2">
                {newKnowledgeBaseData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex h-14 items-center justify-between rounded-lg border border-[#e1e3e9] bg-white px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-8">
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M24.2 31.4H7.8C5.4804 31.4 3.6 29.5196 3.6 27.2V4.8C3.6 2.4804 5.4804 0.6 7.8 0.6H16.471C17.5737 0.6 18.6321 1.03361 19.4178 1.80722L27.1467 9.41728C27.9485 10.2067 28.4 11.2849 28.4 12.4101V27.2C28.4 29.5196 26.5196 31.4 24.2 31.4Z"
                            fill="white"
                            stroke="#CACFD8"
                            strokeWidth="1.2"
                          />
                          <path d="M18 1V7.8C18 9.56731 19.4327 11 21.2 11H28" stroke="#CACFD8" strokeWidth="1.2" />
                          <path
                            d="M0 17C0 15.3431 1.34315 14 3 14H27C28.6569 14 30 15.3431 30 17V25C30 26.6569 28.6569 28 27 28H3C1.34315 28 0 26.6569 0 25V17Z"
                            fill="#FF8447"
                          />
                          <text
                            x="15"
                            y="21"
                            fontFamily="Arial, sans-serif"
                            fontSize="9"
                            fill="white"
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            {doc.name.split('.').pop()?.toUpperCase().substring(0, 4) || 'FILE'}
                          </text>
                        </svg>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium leading-tight text-[#0d111b]">{doc.name}</div>
                        <div className="text-xs font-normal leading-none text-[#525866]">
                          {doc.type === 'file' && doc.size ? formatFileSize(doc.size) : ''}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRemoveDocument(doc.id)} className="cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path
                            d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
                            fill="var(--icon-sub-600)"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sticky bottom-0 z-10 mb-4 mt-0 flex items-center justify-between bg-white px-5">
            <div className="invisible flex items-center gap-2">
              <input
                id="autoSync"
                className="h-4 w-4 rounded border-gray-300"
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
              />
              <label htmlFor="autoSync" className="text-sm text-[#525866]">
                Actualiza el contenido existente cada 24 horas
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseCreateModal}
                disabled={isSaving}
                className="h-9 rounded-lg border border-[#e1e3e9] bg-white px-3 py-2 shadow-sm"
              >
                <div className="text-text-sub-600 text-sm font-medium leading-normal">Cancelar</div>
              </button>
              <button
                onClick={handleSaveKnowledgeBase}
                disabled={isSaving || !newKnowledgeBaseData.name.trim() || newKnowledgeBaseData.documents.length === 0}
                className={`inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  isSaving || !newKnowledgeBaseData.name.trim() || newKnowledgeBaseData.documents.length === 0
                    ? 'cursor-not-allowed bg-gray-300'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                <div className="text-text-white-0 text-sm font-medium leading-normal">
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-h-[90vh] w-[850px] max-w-[90vw] overflow-hidden bg-white p-0">
          <div className="flex max-h-[90vh] flex-col">
            <div className="border-b border-gray-200 px-5 py-4">
              <h2 className="text-xl font-semibold">Editar Base de Conocimiento</h2>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Nombre de la Base de Conocimiento</label>
                <input
                  type="text"
                  value={editKnowledgeBaseData.name}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm opacity-60"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Documentos Existentes</label>
                {selectedKnowledgeBase?.knowledge_base_sources &&
                selectedKnowledgeBase.knowledge_base_sources.length > 0 ? (
                  <div className="mb-4 flex flex-col gap-2">
                    {selectedKnowledgeBase.knowledge_base_sources.map((source) => (
                      <div
                        key={source.source_id}
                        className="flex items-center gap-3 rounded-lg border border-[#e1e3e9] bg-gray-50 px-3 py-2"
                      >
                        <div className="relative h-8 w-8">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M24.2 31.4H7.8C5.4804 31.4 3.6 29.5196 3.6 27.2V4.8C3.6 2.4804 5.4804 0.6 7.8 0.6H16.471C17.5737 0.6 18.6321 1.03361 19.4178 1.80722L27.1467 9.41728C27.9485 10.2067 28.4 11.2849 28.4 12.4101V27.2C28.4 29.5196 26.5196 31.4 24.2 31.4Z"
                              fill="white"
                              stroke="#CACFD8"
                              strokeWidth="1.2"
                            />
                            <path d="M18 1V7.8C18 9.56731 19.4327 11 21.2 11H28" stroke="#CACFD8" strokeWidth="1.2" />
                            <path
                              d="M0 17C0 15.3431 1.34315 14 3 14H27C28.6569 14 30 15.3431 30 17V25C30 26.6569 28.6569 28 27 28H3C1.34315 28 0 26.6569 0 25V17Z"
                              fill="#FF8447"
                            />
                            <text
                              x="15"
                              y="21"
                              fontFamily="Arial, sans-serif"
                              fontSize="9"
                              fill="white"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {source.filename.split('.').pop()?.toUpperCase().substring(0, 4) || 'FILE'}
                            </text>
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-medium leading-tight text-[#0d111b]">{source.filename}</div>
                          <div className="text-xs font-normal leading-none text-[#525866]">
                            {formatFileSize(source.file_size)}
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => handleDeleteSource(source.source_id)}
                            disabled={deletingSourceId === source.source_id}
                            className="cursor-pointer disabled:opacity-50"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                            >
                              <path
                                d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
                                fill="#525866"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mb-4 text-sm text-gray-500">No hay documentos existentes</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Agregar Nuevos Documentos</label>
                <input
                  ref={editFileInputRef}
                  type="file"
                  multiple
                  onChange={handleEditFileSelect}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                />

                <div className="relative mb-4">
                  <button
                    onClick={() => setShowEditDropdown(!showEditDropdown)}
                    className="flex h-10 items-center gap-2 rounded-lg border border-[#e1e3e9] bg-white px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 3.5V12.5M12.5 8H3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    Agregar
                  </button>

                  {showEditDropdown && (
                    <div className="absolute left-0 top-12 z-50 w-[350px] rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                      <div className="flex flex-col gap-2">
                        <div
                          onClick={() => setShowEditDropdown(false)}
                          className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg bg-white p-2 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-center gap-2.5 rounded-full border border-[#e1e3e9] p-2.5 shadow">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M10.7949 7.08249L11.8562 8.14374C12.3438 8.63126 12.7305 9.21004 12.9944 9.84703C13.2583 10.484 13.3941 11.1668 13.3941 11.8562C13.3941 12.5457 13.2583 13.2285 12.9944 13.8655C12.7305 14.5024 12.3438 15.0812 11.8562 15.5687L11.5907 15.8335C10.6061 16.8181 9.27066 17.3713 7.8782 17.3713C6.48574 17.3713 5.15031 16.8181 4.1657 15.8335C3.18108 14.8489 2.62793 13.5134 2.62793 12.121C2.62793 10.7285 3.18108 9.39311 4.1657 8.40849L5.22695 9.46974C4.87622 9.81741 4.59763 10.2309 4.40714 10.6865C4.21666 11.1422 4.11805 11.6309 4.11697 12.1248C4.11589 12.6186 4.21236 13.1078 4.40084 13.5642C4.58933 14.0207 4.86611 14.4354 5.21531 14.7846C5.56451 15.1338 5.97924 15.4106 6.43569 15.5991C6.89214 15.7876 7.38133 15.8841 7.87517 15.883C8.36901 15.8819 8.85777 15.7833 9.31339 15.5928C9.76902 15.4023 10.1825 15.1237 10.5302 14.773L10.7957 14.5075C11.4987 13.8043 11.8936 12.8506 11.8936 11.8562C11.8936 10.8619 11.4987 9.90822 10.7957 9.20499L9.73445 8.14374L10.7957 7.08324L10.7949 7.08249ZM15.8334 11.5907L14.7729 10.5302C15.1237 10.1826 15.4023 9.76906 15.5927 9.31344C15.7832 8.85781 15.8818 8.36905 15.8829 7.87521C15.884 7.38138 15.7875 6.89219 15.5991 6.43573C15.4106 5.97928 15.1338 5.56455 14.7846 5.21535C14.4354 4.86616 14.0207 4.58937 13.5642 4.40089C13.1077 4.2124 12.6186 4.11593 12.1247 4.11701C11.6309 4.11809 11.1421 4.21671 10.6865 4.40719C10.2309 4.59767 9.81736 4.87627 9.4697 5.22699L9.2042 5.49249C8.50118 6.19572 8.10625 7.14937 8.10625 8.14374C8.10625 9.13811 8.50118 10.0918 9.2042 10.795L10.2654 11.8562L9.2042 12.9167L8.1437 11.8562C7.65613 11.3687 7.26937 10.7899 7.0055 10.153C6.74163 9.51596 6.60582 8.83323 6.60582 8.14374C6.60582 7.45426 6.74163 6.77152 7.0055 6.13453C7.26937 5.49754 7.65613 4.91876 8.1437 4.43124L8.4092 4.16649C9.39381 3.18187 10.7292 2.62872 12.1217 2.62872C13.5142 2.62872 14.8496 3.18187 15.8342 4.16649C16.8188 5.15111 17.372 6.48653 17.372 7.87899C17.372 9.27145 16.8188 10.6069 15.8342 11.5915L15.8334 11.5907Z"
                                fill="var(--icon-sub-600)"
                              />
                            </svg>
                          </div>
                          <div className="flex flex-grow flex-col">
                            <div className="text-text-strong-950 text-sm font-medium">Agregar Páginas Web</div>
                            <div className="text-text-sub-600 text-xs font-normal">
                              Rastrear y sincronizar tu sitio web
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => {
                            editFileInputRef.current?.click();
                            setShowEditDropdown(false);
                          }}
                          className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg bg-white p-2 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-center gap-2.5 rounded-full border border-[#e1e3e9] p-2.5 shadow">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M3.25 15.25H16.75V16.75H3.25V15.25ZM10.75 5.371V13.75H9.25V5.371L4.69675 9.925L3.63625 8.8645L10 2.5L16.3638 8.86375L15.3032 9.92425L10.75 5.3725V5.371Z"
                                fill="#525866"
                              />
                            </svg>
                          </div>
                          <div className="flex flex-grow flex-col">
                            <div className="text-text-strong-950 text-sm font-medium">Subir Archivos</div>
                            <div className="text-text-sub-600 text-xs font-normal">
                              El tamaño del archivo debe ser menor a 100MB
                            </div>
                          </div>
                        </div>

                        <div
                          onClick={() => setShowEditDropdown(false)}
                          className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg bg-white p-2 hover:bg-gray-50"
                        >
                          <div className="flex items-center justify-center gap-2.5 rounded-full border border-[#e1e3e9] p-2.5 shadow">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 20 20"
                              fill="none"
                            >
                              <path
                                d="M16 17.5H4C3.80109 17.5 3.61032 17.421 3.46967 17.2803C3.32902 17.1397 3.25 16.9489 3.25 16.75V3.25C3.25 3.05109 3.32902 2.86032 3.46967 2.71967C3.61032 2.57902 3.80109 2.5 4 2.5H16C16.1989 2.5 16.3897 2.57902 16.5303 2.71967C16.671 2.86032 16.75 3.05109 16.75 3.25V16.75C16.75 16.9489 16.671 17.1397 16.5303 17.2803C16.3897 17.421 16.1989 17.5 16 17.5ZM15.25 16V4H4.75V16H15.25ZM7 6.25H13V7.75H7V6.25ZM7 9.25H13V10.75H7V9.25ZM7 12.25H10.75V13.75H7V12.25Z"
                                fill="#525866"
                              />
                            </svg>
                          </div>
                          <div className="flex flex-grow flex-col">
                            <div className="text-text-strong-950 text-sm font-medium">Agregar Texto</div>
                            <div className="text-text-sub-600 text-xs font-normal">Agregar artículos manualmente</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {editKnowledgeBaseData.documents.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {editKnowledgeBaseData.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 rounded-lg border border-[#e1e3e9] px-3 py-2"
                      >
                        <div className="relative h-8 w-8">
                          <svg
                            width="32"
                            height="32"
                            viewBox="0 0 32 32"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M24.2 31.4H7.8C5.4804 31.4 3.6 29.5196 3.6 27.2V4.8C3.6 2.4804 5.4804 0.6 7.8 0.6H16.471C17.5737 0.6 18.6321 1.03361 19.4178 1.80722L27.1467 9.41728C27.9485 10.2067 28.4 11.2849 28.4 12.4101V27.2C28.4 29.5196 26.5196 31.4 24.2 31.4Z"
                              fill="white"
                              stroke="#CACFD8"
                              strokeWidth="1.2"
                            />
                            <path d="M18 1V7.8C18 9.56731 19.4327 11 21.2 11H28" stroke="#CACFD8" strokeWidth="1.2" />
                            <path
                              d="M0 17C0 15.3431 1.34315 14 3 14H27C28.6569 14 30 15.3431 30 17V25C30 26.6569 28.6569 28 27 28H3C1.34315 28 0 26.6569 0 25V17Z"
                              fill="#FF8447"
                            />
                            <text
                              x="15"
                              y="21"
                              fontFamily="Arial, sans-serif"
                              fontSize="9"
                              fill="white"
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              {doc.name.split('.').pop()?.toUpperCase().substring(0, 4) || 'FILE'}
                            </text>
                          </svg>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="text-sm font-medium leading-tight text-[#0d111b]">{doc.name}</div>
                          <div className="text-xs font-normal leading-none text-[#525866]">
                            {doc.type === 'file' && doc.size ? formatFileSize(doc.size) : ''}
                          </div>
                        </div>
                        <div className="ml-auto flex items-center gap-2">
                          <button onClick={() => handleRemoveEditDocument(doc.id)} className="cursor-pointer">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 18 18"
                              fill="none"
                            >
                              <path
                                d="M12.375 4.95H15.75V6.3H14.4V15.075C14.4 15.254 14.3289 15.4257 14.2023 15.5523C14.0757 15.6789 13.904 15.75 13.725 15.75H4.275C4.09598 15.75 3.92429 15.6789 3.7977 15.5523C3.67112 15.4257 3.6 15.254 3.6 15.075V6.3H2.25V4.95H5.625V2.925C5.625 2.74598 5.69612 2.57429 5.8227 2.4477C5.94929 2.32112 6.12098 2.25 6.3 2.25H11.7C11.879 2.25 12.0507 2.32112 12.1773 2.4477C12.3039 2.57429 12.375 2.74598 12.375 2.925V4.95ZM13.05 6.3H4.95V14.4H13.05V6.3ZM6.975 8.325H8.325V12.375H6.975V8.325ZM9.675 8.325H11.025V12.375H9.675V8.325ZM6.975 3.6V4.95H11.025V3.6H6.975Z"
                                fill="var(--icon-sub-600)"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-200 bg-white px-5 py-4">
              <button
                onClick={handleCloseEditModal}
                disabled={isSaving}
                className="h-9 rounded-lg border border-[#e1e3e9] bg-white px-3 py-2 shadow-sm"
              >
                <div className="text-text-sub-600 text-sm font-medium leading-normal">Cancelar</div>
              </button>
              <button
                onClick={handleSaveEditKnowledgeBase}
                disabled={isSaving || editKnowledgeBaseData.documents.length === 0}
                className={`inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  isSaving || editKnowledgeBaseData.documents.length === 0
                    ? 'cursor-not-allowed bg-gray-300'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                <div className="text-text-white-0 text-sm font-medium leading-normal">
                  {isSaving ? 'Guardando...' : 'Guardar'}
                </div>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CustomAlertDialog
        open={!!errorAlert}
        onOpenChange={() => setErrorAlert(null)}
        title={errorAlert?.title || ''}
        description={errorAlert?.message || ''}
      />

      <CustomAlertDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Eliminar base de conocimiento"
        description="¿Estás seguro de que deseas eliminar esta base de conocimiento? Esta acción no se puede deshacer."
        actionLabel="Eliminar"
        cancelLabel="Cancelar"
        onAction={handleDeleteKnowledgeBase}
        isLoading={isDeleting}
      />

      <Dialog open={showAddOptionsModal} onOpenChange={setShowAddOptionsModal}>
        <DialogContent className="w-[350px] rounded-lg border border-gray-200 bg-white p-0 shadow-lg">
          <div className="flex flex-col gap-2 p-2">
            <div
              onClick={() => {
                setShowAddOptionsModal(false);
              }}
              className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg bg-white p-2 hover:bg-gray-50"
            >
              <div className="flex items-center justify-center gap-2.5 rounded-full border border-[#e1e3e9] p-2.5 shadow">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10.7949 7.08249L11.8562 8.14374C12.3438 8.63126 12.7305 9.21004 12.9944 9.84703C13.2583 10.484 13.3941 11.1668 13.3941 11.8562C13.3941 12.5457 13.2583 13.2285 12.9944 13.8655C12.7305 14.5024 12.3438 15.0812 11.8562 15.5687L11.5907 15.8335C10.6061 16.8181 9.27066 17.3713 7.8782 17.3713C6.48574 17.3713 5.15031 16.8181 4.1657 15.8335C3.18108 14.8489 2.62793 13.5134 2.62793 12.121C2.62793 10.7285 3.18108 9.39311 4.1657 8.40849L5.22695 9.46974C4.87622 9.81741 4.59763 10.2309 4.40714 10.6865C4.21666 11.1422 4.11805 11.6309 4.11697 12.1248C4.11589 12.6186 4.21236 13.1078 4.40084 13.5642C4.58933 14.0207 4.86611 14.4354 5.21531 14.7846C5.56451 15.1338 5.97924 15.4106 6.43569 15.5991C6.89214 15.7876 7.38133 15.8841 7.87517 15.883C8.36901 15.8819 8.85777 15.7833 9.31339 15.5928C9.76902 15.4023 10.1825 15.1237 10.5302 14.773L10.7957 14.5075C11.4987 13.8043 11.8936 12.8506 11.8936 11.8562C11.8936 10.8619 11.4987 9.90822 10.7957 9.20499L9.73445 8.14374L10.7957 7.08324L10.7949 7.08249ZM15.8334 11.5907L14.7729 10.5302C15.1237 10.1826 15.4023 9.76906 15.5927 9.31344C15.7832 8.85781 15.8818 8.36905 15.8829 7.87521C15.884 7.38138 15.7875 6.89219 15.5991 6.43573C15.4106 5.97928 15.1338 5.56455 14.7846 5.21535C14.4354 4.86616 14.0207 4.58937 13.5642 4.40089C13.1077 4.2124 12.6186 4.11593 12.1247 4.11701C11.6309 4.11809 11.1421 4.21671 10.6865 4.40719C10.2309 4.59767 9.81736 4.87627 9.4697 5.22699L9.2042 5.49249C8.50118 6.19572 8.10625 7.14937 8.10625 8.14374C8.10625 9.13811 8.50118 10.0918 9.2042 10.795L10.2654 11.8562L9.2042 12.9167L8.1437 11.8562C7.65613 11.3687 7.26937 10.7899 7.0055 10.153C6.74163 9.51596 6.60582 8.83323 6.60582 8.14374C6.60582 7.45426 6.74163 6.77152 7.0055 6.13453C7.26937 5.49754 7.65613 4.91876 8.1437 4.43124L8.4092 4.16649C9.39381 3.18187 10.7292 2.62872 12.1217 2.62872C13.5142 2.62872 14.8496 3.18187 15.8342 4.16649C16.8188 5.15111 17.372 6.48653 17.372 7.87899C17.372 9.27145 16.8188 10.6069 15.8342 11.5915L15.8334 11.5907Z"
                    fill="var(--icon-sub-600)"
                  />
                </svg>
              </div>
              <div className="flex flex-grow flex-col">
                <div className="text-text-strong-950 text-sm font-medium">Agregar Páginas Web</div>
                <div className="text-text-sub-600 text-xs font-normal">Rastrear y sincronizar tu sitio web</div>
              </div>
            </div>

            <div
              onClick={() => {
                fileInputRef.current?.click();
                setShowAddOptionsModal(false);
              }}
              className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg bg-white p-2 hover:bg-gray-50"
            >
              <div className="flex items-center justify-center gap-2.5 rounded-full border border-[#e1e3e9] p-2.5 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M3.25 15.25H16.75V16.75H3.25V15.25ZM10.75 5.371V13.75H9.25V5.371L4.69675 9.925L3.63625 8.8645L10 2.5L16.3638 8.86375L15.3032 9.92425L10.75 5.3725V5.371Z"
                    fill="#525866"
                  />
                </svg>
              </div>
              <div className="flex flex-grow flex-col">
                <div className="text-text-strong-950 text-sm font-medium">Subir Archivos</div>
                <div className="text-text-sub-600 text-xs font-normal">
                  El tamaño del archivo debe ser menor a 100MB
                </div>
              </div>
            </div>

            <div
              onClick={() => {
                setShowAddOptionsModal(false);
              }}
              className="flex w-full cursor-pointer items-center justify-start gap-2 rounded-lg bg-white p-2 hover:bg-gray-50"
            >
              <div className="flex items-center justify-center gap-2.5 rounded-full border border-[#e1e3e9] p-2.5 shadow">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M16 17.5H4C3.80109 17.5 3.61032 17.421 3.46967 17.2803C3.32902 17.1397 3.25 16.9489 3.25 16.75V3.25C3.25 3.05109 3.32902 2.86032 3.46967 2.71967C3.61032 2.57902 3.80109 2.5 4 2.5H16C16.1989 2.5 16.3897 2.57902 16.5303 2.71967C16.671 2.86032 16.75 3.05109 16.75 3.25V16.75C16.75 16.9489 16.671 17.1397 16.5303 17.2803C16.3897 17.421 16.1989 17.5 16 17.5ZM15.25 16V4H4.75V16H15.25ZM7 6.25H13V7.75H7V6.25ZM7 9.25H13V10.75H7V9.25ZM7 12.25H10.75V13.75H7V12.25Z"
                    fill="#525866"
                  />
                </svg>
              </div>
              <div className="flex flex-grow flex-col">
                <div className="text-text-strong-950 text-sm font-medium">Agregar Texto</div>
                <div className="text-text-sub-600 text-xs font-normal">Agregar artículos manualmente</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
