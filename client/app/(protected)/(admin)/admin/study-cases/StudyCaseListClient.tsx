'use client';

import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Code2, Edit, Plus, Trash2, XCircle } from 'lucide-react';

import api from '@/lib/api';

import { ApiResponse, Concept, Material, StudyCase } from '@/types';

import { useAdminResource } from '@/hooks/use-admin-resource';

import { formatDate } from '@/lib/helpers/format-date';
import { generateSlug } from '@/lib/helpers/generate-slug';
import { getFieldErrors } from '@/lib/validations/get-field-errors';
import { studyCaseSchema } from '@/lib/validations/study-case';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DrawerClose, DrawerFooter } from '@/components/ui/drawer';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import AdminContentPanel from '@/components/shared/AdminContentPanel';
import AdminDialog from '@/components/shared/AdminDialog';
import AdminPageHeader from '@/components/shared/AdminPageHeader';
import AdminPagination from '@/components/shared/AdminPagination';
import AdminDrawer from '@/components/shared/AdminDrawer';
import AdminStatusMessage from '@/components/shared/AdminStatusMessage';
import AdminToolbar from '@/components/shared/AdminToolbar';

type DrawerMode = 'create' | 'edit' | null;

type StudyCaseFormErrors = {
  materialId?: string;
  title?: string;
  slug?: string;
  description?: string;
  hint?: string;
  starterCode?: string;
  order?: string;
  functionName?: string;
  parameterNames?: string;
  syntaxRules?: string;
  isPublished?: string;
};

function stringifySyntaxRules(value: StudyCase['syntaxRules']) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return '{}';
  }
}

function stringifyParameterNames(value: string[] | null) {
  return value?.join(', ') ?? '';
}

export default function StudyCaseListClient() {
  const resource = useAdminResource<StudyCase>({
    endpoint: '/study-cases',
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      orderBy: 'desc',
    },
  });

  const studyCases = resource.items;
  const pagination = resource.pagination;

  const sortBy = String(resource.params.sortBy ?? 'createdAt');
  const orderBy = String(resource.params.orderBy ?? 'desc');
  const limit = String(resource.params.limit ?? 10);

  const materialIdFilter = resource.params.materialId
    ? String(resource.params.materialId)
    : 'all';

  const publishedFilter =
    resource.params.isPublished === undefined
      ? 'all'
      : String(resource.params.isPublished);

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchInput, setSearchInput] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStudyCase, setSelectedStudyCase] = useState<StudyCase | null>(
    null,
  );

  const [materialId, setMaterialId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [hint, setHint] = useState('');
  const [starterCode, setStarterCode] = useState('');
  const [order, setOrder] = useState('1');
  const [functionName, setFunctionName] = useState('');
  const [parameterNames, setParameterNames] = useState('');
  const [syntaxRules, setSyntaxRules] = useState(
    JSON.stringify(
      {
        required: [],
        forbidden: [],
      },
      null,
      2,
    ),
  );
  const [isPublished, setIsPublished] = useState(true);

  const [errors, setErrors] = useState<StudyCaseFormErrors>({});

  useEffect(() => {
    let isActive = true;

    const loadConceptsAndMaterials = async () => {
      try {
        const conceptsRes = await api.get<ApiResponse<Concept[]>>('/concepts');

        if (!isActive) {
          return;
        }

        const nextConcepts = conceptsRes.data.data;
        setConcepts(nextConcepts);

        const materialsByConcept = await Promise.all(
          nextConcepts.map((concept) =>
            api.get<ApiResponse<Material[]>>(
              `/materials?conceptId=${concept.id}`,
            ),
          ),
        );

        if (!isActive) {
          return;
        }

        setMaterials(
          materialsByConcept.flatMap((response) => response.data.data),
        );
      } catch {
        if (!isActive) {
          return;
        }

        setConcepts([]);
        setMaterials([]);
      }
    };

    loadConceptsAndMaterials();

    return () => {
      isActive = false;
    };
  }, []);

  const getRowNumber = (index: number) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  const getMaterialTitle = (nextMaterialId: number) => {
    return (
      materials.find((material) => material.id === nextMaterialId)?.title ?? '-'
    );
  };

  const getConceptTitleByMaterialId = (nextMaterialId: number) => {
    const material = materials.find((item) => item.id === nextMaterialId);

    if (!material) {
      return '-';
    }

    return (
      concepts.find((concept) => concept.id === material.conceptId)?.title ??
      '-'
    );
  };

  const resetForm = (studyCase?: StudyCase | null) => {
    setMaterialId(
      studyCase?.materialId
        ? String(studyCase.materialId)
        : materialIdFilter !== 'all'
          ? materialIdFilter
          : '',
    );
    setTitle(studyCase?.title ?? '');
    setSlug(studyCase?.slug ?? '');
    setDescription(studyCase?.description ?? '');
    setHint(studyCase?.hint ?? '');
    setStarterCode(studyCase?.starterCode ?? '// write your code here');
    setOrder(String(studyCase?.order ?? 1));
    setFunctionName(studyCase?.functionName ?? '');
    setParameterNames(
      stringifyParameterNames(studyCase?.parameterNames ?? null),
    );
    setSyntaxRules(
      studyCase
        ? stringifySyntaxRules(studyCase.syntaxRules)
        : JSON.stringify(
            {
              required: [],
              forbidden: [],
            },
            null,
            2,
          ),
    );
    setIsPublished(studyCase?.isPublished ?? true);
    setErrors({});
    resource.setMessage(null);
  };

  const openCreateDrawer = () => {
    setDrawerMode('create');
    setSelectedStudyCase(null);
    resetForm(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (studyCase: StudyCase) => {
    setDrawerMode('edit');
    setSelectedStudyCase(studyCase);
    resetForm(studyCase);
    setDrawerOpen(true);
  };

  const openDeleteDialog = (studyCase: StudyCase) => {
    setSelectedStudyCase(studyCase);
    setErrors({});
    resource.setMessage(null);
    setDeleteDialogOpen(true);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    resource.updateParams({
      search: searchInput.trim() || undefined,
    });
  };

  const handleReset = () => {
    setSearchInput('');
    resource.resetParams();
  };

  const handleMaterialFilterChange = (value: string) => {
    if (value === 'all') {
      resource.updateParams({
        materialId: undefined,
        sortBy: sortBy === 'order' ? 'createdAt' : sortBy,
        orderBy: sortBy === 'order' ? 'desc' : orderBy,
      });

      return;
    }

    resource.updateParams({
      materialId: Number(value),
    });
  };

  const handlePublishedFilterChange = (value: string) => {
    resource.updateParams({
      isPublished: value === 'all' ? undefined : value === 'true',
    });
  };

  const handleSortChange = (value: string) => {
    resource.updateParams({
      sortBy: value,
    });
  };

  const handleSubmitStudyCase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});
    resource.setMessage(null);

    const validationResult = studyCaseSchema.safeParse({
      materialId,
      title,
      slug,
      description,
      hint,
      starterCode,
      order,
      functionName,
      parameterNames,
      syntaxRules,
      isPublished,
    });

    if (!validationResult.success) {
      const fieldErrors = getFieldErrors(validationResult.error);

      setErrors({
        materialId: fieldErrors.materialId,
        title: fieldErrors.title,
        slug: fieldErrors.slug,
        description: fieldErrors.description,
        hint: fieldErrors.hint,
        starterCode: fieldErrors.starterCode,
        order: fieldErrors.order,
        functionName: fieldErrors.functionName,
        parameterNames: fieldErrors.parameterNames,
        syntaxRules: fieldErrors.syntaxRules,
        isPublished: fieldErrors.isPublished,
      });

      return;
    }

    try {
      const values = validationResult.data;

      const payload = {
        materialId: values.materialId,
        title: values.title,
        slug: values.slug,
        description: values.description,
        hint: values.hint || null,
        starterCode: values.starterCode,
        order: values.order,
        functionName: values.functionName || null,
        parameterNames:
          values.parameterNames.length > 0 ? values.parameterNames : null,
        syntaxRules: values.syntaxRules,
        isPublished: values.isPublished,
      };

      if (drawerMode === 'create') {
        await resource.createItem(payload);
        resource.setMessage('Study case created successfully.');
      }

      if (drawerMode === 'edit' && selectedStudyCase) {
        await resource.updateItem(selectedStudyCase.id, payload);
        resource.setMessage('Study case updated successfully.');
      }

      setDrawerOpen(false);
      setDrawerMode(null);
      setSelectedStudyCase(null);
      resetForm(null);
    } catch {
      resource.setMessage(
        drawerMode === 'create'
          ? 'Failed to create study case.'
          : 'Failed to update study case.',
      );
    }
  };

  const handleDeleteStudyCase = async () => {
    if (!selectedStudyCase) {
      return;
    }

    try {
      await resource.deleteItem(selectedStudyCase.id);

      resource.setMessage('Study case deleted successfully.');
      setDeleteDialogOpen(false);
      setSelectedStudyCase(null);
    } catch {
      resource.setMessage(
        'Failed to delete study case. Please check related test cases or submissions.',
      );
    }
  };

  const drawerTitle =
    drawerMode === 'create' ? 'Create Study Case' : 'Edit Study Case';

  return (
    <div className='flex flex-col gap-y-6'>
      <AdminContentPanel>
        <AdminPageHeader
          title='Study Cases'
          description='Manage coding challenges that students solve with automated grading.'
          action={
            <Button
              type='button'
              className='w-fit gap-2'
              onClick={openCreateDrawer}
            >
              <Plus className='size-4' />
              Create Study Case
            </Button>
          }
        />

        <AdminToolbar
          searchValue={searchInput}
          searchPlaceholder='Search study cases...'
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearch}
          onReset={handleReset}
          filters={
            <>
              <Select
                value={materialIdFilter}
                onValueChange={handleMaterialFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Material' />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='all'>All Materials</SelectItem>

                  {materials.map((material) => (
                    <SelectItem
                      key={material.id}
                      value={String(material.id)}
                    >
                      {material.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={publishedFilter}
                onValueChange={handlePublishedFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Published' />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='all'>All Status</SelectItem>
                  <SelectItem value='true'>Published</SelectItem>
                  <SelectItem value='false'>Draft</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={sortBy}
                onValueChange={handleSortChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>

                <SelectContent>
                  {materialIdFilter !== 'all' && (
                    <SelectItem value='order'>Order</SelectItem>
                  )}

                  <SelectItem value='title'>Title</SelectItem>
                  <SelectItem value='createdAt'>Created Date</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={orderBy}
                onValueChange={(value) =>
                  resource.updateParams({
                    orderBy: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Order' />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='asc'>Ascending</SelectItem>
                  <SelectItem value='desc'>Descending</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={limit}
                onValueChange={(value) =>
                  resource.updateParams({
                    limit: Number(value),
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Limit' />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='10'>10 rows</SelectItem>
                  <SelectItem value='20'>20 rows</SelectItem>
                  <SelectItem value='50'>50 rows</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />

        <div className='p-4 md:p-5'>
          <AdminStatusMessage message={resource.message} />
        </div>

        <div className='overflow-x-auto px-4'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-16'>No.</TableHead>
                <TableHead className='w-20'>Order</TableHead>
                <TableHead>Study Case</TableHead>
                <TableHead>Material</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='hidden md:table-cell'>Function</TableHead>
                <TableHead className='hidden md:table-cell'>Created</TableHead>
                <TableHead className='w-32 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {resource.isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Skeleton className='h-5 w-8' />
                    </TableCell>

                    <TableCell>
                      <Skeleton className='h-6 w-12' />
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-y-2'>
                        <Skeleton className='h-5 w-48' />
                        <Skeleton className='h-4 w-72' />
                      </div>
                    </TableCell>

                    <TableCell>
                      <Skeleton className='h-5 w-32' />
                    </TableCell>

                    <TableCell>
                      <Skeleton className='h-6 w-20' />
                    </TableCell>

                    <TableCell className='hidden md:table-cell'>
                      <Skeleton className='h-5 w-24' />
                    </TableCell>

                    <TableCell className='hidden md:table-cell'>
                      <Skeleton className='h-5 w-24' />
                    </TableCell>

                    <TableCell>
                      <div className='flex justify-end gap-2'>
                        <Skeleton className='size-9 rounded-xl' />
                        <Skeleton className='size-9 rounded-xl' />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : studyCases.length > 0 ? (
                studyCases.map((studyCase, index) => (
                  <TableRow key={studyCase.id}>
                    <TableCell className='text-sm text-muted-foreground'>
                      {getRowNumber(index)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant='outline'
                        className='rounded-full'
                      >
                        #{studyCase.order}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-y-1'>
                        <div className='flex items-center gap-x-2'>
                          <p className='font-semibold'>{studyCase.title}</p>

                          <code className='w-fit rounded-full bg-muted px-2 py-1 text-xs'>
                            {studyCase.slug}
                          </code>
                        </div>

                        <p className='line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground'>
                          {studyCase.description}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-y-1'>
                        <Badge
                          variant='secondary'
                          className='w-fit rounded-full'
                        >
                          {getMaterialTitle(studyCase.materialId)}
                        </Badge>

                        <p className='text-xs text-muted-foreground'>
                          {getConceptTitleByMaterialId(studyCase.materialId)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {studyCase.isPublished ? (
                        <Badge className='gap-1 rounded-full'>
                          <CheckCircle2 className='size-3' />
                          Published
                        </Badge>
                      ) : (
                        <Badge
                          variant='secondary'
                          className='gap-1 rounded-full'
                        >
                          <XCircle className='size-3' />
                          Draft
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className='hidden md:table-cell'>
                      <code className='rounded-full bg-muted px-2 py-1 text-xs'>
                        {studyCase.functionName ?? '-'}
                      </code>
                    </TableCell>

                    <TableCell className='hidden text-sm text-muted-foreground md:table-cell'>
                      {formatDate(studyCase.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className='flex justify-end gap-2'>
                        <Button
                          type='button'
                          variant='secondary'
                          size='icon'
                          onClick={() => openEditDrawer(studyCase)}
                        >
                          <Edit className='size-4' />
                        </Button>

                        <Button
                          type='button'
                          variant='destructive'
                          size='icon'
                          onClick={() => openDeleteDialog(studyCase)}
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className='flex flex-col items-center gap-y-3 px-4 py-12 text-center'>
                      <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                        <Code2 className='size-6' />
                      </div>

                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>No study cases found</p>

                        <p className='text-sm text-muted-foreground'>
                          Create a new study case or adjust your search and
                          filter.
                        </p>
                      </div>

                      <Button
                        type='button'
                        className='gap-2'
                        onClick={openCreateDrawer}
                      >
                        <Plus className='size-4' />
                        Create Study Case
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <AdminPagination
          pagination={pagination}
          label='study cases'
          onPageChange={(nextPage) =>
            resource.updateParams(
              {
                page: nextPage,
              },
              {
                resetPage: false,
              },
            )
          }
        />
      </AdminContentPanel>

      <AdminDrawer
        open={drawerOpen}
        title={drawerTitle}
        description='Fill in the study case information, starter code, syntax rules, and grading configuration.'
        onOpenChange={setDrawerOpen}
      >
        <form
          onSubmit={handleSubmitStudyCase}
          className='flex min-h-0 flex-1 flex-col'
        >
          <div className='flex min-h-0 flex-1 flex-col gap-y-5 overflow-y-auto p-5 md:p-6'>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.materialId)}>
                <FieldLabel>Material</FieldLabel>

                <Select
                  value={materialId || undefined}
                  onValueChange={(value) => {
                    setMaterialId(value);
                    setErrors((prev) => ({
                      ...prev,
                      materialId: undefined,
                    }));
                  }}
                >
                  <SelectTrigger aria-invalid={Boolean(errors.materialId)}>
                    <SelectValue placeholder='Choose material' />
                  </SelectTrigger>

                  <SelectContent>
                    {materials.map((material) => (
                      <SelectItem
                        key={material.id}
                        value={String(material.id)}
                      >
                        {material.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.materialId ? (
                  <FieldError>{errors.materialId}</FieldError>
                ) : (
                  <FieldDescription>
                    Choose the material for this study case.
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.title)}>
                <FieldLabel htmlFor='title'>Title</FieldLabel>

                <Input
                  id='title'
                  value={title}
                  onChange={(event) => {
                    const value = event.target.value;

                    setTitle(value);
                    setErrors((prev) => ({
                      ...prev,
                      title: undefined,
                    }));

                    if (drawerMode === 'create') {
                      setSlug(generateSlug(value));
                    }
                  }}
                  placeholder='Check Adult'
                  aria-invalid={Boolean(errors.title)}
                />

                {errors.title ? (
                  <FieldError>{errors.title}</FieldError>
                ) : (
                  <FieldDescription>
                    Use a clear coding challenge title.
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.slug)}>
                <FieldLabel htmlFor='slug'>Slug</FieldLabel>

                <Input
                  id='slug'
                  value={slug}
                  onChange={(event) => {
                    setSlug(generateSlug(event.target.value));
                    setErrors((prev) => ({
                      ...prev,
                      slug: undefined,
                    }));
                  }}
                  placeholder='check-adult'
                  aria-invalid={Boolean(errors.slug)}
                />

                {errors.slug ? (
                  <FieldError>{errors.slug}</FieldError>
                ) : (
                  <FieldDescription>
                    Used for public study case URL.
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.description)}>
                <FieldLabel htmlFor='description'>Description</FieldLabel>

                <Textarea
                  id='description'
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      description: undefined,
                    }));
                  }}
                  placeholder='Describe the task students need to solve.'
                  aria-invalid={Boolean(errors.description)}
                />

                {errors.description ? (
                  <FieldError>{errors.description}</FieldError>
                ) : (
                  <FieldDescription>
                    Explain the expected problem in simple language.
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.hint)}>
                <FieldLabel htmlFor='hint'>Hint</FieldLabel>

                <Textarea
                  id='hint'
                  value={hint}
                  onChange={(event) => {
                    setHint(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      hint: undefined,
                    }));
                  }}
                  placeholder='Give a short hint for students.'
                  aria-invalid={Boolean(errors.hint)}
                />

                {errors.hint ? (
                  <FieldError>{errors.hint}</FieldError>
                ) : (
                  <FieldDescription>
                    Optional hint shown on the study case page.
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.starterCode)}>
                <FieldLabel htmlFor='starterCode'>Starter Code</FieldLabel>

                <Textarea
                  id='starterCode'
                  value={starterCode}
                  onChange={(event) => {
                    setStarterCode(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      starterCode: undefined,
                    }));
                  }}
                  placeholder='// write your code here'
                  className='min-h-44 font-mono text-sm'
                  aria-invalid={Boolean(errors.starterCode)}
                />

                {errors.starterCode ? (
                  <FieldError>{errors.starterCode}</FieldError>
                ) : (
                  <FieldDescription>
                    Initial code displayed in the editor.
                  </FieldDescription>
                )}
              </Field>

              <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                <Field data-invalid={Boolean(errors.functionName)}>
                  <FieldLabel htmlFor='functionName'>Function Name</FieldLabel>

                  <Input
                    id='functionName'
                    value={functionName}
                    onChange={(event) => {
                      setFunctionName(event.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        functionName: undefined,
                      }));
                    }}
                    placeholder='isAdult'
                    aria-invalid={Boolean(errors.functionName)}
                  />

                  {errors.functionName ? (
                    <FieldError>{errors.functionName}</FieldError>
                  ) : (
                    <FieldDescription>
                      Function name used by the test runner.
                    </FieldDescription>
                  )}
                </Field>

                <Field data-invalid={Boolean(errors.parameterNames)}>
                  <FieldLabel htmlFor='parameterNames'>
                    Parameter Names
                  </FieldLabel>

                  <Input
                    id='parameterNames'
                    value={parameterNames}
                    onChange={(event) => {
                      setParameterNames(event.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        parameterNames: undefined,
                      }));
                    }}
                    placeholder='age, score'
                    aria-invalid={Boolean(errors.parameterNames)}
                  />

                  {errors.parameterNames ? (
                    <FieldError>{errors.parameterNames}</FieldError>
                  ) : (
                    <FieldDescription>
                      Separate parameters with commas.
                    </FieldDescription>
                  )}
                </Field>
              </div>

              <Field data-invalid={Boolean(errors.syntaxRules)}>
                <FieldLabel htmlFor='syntaxRules'>Syntax Rules</FieldLabel>

                <Textarea
                  id='syntaxRules'
                  value={syntaxRules}
                  onChange={(event) => {
                    setSyntaxRules(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      syntaxRules: undefined,
                    }));
                  }}
                  className='min-h-40 font-mono text-sm'
                  aria-invalid={Boolean(errors.syntaxRules)}
                />

                {errors.syntaxRules ? (
                  <FieldError>{errors.syntaxRules}</FieldError>
                ) : (
                  <FieldDescription>
                    JSON format. Example: {'{ "required": ["IfStatement"] }'}
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.order)}>
                <FieldLabel htmlFor='order'>Order</FieldLabel>

                <Input
                  id='order'
                  type='number'
                  min={1}
                  value={order}
                  onChange={(event) => {
                    setOrder(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      order: undefined,
                    }));
                  }}
                  aria-invalid={Boolean(errors.order)}
                />

                {errors.order ? (
                  <FieldError>{errors.order}</FieldError>
                ) : (
                  <FieldDescription>
                    Determines display order inside the material.
                  </FieldDescription>
                )}
              </Field>

              <Field>
                <FieldLabel>Published</FieldLabel>

                <div className='flex items-center justify-between rounded-2xl border px-4 py-3'>
                  <div className='flex flex-col gap-y-1'>
                    <p className='text-sm font-medium'>
                      {isPublished ? 'Published' : 'Draft'}
                    </p>

                    <p className='text-xs text-muted-foreground'>
                      Published study cases are visible to students.
                    </p>
                  </div>

                  <Switch
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                </div>
              </Field>
            </FieldGroup>
          </div>

          <DrawerFooter className='shrink-0 border-t bg-background'>
            <Button
              type='submit'
              disabled={resource.isMutating}
            >
              {resource.isMutating ? 'Saving...' : 'Save Study Case'}
            </Button>

            <DrawerClose asChild>
              <Button
                type='button'
                variant='outline'
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </AdminDrawer>

      <AdminDialog
        open={deleteDialogOpen}
        title='Confirm whether this study case should be deleted.'
        description={`Are you sure you want to delete ${
          selectedStudyCase?.title
            ? `${selectedStudyCase.title} Study Case`
            : 'this study case'
        }? This action cannot be undone. If this study case already has related test cases or submissions, the backend may reject this action.`}
        isDeleting={resource.isMutating}
        onConfirm={handleDeleteStudyCase}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
