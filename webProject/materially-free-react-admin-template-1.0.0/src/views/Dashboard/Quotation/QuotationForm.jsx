// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useLocation, useNavigate } from 'react-router-dom';
// import {
//   Box,
//   Paper,
//   Typography,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Grid,
//   TextField,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Select,
//   TableFooter,
//   Card,
//   CardContent,
//   Chip,
//   IconButton,
//   Tooltip,
//   Button,
//   Alert,
//   CircularProgress,
//   Divider,
//   Stack,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   Snackbar
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';

// import { useReactToPrint } from 'react-to-print';
// import { useRef } from 'react';

// // Import API hooks
// import { useGetCitiesQuery, useGetSectorsQuery } from '../../../store/api/masterApi';
// import { useGetPackagesQuery } from '../../../store/api/packageApi';
// import { useGetClientsQuery, useGetClientQuery, useCreateClientMutation } from '../../../store/api/clientApi';
// import {
//   useCreateQuotationMutation,
//   useUpdateQuotationMutation,
//   useBulkCreateAccommodationsMutation,
//   useBulkCreateTransportationsMutation,
//   useBulkCreateVisasMutation,
//   useBulkCreateAirlinesMutation
// } from '../../../store/api/quotationApi';
// import { useGetHotelsByCityQuery } from '../../../store/api/hotelApi';
// import { useGetRateHotelByCompositeQuery } from '../../../store/api/rateHotelApi';

// // Import PDF Service
// import QuotationPrintView from './QuotationPrintView';

// const QuotationForm = ({ mode, quotation, onSave, onCancel, onRefetch }) => {
//   const theme = useTheme();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);

//   // Add PDF ref and hook for react-to-print
//   const printRef = useRef();
//   const [generatingPDF, setGeneratingPDF] = useState(false);
//   const [sourceQueryInfo, setSourceQueryInfo] = useState(null);
//   const [hasLoadedQueryData, setHasLoadedQueryData] = useState(false);

//   // State declarations - FIXED: Initialize based on location state
//   const [clientType, setClientType] = useState('existing');
//   const [selectedClientId, setSelectedClientId] = useState('');
//   const [newClientData, setNewClientData] = useState({
//     clientName: '',
//     contactNumber: '',
//     whatsappNumber: '',
//     groupHeadName: '',
//     groupHeadNumber: '',
//     cityOfResidence: '',
//     passportValidity: '',
//     specialRequirements: ''
//   });

//   // Snackbar state
//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });

//   // Fixed state management for hotels and rates
//   const [hotelsByCity, setHotelsByCity] = useState({});
//   const [roomRates, setRoomRates] = useState({});
//   const [loadingHotels, setLoadingHotels] = useState({});
//   const [loadingRates, setLoadingRates] = useState({});
//   const [rateErrors, setRateErrors] = useState({});

//   // API Hooks
//   const { data: citiesData = [], isLoading: citiesLoading } = useGetCitiesQuery();
//   const { data: sectorsData = [], isLoading: sectorsLoading } = useGetSectorsQuery();
//   const { data: clientsData = [], isLoading: clientsLoading } = useGetClientsQuery();

//   // Proper package data handling
//   const { data: packagesResponse = {}, isLoading: packagesLoading } = useGetPackagesQuery();
//   const packagesData = packagesResponse.data || packagesResponse || [];
//   packagesLoading ? null : console.log('packagesData', packagesData);
//   // Get selected client details
//   const { data: selectedClient } = useGetClientQuery(selectedClientId, {
//     skip: !selectedClientId || clientType !== 'existing'
//   });

//   // Create client mutation
//   const [createClient, { isLoading: creatingClient }] = useCreateClientMutation();

//   // Hotel API hooks
//   const [selectedCityForHotels, setSelectedCityForHotels] = useState(null);
//   const {
//     data: hotelsData = [],
//     isLoading: hotelsLoading,
//     refetch: refetchHotels
//   } = useGetHotelsByCityQuery(selectedCityForHotels, {
//     skip: !selectedCityForHotels,
//     refetchOnMountOrArgChange: true
//   });

//   // Rate API hooks
//   const [selectedHotelForRates, setSelectedHotelForRates] = useState(null);
//   const {
//     data: ratesData,
//     isLoading: ratesLoading,
//     error: ratesError,
//     refetch: refetchRates
//   } = useGetRateHotelByCompositeQuery(selectedHotelForRates, {
//     skip: !selectedHotelForRates,
//     refetchOnMountOrArgChange: true
//   });

//   // Mutation hooks
//   const [createQuotation, { isLoading: creatingQuotation }] = useCreateQuotationMutation();
//   const [updateQuotation, { isLoading: updatingQuotation }] = useUpdateQuotationMutation();
//   const [bulkCreateAccommodations] = useBulkCreateAccommodationsMutation();
//   const [bulkCreateTransportations] = useBulkCreateTransportationsMutation();
//   const [bulkCreateVisas] = useBulkCreateVisasMutation();
//   const [bulkCreateAirlines] = useBulkCreateAirlinesMutation();

//   // Initial form state
//   const initialFormState = {
//     client_id: '',
//     quotation_number: '',
//     traveling_details: '',
//     packgeID: '',
//     reference_by: '',
//     makkah_nights: '',
//     madinah_nights: '',
//     makkah_nights1: '',
//     jeddah_nights: '',
//     adult_count: '',
//     child_count: '',
//     infant_count: '',
//     advance_amount: '',
//     accommodations: [
//       {
//         cityID: '',
//         hotelID: '',
//         check_in: '',
//         check_out: '',
//         room_type: 'sharing',
//         no_of_rooms: '',
//         no_of_nights: '',
//         rate_per_night: ''
//       }
//     ],
//     transportations: [
//       {
//         vehicle_name: '',
//         capacity: '',
//         sectorID: '',
//         rate: '',
//         quantity: ''
//       }
//     ],
//     visas: [
//       {
//         Description: '',
//         Rate: '',
//         Qty: ''
//       }
//     ],
//     airlines: [
//       {
//         carrier: '',
//         pax_count: '',
//         class: 'Economy',
//         sector: '',
//         rate: '',
//         quantity: ''
//       }
//     ]
//   };

//   const [formData, setFormData] = useState(initialFormState);

//   // Options for dropdowns
//   const vehicleTypes = ['8 PAX (Hiace)', '12 PAX (Van)', '16 PAX (Coaster)', '24 PAX (Bus)', '45 PAX (Bus)'];
//   const visaServices = ['ONLY UMRA VISA', 'INFANT VISA', 'TOURIST VISA', 'BUSINESS VISA', 'TRANSIT VISA'];
//   const roomTypes = ['sharing', 'quint', 'quad', 'triple', 'doble'];
//   const airlineClasses = ['Economy', 'Business', 'First Class'];

//   // Load query data when component mounts - COMPLETELY FIXED VERSION
//   useEffect(() => {
//     const loadQueryData = () => {
//       const navigationData = location.state?.queryData;
//       console.log('🔍 Query data received in QuotationForm:', navigationData);

//       if (navigationData && mode === 'create' && !hasLoadedQueryData) {
//         try {
//           console.log('🚀 Loading query data into quotation form...');

//           // FIRST: Set client type to new
//           setClientType('new');
//           console.log('✅ Client type set to: new');

//           // SECOND: Pre-fill new client data
//           if (navigationData.newClientData) {
//             const clientData = {
//               clientName: navigationData.newClientData.clientName || '',
//               contactNumber: navigationData.newClientData.contactNumber || '',
//               whatsappNumber: navigationData.newClientData.whatsappNumber || '',
//               groupHeadName: navigationData.newClientData.groupHeadName || '',
//               groupHeadNumber: navigationData.newClientData.groupHeadNumber || '',
//               cityOfResidence: navigationData.newClientData.cityOfResidence || '',
//               passportValidity: navigationData.newClientData.passportValidity || '',
//               specialRequirements: navigationData.newClientData.specialRequirements || ''
//             };
//             setNewClientData(clientData);
//             console.log('✅ New client data set:', clientData);
//           }

//           // THIRD: Pre-fill main form data
//           const updatedFormData = {
//             ...initialFormState,
//             traveling_details: navigationData.traveling_details || '',
//             packgeID: navigationData.packgeID || '',
//             reference_by: navigationData.reference_by || '',
//             makkah_nights: navigationData.makkah_nights || '',
//             madinah_nights: navigationData.madinah_nights || '',
//             makkah_nights1: navigationData.makkah_nights1 || '',
//             jeddah_nights: navigationData.jeddah_nights || '',
//             adult_count: navigationData.adult_count || '',
//             child_count: navigationData.child_count || '',
//             infant_count: navigationData.infant_count || '',
//             advance_amount: navigationData.advance_amount || ''
//           };

//           // Handle accommodations
//           if (navigationData.accommodations && navigationData.accommodations.length > 0) {
//             updatedFormData.accommodations = navigationData.accommodations.map((acc) => ({
//               ...acc,
//               check_in: formatDateForInput(acc.check_in),
//               check_out: formatDateForInput(acc.check_out)
//             }));
//             console.log('✅ Accommodations set:', updatedFormData.accommodations);
//           }

//           // Handle transportations
//           if (navigationData.transportations && navigationData.transportations.length > 0) {
//             updatedFormData.transportations = navigationData.transportations;
//             console.log('✅ Transportations set:', updatedFormData.transportations);
//           }

//           // Handle visas
//           if (navigationData.visas && navigationData.visas.length > 0) {
//             updatedFormData.visas = navigationData.visas;
//             console.log('✅ Visas set:', updatedFormData.visas);
//           }

//           // Handle airlines
//           if (navigationData.airlines && navigationData.airlines.length > 0) {
//             updatedFormData.airlines = navigationData.airlines;
//             console.log('✅ Airlines set:', updatedFormData.airlines);
//           }

//           setFormData(updatedFormData);
//           console.log('✅ Form data fully updated');

//           // Set source query information
//           if (navigationData.sourceQueryId) {
//             setSourceQueryInfo({
//               id: navigationData.sourceQueryId,
//               number: navigationData.sourceQueryNumber
//             });
//             console.log('✅ Source query info set');
//           }

//           // Mark that query data has been loaded
//           setHasLoadedQueryData(true);
//           console.log('✅ Query data loading completed');

//           showSnackbar('Quotation pre-filled from query form!', 'success');
//         } catch (error) {
//           console.error('❌ Error loading query data:', error);
//           showSnackbar('Error loading query data', 'error');
//         }
//       }
//     };

//     // Use setTimeout to ensure state updates happen in correct order
//     setTimeout(loadQueryData, 100);
//   }, [mode, location.state, navigate, location.pathname, hasLoadedQueryData]);

//   // Initialize form data when mode changes
//   useEffect(() => {
//     if (mode === 'edit' && quotation) {
//       const editData = {
//         ...initialFormState,
//         ...quotation,
//         accommodations:
//           quotation.accommodations && quotation.accommodations.length > 0
//             ? quotation.accommodations.map((acc) => ({
//                 ...acc,
//                 cityID: acc.cityID?.toString() || '',
//                 hotelID: acc.hotelID?.toString() || '',
//                 check_in: formatDateForInput(acc.check_in),
//                 check_out: formatDateForInput(acc.check_out),
//                 room_type: acc.room_type || 'sharing',
//                 no_of_rooms: acc.no_of_rooms?.toString() || '',
//                 no_of_nights: acc.no_of_nights?.toString() || '',
//                 rate_per_night: acc.rate_per_night?.toString() || ''
//               }))
//             : initialFormState.accommodations,
//         transportations:
//           quotation.transportations && quotation.transportations.length > 0
//             ? quotation.transportations.map((trans) => ({
//                 ...trans,
//                 sectorID: trans.sectorID?.toString() || '',
//                 rate: trans.rate?.toString() || '',
//                 quantity: trans.quantity?.toString() || ''
//               }))
//             : initialFormState.transportations,
//         visas:
//           quotation.visas && quotation.visas.length > 0
//             ? quotation.visas.map((visa) => ({
//                 ...visa,
//                 Rate: visa.Rate?.toString() || '',
//                 Qty: visa.Qty?.toString() || ''
//               }))
//             : initialFormState.visas,
//         airlines:
//           quotation.airlines && quotation.airlines.length > 0
//             ? quotation.airlines.map((airline) => ({
//                 ...airline,
//                 pax_count: airline.pax_count?.toString() || '',
//                 rate: airline.rate?.toString() || '',
//                 quantity: airline.quantity?.toString() || ''
//               }))
//             : initialFormState.airlines
//       };

//       Object.keys(editData).forEach((key) => {
//         if (editData[key] === undefined || editData[key] === null) {
//           editData[key] = initialFormState[key] || '';
//         }
//       });

//       setFormData(editData);

//       if (quotation.client_id) {
//         setClientType('existing');
//         setSelectedClientId(quotation.client_id.toString());
//       }

//       if (quotation.accommodations) {
//         quotation.accommodations.forEach(async (acc) => {
//           if (acc.cityID && acc.hotelID) {
//             setSelectedCityForHotels(acc.cityID);
//             setTimeout(() => {
//               setSelectedHotelForRates({
//                 cityID: acc.cityID,
//                 hotelID: acc.hotelID
//               });
//             }, 100);
//           }
//         });
//       }
//     } else if (mode === 'create' && !hasLoadedQueryData && !location.state?.queryData) {
//       setFormData(initialFormState);
//       setClientType('existing');
//       setSelectedClientId('');
//       setNewClientData({
//         clientName: '',
//         contactNumber: '',
//         whatsappNumber: '',
//         groupHeadName: '',
//         groupHeadNumber: '',
//         cityOfResidence: '',
//         passportValidity: '',
//         specialRequirements: ''
//       });

//       setHotelsByCity({});
//       setRoomRates({});
//       setRateErrors({});
//     }
//   }, [mode, quotation, hasLoadedQueryData, location.state]);

//   // Update form when selected client changes
//   useEffect(() => {
//     if (selectedClient && clientType === 'existing') {
//       setFormData((prev) => ({
//         ...prev,
//         client_id: selectedClient.clientID || selectedClient.id
//       }));
//     }
//   }, [selectedClient, clientType]);

//   // Update hotels data when fetched
//   useEffect(() => {
//     if (selectedCityForHotels && hotelsData) {
//       const cityHotels = Array.isArray(hotelsData) ? hotelsData : hotelsData.data || [];
//       setHotelsByCity((prev) => ({
//         ...prev,
//         [selectedCityForHotels]: cityHotels
//       }));
//       setLoadingHotels((prev) => ({
//         ...prev,
//         [selectedCityForHotels]: false
//       }));
//     }
//   }, [hotelsData, selectedCityForHotels]);

//   // Update rates data when fetched
//   useEffect(() => {
//     if (selectedHotelForRates) {
//       const rateKey = `${selectedHotelForRates.cityID}-${selectedHotelForRates.hotelID}`;
//       if (ratesError) {
//         setRateErrors((prev) => ({
//           ...prev,
//           [rateKey]: true
//         }));
//         setRoomRates((prev) => ({
//           ...prev,
//           [rateKey]: null
//         }));
//         setLoadingRates((prev) => ({
//           ...prev,
//           [rateKey]: false
//         }));
//       } else if (ratesData) {
//         const rates = ratesData.data || ratesData;
//         setRateErrors((prev) => ({
//           ...prev,
//           [rateKey]: false
//         }));
//         setRoomRates((prev) => ({
//           ...prev,
//           [rateKey]: {
//             sharing: rates.sharing || 0,
//             quint: rates.quint || 0,
//             quad: rates.quad || 0,
//             triple: rates.triple || 0,
//             doble: rates.doble || 0
//           }
//         }));
//         setLoadingRates((prev) => ({
//           ...prev,
//           [rateKey]: false
//         }));
//       }
//     }
//   }, [ratesData, ratesError, selectedHotelForRates]);

//   // Calculate totals
//   const total_stay_days =
//     (parseInt(formData.makkah_nights) || 0) +
//     (parseInt(formData.madinah_nights) || 0) +
//     (parseInt(formData.makkah_nights1) || 0) +
//     (parseInt(formData.jeddah_nights) || 0);

//   const total_pax = (parseInt(formData.adult_count) || 0) + (parseInt(formData.child_count) || 0) + (parseInt(formData.infant_count) || 0);

//   const accommodationTotal = formData.accommodations.reduce((sum, item) => {
//     const nights = parseInt(item.no_of_nights) || 0;
//     const rooms = parseInt(item.no_of_rooms) || 0;
//     const rate = parseFloat(item.rate_per_night) || 0;
//     return sum + rooms * nights * rate;
//   }, 0);

//   const transportationTotal = formData.transportations.reduce(
//     (sum, item) => sum + (parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0),
//     0
//   );
//   const visaTotal = formData.visas.reduce((sum, item) => sum + (parseFloat(item.Rate) || 0) * (parseInt(item.Qty) || 0), 0);
//   const airlinesTotal = formData.airlines.reduce((sum, item) => sum + (parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0), 0);

//   const total_package_cost = accommodationTotal + transportationTotal + visaTotal + airlinesTotal;
//   const advance_amount = parseFloat(formData.advance_amount) || 0;
//   const grand_total = total_package_cost - advance_amount;
//   const cost_per_person = total_pax > 0 ? grand_total / total_pax : 0;

//   // Helper functions
//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const calculateNights = (checkIn, checkOut) => {
//     if (!checkIn || !checkOut) return '';
//     const start = new Date(checkIn);
//     const end = new Date(checkOut);
//     const diffTime = Math.abs(end - start);
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)).toString();
//   };

//   const calculateVisaRate = (quantity, isInfant = false) => {
//     const qty = parseInt(quantity) || 0;
//     if (isInfant) return '480';
//     if (qty >= 5) return '699';
//     if (qty === 4) return '800';
//     if (qty === 3) return '825';
//     if (qty === 2) return '850';
//     if (qty === 1) return '900';
//     return '';
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-PK', {
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2
//     }).format(amount || 0);
//   };

//   const formatDateForInput = (dateString) => {
//     if (!dateString) return '';
//     if (typeof dateString === 'string') {
//       return dateString.split('T')[0];
//     }
//     return dateString;
//   };

//   // Add this debug effect to check if ref is working
//   useEffect(() => {
//     console.log('Print ref current:', printRef.current);
//   }, [printRef.current]);
//   const handlePrint = useReactToPrint({
//     content: () => printRef.current, // Pass the ref directly
//     documentTitle: `Quotation_${formData.quotation_number || 'New_Quotation'}`,
//     onBeforeGetContent: () => {
//       setGeneratingPDF(true);
//       return Promise.resolve();
//     },
//     onAfterPrint: () => {
//       setGeneratingPDF(false);
//       showSnackbar('PDF opened in browser preview!', 'info');
//     },
//     onPrintError: (errorLocation, error) => {
//       console.error('Print error:', errorLocation, error);
//       setGeneratingPDF(false);
//       showSnackbar('Failed to generate PDF.', 'error');
//     }
//   });

//   // PDF Generation Function - CORRECTED
//   const generatePDF = async () => {
//     try {
//       setGeneratingPDF(true);

//       // Validate data
//       if (!formData.packgeID) {
//         showSnackbar('Please select a package first!', 'error');
//         setGeneratingPDF(false);
//         return;
//       }

//       // Ensure ref is available
//       if (!printRef.current) {
//         showSnackbar('PDF content not ready.', 'error');
//         setGeneratingPDF(false);
//         return;
//       }

//       // Trigger print
//       handlePrint();
//     } catch (error) {
//       console.error('Failed to generate PDF:', error);
//       setGeneratingPDF(false);
//       showSnackbar('Failed to generate PDF.', 'error');
//     }
//   };

//   // Handle client type change
//   const handleClientTypeChange = (event) => {
//     const newClientType = event.target.value;
//     setClientType(newClientType);

//     if (newClientType === 'new') {
//       setSelectedClientId('');
//       setFormData((prev) => ({
//         ...prev,
//         client_id: ''
//       }));
//     } else {
//       setNewClientData({
//         clientName: '',
//         contactNumber: '',
//         whatsappNumber: '',
//         groupHeadName: '',
//         groupHeadNumber: '',
//         cityOfResidence: '',
//         passportValidity: '',
//         specialRequirements: ''
//       });
//     }
//   };

//   // Handle new client input changes
//   const handleNewClientChange = (field, value) => {
//     setNewClientData((prev) => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   // Handle input changes for main form
//   const handleInputChange = async (section, index, field, value) => {
//     if (section === 'accommodations') {
//       const updatedItems = [...formData.accommodations];
//       updatedItems[index] = { ...updatedItems[index], [field]: value };

//       if (field === 'cityID') {
//         updatedItems[index].hotelID = '';
//         updatedItems[index].rate_per_night = '';
//         updatedItems[index].room_type = 'sharing';
//         setSelectedHotelForRates(null);

//         if (value) {
//           setLoadingHotels((prev) => ({ ...prev, [value]: true }));
//           setSelectedCityForHotels(value);
//         }
//       }

//       if (field === 'hotelID' && updatedItems[index].cityID) {
//         updatedItems[index].rate_per_night = '';
//         updatedItems[index].room_type = 'sharing';

//         if (value) {
//           const rateKey = `${updatedItems[index].cityID}-${value}`;
//           setRoomRates((prev) => ({
//             ...prev,
//             [rateKey]: null
//           }));
//           setLoadingRates((prev) => ({ ...prev, [rateKey]: true }));
//           setSelectedHotelForRates({
//             cityID: updatedItems[index].cityID,
//             hotelID: value
//           });
//         } else {
//           const rateKey = `${updatedItems[index].cityID}-${updatedItems[index].hotelID}`;
//           setRoomRates((prev) => ({
//             ...prev,
//             [rateKey]: null
//           }));
//         }
//       }

//       if (field === 'room_type' && updatedItems[index].cityID && updatedItems[index].hotelID) {
//         const rateKey = `${updatedItems[index].cityID}-${updatedItems[index].hotelID}`;
//         const rates = roomRates[rateKey];
//         if (rates && !rateErrors[rateKey]) {
//           const rate = rates[value] || 0;
//           updatedItems[index].rate_per_night = rate.toString();
//         } else {
//           updatedItems[index].rate_per_night = '';
//         }
//       }

//       if (['check_in', 'check_out'].includes(field)) {
//         const nights = calculateNights(
//           field === 'check_in' ? value : updatedItems[index].check_in,
//           field === 'check_out' ? value : updatedItems[index].check_out
//         );
//         updatedItems[index].no_of_nights = nights;
//       }

//       setFormData((prev) => ({ ...prev, accommodations: updatedItems }));
//     } else if (section === 'transportations') {
//       const updatedItems = [...formData.transportations];
//       updatedItems[index] = { ...updatedItems[index], [field]: value };
//       setFormData((prev) => ({ ...prev, transportations: updatedItems }));
//     } else if (section === 'visas') {
//       const updatedItems = [...formData.visas];
//       updatedItems[index] = { ...updatedItems[index], [field]: value };

//       if (field === 'Qty') {
//         const isInfant = updatedItems[index].Description === 'INFANT VISA';
//         const rate = isInfant ? '480' : calculateVisaRate(value);
//         updatedItems[index].Rate = rate;
//       } else if (field === 'Description') {
//         const isInfant = value === 'INFANT VISA';
//         const quantity = updatedItems[index].Qty || '';
//         const rate = isInfant ? '480' : calculateVisaRate(quantity);
//         updatedItems[index].Rate = rate;
//       }

//       setFormData((prev) => ({ ...prev, visas: updatedItems }));
//     } else if (section === 'airlines') {
//       const updatedItems = [...formData.airlines];
//       updatedItems[index] = { ...updatedItems[index], [field]: value };
//       setFormData((prev) => ({ ...prev, airlines: updatedItems }));
//     } else if (section === 'main') {
//       const updatedData = { ...formData, [field]: value };

//       if (['adult_count', 'child_count', 'infant_count'].includes(field)) {
//         const totalAdultsChildren = (parseInt(updatedData.adult_count) || 0) + (parseInt(updatedData.child_count) || 0);
//         const totalInfants = parseInt(updatedData.infant_count) || 0;

//         const updatedVisas = [...updatedData.visas];
//         const regularVisaIndex = updatedVisas.findIndex((v) => v.Description && v.Description !== 'INFANT VISA');
//         if (regularVisaIndex !== -1) {
//           updatedVisas[regularVisaIndex].Qty = totalAdultsChildren.toString();
//           updatedVisas[regularVisaIndex].Rate = calculateVisaRate(totalAdultsChildren.toString());
//         } else if (totalAdultsChildren > 0) {
//           updatedVisas.push({
//             Description: 'ONLY UMRA VISA',
//             Rate: calculateVisaRate(totalAdultsChildren.toString()),
//             Qty: totalAdultsChildren.toString()
//           });
//         }

//         const infantVisaIndex = updatedVisas.findIndex((v) => v.Description === 'INFANT VISA');
//         if (infantVisaIndex !== -1) {
//           updatedVisas[infantVisaIndex].Qty = totalInfants.toString();
//           updatedVisas[infantVisaIndex].Rate = '480';
//         } else if (totalInfants > 0) {
//           updatedVisas.push({
//             Description: 'INFANT VISA',
//             Rate: '480',
//             Qty: totalInfants.toString()
//           });
//         }

//         updatedData.visas = updatedVisas.filter((visa) => visa.Description || visa.Qty);
//       }

//       setFormData(updatedData);
//     }
//   };

//   // Add/Remove rows
//   const addAccommodation = () => {
//     setFormData((prev) => ({
//       ...prev,
//       accommodations: [
//         ...prev.accommodations,
//         {
//           cityID: '',
//           hotelID: '',
//           check_in: '',
//           check_out: '',
//           room_type: 'sharing',
//           no_of_rooms: '',
//           no_of_nights: '',
//           rate_per_night: ''
//         }
//       ]
//     }));
//   };

//   const addTransportation = () => {
//     setFormData((prev) => ({
//       ...prev,
//       transportations: [
//         ...prev.transportations,
//         {
//           vehicle_name: '',
//           capacity: '',
//           sectorID: '',
//           rate: '',
//           quantity: ''
//         }
//       ]
//     }));
//   };

//   const addVisa = () => {
//     setFormData((prev) => ({
//       ...prev,
//       visas: [
//         ...prev.visas,
//         {
//           Description: '',
//           Rate: '',
//           Qty: ''
//         }
//       ]
//     }));
//   };

//   const addAirline = () => {
//     setFormData((prev) => ({
//       ...prev,
//       airlines: [
//         ...prev.airlines,
//         {
//           carrier: '',
//           pax_count: '',
//           class: 'Economy',
//           sector: '',
//           rate: '',
//           quantity: ''
//         }
//       ]
//     }));
//   };

//   const removeRow = (section, index) => {
//     if (formData[section].length <= 1) return;
//     setFormData((prev) => ({
//       ...prev,
//       [section]: prev[section].filter((_, i) => i !== index)
//     }));
//   };

//   // Save quotation to backend
//   const saveQuotation = async () => {
//     try {
//       let clientId = formData.client_id;
//       console.log('clientId before processing:', clientId);

//       if (clientType === 'new') {
//         try {
//           const clientResult = await createClient({
//             clientName: newClientData.clientName,
//             contactNumber: newClientData.contactNumber,
//             whatsappNumber: newClientData.whatsappNumber,
//             groupHeadName: newClientData.groupHeadName,
//             groupHeadNumber: newClientData.groupHeadNumber,
//             cityOfResidence: newClientData.cityOfResidence,
//             passportValidity: newClientData.passportValidity,
//             specialRequirements: newClientData.specialRequirements
//           }).unwrap();

//           clientId = clientResult.data?.id || clientResult.data?.clientID || clientResult.id || clientResult.clientID;
//           console.log('New client created with ID:', clientId);
//         } catch (clientError) {
//           console.error('Failed to create client:', clientError);
//           showSnackbar('Failed to create client. Please check your data and try again.', 'error');
//           return;
//         }
//       } else {
//         clientId = selectedClientId;
//         console.log('Using existing client ID:', clientId);
//       }

//       if (!clientId || clientId === '' || clientId === 0) {
//         showSnackbar('Please select or create a client first.', 'error');
//         return;
//       }

//       console.log('Final client ID to be sent:', clientId);

//       const quotationData = {
//         client_id: parseInt(clientId),
//         traveling_details: formData.traveling_details || '',
//         packgeID: formData.packgeID ? parseInt(formData.packgeID) : 0,
//         reference_by: formData.reference_by || '',
//         makkah_nights: parseInt(formData.makkah_nights) || 0,
//         madinah_nights: parseInt(formData.madinah_nights) || 0,
//         makkah_nights1: formData.makkah_nights1 ? parseInt(formData.makkah_nights1) : null,
//         jeddah_nights: formData.jeddah_nights ? parseInt(formData.jeddah_nights) : null,
//         adult_count: formData.adult_count ? parseInt(formData.adult_count) : null,
//         child_count: formData.child_count ? parseInt(formData.child_count) : null,
//         infant_count: formData.infant_count ? parseInt(formData.infant_count) : null,
//         advance_amount: formData.advance_amount ? parseFloat(formData.advance_amount) : null,
//         status: formData.status || 'Draft',
//         Accommodations: formData.accommodations
//           .filter((acc) => acc.cityID && acc.hotelID)
//           .map((acc) => ({
//             cityID: parseInt(acc.cityID),
//             hotelID: parseInt(acc.hotelID),
//             check_in: acc.check_in,
//             check_out: acc.check_out,
//             room_type: acc.room_type,
//             no_of_rooms: parseInt(acc.no_of_rooms) || 0,
//             no_of_nights: parseInt(acc.no_of_nights) || 0,
//             rate_per_night: parseFloat(acc.rate_per_night) || 0
//           })),
//         Transportations: formData.transportations
//           .filter((trans) => trans.vehicle_name)
//           .map((trans) => ({
//             vehicle_name: trans.vehicle_name,
//             capacity: trans.capacity,
//             sectorID: trans.sectorID ? parseInt(trans.sectorID) : null,
//             rate: parseFloat(trans.rate) || 0,
//             quantity: parseInt(trans.quantity) || 0
//           })),
//         VisaServices: formData.visas
//           .filter((visa) => visa.Description)
//           .map((visa) => ({
//             Description: visa.Description,
//             Rate: parseFloat(visa.Rate) || 0,
//             Qty: parseInt(visa.Qty) || 0
//           })),
//         Airlines: formData.airlines
//           .filter((airline) => airline.carrier)
//           .map((airline) => ({
//             carrier: airline.carrier,
//             pax_count: parseInt(airline.pax_count) || 0,
//             class: airline.class,
//             sector: airline.sector,
//             rate: parseFloat(airline.rate) || 0,
//             quantity: parseInt(airline.quantity) || 0
//           }))
//       };

//       console.log('Final quotation data to send:', quotationData);

//       if (mode === 'create') {
//         const result = await createQuotation(quotationData).unwrap();
//         showSnackbar('Quotation created successfully!', 'success');
//         console.log('Created quotation:', result);
//       } else {
//         const updateData = {
//           ...quotationData,
//           modifyBy: user?.userID || 1
//         };

//         console.log('Updating quotation with ID:', quotation.id);
//         const result = await updateQuotation({
//           id: quotation.id,
//           ...updateData
//         }).unwrap();

//         showSnackbar('Quotation updated successfully!', 'success');
//         console.log('Updated quotation:', result);
//       }

//       if (onRefetch) onRefetch();
//       if (onCancel) onCancel();
//     } catch (error) {
//       console.error('Failed to save quotation:', error);
//       const errorMessage =
//         error.data?.message || error.data?.title || error.message || 'Failed to save quotation. Please check your data and try again.';
//       showSnackbar(errorMessage, 'error');
//     }
//   };

//   // Helper function to get hotels for a city
//   const getHotelsForCity = (cityID) => {
//     return hotelsByCity[cityID] || [];
//   };

//   // Helper function to get rates for a hotel
//   const getRatesForHotel = (cityID, hotelID) => {
//     const rateKey = `${cityID}-${hotelID}`;
//     if (rateErrors[rateKey]) {
//       return null;
//     }
//     return roomRates[rateKey] || null;
//   };

//   // Check if hotel has rates
//   const hasRatesForHotel = (cityID, hotelID) => {
//     const rateKey = `${cityID}-${hotelID}`;
//     return !rateErrors[rateKey] && roomRates[rateKey];
//   };

//   // Calculate accommodation total for a specific accommodation item
//   const calculateAccommodationTotal = (accommodation) => {
//     const nights = parseInt(accommodation.no_of_nights) || 0;
//     const rooms = parseInt(accommodation.no_of_rooms) || 0;
//     const rate = parseFloat(accommodation.rate_per_night) || 0;
//     return rooms * nights * rate;
//   };

//   // Calculate transportation total for a specific transportation item
//   const calculateTransportationTotal = (transportation) => {
//     return (parseFloat(transportation.rate) || 0) * (parseInt(transportation.quantity) || 0);
//   };

//   // Calculate visa total for a specific visa item
//   const calculateVisaTotal = (visa) => {
//     return (parseFloat(visa.Rate) || 0) * (parseInt(visa.Qty) || 0);
//   };

//   // Calculate airline total for a specific airline item
//   const calculateAirlineTotal = (airline) => {
//     return (parseFloat(airline.rate) || 0) * (parseInt(airline.quantity) || 0);
//   };

//   return (
//     <>
//       <Paper
//         elevation={2}
//         sx={{
//           p: { xs: 2, sm: 3 },
//           overflow: 'hidden',
//           background: theme.palette.background.paper,
//           border: `1px solid ${theme.palette.divider}`,
//           borderRadius: 2
//         }}
//       >
//         {/* Source Query Info Alert */}
//         {sourceQueryInfo && (
//           <Alert
//             severity="info"
//             sx={{ mb: 2 }}
//             action={
//               <Button color="inherit" size="small" onClick={() => setSourceQueryInfo(null)}>
//                 Dismiss
//               </Button>
//             }
//           >
//             This quotation is being created from Query #{sourceQueryInfo.number}. Client information and trip details have been pre-filled.
//           </Alert>
//         )}

//         {/* Client Information Card */}
//         <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
//           <CardContent>
//             <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
//               <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
//               Client Information
//             </Typography>

//             {/* Client Type Radio Buttons */}
//             <FormControl component="fieldset" sx={{ mb: 2 }}>
//               <RadioGroup row value={clientType} onChange={handleClientTypeChange}>
//                 <FormControlLabel value="existing" control={<Radio />} label="Existing Client" />
//                 <FormControlLabel value="new" control={<Radio />} label="New Client" />
//               </RadioGroup>
//             </FormControl>

//             <Grid container spacing={3}>
//               {clientType === 'existing' ? (
//                 <Grid item xs={12}>
//                   <FormControl fullWidth margin="normal" size="small">
//                     <InputLabel>Select Existing Client *</InputLabel>
//                     <Select
//                       value={selectedClientId}
//                       label="Select Existing Client *"
//                       onChange={(e) => setSelectedClientId(e.target.value)}
//                       variant="outlined"
//                       required
//                     >
//                       <MenuItem value="">Select Client</MenuItem>
//                       {Array.isArray(clientsData) &&
//                         clientsData.map((client) => (
//                           <MenuItem key={client.clientID || client.id} value={client.clientID || client.id}>
//                             {client.clientName} - {client.contactNumber} {client.cityOfResidence ? `- ${client.cityOfResidence}` : ''}
//                           </MenuItem>
//                         ))}
//                     </Select>
//                   </FormControl>
//                 </Grid>
//               ) : (
//                 <>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       fullWidth
//                       label="Client Full Name *"
//                       value={newClientData.clientName}
//                       onChange={(e) => handleNewClientChange('clientName', e.target.value)}
//                       margin="normal"
//                       size="small"
//                       variant="outlined"
//                       required
//                       placeholder="Enter client full name"
//                     />
//                     <TextField
//                       fullWidth
//                       label="Contact Number *"
//                       value={newClientData.contactNumber}
//                       onChange={(e) => handleNewClientChange('contactNumber', e.target.value)}
//                       margin="normal"
//                       size="small"
//                       variant="outlined"
//                       required
//                       placeholder="Enter contact number"
//                     />
//                     <TextField
//                       fullWidth
//                       label="WhatsApp Number"
//                       value={newClientData.whatsappNumber}
//                       onChange={(e) => handleNewClientChange('whatsappNumber', e.target.value)}
//                       margin="normal"
//                       size="small"
//                       variant="outlined"
//                       placeholder="Enter WhatsApp number"
//                     />
//                     <TextField
//                       fullWidth
//                       label="Group Head Name"
//                       value={newClientData.groupHeadName}
//                       onChange={(e) => handleNewClientChange('groupHeadName', e.target.value)}
//                       margin="normal"
//                       size="small"
//                       variant="outlined"
//                       placeholder="Enter group head name"
//                     />
//                   </Grid>
//                   <Grid item xs={12} md={6}>
//                     <TextField
//                       fullWidth
//                       label="Group Head Number"
//                       value={newClientData.groupHeadNumber}
//                       onChange={(e) => handleNewClientChange('groupHeadNumber', e.target.value)}
//                       margin="normal"
//                       size="small"
//                       variant="outlined"
//                       placeholder="Enter group head number"
//                     />
//                     <TextField
//                       fullWidth
//                       label="City of Residence"
//                       value={newClientData.cityOfResidence}
//                       onChange={(e) => handleNewClientChange('cityOfResidence', e.target.value)}
//                       margin="normal"
//                       size="small"
//                       variant="outlined"
//                       placeholder="Enter city of residence"
//                     />
//                     <TextField
//                       fullWidth
//                       label="Passport Validity"
//                       type="date"
//                       value={newClientData.passportValidity}
//                       onChange={(e) => handleNewClientChange('passportValidity', e.target.value)}
//                       margin="normal"
//                       size="small"
//                       variant="outlined"
//                       InputLabelProps={{ shrink: true }}
//                     />
//                     <TextField
//                       fullWidth
//                       label="Special Requirements"
//                       value={newClientData.specialRequirements}
//                       onChange={(e) => handleNewClientChange('specialRequirements', e.target.value)}
//                       margin="normal"
//                       size="small"
//                       variant="outlined"
//                       multiline
//                       rows={2}
//                       placeholder="Enter any special requirements"
//                     />
//                   </Grid>
//                 </>
//               )}

//               {/* Common fields for both client types */}
//               <Grid item xs={12}>
//                 <TextField
//                   fullWidth
//                   label="Traveling Details"
//                   value={formData.traveling_details || ''}
//                   onChange={(e) => handleInputChange('main', null, 'traveling_details', e.target.value)}
//                   margin="normal"
//                   size="small"
//                   variant="outlined"
//                   multiline
//                   rows={2}
//                   placeholder="Enter traveling details"
//                 />
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <FormControl fullWidth margin="normal" size="small">
//                   <InputLabel>Package Type *</InputLabel>
//                   <Select
//                     value={formData.packgeID || ''}
//                     label="Package Type *"
//                     onChange={(e) => handleInputChange('main', null, 'packgeID', e.target.value)}
//                     variant="outlined"
//                     required
//                   >
//                     <MenuItem value="">Select Package</MenuItem>
//                     {Array.isArray(packagesData) &&
//                       packagesData.map((packageItem) => (
//                         <MenuItem key={packageItem.packgeID || packageItem.id} value={packageItem.packgeID || packageItem.id}>
//                           {packageItem.PackgeTitle || packageItem.packgeTitle}
//                         </MenuItem>
//                       ))}
//                   </Select>
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Reference By"
//                   value={formData.reference_by || ''}
//                   onChange={(e) => handleInputChange('main', null, 'reference_by', e.target.value)}
//                   margin="normal"
//                   size="small"
//                   variant="outlined"
//                   placeholder="Enter reference name"
//                 />
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>

//         {/* Trip Breakdown Card */}
//         <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
//           <CardContent>
//             <Typography
//               variant="h6"
//               gutterBottom
//               sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}
//             >
//               <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
//               Trip Break-Up (In Nights)
//             </Typography>
//             <Grid container spacing={2} sx={{ mt: 1 }}>
//               <Grid item xs={12}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
//                   {[
//                     { label: 'MAKKAH', value: formData.makkah_nights || '', field: 'makkah_nights', placeholder: '0' },
//                     { label: 'MADINAH', value: formData.madinah_nights || '', field: 'madinah_nights', placeholder: '0' },
//                     { label: 'MAKKAH (2nd)', value: formData.makkah_nights1 || '', field: 'makkah_nights1', placeholder: '0' },
//                     { label: 'JEDDAH', value: formData.jeddah_nights || '', field: 'jeddah_nights', placeholder: '0' },
//                     { label: 'TOTAL STAY', value: total_stay_days, readOnly: true, placeholder: '0' }
//                   ].map((item, index) => (
//                     <Box key={index} sx={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
//                       <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" gutterBottom>
//                         {item.label}
//                       </Typography>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         value={item.value}
//                         onChange={(e) => !item.readOnly && handleInputChange('main', null, item.field, e.target.value)}
//                         size="small"
//                         inputProps={{
//                           min: 0,
//                           readOnly: item.readOnly,
//                           style: { textAlign: 'center', fontWeight: 'bold' }
//                         }}
//                         placeholder={item.placeholder}
//                         sx={{
//                           '& .MuiInputBase-input': {
//                             textAlign: 'center',
//                             fontWeight: item.readOnly ? 'bold' : 'normal',
//                             color: item.readOnly ? theme.palette.primary.main : 'inherit'
//                           },
//                           '& .MuiInputBase-root': {
//                             minWidth: '80px',
//                             width: 'auto'
//                           }
//                         }}
//                       />
//                     </Box>
//                   ))}
//                 </Box>
//               </Grid>
//             </Grid>

//             {/* Passenger Counts in second row */}
//             <Grid container spacing={2} sx={{ mt: 2 }}>
//               <Grid item xs={12}>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
//                   {[
//                     { label: 'ADULT', value: formData.adult_count || '', field: 'adult_count', placeholder: '0' },
//                     { label: 'CHILD', value: formData.child_count || '', field: 'child_count', placeholder: '0' },
//                     { label: 'INFANT', value: formData.infant_count || '', field: 'infant_count', placeholder: '0' },
//                     { label: 'TOTAL PAX', value: total_pax, readOnly: true, placeholder: '0' }
//                   ].map((item, index) => (
//                     <Box key={index} sx={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
//                       <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" gutterBottom>
//                         {item.label}
//                       </Typography>
//                       <TextField
//                         fullWidth
//                         type="number"
//                         value={item.value}
//                         onChange={(e) => !item.readOnly && handleInputChange('main', null, item.field, e.target.value)}
//                         size="small"
//                         inputProps={{
//                           min: 0,
//                           readOnly: item.readOnly,
//                           style: { textAlign: 'center', fontWeight: 'bold' }
//                         }}
//                         placeholder={item.placeholder}
//                         sx={{
//                           '& .MuiInputBase-input': {
//                             textAlign: 'center',
//                             fontWeight: item.readOnly ? 'bold' : 'normal',
//                             color: item.readOnly ? theme.palette.primary.main : 'inherit'
//                           },
//                           '& .MuiInputBase-root': {
//                             minWidth: '80px',
//                             width: 'auto'
//                           }
//                         }}
//                       />
//                     </Box>
//                   ))}
//                 </Box>
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>

//         {/* Advance Amount Card */}
//         <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
//           <CardContent>
//             <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
//               <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
//               Advance Payment
//             </Typography>
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   label="Advance Amount (PKR)"
//                   type="number"
//                   value={formData.advance_amount || ''}
//                   onChange={(e) => handleInputChange('main', null, 'advance_amount', e.target.value)}
//                   size="small"
//                   inputProps={{ min: 0 }}
//                   placeholder="Enter advance amount"
//                 />
//               </Grid>
//               <Grid item xs={12} md={6}>
//                 <Box sx={{ textAlign: 'center', p: 2, background: theme.palette.grey[100], borderRadius: 1 }}>
//                   <Typography variant="body2" color="text.secondary">
//                     Remaining Amount
//                   </Typography>
//                   <Typography variant="h6" color="primary" fontWeight="bold">
//                     {formatCurrency(grand_total)}
//                   </Typography>
//                 </Box>
//               </Grid>
//             </Grid>
//           </CardContent>
//         </Card>

//         {/* Accommodation Details */}
//         <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
//           <CardContent>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//               <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
//                 <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
//                 Accommodation Details
//               </Typography>
//               <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={addAccommodation} sx={{ borderRadius: 2 }}>
//                 Add Room
//               </Button>
//             </Box>

//             <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 1 }}>
//               <Table size="small" sx={{ minWidth: 1000 }}>
//                 <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
//                   <TableRow>
//                     {[
//                       'City',
//                       'Hotel Name',
//                       'Check In',
//                       'Check Out',
//                       'Room Type',
//                       'Rooms',
//                       'Nights',
//                       'Rate/Night',
//                       'Total (Rs.)',
//                       'Actions'
//                     ].map((header, index) => (
//                       <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
//                         {header}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {formData.accommodations.map((row, index) => {
//                     const isHotelLoading = loadingHotels[row.cityID];
//                     const rateKey = `${row.cityID}-${row.hotelID}`;
//                     const isRateLoading = loadingRates[rateKey];
//                     const currentRates = getRatesForHotel(row.cityID, row.hotelID);
//                     const hasRates = hasRatesForHotel(row.cityID, row.hotelID);
//                     const rowTotal = calculateAccommodationTotal(row);
//                     const hotels = getHotelsForCity(row.cityID);

//                     return (
//                       <TableRow
//                         key={index}
//                         sx={{
//                           '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
//                           '&:hover': { backgroundColor: theme.palette.action.selected }
//                         }}
//                       >
//                         <TableCell>
//                           <FormControl fullWidth size="small">
//                             <Select
//                               value={row.cityID || ''}
//                               onChange={(e) => handleInputChange('accommodations', index, 'cityID', e.target.value)}
//                               sx={{ borderRadius: 1 }}
//                             >
//                               <MenuItem value="">Select City</MenuItem>
//                               {Array.isArray(citiesData) &&
//                                 citiesData.map((city) => (
//                                   <MenuItem key={city.cityID} value={city.cityID}>
//                                     {city.cityName}
//                                   </MenuItem>
//                                 ))}
//                             </Select>
//                           </FormControl>
//                         </TableCell>
//                         <TableCell>
//                           <FormControl fullWidth size="small">
//                             {isHotelLoading ? (
//                               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
//                                 <CircularProgress size={20} />
//                               </Box>
//                             ) : (
//                               <Select
//                                 value={row.hotelID || ''}
//                                 onChange={(e) => handleInputChange('accommodations', index, 'hotelID', e.target.value)}
//                                 sx={{ borderRadius: 1 }}
//                                 disabled={!row.cityID}
//                               >
//                                 <MenuItem value="">Select Hotel</MenuItem>
//                                 {hotels.map((hotel) => (
//                                   <MenuItem key={hotel.hotelID} value={hotel.hotelID}>
//                                     {hotel.hotelName}
//                                   </MenuItem>
//                                 ))}
//                               </Select>
//                             )}
//                           </FormControl>
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="date"
//                             value={formatDateForInput(row.check_in)}
//                             onChange={(e) => {
//                               handleInputChange('accommodations', index, 'check_in', e.target.value);
//                             }}
//                             size="small"
//                             InputLabelProps={{ shrink: true }}
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-input': {
//                                 padding: '8.5px 14px',
//                                 fontSize: '0.875rem'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="date"
//                             value={formatDateForInput(row.check_out)}
//                             onChange={(e) => {
//                               handleInputChange('accommodations', index, 'check_out', e.target.value);
//                             }}
//                             size="small"
//                             InputLabelProps={{ shrink: true }}
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-input': {
//                                 padding: '8.5px 14px',
//                                 fontSize: '0.875rem'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <FormControl fullWidth size="small">
//                             <Select
//                               value={row.room_type || 'sharing'}
//                               onChange={(e) => handleInputChange('accommodations', index, 'room_type', e.target.value)}
//                               sx={{ borderRadius: 1 }}
//                               disabled={!row.cityID || !row.hotelID || !hasRates}
//                             >
//                               {roomTypes.map((type) => (
//                                 <MenuItem key={type} value={type}>
//                                   {type.toUpperCase()}
//                                   {currentRates && currentRates[type] ? `- ${formatCurrency(currentRates[type])}` : ' - No rates available'}
//                                 </MenuItem>
//                               ))}
//                             </Select>
//                           </FormControl>
//                           {row.cityID && row.hotelID && !hasRates && !isRateLoading && (
//                             <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
//                               No rates available for this hotel
//                             </Typography>
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="number"
//                             value={row.no_of_rooms || ''}
//                             onChange={(e) => handleInputChange('accommodations', index, 'no_of_rooms', e.target.value)}
//                             size="small"
//                             inputProps={{
//                               min: 0,
//                               style: {
//                                 textAlign: 'center',
//                                 fontWeight: 'bold',
//                                 fontSize: '0.875rem',
//                                 padding: '8.5px 14px'
//                               }
//                             }}
//                             placeholder="1"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '60px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 textAlign: 'center',
//                                 fontWeight: 'bold',
//                                 backgroundColor: theme.palette.grey[50],
//                                 border: `1px solid ${theme.palette.grey[300]}`,
//                                 borderRadius: 1,
//                                 '&:focus': {
//                                   backgroundColor: theme.palette.common.white,
//                                   borderColor: theme.palette.primary.main
//                                 }
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="number"
//                             value={row.no_of_nights || ''}
//                             onChange={(e) => handleInputChange('accommodations', index, 'no_of_nights', e.target.value)}
//                             size="small"
//                             inputProps={{
//                               min: 0,
//                               style: {
//                                 textAlign: 'center',
//                                 fontWeight: 'bold',
//                                 fontSize: '0.875rem',
//                                 padding: '8.5px 14px'
//                               }
//                             }}
//                             placeholder="1"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '60px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 textAlign: 'center',
//                                 fontWeight: 'bold',
//                                 backgroundColor: theme.palette.grey[50],
//                                 border: `1px solid ${theme.palette.grey[300]}`,
//                                 borderRadius: 1,
//                                 '&:focus': {
//                                   backgroundColor: theme.palette.common.white,
//                                   borderColor: theme.palette.primary.main
//                                 }
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           {isRateLoading ? (
//                             <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
//                               <CircularProgress size={20} />
//                             </Box>
//                           ) : (
//                             <TextField
//                               type="number"
//                               value={row.rate_per_night || ''}
//                               onChange={(e) => handleInputChange('accommodations', index, 'rate_per_night', e.target.value)}
//                               size="small"
//                               inputProps={{
//                                 min: 0,
//                                 style: {
//                                   textAlign: 'center',
//                                   fontWeight: 'bold',
//                                   fontSize: '0.875rem',
//                                   padding: '8.5px 14px'
//                                 }
//                               }}
//                               placeholder="0"
//                               sx={{
//                                 borderRadius: 1,
//                                 '& .MuiInputBase-root': {
//                                   minWidth: '70px',
//                                   width: 'auto'
//                                 },
//                                 '& .MuiInputBase-input': {
//                                   textAlign: 'center',
//                                   fontWeight: 'bold',
//                                   backgroundColor: hasRates ? theme.palette.grey[50] : theme.palette.error.light,
//                                   border: `1px solid ${hasRates ? theme.palette.grey[300] : theme.palette.error.main}`,
//                                   borderRadius: 1,
//                                   color: hasRates ? theme.palette.primary.main : theme.palette.error.dark,
//                                   '&:focus': {
//                                     backgroundColor: theme.palette.common.white,
//                                     borderColor: theme.palette.primary.main
//                                   }
//                                 }
//                               }}
//                             />
//                           )}
//                         </TableCell>
//                         <TableCell>
//                           <Chip
//                             label={formatCurrency(rowTotal)}
//                             color={hasRates ? 'primary' : 'error'}
//                             variant="filled"
//                             sx={{
//                               fontWeight: 'bold',
//                               minWidth: 100,
//                               fontSize: '0.875rem',
//                               height: '32px',
//                               '& .MuiChip-label': {
//                                 px: 2,
//                                 fontWeight: 'bold'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Tooltip title={formData.accommodations.length <= 1 ? 'Cannot remove the only accommodation' : 'Remove'}>
//                             <span>
//                               <IconButton
//                                 size="small"
//                                 color="error"
//                                 onClick={() => removeRow('accommodations', index)}
//                                 sx={{ borderRadius: 1 }}
//                                 disabled={formData.accommodations.length <= 1}
//                               >
//                                 <DeleteIcon />
//                               </IconButton>
//                             </span>
//                           </Tooltip>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//                 <TableFooter>
//                   <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
//                     <TableCell colSpan={8} align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
//                       Total Accommodation:
//                     </TableCell>
//                     <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.primary.main }}>
//                       {formatCurrency(accommodationTotal)}
//                     </TableCell>
//                   </TableRow>
//                 </TableFooter>
//               </Table>
//             </TableContainer>
//             <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic', color: 'text.secondary' }}>
//               Note: Rooms are subject to availability & rates may change. Check-in & out time as per Hotel Policy.
//             </Typography>
//           </CardContent>
//         </Card>

//         {/* Transportation Services */}
//         <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
//           <CardContent>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//               <Typography
//                 variant="h6"
//                 sx={{ color: theme.palette.secondary.main, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
//               >
//                 <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.secondary.main, borderRadius: 1 }} />
//                 Transportation Services + Ziarat
//               </Typography>
//               <Button
//                 startIcon={<AddIcon />}
//                 variant="contained"
//                 size="small"
//                 onClick={addTransportation}
//                 sx={{
//                   borderRadius: 2,
//                   backgroundColor: theme.palette.secondary.main,
//                   '&:hover': {
//                     backgroundColor: theme.palette.secondary.dark
//                   }
//                 }}
//               >
//                 Add Vehicle
//               </Button>
//             </Box>
//             <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 1 }}>
//               <Table size="small" sx={{ minWidth: 800 }}>
//                 <TableHead sx={{ backgroundColor: theme.palette.secondary.main }}>
//                   <TableRow>
//                     {['Vehicle', 'Capacity', 'Sector', 'Rate', 'Quantity', 'Total Price', 'Actions'].map((header, index) => (
//                       <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
//                         {header}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {formData.transportations.map((row, index) => {
//                     const rowTotal = calculateTransportationTotal(row);
//                     return (
//                       <TableRow
//                         key={index}
//                         sx={{
//                           '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
//                           '&:hover': { backgroundColor: theme.palette.action.selected }
//                         }}
//                       >
//                         <TableCell>
//                           <TextField
//                             value={row.vehicle_name || ''}
//                             onChange={(e) => handleInputChange('transportations', index, 'vehicle_name', e.target.value)}
//                             size="small"
//                             fullWidth
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '200px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 padding: '8.5px 14px'
//                               }
//                             }}
//                             // sx={{ borderRadius: 1 }}
//                             placeholder="e.g., Jed Airport to Mak Hotel"
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             value={row.capacity || ''}
//                             onChange={(e) => handleInputChange('transportations', index, 'capacity', e.target.value)}
//                             size="small"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '200px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 padding: '8.5px 14px'
//                               }
//                             }}
//                             placeholder="e.g., 8 PAX (Hiace)"
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <FormControl fullWidth size="small">
//                             <Select
//                               value={row.sectorID || ''}
//                               onChange={(e) => handleInputChange('transportations', index, 'sectorID', e.target.value)}
//                               sx={{ borderRadius: 1 }}
//                             >
//                               <MenuItem value="">Select Sector</MenuItem>
//                               {Array.isArray(sectorsData) &&
//                                 sectorsData.map((sector) => (
//                                   <MenuItem key={sector.sectorID} value={sector.sectorID}>
//                                     {sector.sectorName}
//                                   </MenuItem>
//                                 ))}
//                             </Select>
//                           </FormControl>
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="number"
//                             value={row.rate || ''}
//                             onChange={(e) => handleInputChange('transportations', index, 'rate', e.target.value)}
//                             size="small"
//                             inputProps={{ min: 0, style: { textAlign: 'center' } }}
//                             placeholder="0"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '80px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 textAlign: 'center'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="number"
//                             value={row.quantity || ''}
//                             onChange={(e) => handleInputChange('transportations', index, 'quantity', e.target.value)}
//                             size="small"
//                             inputProps={{ min: 0, style: { textAlign: 'center' } }}
//                             placeholder="1"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '70px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 textAlign: 'center'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Chip
//                             label={formatCurrency(rowTotal)}
//                             color="secondary"
//                             variant="filled"
//                             sx={{
//                               fontWeight: 'bold',
//                               minWidth: 100,
//                               '& .MuiChip-label': {
//                                 px: 2
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Tooltip title={formData.transportations.length <= 1 ? 'Cannot remove the only transportation' : 'Remove'}>
//                             <span>
//                               <IconButton
//                                 size="small"
//                                 color="error"
//                                 onClick={() => removeRow('transportations', index)}
//                                 sx={{ borderRadius: 1 }}
//                                 disabled={formData.transportations.length <= 1}
//                               >
//                                 <DeleteIcon />
//                               </IconButton>
//                             </span>
//                           </Tooltip>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//                 <TableFooter>
//                   <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
//                     <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
//                       Total Transportation:
//                     </TableCell>
//                     <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.secondary.main }}>
//                       {formatCurrency(transportationTotal)}
//                     </TableCell>
//                   </TableRow>
//                 </TableFooter>
//               </Table>
//             </TableContainer>
//           </CardContent>
//         </Card>

//         {/* Visa Services */}
//         <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
//           <CardContent>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//               <Typography
//                 variant="h6"
//                 sx={{ color: theme.palette.info.main, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
//               >
//                 <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.info.main, borderRadius: 1 }} />
//                 Visa Services
//               </Typography>
//               <Button
//                 startIcon={<AddIcon />}
//                 variant="contained"
//                 size="small"
//                 onClick={addVisa}
//                 sx={{
//                   borderRadius: 2,
//                   backgroundColor: theme.palette.info.main,
//                   '&:hover': {
//                     backgroundColor: theme.palette.info.dark
//                   }
//                 }}
//               >
//                 Add Visa Service
//               </Button>
//             </Box>
//             <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 1 }}>
//               <Table size="small" sx={{ minWidth: 600 }}>
//                 <TableHead sx={{ backgroundColor: theme.palette.info.main }}>
//                   <TableRow>
//                     {['Services Description', 'Rate', 'Quantity', 'Total Price (Rs)', 'Actions'].map((header, index) => (
//                       <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
//                         {header}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {formData.visas.map((row, index) => {
//                     const rowTotal = calculateVisaTotal(row);
//                     return (
//                       <TableRow
//                         key={index}
//                         sx={{
//                           '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
//                           '&:hover': { backgroundColor: theme.palette.action.selected }
//                         }}
//                       >
//                         <TableCell>
//                           <TextField
//                             value={row.Description || ''}
//                             onChange={(e) => handleInputChange('visas', index, 'Description', e.target.value)}
//                             size="small"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '200px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 padding: '8.5px 14px'
//                               }
//                             }}
//                             placeholder="e.g., ONLY UMRA VISA"
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="number"
//                             value={row.Rate || ''}
//                             size="small"
//                             inputProps={{
//                               min: 0,
//                               style: { textAlign: 'center' },
//                               readOnly: true
//                             }}
//                             placeholder="0"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '100px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 backgroundColor: theme.palette.grey[100],
//                                 fontWeight: 'bold',
//                                 color: theme.palette.info.main,
//                                 textAlign: 'center'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="number"
//                             value={row.Qty || ''}
//                             onChange={(e) => handleInputChange('visas', index, 'Qty', e.target.value)}
//                             size="small"
//                             inputProps={{ min: 0, style: { textAlign: 'center' } }}
//                             placeholder="0"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '80px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 textAlign: 'center'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Chip
//                             label={formatCurrency(rowTotal)}
//                             color="info"
//                             variant="filled"
//                             sx={{
//                               fontWeight: 'bold',
//                               minWidth: 120,
//                               '& .MuiChip-label': {
//                                 px: 2
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Tooltip title={formData.visas.length <= 1 ? 'Cannot remove the only visa service' : 'Remove'}>
//                             <span>
//                               <IconButton
//                                 size="small"
//                                 color="error"
//                                 onClick={() => removeRow('visas', index)}
//                                 sx={{ borderRadius: 1 }}
//                                 disabled={formData.visas.length <= 1}
//                               >
//                                 <DeleteIcon />
//                               </IconButton>
//                             </span>
//                           </Tooltip>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//                 <TableFooter>
//                   <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
//                     <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
//                       Total Visa Charges:
//                     </TableCell>
//                     <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.info.main }}>
//                       {formatCurrency(visaTotal)}
//                     </TableCell>
//                   </TableRow>
//                 </TableFooter>
//               </Table>
//             </TableContainer>
//             <Typography
//               variant="caption"
//               sx={{ mt: 1, display: 'block', fontStyle: 'italic', color: 'text.secondary', textAlign: 'center' }}
//             >
//               Note: In case of rejection visa charges will be enclosed.
//             </Typography>
//           </CardContent>
//         </Card>

//         {/* Airline Services */}
//         <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
//           <CardContent>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//               <Typography
//                 variant="h6"
//                 sx={{ color: theme.palette.warning.main, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
//               >
//                 <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.warning.main, borderRadius: 1 }} />
//                 Airline Services
//               </Typography>
//               <Button
//                 startIcon={<AddIcon />}
//                 variant="contained"
//                 size="small"
//                 onClick={addAirline}
//                 sx={{
//                   borderRadius: 2,
//                   backgroundColor: theme.palette.warning.main,
//                   '&:hover': {
//                     backgroundColor: theme.palette.warning.dark
//                   }
//                 }}
//               >
//                 Add Airline
//               </Button>
//             </Box>
//             <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 1 }}>
//               <Table size="small" sx={{ minWidth: 800 }}>
//                 <TableHead sx={{ backgroundColor: theme.palette.warning.main }}>
//                   <TableRow>
//                     {['Carrier', 'Class', 'Sector', 'Pax Count', 'Rate', 'Quantity', 'Total Price', 'Actions'].map((header, index) => (
//                       <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
//                         {header}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {formData.airlines.map((row, index) => {
//                     const rowTotal = calculateAirlineTotal(row);
//                     return (
//                       <TableRow
//                         key={index}
//                         sx={{
//                           '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
//                           '&:hover': { backgroundColor: theme.palette.action.selected }
//                         }}
//                       >
//                         <TableCell>
//                           <TextField
//                             value={row.carrier || ''}
//                             onChange={(e) => handleInputChange('airlines', index, 'carrier', e.target.value)}
//                             size="small"
//                             fullWidth
//                             sx={{ borderRadius: 1 }}
//                             placeholder="e.g., Saudi Airlines"
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <FormControl fullWidth size="small">
//                             <Select
//                               value={row.class || 'Economy'}
//                               onChange={(e) => handleInputChange('airlines', index, 'class', e.target.value)}
//                               sx={{ borderRadius: 1 }}
//                             >
//                               {airlineClasses.map((cls) => (
//                                 <MenuItem key={cls} value={cls}>
//                                   {cls}
//                                 </MenuItem>
//                               ))}
//                             </Select>
//                           </FormControl>
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             value={row.sector || ''}
//                             onChange={(e) => handleInputChange('airlines', index, 'sector', e.target.value)}
//                             size="small"
//                             fullWidth
//                             sx={{ borderRadius: 1 }}
//                             placeholder="e.g., KHI{'>'}JED"
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="number"
//                             value={row.pax_count || ''}
//                             onChange={(e) => handleInputChange('airlines', index, 'pax_count', e.target.value)}
//                             size="small"
//                             inputProps={{ min: 0, style: { textAlign: 'center' } }}
//                             placeholder="0"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '100px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 textAlign: 'center'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="number"
//                             value={row.rate || ''}
//                             onChange={(e) => handleInputChange('airlines', index, 'rate', e.target.value)}
//                             size="small"
//                             inputProps={{ min: 0, style: { textAlign: 'center' } }}
//                             placeholder="0"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '100px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 textAlign: 'center'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <TextField
//                             type="number"
//                             value={row.quantity || ''}
//                             onChange={(e) => handleInputChange('airlines', index, 'quantity', e.target.value)}
//                             size="small"
//                             inputProps={{ min: 0, style: { textAlign: 'center' } }}
//                             placeholder="1"
//                             sx={{
//                               borderRadius: 1,
//                               '& .MuiInputBase-root': {
//                                 minWidth: '80px',
//                                 width: 'auto'
//                               },
//                               '& .MuiInputBase-input': {
//                                 textAlign: 'center'
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Chip
//                             label={formatCurrency(rowTotal)}
//                             color="warning"
//                             variant="filled"
//                             sx={{
//                               fontWeight: 'bold',
//                               minWidth: 120,
//                               '& .MuiChip-label': {
//                                 px: 2
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>
//                           <Tooltip title={formData.airlines.length <= 1 ? 'Cannot remove the only airline' : 'Remove'}>
//                             <span>
//                               <IconButton
//                                 size="small"
//                                 color="error"
//                                 onClick={() => removeRow('airlines', index)}
//                                 sx={{ borderRadius: 1 }}
//                                 disabled={formData.airlines.length <= 1}
//                               >
//                                 <DeleteIcon />
//                               </IconButton>
//                             </span>
//                           </Tooltip>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//                 <TableFooter>
//                   <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
//                     <TableCell colSpan={6} align="right" sx={{ fontWeight: 'bold' }}>
//                       Total Airlines:
//                     </TableCell>
//                     <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.warning.main }}>
//                       {formatCurrency(airlinesTotal)}
//                     </TableCell>
//                   </TableRow>
//                 </TableFooter>
//               </Table>
//             </TableContainer>
//           </CardContent>
//         </Card>

//         {/* Total Summary */}
//         <Card
//           sx={{
//             background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
//             color: 'white',
//             boxShadow: theme.shadows[8]
//           }}
//         >
//           <CardContent>
//             <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" sx={{ mb: 3 }}>
//               Total Package Cost Summary
//             </Typography>
//             <Grid container spacing={3}>
//               {[
//                 { label: 'Total Package Cost', value: total_package_cost, color: 'white' },
//                 { label: 'Advance', value: advance_amount, color: 'white' },
//                 { label: 'Grand Total Amount', value: grand_total, color: theme.palette.warning.light },
//                 { label: 'Cost Per Person', value: Math.round(cost_per_person), color: theme.palette.success.light }
//               ].map((item, index) => (
//                 <Grid item xs={12} sm={6} md={3} key={index}>
//                   <Box
//                     sx={{
//                       textAlign: 'center',
//                       p: 2,
//                       background: 'rgba(255, 255, 255, 0.1)',
//                       borderRadius: 2,
//                       backdropFilter: 'blur(10px)'
//                     }}
//                   >
//                     <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
//                       {item.label}
//                     </Typography>
//                     <Typography variant="h5" fontWeight="bold" sx={{ color: item.color }}>
//                       (PKR) {formatCurrency(item.value)}
//                     </Typography>
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>
//           </CardContent>
//         </Card>

//         {/* Footer Notes */}
//         <Box
//           sx={{
//             mt: 3,
//             p: 2,
//             background: theme.palette.warning.light,
//             borderRadius: 2,
//             border: `1px solid ${theme.palette.warning.main}`
//           }}
//         >
//           <Typography variant="body2" textAlign="center" sx={{ color: theme.palette.warning.dark }}>
//             <strong>REMARKS:</strong> Ticket and Room rates are subject to change without prior notice and subject to availability. Room
//             rates may change due to USD rates.
//           </Typography>
//         </Box>

//         {/* Action Buttons */}
//         <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
//           <Tooltip title="Open PDF in browser preview - Use browser's Save as PDF option to download">
//             <Button
//               variant="outlined"
//               color="secondary"
//               startIcon={generatingPDF ? <CircularProgress size={20} /> : <PdfIcon />}
//               onClick={generatePDF}
//               disabled={generatingPDF || !formData.packgeID}
//               sx={{ minWidth: '140px' }}
//             >
//               {generatingPDF ? 'Opening Preview...' : 'Preview PDF'}
//             </Button>
//           </Tooltip>

//           <Button variant="outlined" onClick={onCancel}>
//             Cancel
//           </Button>

//           <Button
//             variant="contained"
//             startIcon={creatingQuotation || updatingQuotation || creatingClient ? <CircularProgress size={20} /> : <SaveIcon />}
//             onClick={saveQuotation}
//             disabled={
//               creatingQuotation ||
//               updatingQuotation ||
//               creatingClient ||
//               !formData.packgeID ||
//               (clientType === 'existing' && !selectedClientId) ||
//               (clientType === 'new' && !newClientData.clientName)
//             }
//           >
//             {creatingQuotation || updatingQuotation || creatingClient
//               ? 'Saving...'
//               : mode === 'create'
//                 ? 'Save Quotation'
//                 : 'Update Quotation'}
//           </Button>
//         </Box>
//       </Paper>

//       <div style={{}}>
//         <QuotationPrintView
//           ref={printRef}
//           formData={formData}
//           clientInfo={clientType === 'existing' ? selectedClient : null}
//           packageInfo={!packagesLoading && packagesData?.find((p) => (p.packgeID || p.id) === formData.packgeID)}
//           citiesData={citiesData}
//           hotelsData={hotelsData}
//           sectorsData={sectorsData}
//           clientType={clientType}
//           newClientData={newClientData}
//           total_package_cost={total_package_cost}
//           advance_amount={advance_amount}
//           grand_total={grand_total}
//           cost_per_person={cost_per_person}
//           total_stay_days={total_stay_days}
//           total_pax={total_pax}
//           accommodationTotal={accommodationTotal}
//           transportationTotal={transportationTotal}
//           visaTotal={visaTotal}
//           airlinesTotal={airlinesTotal}
//         />
//       </div>
//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={() => setSnackbar({ ...snackbar, open: false })}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </>
//   );
// };

// export default QuotationForm;

import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  TableFooter,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, PictureAsPdf as PdfIcon } from '@mui/icons-material';

import { useReactToPrint } from 'react-to-print';

// Import API hooks
import { useGetCitiesQuery, useGetSectorsQuery } from '../../../store/api/masterApi';
import { useGetPackagesQuery } from '../../../store/api/packageApi';
import { useGetClientsQuery, useGetClientQuery, useCreateClientMutation } from '../../../store/api/clientApi';
import {
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useBulkCreateAccommodationsMutation,
  useBulkCreateTransportationsMutation,
  useBulkCreateVisasMutation,
  useBulkCreateAirlinesMutation
} from '../../../store/api/quotationApi';
import { useGetHotelsByCityQuery } from '../../../store/api/hotelApi';
import { useGetRateHotelByCompositeQuery } from '../../../store/api/rateHotelApi';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Import PDF Service
import QuotationPrintView from './QuotationPrintView';

const QuotationForm = ({ mode, quotation, onSave, onCancel, onRefetch }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // CORRECTED: Single useRef declaration
  const printRef = useRef();
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [sourceQueryInfo, setSourceQueryInfo] = useState(null);
  const [hasLoadedQueryData, setHasLoadedQueryData] = useState(false);

  // State declarations
  const [clientType, setClientType] = useState('existing');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [newClientData, setNewClientData] = useState({
    clientName: '',
    contactNumber: '',
    whatsappNumber: '',
    groupHeadName: '',
    groupHeadNumber: '',
    cityOfResidence: '',
    passportValidity: '',
    specialRequirements: ''
  });

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fixed state management for hotels and rates
  const [hotelsByCity, setHotelsByCity] = useState({});
  const [roomRates, setRoomRates] = useState({});
  const [loadingHotels, setLoadingHotels] = useState({});
  const [loadingRates, setLoadingRates] = useState({});
  const [rateErrors, setRateErrors] = useState({});

  // API Hooks
  const { data: citiesData = [], isLoading: citiesLoading } = useGetCitiesQuery();
  const { data: sectorsData = [], isLoading: sectorsLoading } = useGetSectorsQuery();
  const { data: clientsData = [], isLoading: clientsLoading } = useGetClientsQuery();

  // Proper package data handling
  const { data: packagesResponse = {}, isLoading: packagesLoading } = useGetPackagesQuery();
  const packagesData = packagesResponse.data || packagesResponse || [];

  // Get selected client details
  const { data: selectedClient } = useGetClientQuery(selectedClientId, {
    skip: !selectedClientId || clientType !== 'existing'
  });

  // Create client mutation
  const [createClient, { isLoading: creatingClient }] = useCreateClientMutation();

  // Hotel API hooks
  const [selectedCityForHotels, setSelectedCityForHotels] = useState(null);
  const {
    data: hotelsData = [],
    isLoading: hotelsLoading,
    refetch: refetchHotels
  } = useGetHotelsByCityQuery(selectedCityForHotels, {
    skip: !selectedCityForHotels,
    refetchOnMountOrArgChange: true
  });

  // Rate API hooks
  const [selectedHotelForRates, setSelectedHotelForRates] = useState(null);
  const {
    data: ratesData,
    isLoading: ratesLoading,
    error: ratesError,
    refetch: refetchRates
  } = useGetRateHotelByCompositeQuery(selectedHotelForRates, {
    skip: !selectedHotelForRates,
    refetchOnMountOrArgChange: true
  });

  // Mutation hooks
  const [createQuotation, { isLoading: creatingQuotation }] = useCreateQuotationMutation();
  const [updateQuotation, { isLoading: updatingQuotation }] = useUpdateQuotationMutation();
  const [bulkCreateAccommodations] = useBulkCreateAccommodationsMutation();
  const [bulkCreateTransportations] = useBulkCreateTransportationsMutation();
  const [bulkCreateVisas] = useBulkCreateVisasMutation();
  const [bulkCreateAirlines] = useBulkCreateAirlinesMutation();

  // Initial form state
  const initialFormState = {
    client_id: '',
    quotation_number: '',
    traveling_details: '',
    packgeID: '',
    reference_by: '',
    makkah_nights: '',
    madinah_nights: '',
    makkah_nights1: '',
    jeddah_nights: '',
    adult_count: '',
    child_count: '',
    infant_count: '',
    advance_amount: '',
    queryID: '',
    accommodations: [
      {
        cityID: '',
        hotelID: '',
        check_in: '',
        check_out: '',
        room_type: 'sharing',
        no_of_rooms: '',
        no_of_nights: '',
        rate_per_night: ''
      }
    ],
    transportations: [
      {
        vehicle_name: '',
        capacity: '',
        sectorID: '',
        rate: '',
        quantity: ''
      }
    ],
    visas: [
      {
        Description: '',
        Rate: '',
        Qty: ''
      }
    ],
    airlines: [
      {
        carrier: '',
        pax_count: '',
        class: 'Economy',
        sector: '',
        rate: '',
        quantity: ''
      }
    ]
  };

  const [formData, setFormData] = useState(initialFormState);

  // Options for dropdowns
  const vehicleTypes = ['8 PAX (Hiace)', '12 PAX (Van)', '16 PAX (Coaster)', '24 PAX (Bus)', '45 PAX (Bus)'];
  const visaServices = ['ONLY UMRA VISA', 'INFANT VISA', 'TOURIST VISA', 'BUSINESS VISA', 'TRANSIT VISA'];
  const roomTypes = ['sharing', 'quint', 'quad', 'triple', 'doble'];
  const airlineClasses = ['Economy', 'Business', 'First Class'];

  // CORRECTED: PDF Generation Function
  // CORRECTED: PDF Generation Function - REPLACE YOUR CURRENT VERSION
  const generatePDF = async () => {
    const element = printRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF('p', 'mm', 'a4');

    // Calculate width/height to fit A4 page
    const imgWidth = 210;
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    window.open(pdfUrl, '_blank');
  };

  // Add this useEffect to debug ref changes
  useEffect(() => {
    console.log('🔍 Print ref updated:', {
      current: printRef.current,
      hasContent: printRef.current?.innerHTML ? 'Yes' : 'No',
      contentLength: printRef.current?.innerHTML?.length || 0
    });
  }, [printRef.current, formData.packgeID]); // Add dependencies that affect content

  // Load query data when component mounts
  useEffect(() => {
    const loadQueryData = () => {
      const navigationData = location.state?.queryData;
      console.log('🔍 Query data received in QuotationForm:', navigationData);

      if (navigationData && mode === 'create' && !hasLoadedQueryData) {
        try {
          console.log('🚀 Loading query data into quotation form...');

          // Set client type to new
          setClientType('new');
          console.log('✅ Client type set to: new');

          // Pre-fill new client data
          if (navigationData.newClientData) {
            const clientData = {
              clientName: navigationData.newClientData.clientName || '',
              contactNumber: navigationData.newClientData.contactNumber || '',
              whatsappNumber: navigationData.newClientData.whatsappNumber || '',
              groupHeadName: navigationData.newClientData.groupHeadName || '',
              groupHeadNumber: navigationData.newClientData.groupHeadNumber || '',
              cityOfResidence: navigationData.newClientData.cityOfResidence || '',
              passportValidity: navigationData.newClientData.passportValidity || '',
              specialRequirements: navigationData.newClientData.specialRequirements || ''
            };
            setNewClientData(clientData);
            console.log('✅ New client data set:', clientData);
          }

          // Pre-fill main form data
          const updatedFormData = {
            ...initialFormState,
            queryID: navigationData.sourceQueryId || '',
            traveling_details: navigationData.traveling_details || '',
            packgeID: navigationData.packgeID || '',
            reference_by: navigationData.reference_by || '',
            makkah_nights: navigationData.makkah_nights || '',
            madinah_nights: navigationData.madinah_nights || '',
            makkah_nights1: navigationData.makkah_nights1 || '',
            jeddah_nights: navigationData.jeddah_nights || '',
            adult_count: navigationData.adult_count || '',
            child_count: navigationData.child_count || '',
            infant_count: navigationData.infant_count || '',
            advance_amount: navigationData.advance_amount || ''
          };

          // Handle accommodations
          if (navigationData.accommodations && navigationData.accommodations.length > 0) {
            updatedFormData.accommodations = navigationData.accommodations.map((acc) => ({
              ...acc,
              check_in: formatDateForInput(acc.check_in),
              check_out: formatDateForInput(acc.check_out)
            }));
            console.log('✅ Accommodations set:', updatedFormData.accommodations);
          }

          // Handle transportations
          if (navigationData.transportations && navigationData.transportations.length > 0) {
            updatedFormData.transportations = navigationData.transportations;
            console.log('✅ Transportations set:', updatedFormData.transportations);
          }

          // Handle visas
          if (navigationData.visas && navigationData.visas.length > 0) {
            updatedFormData.visas = navigationData.visas;
            console.log('✅ Visas set:', updatedFormData.visas);
          }

          // Handle airlines
          if (navigationData.airlines && navigationData.airlines.length > 0) {
            updatedFormData.airlines = navigationData.airlines;
            console.log('✅ Airlines set:', updatedFormData.airlines);
          }

          setFormData(updatedFormData);
          console.log('✅ Form data fully updated', updatedFormData);

          // Set source query information
          if (navigationData.sourceQueryId) {
            setSourceQueryInfo({
              id: navigationData.sourceQueryId,
              number: navigationData.sourceQueryNumber
            });
            console.log('✅ Source query info set');
          }

          // Mark that query data has been loaded
          setHasLoadedQueryData(true);
          console.log('✅ Query data loading completed');

          showSnackbar('Quotation pre-filled from query form!', 'success');
        } catch (error) {
          console.error('❌ Error loading query data:', error);
          showSnackbar('Error loading query data', 'error');
        }
      }
    };

    setTimeout(loadQueryData, 100);
  }, [mode, location.state, navigate, location.pathname, hasLoadedQueryData]);

  // Initialize form data when mode changes
  useEffect(() => {
    if (mode === 'edit' && quotation) {
      const editData = {
        ...initialFormState,
        ...quotation,
        accommodations:
          quotation.accommodations && quotation.accommodations.length > 0
            ? quotation.accommodations.map((acc) => ({
                ...acc,
                cityID: acc.cityID?.toString() || '',
                hotelID: acc.hotelID?.toString() || '',
                check_in: formatDateForInput(acc.check_in),
                check_out: formatDateForInput(acc.check_out),
                room_type: acc.room_type || 'sharing',
                no_of_rooms: acc.no_of_rooms?.toString() || '',
                no_of_nights: acc.no_of_nights?.toString() || '',
                rate_per_night: acc.rate_per_night?.toString() || ''
              }))
            : initialFormState.accommodations,
        transportations:
          quotation.transportations && quotation.transportations.length > 0
            ? quotation.transportations.map((trans) => ({
                ...trans,
                sectorID: trans.sectorID?.toString() || '',
                rate: trans.rate?.toString() || '',
                quantity: trans.quantity?.toString() || ''
              }))
            : initialFormState.transportations,
        visas:
          quotation.visas && quotation.visas.length > 0
            ? quotation.visas.map((visa) => ({
                ...visa,
                Rate: visa.Rate?.toString() || '',
                Qty: visa.Qty?.toString() || ''
              }))
            : initialFormState.visas,
        airlines:
          quotation.airlines && quotation.airlines.length > 0
            ? quotation.airlines.map((airline) => ({
                ...airline,
                pax_count: airline.pax_count?.toString() || '',
                rate: airline.rate?.toString() || '',
                quantity: airline.quantity?.toString() || ''
              }))
            : initialFormState.airlines
      };

      Object.keys(editData).forEach((key) => {
        if (editData[key] === undefined || editData[key] === null) {
          editData[key] = initialFormState[key] || '';
        }
      });

      setFormData(editData);

      if (quotation.client_id) {
        setClientType('existing');
        setSelectedClientId(quotation.client_id.toString());
      }

      if (quotation.accommodations) {
        quotation.accommodations.forEach(async (acc) => {
          if (acc.cityID && acc.hotelID) {
            setSelectedCityForHotels(acc.cityID);
            setTimeout(() => {
              setSelectedHotelForRates({
                cityID: acc.cityID,
                hotelID: acc.hotelID
              });
            }, 100);
          }
        });
      }
    } else if (mode === 'create' && !hasLoadedQueryData && !location.state?.queryData) {
      setFormData(initialFormState);
      setClientType('existing');
      setSelectedClientId('');
      setNewClientData({
        clientName: '',
        contactNumber: '',
        whatsappNumber: '',
        groupHeadName: '',
        groupHeadNumber: '',
        cityOfResidence: '',
        passportValidity: '',
        specialRequirements: ''
      });

      setHotelsByCity({});
      setRoomRates({});
      setRateErrors({});
    }
  }, [mode, quotation, hasLoadedQueryData, location.state]);

  // Update form when selected client changes
  useEffect(() => {
    if (selectedClient && clientType === 'existing') {
      setFormData((prev) => ({
        ...prev,
        client_id: selectedClient.clientID || selectedClient.id
      }));
    }
  }, [selectedClient, clientType]);

  // Update hotels data when fetched
  useEffect(() => {
    if (selectedCityForHotels && hotelsData) {
      const cityHotels = Array.isArray(hotelsData) ? hotelsData : hotelsData.data || [];
      setHotelsByCity((prev) => ({
        ...prev,
        [selectedCityForHotels]: cityHotels
      }));
      setLoadingHotels((prev) => ({
        ...prev,
        [selectedCityForHotels]: false
      }));
    }
  }, [hotelsData, selectedCityForHotels]);

  // Update rates data when fetched
  useEffect(() => {
    if (selectedHotelForRates) {
      const rateKey = `${selectedHotelForRates.cityID}-${selectedHotelForRates.hotelID}`;
      if (ratesError) {
        setRateErrors((prev) => ({
          ...prev,
          [rateKey]: true
        }));
        setRoomRates((prev) => ({
          ...prev,
          [rateKey]: null
        }));
        setLoadingRates((prev) => ({
          ...prev,
          [rateKey]: false
        }));
      } else if (ratesData) {
        const rates = ratesData.data || ratesData;
        setRateErrors((prev) => ({
          ...prev,
          [rateKey]: false
        }));
        setRoomRates((prev) => ({
          ...prev,
          [rateKey]: {
            sharing: rates.sharing || 0,
            quint: rates.quint || 0,
            quad: rates.quad || 0,
            triple: rates.triple || 0,
            doble: rates.doble || 0
          }
        }));
        setLoadingRates((prev) => ({
          ...prev,
          [rateKey]: false
        }));
      }
    }
  }, [ratesData, ratesError, selectedHotelForRates]);

  // Calculate totals
  const total_stay_days =
    (parseInt(formData.makkah_nights) || 0) +
    (parseInt(formData.madinah_nights) || 0) +
    (parseInt(formData.makkah_nights1) || 0) +
    (parseInt(formData.jeddah_nights) || 0);

  const total_pax = (parseInt(formData.adult_count) || 0) + (parseInt(formData.child_count) || 0) + (parseInt(formData.infant_count) || 0);

  const accommodationTotal = formData.accommodations.reduce((sum, item) => {
    const nights = parseInt(item.no_of_nights) || 0;
    const rooms = parseInt(item.no_of_rooms) || 0;
    const rate = parseFloat(item.rate_per_night) || 0;
    return sum + rooms * nights * rate;
  }, 0);

  const transportationTotal = formData.transportations.reduce(
    (sum, item) => sum + (parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0),
    0
  );
  const visaTotal = formData.visas.reduce((sum, item) => sum + (parseFloat(item.Rate) || 0) * (parseInt(item.Qty) || 0), 0);
  const airlinesTotal = formData.airlines.reduce((sum, item) => sum + (parseFloat(item.rate) || 0) * (parseInt(item.quantity) || 0), 0);

  const total_package_cost = accommodationTotal + transportationTotal + visaTotal + airlinesTotal;
  const advance_amount = parseFloat(formData.advance_amount) || 0;
  const grand_total = total_package_cost - advance_amount;
  const cost_per_person = total_pax > 0 ? grand_total / total_pax : 0;

  // Helper functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const calculateNights = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '';
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)).toString();
  };

  const calculateVisaRate = (quantity, isInfant = false) => {
    const qty = parseInt(quantity) || 0;
    if (isInfant) return '480';
    if (qty >= 5) return '699';
    if (qty === 4) return '800';
    if (qty === 3) return '825';
    if (qty === 2) return '850';
    if (qty === 1) return '900';
    return '';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    if (typeof dateString === 'string') {
      return dateString.split('T')[0];
    }
    return dateString;
  };

  // Handle client type change
  const handleClientTypeChange = (event) => {
    const newClientType = event.target.value;
    setClientType(newClientType);

    if (newClientType === 'new') {
      setSelectedClientId('');
      setFormData((prev) => ({
        ...prev,
        client_id: ''
      }));
    } else {
      setNewClientData({
        clientName: '',
        contactNumber: '',
        whatsappNumber: '',
        groupHeadName: '',
        groupHeadNumber: '',
        cityOfResidence: '',
        passportValidity: '',
        specialRequirements: ''
      });
    }
  };

  // Handle new client input changes
  const handleNewClientChange = (field, value) => {
    setNewClientData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle input changes for main form
  const handleInputChange = async (section, index, field, value) => {
    if (section === 'accommodations') {
      const updatedItems = [...formData.accommodations];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      if (field === 'cityID') {
        updatedItems[index].hotelID = '';
        updatedItems[index].rate_per_night = '';
        updatedItems[index].room_type = 'sharing';
        setSelectedHotelForRates(null);

        if (value) {
          setLoadingHotels((prev) => ({ ...prev, [value]: true }));
          setSelectedCityForHotels(value);
        }
      }

      if (field === 'hotelID' && updatedItems[index].cityID) {
        updatedItems[index].rate_per_night = '';
        updatedItems[index].room_type = 'sharing';

        if (value) {
          const rateKey = `${updatedItems[index].cityID}-${value}`;
          setRoomRates((prev) => ({
            ...prev,
            [rateKey]: null
          }));
          setLoadingRates((prev) => ({ ...prev, [rateKey]: true }));
          setSelectedHotelForRates({
            cityID: updatedItems[index].cityID,
            hotelID: value
          });
        } else {
          const rateKey = `${updatedItems[index].cityID}-${updatedItems[index].hotelID}`;
          setRoomRates((prev) => ({
            ...prev,
            [rateKey]: null
          }));
        }
      }

      if (field === 'room_type' && updatedItems[index].cityID && updatedItems[index].hotelID) {
        const rateKey = `${updatedItems[index].cityID}-${updatedItems[index].hotelID}`;
        const rates = roomRates[rateKey];
        if (rates && !rateErrors[rateKey]) {
          const rate = rates[value] || 0;
          updatedItems[index].rate_per_night = rate.toString();
        } else {
          updatedItems[index].rate_per_night = '';
        }
      }

      if (['check_in', 'check_out'].includes(field)) {
        const nights = calculateNights(
          field === 'check_in' ? value : updatedItems[index].check_in,
          field === 'check_out' ? value : updatedItems[index].check_out
        );
        updatedItems[index].no_of_nights = nights;
      }

      setFormData((prev) => ({ ...prev, accommodations: updatedItems }));
    } else if (section === 'transportations') {
      const updatedItems = [...formData.transportations];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      setFormData((prev) => ({ ...prev, transportations: updatedItems }));
    } else if (section === 'visas') {
      const updatedItems = [...formData.visas];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      if (field === 'Qty') {
        const isInfant = updatedItems[index].Description === 'INFANT VISA';
        const rate = isInfant ? '480' : calculateVisaRate(value);
        updatedItems[index].Rate = rate;
      } else if (field === 'Description') {
        const isInfant = value === 'INFANT VISA';
        const quantity = updatedItems[index].Qty || '';
        const rate = isInfant ? '480' : calculateVisaRate(quantity);
        updatedItems[index].Rate = rate;
      }

      setFormData((prev) => ({ ...prev, visas: updatedItems }));
    } else if (section === 'airlines') {
      const updatedItems = [...formData.airlines];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      setFormData((prev) => ({ ...prev, airlines: updatedItems }));
    } else if (section === 'main') {
      const updatedData = { ...formData, [field]: value };

      if (['adult_count', 'child_count', 'infant_count'].includes(field)) {
        const totalAdultsChildren = (parseInt(updatedData.adult_count) || 0) + (parseInt(updatedData.child_count) || 0);
        const totalInfants = parseInt(updatedData.infant_count) || 0;

        const updatedVisas = [...updatedData.visas];
        const regularVisaIndex = updatedVisas.findIndex((v) => v.Description && v.Description !== 'INFANT VISA');
        if (regularVisaIndex !== -1) {
          updatedVisas[regularVisaIndex].Qty = totalAdultsChildren.toString();
          updatedVisas[regularVisaIndex].Rate = calculateVisaRate(totalAdultsChildren.toString());
        } else if (totalAdultsChildren > 0) {
          updatedVisas.push({
            Description: 'ONLY UMRA VISA',
            Rate: calculateVisaRate(totalAdultsChildren.toString()),
            Qty: totalAdultsChildren.toString()
          });
        }

        const infantVisaIndex = updatedVisas.findIndex((v) => v.Description === 'INFANT VISA');
        if (infantVisaIndex !== -1) {
          updatedVisas[infantVisaIndex].Qty = totalInfants.toString();
          updatedVisas[infantVisaIndex].Rate = '480';
        } else if (totalInfants > 0) {
          updatedVisas.push({
            Description: 'INFANT VISA',
            Rate: '480',
            Qty: totalInfants.toString()
          });
        }

        updatedData.visas = updatedVisas.filter((visa) => visa.Description || visa.Qty);
      }

      setFormData(updatedData);
    }
  };

  // Add/Remove rows
  const addAccommodation = () => {
    setFormData((prev) => ({
      ...prev,
      accommodations: [
        ...prev.accommodations,
        {
          cityID: '',
          hotelID: '',
          check_in: '',
          check_out: '',
          room_type: 'sharing',
          no_of_rooms: '',
          no_of_nights: '',
          rate_per_night: ''
        }
      ]
    }));
  };

  const addTransportation = () => {
    setFormData((prev) => ({
      ...prev,
      transportations: [
        ...prev.transportations,
        {
          vehicle_name: '',
          capacity: '',
          sectorID: '',
          rate: '',
          quantity: ''
        }
      ]
    }));
  };

  const addVisa = () => {
    setFormData((prev) => ({
      ...prev,
      visas: [
        ...prev.visas,
        {
          Description: '',
          Rate: '',
          Qty: ''
        }
      ]
    }));
  };

  const addAirline = () => {
    setFormData((prev) => ({
      ...prev,
      airlines: [
        ...prev.airlines,
        {
          carrier: '',
          pax_count: '',
          class: 'Economy',
          sector: '',
          rate: '',
          quantity: ''
        }
      ]
    }));
  };

  const removeRow = (section, index) => {
    if (formData[section].length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  // Save quotation to backend
  const saveQuotation = async () => {
    try {
      let clientId = formData.client_id;
      console.log('clientId before processing:', clientId);

      if (clientType === 'new') {
        console.log('start creating client with data:', newClientData);
        try {
          const clientResult = await createClient({
            clientName: newClientData.clientName,
            contactNumber: newClientData.contactNumber,
            whatsappNumber: newClientData.whatsappNumber,
            groupHeadName: newClientData.groupHeadName,
            groupHeadNumber: newClientData.groupHeadNumber,
            cityOfResidence: newClientData.cityOfResidence,
            passportValidity: newClientData.passportValidity,
            specialRequirements: newClientData.specialRequirements
          }).unwrap();
          console.log('clientResult:', clientResult);
          clientId = clientResult.data?.id || clientResult.data?.clientID || clientResult.id || clientResult.clientID;
          console.log('New client created with ID:', clientId);
        } catch (clientError) {
          console.error('Failed to create client:', clientError);
          showSnackbar('Failed to create client. Please check your data and try again.', 'error');
          return;
        }
      } else {
        clientId = selectedClientId;
        console.log('Using existing client ID:', clientId);
      }

      if (!clientId || clientId === '' || clientId === 0) {
        showSnackbar('Please select or create a client first.', 'error');
        return;
      }

      console.log('Final client ID to be sent:', clientId);

      const quotationData = {
        client_id: parseInt(clientId),
        traveling_details: formData.traveling_details || '',
        packgeID: formData.packgeID ? parseInt(formData.packgeID) : 0,
        reference_by: formData.reference_by || '',
        makkah_nights: parseInt(formData.makkah_nights) || 0,
        madinah_nights: parseInt(formData.madinah_nights) || 0,
        makkah_nights1: formData.makkah_nights1 ? parseInt(formData.makkah_nights1) : null,
        jeddah_nights: formData.jeddah_nights ? parseInt(formData.jeddah_nights) : null,
        adult_count: formData.adult_count ? parseInt(formData.adult_count) : null,
        child_count: formData.child_count ? parseInt(formData.child_count) : null,
        infant_count: formData.infant_count ? parseInt(formData.infant_count) : null,
        advance_amount: formData.advance_amount ? parseFloat(formData.advance_amount) : null,
        status: formData.status || 'Draft',
        queryID: formData.queryID ? parseInt(formData.queryID) : null,
        Accommodations: formData.accommodations
          .filter((acc) => acc.cityID && acc.hotelID)
          .map((acc) => ({
            cityID: parseInt(acc.cityID),
            hotelID: parseInt(acc.hotelID),
            check_in: acc.check_in,
            check_out: acc.check_out,
            room_type: acc.room_type,
            no_of_rooms: parseInt(acc.no_of_rooms) || 0,
            no_of_nights: parseInt(acc.no_of_nights) || 0,
            rate_per_night: parseFloat(acc.rate_per_night) || 0
          })),
        Transportations: formData.transportations
          .filter((trans) => trans.vehicle_name)
          .map((trans) => ({
            vehicle_name: trans.vehicle_name,
            capacity: trans.capacity,
            sectorID: trans.sectorID ? parseInt(trans.sectorID) : null,
            rate: parseFloat(trans.rate) || 0,
            quantity: parseInt(trans.quantity) || 0
          })),
        VisaServices: formData.visas
          .filter((visa) => visa.Description)
          .map((visa) => ({
            Description: visa.Description,
            Rate: parseFloat(visa.Rate) || 0,
            Qty: parseInt(visa.Qty) || 0
          })),
        Airlines: formData.airlines
          .filter((airline) => airline.carrier)
          .map((airline) => ({
            carrier: airline.carrier,
            pax_count: parseInt(airline.pax_count) || 0,
            class: airline.class,
            sector: airline.sector,
            rate: parseFloat(airline.rate) || 0,
            quantity: parseInt(airline.quantity) || 0
          }))
      };

      console.log('Final quotation data to send:', quotationData);

      if (mode === 'create') {
        const result = await createQuotation(quotationData).unwrap();
        showSnackbar('Quotation created successfully!', 'success');
        console.log('Created quotation:', result);
      } else {
        const updateData = {
          ...quotationData,
          modifyBy: user?.userID || 1
        };

        console.log('Updating quotation with ID:', quotation.id);
        const result = await updateQuotation({
          id: quotation.id,
          ...updateData
        }).unwrap();

        showSnackbar('Quotation updated successfully!', 'success');
        console.log('Updated quotation:', result);
      }

      if (onRefetch) onRefetch();
      if (onCancel) onCancel();
    } catch (error) {
      console.error('Failed to save quotation:', error);
      const errorMessage =
        error.data?.message || error.data?.title || error.message || 'Failed to save quotation. Please check your data and try again.';
      showSnackbar(errorMessage, 'error');
    }
  };

  // Helper function to get hotels for a city
  const getHotelsForCity = (cityID) => {
    return hotelsByCity[cityID] || [];
  };

  // Helper function to get rates for a hotel
  const getRatesForHotel = (cityID, hotelID) => {
    const rateKey = `${cityID}-${hotelID}`;
    if (rateErrors[rateKey]) {
      return null;
    }
    return roomRates[rateKey] || null;
  };

  // Check if hotel has rates
  const hasRatesForHotel = (cityID, hotelID) => {
    const rateKey = `${cityID}-${hotelID}`;
    return !rateErrors[rateKey] && roomRates[rateKey];
  };

  // Calculate accommodation total for a specific accommodation item
  const calculateAccommodationTotal = (accommodation) => {
    const nights = parseInt(accommodation.no_of_nights) || 0;
    const rooms = parseInt(accommodation.no_of_rooms) || 0;
    const rate = parseFloat(accommodation.rate_per_night) || 0;
    return rooms * nights * rate;
  };

  // Calculate transportation total for a specific transportation item
  const calculateTransportationTotal = (transportation) => {
    return (parseFloat(transportation.rate) || 0) * (parseInt(transportation.quantity) || 0);
  };

  // Calculate visa total for a specific visa item
  const calculateVisaTotal = (visa) => {
    return (parseFloat(visa.Rate) || 0) * (parseInt(visa.Qty) || 0);
  };

  // Calculate airline total for a specific airline item
  const calculateAirlineTotal = (airline) => {
    return (parseFloat(airline.rate) || 0) * (parseInt(airline.quantity) || 0);
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          p: { xs: 2, sm: 3 },
          overflow: 'hidden',
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2
        }}
      >
        {/* Source Query Info Alert */}
        {sourceQueryInfo && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            action={
              <Button color="inherit" size="small" onClick={() => setSourceQueryInfo(null)}>
                Dismiss
              </Button>
            }
          >
            This quotation is being created from Query #{sourceQueryInfo.number}. Client information and trip details have been pre-filled.
          </Alert>
        )}

        {/* Your existing form content remains the same */}
        {/* Client Information Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Client Information
            </Typography>

            {/* Client Type Radio Buttons */}
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <RadioGroup row value={clientType} onChange={handleClientTypeChange}>
                <FormControlLabel value="existing" control={<Radio />} label="Existing Client" />
                <FormControlLabel value="new" control={<Radio />} label="New Client" />
              </RadioGroup>
            </FormControl>

            <Grid container spacing={3}>
              {clientType === 'existing' ? (
                <Grid item xs={12}>
                  <FormControl fullWidth margin="normal" size="small">
                    <InputLabel>Select Existing Client *</InputLabel>
                    <Select
                      value={selectedClientId}
                      label="Select Existing Client *"
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      variant="outlined"
                      required
                    >
                      <MenuItem value="">Select Client</MenuItem>
                      {Array.isArray(clientsData) &&
                        clientsData.map((client) => (
                          <MenuItem key={client.clientID || client.id} value={client.clientID || client.id}>
                            {client.clientName} - {client.contactNumber} {client.cityOfResidence ? `- ${client.cityOfResidence}` : ''}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
              ) : (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Client Full Name *"
                      value={newClientData.clientName}
                      onChange={(e) => handleNewClientChange('clientName', e.target.value)}
                      margin="normal"
                      size="small"
                      variant="outlined"
                      required
                      placeholder="Enter client full name"
                    />
                    <TextField
                      fullWidth
                      label="Contact Number *"
                      value={newClientData.contactNumber}
                      onChange={(e) => handleNewClientChange('contactNumber', e.target.value)}
                      margin="normal"
                      size="small"
                      variant="outlined"
                      required
                      placeholder="Enter contact number"
                    />
                    <TextField
                      fullWidth
                      label="WhatsApp Number"
                      value={newClientData.whatsappNumber}
                      onChange={(e) => handleNewClientChange('whatsappNumber', e.target.value)}
                      margin="normal"
                      size="small"
                      variant="outlined"
                      placeholder="Enter WhatsApp number"
                    />
                    <TextField
                      fullWidth
                      label="Group Head Name"
                      value={newClientData.groupHeadName}
                      onChange={(e) => handleNewClientChange('groupHeadName', e.target.value)}
                      margin="normal"
                      size="small"
                      variant="outlined"
                      placeholder="Enter group head name"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Group Head Number"
                      value={newClientData.groupHeadNumber}
                      onChange={(e) => handleNewClientChange('groupHeadNumber', e.target.value)}
                      margin="normal"
                      size="small"
                      variant="outlined"
                      placeholder="Enter group head number"
                    />
                    <TextField
                      fullWidth
                      label="City of Residence"
                      value={newClientData.cityOfResidence}
                      onChange={(e) => handleNewClientChange('cityOfResidence', e.target.value)}
                      margin="normal"
                      size="small"
                      variant="outlined"
                      placeholder="Enter city of residence"
                    />
                    <TextField
                      fullWidth
                      label="Passport Validity"
                      type="date"
                      value={newClientData.passportValidity}
                      onChange={(e) => handleNewClientChange('passportValidity', e.target.value)}
                      margin="normal"
                      size="small"
                      variant="outlined"
                      InputLabelProps={{ shrink: true }}
                    />
                    <TextField
                      fullWidth
                      label="Special Requirements"
                      value={newClientData.specialRequirements}
                      onChange={(e) => handleNewClientChange('specialRequirements', e.target.value)}
                      margin="normal"
                      size="small"
                      variant="outlined"
                      multiline
                      rows={2}
                      placeholder="Enter any special requirements"
                    />
                  </Grid>
                </>
              )}

              {/* Common fields for both client types */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Traveling Details"
                  value={formData.traveling_details || ''}
                  onChange={(e) => handleInputChange('main', null, 'traveling_details', e.target.value)}
                  margin="normal"
                  size="small"
                  variant="outlined"
                  multiline
                  rows={2}
                  placeholder="Enter traveling details"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal" size="small">
                  <InputLabel>Package Type *</InputLabel>
                  <Select
                    value={formData.packgeID || ''}
                    label="Package Type *"
                    onChange={(e) => handleInputChange('main', null, 'packgeID', e.target.value)}
                    variant="outlined"
                    required
                  >
                    <MenuItem value="">Select Package</MenuItem>
                    {Array.isArray(packagesData) &&
                      packagesData.map((packageItem) => (
                        <MenuItem key={packageItem.packgeID || packageItem.id} value={packageItem.packgeID || packageItem.id}>
                          {packageItem.PackgeTitle || packageItem.packgeTitle}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Reference By"
                  value={formData.reference_by || ''}
                  onChange={(e) => handleInputChange('main', null, 'reference_by', e.target.value)}
                  margin="normal"
                  size="small"
                  variant="outlined"
                  placeholder="Enter reference name"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Trip Breakdown Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-start' }}
            >
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Trip Break-Up (In Nights)
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  {[
                    { label: 'MAKKAH', value: formData.makkah_nights || '', field: 'makkah_nights', placeholder: '0' },
                    { label: 'MADINAH', value: formData.madinah_nights || '', field: 'madinah_nights', placeholder: '0' },
                    { label: 'MAKKAH (2nd)', value: formData.makkah_nights1 || '', field: 'makkah_nights1', placeholder: '0' },
                    { label: 'JEDDAH', value: formData.jeddah_nights || '', field: 'jeddah_nights', placeholder: '0' },
                    { label: 'TOTAL STAY', value: total_stay_days, readOnly: true, placeholder: '0' }
                  ].map((item, index) => (
                    <Box key={index} sx={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" gutterBottom>
                        {item.label}
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={item.value}
                        onChange={(e) => !item.readOnly && handleInputChange('main', null, item.field, e.target.value)}
                        size="small"
                        inputProps={{
                          min: 0,
                          readOnly: item.readOnly,
                          style: { textAlign: 'center', fontWeight: 'bold' }
                        }}
                        placeholder={item.placeholder}
                        sx={{
                          '& .MuiInputBase-input': {
                            textAlign: 'center',
                            fontWeight: item.readOnly ? 'bold' : 'normal',
                            color: item.readOnly ? theme.palette.primary.main : 'inherit'
                          },
                          '& .MuiInputBase-root': {
                            minWidth: '80px',
                            width: 'auto'
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>

            {/* Passenger Counts in second row */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  {[
                    { label: 'ADULT', value: formData.adult_count || '', field: 'adult_count', placeholder: '0' },
                    { label: 'CHILD', value: formData.child_count || '', field: 'child_count', placeholder: '0' },
                    { label: 'INFANT', value: formData.infant_count || '', field: 'infant_count', placeholder: '0' },
                    { label: 'TOTAL PAX', value: total_pax, readOnly: true, placeholder: '0' }
                  ].map((item, index) => (
                    <Box key={index} sx={{ textAlign: 'center', flex: 1, minWidth: 120 }}>
                      <Typography variant="caption" fontWeight="bold" color="text.secondary" display="block" gutterBottom>
                        {item.label}
                      </Typography>
                      <TextField
                        fullWidth
                        type="number"
                        value={item.value}
                        onChange={(e) => !item.readOnly && handleInputChange('main', null, item.field, e.target.value)}
                        size="small"
                        inputProps={{
                          min: 0,
                          readOnly: item.readOnly,
                          style: { textAlign: 'center', fontWeight: 'bold' }
                        }}
                        placeholder={item.placeholder}
                        sx={{
                          '& .MuiInputBase-input': {
                            textAlign: 'center',
                            fontWeight: item.readOnly ? 'bold' : 'normal',
                            color: item.readOnly ? theme.palette.primary.main : 'inherit'
                          },
                          '& .MuiInputBase-root': {
                            minWidth: '80px',
                            width: 'auto'
                          }
                        }}
                      />
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Advance Amount Card */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
              Advance Payment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Advance Amount (PKR)"
                  type="number"
                  value={formData.advance_amount || ''}
                  onChange={(e) => handleInputChange('main', null, 'advance_amount', e.target.value)}
                  size="small"
                  inputProps={{ min: 0 }}
                  placeholder="Enter advance amount"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: 'center', p: 2, background: theme.palette.grey[100], borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Remaining Amount
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrency(grand_total)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Accommodation Details */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ color: theme.palette.primary.main, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.primary.main, borderRadius: 1 }} />
                Accommodation Details
              </Typography>
              <Button startIcon={<AddIcon />} variant="contained" size="small" onClick={addAccommodation} sx={{ borderRadius: 2 }}>
                Add Room
              </Button>
            </Box>

            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 1 }}>
              <Table size="small" sx={{ minWidth: 1000 }}>
                <TableHead sx={{ backgroundColor: theme.palette.primary.main }}>
                  <TableRow>
                    {[
                      'City',
                      'Hotel Name',
                      'Check In',
                      'Check Out',
                      'Room Type',
                      'Rooms',
                      'Nights',
                      'Rate/Night',
                      'Total (Rs.)',
                      'Actions'
                    ].map((header, index) => (
                      <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.accommodations.map((row, index) => {
                    const isHotelLoading = loadingHotels[row.cityID];
                    const rateKey = `${row.cityID}-${row.hotelID}`;
                    const isRateLoading = loadingRates[rateKey];
                    const currentRates = getRatesForHotel(row.cityID, row.hotelID);
                    const hasRates = hasRatesForHotel(row.cityID, row.hotelID);
                    const rowTotal = calculateAccommodationTotal(row);
                    const hotels = getHotelsForCity(row.cityID);

                    return (
                      <TableRow
                        key={index}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={row.cityID || ''}
                              onChange={(e) => handleInputChange('accommodations', index, 'cityID', e.target.value)}
                              sx={{ borderRadius: 1 }}
                            >
                              <MenuItem value="">Select City</MenuItem>
                              {Array.isArray(citiesData) &&
                                citiesData.map((city) => (
                                  <MenuItem key={city.cityID} value={city.cityID}>
                                    {city.cityName}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            {isHotelLoading ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                                <CircularProgress size={20} />
                              </Box>
                            ) : (
                              <Select
                                value={row.hotelID || ''}
                                onChange={(e) => handleInputChange('accommodations', index, 'hotelID', e.target.value)}
                                sx={{ borderRadius: 1 }}
                                disabled={!row.cityID}
                              >
                                <MenuItem value="">Select Hotel</MenuItem>
                                {hotels.map((hotel) => (
                                  <MenuItem key={hotel.hotelID} value={hotel.hotelID}>
                                    {hotel.hotelName}
                                  </MenuItem>
                                ))}
                              </Select>
                            )}
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            value={formatDateForInput(row.check_in)}
                            onChange={(e) => {
                              handleInputChange('accommodations', index, 'check_in', e.target.value);
                            }}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-input': {
                                padding: '8.5px 14px',
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="date"
                            value={formatDateForInput(row.check_out)}
                            onChange={(e) => {
                              handleInputChange('accommodations', index, 'check_out', e.target.value);
                            }}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-input': {
                                padding: '8.5px 14px',
                                fontSize: '0.875rem'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={row.room_type || 'sharing'}
                              onChange={(e) => handleInputChange('accommodations', index, 'room_type', e.target.value)}
                              sx={{ borderRadius: 1 }}
                              disabled={!row.cityID || !row.hotelID || !hasRates}
                            >
                              {roomTypes.map((type) => (
                                <MenuItem key={type} value={type}>
                                  {type.toUpperCase()}
                                  {currentRates && currentRates[type] ? `- ${formatCurrency(currentRates[type])}` : ' - No rates available'}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          {row.cityID && row.hotelID && !hasRates && !isRateLoading && (
                            <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.5 }}>
                              No rates available for this hotel
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.no_of_rooms || ''}
                            onChange={(e) => handleInputChange('accommodations', index, 'no_of_rooms', e.target.value)}
                            size="small"
                            inputProps={{
                              min: 0,
                              style: {
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                padding: '8.5px 14px'
                              }
                            }}
                            placeholder="1"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '70px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                textAlign: 'center',
                                fontWeight: 'bold',
                                backgroundColor: theme.palette.grey[50],
                                border: `1px solid ${theme.palette.grey[300]}`,
                                borderRadius: 1,
                                '&:focus': {
                                  backgroundColor: theme.palette.common.white,
                                  borderColor: theme.palette.primary.main
                                }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.no_of_nights || ''}
                            onChange={(e) => handleInputChange('accommodations', index, 'no_of_nights', e.target.value)}
                            size="small"
                            inputProps={{
                              min: 0,
                              style: {
                                textAlign: 'center',
                                fontWeight: 'bold',
                                fontSize: '0.875rem',
                                padding: '8.5px 14px'
                              }
                            }}
                            placeholder="1"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '70px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                textAlign: 'center',
                                fontWeight: 'bold',
                                backgroundColor: theme.palette.grey[50],
                                border: `1px solid ${theme.palette.grey[300]}`,
                                borderRadius: 1,
                                '&:focus': {
                                  backgroundColor: theme.palette.common.white,
                                  borderColor: theme.palette.primary.main
                                }
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {isRateLoading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 1 }}>
                              <CircularProgress size={20} />
                            </Box>
                          ) : (
                            <TextField
                              type="number"
                              value={row.rate_per_night || ''}
                              onChange={(e) => handleInputChange('accommodations', index, 'rate_per_night', e.target.value)}
                              size="small"
                              inputProps={{
                                min: 0,
                                style: {
                                  textAlign: 'center',
                                  fontWeight: 'bold',
                                  fontSize: '0.875rem',
                                  padding: '8.5px 14px'
                                }
                              }}
                              placeholder="0"
                              sx={{
                                borderRadius: 1,
                                '& .MuiInputBase-root': {
                                  minWidth: '70px',
                                  width: 'auto'
                                },
                                '& .MuiInputBase-input': {
                                  textAlign: 'center',
                                  fontWeight: 'bold',
                                  backgroundColor: hasRates ? theme.palette.grey[50] : theme.palette.error.light,
                                  border: `1px solid ${hasRates ? theme.palette.grey[300] : theme.palette.error.main}`,
                                  borderRadius: 1,
                                  color: hasRates ? theme.palette.primary.main : theme.palette.error.dark,
                                  '&:focus': {
                                    backgroundColor: theme.palette.common.white,
                                    borderColor: theme.palette.primary.main
                                  }
                                }
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatCurrency(rowTotal)}
                            color={hasRates ? 'primary' : 'error'}
                            variant="filled"
                            sx={{
                              fontWeight: 'bold',
                              minWidth: 100,
                              fontSize: '0.875rem',
                              height: '32px',
                              '& .MuiChip-label': {
                                px: 2,
                                fontWeight: 'bold'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={formData.accommodations.length <= 1 ? 'Cannot remove the only accommodation' : 'Remove'}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeRow('accommodations', index)}
                                sx={{ borderRadius: 1 }}
                                disabled={formData.accommodations.length <= 1}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell colSpan={8} align="right" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                      Total Accommodation:
                    </TableCell>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.primary.main }}>
                      {formatCurrency(accommodationTotal)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
            <Typography variant="caption" sx={{ mt: 1, display: 'block', fontStyle: 'italic', color: 'text.secondary' }}>
              Note: Rooms are subject to availability & rates may change. Check-in & out time as per Hotel Policy.
            </Typography>
          </CardContent>
        </Card>

        {/* Transportation Services */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ color: theme.palette.secondary.main, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
              >
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.secondary.main, borderRadius: 1 }} />
                Transportation Services + Ziarat
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                onClick={addTransportation}
                sx={{
                  borderRadius: 2,
                  backgroundColor: theme.palette.secondary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.secondary.dark
                  }
                }}
              >
                Add Vehicle
              </Button>
            </Box>
            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 1 }}>
              <Table size="small" sx={{ minWidth: 800 }}>
                <TableHead sx={{ backgroundColor: theme.palette.secondary.main }}>
                  <TableRow>
                    {['Vehicle', 'Capacity', 'Sector', 'Rate', 'Quantity', 'Total Price', 'Actions'].map((header, index) => (
                      <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.transportations.map((row, index) => {
                    const rowTotal = calculateTransportationTotal(row);
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        <TableCell>
                          <TextField
                            value={row.vehicle_name || ''}
                            onChange={(e) => handleInputChange('transportations', index, 'vehicle_name', e.target.value)}
                            size="small"
                            fullWidth
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '200px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                padding: '8.5px 14px'
                              }
                            }}
                            placeholder="e.g., Jed Airport to Mak Hotel"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={row.capacity || ''}
                            onChange={(e) => handleInputChange('transportations', index, 'capacity', e.target.value)}
                            size="small"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '200px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                padding: '8.5px 14px'
                              }
                            }}
                            placeholder="e.g., 8 PAX (Hiace)"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={row.sectorID || ''}
                              onChange={(e) => handleInputChange('transportations', index, 'sectorID', e.target.value)}
                              sx={{ borderRadius: 1 }}
                            >
                              <MenuItem value="">Select Sector</MenuItem>
                              {Array.isArray(sectorsData) &&
                                sectorsData.map((sector) => (
                                  <MenuItem key={sector.sectorID} value={sector.sectorID}>
                                    {sector.sectorName}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.rate || ''}
                            onChange={(e) => handleInputChange('transportations', index, 'rate', e.target.value)}
                            size="small"
                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                            placeholder="0"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '80px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                textAlign: 'center'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.quantity || ''}
                            onChange={(e) => handleInputChange('transportations', index, 'quantity', e.target.value)}
                            size="small"
                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                            placeholder="1"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '70px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                textAlign: 'center'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatCurrency(rowTotal)}
                            color="secondary"
                            variant="filled"
                            sx={{
                              fontWeight: 'bold',
                              minWidth: 100,
                              '& .MuiChip-label': {
                                px: 2
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={formData.transportations.length <= 1 ? 'Cannot remove the only transportation' : 'Remove'}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeRow('transportations', index)}
                                sx={{ borderRadius: 1 }}
                                disabled={formData.transportations.length <= 1}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell colSpan={5} align="right" sx={{ fontWeight: 'bold' }}>
                      Total Transportation:
                    </TableCell>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.secondary.main }}>
                      {formatCurrency(transportationTotal)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Visa Services */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ color: theme.palette.info.main, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
              >
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.info.main, borderRadius: 1 }} />
                Visa Services
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                onClick={addVisa}
                sx={{
                  borderRadius: 2,
                  backgroundColor: theme.palette.info.main,
                  '&:hover': {
                    backgroundColor: theme.palette.info.dark
                  }
                }}
              >
                Add Visa Service
              </Button>
            </Box>
            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 1 }}>
              <Table size="small" sx={{ minWidth: 600 }}>
                <TableHead sx={{ backgroundColor: theme.palette.info.main }}>
                  <TableRow>
                    {['Services Description', 'Rate', 'Quantity', 'Total Price (Rs)', 'Actions'].map((header, index) => (
                      <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.visas.map((row, index) => {
                    const rowTotal = calculateVisaTotal(row);
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        <TableCell>
                          <TextField
                            value={row.Description || ''}
                            onChange={(e) => handleInputChange('visas', index, 'Description', e.target.value)}
                            size="small"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '200px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                padding: '8.5px 14px'
                              }
                            }}
                            placeholder="e.g., ONLY UMRA VISA"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.Rate || ''}
                            size="small"
                            inputProps={{
                              min: 0,
                              style: { textAlign: 'center' },
                              readOnly: true
                            }}
                            placeholder="0"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '100px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                backgroundColor: theme.palette.grey[100],
                                fontWeight: 'bold',
                                color: theme.palette.info.main,
                                textAlign: 'center'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.Qty || ''}
                            onChange={(e) => handleInputChange('visas', index, 'Qty', e.target.value)}
                            size="small"
                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                            placeholder="0"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '80px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                textAlign: 'center'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatCurrency(rowTotal)}
                            color="info"
                            variant="filled"
                            sx={{
                              fontWeight: 'bold',
                              minWidth: 120,
                              '& .MuiChip-label': {
                                px: 2
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={formData.visas.length <= 1 ? 'Cannot remove the only visa service' : 'Remove'}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeRow('visas', index)}
                                sx={{ borderRadius: 1 }}
                                disabled={formData.visas.length <= 1}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                      Total Visa Charges:
                    </TableCell>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.info.main }}>
                      {formatCurrency(visaTotal)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
            <Typography
              variant="caption"
              sx={{ mt: 1, display: 'block', fontStyle: 'italic', color: 'text.secondary', textAlign: 'center' }}
            >
              Note: In case of rejection visa charges will be enclosed.
            </Typography>
          </CardContent>
        </Card>

        {/* Airline Services */}
        <Card sx={{ mb: 3, background: theme.palette.background.paper, boxShadow: theme.shadows[2] }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography
                variant="h6"
                sx={{ color: theme.palette.warning.main, display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}
              >
                <Box component="span" sx={{ width: 4, height: 20, backgroundColor: theme.palette.warning.main, borderRadius: 1 }} />
                Airline Services
              </Typography>
              <Button
                startIcon={<AddIcon />}
                variant="contained"
                size="small"
                onClick={addAirline}
                sx={{
                  borderRadius: 2,
                  backgroundColor: theme.palette.warning.main,
                  '&:hover': {
                    backgroundColor: theme.palette.warning.dark
                  }
                }}
              >
                Add Airline
              </Button>
            </Box>
            <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto', borderRadius: 1 }}>
              <Table size="small" sx={{ minWidth: 800 }}>
                <TableHead sx={{ backgroundColor: theme.palette.warning.main }}>
                  <TableRow>
                    {['Carrier', 'Class', 'Sector', 'Pax Count', 'Rate', 'Quantity', 'Total Price', 'Actions'].map((header, index) => (
                      <TableCell key={index} sx={{ color: 'white', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formData.airlines.map((row, index) => {
                    const rowTotal = calculateAirlineTotal(row);
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: theme.palette.action.hover },
                          '&:hover': { backgroundColor: theme.palette.action.selected }
                        }}
                      >
                        <TableCell>
                          <TextField
                            value={row.carrier || ''}
                            onChange={(e) => handleInputChange('airlines', index, 'carrier', e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ borderRadius: 1 }}
                            placeholder="e.g., Saudi Airlines"
                          />
                        </TableCell>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={row.class || 'Economy'}
                              onChange={(e) => handleInputChange('airlines', index, 'class', e.target.value)}
                              sx={{ borderRadius: 1 }}
                            >
                              {airlineClasses.map((cls) => (
                                <MenuItem key={cls} value={cls}>
                                  {cls}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell>
                          <TextField
                            value={row.sector || ''}
                            onChange={(e) => handleInputChange('airlines', index, 'sector', e.target.value)}
                            size="small"
                            fullWidth
                            sx={{ borderRadius: 1 }}
                            placeholder="e.g., KHI{'>'}JED"
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.pax_count || ''}
                            onChange={(e) => handleInputChange('airlines', index, 'pax_count', e.target.value)}
                            size="small"
                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                            placeholder="0"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '100px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                textAlign: 'center'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.rate || ''}
                            onChange={(e) => handleInputChange('airlines', index, 'rate', e.target.value)}
                            size="small"
                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                            placeholder="0"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '100px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                textAlign: 'center'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            type="number"
                            value={row.quantity || ''}
                            onChange={(e) => handleInputChange('airlines', index, 'quantity', e.target.value)}
                            size="small"
                            inputProps={{ min: 0, style: { textAlign: 'center' } }}
                            placeholder="1"
                            sx={{
                              borderRadius: 1,
                              '& .MuiInputBase-root': {
                                minWidth: '80px',
                                width: 'auto'
                              },
                              '& .MuiInputBase-input': {
                                textAlign: 'center'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatCurrency(rowTotal)}
                            color="warning"
                            variant="filled"
                            sx={{
                              fontWeight: 'bold',
                              minWidth: 120,
                              '& .MuiChip-label': {
                                px: 2
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title={formData.airlines.length <= 1 ? 'Cannot remove the only airline' : 'Remove'}>
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => removeRow('airlines', index)}
                                sx={{ borderRadius: 1 }}
                                disabled={formData.airlines.length <= 1}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                    <TableCell colSpan={6} align="right" sx={{ fontWeight: 'bold' }}>
                      Total Airlines:
                    </TableCell>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.warning.main }}>
                      {formatCurrency(airlinesTotal)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Total Summary */}
        <Card
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            boxShadow: theme.shadows[8]
          }}
        >
          <CardContent>
            <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center" sx={{ mb: 3 }}>
              Total Package Cost Summary
            </Typography>
            <Grid container spacing={3}>
              {[
                { label: 'Total Package Cost', value: total_package_cost, color: 'white' },
                { label: 'Advance', value: advance_amount, color: 'white' },
                { label: 'Grand Total Amount', value: grand_total, color: theme.palette.warning.light },
                { label: 'Cost Per Person', value: Math.round(cost_per_person), color: theme.palette.success.light }
              ].map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 2,
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Typography variant="body2" gutterBottom sx={{ opacity: 0.9 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: item.color }}>
                      (PKR) {formatCurrency(item.value)}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Footer Notes */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            background: theme.palette.warning.light,
            borderRadius: 2,
            border: `1px solid ${theme.palette.warning.main}`
          }}
        >
          <Typography variant="body2" textAlign="center" sx={{ color: theme.palette.warning.dark }}>
            <strong>REMARKS:</strong> Ticket and Room rates are subject to change without prior notice and subject to availability. Room
            rates may change due to USD rates.
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap' }}>
          <Tooltip title="Open PDF in browser preview - Use browser's Save as PDF option to download">
            <Button
              variant="outlined"
              color="secondary"
              startIcon={generatingPDF ? <CircularProgress size={20} /> : <PdfIcon />}
              onClick={generatePDF}
              disabled={generatingPDF || !formData.packgeID}
            >
              {generatingPDF ? 'Generating PDF...' : 'Preview PDF'}
            </Button>
          </Tooltip>

          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={creatingQuotation || updatingQuotation || creatingClient ? <CircularProgress size={20} /> : <SaveIcon />}
            onClick={saveQuotation}
            disabled={
              creatingQuotation ||
              updatingQuotation ||
              creatingClient ||
              !formData.packgeID ||
              (clientType === 'existing' && !selectedClientId) ||
              (clientType === 'new' && !newClientData.clientName)
            }
          >
            {creatingQuotation || updatingQuotation || creatingClient
              ? 'Saving...'
              : mode === 'create'
                ? 'Save Quotation'
                : 'Update Quotation'}
          </Button>
        </Box>
      </Paper>
      {/* // In your return statement, REPLACE the current print view container with: */}
      <div
        data-printable="quotation"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          overflow: 'auto',
          zIndex: -1, // Use negative z-index instead of hiding
          background: 'white',
          opacity: 0 // Make it transparent but still accessible
        }}
      >
        <QuotationPrintView
          ref={printRef}
          formData={formData}
          clientInfo={clientType === 'existing' ? selectedClient : null}
          packageInfo={packagesLoading ? null : packagesData?.find((p) => (p.packgeID || p.id) === formData.packgeID)}
          citiesData={citiesData}
          hotelsData={hotelsData}
          sectorsData={sectorsData}
          clientType={clientType}
          newClientData={newClientData}
          total_package_cost={total_package_cost}
          advance_amount={advance_amount}
          grand_total={grand_total}
          cost_per_person={cost_per_person}
          total_stay_days={total_stay_days}
          total_pax={total_pax}
          accommodationTotal={accommodationTotal}
          transportationTotal={transportationTotal}
          visaTotal={visaTotal}
          airlinesTotal={airlinesTotal}
        />
      </div>
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default QuotationForm;
