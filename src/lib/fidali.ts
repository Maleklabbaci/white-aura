// ============================================
// FIDALI — API Client pour White Aura
// ============================================

const FIDALI_CONFIG = {
  apiUrl: 'https://fidali.vercel.app/api/v1',
  // ⚠️ Mets ta NOUVELLE clé API (régénérée)
  apiKey: import.meta.env.VITE_FIDALI_API_KEY || '',
  cardCode: import.meta.env.VITE_FIDALI_CARD_CODE || '',
}

const headers = () => ({
  'Authorization': `Bearer ${FIDALI_CONFIG.apiKey}`,
  'Content-Type': 'application/json',
})

// Récupérer les points d'un client
export async function getClientPoints(phone: string) {
  try {
    const phoneClean = phone.replace(/\s/g, '')
    const res = await fetch(`${FIDALI_CONFIG.apiUrl}/client/${phoneClean}`, {
      headers: { 'Authorization': `Bearer ${FIDALI_CONFIG.apiKey}` },
    })
    const data = await res.json()

    if (data.error || !data.cards || !data.cards.length) {
      return null
    }

    return {
      name: data.name,
      phone: data.phone,
      card: data.cards[0],
    }
  } catch (e) {
    console.error('Fidali getClientPoints error:', e)
    return null
  }
}

// Ajouter des points après un achat
export async function addPoints(phone: string, points: number = 1) {
  try {
    const phoneClean = phone.replace(/\s/g, '')
    const res = await fetch(`${FIDALI_CONFIG.apiUrl}/points/add`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        card_code: FIDALI_CONFIG.cardCode,
        phone: phoneClean,
        points,
      }),
    })
    return await res.json()
  } catch (e) {
    console.error('Fidali addPoints error:', e)
    return { success: false, error: 'Erreur réseau' }
  }
}

// Réclamer une récompense
export async function redeemReward(phone: string) {
  try {
    const phoneClean = phone.replace(/\s/g, '')
    const res = await fetch(`${FIDALI_CONFIG.apiUrl}/reward/redeem`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        card_code: FIDALI_CONFIG.cardCode,
        phone: phoneClean,
      }),
    })
    return await res.json()
  } catch (e) {
    console.error('Fidali redeemReward error:', e)
    return { success: false, error: 'Erreur réseau' }
  }
}

// Stats de la carte
export async function getCardStats() {
  try {
    const res = await fetch(
      `${FIDALI_CONFIG.apiUrl}/card/${FIDALI_CONFIG.cardCode}/stats`,
      { headers: { 'Authorization': `Bearer ${FIDALI_CONFIG.apiKey}` } }
    )
    return await res.json()
  } catch (e) {
    console.error('Fidali getCardStats error:', e)
    return null
  }
}
