import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

export const PasswordResetEmail = ({ userName, userEmail, newPassword }) => (
    <Html>
        <Head />
        <Preview>KalonConnect - Sua senha foi redefinida</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>🔐 Senha Redefinida</Heading>

                <Text style={text}>
                    Olá <strong>{userName}</strong>,
                </Text>

                <Text style={text}>
                    Sua senha foi redefinida com sucesso. Abaixo está sua nova senha de acesso:
                </Text>

                <Section style={credentialsBox}>
                    <Text style={credentialLabel}>📧 Email:</Text>
                    <Text style={credentialValue}>{userEmail}</Text>

                    <Text style={credentialLabel}>🔑 Nova Senha:</Text>
                    <Text style={credentialValue}>{newPassword}</Text>
                </Section>

                <Section style={buttonContainer}>
                    <Button style={button} href="http://localhost:3001/login">
                        Fazer Login
                    </Button>
                </Section>

                <Section style={warningBox}>
                    <Text style={warningText}>
                        🔒 <strong>Segurança:</strong> Recomendamos que você altere esta senha após fazer login.
                    </Text>
                </Section>

                <Section style={infoBox}>
                    <Text style={infoText}>
                        Se você não solicitou esta alteração, entre em contato com o administrador imediatamente.
                    </Text>
                </Section>

                <Text style={footer}>
                    © {new Date().getFullYear()} KalonConnect. Todos os direitos reservados.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default PasswordResetEmail;

// Styles
const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '20px 0 48px',
    marginBottom: '64px',
    maxWidth: '600px',
};

const h1 = {
    color: '#333',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '40px 0',
    padding: '0 40px',
    textAlign: 'center',
};

const text = {
    color: '#333',
    fontSize: '16px',
    lineHeight: '26px',
    padding: '0 40px',
};

const credentialsBox = {
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
    margin: '32px 40px',
    padding: '24px',
    border: '2px solid #e9ecef',
};

const credentialLabel = {
    color: '#666',
    fontSize: '14px',
    fontWeight: '600',
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
};

const credentialValue = {
    color: '#000',
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 20px 0',
    fontFamily: 'monospace',
    backgroundColor: '#fff',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #dee2e6',
};

const buttonContainer = {
    padding: '0 40px',
    textAlign: 'center',
};

const button = {
    backgroundColor: '#4F46E5',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center',
    display: 'block',
    width: '100%',
    padding: '16px',
};

const warningBox = {
    backgroundColor: '#fff3cd',
    borderRadius: '8px',
    margin: '32px 40px',
    padding: '16px',
    border: '1px solid #ffc107',
};

const warningText = {
    color: '#856404',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
};

const infoBox = {
    backgroundColor: '#e7f3ff',
    borderRadius: '8px',
    margin: '16px 40px',
    padding: '16px',
    border: '1px solid #0dcaf0',
};

const infoText = {
    color: '#055160',
    fontSize: '14px',
    lineHeight: '20px',
    margin: '0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    padding: '0 40px',
    marginTop: '16px',
    textAlign: 'center',
};
