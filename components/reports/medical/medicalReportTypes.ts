import type { AssessmentResult, StrategyMap, Examiner } from '../../../types';
import type { AnalystConfig } from '../../../utils/analystConfig';
import type { MembershipTier } from '../../../utils/featureGate';

// Moved verbatim from MedicalReport.tsx (only `export` added; no UI change)
export interface MedicalReportProps {
    result: AssessmentResult;
    analystConfig?: AnalystConfig;
    strategies?: StrategyMap;
    selectedSubjectOptions?: any;
    adminMemo?: string;
    recommendedProducts?: any[];
    isPremiumOrAbove?: boolean;
    membershipTier?: MembershipTier;
    config?: {
        useBrainBody?: boolean;
        usePortable?: boolean;
        isMedicalMode?: boolean;
        currentExaminerId?: string | null;
        examiners?: Examiner[];
    };
}
