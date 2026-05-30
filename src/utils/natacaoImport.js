import Papa from 'papaparse';

const DAY_MAP = {
  '2ª': 'Seg',
  '3ª': 'Ter',
  '4ª': 'Qua',
  '5ª': 'Qui',
  '6ª': 'Sex',
  sab: 'Sab',
  'sáb': 'Sab',
  dom: 'Dom',
};

export const ADULT_LANES = [1, 2, 5, 6];
export const CHILD_LANES = [3, 4];

export function normalizeCpf(cpf) {
  if (!cpf) return '';
  return String(cpf).replace(/\D/g, '');
}

export function formatCpf(cpf) {
  const d = normalizeCpf(cpf);
  if (d.length !== 11) return cpf || '';
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

export function parsePastaPath(pasta) {
  const parts = String(pasta || '')
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean);

  const modalidadeRaw = parts[0] || 'NATAÇÃO';
  const horarioRaw = parts[1] || '';
  const diasRaw = parts[2] || '';

  const upper = modalidadeRaw.toUpperCase();
  let modality = 'Adulta';
  if (upper.includes('INFANT')) modality = 'Infantil';
  else if (upper.includes('HIDRO')) modality = 'Hidroginástica';

  const timeMatch = horarioRaw.match(/(\d{1,2})\s*h/i);
  const hour = timeMatch ? Number(timeMatch[1]) : 9;
  const time = `${String(hour).padStart(2, '0')}:00`;

  const days = [];
  for (const [token, abbr] of Object.entries(DAY_MAP)) {
    if (diasRaw.toLowerCase().includes(token.toLowerCase())) {
      if (!days.includes(abbr)) days.push(abbr);
    }
  }
  if (days.length === 0) days.push('Seg', 'Qua', 'Sex');

  return {
    modalidadeRaw,
    horarioRaw,
    diasRaw,
    modality,
    time,
    days,
    className: `${modalidadeRaw} · ${time} · ${days.join('/')}`,
  };
}

export function defaultLanesForModality(modality) {
  if (modality === 'Infantil') return [...CHILD_LANES];
  return [...ADULT_LANES];
}

export function defaultLevelForModality(modality) {
  if (modality === 'Infantil') return 'branca';
  if (modality === 'Hidroginástica') return 'leve';
  return 'iniciante';
}

export function parseAlunosCsv(csvText) {
  const parsed = Papa.parse(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length) {
    const msg = parsed.errors.map((e) => e.message).join('; ');
    throw new Error(`CSV inválido: ${msg}`);
  }

  return parsed.data.map((row, index) => ({
    arquivo: row.arquivo || row.file || '',
    nome: (row.nome || row.name || '').trim(),
    cpf: formatCpf(row.cpf || ''),
    pasta: row.pasta || row.folder || '',
    _row: index + 2,
  }));
}

function classKey({ modality, time, days }) {
  return `${modality}|${time}|${days.join(',')}`;
}

function nextId(items) {
  if (!items?.length) return 1;
  return Math.max(...items.map((x) => Number(x.id) || 0)) + 1;
}

export function mergeImportedRows(rows, { students = [], classes = [], replace = false } = {}) {
  const stats = {
    rowsTotal: rows.length,
    studentsCreated: 0,
    studentsUpdated: 0,
    studentsSkipped: 0,
    classesCreated: 0,
    errors: [],
  };

  const nextStudents = replace ? [] : [...students];
  const nextClasses = replace ? [] : [...classes];

  const classByKey = new Map();
  for (const cls of nextClasses) {
    classByKey.set(classKey(cls), cls);
  }

  const studentByCpf = new Map();
  const studentByName = new Map();
  for (const s of nextStudents) {
    const cpf = normalizeCpf(s.cpf);
    if (cpf) studentByCpf.set(cpf, s);
    studentByName.set(s.name?.toLowerCase(), s);
  }

  for (const row of rows) {
    if (!row.nome) {
      stats.studentsSkipped++;
      stats.errors.push({ row: row._row, message: 'Nome vazio' });
      continue;
    }

    const meta = parsePastaPath(row.pasta);
    const key = classKey(meta);
    let turma = classByKey.get(key);

    if (!turma) {
      const classId = Math.max(100, nextId(nextClasses));
      turma = {
        id: classId,
        name: meta.className,
        modality: meta.modality,
        instructorId: 1,
        time: meta.time,
        days: meta.days,
        lanes: defaultLanesForModality(meta.modality),
        maxCapacity: 24,
        students: [],
        capacityByLevel: {},
        minAge: meta.modality === 'Infantil' ? 4 : 14,
        maxAge: meta.modality === 'Infantil' ? 14 : 120,
        swimmingLevels: [],
        importSource: row.pasta,
      };
      nextClasses.push(turma);
      classByKey.set(key, turma);
      stats.classesCreated++;
    }

    const cpfNorm = normalizeCpf(row.cpf);
    let aluno =
      (cpfNorm && studentByCpf.get(cpfNorm)) ||
      studentByName.get(row.nome.toLowerCase());

    if (aluno) {
      aluno.name = row.nome;
      if (row.cpf) aluno.cpf = row.cpf;
      aluno.modality = meta.modality;
      aluno.sourceFile = row.arquivo;
      aluno.sourceFolder = row.pasta;
      if (!aluno.enrolledClasses?.includes(turma.id)) {
        aluno.enrolledClasses = [...(aluno.enrolledClasses || []), turma.id];
      }
      if (!turma.students.includes(aluno.id)) turma.students.push(aluno.id);
      stats.studentsUpdated++;
    } else {
      const id = nextId(nextStudents);
      aluno = {
        id,
        name: row.nome,
        cpf: row.cpf || '',
        age: meta.modality === 'Infantil' ? 8 : 30,
        gender: 'M',
        modality: meta.modality,
        level: defaultLevelForModality(meta.modality),
        swimmingCapacity: 'iniciante',
        medicalCertificate: 'Pendente',
        medicalExpiry: '',
        responsibleName: '',
        responsiblePhone: '',
        status: 'Ativo',
        photoUrl: '',
        registrationDate: new Date().toISOString().split('T')[0],
        frequencyRate: 0,
        paymentsStatus: 'Em Dia',
        monthlyFee: 250,
        preferredTimes: [meta.time],
        enrolledClasses: [turma.id],
        sourceFile: row.arquivo,
        sourceFolder: row.pasta,
      };
      nextStudents.push(aluno);
      if (cpfNorm) studentByCpf.set(cpfNorm, aluno);
      studentByName.set(row.nome.toLowerCase(), aluno);
      turma.students.push(id);
      stats.studentsCreated++;
    }
  }

  return { students: nextStudents, classes: nextClasses, stats };
}

export function buildPoolMap(students, classes, { time, day } = {}) {
  const lanes = [
    { id: 1, name: 'Raia 1', ageGroup: 'adulto', students: [] },
    { id: 2, name: 'Raia 2', ageGroup: 'adulto', students: [] },
    { id: 3, name: 'Raia 3', ageGroup: 'infantil', students: [] },
    { id: 4, name: 'Raia 4', ageGroup: 'infantil', students: [] },
    { id: 5, name: 'Raia 5', ageGroup: 'adulto', students: [] },
    { id: 6, name: 'Raia 6', ageGroup: 'adulto', students: [] },
  ];
  const laneById = Object.fromEntries(lanes.map((l) => [l.id, l]));

  const filteredClasses = classes.filter((cls) => {
    if (time && cls.time !== time) return false;
    if (day && !(cls.days || []).includes(day)) return false;
    return true;
  });

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  for (const cls of filteredClasses) {
    const pool = defaultLanesForModality(cls.modality);
    for (const studentId of cls.students || []) {
      const student = students.find((s) => s.id === studentId);
      if (!student || student.status !== 'Ativo') continue;

      const laneId = pool.sort((a, b) => counts[a] - counts[b])[0] || pool[0];
      counts[laneId] += 1;

      laneById[laneId].students.push({
        id: student.id,
        name: student.name,
        modality: student.modality,
        classId: cls.id,
        className: cls.name,
        time: cls.time,
      });
    }
  }

  return { lanes, filters: { time: time || null, day: day || null } };
}
