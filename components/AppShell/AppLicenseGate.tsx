import React from 'react';
import { LicenseActivation } from '../ui/LicenseActivation';
import { LicenseInfo } from '../../utils/licenseManager';
import { MembershipTier } from '../../utils/featureGate';

interface AppLicenseGateProps {
    showLicenseScreen: boolean;
    licenseChecked: boolean;
    setLicenseInfo: (info: LicenseInfo) => void;
    setCurrentTier: (tier: MembershipTier) => void;
    setShowLicenseScreen: (v: boolean) => void;
}

export const AppLicenseGate: React.FC<AppLicenseGateProps> = ({
    showLicenseScreen,
    licenseChecked,
    setLicenseInfo,
    setCurrentTier,
    setShowLicenseScreen,
}) => {
    if (!(showLicenseScreen && licenseChecked)) return null;
    return (
        <LicenseActivation
            onActivated={(info) => {
                setLicenseInfo(info);
                setCurrentTier(info.tier);
                setShowLicenseScreen(false);
            }}
            onSkip={() => {
                setCurrentTier('free');
                setShowLicenseScreen(false);
            }}
        />
    );
};
