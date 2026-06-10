/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface QualificationMetrics {
  technical: number;       // 1 - 100
  communication: number;   // 1 - 100
  leadership: number;      // 1 - 100
  cultureFit: number;      // 1 - 100
  experience: number;      // 1 - 100
  problemSolving: number;  // 1 - 100
}

export interface TimelineEvent {
  id: string;
  stage: string;
  date: string;
  status: 'completed' | 'current' | 'upcoming' | 'rejected';
  note: string;
}

export interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  agency: string;
  role: string;
  status: 'New' | 'Screening' | 'Interviewing' | 'Shortlisted' | 'Offered' | 'Archived' | 'Rejected';
  metrics: QualificationMetrics;
  skills: string[];
  resumeSummary: string;
  notes: string;
  avatarUrl?: string;
  experienceYears: number;
  education: string;
  expectedSalary: string;
  timeline: TimelineEvent[];
  updatedAt: string;
}

export interface AgencyStats {
  agencyName: string;
  totalApplicants: number;
  averageScore: number;
  rejectionRate: number;
  placementRate: number;
}

export interface HiringProcess {
  id: string;
  title: string;
  targetRoles: string[];
  agency: string;
  department: string;
  description: string;
  targetHires: number;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Active' | 'On Hold' | 'Completed';
  openDate: string;
}
