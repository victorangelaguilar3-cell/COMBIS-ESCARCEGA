let asientosCombi = []; // Array para manejar el estado de los asientos (ocupado/libre)
let viajeSeleccionado = {}; // Almacena detalles de la corrida elegida
const MAX_ASIENTOS = 15; // Capacidad típica de una combi

// --- 1. MOSTRAR RESULTADOS ---
function mostrarResultados() {
    const destino = document.getElementById('destino').value;
    const fecha = document.getElementById('fecha').value;
    
    // Ocultar otras secciones
    document.getElementById('reserva-asientos').style.display = 'none';
    document.getElementById('checkout').style.display = 'none';

    // Mostrar resultados
    const resultadosSection = document.getElementById('resultados');
    resultadosSection.style.display = 'block';
    document.getElementById('ruta-destino').textContent = destino;

    const resultados = [
        { hora: '06:00 AM', llegada: '07:30 AM', servicio: 'Directo', precio: 70, id: 1 },
        { hora: '07:30 AM', llegada: '09:15 AM', servicio: 'Intermedio', precio: 70, id: 2 },
        { hora: '09:00 AM', llegada: '10:30 AM', servicio: 'Directo', precio: 70, id: 3 },
        { hora: '10:30 AM', llegada: '12:15 PM', servicio: 'Intermedio', precio: 70, id: 4 },
    ];

    let html = `
        <div class="resultado-item">
            <div>Salida</div>
            <div>Llegada</div>
            <div>Servicio</div>
            <div>Precio</div>
            <div>Acción</div>
        </div>
    `;

    resultados.forEach(viaje => {
        // Simular asientos disponibles
        const asientosDisp = Math.floor(Math.random() * (MAX_ASIENTOS - 1) + 1);
        
        html += `
            <div class="resultado-item">
                <div><strong>${viaje.hora}</strong></div>
                <div>${viaje.llegada}</div>
                <div>${viaje.servicio} (${asientosDisp} disp.)</div>
                <div>$${viaje.precio} MXN</div>
                <div><button data-id="${viaje.id}" data-hora="${viaje.hora}" onclick="seleccionarViaje(event)">Elegir</button></div>
            </div>
        `;
    });

    document.getElementById('tabla-resultados').innerHTML = html;
}

// --- 2. SELECCIONAR VIAJE Y PASAR A ASIENTOS ---
function seleccionarViaje(event) {
    const boton = event.target;
    const id = boton.getAttribute('data-id');
    const hora = boton.getAttribute('data-hora');
    const destino = document.getElementById('destino').value;

    viajeSeleccionado = {
        id: id,
        hora: hora,
        destino: destino,
        precio: 70, // Precio fijo por simplificación
        seleccionados: []
    };
    
    // Actualizar detalles del viaje
    document.getElementById('detalles-viaje').innerHTML = `
        <p>Ruta: <strong>Escárcega a ${destino}</strong></p>
        <p>Salida: <strong>${hora}</strong></p>
    `;

    document.getElementById('resultados').style.display = 'none';
    document.getElementById('reserva-asientos').style.display = 'block';
    document.getElementById('checkout').style.display = 'none';
    
    inicializarAsientos();
}

// --- 3. GESTIÓN DE ASIENTOS ---
function inicializarAsientos() {
    // 15 asientos: 1 al lado del conductor + 14 en cabina (7 pares)
    asientosCombi = []; 
    const pasajerosDeseados = parseInt(document.getElementById('pasajeros').value);

    // Creamos el estado inicial de los asientos
    for (let i = 1; i <= MAX_ASIENTOS; i++) {
        // Simular que algunos asientos están ocupados (ej. 30% de probabilidad)
        const ocupado = i > 1 && Math.random() < 0.3; // El asiento 1 (al lado del conductor) puede estar ocupado o libre
        asientosCombi.push({
            numero: i,
            ocupado: ocupado,
            seleccionado: false
        });
    }

    renderizarAsientos(pasajerosDeseados);
}

function renderizarAsientos(maxSeleccion) {
    const contenedor = document.getElementById('contenedor-asientos');
    contenedor.innerHTML = '';
    
    // Vaciar selección previa
    viajeSeleccionado.seleccionados = [];
    document.getElementById('asientos-seleccionados').textContent = '0';
    document.getElementById('btn-finalizar').disabled = true;

    asientosCombi.forEach(asiento => {
        const div = document.createElement('div');
        div.className = 'asiento';
        div.textContent = asiento.numero;
        div.setAttribute('data-num', asiento.numero);

        if (asiento.ocupado) {
            div.classList.add('ocupado');
        } else if (asiento.seleccionado) {
            div.classList.add('seleccionado');
        }

        if (!asiento.ocupado) {
            div.onclick = () => toggleAsiento(asiento.numero, maxSeleccion);
        }

        contenedor.appendChild(div);
    });
}

function toggleAsiento(numeroAsiento, maxSeleccion) {
    const asientoIndex = asientosCombi.findIndex(a => a.numero === numeroAsiento);
    const asientoDOM = document.querySelector(`.asiento[data-num="${numeroAsiento}"]`);

    if (asientoIndex === -1 || asientosCombi[asientoIndex].ocupado) return;

    if (asientosCombi[asientoIndex].seleccionado) {
        // Deseleccionar
        asientosCombi[asientoIndex].seleccionado = false;
        asientoDOM.classList.remove('seleccionado');
        viajeSeleccionado.seleccionados = viajeSeleccionado.seleccionados.filter(n => n !== numeroAsiento);
    } else {
        // Seleccionar, si no excede el límite
        if (viajeSeleccionado.seleccionados.length < maxSeleccion) {
            asientosCombi[asientoIndex].seleccionado = true;
            asientoDOM.classList.add('seleccionado');
            viajeSeleccionado.seleccionados.push(numeroAsiento);
        } else {
            alert(`Solo puedes seleccionar ${maxSeleccion} asiento(s) según tu búsqueda inicial.`);
        }
    }

    actualizarSeleccionUI();
}

function actualizarSeleccionUI() {
    const numSeleccionados = viajeSeleccionado.seleccionados.length;
    document.getElementById('asientos-seleccionados').textContent = numSeleccionados;
    
    const precioTotal = numSeleccionados * viajeSeleccionado.precio;
    const btnFinalizar = document.getElementById('btn-finalizar');
    btnFinalizar.textContent = `Finalizar Selección ($${precioTotal} MXN)`;
    btnFinalizar.disabled = numSeleccionados === 0;
}


// --- 4. CHECKOUT ---
function mostrarCheckout() {
    document.getElementById('reserva-asientos').style.display = 'none';
    document.getElementById('checkout').style.display = 'block';

    const asientosStr = viajeSeleccionado.seleccionados.sort((a, b) => a - b).join(', ');
    const precioFinal = viajeSeleccionado.seleccionados.length * viajeSeleccionado.precio;

    document.getElementById('chk-ruta').textContent = `Escárcega a ${viajeSeleccionado.destino}`;
    document.getElementById('chk-salida').textContent = `${viajeSeleccionado.hora}`;
    document.getElementById('chk-asientos').textContent = `${asientosStr} (Total: $${precioFinal} MXN)`;
}