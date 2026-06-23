import { Outlet } from 'react-router-dom';

export default function Shipments() {
  return (
    <div className="w-full animate-fade-in">
      <Outlet />
    </div>
  );
}
