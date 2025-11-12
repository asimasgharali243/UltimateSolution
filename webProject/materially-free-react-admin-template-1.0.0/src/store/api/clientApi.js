import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, CLIENT_ENDPOINTS } from './apiConfig';

export const clientApi = createApi({
  reducerPath: 'clientApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Client'],
  endpoints: (builder) => ({
    // Get all clients
    getClients: builder.query({
      query: () => CLIENT_ENDPOINTS.GET_ALL,
      providesTags: ['Client'],
      transformResponse: (response) => {
        // Transform the response to match your frontend expectations
        if (response.success && response.data) {
          return response.data.map(client => ({
            clientID: client.id,
            clientName: client.fullName,
            contactNumber: client.contactNumber,
            whatsappNumber: client.whatsappNumber,
            groupHeadName: client.groupHeadName,
            groupHeadNumber: client.groupHeadNumber,
            cityOfResidence: client.cityOfResidence,
            passportValidity: client.passportValidity,
            specialRequirements: client.specialRequirements,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
          }));
        }
        return [];
      }
    }),

    // Get client by ID
    getClient: builder.query({
      query: (id) => CLIENT_ENDPOINTS.GET_BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Client', id }],
      transformResponse: (response) => {
        if (response.success && response.data) {
          const client = response.data;
          return {
            clientID: client.id,
            clientName: client.fullName,
            contactNumber: client.contactNumber,
            whatsappNumber: client.whatsappNumber,
            groupHeadName: client.groupHeadName,
            groupHeadNumber: client.groupHeadNumber,
            cityOfResidence: client.cityOfResidence,
            passportValidity: client.passportValidity,
            specialRequirements: client.specialRequirements,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
          };
        }
        return null;
      }
    }),

    // Create client
    createClient: builder.mutation({
      query: (client) => ({
        url: CLIENT_ENDPOINTS.CREATE,
        method: 'POST',
        body: {
          FullName: client.clientName,
          ContactNumber: client.contactNumber,
          WhatsAppNumber: client.whatsappNumber,
          GroupHeadName: client.groupHeadName,
          GroupHeadNumber: client.groupHeadNumber,
          CityOfResidence: client.cityOfResidence,
          PassportValidity: client.passportValidity,
          SpecialRequirements: client.specialRequirements
        }
      }),
      invalidatesTags: ['Client'],
      transformResponse: (response) => {
        if (response.success) {
          return {
            success: true,
            data: {
              id: response.data.id,
              clientID: response.data.id,
              ...response.data
            }
          };
        }
        return response;
      }
    }),

    // Update client
    updateClient: builder.mutation({
      query: ({ clientID, ...client }) => ({
        url: CLIENT_ENDPOINTS.UPDATE(clientID),
        method: 'PUT',
        body: {
          id: clientID,
          fullName: client.clientName,
          contactNumber: client.contactNumber,
          whatsappNumber: client.whatsappNumber,
          groupHeadName: client.groupHeadName,
          groupHeadNumber: client.groupHeadNumber,
          cityOfResidence: client.cityOfResidence,
          passportValidity: client.passportValidity,
          specialRequirements: client.specialRequirements
        }
      }),
      invalidatesTags: (result, error, { clientID }) => [{ type: 'Client', id: clientID }],
    }),

    // Delete client
    deleteClient: builder.mutation({
      query: (id) => ({
        url: CLIENT_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Client'],
    }),

    // Search clients
    searchClients: builder.query({
      query: (searchTerm) => CLIENT_ENDPOINTS.SEARCH(searchTerm),
      providesTags: ['Client'],
    }),
  }),
});

export const {
  useGetClientsQuery,
  useGetClientQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useSearchClientsQuery,
} = clientApi;