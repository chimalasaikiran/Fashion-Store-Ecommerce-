import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/Auth/SignIn';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Users from './pages/Users/Users';
import Roles from './pages/Roles/Roles';
import Products from './pages/Products/Products';
import Orders from './pages/Orders/Orders';
import Shipments from './pages/Shipments/Shipments';
import Tickets from './pages/Tickets/Tickets';
import Payments from './pages/Payments/Payments';
import Settings from './pages/Settings/Settings';
import HelpCenter from './pages/HelpCenter/HelpCenter';
import { RoleAccessProvider } from './context/RoleAccessContext';
import RouteGuard from './components/common/RouteGuard';
import { UsersProvider } from './pages/Users/UsersContext';
import { ProductsProvider } from './pages/Products/ProductsContext';
import { OrdersProvider } from './pages/Orders/OrdersContext';
import { ShipmentsProvider } from './pages/Shipments/ShipmentsContext';
import { TicketsProvider } from './pages/Tickets/TicketsContext';
import { PaymentsProvider } from './pages/Payments/PaymentsContext';


const UserList = lazy(() => import('./pages/Users/UserList'));
const UserDetails = lazy(() => import('./pages/Users/UserDetails'));
const UserActivityLog = lazy(() => import('./pages/Users/UserActivityLog'));
const UserNotificationPreferences = lazy(() => import('./pages/Users/UserNotificationPreferences'));


const ProductList = lazy(() => import('./pages/Products/ProductList'));
const CategoryList = lazy(() => import('./pages/Products/CategoryList'));
const ProductDetail = lazy(() => import('./pages/Products/ProductDetail'));
const InventoryManagement = lazy(() => import('./pages/Products/InventoryManagement'));


const OrderList = lazy(() => import('./pages/Orders/OrderList'));
const OrderDetails = lazy(() => import('./pages/Orders/OrderDetails'));


const ShipmentCreation = lazy(() => import('./pages/Shipments/ShipmentCreation'));
const TrackShipments = lazy(() => import('./pages/Shipments/TrackShipments'));
const ReturnRequests = lazy(() => import('./pages/Shipments/ReturnRequests'));
const RefundProcessing = lazy(() => import('./pages/Shipments/RefundProcessing'));
const ReplacementOrders = lazy(() => import('./pages/Shipments/ReplacementOrders'));
const CancellationRequests = lazy(() => import('./pages/Shipments/CancellationRequests'));


const TicketDashboard = lazy(() => import('./pages/Tickets/TicketDashboard'));
const TicketDetails = lazy(() => import('./pages/Tickets/TicketDetails'));
const TicketEscalation = lazy(() => import('./pages/Tickets/TicketEscalation'));
const TicketClosure = lazy(() => import('./pages/Tickets/TicketClosure'));


const PaymentLogs = lazy(() => import('./pages/Payments/PaymentLogs'));
const InvoiceManagement = lazy(() => import('./pages/Payments/InvoiceManagement'));
const CreditNotes = lazy(() => import('./pages/Payments/CreditNotes'));
const StatusNotifications = lazy(() => import('./pages/Payments/StatusNotifications'));


const SuspenseLoader = () => (
  <div className="w-full min-h-[300px] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#00522E]/20 border-t-[#00522E] rounded-full animate-spin"></div>
      <p className="text-sm font-semibold text-[#797979]">Loading module...</p>
    </div>
  </div>
);


const DB_VERSION_KEY = 'fs_db_version_andhra_v3';
if (typeof window !== 'undefined' && !localStorage.getItem(DB_VERSION_KEY)) {
  const keysToClear = [
    'users_data',
    'users_activities',
    'orders_data',
    'shipments_data',
    'returns_data',
    'refunds_data',
    'replacements_data',
    'tickets_data',
    'rbac_audit_logs',
    'products_catalog',
    'categories_catalog',
    'products_movements',
    'products_activities',
    'fs_transactions',
    'fs_invoices',
    'fs_credit_notes',
    'fs_notifications'
  ];
  keysToClear.forEach(key => localStorage.removeItem(key));
  localStorage.setItem(DB_VERSION_KEY, 'true');
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const handleLoginSuccess = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setIsLoggedIn(false);
  };

  return (
    <RoleAccessProvider isLoggedIn={isLoggedIn}>
      <UsersProvider isLoggedIn={isLoggedIn}>
        <ProductsProvider>
          <OrdersProvider isLoggedIn={isLoggedIn}>
            <ShipmentsProvider>
              <TicketsProvider>
                <PaymentsProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route 
                        path="/login" 
                        element={
                          isLoggedIn ? <Navigate to="/dashboard" replace /> : <SignIn onSignInSuccess={handleLoginSuccess} />
                        } 
                      />
                      <Route 
                        path="/dashboard" 
                        element={
                          isLoggedIn ? <DashboardLayout onLogout={handleLogout} /> : <Navigate to="/login" replace />
                        } 
                      >
                        {}
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={
                          <RouteGuard module="customers" subpage="User List">
                            <Users />
                          </RouteGuard>
                        }>
                          <Route index element={
                            <RouteGuard module="customers" subpage="User List">
                              <Suspense fallback={<SuspenseLoader />}>
                                <UserList />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="details" element={
                            <RouteGuard module="customers" subpage="User Details">
                              <Suspense fallback={<SuspenseLoader />}>
                                <UserDetails />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="details/:id" element={
                            <RouteGuard module="customers" subpage="User Details">
                              <Suspense fallback={<SuspenseLoader />}>
                                <UserDetails />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="activity" element={
                            <RouteGuard module="customers" subpage="Activity Log">
                              <Suspense fallback={<SuspenseLoader />}>
                                <UserActivityLog />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="notifications" element={
                            <RouteGuard module="customers" subpage="Notification Preferences">
                              <Suspense fallback={<SuspenseLoader />}>
                                <UserNotificationPreferences />
                              </Suspense>
                            </RouteGuard>
                          } />
                        </Route>
                        <Route path="roles" element={
                          <RouteGuard module="roles" subpage="Role & Access Management">
                            <Roles />
                          </RouteGuard>
                        } />
                        <Route path="products" element={<Products />}>
                          <Route index element={
                            <RouteGuard module="products" subpage="Product List">
                              <Suspense fallback={<SuspenseLoader />}>
                                <ProductList />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="categories" element={
                            <RouteGuard module="products" subpage="Category List">
                              <Suspense fallback={<SuspenseLoader />}>
                                <CategoryList />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="details" element={
                            <RouteGuard module="products" subpage="Product Detail">
                              <Suspense fallback={<SuspenseLoader />}>
                                <ProductDetail />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="details/:id" element={
                            <RouteGuard module="products" subpage="Product Detail">
                              <Suspense fallback={<SuspenseLoader />}>
                                <ProductDetail />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="inventory" element={
                            <RouteGuard module="products" subpage="Inventory Management">
                              <Suspense fallback={<SuspenseLoader />}>
                                <InventoryManagement />
                              </Suspense>
                            </RouteGuard>
                          } />
                        </Route>
                        <Route path="orders" element={<Orders />}>
                          <Route index element={
                            <RouteGuard module="orders" subpage="Order List">
                              <Suspense fallback={<SuspenseLoader />}>
                                <OrderList />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="details" element={
                            <RouteGuard module="orders" subpage="Order Details">
                              <Suspense fallback={<SuspenseLoader />}>
                                <OrderDetails />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="details/:id" element={
                            <RouteGuard module="orders" subpage="Order Details">
                              <Suspense fallback={<SuspenseLoader />}>
                                <OrderDetails />
                              </Suspense>
                            </RouteGuard>
                          } />
                        </Route>
                        <Route path="shipments" element={<Shipments />}>
                          <Route index element={<Navigate to="creation" replace />} />
                          <Route path="creation" element={
                            <RouteGuard module="shipments" subpage="Shipment Creation">
                              <Suspense fallback={<SuspenseLoader />}>
                                <ShipmentCreation />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="track" element={
                            <RouteGuard module="shipments" subpage="Track Shipments">
                              <Suspense fallback={<SuspenseLoader />}>
                                <TrackShipments />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="returns" element={
                            <RouteGuard module="shipments" subpage="Return Requests">
                              <Suspense fallback={<SuspenseLoader />}>
                                <ReturnRequests />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="refunds" element={
                            <RouteGuard module="shipments" subpage="Refund Processing">
                              <Suspense fallback={<SuspenseLoader />}>
                                <RefundProcessing />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="replacements" element={
                            <RouteGuard module="shipments" subpage="Replacement Orders">
                              <Suspense fallback={<SuspenseLoader />}>
                                <ReplacementOrders />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="cancellations" element={
                            <RouteGuard module="shipments" subpage="Cancellation Requests">
                              <Suspense fallback={<SuspenseLoader />}>
                                <CancellationRequests />
                              </Suspense>
                            </RouteGuard>
                          } />
                        </Route>
                        <Route path="tickets" element={<Tickets />}>
                          <Route index element={
                            <RouteGuard module="tickets" subpage="Ticket Dashboard">
                              <Suspense fallback={<SuspenseLoader />}>
                                <TicketDashboard />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="details" element={
                            <RouteGuard module="tickets" subpage="Ticket Details">
                              <Suspense fallback={<SuspenseLoader />}>
                                <TicketDetails />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="details/:id" element={
                            <RouteGuard module="tickets" subpage="Ticket Details">
                              <Suspense fallback={<SuspenseLoader />}>
                                <TicketDetails />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="escalation" element={
                            <RouteGuard module="tickets" subpage="Ticket Escalation">
                              <Suspense fallback={<SuspenseLoader />}>
                                <TicketEscalation />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="closure" element={
                            <RouteGuard module="tickets" subpage="Ticket Closure">
                              <Suspense fallback={<SuspenseLoader />}>
                                <TicketClosure />
                              </Suspense>
                            </RouteGuard>
                          } />
                        </Route>
                        <Route path="payments" element={<Payments />}>
                          <Route index element={<Navigate to="logs" replace />} />
                          <Route path="logs" element={
                            <RouteGuard module="payments" subpage="Payment Logs">
                              <Suspense fallback={<SuspenseLoader />}>
                                <PaymentLogs />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="invoices" element={
                            <RouteGuard module="payments" subpage="Invoice Management">
                              <Suspense fallback={<SuspenseLoader />}>
                                <InvoiceManagement />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="credit-notes" element={
                            <RouteGuard module="payments" subpage="Credit Notes">
                              <Suspense fallback={<SuspenseLoader />}>
                                <CreditNotes />
                              </Suspense>
                            </RouteGuard>
                          } />
                          <Route path="notifications" element={
                            <RouteGuard module="payments" subpage="Status Notifications">
                              <Suspense fallback={<SuspenseLoader />}>
                                <StatusNotifications />
                              </Suspense>
                            </RouteGuard>
                          } />
                        </Route>
                        <Route path="settings" element={
                          <RouteGuard module="settings" subpage="General Settings">
                            <Settings />
                          </RouteGuard>
                        } />
                        <Route path="help" element={<HelpCenter />} />
                      </Route>
                      <Route path="*" element={<Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />} />
                    </Routes>
                  </BrowserRouter>
                </PaymentsProvider>
              </TicketsProvider>
            </ShipmentsProvider>
          </OrdersProvider>
        </ProductsProvider>
      </UsersProvider>
    </RoleAccessProvider>
  );
}

export default App;
