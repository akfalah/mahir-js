'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Edit,
  FileCheck2,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';

import api from '@/lib/api';

import { ApiResponse, StudyCase, TestCase } from '@/types';

import { useAdminResource } from '@/hooks/use-admin-resource';

import { formatDate } from '@/lib/helpers/format-date';
import { getFieldErrors } from '@/lib/validations/get-field-errors';
import { testCaseSchema } from '@/lib/validations/test-case';

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
import { Spinner } from '@/components/ui/spinner';
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
import AdminDrawer from '@/components/shared/AdminDrawer';
import AdminJsonEditor from '@/components/shared/AdminJsonEditor';
import AdminPageHeader from '@/components/shared/AdminPageHeader';
import AdminPagination from '@/components/shared/AdminPagination';
import AdminStatusMessage from '@/components/shared/AdminStatusMessage';
import AdminToolbar from '@/components/shared/AdminToolbar';

type DrawerMode = 'create' | 'edit' | null;

type TestCaseFormErrors = {
  studyCaseId?: string;
  description?: string;
  input?: string;
  expected?: string;
  order?: string;
  isPublished?: string;
};

function stringifyJson(value: Record<string, unknown>) {
  try {
    return JSON.stringify(value ?? {}, null, 2);
  } catch {
    return '{}';
  }
}

function formatJsonPreview(value: Record<string, unknown>) {
  try {
    const json = JSON.stringify(value);
    return json.length > 80 ? `${json.slice(0, 80)}...` : json;
  } catch {
    return '-';
  }
}

export default function TestCaseListClient() {
  const {
    items,
    params,
    pagination,
    isLoading,
    isMutating,
    message,
    setMessage,
    updateParams,
    resetParams,
    createItem,
    updateItem,
    deleteItem,
  } = useAdminResource<TestCase>({
    endpoint: '/test-cases',
    resourceName: 'Test case',
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      orderBy: 'desc',
    },
  });

  const testCases = items;

  const sortBy = String(params.sortBy ?? 'createdAt');
  const orderBy = String(params.orderBy ?? 'desc');
  const limit = String(params.limit ?? 10);

  const studyCaseIdFilter = params.studyCaseId
    ? String(params.studyCaseId)
    : 'all';

  const publishedFilter =
    params.isPublished === undefined || params.isPublished === null
      ? 'all'
      : String(params.isPublished);

  const [studyCases, setStudyCases] = useState<StudyCase[]>([]);
  const [searchInput, setSearchInput] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(
    null,
  );

  const [studyCaseId, setStudyCaseId] = useState('');
  const [description, setDescription] = useState('');
  const [input, setInput] = useState(
    JSON.stringify(
      {
        value: 1,
      },
      null,
      2,
    ),
  );
  const [expected, setExpected] = useState(
    JSON.stringify(
      {
        result: true,
      },
      null,
      2,
    ),
  );
  const [order, setOrder] = useState('1');
  const [isPublished, setIsPublished] = useState(true);

  const [errors, setErrors] = useState<TestCaseFormErrors>({});

  useEffect(() => {
    let isActive = true;

    const loadStudyCases = async () => {
      try {
        const res = await api.get<ApiResponse<StudyCase[]>>('/study-cases');

        if (!isActive) {
          return;
        }

        setStudyCases(res.data.data);
      } catch {
        if (!isActive) {
          return;
        }

        setStudyCases([]);
      }
    };

    loadStudyCases();

    return () => {
      isActive = false;
    };
  }, []);

  const getRowNumber = (index: number) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  const getStudyCaseOptionLabel = (studyCase: StudyCase) => {
    const conceptTitle = studyCase.material?.concept?.title;
    const materialTitle = studyCase.material?.title;

    if (conceptTitle && materialTitle) {
      return `${conceptTitle} / ${materialTitle} / ${studyCase.title}`;
    }

    if (materialTitle) {
      return `${materialTitle} / ${studyCase.title}`;
    }

    return studyCase.title;
  };

  const resetForm = (testCase?: TestCase | null) => {
    setStudyCaseId(
      testCase?.studyCaseId
        ? String(testCase.studyCaseId)
        : studyCaseIdFilter !== 'all'
          ? studyCaseIdFilter
          : '',
    );
    setDescription(testCase?.description ?? '');
    setInput(testCase ? stringifyJson(testCase.input) : '{\n  "value": 1\n}');
    setExpected(
      testCase ? stringifyJson(testCase.expected) : '{\n  "result": true\n}',
    );
    setOrder(String(testCase?.order ?? 1));
    setIsPublished(testCase?.isPublished ?? true);
    setErrors({});
    setMessage(null);
  };

  const openCreateDrawer = () => {
    setDrawerMode('create');
    setSelectedTestCase(null);
    resetForm(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (testCase: TestCase) => {
    setDrawerMode('edit');
    setSelectedTestCase(testCase);
    resetForm(testCase);
    setDrawerOpen(true);
  };

  const openDeleteDialog = (testCase: TestCase) => {
    setSelectedTestCase(testCase);
    setErrors({});
    setMessage(null);
    setDeleteDialogOpen(true);
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    updateParams({
      search: searchInput.trim() || undefined,
    });
  };

  const handleReset = () => {
    setSearchInput('');
    resetParams();
  };

  const handleStudyCaseFilterChange = (value: string) => {
    if (value === 'all') {
      updateParams({
        studyCaseId: undefined,
        sortBy: sortBy === 'order' ? 'createdAt' : sortBy,
        orderBy: sortBy === 'order' ? 'desc' : orderBy,
      });

      return;
    }

    updateParams({
      studyCaseId: Number(value),
    });
  };

  const handlePublishedFilterChange = (value: string) => {
    updateParams({
      isPublished: value === 'all' ? undefined : value === 'true',
    });
  };

  const handleSortChange = (value: string) => {
    updateParams({
      sortBy: value,
    });
  };

  const handleStudyCaseChange = (value: string) => {
    setStudyCaseId(value);
    setErrors((prev) => ({
      ...prev,
      studyCaseId: undefined,
    }));

    const selected = studyCases.find(
      (studyCase) => studyCase.id === Number(value),
    );

    if (!selected) {
      return;
    }

    if (selected.parameterNames?.length) {
      const nextInput = selected.parameterNames.reduce<Record<string, unknown>>(
        (acc, parameterName) => {
          acc[parameterName] = '';
          return acc;
        },
        {},
      );

      setInput(JSON.stringify(nextInput, null, 2));
    }

    setExpected(
      JSON.stringify(
        {
          result: '',
        },
        null,
        2,
      ),
    );
  };

  const handleSubmitTestCase = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});
    setMessage(null);

    const validationResult = testCaseSchema.safeParse({
      studyCaseId,
      description,
      input,
      expected,
      order,
      isPublished,
    });

    if (!validationResult.success) {
      const fieldErrors = getFieldErrors(validationResult.error);

      setErrors({
        studyCaseId: fieldErrors.studyCaseId,
        description: fieldErrors.description,
        input: fieldErrors.input,
        expected: fieldErrors.expected,
        order: fieldErrors.order,
        isPublished: fieldErrors.isPublished,
      });

      return;
    }

    try {
      const values = validationResult.data;

      const payload = {
        studyCaseId: values.studyCaseId,
        description: values.description,
        input: values.input,
        expected: values.expected,
        order: values.order,
        isPublished: values.isPublished,
      };

      if (drawerMode === 'create') {
        await createItem(payload);
        setMessage('Test case created successfully.');
      }

      if (drawerMode === 'edit' && selectedTestCase) {
        const updatePayload = {
          description: values.description,
          input: values.input,
          expected: values.expected,
          order: values.order,
          isPublished: values.isPublished,
        };

        await updateItem(selectedTestCase.id, updatePayload);
        setMessage('Test case updated successfully.');
      }

      setDrawerOpen(false);
      setDrawerMode(null);
      setSelectedTestCase(null);
      resetForm(null);
    } catch {
      setMessage(
        drawerMode === 'create'
          ? 'Failed to create test case.'
          : 'Failed to update test case.',
      );
    }
  };

  const handleDeleteTestCase = async () => {
    if (!selectedTestCase) {
      return;
    }

    try {
      await deleteItem(selectedTestCase.id);

      setMessage('Test case deleted successfully.');
      setDeleteDialogOpen(false);
      setSelectedTestCase(null);
    } catch {
      setMessage(
        'Failed to delete test case. Please check related submissions.',
      );
    }
  };

  const drawerTitle =
    drawerMode === 'create' ? 'Create Test Case' : 'Edit Test Case';

  const drawerDescription =
    'Fill in the test case input and expected output for automated grading.';

  return (
    <div className='flex flex-col gap-y-6'>
      <AdminContentPanel>
        <AdminPageHeader
          title='Test Cases'
          description='Manage input and expected output data used by the automated grading system.'
          action={
            <Button
              type='button'
              className='w-fit gap-2'
              onClick={openCreateDrawer}
            >
              <Plus className='size-4' />
              Create Test Case
            </Button>
          }
        />

        <AdminToolbar
          searchValue={searchInput}
          searchPlaceholder='Search test cases...'
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearch}
          onReset={handleReset}
          filters={
            <>
              <Select
                value={studyCaseIdFilter}
                onValueChange={handleStudyCaseFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Study case' />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='all'>All Study Cases</SelectItem>

                  {studyCases.map((studyCase) => (
                    <SelectItem
                      key={studyCase.id}
                      value={String(studyCase.id)}
                    >
                      {getStudyCaseOptionLabel(studyCase)}
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
                  {studyCaseIdFilter !== 'all' && (
                    <SelectItem value='order'>Order</SelectItem>
                  )}

                  <SelectItem value='createdAt'>Created Date</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={orderBy}
                onValueChange={(value) =>
                  updateParams({
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
                  updateParams({
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
                  <SelectItem value='100'>100 rows</SelectItem>
                </SelectContent>
              </Select>
            </>
          }
        />

        <div className='p-4 md:p-5'>
          <AdminStatusMessage message={message} />
        </div>

        <div className='overflow-x-auto px-4'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-16'>No.</TableHead>
                <TableHead className='w-20'>Order</TableHead>
                <TableHead>Test Case</TableHead>
                <TableHead>Study Case</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className='hidden lg:table-cell'>Created</TableHead>
                <TableHead className='w-32 text-right'>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
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
                      <Skeleton className='h-5 w-36' />
                    </TableCell>

                    <TableCell>
                      <Skeleton className='h-6 w-20' />
                    </TableCell>

                    <TableCell className='hidden lg:table-cell'>
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
              ) : testCases.length > 0 ? (
                testCases.map((testCase, index) => (
                  <TableRow key={testCase.id}>
                    <TableCell className='text-sm text-muted-foreground'>
                      {getRowNumber(index)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant='outline'
                        className='rounded-full'
                      >
                        #{testCase.order}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>{testCase.description}</p>

                        <p className='line-clamp-1 max-w-xl text-xs text-muted-foreground'>
                          Input: {formatJsonPreview(testCase.input)}
                        </p>

                        <p className='line-clamp-1 max-w-xl text-xs text-muted-foreground'>
                          Expected: {formatJsonPreview(testCase.expected)}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className='flex min-w-0 flex-col gap-y-1'>
                        <p className='truncate font-semibold'>
                          {testCase.studyCase?.title ??
                            `Study Case #${testCase.studyCaseId}`}
                        </p>

                        <p className='truncate text-sm text-muted-foreground'>
                          {testCase.studyCase?.material?.title ?? '-'}
                          {testCase.studyCase?.material?.concept?.title
                            ? ` • ${testCase.studyCase.material.concept.title}`
                            : ''}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {testCase.isPublished ? (
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

                    <TableCell className='hidden text-sm text-muted-foreground lg:table-cell'>
                      {formatDate(testCase.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className='flex justify-end gap-2'>
                        <Button
                          type='button'
                          variant='secondary'
                          size='icon'
                          onClick={() => openEditDrawer(testCase)}
                        >
                          <Edit className='size-4' />
                        </Button>

                        <Button
                          type='button'
                          variant='destructive'
                          size='icon'
                          onClick={() => openDeleteDialog(testCase)}
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className='flex flex-col items-center gap-y-3 px-4 py-12 text-center'>
                      <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                        <FileCheck2 className='size-6' />
                      </div>

                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>No test cases found</p>

                        <p className='text-sm text-muted-foreground'>
                          Create a new test case or adjust your search and
                          filter.
                        </p>
                      </div>

                      <Button
                        type='button'
                        className='gap-2'
                        onClick={openCreateDrawer}
                      >
                        <Plus className='size-4' />
                        Create Test Case
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
          label='test cases'
          onPageChange={(nextPage) =>
            updateParams(
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
        description={drawerDescription}
        onOpenChange={setDrawerOpen}
      >
        <form
          onSubmit={handleSubmitTestCase}
          className='flex min-h-0 flex-1 flex-col'
        >
          <div className='flex min-h-0 flex-1 flex-col gap-y-5 overflow-y-auto p-5 md:p-6'>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.studyCaseId)}>
                <FieldLabel>Study Case</FieldLabel>

                <Select
                  value={studyCaseId}
                  disabled={drawerMode === 'edit'}
                  onValueChange={handleStudyCaseChange}
                >
                  <SelectTrigger aria-invalid={Boolean(errors.studyCaseId)}>
                    <SelectValue placeholder='Choose study case' />
                  </SelectTrigger>

                  <SelectContent>
                    {studyCases.map((studyCase) => (
                      <SelectItem
                        key={studyCase.id}
                        value={String(studyCase.id)}
                      >
                        {getStudyCaseOptionLabel(studyCase)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.studyCaseId ? (
                  <FieldError>{errors.studyCaseId}</FieldError>
                ) : (
                  <FieldDescription>
                    {drawerMode === 'edit'
                      ? 'Study case cannot be changed after test case is created.'
                      : 'Choose the study case for this test case.'}
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
                  placeholder='should return true for 18'
                  aria-invalid={Boolean(errors.description)}
                />

                {errors.description ? (
                  <FieldError>{errors.description}</FieldError>
                ) : (
                  <FieldDescription>
                    Write a clear expectation for this test case.
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.input)}>
                <FieldLabel htmlFor='input'>Input</FieldLabel>

                <AdminJsonEditor
                  value={input}
                  height='220px'
                  onChange={(value) => {
                    setInput(value);
                    setErrors((prev) => ({
                      ...prev,
                      input: undefined,
                    }));
                  }}
                  onError={(message) => {
                    setErrors((prev) => ({
                      ...prev,
                      input: message || undefined,
                    }));
                  }}
                />

                {errors.input ? (
                  <FieldError>{errors.input}</FieldError>
                ) : (
                  <FieldDescription>
                    JSON object. Example: {'{ "age": 18 }'}
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.expected)}>
                <FieldLabel htmlFor='expected'>Expected</FieldLabel>

                <AdminJsonEditor
                  value={expected}
                  height='220px'
                  onChange={(value) => {
                    setExpected(value);
                    setErrors((prev) => ({
                      ...prev,
                      expected: undefined,
                    }));
                  }}
                  onError={(message) => {
                    setErrors((prev) => ({
                      ...prev,
                      expected: message || undefined,
                    }));
                  }}
                />

                {errors.expected ? (
                  <FieldError>{errors.expected}</FieldError>
                ) : (
                  <FieldDescription>
                    JSON object. Example: {'{ "result": true }'}
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
                    Determines test case order inside the study case.
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
                      Published test cases are used by the grader.
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
              disabled={isMutating}
            >
              {isMutating && <Spinner />}
              {isMutating ? 'Saving...' : 'Save Test Case'}
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
        title='Delete Test Case'
        description={`Are you sure you want to delete ${
          selectedTestCase?.description ?? 'this test case'
        }? This action cannot be undone. If this test case already has related submissions, the backend may reject this action.`}
        isDeleting={isMutating}
        onConfirm={handleDeleteTestCase}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
