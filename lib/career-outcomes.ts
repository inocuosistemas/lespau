type DegreeOutcomeInput = {
  name: string;
  branch: string;
  tags: string[];
};

export type CareerOutcomeInfo = {
  outcomes: string[];
  sourceNote: string;
  sources: Array<{ label: string; url: string }>;
};

const institutionalSources = [
  {
    label: "QEDU - Ministerio de Ciencia, Innovación y Universidades",
    url: "https://www.ciencia.gob.es/qedu"
  },
  {
    label: "EUC/AQU Catalunya - indicadores de calidad e inserción laboral",
    url: "https://estudis.aqu.cat/euc/ca/Comu/QueEsEuc"
  },
  {
    label: "Idescat/AQU - inserción laboral de graduados universitarios",
    url: "https://www.idescat.cat/estad/ilgu"
  }
];

const byPattern: Array<{ pattern: RegExp; outcomes: string[] }> = [
  {
    pattern: /medicina/i,
    outcomes: ["medicina asistencial", "especialidades MIR", "salud publica", "investigacion biomedica", "gestion sanitaria"]
  },
  {
    pattern: /infermer/i,
    outcomes: ["enfermeria hospitalaria", "atencion primaria", "salud comunitaria", "urgencias", "gestion de cuidados"]
  },
  {
    pattern: /psicolog/i,
    outcomes: ["psicologia sanitaria", "recursos humanos", "intervencion social", "educacion", "investigacion"]
  },
  {
    pattern: /farm|nutric|fisioter|odont|veterin/i,
    outcomes: ["asistencia sanitaria", "consulta profesional", "industria y servicios de salud", "prevencion", "investigacion aplicada"]
  },
  {
    pattern: /biomed|biotecn|biologia|gen[eè]tica|bio/i,
    outcomes: ["laboratorios de investigacion", "industria biotecnologica", "analisis clinico", "calidad y regulacion", "I+D"]
  },
  {
    pattern: /qu[ií]mica|f[ií]sica|matem[aà]tiques|estad[ií]stica/i,
    outcomes: ["I+D", "analisis de datos", "industria", "docencia", "consultoria tecnica"]
  },
  {
    pattern: /inform[aà]tica|dades|intel|software|videojocs/i,
    outcomes: ["desarrollo de software", "datos e inteligencia artificial", "ciberseguridad", "sistemas", "producto digital"]
  },
  {
    pattern: /telecom|industrial|mec[aà]nica|el[eè]ctrica|electr[oò]nica|energia|organitzaci[oó]|civil/i,
    outcomes: ["ingenieria de proyectos", "produccion y operaciones", "consultoria tecnica", "calidad", "I+D industrial"]
  },
  {
    pattern: /arquitectura|edificaci[oó]|urbanisme/i,
    outcomes: ["proyectos arquitectonicos", "urbanismo", "rehabilitacion", "direccion de obra", "consultoria tecnica"]
  },
  {
    pattern: /ambientals|geologia|mar/i,
    outcomes: ["gestion ambiental", "consultoria ambiental", "analisis territorial", "educacion ambiental", "administracion publica"]
  },
  {
    pattern: /empresa|direcci[oó]|economia|finances|comptabilitat|m[aà]rqueting|negocis/i,
    outcomes: ["direccion y gestion de empresas", "finanzas", "marketing", "consultoria", "emprendimiento"]
  },
  {
    pattern: /turisme|hoteler/i,
    outcomes: ["gestion turistica", "hoteleria", "eventos", "marketing turistico", "administracion de destinos"]
  },
  {
    pattern: /dret|criminolog/i,
    outcomes: ["abogacia y procura", "asesoria juridica", "administracion publica", "compliance", "consultoria legal"]
  },
  {
    pattern: /educaci[oó]|mestre|pedagog/i,
    outcomes: ["docencia", "orientacion educativa", "educacion no formal", "gestion de centros", "innovacion pedagogica"]
  },
  {
    pattern: /comunicaci[oó]|periodisme|publicitat|audiovisual/i,
    outcomes: ["medios y contenidos", "comunicacion corporativa", "publicidad", "produccion audiovisual", "estrategia digital"]
  },
  {
    pattern: /art|disseny|belles arts|m[uú]sica|cinema/i,
    outcomes: ["diseño y creacion", "produccion cultural", "direccion artistica", "industria audiovisual", "docencia artistica"]
  },
  {
    pattern: /traducci[oó]|lleng|filolog|literatura|humanitats|hist[oò]ria|filosofia/i,
    outcomes: ["edicion y contenidos", "traduccion", "docencia", "gestion cultural", "investigacion y patrimonio"]
  },
  {
    pattern: /pol[ií]tiques|sociolog|relacions|treball social|social/i,
    outcomes: ["intervencion social", "administracion publica", "analisis de politicas", "cooperacion", "investigacion social"]
  },
  {
    pattern: /activitat f[ií]sica|esport/i,
    outcomes: ["entrenamiento deportivo", "gestion deportiva", "actividad fisica y salud", "educacion", "readaptacion deportiva"]
  }
];

export function getCareerOutcomeInfo(degree: DegreeOutcomeInput): CareerOutcomeInfo {
  const text = `${degree.name} ${degree.branch} ${degree.tags.join(" ")}`;
  const match = byPattern.find((item) => item.pattern.test(text));

  return {
    outcomes: match?.outcomes ?? ["gestion de proyectos", "consultoria", "docencia", "administracion publica", "especializacion de posgrado"],
    sourceNote: "Salidas orientativas por familia de grado; contrastables con indicadores de insercion laboral y fichas oficiales.",
    sources: institutionalSources
  };
}
