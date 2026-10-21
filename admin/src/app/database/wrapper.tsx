'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DatabaseHeader } from './DatabaseHeader';
import { DatabaseStatsGrid } from './DatabaseStatsGrid';
import { BackupsTable, BackupItem } from './BackupsTable';
import { DatabaseImportSection } from './DatabaseImportSection';
import { CreateBackupModal } from './CreateBackupModal';
import { ConfirmRestoreModal } from './ConfirmRestoreModal';
import { fetchApi, getAdminToken } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';

interface DatabaseStats {
  engine: string;
  status: string;
  databaseName: string;
  totalBackups: number;
  lastBackupTime: string | null;
  latencyMs?: number;
  counts: {
    products: number;
    categories: number;
    orders: number;
    users: number;
    reviews: number;
    settings: number;
    translations: number;
  };
}

export default function DatabaseManagementWrapper() {
  const { showSuccess, showError, showConfirm } = useAdminModal();
  const [backups, setBackups] = useState<BackupItem[]>([]);
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingBackup, setCreatingBackup] = useState<boolean>(false);
  const [restoring, setRestoring] = useState<boolean>(false);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [targetRestoreBackup, setTargetRestoreBackup] = useState<BackupItem | null>(null);

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [statsData, backupsData] = await Promise.all([
        fetchApi('/database/stats').catch(() => null),
        fetchApi('/database/backups').catch(() => []),
      ]);

      if (statsData) setStats(statsData);
      if (Array.isArray(backupsData)) setBackups(backupsData);
    } catch (err: any) {
      showError(err.message || 'Failed loading database state.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calculate total backup storage
  const totalStorageFormatted = useMemo(() => {
    const totalBytes = backups.reduce((acc, b) => acc + (b.fileSizeBytes || 0), 0);
    if (!totalBytes || totalBytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(totalBytes) / Math.log(k));
    return parseFloat((totalBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }, [backups]);

  // Download backup file to browser
  const handleDownload = async (fileName: string) => {
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/database/backup/${encodeURIComponent(fileName)}/download`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        throw new Error(`Download failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showSuccess(`Backup file "${fileName}" downloaded successfully.`);
    } catch (err: any) {
      showError(err.message || 'Failed to download backup file.');
    }
  };

  // Create new backup
  const handleCreateBackup = async (format: 'sql' | 'json') => {
    setCreatingBackup(true);
    try {
      const res = await fetchApi('/database/backup', {
        method: 'POST',
        body: JSON.stringify({ format }),
      });

      showSuccess(`Database snapshot created: ${res.fileName} (${res.fileSizeFormatted})`);
      await loadData(true);
    } catch (err: any) {
      showError(err.message || 'Failed to create database backup.');
    } finally {
      setCreatingBackup(false);
    }
  };

  // Delete backup
  const handleDeleteBackup = async (fileName: string) => {
    const confirmed = await showConfirm(
      `Are you sure you want to permanently delete backup snapshot "${fileName}"? This action cannot be reversed.`,
      {
        title: 'Delete Backup Snapshot',
        confirmText: 'Delete Snapshot',
        confirmVariant: 'danger',
      }
    );

    if (!confirmed) return;

    try {
      await fetchApi(`/database/backup/${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      showSuccess(`Backup snapshot "${fileName}" deleted successfully.`);
      await loadData(true);
    } catch (err: any) {
      showError(err.message || 'Failed to delete backup.');
    }
  };

  // Restore from an existing backup file
  const handleRestoreExisting = async (fileName: string, takeSafetyBackup: boolean) => {
    setRestoring(true);
    try {
      const res = await fetchApi(`/database/restore-existing/${encodeURIComponent(fileName)}`, {
        method: 'POST',
        body: JSON.stringify({ takeSafetyBackup }),
      });

      const safetyMsg = res.safetyBackupFileName
        ? ` Safety snapshot saved: ${res.safetyBackupFileName}`
        : '';

      showSuccess(`${res.message || 'Database restored successfully!'}${safetyMsg}`);
      await loadData(true);
    } catch (err: any) {
      showError(err.message || 'Database restoration failed.');
    } finally {
      setRestoring(false);
    }
  };

  // Import uploaded file and restore
  const handleImportFile = async (file: File, takeSafetyBackup: boolean) => {
    setRestoring(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('takeSafetyBackup', String(takeSafetyBackup));

      const token = getAdminToken();
      const res = await fetch('/api/database/import', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || `Import failed with HTTP ${res.status}`);
      }

      const data = await res.json();
      const safetyMsg = data.safetyBackupFileName
        ? ` Safety snapshot saved: ${data.safetyBackupFileName}`
        : '';

      showSuccess(`${data.message || 'Database restored successfully!'}${safetyMsg}`);
      await loadData(true);
    } catch (err: any) {
      showError(err.message || 'Failed to import and restore backup.');
    } finally {
      setRestoring(false);
    }
  };

  const scrollToImport = () => {
    const el = document.getElementById('import-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <DatabaseHeader
        onRefresh={() => loadData(false)}
        onOpenCreateModal={() => setCreateModalOpen(true)}
        onScrollToImport={scrollToImport}
        loading={loading}
      />

      {/* 2. Stats Grid */}
      <DatabaseStatsGrid stats={stats} totalStorageFormatted={totalStorageFormatted} />

      {/* 3. Backups Table */}
      <BackupsTable
        backups={backups}
        loading={loading}
        onDownload={handleDownload}
        onRequestRestore={(backup) => setTargetRestoreBackup(backup)}
        onRequestDelete={handleDeleteBackup}
        onQuickBackup={handleCreateBackup}
        creatingBackup={creatingBackup}
      />

      {/* 4. Import & Restore Section */}
      <DatabaseImportSection onImportFile={handleImportFile} importing={restoring} />

      {/* 5. Modals */}
      <CreateBackupModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateBackup}
        loading={creatingBackup}
      />

      <ConfirmRestoreModal
        backup={targetRestoreBackup}
        isOpen={!!targetRestoreBackup}
        onClose={() => setTargetRestoreBackup(null)}
        onConfirm={handleRestoreExisting}
        loading={restoring}
      />
    </div>
  );
}
