import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import "../landingpage/LandingPage.css";
import type { CreateCitaDTO, ValidationErrors } from "../../types";
import { citasService } from "../../services/api";
import Button from "../../components/button/Button";
import Card from "../../components/card/Card";
import Alert from "../../components/alert/Alert";
import Input from "../../components/input/Input";

type FormData = CreateCitaDTO;

interface AlertState {
  type: "success" | "error";
  message: string;
}

function LandingPage() {
  const [formData, setFormData] = useState<FormData>({
    nombreCompleto: "",
    telefono: "",
    email: "",
    tipoServicio: "",
    fecha: "",
    hora: "",
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [loading, setLoading] = useState(false);

  const [backendStatus, setBackendStatus] = useState("");

  useEffect(() => {
    citasService
      .health()
      .then((data) => setBackendStatus(data.message))
      .catch((err) => {
        setBackendStatus("Error al conectar al backend");
        console.log(err)
      });
  }, []);

  useEffect(() => {
    // Validar domingo en tiempo real
    if (formData.fecha) {
      const fechaSeleccionada = new Date(formData.fecha);
      const diaSemana = fechaSeleccionada.getDay();

      if (diaSemana === 0) {
        // Es domingo - mostrar error
        setErrors((prev) => ({
          ...prev,
          fecha: "No atendemos los domingos. Por favor selecciona otro día",
        }));
      } else {
        // No es domingo - limpiar error de domingo si existe
        setErrors((prev) => {
          const newErrors = { ...prev };
          // Solo eliminar si el error es específicamente sobre domingo
          if (
            newErrors.fecha ===
            "No atendemos los domingos. Por favor selecciona otro día"
          ) {
            delete newErrors.fecha;
          }
          return newErrors;
        });
      }
    }
  }, [formData.fecha]);

  useEffect(() => {
    // Validar horario en tiempo real
    if (formData.hora) {
      const [hours, minutes] = formData.hora.split(":").map(Number);
      const horaEnMinutos = hours * 60 + minutes;
      const horaInicio = 8 * 60;
      const horaFin = 20 * 60;

      if (horaEnMinutos < horaInicio || horaEnMinutos >= horaFin) {
        // Fuera de horario - mostrar error
        setErrors((prev) => ({
          ...prev,
          hora: "El horario de atención es de 8:00 AM a 8:00 PM",
        }));
      } else {
        // Dentro de horario - limpiar error de horario si existe
        setErrors((prev) => {
          const newErrors = { ...prev };
          // Solo eliminar si el error es específicamente sobre horario
          if (
            newErrors.hora === "El horario de atención es de 8:00 AM a 8:00 PM"
          ) {
            delete newErrors.hora;
          }
          return newErrors;
        });
      }
    }
  }, [formData.hora]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.nombreCompleto.trim()) {
      newErrors.nombreCompleto = "Este campo es obligatorio";
    }

    if (!formData.telefono.trim()) {
      newErrors.telefono = "Este campo es obligatorio";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Este campo es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del email no es válido";
    }

    if (!formData.tipoServicio) {
      newErrors.tipoServicio = "Por favor selecciona un servicio";
    }

    // Validación de fecha
    if (!formData.fecha) {
      newErrors.fecha = "Este campo es obligatorio";
    } else {
      const fechaSeleccionada = new Date(formData.fecha);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Verificar que no sea una fecha pasada
      if (fechaSeleccionada < hoy) {
        newErrors.fecha = "No puedes agendar citas en fechas pasadas";
      }

      // Verificar que no sea domingo (0 = domingo)
      const diaSemana = fechaSeleccionada.getDay();
      if (diaSemana === 0) {
        newErrors.fecha =
          "No atendemos los domingos. Por favor selecciona otro día";
      }
    }

    // Validación de hora
    if (!formData.hora) {
      newErrors.hora = "Este campo es obligatorio";
    } else {
      const [hours, minutes] = formData.hora.split(":").map(Number);
      const horaEnMinutos = hours * 60 + minutes;
      const horaInicio = 8 * 60; // 8:00 AM
      const horaFin = 20 * 60; // 8:00 PM

      if (horaEnMinutos < horaInicio || horaEnMinutos >= horaFin) {
        newErrors.hora = "El horario de atención es de 8:00 AM a 8:00 PM";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setAlert({
        type: "error",
        message: "Por favor completa todos los campos correctamente",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await citasService.create(formData);

      if (response.success) {
        setAlert({ type: "success", message: response.message });
        setFormData({
          nombreCompleto: "",
          telefono: "",
          email: "",
          tipoServicio: "",
          fecha: "",
          hora: "",
        });

        setTimeout(() => setAlert(null), 5000);
      }
    } catch (error) {
      const errorMessage =
        (error as { error?: string })?.error ||
        "Hubo un error. Por favor intenta nuevamente.";
      setAlert({ type: "error", message: errorMessage });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Calcular fecha mínima (hoy)
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="nav">
            <div className="logo">
              <span className="logo-text">CitasFácil</span>
            </div>
            <div className="nav-links">
              <a href="#inicio">Inicio</a>
              <a href="#servicios">Servicios</a>
              <a href="#contacto">Contacto</a>
              <Button
                variant="primary"
                size="small"
                onClick={() => {
                  document
                    .getElementById("agendar")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Agendar Cita
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero" id="inicio">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-title">
                Agenda tu cita médica en{" "}
                <span className="highlight">30 segundos</span>
              </h1>
              <p className="hero-description">
                Sin llamadas, sin esperas. Confirmación instantánea por email.
              </p>
              <Button
                variant="primary"
                size="large"
                onClick={() => {
                  document
                    .getElementById("agendar")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Comenzar ahora →
              </Button>
              <p className="hero-note">✓ No requiere tarjeta de crédito</p>
            </div>
            <div className="hero-image">
              <img
                src="/doctora_img.png"
                alt="Doctora atendiendo paciente"
                className="hero-img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features" id="servicios">
        <div className="container">
          <h2 className="section-title">¿Por qué elegir CitasFácil?</h2>
          <p className="section-subtitle">
            La forma más simple y rápida de gestionar tus citas médicas
          </p>
          <div className="cards-grid">
            <Card
              icon="🚀"
              title="Confirmación inmediata"
              description="Recibe un email al instante con todos los detalles de tu cita"
            />
            <Card
              icon="🎯"
              title="Sin complicaciones"
              description="Agenda en menos de 2 minutos desde cualquier dispositivo, sin descargas"
            />
            <Card
              icon="🔒"
              title="100% Seguro"
              description="Tus datos están protegidos con encriptación de nivel bancario"
            />
          </div>
        </div>
      </section>

      {backendStatus && (
        <div
          style={{
            padding: "10px",
            background: "#e0f7fa",
            margin: "1rem 0",
            borderRadius: "5px",
          }}
        >
          🔌 Estado del backend: {backendStatus}
        </div>
      )}

      {/* Form Section */}
      <section className="form-section" id="agendar">
        <div className="container">
          <div className="form-wrapper">
            <h2 className="form-title">Agenda tu cita en minutos</h2>
            <p className="form-subtitle">
              Completa el formulario y recibirás confirmación inmediata
            </p>

            {alert && (
              <Alert
                type={alert.type}
                message={alert.message}
                onClose={() => setAlert(null)}
                autoClose
              />
            )}

            <form onSubmit={handleSubmit} className="form">
              <div className="form-row">
                <Input
                  label="Nombre Completo"
                  name="nombreCompleto"
                  value={formData.nombreCompleto}
                  onChange={handleChange}
                  placeholder="Ingresa tu nombre completo"
                  error={errors.nombreCompleto}
                  required
                  autoComplete="name"
                />
              </div>

              <div className="form-row form-row--two">
                <Input
                  label="Teléfono"
                  name="telefono"
                  type="tel"
                  value={formData.telefono}
                  onChange={handleChange}
                  placeholder="Ej: +51 999 999 999"
                  error={errors.telefono}
                  required
                  autoComplete="tel"
                />

                <div className="input-group">
                  <label htmlFor="tipoServicio" className="input-label">
                    Tipo de Servicio<span className="input-required">*</span>
                  </label>
                  <select
                    id="tipoServicio"
                    name="tipoServicio"
                    value={formData.tipoServicio}
                    onChange={handleChange}
                    className={`input-field ${errors.tipoServicio ? "input-field--error" : ""}`}
                    required
                  >
                    <option value="">Selecciona un servicio</option>
                    <option value="Consulta General">Consulta General</option>
                    <option value="Pediatría">Pediatría</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Dermatología">Dermatología</option>
                    <option value="Odontología">Odontología</option>
                    <option value="Oftalmología">Oftalmología</option>
                  </select>
                  {errors.tipoServicio && (
                    <span className="input-error-message">
                      {errors.tipoServicio}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-row">
                <Input
                  label="Correo Electrónico"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="correo@ejemplo.com"
                  error={errors.email}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-row form-row--two">
                <div>
                  <Input
                    label="Fecha"
                    name="fecha"
                    type="date"
                    value={formData.fecha}
                    onChange={handleChange}
                    error={errors.fecha}
                    required
                    min={today}
                  />
                  <p className="input-helper-text">📅 Lunes a Sábado</p>
                </div>

                <div>
                  <Input
                    label="Hora"
                    name="hora"
                    type="time"
                    value={formData.hora}
                    onChange={handleChange}
                    error={errors.hora}
                    required
                    min="08:00"
                    max="20:00"
                  />
                  <p className="input-helper-text">🕐 8:00 AM - 8:00 PM</p>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
              >
                Agendar Cita
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">¿Listo para agendar tu primera cita?</h2>
            <p className="cta-description">
              Únete a miles de personas que ya confían en CitasFácil
            </p>
            <Button
              variant="primary"
              size="large"
              onClick={() => {
                document
                  .getElementById("agendar")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Comenzar ahora →
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" id="contacto">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3 className="footer-title">CitasFácil</h3>
              <p className="footer-text">
                La forma más simple de gestionar tus citas médicas.
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-heading">Enlaces</h4>
              <ul className="footer-links">
                <li>
                  <a href="#servicios">Servicios</a>
                </li>
                <li>
                  <a href="#inicio">Inicio</a>
                </li>
                <li>
                  <a href="#contacto">Contacto</a>
                </li>
                <li>
                  <a href="#terminos">Términos y Condiciones</a>
                </li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-heading">Contacto</h4>
              <p className="footer-text">📧 andresalvaro.st@gmail.com</p>
              <p className="footer-text">📞 +51 987 437 118</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 CitasFácil. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
