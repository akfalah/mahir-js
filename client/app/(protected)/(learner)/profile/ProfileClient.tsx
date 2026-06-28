'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import z from 'zod';

import { LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-react';

import { ApiResponse, User } from '@/types';

import api from '@/lib/api';
import {
  updatePasswordSchema,
  updateProfileSchema,
} from '@/lib/validations/profile';

import { useAuthStore } from '@/stores/auth.store';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';

type ProfileFormErrors = {
  name?: string;
  bio?: string;
  imageUrl?: string;
};

type PasswordFormErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmNewPassword?: string;
};

function getFieldErrors(error: z.ZodError) {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];

    if (typeof field === 'string') {
      errors[field] = issue.message;
    }
  }

  return errors;
}

function getInitials(name?: string) {
  if (!name) {
    return 'U';
  }

  return name
    .split(' ')
    .map((item) => item[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-';
  }

  return new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function ProfileSkeleton() {
  return (
    <div className='container mx-auto flex flex-col gap-y-8 px-4 py-10 md:py-12'>
      <Skeleton className='h-56 rounded-3xl' />

      <div className='grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5'>
        <Skeleton className='h-96 rounded-3xl' />
        <Skeleton className='h-96 rounded-3xl' />
      </div>
    </div>
  );
}

function getMessageClassName(type: 'success' | 'error') {
  return type === 'success'
    ? 'rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-300'
    : 'rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive';
}

export default function ProfileClient() {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setUser = useAuthStore((state) => state.setUser);

  const [profile, setProfile] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [profileErrors, setProfileErrors] = useState<ProfileFormErrors>({});
  const [passwordErrors, setPasswordErrors] = useState<PasswordFormErrors>({});

  const [profileStatus, setProfileStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const [profileMessage, setProfileMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const [passwordMessage, setPasswordMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    let isActive = true;

    const fetchProfile = async () => {
      if (!hasHydrated || !token) {
        return;
      }

      setProfileStatus('loading');

      try {
        const res = await api.get<ApiResponse<User>>('/auth/profile');
        const nextProfile = res.data.data;

        if (!isActive) {
          return;
        }

        setProfile(nextProfile);
        setUser(nextProfile);

        setName(nextProfile.name);
        setBio(nextProfile.bio ?? '');
        setImageUrl(nextProfile.imageUrl ?? '');

        setProfileStatus('ready');
      } catch {
        if (!isActive) {
          return;
        }

        setProfile(null);
        setProfileStatus('error');
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, [hasHydrated, token, setUser]);

  const handleUpdateProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setProfileMessage(null);
    setProfileErrors({});

    const validationResult = updateProfileSchema.safeParse({
      name,
      bio,
      imageUrl,
    });

    if (!validationResult.success) {
      const errors = getFieldErrors(validationResult.error);

      setProfileErrors({
        name: errors.name,
        bio: errors.bio,
        imageUrl: errors.imageUrl,
      });

      return;
    }

    setIsUpdatingProfile(true);

    try {
      const values = validationResult.data;

      const res = await api.patch<ApiResponse<User>>('/auth/profile', {
        name: values.name,
        bio: values.bio || undefined,
        imageUrl: values.imageUrl || null,
      });

      const updatedProfile = res.data.data;

      setProfile(updatedProfile);
      setUser(updatedProfile);

      setName(updatedProfile.name);
      setBio(updatedProfile.bio ?? '');
      setImageUrl(updatedProfile.imageUrl ?? '');

      setProfileMessage({
        type: 'success',
        text: 'Profile updated successfully.',
      });
    } catch {
      setProfileMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setPasswordMessage(null);
    setPasswordErrors({});

    const validationResult = updatePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    if (!validationResult.success) {
      const errors = getFieldErrors(validationResult.error);

      setPasswordErrors({
        currentPassword: errors.currentPassword,
        newPassword: errors.newPassword,
        confirmNewPassword: errors.confirmNewPassword,
      });

      return;
    }

    setIsUpdatingPassword(true);

    try {
      const values = validationResult.data;

      await api.patch('/auth/profile/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setPasswordErrors({});
      setPasswordMessage({
        type: 'success',
        text: 'Password updated successfully.',
      });
    } catch {
      setPasswordMessage({
        type: 'error',
        text: 'Failed to update password. Please check your current password.',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (!hasHydrated || profileStatus === 'idle' || profileStatus === 'loading') {
    return <ProfileSkeleton />;
  }

  if (!token || !profile || profileStatus === 'error') {
    return (
      <div className='container mx-auto flex flex-col items-center gap-y-5 px-4 py-16 md:py-20 text-center'>
        <div className='flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
          <UserRound className='size-7' />
        </div>

        <div className='flex max-w-xl flex-col gap-y-3'>
          <h1 className='text-3xl md:text-5xl font-bold tracking-tight'>
            Profile could not be loaded.
          </h1>

          <p className='text-muted-foreground'>
            Please sign in again or check your connection.
          </p>
        </div>

        <Button asChild>
          <Link href='/sign-in'>Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='container mx-auto flex flex-col gap-y-8 px-4 py-10 md:py-12'>
      <section className='rounded-3xl border bg-card p-6 md:p-8 shadow-sm'>
        <div className='flex flex-col gap-5 sm:flex-row sm:items-center'>
          <Avatar className='size-24 border'>
            <AvatarImage
              src={profile.imageUrl}
              alt={profile.name}
            />

            <AvatarFallback className='text-2xl font-bold'>
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>

          <div className='flex flex-col gap-y-3'>
            <div className='flex flex-col gap-y-1'>
              <h1 className='text-3xl md:text-4xl font-bold tracking-tight'>
                {profile.name}
              </h1>

              <div className='flex items-center gap-2 text-muted-foreground'>
                <Mail className='size-4' />
                <p className='text-sm'>{profile.email}</p>
              </div>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Badge className='gap-1 rounded-full'>
                <ShieldCheck className='size-3' />
                {profile.role}
              </Badge>

              <Badge
                variant='secondary'
                className='rounded-full'
              >
                Joined {formatDate(profile.createdAt)}
              </Badge>
            </div>

            {profile.bio && (
              <p className='max-w-2xl text-sm leading-relaxed text-muted-foreground'>
                {profile.bio}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className='grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-5'>
        <Card className='h-fit rounded-3xl shadow-sm'>
          <CardHeader className='p-5 md:p-6'>
            <div className='flex items-start gap-4'>
              <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <UserRound className='size-5' />
              </div>

              <div className='flex flex-col gap-y-1'>
                <h2 className='text-xl font-bold tracking-tight'>
                  Edit Profile
                </h2>

                <p className='text-sm text-muted-foreground'>
                  Update your name, image, and short bio.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className='px-5 md:px-6 pb-5 md:pb-6'>
            <form
              onSubmit={handleUpdateProfile}
              className='flex flex-col gap-y-5'
            >
              <FieldGroup>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <Field data-invalid={Boolean(profileErrors.name)}>
                    <FieldLabel htmlFor='name'>Name</FieldLabel>

                    <Input
                      id='name'
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);
                        setProfileErrors((prev) => ({
                          ...prev,
                          name: undefined,
                        }));
                      }}
                      aria-invalid={Boolean(profileErrors.name)}
                    />

                    {profileErrors.name ? (
                      <FieldError>{profileErrors.name}</FieldError>
                    ) : (
                      <FieldDescription>
                        Use at least 3 characters.
                      </FieldDescription>
                    )}
                  </Field>

                  <Field data-invalid={Boolean(profileErrors.imageUrl)}>
                    <FieldLabel htmlFor='imageUrl'>Image URL</FieldLabel>

                    <Input
                      id='imageUrl'
                      value={imageUrl}
                      onChange={(event) => {
                        setImageUrl(event.target.value);
                        setProfileErrors((prev) => ({
                          ...prev,
                          imageUrl: undefined,
                        }));
                      }}
                      placeholder='https://example.com/avatar.png'
                      aria-invalid={Boolean(profileErrors.imageUrl)}
                    />

                    {profileErrors.imageUrl ? (
                      <FieldError>{profileErrors.imageUrl}</FieldError>
                    ) : (
                      <FieldDescription>
                        Use a direct image URL for your avatar.
                      </FieldDescription>
                    )}
                  </Field>
                </div>

                <Field data-invalid={Boolean(profileErrors.bio)}>
                  <FieldLabel htmlFor='bio'>Bio</FieldLabel>

                  <Textarea
                    id='bio'
                    value={bio}
                    onChange={(event) => {
                      setBio(event.target.value);
                      setProfileErrors((prev) => ({
                        ...prev,
                        bio: undefined,
                      }));
                    }}
                    placeholder='Tell us about yourself'
                    aria-invalid={Boolean(profileErrors.bio)}
                  />

                  <div className='flex items-center justify-between gap-4'>
                    {profileErrors.bio ? (
                      <FieldError>{profileErrors.bio}</FieldError>
                    ) : (
                      <FieldDescription>
                        Optional short description.
                      </FieldDescription>
                    )}

                    <p className='text-xs text-muted-foreground'>
                      {bio.length}/300
                    </p>
                  </div>
                </Field>
              </FieldGroup>

              {profileMessage && (
                <p className={getMessageClassName(profileMessage.type)}>
                  {profileMessage.text}
                </p>
              )}

              <div className='flex justify-end'>
                <Button
                  type='submit'
                  disabled={isUpdatingProfile}
                >
                  {isUpdatingProfile ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className='rounded-3xl shadow-sm'>
          <CardHeader className='p-5 md:p-6'>
            <div className='flex items-start gap-4'>
              <div className='flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <LockKeyhole className='size-5' />
              </div>

              <div className='flex flex-col gap-y-1'>
                <h2 className='text-xl font-bold tracking-tight'>
                  Change Password
                </h2>

                <p className='text-sm text-muted-foreground'>
                  Enter your current password and choose a new one.
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className='px-5 md:px-6 pb-5 md:pb-6'>
            <form
              onSubmit={handleUpdatePassword}
              className='flex flex-col gap-y-5'
            >
              <FieldGroup>
                <Field data-invalid={Boolean(passwordErrors.currentPassword)}>
                  <FieldLabel htmlFor='currentPassword'>
                    Current Password
                  </FieldLabel>

                  <Input
                    id='currentPassword'
                    type='password'
                    value={currentPassword}
                    onChange={(event) => {
                      setCurrentPassword(event.target.value);
                      setPasswordErrors((prev) => ({
                        ...prev,
                        currentPassword: undefined,
                      }));
                    }}
                    aria-invalid={Boolean(passwordErrors.currentPassword)}
                  />

                  {passwordErrors.currentPassword ? (
                    <FieldError>{passwordErrors.currentPassword}</FieldError>
                  ) : (
                    <FieldDescription>
                      Enter your current account password.
                    </FieldDescription>
                  )}
                </Field>

                <Field data-invalid={Boolean(passwordErrors.newPassword)}>
                  <FieldLabel htmlFor='newPassword'>New Password</FieldLabel>

                  <Input
                    id='newPassword'
                    type='password'
                    value={newPassword}
                    onChange={(event) => {
                      setNewPassword(event.target.value);
                      setPasswordErrors((prev) => ({
                        ...prev,
                        newPassword: undefined,
                      }));
                    }}
                    aria-invalid={Boolean(passwordErrors.newPassword)}
                  />

                  {passwordErrors.newPassword ? (
                    <FieldError>{passwordErrors.newPassword}</FieldError>
                  ) : (
                    <FieldDescription>
                      Use at least 8 characters.
                    </FieldDescription>
                  )}
                </Field>

                <Field
                  data-invalid={Boolean(passwordErrors.confirmNewPassword)}
                >
                  <FieldLabel htmlFor='confirmNewPassword'>
                    Confirm New Password
                  </FieldLabel>

                  <Input
                    id='confirmNewPassword'
                    type='password'
                    value={confirmNewPassword}
                    onChange={(event) => {
                      setConfirmNewPassword(event.target.value);
                      setPasswordErrors((prev) => ({
                        ...prev,
                        confirmNewPassword: undefined,
                      }));
                    }}
                    aria-invalid={Boolean(passwordErrors.confirmNewPassword)}
                  />

                  {passwordErrors.confirmNewPassword ? (
                    <FieldError>{passwordErrors.confirmNewPassword}</FieldError>
                  ) : (
                    <FieldDescription>
                      Repeat your new password.
                    </FieldDescription>
                  )}
                </Field>
              </FieldGroup>

              {passwordMessage && (
                <p className={getMessageClassName(passwordMessage.type)}>
                  {passwordMessage.text}
                </p>
              )}

              <div className='flex justify-end'>
                <Button
                  type='submit'
                  disabled={isUpdatingPassword}
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
