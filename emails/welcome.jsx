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

export const WelcomeEmail = ({ userName, userEmail, password }) => (
    <Html>
        <Head />
        <Preview>Bem-vindo ao KalonConnect - Suas credenciais de acesso</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>🎉 Bem-vindo ao KalonConnect!</Heading>

                <Text style={text}>
                    Olá <strong>{userName}</strong>,
                </Text>

                <Text style={text}>
                    Sua conta foi criada com sucesso! Abaixo estão suas credenciais de acesso ao sistema:
                </Text>

                <Section style={credentialsBox}>
                    <Text style={credentialLabel}>📧 Email:</Text>
                    <Text style={credentialValue}>{userEmail}</Text>

                    <Text style={credentialLabel}>🔑 Senha:</Text>
                    <Text style={credentialValue}>{password}</Text>
                </Section>

                <Section style={buttonContainer}>
                    <Button style={button} href="http://localhost:3001/login">
                        Acessar KalonConnect
                    </Button>
                </Section>

                <Section style={infoBox}>
                    <Text style={infoText}>
                        ⚠️ <strong>Importante:</strong> Por segurança, recomendamos que você altere sua senha no primeiro acesso.
                    </Text>
                </Section>

                <Text style={footer}>
                    Se você não solicitou esta conta, por favor ignore este email ou entre em contato com o suporte.
                </Text>

                <Text style={footer}>
                    © {new Date().getFullYear()} KalonConnect. Todos os direitos reservados.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default WelcomeEmail;

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

const infoBox = {
    backgroundColor: '#fff3cd',
    borderRadius: '8px',
    margin: '32px 40px',
    padding: '16px',
    border: '1px solid #ffc107',
};

const infoText = {
    color: '#856404',
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
