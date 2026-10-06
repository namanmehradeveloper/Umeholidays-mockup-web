'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  Copy,
  Download,
  Lock,
  Mail,
  Phone,
  Plus,
  ShieldCheck,
  User,
  Users as UsersIcon,
  X,
} from 'lucide-react';

import { api, downloadAdminCsv, getAdminUser } from '../../lib/admin-api';
import InputIcon from './InputIcon';

import {
  FilterMenu,
  matchesQuery,
  RefreshButton,
  RowActions,
  SearchField,
} from './TableControls';

type Role = 'user' | 'organizer' | 'admin';

type AdminUser = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  isActive?: boolean;
  avatar?: string;
  createdAt?: string;
};

type CreateForm = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
};

type EditForm = {
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  avatar: string;
};

type Toast = {
  id: number;
  type: 'success' | 'error';
  message: string;
};

const ROLES: Role[] = [
  'user',
  'organizer',
  'admin',
];

const CREATE_ICONS = {
  name: User,
  email: Mail,
  password: Lock,
  phone: Phone,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const URL_RE = /^https?:\/\/.+/i;

const emptyCreate: CreateForm = {
  name: '',
  email: '',
  password: '',
  phone: '',
  role: 'user',
};

function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'Request failed';
}

function currentAdminId() {
  const user = getAdminUser();
  return String(user?._id || user?.id || '');
}

function recordId(user: AdminUser) {
  return String(
    user._id ||
      user.id ||
      '',
  );
}

function isSelf(
  user: AdminUser,
  adminId: string,
) {
  const id = recordId(user);

  return (
    Boolean(adminId) &&
    (
      id === adminId ||
      user.id === adminId ||
      user._id === adminId
    )
  );
}

function validateCreate(form: CreateForm) {
  if (
    form.name.trim().length < 2 ||
    form.name.trim().length > 80
  ) {
    return 'Name must be between 2 and 80 characters';
  }

  if (!EMAIL_RE.test(form.email.trim())) {
    return 'Enter a valid email address';
  }

  if (
    form.password.length < 8 ||
    form.password.length > 128
  ) {
    return 'Password must be between 8 and 128 characters';
  }

  if (form.phone.trim().length > 20) {
    return 'Phone must be at most 20 characters';
  }

  if (!ROLES.includes(form.role)) {
    return 'Role is invalid';
  }

  return '';
}

function validateEdit(
  form: EditForm,
  editingSelf: boolean,
) {
  if (
    form.name.trim().length < 2 ||
    form.name.trim().length > 80
  ) {
    return 'Name must be between 2 and 80 characters';
  }

  if (!EMAIL_RE.test(form.email.trim())) {
    return 'Enter a valid email address';
  }

  if (!ROLES.includes(form.role)) {
    return 'Role is invalid';
  }

  if (
    form.avatar.trim() &&
    !URL_RE.test(form.avatar.trim())
  ) {
    return 'Avatar must be a valid image URL';
  }

  if (
    editingSelf &&
    form.role !== 'admin'
  ) {
    return 'You cannot remove your own admin access';
  }

  if (
    editingSelf &&
    !form.isActive
  ) {
    return 'You cannot deactivate your own account';
  }

  return '';
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function formatCreatedAt(value?: string) {
  if (!value) return '—';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const day = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);

  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);

  return `${day}, ${time}`;
}

function roleClasses(role: Role) {
  if (role === 'admin') {
    return 'border-violet-200 bg-violet-50 text-violet-700';
  }

  if (role === 'organizer') {
    return 'border-blue-200 bg-blue-50 text-blue-700';
  }

  return 'border-slate-200 bg-slate-50 text-slate-700';
}

export default function Users() {
  const [items, setItems] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [createForm, setCreateForm] =
    useState<CreateForm>(emptyCreate);

  const [createError, setCreateError] =
    useState('');

  const [editing, setEditing] =
    useState<AdminUser | null>(null);

  const [editForm, setEditForm] =
    useState<EditForm | null>(null);

  const [editError, setEditError] =
    useState('');

  const [pendingDelete, setPendingDelete] =
    useState<AdminUser | null>(null);

  const [deleteError, setDeleteError] =
    useState('');

  const [toasts, setToasts] =
    useState<Toast[]>([]);

  const [adminId, setAdminId] =
    useState('');

  const [query, setQuery] =
    useState('');

  const [roleFilter, setRoleFilter] =
    useState('all');

  const [activeFilter, setActiveFilter] =
    useState('all');

  const [exporting, setExporting] =
    useState(false);

  const fileRef =
    useRef<HTMLInputElement>(null);

  const toastId =
    useRef(0);

  const pushToast = (
    type: Toast['type'],
    message: string,
  ) => {
    const id =
      toastId.current + 1;

    toastId.current = id;

    setToasts((current) => [
      ...current,
      {
        id,
        type,
        message,
      },
    ]);
  };

  const load = async (
    silent = false,
  ) => {
    if (!silent) {
      setLoading(true);
    }

    try {
      const params =
        new URLSearchParams({
          limit: '200',
        });

      if (roleFilter !== 'all') {
        params.set(
          'role',
          roleFilter,
        );
      }

      if (activeFilter !== 'all') {
        params.set(
          'isActive',
          activeFilter,
        );
      }

      const result =
        await api<{
          data?: AdminUser[];
        }>(`/users?${params}`);

      setItems(
        result.data || [],
      );
    } catch (error) {
      pushToast(
        'error',
        errorMessage(error),
      );
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setAdminId(
      currentAdminId(),
    );

    void load();
  }, [
    roleFilter,
    activeFilter,
  ]);

  useEffect(() => {
    if (!toasts.length) {
      return;
    }

    const timer =
      window.setTimeout(() => {
        setToasts(
          (current) =>
            current.slice(1),
        );
      }, 3800);

    return () =>
      window.clearTimeout(timer);
  }, [toasts]);

  const openCreate = () => {
    setCreateForm(
      emptyCreate,
    );

    setCreateError('');
    setCreating(true);
  };

  const closeCreate = () => {
    if (creating) {
      setCreating(false);
      setCreateError('');
    }
  };

  const toggleActive = async (
    user: AdminUser,
  ) => {
    if (isSelf(user, adminId)) {
      pushToast(
        'error',
        'You cannot deactivate your own account',
      );
      return;
    }

    try {
      await api(
        `/users/${recordId(user)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            isActive:
              user.isActive === false,
          }),
        },
      );

      pushToast(
        'success',
        user.isActive === false
          ? 'User activated'
          : 'User deactivated',
      );

      await load(true);
    } catch (error) {
      pushToast(
        'error',
        errorMessage(error),
      );
    }
  };

  const exportUsers = async () => {
    setExporting(true);

    try {
      const params =
        new URLSearchParams({
          limit: '200',
        });

      if (roleFilter !== 'all') {
        params.set(
          'role',
          roleFilter,
        );
      }

      if (activeFilter !== 'all') {
        params.set(
          'isActive',
          activeFilter,
        );
      }

      await downloadAdminCsv(
        `/users?${params}`,
        `ume-users-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`,
      );

      pushToast(
        'success',
        'Users CSV exported',
      );
    } catch (error) {
      pushToast(
        'error',
        errorMessage(error),
      );
    } finally {
      setExporting(false);
    }
  };

  const create = async (
    event: FormEvent,
  ) => {
    event.preventDefault();

    const message =
      validateCreate(createForm);

    if (message) {
      setCreateError(message);
      return;
    }

    setCreating(true);
    setCreateError('');

    try {
      await api('/users', {
        method: 'POST',
        body: JSON.stringify({
          name:
            createForm.name.trim(),
          email:
            createForm.email.trim(),
          password:
            createForm.password,
          phone:
            createForm.phone.trim(),
          role:
            createForm.role,
        }),
      });

      setCreateForm(
        emptyCreate,
      );

      setCreateError('');
      setCreating(false);

      pushToast(
        'success',
        'User created successfully',
      );

      await load(true);
    } catch (error) {
      const messageText =
        errorMessage(error);

      setCreateError(
        messageText,
      );

      pushToast(
        'error',
        messageText,
      );

      setCreating(false);
    }
  };

  const openEdit = (
    user: AdminUser,
  ) => {
    setEditError('');

    setEditing(user);

    setEditForm({
      name:
        user.name || '',
      email:
        user.email || '',
      role:
        user.role || 'user',
      isActive:
        user.isActive !== false,
      avatar:
        user.avatar || '',
    });
  };

  const closeEdit = () => {
    if (
      saving ||
      uploading
    ) {
      return;
    }

    setEditing(null);
    setEditForm(null);
    setEditError('');
  };

  const uploadAvatar = async (
    file: File,
  ) => {
    if (!file.type.startsWith('image/')) {
      setEditError(
        'Please select an image file',
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setEditError(
        'Image must be 5MB or smaller',
      );
      return;
    }

    setUploading(true);
    setEditError('');

    try {
      const body =
        new FormData();

      body.append(
        'image',
        file,
      );

      body.append(
        'folder',
        'ume-holidays/users',
      );

      const response =
        await api<{
          data?: {
            url?: string;
          };
        }>('/uploads/image', {
          method: 'POST',
          body,
        });

      const url =
        response.data?.url;

      if (!url) {
        throw new Error(
          'Upload succeeded but no image URL was returned',
        );
      }

      setEditForm(
        (current) =>
          current
            ? {
                ...current,
                avatar: url,
              }
            : current,
      );

      pushToast(
        'success',
        'Avatar uploaded',
      );
    } catch (error) {
      setEditError(
        errorMessage(error),
      );
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async () => {
    if (
      !editing ||
      !editForm
    ) {
      return;
    }

    const editingSelf =
      isSelf(
        editing,
        adminId,
      );

    const message =
      validateEdit(
        editForm,
        editingSelf,
      );

    if (message) {
      setEditError(message);
      return;
    }

    setSaving(true);
    setEditError('');

    try {
      await api(
        `/users/${recordId(editing)}`,
        {
          method: 'PATCH',
          body: JSON.stringify({
            name:
              editForm.name.trim(),
            email:
              editForm.email.trim(),
            role:
              editForm.role,
            isActive:
              editForm.isActive,
            avatar:
              editForm.avatar.trim(),
          }),
        },
      );

      setEditing(null);
      setEditForm(null);

      pushToast(
        'success',
        'User updated',
      );

      await load(true);
    } catch (error) {
      const messageText =
        errorMessage(error);

      setEditError(
        messageText,
      );

      pushToast(
        'error',
        messageText,
      );
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete =
    async () => {
      if (!pendingDelete) {
        return;
      }

      if (
        isSelf(
          pendingDelete,
          adminId,
        )
      ) {
        setDeleteError(
          'You cannot delete your own account',
        );
        return;
      }

      setDeleting(true);
      setDeleteError('');

      try {
        await api(
          `/users/${recordId(
            pendingDelete,
          )}`,
          {
            method: 'DELETE',
          },
        );

        setPendingDelete(null);

        pushToast(
          'success',
          'User deleted',
        );

        await load(true);
      } catch (error) {
        const messageText =
          errorMessage(error);

        setDeleteError(
          messageText,
        );

        pushToast(
          'error',
          messageText,
        );
      } finally {
        setDeleting(false);
      }
    };

  const editingSelf =
    editing
      ? isSelf(
          editing,
          adminId,
        )
      : false;

  const visible =
    items.filter(
      (user) => {
        const roleMatch =
          roleFilter === 'all' ||
          user.role ===
            roleFilter;

        const searchMatch =
          matchesQuery(
            query,
            user.name,
            user.email,
            user.phone,
          );

        return (
          roleMatch &&
          searchMatch
        );
      },
    );

  const activeCount =
    items.filter(
      (user) =>
        user.isActive !== false,
    ).length;

  const inactiveCount =
    items.filter(
      (user) =>
        user.isActive === false,
    ).length;

  return (
    <>
      {/* =========================================================
          PAGE HEADER
      ========================================================= */}

      <div className="mb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#64748B]">
              System Management
            </p>

            <h1 className="mt-2 font-serif text-4xl font-semibold tracking-[-0.02em] text-[#0F172A] sm:text-5xl">
              Users
            </h1>

            <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#64748B]">
              Manage user accounts, roles,
              profiles and account access
              from one place.
            </p>
          </div>

          {/* Summary */}
          <div className="flex flex-wrap gap-2">
            <div className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 shadow-sm">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#94A3B8]">
                Total
              </p>

              <p className="mt-1 text-xl font-extrabold text-[#0F172A]">
                {items.length}
              </p>
            </div>

            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-emerald-600">
                Active
              </p>

              <p className="mt-1 text-xl font-extrabold text-emerald-700">
                {activeCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
                Inactive
              </p>

              <p className="mt-1 text-xl font-extrabold text-slate-700">
                {inactiveCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          USER MANAGEMENT
      ========================================================= */}

      <div className="min-w-0">

        {/* Top Controls */}
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">

          <div>
            <h2 className="text-lg font-extrabold text-[#0F172A]">
              User Management
            </h2>

            <p className="mt-1 text-xs font-medium text-[#64748B]">
              View, search and manage all users.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#b76b43] px-5 text-sm font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-[#934f30] hover:shadow-lg"
          >
            <Plus
              size={17}
              strokeWidth={2.3}
            />

            Add User
          </button>
        </div>

        {/* Filters */}
        <div className="mb-5 flex flex-wrap gap-2">
          <SearchField
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value,
              )
            }
            placeholder="Search users…"
          />

          <FilterMenu
            label="Role"
            value={roleFilter}
            onChange={
              setRoleFilter
            }
            options={[
              {
                value: 'all',
                label: 'All roles',
              },
              ...ROLES.map(
                (role) => ({
                  value: role,
                  label:
                    role
                      .charAt(0)
                      .toUpperCase() +
                    role.slice(1),
                }),
              ),
            ]}
          />

          <FilterMenu
            label="Status"
            value={activeFilter}
            onChange={
              setActiveFilter
            }
            options={[
              {
                value: 'all',
                label: 'All',
              },
              {
                value: 'true',
                label: 'Active',
              },
              {
                value: 'false',
                label: 'Inactive',
              },
            ]}
          />

          <button
            type="button"
            onClick={() =>
              void exportUsers()
            }
            disabled={exporting}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#0F172A] transition hover:border-[#CBD5E1] hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download
              className="h-4 w-4"
              strokeWidth={2}
            />

            {exporting
              ? 'Exporting…'
              : 'CSV'}
          </button>

          <RefreshButton
            onClick={() =>
              void load()
            }
            loading={loading}
          />
        </div>

        {/* =======================================================
            USERS TABLE
        ======================================================= */}

        <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03),0_12px_30px_rgba(15,23,42,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">

              <thead>
                <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
                  <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
                    User
                  </th>

                  <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
                    Email
                  </th>

                  <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
                    Role
                  </th>

                  <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
                    Status
                  </th>

                  <th className="px-5 py-4 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
                    Date
                  </th>

                  <th className="px-5 py-4 text-right text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#475569]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>

                {/* Loading */}
                {loading && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <div className="flex items-center justify-center gap-3 text-sm font-semibold text-[#64748B]">
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#111827]" />
                        Loading users…
                      </div>
                    </td>
                  </tr>
                )}

                {/* Users */}
                {!loading &&
                  visible.map(
                    (user) => {
                      const self =
                        isSelf(
                          user,
                          adminId,
                        );

                      const active =
                        user.isActive !==
                        false;

                      return (
                        <tr
                          key={recordId(
                            user,
                          )}
                          className="border-b border-[#F1F5F9] transition-colors last:border-0 hover:bg-[#FAFBFC]"
                        >

                          {/* User */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">

                              {user.avatar ? (
                                <img
                                  src={
                                    user.avatar
                                  }
                                  alt=""
                                  className="h-10 w-10 shrink-0 rounded-full border border-[#E2E8F0] bg-white object-cover"
                                />
                              ) : (
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-extrabold text-[#334155]">
                                  {getInitials(
                                    user.name,
                                  )}
                                </span>
                              )}

                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold text-[#0F172A]">
                                  {user.name}
                                </p>

                                {user.phone && (
                                  <p className="mt-0.5 text-xs font-medium text-[#94A3B8]">
                                    {user.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-5 py-4">
                            <span className="font-semibold text-[#334155]">
                              {user.email}
                            </span>
                          </td>

                          {/* Role */}
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-[11px] font-extrabold capitalize ${roleClasses(
                                user.role,
                              )}`}
                            >
                              {user.role}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              disabled={self}
                              onClick={() =>
                                void toggleActive(
                                  user,
                                )
                              }
                              title={
                                self
                                  ? 'You cannot deactivate your own account'
                                  : active
                                    ? 'Click to deactivate'
                                    : 'Click to activate'
                              }
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition-all ${
                                active
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                  : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                              } disabled:cursor-not-allowed disabled:opacity-50`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  active
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-400'
                                }`}
                              />

                              {active
                                ? 'Active'
                                : 'Inactive'}
                            </button>
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4">
                            <span className="whitespace-nowrap font-semibold text-[#334155]">
                              {formatCreatedAt(
                                user.createdAt,
                              )}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex justify-end">
                              <RowActions
                                onEdit={() =>
                                  openEdit(
                                    user,
                                  )
                                }
                                onDelete={() => {
                                  setDeleteError(
                                    '',
                                  );
                                  setPendingDelete(
                                    user,
                                  );
                                }}
                                deleteDisabled={
                                  self
                                    ? 'You cannot delete your own account'
                                    : undefined
                                }
                                more={[
                                  {
                                    label:
                                      'Send email',
                                    icon: Mail,
                                    href: `mailto:${user.email}`,
                                  },
                                  {
                                    label:
                                      'Copy email',
                                    icon: Copy,
                                    copy: user.email,
                                  },
                                  {
                                    label:
                                      'Copy user ID',
                                    icon: Copy,
                                    copy: recordId(
                                      user,
                                    ),
                                  },
                                ]}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}

                {/* Empty */}
                {!loading &&
                  !visible.length && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-16 text-center"
                      >
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC] text-[#94A3B8]">
                          <UsersIcon
                            size={20}
                          />
                        </div>

                        <p className="mt-4 text-sm font-extrabold text-[#334155]">
                          No users found
                        </p>

                        <p className="mt-1 text-xs font-medium text-[#94A3B8]">
                          Try changing your
                          search or filters.
                        </p>
                      </td>
                    </tr>
                  )}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* =========================================================
          CREATE USER MODAL
      ========================================================= */}

      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-user-title"
            className="max-h-[94vh] w-full max-w-xl overflow-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.20)]"
          >

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E2E8F0] px-6 py-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">
                  User Management
                </p>

                <h2
                  id="create-user-title"
                  className="mt-1 font-serif text-3xl font-semibold text-[#0F172A]"
                >
                  Create user
                </h2>

                <p className="mt-1 text-sm font-medium text-[#64748B]">
                  Create a new user account and
                  assign access.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreate}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#111827]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error */}
            {createError && (
              <div className="mx-6 mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                {createError}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={create}
              className="grid gap-5 p-6"
            >

              {(
                [
                  'name',
                  'email',
                  'password',
                  'phone',
                ] as const
              ).map((key) => {
                const labels = {
                  name: 'Full name',
                  email: 'Email address',
                  password: 'Password',
                  phone: 'Phone number',
                };

                return (
                  <label
                    key={key}
                    className="block text-sm font-bold text-[#0F172A]"
                  >
                    {labels[key]}

                    <InputIcon
                      icon={
                        CREATE_ICONS[key]
                      }
                      className="mt-2"
                    >
                      <input
                        required={
                          key !== 'phone'
                        }
                        type={
                          key === 'password'
                            ? 'password'
                            : key === 'email'
                              ? 'email'
                              : 'text'
                        }
                        placeholder={
                          labels[key]
                        }
                        value={
                          createForm[key]
                        }
                        onChange={(
                          event,
                        ) =>
                          setCreateForm({
                            ...createForm,
                            [key]:
                              event.target
                                .value,
                          })
                        }
                        className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#b76b43] focus:ring-2 focus:ring-[#111827]/5 placeholder:text-[#94A3B8]"
                      />
                    </InputIcon>
                  </label>
                );
              })}

              {/* Role */}
              <label className="block text-sm font-bold text-[#0F172A]">
                Role

                <InputIcon
                  icon={ShieldCheck}
                  className="mt-2"
                >
                  <select
                    value={
                      createForm.role
                    }
                    onChange={(
                      event,
                    ) =>
                      setCreateForm({
                        ...createForm,
                        role:
                          event.target
                            .value as Role,
                      })
                    }
                    className="w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-sm font-semibold capitalize text-[#111827] outline-none transition focus:border-[#b76b43] focus:ring-2 focus:ring-[#111827]/5"
                  >
                    {ROLES.map(
                      (role) => (
                        <option
                          key={role}
                          value={role}
                        >
                          {role}
                        </option>
                      ),
                    )}
                  </select>
                </InputIcon>
              </label>
            </form>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-[#E2E8F0] px-6 py-5">
              <button
                type="button"
                onClick={closeCreate}
                className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-bold text-[#334155] transition hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="create-user-form"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-xl bg-[#b76b43] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#934f30] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus
                  size={16}
                  strokeWidth={2.3}
                />

                {creating
                  ? 'Creating…'
                  : 'Create User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          EDIT USER MODAL
      ========================================================= */}

      {editing && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            className="max-h-[94vh] w-full max-w-xl overflow-auto rounded-2xl border border-[#E2E8F0] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.20)]"
          >

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#E2E8F0] px-6 py-5">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#64748B]">
                  User Management
                </p>

                <h2
                  id="edit-user-title"
                  className="mt-1 font-serif text-3xl font-semibold text-[#0F172A]"
                >
                  Edit user
                </h2>

                <p className="mt-1 text-sm font-medium text-[#64748B]">
                  Update profile details.
                  Password is unchanged.
                </p>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                disabled={
                  saving ||
                  uploading
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#111827] disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error */}
            {editError && (
              <div className="mx-6 mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                {editError}
              </div>
            )}

            {/* Form */}
            <div className="grid gap-5 p-6">

              {/* Name */}
              <label className="block text-sm font-bold text-[#0F172A]">
                Name

                <InputIcon
                  icon={User}
                  className="mt-2"
                >
                  <input
                    value={
                      editForm.name
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditForm({
                        ...editForm,
                        name:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#b76b43] focus:ring-2 focus:ring-[#111827]/5"
                  />
                </InputIcon>
              </label>

              {/* Email */}
              <label className="block text-sm font-bold text-[#0F172A]">
                Email

                <InputIcon
                  icon={Mail}
                  className="mt-2"
                >
                  <input
                    type="email"
                    value={
                      editForm.email
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditForm({
                        ...editForm,
                        email:
                          event.target
                            .value,
                      })
                    }
                    className="w-full rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-sm font-medium text-[#111827] outline-none transition focus:border-[#b76b43] focus:ring-2 focus:ring-[#111827]/5"
                  />
                </InputIcon>
              </label>

              {/* Role */}
              <label className="block text-sm font-bold text-[#0F172A]">
                Role

                <InputIcon
                  icon={
                    ShieldCheck
                  }
                  className="mt-2"
                >
                  <select
                    value={
                      editForm.role
                    }
                    disabled={
                      editingSelf
                    }
                    onChange={(
                      event,
                    ) =>
                      setEditForm({
                        ...editForm,
                        role:
                          event.target
                            .value as Role,
                      })
                    }
                    className="w-full appearance-none rounded-xl border border-[#E2E8F0] bg-white py-3 pl-10 pr-4 text-sm font-semibold capitalize text-[#111827] outline-none transition focus:border-[#b76b43] focus:ring-2 focus:ring-[#111827]/5 disabled:bg-[#F8FAFC]"
                  >
                    {ROLES.map(
                      (role) => (
                        <option
                          key={role}
                          value={role}
                        >
                          {role}
                        </option>
                      ),
                    )}
                  </select>
                </InputIcon>

                {editingSelf && (
                  <span className="mt-2 block text-xs font-medium text-[#64748B]">
                    You cannot change
                    your own admin
                    role.
                  </span>
                )}
              </label>

              {/* Active */}
              <div className="flex items-center justify-between rounded-xl border border-[#E2E8F0] bg-[#FAFBFC] p-4">
                <div>
                  <p className="text-sm font-extrabold text-[#0F172A]">
                    Account status
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-[#64748B]">
                    Control whether
                    this account
                    remains active.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={
                    editForm.isActive
                  }
                  disabled={
                    editingSelf
                  }
                  onClick={() =>
                    setEditForm({
                      ...editForm,
                      isActive:
                        !editForm.isActive,
                    })
                  }
                  className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${
                    editForm.isActive
                      ? 'bg-emerald-500'
                      : 'bg-[#CBD5E1]'
                  }`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-md transition ${
                      editForm.isActive
                        ? 'left-6'
                        : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {editingSelf && (
                <p className="-mt-2 text-xs font-medium text-[#64748B]">
                  You cannot deactivate
                  your own account.
                </p>
              )}

              {/* Avatar */}
              <div>
                <p className="mb-2 text-sm font-bold text-[#0F172A]">
                  Avatar
                </p>

                <div className="rounded-2xl border-2 border-dashed border-[#E2E8F0] bg-[#F8FAFC] p-5">

                  {editForm.avatar ? (
                    <img
                      src={
                        editForm.avatar
                      }
                      alt="Avatar preview"
                      className="mb-4 h-28 w-28 rounded-full border border-[#E2E8F0] bg-white object-cover shadow-sm"
                    />
                  ) : (
                    <div className="mb-4 grid h-28 w-28 place-items-center rounded-full border border-[#E2E8F0] bg-white text-xs font-semibold text-[#94A3B8]">
                      No photo
                    </div>
                  )}

                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(
                      event,
                    ) => {
                      const file =
                        event.target
                          .files?.[0];

                      event.currentTarget.value =
                        '';

                      if (file) {
                        void uploadAvatar(
                          file,
                        );
                      }
                    }}
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={
                        uploading ||
                        saving
                      }
                      onClick={() =>
                        fileRef.current?.click()
                      }
                      className="flex-1 rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-bold text-[#0F172A] transition hover:bg-[#F8FAFC] disabled:opacity-50"
                    >
                      {uploading
                        ? 'Uploading…'
                        : 'Choose image'}
                    </button>

                    <button
                      type="button"
                      disabled={
                        !editForm.avatar ||
                        uploading ||
                        saving
                      }
                      onClick={() =>
                        setEditForm({
                          ...editForm,
                          avatar: '',
                        })
                      }
                      className="rounded-xl border border-red-200 bg-white px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>

                  <p className="mt-2 text-xs font-medium text-[#64748B]">
                    JPG, PNG, WEBP or GIF ·
                    maximum 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 border-t border-[#E2E8F0] px-6 py-5">
              <button
                type="button"
                onClick={closeEdit}
                disabled={
                  saving ||
                  uploading
                }
                className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-bold text-[#334155] transition hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() =>
                  void saveEdit()
                }
                disabled={
                  saving ||
                  uploading
                }
                className="rounded-xl bg-[#b76b43] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#934f30] disabled:opacity-50"
              >
                {saving
                  ? 'Saving…'
                  : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          DELETE MODAL
      ========================================================= */}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
            className="w-full max-w-md rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.20)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <X size={20} />
            </div>

            <h2
              id="delete-user-title"
              className="mt-5 font-serif text-3xl font-semibold text-[#0F172A]"
            >
              Delete user
            </h2>

            <p className="mt-2 text-sm font-medium leading-6 text-[#64748B]">
              Delete{' '}
              <span className="font-extrabold text-[#111827]">
                {pendingDelete.name}
              </span>
              ? This removes the account
              and cannot be undone.
            </p>

            {deleteError && (
              <p className="mt-4 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setPendingDelete(
                    null,
                  );
                  setDeleteError('');
                }}
                className="rounded-xl border border-[#E2E8F0] bg-white px-5 py-3 text-sm font-bold text-[#334155] transition hover:bg-[#F8FAFC] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() =>
                  void confirmDelete()
                }
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {deleting
                  ? 'Deleting…'
                  : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TOASTS
      ========================================================= */}

      <div className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
        {toasts.map(
          (toast) => (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto rounded-xl border bg-white px-4 py-3 text-sm font-bold shadow-[0_12px_30px_rgba(15,23,42,0.10)] ${
                toast.type ===
                'success'
                  ? 'border-emerald-200 text-emerald-700'
                  : 'border-red-200 text-red-700'
              }`}
            >
              {toast.message}
            </div>
          ),
        )}
      </div>
    </>
  );
}