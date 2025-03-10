// Google ile giriş işlemi
const handleGoogleLogin = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const result = await loginWithGoogle();
    console.log('Google login successful:', result);
    
    // Başarılı giriş sonrası yönlendirme
    const from = location.state?.from || '/';
    navigate(from);
  } catch (error) {
    console.error('Google login error:', error);
    setError(error.message || 'Une erreur est survenue lors de la connexion avec Google');
  } finally {
    setLoading(false);
  }
}; 