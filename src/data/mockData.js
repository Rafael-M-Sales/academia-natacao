// Instrutores
export const INSTRUCTORS = [
  { id: 1, name: 'Amanda Costa', specialties: ['Natação Infantil', 'Iniciação'], color: '#41C9E2' },
  { id: 2, name: 'Marcos Silva', specialties: ['Natação Adulta', 'Hidroginástica'], color: '#008DDA' },
  { id: 3, name: 'Juliana Reis', specialties: ['Natação Infantil', 'Hidroginástica'], color: '#00F5D4' },
  { id: 4, name: 'Bruno Neves', specialties: ['Natação Adulta', 'Treinamento'], color: '#4361EE' }
];

// Níveis de natação para crianças
export const SWIMMING_LEVELS_KIDS = [
  { id: 'branca', name: 'Touca Branca', description: 'Adaptação ao meio aquático, flutuação e respiração.', color: '#FFFFFF', textColor: '#0B132B' },
  { id: 'amarela', name: 'Touca Amarela', description: 'Iniciação ao nado crawl e costas (pernada e braçada básica).', color: '#FFD166', textColor: '#0B132B' },
  { id: 'laranja', name: 'Touca Laranja', description: 'Aperfeiçoamento do crawl e costas, introdução ao peito.', color: '#F77F00', textColor: '#FFFFFF' },
  { id: 'verde', name: 'Touca Verde', description: 'Aprimoramento de crawl, costas, peito e iniciação ao borboleta.', color: '#06D6A0', textColor: '#FFFFFF' },
  { id: 'azul', name: 'Touca Azul', description: 'Avançado: domínio dos 4 nados, viradas e resistência.', color: '#118AB2', textColor: '#FFFFFF' }
];

// Níveis de natação para adultos
export const SWIMMING_LEVELS_ADULTS = [
  { id: 'iniciante', name: 'Iniciante', description: 'Perda do medo, flutuação, respiração e crawl básico.' },
  { id: 'intermediario', name: 'Intermediário', description: 'Crawl e costas consolidados, desenvolvimento do peito.' },
  { id: 'avancado', name: 'Avançado', description: 'Domínio dos 4 nados, foco em condicionamento e técnica.' }
];

// Níveis de hidroginástica
export const SWIMMING_LEVELS_HIDRO = [
  { id: 'leve', name: 'Intensidade Leve', description: 'Foco em mobilidade, alongamento e reabilitação física.' },
  { id: 'moderado', name: 'Intensidade Moderada', description: 'Foco em condicionamento aeróbico e fortalecimento muscular.' },
  { id: 'intenso', name: 'Intensidade Alta', description: 'Exercícios dinâmicos de alta resistência, ritmo forte.' }
];

// Critérios de evolução por nível (para orientar o professor)
export const EVOLUTION_CRITERIA = {
  kids: {
    branca: [
      { id: 'k_b_1', label: 'Flutuação dorsal', description: 'Flutua de costas com auxílio mínimo por 10s' },
      { id: 'k_b_2', label: 'Flutuação ventral', description: 'Flutua de barriga com rosto submerso por 5s' },
      { id: 'k_b_3', label: 'Respiração rítmica', description: 'Sopra bolhas e vira o rosto para respirar 5x seguidas' },
      { id: 'k_b_4', label: 'Deslocamento com prancha', description: 'Perna de crawl com prancha por 10m' },
    ],
    amarela: [
      { id: 'k_a_1', label: 'Crawl completo', description: 'Braçada de crawl com respiração lateral por 15m' },
      { id: 'k_a_2', label: 'Costas completo', description: 'Nado de costas com braçada alternada por 15m' },
      { id: 'k_a_3', label: 'Pernada de peito', description: 'Pernada de peito com prancha por 10m' },
      { id: 'k_a_4', label: 'Mergulho simples', description: 'Mergulha e recupera objeto no fundo (1,20m)' },
    ],
    laranja: [
      { id: 'k_l_1', label: 'Crawl 25m', description: 'Crawl contínuo por 25m com respiração bilateral' },
      { id: 'k_l_2', label: 'Costas 25m', description: 'Costas contínuo por 25m com saída na borda' },
      { id: 'k_l_3', label: 'Peito completo', description: 'Nado de peito completo por 15m' },
      { id: 'k_l_4', label: 'Virada simples', description: 'Virada de crawl/costas na borda sem parar' },
    ],
    verde: [
      { id: 'k_v_1', label: 'Borboleta 15m', description: 'Nado borboleta por 15m (iniciação)' },
      { id: 'k_v_2', label: 'Crawl 50m', description: 'Crawl contínuo por 50m com ritmo' },
      { id: 'k_v_3', label: 'Peito 25m', description: 'Peito completo por 25m' },
      { id: 'k_v_4', label: 'Virada olímpica', description: 'Virada olímpica no crawl' },
    ],
  },
  adults: {
    iniciante: [
      { id: 'a_i_1', label: 'Flutuação e respiração', description: 'Flutuação dorsal/ventral e respiração rítmica' },
      { id: 'a_i_2', label: 'Crawl básico 15m', description: 'Braçada e pernada de crawl por 15m' },
      { id: 'a_i_3', label: 'Costas básico 15m', description: 'Nado de costas por 15m' },
      { id: 'a_i_4', label: 'Deslocamento na água', description: 'Confiança para se deslocar sem apoio' },
    ],
    intermediario: [
      { id: 'a_m_1', label: 'Crawl 50m', description: 'Crawl contínuo por 50m com respiração bilateral' },
      { id: 'a_m_2', label: 'Costas 25m', description: 'Costas contínuo por 25m' },
      { id: 'a_m_3', label: 'Peito 25m', description: 'Nado de peito completo por 25m' },
      { id: 'a_m_4', label: 'Aperfeiçoamento técnico', description: 'Viradas simples e ritmo de nado' },
    ],
  },
  hidro: {
    leve: [
      { id: 'h_l_1', label: 'Mobilidade articular', description: 'Realiza alongamentos e amplitude total dos movimentos' },
      { id: 'h_l_2', label: 'Adaptação ao meio', description: 'Executa exercícios aeróbicos leves sem pausa' },
      { id: 'h_l_3', label: 'Coordenação motora', description: 'Coordena braços e pernas em exercícios simultâneos' },
    ],
    moderado: [
      { id: 'h_m_1', label: 'Resistência aeróbica', description: 'Mantém ritmo moderado por 30 min contínuos' },
      { id: 'h_m_2', label: 'Fortalecimento muscular', description: 'Executa séries com equipamentos aquáticos' },
      { id: 'h_m_3', label: 'Exercícios dinâmicos', description: 'Realiza deslocamentos rápidos e mudanças de direção' },
    ],
  },
};

// Raias disponíveis
export const SWIMMING_LANES = [
  { id: 1, name: 'Raia 1', type: 'profunda', ageGroup: 'adulto' },
  { id: 2, name: 'Raia 2', type: 'profunda', ageGroup: 'adulto' },
  { id: 3, name: 'Raia 3', type: 'rasa', ageGroup: 'infantil' },
  { id: 4, name: 'Raia 4', type: 'rasa', ageGroup: 'infantil' },
  { id: 5, name: 'Raia 5', type: 'profunda', ageGroup: 'adulto' },
  { id: 6, name: 'Raia 6', type: 'profunda', ageGroup: 'adulto' }
];

// Horários disponíveis
export const AVAILABLE_TIMES = [
  '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

// Alunos iniciais
export const INITIAL_STUDENTS = [
  // NATAÇÃO INFANTIL
  {
    id: 1,
    name: 'Guilherme Souza Ramos',
    age: 6,
    gender: 'M',
    modality: 'Infantil',
    level: 'amarela',
    swimmingCapacity: 'iniciante',
    medicalCertificate: 'Valido',
    medicalExpiry: '2026-10-15',
    responsibleName: 'Patrícia Souza (Mãe)',
    responsiblePhone: '(11) 98765-4321',
    status: 'Ativo',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    registrationDate: '2025-02-10',
    frequencyRate: 92,
    paymentsStatus: 'Em Dia',
    monthlyFee: 250,
    preferredTimes: ['09:00', '10:00'],
    enrolledClasses: [101]
  },
  {
    id: 2,
    name: 'Mariana Lima Flores',
    age: 8,
    gender: 'F',
    modality: 'Infantil',
    level: 'laranja',
    swimmingCapacity: 'intermediario',
    medicalCertificate: 'Valido',
    medicalExpiry: '2026-09-02',
    responsibleName: 'Roberto Flores (Pai)',
    responsiblePhone: '(11) 97654-3210',
    status: 'Ativo',
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    registrationDate: '2024-08-15',
    frequencyRate: 85,
    paymentsStatus: 'Em Dia',
    monthlyFee: 250,
    preferredTimes: ['10:00'],
    enrolledClasses: [102]
  },
  {
    id: 3,
    name: 'Pedro Henrique Canto',
    age: 5,
    gender: 'M',
    modality: 'Infantil',
    level: 'branca',
    swimmingCapacity: 'iniciante',
    medicalCertificate: 'Vencido',
    medicalExpiry: '2026-04-10',
    responsibleName: 'Juliana Canto (Mãe)',
    responsiblePhone: '(11) 96543-2109',
    status: 'Ativo',
    photoUrl: '',
    registrationDate: '2026-01-20',
    frequencyRate: 75,
    paymentsStatus: 'Atrasado',
    monthlyFee: 250,
    preferredTimes: ['09:00', '14:00'],
    enrolledClasses: [101, 201]
  },
  {
    id: 4,
    name: 'Beatriz Vasconcelos',
    age: 9,
    gender: 'F',
    modality: 'Infantil',
    level: 'verde',
    swimmingCapacity: 'avancado',
    medicalCertificate: 'Valido',
    medicalExpiry: '2026-11-20',
    responsibleName: 'Ana Vasconcelos (Mãe)',
    responsiblePhone: '(11) 95432-1098',
    status: 'Ativo',
    photoUrl: '',
    registrationDate: '2024-05-12',
    frequencyRate: 96,
    paymentsStatus: 'Em Dia',
    monthlyFee: 250,
    preferredTimes: ['10:00'],
    enrolledClasses: [102]
  },
  // NATAÇÃO ADULTA
  {
    id: 6,
    name: 'Carlos Mendes',
    age: 35,
    gender: 'M',
    modality: 'Adulta',
    level: 'intermediario',
    swimmingCapacity: 'intermediario',
    medicalCertificate: 'Valido',
    medicalExpiry: '2026-08-30',
    responsibleName: 'Contato Pessoal',
    responsiblePhone: '(11) 99876-5432',
    status: 'Ativo',
    photoUrl: '',
    registrationDate: '2024-10-05',
    frequencyRate: 88,
    paymentsStatus: 'Em Dia',
    monthlyFee: 350,
    preferredTimes: ['19:00', '20:00'],
    enrolledClasses: [104, 203]
  },
  {
    id: 7,
    name: 'Letícia Gomes',
    age: 28,
    gender: 'F',
    modality: 'Adulta',
    level: 'avancado',
    swimmingCapacity: 'avancado',
    medicalCertificate: 'Valido',
    medicalExpiry: '2026-07-15',
    responsibleName: 'Contato Pessoal',
    responsiblePhone: '(11) 98765-4321',
    status: 'Ativo',
    photoUrl: '',
    registrationDate: '2024-03-20',
    frequencyRate: 94,
    paymentsStatus: 'Em Dia',
    monthlyFee: 350,
    preferredTimes: ['20:00'],
    enrolledClasses: [203]
  },
  {
    id: 8,
    name: 'Fernando Oliveira',
    age: 42,
    gender: 'M',
    modality: 'Adulta',
    level: 'iniciante',
    swimmingCapacity: 'iniciante',
    medicalCertificate: 'Valido',
    medicalExpiry: '2026-12-10',
    responsibleName: 'Contato Pessoal',
    responsiblePhone: '(11) 97654-3210',
    status: 'Ativo',
    photoUrl: '',
    registrationDate: '2025-01-15',
    frequencyRate: 80,
    paymentsStatus: 'Em Dia',
    monthlyFee: 350,
    preferredTimes: ['19:00'],
    enrolledClasses: [104]
  },
  // HIDROGINÁSTICA
  {
    id: 9,
    name: 'Maria da Silva',
    age: 65,
    gender: 'F',
    modality: 'Hidroginástica',
    level: 'leve',
    swimmingCapacity: 'iniciante',
    medicalCertificate: 'Valido',
    medicalExpiry: '2026-06-20',
    responsibleName: 'Contato Pessoal',
    responsiblePhone: '(11) 96543-2109',
    status: 'Ativo',
    photoUrl: '',
    registrationDate: '2024-04-10',
    frequencyRate: 91,
    paymentsStatus: 'Em Dia',
    monthlyFee: 200,
    preferredTimes: ['08:00'],
    enrolledClasses: [103]
  },
  {
    id: 10,
    name: 'Geraldo Ribeiro',
    age: 58,
    gender: 'M',
    modality: 'Hidroginástica',
    level: 'moderado',
    swimmingCapacity: 'intermediario',
    medicalCertificate: 'Valido',
    medicalExpiry: '2026-09-05',
    responsibleName: 'Contato Pessoal',
    responsiblePhone: '(11) 95432-1098',
    status: 'Ativo',
    photoUrl: '',
    registrationDate: '2024-07-22',
    frequencyRate: 87,
    paymentsStatus: 'Em Dia',
    monthlyFee: 200,
    preferredTimes: ['08:00'],
    enrolledClasses: [202]
  },
  {
    id: 11,
    name: 'Antônio Ferreira',
    age: 70,
    gender: 'M',
    modality: 'Hidroginástica',
    level: 'leve',
    swimmingCapacity: 'iniciante',
    medicalCertificate: 'Valido',
    medicalExpiry: '2026-10-12',
    responsibleName: 'Contato Pessoal',
    responsiblePhone: '(11) 94321-0987',
    status: 'Ativo',
    photoUrl: '',
    registrationDate: '2024-06-01',
    frequencyRate: 93,
    paymentsStatus: 'Em Dia',
    monthlyFee: 200,
    preferredTimes: ['08:00'],
    enrolledClasses: [202]
  },
  {
    id: 12,
    name: 'Zuleica Santos',
    age: 62,
    gender: 'F',
    modality: 'Hidroginástica',
    level: 'moderado',
    swimmingCapacity: 'intermediario',
    medicalCertificate: 'Valido',
    medicalExpiry: '2026-08-18',
    responsibleName: 'Contato Pessoal',
    responsiblePhone: '(11) 93210-9876',
    status: 'Ativo',
    photoUrl: '',
    registrationDate: '2024-09-11',
    frequencyRate: 89,
    paymentsStatus: 'Em Dia',
    monthlyFee: 200,
    preferredTimes: ['08:00'],
    enrolledClasses: [103]
  }
];

// Turmas iniciais com suporte a raias e horários
export const INITIAL_CLASSES = [
  // SEGUNDA/QUARTA/SEXTA - INFANTIL
  {
    id: 101,
    name: 'Natação Infantil - Touca Branca/Amarela',
    modality: 'Infantil',
    instructorId: 1,
    time: '09:00',
    days: ['Seg', 'Qua', 'Sex'],
    lanes: [3, 4],
    maxCapacity: 12,
    students: [1, 3],
    capacityByLevel: {
      'branca': 6,
      'amarela': 6
    },
    minAge: 4,
    maxAge: 7,
    swimmingLevels: ['branca', 'amarela']
  },
  {
    id: 102,
    name: 'Natação Infantil - Touca Laranja/Verde',
    modality: 'Infantil',
    instructorId: 3,
    time: '10:00',
    days: ['Seg', 'Qua', 'Sex'],
    lanes: [3, 4],
    maxCapacity: 12,
    students: [2, 4],
    capacityByLevel: {
      'laranja': 6,
      'verde': 6
    },
    minAge: 7,
    maxAge: 10,
    swimmingLevels: ['laranja', 'verde', 'azul']
  },
  // SEGUNDA/QUARTA/SEXTA - ADULTA
  {
    id: 104,
    name: 'Natação Adulta - Iniciante/Intermediário',
    modality: 'Adulta',
    instructorId: 2,
    time: '19:00',
    days: ['Seg', 'Qua', 'Sex'],
    lanes: [1, 2],
    maxCapacity: 12,
    students: [6, 8],
    capacityByLevel: {
      'iniciante': 6,
      'intermediario': 6
    },
    minAge: 18,
    maxAge: 120,
    swimmingLevels: ['iniciante', 'intermediario']
  },
  // SEGUNDA/QUARTA/SEXTA - HIDROGINÁSTICA
  {
    id: 103,
    name: 'Hidroginástica - Melhor Idade (Leve)',
    modality: 'Hidroginástica',
    instructorId: 3,
    time: '08:00',
    days: ['Seg', 'Qua', 'Sex'],
    lanes: [],
    maxCapacity: 20,
    students: [9, 12],
    capacityByLevel: {
      'leve': 20
    },
    minAge: 50,
    maxAge: 120,
    swimmingLevels: ['leve']
  },
  // TERÇA/QUINTA - INFANTIL
  {
    id: 201,
    name: 'Natação Infantil - Adaptação Iniciante',
    modality: 'Infantil',
    instructorId: 1,
    time: '14:00',
    days: ['Ter', 'Qui'],
    lanes: [3, 4],
    maxCapacity: 12,
    students: [3],
    capacityByLevel: {
      'branca': 12
    },
    minAge: 4,
    maxAge: 7,
    swimmingLevels: ['branca']
  },
  // TERÇA/QUINTA - ADULTA AVANÇADA
  {
    id: 203,
    name: 'Natação Adulta - Alta Performance',
    modality: 'Adulta',
    instructorId: 4,
    time: '20:00',
    days: ['Ter', 'Qui'],
    lanes: [1, 2, 5, 6],
    maxCapacity: 12,
    students: [7],
    capacityByLevel: {
      'avancado': 12
    },
    minAge: 18,
    maxAge: 120,
    swimmingLevels: ['avancado']
  },
  // TERÇA/QUINTA - HIDROGINÁSTICA
  {
    id: 202,
    name: 'Hidroginástica - Funcional Moderado',
    modality: 'Hidroginástica',
    instructorId: 2,
    time: '08:00',
    days: ['Ter', 'Qui'],
    lanes: [],
    maxCapacity: 20,
    students: [10, 11],
    capacityByLevel: {
      'moderado': 20
    },
    minAge: 50,
    maxAge: 120,
    swimmingLevels: ['moderado']
  }
];

// Histórico de presenças
export const PRESENCE_HISTORY = [
  { studentId: 1, classId: 101, date: '2026-05-18', status: 'Presente' },
  { studentId: 3, classId: 101, date: '2026-05-18', status: 'Falta' },
  { studentId: 2, classId: 102, date: '2026-05-18', status: 'Presente' },
  { studentId: 4, classId: 102, date: '2026-05-18', status: 'Presente' },
  { studentId: 9, classId: 103, date: '2026-05-18', status: 'Presente' },
  { studentId: 12, classId: 103, date: '2026-05-18', status: 'Presente' },
  { studentId: 6, classId: 104, date: '2026-05-18', status: 'Presente' },
  { studentId: 8, classId: 104, date: '2026-05-18', status: 'Falta' },
  { studentId: 7, classId: 203, date: '2026-05-18', status: 'Presente' }
];

// Funcionários
export const INITIAL_EMPLOYEES = [
  {
    id: 1,
    name: 'Amanda Costa',
    role: 'Instrutor',
    salary: 3500,
    phone: '(11) 99876-5432',
    status: 'Ativo',
    attendanceRate: 98,
    hireDate: '2023-01-15'
  },
  {
    id: 2,
    name: 'Marcos Silva',
    role: 'Instrutor',
    salary: 3500,
    phone: '(11) 98765-4321',
    status: 'Ativo',
    attendanceRate: 96,
    hireDate: '2023-03-20'
  },
  {
    id: 3,
    name: 'Juliana Reis',
    role: 'Instrutor',
    salary: 3500,
    phone: '(11) 97654-3210',
    status: 'Ativo',
    attendanceRate: 97,
    hireDate: '2023-06-10'
  },
  {
    id: 4,
    name: 'Bruno Neves',
    role: 'Instrutor',
    salary: 3500,
    phone: '(11) 96543-2109',
    status: 'Ativo',
    attendanceRate: 95,
    hireDate: '2023-08-05'
  },
  {
    id: 5,
    name: 'Carla Mendes',
    role: 'Recepcionista',
    salary: 2000,
    phone: '(11) 95432-1098',
    status: 'Ativo',
    attendanceRate: 99,
    hireDate: '2024-01-10'
  },
  {
    id: 6,
    name: 'Roberto Santos',
    role: 'Manutenção',
    salary: 2200,
    phone: '(11) 94321-0987',
    status: 'Ativo',
    attendanceRate: 94,
    hireDate: '2023-11-15'
  }
];

// Presença de funcionários
export const EMPLOYEE_PRESENCE = [
  { employeeId: 1, date: '2026-05-21', status: 'Presente' },
  { employeeId: 2, date: '2026-05-21', status: 'Presente' },
  { employeeId: 3, date: '2026-05-21', status: 'Presente' },
  { employeeId: 4, date: '2026-05-21', status: 'Presente' },
  { employeeId: 5, date: '2026-05-21', status: 'Presente' },
  { employeeId: 6, date: '2026-05-21', status: 'Presente' }
];
