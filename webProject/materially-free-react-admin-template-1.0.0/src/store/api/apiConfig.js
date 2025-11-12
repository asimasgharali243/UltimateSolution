// export const API_BASE_URL = 'http://127.0.0.1:5735/api';
export const API_BASE_URL = window.appConfig?.VITE_API_BASE_URL //|| import.meta.env.VITE_API_BASE_URL;
// export const API_BASE_URL = "https://jj-api.ultsol.cloud/api";
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  VALIDATE_TOKEN: '/auth/validate-token',
  REFRESH_TOKEN: '/auth/refresh-token',
};

export const SECTOR_ENDPOINTS = {
  GET_ALL: '/sector',
  GET_ACTIVE: '/sector/active',
  GET_BY_ID: '/sector',
  CREATE: '/sector',
  UPDATE: '/sector',
  PATCH: '/sector',
  DELETE: '/sector',
  CHECK_NAME: '/sector/check-name'
};

export const CITY_ENDPOINTS = {
  GET_ALL: '/City',
  GET_BY_ID: '/City',
  CHECK_NAME: '/City/check-name',
  CREATE: '/City',
  UPDATE: '/City',
  DELETE: '/City',
  GET_HOTELS: '/City'
};

export const HOTEL_ENDPOINTS = {
  GET_ALL: '/Hotel',
  GET_BY_ID: '/Hotel',
  GET_BY_CITY: '/Hotel/city',
  CREATE: '/Hotel',
  UPDATE: '/Hotel',
  DELETE: '/Hotel'
};

export const PAX_ENDPOINTS = {
  GET_ALL: '/Pax',
  GET_BY_ID: (id) => `/Pax/${id}`,
  CREATE: '/Pax',
  UPDATE: '/Pax',
  DELETE: (id) => `/Pax/${id}`,
  CHECK_NAME: '/Pax/check-name'
};

export const RATE_VISA_ENDPOINTS = {
  GET_ALL: '/RateVisa',
  GET_BY_ID: (id) => `/RateVisa/${id}`,
  CREATE: '/RateVisa',
  UPDATE: (id) => `/RateVisa/${id}`,
  DELETE: (id) => `/RateVisa/${id}`
};

export const RATE_HOTEL_ENDPOINTS = {
  GET_ALL: '/RateHotel',
  GET_BY_ID: (id) => `/RateHotel/${id}`,
  GET_BY_COMPOSITE: (cityID, hotelID) => `/RateHotel/by-composite/${cityID}/${hotelID}`,
  CREATE: '/RateHotel',
  UPDATE: (id) => `/RateHotel/${id}`,
  DELETE: (id) => `/RateHotel/${id}`
};

export const PACKAGE_ENDPOINTS = {
  GET_ALL: '/Package',
  GET_BY_ID: (id) => `/Package/${id}`,
  CREATE: '/Package',
  UPDATE: (id) => `/Package/${id}`,
  DELETE: (id) => `/Package/${id}`,
  CHECK_NAME: '/Package/check-name'
};

// Quotation endpoints matching your backend
export const QUOTATION_ENDPOINTS = {
  GET_ALL: '/Quotation',
  GET_BY_ID: (id) => `/Quotation/${id}`,
  CREATE: '/Quotation',
  UPDATE: (id) => `/Quotation/${id}`,
  DELETE: (id) => `/Quotation/${id}`,
  GET_RATES: (cityID, hotelID) => `/Quotation/rates/${cityID}/${hotelID}`,
  GET_RATES_BY_CITY: (cityID) => `/Quotation/rates/city/${cityID}`,
  GET_HOTELS_BY_CITY: (cityID) => `/Quotation/hotels/city/${cityID}`,
  CALCULATE_ACCOMMODATION: '/Quotation/calculate-accommodation'
};

// Individual table endpoints
export const QUOTATION_ACCOMMODATION_ENDPOINTS = {
  GET_ALL: '/QuotationAccommodation',
  GET_BY_ID: (id) => `/QuotationAccommodation/${id}`,
  GET_BY_QUOTATION: (quotationId) => `/QuotationAccommodation/quotation/${quotationId}`,
  CREATE: '/QuotationAccommodation',
  UPDATE: (id) => `/QuotationAccommodation/${id}`,
  DELETE: (id) => `/QuotationAccommodation/${id}`,
  BULK_CREATE: '/QuotationAccommodation/bulk'
};

export const QUOTATION_TRANSPORTATION_ENDPOINTS = {
  GET_ALL: '/QuotationTransportation',
  GET_BY_ID: (id) => `/QuotationTransportation/${id}`,
  GET_BY_QUOTATION: (quotationId) => `/QuotationTransportation/quotation/${quotationId}`,
  CREATE: '/QuotationTransportation',
  UPDATE: (id) => `/QuotationTransportation/${id}`,
  DELETE: (id) => `/QuotationTransportation/${id}`,
  BULK_CREATE: '/QuotationTransportation/bulk'
};

export const QUOTATION_VISA_ENDPOINTS = {
  GET_ALL: '/QuotationVisaService',
  GET_BY_ID: (id) => `/QuotationVisaService/${id}`,
  GET_BY_QUOTATION: (quotationId) => `/QuotationVisaService/quotation/${quotationId}`,
  CREATE: '/QuotationVisaService',
  UPDATE: (id) => `/QuotationVisaService/${id}`,
  DELETE: (id) => `/QuotationVisaService/${id}`,
  BULK_CREATE: '/QuotationVisaService/bulk'
};

export const QUOTATION_AIRLINES_ENDPOINTS = {
  GET_ALL: '/QuotationAirlines',
  GET_BY_ID: (id) => `/QuotationAirlines/${id}`,
  GET_BY_QUOTATION: (quotationId) => `/QuotationAirlines/quotation/${quotationId}`,
  CREATE: '/QuotationAirlines',
  UPDATE: (id) => `/QuotationAirlines/${id}`,
  DELETE: (id) => `/QuotationAirlines/${id}`,
  BULK_CREATE: '/QuotationAirlines/bulk'
};


export const CLIENT_ENDPOINTS = {
  GET_ALL: '/Client',
  GET_BY_ID: (id) => `/Client/${id}`,
  CREATE: '/Client',
  UPDATE: (id) => `/Client/${id}`,
  DELETE: (id) => `/Client/${id}`,
  SEARCH: (term) => `/Client/search?term=${term}`
};

export const USER_RIGHTS_ENDPOINTS = {
  USERS: '/userrights/users',
  FORMS: '/userrights/forms',
  USER_RIGHTS: '/userrights/user',
  CURRENT_USER_RIGHTS: '/userrights/currentuser',
  CURRENT_USER_PERMISSIONS: '/userrights/currentuser/permissions',
  BULK_SAVE: '/userrights/bulk',
  HAS_PERMISSION: '/userrights/haspermission',
  FORM_PERMISSIONS: '/userrights/formpermissions',
  USER_FORMS: '/userrights/userforms',
  USER_FORM_BY_ID: (id) => `/userrights/userforms/${id}`,
};

// apiConfig.js - Add Master endpoints
export const MASTER_ENDPOINTS = {
  GET_ALL: '/master',
  GET_BY_ID: (id) => `/master/${id}`,
  CREATE: '/master',
  UPDATE: (id) => `/master/${id}`,
  DELETE: (id) => `/master/${id}`,
  COUNT: '/master/count',
  SEARCH: (term) => `/master/search?term=${encodeURIComponent(term)}`,
  CHECK_VNO: (vNo, excludeId = null) => 
    excludeId ? `/master/check-vno/${vNo}?excludeId=${excludeId}` : `/master/check-vno/${vNo}`
};

export const ADVERTISEMENT_ENDPOINTS = {
  // Master endpoints
  GET_ALL_MASTERS: '/Advertisement/masters',
  GET_MASTER_BY_ID: (id) => `/Advertisement/masters/${id}`,
  CREATE_MASTER: '/Advertisement/masters',
  UPDATE_MASTER: (id) => `/Advertisement/masters/${id}`,
  DELETE_MASTER: (id) => `/Advertisement/masters/${id}`,
  CHECK_VNO: (vNo, excludeId = null) => 
    excludeId ? `/Advertisement/masters/check-vno/${vNo}?excludeId=${excludeId}` 
              : `/Advertisement/masters/check-vno/${vNo}`,
  
  // Client endpoints
  GET_ALL_CLIENTS: '/Advertisement/clients',
  SEARCH_CLIENTS: (term) => `/Advertisement/clients/search?term=${term}`
};