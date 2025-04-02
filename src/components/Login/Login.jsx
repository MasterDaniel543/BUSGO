import React, { useState } from 'react';
import api from '../../services/api';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Login as LoginIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import '../../css/Login/Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // This should prevent the form from submitting normally
    setError(''); // Limpiar errores previos
    
    // Validación básica
    if (!credentials.email) {
      setError('Por favor ingrese su correo electrónico');
      return;
    }
    
    if (!credentials.password) {
      setError('Por favor ingrese su contraseña');
      return;
    }
    
    setLoading(true);
    
    try {
      // Add a small delay to ensure state updates properly
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response = await api.post('/login', credentials);
      const data = response.data;
  
      if (!data.token || !data.usuario) {
        setError('Respuesta del servidor inválida');
        setLoading(false);
        return;
      }
  
      // Store in secure cookies
      Cookies.set('token', data.token, {
        secure: true,
        sameSite: 'strict',
        expires: 1
      });
  
      Cookies.set('userInfo', JSON.stringify({
        id: data.usuario._id,
        nombre: data.usuario.nombre,
        rol: data.usuario.rol
      }), {
        secure: true,
        sameSite: 'strict',
        expires: 1
      });
  
      // Redirect based on role
      const userRole = data.usuario.rol;
      navigate(`/${userRole}`);
  
    } catch (error) {
      console.error('Error completo:', error);
      
      // Manejo de errores más específico y detallado
      if (error.response) {
        const statusCode = error.response.status;
        const errorMessage = error.response.data?.error;
        console.log('Status:', statusCode, 'Message:', errorMessage);
        
        if (statusCode === 401) {
          if (errorMessage?.toLowerCase().includes('contraseña')) {
            setError('Contraseña incorrecta');
          } else if (errorMessage?.toLowerCase().includes('correo') || 
                    errorMessage?.toLowerCase().includes('email') || 
                    errorMessage?.toLowerCase().includes('no encontrado')) {
            setError('Correo electrónico no registrado');
          } else {
            setError('Credenciales inválidas');
          }
        } else if (statusCode === 429) {
          setError('Demasiados intentos fallidos. Intente más tarde.');
        } else {
          setError(errorMessage || 'Error en el servidor');
        }
      } else if (error.request) {
        // La solicitud se hizo pero no se recibió respuesta
        setError('No se recibió respuesta del servidor. Verifique su conexión.');
      } else {
        // Error al configurar la solicitud
        setError('Error de conexión. Verifique su internet.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs" className="login-container">
      <Paper elevation={3} className="login-paper">
        <Box className="login-box">
          <LoginIcon className="login-icon" />
          <Typography component="h1" variant="h5">
            Iniciar Sesión
          </Typography>
          
          {error && (
          <Alert 
            severity="error" 
            className="login-alert" 
            sx={{ 
              mt: 2, 
              mb: 2,
              width: '100%',
              '& .MuiAlert-message': {
                width: '100%',
                fontWeight: 'bold'
              }
            }}
          >
            {error}
          </Alert>
        )}

          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            className="login-form"
            noValidate // Add this to prevent HTML5 validation which might cause reloads
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo Electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              error={!!error && (error.toLowerCase().includes('correo') || error.toLowerCase().includes('email'))}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              error={!!error && error.toLowerCase().includes('contraseña')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="login-button"
              disabled={loading}
              sx={{ mt: 3, mb: 2 }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
            
            {/* Opción para recuperar contraseña */}
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                variant="text"
                color="primary"
                size="small"
                onClick={() => navigate('/recuperar-password')}
                sx={{ 
                  fontSize: '0.875rem',
                  textTransform: 'none'
                }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
