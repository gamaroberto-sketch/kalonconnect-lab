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

export const PasswordResetLinkEmail = ({ userName, resetLink }) => (
    <Html>
        <Head />
        <Preview>Redefinição de Senha - KalonConnect</Preview>
        <Body style={main}>
            <Container style={container}>
                <Heading style={h1}>🔐 Redefinição de Senha</Heading>

                <Text style={text}>
                    Olá <strong>{userName}</strong>,
                </Text>

                <Text style={text}>
                    Recebemos uma solicitação para redefinir a senha da sua conta no KalonConnect.
                </Text>

                <Text style={text}>
                    Se você fez essa solicitação, clique no botão abaixo para criar uma nova senha:
                </Text>

                <Section style={buttonContainer}>
                    <Button style={button} href={resetLink}>
                        Redefinir Minha Senha
                    </Button>
                </Section>

                <Text style={text}>
                    Se o botão não funcionar, copie e cole o link abaixo no seu navegador:
                </Text>

                <Section style={linkBox}>
                    <Text style={linkText}>{resetLink}</Text>
                </Section>

                <Section style={infoBox}>
                    <Text style={infoText}>
                        ⚠️ <strong>Atenção:</strong> Se você não solicitou a redefinição de senha, ignore este email. Sua senha atual permanecerá a mesma.
                    </Text>
                </Section>

                <Text style={footer}>
                    © {new Date().getFullYear()} KalonConnect. Todos os direitos reservados.
                </Text>
            </Container>
        </Body>
    </Html>
);

export default PasswordResetLinkEmail;

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

const buttonContainer = {
    padding: '0 40px',
    textAlign: 'center',
    marginTop: '32px',
    marginBottom: '32px',
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

const linkBox = {
    padding: '0 40px',
    marginBottom: '32px',
};

const linkText = {
    color: '#4F46E5',
    fontSize: '14px',
    wordBreak: 'break-all',
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
