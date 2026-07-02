'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { AlertCircle, CheckCircle2 } from 'lucide-react';

import api from '@/lib/api';

import { useAuthStore } from '@/stores/use-auth-store';

import {
  ApiResponse,
  Concept,
  Material,
  StudyCase,
  Submission,
  SubmissionDetail,
  TestCase,
  TestResult,
} from '@/types';

import {
  formatCaseValue,
  formatInputValue,
  getSubmissionResult,
} from '../utils/study-case-editor';
import { DisplayedTestCase } from '../utils/types';

import StudyCaseProblemPanel from './StudyCaseProblemPanel';
import StudyCaseWorkspacePanel from './StudyCaseWorkspacePanel';
import { getWhatToCheck } from '@/lib/helpers/submission-feedback';

type Props = {
  concept: Concept;
  material: Material;
  studyCase: StudyCase;
  prevStudyCase: StudyCase | null;
  nextStudyCase: StudyCase | null;
};

export default function StudyCaseEditor({
  concept,
  material,
  studyCase,
  prevStudyCase,
  nextStudyCase,
}: Props) {
  const starterCode = useMemo(() => {
    return (
      studyCase.starterCode ||
      `function ${studyCase.functionName || 'solution'}() {\n  // Write your code here\n}`
    );
  }, [studyCase.functionName, studyCase.starterCode]);

  const { user, hasHydrated } = useAuthStore();
  const hasUserEditedCode = useRef(false);

  const userId = user?.id;
  const userRole = user?.role;

  const [code, setCode] = useState(starterCode);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [results, setResults] = useState<TestResult[]>([]);
  const [isFetchingTests, setIsFetchingTests] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const canInteract = hasHydrated && userRole === 'STUDENT';

  const resultMap = useMemo(() => {
    return new Map(results.map((result) => [result.testCaseId, result]));
  }, [results]);

  const displayedTestCases: DisplayedTestCase[] = testCases.map((testCase) => {
    const result = resultMap.get(testCase.id);

    return {
      id: testCase.id,
      description: result?.description ?? testCase.description,
      status: result?.status ?? 'PENDING',
      input: formatInputValue(testCase.input),
      expected: formatCaseValue(result?.expected ?? testCase.expected),
      received: result?.received,
      whatToCheck: getWhatToCheck({
        status: result?.status,
        expected: result?.expected ?? testCase.expected,
        received: result?.received,
        failureMessage: result?.failureMessage,
      }),
    };
  });

  const sampleTestCase = displayedTestCases[0] ?? null;

  const totalTests = displayedTestCases.length;

  const passedCount = displayedTestCases.filter(
    (testCase) => testCase.status === 'PASSED',
  ).length;

  const failedCount = displayedTestCases.filter(
    (testCase) => testCase.status === 'FAILED',
  ).length;

  const errorCount = displayedTestCases.filter(
    (testCase) => testCase.status === 'ERROR',
  ).length;

  const progress = totalTests > 0 ? (passedCount / totalTests) * 100 : 0;

  const hasResults = results.length > 0;
  const allPassed = hasResults && totalTests > 0 && passedCount === totalTests;

  const isProcessingResult = isTesting || isSubmitting;

  const feedbackContent = useMemo(() => {
    if (!message) {
      return null;
    }

    if (allPassed) {
      return {
        title: 'All checks passed',
        description:
          'Nice work. Review your code and simplify it if needed. If you make changes, run the test again before submitting.',
        className: 'border-green-200 bg-green-50 text-green-800',
        icon: CheckCircle2,
      };
    }

    if (hasResults) {
      return {
        title: 'Keep improving your solution',
        description:
          'Some checks still need attention. Compare the expected and received results, then update your code.',
        className: 'border-orange-200 bg-orange-50 text-orange-900',
        icon: AlertCircle,
      };
    }

    return {
      title: 'Notice',
      description: message,
      className: '',
      icon: AlertCircle,
    };
  }, [allPassed, hasResults, message]);

  useEffect(() => {
    const fetchTestCases = async () => {
      setIsFetchingTests(true);

      try {
        const res = await api.get<{ data: TestCase[] }>(
          `/test-cases?studyCaseId=${studyCase.id}&sortBy=order&orderBy=asc&limit=100`,
        );

        setTestCases(res.data.data);
      } finally {
        setIsFetchingTests(false);
      }
    };

    fetchTestCases();
  }, [studyCase.id]);

  useEffect(() => {
    let isActive = true;

    const fetchLatestPassedSubmission = async () => {
      if (!hasHydrated || !userId || userRole !== 'STUDENT') {
        return;
      }

      try {
        const params = new URLSearchParams({
          studyCaseId: String(studyCase.id),
          status: 'PASSED',
          sortBy: 'createdAt',
          orderBy: 'desc',
          limit: '1',
          userId: String(userId),
        });

        const res = await api.get<ApiResponse<Submission[]>>(
          `/submissions?${params.toString()}`,
        );

        const latestPassedSubmission = res.data.data[0];

        if (!latestPassedSubmission) {
          return;
        }

        const detailRes = await api.get<{ data: SubmissionDetail }>(
          `/submissions/${latestPassedSubmission.id}`,
        );

        const completedSubmission = detailRes.data.data;

        if (!isActive || hasUserEditedCode.current) {
          return;
        }

        setCode(completedSubmission.code);
        setResults(completedSubmission.testResults ?? []);
        setMessage(
          'You have completed this study case. Your submitted code is loaded for review.',
        );
      } catch {
        // Keep starter code.
      }
    };

    fetchLatestPassedSubmission();

    return () => {
      isActive = false;
    };
  }, [hasHydrated, studyCase.id, userId, userRole]);

  const handleReset = () => {
    hasUserEditedCode.current = true;
    setCode(starterCode);
    setResults([]);
    setMessage('Your code has been reset to the starter code.');
  };

  const handleRunTest = async () => {
    if (!canInteract) {
      setMessage('Please sign in as a student to run the test.');
      return;
    }

    setIsTesting(true);
    setMessage(null);

    try {
      const res = await api.post<{ data: SubmissionDetail }>(
        '/submissions/run',
        {
          studyCaseId: studyCase.id,
          code,
        },
      );

      const data = res.data.data;

      setResults(data.testResults ?? []);

      if (data.status === 'PASSED') {
        setMessage(
          'All tests passed. Review your code and run the test again if you make changes.',
        );
      } else {
        setMessage(
          'Some tests are still failing. Read the feedback and improve your code.',
        );
      }
    } catch {
      setMessage('Unable to run tests. Please check your code and try again.');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = async () => {
    if (!canInteract) {
      setMessage('Please sign in as a student to submit your answer.');
      return;
    }

    setIsSubmitting(true);
    setMessage('Your answer is being submitted and tested. Please wait...');

    try {
      const res = await api.post<{ data: Submission }>('/submissions', {
        studyCaseId: studyCase.id,
        code,
      });

      const submission = res.data.data;
      const submissionResult = await getSubmissionResult(submission.id);

      setResults(submissionResult.testResults ?? []);

      if (submissionResult.status === 'PASSED') {
        setMessage(
          'Excellent. Your answer has been submitted successfully. You can continue when you are ready.',
        );
      } else if (submissionResult.status === 'FAILED') {
        setMessage(
          'Your answer was submitted, but some checks still need attention.',
        );
      } else {
        setMessage(
          submissionResult.errorMessage ||
            'Your answer was submitted, but an error occurred while testing.',
        );
      }
    } catch {
      setMessage('Unable to submit your answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='grid min-h-[calc(100dvh-9rem)] gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]'>
      <StudyCaseProblemPanel
        concept={concept}
        material={material}
        studyCase={studyCase}
        isFetchingTests={isFetchingTests}
        sampleTestCase={sampleTestCase}
      />

      <StudyCaseWorkspacePanel
        concept={concept}
        material={material}
        prevStudyCase={prevStudyCase}
        nextStudyCase={nextStudyCase}
        code={code}
        allPassed={allPassed}
        hasResults={hasResults}
        hasHydrated={hasHydrated}
        canInteract={canInteract}
        isTesting={isTesting}
        isSubmitting={isSubmitting}
        isProcessingResult={isProcessingResult}
        passedCount={passedCount}
        failedCount={failedCount}
        errorCount={errorCount}
        totalTests={totalTests}
        progress={progress}
        feedbackContent={feedbackContent}
        displayedTestCases={displayedTestCases}
        onCodeChange={(nextCode) => {
          hasUserEditedCode.current = true;
          setCode(nextCode);
        }}
        onReset={handleReset}
        onRunTest={handleRunTest}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
