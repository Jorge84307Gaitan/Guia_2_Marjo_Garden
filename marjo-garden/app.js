let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
const cartCount = document.getElementById('cartCount');
const btnAgregar = document.querySelectorAll('.btn-agregar');
const btnVerCarrito = document.getElementById('verCarrito');

const actualizarContador = () => {
  cartCount.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  localStorage.setItem('carrito', JSON.stringify(carrito));

  if (hayProductoCantidadAlta()) {
    Swal.fire('Aviso', 'Hay productos con más de 5 unidades en el carrito.', 'info');
  }
};

const hayProductoCantidadAlta = () => {
  for (let i = 0; i < carrito.length; i++) {
    if (carrito[i].cantidad > 5) {
      return true;
    }
  }
  return false;
};

actualizarContador();

const agregarAlCarrito = (nombre, precio) => {
  Swal.fire({
    title: 'Ingresa tu edad',
    input: 'number',
    inputLabel: 'Debes ser mayor de edad para comprar',
    inputPlaceholder: 'Edad',
    inputAttributes: { min: 1, max: 120, step: 1 },
    showCancelButton: true,
    confirmButtonText: 'Continuar',
    cancelButtonText: 'Cancelar',
    preConfirm: edad => {
      if (!edad || isNaN(edad)) return Swal.showValidationMessage('Edad inválida');
      if (parseInt(edad) < 18) return Swal.showValidationMessage('Debes ser mayor de edad para comprar');
      return edad;
    }
  }).then(result => {
    if (result.isConfirmed) {
      const index = carrito.findIndex(p => p.producto === nombre);
      if (index !== -1) carrito[index].cantidad++;
      else carrito.push({ producto: nombre, precio, cantidad: 1 });

      actualizarContador();
      Swal.fire('¡Agregado!', `${nombre} se agregó al carrito.`, 'success');
    } else {
      Swal.fire('Cancelado', 'No se agregó el producto.', 'info');
    }
  });
};

btnAgregar.forEach(btn => {
  btn.addEventListener('click', () => {
    agregarAlCarrito(btn.dataset.producto, Number(btn.dataset.precio));
  });
});

const mostrarCarrito = () => {
  if (!carrito.length) {
    return Swal.fire('Carrito vacío', 'No tienes productos en el carrito.', 'info');
  }

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const html = `
    <ul style="list-style:none; padding:0; max-height:300px; overflow-y:auto;">
      ${carrito.map((item, i) => `
        <li style="margin-bottom:15px; padding:10px; border-radius:8px; background: #f5f5f5; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <strong style="font-size:1.1em;">${item.producto}</strong><br>
          Cantidad: <span style="font-weight:600;">${item.cantidad}</span><br>
          Precio unitario: <span style="color:#27ae60;">$${item.precio.toFixed(2)}</span><br>
          Subtotal: <span style="font-weight:700;">$${(item.precio * item.cantidad).toFixed(2)}</span><br>
          <button onclick="eliminarProducto(${i})" 
                  style="margin-top:8px; padding:6px 12px; border:none; border-radius:5px; background:#e74c3c; color:#fff; cursor:pointer; transition: background-color 0.3s;">
            Eliminar
          </button>
        </li>
      `).join('')}
    </ul>
    <p style="font-size:1.2em; font-weight:bold; margin-top:15px;">Total: $${total.toFixed(2)}</p>
    <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
      <button onclick="vaciarCarrito()" 
              style="padding:10px 18px; border:none; border-radius:6px; background:#f39c12; color:#fff; font-weight:bold; cursor:pointer; transition: background-color 0.3s;">
        Vaciar carrito
      </button>
      <button onclick="confirmarCompra()" 
              style="padding:10px 18px; border:none; border-radius:6px; background:#27ae60; color:#fff; font-weight:bold; cursor:pointer; transition: background-color 0.3s;">
        Confirmar compra
      </button>
    </div>
  `;

  Swal.fire({
    title: 'Tu Carrito',
    html,
    showCloseButton: true,
    showConfirmButton: false,
    width: '600px',
    customClass: {
      popup: 'custom-swal-popup'
    }
  });
};

const eliminarProducto = i => {
  carrito.splice(i, 1);
  actualizarContador();
  mostrarCarrito();
};

const vaciarCarrito = () => {
  carrito = [];
  actualizarContador();
  Swal.fire('Carrito vacío', 'Todos los productos han sido eliminados.', 'success');
  mostrarCarrito();
};

const confirmarCompra = () => {
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const resumen = carrito.map(p => `${p.producto} x${p.cantidad} = $${p.precio * p.cantidad}`).join('<br>');

  Swal.fire({
    title: 'Confirmar compra',
    html: `${resumen}<br><hr><strong>Total: $${total}</strong>`,
    showCancelButton: true,
    confirmButtonText: 'Confirmar',
    cancelButtonText: 'Cancelar'
  }).then(result => {
    if (result.isConfirmed) {
      carrito = [];
      actualizarContador();
      Swal.fire('¡Compra realizada!', 'Gracias por tu compra.', 'success');
    }
  });
};

const contactForm = document.getElementById('contactForm');
contactForm?.addEventListener('submit', e => {
  e.preventDefault();
  const { nombre, email, fecha, mensaje } = e.target;
  if ([nombre.value, email.value, fecha.value, mensaje.value].some(v => !v.trim())) {
    return Swal.fire('Campos incompletos', 'Por favor, completa todos los campos.', 'warning');
  }
  if (!validarEmail(email.value)) {
    return Swal.fire('Correo inválido', 'Por favor, ingresa un correo válido.', 'error');
  }
  Swal.fire({
    title: `¡Gracias, ${nombre.value}!`,
    text: `Tu mensaje ha sido enviado correctamente. Nos comunicaremos contigo antes del ${fecha.value}.`,
    icon: 'success'
  });
  e.target.reset();
});

const validarEmail = email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

btnVerCarrito?.addEventListener('click', mostrarCarrito);

window.eliminarProducto = eliminarProducto;
window.vaciarCarrito = vaciarCarrito;
window.confirmarCompra = confirmarCompra;
