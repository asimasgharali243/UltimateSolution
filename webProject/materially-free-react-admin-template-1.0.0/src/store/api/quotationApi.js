import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { 
  API_BASE_URL, 
  QUOTATION_ENDPOINTS,
  QUOTATION_ACCOMMODATION_ENDPOINTS,
  QUOTATION_TRANSPORTATION_ENDPOINTS,
  QUOTATION_VISA_ENDPOINTS,
  QUOTATION_AIRLINES_ENDPOINTS,
  RATE_HOTEL_ENDPOINTS 
} from './apiConfig';

export const quotationApi = createApi({
  reducerPath: 'quotationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    'Quotation', 
    'QuotationAccommodation',
    'QuotationTransportation', 
    'QuotationVisa',
    'QuotationAirlines'
  ],
  endpoints: (builder) => ({
    // Main Quotation CRUD
    createQuotation: builder.mutation({
      query: (quotationData) => ({
        url: QUOTATION_ENDPOINTS.CREATE,
        method: 'POST',
        body: quotationData,
      }),
      invalidatesTags: ['Quotation'],
    }),
    
    getQuotations: builder.query({
      query: () => QUOTATION_ENDPOINTS.GET_ALL,
      providesTags: ['Quotation'],
    }),
    
    getQuotationById: builder.query({
      query: (id) => QUOTATION_ENDPOINTS.GET_BY_ID(id),
      providesTags: ['Quotation'],
    }),
    
    // In your quotationApi endpoints
updateQuotation: builder.mutation({
  query: ({ id, ...quotationData }) => ({
    url: QUOTATION_ENDPOINTS.UPDATE(id),
    method: 'PUT',
    body: quotationData, // Send data directly, not wrapped
  }),
  invalidatesTags: ['Quotation'],
}),
    
    deleteQuotation: builder.mutation({
      query: (id) => ({
        url: QUOTATION_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Quotation'],
    }),

    // Hotel Rates
    getHotelRates: builder.query({
      query: ({ cityID, hotelID }) => 
        QUOTATION_ENDPOINTS.GET_RATES(cityID, hotelID),
    }),
    
    getRatesByCity: builder.query({
      query: (cityID) => QUOTATION_ENDPOINTS.GET_RATES_BY_CITY(cityID),
    }),
    
    getHotelsByCity: builder.query({
      query: (cityID) => QUOTATION_ENDPOINTS.GET_HOTELS_BY_CITY(cityID),
    }),

    // Individual Table Operations - Accommodation
    getQuotationAccommodations: builder.query({
      query: (quotationId) => QUOTATION_ACCOMMODATION_ENDPOINTS.GET_BY_QUOTATION(quotationId),
      providesTags: ['QuotationAccommodation'],
    }),

    createQuotationAccommodation: builder.mutation({
      query: (accommodationData) => ({
        url: QUOTATION_ACCOMMODATION_ENDPOINTS.CREATE,
        method: 'POST',
        body: accommodationData,
      }),
      invalidatesTags: ['QuotationAccommodation', 'Quotation'],
    }),

    updateQuotationAccommodation: builder.mutation({
      query: ({ id, ...accommodationData }) => ({
        url: QUOTATION_ACCOMMODATION_ENDPOINTS.UPDATE(id),
        method: 'PUT',
        body: accommodationData,
      }),
      invalidatesTags: ['QuotationAccommodation', 'Quotation'],
    }),

    deleteQuotationAccommodation: builder.mutation({
      query: (id) => ({
        url: QUOTATION_ACCOMMODATION_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['QuotationAccommodation', 'Quotation'],
    }),

    bulkCreateAccommodations: builder.mutation({
      query: (accommodations) => ({
        url: QUOTATION_ACCOMMODATION_ENDPOINTS.BULK_CREATE,
        method: 'POST',
        body: accommodations,
      }),
      invalidatesTags: ['QuotationAccommodation', 'Quotation'],
    }),

    // Individual Table Operations - Transportation
    getQuotationTransportations: builder.query({
      query: (quotationId) => QUOTATION_TRANSPORTATION_ENDPOINTS.GET_BY_QUOTATION(quotationId),
      providesTags: ['QuotationTransportation'],
    }),

    createQuotationTransportation: builder.mutation({
      query: (transportationData) => ({
        url: QUOTATION_TRANSPORTATION_ENDPOINTS.CREATE,
        method: 'POST',
        body: transportationData,
      }),
      invalidatesTags: ['QuotationTransportation', 'Quotation'],
    }),

    updateQuotationTransportation: builder.mutation({
      query: ({ id, ...transportationData }) => ({
        url: QUOTATION_TRANSPORTATION_ENDPOINTS.UPDATE(id),
        method: 'PUT',
        body: transportationData,
      }),
      invalidatesTags: ['QuotationTransportation', 'Quotation'],
    }),

    deleteQuotationTransportation: builder.mutation({
      query: (id) => ({
        url: QUOTATION_TRANSPORTATION_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['QuotationTransportation', 'Quotation'],
    }),

    bulkCreateTransportations: builder.mutation({
      query: (transportations) => ({
        url: QUOTATION_TRANSPORTATION_ENDPOINTS.BULK_CREATE,
        method: 'POST',
        body: transportations,
      }),
      invalidatesTags: ['QuotationTransportation', 'Quotation'],
    }),

    // Individual Table Operations - Visa Services
    getQuotationVisas: builder.query({
      query: (quotationId) => QUOTATION_VISA_ENDPOINTS.GET_BY_QUOTATION(quotationId),
      providesTags: ['QuotationVisa'],
    }),

    createQuotationVisa: builder.mutation({
      query: (visaData) => ({
        url: QUOTATION_VISA_ENDPOINTS.CREATE,
        method: 'POST',
        body: visaData,
      }),
      invalidatesTags: ['QuotationVisa', 'Quotation'],
    }),

    updateQuotationVisa: builder.mutation({
      query: ({ id, ...visaData }) => ({
        url: QUOTATION_VISA_ENDPOINTS.UPDATE(id),
        method: 'PUT',
        body: visaData,
      }),
      invalidatesTags: ['QuotationVisa', 'Quotation'],
    }),

    deleteQuotationVisa: builder.mutation({
      query: (id) => ({
        url: QUOTATION_VISA_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['QuotationVisa', 'Quotation'],
    }),

    bulkCreateVisas: builder.mutation({
      query: (visas) => ({
        url: QUOTATION_VISA_ENDPOINTS.BULK_CREATE,
        method: 'POST',
        body: visas,
      }),
      invalidatesTags: ['QuotationVisa', 'Quotation'],
    }),

    // Individual Table Operations - Airlines
    getQuotationAirlines: builder.query({
      query: (quotationId) => QUOTATION_AIRLINES_ENDPOINTS.GET_BY_QUOTATION(quotationId),
      providesTags: ['QuotationAirlines'],
    }),

    createQuotationAirline: builder.mutation({
      query: (airlineData) => ({
        url: QUOTATION_AIRLINES_ENDPOINTS.CREATE,
        method: 'POST',
        body: airlineData,
      }),
      invalidatesTags: ['QuotationAirlines', 'Quotation'],
    }),

    updateQuotationAirline: builder.mutation({
      query: ({ id, ...airlineData }) => ({
        url: QUOTATION_AIRLINES_ENDPOINTS.UPDATE(id),
        method: 'PUT',
        body: airlineData,
      }),
      invalidatesTags: ['QuotationAirlines', 'Quotation'],
    }),

    deleteQuotationAirline: builder.mutation({
      query: (id) => ({
        url: QUOTATION_AIRLINES_ENDPOINTS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['QuotationAirlines', 'Quotation'],
    }),

    bulkCreateAirlines: builder.mutation({
      query: (airlines) => ({
        url: QUOTATION_AIRLINES_ENDPOINTS.BULK_CREATE,
        method: 'POST',
        body: airlines,
      }),
      invalidatesTags: ['QuotationAirlines', 'Quotation'],
    }),
  }),
});

export const {
  // Main Quotation
  useCreateQuotationMutation,
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
  
  // Rates
  useGetHotelRatesQuery,
  useGetRatesByCityQuery,
  useGetHotelsByCityQuery,

  // Accommodation
  useGetQuotationAccommodationsQuery,
  useCreateQuotationAccommodationMutation,
  useUpdateQuotationAccommodationMutation,
  useDeleteQuotationAccommodationMutation,
  useBulkCreateAccommodationsMutation,

  // Transportation
  useGetQuotationTransportationsQuery,
  useCreateQuotationTransportationMutation,
  useUpdateQuotationTransportationMutation,
  useDeleteQuotationTransportationMutation,
  useBulkCreateTransportationsMutation,

  // Visa Services
  useGetQuotationVisasQuery,
  useCreateQuotationVisaMutation,
  useUpdateQuotationVisaMutation,
  useDeleteQuotationVisaMutation,
  useBulkCreateVisasMutation,

  // Airlines
  useGetQuotationAirlinesQuery,
  useCreateQuotationAirlineMutation,
  useUpdateQuotationAirlineMutation,
  useDeleteQuotationAirlineMutation,
  useBulkCreateAirlinesMutation,
} = quotationApi;