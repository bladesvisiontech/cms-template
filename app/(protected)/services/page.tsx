'use client';

import { useState, useEffect, useCallback } from 'react';
import PageHeader from '@/components/PageHeader';
import SaveButton from '@/components/SaveButton';
import Toast from '@/components/Toast';

interface ServiceItem { name: string; tag: string; price: string }
interface SiteData { services: ServiceItem[]; [key: string]: unknown }

export default function ServicesPage() {
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
      body: JSON.stringify({ file: 'data.json', content: data, section: 'Services' }),
    });
    const result = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);
    setToast(result.ok
      ? { message: 'Services saved! Publishing now...', type: 'success' }
      : { message: result.error ?? 'Failed to save', type: 'error' }
    );
  }, [data]);

  function updateService(index: number, field: keyof ServiceItem, value: string) {
    if (!data) return;
    const updated = [...data.services];
    updated[index] = { ...updated[index], [field]: value };
    setData({ ...data, services: updated });
  }

  if (!data) return <div className="text-muted text-sm">Loading...</div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-8 pb-6 border-b border-border">
        <PageHeader title="Services" description="Edit service names, descriptions and prices" />
        <SaveButton saving={saving} onClick={save} />
      </div>

      <div className="space-y-4">
        {data.services.map((item, i) => (
          <section key={i} className="bg-card border border-border rounded-lg p-6">
            <div className="text-xs text-muted uppercase tracking-wider mb-4">Service {String(i + 1).padStart(2, '0')}</div>
            <div className="grid grid-cols-3 gap-4">
              <div><label>Name</label><input value={item.name} onChange={(e) => updateService(i, 'name', e.target.value)} /></div>
              <div><label>Description</label><input value={item.tag} onChange={(e) => updateService(i, 'tag', e.target.value)} /></div>
              <div><label>Price</label><input value={item.price} onChange={(e) => updateService(i, 'price', e.target.value)} /></div>
            </div>
          </section>
        ))}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
