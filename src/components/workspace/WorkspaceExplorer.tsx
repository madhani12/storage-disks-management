import React, { useState } from 'react';
import {
  FolderTree,
  Folder,
  FileCode,
  FileText,
  Shield,
  FileJson,
  ChevronRight,
  ChevronDown,
  Layers,
  HardDrive,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

interface TreeNode {
  name: string;
  type: 'folder' | 'file';
  size?: string;
  description?: string;
  children?: TreeNode[];
  content?: string;
}

const WORKSPACE_TREE: TreeNode = {
  name: 'EWM-Workspace',
  type: 'folder',
  description: 'Root external storage mount point',
  children: [
    {
      name: 'system',
      type: 'folder',
      description: 'Internal EWM manifest and hardware binding identity',
      children: [
        {
          name: 'workspace-manifest.json',
          type: 'file',
          size: '4.2 KB',
          content: JSON.stringify(
            {
              version: '2.4.0',
              schema: 'ewm-spec-v2',
              created_at: '2026-08-20T08:30:00Z',
              last_sync: '2026-08-25T10:45:00Z',
              active_profiles: ['chatgpt', 'claude', 'codex', 'deepseek', 'vscode', 'ollama'],
              encryption: {
                enabled: true,
                algorithm: 'AES-256-GCM',
                hardware_bound: true
              },
              safety_verification: {
                checksum_algorithm: 'SHA-256',
                strict_mode_default: true
              }
            },
            null,
            2
          )
        },
        {
          name: 'drive-identity.json',
          type: 'file',
          size: '1.8 KB',
          content: JSON.stringify(
            {
              volume_label: 'AI-SSD-01',
              hardware_serial: 'SAMSUNG_MU-PG2T0B_882910AF2',
              volume_guid: '9f83a210-44bb-4e78-9e12-88fb0129ac10',
              registered_owner: 'user@workspace',
              trusted_devices: ['LAPTOP-WIN11-PRO', 'WORKSTATION-X1']
            },
            null,
            2
          )
        },
        {
          name: 'recovery',
          type: 'folder',
          description: 'Transactional rollback checkpoints',
          children: [
            { name: 'checkpoint_20260825_1030.bak', type: 'file', size: '18 MB' },
            { name: 'junction_table_restore.map', type: 'file', size: '120 KB' }
          ]
        }
      ]
    },
    {
      name: 'applications',
      type: 'folder',
      description: 'Private isolated profiles, caches, attachments, and logs',
      children: [
        {
          name: 'chatgpt',
          type: 'folder',
          children: [
            { name: 'storage', type: 'folder', description: 'Conversation database & voice cache' },
            { name: 'exports', type: 'folder', description: 'Code Interpreter outputs & canvas projects' },
            { name: 'logs', type: 'folder', description: 'Telemetry & local debug' }
          ]
        },
        {
          name: 'claude',
          type: 'folder',
          children: [
            { name: 'mcp-storage', type: 'folder', description: 'Model Context Protocol tool data' },
            { name: 'artifacts', type: 'folder', description: 'Exported code, charts, HTML renders' },
            { name: 'cache', type: 'folder', description: 'Fast render caches' }
          ]
        },
        {
          name: 'codex',
          type: 'folder',
          children: [
            { name: 'workspaces', type: 'folder', description: 'AST index & codebase vectors' },
            { name: 'embeddings', type: 'folder', description: 'Locally cached neural embeddings' }
          ]
        },
        {
          name: 'deepseek',
          type: 'folder',
          children: [
            { name: 'quantized_weights', type: 'folder', description: 'GGUF & Safetensors' },
            { name: 'eval_results', type: 'folder', description: 'Benchmark outputs' }
          ]
        },
        {
          name: 'google-ai-studio',
          type: 'folder',
          children: [
            { name: 'build_bundles', type: 'folder', description: 'Full-stack zip archives' },
            { name: 'prompts', type: 'folder', description: 'Saved system instructions' }
          ]
        }
      ]
    },
    {
      name: 'projects',
      type: 'folder',
      description: 'Active and archived shared code repositories',
      children: [
        { name: 'active', type: 'folder', description: 'Fast live development workspace' },
        { name: 'archived', type: 'folder', description: 'Completed and compressed codebases' },
        { name: 'shared', type: 'folder', description: 'Multi-agent accessible workspace' }
      ]
    },
    {
      name: 'artifacts',
      type: 'folder',
      description: 'Generated documents, media, and deliverables',
      children: [
        { name: 'documents', type: 'folder', description: 'PDFs, DOCX, Markdown outputs' },
        { name: 'images', type: 'folder', description: 'Generated visuals & diagrams' },
        { name: 'audio', type: 'folder', description: 'Voice recordings and TTS syntheses' },
        { name: 'video', type: 'folder', description: 'Rendered video clips' },
        { name: 'code', type: 'folder', description: 'Exported standalone modules' }
      ]
    },
    {
      name: 'models',
      type: 'folder',
      description: 'Global neural network weights, GGUF, safetensors, checkpoints'
    },
    {
      name: 'datasets',
      type: 'folder',
      description: 'Fine-tuning datasets, CSVs, parquet embeddings'
    },
    {
      name: 'caches',
      type: 'folder',
      description: 'PyTorch CUDA kernels, TypeScript ASTs, npm/pip caches'
    },
    {
      name: 'packages',
      type: 'folder',
      description: 'VS Code extensions, Python wheel repositories'
    },
    {
      name: 'environments',
      type: 'folder',
      description: 'Docker VHDX virtual disks, WSL2 distributions, conda envs'
    },
    {
      name: 'logs',
      type: 'folder',
      description: 'EWM transaction logs, NTFS redirection audit trails'
    },
    {
      name: 'backups',
      type: 'folder',
      description: 'Versioned differential snapshots and emergency recovery images'
    },
    {
      name: 'quarantine',
      type: 'folder',
      description: 'Suspicious or untracked local writes pending security review'
    }
  ]
};

export const WorkspaceExplorer: React.FC = () => {
  const { drives } = useWorkspace();
  const [selectedDriveId, setSelectedDriveId] = useState<string>(drives[1]?.id || drives[0]?.id);
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'EWM-Workspace': true,
    'EWM-Workspace/system': true,
    'EWM-Workspace/applications': true,
    'EWM-Workspace/projects': false,
    'EWM-Workspace/artifacts': false
  });
  const [selectedFile, setSelectedFile] = useState<TreeNode | null>(
    WORKSPACE_TREE.children?.[0]?.children?.[0] || null
  );
  const [copied, setCopied] = useState(false);

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderTree = (node: TreeNode, currentPath: string) => {
    const isExpanded = expandedNodes[currentPath];
    const hasChildren = node.children && node.children.length > 0;

    if (node.type === 'file') {
      const isSelected = selectedFile?.name === node.name;
      return (
        <div
          key={currentPath}
          onClick={() => setSelectedFile(node)}
          className={`flex items-center justify-between py-2 px-2.5 rounded-xl cursor-pointer text-xs font-mono transition ${
            isSelected
              ? 'bg-[#6366F1] text-white font-bold shadow-md shadow-indigo-600/30'
              : 'text-indigo-200 hover:bg-indigo-900/30'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {node.name.endsWith('.json') ? (
              <FileJson className="w-3.5 h-3.5 text-[#FACC15] shrink-0" />
            ) : (
              <FileText className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </div>
          {node.size && <span className="text-[10px] opacity-80 ml-2 font-sans font-bold">{node.size}</span>}
        </div>
      );
    }

    return (
      <div key={currentPath} className="space-y-1">
        <div
          onClick={() => toggleNode(currentPath)}
          className="flex items-center justify-between py-2 px-2.5 rounded-xl cursor-pointer text-xs font-bold text-white hover:bg-indigo-900/30 transition select-none"
        >
          <div className="flex items-center gap-2 truncate">
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              )
            ) : (
              <span className="w-3.5" />
            )}
            <Folder
              className={`w-4 h-4 shrink-0 ${
                node.name === 'quarantine' ? 'text-[#F43F5E]' : 'text-[#FACC15]'
              }`}
            />
            <span className="font-black truncate">{node.name}/</span>
          </div>
          {node.description && (
            <span className="text-[10px] text-indigo-300 truncate max-w-[140px] hidden sm:inline font-normal">
              {node.description}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="pl-4 border-l-2 border-indigo-800/60 ml-3 space-y-1">
            {node.children!.map((child) => renderTree(child, `${currentPath}/${child.name}`))}
          </div>
        )}
      </div>
    );
  };

  const selectedDrive = drives.find((d) => d.id === selectedDriveId) || drives[0];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E1B4B] border border-indigo-900/60 p-6 rounded-3xl shadow-xl shadow-indigo-950/30">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#6366F1] flex items-center justify-center text-white shadow-md">
              <FolderTree className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-black text-white tracking-tight">Standard Workspace Directory Structure</h2>
          </div>
          <p className="text-xs text-indigo-300 mt-1">
            Standardized filesystem hierarchy provisioned on external volumes for multi-app workspace isolation.
          </p>
        </div>

        {/* Destination Drive Selector */}
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="text-xs text-indigo-300 font-bold">Viewing Volume:</span>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="bg-[#13113A] border border-indigo-700/60 text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:border-[#6366F1] font-bold"
          >
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.label} ({d.mountPoint})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left Directory Tree (6 cols) & Right File/Manifest Inspector (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Interactive Tree Browser */}
        <div className="lg:col-span-6 bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-indigo-900/60">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4ADE80]"></span>
              <span className="text-xs font-mono font-black text-white">
                {selectedDrive.mountPoint}EWM-Workspace\
              </span>
            </div>
            <span className="text-[10px] text-[#FACC15] uppercase font-mono font-bold tracking-wider">
              {selectedDrive.volumeIdentity}
            </span>
          </div>

          <div className="bg-[#13113A] p-4 rounded-2xl border border-indigo-800/60 max-h-[500px] overflow-y-auto space-y-1 shadow-inner">
            {renderTree(WORKSPACE_TREE, 'EWM-Workspace')}
          </div>
        </div>

        {/* Right Col: Manifest & Metadata File Viewer */}
        <div className="lg:col-span-6 bg-[#1E1B4B] border border-indigo-900/60 rounded-3xl p-6 shadow-xl shadow-indigo-950/30 space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-indigo-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
                <FileCode className="w-4 h-4" />
              </div>
              <h3 className="text-base font-black text-white">
                {selectedFile ? selectedFile.name : 'System Manifest Inspector'}
              </h3>
            </div>
            {selectedFile?.content && (
              <button
                onClick={() => handleCopy(selectedFile.content!)}
                className="text-xs px-3 py-1.5 rounded-xl bg-[#25215A] hover:bg-[#2E296E] text-white font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#4ADE80]" /> : <Copy className="w-3.5 h-3.5 text-[#FACC15]" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            )}
          </div>

          {selectedFile?.content ? (
            <div className="space-y-3.5">
              <div className="text-xs text-indigo-300 flex items-center justify-between font-medium">
                <span>File Size: <strong className="text-white font-bold">{selectedFile.size}</strong></span>
                <span className="text-[#4ADE80] font-mono text-xs font-bold">SHA-256 Integrity Verified</span>
              </div>
              <pre className="bg-[#13113A] p-4.5 rounded-2xl border border-indigo-800/60 font-mono text-xs text-[#4ADE80] overflow-x-auto max-h-[420px] leading-relaxed select-text shadow-inner">
                {selectedFile.content}
              </pre>
            </div>
          ) : (
            <div className="py-16 text-center text-indigo-400 space-y-3">
              <FileJson className="w-10 h-10 mx-auto text-indigo-500 opacity-60" />
              <p className="text-xs font-medium">Select any manifest or configuration file from the tree to inspect its contents.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
