import { Outlet } from 'react-router-dom';

export default function Payments() {
  return (
    <div className="w-full animate-fade-in">
      <Outlet />
    </div>
  );
}
