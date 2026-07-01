import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export function Input({
  label,
  error,
  icon,
  className = '',
  id,
  ...props
}: InputProps) {
  return (
    <div className="form-group">
      {label && (
        <label htmlFor={id} className="text-label-bold" style={{ fontSize: '11px' }}>
          {label}
        </label>
      )}
      <div 
        className="luminous-input flex items-center" 
        style={error ? { borderColor: '#f43f5e', boxShadow: '0 0 15px rgba(244, 63, 94, 0.2)' } : undefined}
      >
        {icon && (
          <div style={{ paddingLeft: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#908fa0' }}>
            {icon}
          </div>
        )}
        <input
          id={id}
          className={className}
          style={{ width: '100%' }}
          {...props}
        />
      </div>
      {error && <p style={{ fontSize: '10px', color: '#f43f5e', fontWeight: 600, marginTop: '2px' }}>{error}</p>}
    </div>
  );
}
