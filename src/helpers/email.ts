import sgMail from '@sendgrid/mail'
import dotenv from 'dotenv'

dotenv.config()

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
const emailFrom = process.env.EMAIL_FROM!

interface EmailRegisterParams {
  email?: string
  name?: string
  lastname?: string
  razonSocial?: string
  token?: string
}

interface EmailForgotPasswordParams {
  email?: string
  name?: string
  token?: string
}

interface EmailConfirmAccountParams {
  email?: string
  name?: string
  token?: string
}

export const emailRegister = async ({ email, name, lastname, razonSocial, token }: EmailRegisterParams): Promise<void> => {
  const msg = {
    to: email,
    from: emailFrom,
    subject: 'Rindo - Crea tu cuenta',
    html: `
    <html>
        <head>
          <style>
            .header {
              background-color: #693599;
              color: white;
              padding: 20px;
              text-align: center;
              font-family: Arial, sans-serif;
            }
            .content {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
              background-color: white;
              max-width: 600px;
              margin: 20px auto;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .button {
              background-color: #F4AD00;
              color: white;
              padding: 15px 25px;
              font-size: 18px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              font-family: Arial, sans-serif;
              color: #555;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body style="background-color: #693599; padding: 20px;">
          <!-- Header -->
          <div class="header">
            <img src="https://img-email-rindo.s3.amazonaws.com/Logo-Rindo-2.png" alt="Rindo Logo" style="width: 120px; margin-bottom: 20px;">
            <h1>¡Hola, ${name} ${lastname}!</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <p>Por favor, crea tu cuenta haciendo clic en el botón de abajo:</p>

            <!-- Button -->
            <a href="${process.env.FRONTEND_URL}/register/${token}" target="_blank" class="button">
              Crear Cuenta
            </a>

            <!-- Additional message -->
            <p class="footer">Empresa: ${razonSocial}</p>
            <p class="footer">Si tú no solicitaste este correo, puedes ignorar este mensaje.</p>

            <!-- Signature -->
            <p class="footer">Atentamente,<br> El equipo de Rindo</p>
          </div>
        </body>
      </html>`
  }

  await sgMail.send(msg)
}

export const emailForgotPassword = async ({ email, name, token }: EmailForgotPasswordParams): Promise<void> => {
  const msg = {
    to: email,
    from: emailFrom,
    subject: 'Rindo - Reestablece tu Contraseña',
    html: `
    <html>
        <head>
          <style>
            .header {
              background-color: #693599;
              color: white;
              padding: 20px;
              text-align: center;
              font-family: Arial, sans-serif;
            }
            .content {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
              background-color: white;
              max-width: 600px;
              margin: 20px auto;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .button {
              background-color: #F4AD00;
              color: white;
              padding: 15px 25px;
              font-size: 18px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              font-family: Arial, sans-serif;
              color: #555;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body style="background-color: #693599; padding: 20px;">
          <!-- Header -->
          <div class="header">
            <img src="https://img-email-rindo.s3.amazonaws.com/Logo-Rindo-2.png" alt="Rindo Logo" style="width: 120px; margin-bottom: 20px;">
            <h1>¡Hola, ${name}!</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <p>Has solicitado restablecer tu contraseña. Por favor, haz clic en el botón de abajo:</p>

            <!-- Button -->
            <a href="${process.env.FRONTEND_URL}/forgot-password/${token}" target="_blank" class="button">
              Restablecer tu contraseña
            </a>

            <!-- Additional message -->
            <p class="footer">Si tú no solicitaste este correo, puedes ignorar este mensaje.</p>

            <!-- Signature -->
            <p class="footer">Atentamente,<br> El equipo de Rindo</p>
          </div>
        </body>
      </html>`
  }

  await sgMail.send(msg)
}

export const emailConfirmAccount = async ({ email, name, token }: EmailConfirmAccountParams): Promise<void> => {
  const msg = {
    to: email,
    from: emailFrom,
    subject: 'Rindo - Confirma tu cuenta',
    html: `
       <html>
        <head>
          <style>
            .header {
              background-color: #693599;
              color: white;
              padding: 20px;
              text-align: center;
              font-family: Arial, sans-serif;
            }
            .content {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
              background-color: white;
              max-width: 600px;
              margin: 20px auto;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            .button {
              background-color: #F4AD00;
              color: white;
              padding: 15px 25px;
              font-size: 18px;
              text-align: center;
              text-decoration: none;
              display: inline-block;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              font-family: Arial, sans-serif;
              color: #555;
              font-size: 14px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body style="background-color: #693599; padding: 20px;">
          <!-- Header -->
          <div class="header">
            <img src="https://img-email-rindo.s3.amazonaws.com/Logo-Rindo-2.png" alt="Rindo Logo" style="width: 120px; margin-bottom: 20px;">
            <h1>¡Hola, ${name}!</h1>
          </div>

          <!-- Content -->
          <div class="content">
            <p>Por favor, ve a confirmar tu cuenta haciendo clic en el botón de abajo:</p>
            
            <!-- Button -->
            <a href="${process.env.FRONTEND_URL}/confirm-account/${token}" target="_blank" class="button">
              Ir a confirmar
            </a>

            <!-- Additional message -->
            <p class="footer">Si tú no solicitaste este correo, puedes ignorar este mensaje.</p>

            <!-- Signature -->
            <p class="footer">Atentamente,<br> El equipo de Rindo</p>
          </div>
        </body>
      </html>`
  }

  await sgMail.send(msg)
}
