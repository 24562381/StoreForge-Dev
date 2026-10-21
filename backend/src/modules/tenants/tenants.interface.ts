export interface TenantBrandingIcons {
  icon192: string;
  icon512: string;
  iconMaskable192: string;
  iconMaskable512: string;
  favicon?: string;
}

export interface TenantBrandingResponse {
  tenantId: string;
  name: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  startUrl: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation: 'any' | 'natural' | 'portrait' | 'landscape';
  icons: TenantBrandingIcons;
  shortcuts?: Array<{
    name: string;
    shortName: string;
    description: string;
    url: string;
    icon: string;
  }>;
}
