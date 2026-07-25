export function estabelecimentoAberto() {
  const agora = new Date();

  const diaSemana = agora.getDay(); // 0=Domingo ... 6=Sábado
  const hora = agora.getHours();
  const minuto = agora.getMinutes();

  // Fechado sábado e domingo
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }

  const horarioAtual = hora * 60 + minuto;

  const abertura = 7 * 60;      // 07:00
  const fechamento = 16 * 60 + 10; // 16:10

  return horarioAtual >= abertura && horarioAtual <= fechamento;
}