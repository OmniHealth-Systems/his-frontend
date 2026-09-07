import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import LOGO from '@/assets/image/logo.webp';
import '@/presentation/styles/common/header.css';
import { Link } from 'react-router-dom';

export default function Header() {
  const { isAuthenticated, user, loginWithRedirect, logout } = useAuth0();
  const [roles, setRoles] = useState({ isSuperAdmin: false, isUser: false });

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRoles = user['https://omnihis.clinic/roles'] || user.roles || [];
      const isSuperAdmin = Array.isArray(userRoles) ? userRoles.includes('superadmin') : userRoles === 'superadmin';
      const isUser = Array.isArray(userRoles) ? userRoles.includes('user') : true;
      setRoles({ isSuperAdmin, isUser });
    }
  }, [isAuthenticated, user]);

  // Lista de enlaces que se mostrarán según el rol
  const List = [
    {
      id: 1,
      name: 'Medicos',
      link: '/medicos',
      dropdown: [
        { id: 1, name: 'Especialidades', link: '/especialidades' }
      ]
    },
    {
      id: 2,
      name: 'Pacientes',
      link: '/pacientes',
      dropdown: [
        { id: 1, name: 'Añadir pacientes', link: '/anadirpacientes' },
        { id: 2, name: 'Seguro Medico', link: '/seguromedico' }
      ]
    },
    {
      id: 3,
      name: 'Turno',
      link: '/turno',
    },
    {
      id: 4,
      name: 'Citas',
      link: '/citas',
    },
    {
      id: 8,
      name: 'Consultas',
      link: '/consultas',
    },
    {
      id: 9,
      name: 'Laboratorio',
      link: '/laboratorio',
    },
    {
      id: 10,
      name: 'Farmacia',
      link: '/farmacia',
    },
    {
      id: 5,
      name: 'Facturación',
      link: '/facturacion',
    },
    // Ruta de clínica solo visible para el superadmin
    roles.isSuperAdmin && {
      id: 6,
      name: 'Clínica',
      link: '/clinica',
    },
    {
      id: 7,
      name: 'Informes',
      link: '/informes',
    }
  ].filter(Boolean);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <div className="header">
      <div className="header__navbar">
        <div className="header__logo">
          <img src={LOGO} alt="logo__header" />
        </div>
        <div className="header__navbar--list">
          <nav>
            <ul>
              {List.map((item) => (
                <li key={item.id} className="header__navbar--container">
                  <Link to={item.link} className="header__navbar--style">
                    {item.name}
                  </Link>
                  {item.dropdown && (
                    <ul className="header__navbar--menu">
                      {item.dropdown.map((subItem) => (
                        <li key={subItem.id}>
                          <Link to={subItem.link}>{subItem.name}</Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="header__button">
        {isAuthenticated ? (
          <button onClick={handleLogout}>Cerrar sesión</button>
        ) : (
          <button onClick={() => loginWithRedirect()}>Iniciar sesión</button>
        )}
      </div>
    </div>
  );
}
