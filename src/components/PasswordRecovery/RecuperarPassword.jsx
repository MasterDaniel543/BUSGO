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
  Link
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import '../../css/Login/Login.css';

const RecuperarPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('username'); // 'username', 'email', 'verification'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const verifyUsername = async () => {
    if (!formData.username) {
      setError('Por favor ingrese su nombre de usuario');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.post('/api/verificar-usuario', { username: formData.username });
      
      if (response.data.exists) {
        setStep('email');
        setError('');
      } else {
        setError('Usuario no encontrado. Verifique e intente nuevamente.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudo verificar el usuario. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async () => {
    if (!formData.email) {
      setError('Por favor ingrese su correo electrónico');
      return;
    }
    
    setLoading(true);
    
    try {
      // Ya no verificamos si el correo coincide con el de la BD
      // Enviamos directamente el código de recuperación
      await api.post('/api/recuperar-password', { 
        username: formData.username,
        recoveryEmail: formData.email // Usamos recoveryEmail para indicar que es el correo para recuperación
      });
      
      // En lugar de mostrar solo un mensaje de éxito, cambiamos al paso de verificación
      setStep('verification');
      setSuccess('Se ha enviado un código de verificación a su correo electrónico');
      setError('');
    } catch (error) {
      console.error('Error:', error);
      setError('No se pudo enviar el correo de recuperación. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    // Validate code
    if (!formData.code) {
      setError('Por favor ingrese el código de verificación');
      return;
    }
    
    // Validate new password
    if (!formData.newPassword) {
      setError('Por favor ingrese la nueva contraseña');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    // Validate password confirmation
    if (!formData.confirmPassword) {
      setError('Por favor confirme su nueva contraseña');
      return;
    }
    
    // Check if passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden. Por favor verifique e intente nuevamente.');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.post('/api/verificar-codigo-recuperacion', {
        username: formData.username,
        code: formData.code,
        newPassword: formData.newPassword
      });
      
      setSuccess('¡Contraseña actualizada correctamente! Redirigiendo al inicio de sesión...');
      setError('');
      
      // Redirigir al inicio de sesión después de 3 segundos
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error) {
      console.error('Error:', error);
      
      // Handle specific error messages
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else if (error.customMessage) {
        setError(error.customMessage);
      } else {
        setError('No se pudo actualizar la contraseña. Verifique el código e intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (step === 'username') {
      verifyUsername();
    } else if (step === 'email') {
      verifyEmail();
    } else if (step === 'verification') {
      resetPassword();
    }
  };

  return (
    <Container component="main" maxWidth="xs" className="login-container">
      <Paper elevation={3} className="login-paper">
        <Box className="login-box">
          <IconButton 
            onClick={() => navigate('/')}
            sx={{ position: 'absolute', top: 16, left: 16 }}
            aria-label="Volver"
          >
            <ArrowBack />
          </IconButton>
          
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Recuperar Contraseña
          </Typography>
          
          {error && (
            <Alert 
              severity="error" 
              className="login-alert" 
              sx={{ mt: 2, mb: 2, width: '100%' }}
            >
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert 
              severity="success" 
              className="login-alert" 
              sx={{ mt: 2, mb: 2, width: '100%' }}
            >
              {success}
            </Alert>
          )}

          {(!success || step === 'verification') && (
            <Box 
              component="form" 
              onSubmit={handleSubmit} 
              className="login-form"
              noValidate
            >
              {step === 'username' && (
                <>
                  <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                    Ingrese su nombre de usuario para comenzar el proceso de recuperación.
                  </Typography>
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Nombre de Usuario"
                    name="username"
                    autoComplete="username"
                    autoFocus
                    value={formData.username}
                    onChange={handleChange}
                    error={!!error && error.toLowerCase().includes('usuario')}
                    placeholder="Su nombre de usuario"
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    className="login-button"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {loading ? 'Verificando...' : 'Continuar'}
                  </Button>
                </>
              )}
              
              {step === 'email' && (
                <>
                  <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                    Usuario "{formData.username}" verificado. Ingrese su correo electrónico para recibir instrucciones.
                  </Typography>
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Correo Electrónico"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={formData.email}
                    onChange={handleChange}
                    error={!!error && error.toLowerCase().includes('correo')}
                    placeholder="ejemplo@correo.com"
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    className="login-button"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                  </Button>
                </>
              )}
              
              {step === 'verification' && (
                <>
                  <Typography variant="body2" sx={{ mb: 2, textAlign: 'center' }}>
                    Ingrese el código de verificación enviado a su correo electrónico y establezca una nueva contraseña.
                  </Typography>
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="code"
                    label="Código de Verificación"
                    name="code"
                    autoFocus
                    value={formData.code}
                    onChange={handleChange}
                    error={!!error && error.toLowerCase().includes('código')}
                    placeholder="Ingrese el código de 6 dígitos"
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="newPassword"
                    label="Nueva Contraseña"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    error={!!error && error.toLowerCase().includes('contraseña')}
                    placeholder="Mínimo 6 caracteres"
                  />
                  
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="confirmPassword"
                    label="Confirmar Contraseña"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={!!error && error.toLowerCase().includes('coinciden')}
                    placeholder="Repita la nueva contraseña"
                  />
                  
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    className="login-button"
                    disabled={loading}
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                  </Button>
                </>
              )}
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="text"
                  color="primary"
                  size="small"
                  onClick={() => navigate('/')}
                  sx={{ 
                    fontSize: '0.875rem',
                    textTransform: 'none'
                  }}
                >
                  Volver al inicio de sesión
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default RecuperarPassword;