import React, { useState } from 'react';
import { 
  FileCode, Plus, Trash2, Eye, Save, Sparkles, Copy, Check, 
  Download, FileText, Code2, AlertTriangle, X, Terminal, Search
} from 'lucide-react';
import { DomainItem, HostedFile } from '../../types';
import { FILE_TEMPLATES, generateFileFromPrompt } from '../../utils/fileTemplates';
import { deployRealDomainFiles } from '../../utils/realApi';

interface FileManagerProps {
  domain: DomainItem;
  onUpdateDomain: (updated: DomainItem) => void;
  onOpenPreview: () => void;
}

export const FileManager: React.FC<FileManagerProps> = ({
  domain,
  onUpdateDomain,
  onOpenPreview,
}) => {
  const [selectedFileId, setSelectedFileId] = useState<string>(
    domain.files[0]?.id || ''
  );
  const [fileFilter, setFileFilter] = useState('');

  // Active file editing state
  const selectedFile = domain.files.find(f => f.id === selectedFileId) || domain.files[0];
  const [editorContent, setEditorContent] = useState<string>(selectedFile?.content || '');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  // New File Modal
  const [isCreatingNewFile, setIsCreatingNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [isPromptGenerating, setIsPromptGenerating] = useState(false);

  // Raw contents modal
  const [rawFileModal, setRawFileModal] = useState<HostedFile | null>(null);
  const [copiedRaw, setCopiedRaw] = useState(false);

  // Delete file confirmation
  const [fileToDelete, setFileToDelete] = useState<HostedFile | null>(null);

  // Handle switching active file
  const handleSelectFile = (file: HostedFile) => {
    setSelectedFileId(file.id);
    setEditorContent(file.content);
    setHasUnsavedChanges(false);
  };

  // Save changes to current file
  const handleSaveCurrentFile = () => {
    if (!selectedFile) return;

    const updatedFiles = domain.files.map(f => {
      if (f.id === selectedFile.id) {
        return {
          ...f,
          content: editorContent,
          size: new Blob([editorContent]).size,
          updatedAt: new Date().toLocaleTimeString(),
        };
      }
      return f;
    });

    onUpdateDomain({
      ...domain,
      files: updatedFiles,
    });
    deployRealDomainFiles(domain.name, domain.port, updatedFiles);

    setHasUnsavedChanges(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  // Create new file
  const handleCreateFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPath = newFileName.trim();
    if (!cleanPath) return;

    // Detect type
    const ext = cleanPath.split('.').pop()?.toLowerCase() || 'txt';
    const validExts: HostedFile['type'][] = ['html', 'tsx', 'ts', 'js', 'css', 'json', 'md', 'txt'];
    const type: HostedFile['type'] = validExts.includes(ext as any) ? (ext as HostedFile['type']) : 'txt';

    const newFile: HostedFile = {
      id: `file-${Date.now()}`,
      path: cleanPath,
      content: newFileContent,
      size: new Blob([newFileContent]).size,
      updatedAt: new Date().toLocaleTimeString(),
      type,
    };

    const updatedFiles = [...domain.files, newFile];
    onUpdateDomain({
      ...domain,
      files: updatedFiles,
    });
    deployRealDomainFiles(domain.name, domain.port, updatedFiles);

    setSelectedFileId(newFile.id);
    setEditorContent(newFile.content);
    setHasUnsavedChanges(false);
    setIsCreatingNewFile(false);
    setNewFileName('');
    setNewFileContent('');
    setPromptInput('');
  };

  // Prompt generator
  const handleGenerateFromPrompt = () => {
    if (!promptInput.trim()) return;
    setIsPromptGenerating(true);

    setTimeout(() => {
      const generated = generateFileFromPrompt(promptInput, newFileName);
      setNewFileName(generated.detectedName);
      setNewFileContent(generated.content);
      setIsPromptGenerating(false);
    }, 400);
  };

  // Apply template
  const handleApplyTemplate = (tpl: typeof FILE_TEMPLATES[0]) => {
    setNewFileName(tpl.filename);
    setNewFileContent(tpl.content);
  };

  // Delete file
  const handleExecuteDeleteFile = () => {
    if (!fileToDelete) return;
    const updated = domain.files.filter(f => f.id !== fileToDelete.id);
    onUpdateDomain({
      ...domain,
      files: updated,
    });
    deployRealDomainFiles(domain.name, domain.port, updated);

    if (selectedFileId === fileToDelete.id) {
      if (updated.length > 0) {
        setSelectedFileId(updated[0].id);
        setEditorContent(updated[0].content);
      } else {
        setSelectedFileId('');
        setEditorContent('');
      }
    }
    setFileToDelete(null);
  };

  // Copy raw contents
  const handleCopyRaw = () => {
    if (!rawFileModal) return;
    navigator.clipboard.writeText(rawFileModal.content);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 1800);
  };

  // Download raw file
  const handleDownloadRaw = () => {
    if (!rawFileModal) return;
    const blob = new Blob([rawFileModal.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = rawFileModal.path.split('/').pop() || 'file.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredFiles = domain.files.filter(f =>
    f.path.toLowerCase().includes(fileFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center space-x-2">
            <FileCode className="w-5 h-5 text-sky-400" />
            <span>Virtual Cloud File Manager & Hosting</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Create files, edit code, generate from prompts, view raw contents, and serve directly on Port {domain.port}.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsCreatingNewFile(true)}
            className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center space-x-1.5 shadow-md shadow-sky-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create File</span>
          </button>
        </div>
      </div>

      {/* Editor & File Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
        {/* Left: Files List Explorer */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Files ({domain.files.length})
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">Port {domain.port} Virtual FS</span>
          </div>

          {/* Search files */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={fileFilter}
              onChange={e => setFileFilter(e.target.value)}
              placeholder="Search files..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* File list items */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {filteredFiles.map(file => {
              const isSelected = selectedFile?.id === file.id;

              return (
                <div
                  key={file.id}
                  onClick={() => handleSelectFile(file)}
                  className={`p-2.5 rounded-xl transition flex items-center justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-sky-500/15 border border-sky-500/30 text-white'
                      : 'hover:bg-slate-800/60 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold font-mono ${
                      file.type === 'tsx' || file.type === 'ts'
                        ? 'bg-sky-500/20 text-sky-400'
                        : file.type === 'html'
                        ? 'bg-orange-500/20 text-orange-400'
                        : file.type === 'css'
                        ? 'bg-indigo-500/20 text-indigo-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {file.type.toUpperCase()}
                    </span>
                    <div className="truncate">
                      <div className="text-xs font-mono font-medium truncate">{file.path}</div>
                      <div className="text-[10px] text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setRawFileModal(file);
                      }}
                      title="Open Raw Contents"
                      className="p-1 hover:text-sky-400 rounded transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setFileToDelete(file);
                      }}
                      title="Delete File"
                      className="p-1 hover:text-rose-400 rounded transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Code Editor & Actions */}
        <div className="lg:col-span-8 flex flex-col space-y-3">
          {selectedFile ? (
            <>
              {/* File action bar */}
              <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sky-400">{selectedFile.path}</span>
                  {hasUnsavedChanges && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-medium">
                      Unsaved Changes
                    </span>
                  )}
                  {saveToast && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Saved!</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setRawFileModal(selectedFile)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium flex items-center space-x-1 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-sky-400" />
                    <span>Open Raw Contents</span>
                  </button>

                  <button
                    onClick={handleSaveCurrentFile}
                    className="px-3 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1 transition shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save File</span>
                  </button>
                </div>
              </div>

              {/* Editor Workspace */}
              <div className="relative flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden min-h-[380px] flex flex-col">
                <textarea
                  value={editorContent}
                  onChange={e => {
                    setEditorContent(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full flex-1 p-4 bg-transparent text-slate-200 font-mono text-xs sm:text-sm resize-none focus:outline-none focus:ring-0 leading-relaxed"
                  spellCheck={false}
                />
              </div>

              {/* Editor status footer */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
                <span>Lines: {editorContent.split('\n').length} • Characters: {editorContent.length}</span>
                <span>Encoding: UTF-8 • Bound to: Port {domain.port}</span>
              </div>
            </>
          ) : (
            <div className="p-12 text-center rounded-xl bg-slate-950 border border-slate-800 text-slate-500 space-y-2">
              <FileCode className="w-10 h-10 mx-auto text-slate-600" />
              <p>No file selected. Click "Create File" to start hosting your Vite app.</p>
            </div>
          )}
        </div>
      </div>

      {/* CREATE FILE MODAL (Prompt to generate / Enter file name & contents) */}
      {isCreatingNewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl p-6 space-y-5 text-white my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-sky-400" />
                  <span>Create New File</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Enter file name, write code, or use a natural language prompt to generate.
                </p>
              </div>
              <button
                onClick={() => setIsCreatingNewFile(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompt to generate file box */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-purple-950/40 border border-sky-500/30 space-y-2">
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-sky-400">
                <Sparkles className="w-4 h-4" />
                <span>Prompt to Generate File</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promptInput}
                  onChange={e => setPromptInput(e.target.value)}
                  placeholder="e.g. Create a Vite React analytics counter card on port 5902..."
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleGenerateFromPrompt}
                  disabled={isPromptGenerating || !promptInput.trim()}
                  className="px-3.5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg text-xs transition flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Code</span>
                </button>
              </div>
            </div>

            {/* Quick Templates picker */}
            <div className="space-y-1.5">
              <span className="text-xs text-slate-400 font-medium">Or choose a starter template:</span>
              <div className="flex flex-wrap gap-1.5">
                {FILE_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => handleApplyTemplate(tpl)}
                    className="px-2.5 py-1 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-mono transition cursor-pointer"
                  >
                    + {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Form: Name & Contents */}
            <form onSubmit={handleCreateFileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Enter File Name
                </label>
                <input
                  type="text"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  placeholder="e.g. src/components/Dashboard.tsx or index.html"
                  required
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Enter File Contents
                </label>
                <textarea
                  value={newFileContent}
                  onChange={e => setNewFileContent(e.target.value)}
                  placeholder="// Type or paste code here..."
                  rows={10}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-sky-500 leading-relaxed"
                  required
                />
              </div>

              <div className="border-t border-slate-800 pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreatingNewFile(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-lg shadow-sky-500/20 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save File to Host</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OPEN RAW CONTENTS MODAL */}
      {rawFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl p-6 space-y-4 text-white my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold font-mono text-sky-400 flex items-center space-x-2">
                  <Terminal className="w-5 h-5 text-sky-400" />
                  <span>Raw Contents: {rawFileModal.path}</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Exact byte-for-byte unrendered content as served by Port {domain.port}
                </p>
              </div>
              <button
                onClick={() => setRawFileModal(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Raw code view */}
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 overflow-x-auto max-h-[420px] whitespace-pre select-all leading-relaxed">
              {rawFileModal.content}
            </pre>

            {/* Action buttons */}
            <div className="flex items-center justify-between border-t border-slate-800 pt-3 text-xs">
              <span className="text-slate-500 font-mono">
                Size: {(rawFileModal.size / 1024).toFixed(2)} KB • MIME: text/plain
              </span>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadRaw}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyRaw}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                >
                  {copiedRaw ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Raw</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE FILE CONFIRMATION MODAL */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-rose-500/30 w-full max-w-sm rounded-2xl p-5 text-white space-y-4 shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-bold text-base">Delete File?</h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to delete <strong className="text-white font-mono">{fileToDelete.path}</strong> from hosting?
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setFileToDelete(null)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-xl text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDeleteFile}
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition"
              >
                Delete File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
