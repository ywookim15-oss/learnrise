import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function buildResourceUrl(name: string, type: string): string {
  const query = encodeURIComponent(name)
  switch (type) {
    case 'video': return `https://www.youtube.com/results?search_query=${query}`
    case 'documentation': return `https://www.google.com/search?q=${query}+official+documentation`
    case 'book': return `https://www.google.com/search?q=${query}+free+pdf+read`
    case 'article': return `https://www.google.com/search?q=${query}`
    case 'tool': return `https://www.google.com/search?q=${query}`
    case 'exercise': return `https://www.google.com/search?q=${query}+practice+exercises`
    case 'community': return `https://www.reddit.com/search/?q=${query}`
    case 'project': return `https://github.com/search?q=${query}`
    default: return `https://www.google.com/search?q=${query}`
  }
}

function extractWeekCount(timeInput: string): number {
  // Try to extract number of weeks from user input
  const match = timeInput.match(/(\d+)\s*week/i)
  if (match) return Math.min(Math.max(parseInt(match[1]), 4), 16)
  const monthMatch = timeInput.match(/(\d+)\s*month/i)
  if (monthMatch) return Math.min(parseInt(monthMatch[1]) * 4, 16)
  return 8 // default
}

export async function POST(req: NextRequest) {
  try {
    const { topic, time, goal, skillLevel = 'Beginner', regenerateWith } = await req.json()

    if (!topic || !time || !goal) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const weekCount = extractWeekCount(time)

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 8192,
      },
    })

    const regenerateNote = regenerateWith
      ? `\n\nThe user wants to adjust: "${regenerateWith}". Adjust accordingly.`
      : ''

    const prompt = `You are an expert curriculum designer. Create a ${weekCount}-week course on "${topic}".

CRITICAL RULES — FOLLOW EXACTLY:
1. The "weeks" array MUST have EXACTLY ${weekCount} objects — one per week
2. Each week object covers ONE week only — Week 1, Week 2, Week 3... up to Week ${weekCount}
3. Each week MUST have exactly 4 lessons — no more, no less
4. Do NOT combine multiple weeks into one object
5. Do NOT label a week as "Week 1-2" or "Week 1-3" — each week is exactly ONE week
6. week_number must go from 1 to ${weekCount} sequentially

User details:
- Topic: ${topic}
- Time: ${time} (${weekCount} weeks)
- Goal: ${goal}
- Skill level: ${skillLevel}${regenerateNote}

Skill level guidance: ${skillLevel === 'Beginner' ? 'Start from absolute basics, assume zero prior knowledge, explain everything.' : skillLevel === 'Intermediate' ? 'Skip basics, focus on depth, real-world application, and nuance.' : 'Advanced patterns, architecture, edge cases, expert-level depth only.'}

Respond ONLY with this exact JSON structure:
{
  "title": "Course title (max 8 words)",
  "subtitle": "One sentence describing the transformation",
  "meta": "${weekCount} weeks · ${skillLevel}",
  "total_hours": ${weekCount * 5},
  "overview": "4-5 sentences about what students will be able to DO after completing this course.",
  "prerequisites": ["prerequisite 1", "prerequisite 2"],
  "outcomes": ["outcome 1", "outcome 2", "outcome 3", "outcome 4"],
  "weeks": [
    {
      "week_number": 1,
      "title": "Title for week 1 only",
      "theme": "The core question week 1 answers",
      "difficulty": "Beginner",
      "estimated_hours": 5,
      "overview": "What week 1 specifically covers.",
      "lessons": [
        {
          "lesson_number": 1,
          "title": "Lesson title",
          "type": "lesson",
          "duration_minutes": 30,
          "content": "Write 3-4 paragraphs of actual teaching content. Explain the concept clearly with examples and analogies. Make it genuinely educational.",
          "key_takeaways": ["takeaway 1", "takeaway 2", "takeaway 3"],
          "resources": [
            {
              "name": "Specific real resource name",
              "type": "video",
              "description": "What this covers and what to focus on"
            }
          ]
        },
        {
          "lesson_number": 2,
          "title": "Lesson 2 title",
          "type": "exercise",
          "duration_minutes": 45,
          "content": "Step-by-step exercise instructions with clear success criteria.",
          "key_takeaways": ["what this exercise builds"],
          "resources": []
        },
        {
          "lesson_number": 3,
          "title": "Lesson 3 title",
          "type": "lesson",
          "duration_minutes": 30,
          "content": "Teaching content for lesson 3.",
          "key_takeaways": ["takeaway 1", "takeaway 2"],
          "resources": []
        },
        {
          "lesson_number": 4,
          "title": "Lesson 4 title",
          "type": "project",
          "duration_minutes": 60,
          "content": "Project instructions — what to build, how, and what success looks like.",
          "key_takeaways": ["what this project proves"],
          "resources": []
        }
      ],
      "week_project": {
        "title": "Week 1 project title",
        "description": "What the student builds this week.",
        "steps": ["step 1", "step 2", "step 3"],
        "outcome": "What they have when done",
        "difficulty": "Beginner"
      },
      "checkpoint": {
        "question": "How do you know you're ready for week 2?",
        "criteria": ["Can you do X?", "Do you understand Y?"]
      }
    }
  ],
  "final_project": {
    "title": "Capstone project title",
    "description": "The major project tying everything together.",
    "deliverables": ["deliverable 1", "deliverable 2", "deliverable 3"],
    "outcome": "What having this means for their goal"
  },
  "milestone": "One sentence: what they can do after completing this course.",
  "next_steps": ["next topic", "certification to pursue", "community to join"]
}

REMEMBER: Generate EXACTLY ${weekCount} week objects in the weeks array. Each covers ONE week. Week numbers go 1 through ${weekCount}.`

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

    // Enforce week count — if AI returned wrong number, fix it
    if (plan.weeks && plan.weeks.length !== weekCount) {
      console.warn(`AI returned ${plan.weeks.length} weeks instead of ${weekCount}`)
      // Re-number weeks correctly
      plan.weeks = plan.weeks.slice(0, weekCount).map((w: { week_number: number }, i: number) => ({
        ...w,
        week_number: i + 1,
      }))
    }

    // Add real URLs to all resources
    if (plan.weeks) {
      plan.weeks = plan.weeks.map((week: {
        lessons?: Array<{
          resources?: Array<{ name: string; type: string }>
        }>
      }) => ({
        ...week,
        lessons: (week.lessons || []).map((lesson: {
          resources?: Array<{ name: string; type: string }>
        }) => ({
          ...lesson,
          resources: (lesson.resources || []).map((r: { name: string; type: string }) => ({
            ...r,
            url: buildResourceUrl(r.name, r.type),
          })),
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
