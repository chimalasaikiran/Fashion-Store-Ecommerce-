import { Outlet } from 'react-router-dom';

export default function Orders() {
  return (
    <div className="w-full animate-fade-in">
      <Outlet />
    </div>
  );
}
