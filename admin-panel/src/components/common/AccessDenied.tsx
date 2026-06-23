import { useNavigate } from 'react-router-dom';
import { useRoleAccess } from '../../context/RoleAccessContext';

interface AccessDeniedProps {
  moduleName?: string;
  subpageName?: string;
}

export default function AccessDenied({ moduleName, subpageName }: AccessDeniedProps) {
  const navigate = useNavigate();
  const { activeRole } = useRoleAccess();

  return (
    <div className="w-full flex items-center justify-center min-h-[480px] p-6 animate-fade-in">
      <div className="bg-white border border-[#E0E0E0] rounded-2xl p-8 sm:p-12 max-w-lg text-center shadow-xl space-y-6 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#BA1A1A]/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#F8B057]/5 rounded-full blur-xl pointer-events-none"></div>

        {/* Lock Icon */}
        <div className="w-20 h-20 bg-[#BA1A1A]/10 border border-[#BA1A1A]/20 rounded-2xl flex items-center justify-center text-[#BA1A1A] mx-auto animate-pulse">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-[#242424] tracking-tight">Access Denied</h3>
          <p className="text-sm text-[#797979] leading-relaxed">
            Your current simulated role <span className="font-bold text-[#401900] bg-[#F8B057]/10 px-2 py-0.5 rounded border border-[#F8B057]/20">"{activeRole}"</span> does not have the necessary credentials or view permissions to access this module.
          </p>
        </div>

        {/* Permission Details */}
        {(moduleName || subpageName) && (
          <div className="bg-[#F6F6F6] border border-[#E0E0E0] rounded-xl p-4 text-left space-y-2">
            <span className="text-[10px] font-bold text-[#797979] tracking-wider uppercase block">REQUIRED SCOPE</span>
            <div className="flex flex-col gap-1 text-xs">
              {moduleName && (
                <div>
                  <span className="font-semibold text-[#797979]">Module:</span>{' '}
                  <span className="font-bold text-[#242424]">{moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}</span>
                </div>
              )}
              {subpageName && (
                <div>
                  <span className="font-semibold text-[#797979]">Permission:</span>{' '}
                  <span className="font-bold text-[#BA1A1A]">{subpageName} (View)</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="text-xs text-[#797979] pt-2 border-t border-[#E0E0E0]/60">
          Tip: You can use the active role selector in the top bar to switch to <span className="font-semibold text-[#242424]">Super Admin</span> or a role with access to this section.
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#401900] hover:bg-[#2D1100] text-white font-bold text-sm tracking-wider rounded-lg shadow-sm transition-all cursor-pointer"
          >
            Go to Dashboard
          </button>
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-[#F6F6F6] text-[#242424] border border-[#E0E0E0] font-bold text-sm tracking-wider rounded-lg transition-all cursor-pointer"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
