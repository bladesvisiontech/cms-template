// Add your client's JSON file names here
export type ContentFile = 'data.json' | 'site.json' | 'services.json' | 'gallery.json';

export interface ApiResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}
