import { ExpertAccount } from '../types';

const EXPERT_ACCOUNTS_KEY = 'nbass_expert_accounts';
const CURRENT_EXPERT_KEY = 'nbass_current_expert';

export const DEFAULT_ACADEMIES = [
  '시대인재 (대치/목동)',
  '메가스터디 러셀 (강남/대치/분당)',
  '대치 대찬학원',
  '대치 명인학원',
  '강남 하이퍼학원',
  '이투스247 (강남/송파/일산)',
  '종로학원 (강남/서초/목동)',
  '대치 두각학원',
  '대치 미래탐구',
  '분당 이강학원',
  '목동 하이씨앤씨',
  '평촌 종로엠스쿨',
  '중계 에듀코치',
  '기타 (직접 입력)'
];

const INITIAL_EXPERTS: ExpertAccount[] = [
  {
    id: 'exp-med-001',
    email: 'doctor.kim@clinic.com',
    name: '김도현 원장',
    phone: '010-8888-1234',
    role: 'MEDICAL_EXPERT',
    status: 'APPROVED',
    medicalLicenseNumber: 'MD-108293',
    clinicName: '연세마인드 인지학습 클리닉',
    medicalSpecialty: '소아청소년과 / 신경정신과',
    createdAt: '2026-08-01T09:00:00.000Z',
    approvedAt: '2026-08-01T10:30:00.000Z'
  },
  {
    id: 'exp-acad-001',
    email: 'mentor.park@sidae.com',
    name: '박서준 전략소장',
    phone: '010-7777-5678',
    role: 'ACADEMY_EXPERT',
    status: 'APPROVED',
    academyName: '시대인재 (대치/목동)',
    academyRegion: '서울 강남구 대치동',
    position: '입시전략센터장',
    createdAt: '2026-08-05T14:20:00.000Z',
    approvedAt: '2026-08-05T16:00:00.000Z'
  },
  {
    id: 'exp-med-002',
    email: 'dr.lee@brain.co.kr',
    name: '이수민 전문의',
    phone: '010-3333-7777',
    role: 'MEDICAL_EXPERT',
    status: 'PENDING',
    medicalLicenseNumber: 'MD-203912',
    clinicName: '서울브레인 웰니스 의원',
    medicalSpecialty: '가정의학과 / 인지의학',
    createdAt: '2026-08-16T18:30:00.000Z'
  },
  {
    id: 'exp-acad-002',
    email: 'leader.choi@mega.com',
    name: '최민우 원장',
    phone: '010-5555-9999',
    role: 'ACADEMY_EXPERT',
    status: 'PENDING',
    academyName: '메가스터디 러셀 (강남/대치/분당)',
    academyRegion: '서울 서초구 서초동',
    position: '수능집중관리 원장',
    createdAt: '2026-08-17T07:45:00.000Z'
  }
];

export const ExpertAccountService = {
  getAccounts(): ExpertAccount[] {
    try {
      const saved = localStorage.getItem(EXPERT_ACCOUNTS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      localStorage.setItem(EXPERT_ACCOUNTS_KEY, JSON.stringify(INITIAL_EXPERTS));
      return INITIAL_EXPERTS;
    } catch {
      return INITIAL_EXPERTS;
    }
  },

  saveAccounts(accounts: ExpertAccount[]): void {
    try {
      localStorage.setItem(EXPERT_ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save expert accounts:', e);
    }
  },

  register(accountData: Omit<ExpertAccount, 'id' | 'createdAt' | 'status'>): ExpertAccount {
    const accounts = this.getAccounts();
    
    // Check if email already exists
    const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === accountData.email.toLowerCase());
    
    const newAccount: ExpertAccount = {
      ...accountData,
      id: `exp-${Date.now()}`,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...newAccount };
    } else {
      accounts.push(newAccount);
    }

    this.saveAccounts(accounts);
    return newAccount;
  },

  createApprovedAccount(accountData: Omit<ExpertAccount, 'id' | 'createdAt' | 'status'>): ExpertAccount {
    const accounts = this.getAccounts();
    const existingIndex = accounts.findIndex(a => a.email.toLowerCase() === accountData.email.toLowerCase());
    const newAccount: ExpertAccount = {
      ...accountData,
      id: `exp-${Date.now()}`,
      status: 'APPROVED',
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      accounts[existingIndex] = { ...accounts[existingIndex], ...newAccount };
    } else {
      accounts.push(newAccount);
    }

    this.saveAccounts(accounts);
    return newAccount;
  },

  findByEmail(email: string): ExpertAccount | undefined {
    const accounts = this.getAccounts();
    return accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
  },

  updateStatus(id: string, status: 'APPROVED' | 'REJECTED'): void {
    const accounts = this.getAccounts();
    const updated = accounts.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status,
          approvedAt: status === 'APPROVED' ? new Date().toISOString() : undefined
        };
      }
      return a;
    });
    this.saveAccounts(updated);
  },

  getCurrentExpert(): ExpertAccount | null {
    try {
      const saved = localStorage.getItem(CURRENT_EXPERT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  setCurrentExpert(expert: ExpertAccount | null): void {
    try {
      if (expert) {
        localStorage.setItem(CURRENT_EXPERT_KEY, JSON.stringify(expert));
      } else {
        localStorage.removeItem(CURRENT_EXPERT_KEY);
      }
    } catch (e) {
      console.error('Failed to save current expert:', e);
    }
  }
};
