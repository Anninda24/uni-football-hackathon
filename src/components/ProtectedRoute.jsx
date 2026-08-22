import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSystemPhase } from '../context/SystemPhaseContext';

export function ProtectedRoute({
  allowedRoles,
  allowedPhases,
  currentRoute,
  onUnauthorizedRedirect,
  children
}) {
  const { currentUser } = useAuth();
  const { currentPhaseId } = useSystemPhase();

  // Role authorization check
  const isRoleAllowed = !allowedRoles || allowedRoles.includes(currentUser.role);

  // Phase authorization check
  const isPhaseAllowed = !allowedPhases || allowedPhases.includes(currentPhaseId);

  if (!isRoleAllowed || !isPhaseAllowed) {
    return (
      <div style={{
        padding: '48px 24px',
        textAlign: 'center',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '16px',
        maxWidth: '600px',
        margin: '60px auto'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛡️ Access Restricted</div>
        <h3 style={{ fontSize: '1.25rem', color: '#f87171', marginBottom: '8px' }}>
          Unauthorized Route Access
        </h3>
        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '24px', lineHeight: 1.5 }}>
          {!isRoleAllowed
            ? `Your active role (${currentUser.role.replace('_', ' ')}) does not have permission to view this workspace route.`
            : `This module is locked during the active system phase (${currentPhaseId}).`}
        </p>

        <button
          onClick={() => onUnauthorizedRedirect && onUnauthorizedRedirect('PUBLIC_HOME')}
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '0.88rem',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          Return to Public Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
