// src/routes/MainRoutes.js
import React, { lazy } from 'react';

// project import
import MainLayout from 'layout/MainLayout';
import Loadable from 'component/Loadable';
import ProtectedRoute from './ProtectedRoute';

const DashboardDefault = Loadable(lazy(() => import('views/Dashboard/Default')));
const UtilsTypography = Loadable(lazy(() => import('views/Utils/Typography')));
const SamplePage = Loadable(lazy(() => import('views/SamplePage')));
const Quotation = Loadable(lazy(() => import('views/Dashboard/Quotation')));
const PriceList = Loadable(lazy(() => import('views/Dashboard/PriceList')));
const UserRightsForm = Loadable(lazy(() => import('views/Dashboard/FormAndRight')));
const CityForm = Loadable(lazy(() => import('views/Dashboard/CityForm')));
const HotalForm = Loadable(lazy(() => import('views/Dashboard/HotalForm')));
const PackageForm = Loadable(lazy(() => import('views/Dashboard/PackageForm')));
const PaxForm = Loadable(lazy(() => import('views/Dashboard/PaxForm')));
const RateHotal = Loadable(lazy(() => import('views/Dashboard/RateHotelForm')));
const RateVisa = Loadable(lazy(() => import('views/Dashboard/RateVisaForm')));
const SectorForm = Loadable(lazy(() => import('views/Dashboard/SectorForm')));
const QueryForm = Loadable(lazy(() => import('views/Dashboard/QueryForm')));
const MasterAdv = Loadable(lazy(() => import('views/Dashboard/MasterAdv')));
const AccountForm = Loadable(lazy(() => import('views/Dashboard/Accounts')));
const ItemGroupForm = Loadable(lazy(() => import('views/Dashboard/ItemGroup')));
const ItemCategoryForm = Loadable(lazy(() => import('views/Dashboard/ItemCategory')));
const StockProductionForm = Loadable(lazy(() => import('views/Dashboard/AddStockProduct')));
const PurchaseForm = Loadable(lazy(() => import('views/Dashboard/AddPurchaseForm')));

// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: (
        <ProtectedRoute requireAuthentication={true}>
          <DashboardDefault />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/default',
      element: (
        <ProtectedRoute requireAuthentication={true}>
          <DashboardDefault />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/pricelistform',
      element: (
        <ProtectedRoute requiredForm="PrceList">
          {' '}
          {/* Fixed from "pricelist" to "PrceList" */}
          <PriceList />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/userrightsForm',
      element: (
        <ProtectedRoute requiredForm="UserRights" adminOnly={true}>
          {' '}
          {/* Fixed from "userrights" to "UserRights" */}
          <UserRightsForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/cityform',
      element: (
        <ProtectedRoute requiredForm="City" adminOnly={true}>
          <CityForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/hotelform',
      element: (
        <ProtectedRoute requiredForm="Hotel" adminOnly={true}>
          <HotalForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/PackageForm',
      element: (
        <ProtectedRoute requiredForm="Package" adminOnly={true}>
          <PackageForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/PaxForm',
      element: (
        <ProtectedRoute requiredForm="Pax" adminOnly={true}>
          <PaxForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/ratehotelform',
      element: (
        <ProtectedRoute requiredForm="RateHotel" adminOnly={true}>
          <RateHotal />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/ratevisaform',
      element: (
        <ProtectedRoute requiredForm="RateVisa" adminOnly={true}>
          <RateVisa />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/sectorform',
      element: (
        <ProtectedRoute requiredForm="Sector" adminOnly={true}>
          <SectorForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/QueryForm',
      element: (
        <ProtectedRoute requiredForm="QueryForm">
          {' '}
          {/* Fixed from "query" to "QueryForm" */}
          <QueryForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/sample-page',
      element: (
        <ProtectedRoute requireAuthentication={true}>
          <SamplePage />
        </ProtectedRoute>
      )
    },
    {
      path: '/utils/util-typography',
      element: (
        <ProtectedRoute requireAuthentication={true}>
          <UtilsTypography />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/quotationform',
      element: (
        <ProtectedRoute requiredForm="Quotation">
          {' '}
          {/* Fixed from "quotation" to "Quotation" */}
          <Quotation />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/masterform',
      element: (
        <ProtectedRoute requiredForm="Advertisement">
          {' '}
          {/* Fixed from "master" to "Advertisement" */}
          <MasterAdv />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/accountform',
      element: (
        <ProtectedRoute requiredForm="Account" adminOnly={true}>
          <AccountForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/itemgroupform',
      element: (
        <ProtectedRoute requiredForm="ItemGroup" adminOnly={true}>
          <ItemGroupForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/itemcategoryform',
      element: (
        <ProtectedRoute requiredForm="ItemCategory" adminOnly={true}>
          <ItemCategoryForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/stockproductionform',
      element: (
        <ProtectedRoute requiredForm="StockProduction" adminOnly={true}>
          <StockProductionForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/purchaseform',
      element: (
        <ProtectedRoute requiredForm="Purchase">
          {' '}
          {/* Fixed from "stockconsumption" to "Purchase" */}
          <PurchaseForm />
        </ProtectedRoute>
      )
    },
    // Add missing routes that appear in your debug logs
    {
      path: '/dashboard/changepasswordform',
      element: (
        <ProtectedRoute requiredForm="ChangePassword">
          <div>Change Password Form - Implement this component</div>
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/printingform',
      element: (
        <ProtectedRoute requiredForm="Printing">
          <div>Printing Form - Implement this component</div>
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/invoiceform',
      element: (
        <ProtectedRoute requiredForm="Invoice">
          <div>Invoice Form - Implement this component</div>
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/deliverynoteform',
      element: (
        <ProtectedRoute requiredForm="DeliveryNote">
          <div>Delivery Note Form - Implement this component</div>
        </ProtectedRoute>
      )
    }
  ]
};

export default MainRoutes;
