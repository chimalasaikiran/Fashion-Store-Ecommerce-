import { Outlet } from 'react-router-dom';

export default function Tickets() {
  return (
    <div className="w-full animate-fade-in">
      <Outlet />
    </div>
  );
}
