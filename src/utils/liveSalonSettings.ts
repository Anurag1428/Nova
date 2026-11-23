import { useState, useEffect } from 'react';
import { SALON_CONFIG } from '../data/salonData';

export interface LiveVipPromotionSettings {
  voucherAmount: number;
  voucherCode: string;
  isPopupActive: boolean;
  loadedFromAirtable: boolean;
}

export const DEFAULT_VIP_SETTINGS: LiveVipPromotionSettings = {
  voucherAmount: 500,
  voucherCode: 'NOVA-VIP500',
  isPopupActive: true,
  loadedFromAirtable: false,
};

let cachedSettings: LiveVipPromotionSettings = { ...DEFAULT_VIP_SETTINGS };
let hasFetched = false;

/**
 * Fetches the live promotional settings (amount, code, active status) from Airtable.
 * If offline or unconfigured, falls back immediately to default values (₹500 / NOVA-VIP500).
 */
export async function fetchLiveSalonSettings(): Promise<LiveVipPromotionSettings> {
  const airtableConfig = (SALON_CONFIG as any)?.integrations?.airtable;
  const token = airtableConfig?.token;
  const baseId = airtableConfig?.baseId;
  const settingsTableId = airtableConfig?.settingsTableId || 'tblFhgDOcFoqyKjAT';

  if (!token || !baseId || !settingsTableId) {
    return DEFAULT_VIP_SETTINGS;
  }

  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${settingsTableId}?maxRecords=5`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return DEFAULT_VIP_SETTINGS;
    }

    const data = await res.json();
    const vipRow = data.records?.find(
      (r: any) =>
        r.fields?.['Setting Key'] === 'VIP Welcome Credit' ||
        r.fields?.['Voucher Amount'] !== undefined
    ) || data.records?.[0];

    if (!vipRow || !vipRow.fields) {
      return DEFAULT_VIP_SETTINGS;
    }

    const rawAmount = vipRow.fields['Voucher Amount'];
    const amount = typeof rawAmount === 'number' && rawAmount > 0 ? rawAmount : 500;
    const code = vipRow.fields['Voucher Code'] || `NOVA-VIP${amount}`;
    const isActive = vipRow.fields['Popup Active'] !== false;

    const result: LiveVipPromotionSettings = {
      voucherAmount: amount,
      voucherCode: code,
      isPopupActive: isActive,
      loadedFromAirtable: true,
    };

    cachedSettings = result;
    hasFetched = true;
    return result;
  } catch (err) {
    console.warn('Failed to load live salon settings from Airtable; using default values', err);
    return DEFAULT_VIP_SETTINGS;
  }
}

/**
 * React hook to subscribe to live promotional settings with zero layout shift.
 */
export function useLiveSalonSettings(): LiveVipPromotionSettings {
  const [settings, setSettings] = useState<LiveVipPromotionSettings>(cachedSettings);

  useEffect(() => {
    let isMounted = true;

    fetchLiveSalonSettings().then((live) => {
      if (isMounted) {
        setSettings(live);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return settings;
}
