/**
 * EMAIL SERVICE - Servicio de Envío de Emails
 * 
 * Este service maneja el envío de emails transaccionales:
 * - Recuperación de contraseña
 * - Confirmación de registro
 * - Notificaciones
 * - etc.
 * 
 * USO:
 *   import { EmailService } from '../services/Email.service'
 *   const emailService = new EmailService()
 *   await emailService.sendPasswordResetEmail(email, token)
 */

import { emailTransporter, emailConfig } from '../config/email.config'

export class EmailService {
  /**
   * Envía un email de recuperación de contraseña
   * 
   * @param email - Email del destinatario
   * @param resetToken - Token de recuperación de contraseña
   * @param resetUrl - URL completa para resetear la contraseña (opcional)
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    resetUrl?: string
  ): Promise<void> {
    // Usar FRONTEND_URL para enlaces en emails (donde el usuario hará clic)
    const resetLink = resetUrl || `${emailConfig.frontendUrl}/reset-password?token=${resetToken}`

    // En desarrollo sin SMTP configurado, solo imprimir en consola
    if (!emailTransporter) {
      console.log('\n📧 ===== EMAIL DE RECUPERACIÓN DE CONTRASEÑA =====')
      console.log(`Para: ${email}`)
      console.log(`Asunto: Recuperación de Contraseña`)
      console.log(`Token: ${resetToken}`)
      console.log(`Enlace: ${resetLink}`)
      console.log('===========================================\n')
      return
    }

    const mailOptions = {
      from: emailConfig.from,
      to: email,
      subject: 'Recuperación de Contraseña',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperación de Contraseña</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333;">Recuperación de Contraseña</h2>
            <p>Hola,</p>
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Restablecer Contraseña
              </a>
            </p>
            <p>O copia y pega este enlace en tu navegador:</p>
            <p style="background-color: #f9f9f9; padding: 10px; border-radius: 3px; word-break: break-all; font-size: 12px;">
              ${resetLink}
            </p>
            <p><strong>Este enlace expirará en 1 hora.</strong></p>
            <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Recuperación de Contraseña
        
        Hola,
        
        Recibimos una solicitud para restablecer la contraseña de tu cuenta.
        
        Haz clic en el siguiente enlace para restablecer tu contraseña:
        ${resetLink}
        
        Este enlace expirará en 1 hora.
        
        Si no solicitaste este cambio, puedes ignorar este email.
        
        ---
        Este es un email automático, por favor no respondas a este mensaje.
      `,
    }

    try {
      const info = await emailTransporter.sendMail(mailOptions)
      
      // En desarrollo, imprimir información del email enviado
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email de recuperación de contraseña enviado:')
        console.log(`   Para: ${email}`)
        console.log(`   Token: ${resetToken}`)
        console.log(`   Message ID: ${info.messageId}`)
      }
    } catch (error) {
      console.error('❌ Error al enviar email de recuperación de contraseña:', error)
      // En desarrollo, no lanzar error para que el flujo continúe
      // En producción, podrías querer lanzar el error o manejarlo de otra manera
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Error al enviar email de recuperación de contraseña')
      }
    }
  }

  /**
   * Envía un email de bienvenida después del registro
   * 
   * @param email - Email del destinatario
   * @param name - Nombre del usuario
   */
  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    // En desarrollo sin SMTP configurado, solo imprimir en consola
    if (!emailTransporter) {
      console.log('\n📧 ===== EMAIL DE BIENVENIDA =====')
      console.log(`Para: ${email}`)
      console.log(`Asunto: ¡Bienvenido${name ? `, ${name}` : ''}!`)
      console.log('===========================================\n')
      return
    }

    const mailOptions = {
      from: emailConfig.from,
      to: email,
      subject: '¡Bienvenido!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
            <h2 style="color: #333;">¡Bienvenido${name ? `, ${name}` : ''}!</h2>
            <p>Gracias por registrarte en nuestro sistema.</p>
            <p>Tu cuenta ha sido creada exitosamente y ya puedes comenzar a usar nuestros servicios.</p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #666;">
              Este es un email automático, por favor no respondas a este mensaje.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        ¡Bienvenido${name ? `, ${name}` : ''}!
        
        Gracias por registrarte en nuestro sistema.
        
        Tu cuenta ha sido creada exitosamente y ya puedes comenzar a usar nuestros servicios.
        
        Si tienes alguna pregunta, no dudes en contactarnos.
        
        ---
        Este es un email automático, por favor no respondas a este mensaje.
      `,
    }

    try {
      const info = await emailTransporter.sendMail(mailOptions)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email de bienvenida enviado:')
        console.log(`   Para: ${email}`)
        console.log(`   Message ID: ${info.messageId}`)
      }
    } catch (error) {
      console.error('❌ Error al enviar email de bienvenida:', error)
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Error al enviar email de bienvenida')
      }
    }
  }

  /**
   * Envía un email genérico
   * 
   * @param to - Email del destinatario
   * @param subject - Asunto del email
   * @param html - Contenido HTML del email
   * @param text - Contenido en texto plano (opcional)
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<void> {
    // En desarrollo sin SMTP configurado, solo imprimir en consola
    if (!emailTransporter) {
      console.log('\n📧 ===== EMAIL =====')
      console.log(`Para: ${to}`)
      console.log(`Asunto: ${subject}`)
      console.log(`Contenido: ${text || html.replace(/<[^>]*>/g, '')}`)
      console.log('===========================================\n')
      return
    }

    const mailOptions = {
      from: emailConfig.from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Convertir HTML a texto si no se proporciona
    }

    try {
      const info = await emailTransporter.sendMail(mailOptions)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email enviado:')
        console.log(`   Para: ${to}`)
        console.log(`   Asunto: ${subject}`)
        console.log(`   Message ID: ${info.messageId}`)
      }
    } catch (error) {
      console.error('❌ Error al enviar email:', error)
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Error al enviar email')
      }
    }
  }
}

