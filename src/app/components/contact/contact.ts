import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule, NgForm } from '@angular/forms';

/*
  Interfaz que define la estructura del formulario de contacto.
  Esto ayuda a mantener orden y claridad en los datos que se manejan.
*/
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

/*
  Interfaz para cada pregunta frecuente.
  Se usa para renderizar la sección FAQ de forma dinámica.
*/
interface FaqItem {
  question: string;
  answer: string;
}

/*
  Interfaz para cada línea del horario de atención.
  Permite separar el día o rango de días y su horario.
*/
interface OfficeHourItem {
  label: string;
  value: string;
}

/*
  Decorador del componente Contact.
  Aquí se define:
  - selector del componente
  - imports necesarios
  - plantilla HTML
  - hoja de estilos
*/
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})

/*
  Componente Contact.
  Se encarga de:
  - mostrar información de contacto
  - validar el formulario
  - simular el envío de la solicitud
  - mostrar confirmación al usuario
*/
export class Contact implements OnInit {
  /*
    ActivatedRoute se usa para leer parámetros opcionales
    enviados desde otras vistas, como Product Detail.
  */
  private route = inject(ActivatedRoute);

  /*
    Estado del formulario.
    Aquí se almacenan todos los valores ingresados por el usuario.
  */
  formData: ContactFormData = {
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  };

  /*
    Signal para controlar si el formulario se está enviando.
    Permite mostrar un texto como "Enviando..." en el botón.
  */
  isSubmitting = signal(false);

  /*
    Signal para indicar si el envío fue exitoso.
  */
  submitSuccess = signal(false);

  /*
  Signal para el título principal de confirmación.
*/
successTitle = signal('');

/*
  Signal para el texto secundario de confirmación.
*/
successMessage = signal('');

  /*
    Signal para mostrar un contexto adicional si el usuario
    llegó desde otra vista preguntando por un producto específico.
  */
  contactContext = signal('');

  /*
    Horario de atención visible en la tarjeta informativa.
    Se deja en un arreglo para que sea más fácil de actualizar.
  */
  officeHours: OfficeHourItem[] = [
    { label: 'Lunes - Viernes', value: ' 9:00 a.m - 6:00 p.m' },
    { label: 'Sábado', value: ' 10:00 a.m - 2:00 p.m' },
    { label: 'Domingo', value: ' Cerrado' }
  ];

  /*
    Preguntas frecuentes que se mostrarán debajo del formulario.
    Se renderizan de forma dinámica con @for.
  */
  faqs: FaqItem[] = [
    {
      question: '¿Hacen envíos a todo el país?',
      answer:
        'Sí, realizamos envíos a toda Colombia y ofrecemos envío gratis en compras superiores a $1.000.000.'
    },
    {
      question: '¿Los productos tienen garantía?',
      answer:
        'Todos nuestros productos cuentan con garantía oficial de la marca.'
    },
    {
      question: '¿Puedo ver los productos en tienda física?',
      answer:
        'Por el momento operamos de forma digital, pero seguimos ampliando nuestra atención y cobertura.'
    },
    {
      question: '¿Aceptan pagos en efectivo?',
      answer:
        'Aceptamos múltiples métodos de pago incluyendo tarjetas, transferencias y otros medios habilitados al momento de la compra.'
    }
  ];

  /*
    Método del ciclo de vida inicial.
    Aquí leemos parámetros opcionales de la URL.
    Por ejemplo:
    /contact?product=Samsung Galaxy S26 Ultra
  */
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const product = params['product'];

      if (product) {
        this.contactContext.set(`Consulta relacionada con: ${product}`);

        /*
          Si el asunto está vacío, lo autocompletamos
          para mejorar la experiencia del usuario.
        */
        if (!this.formData.subject) {
          this.formData.subject = `Consulta sobre ${product}`;
        }

        /*
          Si el mensaje está vacío, dejamos una guía inicial.
        */
        if (!this.formData.message) {
          this.formData.message =
            `Hola, me gustaría recibir más información sobre el producto ${product}.`;
        }
      }
    });
  }

  /*
    Método que procesa el envío del formulario.
    Recibe el formulario como parámetro para validar
    y controlar el estado de cada campo.
  */
  submitForm(form: NgForm): void {
    /*
      Si el formulario es inválido,
      marcamos todos los campos como tocados
      para mostrar los mensajes de validación.
    */
    if (form.invalid) {
      for (const controlName in form.controls) {
        form.controls[controlName].markAsTouched();
      }
      return;
    }

    /*
      Activamos el estado de envío.
    */
    this.isSubmitting.set(true);
    this.submitSuccess.set(false);
    this.successTitle.set('');
    this.successMessage.set('');

    /*
      Simulación de envío.
      Como el proyecto es SPA y no estamos conectando backend,
      mostramos una confirmación simulada después de un pequeño tiempo.
    */
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitSuccess.set(true);

/*
  Separamos el mensaje de éxito en dos niveles:
  1. Título principal
  2. Texto complementario
  Esto permite centrar ambos mejor en la vista.
*/
      this.successTitle.set('¡Solicitud Enviada!');
      this.successMessage.set(
      'Pronto uno de nuestros asesores se pondrá en contacto contigo.'
);

      /*
        Reiniciamos el formulario visualmente
        pero conservamos el contexto si viene desde un producto.
      */
      const currentContext = this.contactContext();
      const currentSubject = this.formData.subject;
      const currentMessage = this.formData.message;

      form.resetForm();

      this.formData = {
        name: '',
        email: '',
        phone: '',
        subject: currentContext ? currentSubject : '',
        message: currentContext ? currentMessage : ''
      };
    }, 900);
  }

  /*
    Método para limpiar manualmente el formulario.
    Si existe contexto desde producto, se conserva el asunto y mensaje sugerido.
  */
  resetForm(form: NgForm): void {
    const currentContext = this.contactContext();
    const currentSubject = currentContext ? this.formData.subject : '';
    const currentMessage = currentContext ? this.formData.message : '';

    form.resetForm();

    this.formData = {
      name: '',
      email: '',
      phone: '',
      subject: currentSubject,
      message: currentMessage
    };

    this.submitSuccess.set(false);
    this.successTitle.set('');
    this.successMessage.set('');
  }
}