import React, { useState, useEffect, useCallback } from 'react';
import {
  HardDrive,
  Search,
  FolderPlus,
  Upload,
  FileText,
  Folder,
  Trash2,
  ExternalLink,
  RefreshCw,
  Plus,
  Grid,
  List,
  AlertCircle,
  CheckCircle2,
  FileCode,
  Image as ImageIcon,
  FileSpreadsheet,
  File,
  X,
  MessageSquare,
  Sparkles,
  ChevronRight,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import { loginWithGoogle, getCachedAccessToken, logout, initAuthListener } from '../../lib/firebase';
import {
  listDriveFiles,
  uploadFileToDrive,
  createDriveFolder,
  deleteDriveFile,
  getDriveAboutInfo,
  GoogleDriveFile,
  DriveStorageQuota,
} from '../../lib/googleDrive';
import { useAppStore } from '../../store/useAppStore';

export const DriveModule: React.FC = () => {
  const { setActiveModule, addChatMessage, activeConvId, createNewConversation } = useAppStore();

  const [accessToken, setAccessToken] = useState<string | null>(getCachedAccessToken());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [quota, setQuota] = useState<DriveStorageQuota | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'folder' | 'document' | 'spreadsheet' | 'image'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Folder navigation stack: [{ id: string, name: string }]
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([
    { id: '', name: 'My Drive' },
  ]);

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showCreateDocModal, setShowCreateDocModal] = useState(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<GoogleDriveFile | null>(null);

  // Form states
  const [newFolderName, setNewFolderName] = useState('');
  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');
  const [uploadFileObj, setUploadFileObj] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentFolder = folderStack[folderStack.length - 1];

  // Initialize Auth listener
  useEffect(() => {
    const unsubscribe = initAuthListener(
      (_user, token) => {
        setAccessToken(token);
      },
      () => {
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await loginWithGoogle();
      if (res?.accessToken) {
        setAccessToken(res.accessToken);
        showToast('Successfully signed in with Google!');
      } else {
        setAuthError('Sign in succeeded, but access token was not returned.');
      }
    } catch (err: any) {
      console.error('Google Sign in error:', err);
      setAuthError(err?.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    setAccessToken(null);
    setFiles([]);
    setQuota(null);
    showToast('Signed out of Google Drive.');
  };

  // Fetch Drive Files & Storage Info
  const fetchDriveData = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);
    try {
      const [filesRes, aboutRes] = await Promise.all([
        listDriveFiles(accessToken, {
          folderId: currentFolder.id || undefined,
          query: searchQuery,
        }),
        getDriveAboutInfo(accessToken).catch(() => null),
      ]);

      setFiles(filesRes.files);
      if (aboutRes) {
        setQuota(aboutRes);
      }
    } catch (err: any) {
      console.error('Drive fetch error:', err);
      if (err?.message?.includes('401') || err?.message?.includes('Unauthenticated')) {
        setAccessToken(null);
        setAuthError('Session expired. Please sign in again.');
      } else {
        showToast(`Failed to load Drive files: ${err?.message || 'Unknown error'}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, currentFolder.id, searchQuery]);

  useEffect(() => {
    if (accessToken) {
      fetchDriveData();
    }
  }, [accessToken, fetchDriveData]);

  // Folder navigation
  const handleOpenFolder = (folder: GoogleDriveFile) => {
    setFolderStack((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const handleBreadcrumbClick = (index: number) => {
    setFolderStack((prev) => prev.slice(0, index + 1));
  };

  // Create Folder
  const handleCreateFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !newFolderName.trim()) return;
    setIsSubmitting(true);
    try {
      await createDriveFolder(accessToken, newFolderName.trim(), currentFolder.id || undefined);
      showToast(`Folder "${newFolderName}" created!`);
      setNewFolderName('');
      setShowNewFolderModal(false);
      fetchDriveData();
    } catch (err: any) {
      showToast(`Error creating folder: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create Text Document
  const handleCreateDocSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !docTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const filename = docTitle.trim().endsWith('.txt') ? docTitle.trim() : `${docTitle.trim()}.txt`;
      await uploadFileToDrive(
        accessToken,
        filename,
        docContent,
        'text/plain',
        currentFolder.id || undefined
      );
      showToast(`Document "${filename}" saved to Google Drive!`);
      setDocTitle('');
      setDocContent('');
      setShowCreateDocModal(false);
      fetchDriveData();
    } catch (err: any) {
      showToast(`Error saving document: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // File Upload
  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken || !uploadFileObj) return;
    setIsSubmitting(true);
    try {
      await uploadFileToDrive(
        accessToken,
        uploadFileObj.name,
        uploadFileObj,
        uploadFileObj.type || 'application/octet-stream',
        currentFolder.id || undefined
      );
      showToast(`Uploaded "${uploadFileObj.name}" to Google Drive!`);
      setUploadFileObj(null);
      setShowUploadModal(false);
      fetchDriveData();
    } catch (err: any) {
      showToast(`Error uploading file: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete File with mandatory confirmation dialog
  const handleConfirmDelete = async () => {
    if (!accessToken || !deleteConfirmTarget) return;
    const fileToDelete = deleteConfirmTarget;
    setIsSubmitting(true);
    try {
      await deleteDriveFile(accessToken, fileToDelete.id);
      showToast(`"${fileToDelete.name}" deleted from Google Drive.`);
      setDeleteConfirmTarget(null);
      fetchDriveData();
    } catch (err: any) {
      showToast(`Failed to delete file: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ask Lina AI about a Drive file
  const handleAskLinaAboutFile = (file: GoogleDriveFile) => {
    let targetConv = activeConvId;
    if (!targetConv) {
      targetConv = createNewConversation();
    }
    const prompt = `Can you analyze or summarize this file from my Google Drive?\n\nFile Name: ${file.name}\nFile ID: ${file.id}\nType: ${file.mimeType}\nLink: ${file.webViewLink || 'N/A'}`;
    addChatMessage(targetConv, {
      role: 'user',
      content: prompt,
    });
    setActiveModule('chat');
  };

  // Helper for rendering file icons
  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-8 h-8 text-amber-400 fill-amber-400/20" />;
    }
    if (mimeType.includes('image')) {
      return <ImageIcon className="w-8 h-8 text-emerald-400" />;
    }
    if (mimeType.includes('spreadsheet') || mimeType.includes('csv') || mimeType.includes('excel')) {
      return <FileSpreadsheet className="w-8 h-8 text-green-400" />;
    }
    if (mimeType.includes('document') || mimeType.includes('text') || mimeType.includes('pdf')) {
      return <FileText className="w-8 h-8 text-blue-400" />;
    }
    if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('code')) {
      return <FileCode className="w-8 h-8 text-purple-400" />;
    }
    return <File className="w-8 h-8 text-slate-400" />;
  };

  // Filter files by type
  const filteredFiles = files.filter((f) => {
    if (filterType === 'folder') return f.mimeType === 'application/vnd.google-apps.folder';
    if (filterType === 'document')
      return (
        f.mimeType.includes('document') ||
        f.mimeType.includes('text') ||
        f.mimeType.includes('pdf')
      );
    if (filterType === 'spreadsheet')
      return f.mimeType.includes('spreadsheet') || f.mimeType.includes('excel');
    if (filterType === 'image') return f.mimeType.includes('image');
    return true;
  });

  // Calculate storage usage percentage
  const totalLimit = quota?.limit ? parseInt(quota.limit, 10) : 15 * 1024 * 1024 * 1024;
  const totalUsage = quota?.usage ? parseInt(quota.usage, 10) : 0;
  const usedGb = (totalUsage / (1024 * 1024 * 1024)).toFixed(2);
  const limitGb = (totalLimit / (1024 * 1024 * 1024)).toFixed(0);
  const usagePercentage = Math.min(100, Math.round((totalUsage / totalLimit) * 100));

  // Render Login Prompt if not authenticated
  if (!accessToken) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center min-h-[500px]">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto text-violet-400">
            <HardDrive className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Connect Google Drive</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Access, organize, and create household documents directly inside your Google Drive.
              Sync family manuals, recipes, and receipts safely.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-300 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isAuthenticating ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secure OAuth token stored in memory</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-violet-600 text-white font-medium text-xs shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Storage Quota */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-3xl p-5 md:p-6 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white">Google Drive Workspace</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold text-[10px] flex items-center gap-1">
                <UserCheck className="w-3 h-3" /> Connected
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {quota?.user?.displayName ? `Account: ${quota.user.displayName} (${quota.user.emailAddress})` : 'Manage household files, documents & notes'}
            </p>
          </div>
        </div>

        {/* Quota bar & Logout */}
        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-6">
          <div className="w-36 space-y-1">
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Drive Storage</span>
              <span className="font-medium text-slate-200">{usedGb} GB / {limitGb} GB</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-violet-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={fetchDriveData}
            title="Refresh Files"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-violet-400' : ''}`} />
          </button>

          <button
            onClick={handleSignOut}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors underline"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowCreateDocModal(true)}
            className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-violet-600/20 transition-all"
          >
            <Plus className="w-4 h-4" /> New Text Note
          </button>

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 transition-all"
          >
            <FolderPlus className="w-4 h-4 text-amber-400" /> New Folder
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-xs flex items-center gap-2 transition-all"
          >
            <Upload className="w-4 h-4 text-cyan-400" /> Upload File
          </button>
        </div>

        {/* View Toggle & Search */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search Drive files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-colors ${viewMode === 'list' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs text-slate-400">
          {folderStack.map((f, idx) => (
            <React.Fragment key={f.id || 'root'}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
              <button
                onClick={() => handleBreadcrumbClick(idx)}
                className={`px-2 py-1 rounded-lg transition-colors whitespace-nowrap ${
                  idx === folderStack.length - 1
                    ? 'font-bold text-violet-300 bg-violet-600/10'
                    : 'hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {f.name}
              </button>
            </React.Fragment>
          ))}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {(
            [
              { id: 'all', label: 'All' },
              { id: 'folder', label: 'Folders' },
              { id: 'document', label: 'Docs' },
              { id: 'spreadsheet', label: 'Sheets' },
              { id: 'image', label: 'Images' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                filterType === t.id
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Files Display */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-violet-400 animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading files from Google Drive...</p>
        </div>
      ) : filteredFiles.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-800 rounded-3xl p-8 space-y-3">
          <HardDrive className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No files found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            This folder is empty or no files match your search query. Use the buttons above to create or upload new files.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFiles.map((file) => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            return (
              <div
                key={file.id}
                onClick={() => (isFolder ? handleOpenFolder(file) : null)}
                className={`group bg-slate-900/90 border border-slate-800/80 hover:border-violet-500/40 rounded-2xl p-4 transition-all flex flex-col justify-between space-y-3 ${
                  isFolder ? 'cursor-pointer hover:bg-slate-850' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
                    {getFileIcon(file.mimeType)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {!isFolder && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAskLinaAboutFile(file);
                        }}
                        title="Ask Lina AI about this file"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-violet-300 hover:bg-violet-600/20 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        title="Open in Google Drive"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmTarget(file);
                      }}
                      title="Delete File"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-violet-300 transition-colors">
                    {file.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isFolder
                      ? 'Folder'
                      : file.size
                      ? `${(parseInt(file.size, 10) / 1024).toFixed(0)} KB`
                      : 'Google Doc'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/60">
          {filteredFiles.map((file) => {
            const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
            return (
              <div
                key={file.id}
                onClick={() => (isFolder ? handleOpenFolder(file) : null)}
                className={`flex items-center justify-between p-3.5 hover:bg-slate-800/50 transition-colors ${
                  isFolder ? 'cursor-pointer' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-4">
                  <div className="shrink-0">{getFileIcon(file.mimeType)}</div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200 truncate">{file.name}</div>
                    <div className="text-[10px] text-slate-500">
                      {isFolder
                        ? 'Folder'
                        : file.size
                        ? `${(parseInt(file.size, 10) / 1024).toFixed(0)} KB`
                        : 'Document'}
                      {file.modifiedTime && ` • Modified ${new Date(file.modifiedTime).toLocaleDateString()}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!isFolder && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAskLinaAboutFile(file);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-violet-600/10 text-violet-300 hover:bg-violet-600/20 text-[11px] font-semibold flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3 h-3" /> Ask AI
                    </button>
                  )}

                  {file.webViewLink && (
                    <a
                      href={file.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirmTarget(file);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal (MANDATORY per Workspace Skill) */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-400">
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Delete File from Drive?</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white">"{deleteConfirmTarget.name}"</span>?
              This action will delete the item from your Google Drive.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmTarget(null)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/20"
              >
                {isSubmitting ? 'Deleting...' : 'Delete File'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create New Text Document Modal */}
      {showCreateDocModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-violet-400">
                <FileText className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Create Document in Drive</h3>
              </div>
              <button onClick={() => setShowCreateDocModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDocSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g., Household Rules or Emergency Info"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Content</label>
                <textarea
                  placeholder="Write content to save into Google Drive..."
                  value={docContent}
                  onChange={(e) => setDocContent(e.target.value)}
                  rows={6}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-violet-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateDocModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
                >
                  {isSubmitting ? 'Saving...' : 'Save to Google Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-400">
                <FolderPlus className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Create New Folder</h3>
              </div>
              <button onClick={() => setShowNewFolderModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolderSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Folder Name</label>
                <input
                  type="text"
                  placeholder="e.g., Financial Receipts"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewFolderModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold"
                >
                  {isSubmitting ? 'Creating...' : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400">
                <Upload className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">Upload File to Drive</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFileUploadSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2 hover:border-cyan-500/50 transition-colors">
                <Upload className="w-8 h-8 text-cyan-400 mx-auto" />
                <div className="text-xs font-medium text-slate-300">
                  {uploadFileObj ? uploadFileObj.name : 'Select a file to upload'}
                </div>
                <input
                  type="file"
                  onChange={(e) => setUploadFileObj(e.target.files?.[0] || null)}
                  className="hidden"
                  id="drive-upload-input"
                />
                <label
                  htmlFor="drive-upload-input"
                  className="inline-block px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs cursor-pointer hover:bg-slate-700 font-semibold"
                >
                  Choose File
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadFileObj || isSubmitting}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Uploading...' : 'Upload File'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
