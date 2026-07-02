import {
  Concept,
  ConceptProgress,
  Material,
  MaterialProgress,
  PaginationMeta,
  StudyCase,
  StudyCaseProgress,
  Submission,
} from '@/types';

export type LearningDashboard = {
  concepts: Concept[];
  materials: Material[];
  studyCases: StudyCase[];
  conceptProgresses: ConceptProgress[];
  materialProgresses: MaterialProgress[];
  studyCaseProgresses: StudyCaseProgress[];
  submissions: Submission[];
  submissionsPagination: PaginationMeta;
};

export type ContinueTarget = {
  concept: Concept;
  material: Material;
  nextStudyCase: StudyCase | null;
  href: string;
};

export type MaterialGroup = {
  material: Material;
  studyCases: StudyCase[];
  completedStudyCases: number;
  totalStudyCases: number;
  isCompleted: boolean;
  href: string;
};

export type ConceptGroup = {
  concept: Concept;
  materials: MaterialGroup[];
  completedStudyCases: number;
  totalStudyCases: number;
  progress: number;
  isCompleted: boolean;
};
