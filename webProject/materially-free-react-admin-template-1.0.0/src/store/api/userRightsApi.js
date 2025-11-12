// api/userRightsApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, USER_RIGHTS_ENDPOINTS } from './apiConfig';
import { jwtDecode } from 'jwt-decode';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const baseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      // Use window.location for logout instead of store dispatch
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/application/login';
      return result;
    }

    // Check if token is expired or about to expire
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      
      // If token is expired or will expire in 5 minutes, try to refresh
      if (timeUntilExpiry < 300) {
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            // Call refresh token endpoint directly
            const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (refreshResponse.ok) {
              const refreshData = await refreshResponse.json();
              localStorage.setItem('token', refreshData.token);
              
              const decoded = jwtDecode(refreshData.token);
              localStorage.setItem('tokenExpiry', decoded.exp.toString());
              
              isRefreshing = false;
              processQueue(null, refreshData.token);
              
              // Retry the original request with new token
              result = await baseQuery(args, api, extraOptions);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (error) {
            isRefreshing = false;
            processQueue(error, null);
            // Force logout
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            window.location.href = '/application/login';
          }
        } else {
          // Add request to queue
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            return baseQuery(args, api, extraOptions);
          }).catch(() => {
            return result;
          });
        }
      }
    } catch (error) {
      // Force logout on token decode error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/application/login';
    }
  }
  
  return result;
};

export const userRightsApi = createApi({
  reducerPath: 'userRightsApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['UserRights', 'Users', 'Forms', 'UserForms'],
  endpoints: (builder) => ({
    // Get all users
    getUsers: builder.query({
      query: () => USER_RIGHTS_ENDPOINTS.USERS,
      providesTags: ['Users'],
    }),

    // Get all forms
    getForms: builder.query({
      query: () => USER_RIGHTS_ENDPOINTS.FORMS,
      providesTags: ['Forms'],
    }),

    // Get user rights by user ID
    getUserRights: builder.query({
      query: (userId) => `${USER_RIGHTS_ENDPOINTS.USER_RIGHTS}/${userId}`,
      providesTags: (result, error, userId) => [{ type: 'UserRights', id: userId }],
    }),

    // Get current user rights
    getCurrentUserRights: builder.query({
      query: () => USER_RIGHTS_ENDPOINTS.CURRENT_USER_RIGHTS,
      providesTags: ['UserRights'],
    }),

    // Get current user permissions
    getCurrentUserPermissions: builder.query({
      query: () => USER_RIGHTS_ENDPOINTS.CURRENT_USER_PERMISSIONS,
      providesTags: ['UserRights'],
    }),

    // Save user rights in bulk
    saveUserRights: builder.mutation({
      query: (userRights) => ({
        url: USER_RIGHTS_ENDPOINTS.BULK_SAVE,
        method: 'POST',
        body: { userRights },
      }),
      invalidatesTags: ['UserRights'],
    }),

    // Check permission
    hasPermission: builder.query({
      query: ({ formName, permission }) => 
        `${USER_RIGHTS_ENDPOINTS.HAS_PERMISSION}?formName=${formName}&permission=${permission}`,
    }),

    // Get form permissions
    getFormPermissions: builder.query({
      query: (formName) => `${USER_RIGHTS_ENDPOINTS.FORM_PERMISSIONS}/${formName}`,
    }),

    // User Forms CRUD
    getUserForms: builder.query({
      query: () => USER_RIGHTS_ENDPOINTS.USER_FORMS,
      providesTags: ['UserForms'],
    }),

    getUserFormById: builder.query({
      query: (id) => USER_RIGHTS_ENDPOINTS.USER_FORM_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'UserForms', id }],
    }),

    createUserForm: builder.mutation({
      query: (formData) => ({
        url: USER_RIGHTS_ENDPOINTS.USER_FORMS,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: ['UserForms'],
    }),

    updateUserForm: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: USER_RIGHTS_ENDPOINTS.USER_FORM_BY_ID(id),
        method: 'PUT',
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'UserForms', id }],
    }),

    deleteUserForm: builder.mutation({
      query: (id) => ({
        url: USER_RIGHTS_ENDPOINTS.USER_FORM_BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['UserForms'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetFormsQuery,
  useGetUserRightsQuery,
  useGetCurrentUserRightsQuery,
  useGetCurrentUserPermissionsQuery,
  useSaveUserRightsMutation,
  useHasPermissionQuery,
  useGetFormPermissionsQuery,
  useLazyHasPermissionQuery,
  useGetUserFormsQuery,
  useGetUserFormByIdQuery,
  useCreateUserFormMutation,
  useUpdateUserFormMutation,
  useDeleteUserFormMutation,
} = userRightsApi;