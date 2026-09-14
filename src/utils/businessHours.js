export function estabelecimentoAberto() {
  const agora = new Date();

  //const diaSemana = agora.getDay(); // 0=Domingo ... 6=Sábado

  const hora = agora.getHours();
  const minuto = agora.getMinutes();

  // Data atual: YYYY-MM-DD
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');

  const dataAtualString = `${ano}-${mes}-${dia}`;

  // Feriados nacionais fixos
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

  // Feriado
  if (feriados.includes(dataAtualString)) {
    return false;
  }

 /* // Sábado e domingo
  if (diaSemana === 0 || diaSemana === 6) {
    return false;
  }*/

  const horarioAtual = hora * 60 + minuto;

  const abertura = 7 * 60;        // 07:00
  const fechamento = 23 * 60 + 10; // 16:10

  return horarioAtual >= abertura && horarioAtual <= fechamento;
}