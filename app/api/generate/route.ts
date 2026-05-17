import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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

    const prompt = `You are LearnRise, a world-class AI learning companion and curriculum designer. Create an extremely detailed, personalized learning plan that feels like it was designed by a professional tutor who knows this subject deeply.

User inputs:
- What they want to learn: ${topic}
- Time available: ${time}
- Goal and motivation: ${goal}

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short compelling course title (max 6 words)",
  "meta": "X weeks · Y hrs/day · Beginner/Intermediate/Advanced",
  "overview": "3-4 sentences. Describe exactly what they will learn, why this plan is structured this way, and how it connects to their specific goal.",
  "prerequisites": ["Specific prerequisite 1", "Specific prerequisite 2"],
  "weeks": [
    {
      "label": "Week 1-2: Topic Title",
      "theme": "One punchy sentence describing the core focus of this period",
      "difficulty": "Beginner",
      "estimated_hours": 10,
      "introduction": "2-3 sentences explaining WHY this week's topics are important, how they build on previous weeks, and what mindset to bring to this material.",
      "key_concepts": [
        "Concept name: Brief explanation of what this is and why it matters",
        "Concept name: Brief explanation of what this is and why it matters",
        "Concept name: Brief explanation of what this is and why it matters"
      ],
      "content": "3-4 sentences of detailed description of what they will learn and do. Be specific about the skills and knowledge they will gain.",
      "daily_tasks": [
        "Day 1-2: Very specific task — what exactly to do, which resource to use, and what to produce",
        "Day 3-4: Very specific task — what exactly to do, which resource to use, and what to produce",
        "Day 5-6: Very specific task — what exactly to do, which resource to use, and what to produce",
        "Day 7: Review, consolidate, and practice what was learned this week"
      ],
      "project": {
        "title": "Hands-on project title",
        "description": "2-3 sentences describing a specific project or exercise they will build or complete this week. Be concrete — name the exact thing they will make.",
        "outcome": "What they will have at the end of this project"
      },
      "resources": [
        {
          "name": "Exact real resource name",
          "type": "video_course",
          "url": "https://real-url.com",
          "why": "One specific sentence on why this resource is the best choice for this exact stage of learning"
        }
      ],
      "common_mistakes": [
        "Specific mistake beginners make at this stage and how to avoid it",
        "Another common mistake and how to avoid it"
      ],
      "motivation": "One encouraging sentence specific to this week's challenges that acknowledges the difficulty and motivates them to push through.",
      "checkpoint": "A very specific thing they should be able to do, explain, or have built by end of this week to confirm readiness to move on"
    }
  ],
  "milestone": "One powerful sentence: the exact thing they will be able to do or have built at the end of this entire plan.",
  "next_steps": [
    "Specific next topic or skill to learn after this plan",
    "Specific certification or project to pursue",
    "A community or resource to join to keep growing"
  ]
}

Critical rules:
- Resource types: video_course, article, book, tool, documentation, podcast, project
- Difficulty: Beginner, Intermediate, or Advanced
- URLs must be real, working links. Use: youtube.com, coursera.org, udemy.com, freecodecamp.org, docs.python.org, developer.mozilla.org, github.com, reddit.com, stackoverflow.com, medium.com, etc.
- key_concepts must be genuinely educational — explain the concept, not just name it
- common_mistakes must be specific and actionable — real mistakes people make
- project must be something concrete and buildable in the time available
- daily_tasks must be extremely specific — name the video, chapter, or exercise
- Create 3-6 week blocks appropriate to their timeline
- Be encouraging but honest about difficulty`

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

    return NextResponse.json(plan)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Generation error:', message)
    return NextResponse.json({ error: 'Failed to generate plan. Please try again.' }, { status: 500 })
  }
}
