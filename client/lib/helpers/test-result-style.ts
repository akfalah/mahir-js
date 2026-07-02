import { AlertCircle, CheckCircle2, Circle, XCircle } from "lucide-react";

import { DisplayedTestStatus } from "@/types";

export function getTestCaseStatusStyle(
  status: DisplayedTestStatus = 'PENDING',
) {
  if (status === 'PASSED') {
    return {
      label: 'Passed',
      icon: CheckCircle2,
      className: 'border-green-200 bg-green-50 text-green-800',
    };
  }

  if (status === 'FAILED') {
    return {
      label: 'Needs Fix',
      icon: XCircle,
      className: 'border-red-200 bg-red-50 text-red-800',
    };
  }

  if (status === 'ERROR') {
    return {
      label: 'Error',
      icon: AlertCircle,
      className: 'border-orange-200 bg-orange-50 text-orange-800',
    };
  }

  return {
    label: 'Not Tested',
    icon: Circle,
    className: 'border-border bg-muted/30 text-muted-foreground',
  };
}
