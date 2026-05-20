'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import SaveButton from '@/components/SaveButton';
import Toast from '@/components/Toast';

interface LocationData {
  address: string; city: string;
  phone: string; phoneUrl: string;
  email: string;
  instagram: string; instagramHandle: string;
  tiktok: string; tiktokHandle: string;
}
interface SiteData { location: LocationData; [key: string]: unknown }

export default function SitePage() {
  const [data, setData] = useState<SiteData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
      body: JSON.stringify({ file: 'data.json', content: data, section: 'Site Info' }),
    });
    const result = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    setToast(result.ok
      ? { message: 'Saved! Publishing now...', type: 'success' }
      : { message: result.error ?? 'Failed to save', type: 'error' }
    );
  }, [data]);

  if (!data) return <div className="text-muted text-sm">Loading...</div>;
  const { location: loc } = data;

  return (
    <div>
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
        <PageHeader title="Site Info" description="Contact details and social links" />
        <SaveButton saving={saving} onClick={save} />
      </div>

      <div className="space-y-6">
        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text mb-4">Address</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label>Street</label><input value={loc.address} onChange={(e) => setData({ ...data, location: { ...loc, address: e.target.value } })} /></div>
            <div><label>City & ZIP</label><input value={loc.city} onChange={(e) => setData({ ...data, location: { ...loc, city: e.target.value } })} /></div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text mb-4">Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label>Phone (display)</label><input value={loc.phone} onChange={(e) => setData({ ...data, location: { ...loc, phone: e.target.value } })} /></div>
            <div><label>Phone URL (tel:+1...)</label><input value={loc.phoneUrl} onChange={(e) => setData({ ...data, location: { ...loc, phoneUrl: e.target.value } })} /></div>
            <div className="col-span-2"><label>Email</label><input value={loc.email} onChange={(e) => setData({ ...data, location: { ...loc, email: e.target.value } })} /></div>
          </div>
        </section>

        <section className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-semibold text-text mb-4">Social Media</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label>Instagram URL</label><input value={loc.instagram} onChange={(e) => setData({ ...data, location: { ...loc, instagram: e.target.value } })} /></div>
            <div><label>Instagram Handle</label><input value={loc.instagramHandle} onChange={(e) => setData({ ...data, location: { ...loc, instagramHandle: e.target.value } })} /></div>
            <div><label>TikTok URL</label><input value={loc.tiktok} onChange={(e) => setData({ ...data, location: { ...loc, tiktok: e.target.value } })} /></div>
            <div><label>TikTok Handle</label><input value={loc.tiktokHandle} onChange={(e) => setData({ ...data, location: { ...loc, tiktokHandle: e.target.value } })} /></div>
          </div>
        </section>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
