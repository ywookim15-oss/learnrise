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

    const prompt = `You are LearnRise, an expert AI learning companion. Create a deeply personalized, structured learning plan.

User inputs:
- What they want to learn: ${topic}
- Time available: ${time}
- Goal and motivation: ${goal}

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short compelling course title (max 6 words)",
  "meta": "X weeks · Y hrs/day · Beginner/Intermediate/Advanced",
  "overview": "2-3 sentences describing what they will achieve and why this plan works for their specific goal.",
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "weeks": [
    {
      "label": "Week 1-2: Topic Title",
      "theme": "One sentence describing the focus of this period",
      "difficulty": "Beginner",
      "estimated_hours": 10,
      "content": "Detailed description of what they will learn and do this period. Be specific about concepts and skills.",
      "daily_tasks": [
        "Day 1-2: Specific task description",
        "Day 3-4: Specific task description",
        "Day 5-6: Specific task description",
        "Day 7: Review and practice"
      ],
      "resources": [
        {
          "name": "Exact Resource Name",
          "type": "video_course",
          "url": "https://example.com",
          "why": "One sentence on why this resource is perfect for this stage"
        }
      ],
      "checkpoint": "A specific thing they should be able to do or have built by the end of this week to confirm they are ready to move on"
    }
  ],
  "milestone": "One clear sentence: what they will be able to do or have built at the end of this plan.",
  "next_steps": ["What to learn after completing this plan", "Advanced topic or certification to pursue"]
}

Rules:
- Resource types must be one of: video_course, article, book, tool, documentation, podcast, project
- difficulty per week must be one of: Beginner, Intermediate, Advanced
- prerequisites should be honest — list what the user actually needs to know before starting. If none, return an empty array.
- daily_tasks should be specific and actionable, not vague
- resources must be real, well-known, and the best available for that specific stage
- URLs should be real links where possible (youtube.com, coursera.org, docs.python.org, etc.)
- Create 3-6 week blocks appropriate to their timeline`

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
