/* O protótipo carrega este arquivo diretamente para funcionar também quando index.html é aberto sem um servidor. */
window.WORLD_DATA = {
  country: {
    id: 'bra', name: 'Brasil', capital: 'Brasília', currency: 'Real brasileiro',
    population: '214 milhões', footballCulture: 'Muito alta', mediaIntensity: 'Alta',
    note: 'A geografia real fornece o contexto. Clubes, pessoas, competições e toda a história do futebol neste jogo são fictícios.'
  },
  regions: [
    { name: 'Norte', footballAccess: 'Em desenvolvimento', scouting: 'Limitado', storyWeight: 'viagens e futebol comunitário' },
    { name: 'Nordeste', footballAccess: 'Forte', scouting: 'Crescente', storyWeight: 'rivalidades regionais e redes familiares' },
    { name: 'Centro-Oeste', footballAccess: 'Crescente', scouting: 'Moderado', storyWeight: 'novas oportunidades e viagens' },
    { name: 'Sudeste', footballAccess: 'Muito forte', scouting: 'Muito alto', storyWeight: 'academias de elite e competição acirrada' },
    { name: 'Sul', footballAccess: 'Forte', scouting: 'Alto', storyWeight: 'academias organizadas e futebol tático' }
  ],
  clubs: [
    { id:'estrela', name:'Estrela do Porto', city:'Porto Claro', region:'Norte', colors:'Azul / âmbar', nickname:'As Estrelas do Rio', rating:68, stats:{gk:9,def:10,mid:11,att:12}, budget:'Modesto', facilities:10, style:'Transições rápidas', history:'Campeão da Copa em 2018; famoso por dar oportunidades a jovens atacantes.' },
    { id:'sol', name:'Atlético do Sol', city:'Vila do Sol', region:'Nordeste', colors:'Vermelho / branco', nickname:'Os Filhos do Sol', rating:72, stats:{gk:10,def:11,mid:12,att:12}, budget:'Estável', facilities:12, style:'Pressão agressiva', history:'Um clube operário com a torcida mais fervorosa e barulhenta da liga.' },
    { id:'mare', name:'Maré Alta FC', city:'Baía Nova', region:'Nordeste', colors:'Verde-mar / preto', nickname:'A Maré', rating:74, stats:{gk:11,def:11,mid:13,att:13}, budget:'Forte', facilities:13, style:'Pontas técnicos', history:'Conquistou dois títulos antigos da Liga Aurora com uma geração de pontas destemidos.' },
    { id:'cerrado', name:'União Cerrado', city:'Campo Central', region:'Centro-Oeste', colors:'Verde / prata', nickname:'A União da Capital', rating:70, stats:{gk:10,def:12,mid:11,att:11}, budget:'Crescente', facilities:11, style:'Atlético e organizado', history:'Um clube jovem que se firmou regularmente na metade de cima da tabela.' },
    { id:'ferro', name:'Ferro Paulista', city:'Santa Augusta', region:'Sudeste', colors:'Chumbo / cobre', nickname:'A Siderúrgica', rating:80, stats:{gk:10,def:11,mid:13,att:14}, budget:'Muito forte', facilities:17, style:'Disciplina tática', history:'Hexacampeão nacional; seus atletas formados na base são conhecidos em todo o país.' },
    { id:'aurora', name:'Aurora Carioca', city:'Monte Azul', region:'Sudeste', colors:'Branco / violeta', nickname:'As Violetas', rating:78, stats:{gk:11,def:11,mid:14,att:15}, budget:'Muito forte', facilities:16, style:'Ginga e posse de bola', history:'Um clube glamoroso cujos craques dominam as manchetes dos principais jornais esportivos.' },
    { id:'serra', name:'Serra Dourada', city:'Ouro Serra', region:'Sudeste', colors:'Dourado / azul-marinho', nickname:'Os Montanheses', rating:76, stats:{gk:12,def:13,mid:13,att:11}, budget:'Forte', facilities:14, style:'Posse paciente', history:'Três títulos de copa e uma sólida reputação no desenvolvimento de meio-campistas inteligentes.' },
    { id:'pioneiros', name:'Pioneiros do Sul', city:'Nova Fronteira', region:'Sul', colors:'Carmesim / creme', nickname:'Os Pioneiros', rating:75, stats:{gk:13,def:14,mid:11,att:11}, budget:'Forte', facilities:14, style:'Resiliência física', history:'Um clube tradicional cujos torcedores valorizam a raça e a coragem acima de tudo.' }
  ],
  recordDefinitions: [
    { id:'season_goals', label:'Mais gols na liga em uma temporada', value:19, holder:'Mateo Varela', year:2024 },
    { id:'season_assists', label:'Mais assistências na liga em uma temporada', value:13, holder:'Caio Nunes', year:2023 },
    { id:'match_goals', label:'Mais gols em uma única partida da liga', value:5, holder:'Davi Monteiro', year:2022 },
    { id:'youngest_scorer', label:'Goleador mais jovem da liga', value:16.17, holder:'Ivo Santana', year:2021, lowerIsBetter:true },
    { id:'club_goals', label:'Maior artilheiro da história do Estrela do Porto', value:116, holder:'Renato Vale', year:2019 }
  ],
  eventTemplates: [
    { id:'coach-video', from:'Técnica Mara', text:'A analista de desempenho enviou vídeos do próximo adversário. Você passa a noite estudando os lances?', effect:'professional' },
    { id:'family-call', from:'Família', text:'Um familiar liga para dizer que assistiu aos seus melhores momentos na TV. O orgulho deles enche você de motivação.', effect:'resilient' },
    { id:'fan-photo', from:'Torcida', text:'Um jovem torcedor pede uma foto na saída do estádio. Um momento simples, mas que as pessoas ao redor notam com carinho.', effect:'followers' },
    { id:'academy-visit', from:'Diretor da Base', text:'Você é convidado para conversar com a categoria sub-13 sobre sua trajetória até o time principal.', effect:'professional' },
    { id:'local-rumour', from:'Imprensa Local', text:'Um repórter pergunta se você já se sente pronto para se transferir para um clube maior. Sua resposta será lembrada.', effect:'flair' },
    { id:'recovery-day', from:'Departamento Médico', text:'O fisioterapeuta recomenda um dia de recuperação leve e descanso antes do próximo compromisso.', effect:'resilient' },
    { id:'old-boots', from:'Roupeiro', text:'Suas chuteiras antigas estão abrindo no solado. O roupeiro tem um par reserva na rouparia, mas que não serve com tanta perfeição.', effect:'resilient' },
    { id:'school-report', from:'Antigo Professor', text:'Seu antigo professor manda uma mensagem perguntando como tem sido a rotina no futebol profissional.', effect:'professional' },
    { id:'training-race', from:'Companheiro de Time', text:'Um colega de equipe desafia você a ficar depois do treino para um duelo de finalizações.', effect:'flair' },
    { id:'scout-notebook', from:'Olheiro', text:'Comentam nos bastidores que um empresário influente foi visto fazendo anotações sobre você no último jogo.', effect:'followers' },
    { id:'supporter-letter', from:'Carta de Torcedor', text:'Chega uma carta escrita à mão de um torcedor dizendo que se inspira na sua história de superação.', effect:'followers' },
    { id:'captain-talk', from:'Capitão da Equipe', text:'O capitão conversa com você sobre como manter a calma e liderar quando o estádio começar a vaiar.', effect:'professional' },
    { id:'bus-delay', from:'Logística do Clube', text:'O ônibus da delegação fica preso no trânsito a caminho do jogo fora de casa. O clima fica tenso.', effect:'resilient' },
    { id:'local-podcast', from:'Podcast Esportivo', text:'Um podcast esportivo local debate acaloradamente se você já deveria ser titular absoluto.', effect:'flair' },
    { id:'neighbourhood-game', from:'Amigo de Infância', text:'Um amigo de infância chama você para assistir ao rachão da galera do bairro depois do treino.', effect:'resilient' },
    { id:'nutrition-note', from:'Nutricionista', text:'A nutricionista esportiva envia um guia personalizado de hidratação e refeição pré-jogo.', effect:'professional' },
    { id:'rainy-session', from:'Relatório de Treino', text:'Uma chuva torrencial transforma o campo de treinamento em um teste de equilíbrio, força e paciência.', effect:'resilient' },
    { id:'goal-clip', from:'Redes Sociais', text:'Um vídeo com um lance seu na última partida viraliza em uma página famosa de futebol no Instagram.', effect:'followers' },
    { id:'derby-warning', from:'Pré-Jogo da Imprensa', text:'Os jornais locais alertam que a próxima partida será pegada e de muita disputa física.', effect:'professional' },
    { id:'sponsor-sample', from:'Loja de Artigos Esportivos', text:'Uma loja esportiva da cidade deixa alguns brindes e acessórios na recepção do clube para você.', effect:'followers' },
    { id:'family-dinner', from:'Família', text:'Um almoço tranquilo em família lembra você do valor de cada centavo conquistado com o futebol.', effect:'resilient' },
    { id:'academy-match', from:'Treinador da Base', text:'Você assiste a uma partida da base e se enxerga no olhar cheio de sonhos de um dos garotos.', effect:'professional' },
    { id:'radio-call', from:'Produtor de Rádio', text:'Um programa esportivo noturno abre votação no WhatsApp perguntando se você deve começar jogando no fim de semana.', effect:'flair' },
    { id:'pitch-inspection', from:'Administração do Gramado', text:'A grama do estádio foi cortada mais alta para o clássico, o que vai deixar a bola mais lenta.', effect:'professional' },
    { id:'quiet-morning', from:'Diário Pessoal', text:'Uma manhã tranquila e silenciosa dá espaço para você refletir sobre a dimensão do jogador que deseja se tornar.', effect:'resilient' }
  ]
};
