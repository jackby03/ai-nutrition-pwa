import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { preferences, goals } = req.body

  try {
    const prompt = `Generate a personalized meal plan for someone with these preferences: ${preferences} and goals: ${goals}. Include breakfast, lunch, dinner, and snacks.`
    
    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      prompt,
      max_tokens: 500,
      temperature: 0.7,
    })

    const mealPlan = response.choices[0]?.text?.trim()

    res.status(200).json({ mealPlan })
  } catch (error) {
    console.error('Error generating meal plan:', error)
    res.status(500).json({ message: 'Error generating meal plan' })
  }
}