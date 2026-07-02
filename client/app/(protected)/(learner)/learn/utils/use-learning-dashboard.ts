'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  fetchConceptProgresses,
  fetchMaterialProgresses,
  fetchPublishedConcepts,
  fetchPublishedMaterials,
  fetchPublishedStudyCases,
  fetchStudyCaseProgresses,
  fetchSubmissions,
} from '@/lib/fetch';

import { useAuthStore } from '@/stores/use-auth-store';

import { Concept, Material, PaginationMeta } from '@/types';

import { ConceptGroup, ContinueTarget, LearningDashboard } from './types';

const DEFAULT_SUBMISSION_LIMIT = 10;

function getDefaultSubmissionsPagination(limit: number): PaginationMeta {
  return {
    page: 1,
    limit,
    total: 0,
    totalPages: 1,
  };
}

function buildMaterialHref(concept: Concept, material: Material) {
  return `/concepts/${concept.slug}/materials/${material.slug}`;
}

function getProgressValue(completed: number, total: number) {
  return total > 0 ? Math.round((completed / total) * 100) : 0;
}

export function useLearningDashboard() {
  const { user, token, hasHydrated } = useAuthStore();

  const userId = user?.id;
  const userRole = user?.role;

  const [dashboard, setDashboard] = useState<LearningDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submissionPage, setSubmissionPage] = useState(1);
  const [submissionLimit, setSubmissionLimitState] = useState(
    DEFAULT_SUBMISSION_LIMIT,
  );

  useEffect(() => {
    let isActive = true;

    const loadDashboard = async () => {
      if (!hasHydrated) {
        return;
      }

      if (!userId || userRole !== 'STUDENT') {
        setDashboard(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const conceptsRes = await fetchPublishedConcepts(token);
        const concepts = conceptsRes.data;

        const materialResponses = await Promise.all(
          concepts.map((concept) =>
            fetchPublishedMaterials(token, {
              conceptId: concept.id,
            }),
          ),
        );

        const materials = materialResponses.flatMap((res) => res.data);

        const studyCaseResponses = await Promise.all(
          materials.map((material) =>
            fetchPublishedStudyCases(token, {
              materialId: material.id,
            }),
          ),
        );

        const studyCases = studyCaseResponses.flatMap((res) => res.data);

        const [
          conceptProgressesRes,
          materialProgressesRes,
          studyCaseProgressesRes,
          submissionsRes,
        ] = await Promise.all([
          fetchConceptProgresses(token),
          fetchMaterialProgresses(token),
          fetchStudyCaseProgresses(token),
          fetchSubmissions(token, {
            page: submissionPage,
            limit: submissionLimit,
            sortBy: 'createdAt',
            orderBy: 'desc',
          }),
        ]);

        if (!isActive) {
          return;
        }

        setDashboard({
          concepts,
          materials,
          studyCases,
          conceptProgresses: conceptProgressesRes.data,
          materialProgresses: materialProgressesRes.data,
          studyCaseProgresses: studyCaseProgressesRes.data,
          submissions: submissionsRes.data,
          submissionsPagination:
            submissionsRes.pagination ??
            getDefaultSubmissionsPagination(submissionLimit),
        });
      } catch (error) {
        console.error('Failed to fetch learning dashboard:', error);

        if (!isActive) {
          return;
        }

        setDashboard({
          concepts: [],
          materials: [],
          studyCases: [],
          conceptProgresses: [],
          materialProgresses: [],
          studyCaseProgresses: [],
          submissions: [],
          submissionsPagination:
            getDefaultSubmissionsPagination(submissionLimit),
        });
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isActive = false;
    };
  }, [hasHydrated, submissionLimit, submissionPage, token, userId, userRole]);

  const completedStudyCaseIds = useMemo(() => {
    if (!dashboard) {
      return new Set<number>();
    }

    return new Set(
      dashboard.studyCaseProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.studyCaseId),
    );
  }, [dashboard]);

  const completedConceptIds = useMemo(() => {
    if (!dashboard) {
      return new Set<number>();
    }

    return new Set(
      dashboard.conceptProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.conceptId),
    );
  }, [dashboard]);

  const completedMaterialIds = useMemo(() => {
    if (!dashboard) {
      return new Set<number>();
    }

    return new Set(
      dashboard.materialProgresses
        .filter((progress) => progress.isCompleted)
        .map((progress) => progress.materialId),
    );
  }, [dashboard]);

  const conceptGroups = useMemo<ConceptGroup[]>(() => {
    if (!dashboard) {
      return [];
    }

    return dashboard.concepts.map((concept) => {
      const conceptMaterials = dashboard.materials.filter(
        (material) => material.conceptId === concept.id,
      );

      const materials = conceptMaterials.map((material) => {
        const materialStudyCases = dashboard.studyCases.filter(
          (studyCase) => studyCase.materialId === material.id,
        );

        const completedStudyCases = materialStudyCases.filter((studyCase) =>
          completedStudyCaseIds.has(studyCase.id),
        ).length;

        return {
          material,
          studyCases: materialStudyCases,
          completedStudyCases,
          totalStudyCases: materialStudyCases.length,
          isCompleted: completedMaterialIds.has(material.id),
          href: buildMaterialHref(concept, material),
        };
      });

      const totalStudyCases = materials.reduce(
        (total, item) => total + item.totalStudyCases,
        0,
      );

      const completedStudyCases = materials.reduce(
        (total, item) => total + item.completedStudyCases,
        0,
      );

      return {
        concept,
        materials,
        completedStudyCases,
        totalStudyCases,
        progress: getProgressValue(completedStudyCases, totalStudyCases),
        isCompleted: completedConceptIds.has(concept.id),
      };
    });
  }, [
    completedConceptIds,
    completedMaterialIds,
    completedStudyCaseIds,
    dashboard,
  ]);

  const continueTarget = useMemo<ContinueTarget | null>(() => {
    if (!dashboard) {
      return null;
    }

    for (const concept of dashboard.concepts) {
      const conceptMaterials = dashboard.materials.filter(
        (material) => material.conceptId === concept.id,
      );

      for (const material of conceptMaterials) {
        if (!completedMaterialIds.has(material.id)) {
          const materialStudyCases = dashboard.studyCases.filter(
            (studyCase) => studyCase.materialId === material.id,
          );

          const nextStudyCase =
            materialStudyCases.find(
              (studyCase) => !completedStudyCaseIds.has(studyCase.id),
            ) ?? null;

          return {
            concept,
            material,
            nextStudyCase,
            href: buildMaterialHref(concept, material),
          };
        }
      }
    }

    return null;
  }, [completedMaterialIds, completedStudyCaseIds, dashboard]);

  const totalStudyCases = dashboard?.studyCases.length ?? 0;
  const completedStudyCases = completedStudyCaseIds.size;
  const overallProgress = getProgressValue(
    completedStudyCases,
    totalStudyCases,
  );

  const fallbackSubmissionsPagination = useMemo(() => {
    return getDefaultSubmissionsPagination(submissionLimit);
  }, [submissionLimit]);

  const changeSubmissionPage = useCallback((page: number) => {
    setSubmissionPage(page);
  }, []);

  const changeSubmissionLimit = useCallback((limit: number) => {
    setSubmissionPage(1);
    setSubmissionLimitState(limit);
  }, []);

  return {
    user,
    hasHydrated,
    isLoading,
    dashboard,
    conceptGroups,
    continueTarget,
    totalStudyCases,
    completedStudyCases,
    overallProgress,
    submissions: dashboard?.submissions ?? [],
    submissionsPagination:
      dashboard?.submissionsPagination ?? fallbackSubmissionsPagination,
    concepts: dashboard?.concepts ?? [],
    materials: dashboard?.materials ?? [],
    setSubmissionPage: changeSubmissionPage,
    setSubmissionLimit: changeSubmissionLimit,
  };
}
