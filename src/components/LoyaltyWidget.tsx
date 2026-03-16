import React, { useState, useEffect } from 'react'
import { getClientPoints, redeemReward } from '../lib/fidali'

interface LoyaltyWidgetProps {
  phone?: string
  compact?: boolean
}

export default function LoyaltyWidget({ phone, compact = false }: LoyaltyWidgetProps) {
  const [inputPhone, setInputPhone] = useState(phone || '')
  const [loyalty, setLoyalty] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [redeemLoading, setRedeemLoading] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (phone) {
      loadPoints(phone)
    }
  }, [phone])

  const loadPoints = async (p: string) => {
    if (!p || p.length < 8) return
    setLoading(true)
    setError('')
    try {
      const data = await getClientPoints(p)
      if (data && data.card) {
        setLoyalty(data)
      } else {
        setError('Aucune carte fidélité trouvée pour ce numéro')
        setLoyalty(null)
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async () => {
    if (!loyalty) return
    setRedeemLoading(true)
    try {
      const result = await redeemReward(inputPhone || phone || '')
      if (result.success) {
        setSuccess(`🎉 ${result.reward} — Profitez-en !`)
        loadPoints(inputPhone || phone || '')
        setTimeout(() => setSuccess(''), 5000)
      } else {
        setError(result.error || 'Erreur')
      }
    } catch {
      setError('Erreur de connexion')
    } finally {
      setRedeemLoading(false)
    }
  }

  const card = loyalty?.card
  const pct = card ? Math.min((card.points / card.max_points) * 100, 100) : 0
  const isComplete = card ? card.points >= card.max_points : false

  return (
    <div style={{ maxWidth: compact ? 340 : 400, margin: '0 auto' }}>

      {/* Formulaire si pas de phone passé en props */}
      {!phone && (
        <div style={{
          display: 'flex', gap: 8, marginBottom: 16,
        }}>
          <input
            type="tel"
            value={inputPhone}
            onChange={e => setInputPhone(e.target.value)}
            placeholder="Votre numéro (05xx...)"
            style={{
              flex: 1, padding: '12px 16px',
              border: '1px solid #e5e7eb', borderRadius: 12,
              fontSize: 14, outline: 'none',
              fontFamily: 'inherit',
            }}
            onKeyDown={e => e.key === 'Enter' && loadPoints(inputPhone)}
          />
          <button
            onClick={() => loadPoints(inputPhone)}
            disabled={loading || inputPhone.length < 8}
            style={{
              padding: '12px 20px',
              background: loading ? '#d1d5db' : '#9333ea',
              color: 'white', border: 'none',
              borderRadius: 12, fontWeight: 700,
              fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background 0.2s',
            }}
          >
            {loading ? '...' : 'Voir'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !card && (
        <div style={{ textAlign: 'center', padding: 24, color: '#9ca3af' }}>
          Chargement...
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 12,
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#ef4444', fontSize: 13, marginBottom: 12,
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}

      {/* Succès */}
      {success && (
        <div style={{
          padding: '12px 16px', borderRadius: 12,
          background: '#f0fdf4', border: '1px solid #bbf7d0',
          color: '#16a34a', fontSize: 13, marginBottom: 12,
          textAlign: 'center', fontWeight: 600,
        }}>
          {success}
        </div>
      )}

      {/* Carte fidélité */}
      {card && (
        <div style={{
          background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
          borderRadius: 20, padding: compact ? 20 : 28,
          color: 'white', fontFamily: "'Inter', sans-serif",
          boxShadow: '0 8px 32px rgba(147,51,234,0.25)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Cercle déco */}
          <div style={{
            position: 'absolute', top: -40, right: -40,
            width: 120, height: 120, borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <div style={{
            position: 'absolute', bottom: -30, left: -30,
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
          }} />

          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: 16,
            position: 'relative', zIndex: 1,
          }}>
            <div>
              <h3 style={{
                margin: 0, fontSize: compact ? 14 : 16,
                fontWeight: 700, opacity: 0.95,
              }}>
                🎯 Programme Fidélité
              </h3>
              {loyalty?.name && (
                <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.6 }}>
                  {loyalty.name}
                </p>
              )}
            </div>
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              padding: '5px 12px', borderRadius: 20,
              fontSize: 11, fontWeight: 700,
            }}>
              {card.total_visits || 0} visite{(card.total_visits || 0) > 1 ? 's' : ''}
            </div>
          </div>

          {/* Points */}
          <div style={{
            textAlign: 'center', margin: compact ? '16px 0' : '24px 0',
            position: 'relative', zIndex: 1,
          }}>
            <p style={{
              fontSize: compact ? 36 : 48, fontWeight: 900,
              margin: 0, letterSpacing: -1,
              fontFamily: "'Montserrat', sans-serif",
            }}>
              {card.points}
              <span style={{ fontSize: compact ? 18 : 22, opacity: 0.5, fontWeight: 600 }}>
                {' '}/ {card.max_points}
              </span>
            </p>
            <p style={{ fontSize: 12, opacity: 0.65, margin: '4px 0 0' }}>
              points collectés
            </p>
          </div>

          {/* Barre de progression */}
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 12, height: compact ? 8 : 10,
            margin: '16px 0', overflow: 'hidden',
            position: 'relative', zIndex: 1,
          }}>
            <div style={{
              background: isComplete
                ? 'linear-gradient(90deg, #10b981, #34d399)'
                : 'white',
              borderRadius: 12, height: '100%',
              width: `${pct}%`,
              transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>

          {/* Récompense */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', position: 'relative', zIndex: 1,
          }}>
            <p style={{ fontSize: 13, opacity: 0.85, margin: 0 }}>
              🎁 {card.reward}
            </p>
            <p style={{ fontSize: 11, opacity: 0.4, margin: 0 }}>
              {Math.round(pct)}%
            </p>
          </div>

          {/* Bouton réclamer */}
          {isComplete && (
            <button
              onClick={handleRedeem}
              disabled={redeemLoading}
              style={{
                marginTop: 16, width: '100%',
                padding: '14px', background: 'white',
                color: '#9333ea', border: 'none',
                borderRadius: 14, fontWeight: 800,
                fontSize: 15, cursor: redeemLoading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'transform 0.2s, box-shadow 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                position: 'relative', zIndex: 1,
                opacity: redeemLoading ? 0.7 : 1,
              }}
              onMouseOver={e => {
                if (!redeemLoading) (e.target as HTMLButtonElement).style.transform = 'scale(1.02)'
              }}
              onMouseOut={e => {
                (e.target as HTMLButtonElement).style.transform = 'scale(1)'
              }}
            >
              {redeemLoading ? 'Chargement...' : '🎉 Réclamer ma récompense !'}
            </button>
          )}
        </div>
      )}

      {/* Powered by */}
      {card && (
        <p style={{
          textAlign: 'center', fontSize: 10,
          color: '#d1d5db', marginTop: 12,
        }}>
          Propulsé par <a href="https://fidali.vercel.app" target="_blank"
            style={{ color: '#9333ea', textDecoration: 'none', fontWeight: 600 }}>
            Fidali
          </a>
        </p>
      )}
    </div>
  )
}
