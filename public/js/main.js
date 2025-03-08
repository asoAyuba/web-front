document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('.nav');
  
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  });

  document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.contact-form');
    if (form) {
      form.addEventListener('submit', function(e) {
        // Reiniciamos mensajes y clases de validación
        const fields = form.querySelectorAll('input[required], textarea[required], select[required]');
        let valid = true;
        
        fields.forEach(function(field) {
          // Limpiamos clases y mensaje
          field.classList.remove('error', 'valid');
          let errorSpan = field.nextElementSibling;
          if (errorSpan && errorSpan.classList.contains('error-message')) {
            errorSpan.textContent = '';
          }
          
          // Si el campo está vacío, mostramos error
          if (!field.value.trim()) {
            valid = false;
            field.classList.add('error');
            if (errorSpan && errorSpan.classList.contains('error-message')) {
              errorSpan.textContent = 'campo obligatorio';
            }
          } else {
            field.classList.add('valid');
          }
        });
        
        // Si no es válido, prevenimos el envío del formulario
        if (!valid) {
          e.preventDefault();
        }
      });
    }
  });
  