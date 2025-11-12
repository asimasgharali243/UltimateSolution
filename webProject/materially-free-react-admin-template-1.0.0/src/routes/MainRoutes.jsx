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
// const MasterList = Loadable(lazy(() => import('views/Dashboard/MasterAdvList')));
// const MasterForm = Loadable(lazy(() => import('views/Dashboard/MasterAdv')));
const MasterAdv = Loadable(lazy(() => import('views/Dashboard/MasterAdv')));
// ==============================|| MAIN ROUTES ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <DashboardDefault />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/default',
      element: (
        <ProtectedRoute>
          <DashboardDefault />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/pricelist',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'pricelist', permission: 'view' },
            { formName: 'pricelist', permission: 'save' },
            { formName: 'pricelist', permission: 'update' },
            { formName: 'pricelist', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <PriceList />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/userrightsForm',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'userrights', permission: 'view' },
            { formName: 'userrights', permission: 'save' },
            { formName: 'userrights', permission: 'update' },
            { formName: 'userrights', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <UserRightsForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/cityform',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'city', permission: 'view' },
            { formName: 'city', permission: 'save' },
            { formName: 'city', permission: 'update' },
            { formName: 'city', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <CityForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/hotalform',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'hotel', permission: 'view' },
            { formName: 'hotel', permission: 'save' },
            { formName: 'hotel', permission: 'update' },
            { formName: 'hotel', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <HotalForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/PackageForm',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'package', permission: 'view' },
            { formName: 'package', permission: 'save' },
            { formName: 'package', permission: 'update' },
            { formName: 'package', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <PackageForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/PaxForm',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'pax', permission: 'view' },
            { formName: 'pax', permission: 'save' },
            { formName: 'pax', permission: 'update' },
            { formName: 'pax', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <PaxForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/ratehotal',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'ratehotel', permission: 'view' },
            { formName: 'ratehotel', permission: 'save' },
            { formName: 'ratehotel', permission: 'update' },
            { formName: 'ratehotel', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <RateHotal />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/ratevisa',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'ratevisa', permission: 'view' },
            { formName: 'ratevisa', permission: 'save' },
            { formName: 'ratevisa', permission: 'update' },
            { formName: 'ratevisa', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <RateVisa />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/sectorform',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'sector', permission: 'view' },
            { formName: 'sector', permission: 'save' },
            { formName: 'sector', permission: 'update' },
            { formName: 'sector', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <SectorForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/QueryForm',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'query', permission: 'view' },
            { formName: 'query', permission: 'save' },
            { formName: 'query', permission: 'update' },
            { formName: 'query', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <QueryForm />
        </ProtectedRoute>
      )
    },
    {
      path: '/sample-page',
      element: (
        <ProtectedRoute>
          <SamplePage />
        </ProtectedRoute>
      )
    },
    {
      path: '/utils/util-typography',
      element: (
        <ProtectedRoute>
          <UtilsTypography />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/quotation',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'quotation', permission: 'view' },
            { formName: 'quotation', permission: 'save' },
            { formName: 'quotation', permission: 'update' },
            { formName: 'quotation', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <Quotation />
        </ProtectedRoute>
      )
    },
    {
      path: '/dashboard/master',
      element: (
        <ProtectedRoute
          requiredPermissions={[
            { formName: 'master', permission: 'view' },
            { formName: 'master', permission: 'save' },
            { formName: 'master', permission: 'update' },
            { formName: 'master', permission: 'delete' }
          ]}
          requireAnyPermission={true}
        >
          <MasterAdv />
        </ProtectedRoute>
      )
    }
  ]
};

export default MainRoutes;
