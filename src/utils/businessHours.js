export function estabelecimentoAberto() {
  const agora = new Date();

  const diaSemana = agora.getDay(); // 0=Domingo ... 6=Sábado
  const hora = agora.getHours();
  const minuto = agora.getMinutes();

  // Formata a data atual para o padrão 'YYYY-MM-DD' para conferir os feriados
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate).padStart(2, '0'); // Correção do método getDate
  const dataAtualString = `${ano}-${mes}-${String(agora.getDate()).padStart(2, '0')}`;

  // Lista de feriados nacionais fixos e principais datas comemorativas (você pode adicionar mais se precisar)
  const feriados = [
    `${ano}-01-01`, // Confraternização Universal
    `${ano}-04-21`, // Tiradentes
    `${ano}-05-01`, // Dia do Trabalho
    `${ano}-09-07`, // Independência do Brasil
    `${ano}-10-12`, // Nossa Senhora Aparecida
    `${ano}-11-02`, // Finados
    `${ano}-11-15`, // Proclamação da República
    `${ano}-11-20`, // Consciência Negra
    `${ano}-12-25`, // Natal
  ];

  // Se for feriado, bloqueia automaticamente
  if (feriados.includes(dataAtualString)) {
    return false;
  }

  // Fechado sábado e domingo (caso queira testar no fim de semana também, basta comentar esta linha temporariamente)
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }

  const horarioAtual = hora * 60 + minuto;

  const abertura = 7 * 60;          // 07:00
  const fechamento = 23 * 60 + 30; // 23:30 (Alterado temporariamente para seus testes)

  return horarioAtual >= abertura && horarioAtual <= fechamento;
}