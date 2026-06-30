import { TestResultStatus } from "@/types";
import { LucideIcon } from "lucide-react";

export type DisplayedTestStatus = TestResultStatus | 'PENDING';

export type DisplayedTestCase = {
  id: number;
  description: string;
  status: DisplayedTestStatus;
  input: string;
  expected: string;
  received?: string | null;
  whatToCheck?: string | null;
};

export type SampleTestCase = {
  description: string;
  input: string;
  expected: string;
};

export type FeedbackContent = {
  title: string;
  description: string;
  className: string;
  icon: LucideIcon;
} | null;