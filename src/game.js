(() => {
  const app = document.querySelector('#app');
  const world = window.WORLD_DATA;
  const nameData = window.NAME_DATA || { BR: { femaleForenames: ['Maria'], maleForenames: ['João'], surnames: ['Silva'] } };
  const regions = world.regions.map(r => r.name);
  const clubs = world.clubs.map(c => c.name);
  const clubData = n => world.clubs.find(c => c.name === n);
  const blankTable = () => Object.fromEntries(clubs.map(n => [n, { p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0 }]));

  /* ── Dicionários e Tradução de Atributos e Rótulos ──────────────── */
  const attrLabels = {
    finishing: 'Finalização',
    passing: 'Passe',
    dribbling: 'Drible',
    pace: 'Velocidade',
    composure: 'Frieza',
    workRate: 'Dedicação',
    luck: 'Sorte'
  };
  const attrLabel = k => attrLabels[k] || k;

  const positionLabel = () => ({
    defender: 'Zagueiro',
    midfielder: 'Meio-campista',
    attacker: 'Atacante'
  }[state.position] || 'Indefinido');

  const footLabel = f => ({
    'Right': 'Destro',
    'Left': 'Canhoto',
    'Destro': 'Destro',
    'Canhoto': 'Canhoto'
  }[f] || f);

  const regionDisplay = r => ({
    'North': 'Norte',
    'Northeast': 'Nordeste',
    'Central-West': 'Centro-Oeste',
    'Southeast': 'Sudeste',
    'South': 'Sul',
    'Random': 'Aleatório'
  }[r] || r);

  function buildFixtures() {
    const rot = [...clubs]; const rounds = [];
    for (let r = 0; r < 7; r++) { const p = []; for (let i = 0; i < 4; i++) p.push([rot[i], rot[7-i]]); rounds.push(p); rot.splice(1,0,rot.pop()); }
    return [...rounds, ...rounds.map(ps => ps.map(([h,a]) => [a,h]))];
  }
  function buildSchedule(includePreseason = false) {
    const s = [];
    if (includePreseason) {
      for (let i = 0; i < 5; i++) {
        s.push({ type: 'free', preSeason: true, label: `Pré-temporada Sem ${i+1}` });
      }
    }
    for (let r = 0; r < 14; r++) { s.push({ type:'match', round:r+1, fixtureIndex:r }); if (r===3||r===7||r===11) s.push({ type:'free' }); }
    return s;
  }

  /* ── Renderizador do Avatar SVG ─────────────────────────────────── */
  function renderAvatarSVG(v) {
    const skin = v?.skinTone || '#e0a890';
    const hair = v?.hairColor || '#2b1d0c';
    const facial = v?.facialHair || 'none';
    let facialSvg = '';
    
    if (facial === 'beard') {
      facialSvg = `<path d="M 18 30 C 18 43 42 43 42 30 C 38 41 22 41 18 30 Z" fill="${hair}"/>`;
    } else if (facial === 'stubble') {
      facialSvg = `<path d="M 19 32 Q 30 42 41 32 Q 30 40 19 32 Z" fill="${hair}" opacity="0.4"/>`;
    } else if (facial === 'mustache') {
      facialSvg = `<path d="M 23 31 Q 30 29 37 31 Q 30 34 23 31 Z" fill="${hair}"/>`;
    }

    return `<svg width="70" height="70" viewBox="0 0 60 60" style="background:#e0edf5;border:1px solid #1d629e;border-radius:4px">
      <!-- Pescoço e Ombros -->
      <path d="M 12 58 C 12 42 48 42 48 58 Z" fill="#0d58a6"/>
      <!-- Orelhas -->
      <circle cx="16" cy="28" r="3.5" fill="${skin}"/>
      <circle cx="44" cy="28" r="3.5" fill="${skin}"/>
      <!-- Cabeça -->
      <ellipse cx="30" cy="28" rx="14" ry="16" fill="${skin}"/>
      <!-- Sobrancelhas e Olhos -->
      <path d="M 20 21 Q 23 19 26 21" stroke="${hair}" stroke-width="1.8" fill="none"/>
      <path d="M 34 21 Q 37 19 40 21" stroke="${hair}" stroke-width="1.8" fill="none"/>
      <circle cx="23" cy="25" r="2" fill="#222"/>
      <circle cx="37" cy="25" r="2" fill="#222"/>
      <!-- Sorriso -->
      <path d="M 24 34 Q 30 38 36 34" stroke="#222" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <!-- Cabelo -->
      <path d="M 15 24 C 14 11 46 11 45 24 C 41 15 35 13 30 13 C 25 13 19 15 15 24 Z" fill="${hair}"/>
      ${facialSvg}
    </svg>`;
  }

  /* ── Cenários de Saída / Vida Social (10 Cenários) ───────────────── */
  const goOutScenarios = [
    { title: 'Festa na Área VIP', text: 'Você é convidado para uma casa noturna exclusiva em Porto Claro. Torcedores locais e influenciadores notam sua presença.',
      choices: [
        ['Pagar uma rodada de bebidas para a galera', 'reputação +5, seguidores +150, dinheiro -300', () => { state.reputationScore = Math.min(100, (state.reputationScore||0)+5); state.followers += 150; state.money = Math.max(0, state.money-300); }],
        ['Ficar na sua e conversar sobre tática com um jornalista', 'reputação +8, seguidores +30', () => { state.reputationScore = Math.min(100, (state.reputationScore||0)+8); state.followers += 30; }],
        ['Dar show na pista de dança e postar stories marrentos', 'reputação -6, fama +2, seguidores +300', () => { state.reputationScore = Math.max(-100, (state.reputationScore||0)-6); state.fame += 2; state.followers += 300; }]
      ]
    },
    { title: 'Desafio de Futsal no Bairro', text: 'Garotos do bairro reconhecem você em uma quadra local e convidam para um rachão rápido.',
      choices: [
        ['Jogar com raça e ensinar dribles para as crianças', 'reputação +10, seguidores +200', () => { state.reputationScore = Math.min(100, (state.reputationScore||0)+10); state.followers += 200; }],
        ['Assistir da lateral e distribuir autógrafos', 'reputação +5, seguidores +80', () => { state.reputationScore = Math.min(100, (state.reputationScore||0)+5); state.followers += 80; }],
        ['Apostar R$ 100 na vitória do seu time no rachão', 'dinheiro +100, sorte +1, reputação -4', () => { state.money += 100; state.luck = Math.min(20, state.luck+1); state.reputationScore = Math.max(-100, (state.reputationScore||0)-4); }]
      ]
    },
    { title: 'Lanche na Madrugada', text: 'Você dá uma escapada às 23h para comer em uma lanchonete local. Um torcedor flagra você segurando um x-bacon duplo.',
      choices: [
        ['Tirar uma foto sorridente com o torcedor', 'seguidores +100, reputação -2', () => { state.followers += 100; state.reputationScore = Math.max(-100, (state.reputationScore||0)-2); }],
        ['Pagar o lanche dele para manter discrição', 'dinheiro -50, reputação +3', () => { state.money = Math.max(0, state.money-50); state.reputationScore = Math.min(100, (state.reputationScore||0)+3); }],
        ['Dizer que está apenas abastecendo a máquina para a vitória', 'fama +1, reputação -5', () => { state.fame += 1; state.reputationScore = Math.max(-100, (state.reputationScore||0)-5); }]
      ]
    },
    { title: 'Mutirão de Limpeza na Praia', text: 'Um projeto comunitário está fazendo um mutirão de limpeza na orla da praia pela manhã.',
      choices: [
        ['Trabalhar pesado a manhã toda como voluntário', 'reputação +12, energia -10', () => { state.reputationScore = Math.min(100, (state.reputationScore||0)+12); state.stamina = Math.max(0, state.stamina-10); }],
        ['Levar água e lanches para apoiar os voluntários', 'dinheiro -150, reputação +8, seguidores +100', () => { state.money = Math.max(0, state.money-150); state.reputationScore = Math.min(100, (state.reputationScore||0)+8); state.followers += 100; }],
        ['Fazer uma pose rápida para foto e ir embora', 'seguidores +120, reputação -8', () => { state.followers += 120; state.reputationScore = Math.max(-100, (state.reputationScore||0)-8); }]
      ]
    },
    { title: 'Podcast Esportivo ao Vivo', text: 'Um podcast famoso de futebol da região convida você para uma entrevista transmitida ao vivo.',
      choices: [
        ['Elogiar seus companheiros de equipe e a comissão técnica', 'reputação +10, seguidores +150', () => { state.reputationScore = Math.min(100, (state.reputationScore||0)+10); state.followers += 150; }],
        ['Garantir que o time vai vencer o clássico com gol seu', 'fama +3, reputação -5, confiança +5%', () => { state.fame += 3; state.reputationScore = Math.max(-100, (state.reputationScore||0)-5); state.tacticalBonus = 5; }],
        ['Contar histórias engraçadas dos bastidores da infância', 'seguidores +250, reputação +4', () => { state.followers += 250; state.reputationScore = Math.min(100, (state.reputationScore||0)+4); }]
      ]
    },
    { title: 'Mostra de Relógios de Luxo', text: 'Uma joalheria renomada convida jovens atletas para conhecer modelos exclusivos de relógios.',
      choices: [
        ['Agradecer educadamente e recusar qualquer presente', 'reputação +6', () => { state.reputationScore = Math.min(100, (state.reputationScore||0)+6); }],
        ['Gravar um vídeo patrocinado exibindo o relógio de ouro', 'dinheiro +500, seguidores +200, reputação -5', () => { state.money += 500; state.followers += 200; state.reputationScore = Math.max(-100, (state.reputationScore||0)-5); }],
        ['Comprar um relógio sofisticado de presente para seu pai', 'dinheiro -800, reputação +12, orgulho familiar +1', () => { state.money = Math.max(0, state.money-800); state.reputationScore = Math.min(100, (state.reputationScore||0)+12); }]
      ]
    },
    { title: 'Festa da Torcida Organizada', text: 'A principal torcida organizada do seu clube está comemorando aniversário de fundação.',
      choices: [
        ['Pular na arquibancada e cantar os hinos junto com a galera', 'seguidores +350, reputação +8', () => { state.followers += 350; state.reputationScore = Math.min(100, (state.reputationScore||0)+8); }],
        ['Fazer um discurso emocionado sobre garra e dedicação ao manto', 'reputação +10, fama +1', () => { state.reputationScore = Math.min(100, (state.reputationScore||0)+10); state.fame += 1; }],
        ['Sortear uma camisa oficial usada em jogo para os torcedores', 'seguidores +200, reputação +6', () => { state.followers += 200; state.reputationScore = Math.min(100, (state.reputationScore||0)+6); }]
      ]
    },
    { title: 'Racha de Carros na Cidade', text: 'Você passa por uma avenida deserta onde pilotos locais exibem carros preparados e aceleram.',
      choices: [
        ['Afastar-se imediatamente para não se envolver em confusão', 'reputação +5', () => { state.reputationScore = Math.min(100, (state.reputationScore||0)+5); }],
        ['Assistir às arrancadas de uma distância segura', 'seguidores +100, reputação -4', () => { state.followers += 100; state.reputationScore = Math.max(-100, (state.reputationScore||0)-4); }],
        ['Aceitar uma carona em alta velocidade como passageiro', 'fama +2, sorte +1, reputação -15', () => { state.fame += 2; state.luck = Math.min(20, state.luck+1); state.reputationScore = Math.max(-100, (state.reputationScore||0)-15); }]
      ]
    },
    { title: 'Visita à Peneira de Garotos', text: 'Você visita a escolinha de futebol onde começou para ver a garotada disputando uma peneira.',
      choices: [
        ['Entrar no vestiário e dar uma palavra motivacional aos jovens', 'reputação +10, seguidores +150', () => { state.reputationScore = Math.min(100, (state.reputationScore||0)+10); state.followers += 150; }],
        ['Doar R$ 300 para a compra de bolas e coletes novos', 'dinheiro -300, reputação +15', () => { state.money = Math.max(0, state.money-300); state.reputationScore = Math.min(100, (state.reputationScore||0)+15); }],
        ['Torcer e vibrar do alambrado como um torcedor comum', 'seguidores +180, reputação +5', () => { state.followers += 180; state.reputationScore = Math.min(100, (state.reputationScore||0)+5); }]
      ]
    },
    { title: 'Campanha de Moda Streetwear', text: 'Uma grife jovem e descolada de roupas convida você para estrelar a nova coleção de jaquetas.',
      choices: [
        ['Fazer a sessão de fotos com postura séria e profissional', 'dinheiro +400, seguidores +250, fama +1', () => { state.money += 400; state.followers += 250; state.fame += 1; }],
        ['Pedir roupas extras da marca para presentear sua família', 'dinheiro +200, reputação +6', () => { state.money += 200; state.reputationScore = Math.min(100, (state.reputationScore||0)+6); }],
        ['Exigir destaque absoluto na vitrine e fazer poses ousadas', 'fama +3, reputação -8', () => { state.fame += 3; state.reputationScore = Math.max(-100, (state.reputationScore||0)-8); }]
      ]
    }
  ];

  /* ── Veículos e Imóveis ─────────────────────────────────────────── */
  const vehicleItems = [
    { id:'bike', name:'Bicicleta', price:500, regen:5, desc:'Bicicleta básica de pedal. Ótima para cárdio leve e locomoção.', icon:'🚲' },
    { id:'ebike', name:'Bicicleta Elétrica', price:1500, regen:8, desc:'Deslocamento ágil e sem esforço pelas ruas da cidade.', icon:'🚲⚡' },
    { id:'scooter', name:'Scooter / Motoneta', price:4000, regen:12, desc:'Duas rodas econômica e prática para o dia a dia.', icon:'🛵' },
    { id:'motorbike', name:'Motocicleta', price:10000, regen:16, desc:'Transporte rápido, potente e cheio de estilo.', icon:'🏍️' },
    { id:'car', name:'Carro Sedan', price:30000, regen:20, desc:'Conforto total para viagens e treinos. Máxima recuperação física.', icon:'🚗' }
  ];

  const homeItems = [
    { id:'parents', name:'Casa dos Pais', price:0, desc:'Morando no aconchego da casa com sua família.', icon:'🏠' },
    { id:'room', name:'Kitnet / Studio Pequeno', price:5000, desc:'Seu primeiro cantinho próprio e independente na cidade.', icon:'🏢' },
    { id:'flat', name:'Apartamento Moderno', price:15000, desc:'Apartamento espaçoso e bem localizado, perto do CT.', icon:'🏙️' },
    { id:'villa', name:'Casa em Condomínio', price:40000, desc:'Jardim privativo, churrasqueira e tranquilidade total.', icon:'🏡' },
    { id:'estate', name:'Mansão Familiar', price:120000, desc:'Propriedade de alto luxo com piscina para você e seus familiares.', icon:'🏰' }
  ];

  /* ── Estado Inicial / Fresh State ───────────────────────────────── */
  const freshState = () => {
    const brData = nameData.BR;
    const fFore = brData.femaleForenames[Math.floor(Math.random()*brData.femaleForenames.length)];
    const mFore = brData.maleForenames[Math.floor(Math.random()*brData.maleForenames.length)];
    const sur = brData.surnames[Math.floor(Math.random()*brData.surnames.length)];
    const randTeam = clubs[Math.floor(Math.random()*clubs.length)];

    return {
      firstName: 'Gustavo', surname: sur, name: `Gustavo ${sur}`, shirtName: 'GUS', sex: 'M', country: 'Brasil', region: 'Aleatório', favoriteTeam: 'Estrela do Porto', foot: 'Destro', origin: '',
      playerClub: 'Aleatório',
      options: { hideProbabilities: true, randomizeTeam: true, randomizeRegion: true },
      visuals: { skinTone: '#e0a890', hairColor: '#2b1d0c', facialHair: 'none' },
      family: {
        father: { name: mFore, surname: sur, health: 85, status: 'Vivo', profession: 'Operário da construção civil' },
        mother: { name: fFore, surname: sur, health: 88, status: 'Viva', profession: 'Vendedora' },
        wealthPercentile: 45, region: 'Centro-Oeste', titheRate: 0.5
      },
      reputationScore: 0, // -100 a +100
      fame: 0,
      luck: 7.0, // Fixo para a vida após a criação!
      currentYear: 2026,
      unreadMessagesCount: 0,
      position: '', age: 10, phase: 'create', youthStep: 0,
      attributes: { finishing: 7.0, passing: 7.0, dribbling: 7.0, pace: 7.0, composure: 7.0, workRate: 7.0, luck: 7.0 },
      initialAttributes: { finishing: 7.0, passing: 7.0, dribbling: 7.0, pace: 7.0, composure: 7.0, workRate: 7.0, luck: 7.0 },
      _poolPoints: 0,
      reputation: { professional: 0, flair: 0, resilient: 0 },
      money: 120, followers: 84, goals: 0, assists: 0, matches: 0,
      motmCount: 0, nickname: '', matchRatings: [], notableActions: [], socialFeed: [],
      stamina: 100, trainingsThisWeek: 0, tacticalBonus: 0,
      purchases: { vehicle: 'none', home: 'parents' }, staminaRecoveryBonus: 0, followerMultiplier: 1.0, privateTrainingPending: false,
      news: [], messages: [],
      score: { you: 0, them: 0 }, matchStep: 0, matchOutcome: null, matchEvents: [], matchMoments: [], lastMatch: null,
      morale: 50, moralePower: 0,
      matchGoalsThisGame: 0, matchAssistsThisGame: 0, matchSuccesses: 0, matchFailures: 0, matchDefensiveWins: 0,
      schedule: buildSchedule(), scheduleIndex: 0,
      fixtureIndex: 0, fixtures: buildFixtures(), table: blankTable(),
      records: world.recordDefinitions.map(r => ({ ...r })), eventIndex: 0,
      playoffPhase: '', playoffOpponent: '', popupModal: null, activeWebStore: 'vehicles'
    };
  };

  /* ── Eventos de Formação da Juventude (idades 10 a 15) ──────────── */
  const youthEvents = [
    { age:10, title:'O treino extra na manhã', text:'Seu treinador da escolinha oferece um treino técnico de manhã bem cedo, duas vezes por semana. Significa acordar no escuro e menos tempo livre com os colegas.',
      choices:[['Focar na técnica e drible','dribbling',1.5,'professional',1],['Buscar equilíbrio e disciplina','workRate',1.0,'resilient',1],['Aprimorar sua velocidade','pace',1.5,'flair',1]] },
    { age:11, title:'O convite para o futsal', text:'Um time tradicional de futsal do bairro quer você para disputar um torneio regional de fim de semana. O treinador de campo se preocupa com a sobrecarga.',
      choices:[['Disputar o torneio de futsal','dribbling',1.0,'flair',2],['Seguir o conselho do treinador de campo','workRate',1.5,'professional',2],['Jogar o futsal, mas dosando a energia','passing',1.5,'resilient',1]] },
    { age:12, title:'A peneira longe de casa', text:'Um olheiro de um clube importante viu um vídeo seu. A avaliação é em outra cidade, e sua família precisa fazer um esforço financeiro para levar você até lá.',
      choices:[['Pedir o apoio da família para viajar','composure',1.5,'flair',1],['Aguardar uma oportunidade mais próxima','workRate',1.5,'professional',1],['Fazer uma vaquinha solidária com o time','passing',1.5,'resilient',2]] },
    { age:13, title:'A tensão da grande final', text:'É a final do campeonato regional infantil. Você perdeu duas chances claras no tempo normal. A disputa de pênaltis decisiva está prestes a começar.',
      choices:[['Pedir para bater o primeiro pênalti','finishing',1.5,'flair',1],['Bater mais tarde com tranquilidade','composure',1.5,'resilient',1],['Apoiar e incentivar os companheiros primeiro','passing',1.0,'professional',2]] },
    { age:14, title:'As portas da base profissional', text:'A academia de um clube profissional convida você para uma semana inteira de testes. Seu treinador da infância está orgulhoso, mas emocionado com a despedida.',
      choices:[['Aceitar a oportunidade na hora','composure',1.5,'professional',2],['Pedir para aguardar as férias escolares','passing',1.5,'resilient',1],['Treinar ainda mais pesado em casa antes','workRate',2.0,'flair',1]] },
    { age:15, title:'Definindo sua posição no campo', text:'O treinador da base senta para conversar com você: "Já acompanho você há um bom tempo. Em qual setor do campo você sente que rende mais?"',
      isPositionChoice:true,
      choices:[['Lá atrás — Sei ler o jogo e desarmar','composure',2.0,'resilient',2,'defender'],['No meio — Faço a bola girar e organizo as jogadas','passing',2.0,'professional',2,'midfielder'],['No ataque — Tenho faro de gol e gosto de decidir','finishing',2.0,'flair',2,'attacker']] },
  ];

  /* ── Persistência de Dados ──────────────────────────────────────── */
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem('footlife-prototype') || localStorage.getItem('fcs-prototype'));
      if (!saved) return null;
      const base = freshState();
      const m = { ...base, ...saved, attributes:{...base.attributes,...saved.attributes}, reputation:{...base.reputation,...saved.reputation}, family:{...base.family,...saved.family}, options:{...base.options,...saved.options}, visuals:{...base.visuals,...saved.visuals}, purchases:{...base.purchases,...saved.purchases}, score:{...base.score,...saved.score}, matchEvents:saved.matchEvents||[], matchMoments:saved.matchMoments||[], fixtures:saved.fixtures||base.fixtures, table:saved.table||base.table, records:saved.records||base.records };
      if (!m.playerClub || m.playerClub === 'Random') m.playerClub = 'Estrela do Porto';
      if (!m.name) m.name = `${m.firstName||'Gustavo'} ${m.surname||'Silva'}`;
      if (m.reputationScore === undefined) m.reputationScore = 0;
      if (m.fame === undefined) m.fame = 0;
      if (m.luck === undefined) m.luck = 7.0;
      if (m.currentYear === undefined) m.currentYear = 2026;
      // Não persiste modais temporários entre recarregamentos
      m.popupModal = null;
      if (m.phase === 'postMatch') m.phase = 'desktop';
      if (m.matchOutcome && m.matchStep >= (m.matchMoments?.length || 0)) {
        m.matchOutcome = null;
        m.phase = 'desktop';
      }
      const maxSlots = (m.schedule && m.schedule[m.scheduleIndex]?.type === 'free') ? 2 : 1;
      if (typeof m.trainingsThisWeek !== 'number' || m.trainingsThisWeek < 0 || m.trainingsThisWeek > maxSlots) {
        m.trainingsThisWeek = 0;
      }
      if (m.matches > 500) {
        m.matches = m.matchRatings ? m.matchRatings.length : 8;
        m.motmCount = m.matchRatings ? m.matchRatings.filter(r => r >= 9.0).length : 0;
        m.followers = 250;
        m.money = 1200;
        m.fame = 2;
      }
      if (!m.socialFeed || !m.socialFeed.length) {
        m.socialFeed = [
          { handle: '@MesaRedondaAurora', text: `${m.name} vem demonstrando muita personalidade com a camisa do ${m.playerClub || 'Estrela do Porto'}.`, sentiment: 'positive', stamp: `Partida ${m.matches}` },
          { handle: '@TaticaBR', text: `Jovem atleta para ficar de olho na Liga Nacional Aurora: ${m.surname || m.name}.`, sentiment: 'neutral', stamp: `Partida ${m.matches}` },
          { handle: '@estrela_porto_oficial', text: `Muita expectativa em torno da evolução de ${m.name} nesta temporada! ⚽🌟`, sentiment: 'positive', stamp: `Partida ${m.matches}` }
        ];
      }
      for (const k of Object.keys(m.attributes)) m.attributes[k]=Number(m.attributes[k]);
      recalculateLeagueTableIfNeeded(m);
      return m;
    } catch { return null; }
  }

  function recalculateLeagueTableIfNeeded(m) {
    if (!m.schedule || !m.fixtures || !m.table) return;
    const totalPts = Object.values(m.table).reduce((acc, row) => acc + (row.pts || 0), 0);
    if (totalPts === 0) {
      m.table = blankTable();
      m.schedule.forEach((entry) => {
        if (entry.type === 'match' && entry.result) {
          const roundFixtures = m.fixtures[entry.fixtureIndex];
          if (roundFixtures) {
            roundFixtures.forEach(([h, a]) => {
              const hRow = m.table[h]; const aRow = m.table[a];
              if (!hRow || !aRow) return;
              if (h === m.playerClub || a === m.playerClub) {
                const parts = (entry.result.score || '0–0').split(/[–-]/).map(Number);
                const pGoals = parts[0] || 0;
                const oGoals = parts[1] || 0;
                const isHome = h === m.playerClub;
                const hg = isHome ? pGoals : oGoals;
                const ag = isHome ? oGoals : pGoals;
                hRow.p+=1; aRow.p+=1; hRow.gf+=hg; hRow.ga+=ag; aRow.gf+=ag; aRow.ga+=hg;
                if(hg>ag){hRow.w+=1;aRow.l+=1;hRow.pts+=3}else if(hg<ag){aRow.w+=1;hRow.l+=1;aRow.pts+=3}else{hRow.d+=1;aRow.d+=1;hRow.pts+=1;aRow.pts+=1}
              } else {
                const hr = clubData(h)?.rating || 60; const ar = clubData(a)?.rating || 60;
                const hg = Math.max(0, Math.round(Math.random()*2 + (hr-ar)/18));
                const ag = Math.max(0, Math.round(Math.random()*2 + (ar-hr)/23));
                hRow.p+=1; aRow.p+=1; hRow.gf+=hg; hRow.ga+=ag; aRow.gf+=ag; aRow.ga+=hg;
                if(hg>ag){hRow.w+=1;aRow.l+=1;hRow.pts+=3}else if(hg<ag){aRow.w+=1;hRow.l+=1;aRow.pts+=3}else{hRow.d+=1;aRow.d+=1;hRow.pts+=1;aRow.pts+=1}
              }
            });
          }
        }
      });
    }
  }

  let state = load() || freshState();
  const save = () => localStorage.setItem('footlife-prototype', JSON.stringify(state));
  const reset = () => { state = freshState(); save(); render(); };
  const addNews = (headline, body) => { state.news.unshift({ headline, body, stamp:`${state.age} anos · ${state.currentYear}` }); if (state.news.length > 50) state.news.length = 50; };
  const addMessage = (from, text) => { state.messages.unshift({ from, text, read: false, stamp: `${state.age} anos` }); state.unreadMessagesCount = state.messages.filter(m => !m.read).length; };

  /* ── Auxiliares ─────────────────────────────────────────────────── */
  const attr = k => state.attributes[k]||7.0;
  const attrDisplay = k => attr(k).toFixed(1);
  const playerClub = () => state.playerClub || 'Estrela do Porto';
  const regionName = () => (state.region==='Random'||state.region==='Aleatório')?'Centro-Oeste':state.region;
  const initials = () => (state.shirtName||state.surname||'YP').slice(0,2).toUpperCase();
  const staminaColor = () => state.stamina>60?'#398143':state.stamina>30?'#b8860b':'#a31818';
  const getStaminaRecoveryBonus = () => {
    const vRegen = vehicleItems.find(i => i.id === state.purchases?.vehicle)?.regen || 0;
    const nutRegen = state.purchases?.nutritionist ? 10 : 0;
    return vRegen + nutRegen;
  };
  const currentWeek = () => state.schedule[state.scheduleIndex]||null;

  function getCurrentOpponent() {
    const w = currentWeek();
    if (!w) return 'Temporada encerrada';
    if (w.type==='free') return 'Semana livre';
    if (w.type==='semi'||w.type==='final') return w.opponent;
    if (w.type==='match') { const r=state.fixtures[w.fixtureIndex]; if(!r)return 'Temporada encerrada'; const f=r.find(p=>p.includes(playerClub())); return f?f.find(n=>n!==playerClub()):'Desconhecido'; }
    return 'Temporada encerrada';
  }
  function getPlayerFixture() {
    const w = currentWeek();
    if (!w) return [playerClub(),'Temporada encerrada'];
    if (w.type==='semi'||w.type==='final') return [playerClub(),w.opponent];
    if (w.type==='match') { const r=state.fixtures[w.fixtureIndex]; if(!r)return [playerClub(),'Temporada encerrada']; return r.find(p=>p.includes(playerClub()))||[playerClub(),'Semana livre']; }
    return [playerClub(),'Semana livre'];
  }
  const standings = () => Object.entries(state.table).sort(([,a],[,b])=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf);

  /* ── Rolagem de D20 e Mecânica ──────────────────────────────────── */
  function rollD20() { return Math.floor(Math.random()*20)+1; }
  
  function calculatePhase1Target(key) {
    const skill = attr(key);
    const luckMod = Math.round((state.luck || 7.0) - 7.0);
    // Fórmula: Alvo = Math.max(3, 22 - skill - luckMod). Sorte acima de 7 reduz o alvo necessário!
    return Math.max(3, Math.round(22 - skill - luckMod));
  }

  function calculateMatchRating() {
    let r = 6.0;
    r += state.matchGoalsThisGame * 1.2;
    r += state.matchAssistsThisGame * 0.8;
    r += state.matchSuccesses * 0.4;
    r -= state.matchFailures * 0.5;
    if (state.score.you > state.score.them) r += 0.3;
    else if (state.score.you < state.score.them) r -= 0.3;
    return Math.max(1.0, Math.min(10.0, Math.round(r*10)/10));
  }

  function formArrow() {
    const last3 = state.matchRatings.slice(-3);
    if (last3.length<2) return { arrow:'→', cls:'steady' };
    const avg = last3.reduce((s,v)=>s+v,0)/last3.length;
    if (avg>=7.5) return { arrow:'↑', cls:'up' };
    if (avg>=6.5) return { arrow:'↗', cls:'up' };
    if (avg>=5.5) return { arrow:'→', cls:'steady' };
    if (avg>=4.5) return { arrow:'↘', cls:'down' };
    return { arrow:'↓', cls:'down' };
  }
  function ratingClass(r) { return r>=7?'good':r>=5?'average':'poor'; }

  function reputationLabel() {
    const r = state.reputationScore || 0;
    if (r >= 50) return 'Exemplo de Conduta (+ Bom Moço)';
    if (r >= 20) return 'Profissional Respeitado';
    if (r <= -50) return 'Enfant Terrible (- Rebelde / Bad Boy)';
    if (r <= -20) return 'Esquentadinho';
    return 'Neutro';
  }

  function followerGain(base) { return Math.round(base * (state.followerMultiplier || 1.0)); }

  /* ── Apelidos da Carreira ───────────────────────────────────────── */
  const nicknameThresholds = [
    { check: s => s.notableActions.some(a => a.type==='poker'), name:'O Destruidor' },
    { check: s => s.motmCount >= 3, name:'O Inevitável' },
    { check: s => s.goals >= 15, name:'O Artilheiro' },
    { check: s => s.goals >= 10, name:'O Fantasma de Porto Claro' },
    { check: s => s.assists >= 5, name:'O Maestro' },
    { check: s => s.goals >= 5, name:'O Menino' },
    { check: s => s.notableActions.some(a => a.type==='hatTrick'), name:'O Fenômeno' },
  ];

  function checkNickname() {
    const prev = state.nickname;
    for (const th of nicknameThresholds) { if (th.check(state)) { state.nickname = th.name; break; } }
    if (state.nickname && state.nickname !== prev) {
      addSocialPost('nickname');
      addMessage('Jornalista local', `A crônica esportiva começou a chamar você de "${state.nickname}". O que acha desse apelido?`);
    }
  }

  /* ── Detecção de Ações Marcantes ────────────────────────────────── */
  function detectNotableActions(rating, isMotm) {
    const g = state.matchGoalsThisGame;
    if (g >= 4) state.notableActions.push({ type:'poker', matchIndex:state.matches, goals:g, age:state.age });
    else if (g >= 3) state.notableActions.push({ type:'hatTrick', matchIndex:state.matches, age:state.age });
    else if (g >= 2) state.notableActions.push({ type:'brace', matchIndex:state.matches, age:state.age });
    if (state.matches === 1 && g > 0) state.notableActions.push({ type:'debutGoal', age:state.age });
    if (isMotm) state.notableActions.push({ type:'motm', matchIndex:state.matches, rating:rating, age:state.age });
  }

  /* ── Evento Aleatório Entre Partidas ────────────────────────────── */
  function addBetweenMatchEvent() {
    const ev = world.eventTemplates[state.eventIndex % world.eventTemplates.length];
    state.eventIndex += 1;
    addMessage(ev.from, ev.text);
    if (ev.effect === 'followers') state.followers += followerGain(35);
    else if (state.reputation && ev.effect in state.reputation) state.reputation[ev.effect] += 1;
  }

  /* ── Modais de Notificação ──────────────────────────────────────── */
  function showPopupModal(title, text, buttonLabel, onConfirm) {
    state.popupQueue = state.popupQueue || [];
    if (state.popupModal) {
      state.popupQueue.push({ title, text, buttonLabel, onConfirm });
      return;
    }
    state.popupModal = { title, text, buttonLabel, onConfirm };
    render();
  }

  function renderPopupModalOverlay() {
    if (!state.popupModal) return;
    const m = state.popupModal;
    let overlay = document.querySelector('#modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'modal-overlay';
      overlay.className = 'popup-modal-overlay';
      document.body.appendChild(overlay);
    }
    overlay.innerHTML = `<div class="popup-modal-content">
      <h2>${m.title}</h2>
      <p>${m.text}</p>
      <button class="classic-button" id="modal-confirm-btn" style="width:100%">${m.buttonLabel||'Continuar'}</button>
    </div>`;
    document.querySelector('#modal-confirm-btn').onclick = () => {
      const cb = m.onConfirm;
      state.popupModal = null;
      overlay.remove();
      if (cb) cb();
      if (state.popupQueue && state.popupQueue.length) {
        const next = state.popupQueue.shift();
        showPopupModal(next.title, next.text, next.buttonLabel, next.onConfirm);
      } else {
        save(); render();
      }
    };
  }

  /* ── Eventos Semanais, Salário e Família ─────────────────────────── */
  function processWeeklyLifeEvents() {
    // 1% dos seguidores em renda de patrocínio
    const followerIncome = Math.floor(state.followers / 100);
    let weeklyWage = 850 + followerIncome;
    
    // Repasse familiar para menores de 18 anos
    if (state.age < 18 && state.family.titheRate > 0) {
      const tithe = Math.floor(weeklyWage * state.family.titheRate);
      weeklyWage -= tithe;
    }
    state.money += weeklyWage;

    const luckDelta = (state.luck || 7.0) - 7.0;

    // Tragédia na família (probabilidade base de 0.1%, reduzida por sorte alta)
    const tragedyChance = Math.max(0.0001, 0.001 - luckDelta * 0.0001);
    if (Math.random() < tragedyChance) {
      const target = Math.random() > 0.5 ? 'father' : 'mother';
      const parentObj = state.family[target];
      if (parentObj.status === 'Vivo' || parentObj.status === 'Viva' || parentObj.status === 'Alive') {
        parentObj.status = target === 'father' ? 'Falecido' : 'Falecida';
        const parentLabel = target === 'father' ? 'seu pai' : 'sua mãe';
        const msgText = `Informamos com profundo pesar que ${parentLabel}, ${parentObj.name} ${parentObj.surname}, faleceu em decorrência da violência urbana no Brasil. A diretoria, a comissão técnica e todo o elenco manifestam as mais sinceras condolências.`;
        addMessage('Diretoria do Clube', msgText);
        addNews('Luto na família', `${playerClub()} presta condolências a ${state.name} pelo trágico falecimento de ${parentLabel}.`);
        showPopupModal('Tragédia Familiar', msgText, 'Força para a família', () => {});
      }
    }

    // Assalto residencial (probabilidade base de 1.0%, reduzida por sorte alta)
    const robberyChance = Math.max(0.001, 0.01 - luckDelta * 0.001);
    if (Math.random() < robberyChance) {
      const stolen = Math.floor(state.money * 0.5);
      if (stolen > 100) {
        state.money -= stolen;
        const msgText = `Notícia preocupante: a residência da sua família foi invadida e furtada nesta semana. Você perdeu R$ ${stolen} das suas reservas guardadas.`;
        addMessage('Segurança & Polícia', msgText);
        addNews('Caso de assalto', `A casa da família de ${state.name} foi alvo de assalto, causando um prejuízo de R$ ${stolen}.`);
        showPopupModal('Residência Invadida', msgText, 'Seguir em frente', () => {});
      }
    }
  }

  /* ── Simulação da Liga ──────────────────────────────────────────── */
  function applyResult(home,away,hg,ag) {
    const h=state.table[home]; const a=state.table[away];
    h.p+=1;a.p+=1;h.gf+=hg;h.ga+=ag;a.gf+=ag;a.ga+=hg;
    if(hg>ag){h.w+=1;a.l+=1;h.pts+=3}else if(hg<ag){a.w+=1;h.l+=1;a.pts+=3}else{h.d+=1;a.d+=1;h.pts+=1;a.pts+=1}
  }
  function simulateOtherFixtures(round) {
    if(!round) return;
    round.filter(p=>!p.includes(playerClub())).forEach(([h,a])=>{
      const hr=clubData(h).rating, ar=clubData(a).rating;
      const hg=Math.max(0,Math.round(Math.random()*2+(hr-ar)/18));
      const ag=Math.max(0,Math.round(Math.random()*2+(ar-hr)/23));
      applyResult(h,a,hg,ag);
    });
  }

  /* ── Lógica de Mata-Mata / Playoffs ─────────────────────────────── */
  function enterPlayoffs() {
    const top4 = standings().slice(0, 4).map(([n]) => n);
    const pos = top4.indexOf(playerClub());
    if (pos >= 0) {
      const opponents = [top4[3], top4[2], top4[1], top4[0]];
      const semiOpp = opponents[pos];
      state.schedule.push({ type: 'semi', opponent: semiOpp });
      state.playoffPhase = 'semi';
      state.playoffOpponent = semiOpp;
      addNews('Classificação para o mata-mata!', `${playerClub()} termina em ${pos + 1}º lugar e garante vaga na fase final da Liga Nacional Aurora.`);
      addMessage('Técnica Mara', `Estamos nos playoffs! Nossa semifinal será contra o ${semiOpp}. É o momento de mostrar a força da nossa equipe.`);
      const otherSemiTeams = top4.filter(n => n !== playerClub() && n !== semiOpp);
      const r1 = clubData(otherSemiTeams[0])?.rating || 70, r2 = clubData(otherSemiTeams[1])?.rating || 70;
      const g1 = Math.max(0, Math.round(Math.random() * 2 + (r1 - r2) / 18));
      const g2 = Math.max(0, Math.round(Math.random() * 2 + (r2 - r1) / 23));
      state._otherSemiWinner = g1 >= g2 ? otherSemiTeams[0] : otherSemiTeams[1];
      state._otherSemiScore = `${g1}-${g2}`;
      addNews('Resultado da outra semifinal', `${otherSemiTeams[0]} ${state._otherSemiScore} ${otherSemiTeams[1]}. ${state._otherSemiWinner} se classifica para a final.`);
    } else {
      state.playoffPhase = 'eliminated';
      const finalPos = standings().findIndex(([n]) => n === playerClub()) + 1;
      addNews('Fim de temporada', `${playerClub()} encerra o campeonato na ${finalPos}ª colocação. O sonho do título fica para o próximo ano.`);
      const semi1 = Math.random() > 0.5 ? top4[0] : top4[3];
      const semi2 = Math.random() > 0.5 ? top4[1] : top4[2];
      const champion = Math.random() > 0.5 ? semi1 : semi2;
      addNews('Campeão da Liga Nacional Aurora', `${champion} conquista a grande final e levanta o troféu de campeão.`);
    }
  }

  function resolvePlayoffResult() {
    const w = state.schedule[state.scheduleIndex - 1];
    if (!w) return;
    const won = state.score.you > state.score.them;
    const drawn = state.score.you === state.score.them;
    if (w.type === 'semi') {
      state.money += 2000;
      if (won || (drawn && Math.random() > 0.5)) {
        const finalOpp = state._otherSemiWinner || 'Desconhecido';
        state.schedule.push({ type: 'final', opponent: finalOpp });
        state.playoffPhase = 'final';
        state.playoffOpponent = finalOpp;
        addNews('Rumo à grande final!', `${playerClub()} supera o ${w.opponent} por ${state.score.you} a ${state.score.them} e se classifica para a grande decisão contra o ${finalOpp}.`);
        addMessage('Técnica Mara', `Conseguimos! Estamos na final contra o ${finalOpp}. É o jogo das nossas vidas!`);
        addSocialPost('win');
      } else {
        state.playoffPhase = 'eliminated';
        addNews('Eliminação na semifinal', `${playerClub()} é eliminado pelo ${w.opponent} pelo placar de ${state.score.you} a ${state.score.them}.`);
        const finalWinner = Math.random() > 0.5 ? w.opponent : (state._otherSemiWinner || 'Desconhecido');
        addNews('Campeão da Liga Nacional Aurora', `${finalWinner} vence a final e é o campeão.`);
      }
    } else if (w.type === 'final') {
      if (won || (drawn && Math.random() > 0.5)) {
        state.playoffPhase = 'champion';
        state.money += 5000;
        state.followers += followerGain(500);
        state.fame += 5;
        addNews('É CAMPEÃO! 🏆', `${playerClub()} conquista a Liga Nacional Aurora! Vitória por ${state.score.you} a ${state.score.them} sobre o ${w.opponent}. ${state.name} levanta a taça!`);
        addMessage('Presidente do Clube', 'Você é um campeão! A cidade inteira celebra esse título histórico!');
        state.notableActions.push({ type: 'champion', age: state.age });
        addSocialPost('champion');
        addSocialPost('champion');
      } else {
        state.playoffPhase = 'eliminated';
        state.money += 1500;
        addNews('Vice-campeão', `${playerClub()} luta bravamente mas é superado na final por ${state.score.you} a ${state.score.them} diante do ${w.opponent}.`);
      }
    }
  }

  /* ── Roteador de Telas ───────────────────────────────────────────── */
  function render() {
    if (state.popupModal) renderPopupModalOverlay();
    if (state.phase==='create') return renderCreate();
    if (state.phase==='birthSummary') return renderBirthSummary();
    if (state.phase==='youth') return renderYouth();
    if (state.phase==='match') return renderMatch();
    if (state.phase==='penalties') return renderPenalties();
    if (state.phase==='postMatch') return renderPostMatch();
    renderDesktop('calendar');
  }

  /* ── Criação de Personagem (Ficha de Inscrição) ───────────────────── */
  function renderCreate() {
    const brData = nameData.BR;
    const pool = state._poolPoints || 0;

    app.innerHTML = `<section class="enrollment-screen"><article class="paper-form">
      <div class="document-heading"><div><p>FOOTLIFE · ACADEMIA DE FUTEBOL DO BRASIL</p><h1>Ficha de Inscrição e Criação de Jogador</h1></div><span>FORMULÁRIO F-2026</span></div>
      
      <!-- Painel de Opções -->
      <fieldset style="background:#f0f7ff;border:1px solid #0d58a6;margin-bottom:15px"><legend style="color:#0d58a6">Opções de Jogo</legend>
        <div style="display:flex;gap:15px;flex-wrap:wrap;font-size:12px">
          <label style="display:flex;align-items:center;gap:5px"><input type="checkbox" id="opt-hide" ${state.options.hideProbabilities?'checked':''}> Ocultar Probabilidades das Ações (Mostrar apenas Atributo)</label>
          <label style="display:flex;align-items:center;gap:5px"><input type="checkbox" id="opt-team" ${state.options.randomizeTeam?'checked':''}> Sortear Clube Inicial</label>
          <label style="display:flex;align-items:center;gap:5px"><input type="checkbox" id="opt-region" ${state.options.randomizeRegion?'checked':''}> Sortear Região de Nascimento</label>
        </div>
      </fieldset>

      <div class="form-lines">
        <label>Nome *<input id="first-name" value="${escapeHtml(state.firstName)}" placeholder="Nome"></label>
        <label>Sobrenome *<input id="surname" value="${escapeHtml(state.surname)}" placeholder="Sobrenome"></label>
        <label>Nome na Camisa *<input id="shirt-name" value="${escapeHtml(state.shirtName)}" maxlength="12" placeholder="Ex: GUS"></label>
        <label>Região de Origem *<select id="region">${['Aleatório',...regions].map(r=>`<option value="${r}" ${state.region===r||regionDisplay(state.region)===r?'selected':''}>${regionDisplay(r)}</option>`).join('')}</select></label>
        <label>Clube Inicial *<select id="starting-club">${['Aleatório',...clubs].map(c=>`<option value="${c}" ${state.playerClub===c?'selected':''}>${c}</option>`).join('')}</select></label>
        <label>Pé Dominante<select id="foot"><option value="Right" ${state.foot==='Right'||state.foot==='Destro'?'selected':''}>Destro</option><option value="Left" ${state.foot==='Left'||state.foot==='Canhoto'?'selected':''}>Canhoto</option></select></label>
      </div>

      <!-- Customizador de Avatar -->
      <fieldset><legend>Aparência Visual</legend>
        <div style="display:flex;align-items:center;gap:20px">
          <div class="avatar-preview">${renderAvatarSVG(state.visuals)}</div>
          <div style="flex:1" class="avatar-controls">
            <label>Tom de Pele<select id="skin-tone">${[['#f5d0c5','Clara'],['#e0a890','Média'],['#a06540','Bronzeada'],['#583015','Escura']].map(([c,l])=>`<option value="${c}" ${state.visuals.skinTone===c?'selected':''}>${l}</option>`).join('')}</select></label>
            <label>Cor do Cabelo<select id="hair-color">${[['#2b1d0c','Preto'],['#68401c','Castanho'],['#b8860b','Loiro'],['#a31818','Ruivo']].map(([c,l])=>`<option value="${c}" ${state.visuals.hairColor===c?'selected':''}>${l}</option>`).join('')}</select></label>
            <label>Pelo Facial / Barba<select id="facial-hair">${[['none','Nenhum'],['stubble','Barba por fazer'],['beard','Barba cheia'],['mustache','Bigode']].map(([v,l])=>`<option value="${v}" ${state.visuals.facialHair===v?'selected':''}>${l}</option>`).join('')}</select></label>
          </div>
        </div>
      </fieldset>

      <!-- Atributos e Distribuição de Pontos -->
      <fieldset><legend>Distribuição dos Atributos Principais</legend>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:${pool>0?'#e8f5e8':'#f5f5f0'};border:1px solid ${pool>0?'#398143':'#94a2a9'};margin-bottom:10px">
          <strong style="color:${pool>0?'#1b5e20':'#45515b'};font-size:14px">Pontos Disponíveis: <span style="font-size:18px">${pool}</span></strong>
          <span style="font-size:11px;color:#596773">Reduzir um atributo abaixo de 7.0 gera +1 ponto. Restaurar até 7.0 não tem custo adicional!</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px" id="attr-realloc">
          ${Object.keys(state.attributes).map(k=>{
            const val = state.attributes[k];
            return `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 8px;border:1px solid #71818e;background:${k==='luck'?'#fff8e1':'#fff'}">
              <span><b>${k==='luck'?'SORTE ⭐':attrLabel(k).toUpperCase()}</b></span>
              <b>${val.toFixed(1)}</b>
              <div>
                <button type="button" class="classic-button" data-sub-attr="${k}" style="padding:2px 8px;font-weight:bold" ${val<=3.0?'disabled':''}>-</button>
                <button type="button" class="classic-button" data-add-attr="${k}" style="padding:2px 8px;font-weight:bold" ${pool<=0||val>=20.0?'disabled':''}>+</button>
              </div>
            </div>`;
          }).join('')}
        </div>
      </fieldset>

      <fieldset><legend>Primeiro Instinto *</legend><p>Escolha a característica que mais chamava atenção nos seus primeiros toques na bola.</p><div class="choice-grid" id="origin-choices">
        ${[['Ginga','Drible +2','dribbling'],['Faro de Gol','Finalização +2','finishing'],['Raça & Dedicação','Dedicação +2','workRate']].map(([l,d,k])=>`<button class="paper-choice ${state.origin===k?'selected':''}" data-origin="${k}" type="button"><strong>${l}</strong><small>${d}</small></button>`).join('')}
      </div></fieldset>

      <div class="signature-row"><span>Assinatura do responsável legal</span><span>Ano: 2026</span><button class="classic-button" id="begin">Cadastrar Jogador e Iniciar Jornada</button></div>
    </article></section>`;

    /* Ouvintes de Opções */
    document.querySelector('#opt-hide').onchange = e => { state.options.hideProbabilities = e.target.checked; };
    document.querySelector('#opt-team').onchange = e => { state.options.randomizeTeam = e.target.checked; };
    document.querySelector('#opt-region').onchange = e => { state.options.randomizeRegion = e.target.checked; };
    
    /* Ouvintes de Aparência */
    document.querySelector('#skin-tone').onchange = e => { captureCreateForm(); state.visuals.skinTone = e.target.value; renderCreate(); };
    document.querySelector('#hair-color').onchange = e => { captureCreateForm(); state.visuals.hairColor = e.target.value; renderCreate(); };
    document.querySelector('#facial-hair').onchange = e => { captureCreateForm(); state.visuals.facialHair = e.target.value; renderCreate(); };

    /* Ouvintes de Atributos */
    document.querySelectorAll('[data-sub-attr]').forEach(b => b.onclick = () => {
      captureCreateForm();
      const k = b.dataset.subAttr;
      const init = state.initialAttributes[k] || 7.0;
      if (state.attributes[k] > init) {
        state.attributes[k] -= 1.0;
        state._poolPoints = (state._poolPoints||0) + 1;
      } else if (state.attributes[k] >= 3.0) {
        state.attributes[k] -= 2.0;
        state._poolPoints = (state._poolPoints||0) + 1;
      }
      renderCreate();
    });

    document.querySelectorAll('[data-add-attr]').forEach(b => b.onclick = () => {
      captureCreateForm();
      const k = b.dataset.addAttr;
      const init = state.initialAttributes[k] || 7.0;
      if ((state._poolPoints||0) > 0) {
        if (state.attributes[k] < init) {
          state.attributes[k] += 2.0;
          state._poolPoints -= 1;
        } else if (state.attributes[k] < 20.0) {
          state.attributes[k] += 1.0;
          state._poolPoints -= 1;
        }
      }
      renderCreate();
    });

    document.querySelectorAll('[data-origin]').forEach(b => b.onclick = () => { captureCreateForm(); state.origin = b.dataset.origin; renderCreate(); });

    document.querySelector('#begin').onclick = () => {
      captureCreateForm();
      if (!state.origin) { document.querySelector('#origin-choices').classList.add('needs-choice'); return; }
      
      // Salva a Sorte fixa para a vida toda!
      state.luck = state.attributes.luck || 7.0;
      delete state.attributes.luck;

      state.attributes[state.origin] += 2.0;
      
      if (state.options.randomizeRegion || state.region==='Random' || state.region==='Aleatório') {
        state.region = regions[Math.floor(Math.random()*regions.length)];
      }
      if (state.options.randomizeTeam || state.playerClub==='Random' || state.playerClub==='Aleatório') {
        state.playerClub = clubs[Math.floor(Math.random()*clubs.length)];
      }

      const br = nameData.BR;
      const fFore = br.femaleForenames[Math.floor(Math.random()*br.femaleForenames.length)];
      const mPool = br.maleForenames.filter(n => n.toLowerCase() !== state.firstName.toLowerCase());
      const mFore = (mPool.length ? mPool : br.maleForenames)[Math.floor(Math.random()*(mPool.length||br.maleForenames.length))];
      
      let wealthP = Math.floor(Math.random()*100)+1;
      const reg = regionDisplay(state.region);
      if (reg==='Norte' || reg==='Nordeste' || state.region==='North' || state.region==='Northeast') {
        wealthP = Math.floor(Math.random()*65)+1;
      }

      state.family = {
        father: { name: mFore, surname: state.surname, health: 85, status: 'Vivo', profession: wealthP<=5?'Arquiteto':wealthP<=35?'Eletricista':'Operário da construção' },
        mother: { name: fFore, surname: state.surname, health: 88, status: 'Viva', profession: wealthP<=5?'Médica':wealthP<=35?'Professora':'Dona de casa' },
        wealthPercentile: wealthP,
        region: state.region,
        titheRate: wealthP <= 5 ? 0.0 : 0.5
      };

      state.phase = 'birthSummary';
      save(); render();
    };
  }

  function captureCreateForm() {
    state.firstName = document.querySelector('#first-name').value.trim() || 'Gustavo';
    state.surname = document.querySelector('#surname').value.trim() || 'Silva';
    state.name = `${state.firstName} ${state.surname}`;
    state.shirtName = document.querySelector('#shirt-name').value.trim().toUpperCase() || 'GUS';
    state.region = document.querySelector('#region').value;
    state.playerClub = document.querySelector('#starting-club').value;
    state.foot = document.querySelector('#foot').value;
  }
  function escapeHtml(v) { return String(v||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }

  /* ── Resumo de Origens e Nascimento ─────────────────────────────── */
  function renderBirthSummary() {
    const f = state.family;
    const isRich = f.wealthPercentile <= 5;
    const wealthDesc = isRich ? 'entre os 5% de maior renda (Alta Renda)' : f.wealthPercentile <= 35 ? 'classe média trabalhadora' : 'entre os 60% de menor renda (Origem Humilde)';
    const titheDesc = isRich
      ? 'Como sua família possui excelente condição financeira, seus pais permitem que você fique com 100% dos seus rendimentos do futebol.'
      : 'Seus pais contam com 50% do que você recebe para ajudar nas despesas essenciais da casa até você atingir a maioridade (18 anos).';

    const reg = regionDisplay(f.region);

    app.innerHTML = `<section class="enrollment-screen">
      <article class="birth-summary-card">
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:15px">
          <div>${renderAvatarSVG(state.visuals)}</div>
          <div>
            <h1>${state.name}</h1>
            <p>Nascido no <b>Brasil (${reg})</b> · Ano 2026</p>
          </div>
        </div>
        
        <p>Seus pais, <b>${f.mother.name}</b> e <b>${f.father.name} ${state.surname}</b>, perceberam seu talento diferenciado com a bola nos pés desde bem pequeno, jogando descalço pelas ruas da vizinhança.</p>
        
        <div class="birth-summary-grid">
          <div><b>Mãe:</b> ${f.mother.name} ${state.surname} (${f.mother.profession})</div>
          <div><b>Pai:</b> ${f.father.name} ${state.surname} (${f.father.profession})</div>
          <div><b>Condição Social da Família:</b> ${wealthDesc}</div>
          <div><b>Clube Inicial de Formação:</b> ${state.playerClub}</div>
        </div>

        <p><b>Acordo Financeiro Familiar:</b> ${titheDesc}</p>

        ${(reg==='Norte'||f.region==='North')?`<p style="color:#b8860b;font-size:12px">⚠ Nota: Por ter nascido na região Norte, a infraestrutura esportiva regional ainda está em desenvolvimento, exigindo um empenho extra nos primeiros anos de evolução técnica.</p>`:''}

        <button class="classic-button" id="start-journey-btn" style="width:100%;margin-top:15px;padding:10px;font-size:15px">Dar os primeiros passos no futebol →</button>
      </article>
    </section>`;

    document.querySelector('#start-journey-btn').onclick = () => {
      state.phase = 'youth';
      addNews(`${state.name} dá início à sua formação`, `Com apenas 10 anos, a jovem promessa de ${reg} começa sua trajetória rumo ao futebol profissional.`);
      save(); render();
    };
  }

  /* ── Fase da Juventude (10 a 15 anos) ───────────────────────────── */
  function renderYouth() {
    const ev = youthEvents[state.youthStep];
    if (!ev) {
      state.age = 16; state.phase = 'desktop';
      addMessage('Técnica Mara', `Você foi promovido para o elenco profissional do ${state.playerClub} como ${positionLabel().toLowerCase()}. Sua primeira partida na liga acontece esta semana.`);
      addNews('Promoção ao elenco profissional', `${state.name} assina seu primeiro contrato com a equipe principal do ${state.playerClub} como ${positionLabel().toLowerCase()}.`);
      save(); return renderDesktop('calendar');
    }
    const total = youthEvents.length;
    app.innerHTML = `<section class="enrollment-screen"><article class="paper-form youth-paper"><div class="document-heading"><div><p>FOOTLIFE · FORMAÇÃO DO JOGADOR · ${ev.age} ANOS</p><h1>${ev.title}</h1></div><span>ANO ${state.youthStep+1} DE ${total}</span></div><p class="document-note">${ev.text}</p><div class="choice-grid">${ev.choices.map(([label,key,amount,rep,repAmount,pos],i)=>{
      const tag=pos?` → ${pos==='defender'?'Zagueiro':pos==='midfielder'?'Meio-campista':'Atacante'}`:'';
      return `<button class="paper-choice" data-choice="${i}"><strong>${label}</strong><small>${attrLabel(key)} +${amount} · ${rep==='professional'?'Profissional':rep==='flair'?'Ginga':'Raça'} +${repAmount}${tag}</small></button>`;
    }).join('')}</div><div class="signature-row"><span>Escolha o caminho que melhor reflete seu estilo como jogador.</span><span>Idade: ${ev.age} anos</span></div></article></section>`;
    
    document.querySelectorAll('[data-choice]').forEach(b=>b.addEventListener('click',()=>{
      const [label,key,amount,rep,repAmount,pos]=ev.choices[b.dataset.choice];
      let mod = amount;
      const reg = regionDisplay(state.region);
      if (reg==='Norte'||state.region==='North') mod *= 0.85;
      state.attributes[key] += mod;
      state.reputation[rep] += repAmount;
      if (ev.isPositionChoice && pos) state.position = pos;
      addMessage('Diário da juventude', `Aos ${ev.age} anos, sua escolha foi: ${label}.${pos?` Você passa a atuar como ${pos==='defender'?'zagueiro':pos==='midfielder'?'meio-campista':'atacante'}.`:''}`);
      state.youthStep += 1; state.age += 1; save(); render();
    }));
  }

  /* ── Tela Principal do Simulador (Desktop) ───────────────────────── */
  function renderDesktop(tab) {
    const active = tab||'calendar';
    const names = {calendar:'Calendário',messages:`Mensagens ${state.unreadMessagesCount?`(${state.unreadMessagesCount})`:''}`,documents:'Mundo',news:'Notícias',career:'Carreira',finance:'Finanças',family:'Família',social:'Redes Sociais',photos:'Fotos',leagues:'Ligas',records:'Recordes'};
    const clubMatch = active.match(/^club:(.+)$/);
    const winTitle = clubMatch ? (clubData(clubMatch[1])?.name||'Clube') : (names[active]||'Simulador');
    const w = currentWeek();
    const weekLabel = w ? (w.type==='free'?'Semana livre':'Semana de jogo') : 'Fim de temporada';
    const reg = regionDisplay(state.region);

    app.innerHTML = `<section class="sim-desktop"><header class="sim-menu"><strong>Footlife</strong><span>Arquivo&nbsp;&nbsp; Opções&nbsp;&nbsp; Ações&nbsp;&nbsp; Exibir&nbsp;&nbsp; Ajuda</span><button id="reset">Nova Carreira</button></header><div class="sim-toolbar"><button data-tab="calendar">▣ Calendário</button><button data-tab="messages">✉ Mensagens ${state.unreadMessagesCount?`<span class="unread-badge">${state.unreadMessagesCount}</span>`:''}</button><button data-tab="family">👨‍👩‍👦 Família</button><button data-tab="news">▧ Notícias</button><button data-tab="leagues">▦ Ligas</button><span>${weekLabel} · Ano ${state.currentYear} (${state.age} anos)${state.nickname?' · '+state.nickname:''}</span></div><div class="sim-workspace">
      <aside class="tracker-window"><div class="window-title">Ficha de ${state.surname} <b>×</b></div><div class="tracker-content"><div class="portrait" style="background:none;border:none">${renderAvatarSVG(state.visuals)}</div><h2>${state.name}</h2>${state.nickname?`<span class="nickname-badge">${state.nickname}</span>`:''}<p>Brasil (${reg})<br>${state.playerClub} · ${positionLabel()} · Pé ${footLabel(state.foot)}</p>
      
      <!-- Painel de Reputação e Fama -->
      <div style="margin:10px 0;padding:8px;background:#fff;border:1px solid #94a2a9">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px">
          <span>Alinhamento:</span>
          <b style="color:${(state.reputationScore||0)>0?'#398143':(state.reputationScore||0)<0?'#a31818':'#596773'}">
            ${reputationLabel()} (${(state.reputationScore||0)>0?'+':''}${state.reputationScore||0})
          </b>
        </div>
        <div class="reputation-bar" style="background:#e0e0e0;height:12px;position:relative;overflow:hidden;border:1px solid #7794a0">
          <div style="position:absolute;left:50%;top:0;bottom:0;width:2px;background:#7794a0;z-index:1"></div>
          ${(state.reputationScore||0) > 0 ? 
            `<div class="reputation-fill good" style="position:absolute;top:0;bottom:0;left:50%;width:${(state.reputationScore||0)/2}%;background:#398143"></div>` : 
            (state.reputationScore||0) < 0 ? 
            `<div class="reputation-fill bad" style="position:absolute;top:0;bottom:0;right:50%;width:${Math.abs(state.reputationScore||0)/2}%;background:#a31818"></div>` : ''
          }
          <div class="reputation-marker" style="left:${50 + (state.reputationScore||0)/2}%;position:absolute;top:-2px;width:6px;height:16px;background:#111;z-index:2;transform:translateX(-50%);box-shadow:0 0 4px rgba(0,0,0,0.5)"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:9px;color:#71818e;margin-top:2px">
          <span>Rebelde (-100)</span>
          <span>Neutro (0)</span>
          <span>Bom Moço (+100)</span>
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:11px">
          <span>Nível de Fama:</span>
          <span class="fame-badge">★ ${state.fame} Fama</span>
        </div>
      </div>

      <table class="tracker-table"><tr><th>Gols</th><td>${state.goals}</td></tr><tr><th>Assistências</th><td>${state.assists}</td></tr><tr><th>Partidas</th><td>${state.matches}</td></tr><tr><th>Nota média</th><td>${state.matchRatings.length?calculateMatchRating().toFixed(1):'—'}</td></tr><tr><th>Melhor em Campo</th><td>${state.motmCount}</td></tr><tr><th>Dinheiro</th><td>R$ ${state.money}</td></tr><tr><th>Seguidores</th><td>${state.followers}</td></tr></table>
      <h3>Energia (Stamina)</h3><div class="stamina-bar"><div class="stamina-fill" style="width:${state.stamina}%;background:${staminaColor()}"></div></div><span style="font-size:11px;color:${staminaColor()}">${state.stamina}/100</span>
      <h3>Atributos Principais</h3>${Object.keys(state.attributes).map(k=>`<div class="attribute-line"><span>${attrLabel(k)}</span><i style="width:${attr(k)*5}%"></i><b>${attrDisplay(k)}</b></div>`).join('')}
      <div class="attribute-line" style="color:#b8860b"><span>Sorte</span><i style="width:${state.luck*5}%;background:#b8860b"></i><b>${state.luck.toFixed(1)}</b></div>
      </div></aside>
      
      <main class="main-window"><div class="window-title">${winTitle} <b>×</b></div><div class="main-content"><div class="icon-strip">${[['calendar','▣'],['messages','✉'],['family','👨‍👩‍👦'],['news','▧'],['leagues','▦'],['records','★'],['career','◎'],['finance','$'],['social','@']].map(([id,ic])=>`<button class="small-icon ${active===id?'active':''}" data-tab="${id}"><span>${ic}</span>${names[id]}</button>`).join('')}</div>${desktopContent(active)}</div></main>
    </div></section>`;

    document.querySelectorAll('[data-tab]').forEach(b=>b.addEventListener('click',()=>renderDesktop(b.dataset.tab)));
    document.querySelector('#reset').addEventListener('click',reset);
    const playBtn=document.querySelector('#play-match'); if(playBtn) playBtn.addEventListener('click',beginMatch);
    const endFreeBtn=document.querySelector('#end-free-week'); if(endFreeBtn) endFreeBtn.addEventListener('click',()=>{ processWeeklyLifeEvents(); state.scheduleIndex+=1; state.trainingsThisWeek=0; state.stamina=Math.min(100,state.stamina+20+getStaminaRecoveryBonus()); save(); renderDesktop('calendar'); });
    
    /* Botão Avançar Ano */
    const nextYearBtn = document.querySelector('#next-year-btn');
    if (nextYearBtn) nextYearBtn.onclick = () => {
      const article = `Resumo da temporada do ano ${state.currentYear}: ${state.name} encerra a temporada com ${state.goals} gols e ${state.assists} assistências pelo ${playerClub()}. Alinhamento: ${reputationLabel()}, Fama: ${state.fame}.`;
      addNews(`Balanço da Temporada de ${state.currentYear}`, article);
      state.currentYear += 1;
      state.age += 1;
      state.schedule = buildSchedule(true);
      state.scheduleIndex = 0;
      state.playoffPhase = '';
      state.fixtures = buildFixtures();
      state.table = blankTable();
      state.goals = 0;
      state.assists = 0;
      state.matchRatings = [];
      state.motmCount = 0;
      save(); renderDesktop('calendar');
    };

    /* Botões de Treino e Ações Fora de Campo */
    document.querySelectorAll('[data-train]').forEach(b=>b.addEventListener('click',()=>{
      const a=b.dataset.train; const maxT=currentWeek()?.type==='free' ? 2 : 1;
      if(state.trainingsThisWeek>=maxT) return;
      const activeTab = state.activeTab || 'calendar';
      if(a==='rest'){
        state.stamina=Math.min(100,state.stamina+35);
        addMessage('Diário pessoal','Um dia inteiro de descanso e relaxamento. Você se sente recuperado.');
        state.trainingsThisWeek += 1;
        save(); renderDesktop(activeTab);
      }
      else if(a==='study'){
        if(state.stamina<10)return;
        state.stamina-=10;
        state.tacticalBonus=3;
        addMessage('Técnica Mara','Você dedicou a noite para analisar vídeos dos adversários. Sente-se taticamente preparado.');
        state.trainingsThisWeek += 1;
        save(); renderDesktop(activeTab);
      }
      else if(a==='goOut'){
        if(state.stamina<15) return;
        state.stamina -= 15;
        state.trainingsThisWeek += 1;
        const sc = goOutScenarios[Math.floor(Math.random()*goOutScenarios.length)];
        showPopupModal(sc.title, sc.text, 'Voltar', () => {});
        setTimeout(() => {
          const content = document.querySelector('.popup-modal-content');
          if (content) {
            content.innerHTML = `<h2>${sc.title}</h2><p>${sc.text}</p><div style="display:flex;flex-direction:column;gap:6px;margin:12px 0">${sc.choices.map((c,i)=>`<button class="paper-choice" data-goout-choice="${i}" type="button" style="text-align:left;padding:10px"><strong>${c[0]}</strong><br><small style="color:#596773">${c[1]}</small></button>`).join('')}</div><button class="classic-button" id="modal-cancel-btn" style="width:100%">Cancelar</button>`;
            document.querySelectorAll('[data-goout-choice]').forEach(btn => btn.onclick = () => {
              const idx = Number(btn.dataset.gooutChoice);
              sc.choices[idx][2]();
              state.popupModal = null;
              document.querySelector('#modal-overlay')?.remove();
              save(); renderDesktop(activeTab);
            });
            document.querySelector('#modal-cancel-btn').onclick = () => {
              state.popupModal = null;
              document.querySelector('#modal-overlay')?.remove();
              save(); renderDesktop(activeTab);
            };
          }
        }, 50);
      }
      else {
        if(state.stamina<15)return;
        state.stamina-=15;
        state.attributes[a]=Math.min(20,state.attributes[a]+0.3);
        addMessage('Relatório de treino',`Sessão intensa com foco em ${attrLabel(a).toLowerCase()}. Pequena evolução no fundamento.`);
        state.trainingsThisWeek += 1;
        save(); renderDesktop(activeTab);
      }
    }));

    /* Botões da Loja Web */
    document.querySelectorAll('[data-web-store]').forEach(b => b.onclick = () => { state.activeWebStore = b.dataset.webStore; renderDesktop('finance'); });
    document.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => handlePurchase(b.dataset.buy));
    document.querySelectorAll('[data-buy-vehicle]').forEach(b => b.onclick = () => handleVehiclePurchase(b.dataset.buyVehicle));
    document.querySelectorAll('[data-buy-home]').forEach(b => b.onclick = () => handleHomePurchase(b.dataset.buyHome));
    document.querySelectorAll('[data-private-train]').forEach(b => b.onclick = () => {
      const a = b.dataset.privateTrain;
      state.attributes[a] = Math.min(20, state.attributes[a] + 0.2);
      state.privateTrainingPending = false;
      addMessage('Treinador particular', `Treino individualizado de ${attrLabel(a).toLowerCase()}. Evolução de +0.2 conquistada.`);
      save(); renderDesktop('finance');
    });

    /* Marcar mensagem lida */
    document.querySelectorAll('[data-msg-idx]').forEach(m => m.onclick = () => {
      const idx = Number(m.dataset.msgIdx);
      if (state.messages[idx]) { state.messages[idx].read = true; state.unreadMessagesCount = state.messages.filter(msg => !msg.read).length; save(); renderDesktop('messages'); }
    });

    /* Links de Clubes */
    document.querySelectorAll('[data-club]').forEach(l=>l.addEventListener('click',e=>{e.preventDefault();renderDesktop('club:'+l.dataset.club);}));
    const backBtn=document.querySelector('#back-to-leagues'); if(backBtn) backBtn.addEventListener('click',()=>renderDesktop('leagues'));
  }

  /* ── Gerenciadores de Compras ───────────────────────────────────── */
  function handleVehiclePurchase(id) {
    const v = vehicleItems.find(i=>i.id===id);
    if (!v || state.money < v.price) return;
    state.money -= v.price;
    state.purchases.vehicle = id;
    showPopupModal('Compra em veiculos.com', `Parabéns pela aquisição! Você comprou o(a) ${v.name} por R$ ${v.price}. Bônus passivo de recuperação de energia +${v.regen}/semana.`, 'Excelente', () => {});
    save(); renderDesktop('finance');
  }

  function handleHomePurchase(id) {
    const h = homeItems.find(i=>i.id===id);
    if (!h || state.money < h.price) return;
    state.money -= h.price;
    state.purchases.home = id;
    showPopupModal('Compra em imoveis.com', `Você adquiriu o imóvel: ${h.name}! Seus pais (${state.family.mother.name} e ${state.family.father.name}) estão transbordando de orgulho e gratidão!`, 'Orgulho da Família +100', () => {
      state.reputationScore = Math.min(100, (state.reputationScore||0)+15);
      addMessage('Família', `Essa conquista da nova moradia (${h.name}) significa o mundo para nós. Temos muito orgulho da sua trajetória, ${state.firstName}!`);
    });
    save(); renderDesktop('finance');
  }

  /* ── Renderização das Abas do Desktop ────────────────────────────── */
  function desktopContent(tab) {
    const news = state.news.length ? state.news.map(i=>`<article class="diary-entry"><b>${i.stamp}</b><strong>${i.headline}</strong><p>${i.body}</p></article>`).join('') : '<p>Nenhuma notícia no momento.</p>';

    /* Aba Família */
    if (tab==='family') {
      const f = state.family;
      const reg = regionDisplay(f.region);
      return `<h1>Família e Residência</h1>
        <section class="classic-panel">
          <h2>A Família ${state.surname}</h2>
          <p>Origem: <b>Brasil (${reg})</b> · Condição Social: <b>${f.wealthPercentile<=5?'Entre os 5% de maior renda (Alta Renda)':`Entre os ${f.wealthPercentile}% mais humildes`}</b></p>
          <p>Acordo financeiro: <b>${f.titheRate>0?'50% dos ganhos repassados aos pais (até os 18 anos)':'0% de repasse (Família de alta renda)'}</b></p>
        </section>
        <h2>Membros da Família</h2>
        <table class="tracker-table large">
          <tr><th>Mãe</th><td>${f.mother.name} ${f.mother.surname} (${f.mother.profession}) — <b style="color:${(f.mother.status==='Vivo'||f.mother.status==='Viva'||f.mother.status==='Alive')?'#398143':'#a31818'}">${f.mother.status==='Deceased'?'Falecida':f.mother.status}</b></td></tr>
          <tr><th>Pai</th><td>${f.father.name} ${f.father.surname} (${f.father.profession}) — <b style="color:${(f.father.status==='Vivo'||f.father.status==='Viva'||f.father.status==='Alive')?'#398143':'#a31818'}">${f.father.status==='Deceased'?'Falecido':f.father.status}</b></td></tr>
          <tr><th>Moradia Atual</th><td>${homeItems.find(i=>i.id===state.purchases.home)?.name || 'Casa dos Pais'}</td></tr>
        </table>`;
    }

    /* Aba Calendário */
    if (tab==='calendar') {
      const w = currentWeek();
      const seasonOver = !w || state.playoffPhase==='eliminated' || state.playoffPhase==='champion';
      let topPanel = '';
      if (seasonOver) {
        const champMsg = state.playoffPhase==='champion' ? '<p>🏆 <b>Parabéns! Você é o campeão da Liga Nacional Aurora!</b></p>' : '';
        topPanel = `<section class="classic-panel"><h1>Temporada encerrada (${state.currentYear})</h1>${champMsg}<p>Colocação final na liga: <b>${standings().findIndex(([c])=>c===playerClub())+1}º lugar</b>.</p><button class="classic-button" id="next-year-btn" style="padding:8px 16px;font-size:14px">Avançar para o próximo ano (5 semanas de pré-temporada) →</button></section>`;
      } else if (w.type==='free') {
        topPanel = `<section class="classic-panel" style="border-left:3px solid #398143"><h1>🏖 Semana Livre</h1><p>Sem jogo oficial nesta semana. Aproveite para descansar, treinar ou sair para construir reputação e vida social.</p><p>Energia atual: <b style="color:${staminaColor()}">${state.stamina}/100</b></p><button class="classic-button" id="end-free-week">Avançar para a próxima semana →</button></section>`;
      } else {
        const opp = getCurrentOpponent();
        const oppData = clubData(opp);
        const [home,away] = getPlayerFixture();
        const fixName = `${home} x ${away}`;
        const label = w.type==='semi'?'Semifinal do Campeonato':w.type==='final'?'Grande Final do Campeonato':(state.matches?'Rodada de Jogo':'Estreia no Profissional');
        topPanel = `<section class="classic-panel"><h1>${label}</h1><p><b>Confronto:</b> ${fixName} ${oppData?`(Força do Adversário: ${oppData.rating})`:''}</p><p>Energia: <b style="color:${staminaColor()}">${state.stamina}/100</b></p><button class="classic-button" id="play-match" style="background:#0d58a6;color:#fff">Ir para a partida →</button></section>`;
      }

      /* Lista Completa de Jogos */
      let calList = '<h2 style="margin-top:20px">Calendário da Temporada</h2><div class="calendar-list">';
      state.schedule.forEach((entry,idx) => {
        const isCur = idx===state.scheduleIndex;
        const isPast = idx<state.scheduleIndex;
        if (entry.type==='free') {
          calList += `<div class="calendar-item ${isPast?'past':''} ${isCur?'current':''} free"><span class="cal-week">SEM ${idx+1}</span><span class="cal-icon">${isPast?'✅':isCur?'🏖':'📅'}</span><span>${entry.label||'Semana livre'}</span><span></span><span></span></div>`;
        } else if (entry.type==='match') {
          const round = state.fixtures[entry.fixtureIndex];
          const fix = round?round.find(p=>p.includes(playerClub())):null;
          const [h,a] = fix||[playerClub(),'???'];
          if (isPast && entry.result) {
            calList += `<div class="calendar-item past"><span class="cal-week">SEM ${idx+1}</span><span class="cal-icon">✅</span><span>R${entry.round} ${entry.result.fixture} <b>${entry.result.score}</b></span><span class="rating-badge ${ratingClass(entry.result.rating)}">${entry.result.rating.toFixed(1)}</span><span>${entry.result.motm?'<span class="motm-badge">⭐ MELHOR EM CAMPO</span>':''}</span></div>`;
          } else {
            calList += `<div class="calendar-item ${isCur?'current':''}"><span class="cal-week">SEM ${idx+1}</span><span class="cal-icon">${isCur?'▶':'📅'}</span><span>R${entry.round} ${h} x ${a}</span><span></span><span></span></div>`;
          }
        } else if (entry.type==='semi'||entry.type==='final') {
          const label = entry.type==='semi'?'Semifinal':'Grande Final';
          if (isPast && entry.result) {
            calList += `<div class="calendar-item past playoff"><span class="cal-week">🏆</span><span class="cal-icon">✅</span><span>${label}: ${entry.result.fixture} <b>${entry.result.score}</b></span><span class="rating-badge ${ratingClass(entry.result.rating)}">${entry.result.rating.toFixed(1)}</span><span>${entry.result.motm?'<span class="motm-badge">⭐ MELHOR EM CAMPO</span>':''}</span></div>`;
          } else {
            calList += `<div class="calendar-item ${isCur?'current':''} playoff"><span class="cal-week">🏆</span><span class="cal-icon">${isCur?'▶':'📅'}</span><span>${label}: ${playerClub()} x ${entry.opponent}</span><span></span><span></span></div>`;
          }
        }
      });
      calList += '</div>';

      return topPanel + (seasonOver ? '' : renderCareerTab(true)) + calList;
    }

    if (tab==='messages') {
      return `<h1>Caixa de Mensagens</h1><section class="message-list">${state.messages.map((m,i)=>`<article data-msg-idx="${i}" style="cursor:pointer;background:${m.read?'#fff':'#fff8e1'}"><b>De: ${m.from}</b> ${!m.read?'<span class="unread-badge">NÃO LIDA</span>':''}<p>${m.text}</p></article>`).join('')||'<p>Nenhuma mensagem recebida.</p>'}</section>`;
    }
    if (tab==='news') return `<h1>Notícias & Imprensa</h1>${news}`;
    if (tab==='leagues') return `<h1>Liga Nacional Aurora</h1><table class="league-table"><tr><th>#</th><th>Clube</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th><th>Pts</th></tr>${standings().map(([c,r],i)=>`<tr class="${c===playerClub()?'your-club':''}"><td>${i+1}</td><td><a href="#" class="club-link" data-club="${c}">${c}</a></td><td>${r.p}</td><td>${r.w}</td><td>${r.d}</td><td>${r.l}</td><td>${r.gf-r.ga}</td><td>${r.pts}</td></tr>`).join('')}</table>`;
    if (tab==='records') return `<h1>Livro de Recordes do Futebol</h1><table class="league-table"><tr><th>Recorde</th><th>Detentor</th><th>Marca</th><th>Ano</th></tr>${state.records.map(r=>`<tr class="${r.holder===state.name?'your-club':''}"><td>${r.label}</td><td>${r.holder}</td><td>${r.value}</td><td>${r.year}</td></tr>`).join('')}</table>`;
    if (tab==='career') return renderCareerTab();
    if (tab==='finance') return renderFinanceTab();
    if (tab==='social') return renderSocialTab();
    if (tab.startsWith('club:')) {
      const cn = tab.slice(5);
      const cl = clubData(cn);
      if (!cl) return '<h1>Detalhes do Clube</h1><p>Clube não encontrado.</p>';
      const row = state.table[cn] || { p:0, w:0, d:0, l:0, gf:0, ga:0, pts:0 };
      const st = cl.stats || { gk: 10, def: 10, mid: 10, att: 10 };
      return `<div class="club-detail">
        <div class="club-header" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <h1 style="margin:0">${cl.name}</h1>
          <button class="classic-button" id="back-to-leagues">← Voltar à tabela de classificação</button>
        </div>
        <p style="margin-bottom:15px;color:#596773"><em>"${cl.nickname}"</em></p>

        <h2 style="font-size:14px;color:var(--blue);border-bottom:1px solid #1d629e;padding-bottom:4px;margin-bottom:8px">Atributos do Elenco</h2>
        <div class="club-info-grid" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:15px;background:#fff;padding:10px;border:1px solid #94a2a9">
          <div><b>Goleiro (GOL)</b><span style="display:block;font-size:16px;font-weight:bold;color:#0d58a6">${st.gk || 10}</span></div>
          <div><b>Defesa (DEF)</b><span style="display:block;font-size:16px;font-weight:bold;color:#0d58a6">${st.def || 10}</span></div>
          <div><b>Meio-campo (MEI)</b><span style="display:block;font-size:16px;font-weight:bold;color:#0d58a6">${st.mid || 10}</span></div>
          <div><b>Ataque (ATA)</b><span style="display:block;font-size:16px;font-weight:bold;color:#0d58a6">${st.att || 10}</span></div>
        </div>

        <h2 style="font-size:14px;color:var(--blue);border-bottom:1px solid #1d629e;padding-bottom:4px;margin-bottom:8px">Informações do Clube</h2>
        <div class="club-info-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:15px;background:#fff;padding:10px;border:1px solid #94a2a9">
          <div><b>Cidade</b><span>${cl.city}</span></div>
          <div><b>Região</b><span>${cl.region}</span></div>
          <div><b>Cores</b><span>${cl.colors}</span></div>
          <div><b>Estilo Tático</b><span>${cl.style}</span></div>
          <div><b>Orçamento</b><span>${cl.budget}</span></div>
          <div><b>Força Geral</b><span>${cl.rating}</span></div>
        </div>

        <h2 style="font-size:14px;color:var(--blue);border-bottom:1px solid #1d629e;padding-bottom:4px;margin-bottom:8px">Instalações de Treinamento</h2>
        <div class="attribute-line career" style="margin:10px 0;background:#fff;padding:8px;border:1px solid #94a2a9">
          <span>Nível da Estrutura</span>
          <i style="width:${cl.facilities*5}%"></i>
          <b>${cl.facilities}/20</b>
        </div>

        <h2 style="font-size:14px;color:var(--blue);border-bottom:1px solid #1d629e;padding-bottom:4px;margin-bottom:8px">História & Tradição</h2>
        <div class="club-history" style="background:#fff;padding:10px;border:1px solid #94a2a9;margin-bottom:15px">
          <p>${cl.history}</p>
        </div>

        <h2 style="font-size:14px;color:var(--blue);border-bottom:1px solid #1d629e;padding-bottom:4px;margin-bottom:8px">Desempenho na Temporada</h2>
        <table class="league-table">
          <tr><th>J</th><th>V</th><th>E</th><th>D</th><th>GP</th><th>GC</th><th>SG</th><th>Pts</th></tr>
          <tr class="${cn === playerClub() ? 'your-club' : ''}">
            <td>${row.p}</td>
            <td>${row.w}</td>
            <td>${row.d}</td>
            <td>${row.l}</td>
            <td>${row.gf}</td>
            <td>${row.ga}</td>
            <td>${row.gf - row.ga}</td>
            <td>${row.pts}</td>
          </tr>
        </table>
      </div>`;
    }
    return `<p>Dados do Mundo</p>`;
  }

  /* ── Aba Carreira ───────────────────────────────────────────────── */
  function renderCareerTab(hideTable = false) {
    const form = formArrow();
    const maxT = currentWeek()?.type==='free' ? 2 : 1;
    const remaining = maxT - (state.trainingsThisWeek||0);
    const trainingOpts = [
      {id:'rest',label:'Descansar',cost:'+35 recuperação',gain:'Recuperar energia',icon:'🛌'},
      {id:'finishing',label:'Treinar finalização',cost:'-15 energia',gain:'finalização +0.3',icon:'⚽'},
      {id:'passing',label:'Treinar passe',cost:'-15 energia',gain:'passe +0.3',icon:'🎯'},
      {id:'dribbling',label:'Treinar drible',cost:'-15 energia',gain:'drible +0.3',icon:'💨'},
      {id:'pace',label:'Treinar velocidade',cost:'-15 energia',gain:'velocidade +0.3',icon:'🏃'},
      {id:'goOut',label:'Sair (Vida Social)',cost:'-15 energia',gain:'Seguidores / Reputação / Sorte',icon:'🎉'},
    ];
    const grid = trainingOpts.map(o=>{
      const dis = remaining<=0 || (o.id!=='rest' && state.stamina<15);
      return `<button class="training-card ${dis?'disabled':''}" data-train="${o.id}" ${dis?'disabled':''}><span style="font-size:20px">${o.icon}</span><strong>${o.label}</strong><small class="training-cost">${o.cost}</small><small class="training-gain">${o.gain}</small></button>`;
    }).join('');

    const heading = `<div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:20px;margin-bottom:10px"><h2>Treinos & Ações Fora de Campo</h2><span style="font-size:12px;background:#e8f5e8;color:#1b5e20;padding:2px 8px;border-radius:4px;border:1px solid #398143">Ações restantes: <b>${remaining}/${maxT}</b></span></div>`;

    if (hideTable) {
      return `${heading}<div class="choice-grid">${grid}</div>`;
    }

    return `<h1>Histórico da Carreira</h1>
      <table class="tracker-table large">
        <tr><th>Clube</th><td>${playerClub()}</td></tr>
        <tr><th>Posição</th><td>${positionLabel()}</td></tr>
        <tr><th>Gols Marcados</th><td>${state.goals}</td></tr>
        <tr><th>Assistências</th><td>${state.assists}</td></tr>
        <tr><th>Alinhamento</th><td>${reputationLabel()}</td></tr>
        <tr><th>Fama</th><td>★ ${state.fame}</td></tr>
      </table>
      ${heading}
      <div class="choice-grid">${grid}</div>`;
  }

  /* ── Itens da Loja de Equipamentos e Treino ──────────────────────── */
  const shopItems = [
    { id:'boots', name:'Chuteiras de Alta Performance', price:500, desc:'Chuteiras modernas de excelente aderência e controle de bola.', effect:'drible +0.3, velocidade +0.2', oneTime:true },
    { id:'nutritionist', name:'Acompanhamento Nutricional', price:1000, desc:'Programa personalizado de nutrição e regeneração física.', effect:'Recuperação de energia +10 por descanso', oneTime:true },
    { id:'phone', name:'Celular Top de Linha', price:800, desc:'Câmera de alta resolução para vídeos com maior alcance nas redes.', effect:'+50 seguidores, +20% ganho de seguidores', oneTime:true },
    { id:'privateTraining', name:'Treinador Particular', price:500, desc:'Sessão individual focada com um especialista.', effect:'Escolha um atributo: +0.2', oneTime:false },
  ];

  function handlePurchase(id) {
    const item = shopItems.find(i=>i.id===id);
    if (!item || state.money < item.price) return;
    if (item.oneTime && state.purchases[id]) return;
    state.money -= item.price;
    if (item.oneTime) state.purchases[id] = true;
    switch(id) {
      case 'boots': state.attributes.dribbling=Math.min(20,state.attributes.dribbling+0.3); state.attributes.pace=Math.min(20,state.attributes.pace+0.2); addMessage('Rouparia do clube','Suas novas chuteiras proporcionam um toque de bola fantástico.'); break;
      case 'nutritionist': state.staminaRecoveryBonus+=10; addMessage('Departamento de Nutrição','Seu novo plano alimentar vai acelerar sua recuperação física.'); break;
      case 'phone': state.followers+=50; state.followerMultiplier=1.2; addMessage('Redes sociais','Vídeos com qualidade profissional! Seus seguidores aumentam mais rápido.'); break;
      case 'privateTraining': state.privateTrainingPending=true; break;
    }
    save(); renderDesktop('finance');
  }

  /* ── Aba Finanças ───────────────────────────────────────────────── */
  function renderFinanceTab() {
    const store = state.activeWebStore || 'shop';
    let storeHtml = '';
    
    if (store === 'shop') {
      storeHtml = shopItems.map(item => {
        const owned = item.oneTime && state.purchases[item.id];
        const cantAfford = state.money < item.price;
        const dis = owned || cantAfford;
        return `<div class="shop-item ${owned?'purchased':''} ${cantAfford&&!owned?'cannot-afford':''}">
          <strong>${item.name}</strong>
          <span class="shop-price">R$ ${item.price}</span>
          <p>${item.desc}</p>
          <small class="training-gain">${item.effect}</small>
          <button class="classic-button" data-buy="${item.id}" ${dis?'disabled':''}>${owned?'Adquirido ✓':'Comprar'}</button>
        </div>`;
      }).join('');
    } else if (store === 'vehicles') {
      storeHtml = vehicleItems.map(v => {
        const owned = state.purchases.vehicle === v.id;
        const cantAfford = state.money < v.price;
        return `<div class="shop-item ${owned?'purchased':''} ${cantAfford&&!owned?'cannot-afford':''}">
          <span style="font-size:24px">${v.icon}</span>
          <strong>${v.name}</strong>
          <span class="shop-price">R$ ${v.price}</span>
          <p>${v.desc}</p>
          <small class="training-gain">+${v.regen} Recuperação de energia</small>
          <button class="classic-button" data-buy-vehicle="${v.id}" ${owned||cantAfford?'disabled':''}>${owned?'Adquirido ✓':'Comprar'}</button>
        </div>`;
      }).join('');
    } else {
      storeHtml = homeItems.map(h => {
        const owned = state.purchases.home === h.id;
        const cantAfford = state.money < h.price;
        return `<div class="shop-item ${owned?'purchased':''} ${cantAfford&&!owned?'cannot-afford':''}">
          <span style="font-size:24px">${h.icon}</span>
          <strong>${h.name}</strong>
          <span class="shop-price">${h.price===0?'Grátis':'R$ '+h.price}</span>
          <p>${h.desc}</p>
          <button class="classic-button" data-buy-home="${h.id}" ${owned||cantAfford?'disabled':''}>${owned?'Adquirido ✓':'Comprar'}</button>
        </div>`;
      }).join('');
    }

    const privatePick = (store==='shop' && state.privateTrainingPending) ? `<div class="private-training-pick" style="margin-top:15px;padding:12px;border:1px dashed #b8860b;background:#fff8e1"><h3>Escolha um atributo para aprimorar (+0.2)</h3><div class="choice-grid">${['finishing','passing','dribbling','pace','composure','workRate'].map(k=>`<button class="paper-choice" data-private-train="${k}"><strong>${attrLabel(k).toUpperCase()}</strong></button>`).join('')}</div></div>` : '';

    return `<h1>Gestão Financeira</h1>
      <table class="tracker-table large">
        <tr><th>Saldo Disponível</th><td>R$ ${state.money}</td></tr>
        <tr><th>Renda Semanal de Redes (1% seguidores)</th><td>+R$ ${Math.floor(state.followers/100)}</td></tr>
        <tr><th>Meio de Transporte</th><td>${vehicleItems.find(i=>i.id===state.purchases.vehicle)?.name || 'Nenhum'}</td></tr>
        <tr><th>Moradia Atual</th><td>${homeItems.find(i=>i.id===state.purchases.home)?.name || 'Casa dos Pais'}</td></tr>
      </table>

      <div class="web-store-nav" style="margin-top:15px">
        <button class="${store==='shop'?'active':''}" data-web-store="shop">🛍️ Equipamentos & Treino</button>
        <button class="${store==='vehicles'?'active':''}" data-web-store="vehicles">🚗 veiculos.com</button>
        <button class="${store==='homes'?'active':''}" data-web-store="homes">🏠 imoveis.com</button>
      </div>

      ${privatePick}
      <div class="shop-grid">${storeHtml}</div>`;
  }

  /* ── Modelos de Postagens em Redes Sociais ──────────────────────── */
  const socialTemplates = {
    hatTrick: [
      { h:'@MesaRedondaAurora', t:'QUE ATUAÇÃO! Hat-trick de {name}! Três gols no mesmo jogo. Esse garoto tem estrela demais! 🔥🎩', s:'positive' },
      { h:'@TorcidaPortoClaro', t:'Três gols de {name}! O estádio foi ao delírio completo hoje! ⚽⚽⚽', s:'positive' },
    ],
    poker: [
      { h:'@MesaRedondaAurora', t:'QUATRO GOLS! {name} destruiu a defesa do {opponent} esta noite. Atuação histórica!', s:'positive' },
      { h:'@CriticaEsportivaBR', t:'Uma das atuações individuais mais impressionantes que já vi. {name} com {goals} gols na partida.', s:'positive' },
    ],
    goal: [
      { h:'@LigaAuroraAoVivo', t:'GOL! {name} marca para o {club}! Já são {totalGoals} gols na temporada.', s:'positive' },
      { h:'@estrela_porto_oficial', t:'GOOOOOOL! É DELE! {name} balança as redes! 🌟', s:'positive' },
    ],
    motm: [
      { h:'@TorcidaPortoClaro', t:'{name} com nota {rating}. O melhor em campo com sobras! Craque do jogo! 🏆', s:'positive' },
      { h:'@TaticaBR', t:'Melhor em Campo: {name}. Uma verdadeira aula de futebol.', s:'positive' },
    ],
    win: [
      { h:'@estrela_porto_oficial', t:'Mais três pontos na conta! {name} e o time entregaram tudo em campo! 💪', s:'positive' },
      { h:'@LigaAuroraAoVivo', t:'O {club} sobe na tabela após a grande vitória por {score}.', s:'neutral' },
    ],
    loss: [
      { h:'@CriticaEsportivaBR', t:'Noite apagada de {name}. Com nota {rating}, vai precisar mostrar mais serviço na próxima rodada.', s:'negative' },
      { h:'@TorcidaPortoClaro', t:'Resultado frustrante hoje. Mas seguimos apoiando rumo ao próximo jogo. 💙💛', s:'negative' },
    ],
    draw: [
      { h:'@TaticaBR', t:'Empate movimentado. {name} teve bons momentos, mas faltou o gol da vitória.', s:'neutral' },
    ],
    record: [
      { h:'@LigaAuroraAoVivo', t:'RECORDE HISTÓRICO! {name} é o novo detentor do recorde. O nome está na história! 📖', s:'positive' },
    ],
    nickname: [
      { h:'@MesaRedondaAurora', t:'A imprensa e a torcida já apelidaram {name} de \'{nickname}\'. Nasce um novo ídolo.', s:'positive' },
    ],
    champion: [
      { h:'@LigaAuroraAoVivo', t:'É CAMPEÃO! O {club} conquista o troféu da Liga Nacional Aurora! 🏆🏆🏆', s:'positive' },
      { h:'@TorcidaPortoClaro', t:'{name} foi gigante! NÓS SOMOS CAMPEÕES! Que momento inesquecível! 🎉🎉🎉', s:'positive' },
    ]
  };

  function addSocialPost(category, extraVars = {}) {
    const pool = socialTemplates[category]; if (!pool||!pool.length) return;
    const tmpl = pool[Math.floor(Math.random()*pool.length)];
    const vars = { name:state.shirtName||state.surname||state.name, club:playerClub(), opponent:getCurrentOpponent(), totalGoals:state.goals, goals:state.matchGoalsThisGame, score:`${state.score.you}-${state.score.them}`, rating:calculateMatchRating().toFixed(1), nickname:state.nickname, ...extraVars };
    let txt = tmpl.t; for (const [k,v] of Object.entries(vars)) txt=txt.replace(new RegExp(`{${k}}`,'g'), v);
    state.socialFeed.unshift({ handle:tmpl.h, text:txt, sentiment:tmpl.s, stamp:`Partida ${state.matches}` });
    if (state.socialFeed.length > 50) state.socialFeed.length = 50;
  }

  function generatePostMatchSocial(rating, isMotm, recordBroken = false) {
    const g = state.matchGoalsThisGame;
    if (g >= 4) addSocialPost('poker');
    else if (g >= 3) addSocialPost('hatTrick');
    else if (g >= 1) addSocialPost('goal');
    if (isMotm) addSocialPost('motm');
    if (recordBroken) addSocialPost('record');
    if (state.score.you > state.score.them) addSocialPost('win');
    else if (state.score.you < state.score.them) addSocialPost('loss');
    else addSocialPost('draw');
  }

  /* ── Aba Redes Sociais ──────────────────────────────────────────── */
  function renderSocialTab() {
    const reachLabel = state.followers<200?'Local':state.followers<500?'Em Ascensão':state.followers<1000?'Regional':state.followers<3000?'Nacional':'Estrela da Mídia';
    return `<h1>Redes Sociais</h1>
      <section class="classic-panel">
        <h2>${state.followers} seguidores</h2>
        <p>Seu alcance na internet é classificado como <b>${reachLabel}</b>. ${state.purchases.phone?'Seu novo celular ajuda seus vídeos a irem mais longe e engajarem mais.':'Comprar um celular moderno na loja pode acelerar o crescimento do seu público.'}</p>
      </section>
      <h2>Feed de Publicações</h2>
      <div class="social-feed">${state.socialFeed.length?state.socialFeed.map(p=>`<div class="social-post ${p.sentiment}"><b>${p.handle}</b><p>${p.text}</p><small>${p.stamp}</small></div>`).join(''):'<div style="padding:12px;color:#596773">Nenhuma movimentação nas redes sociais ainda. Dispute partidas para movimentar a internet.</div>'}</div>`;
  }

  /* ── Gerador de Textos dos Momentos da Partida ──────────────────── */
  function generatePhase1Text(stat, flair, success) {
    if (!success) {
      const fails = [
        'Você perde o equilíbrio e escorrega no gramado.',
        'A jogada foi facilmente prevista e desarmada pela marcação.',
        'Você hesita por um segundo e a oportunidade se fecha.',
        'Domínio pesado! A bola escapa do seu controle.'
      ];
      return fails[Math.floor(Math.random()*fails.length)];
    }
    let p = '';
    if (stat === 'finishing') {
      if (flair.includes('Pancada')) p = `Você solta uma pancada com extrema força em direção ao ${['ângulo','teto da rede','canto rasteiro'].sort(()=>.5-Math.random())[0]}`;
      else if (flair.includes('Colocado')) p = `Você ajeita o corpo e bate colocado com muita categoria no ${['canto distante','lado oposto'].sort(()=>.5-Math.random())[0]}`;
      else p = `Você toca por cobertura com extrema sutileza encobrindo a zaga`;
    } else if (stat === 'passing') {
      p = `Você descola um lindo passe através das linhas de marcação`;
    } else if (stat === 'dribbling') {
      p = `Com um drible desconcertante, você deixa o zagueiro na saudade`;
    } else if (stat === 'workRate') {
      p = `Você faz uma leitura cirúrgica do lance e aplica um desarme perfeito`;
    } else {
      p = `Você executa a jogada com enorme técnica e personalidade`;
    }
    return p + '!';
  }

  /* ── Ações de Ginga e Habilidade Secundária ──────────────────────── */
  function getFlairActions(stat) {
    if (stat === 'finishing') {
      return [
        { name: '💥 Pancada Forte', mainStat: 'finishing', secStat: 'workRate', riskMod: 0, desc: 'Finalização potente usando toda a força física.' },
        { name: '🎯 Chute Colocado', mainStat: 'finishing', secStat: 'composure', riskMod: 1, desc: 'Chute com curva e categoria exigindo frieza.' },
        { name: '🥄 Cavadinha Sutil', mainStat: 'finishing', secStat: 'dribbling', riskMod: 2, desc: 'Finalização por cobertura com toque sutil de craque.' }
      ];
    } else if (stat === 'passing') {
      return [
        { name: '👟 Passe Seguro', mainStat: 'passing', secStat: 'composure', riskMod: -2, desc: 'Distribuição simples e segura para manter a posse.' },
        { name: '🗡️ Passe em Profundidade', mainStat: 'passing', secStat: 'pace', riskMod: 0, desc: 'Lançamento buscando o atacante nas costas da zaga.' },
        { name: '🚀 Cruzamento na Área', mainStat: 'passing', secStat: 'workRate', riskMod: 2, desc: 'Bola alçada com veneno no miolo da área adversária.' }
      ];
    } else if (stat === 'dribbling') {
      return [
        { name: '⚡ Arrancada', mainStat: 'dribbling', secStat: 'pace', riskMod: -1, desc: 'Tocar a bola na frente e disparar no mano a mano.' },
        { name: '🕺 Pedalada', mainStat: 'dribbling', secStat: 'composure', riskMod: 0, desc: 'Finta com o corpo para desequilibrar a marcação.' },
        { name: '🌰 Caneta / Rolinho', mainStat: 'dribbling', secStat: 'finishing', riskMod: 2, desc: 'Passar a bola por entre as pernas do rival com audácia.' }
      ];
    } else if (stat === 'workRate') {
      return [
        { name: '🛡️ Bote em Pé', mainStat: 'workRate', secStat: 'composure', riskMod: -2, desc: 'Posicionamento disciplinado e desarme no tempo exato.' },
        { name: '🛑 Carrinho Certeiro', mainStat: 'workRate', secStat: 'pace', riskMod: 1, desc: 'Entrada deslizante e decidida para travar a jogada.' },
        { name: '🏃 Cercar e Pressionar', mainStat: 'workRate', secStat: 'dribbling', riskMod: -1, desc: 'Acompanhar a passada do rival forçando o erro.' }
      ];
    } else if (stat === 'pace') {
      return [
        { name: '🏃 Arrancada em Linha Reta', mainStat: 'pace', secStat: 'workRate', riskMod: -1, desc: 'Ganhar na velocidade pura e no vigor físico.' },
        { name: '💨 Cortar para o Meio', mainStat: 'pace', secStat: 'dribbling', riskMod: 0, desc: 'Acelerar e cortar para o meio buscando finalizar.' },
        { name: '🎯 Cruzamento em Velocidade', mainStat: 'pace', secStat: 'passing', riskMod: 1, desc: 'Cruzar com precisão sem diminuir o embalo da corrida.' }
      ];
    } else {
      return [
        { name: '🧘 Proteger a Bola', mainStat: 'composure', secStat: 'workRate', riskMod: -2, desc: 'Fazer o pivô com o corpo sob forte pressão do rival.' },
        { name: '🔄 Girar e Escapar', mainStat: 'composure', secStat: 'dribbling', riskMod: 0, desc: 'Girar o corpo saindo da blitz da marcação.' },
        { name: '🚀 Bico para Frente', mainStat: 'composure', secStat: 'passing', riskMod: -1, desc: 'Sem inventar: isolar a bola para o campo de ataque.' }
      ];
    }
  }

  function getSecondaryMod(secStat) {
    const val = attr(secStat);
    const lbl = attrLabel(secStat).toUpperCase();
    if (val >= 10.0) return { mod: -1, badge: '+1 Bônus', color: '#398143', desc: `${lbl} ≥ 10.0 (+1 Bônus na Rolagem)` };
    if (val < 6.5) return { mod: 1, badge: '-1 Penalidade', color: '#a31818', desc: `${lbl} < 6.5 (-1 Penalidade na Rolagem)` };
    return { mod: 0, badge: 'Neutro', color: '#71818e', desc: `${lbl} Padrão` };
  }

  /* ── Simulação de Ataque do Adversário ───────────────────────────── */
  const oppGoalTexts = [
    '{opp} faz jogada envolvente pelo meio e finaliza no canto.',
    'Uma falha na marcação permite ao {opp} marcar o gol.',
    '{opp} marca em jogada de bola parada. Cabeceio fulminante e indefensável.',
    'Um chute de longe do {opp} encontra o cantinho da rede.',
    '{opp} puxa um contragolpe fulminante e conclui com precisão.',
    'Cruzamento na área encontra o atacante do {opp} livre para empurrar pro gol.'
  ];

  function simulateOppositionAttackBetween(fromMin, toMin) {
    const opp = getCurrentOpponent();
    const oppClubData = clubData(opp);
    const oppR = oppClubData?.rating || 70;
    const myClubData = clubData(playerClub());
    const myR = myClubData?.rating || 70;
    
    const rDiff = oppR - myR;
    const defWins = state.matchDefensiveWins || 0;
    const defRed = defWins * 3;
    
    const chance = Math.max(4, 12 + rDiff / 2 - defRed / (state.matchMoments?.length || 4));
    
    if (Math.random() * 100 < chance) {
      const min = Math.min(90, Math.max(fromMin + 1, fromMin + Math.floor(Math.random() * Math.max(1, toMin - fromMin - 1))));
      state.score.them += 1;
      const tmpl = oppGoalTexts[Math.floor(Math.random() * oppGoalTexts.length)].replace(/\{opp\}/g, opp);
      state.matchEvents.push({ minute: min, text: tmpl });
      state.matchEvents.sort((a, b) => a.minute - b.minute);
      state.morale = Math.max(0, (state.morale || 50) - 10);
      return true;
    }
    return false;
  }

  /* ── Execução da Partida e Resolução D20 ─────────────────────────── */
  function beginMatch() {
    state.phase='match'; state.matchStep=0; state.score={you:0,them:0}; state.matchOutcome=null;
    state.matchFinished=false; state.interviewDone=false;
    state.morale = 50; state.moralePower = 0;
    state.matchGoalsThisGame=0; state.matchAssistsThisGame=0; state.matchSuccesses=0; state.matchFailures=0;
    
    const myClub = clubData(playerClub()) || {rating:60};
    const oppClub = clubData(getCurrentOpponent()) || {rating:60};
    
    let numEvents = 3 + Math.floor(Math.random()*2);
    if (state.stamina >= 90) numEvents += 2;
    else if (state.stamina >= 70) numEvents += 1;
    else if (state.stamina < 40) numEvents -= 1;

    const luckRoll = rollD20();
    const luckValue = state.luck || 7.0;
    if (luckRoll <= luckValue) numEvents += 1;

    if (myClub.rating > oppClub.rating + 8) numEvents += 1;
    if (myClub.rating < oppClub.rating - 8) numEvents -= 1;

    numEvents = Math.max(2, Math.min(7, numEvents));

    const poolA = ['finishing','finishing','finishing','dribbling','passing','workRate'];
    const poolM = ['passing','passing','dribbling','dribbling','finishing','workRate','pace'];
    const poolD = ['workRate','workRate','workRate','passing','composure','pace'];
    const pool = state.position === 'attacker' ? poolA : state.position === 'midfielder' ? poolM : poolD;

    state.matchMoments = [];
    const minStep = Math.floor(90 / numEvents);
    for (let i=0; i<numEvents; i++) {
      const stat = pool[Math.floor(Math.random() * pool.length)];
      const min = Math.floor(i * minStep + Math.random() * (minStep - 5) + 3);
      let title = '', text = '';
      if (stat === 'finishing') { title = 'Chance Clara de Gol'; text = 'Abre-se espaço na entrada da área para a finalização.'; }
      else if (stat === 'passing') { title = 'Visão de Jogo'; text = 'Você observa seu companheiro atacando o espaço livre.'; }
      else if (stat === 'dribbling') { title = 'Duelo 1 contra 1'; text = 'Você encara a marcação individual na ponta.'; }
      else if (stat === 'pace') { title = 'Contra-Ataque Rápido'; text = 'A bola é lançada em velocidade nas costas da zaga.'; }
      else if (stat === 'workRate') { title = 'Duelo Defensivo'; text = 'O time adversário avança perigosamente em direção à sua área.'; }
      else { title = 'Sob Forte Pressão'; text = 'Você recebe a bola recuada com os adversários pressionando em bloco.'; }
      state.matchMoments.push({ minute: min, title, text, stat });
    }

    state.matchEvents = [{ minute: 1, text: `Apito inicial! Começa ${playerClub()} x ${getCurrentOpponent()}` }];
    simulateOppositionAttackBetween(2, state.matchMoments[0]?.minute || 15);
    state.stamina = Math.max(0, state.stamina-40);
    save(); render();
  }

  function renderMatch() {
    if (state.matchOutcome) return renderMatchOutcome();
    const moment = state.matchMoments[state.matchStep];
    if (!moment) return finishMatch();

    const moraleEmoji = (state.morale||50)>=60?'🔥':(state.morale||50)>=40?'😐':'⚠️';
    const hasPower = (state.moralePower||0)>0;
    const powerLabel = hasPower?` · Confiança: +${Math.round(state.moralePower)}%`:'';
    const opp = getCurrentOpponent();

    const actions = getFlairActions(moment.stat);
    const hideProb = state.options.hideProbabilities;

    const choices = actions.map((act, idx) => {
      const secInfo = getSecondaryMod(act.secStat);
      const baseTarget = calculatePhase1Target(act.mainStat);
      const p1Target = Math.max(2, baseTarget + act.riskMod + secInfo.mod);
      const probText = hideProb ? `Atributo Principal: ${attrLabel(act.mainStat).toUpperCase()}` : `Rolagem Alvo: ${p1Target}+ no D20`;
      
      return `<button class="paper-choice match-action" data-flair-idx="${idx}" type="button" style="text-align:left;padding:10px;width:100%;margin-bottom:8px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong>${act.name}</strong>
          <span style="font-size:11px;background:${secInfo.color};color:#fff;padding:2px 6px;border-radius:3px">${attrLabel(act.secStat).toUpperCase()} (${secInfo.badge})</span>
        </div>
        <small style="display:block;margin-top:4px;color:#596773">${act.desc}</small>
        <small style="display:block;margin-top:3px;color:#0d58a6;font-weight:bold">${probText}</small>
      </button>`;
    }).join('');

    app.innerHTML = `<section class="match-shell">
      <header class="match-header"><span>RODADA DE JOGO · ${playerClub().toUpperCase()} x ${opp.toUpperCase()}</span><button id="leave-match">Salvar e sair</button></header>
      <div class="scoreboard"><strong>${playerClub().toUpperCase()}</strong><b>${state.score.you} — ${state.score.them}</b><strong>${opp.toUpperCase()}</strong><span>${moment.minute}'</span></div>
      <div class="morale-bar-container"><span class="morale-label">${moraleEmoji} Moral da Equipe: ${Math.round(state.morale||50)}%${powerLabel}</span><div class="morale-meter"><div class="stamina-fill" style="width:${state.morale||50}%;background:${(state.morale||50)>=60?'#398143':(state.morale||50)>=40?'#b8860b':'#a31818'}"></div></div></div>
      <div class="flat-pitch"><div class="pitch-line mid"></div><div class="pitch-box left"></div><div class="pitch-box right"></div><div class="marker you">${state.shirtName||'VOCÊ'}</div><div class="marker opposition one">D</div><div class="marker opposition two">D</div><div class="ball"></div></div>
      <div class="match-layout">
        <article class="moment-panel">
          <p class="match-label">${moment.minute}' · MOMENTO DECISIVO (${state.matchStep+1} de ${state.matchMoments.length})</p>
          <h1>${moment.title}</h1>
          <p>${moment.text}</p>
          <div class="d20-phase-box">
            <p style="margin:0 0 8px"><b>Escolha sua Ação (${attrLabel(moment.stat).toUpperCase()}):</b></p>
            <div>${choices}</div>
            ${hasPower?`<div style="margin-top:10px"><button class="confidence-btn" id="conf-boost-btn" type="button" style="width:100%">🔥 Ativar bônus de confiança (+2 na próxima rolagem de D20)</button></div>`:''}
          </div>
        </article>
        <aside class="event-window"><div class="window-title">Registro do Jogo</div><div>${state.matchEvents.map(e=>`<p><b>${e.minute}'</b> ${e.text}</p>`).join('')}</div></aside>
      </div>
    </section>`;

    let useConf = false;
    const confBtn = document.querySelector('#conf-boost-btn');
    if (confBtn) confBtn.onclick = () => {
      useConf = true;
      confBtn.textContent = '🔥 Confiança ativada! (+2 na rolagem de D20)';
      confBtn.disabled = true;
    };

    const leaveBtn = document.querySelector('#leave-match');
    if (leaveBtn) leaveBtn.onclick = () => { save(); state.phase = 'desktop'; renderDesktop('calendar'); };

    document.querySelectorAll('[data-flair-idx]').forEach(b => b.onclick = () => {
      const idx = Number(b.dataset.flairIdx);
      const chosenAction = actions[idx];
      resolveD20Action(moment, chosenAction, useConf);
    });
  }

  function resolveD20Action(moment, action, useConf = false) {
    const rawRoll = rollD20();
    const p1Roll = useConf ? rawRoll + 2 : rawRoll;
    if (useConf) {
      state.moralePower = 0;
    }

    const secInfo = getSecondaryMod(action.secStat);
    const skillTarget = Math.max(3, Math.round(22 - attr(action.mainStat)));
    const luckMod = Math.round((state.luck || 7.0) - 7.0);
    const baseTarget = Math.max(3, skillTarget - luckMod);
    const p1Target = Math.max(2, baseTarget + action.riskMod + secInfo.mod);
    const p1Success = p1Roll >= p1Target;

    let p2Roll = rollD20();
    const flair = action.name;

    let outcomeTitle = '';
    let narrativeText = '';
    let mathBreakdownHtml = '';

    const luckStr = luckMod !== 0 ? (luckMod > 0 ? ` -${luckMod} sorte` : ` +${Math.abs(luckMod)} azar`) : '';
    const secDetailStr = `${attrLabel(action.mainStat).toUpperCase()} base ${skillTarget}${luckStr}${action.riskMod !== 0 ? (action.riskMod > 0 ? ` +${action.riskMod} risco` : ` ${action.riskMod} seguro`) : ''}${secInfo.mod !== 0 ? (secInfo.mod < 0 ? ` -1 bônus ${attrLabel(action.secStat).toUpperCase()}` : ` +1 penalidade ${attrLabel(action.secStat).toUpperCase()}`) : ''}`;
    const p1MathStr = `<b>Fase 1 (${flair}):</b> Rolou <b>${p1Roll}</b> ${useConf?`(Original: ${rawRoll} + 2 Bônus)`:''} vs Alvo <b>${p1Target}+</b> <span style="color:#596773">(${secDetailStr})</span>`;

    if (!p1Success) {
      state.matchFailures += 1;
      state.morale = Math.max(0, (state.morale||50) - 12);
      outcomeTitle = 'Ação Não Concluída';
      narrativeText = generatePhase1Text(moment.stat, flair, false);
      mathBreakdownHtml = `<div style="background:#f9f9f5;border:1px solid #d0d5d8;border-radius:4px;padding:10px;margin:15px 0;font-size:12px;text-align:left;color:#333">${p1MathStr}</div>`;
    } else {
      state.matchSuccesses += 1;
      state.morale = Math.min(100, (state.morale||50) + 10);
      const oppSt = clubData(getCurrentOpponent())?.stats || { gk: 10, def: 10 };
      const p1Desc = generatePhase1Text(moment.stat, flair, true);
      
      const overkill = p1Roll - p1Target;
      const overkillBonus = Math.floor(overkill / 2);

      let p2MathStr = '';

      if (moment.stat === 'finishing') {
        const baseGkTarget = Math.max(3, 22 - (oppSt.gk||10));
        const gkSaveTarget = Math.min(18, baseGkTarget + overkillBonus);
        const overNote = overkillBonus > 0 ? ` <span style="color:#596773">(Base ${baseGkTarget}+ +${overkillBonus} da precisão do chute)</span>` : '';
        p2MathStr = `<b>Fase 2 (Defesa do Goleiro):</b> Goleiro adversário rolou <b>${p2Roll}</b> vs Alvo de Defesa <b>${gkSaveTarget}+</b>${overNote}`;
        
        if (p2Roll < gkSaveTarget) {
          state.score.you += 1; state.goals += 1; state.matchGoalsThisGame += 1;
          state.morale = Math.min(100, state.morale + 10);
          const gk = ['se estica todo em vão','fica estátua sem reação','até toca na bola com os dedos, mas não evita o gol'][Math.floor(Math.random()*3)];
          outcomeTitle = '⚽ GOL!';
          narrativeText = `${p1Desc} O goleiro adversário ${gk}!`;
        } else {
          const gk = ['opera uma defesa espetacular','espalma na ponta dos dedos','consegue salvar de forma milagrosa com os pés'][Math.floor(Math.random()*3)];
          outcomeTitle = 'Defesa do Goleiro!';
          narrativeText = `${p1Desc} Mas o goleiro ${gk}!`;
        }
      } else if (moment.stat === 'passing') {
        const baseStrikerTarget = 10;
        const strikerScoreTarget = Math.max(4, baseStrikerTarget - overkillBonus);
        const overNote = overkillBonus > 0 ? ` <span style="color:#596773">(Base 10+ -${overkillBonus} do passe açucarado)</span>` : '';
        p2MathStr = `<b>Fase 2 (Conclusão do Companheiro):</b> Atacante rolou <b>${p2Roll}</b> vs Alvo <b>${strikerScoreTarget}+</b>${overNote}`;
        
        if (p2Roll >= strikerScoreTarget) {
          state.score.you += 1; state.assists += 1; state.matchAssistsThisGame += 1;
          state.morale = Math.min(100, state.morale + 10);
          const str = ['chuta de primeira para o fundo da rede','cabeceia firme sem chances para o goleiro','toca com frieza na saída do arqueiro'][Math.floor(Math.random()*3)];
          outcomeTitle = '⚽ ASSISTÊNCIA!';
          narrativeText = `${p1Desc} Seu companheiro de time ${str}!`;
        } else {
          outcomeTitle = 'Passe Concluído (Sem Gol)';
          narrativeText = `${p1Desc} Mas seu companheiro acabou desperdiçando a finalização.`;
        }
      } else if (moment.stat === 'dribbling' || moment.stat === 'pace') {
        const baseDefTarget = Math.max(3, 22 - (oppSt.def||10));
        const defTackleTarget = Math.min(18, baseDefTarget + overkillBonus);
        const overNote = overkillBonus > 0 ? ` <span style="color:#596773">(Base ${baseDefTarget}+ +${overkillBonus} da explosão do drible)</span>` : '';
        p2MathStr = `<b>Fase 2 (Desarme do Zagueiro):</b> Zagueiro adversário rolou <b>${p2Roll}</b> vs Alvo de Desarme <b>${defTackleTarget}+</b>${overNote}`;
        
        if (p2Roll < defTackleTarget) {
          outcomeTitle = 'Sucesso Total na Jogada!';
          narrativeText = `${p1Desc} O defensor não conseguiu se recuperar e você invadiu perigosamente a área!`;
        } else {
          outcomeTitle = 'Desarmado na Recuperação';
          narrativeText = `${p1Desc} Porém, a zaga se recuperou a tempo com um carrinho providencial.`;
        }
      } else {
        const baseAttTarget = 12;
        const attTarget = Math.min(18, baseAttTarget + overkillBonus);
        const overNote = overkillBonus > 0 ? ` <span style="color:#596773">(Base 12+ +${overkillBonus} do posicionamento dominante)</span>` : '';
        p2MathStr = `<b>Fase 2 (Duelo Defensivo):</b> Atacante adversário rolou <b>${p2Roll}</b> vs Alvo de Superação <b>${attTarget}+</b>${overNote}`;
        
        if (p2Roll < attTarget) {
          outcomeTitle = 'Desarme Bem-Sucedido!';
          narrativeText = `${p1Desc} O adversário perdeu a posse sob sua forte marcação!`;
          state.matchDefensiveWins = (state.matchDefensiveWins || 0) + 1;
        } else {
          outcomeTitle = 'Ação Vencida (Passe Escapou)';
          narrativeText = `${p1Desc} No entanto, o adversário conseguiu espirrar a bola antes do desarme completo.`;
        }
      }

      mathBreakdownHtml = `<div style="background:#f9f9f5;border:1px solid #d0d5d8;border-radius:4px;padding:10px;margin:15px 0;font-size:12px;text-align:left;color:#333;display:flex;flex-direction:column;gap:6px"><div>${p1MathStr}</div><div>${p2MathStr}</div></div>`;
    }

    state.moralePower = state.morale > 50 ? (state.morale - 50) / 2 : 0;
    const fullLogText = `Fase 1 [${flair}${useConf?' + Bônus':''}]: ${narrativeText}`;
    state.matchEvents.push({ minute: moment.minute, text: fullLogText });
    state.matchOutcome = { title: outcomeTitle, narrative: narrativeText, breakdown: mathBreakdownHtml, minute: moment.minute };
    save(); renderMatch();
  }

  function renderMatchOutcome() {
    const o = state.matchOutcome || { title: 'Resultado da Jogada', narrative: '', breakdown: '', minute: 90 };
    const fixtureParts = getPlayerFixture();
    const home = fixtureParts[0] || playerClub();
    const away = fixtureParts[1] || 'Adversário';

    app.innerHTML = `<section class="match-shell">
      <header class="match-header"><span>RESULTADO DO LANCE</span></header>
      <div class="scoreboard"><strong>${home.toUpperCase()}</strong><b>${state.score.you} — ${state.score.them}</b><strong>${away.toUpperCase()}</strong><span>${o.minute}'</span></div>
      <article class="outcome-paper" style="max-width:620px;margin:30px auto;padding:24px;text-align:center">
        <h1 style="margin-bottom:12px;color:var(--blue);font-size:22px">${o.title}</h1>
        <p style="font-size:15px;line-height:1.6;margin-bottom:15px;color:#2c3e50">${o.narrative}</p>
        ${o.breakdown||''}
        
        <div class="match-tally-box" style="background:#f9f9f5;border:1px solid #d0d5d8;border-radius:4px;padding:12px;margin:15px 0;text-align:left;font-size:12px;max-height:180px;overflow-y:auto;color:#333">
          <b style="display:block;margin-bottom:6px;color:#1d629e;font-size:13px;border-bottom:1px solid #d0d5d8;padding-bottom:4px">Lances do Jogo</b>
          ${state.matchEvents.map(e => `<div style="margin-bottom:4px"><b>${e.minute}'</b> ${e.text}</div>`).join('')}
        </div>

        <button class="classic-button" id="continue-match" style="width:100%;padding:10px;font-size:14px;margin-top:10px">Continuar partida →</button>
      </article>
    </section>`;

    const contBtn = document.querySelector('#continue-match');
    if (contBtn) {
      contBtn.onclick = () => {
        state.matchOutcome = null;
        const curMin = state.matchMoments[state.matchStep]?.minute || 45;
        const nextMin = state.matchMoments[state.matchStep + 1]?.minute || 88;
        simulateOppositionAttackBetween(curMin, nextMin);
        state.matchStep += 1;
        save(); renderMatch();
      };
    }
  }

  /* ── Checagem de Quebra de Recordes ──────────────────────────────── */
  function updateRecords() {
    let broke = false;
    if (!state.records) return false;
    state.records.forEach(rec => {
      let c = null;
      if (rec.id === 'season_goals') c = state.goals;
      if (rec.id === 'season_assists') c = state.assists;
      if (rec.id === 'youngest_scorer' && state.goals > 0) c = state.age;
      if (c === null) return;
      const brk = rec.lowerIsBetter ? c < rec.value : c > rec.value;
      if (brk) {
        rec.value = c;
        rec.holder = state.name;
        rec.year = state.currentYear || 2026;
        addNews(`Recorde quebrado: ${rec.label}`, `${state.name} estabelece uma nova marca histórica com ${c}${rec.id === 'youngest_scorer' ? ' anos' : ''}.`);
        broke = true;
      }
    });
    return broke;
  }

  function finishMatch() {
    state.phase = 'postMatch';
    state.matchOutcome = null;

    if (!state.matchFinished) {
      state.matchFinished = true;

      const lastMin = state.matchMoments[state.matchMoments.length - 1]?.minute || 80;
      simulateOppositionAttackBetween(lastMin, 90);

      const rating = calculateMatchRating();
      state.matchRatings.push(rating);
      const isMotm = rating >= 9.0;
      if (isMotm) { state.motmCount += 1; state.followers += followerGain(200); state.fame += 2; }
      detectNotableActions(rating, isMotm);
      state.matches += 1;
      
      const passiveRegen = 20 + getStaminaRecoveryBonus();
      state.stamina = Math.min(100, state.stamina + passiveRegen);

      const oppName = getCurrentOpponent();
      const week = currentWeek();
      const isPlayoff = week && (week.type === 'semi' || week.type === 'final');
      const fixtureParts = getPlayerFixture();
      const home = fixtureParts[0] || playerClub();
      const away = fixtureParts[1] || oppName;
      const playerIsHome = home === playerClub();

      if (week && week.type === 'match') {
        applyResult(home, away, playerIsHome ? state.score.you : state.score.them, playerIsHome ? state.score.them : state.score.you);
        simulateOtherFixtures(state.fixtures[week.fixtureIndex]);
      }

      const matchFixture = `${home} x ${away}`;
      const matchScore = `${state.score.you}–${state.score.them}`;

      processWeeklyLifeEvents();

      const curEntry = state.schedule[state.scheduleIndex];
      if (curEntry) {
        curEntry.result = {
          fixture: matchFixture,
          score: matchScore,
          rating: rating,
          motm: isMotm,
          playerGoals: state.matchGoalsThisGame || 0,
          playerAssists: state.matchAssistsThisGame || 0,
          won: state.score.you > state.score.them
        };
      }

      const recordBroken = updateRecords();
      checkNickname();
      generatePostMatchSocial(rating, isMotm, recordBroken);
      addBetweenMatchEvent();

      const g = state.matchGoalsThisGame || 0;
      const score = matchScore;
      const result = state.score.you > state.score.them ? 'vence' : state.score.you === state.score.them ? 'empata' : 'tropeça';

      /* Nota da partida */
      let note = '';
      if (state.matches === 1) note = g > 0 ? `${state.shirtName || state.name} marcou logo em sua estreia profissional!` : 'Primeira partida oficial muito sólida no profissional.';
      else if (g >= 4) note = `${state.shirtName || state.name} marca ${g} gols em uma atuação lendária!`;
      else if (g >= 3) note = `Hat-trick inesquecível de ${state.shirtName || state.name}! Show de bola!`;
      else if (g >= 2) note = `Dois gols e atuação decisiva de ${state.shirtName || state.name}.`;
      else if (g >= 1) note = `${state.shirtName || state.name} balançou as redes com categoria.`;
      else if ((state.matchAssistsThisGame || 0) > 0) note = `${state.shirtName || state.name} foi o maestro das jogadas ofensivas.`;
      else note = 'Atuação segura e profissional dentro de campo.';
      if (isMotm) note += ' Eleito o Melhor em Campo.';

      state.lastMatch = {
        score: matchScore,
        note: note,
        fixture: matchFixture,
        rating: rating,
        goals: g,
        assists: state.matchAssistsThisGame || 0
      };

      /* Notícia de Destaque */
      const headline = isPlayoff
        ? `${state.name} na ${week.type === 'final' ? 'grande final' : 'semifinal'} do campeonato`
        : state.matches === 1 ? `${state.name || 'Jovem talento'} faz sua estreia oficial no futebol profissional`
        : `${state.name} ajuda o ${playerClub()} na rodada da Liga`;
      addNews(headline, `${home} ${playerIsHome ? score : `${state.score.them}–${state.score.you}`} ${away}. ${note} Nota: ${rating.toFixed(1)}.`);

      /* Entrevista / Recado da Comissão Técnica */
      if (g >= 3) addMessage('Zona Mista', 'Os repórteres correm para entrevistar você: "Como é a sensação de marcar um hat-trick histórico?" Você sorri.');
      else if (isMotm) addMessage('Análise de Desempenho', 'Os números confirmam: você foi o melhor jogador em campo na partida de hoje.');
      else if (result === 'tropeça') addMessage('Técnica Mara', 'Resultado difícil, mas cabeça erguida. Vamos corrigir os erros no treino.');
      else addMessage('Técnica Mara', `Fim de jogo: ${home} ${playerIsHome ? score : `${state.score.them}–${state.score.you}`} ${away}. ${note}`);
      
      state.scheduleIndex += 1;
      state.trainingsThisWeek = 0;
      state.tacticalBonus = 0;

      if (isPlayoff) {
        resolvePlayoffResult();
      } else {
        const matchesPlayed = state.schedule.filter((e, i) => i < state.scheduleIndex && e.type === 'match').length;
        if (matchesPlayed >= 14) enterPlayoffs();
      }
    }

    save();

    const rating = state.lastMatch?.rating || 6.0;
    const isMotm = rating >= 9.0;
    const g = state.matchGoalsThisGame || 0;

    if ((g >= 3 || isMotm) && !state.interviewDone) {
      state.interviewDone = true;
      const fName = state.family?.father?.name || 'Pai';
      const mName = state.family?.mother?.name || 'Mãe';
      showPopupModal('Entrevista Coletiva Pós-Jogo', 'Vários repórteres e microfones cercam você após sua atuação brilhante.', 'Recusar', () => {});
      setTimeout(() => {
        const content = document.querySelector('.popup-modal-content');
        if (content) {
          content.innerHTML = `<h2>Entrevista Coletiva Pós-Jogo</h2>
            <p style="margin-bottom:12px">Repórteres cercam você na saída do gramado. Como você responde aos jornalistas?</p>
            <div style="display:flex;flex-direction:column;gap:8px">
              <button class="classic-button" id="good-guy-opt" style="text-align:left;padding:10px"><b>Bom Moço (Dedicar à família):</b> "Dedico essa grande atuação à minha mãe ${mName} e ao meu pai ${fName}." <br><small style="color:#398143">+10 Reputação</small></button>
              <button class="classic-button" id="neutral-opt" style="text-align:left;padding:10px"><b>Neutro (Foco no coletivo):</b> "Foi um grande esforço do grupo todo hoje. Continuamos focados trabalhando duro." <br><small style="color:#0d58a6">+150 Seguidores</small></button>
              <button class="classic-button" id="bad-guy-opt" style="text-align:left;padding:10px"><b>Rebelde / Marrento:</b> "Essa vai direto para os críticos que falaram mal e duvidaram de mim!" <br><small style="color:#a31818">-10 Reputação · +2 Fama</small></button>
              <button class="classic-button" id="decline-opt" style="text-align:left;padding:8px;background:#f5f5f0"><b>Passar Direto:</b> Apenas acenar e não dar declarações à imprensa.</button>
            </div>`;
          
          const closeInterview = (cb) => {
            if (cb) cb();
            state.popupModal = null;
            document.querySelector('#modal-overlay')?.remove();
            save(); renderPostMatch();
          };

          const btnGood = document.querySelector('#good-guy-opt');
          if (btnGood) btnGood.onclick = () => closeInterview(() => { state.reputationScore = Math.min(100, (state.reputationScore||0)+10); });
          const btnNeu = document.querySelector('#neutral-opt');
          if (btnNeu) btnNeu.onclick = () => closeInterview(() => { state.followers += 150; });
          const btnBad = document.querySelector('#bad-guy-opt');
          if (btnBad) btnBad.onclick = () => closeInterview(() => { state.reputationScore = Math.max(-100, (state.reputationScore||0)-10); state.fame += 2; });
          const btnDec = document.querySelector('#decline-opt');
          if (btnDec) btnDec.onclick = () => closeInterview();
        }
      }, 50);
    } else {
      renderPostMatch();
    }
  }

  function generateMatchNote(rating) {
    if (rating >= 9.0) return 'Uma atuação memorável de gala. Imparável dentro das quatro linhas!';
    if (rating >= 8.0) return 'Exibição fantástica. Liderou a equipe com técnica, garra e muita personalidade.';
    if (rating >= 7.0) return 'Participação sólida e muito positiva. Ajudou bastante o coletivo.';
    if (rating >= 5.5) return 'Atuação regular com bons lampejos durante a partida.';
    return 'Um jogo difícil e com poucas oportunidades. É hora de focar nos treinos.';
  }

  function renderPostMatch() {
    const m = state.lastMatch || {
      fixture: `${playerClub()} x ${getCurrentOpponent()}`,
      score: `${state.score?.you || 0}–${state.score?.them || 0}`,
      rating: 6.0,
      note: 'Partida concluída.'
    };
    const form = formArrow();
    const parts = (m.fixture || '').split(/[xv]/i);
    const home = parts[0]?.trim() || playerClub();
    const away = parts[1]?.trim() || 'Adversário';
    const ratingVal = typeof m.rating === 'number' ? m.rating : 6.0;
    const noteText = m.note || generateMatchNote(ratingVal);

    app.innerHTML = `<section class="match-shell">
      <header class="match-header"><span>RESUMO PÓS-JOGO</span></header>
      <div class="scoreboard"><strong>${home.toUpperCase()}</strong><b>${m.score || '0-0'}</b><strong>${away.toUpperCase()}</strong><span>FIM DE JOGO</span></div>
      <article class="match-summary-card" style="width:min(720px,calc(100% - 28px));margin:50px auto">
        <p class="match-label">APITO FINAL</p>
        <h1>Relatório da Partida</h1>
        <p>${noteText}</p>
        <div class="match-summary-grid">
          <div><b>${ratingVal.toFixed(1)}</b><span>Nota</span></div>
          <div><b>${state.matchGoalsThisGame || 0}</b><span>Gols</span></div>
          <div><b>${state.matchAssistsThisGame || 0}</b><span>Assistências</span></div>
          <div><b>${state.matchSuccesses || 0}</b><span>Ações Vencidas</span></div>
          <div><b>${state.matchFailures || 0}</b><span>Ações Perdidas</span></div>
          <div><b style="font-size:16px" class="form-arrow ${form.cls}">${form.arrow}</b><span style="display:block;font-size:10px;color:#596773;text-transform:uppercase">Momento / Forma</span></div>
        </div>
        <button class="classic-button" id="leave-post-match" style="width:100%;margin-top:15px">Retornar à tela principal</button>
      </article>
    </section>`;

    const leaveBtn = document.querySelector('#leave-post-match');
    if (leaveBtn) {
      leaveBtn.onclick = () => {
        state.phase = 'desktop';
        save();
        renderDesktop('calendar');
      };
    }
  }

  function renderPenalties() { renderPostMatch(); }

  // Comandos de depuração e inspeção no console
  window.debugState = state;
  window.debugSave = save;
  window.debugRender = render;
  window.resetGame = reset;
  window.clearSave = () => { localStorage.clear(); location.reload(); };
  window.resetTrainingSlot = () => { state.trainingsThisWeek = 0; save(); render(); };

  render();
})();
