import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function buildResourceUrl(name: string, type: string): string {
  const query = encodeURIComponent(name)
  switch (type) {
    case 'video_course':
      return `https://www.youtube.com/results?search_query=${query}`
    case 'documentation':
      return `https://www.google.com/search?q=${query}+official+documentation`
    case 'book':
      return `https://www.google.com/search?q=${query}+book+free`
    case 'podcast':
      return `https://www.google.com/search?q=${query}+podcast`
    case 'tool':
      return `https://www.google.com/search?q=${query}`
    case 'article':
      return `https://www.google.com/search?q=${query}`
    case 'project':
      return `https://github.com/search?q=${query}`
    default:
      return `https://www.google.com/search?q=${query}`
  }
}

export async function POST(req: NextRequest) {
  try {
    const { topic, time, goal } = await req.json()

    if (!topic || !time || !goal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const prompt = `You are LearnRise, a world-class AI learning companion and curriculum designer. Create an extremely detailed, personalized learning plan that feels like it was designed by a professional tutor.

User inputs:
- What they want to learn: ${topic}
- Time available: ${time}
- Goal and motivation: ${goal}

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short compelling course title (max 6 words)",
  "meta": "X weeks · Y hrs/day · Beginner/Intermediate/Advanced",
  "overview": "3-4 sentences describing what they will learn and how it connects to their goal.",
  "prerequisites": ["Specific prerequisite 1", "Specific prerequisite 2"],
  "weeks": [
    {
      "label": "Week 1-2: Topic Title",
      "theme": "One punchy sentence describing the core focus",
      "difficulty": "Beginner",
      "estimated_hours": 10,
      "introduction": "2-3 sentences explaining WHY this week matters and what mindset to bring.",
      "key_concepts": [
        "Concept name: Brief explanation of what this is and why it matters",
        "Concept name: Brief explanation of what this is and why it matters",
        "Concept name: Brief explanation of what this is and why it matters"
      ],
      "content": "3-4 sentences of detailed description of what they will learn and do.",
      "daily_tasks": [
        "Day 1-2: Very specific task — what exactly to do and what to produce",
        "Day 3-4: Very specific task — what exactly to do and what to produce",
        "Day 5-6: Very specific task — what exactly to do and what to produce",
        "Day 7: Review and consolidate"
      ],
      "project": {
        "title": "Hands-on project title",
        "description": "2-3 sentences describing what they will build.",
        "outcome": "What they will have at the end"
      },
      "resources": [
        {
          "name": "Exact real resource name (e.g. 'CS50P Harvard Python Course', 'Corey Schafer Python Tutorials', 'Python.org Official Docs')",
          "type": "video_course"
        }
      ],
      "common_mistakes": [
        "Specific mistake and how to avoid it",
        "Another common mistake and how to avoid it"
      ],
      "motivation": "One encouraging sentence for this week.",
      "checkpoint": "Specific thing they should be able to do by end of this week."
    }
  ],
  "milestone": "One powerful sentence about what they will achieve.",
  "next_steps": ["Next topic to learn", "Certification to pursue", "Community to join"]
}

Rules:
- Resource types: video_course, article, book, tool, documentation, podcast, project
- Difficulty: Beginner, Intermediate, or Advanced
- DO NOT include any URLs — only resource names
- Resource names must be real and specific (e.g. "freeCodeCamp JavaScript Course" not "JavaScript tutorial")
- Create 3-6 week blocks`

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    let plan
    try {
      plan = JSON.parse(text)
    } catch {
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Failed to parse AI response')
      plan = JSON.parse(match[0])
    }

    // Build real working URLs for each resource
    if (plan.weeks) {
      plan.weeks = plan.weeks.map((week: { resources?: { name: string; type: string }[] }) => ({
        ...week,
        resources: (week.resources || []).map((r: { name: string; type: string }) => ({
          ...r,
          url: buildResourceUrl(r.name, r.type),
        })),
      }))
    }

    return NextResponse.json(plan)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Generation error:', message)
    return NextResponse.json({ error: 'Failed to generate plan. Please try again.' }, { status: 500 })
  }
}
