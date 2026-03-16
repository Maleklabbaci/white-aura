// ============================================
// FIDALI — Intégration Carte Fidélité
// ============================================

const FIDALI = {
  apiUrl: 'https://fidali.vercel.app/api/v1',
  apiKey: '', // ← Sera configuré dans la page
  cardCode: '', // ← Sera configuré dans la page

  // Configurer
  init: function(config) {
    this.apiKey = config.apiKey || ''
    this.cardCode = config.cardCode || ''
  },

  // Headers pour les requêtes
  _headers: function() {
    return {
      'Authorization': 'Bearer ' + this.apiKey,
      'Content-Type': 'application/json'
    }
  },

  // ── Afficher les points d'un client ──
  showPoints: async function(phone, containerId) {
    const container = document.getElementById(containerId || 'fidali-widget')
    if (!container) return

    container.innerHTML = '<p style="color:#999;font-size:13px">Chargement...</p>'

    try {
      const res = await fetch(this.apiUrl + '/client/' + phone, {
        headers: { 'Authorization': 'Bearer ' + this.apiKey }
      })
      const data = await res.json()

      if (data.error || !data.cards || !data.cards.length) {
        container.innerHTML = ''
        return null
      }

      const card = data.cards[0]
      const pct = Math.min((card.points / card.max_points) * 100, 100)
      const isComplete = card.points >= card.max_points

      container.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #9333ea 0%, #db2777 100%);
          border-radius: 20px; padding: 24px; color: white;
          max-width: 380px; font-family: 'Segoe UI', sans-serif;
          box-shadow: 0 8px 32px rgba(147,51,234,0.3);
          margin: 16px 0;
        ">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
            <div>
              <h3 style="margin:0;font-size:15px;font-weight:700;opacity:0.9">🎯 Programme Fidélité</h3>
              <p style="margin:4px 0 0;font-size:11px;opacity:0.6">${card.total_visits || 0} visite(s)</p>
            </div>
            <div style="
              background: rgba(255,255,255,0.15);
              padding: 6px 14px; border-radius: 20px;
              font-size: 11px; font-weight: 700;
            ">
              ${card.business_name || 'White Aura'}
            </div>
          </div>
          
          <div style="text-align:center;margin:20px 0">
            <p style="font-size:42px;font-weight:900;margin:0;letter-spacing:-1px">
              ${card.points} <span style="font-size:20px;opacity:0.6">/ ${card.max_points}</span>
            </p>
            <p style="font-size:12px;opacity:0.7;margin-top:4px">points collectés</p>
          </div>
          
          <div style="background:rgba(255,255,255,0.15);border-radius:12px;height:10px;margin:16px 0;overflow:hidden">
            <div style="
              background: ${isComplete ? '#10b981' : 'white'};
              border-radius: 12px; height: 100%;
              width: ${pct}%;
              transition: width 0.5s ease;
            "></div>
          </div>
          
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px">
            <p style="font-size:13px;opacity:0.85;margin:0">🎁 ${card.reward}</p>
            <p style="font-size:11px;opacity:0.5;margin:0">${Math.round(pct)}%</p>
          </div>
          
          ${isComplete ? `
            <button onclick="FIDALI.redeem('${phone}')" style="
              margin-top: 16px; width: 100%;
              padding: 12px; background: white;
              color: #9333ea; border: none;
              border-radius: 12px; font-weight: 800;
              font-size: 14px; cursor: pointer;
              font-family: inherit;
              transition: transform 0.2s;
            " onmouseover="this.style.transform='scale(1.02)'"
              onmouseout="this.style.transform='scale(1)'">
              🎉 Réclamer ma récompense !
            </button>
          ` : ''}
        </div>
      `

      return card
    } catch(e) {
      console.error('Fidali error:', e)
      container.innerHTML = ''
      return null
    }
  },

  // ── Ajouter des points ──
  addPoints: async function(phone, points) {
    try {
      const res = await fetch(this.apiUrl + '/points/add', {
        method: 'POST',
        headers: this._headers(),
        body: JSON.stringify({
          card_code: this.cardCode,
          phone: phone,
          points: points || 1
        })
      })
      const data = await res.json()

      if (data.success) {
        // Rafraîchir le widget
        this.showPoints(phone)

        if (data.reward_reached) {
          this._showNotification('🎉 Félicitations ! Vous avez gagné : ' + (data.reward || 'une récompense !'), 'success')
        } else {
          this._showNotification('✅ +' + points + ' point(s) ajouté(s) ! (' + data.points + '/' + data.max_points + ')', 'success')
        }
      }

      return data
    } catch(e) {
      console.error('Fidali error:', e)
      return { success: false, error: e.message }
    }
  },

  // ── Réclamer une récompense ──
  redeem: async function(phone) {
    try {
      const res = await fetch(this.apiUrl + '/reward/redeem', {
        method: 'POST',
        headers: this._headers(),
        body: JSON.stringify({
          card_code: this.cardCode,
          phone: phone
        })
      })
      const data = await res.json()

      if (data.success) {
        this._showNotification('🎉 ' + data.reward + ' — Profitez-en !', 'success')
        this.showPoints(phone)
      } else {
        this._showNotification('❌ ' + (data.error || 'Erreur'), 'error')
      }

      return data
    } catch(e) {
      console.error('Fidali error:', e)
      return { success: false, error: e.message }
    }
  },

  // ── Vérifier un client par téléphone ──
  checkClient: async function(phone) {
    try {
      const res = await fetch(this.apiUrl + '/client/' + phone, {
        headers: { 'Authorization': 'Bearer ' + this.apiKey }
      })
      return await res.json()
    } catch(e) {
      return { error: e.message }
    }
  },

  // ── Notification popup ──
  _showNotification: function(msg, type) {
    const notif = document.createElement('div')
    notif.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 99999;
      padding: 16px 24px; border-radius: 14px;
      font-family: 'Segoe UI', sans-serif;
      font-size: 14px; font-weight: 600;
      color: white; max-width: 360px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      animation: fidaliSlideIn 0.3s ease;
      ${type === 'success'
        ? 'background: linear-gradient(135deg, #10b981, #059669);'
        : 'background: linear-gradient(135deg, #ef4444, #dc2626);'
      }
    `
    notif.textContent = msg
    document.body.appendChild(notif)

    // Ajouter l'animation
    if (!document.getElementById('fidali-styles')) {
      const style = document.createElement('style')
      style.id = 'fidali-styles'
      style.textContent = `
        @keyframes fidaliSlideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `
      document.head.appendChild(style)
    }

    setTimeout(() => {
      notif.style.opacity = '0'
      notif.style.transition = 'opacity 0.3s'
      setTimeout(() => notif.remove(), 300)
    }, 4000)
  }
}
