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
      model: 'model: 'gemini-3.1-flash-lite',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const prompt = `You are LearnRise, an AI learning companion. Create a highly personalized, structured learning plan.

User inputs:
- What they want to learn: ${topic}
- Time available: ${time}
- Goal and motivation: ${goal}

Search your knowledge for the BEST real, specific resources (YouTube channels, free courses, documentation, books, websites, tools) for this exact topic. Be specific with resource names.

Respond ONLY with valid JSON in this exact format:
{
  "title": "Short compelling course title (max 6 words)",
  "meta": "X weeks · Y hrs/day · Beginner/Intermediate/Advanced",
  "overview": "2-3 sentences describing what they will achieve and why this plan works for their goal.",
  "weeks": [
    {
      "label": "Week 1-2: Topic Title",
      "content": "Specific description of what they will learn and do this period. Include concrete tasks and exercises.",
      "resources": ["Specific Resource Name 1", "Specific Resource Name 2", "Specific Resource Name 3"]
    }
  ],
  "milestone": "One clear sentence: what they will be able to do or have built at the end of this plan."
}

Create 3-5 week blocks appropriate to their timeline. Use only real, well-known resource names.`

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
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Failed to generate plan. Please try again.' }, { status: 500 })
  }
}
