export type ContactChannel = "whatsapp" | "telegram" | "email";

export type EventFeature = {
  label: string;
  tone: "positive" | "negative";
};

export type Event = {
  slug: string;
  title: string;
  dateLabel: string;
  neighborhood: string;
  excerpt: string;
  description: string;
  tags: string[];
  features: EventFeature[];
  location: string;
  reservationNote: string;
};

const events: Event[] = [
  {
    slug: "la-mariposa",
    title: "La Mariposa",
    dateLabel: "Jueves 13 de junio",
    neighborhood: "Almagro",
    excerpt: "Milonga relajada con tanda larga y pista abierta hasta tarde.",
    description:
      "Una noche pensada para bailar sin apuro, con seleccion musical clasica, piso amplio y mesas cerca de la pista para quedarse despues del ultimo tango.",
    tags: ["tradicional", "orquesta", "jueves"],
    features: [
      { label: "Drinks & food", tone: "positive" },
      { label: "Dance lesson", tone: "negative" },
      { label: "Solo tango show", tone: "positive" },
      { label: "Live orchestra", tone: "positive" },
    ],
    location: "Guardia Vieja 4049, CABA",
    reservationNote:
      "Reservas sujetas a confirmacion manual. Vamos a contactarte por el canal que elijas.",
  },
  {
    slug: "milonga-del-sur",
    title: "Milonga del Sur",
    dateLabel: "Viernes 14 de junio",
    neighborhood: "San Telmo",
    excerpt: "DJ invitada, clase previa y barra sencilla en un salon historico.",
    description:
      "La propuesta mezcla una primera parte de practica guiada con una milonga mas intensa desde las 22.30. Ideal para quienes quieren socializar y bailar variado.",
    tags: ["clase", "viernes", "social"],
    features: [
      { label: "Drinks & food", tone: "positive" },
      { label: "Dance lesson", tone: "positive" },
      { label: "Solo tango show", tone: "negative" },
      { label: "Live orchestra", tone: "negative" },
    ],
    location: "Estados Unidos 480, CABA",
    reservationNote:
      "La lista se cierra dos horas antes del evento. Si reservas tarde, la confirmacion puede demorar.",
  },
  {
    slug: "orquesta-en-san-telmo",
    title: "Orquesta en San Telmo",
    dateLabel: "Sabado 15 de junio",
    neighborhood: "San Telmo",
    excerpt: "Edicion especial con musica en vivo y cupos limitados para mesas.",
    description:
      "Una fecha de perfil mas escenico, con orquesta en vivo en el segundo bloque y una pista que combina milongueros habituales con publico nuevo.",
    tags: ["en vivo", "sabado", "especial"],
    features: [
      { label: "Drinks & food", tone: "positive" },
      { label: "Dance lesson", tone: "negative" },
      { label: "Solo tango show", tone: "positive" },
      { label: "Live orchestra", tone: "positive" },
    ],
    location: "Bolivar 970, CABA",
    reservationNote:
      "Las mesas se asignan por orden de confirmacion y cantidad de asistentes.",
  },
  {
    slug: "domingo-en-almagro",
    title: "Domingo en Almagro",
    dateLabel: "Domingo 16 de junio",
    neighborhood: "Almagro",
    excerpt: "Plan de tarde con practica, cafe y una pista amable para cerrar la semana.",
    description:
      "Un encuentro mas luminoso y distendido, ideal para bailar temprano, practicar secuencias y quedarse charlando despues de la ultima tanda.",
    tags: ["domingo", "practica", "tarde"],
    features: [
      { label: "Drinks & food", tone: "positive" },
      { label: "Dance lesson", tone: "positive" },
      { label: "Solo tango show", tone: "negative" },
      { label: "Live orchestra", tone: "negative" },
    ],
    location: "Sarmiento 3641, CABA",
    reservationNote:
      "La reserva asegura ingreso hasta treinta minutos despues del horario de apertura.",
  },
];

export function getAllEvents() {
  return events;
}

export function getFeaturedEvents() {
  return events.slice(0, 3);
}

export function getEventBySlug(slug: string) {
  return events.find((event) => event.slug === slug);
}