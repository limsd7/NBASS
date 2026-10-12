import { DatabaseService } from '../services/database';
import { MembershipTier } from './featureGate';

export interface LicenseInfo {
    key: string;
    tier: MembershipTier;
    activatedAt: string;
    expiresAt: string;
    isValid: boolean;
    centerName?: string;
}

const LICENSE_SETTING_KEY = 'app_license_info';

export async function activateLicense(key: string): Promise<LicenseInfo> {
    const cleanKey = key.trim().toUpperCase();
    
    // format check
    // Assume prefixes like NB1-, NB2-, NB3-, or NBASS-
    const formatRegex = /^[A-Z0-9]+-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!formatRegex.test(cleanKey)) {
        throw new Error('유효하지 않은 라이선스 키 형식입니다.');
    }

    let tier: MembershipTier = 'free';
    let daysToAdd = 30; // default trial

    if (cleanKey.startsWith('NB1-')) {
        tier = 'pro';
        daysToAdd = 365;
    } else if (cleanKey.startsWith('NB2-')) {
        tier = 'premium';
        daysToAdd = 365;
    } else if (cleanKey.startsWith('NB3-')) {
        tier = 'premium';
        daysToAdd = 365;
    } else if (cleanKey.startsWith('NBASS-')) {
        tier = 'pro';
        daysToAdd = 30;
    } else {
        tier = 'free';
        daysToAdd = 30;
    }

    const now = new Date();
    const expires = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);

    const licenseInfo: LicenseInfo = {
        key: cleanKey,
        tier,
        activatedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        isValid: true
    };

    await saveLicenseInfo(licenseInfo);
    return licenseInfo;
}

export async function getLicenseInfo(): Promise<LicenseInfo | null> {
    const data = await DatabaseService.getSetting(LICENSE_SETTING_KEY);
    if (!data) return null;
    
    try {
        return JSON.parse(data) as LicenseInfo;
    } catch (e) {
        return null;
    }
}

export async function saveLicenseInfo(info: LicenseInfo): Promise<void> {
    await DatabaseService.setSetting(LICENSE_SETTING_KEY, JSON.stringify(info));
}

export async function checkLicenseValidity(): Promise<{ isValid: boolean; daysRemaining: number; tier: MembershipTier }> {
    const info = await getLicenseInfo();
    
    if (!info) {
        return { isValid: false, daysRemaining: 0, tier: 'free' };
    }
    
    const now = new Date();
    const expires = new Date(info.expiresAt);
    
    const daysRemaining = Math.max(0, Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    const isValid = daysRemaining > 0;
    
    if (info.isValid !== isValid) {
        await saveLicenseInfo({ ...info, isValid });
    }
    
    return {
        isValid,
        daysRemaining,
        tier: isValid ? info.tier : 'free'
    };
}

export function generateTrialLicense(): LicenseInfo {
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    // Generate a random key format NBASS-XXXX-XXXX-XXXX
    const randomPart = () => Math.random().toString(36).substring(2, 6).toUpperCase();
    const key = `NBASS-${randomPart()}-${randomPart()}-${randomPart()}`;
    
    return {
        key,
        tier: 'pro',
        activatedAt: now.toISOString(),
        expiresAt: expires.toISOString(),
        isValid: true
    };
}
