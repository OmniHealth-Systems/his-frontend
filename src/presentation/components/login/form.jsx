import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import '@/presentation/styles/login/form.css';
import { useNavigate } from 'react-router-dom';

export default function Form() {
    const { loginWithRedirect, isAuthenticated, logout, user } = useAuth0();
    const navigate = useNavigate();

    return (
        <div className='form'>
            <h1>Acceso OmniHIS Cloud</h1>
            <p style={{ color: '#64748b', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                Autenticación centralizada y segura con Auth0 Identity Platform
            </p>

            {isAuthenticated ? (
                <div style={{ textAlign: 'center', width: '100%' }}>
                    <p style={{ fontWeight: 'bold', color: '#0f172a' }}>Sesión activa: {user?.email}</p>
                    <button 
                        type="button" 
                        onClick={() => navigate('/home')} 
                        style={{ marginTop: '1rem', width: '100%', background: '#0284c7', color: 'white', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                    >
                        Ir al Panel de Control
                    </button>
                    <button 
                        type="button" 
                        onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })} 
                        style={{ marginTop: '0.5rem', width: '100%', background: '#e2e8f0', color: '#334155', padding: '0.75rem', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                    >
                        Cerrar Sesión
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    <button 
                        type="button" 
                        onClick={() => loginWithRedirect()}
                        style={{ width: '100%', background: '#0284c7', color: 'white', padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        🔐 Iniciar Sesión con Auth0
                    </button>
                </div>
            )}
        </div>
    );
}