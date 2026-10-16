/**
 * FUNDACIÓN EN LA CASA DE PAPÁ
 * NIT: 901847090-7 | Villavicencio, Meta
 * Dirección: CL 43 # 24 - 13 cs D-15
 * Tel: 3105693286 - 3202736210 | Email: f.enlacasadepapa@gmail.com
 * Lógica interactiva, cuenta regresiva, buzón de sociedad civil
 * y cumplimiento normativo Art. 364-5 E.T. / DIAN
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initCountdown();
  initNotifyForm();
  initCivilSocietyForm();
  initDocPreviewModals();
  renderRadicadosLog();
  initSemillasCalculator();
  initFaqAccordion();
  initSemillasPackageButtons();
});

/* ==========================================================================
   Menú Móvil
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  if (!toggle || !navMenu) return;

  toggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const isExpanded = navMenu.classList.contains('active');
    toggle.setAttribute('aria-expanded', isExpanded);
  });
}

/* ==========================================================================
   Cuenta Regresiva (Countdown)
   ========================================================================== */
function initCountdown() {
  const daysEl = document.getElementById('cd-days');
  const hoursEl = document.getElementById('cd-hours');
  const minutesEl = document.getElementById('cd-minutes');
  const secondsEl = document.getElementById('cd-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  // Fecha estimada de apertura digital (45 días en el futuro)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 45);
  targetDate.setHours(10, 0, 0, 0);

  function update() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   Formulario "Notifícame del lanzamiento"
   ========================================================================== */
function initNotifyForm() {
  const notifyForm = document.getElementById('notify-form');
  if (!notifyForm) return;

  notifyForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const emailInput = document.getElementById('notify-email');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!isValidEmail(email)) {
      showToast('Por favor ingrese un correo electrónico válido.', 'error');
      return;
    }

    // Guardar en almacenamiento local
    try {
      const subscribers = JSON.parse(localStorage.getItem('fecp_subscribers') || '[]');
      if (!subscribers.includes(email)) {
        subscribers.push(email);
        localStorage.setItem('fecp_subscribers', JSON.stringify(subscribers));
      }
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }

    showToast('¡Gracias por unirte! Te notificaremos tan pronto abramos nuestras puertas.', 'success');
    notifyForm.reset();
  });
}

/* ==========================================================================
   Buzón Ciudadano / Canal de Inconformidades y Comentarios (DIAN)
   ========================================================================== */
function initCivilSocietyForm() {
  const form = document.getElementById('dian-comments-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cs-name')?.value.trim();
    const docId = document.getElementById('cs-doc')?.value.trim();
    const email = document.getElementById('cs-email')?.value.trim();
    const phone = document.getElementById('cs-phone')?.value.trim() || 'No reportado';
    const type = document.getElementById('cs-type')?.value;
    const subject = document.getElementById('cs-subject')?.value.trim();
    const message = document.getElementById('cs-message')?.value.trim();
    const terms = document.getElementById('cs-terms')?.checked;

    // Validaciones
    if (!name || name.length < 3) {
      showToast('Por favor ingresa tu nombre completo o razón social.', 'error');
      return;
    }
    if (!docId || docId.length < 4) {
      showToast('Por favor ingresa un número de identificación o NIT válido.', 'error');
      return;
    }
    if (!isValidEmail(email)) {
      showToast('Por favor ingresa un correo electrónico válido para notificación.', 'error');
      return;
    }
    if (!type) {
      showToast('Por favor selecciona el tipo de manifestación en el menú desplegable.', 'error');
      return;
    }
    if (!subject || subject.length < 4) {
      showToast('Por favor ingresa el asunto de tu manifestación.', 'error');
      return;
    }
    if (!message || message.length < 15) {
      showToast('El mensaje debe contener una justificación clara de al menos 15 caracteres.', 'error');
      return;
    }
    if (!terms) {
      showToast('Debes marcar la casilla de autorización de tratamiento de datos personales.', 'error');
      return;
    }

    // Generar radicado oficial único
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const radicado = `RAD-RTE-${dateStr}-${randomDigits}`;
    const timestamp = new Date().toLocaleString('es-CO', {
      dateStyle: 'full',
      timeStyle: 'medium'
    });

    const submissionData = {
      radicado,
      timestamp,
      name,
      docId,
      email,
      phone,
      type,
      subject,
      message,
      estado: 'Radicado y Notificado a la Fundación'
    };

    // Guardar en LocalStorage para historial de transparencia
    saveRadicado(submissionData);

    // Mostrar modal con constancia formal de radicación
    showReceiptModal(submissionData);

    // Limpiar formulario y actualizar historial visible
    form.reset();
    renderRadicadosLog();
    showToast(`Manifestación radicada exitosamente con número: ${radicado}`, 'success');
  });
}

function saveRadicado(data) {
  try {
    const list = JSON.parse(localStorage.getItem('fecp_radicados') || '[]');
    list.unshift(data);
    localStorage.setItem('fecp_radicados', JSON.stringify(list));
  } catch (e) {
    console.error('Error saving radicado:', e);
  }
}

function renderRadicadosLog() {
  const container = document.getElementById('radicados-list-container');
  if (!container) return;

  try {
    const list = JSON.parse(localStorage.getItem('fecp_radicados') || '[]');
    if (list.length === 0) {
      container.innerHTML = `
        <div style="background: var(--cream-bg); padding: 1.25rem; border-radius: var(--radius-md); font-size: 0.88rem; color: var(--text-muted); text-align: center;">
          <p>No se han registrado manifestaciones desde este dispositivo aún. Cada observación o inconformidad registrada queda almacenada aquí con su respectivo código de radicado para constancia ciudadana y ante las autoridades de supervisión de la DIAN.</p>
        </div>
      `;
      return;
    }

    let html = `<div style="display: flex; flex-direction: column; gap: 0.75rem;">`;
    list.slice(0, 5).forEach(item => {
      html += `
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1rem 1.25rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span class="radicado-badge">📄 ${item.radicado}</span>
              <span style="font-size: 0.8rem; font-weight: 700; color: var(--primary); text-transform: uppercase;">${item.type}</span>
            </div>
            <div style="font-size: 0.9rem; font-weight: 600; color: var(--primary-deep);">${escapeHtml(item.subject)}</div>
            <div style="font-size: 0.78rem; color: var(--text-light);">${item.timestamp} • Remitente: ${escapeHtml(item.name)}</div>
          </div>
          <button class="btn btn-sm btn-outline" onclick="window.viewStoredReceipt('${item.radicado}')">
            Ver Constancia
          </button>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  } catch (e) {
    console.error(e);
  }
}

window.viewStoredReceipt = function(radicadoCode) {
  try {
    const list = JSON.parse(localStorage.getItem('fecp_radicados') || '[]');
    const item = list.find(r => r.radicado === radicadoCode);
    if (item) {
      showReceiptModal(item);
    }
  } catch (e) {
    console.error(e);
  }
};

/* ==========================================================================
   Modal de Constancia / Recibo Oficial de Radicación
   ========================================================================== */
function showReceiptModal(data) {
  let modal = document.getElementById('receipt-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'receipt-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  // Correo oficial de la fundación
  const officialEmail = 'f.enlacasadepapa@gmail.com';
  const mailSubject = encodeURIComponent(`[${data.radicado}] Manifestación de la Sociedad Civil RTE - ${data.type}`);
  const mailBody = encodeURIComponent(
`CONSTANCIA OFICIAL DE RADICACIÓN DE MANIFESTACIÓN CIUDADANA
REGISTRO WEB - RÉGIMEN TRIBUTARIO ESPECIAL (DIAN)
FUNDACIÓN EN LA CASA DE PAPÁ
NIT: 901847090-7 | Villavicencio, Meta
Dirección: CL 43 # 24 - 13 cs D-15
Teléfonos: 3105693286 - 3202736210

Número de Radicado: ${data.radicado}
Fecha y Hora de Registro: ${data.timestamp}
Remitente (Nombre/Razón Social): ${data.name}
Doc. Identidad / NIT: ${data.docId}
Correo electrónico: ${data.email}
Teléfono de contacto: ${data.phone}
Tipo de Manifestación: ${data.type}
Asunto: ${data.subject}

Detalle de la Observación / Inconformidad:
${data.message}

Fundamento Jurídico:
De conformidad con el Artículo 364-5 Parágrafo 4 del Estatuto Tributario, el Artículo 7 de la Resolución No. 000019 de 2018 de la DIAN y el Artículo 1.2.1.5.1.3 del Decreto 1625 de 2016.`
  );
  const mailtoUrl = `mailto:${officialEmail}?subject=${mailSubject}&body=${mailBody}`;

  modal.innerHTML = `
    <div class="modal-card" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <button class="modal-close-btn" onclick="closeReceiptModal()" aria-label="Cerrar modal">&times;</button>
      
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">🏛️</div>
        <span class="form-header-badge">Constancia Oficial de Radicación</span>
        <h3 id="modal-title" style="font-size: 1.35rem; color: var(--primary-deep); margin-top: 0.4rem;">
          Registro Web de Manifestación Ciudadana
        </h3>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">
          Fundación En La Casa de Papá • NIT: 901847090-7 • Villavicencio, Meta
        </p>
      </div>

      <div class="receipt-box" id="printable-receipt">
        <div class="receipt-row">
          <span class="receipt-label">Número de Radicado:</span>
          <span class="receipt-value" style="color: var(--primary); font-size: 1.05rem;">${data.radicado}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Fecha y Hora:</span>
          <span class="receipt-value">${data.timestamp}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Ciudadano / Razón Social:</span>
          <span class="receipt-value">${escapeHtml(data.name)}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Doc. Identidad / NIT:</span>
          <span class="receipt-value">${escapeHtml(data.docId)}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Correo Notificación:</span>
          <span class="receipt-value">${escapeHtml(data.email)}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Teléfono:</span>
          <span class="receipt-value">${escapeHtml(data.phone)}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Tipo de Trámite:</span>
          <span class="receipt-value" style="color: var(--accent);">${data.type}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Asunto:</span>
          <span class="receipt-value">${escapeHtml(data.subject)}</span>
        </div>
        <div style="margin-top: 0.85rem; padding-top: 0.75rem; border-top: 1px solid rgba(0,0,0,0.08);">
          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-light); text-transform: uppercase; margin-bottom: 0.35rem;">
            Detalle de la Inconformidad / Observación:
          </div>
          <div style="font-size: 0.88rem; color: var(--text-main); background: #ffffff; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color); line-height: 1.5; white-space: pre-wrap;">${escapeHtml(data.message)}</div>
        </div>
        <div style="margin-top: 0.85rem; font-size: 0.75rem; color: var(--text-light); line-height: 1.4; text-align: center;">
          Constancia emitida conforme al Art. 364-5 § 4 del Estatuto Tributario, Decreto 1625 de 2016 y Res. 000019 de 2018 (DIAN).
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 1.25rem;">
        <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
          <button class="btn btn-outline" style="flex: 1;" onclick="printReceipt()">
            🖨️ Imprimir / Guardar Constancia
          </button>
          <a href="${mailtoUrl}" class="btn btn-primary" style="flex: 1;">
            ✉️ Enviar Copia a la Fundación
          </a>
        </div>
        <button class="btn btn-outline" onclick="closeReceiptModal()">
          Cerrar
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

window.closeReceiptModal = function() {
  const modal = document.getElementById('receipt-modal');
  if (modal) modal.classList.remove('active');
};

window.printReceipt = function() {
  window.print();
};

/* ==========================================================================
   Modal de Detalles de Documentos Estatutarios Oficiales
   ========================================================================== */
function initDocPreviewModals() {
  const buttons = document.querySelectorAll('[data-doc-details]');
  if (!buttons.length) return;

  const docDatabase = {
    '1': {
      title: 'Certificado de Existencia y Representación Legal',
      entity: 'Cámara de Comercio de Villavicencio (CCV)',
      norm: 'Decreto 1625 de 2016, Art. 1.2.1.5.1.3 y Art. 364-5 Num. 1 E.T.',
      date: 'Expedición 14/08/2026 - Inscripción S0510272',
      file: 'docs/01-certificado-camara-de-comercio-ccv.pdf',
      altFile: 'documentos en pdf/CERTIFICADO CAMARA  Y COMERCIO.pdf',
      desc: 'Certificado electrónico emitido por la Cámara de Comercio de Villavicencio con código de verificación qSjBfBQKct. Acredita personería jurídica, NIT 901847090-7, domicilio en Villavicencio, renovación 2026 y facultades legales.'
    },
    '2': {
      title: 'Acta No. 3 de Asamblea General (Calificación RTE)',
      entity: 'Asamblea General Extraordinaria de Fundadores',
      norm: 'Art. 364-5 Num. 3 E.T. y Res. 000019/2018',
      date: 'Acta No. 003 de Asamblea General',
      file: 'docs/02-acta-asamblea-general-n3.pdf',
      altFile: 'documentos en pdf/Acta N3.pdf',
      desc: 'Acta de asamblea donde consta la autorización expresa al Representante Legal para adelantar la solicitud de calificación al Régimen Tributario Especial ante la DIAN y la destinación integral de los excedentes al desarrollo del objeto social.'
    },
    '3': {
      title: 'Estados Financieros Oficiales con Revelaciones 2025',
      entity: 'Contaduría Pública / Fundación En La Casa de Papá',
      norm: 'Art. 364-5 Num. 4 E.T. y Normas NIIF Grupo III',
      date: 'Cierre del Ejercicio Fiscal 2025',
      file: 'docs/03-estados-financieros-2025.pdf',
      altFile: 'documentos en pdf/ESTADOS FINANCIEROS 2025.pdf',
      desc: 'Estados de Situación Financiera, Estado de Resultados Integral y Notas Contables explicativas, acreditando la adecuada gestión patrimonial y aplicación de fondos a los fines de protección y bienestar a la niñez.'
    },
    '4': {
      title: 'Certificación de Antecedentes de Directivos',
      entity: 'Policía Nacional, Procuraduría y Contraloría General',
      norm: 'Art. 364-3 y Art. 364-5 Num. 5 E.T.',
      date: 'Vigente - Verificado',
      file: 'docs/04-antecedentes-judiciales-directivos.pdf',
      altFile: 'documentos en pdf/antedecedentes osbal y nelsy.pdf',
      desc: 'Certificaciones oficiales de antecedentes judiciales, disciplinarios y fiscales de los miembros del Consejo de Administración: Osbal Armando Mendoza Betancourt (C.C. 86.047.384) y María Nelsy Reina García (C.C. 40.443.902).'
    },
    '5': {
      title: 'Declaración de Renta e Ingresos y Patrimonio (DIAN Formulario 110)',
      entity: 'Dirección de Impuestos y Aduanas Nacionales (DIAN)',
      norm: 'Art. 364-5 E.T. y Formulario Oficial 110',
      date: 'Radicación No. 1117631870563',
      file: 'docs/05-declaracion-dian-formulario-110.pdf',
      altFile: 'documentos en pdf/1117631870563 DECLARACION.pdf',
      desc: 'Formulario oficial 110 de Declaración de Renta y Complementarios o de Ingresos y Patrimonio para personas jurídicas debidamente presentado ante la DIAN bajo el autoadhesivo No. 1117631870563.'
    },
    '6': {
      title: 'Estatutos Vigentes de la Fundación',
      entity: 'Asamblea General Constitutiva / CCV',
      norm: 'Art. 364-5 Num. 2 E.T.',
      date: 'Inscripción No. 48246 Libro I ESAL',
      file: 'docs/02-estatutos-fundacion-en-la-casa-de-papa.pdf',
      desc: 'Cuerpo normativo estatutario que regula la Fundación En La Casa de Papá, consagrando la prohibición expresa de repartición de utilidades y la dedicación a actividades meritorias (Art. 359 E.T.).'
    },
    '7': {
      title: 'Certificación de Cumplimiento de Requisitos Art. 364-5',
      entity: 'Representante Legal y Contador Público',
      norm: 'Art. 364-5 Num. 13 del Estatuto Tributario',
      date: 'Vigente para el proceso de Calificación RTE',
      file: 'docs/04-certificacion-cumplimiento-requisitos-art-364-5.pdf',
      desc: 'Declaración formal bajo gravedad de juramento en la que se certifica que la entidad ha cumplido todos los requisitos legales para pertenecer al Régimen Tributario Especial.'
    },
    '8': {
      title: 'Memoria Económica y Proyectos Sociales',
      entity: 'Dirección Ejecutiva y de Proyectos',
      norm: 'Art. 356-3 E.T. y DUR 1625 de 2016',
      date: 'Año de Gestión Vigente',
      file: 'docs/07-memoria-economica.pdf',
      desc: 'Informe técnico de ejecución de recursos, origen de donaciones y cobertura de los programas asistenciales y pedagógicos brindados a los niños, niñas y sus familias.'
    }
  };

  let modal = document.getElementById('doc-preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'doc-preview-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const docId = btn.getAttribute('data-doc-details');
      const doc = docDatabase[docId];
      if (!doc) return;

      modal.innerHTML = `
        <div class="modal-card" role="dialog" aria-labelledby="doc-modal-title" aria-modal="true">
          <button class="modal-close-btn" onclick="closeDocModal()" aria-label="Cerrar modal">&times;</button>
          
          <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.25rem;">
            <div style="width: 44px; height: 44px; border-radius: var(--radius-sm); background: #fdf3f3; color: #e53e3e; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
              📄
            </div>
            <div>
              <span class="doc-badge-status">Documento Oficial Disponible</span>
              <h3 id="doc-modal-title" style="font-size: 1.2rem; color: var(--primary-deep); margin-top: 0.2rem;">
                ${doc.title}
              </h3>
            </div>
          </div>

          <div style="background: var(--cream-bg); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.25rem; font-size: 0.88rem; display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600; color: var(--text-muted);">Emisor / Origen:</span>
              <span style="font-weight: 700; color: var(--primary-deep);">${doc.entity}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600; color: var(--text-muted);">Fundamento Jurídico:</span>
              <span style="font-weight: 600; color: var(--accent);">${doc.norm}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600; color: var(--text-muted);">Vigencia / Fecha:</span>
              <span style="font-weight: 600;">${doc.date}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="font-weight: 600; color: var(--text-muted);">Formato:</span>
              <span style="font-weight: 700; color: #e53e3e;">PDF Oficial Original</span>
            </div>
          </div>

          <p style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.5rem;">
            ${doc.desc}
          </p>

          <div style="display: flex; gap: 0.75rem;">
            <a href="${doc.file}" target="_blank" download class="btn btn-primary" style="flex: 1;">
              ⬇️ Descargar Documento Oficial
            </a>
            <button class="btn btn-outline" onclick="closeDocModal()">
              Cerrar
            </button>
          </div>
        </div>
      `;

      modal.classList.add('active');
    });
  });
}

window.closeDocModal = function() {
  const modal = document.getElementById('doc-preview-modal');
  if (modal) modal.classList.remove('active');
};

/* ==========================================================================
   Utilidad de Notificaciones Toast
   ========================================================================== */
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

/* ==========================================================================
   Ayudantes de Sanitización y Validación
   ========================================================================== */
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

function escapeHtml(string) {
  const div = document.createElement('div');
  div.innerText = string;
  return div.innerHTML;
}

/* ==========================================================================
   LÓGICA: CALCULADORA INTERACTIVA DE SEMILLAS DE VIDA & MODAL
   ========================================================================== */

let currentDonationData = {
  frequency: 'monthly',
  amount: 100000,
  dailyCost: 3333,
  packageName: 'Semillita de Nutrición',
  impactMeals: 30,
  impactHours: 15,
  impactKids: '1 niño'
};

function initSemillasCalculator() {
  const customInput = document.getElementById('custom-amount-input');
  const slider = document.getElementById('amount-slider');
  const quickBtns = document.querySelectorAll('.quick-btn');
  const freqBtns = document.querySelectorAll('.freq-btn');
  const btnConcretar = document.getElementById('btn-concretar-aporte');

  // Si no está presente en la página actual, salimos silenciosamente
  if (!customInput && !slider && !btnConcretar) return;

  function formatMoneyCOP(val) {
    return '$' + Math.round(val).toLocaleString('es-CO');
  }

  function updateCalculations(newAmount) {
    newAmount = Math.max(30000, Math.min(5000000, Number(newAmount) || 100000));
    currentDonationData.amount = newAmount;

    const isMonthly = currentDonationData.frequency === 'monthly';
    const dailyCost = isMonthly ? Math.round(newAmount / 30) : newAmount;
    currentDonationData.dailyCost = dailyCost;

    // Actualizar nombre de paquete sugerido según los rangos del Lineamiento Interno
    if (newAmount < 300000) {
      currentDonationData.packageName = 'Semillita de Nutrición (Nivel 1)';
    } else if (newAmount <= 500000) {
      currentDonationData.packageName = 'Semilla de Futuro (Nivel 2)';
    } else {
      currentDonationData.packageName = 'Sembrador Guardián (Nivel 3)';
    }

    // Impacto estimado
    const meals = Math.max(1, Math.round(newAmount / 3333));
    const hours = Math.max(2, Math.round((newAmount / 100000) * 15));
    const kids = Math.max(1, Math.floor(newAmount / 100000));

    currentDonationData.impactMeals = meals;
    currentDonationData.impactHours = hours;
    currentDonationData.impactKids = kids === 1 ? '1 niño' : `${kids} niños`;

    // Actualizar DOM
    const dailyCostEl = document.getElementById('calc-daily-cost');
    const compEl = document.getElementById('calc-daily-comparison');
    const mealsEl = document.getElementById('calc-meals-count');
    const hoursEl = document.getElementById('calc-tutoring-hours');
    const kidsEl = document.getElementById('calc-kids-count');

    if (dailyCostEl) {
      dailyCostEl.innerHTML = `${formatMoneyCOP(dailyCost)} COP <span class="cir-period">${isMonthly ? '/ día' : 'único'}</span>`;
    }

    if (compEl) {
      if (dailyCost <= 4000) {
        compEl.textContent = '☕ Menos de lo que vale un café caliente y un pan de queso';
      } else if (dailyCost <= 8000) {
        compEl.textContent = '🥪 Menos de lo que cuesta un refrigerio o una gaseosa';
      } else if (dailyCost <= 15000) {
        compEl.textContent = '🍛 El equivalente a un almuerzo corriente de paso';
      } else {
        compEl.textContent = '🌟 Un apoyo transformador que rescata a toda una familia';
      }
    }

    if (mealsEl) mealsEl.textContent = String(meals);
    if (hoursEl) hoursEl.textContent = `${hours} hrs`;
    if (kidsEl) kidsEl.textContent = currentDonationData.impactKids;

    // Sincronizar input y slider
    if (customInput && Number(customInput.value) !== newAmount) {
      customInput.value = newAmount;
    }
    if (slider && Number(slider.value) !== newAmount) {
      slider.value = newAmount;
    }

    // Actualizar botones rápidos activos
    quickBtns.forEach(btn => {
      if (Number(btn.dataset.val) === newAmount) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Evento Input numérico
  if (customInput) {
    customInput.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      if (!isNaN(val) && val > 0) {
        updateCalculations(val);
      }
    });
  }

  // Evento Slider
  if (slider) {
    slider.addEventListener('input', (e) => {
      updateCalculations(Number(e.target.value));
    });
  }

  // Botones Rápidos
  quickBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = Number(btn.dataset.val);
      updateCalculations(val);
    });
  });

  // Frecuencia
  freqBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      freqBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentDonationData.frequency = btn.dataset.freq;
      updateCalculations(currentDonationData.amount);
    });
  });

  // Botón Concretar Aporte
  if (btnConcretar) {
    btnConcretar.addEventListener('click', () => {
      openSembradorModal();
    });
  }

  // Inicializar con valor por defecto
  updateCalculations(100000);
  initSembradorModalHandlers();
}

function openSembradorModal(customPackageName) {
  const modal = document.getElementById('modal-sembrador');
  if (!modal) return;

  const pkgName = customPackageName || currentDonationData.packageName;
  const isMonthly = currentDonationData.frequency === 'monthly';

  const modalPkg = document.getElementById('modal-package-name');
  const modalAmt = document.getElementById('modal-amount-display');
  const modalDaily = document.getElementById('modal-daily-display');
  const modalImpact = document.getElementById('modal-impact-display');
  const waBtn = document.getElementById('modal-whatsapp-action');

  if (modalPkg) modalPkg.textContent = pkgName;
  if (modalAmt) modalAmt.textContent = '$' + currentDonationData.amount.toLocaleString('es-CO') + ' COP' + (isMonthly ? ' / mes' : ' (único)');
  if (modalDaily) modalDaily.textContent = '$' + currentDonationData.dailyCost.toLocaleString('es-CO') + ' COP' + (isMonthly ? ' / día' : '');
  if (modalImpact) modalImpact.textContent = `${currentDonationData.impactMeals} platos de comida en el comedor infantil para ${currentDonationData.impactKids}`;

  // Enlace directo de WhatsApp con mensaje personalizado
  if (waBtn) {
    const textMsg = `Hola Fundación En La Casa de Papá, deseo unirme como *Sembrador de Vida*. Mi deseo es apoyar con el paquete *${pkgName}*, aportando *$${currentDonationData.amount.toLocaleString('es-CO')} COP* ${isMonthly ? 'mensuales' : 'en donación única'} (equivale a solo *$${currentDonationData.dailyCost.toLocaleString('es-CO')}/día*). ¿Cuáles son los números de cuenta para realizar mi aporte?`;
    waBtn.href = `https://wa.me/573105693286?text=${encodeURIComponent(textMsg)}`;
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function initSembradorModalHandlers() {
  const modal = document.getElementById('modal-sembrador');
  const closeBtn = document.getElementById('modal-sembrador-close');
  if (!modal) return;

  function closeModal() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}

function initSemillasPackageButtons() {
  const packageBtns = document.querySelectorAll('.select-package-btn');
  if (!packageBtns.length) return;

  packageBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const defaultAmt = Number(btn.dataset.default) || 100000;
      const pkgName = btn.dataset.name || 'Semillita de Nutrición';

      const customInput = document.getElementById('custom-amount-input');
      const slider = document.getElementById('amount-slider');

      if (customInput) customInput.value = defaultAmt;
      if (slider) slider.value = defaultAmt;

      // Disparar evento para actualizar cálculos
      if (customInput) {
        customInput.dispatchEvent(new Event('input'));
      }

      // Si existe el modal de Sembrador, abrirlo de inmediato
      openSembradorModal(pkgName);
    });
  });
}

/* ==========================================================================
   ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
   ========================================================================== */
function initFaqAccordion() {
  const faqQuestions = document.querySelectorAll('.faq-question');
  if (!faqQuestions.length) return;

  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answer = btn.nextElementSibling;

      // Cerrar otros
      faqQuestions.forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          if (otherBtn.nextElementSibling) {
            otherBtn.nextElementSibling.classList.remove('show');
          }
        }
      });

      // Alternar actual
      btn.setAttribute('aria-expanded', !isExpanded);
      if (answer) {
        answer.classList.toggle('show', !isExpanded);
      }
    });
  });
}
