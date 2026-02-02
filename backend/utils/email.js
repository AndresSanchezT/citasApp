const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    console.log("Email enviado:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { success: false, error: error.message };
  }
};

const emailTemplates = {
  citaCreada: (cita) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #7c3aed, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
        .cita-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
        .status-pendiente { background: #eab308; color: white; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Cita Registrada Exitosamente!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${cita.nombreCompleto}</strong>,</p>
          <p>Tu cita médica ha sido registrada correctamente. A continuación los detalles:</p>
          
          <div class="cita-info">
            <div class="info-row">
              <span class="label">Servicio:</span>
              <span class="value">${cita.tipoServicio}</span>
            </div>
            <div class="info-row">
              <span class="label">Fecha:</span>
              <span class="value">${new Date(cita.fecha).toLocaleDateString(
                "es-PE",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}</span>
            </div>
            <div class="info-row">
              <span class="label">Hora:</span>
              <span class="value">${cita.hora}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado:</span>
              <span class="status status-pendiente">${cita.estado.toUpperCase()}</span>
            </div>
            <div class="info-row">
              <span class="label">Número de Cita:</span>
              <span class="value">#${cita.id}</span>
            </div>
          </div>

          <p><strong>Importante:</strong> Tu cita está en estado <em>pendiente</em>. Recibirás un correo de confirmación una vez que nuestro equipo la revise.</p>
          
          <div class="footer">
            <p>Gracias por confiar en CitasFácil</p>
            <p>📧 contacto@citasfacil.com | 📞 +51 999 888 777</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  citaConfirmada: (cita) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #16a34a, #22c55e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f0fdf4; padding: 30px; border-radius: 0 0 10px 10px; }
        .cita-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; background: #22c55e; color: white; }
        .alert-success { background: #dcfce7; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ ¡Cita Confirmada!</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${cita.nombreCompleto}</strong>,</p>
          
          <div class="alert-success">
            <strong>¡Excelente noticia!</strong> Tu cita ha sido confirmada exitosamente.
          </div>
          
          <div class="cita-info">
            <div class="info-row">
              <span class="label">Servicio:</span>
              <span class="value">${cita.tipoServicio}</span>
            </div>
            <div class="info-row">
              <span class="label">Fecha:</span>
              <span class="value">${new Date(cita.fecha).toLocaleDateString(
                "es-PE",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}</span>
            </div>
            <div class="info-row">
              <span class="label">Hora:</span>
              <span class="value">${cita.hora}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado:</span>
              <span class="status">CONFIRMADA</span>
            </div>
          </div>

          <p><strong>Recomendaciones:</strong></p>
          <ul>
            <li>Llega 10 minutos antes de tu cita</li>
            <li>Trae tu DNI o documento de identidad</li>
            <li>Si tienes exámenes previos, tráelos contigo</li>
          </ul>
          
          <div class="footer">
            <p>¡Nos vemos pronto!</p>
            <p>📧 andresalvaro.st@gmail.com | 📞 +51 987 437 118</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  citaRechazada: (cita) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fef2f2; padding: 30px; border-radius: 0 0 10px 10px; }
        .cita-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .info-row { padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
        .info-row:last-child { border-bottom: none; }
        .label { font-weight: bold; color: #6b7280; }
        .value { color: #111827; }
        .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; background: #ef4444; color: white; }
        .alert-error { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Actualización de tu Cita</h1>
        </div>
        <div class="content">
          <p>Hola <strong>${cita.nombreCompleto}</strong>,</p>
          
          <div class="alert-error">
            <strong>Lo sentimos.</strong> Tu cita no pudo ser confirmada.
          </div>
          
          <div class="cita-info">
            <div class="info-row">
              <span class="label">Servicio:</span>
              <span class="value">${cita.tipoServicio}</span>
            </div>
            <div class="info-row">
              <span class="label">Fecha solicitada:</span>
              <span class="value">${new Date(cita.fecha).toLocaleDateString(
                "es-PE",
                {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                },
              )}</span>
            </div>
            <div class="info-row">
              <span class="label">Hora solicitada:</span>
              <span class="value">${cita.hora}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado:</span>
              <span class="status">RECHAZADA</span>
            </div>
            ${
              cita.motivoRechazo
                ? `
            <div class="info-row">
              <span class="label">Motivo:</span>
              <span class="value">${cita.motivoRechazo}</span>
            </div>
            `
                : ""
            }
          </div>

          <p><strong>¿Qué puedes hacer?</strong></p>
          <ul>
            <li>Agenda una nueva cita en un horario diferente</li>
            <li>Contáctanos directamente para más opciones</li>
            <li>Revisa nuestra disponibilidad actualizada</li>
          </ul>
          
          <div class="footer">
            <p>Estamos aquí para ayudarte</p>
            <p>📧 andresalvaro.st@gmail.com | 📞 +51 987 437 118</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
};

module.exports = { sendEmail, emailTemplates };
