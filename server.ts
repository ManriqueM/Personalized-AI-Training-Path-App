import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Initialize Google Gen AI client with proper headers
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Roadmap generation endpoint using Gemini
app.post('/api/generate-roadmap', async (req: Request, res: Response) => {
  try {
    const {
      language = 'en',
      area = 'general_productivity',
      customArea = '',
      formatPreference = 'all',
      knowledgeLevel = 'beginner',
      timeCommitment = '3-5 hours/week',
      specificGoal = '',
      diagnosticScore = null,
    } = req.body;

    if (!ai) {
      return res.json({
        success: false,
        useLocalEngine: true,
        message: 'No API key configured on server. Using client curriculum engine.',
      });
    }

    const domainLabel = customArea || area;
    const isEs = language === 'es';

    const promptText = `
You are PathAI, an expert AI Curriculum Architect and Pedagogical Mentor.
Generate a structured, highly personalized AI learning path tailored to this user's specific background, domain, format, and knowledge level.

USER PROFILE:
- Preferred Language: ${isEs ? 'Spanish (Español)' : 'English'}
- Professional Domain / Role: "${domainLabel}"
- Format Preference: "${formatPreference}" (options: "video" = videos/visuals, "text" = documents/written tutorials, "interactive" = playgrounds/coding/labs, "all" = balanced mix)
- Knowledge Level: "${knowledgeLevel}" (beginner = brand new asking "what is a prompt?", intermediate = knows basic prompts wants advanced techniques, advanced = wants API/RAG/agents, expert = architect)
- Weekly Time Commitment: "${timeCommitment}"
- Specific Goal: "${specificGoal || 'Master practical AI workflows tailored to ' + domainLabel}"
- Diagnostic Score: ${diagnosticScore ? JSON.stringify(diagnosticScore) : 'Not provided'}

CRITICAL PERSONALIZATION DIRECTIVES:
1. HIGH DEGREE OF ADAPTATION: The roadmap MUST be distinctly customized for "${domainLabel}" and "${knowledgeLevel}".
   - If domain is Marketing: include buyer personas, copywriting frameworks, SEO cluster briefs, ad generation, and image prompting.
   - If domain is Software Dev: include code completion, automated unit tests, refactoring, Function Calling, tool use, and RAG architectures.
   - If domain is Business/Ops: include executive memos, spreadsheet analysis, SWOT analysis, KPI reporting, and workflow automation.
   - If domain is Education: include rubric design, lesson plans, and Socratic tutoring prompts.
   - If domain is Healthcare/Science: include research paper summarization, clinical protocol analysis, and privacy guardrails.
   - If domain is Legal: include contract clause comparison, risk spotting, and compliance auditing.
   - If knowledgeLevel is "beginner", Stage 1 MUST start with "What is a Prompt?" and basic prompt anatomy.
   - If knowledgeLevel is "advanced", skip basic prompt definitions and start directly with embeddings, high-dimensional spaces, vector search, or architecture.

2. REPUTABLE YOUTUBE VIDEOS & AUTHORITATIVE ARTICLES IN EVERY SUGGESTION:
   For EACH topic/step in the roadmap, you MUST provide BOTH:
   a) A reputable YouTube video ("videoResource") from recognized, high-quality educational channels matching the user's level and domain:
      - For Beginners & Workplace Productivity (EN):
        * Ethan Mollick (Wharton): AI mental models, assigning personas, everyday rules.
        * LearnPrompting: Prompt anatomy, delimiters, few-shot, step-by-step reasoning.
        * David Ondrej & All About AI (Kris): RTF & CREATE prompt frameworks, prompt engineering formulas.
        * Kevin Stratvert: Workplace office AI, Gemini & Copilot for non-technical beginners.
        * Jeff Su: Executive productivity, email writing, meeting briefs, spreadsheet synthesis.
        * Thomas Frank: Second brain, smart notes, knowledge management with AI.
        * Ali Abdaal: Socratic study methods, writing productivity, overcoming blank pages.
        * Sal Khan (Khan Academy): Socratic learning, teaching with AI, learning how to learn.
        * IBM Technology (Martin Keen): Clear lightboard explanations of parameters, hallucinations, and context windows.
      - For Intermediate & Advanced Technical Engineering (EN):
        * Andrej Karpathy: LLM token prediction, training, building GPT from scratch.
        * 3Blue1Brown (Grant Sanderson): Visualizing attention, transformers, and neural geometry.
        * DeepLearning.AI (Andrew Ng): Agentic patterns, RAG pipelines, fine-tuning.
        * Fireship & freeCodeCamp: Rapid developer tooling, Python, LangChain, API workflows.
        * StatQuest (Josh Starmer): Embeddings, vector spaces, and transformers step-by-step.
      - For Spanish Speakers (ES) across all levels:
        * DotCSV (Carlos Santana): Spanish gold standard for AI foundations, neural networks, and prompt mastery.
        * Freddy Vega / Platzi: AI for workplace productivity, daily job automation, and careers.
        * Midudev: Practical web engineering, integrating APIs, coding assistants in Spanish.
        * Nate Gentile: GPU hardware, tensor cores, and silicon compute for AI.
        * Fazt Code: Beginner-friendly AI APIs, endpoints, and JSON responses.
        * BettaTech: Clear Spanish explanations of LLMs, probabilities, and model reasoning.
        * Brais Moure (MoureDev): Productivity, tool reviews, and AI-assisted workflows.
      - Ensure the URL is a real canonical YouTube video or playlist link (e.g., https://www.youtube.com/watch?v=zjkBMFhNj_g for Karpathy, https://www.youtube.com/watch?v=KytW151HRns for DotCSV, https://www.youtube.com/playlist?list=PLZHQObOWTQDNU6R1_67000Dx_ZCJB-3pi for 3Blue1Brown, https://www.youtube.com/watch?v=jC4v5AS4RIM for All About AI, https://www.youtube.com/watch?v=Srh_j3yF_v0 for Jeff Su, https://www.youtube.com/watch?v=wX-y0hJ1y3M for Ethan Mollick, https://www.youtube.com/watch?v=H77H-mP8rF0 for Platzi).
   b) A reputable article or official documentation link ("articleResource") from vetted authoritative sources:
      - Examples: LearnPrompting.org (https://learnprompting.org/docs/intro), PromptingGuide.ai / DAIR.AI (https://www.promptingguide.ai), Google for Developers / Gemini Docs (https://ai.google.dev/gemini-api/docs), Hugging Face (https://huggingface.co/learn/nlp-course), Microsoft Generative AI for Beginners (https://github.com/microsoft/generative-ai-for-beginners), Anthropic Prompt Guides (https://docs.anthropic.com), OpenAI Guides (https://platform.openai.com/docs/guides/prompt-engineering), OWASP Foundation (https://owasp.org), fast.ai (https://course.fast.ai).

3. 100% FREE RESOURCES:
   - Every single recommended resource, video, and article MUST be 100% free to access without paywalls or required subscriptions.

4. ACTIONABLE TASKS:
   - Every single item must have a concrete, copy-pasteable practice prompt or exercise directly related to "${domainLabel}" and "${specificGoal || domainLabel}".

5. LANGUAGE:
   - If language is 'es', ALL roadmapTitle, summary, phase names, topic titles, concept summaries, and actionableTasks MUST be written in fluent Spanish.

Provide between 5 and 7 steps grouped into 3-4 clear phases.
`;

    // Standard Gemini 3 models prioritized
    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let responseText: string | null = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: promptText,
          config: {
            systemInstruction:
              'You are a senior AI curriculum designer. Output only valid JSON following the schema. Ensure all YouTube channels and article sources are verified and reputable.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                roadmapTitle: { type: Type.STRING },
                summary: { type: Type.STRING },
                items: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      phase: { type: Type.STRING },
                      phaseOrder: { type: Type.INTEGER },
                      topic: { type: Type.STRING },
                      conceptSummary: { type: Type.STRING },
                      format: {
                        type: Type.STRING,
                        description: 'Video, Document, Interactive, or Course',
                      },
                      resourceName: { type: Type.STRING },
                      resourceUrl: { type: Type.STRING },
                      isFree: { type: Type.BOOLEAN },
                      platform: { type: Type.STRING },
                      duration: { type: Type.STRING },
                      actionableTask: { type: Type.STRING },
                      difficulty: { type: Type.STRING },
                      language: { type: Type.STRING },
                      videoResource: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          url: { type: Type.STRING },
                          channel: { type: Type.STRING },
                          duration: { type: Type.STRING },
                        },
                        required: ['title', 'url', 'channel'],
                      },
                      articleResource: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          url: { type: Type.STRING },
                          publication: { type: Type.STRING },
                          readingTime: { type: Type.STRING },
                        },
                        required: ['title', 'url', 'publication'],
                      },
                    },
                    required: [
                      'id',
                      'phase',
                      'phaseOrder',
                      'topic',
                      'conceptSummary',
                      'format',
                      'resourceName',
                      'resourceUrl',
                      'isFree',
                      'platform',
                      'duration',
                      'actionableTask',
                      'difficulty',
                    ],
                  },
                },
              },
              required: ['roadmapTitle', 'summary', 'items'],
            },
          },
        });

        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed, trying next:`, err?.status || err?.message);
        lastError = err;
      }
    }

    if (!responseText) {
      throw lastError || new Error('All Gemini model endpoints failed');
    }

    const parsed = JSON.parse(responseText);
    return res.json({
      success: true,
      roadmapTitle: parsed.roadmapTitle,
      summary: parsed.summary,
      items: parsed.items || [],
    });
  } catch (err: any) {
    console.error('Error generating roadmap with Gemini:', err);
    return res.json({
      success: false,
      useLocalEngine: true,
      error: err?.message || 'Gemini error, fallback to dynamic engine',
    });
  }
});

// Explain topic or generate practice prompt endpoint
app.post('/api/explain-topic', async (req: Request, res: Response) => {
  try {
    const { topic, conceptSummary, userQuestion, language = 'en' } = req.body;

    if (!ai) {
      return res.json({
        success: false,
        explanation:
          language === 'es'
            ? `Este concepto (${topic}) es fundamental en la IA moderna. Te permite estructurar instrucciones precisas y reducir alucinaciones en modelos como Gemini y Claude.`
            : `This concept (${topic}) is central to modern generative AI. It allows you to build reliable, high-fidelity prompts that direct the model's behavior predictably.`,
      });
    }

    const isEs = language === 'es';
    const prompt = isEs
      ? `Explica de forma concisa y práctica el tema "${topic}" (${conceptSummary}).
Pregunta específica del alumno: "${userQuestion || '¿Cómo lo aplico en mi día a día?'}".
Incluye:
1. Explicación en 2-3 frases claras (sin jerga innecesaria).
2. Un ejemplo concreto de prompt "Antes vs Después".
3. Un consejo práctico para no cometer errores habituales.
Responde en Español.`
      : `Explain the topic "${topic}" (${conceptSummary}) concisely and practically.
Learner query: "${userQuestion || 'How do I apply this practically in daily work?'}".
Include:
1. A 2-3 sentence core explanation (zero jargon).
2. A concrete "Before vs After" prompt example.
3. A golden rule to avoid common mistakes.
Respond in English.`;

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let explanationText = '';

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction:
              'You are a friendly, concise AI tutor who gives direct, practical explanations with concrete prompt examples.',
          },
        });
        if (response.text) {
          explanationText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Tutor model ${modelName} failed:`, err?.status || err?.message);
      }
    }

    return res.json({
      success: true,
      explanation: explanationText || (isEs ? 'Resumen explicativo listo.' : 'Summary ready.'),
    });
  } catch (err: any) {
    console.error('Error explaining topic:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Failed to explain topic',
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: port,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`PathAI server running on http://0.0.0.0:${port}`);
  });
}

startServer();
