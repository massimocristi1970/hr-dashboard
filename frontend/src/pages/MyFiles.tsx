import { useEffect, useState } from 'react';
import { api } from '../lib/api';

interface AgentFile {
  id: number;
  filename: string;
  file_description: string;
  onedrive_file_url: string;
  file_size_bytes: number;
  file_type: string;
  uploaded_at: string;
}

export default function MyFiles() {
  const [files, setFiles] = useState<AgentFile[]>([]);
  const [onedriveFolderUrl, setOnedriveFolderUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    filename: '',
    file_description: '',
    onedrive_file_url: '',
    file_type: '',
  });

  useEffect(() => {
    loadFiles();
  }, []);

  async function loadFiles() {
    try {
      setLoading(true);
      const data = await api.getMyFiles();
      setFiles(data.files);
      setOnedriveFolderUrl(data.onedrive_folder_url || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFile(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.uploadFileMetadata({
        filename: formData.filename,
        file_description: formData.file_description || undefined,
        onedrive_file_url: formData.onedrive_file_url,
        file_type: formData.file_type || undefined,
      });
      alert('File registered successfully!');
      setFormData({ filename: '', file_description: '', onedrive_file_url: '', file_type: '' });
      setShowAddForm(false);
      loadFiles();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  async function handleDeleteFile(id: number, filename: string) {
    if (!confirm(`Are you sure you want to remove "${filename}" from your files list?`)) {
      return;
    }
    try {
      await api.deleteFile(id);
      alert('File removed from list.');
      loadFiles();
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  }

  function formatFileSize(bytes: number | null): string {
    if (!bytes) return '-';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1 className="page-title">My Files</h1>
      
      {onedriveFolderUrl && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          borderRadius: '8px',
          backgroundColor: '#1e3a5f',
          border: '1px solid #3b82f6',
          color: '#93c5fd'
        }}>
          <h3 style={{ marginTop: 0, color: '#93c5fd' }}>Your OneDrive Folder</h3>
          <p style={{ color: '#93c5fd' }}>Upload files to your personal OneDrive folder, then register them here for tracking.</p>
          <a 
            href={onedriveFolderUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ marginTop: '0.5rem' }}
          >
            Open My OneDrive Folder
          </a>
        </div>
      )}

      {!onedriveFolderUrl && (
        <div style={{ 
          marginBottom: '1rem', 
          padding: '1rem', 
          borderRadius: '8px',
          backgroundColor: '#4a3f1a',
          border: '1px solid #f59e0b',
          color: '#fcd34d'
        }}>
          <p style={{ margin: 0, color: '#fcd34d' }}>
            <strong>Note:</strong> You don't have a OneDrive folder URL configured yet. 
            Please contact HR Admin to set up your personal OneDrive folder.
          </p>
        </div>
      )}
      
      <div className="card">
        <h2>My Registered Files</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{ marginBottom: '1rem' }}
        >
          {showAddForm ? 'Cancel' : 'Register New File'}
        </button>

        {showAddForm && (
          <form onSubmit={handleAddFile} style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#2a2a2a', borderRadius: '8px', border: '1px solid #444' }}>
            <p style={{ marginTop: 0, color: '#aaa' }}>
              After uploading a file to your OneDrive folder, register it here by providing the details below.
            </p>
            <div className="form-group">
              <label>File Name</label>
              <input
                type="text"
                required
                placeholder="e.g., Quarterly Report Q1 2026.pdf"
                value={formData.filename}
                onChange={(e) => setFormData({ ...formData, filename: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>OneDrive File URL</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={formData.onedrive_file_url}
                onChange={(e) => setFormData({ ...formData, onedrive_file_url: e.target.value })}
              />
              <small style={{ color: '#aaa' }}>
                Right-click the file in OneDrive and select "Copy link" to get the URL
              </small>
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <textarea
                rows={2}
                placeholder="Brief description of the file..."
                value={formData.file_description}
                onChange={(e) => setFormData({ ...formData, file_description: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>File Type (Optional)</label>
              <input
                type="text"
                placeholder="e.g., PDF, DOCX, XLSX"
                value={formData.file_type}
                onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-success">Register File</button>
          </form>
        )}

        {files.length === 0 ? (
          <p>No files registered yet. Upload files to your OneDrive folder and register them here.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>File Name</th>
                <th>Description</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr key={file.id}>
                  <td>
                    <a href={file.onedrive_file_url} target="_blank" rel="noopener noreferrer">
                      {file.filename}
                    </a>
                  </td>
                  <td>{file.file_description || '-'}</td>
                  <td>{file.file_type || '-'}</td>
                  <td>{formatFileSize(file.file_size_bytes)}</td>
                  <td>{new Date(file.uploaded_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeleteFile(file.id, file.filename)}
                      style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
