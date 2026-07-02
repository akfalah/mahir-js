'use client';

import { FormEvent, useEffect, useState } from 'react';

import {
  BookOpen,
  CheckCircle2,
  Edit,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';

import api from '@/lib/api';

import { Concept, Material, ApiResponse } from '@/types';

import { useAdminResource } from '@/hooks/use-admin-resource';

import { formatDate } from '@/lib/helpers/date-formatter';
import { generateSlug } from '@/lib/helpers/generate-slug';
import { materialSchema } from '@/lib/validations/material';
import { getFieldErrors } from '@/lib/validations/get-field-errors';

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
import AdminPageHeader from '@/components/shared/AdminPageHeader';
import AdminPagination from '@/components/shared/AdminPagination';
import AdminStatusMessage from '@/components/shared/AdminStatusMessage';
import AdminTextEditor from '@/components/shared/AdminTextEditor';
import AdminToolbar from '@/components/shared/AdminToolbar';

type DrawerMode = 'create' | 'edit' | null;

type MaterialFormErrors = {
  conceptId?: string;
  title?: string;
  slug?: string;
  description?: string;
  content?: string;
  order?: string;
  isPublished?: string;
};

export default function MaterialListClient() {
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
  } = useAdminResource<Material>({
    endpoint: '/materials',
    resourceName: 'Material',
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      orderBy: 'desc',
    },
  });

  const materials = items;

  const sortBy = String(params.sortBy ?? 'createdAt');
  const orderBy = String(params.orderBy ?? 'desc');
  const limit = String(params.limit ?? 10);
  const conceptIdFilter = params.conceptId ? String(params.conceptId) : 'all';

  const publishedFilter =
    params.isPublished === undefined ? 'all' : String(params.isPublished);

  const [concepts, setConcepts] = useState<Concept[]>([]);
  const [searchInput, setSearchInput] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null,
  );

  const [conceptId, setConceptId] = useState('');
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState('1');
  const [isPublished, setIsPublished] = useState(true);

  const [errors, setErrors] = useState<MaterialFormErrors>({});

  useEffect(() => {
    let isActive = true;

    const loadConcepts = async () => {
      try {
        const res = await api.get<ApiResponse<Concept[]>>('/concepts');

        if (!isActive) {
          return;
        }

        setConcepts(res.data.data);
      } catch {
        if (!isActive) {
          return;
        }

        setConcepts([]);
      }
    };

    loadConcepts();

    return () => {
      isActive = false;
    };
  }, []);

  const getRowNumber = (index: number) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  const resetForm = (material?: Material | null) => {
    setConceptId(
      material?.conceptId
        ? String(material.conceptId)
        : conceptIdFilter !== 'all'
          ? conceptIdFilter
          : '',
    );
    setTitle(material?.title ?? '');
    setSlug(material?.slug ?? '');
    setDescription(material?.description ?? '');
    setContent(material?.content ?? '');
    setOrder(String(material?.order ?? 1));
    setIsPublished(material?.isPublished ?? true);
    setErrors({});
    setMessage(null);
  };

  const openCreateDrawer = () => {
    setDrawerMode('create');
    setSelectedMaterial(null);
    resetForm(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (material: Material) => {
    setDrawerMode('edit');
    setSelectedMaterial(material);
    resetForm(material);
    setDrawerOpen(true);
  };

  const openDeleteDialog = (material: Material) => {
    setSelectedMaterial(material);
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

  const handleConceptFilterChange = (value: string) => {
    if (value === 'all') {
      updateParams({
        conceptId: undefined,
        sortBy: sortBy === 'order' ? 'createdAt' : sortBy,
        orderBy: sortBy === 'order' ? 'desc' : orderBy,
      });

      return;
    }

    updateParams({
      conceptId: Number(value),
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

  const handleSubmitMaterial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});
    setMessage(null);

    const validationResult = materialSchema.safeParse({
      conceptId,
      title,
      slug,
      description,
      content,
      order,
      isPublished,
    });

    if (!validationResult.success) {
      const fieldErrors = getFieldErrors(validationResult.error);

      setErrors({
        conceptId: fieldErrors.conceptId,
        title: fieldErrors.title,
        slug: fieldErrors.slug,
        description: fieldErrors.description,
        content: fieldErrors.content,
        order: fieldErrors.order,
        isPublished: fieldErrors.isPublished,
      });

      return;
    }

    try {
      const values = validationResult.data;

      if (drawerMode === 'create') {
        await createItem(values);
        setMessage('Material created successfully.');
      }

      if (drawerMode === 'edit' && selectedMaterial) {
        const payload = {
          title: values.title,
          slug: values.slug,
          description: values.description,
          content: values.content,
          order: values.order,
        };

        await updateItem(selectedMaterial.id, payload);
        setMessage('Material updated successfully.');
      }

      setDrawerOpen(false);
      setDrawerMode(null);
      setSelectedMaterial(null);
      resetForm(null);
    } catch {
      setMessage(
        drawerMode === 'create'
          ? 'Failed to create material.'
          : 'Failed to update material.',
      );
    }
  };

  const handleDeleteMaterial = async () => {
    if (!selectedMaterial) {
      return;
    }

    try {
      await deleteItem(selectedMaterial.id);

      setMessage('Material deleted successfully.');
      setDeleteDialogOpen(false);
      setSelectedMaterial(null);
    } catch {
      setMessage(
        'Failed to delete material. Please check related study cases.',
      );
    }
  };

  const drawerTitle =
    drawerMode === 'create' ? 'Create Material' : 'Edit Material';

  return (
    <div className='flex flex-col gap-y-6'>
      <AdminContentPanel>
        <AdminPageHeader
          title='Materials'
          description='Manage learning materials connected to each JavaScript concept.'
          action={
            <Button
              type='button'
              className='w-fit gap-2'
              onClick={openCreateDrawer}
            >
              <Plus className='size-4' />
              Create Material
            </Button>
          }
        />

        <AdminToolbar
          searchValue={searchInput}
          searchPlaceholder='Search materials...'
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearch}
          onReset={handleReset}
          filters={
            <>
              <Select
                value={conceptIdFilter}
                onValueChange={handleConceptFilterChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Concept' />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='all'>All Concepts</SelectItem>

                  {concepts.map((concept) => (
                    <SelectItem
                      key={concept.id}
                      value={String(concept.id)}
                    >
                      {concept.title}
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
                  {conceptIdFilter !== 'all' && (
                    <SelectItem value='order'>Order</SelectItem>
                  )}

                  <SelectItem value='title'>Title</SelectItem>
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
                <TableHead>Material</TableHead>
                <TableHead>Concept</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className='hidden md:table-cell'>Created</TableHead>
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
                        <Skeleton className='h-5 w-40' />
                        <Skeleton className='h-4 w-64' />
                      </div>
                    </TableCell>

                    <TableCell>
                      <Skeleton className='h-5 w-32' />
                    </TableCell>

                    <TableCell>
                      <Skeleton className='h-6 w-20' />
                    </TableCell>

                    <TableCell>
                      <Skeleton className='h-5 w-32' />
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
              ) : materials.length > 0 ? (
                materials.map((material, index) => (
                  <TableRow key={material.id}>
                    <TableCell className='text-sm text-muted-foreground'>
                      {getRowNumber(index)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant='outline'
                        className='rounded-full'
                      >
                        #{material.order}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>{material.title}</p>

                        <p className='line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground'>
                          {material.description}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      <p className='truncate font-semibold'>
                        {material.concept?.title ??
                          `Material #${material.conceptId}`}
                      </p>
                    </TableCell>

                    <TableCell>
                      {material.isPublished ? (
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

                    <TableCell>
                      <code className='rounded-lg bg-muted px-2 py-1 text-xs'>
                        {material.slug}
                      </code>
                    </TableCell>

                    <TableCell className='hidden text-sm text-muted-foreground md:table-cell'>
                      {formatDate(material.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className='flex justify-end gap-2'>
                        <Button
                          type='button'
                          variant='secondary'
                          size='icon'
                          onClick={() => openEditDrawer(material)}
                        >
                          <Edit className='size-4' />
                        </Button>

                        <Button
                          type='button'
                          variant='destructive'
                          size='icon'
                          onClick={() => openDeleteDialog(material)}
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
                        <BookOpen className='size-6' />
                      </div>

                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>No materials found</p>

                        <p className='text-sm text-muted-foreground'>
                          Create a new material or adjust your search and
                          filter.
                        </p>
                      </div>

                      <Button
                        type='button'
                        className='gap-2'
                        onClick={openCreateDrawer}
                      >
                        <Plus className='size-4' />
                        Create Material
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
          label='materials'
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
        description='Fill in the material information for the selected concept.'
        onOpenChange={setDrawerOpen}
      >
        <form
          onSubmit={handleSubmitMaterial}
          className='flex min-h-0 flex-1 flex-col'
        >
          <div className='flex flex-1 flex-col gap-y-5 overflow-y-auto p-5 md:p-6'>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.conceptId)}>
                <FieldLabel>Concept</FieldLabel>

                <Select
                  value={conceptId || undefined}
                  disabled={drawerMode === 'edit'}
                  onValueChange={(value) => {
                    setConceptId(value);
                    setErrors((prev) => ({
                      ...prev,
                      conceptId: undefined,
                    }));
                  }}
                >
                  <SelectTrigger aria-invalid={Boolean(errors.conceptId)}>
                    <SelectValue placeholder='Choose concept' />
                  </SelectTrigger>

                  <SelectContent>
                    {concepts.map((concept) => (
                      <SelectItem
                        key={concept.id}
                        value={String(concept.id)}
                      >
                        {concept.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {errors.conceptId ? (
                  <FieldError>{errors.conceptId}</FieldError>
                ) : (
                  <FieldDescription>
                    {drawerMode === 'edit'
                      ? 'Concept cannot be changed after material is created.'
                      : 'Choose the concept for this material.'}
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
                  placeholder='If Else Basics'
                  aria-invalid={Boolean(errors.title)}
                />

                {errors.title ? (
                  <FieldError>{errors.title}</FieldError>
                ) : (
                  <FieldDescription>
                    Use a clear learning material title.
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
                  placeholder='if-else-basics'
                  aria-invalid={Boolean(errors.slug)}
                />

                {errors.slug ? (
                  <FieldError>{errors.slug}</FieldError>
                ) : (
                  <FieldDescription>
                    Used for public material URL.
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
                  placeholder='Describe what students will learn.'
                  aria-invalid={Boolean(errors.description)}
                />

                {errors.description ? (
                  <FieldError>{errors.description}</FieldError>
                ) : (
                  <FieldDescription>
                    Write a short explanation for students.
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.content)}>
                <FieldLabel>Content</FieldLabel>

                <AdminTextEditor
                  value={content}
                  placeholder='Write the learning material content here...'
                  onChange={(value) => {
                    setContent(value);
                    setErrors((prev) => ({
                      ...prev,
                      content: undefined,
                    }));
                  }}
                />

                {errors.content ? (
                  <FieldError>{errors.content}</FieldError>
                ) : (
                  <FieldDescription>
                    Write formatted learning content for students.
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
                    Determines the display order inside the selected concept.
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
              disabled={isMutating}
            >
              {isMutating && <Spinner />}
              {isMutating ? 'Saving...' : 'Save Material'}
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
        title='Confirm whether this material should be deleted.'
        description={`Are you sure you want to delete ${
          selectedMaterial?.title
            ? `${selectedMaterial.title} Moncept`
            : 'this material'
        }? This action cannot be undone. If this material already has related study cases, the backend may reject this action.`}
        isDeleting={isMutating}
        onConfirm={handleDeleteMaterial}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
