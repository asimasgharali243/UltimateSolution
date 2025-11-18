// store/store.js
import { configureStore } from '@reduxjs/toolkit';
import reducer from './reducer';
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

export const store = configureStore({

  reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(
      authApi.middleware,
      sectorApi.middleware,
      cityApi.middleware,
      hotelApi.middleware,
      paxApi.middleware,
      rateVisaApi.middleware,
      rateHotelApi.middleware,
      packageApi.middleware,
      quotationApi.middleware,
      masterApi.middleware,
      clientApi.middleware,
      queryFormApi.middleware,
      userRightsApi.middleware,
      advertisementApi.middleware,
      accountApi.middleware,
      itemGroupApi.middleware,
      itemCategoryApi.middleware,
      itemApi.middleware,
      itemUnitApi.middleware,
      level4Api.middleware,
      purchaseApi.middleware,
    ),
  devTools: import.meta.env.MODE !== 'production',
});

export default store;