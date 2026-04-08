import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, UploadCloud, Save, Loader2, Link as LinkIcon, Camera } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '../../profileSlice';
import axiosClient from '../../utils/axiosClient';
import axios from 'axios';

const EditProfileModal = ({ user, onClose }) => {
  const dispatch = useDispatch();
  
  // Data State
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    profilePic: user?.profilePic || '',
  });

  // UI State
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errorLine, setErrorLine] = useState('');
  
  const fileInputRef = useRef(null);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // ── 1. Cloudinary Upload Logic ──
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // basic verification
    if (!file.type.startsWith('image/')) {
      setErrorLine('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorLine('Image size must be less than 5MB');
      return;
    }

    setUploadingAvatar(true);
    setErrorLine('');

    try {
      // 1. Get Signature
      const { data: sigData } = await axiosClient.get('/user/avatar-signature');
      if (!sigData.success) {
        throw new Error('Failed to get secure upload signature');
      }

      const { signature, timestamp, public_id, api_key, upload_url } = sigData;

      // 2. Build Form Data
      const cloudinaryForm = new FormData();
      cloudinaryForm.append('file', file);
      cloudinaryForm.append('signature', signature);
      cloudinaryForm.append('timestamp', timestamp);
      cloudinaryForm.append('public_id', public_id);
      cloudinaryForm.append('api_key', api_key);

      // 3. Direct Post to Cloudinary
      const uploadRes = await axios.post(upload_url, cloudinaryForm, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // 4. Update local state with Cloudinary URL
      const secureUrl = uploadRes.data.secure_url;
      setFormData(prev => ({ ...prev, profilePic: secureUrl }));

    } catch (err) {
      console.error(err);
      setErrorLine('Image upload failed. Please try again.');
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ── 2. Save Profile ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorLine('');

    try {
      const resultAction = await dispatch(updateUserProfile(formData));
      if (updateUserProfile.fulfilled.match(resultAction)) {
        onClose(); // auto-close on success
      } else {
        setErrorLine(resultAction.payload || 'Failed to update profile');
      }
    } catch (err) {
      setErrorLine('An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#121826]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Glow */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-600/20 blur-[100px] pointer-events-none" />

        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 rounded-full bg-violet-500" />
              Edit Profile
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-white/50 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {errorLine && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-semibold text-center">
              {errorLine}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            {/* Avatar Row */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-4 rounded-xl bg-black/20 border border-white/5">
              <div className="relative group w-20 h-20 rounded-full border-2 border-white/10 bg-[#0d1117] overflow-hidden flex items-center justify-center shrink-0">
                {formData.profilePic ? (
                  <img src={formData.profilePic} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-black text-white/30">?</span>
                )}
                {/* Upload overlay */}
                {uploadingAvatar ? (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 size={24} className="text-white animate-spin" />
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera size={20} className="text-white mb-1" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <p className="text-sm font-bold text-white/80">Profile Photo</p>
                <p className="text-xs text-white/40">Upload a fresh avatar (Max 5MB)</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold tracking-wide transition-colors"
                >
                  {uploadingAvatar ? 'Uploading...' : 'Choose File'}
                </button>
              </div>
            </div>

            {/* Profile Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Username</label>
                <input 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. byte_master"
                  className="w-full bg-[#0d1117]/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-mono text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1">Bio</label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your coding journey..."
                  rows={3}
                  className="w-full bg-[#0d1117]/80 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all text-sm resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/5">
              <button 
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-white/50 hover:text-white font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSaving || uploadingAvatar}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default EditProfileModal;
