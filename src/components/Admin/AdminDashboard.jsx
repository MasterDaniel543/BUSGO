import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Paper, Button, Badge } from '@mui/material';
import { PeopleAlt, DirectionsBus, Warning, Logout, Schedule } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import api from '../../services/api';
import '..//../css/Admin/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('Administrador');
  const [pendingIncidents, setPendingIncidents] = useState(0);

  useEffect(() => {
    const userInfo = Cookies.get('userInfo');
    if (userInfo) {
      const parsedInfo = JSON.parse(userInfo);
      setAdminName(parsedInfo.nombre || 'Administrador');
    }
    checkPendingIncidents();
  }, []);

  const checkPendingIncidents = async () => {
    try {
      const response = await api.get('/admin/incidencias');
      const pendingCount = response.data.filter(inc => inc.estado === 'pendiente').length;
      setPendingIncidents(pendingCount);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  const handleLogout = () => {
    // Remove cookies with path
    Cookies.remove('token', { path: '/' });
    Cookies.remove('userInfo', { path: '/' });
    
    // Force clear any remaining cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Force page refresh and navigation
    window.location.href = '/';
  };

  return (
    <Container className="admin-dashboard">
      <Button 
        variant="contained" 
        color="error" 
        onClick={handleLogout}
        startIcon={<Logout />}
        className="logout-button"
      >
        Cerrar Sesión
      </Button>  
      <Typography variant="h3" gutterBottom className="welcome-title">
        Bienvenid@ {adminName}
      </Typography>
      <Typography variant="h5" gutterBottom className="dashboard-subtitle">
        Seleccione una opción para gestionar
      </Typography>

      <Grid container spacing={4} className="dashboard-options">
        <Grid item xs={12} md={4}>
          <Paper 
            className="dashboard-option" 
            onClick={() => navigate('/admin/usuarios')}
          >
            <PeopleAlt className="dashboard-icon" />
            <Typography variant="h4">Gestión de Usuarios</Typography>
            <Typography variant="body1">
              Administre usuarios, conductores y pasajeros
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            className="dashboard-option" 
            onClick={() => navigate('/admin/camiones')}
          >
            <DirectionsBus className="dashboard-icon" />
            <Typography variant="h4">Gestión de Camiones</Typography>
            <Typography variant="body1">
              Registre y administre la flota de camiones
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            className="dashboard-option" 
            onClick={() => navigate('/admin/asignaciones')}
          >
            <Schedule className="dashboard-icon" />
            <Typography variant="h4">Asignación de Conductores</Typography>
            <Typography variant="body1">
              Asigne conductores, horarios y rutas a los camiones
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper 
            className="dashboard-option" 
            onClick={() => navigate('/admin/incidencias')}
          >
            <Badge 
              badgeContent={pendingIncidents} 
              color="error"
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  fontSize: '1rem',
                  height: '2rem',
                  minWidth: '2rem',
                  right: -15,
                  top: 5
                }
              }}
            >
              <Warning className="dashboard-icon" />
            </Badge>
            <Typography variant="h4">Incidencias</Typography>
            <Typography variant="body1">
              Gestione las incidencias reportadas
              {pendingIncidents > 0 && (
                <Typography 
                  color="error" 
                  component="span" 
                  sx={{ display: 'block', mt: 1 }}
                >
                  ({pendingIncidents} pendiente{pendingIncidents !== 1 ? 's' : ''})
                </Typography>
              )}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;