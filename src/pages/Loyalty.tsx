import React from 'react'
import LoyaltyWidget from '../components/LoyaltyWidget'

export default function Loyalty() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#fafafa',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header simple */}
      <div style={{
        background: 'white',
        borderBottom: '1px solid #f3f4f6',
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <a href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{
            margin: 0, fontSize: 20, fontWeight: 800,
            color: '#111', fontFamily: "'Montserrat', sans-serif",
          }}>
            WHITE AURA
          </h1>
        </a>
        <a href="/" style={{
          fontSize: 13, color: '#9333ea',
          textDecoration: 'none', fontWeight: 600,
        }}>
          ← Retour à la boutique
        </a>
      </div>

      {/* Contenu */}
      <div style={{
        maxWidth: 500, margin: '0 auto',
        padding: '48px 20px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 800, color: '#111',
            margin: '0 0 8px', fontFamily: "'Montserrat', sans-serif",
          }}>
            🎯 Ma Carte Fidélité
          </h2>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0 }}>
            Entrez votre numéro pour consulter vos points
          </p>
        </div>

        <LoyaltyWidget />

        {/* Comment ça marche */}
        <div style={{
          marginTop: 48, background: 'white',
          borderRadius: 20, padding: 28,
          border: '1px solid #f3f4f6',
        }}>
          <h3 style={{
            fontSize: 18, fontWeight: 700, color: '#111',
            margin: '0 0 20px', textAlign: 'center',
          }}>
            Comment ça marche ?
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { icon: '🛒', title: 'Achetez', desc: 'Passez commande sur White Aura' },
              { icon: '⭐', title: 'Cumulez', desc: '1 commande = 1 point de fidélité' },
              { icon: '🎁', title: 'Profitez', desc: 'Réclamez votre récompense quand la carte est pleine !' },
            ].map((step, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 16px', borderRadius: 14,
                background: '#faf5ff',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, #9333ea, #db2777)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#111' }}>
                    {step.title}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 12, color: '#6b7280' }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
