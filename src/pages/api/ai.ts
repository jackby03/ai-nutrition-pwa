import { NextApiRequest, NextApiResponse } from 'next'
import { unstable_getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { prisma } from '../../lib/prisma'

// Robust SDK-first approach to Google Generative AI with REST fallback and OpenAI fallback
async function generateMealPlan(userProfile: any) {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Google Gemini API key not configured')
  }

  // Create a detailed prompt based on user profile
  const prompt = `Generate a personalized daily meal plan for a person with the following profile:

PERSONAL INFO:
- Age: ${userProfile.age || 'not specified'}
- Sex: ${userProfile.sex || 'not specified'}
- Weight: ${userProfile.weight || 'not specified'} kg
- Height: ${userProfile.height || 'not specified'} cm
- Activity Level: ${userProfile.activityLevel || 'moderate'}

GOALS & DIET:
- Goal: ${userProfile.goal || 'maintain weight'}
- Diet Type: ${userProfile.dietType || 'omnivore'}
- Target Calories: ${userProfile.targetCalories || 2000}
- Target Protein: ${userProfile.targetProtein || 150}g
- Target Carbs: ${userProfile.targetCarbs || 250}g
- Target Fat: ${userProfile.targetFat || 70}g

RESTRICTIONS:
- Allergies: ${userProfile.allergies ? (Array.isArray(userProfile.allergies) ? userProfile.allergies.join(', ') : userProfile.allergies) : 'none'}
- Dislikes: ${userProfile.dislikes ? (Array.isArray(userProfile.dislikes) ? userProfile.dislikes.join(', ') : userProfile.dislikes) : 'none'}

Please create a detailed meal plan with:
1. Breakfast, lunch, dinner, and 2 snacks
2. Approximate calories and macros for each meal
3. Specific food items and portions
4. Total daily calories should be around ${userProfile.targetCalories || 2000}
5. Respect all dietary restrictions and preferences
6. Format as a clear, easy-to-read meal plan

Make it practical and realistic for everyday cooking.`

  let lastError: any = null

  // 1) Try using the installed SDK (@google/genai) if available
  try {
    const genaiModule: any = await import('@google/genai')
    const GoogleGenAI = genaiModule?.GoogleGenAI || genaiModule?.default || genaiModule
    if (GoogleGenAI) {
      try {
        const client = new GoogleGenAI({ apiKey })

        // Attempt to list models (if the SDK exposes it)
        let availableModels: any[] = []
        if (typeof client.listModels === 'function') {
          try {
            const list = await client.listModels()
            availableModels = list?.models || list?.data || []
          } catch (err) {
            console.log('SDK listModels failed:', err)
          }
        }

        // Prefer a gemini model if present, otherwise take the first model
        let selectedModel: string | null = null
        if (availableModels.length > 0) {
          const gemini = availableModels.find((m: any) => {
            const n = m?.name || m?.model || m
            return String(n).toLowerCase().includes('gemini')
          })
          const chosen = gemini || availableModels[0]
          selectedModel = (chosen?.name || chosen?.model || chosen)?.toString()
        }

        // If SDK supports models.generateContent pattern
        if (client.models && typeof client.models.generateContent === 'function') {
          try {
            // Use model name without 'models/' prefix for SDK
            const modelToUse = selectedModel || 'gemini-2.0-flash'
            const resp = await client.models.generateContent({
              model: modelToUse,
              contents: [{
                parts: [{ text: prompt }]
              }]
            })
            const text = resp?.candidates?.[0]?.content?.parts?.[0]?.text || resp?.output?.[0]?.content
            if (text) return text
          } catch (err) {
            console.log('SDK models.generateContent failed:', err)
            lastError = err
          }
        }

        // Try other common SDK method names if present
        if (typeof client.generateContent === 'function') {
          try {
            const resp = await client.generateContent({ model: selectedModel || 'gemini-1.5-flash', input: prompt })
            const text = resp?.outputText || resp?.text || JSON.stringify(resp)
            if (text) return text
          } catch (err) {
            console.log('SDK generateContent failed:', err)
            lastError = err
          }
        }

        if (typeof client.generateText === 'function') {
          try {
            const resp = await client.generateText({ model: selectedModel || 'gemini-1.5-flash', prompt })
            const text = resp?.text || resp?.outputText || JSON.stringify(resp)
            if (text) return text
          } catch (err) {
            console.log('SDK generateText failed:', err)
            lastError = err
          }
        }
      } catch (err) {
        console.log('Error instantiating GoogleGenAI client:', err)
        lastError = err
      }
    }
  } catch (err) {
    console.log('GenAI SDK not available or failed to import:', err)
    lastError = err
  }

  // 2) REST fallback: call ListModels then try generateContent on available models
  try {
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`)
    if (listResp.ok) {
      const listJson = await listResp.json()
      const models = listJson?.models || []

      // Build a prioritized list of candidate model full names
      const candidates = [] as string[]
      // Prefer gemini models
      for (const m of models) {
        const name = (m?.name || m)?.toString()
        if (!name) continue
        if (name.toLowerCase().includes('gemini')) candidates.unshift(name)
        else candidates.push(name)
      }

      // If no models returned, fall back to some commonly-tried names
      if (candidates.length === 0) {
        candidates.push('models/gemini-1.5-flash')
        candidates.push('models/gemini-1.5-pro')
      }

      for (const modelName of candidates) {
        // Try v1 then v1beta endpoints using the model name (if modelName already starts with 'models/' we append directly)
        const basePaths = [
          'https://generativelanguage.googleapis.com/v1',
          'https://generativelanguage.googleapis.com/v1beta'
        ]
        for (const base of basePaths) {
          try {
            const url = `${base}/${modelName}:generateContent?key=${apiKey}`
            const response = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }]
              })
            })

            if (response.ok) {
              const data = await response.json()
              const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.output?.[0]?.content
              if (text) return text
            } else {
              const txt = await response.text()
              console.log(`REST attempt failed for ${base}/${modelName}:`, txt)
              lastError = txt
            }
          } catch (err) {
            console.log(`REST request error for model ${modelName} at ${base}:`, err)
            lastError = err
          }
        }
      }
    } else {
      const txt = await listResp.text()
      console.log('ListModels REST failed:', txt)
      lastError = txt
    }
  } catch (err) {
    console.log('Error calling ListModels REST:', err)
    lastError = err
  }

  // 3) OpenAI fallback (if configured)
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    try {
      console.log('Attempting OpenAI fallback for meal plan generation...')
      const openaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: 'You are a helpful assistant that creates practical, realistic daily meal plans including calories and macros.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 900
        })
      })

      if (openaiResp.ok) {
        const data = await openaiResp.json()
        const text = data?.choices?.[0]?.message?.content
        if (text) return text
      } else {
        const txt = await openaiResp.text()
        console.log('OpenAI fallback failed:', txt)
        lastError = txt
      }
    } catch (err) {
      console.log('OpenAI fallback error:', err)
      lastError = err
    }
  }

  throw new Error(`All generation attempts failed. Last error: ${JSON.stringify(lastError)}`)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await unstable_getServerSession(req, res, authOptions)

    if (!session?.user?.email) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    // Get user profile from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user || !user.preferences) {
      return res.status(404).json({ message: 'User profile not found. Please complete your profile first.' })
    }

    // Parse profile data from preferences
    let userProfile;
    try {
      userProfile = JSON.parse(user.preferences);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid profile data. Please complete your profile again.' })
    }

    // Generate personalized meal plan
    const mealPlan = await generateMealPlan(userProfile)
    res.status(200).json({ mealPlan })
  } catch (error) {
    console.error('Error generating meal plan:', error)
    res.status(500).json({
      message: 'Error generating meal plan',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}