'use client';

import { FormEvent, useState } from 'react';

import {
  CheckCircle2,
  Edit,
  Layers3,
  Plus,
  Trash2,
  XCircle,
} from 'lucide-react';

import { Concept } from '@/types';

import { useAdminResource } from '@/hooks/use-admin-resource';

import { formatDate } from '@/lib/helpers/date-formatter';
import { generateSlug } from '@/lib/helpers/generate-slug';
import { conceptSchema } from '@/lib/validations/concept';
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
import AdminToolbar from '@/components/shared/AdminToolbar';

type DrawerMode = 'create' | 'edit' | null;

type ConceptFormErrors = {
  title?: string;
  slug?: string;
  description?: string;
  order?: string;
  isPublished?: string;
};

export default function ConceptListClient() {
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
  } = useAdminResource<Concept>({
    endpoint: '/concepts',
    resourceName: 'Concept',
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      orderBy: 'desc',
    },
  });

  const concepts = items;

  const sortBy = String(params.sortBy ?? 'createdAt');
  const orderBy = String(params.orderBy ?? 'desc');
  const limit = String(params.limit ?? 10);

  const publishedFilter =
    params.isPublished === undefined ? 'all' : String(params.isPublished);

  const [searchInput, setSearchInput] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<Concept | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('1');
  const [isPublished, setIsPublished] = useState(true);

  const [errors, setErrors] = useState<ConceptFormErrors>({});

  const getRowNumber = (index: number) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  const resetForm = (concept?: Concept | null) => {
    setTitle(concept?.title ?? '');
    setSlug(concept?.slug ?? '');
    setDescription(concept?.description ?? '');
    setOrder(String(concept?.order ?? 1));
    setIsPublished(concept?.isPublished ?? true);
    setErrors({});
    setMessage(null);
  };

  const openCreateDrawer = () => {
    setDrawerMode('create');
    setSelectedConcept(null);
    resetForm(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (concept: Concept) => {
    setDrawerMode('edit');
    setSelectedConcept(concept);
    resetForm(concept);
    setDrawerOpen(true);
  };

  const openDeleteDialog = (concept: Concept) => {
    setSelectedConcept(concept);
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

  const handlePublishedFilterChange = (value: string) => {
    updateParams({
      isPublished: value === 'all' ? undefined : value === 'true',
    });
  };

  const handleSubmitConcept = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});
    setMessage(null);

    const validationResult = conceptSchema.safeParse({
      title,
      slug,
      description,
      order,
      isPublished,
    });

    if (!validationResult.success) {
      const fieldErrors = getFieldErrors(validationResult.error);

      setErrors({
        title: fieldErrors.title,
        slug: fieldErrors.slug,
        description: fieldErrors.description,
        order: fieldErrors.order,
        isPublished: fieldErrors.isPublished,
      });

      return;
    }

    try {
      const payload = validationResult.data;

      if (drawerMode === 'create') {
        await createItem(payload);
        setMessage('Concept created successfully.');
      }

      if (drawerMode === 'edit' && selectedConcept) {
        await updateItem(selectedConcept.id, payload);
        setMessage('Concept updated successfully.');
      }

      setDrawerOpen(false);
      setDrawerMode(null);
      setSelectedConcept(null);
      resetForm(null);
    } catch {
      setMessage(
        drawerMode === 'create'
          ? 'Failed to create concept.'
          : 'Failed to update concept.',
      );
    }
  };

  const handleDeleteConcept = async () => {
    if (!selectedConcept) {
      return;
    }

    try {
      await deleteItem(selectedConcept.id);

      setMessage('Concept deleted successfully.');
      setDeleteDialogOpen(false);
      setSelectedConcept(null);
    } catch {
      setMessage('Failed to delete concept. Please check related materials.');
    }
  };

  const drawerTitle =
    drawerMode === 'create' ? 'Create Concept' : 'Edit Concept';

  return (
    <div className='flex flex-col gap-y-6'>
      <AdminContentPanel>
        <AdminPageHeader
          title='Concepts'
          description='Manage the main JavaScript learning concepts shown to students.'
          action={
            <Button
              type='button'
              className='w-fit gap-2'
              onClick={openCreateDrawer}
            >
              <Plus className='size-4' />
              Create Concept
            </Button>
          }
        />

        <AdminToolbar
          searchValue={searchInput}
          searchPlaceholder='Search concepts...'
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearch}
          onReset={handleReset}
          filters={
            <>
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
                onValueChange={(value) =>
                  updateParams({
                    sortBy: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value='order'>Order</SelectItem>
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

        <div className='px-4 overflow-x-auto'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-16'>No.</TableHead>
                <TableHead className='w-20'>Order</TableHead>
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
              ) : concepts.length > 0 ? (
                concepts.map((concept, index) => (
                  <TableRow key={concept.id}>
                    <TableCell className='text-sm text-muted-foreground'>
                      {getRowNumber(index)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant='outline'
                        className='rounded-full'
                      >
                        #{concept.order}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>{concept.title}</p>

                        <p className='line-clamp-2 max-w-xl text-sm leading-relaxed text-muted-foreground'>
                          {concept.description}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {concept.isPublished ? (
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
                        {concept.slug}
                      </code>
                    </TableCell>

                    <TableCell className='hidden text-sm text-muted-foreground md:table-cell'>
                      {formatDate(concept.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className='flex justify-end gap-2'>
                        <Button
                          type='button'
                          variant='secondary'
                          size='icon'
                          onClick={() => openEditDrawer(concept)}
                        >
                          <Edit className='size-4' />
                        </Button>

                        <Button
                          type='button'
                          variant='destructive'
                          size='icon'
                          onClick={() => openDeleteDialog(concept)}
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
                        <Layers3 className='size-6' />
                      </div>

                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>No concepts found</p>

                        <p className='text-sm text-muted-foreground'>
                          Create a new concept or adjust your search and filter.
                        </p>
                      </div>

                      <Button
                        type='button'
                        className='gap-2'
                        onClick={openCreateDrawer}
                      >
                        <Plus className='size-4' />
                        Create Concept
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
          label='concepts'
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
        description='Fill in the concept information for the learning path.'
        onOpenChange={setDrawerOpen}
      >
        <form
          onSubmit={handleSubmitConcept}
          className='flex min-h-0 flex-1 flex-col'
        >
          <div className='flex flex-1 flex-col gap-y-5 overflow-y-auto p-5 md:p-6'>
            <FieldGroup>
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
                  placeholder='Conditional Statement'
                  aria-invalid={Boolean(errors.title)}
                />

                {errors.title ? (
                  <FieldError>{errors.title}</FieldError>
                ) : (
                  <FieldDescription>
                    Use a clear learning concept name.
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
                  placeholder='conditional-statement'
                  aria-invalid={Boolean(errors.slug)}
                />

                {errors.slug ? (
                  <FieldError>{errors.slug}</FieldError>
                ) : (
                  <FieldDescription>
                    Used for public concept URL.
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
                    Determines the display order.
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
              {isMutating ? 'Saving...' : 'Save Concept'}
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
        title='Confirm whether this concept should be deleted.'
        description={`Are you sure you want to delete ${
          selectedConcept?.title
            ? `${selectedConcept.title} Concept`
            : 'this concept'
        }? This action can not be undone. If this concept already has related materials, the backend may reject this action.`}
        isDeleting={isMutating}
        onConfirm={handleDeleteConcept}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
