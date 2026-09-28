import { UserPreferences, RoadmapItem, KnowledgeLevel, FormatPreference } from '../types';
import { curatedResources } from '../data/curatedResources';

export interface RoadmapResult {
  roadmapTitle: string;
  summary: string;
  items: RoadmapItem[];
}

interface GenerateOptions {
  customGeminiRoadmap?: RoadmapItem[];
  customTitle?: string;
  customSummary?: string;
}

// Helper to find best matching curated resource based on format, language, and tags
function pickResource(
  formatPref: FormatPreference,
  lang: 'en' | 'es',
  preferredId: string,
  preferredTags: string[],
  fallbackFormat?: 'Video' | 'Document' | 'Interactive' | 'Course'
) {
  // 1. Check if preferred ID exists
  const exact = curatedResources.find((r) => r.id === preferredId);
  if (formatPref === 'all' && exact) {
    return exact;
  }

  // 2. If format specified, search for matching format + language + tag
  if (formatPref !== 'all') {
    const formatStr =
      formatPref === 'video' ? 'Video' : formatPref === 'text' ? 'Document' : 'Interactive';

    // Best: format + lang + tag
    const bestMatch = curatedResources.find(
      (r) =>
        r.format === formatStr &&
        (r.language === lang || r.language === 'both') &&
        r.tags.some((t) => preferredTags.includes(t))
    );
    if (bestMatch) return bestMatch;

    // Second: format + lang
    const formatLangMatch = curatedResources.find(
      (r) => r.format === formatStr && (r.language === lang || r.language === 'both')
    );
    if (formatLangMatch) return formatLangMatch;

    // Third: format alone
    const formatOnly = curatedResources.find((r) => r.format === formatStr);
    if (formatOnly) return formatOnly;
  }

  // 3. Fallback to exact or tag match
  if (exact) return exact;

  const tagMatch = curatedResources.find(
    (r) =>
      (r.language === lang || r.language === 'both') &&
      r.tags.some((t) => preferredTags.includes(t))
  );
  if (tagMatch) return tagMatch;

  return curatedResources[0];
}

// Adjust duration string according to time commitment
function scaleDuration(baseMinutes: number, timeCommitment: string): string {
  let factor = 1.0;
  if (timeCommitment.includes('1-2') || timeCommitment.includes('1')) {
    factor = 0.6; // concise sprints
  } else if (timeCommitment.includes('6+') || timeCommitment.includes('10+')) {
    factor = 1.4; // deep dive
  }

  const scaled = Math.round(baseMinutes * factor);
  if (scaled < 60) {
    return `${scaled} min`;
  }
  const hours = (scaled / 60).toFixed(1).replace('.0', '');
  return `${hours} hrs`;
}

// Enrich roadmap items with vetted reputable YouTube videos and authoritative articles
export function enrichRoadmapItemsWithReputableSources(
  items: RoadmapItem[],
  lang: 'en' | 'es'
): RoadmapItem[] {
  return items.map((item) => {
    if (item.videoResource && item.articleResource) {
      return item;
    }

    const itemText = `${item.topic} ${item.conceptSummary} ${item.phase}`.toLowerCase();
    const tags: string[] = [];

    if (itemText.includes('rag') || itemText.includes('vector') || itemText.includes('retrieval')) {
      tags.push('rag', 'vector-db');
    }
    if (itemText.includes('agent') || itemText.includes('function') || itemText.includes('tool') || itemText.includes('herramienta')) {
      tags.push('agents', 'tools', 'function-calling');
    }
    if (itemText.includes('transformer') || itemText.includes('attention') || itemText.includes('embedding') || itemText.includes('atención')) {
      tags.push('transformers', 'math', 'embeddings');
    }
    if (itemText.includes('code') || itemText.includes('software') || itemText.includes('desarroll') || itemText.includes('test') || itemText.includes('prueba')) {
      tags.push('software-dev', 'coding-assistants');
    }
    if (itemText.includes('market') || itemText.includes('copy') || itemText.includes('seo') || itemText.includes('redes') || itemText.includes('publicid')) {
      tags.push('marketing', 'copywriting', 'seo');
    }
    if (itemText.includes('educa') || itemText.includes('docen') || itemText.includes('socratic') || itemText.includes('rubric') || itemText.includes('clase')) {
      tags.push('education', 'pedagogy', 'socratic');
    }
    if (itemText.includes('productiv') || itemText.includes('email') || itemText.includes('correo') || itemText.includes('office') || itemText.includes('reunion') || itemText.includes('meeting') || itemText.includes('resumen') || itemText.includes('summary')) {
      tags.push('productivity', 'workplace');
    }
    if (itemText.includes('negocio') || itemText.includes('operacion') || itemText.includes('business') || itemText.includes('spreadsheet') || itemText.includes('excel')) {
      tags.push('business', 'operations', 'productivity');
    }
    if (itemText.includes('salud') || itemText.includes('health') || itemText.includes('paper') || itemText.includes('medic') || itemText.includes('investig')) {
      tags.push('healthcare', 'research');
    }
    if (itemText.includes('legal') || itemText.includes('contrat') || itemText.includes('security') || itemText.includes('owasp') || itemText.includes('riesgo')) {
      tags.push('legal', 'security');
    }
    if (itemText.includes('few-shot') || itemText.includes('cot') || itemText.includes('pensamiento') || itemText.includes('chain')) {
      tags.push('few-shot', 'chain-of-thought');
    }
    tags.push('prompting', 'foundations', 'llm-basics');

    // Find best matching reputable YouTube video
    let videoMatch = curatedResources.find(
      (r) =>
        r.format === 'Video' &&
        (r.language === lang || r.language === 'both') &&
        r.tags.some((t) => tags.includes(t))
    );
    if (!videoMatch) {
      videoMatch =
        curatedResources.find(
          (r) => r.format === 'Video' && (r.language === lang || r.language === 'both')
        ) || curatedResources.find((r) => r.format === 'Video');
    }

    // Find best matching authoritative article / documentation link
    let articleMatch = curatedResources.find(
      (r) =>
        (r.format === 'Document' || r.format === 'Interactive') &&
        (r.language === lang || r.language === 'both') &&
        r.tags.some((t) => tags.includes(t))
    );
    if (!articleMatch) {
      articleMatch =
        curatedResources.find(
          (r) =>
            (r.format === 'Document' || r.format === 'Interactive') &&
            (r.language === lang || r.language === 'both')
        ) || curatedResources.find((r) => r.format === 'Document');
    }

    const videoResource =
      item.videoResource ||
      (videoMatch
        ? {
            title: lang === 'es' && videoMatch.titleEs ? videoMatch.titleEs : videoMatch.title,
            url: videoMatch.url,
            channel: videoMatch.platform.replace(/^YouTube\s*\(/i, '').replace(/\)$/, ''),
            duration: videoMatch.duration,
          }
        : undefined);

    const articleResource =
      item.articleResource ||
      (articleMatch
        ? {
            title: lang === 'es' && articleMatch.titleEs ? articleMatch.titleEs : articleMatch.title,
            url: articleMatch.url,
            publication: articleMatch.platform,
            readingTime: articleMatch.duration,
          }
        : undefined);

    return {
      ...item,
      videoResource,
      articleResource,
    };
  });
}

export function generateFullRoadmap(
  prefs: UserPreferences,
  options?: GenerateOptions
): RoadmapResult {
  if (options?.customGeminiRoadmap && options.customGeminiRoadmap.length > 0) {
    const enriched = enrichRoadmapItemsWithReputableSources(
      options.customGeminiRoadmap,
      prefs.language
    );
    return {
      roadmapTitle: options.customTitle || (prefs.language === 'es' ? 'Ruta de Aprendizaje Personalizada' : 'Personalized AI Learning Path'),
      summary: options.customSummary || (prefs.language === 'es' ? 'Currículo generado a medida según tus preferencias.' : 'Custom curriculum generated to match your inputs.'),
      items: enriched,
    };
  }

  const isEs = prefs.language === 'es';
  const level: KnowledgeLevel = prefs.knowledgeLevel || 'beginner';
  const area = prefs.area || 'general_productivity';
  const customArea = prefs.customArea?.trim();
  const format = prefs.formatPreference || 'all';
  const goal = prefs.specificGoal?.trim();
  const timeCommitment = prefs.timeCommitment || '3-5 hours/week';

  // Human-readable domain title
  const domainNamesEn: Record<string, string> = {
    general_productivity: 'Everyday Productivity & Workflow Automation',
    software_dev: 'Software Engineering & App Development',
    data_ai_engineering: 'Data Analysis, SQL & AI Engineering',
    marketing_content: 'Marketing Strategy & Content Creation',
    business_ops: 'Business Operations, Leadership & Management',
    education_teaching: 'Education, Teaching & Socratic Pedagogy',
    healthcare_science: 'Healthcare, Clinical Research & Science',
    legal_finance: 'Legal Analysis, Compliance & Contract Review',
  };

  const domainNamesEs: Record<string, string> = {
    general_productivity: 'Productividad Diaria y Automatización de Tareas',
    software_dev: 'Desarrollo de Software y Creación de Aplicaciones',
    data_ai_engineering: 'Análisis de Datos, Consultas SQL e Ingeniería de IA',
    marketing_content: 'Estrategia de Marketing, Copys y Redes Sociales',
    business_ops: 'Operaciones Empresariales, Liderazgo y Gestión',
    education_teaching: 'Educación, Docencia y Tutoría Socrática',
    healthcare_science: 'Salud, Investigación Científica y Medicina',
    legal_finance: 'Análisis Legal, Cumplimiento Normativo y Contratos',
  };

  const domainLabel = customArea || (isEs ? domainNamesEs[area] || area : domainNamesEn[area] || area);

  // Personalized Roadmap Title & Summary
  const formatLabelEn = format === 'video' ? 'Video-Focused' : format === 'text' ? 'Reading & Docs' : format === 'interactive' ? 'Hands-on Labs' : 'Comprehensive';
  const formatLabelEs = format === 'video' ? 'Enfocado en Videos' : format === 'text' ? 'Lectura y Documentación' : format === 'interactive' ? 'Laboratorios Prácticos' : 'Integral';

  const levelLabelEn = level === 'beginner' ? 'Foundations' : level === 'intermediate' ? 'Applied Mastery' : 'Technical Architecture';
  const levelLabelEs = level === 'beginner' ? 'Fundamentos' : level === 'intermediate' ? 'Dominio Práctico' : 'Arquitectura Técnica';

  const roadmapTitle = isEs
    ? `Ruta Personalizada de IA: ${domainLabel} (${levelLabelEs} - ${formatLabelEs})`
    : `Personalized AI Roadmap: ${domainLabel} (${levelLabelEn} - ${formatLabelEn})`;

  let summary = isEs
    ? `Plan de aprendizaje adaptado a tu nivel (${level}) y formato preferido (${formatLabelEs}), con dedicación estimada de ${timeCommitment}.`
    : `Curriculum calibrated for your knowledge level (${level}) and preferred format (${formatLabelEn}), tailored for ${timeCommitment}.`;

  if (goal) {
    summary += isEs
      ? ` Orientado al objetivo específico: "${goal}".`
      : ` Aligned to target milestone: "${goal}".`;
  }

  const items: RoadmapItem[] = [];

  // =========================================================================
  // PHASE 1: CORE ENGINE & MENTAL MODELS (Adapted by level and format)
  // =========================================================================
  if (level === 'beginner') {
    // Beginner: "What is a prompt?", LLM mechanics, anatomy, anti-hallucination
    const res1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      isEs ? 'res-dotcsv-que-es-ia' : 'res-intro-llm-karpathy',
      ['foundations', 'llm-basics']
    );

    const res2 = pickResource(
      format,
      isEs ? 'es' : 'en',
      isEs ? 'res-dotcsv-prompting-mastery' : 'res-learn-prompting-intro',
      ['prompting', 'beginners']
    );

    const res3 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-promptingguide-grounding',
      ['hallucinations', 'grounding']
    );

    items.push({
      id: 'step-1-1',
      phase: isEs ? 'Fase 1: Fundamentos y Mecánica de los Modelos' : 'Phase 1: Foundations & How LLMs Work',
      phaseOrder: 1,
      topic: isEs ? '¿Qué es un LLM y por qué predice tokens?' : 'What is a Large Language Model & How Token Prediction Works',
      conceptSummary: isEs
        ? `Los modelos de lenguaje como Gemini o ChatGPT son motores probabilísticos de continuación de texto, no bases de datos estáticas. Aprende cómo interpretan el contexto en ${domainLabel}.`
        : `Models like Gemini and ChatGPT predict statistically coherent next tokens rather than querying static databases. Understanding context windows is essential for ${domainLabel}.`,
      format: res1.format as any,
      resourceName: isEs ? (res1.titleEs || res1.title) : res1.title,
      resourceUrl: res1.url,
      isFree: true,
      platform: res1.platform,
      duration: scaleDuration(45, timeCommitment),
      actionableTask: isEs
        ? `Abre Gemini o ChatGPT y formula una pregunta sobre ${domainLabel}. Luego agrega: "Reescribe tu respuesta con una analogía simple y limita a 3 puntos numerados". Observa la diferencia.`
        : `Open Gemini or ChatGPT. Ask a core question about ${domainLabel}, then command: "Rewrite your explanation using an everyday analogy, limited to 3 bullet points." Observe the precision shift.`,
      difficulty: 'Beginner',
      language: prefs.language,
    });

    items.push({
      id: 'step-1-2',
      phase: isEs ? 'Fase 1: Fundamentos y Mecánica de los Modelos' : 'Phase 1: Foundations & How LLMs Work',
      phaseOrder: 1,
      topic: isEs ? `Anatomía de un Prompt Aplicado a ${domainLabel}` : `Anatomy of a Prompt: Tailored for ${domainLabel}`,
      conceptSummary: isEs
        ? 'Todo prompt de alto rendimiento combina 4 pilares: Rol de experto, Contexto de la situación, Tarea concreta y Restricciones de formato de salida.'
        : 'Every reliable prompt requires 4 pillars: Expert Persona (Who), Context (What background), Objective (What task), and Constraints (Output format).',
      format: res2.format as any,
      resourceName: isEs ? (res2.titleEs || res2.title) : res2.title,
      resourceUrl: res2.url,
      isFree: true,
      platform: res2.platform,
      duration: scaleDuration(40, timeCommitment),
      actionableTask: isEs
        ? `Escribe un prompt con la estructura: [Rol: Especialista en ${domainLabel}] + [Contexto: Caso real de tu día a día${goal ? ` enfocado en ${goal}` : ''}] + [Tarea: Redactar propuesta concisa] + [Formato: Tabla con 3 columnas]. Compara con una instrucción vaga.`
        : `Write a prompt using the structure: [Role: Senior specialist in ${domainLabel}] + [Context: Real scenario${goal ? ` for ${goal}` : ''}] + [Task: Formulate specific recommendation] + [Format: Markdown table with 3 columns]. Contrast with a 1-line query.`,
      difficulty: 'Beginner',
      language: prefs.language,
    });

    items.push({
      id: 'step-1-3',
      phase: isEs ? 'Fase 1: Fundamentos y Mecánica de los Modelos' : 'Phase 1: Foundations & How LLMs Work',
      phaseOrder: 1,
      topic: isEs ? 'Evitar Alucinaciones y Restricciones Negativas' : 'Controlling Hallucinations & Reference Guardrails',
      conceptSummary: isEs
        ? 'Aprende a acotar al modelo para que responda EXCLUSIVAMENTE con la información que tú le suministres, reduciendo errores a cero.'
        : 'Techniques to strictly anchor model responses to your provided source material ("If not stated in the source text, reply: [NOT FOUND]").',
      format: res3.format as any,
      resourceName: isEs ? (res3.titleEs || res3.title) : res3.title,
      resourceUrl: res3.url,
      isFree: true,
      platform: res3.platform,
      duration: scaleDuration(35, timeCommitment),
      actionableTask: isEs
        ? `Copia un texto o reporte breve de tu área (${domainLabel}) y dale esta instrucción: "Responde únicamente usando los hechos de este texto. Si el dato no está explícito, di 'Información no disponible'. Prohibido inferir o inventar."`
        : `Paste a short excerpt or policy related to ${domainLabel}. Prompt: "Answer only using facts in the provided text. If absent, output '[NOT PROVIDED]'. Do not speculate or extrapolate."`,
      difficulty: 'Beginner',
      language: prefs.language,
    });
  } else if (level === 'intermediate') {
    // Intermediate: Few-Shot, CoT, System instructions, Delimiters, JSON schemas
    const res1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-promptingguide-dair',
      ['few-shot', 'chain-of-thought']
    );

    const res2 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-gemini-structured-outputs',
      ['json', 'schemas', 'api']
    );

    items.push({
      id: 'step-1-1-int',
      phase: isEs ? 'Fase 1: Técnicas Avanzadas de Prompting y Razonamiento' : 'Phase 1: Advanced Prompt Engineering & Reasoning',
      phaseOrder: 1,
      topic: isEs ? `Few-Shot Prompting y Cadenas de Pensamiento (CoT) en ${domainLabel}` : `Few-Shot Exemplars & Chain-of-Thought for ${domainLabel}`,
      conceptSummary: isEs
        ? 'Mejora radicalmente la precisión en tareas complejas mostrando 2 o 3 ejemplos modelo (input -> output) y solicitando razonamiento paso a paso antes de la respuesta final.'
        : 'Drastically eliminate reasoning flaws on ambiguous cases by providing 2-3 worked exemplars and instructing "Think step-by-step before concluding".',
      format: res1.format as any,
      resourceName: isEs ? (res1.titleEs || res1.title) : res1.title,
      resourceUrl: res1.url,
      isFree: true,
      platform: res1.platform,
      duration: scaleDuration(50, timeCommitment),
      actionableTask: isEs
        ? `Diseña un prompt Few-Shot con 3 ejemplos reales de clasificación o análisis para ${domainLabel}${goal ? ` (enfocado en ${goal})` : ''}. Verifica cómo clasifica un cuarto caso difícil.`
        : `Construct a 3-shot prompt demonstrating input/output transformations for ${domainLabel}${goal ? ` targeting ${goal}` : ''}. Test with an edge-case input.`,
      difficulty: 'Intermediate',
      language: prefs.language,
    });

    items.push({
      id: 'step-1-2-int',
      phase: isEs ? 'Fase 1: Técnicas Avanzadas de Prompting y Razonamiento' : 'Phase 1: Advanced Prompt Engineering & Reasoning',
      phaseOrder: 1,
      topic: isEs ? 'Instrucciones del Sistema, Delimitadores XML y Respuestas en JSON' : 'System Instructions, Delimiters & Guaranteed JSON Outputs',
      conceptSummary: isEs
        ? 'Aislar instrucciones del contenido del usuario usando delimitadores (p. ej. <documento>...</documento>) y forzar esquemas JSON estrictos para automatizaciones confiables.'
        : 'Prevent prompt injection with XML encapsulation tags and guarantee reliable data structures using strict JSON schemas.',
      format: res2.format as any,
      resourceName: isEs ? (res2.titleEs || res2.title) : res2.title,
      resourceUrl: res2.url,
      isFree: true,
      platform: res2.platform,
      duration: scaleDuration(45, timeCommitment),
      actionableTask: isEs
        ? `En Google AI Studio o Gemini, define un prompt con delimitadores <caso> y solicita la respuesta estrictamente en JSON con claves: { "resumen": string, "puntos_clave": string[], "riesgo": string }.`
        : `In Google AI Studio, configure system instructions with response schema or JSON mode. Extract structured entities from unstructured text into valid JSON { "analysis", "confidence", "next_steps" }.`,
      difficulty: 'Intermediate',
      language: prefs.language,
    });
  } else {
    // Advanced / Expert: Architecture, Embeddings, Function Calling, RAG
    const res1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-3blue1brown-transformers',
      ['transformers', 'math', 'embeddings']
    );

    const res2 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-langchain-rag-tutorial',
      ['rag', 'vector-db', 'embeddings']
    );

    items.push({
      id: 'step-1-1-adv',
      phase: isEs ? 'Fase 1: Arquitectura de Modelos y Espacios Vectoriales' : 'Phase 1: Deep Architecture, Embeddings & Vectors',
      phaseOrder: 1,
      topic: isEs ? 'Mecanismo de Auto-Atención, Tokens y Espacios de Embeddings' : 'Self-Attention, Tokenization & Dense Vector Spaces',
      conceptSummary: isEs
        ? 'Comprensión matemática del mecanismo de atención (Q, K, V) y cómo las representaciones vectoriales mapean relaciones semánticas en alta dimensión.'
        : 'Mathematical foundations of Query, Key, Value attention projections and how dense embedding spaces cluster semantic relationships.',
      format: res1.format as any,
      resourceName: isEs ? (res1.titleEs || res1.title) : res1.title,
      resourceUrl: res1.url,
      isFree: true,
      platform: res1.platform,
      duration: scaleDuration(60, timeCommitment),
      actionableTask: isEs
        ? `Genera embeddings para 4 frases de ${domainLabel} usando la API de Gemini o Sentence-Transformers y calcula la similitud coseno para verificar agrupamiento semántico.`
        : `Generate dense vector embeddings for 5 domain-specific sentences using Gemini embedding models; calculate pairwise cosine similarities to verify semantic cluster separation.`,
      difficulty: 'Advanced',
      language: prefs.language,
    });

    items.push({
      id: 'step-1-2-adv',
      phase: isEs ? 'Fase 1: Arquitectura de Modelos y Espacios Vectoriales' : 'Phase 1: Deep Architecture, Embeddings & Vectors',
      phaseOrder: 1,
      topic: isEs ? `Arquitectura RAG Empresarial: Chunking, Índices y Reranking` : `Production RAG: Chunking Strategies, Vector Stores & Reranking`,
      conceptSummary: isEs
        ? `Diseño de pipelines RAG con chunking semántico, búsqueda híbrida (BM25 + vector) y reranking con cross-encoders para ${domainLabel}.`
        : `End-to-end RAG architecture with semantic chunking boundaries, reciprocal rank fusion (BM25 + dense), and cross-encoder reranking.`,
      format: res2.format as any,
      resourceName: isEs ? (res2.titleEs || res2.title) : res2.title,
      resourceUrl: res2.url,
      isFree: true,
      platform: res2.platform,
      duration: scaleDuration(75, timeCommitment),
      actionableTask: isEs
        ? `Diagrama o prototipa un pipeline RAG para documentos de ${domainLabel}: Ingesta -> Chunking de 400 tokens con overlap de 50 -> Vector Store -> Reranker -> Prompt aumentado.`
        : `Implement a minimal RAG prototype in Python/LangChain connecting internal ${domainLabel} reference docs to ChromaDB/FAISS with source citation attribution.`,
      difficulty: 'Advanced',
      language: prefs.language,
    });
  }

  // =========================================================================
  // PHASE 2: DOMAIN-SPECIFIC APPLICATION & WORKFLOWS
  // =========================================================================
  const isDev = area === 'software_dev';
  const isData = area === 'data_ai_engineering';
  const isMarketing = area === 'marketing_content';
  const isBusiness = area === 'business_ops';
  const isEducation = area === 'education_teaching';
  const isHealth = area === 'healthcare_science';
  const isLegal = area === 'legal_finance';

  if (isDev) {
    const resDev1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      isEs ? 'res-midudev-ai-devs' : 'res-freecodecamp-ai-devs',
      ['software-dev', 'coding-assistants']
    );
    const resDev2 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-gemini-function-calling',
      ['function-calling', 'tools', 'api']
    );

    items.push({
      id: 'step-2-dev-1',
      phase: isEs ? 'Fase 2: Aplicación en Ingeniería de Software' : 'Phase 2: Applied AI for Software Engineering',
      phaseOrder: 2,
      topic: isEs ? 'Generación de Pruebas Unitarias, TDD y Refactorización Guiada' : 'AI-Assisted Unit Testing, TDD & Guided Refactoring',
      conceptSummary: isEs
        ? 'Alimentar interfaces TypeScript, firmas de función y casos límite para obtener suites de tests completas y código modular.'
        : 'Feed interfaces, type definitions, and contract specs to LLMs for automated test generation (Jest/Vitest/PyTest) and clean refactoring.',
      format: resDev1.format as any,
      resourceName: isEs ? (resDev1.titleEs || resDev1.title) : resDev1.title,
      resourceUrl: resDev1.url,
      isFree: true,
      platform: resDev1.platform,
      duration: scaleDuration(50, timeCommitment),
      actionableTask: isEs
        ? `Toma una función existente de tu proyecto${goal ? ` vinculada a ${goal}` : ''}. Pide a Gemini/Claude que escriba 5 pruebas unitarias cubriendo casos extremos (nulos, errores de red, límites) y sugiera 1 refactorización.`
        : `Take a complex function from your codebase. Prompt Gemini/Claude to generate 5 unit tests covering edge cases (null inputs, timeouts, boundary values) and suggest 1 architectural improvement.`,
      difficulty: level === 'beginner' ? 'Beginner' : 'Intermediate',
      language: prefs.language,
    });

    items.push({
      id: 'step-2-dev-2',
      phase: isEs ? 'Fase 2: Aplicación en Ingeniería de Software' : 'Phase 2: Applied AI for Software Engineering',
      phaseOrder: 2,
      topic: isEs ? 'Llamadas a Funciones (Tool Calling) y Bucles de Agentes' : 'Function Calling (Tool Use) & Agentic Reasoning Loops',
      conceptSummary: isEs
        ? 'Capacitar a los modelos para invocar APIs externas y ejecutar consultas estructuradas mediante esquemas JSON de herramientas.'
        : 'Allow models to interact with APIs, databases, and calculation engines by producing validated JSON parameter payloads.',
      format: resDev2.format as any,
      resourceName: isEs ? (resDev2.titleEs || resDev2.title) : resDev2.title,
      resourceUrl: resDev2.url,
      isFree: true,
      platform: resDev2.platform,
      duration: scaleDuration(60, timeCommitment),
      actionableTask: isEs
        ? `Define en Google AI Studio la declaración de una función para tu aplicación${goal ? ` (${goal})` : ''} (p. ej. queryDatabase({filter, limit})) y prueba cómo el modelo extrae argumentos desde lenguaje natural.`
        : `In Google AI Studio or SDK, define a function tool declaration for your domain${goal ? ` (${goal})` : ''} and inspect how Gemini extracts arguments automatically from user queries.`,
      difficulty: 'Intermediate',
      language: prefs.language,
    });
  } else if (isData) {
    const resData1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-gemini-structured-outputs',
      ['data', 'json', 'api']
    );

    items.push({
      id: 'step-2-data-1',
      phase: isEs ? 'Fase 2: Inteligencia Artificial en Datos y SQL' : 'Phase 2: AI for Data Engineering & SQL Analytics',
      phaseOrder: 2,
      topic: isEs ? 'Generación de SQL y Análisis Exploratorio Automatizado' : 'Natural Language to SQL & Automated EDA Pipelines',
      conceptSummary: isEs
        ? 'Suministrar esquemas DDL (Data Definition Language) de bases de datos para generar consultas complejas (JOINs, Window Functions) y detectar anomalías estadísticas.'
        : 'Supply database DDL schemas to generate reliable SQL queries with window functions and generate automated EDA scripts in Python.',
      format: resData1.format as any,
      resourceName: isEs ? (resData1.titleEs || resData1.title) : resData1.title,
      resourceUrl: resData1.url,
      isFree: true,
      platform: resData1.platform,
      duration: scaleDuration(50, timeCommitment),
      actionableTask: isEs
        ? `Pega el esquema de 2 tablas relacionadas de tu trabajo y pide: "Escribe una consulta SQL optimizada para calcular la retención mensual cohorte por cohorte y explica el plan de ejecución".`
        : `Provide schemas of 2 relational tables. Prompt: "Generate an optimized SQL query computing month-over-month cohort retention with window functions; explain the query plan."`,
      difficulty: level === 'beginner' ? 'Beginner' : 'Intermediate',
      language: prefs.language,
    });

    items.push({
      id: 'step-2-data-2',
      phase: isEs ? 'Fase 2: Inteligencia Artificial en Datos y SQL' : 'Phase 2: AI for Data Engineering & SQL Analytics',
      phaseOrder: 2,
      topic: isEs ? 'Limpieza de Datos Sucios y Extracción Estructurada con LLMs' : 'Messy Data Normalization & Extraction with LLMs',
      conceptSummary: isEs
        ? 'Procesamiento por lotes de texto desestructurado para estandarizar direcciones, categorizar productos y normalizar registros heterogéneos.'
        : 'Harness LLMs to normalize unstructured logs, categorize dirty free-text fields, and extract standardized tabular features.',
      format: 'Document',
      resourceName: isEs ? 'Google for Developers: Procesamiento y Normalización de Datos' : 'Google for Developers: Data Normalization with LLMs',
      resourceUrl: 'https://ai.google.dev/gemini-api/docs/structured-output',
      isFree: true,
      platform: 'Google for Developers',
      duration: scaleDuration(45, timeCommitment),
      actionableTask: isEs
        ? `Crea un lote de 5 registros con formatos caóticos (teléfonos, fechas y categorías distintas) y escribe un prompt para convertirlos en un DataFrame tabular limpio.`
        : `Create a batch of 5 messy records with irregular formatting and prompt the model to return a standardized CSV or JSON array with validated field constraints.`,
      difficulty: 'Intermediate',
      language: prefs.language,
    });
  } else if (isMarketing) {
    const resMkt1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-marketing-prompting-guide',
      ['marketing', 'copywriting', 'brand-voice']
    );
    const resMkt2 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-gemini-multimodal-prompting',
      ['multimodal', 'images', 'visual-marketing']
    );

    items.push({
      id: 'step-2-mkt-1',
      phase: isEs ? 'Fase 2: Estrategia de Marketing, Copys y Audiencias' : 'Phase 2: Marketing Strategy, Copywriting & Personas',
      phaseOrder: 2,
      topic: isEs ? 'Matriz de Buyer Personas y Tono de Marca Invariable' : 'Buyer Persona Matrices & Ironclad Brand Voice Guidelines',
      conceptSummary: isEs
        ? 'Definir System Prompts con la personalidad, vocabulario proscrito y propuesta de valor única para garantizar coherencia en todos los canales.'
        : 'Build robust brand voice system instructions with explicit tone parameters, forbidden buzzwords, and customer pain point matrices.',
      format: resMkt1.format as any,
      resourceName: isEs ? (resMkt1.titleEs || resMkt1.title) : resMkt1.title,
      resourceUrl: resMkt1.url,
      isFree: true,
      platform: resMkt1.platform,
      duration: scaleDuration(45, timeCommitment),
      actionableTask: isEs
        ? `Escribe las reglas de voz de tu marca (3 valores clave, 4 palabras prohibidas). Pide a la IA redactar 3 variantes de anuncio para LinkedIn${goal ? ` orientadas a ${goal}` : ''} respetando estrictamente las directrices.`
        : `Define brand voice rules (3 tone pillars, 5 prohibited buzzwords). Prompt the model to produce 3 email subject lines and hooks${goal ? ` tailored for ${goal}` : ''} obeying the constraints.`,
      difficulty: 'Beginner',
      language: prefs.language,
    });

    items.push({
      id: 'step-2-mkt-2',
      phase: isEs ? 'Fase 2: Estrategia de Marketing, Copys y Audiencias' : 'Phase 2: Marketing Strategy, Copywriting & Personas',
      phaseOrder: 2,
      topic: isEs ? 'Campañas Multimodales: Análisis de Imágenes y Prompts Visuales' : 'Multimodal Campaigns: Visual Prompts & Image Hook Analysis',
      conceptSummary: isEs
        ? 'Analizar piezas creativas y redactar prompts detallados para generadores de imagen (iluminación, composición, ángulo de cámara, estilo editorial).'
        : 'Bridge copy and imagery: analyze uploaded product creatives for emotional hooks and craft staged visual prompts for image generation.',
      format: resMkt2.format as any,
      resourceName: isEs ? (resMkt2.titleEs || resMkt2.title) : resMkt2.title,
      resourceUrl: resMkt2.url,
      isFree: true,
      platform: resMkt2.platform,
      duration: scaleDuration(50, timeCommitment),
      actionableTask: isEs
        ? `Sube una imagen de producto o servicio a Gemini. Pídele que desglose los 3 ganchos psicológicos visuales y redacte 2 textos publicitarios complementarios para redes.`
        : `Upload a product visual into Gemini. Command: "Analyze visual focal points, specify 3 psychological buying hooks, and craft 2 matching social captions with CTAs."`,
      difficulty: 'Intermediate',
      language: prefs.language,
    });
  } else if (isBusiness) {
    const resBiz1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-coursera-ai-for-everyone',
      ['business', 'strategy', 'executive']
    );
    const resBiz2 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-google-workspace-gemini-guide',
      ['operations', 'spreadsheets']
    );

    items.push({
      id: 'step-2-biz-1',
      phase: isEs ? 'Fase 2: Gestión de Operaciones y Resumen Ejecutivo' : 'Phase 2: Operations Management & Executive Decision Making',
      phaseOrder: 2,
      topic: isEs ? 'Síntesis de Hojas de Cálculo, Análisis FODA y Memos Ejecutivos' : 'Spreadsheet Synthesis, SWOT Analysis & 1-Page CEO Memos',
      conceptSummary: isEs
        ? 'Convertir reportes financieros extensos o tablas de ventas en resúmenes ejecutivos que resalten variaciones porcentuales, anomalías y recomendaciones.'
        : 'Transform raw metric dumps and quarterly spreadsheets into crisp executive briefs highlighting variances, risks, and strategic decisions.',
      format: resBiz1.format as any,
      resourceName: isEs ? (resBiz1.titleEs || resBiz1.title) : resBiz1.title,
      resourceUrl: resBiz1.url,
      isFree: true,
      platform: resBiz1.platform,
      duration: scaleDuration(55, timeCommitment),
      actionableTask: isEs
        ? `Pega una tabla con 6 métricas clave de tu negocio${goal ? ` relacionadas con ${goal}` : ''}. Pide: "Elabora un memo ejecutivo de 1 página con: 1) Resumen de resultados, 2) 2 alertas críticas, 3) 3 acciones propuestas con plazos".`
        : `Paste quarterly performance figures${goal ? ` related to ${goal}` : ''}. Prompt: "Draft a 1-page executive memo: Headline Metrics, Variance Causes, 2 Red Flags, and 3 Corrective Initiatives with target completion dates."`,
      difficulty: 'Beginner',
      language: prefs.language,
    });

    items.push({
      id: 'step-2-biz-2',
      phase: isEs ? 'Fase 2: Gestión de Operaciones y Resumen Ejecutivo' : 'Phase 2: Operations Management & Executive Decision Making',
      phaseOrder: 2,
      topic: isEs ? 'Asistentes Especializados (Gems) para Estandarizar Procesos' : 'Custom Team Gems & SOP Assistants for Workflow Velocity',
      conceptSummary: isEs
        ? 'Empaquetar políticas internas y formatos estándar en asistentes reutilizables que aceleren la productividad de todo el equipo.'
        : 'Package standard operating procedures (SOPs) and review criteria into team Gems to standardize quality and reduce turnaround time.',
      format: resBiz2.format as any,
      resourceName: isEs ? (resBiz2.titleEs || resBiz2.title) : resBiz2.title,
      resourceUrl: resBiz2.url,
      isFree: true,
      platform: resBiz2.platform,
      duration: scaleDuration(45, timeCommitment),
      actionableTask: isEs
        ? `Diseña las instrucciones para un Gem interno: 'Auditor de Propuestas Comerciales'. Debe verificar que toda propuesta incluya alcance, precios, plazos y cláusula de soporte antes de enviar al cliente.`
        : `Draft system instructions for a custom team Gem: 'Client Deliverable Reviewer'. Instruct it to audit clarity, verify all pricing caveats are present, and polish tone.`,
      difficulty: 'Intermediate',
      language: prefs.language,
    });
  } else if (isEducation) {
    const resEdu1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-learnprompting-education',
      ['education', 'teaching', 'rubrics']
    );
    const resEdu2 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-khan-academy-ai-education-video',
      ['education', 'khan-academy', 'pedagogy']
    );

    items.push({
      id: 'step-2-edu-1',
      phase: isEs ? 'Fase 2: Inteligencia Artificial en Pedagogía y Docencia' : 'Phase 2: AI for Education, Teaching & Pedagogy',
      phaseOrder: 2,
      topic: isEs ? 'Diseño de Rúbricas Analíticas y Planes de Clase Diferenciados' : 'Analytic Rubric Design & Differentiated Lesson Planning',
      conceptSummary: isEs
        ? 'Generar rúbricas transparentes de 4 niveles y adaptar explicaciones curriculares para distintos ritmos y estilos de aprendizaje.'
        : 'Prompt models to produce comprehensive rubrics and scaffold multi-tiered lesson plans adapted for varied learner comprehension levels.',
      format: resEdu1.format as any,
      resourceName: isEs ? (resEdu1.titleEs || resEdu1.title) : resEdu1.title,
      resourceUrl: resEdu1.url,
      isFree: true,
      platform: resEdu1.platform,
      duration: scaleDuration(45, timeCommitment),
      actionableTask: isEs
        ? `Indica un tema educativo complejo de tu materia${goal ? ` (${goal})` : ''}. Pide una rúbrica en tabla con 4 criterios (Insuficiente, Básico, Notable, Excelente) y descriptores cualitativos precisos.`
        : `Specify a challenging lesson objective${goal ? ` (${goal})` : ''}. Prompt: "Produce a 4-tier rubric with specific behavioral evidence for each tier, plus 2 differentiated accommodation exercises."`,
      difficulty: 'Beginner',
      language: prefs.language,
    });

    items.push({
      id: 'step-2-edu-2',
      phase: isEs ? 'Fase 2: Inteligencia Artificial en Pedagogía y Docencia' : 'Phase 2: AI for Education, Teaching & Pedagogy',
      phaseOrder: 2,
      topic: isEs ? 'Tutoría Socrática Asistida y Retroalimentación Formativa' : 'Socratic AI Tutoring & Formative Feedback Loops',
      conceptSummary: isEs
        ? 'Configurar al modelo para que guíe al alumno con preguntas reflexivas en lugar de entregar la solución directa.'
        : 'Instruct models to act as patient Socratic mentors who never reveal final answers directly, but ask guided scaffolded questions.',
      format: resEdu2.format as any,
      resourceName: isEs ? (resEdu2.titleEs || resEdu2.title) : resEdu2.title,
      resourceUrl: resEdu2.url,
      isFree: true,
      platform: resEdu2.platform,
      duration: scaleDuration(45, timeCommitment),
      actionableTask: isEs
        ? `Crea un prompt de tutor: 'Eres un tutor socrático de [tu materia]. Cuando el alumno presente una duda sobre [concepto], responde con 1 pregunta guiada que le ayude a identificar el siguiente paso'. Pruébalo simular.`
        : `Craft a Socratic mentor prompt: 'You are a guiding tutor in [subject]. When a learner states a misconception, never correct them immediately; ask 1 targeted reflective question to help them discover the flaw.'`,
      difficulty: 'Intermediate',
      language: prefs.language,
    });
  } else if (isHealth) {
    const resHealth1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-google-ai-biomedical-docs',
      ['healthcare', 'research', 'scientific-papers']
    );

    items.push({
      id: 'step-2-health-1',
      phase: isEs ? 'Fase 2: Aplicación en Salud, Ciencia e Investigación' : 'Phase 2: AI for Healthcare, Science & Clinical Research',
      phaseOrder: 2,
      topic: isEs ? 'Síntesis Rigurosa de Artículos Científicos y Metodologías' : 'Rigorous Scientific Paper Synthesis & Protocol Extraction',
      conceptSummary: isEs
        ? 'Extraer de forma estructurada cohortes, variables independientes, p-valores, intervalos de confianza y limitaciones de estudios biomédicos.'
        : 'Systematically extract study populations, endpoints, statistical significance (p-values, 95% CIs), and declared limitations from long-form papers.',
      format: resHealth1.format as any,
      resourceName: isEs ? (resHealth1.titleEs || resHealth1.title) : resHealth1.title,
      resourceUrl: resHealth1.url,
      isFree: true,
      platform: resHealth1.platform,
      duration: scaleDuration(50, timeCommitment),
      actionableTask: isEs
        ? `Pega el abstract o metodología de un paper científico y solicita: "Extrae en tabla: 1) Población/muestra, 2) Variable primaria, 3) Resultados con significancia estadística, 4) Posibles sesgos declarados".`
        : `Paste a clinical abstract or trial summary. Prompt: "Extract into a structured markdown table: Cohort Size, Primary Endpoint, Hazard/Odds Ratio with 95% CI, and declared study confounders."`,
      difficulty: 'Intermediate',
      language: prefs.language,
    });

    items.push({
      id: 'step-2-health-2',
      phase: isEs ? 'Fase 2: Aplicación en Salud, Ciencia e Investigación' : 'Phase 2: AI for Healthcare, Science & Clinical Research',
      phaseOrder: 2,
      topic: isEs ? 'Traducción de Jerga Médica a Lenguaje Comprensible para Pacientes' : 'Translating Clinical Jargon for Patient Comprehension',
      conceptSummary: isEs
        ? 'Convertir diagnósticos complejos e instrucciones terapéuticas en guías claras con empatía y advertencias de seguridad.'
        : 'Convert complex clinical discharge instructions and diagnostic notes into plain-language patient education handouts with safety boundaries.',
      format: 'Document',
      resourceName: isEs ? 'Guía de Comunicación Clínica Asistida por IA' : 'Google for Developers: Biomedical & Patient Communication',
      resourceUrl: 'https://ai.google.dev/gemini-api/docs/document-processing',
      isFree: true,
      platform: 'Google for Developers',
      duration: scaleDuration(40, timeCommitment),
      actionableTask: isEs
        ? `Toma una explicación clínica compleja y pide a la IA: "Reescribe esto para un paciente de 60 años sin tecnicismos, con formato de preguntas frecuentes y resaltando cuándo consultar a urgencias".`
        : `Take complex medical prose and prompt: "Re-articulate this for a non-clinical patient using grade 6 readability, FAQ format, and clear 'When to contact a physician' signs."`,
      difficulty: 'Beginner',
      language: prefs.language,
    });
  } else if (isLegal) {
    const resLegal1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-learnprompting-legal',
      ['legal', 'contracts', 'compliance']
    );

    items.push({
      id: 'step-2-legal-1',
      phase: isEs ? 'Fase 2: Análisis Legal, Contratos y Cumplimiento' : 'Phase 2: Legal Analysis, Contract Review & Compliance',
      phaseOrder: 2,
      topic: isEs ? 'Comparación de Cláusulas Contractuales y Detección de Riesgos' : 'Contract Clause Comparison & Asymmetric Risk Auditing',
      conceptSummary: isEs
        ? 'Auditar acuerdos comerciales, identificar cláusulas de indemnización desfavorables y detectar ambigüedades en definiciones de servicio.'
        : 'Audit vendor agreements, identify one-sided indemnification clauses, and pinpoint ambiguous terms of service.',
      format: resLegal1.format as any,
      resourceName: isEs ? (resLegal1.titleEs || resLegal1.title) : resLegal1.title,
      resourceUrl: resLegal1.url,
      isFree: true,
      platform: resLegal1.platform,
      duration: scaleDuration(50, timeCommitment),
      actionableTask: isEs
        ? `Pega dos cláusulas de rescisión o confidencialidad y solicita: "Compara ambas cláusulas, identifica términos ambiguos y redacta una propuesta equilibrada para ambas partes".`
        : `Paste two termination or NDA clauses. Prompt: "Compare side-by-side: flag liabilities, identify subjective terms, and rewrite clause 2 to balance mutual protection."`,
      difficulty: 'Intermediate',
      language: prefs.language,
    });

    items.push({
      id: 'step-2-legal-2',
      phase: isEs ? 'Fase 2: Análisis Legal, Contratos y Cumplimiento' : 'Phase 2: Legal Analysis, Contract Review & Compliance',
      phaseOrder: 2,
      topic: isEs ? 'Resumen de Marcos Normativos y Verificación de Cumplimiento' : 'Regulatory Policy Digests & Compliance Checklists',
      conceptSummary: isEs
        ? 'Sintetizar leyes o normativas extensas en listas de verificación ejecutivas accionables para auditorías internas.'
        : 'Condense complex regulatory frameworks into actionable internal compliance checklists with specific verification steps.',
      format: 'Document',
      resourceName: isEs ? 'Guía de Síntesis Normativa y Auditoría' : 'Applied Prompting for Regulatory Compliance',
      resourceUrl: 'https://learnprompting.org/docs/applied_prompting/legal',
      isFree: true,
      platform: 'LearnPrompting Guides',
      duration: scaleDuration(45, timeCommitment),
      actionableTask: isEs
        ? `Copia un fragmento de una política corporativa o regulación y pide: "Genera una lista de verificación de 5 puntos clave para auditar si un nuevo proyecto cumple la norma".`
        : `Paste an excerpt of compliance regulation. Prompt: "Extract a 5-point audit checklist indicating exact trigger conditions and required evidence."`,
      difficulty: 'Beginner',
      language: prefs.language,
    });
  } else {
    // Dynamic General Productivity or ANY Custom Domain (e.g. Real Estate, Music, Architecture, etc.)
    const resGen1 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-microsoft-genai-beginners',
      ['curriculum', 'comprehensive', 'open-source']
    );
    const resGen2 = pickResource(
      format,
      isEs ? 'es' : 'en',
      'res-gemini-custom-gems-guide',
      ['gems', 'custom-assistants', 'workflows']
    );

    items.push({
      id: 'step-2-custom-1',
      phase: isEs ? `Fase 2: Flujos Aplicados a ${domainLabel}` : `Phase 2: Applied AI Workflows for ${domainLabel}`,
      phaseOrder: 2,
      topic: isEs ? `Automatización de Tareas Clave en ${domainLabel}` : `Core Workflow Automation Tailored to ${domainLabel}`,
      conceptSummary: isEs
        ? `Aprende a transformar tareas repetitivas en ${domainLabel}${goal ? ` (en particular ${goal})` : ''} en prompts modulares estructurados con resultados consistentes.`
        : `Turn repetitive tasks in ${domainLabel}${goal ? ` (especially ${goal})` : ''} into structured, high-fidelity prompt routines with predictable outputs.`,
      format: resGen1.format as any,
      resourceName: isEs ? (resGen1.titleEs || resGen1.title) : resGen1.title,
      resourceUrl: resGen1.url,
      isFree: true,
      platform: resGen1.platform,
      duration: scaleDuration(45, timeCommitment),
      actionableTask: isEs
        ? `Identifica la tarea más repetitiva de tu semana en ${domainLabel}${goal ? ` vinculada a ${goal}` : ''}. Diseña un prompt con: Contexto detallado, Entrada estructurada y Formato de salida esperado.`
        : `Pinpoint the single most time-consuming recurring task in your work with ${domainLabel}${goal ? ` (${goal})` : ''}. Write a reusable prompt template with input slots and formatting constraints.`,
      difficulty: level === 'beginner' ? 'Beginner' : 'Intermediate',
      language: prefs.language,
    });

    items.push({
      id: 'step-2-custom-2',
      phase: isEs ? `Fase 2: Flujos Aplicados a ${domainLabel}` : `Phase 2: Applied AI Workflows for ${domainLabel}`,
      phaseOrder: 2,
      topic: isEs ? `Construcción de un Asistente Personalizado para ${domainLabel}` : `Building a Reusable Custom Assistant for ${domainLabel}`,
      conceptSummary: isEs
        ? `Configura un Gem o asistente especializado en Gemini o ChatGPT con las pautas de ${domainLabel} para tener un copiloto siempre disponible.`
        : `Package standard guidelines, templates, and domain knowledge for ${domainLabel} into a persistent custom Gem or assistant.`,
      format: resGen2.format as any,
      resourceName: isEs ? (resGen2.titleEs || resGen2.title) : resGen2.title,
      resourceUrl: resGen2.url,
      isFree: true,
      platform: resGen2.platform,
      duration: scaleDuration(45, timeCommitment),
      actionableTask: isEs
        ? `Crea un asistente en Gemini con el rol: 'Especialista Senior en ${domainLabel}'. Dale 3 instrucciones clave de trabajo${goal ? ` orientadas a ${goal}` : ''} y prueba 3 consultas diferentes.`
        : `Configure a custom assistant in Gemini with instructions: 'You are a Lead Specialist in ${domainLabel}'. Add 3 specific operating guidelines${goal ? ` addressing ${goal}` : ''} and test with 3 scenarios.`,
      difficulty: 'Intermediate',
      language: prefs.language,
    });
  }

  // =========================================================================
  // PHASE 3: PRIVACY, ETHICS & GUARDRAILS (Domain-aligned)
  // =========================================================================
  const resSecurity = pickResource(
    format,
    isEs ? 'es' : 'en',
    'res-owasp-llm-top-10',
    ['security', 'privacy', 'owasp']
  );

  items.push({
    id: 'step-3-1',
    phase: isEs ? 'Fase 3: Privacidad, Seguridad y Mejores Prácticas' : 'Phase 3: Privacy, Security & AI Governance',
    phaseOrder: 3,
    topic: isEs ? `Privacidad de Datos y Seguridad de Prompts en ${domainLabel}` : `Data Privacy & Prompt Security in ${domainLabel}`,
    conceptSummary: isEs
      ? `Aprende qué datos NUNCA ingresar en modelos públicos (datos personales, secretos comerciales) y cómo prevenir fugas en ${domainLabel}.`
      : `Understand critical boundaries: what data never to send to public models (PII, credentials, proprietary data) and defense against prompt injection in ${domainLabel}.`,
    format: resSecurity.format as any,
    resourceName: isEs ? (resSecurity.titleEs || resSecurity.title) : resSecurity.title,
    resourceUrl: resSecurity.url,
    isFree: true,
    platform: resSecurity.platform,
    duration: scaleDuration(40, timeCommitment),
    actionableTask: isEs
      ? `Toma un documento de trabajo real de ${domainLabel}. Practica un protocolo de sanitización reemplazando nombres, cifras confidenciales y datos sensibles por marcadores de posición [EMPRESA_X], [CLIENTE_1] antes de enviar al modelo.`
      : `Audit a document from ${domainLabel}. Practice sanitizing all proprietary client data, names, and internal metrics with mock tokens ([CLIENT_A], [METRIC_1]) before prompting.`,
    difficulty: level === 'beginner' ? 'Beginner' : 'Intermediate',
    language: prefs.language,
  });

  // =========================================================================
  // PHASE 4: CAPSTONE MILESTONE & PORTFOLIO PROJECT
  // =========================================================================
  const capstoneProjectName = goal
    ? (isEs ? `Proyecto Integrador: ${goal}` : `Capstone Project: ${goal}`)
    : (isEs ? `Proyecto Integrador: Flujo Integral para ${domainLabel}` : `Capstone Project: End-to-End Workflow for ${domainLabel}`);

  const resStudio = pickResource(
    format,
    isEs ? 'es' : 'en',
    'res-ai-studio-quickstart',
    ['gemini', 'prototyping', 'google-ai']
  );

  items.push({
    id: 'step-4-1',
    phase: isEs ? 'Fase 4: Proyecto Integrador y Caso de Uso Real' : 'Phase 4: Capstone Project & Real-World Application',
    phaseOrder: 4,
    topic: capstoneProjectName,
    conceptSummary: isEs
      ? `Aplica todo lo aprendido integrando tus prompts, instrucciones y verificaciones en un sistema completo que resuelva tu objetivo en ${domainLabel}.`
      : `Synthesize everything you have learned by constructing a complete, tested workflow or custom assistant solving a high-value challenge in ${domainLabel}.`,
    format: resStudio.format as any,
    resourceName: isEs ? (resStudio.titleEs || resStudio.title) : resStudio.title,
    resourceUrl: resStudio.url,
    isFree: true,
    platform: resStudio.platform,
    duration: scaleDuration(90, timeCommitment),
    actionableTask: isEs
      ? `Construye tu solución completa para ${domainLabel}${goal ? ` (${goal})` : ''}: incluye 1) Rol del sistema detallado, 2) 3 ejemplos Few-Shot de tu flujo de trabajo, 3) Reglas de formato estricto en tabla/JSON. Pruébalo con 3 casos reales y valida los resultados.`
      : `Build your full working AI workflow for ${domainLabel}${goal ? ` (${goal})` : ''}: specify System Instructions, 3 Few-Shot exemplars, strict output constraints, and test with 3 real-world inputs to measure time saved.`,
    difficulty: level === 'beginner' ? 'Beginner' : level === 'intermediate' ? 'Intermediate' : 'Advanced',
    language: prefs.language,
  });

  const enrichedItems = enrichRoadmapItemsWithReputableSources(items, prefs.language);

  return {
    roadmapTitle,
    summary,
    items: enrichedItems,
  };
}

// Backwards-compatible function returning RoadmapItem[]
export function buildPersonalizedRoadmap(
  prefs: UserPreferences,
  options?: GenerateOptions
): RoadmapItem[] {
  return generateFullRoadmap(prefs, options).items;
}
