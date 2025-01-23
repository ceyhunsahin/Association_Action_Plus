import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, Container, Card, Form as BootstrapForm, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './RegisterForm.module.css';

const RegisterForm = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const initialValues = {
        firstName: '',
        lastName: '',
        email: '',
        password: '',
    };

    const validationSchema = Yup.object({
        firstName: Yup.string().required('Requis'),
        lastName: Yup.string().required('Requis'),
        email: Yup.string().email('Email invalide').required('Requis'),
        password: Yup.string().min(6, 'Au moins 6 caractères').required('Requis'),
    });

    const onSubmit = async (values) => {
        try {
            const response = await fetch('http://localhost:8000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: values.firstName,
                    lastName: values.lastName,
                    username: `${values.firstName} ${values.lastName}`,
                    email: values.email,
                    password: values.password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Kayıt başarısız');
            }

            const data = await response.json();
            console.log('Backend response:', data); // Response'u konsola yazdır

            // Kullanıcıyı oturum açık olarak işaretle ve token'ları kaydet
            login(data);

            // Başarılı kayıt mesajını göster
            setSuccessMessage(data.message);
            setErrorMessage('');

            // 2 saniye sonra profil sayfasına yönlendir
            setTimeout(() => {
                navigate('/profile');
            }, 2000);
        } catch (error) {
            console.error('Kayıt hatası:', error);
            setErrorMessage(error.message);
            setSuccessMessage('');
        }
    };

    return (
        <Container className={`mt-5 ${styles.container}`}>
            <Card className={styles.card}>
                <Card.Body>
                    <h2 className={`text-center ${styles.title}`}>S'inscrire</h2>
                    {successMessage && (
                        <Alert variant="success" className={styles.alert}>
                            {successMessage}
                        </Alert>
                    )}
                    {errorMessage && (
                        <Alert variant="danger" className={styles.alert}>
                            {errorMessage}
                        </Alert>
                    )}
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <BootstrapForm.Group className={styles.formGroup}>
                                    <BootstrapForm.Label className={styles.label}>Prénom</BootstrapForm.Label>
                                    <Field
                                        as={BootstrapForm.Control}
                                        type="text"
                                        name="firstName"
                                        className={styles.input}
                                    />
                                    <ErrorMessage name="firstName" component="div" className={styles.error} />
                                </BootstrapForm.Group>
                                <BootstrapForm.Group className={styles.formGroup}>
                                    <BootstrapForm.Label className={styles.label}>Nom</BootstrapForm.Label>
                                    <Field
                                        as={BootstrapForm.Control}
                                        type="text"
                                        name="lastName"
                                        className={styles.input}
                                    />
                                    <ErrorMessage name="lastName" component="div" className={styles.error} />
                                </BootstrapForm.Group>
                                <BootstrapForm.Group className={styles.formGroup}>
                                    <BootstrapForm.Label className={styles.label}>Email</BootstrapForm.Label>
                                    <Field
                                        as={BootstrapForm.Control}
                                        type="email"
                                        name="email"
                                        className={styles.input}
                                    />
                                    <ErrorMessage name="email" component="div" className={styles.error} />
                                </BootstrapForm.Group>
                                <BootstrapForm.Group className={styles.formGroup}>
                                    <BootstrapForm.Label className={styles.label}>Mot de passe</BootstrapForm.Label>
                                    <Field
                                        as={BootstrapForm.Control}
                                        type="password"
                                        name="password"
                                        className={styles.input}
                                    />
                                    <ErrorMessage name="password" component="div" className={styles.error} />
                                </BootstrapForm.Group>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-100 mt-3 ${styles.button}`}
                                >
                                    S'inscrire
                                </Button>
                            </Form>
                        )}
                    </Formik>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default RegisterForm;