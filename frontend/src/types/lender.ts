export interface ApplicantSummary {
  id: string;
  workerName: string;
  platformCategory: string;
  applicationDate: string;
  verificationStatus: 'Pending Review' | 'Verified' | 'Attention Required';
  passportStatus: 'Available' | 'Processing';
}
