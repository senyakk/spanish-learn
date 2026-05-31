import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function safeParseJSON(text: string): unknown | null {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  } catch {
    return null;
  }
}

function buildPrompt(
  exerciseType: string,
  phrase: string,
  translation: string,
  categoryLabels: string[],
  difficulty: string
): string {
  const context = categoryLabels.length > 0 ? `Context: ${categoryLabels.join(', ')}.` : '';

  if (exerciseType === 'multiple-choice') {
    return `Generate a multiple-choice Spanish exercise for the word/phrase: "${phrase}" (${translation}).
${context}
Difficulty: ${difficulty}.

Write a natural Spanish sentence using this word/phrase. Then provide exactly 4 English answer options where one is the correct translation of the highlighted phrase used in context.

Return ONLY valid JSON:
{
  "sentence": "...",
  "sentenceTranslation": "...",
  "correctAnswer": "${translation}",
  "highlightedWord": "exact substring from sentence to highlight (e.g. conjugated/declined form as it appears)",
  "options": ["option1", "option2", "option3", "option4"]
}

Shuffle the options array (correct answer should not always be first). Distractors should be plausible but clearly wrong in context. "highlightedWord" must be the exact characters as they appear in "sentence" — copy-paste from the sentence.`;
  }

  if (exerciseType === 'fill-in-blank') {
    return `Generate a fill-in-the-blank Spanish exercise for the word/phrase: "${phrase}" (${translation}).
${context}
Difficulty: ${difficulty}.

Write a natural Spanish sentence where "${phrase}" is the missing word (replaced by ___). Include a helpful hint.

Return ONLY valid JSON:
{
  "sentence": "Ella come comida muy ___.",
  "sentenceTranslation": "She eats very ___ food.",
  "blankWord": "${phrase}",
  "hint": "adjective meaning ${translation}",
  "correctAnswer": "${phrase}"
}

Replace the example sentence with your own. The ___ must represent exactly "${phrase}".`;
  }

  return `Generate a translation exercise (English → Spanish) using the phrase "${phrase}" (${translation}).
${context}
Difficulty: ${difficulty}.

Write a natural English sentence that contains "${translation}". The user must translate the FULL sentence into Spanish (not just the word).

Return ONLY valid JSON:
{
  "sentence": "The full English sentence the user will translate.",
  "correctAnswer": "The full correct Spanish translation of that sentence, which must contain '${phrase}'.",
  "acceptableVariants": ["alternative correct Spanish translation if any", "..."]
}

acceptableVariants should list other fully valid Spanish translations of the sentence. Return an empty array if there are none. Do NOT include sentenceTranslation.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phrase, translation, categoryLabels = [], exerciseType, difficulty = 'intermediate' } = body;

    if (!phrase || !translation || !exerciseType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const prompt = buildPrompt(exerciseType, phrase, translation, categoryLabels, difficulty);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a Spanish language exercise generator specializing in Castilian Spanish as spoken in continental Spain. Use vocabulary, expressions, and spelling conventions from Spain (e.g. vosotros, coger, ordenador, móvil, vale). Avoid Latin American vocabulary and expressions. Always return valid JSON only — no markdown, no explanation.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    const text = response.choices[0]?.message?.content ?? '';
    const exercise = safeParseJSON(text);

    if (!exercise) {
      return NextResponse.json({ error: 'Failed to parse exercise' }, { status: 500 });
    }

    return NextResponse.json({ exercise: { ...exercise as object, type: exerciseType, targetPhrase: phrase, targetTranslation: translation } });
  } catch (err) {
    console.error('generate-exercise error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
