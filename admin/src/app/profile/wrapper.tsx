'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { fetchApi } from '@/lib/api';
import { useAdminModal } from '@/lib/AdminModalContext';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { ProfileHeader } from './ProfileHeader';
import { ProfileContactSection } from './ProfileContactSection';
import { ProfileConfidentialSection } from './ProfileConfidentialSection';
import { ProfilePermissionsCard } from './ProfilePermissionsCard';
import { ProfilePasswordCard } from './ProfilePasswordCard';

export default function Wrapper() {
  const { showSuccess, showError, showWarning } = useAdminModal();

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [profile, setProfile] = useState<any>(null);

  // Profile Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState('');
  const [nidNumber, setNidNumber] = useState('');
  const [nidPhoto, setNidPhoto] = useState('');
  const [presentAddress, setPresentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchApi('/auth/me');
      if (res) {
        setProfile(res);
        setName(res.name || '');
        setEmail(res.email || '');
        setPhone(res.phone || '');
        setPhoto(res.photo || '');
        setNidNumber(res.nidNumber || '');
        setNidPhoto(res.nidPhoto || '');
        setPresentAddress(res.presentAddress || '');
        setPermanentAddress(res.permanentAddress || '');
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const isSuperAdmin = profile?.role === 'admin';
  const canEditConfidential = isSuperAdmin || hasPermission(profile, PERMISSIONS.EDIT_ALL_PROFILE_INFO);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showWarning('Email is required.');
      return;
    }

    setSavingProfile(true);
    try {
      const payload: any = {
        email: email.trim(),
        phone: phone.trim() || null,
        photo: photo.trim() || null,
      };

      if (canEditConfidential) {
        payload.name = name.trim();
        payload.nidNumber = nidNumber.trim() || null;
        payload.nidPhoto = nidPhoto.trim() || null;
        payload.presentAddress = presentAddress.trim() || null;
        payload.permanentAddress = permanentAddress.trim() || null;
      }

      const updated = await fetchApi('/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setProfile(updated);
      const stored = localStorage.getItem('sf_admin_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const updatedJson = JSON.stringify({ ...parsed, ...updated });
          localStorage.setItem('sf_admin_user', updatedJson);
        } catch {}
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      showSuccess('Profile details saved successfully!');
    } catch (err: any) {
      showError(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showWarning('Please enter your current and new password.');
      return;
    }
    if (newPassword.length < 6) {
      showWarning('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showWarning('New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await fetchApi('/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      showSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showError(err.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-500">
        <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-slate-700">Loading Account Profile...</p>
      </div>
    );
  }

  let userPerms: string[] = [];
  try {
    userPerms = Array.isArray(profile?.permissions)
      ? profile.permissions
      : typeof profile?.permissions === 'string'
      ? JSON.parse(profile.permissions)
      : [];
  } catch {}

  return (
    <div className="space-y-6 w-full pb-16">
      <ProfileHeader
        photo={photo}
        name={name}
        email={email}
        isSuperAdmin={isSuperAdmin}
        onSave={handleUpdateProfile}
        savingProfile={savingProfile}
        savedSuccess={savedSuccess}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProfileContactSection
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            photo={photo}
            setPhoto={setPhoto}
            canEditConfidential={canEditConfidential}
          />

          <ProfileConfidentialSection
            nidNumber={nidNumber}
            setNidNumber={setNidNumber}
            nidPhoto={nidPhoto}
            setNidPhoto={setNidPhoto}
            presentAddress={presentAddress}
            setPresentAddress={setPresentAddress}
            permanentAddress={permanentAddress}
            setPermanentAddress={setPermanentAddress}
            canEditConfidential={canEditConfidential}
          />
        </div>

        <div className="space-y-6">
          <ProfilePermissionsCard
            isSuperAdmin={isSuperAdmin}
            userPerms={userPerms}
          />

          <ProfilePasswordCard
            currentPassword={currentPassword}
            setCurrentPassword={setCurrentPassword}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            onSubmit={handleChangePassword}
            savingPassword={savingPassword}
          />
        </div>
      </div>
    </div>
  );
}
