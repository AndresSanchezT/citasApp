import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";
import type { Cita, Stats } from "../../types";
import { adminService } from "../../services/api";
import Button from "../../components/button/Button";
import Alert from "../../components/alert/Alert";
import { useAuth } from "../../hooks/useAuth";

interface AlertState {
  type: "success" | "error";
  message: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [citas, setCitas] = useState<Cita[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "todas" | "pendiente" | "confirmada" | "rechazada"
  >("todas");
  const [motivoRechazo, setMotivoRechazo] = useState<{ [key: number]: string }>(
    {},
  );
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citasData, statsData] = await Promise.all([
        adminService.getAllCitas(),
        adminService.getStats(),
      ]);
      setCitas(citasData);
      setStats(statsData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      setAlert({ type: "error", message: "Error al cargar datos" });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmar = async (id: number) => {
    try {
      await adminService.confirmarCita(id);
      setAlert({
        type: "success",
        message: "✓ Cita confirmada y email enviado",
      });
      fetchData();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: "error", message: "Error al confirmar cita" });
      console.log(error);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleRechazar = async (id: number) => {
    try {
      const motivo = motivoRechazo[id] || "No especificado";
      await adminService.rechazarCita(id, motivo);
      setAlert({
        type: "success",
        message: "✓ Cita rechazada y email enviado",
      });
      setShowRejectModal(null);
      setMotivoRechazo({ ...motivoRechazo, [id]: "" });
      fetchData();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: "error", message: "Error al rechazar cita" });
      console.log(error);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta cita?")) return;

    try {
      await adminService.deleteCita(id);
      setAlert({ type: "success", message: "✓ Cita eliminada" });
      fetchData();
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: "error", message: "Error al eliminar cita" });
      console.log(error);
      setTimeout(() => setAlert(null), 3000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredCitas =
    filter === "todas" ? citas : citas.filter((cita) => cita.estado === filter);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-large"></div>
        <p>Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div>
              <h1 className="admin-logo">CitasFácil</h1>
              <p className="admin-welcome">
                Bienvenido, <strong>{user?.nombre}</strong>
              </p>
            </div>
            <div className="admin-actions">
              <Button variant="secondary" onClick={() => navigate("/")}>
                Ver Sitio Público
              </Button>
              <Button variant="text" onClick={handleLogout}>
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container admin-content">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
            autoClose
          />
        )}

        {/* Estadísticas */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <p className="stat-label">Total de Citas</p>
                <p className="stat-value">{stats.total}</p>
              </div>
            </div>

            <div className="stat-card stat-card--warning">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <p className="stat-label">Pendientes</p>
                <p className="stat-value">{stats.pendientes}</p>
              </div>
            </div>

            <div className="stat-card stat-card--success">
              <div className="stat-icon">✓</div>
              <div className="stat-info">
                <p className="stat-label">Confirmadas</p>
                <p className="stat-value">{stats.confirmadas}</p>
              </div>
            </div>

            <div className="stat-card stat-card--error">
              <div className="stat-icon">✕</div>
              <div className="stat-info">
                <p className="stat-label">Rechazadas</p>
                <p className="stat-value">{stats.rechazadas}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="filters">
          <h2 className="section-title">Gestión de Citas</h2>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === "todas" ? "active" : ""}`}
              onClick={() => setFilter("todas")}
            >
              Todas ({citas.length})
            </button>
            <button
              className={`filter-btn ${filter === "pendiente" ? "active" : ""}`}
              onClick={() => setFilter("pendiente")}
            >
              Pendientes ({stats?.pendientes || 0})
            </button>
            <button
              className={`filter-btn ${filter === "confirmada" ? "active" : ""}`}
              onClick={() => setFilter("confirmada")}
            >
              Confirmadas ({stats?.confirmadas || 0})
            </button>
            <button
              className={`filter-btn ${filter === "rechazada" ? "active" : ""}`}
              onClick={() => setFilter("rechazada")}
            >
              Rechazadas ({stats?.rechazadas || 0})
            </button>
          </div>
        </div>

        {/* Lista de Citas */}
        {filteredCitas.length === 0 ? (
          <div className="no-citas">
            <p>No hay citas {filter !== "todas" ? filter + "s" : ""}</p>
          </div>
        ) : (
          <div className="citas-table-container">
            <table className="citas-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Paciente</th>
                  <th>Contacto</th>
                  <th>Servicio</th>
                  <th>Fecha y Hora</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCitas.map((cita) => (
                  <tr key={cita.id}>
                    <td>#{cita.id}</td>
                    <td>
                      <strong>{cita.nombreCompleto}</strong>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div>📧 {cita.email}</div>
                        <div>📱 {cita.telefono}</div>
                      </div>
                    </td>
                    <td>{cita.tipoServicio}</td>
                    <td>
                      <div>📅 {formatDate(cita.fecha)}</div>
                      <div>🕐 {cita.hora}</div>
                    </td>
                    <td>
                      <span className={`status-badge status-${cita.estado}`}>
                        {cita.estado.toUpperCase()}
                      </span>
                      {cita.motivoRechazo && (
                        <div className="motivo-rechazo">
                          <small>Motivo: {cita.motivoRechazo}</small>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {cita.estado === "pendiente" && (
                          <>
                            <button
                              className="btn-action btn-confirmar"
                              onClick={() => handleConfirmar(cita.id)}
                              title="Confirmar cita"
                            >
                              ✓
                            </button>
                            <button
                              className="btn-action btn-rechazar"
                              onClick={() => setShowRejectModal(cita.id)}
                              title="Rechazar cita"
                            >
                              ✕
                            </button>
                          </>
                        )}
                        <button
                          className="btn-action btn-eliminar"
                          onClick={() => handleEliminar(cita.id)}
                          title="Eliminar cita"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Rechazo */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Rechazar Cita</h3>
            <p className="modal-subtitle">
              Por favor, indica el motivo del rechazo:
            </p>

            <textarea
              className="modal-textarea"
              value={motivoRechazo[showRejectModal] || ""}
              onChange={(e) =>
                setMotivoRechazo({
                  ...motivoRechazo,
                  [showRejectModal]: e.target.value,
                })
              }
              placeholder="Ej: No hay disponibilidad en ese horario..."
              rows={4}
            />

            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(null)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={() => handleRechazar(showRejectModal)}
              >
                Confirmar Rechazo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
