import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { text, fileName } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Check if OpenAI API key is configured
    const openaiApiKey = process.env.OPENAI_API_KEY
    if (!openaiApiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    // Call OpenAI API to rewrite the text
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are an expert construction and engineering analyst. Your task is to rewrite and enhance extracted text from PDF documents to make it more professional, clear, and actionable. 

IMPORTANT FORMATTING REQUIREMENTS:
- Use proper line breaks and spacing for readability
- Structure the response with clear sections and headings
- Use bullet points and numbered lists where appropriate
- Maintain professional formatting with adequate spacing
- Do NOT put everything in one continuous paragraph

Focus on:
1. Improving clarity and readability
2. Adding professional terminology where appropriate
3. Organizing information logically with proper structure
4. Highlighting key insights and findings
5. Making recommendations actionable
6. Maintaining technical accuracy

Format the response with:
- Clear section headings
- Proper paragraph breaks
- Bullet points for lists
- Numbered items for sequences
- Adequate spacing between sections`
          },
          {
            role: 'user',
            content: `Please rewrite and enhance the following extracted text from the PDF document "${fileName}". Format the response with proper line breaks, clear sections, and professional structure:

${text}`
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API error:', errorData)
      return NextResponse.json({ error: 'Failed to process text with OpenAI' }, { status: 500 })
    }

    const data = await response.json()
    const rewrittenText = data.choices[0]?.message?.content

    if (!rewrittenText) {
      return NextResponse.json({ error: 'No response from OpenAI' }, { status: 500 })
    }

    return NextResponse.json({ 
      rewrittenText,
      originalText: text,
      fileName 
    })

  } catch (error) {
    console.error('Error rewriting text:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
