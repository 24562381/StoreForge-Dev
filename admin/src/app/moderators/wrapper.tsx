'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

import { ModeratorsHeader } from './ModeratorsHeader';
import { ModeratorsFilterBar } from './ModeratorsFilterBar';
import { ModeratorsTable } from './ModeratorsTable';
import { ModeratorFormModal } from './ModeratorFormModal';
import { NidPreviewModal } from './NidPreviewModal';

interface StaffUser {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  photo?: string | null;
  nidNumber?: string | null;
  nidPhoto?: string | null;
  presentAddress?: string | null;
  permanentAddress?: string | null;
  permissions?: string | string[] | null;
  isActive: boolean;
  isConfidentialRedacted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function Wrapper() {
  const { showSuccess, showError, showWarning, showConfirm } = useAdminModal();

  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<StaffUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'moderator'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'moderator',
    phone: '',
    photo: '',
    nidNumber: '',
    nidPhoto: '',
    presentAddress: '',
    permanentAddress: '',
    isActive: true,
  });
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [showNidPreviewModal, setShowNidPreviewModal] = useState<string | null>(null);
  const [expandedConfidentialId, setExpandedConfidentialId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, moderatorsRes] = await Promise.all([
        fetchApi('/auth/me').catch(() => null),
        fetchApi('/moderators').catch(() => []),
      ]);

      if (profileRes) setCurrentUser(profileRes);
      if (Array.isArray(moderatorsRes)) setStaffList(moderatorsRes);
    } catch (err: any) {
      console.error('Failed to fetch staff data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const canManageStaff = useMemo(() => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    return hasPermission(currentUser, PERMISSIONS.MODERATORS_MANAGE);
  }, [currentUser]);

  const openAddModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'moderator',
      phone: '',
      photo: '',
      nidNumber: '',
      nidPhoto: '',
      presentAddress: '',
      permanentAddress: '',
      isActive: true,
    });
    setSelectedPermissions([]);
    setModalOpen(true);
  };

  const openEditModal = (user: StaffUser) => {
    setIsEditing(true);
    setEditingId(user.id);

    let perms: string[] = [];
    try {
      perms = Array.isArray(user.permissions)
        ? user.permissions
        : typeof user.permissions === 'string'
        ? JSON.parse(user.permissions)
        : [];
    } catch {}

    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'moderator',
      phone: user.phone || '',
      photo: user.photo || '',
      nidNumber: user.nidNumber || '',
      nidPhoto: user.nidPhoto || '',
      presentAddress: user.presentAddress || '',
      permanentAddress: user.permanentAddress || '',
      isActive: user.isActive !== false,
    });
    setSelectedPermissions(perms);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showWarning('Please provide full name and email address.');
      return;
    }
    if (!isEditing && (!formData.password || formData.password.length < 6)) {
      showWarning('Password must be at least 6 characters long.');
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        phone: formData.phone.trim() || null,
        photo: formData.photo.trim() || null,
        nidNumber: formData.nidNumber.trim() || null,
        nidPhoto: formData.nidPhoto.trim() || null,
        presentAddress: formData.presentAddress.trim() || null,
        permanentAddress: formData.permanentAddress.trim() || null,
        isActive: formData.isActive,
        permissions: formData.role === 'admin' ? '*' : selectedPermissions,
      };

      if (formData.password && formData.password.trim().length >= 6) {
        payload.password = formData.password.trim();
      }

      if (isEditing && editingId) {
        await fetchApi(`/moderators/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        showSuccess(`Staff member "${formData.name}" updated successfully.`);
      } else {
        await fetchApi('/moderators', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        showSuccess(`Staff member "${formData.name}" created successfully.`);
      }

      setModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to save staff member');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: StaffUser) => {
    const action = user.isActive !== false ? 'suspend' : 'reactivate';
    const confirmed = await showConfirm(
      `Are you sure you want to ${action} ${user.name}'s account?`,
      {
        title: `${action === 'suspend' ? 'Suspend' : 'Reactivate'} Staff Account`,
        confirmText: action === 'suspend' ? 'Suspend Account' : 'Reactivate',
        confirmVariant: action === 'suspend' ? 'danger' : 'primary',
      }
    );
    if (!confirmed) return;

    try {
      await fetchApi(`/moderators/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ isActive: user.isActive === false }),
      });
      showSuccess(`Account ${action}ed successfully.`);
      loadData();
    } catch (err: any) {
      showError(err.message || `Failed to ${action} staff account`);
    }
  };

  const handleDeleteStaff = async (user: StaffUser) => {
    const confirmed = await showConfirm(
      `Are you sure you want to permanently delete staff member "${user.name}"? This action cannot be undone.`,
      {
        title: 'Delete Staff Member',
        confirmText: 'Delete Permanently',
        confirmVariant: 'danger',
      }
    );
    if (!confirmed) return;

    try {
      await fetchApi(`/moderators/${user.id}`, { method: 'DELETE' });
      showSuccess(`Staff member "${user.name}" was removed.`);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete staff member');
    }
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter((user) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        user.name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q) ||
        user.phone?.includes(q) ||
        user.nidNumber?.includes(q);

      const matchRole = roleFilter === 'all' || user.role === roleFilter;
      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive !== false) ||
        (statusFilter === 'suspended' && user.isActive === false);

      return matchSearch && matchRole && matchStatus;
    });
  }, [staffList, searchQuery, roleFilter, statusFilter]);

  return (
    <div className="space-y-6 w-full pb-16">
      {/* 1. Header with Stats & Add Button */}
      <ModeratorsHeader
        canManageStaff={canManageStaff}
        onOpenAddModal={openAddModal}
      />

      {/* 2. Filter & Search Bar */}
      <ModeratorsFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        totalStaff={staffList.length}
      />

      {/* 3. Moderators Table / Cards Grid */}
      <ModeratorsTable
        staffList={filteredStaff}
        currentUser={currentUser}
        canManageStaff={canManageStaff}
        expandedConfidentialId={expandedConfidentialId}
        setExpandedConfidentialId={setExpandedConfidentialId}
        onPreviewNid={(url) => setShowNidPreviewModal(url)}
        onEditStaff={openEditModal}
        onToggleStatus={handleToggleStatus}
        onDeleteStaff={handleDeleteStaff}
      />

      {/* 4. Add / Edit Staff Form Modal */}
      <ModeratorFormModal
        isOpen={modalOpen}
        isEditing={isEditing}
        editingId={editingId}
        formData={formData}
        setFormData={setFormData}
        selectedPermissions={selectedPermissions}
        setSelectedPermissions={setSelectedPermissions}
        saving={saving}
        currentUser={currentUser}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      {/* 5. NID Full-Size Photo Modal */}
      <NidPreviewModal
        photoUrl={showNidPreviewModal}
        onClose={() => setShowNidPreviewModal(null)}
      />
    </div>
  );
}
