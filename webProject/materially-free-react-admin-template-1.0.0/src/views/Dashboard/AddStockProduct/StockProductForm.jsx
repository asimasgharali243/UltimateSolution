// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   TextField,
//   MenuItem,
//   FormControl,
//   Select,
//   Grid,
//   Divider,
//   Button,
//   CircularProgress,
//   Alert,
//   Snackbar,
//   FormHelperText
// } from '@mui/material';

// // Import your APIs
// import { useGetItemCategoriesQuery } from '../../../store/api/itemCategoryApi';
// import { useGetItemGroupsQuery } from '../../../store/api/itemGroupApi';
// import { useGetItemUnitsDropdownQuery } from '../../../store/api/itemUnitApi';
// import { useGetAllAccountsQuery } from '../../../store/api/level4Api';
// import { useCreateItemMutation } from '../../../store/api/itemApi';

// const AddStockProduct = () => {
//   const { user } = useSelector((state) => state.auth);
//   const [formData, setFormData] = useState({
//     name: '',
//     code: '',
//     categoryID: '',
//     groupID: '',
//     notes: '',
//     date: new Date().toISOString().split('T')[0],
//     stockAssetAccountID: '',
//     incomeAccountID: '',
//     expenseAccountID: '',
//     openingQuantity: '',
//     openingRate: '',
//     MinLevel: '',
//     sRate: '', // Sale Price
//     pRate: '', // Cost
//     unitID: ''
//   });

//   const [errors, setErrors] = useState({
//     name: '',
//     code: '',
//     categoryID: '',
//     groupID: '',
//     date: '',
//     stockAssetAccountID: '',
//     incomeAccountID: '',
//     expenseAccountID: '',
//     unitID: '',
//     openingQuantity: '',
//     openingRate: '',
//     sRate: '',
//     pRate: ''
//   });

//   const [touched, setTouched] = useState({
//     name: false,
//     code: false,
//     categoryID: false,
//     groupID: false,
//     date: false,
//     stockAssetAccountID: false,
//     incomeAccountID: false,
//     expenseAccountID: false,
//     unitID: false
//   });

//   const [snackbar, setSnackbar] = useState({
//     open: false,
//     message: '',
//     severity: 'success'
//   });

//   // Fetch data using RTK Query
//   const { data: categoriesResponse, isLoading: categoriesLoading, error: categoriesError } = useGetItemCategoriesQuery();
//   const { data: groupsResponse, isLoading: groupsLoading, error: groupsError } = useGetItemGroupsQuery();
//   const { data: unitsResponse, isLoading: unitsLoading, error: unitsError } = useGetItemUnitsDropdownQuery();
//   const { data: accountsResponse, isLoading: accountsLoading, error: accountsError } = useGetAllAccountsQuery();
//   const [createItem, { isLoading: creatingItem }] = useCreateItemMutation();

//   // Transform data to ensure we always have arrays
//   const categories = Array.isArray(categoriesResponse)
//     ? categoriesResponse
//     : Array.isArray(categoriesResponse?.data)
//       ? categoriesResponse.data
//       : [];

//   const itemGroups = Array.isArray(groupsResponse?.data) ? groupsResponse.data : Array.isArray(groupsResponse) ? groupsResponse : [];
//   const units = Array.isArray(unitsResponse?.data) ? unitsResponse.data : Array.isArray(unitsResponse) ? unitsResponse : [];
//   const accounts = Array.isArray(accountsResponse?.data) ? accountsResponse.data : Array.isArray(accountsResponse) ? accountsResponse : [];

//   // Filter item groups based on selected category
//   const [filteredGroups, setFilteredGroups] = useState([]);

//   useEffect(() => {
//     if (formData.categoryID && categories.length > 0 && itemGroups.length > 0) {
//       const selectedCategory = categories.find((cat) => cat.categoryID == formData.categoryID);
//       if (selectedCategory && selectedCategory.groupID) {
//         const filtered = itemGroups.filter((group) => group.groupID === selectedCategory.groupID);
//         setFilteredGroups(filtered);
//       } else {
//         setFilteredGroups(itemGroups);
//       }
//     } else {
//       setFilteredGroups(itemGroups);
//     }
//   }, [formData.categoryID, categories, itemGroups]);

//   // Validation functions
//   const validateField = (name, value) => {
//     let error = '';

//     switch (name) {
//       case 'name':
//         if (!value.trim()) {
//           error = 'Product name is required';
//         } else if (value.trim().length < 2) {
//           error = 'Product name must be at least 2 characters long';
//         }
//         break;

//       case 'code':
//         if (!value.trim()) {
//           error = 'Product code is required';
//         } else if (value.trim().length < 1) {
//           error = 'Product code is required';
//         }
//         break;

//       case 'categoryID':
//         if (!value) {
//           error = 'Category is required';
//         }
//         break;

//       case 'groupID':
//         if (!value) {
//           error = 'Item group is required';
//         }
//         break;

//       case 'date':
//         if (!value) {
//           error = 'Date is required';
//         } else if (new Date(value) > new Date()) {
//           error = 'Date cannot be in the future';
//         }
//         break;

//       case 'stockAssetAccountID':
//         if (!value) {
//           error = 'Stock asset account is required';
//         }
//         break;

//       case 'incomeAccountID':
//         if (!value) {
//           error = 'Income account is required';
//         }
//         break;

//       case 'expenseAccountID':
//         if (!value) {
//           error = 'Expense account is required';
//         }
//         break;

//       case 'unitID':
//         if (!value) {
//           error = 'Unit is required';
//         }
//         break;

//       case 'openingQuantity':
//         if (value && (parseFloat(value) < 0 || isNaN(parseFloat(value)))) {
//           error = 'Opening quantity must be a positive number';
//         }
//         break;

//       case 'openingRate':
//         if (value && (parseFloat(value) < 0 || isNaN(parseFloat(value)))) {
//           error = 'Opening rate must be a positive number';
//         }
//         break;

//       case 'sRate':
//         if (value && (parseFloat(value) < 0 || isNaN(parseFloat(value)))) {
//           error = 'Sale price must be a positive number';
//         }
//         break;

//       case 'pRate':
//         if (value && (parseFloat(value) < 0 || isNaN(parseFloat(value)))) {
//           error = 'Cost must be a positive number';
//         }
//         break;

//       default:
//         break;
//     }

//     return error;
//   };

//   const validateForm = () => {
//     const newErrors = {};

//     // Validate all required fields
//     newErrors.name = validateField('name', formData.name);
//     newErrors.code = validateField('code', formData.code);
//     newErrors.categoryID = validateField('categoryID', formData.categoryID);
//     newErrors.groupID = validateField('groupID', formData.groupID);
//     newErrors.date = validateField('date', formData.date);
//     newErrors.stockAssetAccountID = validateField('stockAssetAccountID', formData.stockAssetAccountID);
//     newErrors.incomeAccountID = validateField('incomeAccountID', formData.incomeAccountID);
//     newErrors.expenseAccountID = validateField('expenseAccountID', formData.expenseAccountID);
//     newErrors.unitID = validateField('unitID', formData.unitID);
//     newErrors.openingQuantity = validateField('openingQuantity', formData.openingQuantity);
//     newErrors.openingRate = validateField('openingRate', formData.openingRate);
//     newErrors.sRate = validateField('sRate', formData.sRate);
//     newErrors.pRate = validateField('pRate', formData.pRate);

//     setErrors(newErrors);

//     // Check if form is valid (no error messages)
//     return !Object.values(newErrors).some((error) => error !== '');
//   };

//   const handleBlur = (field) => (event) => {
//     setTouched((prev) => ({
//       ...prev,
//       [field]: true
//     }));

//     // Validate the field on blur
//     const error = validateField(field, formData[field]);
//     setErrors((prev) => ({
//       ...prev,
//       [field]: error
//     }));
//   };

//   const handleChange = (field) => (event) => {
//     const value = event.target.value;
//     setFormData((prev) => ({
//       ...prev,
//       [field]: value
//     }));

//     // If category changes, reset groupID
//     if (field === 'categoryID') {
//       setFormData((prev) => ({
//         ...prev,
//         groupID: ''
//       }));
//       setErrors((prev) => ({
//         ...prev,
//         groupID: 'Please select an item group'
//       }));
//     }

//     // Validate field in real-time if it's been touched
//     if (touched[field]) {
//       const error = validateField(field, value);
//       setErrors((prev) => ({
//         ...prev,
//         [field]: error
//       }));
//     }
//   };

//   const showSnackbar = (message, severity = 'success') => {
//     setSnackbar({
//       open: true,
//       message,
//       severity
//     });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar((prev) => ({
//       ...prev,
//       open: false
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Mark all fields as touched to show all errors
//     setTouched({
//       name: true,
//       code: true,
//       categoryID: true,
//       groupID: true,
//       date: true,
//       stockAssetAccountID: true,
//       incomeAccountID: true,
//       expenseAccountID: true,
//       unitID: true
//     });

//     // Validate entire form
//     if (!validateForm()) {
//       showSnackbar('Please fix the validation errors before submitting', 'error');
//       return;
//     }

//     // Prepare data for backend - ONLY include fields that exist in database
//     const submitData = {
//       itemName: formData.name,
//       itemCode: formData.code,
//       categoryID: formData.categoryID ? parseInt(formData.categoryID) : null,
//       groupID: formData.groupID ? parseInt(formData.groupID) : null,
//       pRate: formData.pRate ? parseFloat(formData.pRate) : null,
//       sRate: formData.sRate ? parseFloat(formData.sRate) : null,
//       MinLevel: formData.MinLevel ? parseInt(formData.MinLevel) : null,
//       date: formData.date,
//       openingQuantity: formData.openingQuantity ? parseInt(formData.openingQuantity) : null,
//       openingRate: formData.openingRate ? parseFloat(formData.openingRate) : null,
//       lowStockLevel: formData.MinLevel ? parseInt(formData.MinLevel) : null, // Using MinLevel for lowStockLevel
//       stockAssetAccountID: formData.stockAssetAccountID ? parseInt(formData.stockAssetAccountID) : null,
//       incomeAccountID: formData.incomeAccountID ? parseInt(formData.incomeAccountID) : null,
//       expenseAccountID: formData.expenseAccountID ? parseInt(formData.expenseAccountID) : null,
//       unitID: formData.unitID ? parseInt(formData.unitID) : null,
//       notes: formData.notes,
//       createdBy: user?.userID || 1 // This should come from your auth context
//     };

//     console.log('Submitting data:', submitData);

//     try {
//       const result = await createItem(submitData).unwrap();
//       showSnackbar('Product created successfully!', 'success');
//       console.log('Product created:', result);

//       // Reset form after successful submission
//       setFormData({
//         name: '',
//         code: '',
//         categoryID: '',
//         groupID: '',
//         notes: '',
//         date: new Date().toISOString().split('T')[0],
//         stockAssetAccountID: '',
//         incomeAccountID: '',
//         expenseAccountID: '',
//         openingQuantity: '',
//         openingRate: '',
//         MinLevel: '',
//         sRate: '',
//         pRate: '',
//         unitID: ''
//       });

//       // Reset errors and touched states
//       setErrors({});
//       setTouched({});
//     } catch (error) {
//       console.error('Failed to create product:', error);
//       showSnackbar(error?.data?.message || 'Failed to create product', 'error');
//     }
//   };

//   const handleCancel = () => {
//     setFormData({
//       name: '',
//       code: '',
//       categoryID: '',
//       groupID: '',
//       notes: '',
//       date: new Date().toISOString().split('T')[0],
//       stockAssetAccountID: '',
//       incomeAccountID: '',
//       expenseAccountID: '',
//       openingQuantity: '',
//       openingRate: '',
//       MinLevel: '',
//       sRate: '',
//       pRate: '',
//       unitID: ''
//     });
//     setErrors({});
//     setTouched({});
//     showSnackbar('Form cancelled', 'info');
//   };

//   // Safe rendering functions
//   const renderCategories = () => {
//     if (!Array.isArray(categories) || categories.length === 0) {
//       return (
//         <MenuItem disabled>
//           <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>No categories available</span>
//         </MenuItem>
//       );
//     }
//     return categories.map((category) => (
//       <MenuItem key={category.categoryID} value={category.categoryID} sx={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
//         {category.categoryName}
//       </MenuItem>
//     ));
//   };

//   const renderFilteredGroups = () => {
//     if (!Array.isArray(filteredGroups)) {
//       return (
//         <MenuItem disabled>
//           <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Loading groups...</span>
//         </MenuItem>
//       );
//     }
//     if (filteredGroups.length === 0) {
//       return (
//         <MenuItem disabled>
//           <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>No groups available for this category</span>
//         </MenuItem>
//       );
//     }
//     return filteredGroups.map((group) => (
//       <MenuItem key={group.groupID} value={group.groupID} sx={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
//         {group.groupName}
//       </MenuItem>
//     ));
//   };

//   const renderUnits = () => {
//     if (!Array.isArray(units) || units.length === 0) {
//       return (
//         <MenuItem disabled>
//           <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>No units available</span>
//         </MenuItem>
//       );
//     }
//     return units.map((unit) => (
//       <MenuItem key={unit.value} value={unit.value} sx={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
//         {unit.label}
//       </MenuItem>
//     ));
//   };

//   const renderAccounts = () => {
//     if (accountsLoading) {
//       return (
//         <MenuItem disabled>
//           <CircularProgress size={20} />
//           <span style={{ marginLeft: 8 }}>Loading accounts...</span>
//         </MenuItem>
//       );
//     }
//     if (!Array.isArray(accounts) || accounts.length === 0) {
//       return (
//         <MenuItem disabled>
//           <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>No accounts available</span>
//         </MenuItem>
//       );
//     }
//     return accounts.map((account) => (
//       <MenuItem key={account.value} value={account.value} sx={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
//         {account.label}
//       </MenuItem>
//     ));
//   };

//   // Loading state
//   if (categoriesLoading || groupsLoading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//         <Typography sx={{ ml: 2 }}>Loading form data...</Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box sx={containerStyles}>
//       {/* Header */}
//       <Box sx={{ mb: 3, textAlign: 'left' }}>
//         <Typography variant="h5" component="h2" sx={headerStyles}>
//           Add Product
//         </Typography>
//       </Box>

//       {/* Show errors if any */}
//       {categoriesError && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           Failed to load categories: {categoriesError.message}
//         </Alert>
//       )}
//       {groupsError && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           Failed to load item groups: {groupsError.message}
//         </Alert>
//       )}
//       {accountsError && (
//         <Alert severity="error" sx={{ mb: 2 }}>
//           Failed to load accounts: {accountsError.message}
//         </Alert>
//       )}

//       <Card sx={cardStyles}>
//         <CardContent sx={{ p: 3 }}>
//           <form onSubmit={handleSubmit}>
//             {/* Row 1: Name, Date, Opening Quantity, Opening Rate */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} sm={6}>
//                 <Typography sx={labelStyles}>
//                   Name <span style={requiredStarStyles}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   placeholder="Enter product name"
//                   value={formData.name}
//                   onChange={handleChange('name')}
//                   onBlur={handleBlur('name')}
//                   size="small"
//                   required
//                   error={touched.name && !!errors.name}
//                   helperText={touched.name && errors.name}
//                   sx={inputStyles}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={2}>
//                 <Typography sx={labelStyles}>
//                   Date <span style={requiredStarStyles}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   type="date"
//                   value={formData.date}
//                   onChange={handleChange('date')}
//                   onBlur={handleBlur('date')}
//                   size="small"
//                   required
//                   error={touched.date && !!errors.date}
//                   helperText={touched.date && errors.date}
//                   InputLabelProps={{ shrink: true }}
//                   sx={inputStyles}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={2}>
//                 <Typography sx={labelStyles}>Opening Quantity</Typography>
//                 <TextField
//                   fullWidth
//                   type="number"
//                   placeholder="0"
//                   value={formData.openingQuantity}
//                   onChange={handleChange('openingQuantity')}
//                   onBlur={handleBlur('openingQuantity')}
//                   size="small"
//                   error={!!errors.openingQuantity}
//                   helperText={errors.openingQuantity}
//                   sx={inputStyles}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={2}>
//                 <Typography sx={labelStyles}>Opening Rate</Typography>
//                 <TextField
//                   fullWidth
//                   type="number"
//                   placeholder="0.00"
//                   value={formData.openingRate}
//                   onChange={handleChange('openingRate')}
//                   onBlur={handleBlur('openingRate')}
//                   size="small"
//                   error={!!errors.openingRate}
//                   helperText={errors.openingRate}
//                   sx={inputStyles}
//                 />
//               </Grid>
//             </Grid>

//             {/* Row 2: Code/Number, Stock Asset Account, Minimum Level */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} sm={6}>
//                 <Typography sx={labelStyles}>
//                   Code / Number <span style={requiredStarStyles}>*</span>
//                 </Typography>
//                 <TextField
//                   fullWidth
//                   placeholder="Enter code or number"
//                   value={formData.code}
//                   onChange={handleChange('code')}
//                   onBlur={handleBlur('code')}
//                   size="small"
//                   required
//                   error={touched.code && !!errors.code}
//                   helperText={touched.code && errors.code}
//                   sx={inputStyles}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={3}>
//                 <Typography sx={labelStyles}>
//                   Stock Asset Account <span style={requiredStarStyles}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={touched.stockAssetAccountID && !!errors.stockAssetAccountID}>
//                   <Select
//                     value={formData.stockAssetAccountID}
//                     onChange={handleChange('stockAssetAccountID')}
//                     onBlur={handleBlur('stockAssetAccountID')}
//                     displayEmpty
//                     sx={selectStyles}
//                   >
//                     <MenuItem value="">
//                       <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select stock account...</span>
//                     </MenuItem>
//                     {renderAccounts()}
//                   </Select>
//                   {touched.stockAssetAccountID && errors.stockAssetAccountID && (
//                     <FormHelperText sx={errorTextStyles}>{errors.stockAssetAccountID}</FormHelperText>
//                   )}
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12} sm={3}>
//                 <Typography sx={labelStyles}>Minimum Level</Typography>
//                 <TextField
//                   fullWidth
//                   type="number"
//                   placeholder="0"
//                   value={formData.MinLevel}
//                   onChange={handleChange('MinLevel')}
//                   size="small"
//                   sx={inputStyles}
//                 />
//               </Grid>
//             </Grid>

//             {/* Row 3: Category, Item Group, Income Account, Sale Price */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} sm={3}>
//                 <Typography sx={labelStyles}>
//                   Category <span style={requiredStarStyles}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={touched.categoryID && !!errors.categoryID}>
//                   <Select
//                     value={formData.categoryID}
//                     onChange={handleChange('categoryID')}
//                     onBlur={handleBlur('categoryID')}
//                     displayEmpty
//                     sx={selectStyles}
//                   >
//                     <MenuItem value="">
//                       <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select category...</span>
//                     </MenuItem>
//                     {renderCategories()}
//                   </Select>
//                   {touched.categoryID && errors.categoryID && <FormHelperText sx={errorTextStyles}>{errors.categoryID}</FormHelperText>}
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12} sm={3}>
//                 <Typography sx={labelStyles}>
//                   Item Group <span style={requiredStarStyles}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={touched.groupID && !!errors.groupID}>
//                   <Select
//                     value={formData.groupID}
//                     onChange={handleChange('groupID')}
//                     onBlur={handleBlur('groupID')}
//                     displayEmpty
//                     sx={selectStyles}
//                   >
//                     <MenuItem value="">
//                       <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
//                         {formData.categoryID ? 'Select item group...' : 'All groups'}
//                       </span>
//                     </MenuItem>
//                     {renderFilteredGroups()}
//                   </Select>
//                   {touched.groupID && errors.groupID && <FormHelperText sx={errorTextStyles}>{errors.groupID}</FormHelperText>}
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12} sm={3}>
//                 <Typography sx={labelStyles}>
//                   Income Account <span style={requiredStarStyles}>*</span>
//                 </Typography>
//                 <FormControl fullWidth size="small" error={touched.incomeAccountID && !!errors.incomeAccountID}>
//                   <Select
//                     value={formData.incomeAccountID}
//                     onChange={handleChange('incomeAccountID')}
//                     onBlur={handleBlur('incomeAccountID')}
//                     displayEmpty
//                     sx={selectStyles}
//                   >
//                     <MenuItem value="">
//                       <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select income account...</span>
//                     </MenuItem>
//                     {renderAccounts()}
//                   </Select>
//                   {touched.incomeAccountID && errors.incomeAccountID && (
//                     <FormHelperText sx={errorTextStyles}>{errors.incomeAccountID}</FormHelperText>
//                   )}
//                 </FormControl>
//               </Grid>

//               <Grid item xs={12} sm={3}>
//                 <Typography sx={labelStyles}>Sale Price</Typography>
//                 <TextField
//                   fullWidth
//                   type="number"
//                   placeholder="0.00"
//                   value={formData.sRate}
//                   onChange={handleChange('sRate')}
//                   onBlur={handleBlur('sRate')}
//                   size="small"
//                   error={!!errors.sRate}
//                   helperText={errors.sRate}
//                   sx={inputStyles}
//                 />
//               </Grid>
//             </Grid>

//             {/* Row 4: Notes, Expense Account, Cost, Unit */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} sm={6}>
//                 <Typography sx={labelStyles}>Notes</Typography>
//                 <TextField
//                   fullWidth
//                   multiline
//                   rows={3}
//                   placeholder="Enter notes..."
//                   value={formData.notes}
//                   onChange={handleChange('notes')}
//                   size="small"
//                   sx={inputStyles}
//                 />
//               </Grid>

//               <Grid item xs={12} sm={6}>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6}>
//                     <Typography sx={labelStyles}>
//                       Expense Account <span style={requiredStarStyles}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={touched.expenseAccountID && !!errors.expenseAccountID}>
//                       <Select
//                         value={formData.expenseAccountID}
//                         onChange={handleChange('expenseAccountID')}
//                         onBlur={handleBlur('expenseAccountID')}
//                         displayEmpty
//                         sx={selectStyles}
//                       >
//                         <MenuItem value="">
//                           <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select expense account...</span>
//                         </MenuItem>
//                         {renderAccounts()}
//                       </Select>
//                       {touched.expenseAccountID && errors.expenseAccountID && (
//                         <FormHelperText sx={errorTextStyles}>{errors.expenseAccountID}</FormHelperText>
//                       )}
//                     </FormControl>
//                   </Grid>

//                   <Grid item xs={12} sm={6}>
//                     <Typography sx={labelStyles}>Cost</Typography>
//                     <TextField
//                       fullWidth
//                       type="number"
//                       placeholder="0.00"
//                       value={formData.pRate}
//                       onChange={handleChange('pRate')}
//                       onBlur={handleBlur('pRate')}
//                       size="small"
//                       error={!!errors.pRate}
//                       helperText={errors.pRate}
//                       sx={inputStyles}
//                     />
//                   </Grid>

//                   <Grid item xs={12} sm={6}>
//                     <Typography sx={labelStyles}>
//                       Unit <span style={requiredStarStyles}>*</span>
//                     </Typography>
//                     <FormControl fullWidth size="small" error={touched.unitID && !!errors.unitID}>
//                       <Select
//                         value={formData.unitID}
//                         onChange={handleChange('unitID')}
//                         onBlur={handleBlur('unitID')}
//                         displayEmpty
//                         sx={selectStyles}
//                       >
//                         <MenuItem value="">
//                           <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select unit...</span>
//                         </MenuItem>
//                         {unitsLoading ? (
//                           <MenuItem disabled>
//                             <CircularProgress size={20} />
//                           </MenuItem>
//                         ) : (
//                           renderUnits()
//                         )}
//                       </Select>
//                       {touched.unitID && errors.unitID && <FormHelperText sx={errorTextStyles}>{errors.unitID}</FormHelperText>}
//                     </FormControl>
//                   </Grid>
//                 </Grid>
//               </Grid>
//             </Grid>

//             <Divider sx={{ my: 3, backgroundColor: '#e9ecef' }} />

//             {/* Action Buttons */}
//             <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 4 }}>
//               <Button variant="outlined" onClick={handleCancel} disabled={creatingItem} sx={cancelButtonStyles}>
//                 Cancel
//               </Button>
//               <Button type="submit" variant="contained" disabled={creatingItem} sx={saveButtonStyles}>
//                 {creatingItem ? <CircularProgress size={24} /> : 'Save and Close'}
//               </Button>
//             </Box>
//           </form>
//         </CardContent>
//       </Card>

//       {/* Snackbar for notifications */}
//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// // Styles
// const containerStyles = {
//   margin: '0 auto',
//   p: 2,
//   backgroundColor: '#f5f7fa',
//   minHeight: '100vh',
//   fontFamily: 'Arial, sans-serif'
// };

// const headerStyles = {
//   fontWeight: 600,
//   color: '#2c3e50',
//   fontSize: '1.5rem',
//   mb: 1
// };

// const labelStyles = {
//   fontWeight: 500,
//   color: '#6c757d',
//   fontSize: '0.8rem',
//   mb: 1,
//   display: 'block'
// };

// const requiredStarStyles = {
//   color: '#d32f2f',
//   fontWeight: 'bold',
//   marginLeft: '2px'
// };

// const errorTextStyles = {
//   color: '#d32f2f',
//   fontSize: '0.75rem',
//   marginLeft: '14px',
//   marginRight: '14px'
// };

// const inputStyles = {
//   '& .MuiOutlinedInput-root': {
//     borderRadius: '6px',
//     fontSize: '0.9rem',
//     backgroundColor: '#fafbfc',
//     '& fieldset': {
//       borderColor: '#dee2e6'
//     },
//     '&:hover fieldset': {
//       borderColor: '#adb5bd'
//     },
//     '&.Mui-focused fieldset': {
//       borderColor: '#1976d2',
//       borderWidth: '1px'
//     },
//     '&.Mui-error fieldset': {
//       borderColor: '#d32f2f'
//     }
//   },
//   '& .MuiOutlinedInput-input': {
//     color: '#2c3e50',
//     fontWeight: 500
//   },
//   '& .MuiFormHelperText-root': {
//     fontSize: '0.75rem',
//     marginLeft: '0px'
//   }
// };

// const selectStyles = {
//   borderRadius: '6px',
//   fontSize: '0.9rem',
//   backgroundColor: '#fafbfc',
//   '& .MuiOutlinedInput-notchedOutline': {
//     borderColor: '#dee2e6'
//   },
//   '&:hover .MuiOutlinedInput-notchedOutline': {
//     borderColor: '#adb5bd'
//   },
//   '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
//     borderColor: '#1976d2',
//     borderWidth: '1px'
//   },
//   '&.Mui-error .MuiOutlinedInput-notchedOutline': {
//     borderColor: '#d32f2f'
//   },
//   '& .MuiSelect-select': {
//     color: '#2c3e50',
//     fontWeight: 500
//   }
// };

// const cardStyles = {
//   borderRadius: '8px',
//   border: '1px solid #e1e5e9',
//   boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//   backgroundColor: '#ffffff'
// };

// const cancelButtonStyles = {
//   borderRadius: '6px',
//   fontWeight: 500,
//   textTransform: 'none',
//   fontSize: '0.875rem',
//   borderColor: '#6c757d',
//   color: '#6c757d',
//   px: 3,
//   py: 1,
//   '&:hover': {
//     borderColor: '#495057',
//     backgroundColor: 'rgba(108, 117, 125, 0.04)'
//   }
// };

// const saveButtonStyles = {
//   borderRadius: '6px',
//   fontWeight: 500,
//   textTransform: 'none',
//   fontSize: '0.875rem',
//   backgroundColor: '#28a745',
//   px: 3,
//   py: 1,
//   '&:hover': {
//     backgroundColor: '#218838'
//   },
//   '&:disabled': {
//     backgroundColor: '#6c757d'
//   }
// };

// export default AddStockProduct;

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  MenuItem,
  FormControl,
  Select,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  FormHelperText
} from '@mui/material';

// Import your APIs
import { useGetItemCategoriesQuery } from '../../../store/api/itemCategoryApi';
import { useGetItemGroupsQuery } from '../../../store/api/itemGroupApi';
import { useGetItemUnitsDropdownQuery } from '../../../store/api/itemUnitApi';
import { useGetAllAccountsQuery } from '../../../store/api/level4Api';
import { useCreateItemMutation, useUpdateItemMutation, useLazyCheckItemCodeExistsQuery } from '../../../store/api/itemApi';

const AddStockProduct = ({ mode = 'create', product = null, onSave = () => {}, onCancel = () => {} }) => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    categoryID: '',
    groupID: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    stockAssetAccountID: '',
    incomeAccountID: '',
    expenseAccountID: '',
    openingQuantity: '',
    openingRate: '',
    MinLevel: '',
    sRate: '', // Sale Price
    pRate: '', // Cost
    unitID: '',
    isActive: true
  });
  console.log('product details ', product);
  const [errors, setErrors] = useState({
    name: '',
    code: '',
    categoryID: '',
    groupID: '',
    date: '',
    stockAssetAccountID: '',
    incomeAccountID: '',
    expenseAccountID: '',
    unitID: '',
    openingQuantity: '',
    openingRate: '',
    sRate: '',
    pRate: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    code: false,
    categoryID: false,
    groupID: false,
    date: false,
    stockAssetAccountID: false,
    incomeAccountID: false,
    expenseAccountID: false,
    unitID: false
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch data using RTK Query
  const { data: categoriesResponse, isLoading: categoriesLoading, error: categoriesError } = useGetItemCategoriesQuery();
  const { data: groupsResponse, isLoading: groupsLoading, error: groupsError } = useGetItemGroupsQuery();
  const { data: unitsResponse, isLoading: unitsLoading, error: unitsError } = useGetItemUnitsDropdownQuery();
  const { data: accountsResponse, isLoading: accountsLoading, error: accountsError } = useGetAllAccountsQuery();

  const [createItem, { isLoading: creatingItem }] = useCreateItemMutation();
  const [updateItem, { isLoading: updatingItem }] = useUpdateItemMutation();
  const [checkItemCodeExists] = useLazyCheckItemCodeExistsQuery();

  // Transform data to ensure we always have arrays
  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : Array.isArray(categoriesResponse?.data)
      ? categoriesResponse.data
      : [];

  const itemGroups = Array.isArray(groupsResponse?.data) ? groupsResponse.data : Array.isArray(groupsResponse) ? groupsResponse : [];
  const units = Array.isArray(unitsResponse?.data) ? unitsResponse.data : Array.isArray(unitsResponse) ? unitsResponse : [];
  const accounts = Array.isArray(accountsResponse?.data) ? accountsResponse.data : Array.isArray(accountsResponse) ? accountsResponse : [];

  // Filter item groups based on selected category
  const [filteredGroups, setFilteredGroups] = useState([]);

  // Initialize form when mode changes or product is provided
  useEffect(() => {
    if (mode === 'edit' && product) {
      setFormData({
        name: product.itemName || '',
        code: product.itemCode || '',
        categoryID: product.categoryID?.toString() || '',
        groupID: product.groupID?.toString() || '',
        notes: product.notes || '',
        date: product.date || new Date().toISOString().split('T')[0],
        stockAssetAccountID: product.stockAssetAccountID?.toString() || '',
        incomeAccountID: product.incomeAccountID?.toString() || '',
        expenseAccountID: product.expenseAccountID?.toString() || '',
        openingQuantity: product.openingQuantity?.toString() || '',
        openingRate: product.openingRate?.toString() || '',
        MinLevel: product.minLevel?.toString() || '',
        sRate: product.sRate?.toString() || '',
        pRate: product.pRate?.toString() || '',
        unitID: product.unitID?.toString() || '',
        isActive: product.isActive !== undefined ? product.isActive : true
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        code: '',
        categoryID: '',
        groupID: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        stockAssetAccountID: '',
        incomeAccountID: '',
        expenseAccountID: '',
        openingQuantity: '',
        openingRate: '',
        MinLevel: '',
        sRate: '',
        pRate: '',
        unitID: '',
        isActive: true
      });
    }
  }, [mode, product]);

  useEffect(() => {
    if (formData.categoryID && categories.length > 0 && itemGroups.length > 0) {
      const selectedCategory = categories.find((cat) => cat.categoryID == formData.categoryID);
      if (selectedCategory && selectedCategory.groupID) {
        const filtered = itemGroups.filter((group) => group.groupID === selectedCategory.groupID);
        setFilteredGroups(filtered);
      } else {
        setFilteredGroups(itemGroups);
      }
    } else {
      setFilteredGroups(itemGroups);
    }
  }, [formData.categoryID, categories, itemGroups]);

  // Validation functions
  const validateField = async (name, value) => {
    let error = '';

    switch (name) {
      case 'name':
        if (!value.trim()) {
          error = 'Product name is required';
        } else if (value.trim().length < 2) {
          error = 'Product name must be at least 2 characters long';
        }
        break;

      case 'code':
        if (!value.trim()) {
          error = 'Product code is required';
        } else if (value.trim().length < 1) {
          error = 'Product code is required';
        } else {
          // Check if code already exists (for create mode or when code changes in edit mode)
          if (mode === 'create' || (mode === 'edit' && value !== product.itemCode)) {
            try {
              const result = await checkItemCodeExists({
                itemCode: value,
                excludeId: mode === 'edit' ? product.itemID : null
              }).unwrap();
              if (result.exists) {
                error = 'Product code already exists';
              }
            } catch (error) {
              console.error('Error checking item code:', error);
            }
          }
        }
        break;

      case 'categoryID':
        if (!value) {
          error = 'Category is required';
        }
        break;

      case 'groupID':
        if (!value) {
          error = 'Item group is required';
        }
        break;

      case 'date':
        if (!value) {
          error = 'Date is required';
        } else if (new Date(value) > new Date()) {
          error = 'Date cannot be in the future';
        }
        break;

      case 'stockAssetAccountID':
        if (!value) {
          error = 'Stock asset account is required';
        }
        break;

      case 'incomeAccountID':
        if (!value) {
          error = 'Income account is required';
        }
        break;

      case 'expenseAccountID':
        if (!value) {
          error = 'Expense account is required';
        }
        break;

      case 'unitID':
        if (!value) {
          error = 'Unit is required';
        }
        break;

      case 'openingQuantity':
        if (value && (parseFloat(value) < 0 || isNaN(parseFloat(value)))) {
          error = 'Opening quantity must be a positive number';
        }
        break;

      case 'openingRate':
        if (value && (parseFloat(value) < 0 || isNaN(parseFloat(value)))) {
          error = 'Opening rate must be a positive number';
        }
        break;

      case 'sRate':
        if (value && (parseFloat(value) < 0 || isNaN(parseFloat(value)))) {
          error = 'Sale price must be a positive number';
        }
        break;

      case 'pRate':
        if (value && (parseFloat(value) < 0 || isNaN(parseFloat(value)))) {
          error = 'Cost must be a positive number';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const validateForm = async () => {
    const newErrors = {};

    // Validate all required fields
    newErrors.name = await validateField('name', formData.name);
    newErrors.code = await validateField('code', formData.code);
    newErrors.categoryID = await validateField('categoryID', formData.categoryID);
    newErrors.groupID = await validateField('groupID', formData.groupID);
    newErrors.date = await validateField('date', formData.date);
    newErrors.stockAssetAccountID = await validateField('stockAssetAccountID', formData.stockAssetAccountID);
    newErrors.incomeAccountID = await validateField('incomeAccountID', formData.incomeAccountID);
    newErrors.expenseAccountID = await validateField('expenseAccountID', formData.expenseAccountID);
    newErrors.unitID = await validateField('unitID', formData.unitID);
    newErrors.openingQuantity = await validateField('openingQuantity', formData.openingQuantity);
    newErrors.openingRate = await validateField('openingRate', formData.openingRate);
    newErrors.sRate = await validateField('sRate', formData.sRate);
    newErrors.pRate = await validateField('pRate', formData.pRate);

    setErrors(newErrors);

    // Check if form is valid (no error messages)
    return !Object.values(newErrors).some((error) => error !== '');
  };

  const handleBlur = (field) => async (event) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true
    }));

    // Validate the field on blur
    const error = await validateField(field, formData[field]);
    setErrors((prev) => ({
      ...prev,
      [field]: error
    }));
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));

    // If category changes, reset groupID
    if (field === 'categoryID') {
      setFormData((prev) => ({
        ...prev,
        groupID: ''
      }));
      setErrors((prev) => ({
        ...prev,
        groupID: 'Please select an item group'
      }));
    }

    // Validate field in real-time if it's been touched
    if (touched[field]) {
      validateField(field, value).then((error) => {
        setErrors((prev) => ({
          ...prev,
          [field]: error
        }));
      });
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({
      ...prev,
      open: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show all errors
    setTouched({
      name: true,
      code: true,
      categoryID: true,
      groupID: true,
      date: true,
      stockAssetAccountID: true,
      incomeAccountID: true,
      expenseAccountID: true,
      unitID: true
    });

    // Validate entire form
    const isValid = await validateForm();
    if (!isValid) {
      showSnackbar('Please fix the validation errors before submitting', 'error');
      return;
    }

    // Prepare data for backend - ONLY include fields that exist in database
    const submitData = {
      itemName: formData.name,
      itemCode: formData.code,
      categoryID: formData.categoryID ? parseInt(formData.categoryID) : null,
      groupID: formData.groupID ? parseInt(formData.groupID) : null,
      pRate: formData.pRate ? parseFloat(formData.pRate) : null,
      sRate: formData.sRate ? parseFloat(formData.sRate) : null,
      MinLevel: formData.MinLevel ? parseInt(formData.MinLevel) : null,
      date: formData.date,
      openingQuantity: formData.openingQuantity ? parseInt(formData.openingQuantity) : null,
      openingRate: formData.openingRate ? parseFloat(formData.openingRate) : null,
      lowStockLevel: formData.MinLevel ? parseInt(formData.MinLevel) : null, // Using MinLevel for lowStockLevel
      stockAssetAccountID: formData.stockAssetAccountID ? parseInt(formData.stockAssetAccountID) : null,
      incomeAccountID: formData.incomeAccountID ? parseInt(formData.incomeAccountID) : null,
      expenseAccountID: formData.expenseAccountID ? parseInt(formData.expenseAccountID) : null,
      unitID: formData.unitID ? parseInt(formData.unitID) : null,
      notes: formData.notes,
      isActive: formData.isActive,
      modifyBy: user?.userID || 1
    };

    console.log('Submitting data:', submitData);

    try {
      let result;
      if (mode === 'create') {
        submitData.createdBy = user?.userID || 1;
        result = await createItem(submitData).unwrap();
        showSnackbar('Product created successfully!', 'success');
        console.log('Product created:', result);

        // Reset form after successful submission
        setFormData({
          name: '',
          code: '',
          categoryID: '',
          groupID: '',
          notes: '',
          date: new Date().toISOString().split('T')[0],
          stockAssetAccountID: '',
          incomeAccountID: '',
          expenseAccountID: '',
          openingQuantity: '',
          openingRate: '',
          MinLevel: '',
          sRate: '',
          pRate: '',
          unitID: '',
          isActive: true
        });
      } else {
        submitData.ItemID = product.itemID;
        result = await updateItem({
          id: product.itemID,
          ...submitData
        }).unwrap();
        showSnackbar('Product updated successfully!', 'success');
        console.log('Product updated:', result);
      }

      // Reset errors and touched states
      setErrors({});
      setTouched({});

      // Call onSave callback if provided
      if (onSave) {
        onSave('success', mode === 'create' ? 'Product created successfully!' : 'Product updated successfully!');
      }
    } catch (error) {
      console.error(`Failed to ${mode} product:`, error);
      showSnackbar(error?.data?.message || `Failed to ${mode} product`, 'error');
    }
  };

  const handleCancel = () => {
    if (mode === 'create') {
      setFormData({
        name: '',
        code: '',
        categoryID: '',
        groupID: '',
        notes: '',
        date: new Date().toISOString().split('T')[0],
        stockAssetAccountID: '',
        incomeAccountID: '',
        expenseAccountID: '',
        openingQuantity: '',
        openingRate: '',
        MinLevel: '',
        sRate: '',
        pRate: '',
        unitID: '',
        isActive: true
      });
    }
    setErrors({});
    setTouched({});
    showSnackbar('Form cancelled', 'info');

    // Call onCancel callback if provided
    if (onCancel) {
      onCancel();
    }
  };

  // Safe rendering functions
  const renderCategories = () => {
    if (!Array.isArray(categories) || categories.length === 0) {
      return (
        <MenuItem disabled>
          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>No categories available</span>
        </MenuItem>
      );
    }
    return categories.map((category) => (
      <MenuItem key={category.categoryID} value={category.categoryID} sx={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
        {category.categoryName}
      </MenuItem>
    ));
  };

  const renderFilteredGroups = () => {
    if (!Array.isArray(filteredGroups)) {
      return (
        <MenuItem disabled>
          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Loading groups...</span>
        </MenuItem>
      );
    }
    if (filteredGroups.length === 0) {
      return (
        <MenuItem disabled>
          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>No groups available for this category</span>
        </MenuItem>
      );
    }
    return filteredGroups.map((group) => (
      <MenuItem key={group.groupID} value={group.groupID} sx={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
        {group.groupName}
      </MenuItem>
    ));
  };

  const renderUnits = () => {
    if (!Array.isArray(units) || units.length === 0) {
      return (
        <MenuItem disabled>
          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>No units available</span>
        </MenuItem>
      );
    }
    return units.map((unit) => (
      <MenuItem key={unit.value} value={unit.value} sx={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
        {unit.label}
      </MenuItem>
    ));
  };

  const renderAccounts = () => {
    if (accountsLoading) {
      return (
        <MenuItem disabled>
          <CircularProgress size={20} />
          <span style={{ marginLeft: 8 }}>Loading accounts...</span>
        </MenuItem>
      );
    }
    if (!Array.isArray(accounts) || accounts.length === 0) {
      return (
        <MenuItem disabled>
          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>No accounts available</span>
        </MenuItem>
      );
    }
    return accounts.map((account) => (
      <MenuItem key={account.value} value={account.value} sx={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 500 }}>
        {account.label}
      </MenuItem>
    ));
  };

  // Loading state
  if (categoriesLoading || groupsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading form data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={containerStyles}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: 'left' }}>
        <Typography variant="h5" component="h2" sx={headerStyles}>
          {mode === 'create' ? 'Add Product' : 'Edit Product'}
        </Typography>
      </Box>

      {/* Show errors if any */}
      {categoriesError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load categories: {categoriesError.message}
        </Alert>
      )}
      {groupsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load item groups: {groupsError.message}
        </Alert>
      )}
      {accountsError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load accounts: {accountsError.message}
        </Alert>
      )}

      <Card sx={cardStyles}>
        <CardContent sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            {/* Row 1: Name, Date, Opening Quantity, Opening Rate */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={labelStyles}>
                  Name <span style={requiredStarStyles}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={handleChange('name')}
                  onBlur={handleBlur('name')}
                  size="small"
                  required
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <Typography sx={labelStyles}>
                  Date <span style={requiredStarStyles}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  type="date"
                  value={formData?.date ? formData.date.split('T')[0] : ''}
                  onChange={handleChange('date')}
                  onBlur={handleBlur('date')}
                  size="small"
                  required
                  error={touched.date && !!errors.date}
                  helperText={touched.date && errors.date}
                  InputLabelProps={{ shrink: true }}
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <Typography sx={labelStyles}>Opening Quantity</Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0"
                  value={formData.openingQuantity}
                  onChange={handleChange('openingQuantity')}
                  onBlur={handleBlur('openingQuantity')}
                  size="small"
                  error={!!errors.openingQuantity}
                  helperText={errors.openingQuantity}
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <Typography sx={labelStyles}>Opening Rate</Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0.00"
                  value={formData.openingRate}
                  onChange={handleChange('openingRate')}
                  onBlur={handleBlur('openingRate')}
                  size="small"
                  error={!!errors.openingRate}
                  helperText={errors.openingRate}
                  sx={inputStyles}
                />
              </Grid>
            </Grid>

            {/* Row 2: Code/Number, Stock Asset Account, Minimum Level */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={labelStyles}>
                  Code / Number <span style={requiredStarStyles}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter code or number"
                  value={formData.code}
                  onChange={handleChange('code')}
                  onBlur={handleBlur('code')}
                  size="small"
                  required
                  error={touched.code && !!errors.code}
                  helperText={touched.code && errors.code}
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography sx={labelStyles}>
                  Stock Asset Account <span style={requiredStarStyles}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={touched.stockAssetAccountID && !!errors.stockAssetAccountID}>
                  <Select
                    value={formData.stockAssetAccountID}
                    onChange={handleChange('stockAssetAccountID')}
                    onBlur={handleBlur('stockAssetAccountID')}
                    displayEmpty
                    sx={selectStyles}
                  >
                    <MenuItem value="">
                      <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select stock account...</span>
                    </MenuItem>
                    {renderAccounts()}
                  </Select>
                  {touched.stockAssetAccountID && errors.stockAssetAccountID && (
                    <FormHelperText sx={errorTextStyles}>{errors.stockAssetAccountID}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography sx={labelStyles}>Minimum Level</Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0"
                  value={formData.MinLevel}
                  onChange={handleChange('MinLevel')}
                  size="small"
                  sx={inputStyles}
                />
              </Grid>
            </Grid>

            {/* Row 3: Category, Item Group, Income Account, Sale Price */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={3}>
                <Typography sx={labelStyles}>
                  Category <span style={requiredStarStyles}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={touched.categoryID && !!errors.categoryID}>
                  <Select
                    value={formData.categoryID}
                    onChange={handleChange('categoryID')}
                    onBlur={handleBlur('categoryID')}
                    displayEmpty
                    sx={selectStyles}
                  >
                    <MenuItem value="">
                      <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select category...</span>
                    </MenuItem>
                    {renderCategories()}
                  </Select>
                  {touched.categoryID && errors.categoryID && <FormHelperText sx={errorTextStyles}>{errors.categoryID}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography sx={labelStyles}>
                  Item Group <span style={requiredStarStyles}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={touched.groupID && !!errors.groupID}>
                  <Select
                    value={formData.groupID}
                    onChange={handleChange('groupID')}
                    onBlur={handleBlur('groupID')}
                    displayEmpty
                    sx={selectStyles}
                  >
                    <MenuItem value="">
                      <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                        {formData.categoryID ? 'Select item group...' : 'All groups'}
                      </span>
                    </MenuItem>
                    {renderFilteredGroups()}
                  </Select>
                  {touched.groupID && errors.groupID && <FormHelperText sx={errorTextStyles}>{errors.groupID}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography sx={labelStyles}>
                  Income Account <span style={requiredStarStyles}>*</span>
                </Typography>
                <FormControl fullWidth size="small" error={touched.incomeAccountID && !!errors.incomeAccountID}>
                  <Select
                    value={formData.incomeAccountID}
                    onChange={handleChange('incomeAccountID')}
                    onBlur={handleBlur('incomeAccountID')}
                    displayEmpty
                    sx={selectStyles}
                  >
                    <MenuItem value="">
                      <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select income account...</span>
                    </MenuItem>
                    {renderAccounts()}
                  </Select>
                  {touched.incomeAccountID && errors.incomeAccountID && (
                    <FormHelperText sx={errorTextStyles}>{errors.incomeAccountID}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={3}>
                <Typography sx={labelStyles}>Sale Price</Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0.00"
                  value={formData.sRate}
                  onChange={handleChange('sRate')}
                  onBlur={handleBlur('sRate')}
                  size="small"
                  error={!!errors.sRate}
                  helperText={errors.sRate}
                  sx={inputStyles}
                />
              </Grid>
            </Grid>

            {/* Row 4: Notes, Expense Account, Cost, Unit */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <Typography sx={labelStyles}>Notes</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={5}
                  placeholder="Enter notes..."
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  size="small"
                  sx={inputStyles}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography sx={labelStyles}>
                      Expense Account <span style={requiredStarStyles}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={touched.expenseAccountID && !!errors.expenseAccountID}>
                      <Select
                        value={formData.expenseAccountID}
                        onChange={handleChange('expenseAccountID')}
                        onBlur={handleBlur('expenseAccountID')}
                        displayEmpty
                        sx={selectStyles}
                      >
                        <MenuItem value="">
                          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select expense account...</span>
                        </MenuItem>
                        {renderAccounts()}
                      </Select>
                      {touched.expenseAccountID && errors.expenseAccountID && (
                        <FormHelperText sx={errorTextStyles}>{errors.expenseAccountID}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography sx={labelStyles}>Cost</Typography>
                    <TextField
                      fullWidth
                      type="number"
                      placeholder="0.00"
                      value={formData.pRate}
                      onChange={handleChange('pRate')}
                      onBlur={handleBlur('pRate')}
                      size="small"
                      error={!!errors.pRate}
                      helperText={errors.pRate}
                      sx={inputStyles}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography sx={labelStyles}>
                      Unit <span style={requiredStarStyles}>*</span>
                    </Typography>
                    <FormControl fullWidth size="small" error={touched.unitID && !!errors.unitID}>
                      <Select
                        value={formData.unitID}
                        onChange={handleChange('unitID')}
                        onBlur={handleBlur('unitID')}
                        displayEmpty
                        sx={selectStyles}
                      >
                        <MenuItem value="">
                          <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>Select unit...</span>
                        </MenuItem>
                        {unitsLoading ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} />
                          </MenuItem>
                        ) : (
                          renderUnits()
                        )}
                      </Select>
                      {touched.unitID && errors.unitID && <FormHelperText sx={errorTextStyles}>{errors.unitID}</FormHelperText>}
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3, backgroundColor: '#e9ecef' }} />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between', mt: 4 }}>
              <Button variant="outlined" onClick={handleCancel} disabled={creatingItem || updatingItem} sx={cancelButtonStyles}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={creatingItem || updatingItem} sx={saveButtonStyles}>
                {creatingItem || updatingItem ? <CircularProgress size={24} /> : mode === 'create' ? 'Save and Close' : 'Update Product'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Styles (keep the same as before)
const containerStyles = {
  margin: '0 auto',
  p: 2,
  backgroundColor: '#f5f7fa',
  minHeight: '100vh',
  fontFamily: 'Arial, sans-serif'
};

const headerStyles = {
  fontWeight: 600,
  color: '#2c3e50',
  fontSize: '1.5rem',
  mb: 1
};

const labelStyles = {
  fontWeight: 500,
  color: '#6c757d',
  fontSize: '0.8rem',
  mb: 1,
  display: 'block'
};

const requiredStarStyles = {
  color: '#d32f2f',
  fontWeight: 'bold',
  marginLeft: '2px'
};

const errorTextStyles = {
  color: '#d32f2f',
  fontSize: '0.75rem',
  marginLeft: '14px',
  marginRight: '14px'
};

const inputStyles = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '6px',
    fontSize: '0.9rem',
    backgroundColor: '#fafbfc',
    '& fieldset': {
      borderColor: '#dee2e6'
    },
    '&:hover fieldset': {
      borderColor: '#adb5bd'
    },
    '&.Mui-focused fieldset': {
      borderColor: '#1976d2',
      borderWidth: '1px'
    },
    '&.Mui-error fieldset': {
      borderColor: '#d32f2f'
    }
  },
  '& .MuiOutlinedInput-input': {
    color: '#2c3e50',
    fontWeight: 500
  },
  '& .MuiFormHelperText-root': {
    fontSize: '0.75rem',
    marginLeft: '0px'
  }
};

const selectStyles = {
  borderRadius: '6px',
  fontSize: '0.9rem',
  backgroundColor: '#fafbfc',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#dee2e6'
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#adb5bd'
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#1976d2',
    borderWidth: '1px'
  },
  '&.Mui-error .MuiOutlinedInput-notchedOutline': {
    borderColor: '#d32f2f'
  },
  '& .MuiSelect-select': {
    color: '#2c3e50',
    fontWeight: 500
  }
};

const cardStyles = {
  borderRadius: '8px',
  border: '1px solid #e1e5e9',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  backgroundColor: '#ffffff'
};

const cancelButtonStyles = {
  borderRadius: '6px',
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '0.875rem',
  borderColor: '#6c757d',
  color: '#6c757d',
  px: 3,
  py: 1,
  '&:hover': {
    borderColor: '#495057',
    backgroundColor: 'rgba(108, 117, 125, 0.04)'
  }
};

const saveButtonStyles = {
  borderRadius: '6px',
  fontWeight: 500,
  textTransform: 'none',
  fontSize: '0.875rem',
  backgroundColor: '#28a745',
  px: 3,
  py: 1,
  '&:hover': {
    backgroundColor: '#218838'
  },
  '&:disabled': {
    backgroundColor: '#6c757d'
  }
};

export default AddStockProduct;
