'use client'

import {
  dateFnsLocalizer,
  Event as RBCEvent,
  CalendarProps,
  View,
} from 'react-big-calendar'
import {
  format,
  parse,
  startOfWeek,
  getDay,
} from 'date-fns'

import { ptBR } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import dynamic from 'next/dynamic'
import React, { useState } from 'react'
import { formatWithOptions } from 'date-fns/fp'

// Tipagem do evento
export interface Evento extends RBCEvent {
  id: number
  title: string
  start: Date
  end: Date
  prioridade: string
}

// Carrega o calendário sem SSR (para evitar problemas no Next.js)
const Calendar = dynamic<CalendarProps<Evento>>(
  () =>
    import('react-big-calendar').then(
      (mod) => mod.Calendar as React.ComponentType<CalendarProps<Evento>>
    ),
  { ssr: false }
)

// Localização
const locales = {
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
})

// Capitaliza só a primeira letra
const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1)

const formats = {
  monthHeaderFormat: (date: Date) =>
  capitalize(formatWithOptions({ locale: ptBR }, 'MMMM yyyy')(date)),
}

interface CalendarioProps {
  eventos: Evento[]
  onEventoClick?: (evento: Evento) => void
}

export const Calendario: React.FC<CalendarioProps> = ({
  eventos,
  onEventoClick,
}) => {
  const [view, setView] = useState<View>('month')
  const [currentDate, setCurrentDate] = useState<Date>(new Date())

  // Estilo por prioridade
  const eventStyleGetter = (event: Evento) => {
    let backgroundColor = '#3174ad'
    if (event.prioridade === 'Alta') backgroundColor = '#e53935'
    if (event.prioridade === 'Média') backgroundColor = '#fb8c00'
    if (event.prioridade === 'Baixa') backgroundColor = '#43a047'

    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '6px',
        padding: '2px 6px',
      },
    }
  }

  return (
    <div style={{ height: '90vh' }}>
      <Calendar
        localizer={localizer}
        events={eventos}
        startAccessor="start"
        endAccessor="end"
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onEventoClick}
        style={{ height: '100%' }}
        view={view}
        onView={setView}
        date={currentDate}
        onNavigate={setCurrentDate}
        messages={{
          date: 'Data',
          time: 'Hora',
          event: 'Evento',
          allDay: 'Dia todo',
          week: 'Semana',
          work_week: 'Semana útil',
          day: 'Dia',
          month: 'Mês',
          previous: 'Anterior',
          next: 'Próximo',
          yesterday: 'Ontem',
          tomorrow: 'Amanhã',
          today: 'Hoje',
          agenda: 'Agenda',
          noEventsInRange: 'Nenhum evento neste período.',
          showMore: (total) => `+${total} mais`,
        }}
        formats={formats}
      />
    </div>
  )
}
