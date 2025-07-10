import { useState } from 'react';

export const useAgendaForm = () => {
  const [showAgendaForm, setShowAgendaForm] = useState(false);
  const [selectedClienteForAgenda, setSelectedClienteForAgenda] = useState<number | null>(null);
  const [selectedConsultorForAgenda, setSelectedConsultorForAgenda] = useState<number | null>(null);

  const openAgendaForm = (clienteId: number, consultorId: number) => {
    setSelectedClienteForAgenda(clienteId);
    setSelectedConsultorForAgenda(consultorId);
    setShowAgendaForm(true);
  };

  const closeAgendaForm = () => {
    setShowAgendaForm(false);
    setSelectedClienteForAgenda(null);
    setSelectedConsultorForAgenda(null);
  };

  return {
    showAgendaForm,
    selectedClienteForAgenda,
    selectedConsultorForAgenda,
    openAgendaForm,
    closeAgendaForm
  };
};