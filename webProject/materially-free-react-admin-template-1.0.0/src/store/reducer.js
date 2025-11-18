// store/reducer.js
import { combineReducers } from 'redux';
import customizationReducer from './customizationReducer';
import authReducer from './slices/authSlice';
import { authApi } from './api/authApi';
import { sectorApi } from './api/sectorApi';
import { cityApi } from './api/cityApi';
import { hotelApi } from './api/hotelApi';
import { paxApi } from './api/paxApi';
import { rateVisaApi } from './api/rateVisaApi';
import { rateHotelApi } from './api/rateHotelApi';
import { packageApi } from './api/packageApi';
import { quotationApi } from './api/quotationApi';
import { masterApi } from './api/masterApi';
import { clientApi } from './api/clientApi';
import { queryFormApi } from './api/queryFormApi';
import { userRightsApi } from './api/userRightsApi';
import {advertisementApi} from './api/advertisementApi';
import {accountApi} from './api/accountApi';
import {itemGroupApi} from './api/itemGroupApi';
import {itemCategoryApi} from './api/itemCategoryApi';

import { itemApi } from './api/itemApi';
import { itemUnitApi } from './api/itemUnitApi';
import { level4Api } from './api/level4Api';
import { purchaseApi } from './api/purchaseApi';

const reducer = combineReducers({
  customization: customizationReducer,
  auth: authReducer,

  // RTK Query reducers
  [authApi.reducerPath]: authApi.reducer,
  [sectorApi.reducerPath]: sectorApi.reducer,
  [cityApi.reducerPath]: cityApi.reducer,
  [hotelApi.reducerPath]: hotelApi.reducer,
  [paxApi.reducerPath]: paxApi.reducer,
  [rateVisaApi.reducerPath]: rateVisaApi.reducer,
  [rateHotelApi.reducerPath]: rateHotelApi.reducer,
  [packageApi.reducerPath]: packageApi.reducer,
  [quotationApi.reducerPath]: quotationApi.reducer,
  [masterApi.reducerPath]: masterApi.reducer,
  [clientApi.reducerPath]: clientApi.reducer,
  [queryFormApi.reducerPath]: queryFormApi.reducer,
  [userRightsApi.reducerPath]: userRightsApi.reducer,
  [advertisementApi.reducerPath]: advertisementApi.reducer,
  [accountApi.reducerPath]: accountApi.reducer,
  [itemGroupApi.reducerPath]: itemGroupApi.reducer,
  [itemCategoryApi.reducerPath]: itemCategoryApi.reducer,
  [itemApi.reducerPath]: itemApi.reducer,
  [itemUnitApi.reducerPath]: itemUnitApi.reducer,
  [level4Api.reducerPath]: level4Api.reducer,
  [purchaseApi.reducerPath]: purchaseApi.reducer,
});

export default reducer;