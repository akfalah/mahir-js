'use client';

import { FormEvent, useState } from 'react';

import {
  CheckCircle2,
  Edit,
  KeyRound,
  Plus,
  Trash2,
  UserRound,
} from 'lucide-react';

import { useAdminResource } from '@/hooks/use-admin-resource';

import { formatDate } from '@/lib/helpers/format-date';

import { Role, User } from '@/types';

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AdminContentPanel from '@/components/shared/AdminContentPanel';
import AdminDialog from '@/components/shared/AdminDialog';
import AdminDrawer from '@/components/shared/AdminDrawer';
import AdminPageHeader from '@/components/shared/AdminPageHeader';
import AdminPagination from '@/components/shared/AdminPagination';
import AdminStatusMessage from '@/components/shared/AdminStatusMessage';
import AdminToolbar from '@/components/shared/AdminToolbar';

type DrawerMode = 'create' | 'edit' | null;

type UserFormErrors = {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
};

type UserPayload = {
  name: string;
  email: string;
  role: Role;
  password?: string;
};

const DEFAULT_RESET_PASSWORD = 'password123';

function validateUserForm(
  {
    name,
    email,
    password,
    role,
  }: {
    name: string;
    email: string;
    password: string;
    role: Role;
  },
  drawerMode: DrawerMode,
) {
  const errors: UserFormErrors = {};

  if (name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters.';
  }

  if (!email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^\S+@\S+\.\S+$/.test(email)) {
    errors.email = 'Email format is invalid.';
  }

  if (drawerMode === 'create' && password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!role) {
    errors.role = 'Role is required.';
  }

  return errors;
}

export default function UserListClient() {
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
  } = useAdminResource<User>({
    endpoint: '/users',
    resourceName: 'User',
    initialParams: {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      orderBy: 'desc',
    },
  });

  const users = items;

  const orderBy = String(params.orderBy ?? 'desc');
  const limit = String(params.limit ?? 10);

  const [searchInput, setSearchInput] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('STUDENT');

  const [errors, setErrors] = useState<UserFormErrors>({});

  const getRowNumber = (index: number) => {
    return (pagination.page - 1) * pagination.limit + index + 1;
  };

  const resetForm = (user?: User | null) => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setPassword('');
    setRole(user?.role ?? 'STUDENT');
    setErrors({});
    setMessage(null);
  };

  const openCreateDrawer = () => {
    setDrawerMode('create');
    setSelectedUser(null);
    resetForm(null);
    setDrawerOpen(true);
  };

  const openEditDrawer = (user: User) => {
    setDrawerMode('edit');
    setSelectedUser(user);
    resetForm(user);
    setDrawerOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setErrors({});
    setMessage(null);
    setDeleteDialogOpen(true);
  };

  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setErrors({});
    setMessage(null);
    setResetPasswordDialogOpen(true);
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

  const handleSubmitUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrors({});
    setMessage(null);

    const nextErrors = validateUserForm(
      {
        name,
        email,
        password,
        role,
      },
      drawerMode,
    );

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const payload: UserPayload = {
      name: name.trim(),
      email: email.trim(),
      role,
    };

    if (drawerMode === 'create') {
      payload.password = password;
    }

    try {
      if (drawerMode === 'create') {
        await createItem(payload);
        setMessage('User created successfully.');
      }

      if (drawerMode === 'edit' && selectedUser) {
        await updateItem(selectedUser.id, payload);
        setMessage('User updated successfully.');
      }

      setDrawerOpen(false);
      setDrawerMode(null);
      setSelectedUser(null);
      resetForm(null);
    } catch {
      setMessage(
        drawerMode === 'create'
          ? 'Failed to create user.'
          : 'Failed to update user.',
      );
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      await deleteItem(selectedUser.id);

      setMessage('User deleted successfully.');
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch {
      setMessage('Failed to delete user. Please check related data.');
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      await updateItem(selectedUser.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        password: DEFAULT_RESET_PASSWORD,
      });

      setMessage(`Password for ${selectedUser.name} has been reset.`);
      setResetPasswordDialogOpen(false);
      setSelectedUser(null);
    } catch {
      setMessage('Failed to reset password.');
    }
  };

  const drawerTitle = drawerMode === 'create' ? 'Create User' : 'Edit User';

  return (
    <div className='flex flex-col gap-y-6'>
      <AdminContentPanel>
        <AdminPageHeader
          title='Users'
          description='Manage student and administrator accounts.'
          action={
            <Button
              type='button'
              className='w-fit gap-2'
              onClick={openCreateDrawer}
            >
              <Plus className='size-4' />
              Create User
            </Button>
          }
        />

        <AdminToolbar
          searchValue={searchInput}
          searchPlaceholder='Search users...'
          onSearchChange={setSearchInput}
          onSearchSubmit={handleSearch}
          onReset={handleReset}
          filters={
            <>
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
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
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
                      <div className='flex items-center gap-3'>
                        <Skeleton className='size-10 rounded-2xl' />

                        <div className='flex flex-col gap-y-2'>
                          <Skeleton className='h-5 w-40' />
                          <Skeleton className='h-4 w-56' />
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Skeleton className='h-6 w-20' />
                    </TableCell>

                    <TableCell className='hidden md:table-cell'>
                      <Skeleton className='h-5 w-24' />
                    </TableCell>

                    <TableCell>
                      <div className='flex justify-end gap-2'>
                        <Skeleton className='size-9 rounded-xl' />
                        <Skeleton className='size-9 rounded-xl' />
                        <Skeleton className='size-9 rounded-xl' />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : users.length > 0 ? (
                users.map((user, index) => (
                  <TableRow key={user.id}>
                    <TableCell className='text-sm text-muted-foreground'>
                      {getRowNumber(index)}
                    </TableCell>

                    <TableCell>
                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>{user.name}</p>

                        <p className='text-sm text-muted-foreground'>
                          {user.email}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>
                      {user.role === 'ADMIN' ? (
                        <Badge className='gap-1 rounded-full'>
                          <CheckCircle2 className='size-3' />
                          Admin
                        </Badge>
                      ) : (
                        <Badge
                          variant='secondary'
                          className='rounded-full'
                        >
                          Student
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className='hidden text-sm text-muted-foreground md:table-cell'>
                      {formatDate(user.createdAt)}
                    </TableCell>

                    <TableCell>
                      <div className='flex justify-end gap-2'>
                        <Button
                          type='button'
                          variant='secondary'
                          size='icon'
                          onClick={() => openEditDrawer(user)}
                        >
                          <Edit className='size-4' />
                        </Button>

                        <Button
                          type='button'
                          variant='outline'
                          size='icon'
                          onClick={() => openResetPasswordDialog(user)}
                        >
                          <KeyRound className='size-4' />
                        </Button>

                        <Button
                          type='button'
                          variant='destructive'
                          size='icon'
                          onClick={() => openDeleteDialog(user)}
                        >
                          <Trash2 className='size-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className='flex flex-col items-center gap-y-3 px-4 py-12 text-center'>
                      <div className='flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                        <UserRound className='size-6' />
                      </div>

                      <div className='flex flex-col gap-y-1'>
                        <p className='font-semibold'>No users found</p>

                        <p className='text-sm text-muted-foreground'>
                          Create a new user or adjust your search.
                        </p>
                      </div>

                      <Button
                        type='button'
                        className='gap-2'
                        onClick={openCreateDrawer}
                      >
                        <Plus className='size-4' />
                        Create User
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
          label='users'
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
        description='Fill in the account information for this user.'
        onOpenChange={setDrawerOpen}
      >
        <form
          onSubmit={handleSubmitUser}
          className='flex min-h-0 flex-1 flex-col'
        >
          <div className='flex flex-1 flex-col gap-y-5 overflow-y-auto p-5 md:p-6'>
            <FieldGroup>
              <Field data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor='name'>Name</FieldLabel>

                <Input
                  id='name'
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      name: undefined,
                    }));
                  }}
                  placeholder='Student name'
                  aria-invalid={Boolean(errors.name)}
                />

                {errors.name ? (
                  <FieldError>{errors.name}</FieldError>
                ) : (
                  <FieldDescription>
                    Use at least 3 characters.
                  </FieldDescription>
                )}
              </Field>

              <Field data-invalid={Boolean(errors.email)}>
                <FieldLabel htmlFor='email'>Email</FieldLabel>

                <Input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }));
                  }}
                  placeholder='student@example.com'
                  aria-invalid={Boolean(errors.email)}
                />

                {errors.email ? (
                  <FieldError>{errors.email}</FieldError>
                ) : (
                  <FieldDescription>
                    This email will be used for sign in.
                  </FieldDescription>
                )}
              </Field>

              {drawerMode === 'create' && (
                <Field data-invalid={Boolean(errors.password)}>
                  <FieldLabel htmlFor='password'>Password</FieldLabel>

                  <Input
                    id='password'
                    type='password'
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setErrors((prev) => ({
                        ...prev,
                        password: undefined,
                      }));
                    }}
                    placeholder='••••••••'
                    aria-invalid={Boolean(errors.password)}
                  />

                  {errors.password ? (
                    <FieldError>{errors.password}</FieldError>
                  ) : (
                    <FieldDescription>
                      Password is required when creating a new user.
                    </FieldDescription>
                  )}
                </Field>
              )}

              <Field data-invalid={Boolean(errors.role)}>
                <FieldLabel>Role</FieldLabel>

                <Select
                  value={role}
                  onValueChange={(value) => {
                    setRole(value as Role);
                    setErrors((prev) => ({
                      ...prev,
                      role: undefined,
                    }));
                  }}
                >
                  <SelectTrigger aria-invalid={Boolean(errors.role)}>
                    <SelectValue placeholder='Choose role' />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value='STUDENT'>Student</SelectItem>
                    <SelectItem value='ADMIN'>Admin</SelectItem>
                  </SelectContent>
                </Select>

                {errors.role ? (
                  <FieldError>{errors.role}</FieldError>
                ) : (
                  <FieldDescription>
                    Choose whether this user is a student or administrator.
                  </FieldDescription>
                )}
              </Field>
            </FieldGroup>
          </div>

          <DrawerFooter className='shrink-0 border-t bg-background'>
            <Button
              type='submit'
              disabled={isMutating}
            >
              {isMutating && <Spinner />}
              {isMutating ? 'Saving...' : 'Save User'}
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
        open={resetPasswordDialogOpen}
        title='Reset user password'
        description={`Are you sure you want to reset ${
          selectedUser?.name ? `${selectedUser.name}'s` : 'this user'
        } password to "${DEFAULT_RESET_PASSWORD}"?`}
        isDeleting={isMutating}
        confirmLabel='Reset Password'
        loadingLabel='Resetting...'
        confirmVariant='default'
        onConfirm={handleResetPassword}
        onOpenChange={setResetPasswordDialogOpen}
      />

      <AdminDialog
        open={deleteDialogOpen}
        title='Confirm whether this user should be deleted.'
        description={`Are you sure you want to delete ${
          selectedUser?.name ? `${selectedUser.name}` : 'this user'
        }? This action cannot be undone. If this user already has submissions or progress data, the backend may reject this action.`}
        isDeleting={isMutating}
        onConfirm={handleDeleteUser}
        onOpenChange={setDeleteDialogOpen}
      />
    </div>
  );
}
