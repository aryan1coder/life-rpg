'use client';

import React, { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { User, BadgeCheck, FileText, Image as ImageIcon, X, Check, Loader2 } from 'lucide-react';

const AVATAR_PRESETS = [
  '/avatar.png',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBTyH7zzJTFTO-kllZHgd-XpjcEBPsRH8rJHDnsVu-1AAYIqqE9RFwnfupTQXZNikDB1IUNnj7Tk7fdSeybLSikv8mxYWepa23fcvNJ3W01uyUAz70k7W5vi0R-qhgEFneh9z_XDtqQ3dNHTRq5qgxPGVPMsWgoRxIbieW1WsD3pR8pshRJkyoXiNkFXCx_uv6Eip3ZIbLPGeHxDSg2yGZ4O_DLYMvNBSuaNI3lliC90_qNt7xFX3I',
];

export function ProfileUpdateModal() {
  const { profile, profileModalOpen, setProfileModalOpen, updateProfileData } = useGame();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && profileModalOpen) {
      setDisplayName(profile.display_name || profile.username || '');
      setUsername(profile.username || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url || '/avatar.png');
      setFormError(null);
    }
  }, [profile, profileModalOpen]);

  if (!profileModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const trimmedUsername = username.trim();
    const trimmedDisplayName = displayName.trim();
    const trimmedBio = bio.trim();

    if (!trimmedUsername) {
      setFormError('Operator callsign is required.');
      return;
    }

    if (trimmedUsername.length > 30) {
      setFormError('Callsign cannot exceed 30 characters.');
      return;
    }

    if (trimmedDisplayName.length > 50) {
      setFormError('Display name cannot exceed 50 characters.');
      return;
    }

    if (trimmedBio.length > 300) {
      setFormError('Bio cannot exceed 300 characters.');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const success = await updateProfileData({
      username: trimmedUsername,
      display_name: trimmedDisplayName || trimmedUsername,
      bio: trimmedBio,
      avatar_url: avatarUrl.trim() || '/avatar.png',
    });

    setSubmitting(false);
    if (success) {
      setProfileModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-2xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col gap-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 id="profile-modal-title" className="text-base font-semibold text-text-primary tracking-tight">
                Operator Identification
              </h2>
              <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">
                Synchronize Neural Records
              </span>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="w-8 h-8 rounded-lg bg-surface-elevated hover:bg-surface-bright text-text-secondary hover:text-text-primary flex items-center justify-center transition-colors"
            aria-label="Close Profile Dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {formError && (
          <div className="p-3 rounded-xl bg-crimson-threat/10 border border-crimson-threat/20 text-crimson-threat text-xs font-mono">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Display Name */}
          <div className="space-y-1.5">
            <label className="block font-mono text-xs text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <BadgeCheck className="w-3.5 h-3.5 text-primary" />
              Display Name
            </label>
            <input
              type="text"
              id="displayNameInput"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Commander Vance"
              maxLength={40}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <span className="text-[10px] text-text-muted font-mono block text-right">
              {displayName.length}/50
            </span>
          </div>

          {/* Callsign / Username */}
          <div className="space-y-1.5">
            <label className="block font-mono text-xs text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-tertiary" />
              Operator Callsign (Username)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. VANGUARD_01"
              maxLength={30}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-sm font-mono focus:outline-none focus:border-primary transition-colors"
            />
            <span className="text-[10px] text-text-muted font-mono block text-right">
              {username.length}/30
            </span>
          </div>

          {/* Operational Bio */}
          <div className="space-y-1.5">
            <label className="block font-mono text-xs text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-complete" />
              Operational Directives &amp; Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a brief operational thesis or personal objective..."
              rows={3}
              maxLength={300}
              className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-subtle text-text-primary text-sm focus:outline-none focus:border-primary transition-colors resize-none"
            />
            <span className="text-[10px] text-text-muted font-mono block text-right">
              {bio.length}/300
            </span>
          </div>

          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="block font-mono text-xs text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-streak" />
              Avatar Identification
            </label>
            <div className="flex items-center gap-3">
              {AVATAR_PRESETS.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all relative ${
                    avatarUrl === url ? 'border-primary ring-2 ring-primary/30' : 'border-border-subtle hover:border-white/20'
                  }`}
                >
                  <img src={url} alt={`Preset ${i + 1}`} className="w-full h-full object-cover" />
                  {avatarUrl === url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle mt-2">
            <button
              type="button"
              onClick={() => setProfileModalOpen(false)}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl bg-surface-elevated hover:bg-surface-bright text-text-secondary hover:text-text-primary text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-md shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
