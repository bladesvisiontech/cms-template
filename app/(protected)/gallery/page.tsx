'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import PageHeader from '@/components/PageHeader';
import SaveButton from '@/components/SaveButton';
import Toast from '@/components/Toast';

interface GalleryItem { src: string; alt: string }
interface SiteData { gallery: GalleryItem[]; [key: string]: unknown }

const SITE_URL = process.env.NEXT_PUBLIC_PREVIEW_URL ?? '';
function resolveUrl(value: string) {
  if (!value) return '';
  if (value.startsWith('http')) return value;
  return `${SITE_URL}/${value.replace(/^\//, '')}`;
}

export default function GalleryPage() {
  const [data, setData] = useState<SiteData | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/content?file=data.json')
      .then((r) => r.json())
      .then((res: { data: SiteData }) => setData(res.data));
  }, []);

  const save = useCallback(async () => {
    if (!data) return;
    setSaving(true);
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file: 'data.json', content: data, section: 'Gallery' }),
    });
    const result = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    setToast(result.ok
      ? { message: 'Gallery saved! Publishing now...', type: 'success' }
      : { message: result.error ?? 'Failed to save', type: 'error' }
    );
  }, [data]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !data) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', { method: 'POST', body: formData });
    const result = await res.json() as { ok?: boolean; url?: string; error?: string };
    setUploading(false);
    if (result.ok && result.url) {
      setData({ ...data, gallery: [...data.gallery, { src: result.url, alt: file.name.replace(/\.[^.]+$/, '') }] });
      setToast({ message: 'Image uploaded. Click Save & Publish to make it live.', type: 'success' });
    } else {
      setToast({ message: result.error ?? 'Upload failed', type: 'error' });
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function removeItem(index: number) {
    if (!data || !confirm('Remove this image?')) return;
    setData({ ...data, gallery: data.gallery.filter((_, i) => i !== index) });
  }

  if (!data) return <div className="text-muted text-sm">Loading...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
        <PageHeader title="Gallery" description="Add, remove or edit gallery photos" />
        <div className="flex items-center gap-3">
          <label className="inline-flex items-center gap-2 bg-card border border-border text-text text-sm font-medium px-4 py-2.5 rounded-md cursor-pointer hover:border-accent/50 transition-colors">
            {uploading ? <><span className="w-4 h-4 border-2 border-muted border-t-text rounded-full animate-spin" /> Uploading...</> : <>↑ Upload Photo</>}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          <SaveButton saving={saving} onClick={save} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {data.gallery.map((item, i) => (
          <div key={i} className="bg-card border border-border rounded-lg overflow-hidden group">
            <div className="aspect-[4/5] bg-border relative overflow-hidden">
              <img src={resolveUrl(item.src)} alt={item.alt} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <button onClick={() => removeItem(i)} className="absolute top-2 right-2 w-7 h-7 bg-danger text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">✕</button>
            </div>
          </div>
        ))}
      </div>

      {data.gallery.length === 0 && <div className="text-center py-16 text-muted">No photos yet. Upload your first image above.</div>}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
