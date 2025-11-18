// userRightsApi.js
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
  prepareHeaders: (headers, { getState }) => {
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
  credentials: 'include',
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && (result.error.status === 401 || result.error.originalStatus === 401)) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiry');
      window.location.href = '/application/login';
      return result;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - currentTime;
      
      if (timeUntilExpiry < 300) {
        if (!isRefreshing) {
          isRefreshing = true;
          
          try {
            const refreshResult = await baseQuery(
              {
                url: '/auth/refresh-token',
                method: 'POST',
                body: { token }
              },
              api,
              extraOptions
            );

            if (refreshResult.data && refreshResult.data.token) {
              const newToken = refreshResult.data.token;
              localStorage.setItem('token', newToken);
              
              const newDecoded = jwtDecode(newToken);
              localStorage.setItem('tokenExpiry', newDecoded.exp.toString());
              
              isRefreshing = false;
              processQueue(null, newToken);
              
              result = await baseQuery(args, api, extraOptions);
            } else {
              throw new Error('Token refresh failed');
            }
          } catch (error) {
            isRefreshing = false;
            processQueue(error, null);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            window.location.href = '/application/login';
            return result;
          }
        } else {
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
      console.error('Token decode error:', error);
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
  tagTypes: ['UserRights', 'Users', 'Forms'],
  endpoints: (builder) => ({
    // Get all users - FIXED ENDPOINT
    getUsers: builder.query({
      query: () => USER_RIGHTS_ENDPOINTS.USERS,
      providesTags: ['Users'],
    }),

    // Get all forms - FIXED ENDPOINT
    getForms: builder.query({
      query: () => USER_RIGHTS_ENDPOINTS.FORMS,
      providesTags: ['Forms'],
    }),

    // Get user rights by user ID - FIXED ENDPOINT
    getUserRights: builder.query({
      query: (userId) => `${USER_RIGHTS_ENDPOINTS.USER_RIGHTS}/${userId}`,
      providesTags: (result, error, userId) => [
        { type: 'UserRights', id: userId },
        { type: 'UserRights', id: 'LIST' }
      ],
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
      query: (userRightsData) => {
        console.log('Saving user rights:', userRightsData);
        return {
          url: USER_RIGHTS_ENDPOINTS.BULK_SAVE,
          method: 'POST',
          body: userRightsData,
        };
      },
      invalidatesTags: ['UserRights', 'Users'],
    }),

    // Check permission for specific form
    hasPermission: builder.query({
      query: ({ formName, permission }) => 
        `${USER_RIGHTS_ENDPOINTS.HAS_PERMISSION}?formName=${encodeURIComponent(formName)}&permission=${permission}`,
    }),

    // Get all permissions for a form
    getFormPermissions: builder.query({
      query: (formName) => `${USER_RIGHTS_ENDPOINTS.FORM_PERMISSIONS}/${formName}`,
    }),

    // Test connection
    testConnection: builder.query({
      query: () => USER_RIGHTS_ENDPOINTS.TEST_CONNECTION,
    }),

    // Check data
    checkData: builder.query({
      query: () => USER_RIGHTS_ENDPOINTS.CHECK_DATA,
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
  useTestConnectionQuery,
  useCheckDataQuery,
  useLazyGetUsersQuery,
  useLazyGetFormsQuery,
  useLazyGetUserRightsQuery,
} = userRightsApi;