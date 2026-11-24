export const QUIZ_QUESTIONS = [
  {
    q: 'Qual é a função principal do sistema operacional?',
    options: [
      'Gerenciar os recursos do computador',
      'Exibir apenas imagens',
      'Substituir o teclado',
    ],
    correct: 0,
    why: 'Correto. O sistema operacional coordena o processador, a memória, os arquivos e os dispositivos.',
  },
  {
    q: 'Na alocação contígua, como os blocos de um arquivo são guardados?',
    options: [
      'Em sequência, lado a lado',
      'Em qualquer lugar, sem ligação',
      'Em uma lista de nomes',
    ],
    correct: 0,
    why: 'Correto. Na alocação contígua, os blocos ocupam posições consecutivas no disco.',
  },
  {
    q: 'Na alocação indexada, onde ficam os endereços dos blocos?',
    options: ['Em um bloco de índices', 'No nome do arquivo', 'No teclado'],
    correct: 0,
    why: 'Correto. O bloco de índices registra os endereços de cada parte do arquivo.',
  },
  {
    q: 'O que é um bloco de disco?',
    options: [
      'Uma unidade de espaço usada para guardar partes de arquivos',
      'Um programa antivírus',
      'Um tipo de teclado',
    ],
    correct: 0,
    why: 'Correto. Arquivos são divididos em blocos para serem armazenados no disco.',
  },
  {
    q: 'Qual estratégia sofre mais com fragmentação externa?',
    options: ['Contígua', 'Encadeada', 'Indexada'],
    correct: 0,
    why: 'Correto. A contígua precisa de espaço contínuo; buracos pequenos dificultam novos arquivos.',
  },
  {
    q: 'Na alocação encadeada, como o sistema acha o próximo bloco?',
    options: [
      'Seguindo o ponteiro guardado no bloco atual',
      'Lendo o nome do arquivo',
      'Sorteando um número',
    ],
    correct: 0,
    why: 'Correto. Cada bloco aponta para o próximo da cadeia.',
  },
  {
    q: 'Qual vantagem da alocação indexada?',
    options: [
      'Permite acesso direto a qualquer bloco do arquivo',
      'Elimina a necessidade de disco',
      'Remove o processador',
    ],
    correct: 0,
    why: 'Correto. Com a tabela de índices, o sistema salta direto para o bloco desejado.',
  },
  {
    q: 'O que a memória principal (RAM) faz?',
    options: [
      'Guarda, por pouco tempo, dados que os programas estão usando',
      'Imprime documentos',
      'Substitui o mouse',
    ],
    correct: 0,
    why: 'Correto. A RAM é armazenamento temporário de trabalho.',
  },
  {
    q: 'Por que a alocação encadeada pode ser mais lenta?',
    options: [
      'Porque o acesso precisa percorrer a cadeia de ponteiros',
      'Porque usa menos blocos',
      'Porque não salva arquivos',
    ],
    correct: 0,
    why: 'Correto. Para chegar ao fim do arquivo, o sistema segue bloco por bloco.',
  },
  {
    q: 'O que significa “ocupar o disco” na simulação?',
    options: [
      'Reservar blocos para guardar partes de um arquivo',
      'Desligar o computador',
      'Apagar o sistema operacional',
    ],
    correct: 0,
    why: 'Correto. Cada arquivo ocupa um ou mais blocos do disco virtual.',
  },
  {
    q: 'Qual estratégia costuma ter o acesso sequencial mais simples?',
    options: ['Contígua', 'Encadeada', 'Nenhuma delas'],
    correct: 0,
    why: 'Correto. Com blocos lado a lado, a leitura sequencial é direta e rápida.',
  },
  {
    q: 'O que o sistema operacional faz com teclado, tela e programas?',
    options: [
      'Coordena para que trabalhem juntos',
      'Impede que sejam usados',
      'Troca seus nomes automaticamente',
    ],
    correct: 0,
    why: 'Correto. Ele gerencia dispositivos e programas de forma coordenada.',
  },
  {
    q: 'Se não houver espaço contínuo livre, qual estratégia tem mais dificuldade?',
    options: ['Contígua', 'Encadeada', 'Indexada'],
    correct: 0,
    why: 'Correto. A contígua exige uma sequência livre do tamanho do arquivo.',
  },
]
