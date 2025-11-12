import { Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import Invoice from "./pages/dashboard/sales/Invoice";
import { CustomerInformation } from "./pages/dashboard/navbar/setup/lists/customer/CustomerInformation";
import { ProductForm } from "./pages/dashboard/navbar/setup/lists/products/ProductForm";

// Create placeholder components for other routes
const Dashboard = () => (
  <div className="p-6">
    <div className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome to CRM Dashboard
      </h1>
      <p className="text-gray-600">
        Manage your customer relationships and sales pipeline effectively.
      </p>
    </div>
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <div className="rounded-lg border bg-white shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Total Customers
        </h3>
        <div className="text-2xl font-bold">1,245</div>
        <p className="text-xs text-gray-500">+12% from last month</p>
      </div>
      <div className="rounded-lg border bg-white shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Active Deals</h3>
        <div className="text-2xl font-bold">89</div>
        <p className="text-xs text-gray-500">+8% from last month</p>
      </div>
      <div className="rounded-lg border bg-white shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Revenue</h3>
        <div className="text-2xl font-bold">$54,231</div>
        <p className="text-xs text-gray-500">+15% from last month</p>
      </div>
      <div className="rounded-lg border bg-white shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Conversion Rate
        </h3>
        <div className="text-2xl font-bold">23.5%</div>
        <p className="text-xs text-gray-500">+2.1% from last month</p>
      </div>
    </div>
  </div>
);

const CRM = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">CRM Module</h1>
    <p className="text-gray-600">Manage your customer relationships here.</p>
  </div>
);

const Sales = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Sales Module</h1>
    <p className="text-gray-600">Handle all your sales operations.</p>
  </div>
);

const Purchases = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold mb-4">Purchases Module</h1>
    <p className="text-gray-600">Manage your purchase orders and vendors.</p>
  </div>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="sales/invoices" element={<Invoice />} />
        <Route
          path="setup/customer-information"
          element={<CustomerInformation />}
        />
        <Route path="/setup/product-form" element={<ProductForm />} />
      </Route>
    </Routes>
  );
}

export default App;
