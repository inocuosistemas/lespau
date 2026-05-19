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
    label: "QEDU - Ministeri de Ciència, Innovació i Universitats",
    url: "https://www.ciencia.gob.es/qedu"
  },
  {
    label: "EUC/AQU Catalunya - indicadors de qualitat i inserció laboral",
    url: "https://estudis.aqu.cat/euc/ca/Comu/QueEsEuc"
  },
  {
    label: "Idescat/AQU - inserció laboral de persones graduades universitàries",
    url: "https://www.idescat.cat/estad/ilgu"
  }
];

const byPattern: Array<{ pattern: RegExp; outcomes: string[] }> = [
  {
    pattern: /medicina/i,
    outcomes: ["medicina assistencial", "especialitats MIR", "salut pública", "recerca biomèdica", "gestió sanitària"]
  },
  {
    pattern: /infermer/i,
    outcomes: ["infermeria hospitalària", "atenció primària", "salut comunitària", "urgències", "gestió de cures"]
  },
  {
    pattern: /psicolog/i,
    outcomes: ["psicologia sanitària", "recursos humans", "intervenció social", "educació", "recerca"]
  },
  {
    pattern: /farm|nutric|fisioter|odont|veterin/i,
    outcomes: ["assistència sanitària", "consulta professional", "indústria i serveis de salut", "prevenció", "recerca aplicada"]
  },
  {
    pattern: /biomed|biotecn|biologia|gen[eè]tica|bio/i,
    outcomes: ["laboratoris de recerca", "indústria biotecnològica", "anàlisi clínica", "qualitat i regulació", "R+D"]
  },
  {
    pattern: /qu[ií]mica|f[ií]sica|matem[aà]tiques|estad[ií]stica/i,
    outcomes: ["R+D", "anàlisi de dades", "indústria", "docència", "consultoria tècnica"]
  },
  {
    pattern: /inform[aà]tica|dades|intel|software|videojocs/i,
    outcomes: ["desenvolupament de software", "dades i intel·ligència artificial", "ciberseguretat", "sistemes", "producte digital"]
  },
  {
    pattern: /telecom|industrial|mec[aà]nica|el[eè]ctrica|electr[oò]nica|energia|organitzaci[oó]|civil/i,
    outcomes: ["enginyeria de projectes", "producció i operacions", "consultoria tècnica", "qualitat", "R+D industrial"]
  },
  {
    pattern: /arquitectura|edificaci[oó]|urbanisme/i,
    outcomes: ["projectes arquitectònics", "urbanisme", "rehabilitació", "direcció d'obra", "consultoria tècnica"]
  },
  {
    pattern: /ambientals|geologia|mar/i,
    outcomes: ["gestió ambiental", "consultoria ambiental", "anàlisi territorial", "educació ambiental", "administració pública"]
  },
  {
    pattern: /empresa|direcci[oó]|economia|finances|comptabilitat|m[aà]rqueting|negocis/i,
    outcomes: ["direcció i gestió d'empreses", "finances", "màrqueting", "consultoria", "emprenedoria"]
  },
  {
    pattern: /turisme|hoteler/i,
    outcomes: ["gestió turística", "hoteleria", "esdeveniments", "màrqueting turístic", "administració de destinacions"]
  },
  {
    pattern: /dret|criminolog/i,
    outcomes: ["advocacia i procura", "assessoria jurídica", "administració pública", "compliment normatiu", "consultoria legal"]
  },
  {
    pattern: /educaci[oó]|mestre|pedagog/i,
    outcomes: ["docència", "orientació educativa", "educació no formal", "gestió de centres", "innovació pedagògica"]
  },
  {
    pattern: /comunicaci[oó]|periodisme|publicitat|audiovisual/i,
    outcomes: ["mitjans i continguts", "comunicació corporativa", "publicitat", "producció audiovisual", "estratègia digital"]
  },
  {
    pattern: /art|disseny|belles arts|m[uú]sica|cinema/i,
    outcomes: ["disseny i creació", "producció cultural", "direcció artística", "indústria audiovisual", "docència artística"]
  },
  {
    pattern: /traducci[oó]|lleng|filolog|literatura|humanitats|hist[oò]ria|filosofia/i,
    outcomes: ["edició i continguts", "traducció", "docència", "gestió cultural", "recerca i patrimoni"]
  },
  {
    pattern: /pol[ií]tiques|sociolog|relacions|treball social|social/i,
    outcomes: ["intervenció social", "administració pública", "anàlisi de polítiques", "cooperació", "recerca social"]
  },
  {
    pattern: /activitat f[ií]sica|esport/i,
    outcomes: ["entrenament esportiu", "gestió esportiva", "activitat física i salut", "educació", "readaptació esportiva"]
  }
];

export function getCareerOutcomeInfo(degree: DegreeOutcomeInput): CareerOutcomeInfo {
  const text = `${degree.name} ${degree.branch} ${degree.tags.join(" ")}`;
  const match = byPattern.find((item) => item.pattern.test(text));

  return {
    outcomes: match?.outcomes ?? ["gestió de projectes", "consultoria", "docència", "administració pública", "especialització de postgrau"],
    sourceNote: "Idees orientatives segons la família de la carrera. Abans de decidir, revisa també dades oficials i opinions de persones que l'hagin estudiat.",
    sources: institutionalSources
  };
}
