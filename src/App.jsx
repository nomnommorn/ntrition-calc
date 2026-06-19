import { useState, useMemo, useId } from 'react'
import './App.css'

// デフォルトの栄養素項目（栄養成分表示でよく見る順）
const DEFAULT_NUTRIENTS = [
  { id: 'energy', label: 'エネルギー', unit: 'kcal', value: '' },
  { id: 'protein', label: 'たんぱく質', unit: 'g', value: '' },
  { id: 'fat', label: '脂質', unit: 'g', value: '' },
  { id: 'carb', label: '炭水化物', unit: 'g', value: '' },
  { id: 'salt', label: '食塩相当量', unit: 'g', value: '' },
]

function round(num) {
  if (!Number.isFinite(num)) return 0
  return Math.round(num * 100) / 100
}

function NutrientRow({ nutrient, factor, onChange, onUnitChange, onRemove, removable }) {
  const baseId = useId()
  const numValue = parseFloat(nutrient.value)
  const hasValue = nutrient.value !== '' && Number.isFinite(numValue)
  const result = hasValue ? round(numValue * factor) : null

  return (
    <div className="nutrient-row">
      <div className="nutrient-row__label-area">
        <input
          className="nutrient-row__label-input"
          type="text"
          value={nutrient.label}
          onChange={(e) => onChange(nutrient.id, 'label', e.target.value)}
          aria-label="栄養素名"
        />
      </div>

      <div className="nutrient-row__input-area">
        <input
          id={baseId}
          className="nutrient-row__value-input"
          type="number"
          inputMode="decimal"
          placeholder="0"
          value={nutrient.value}
          onChange={(e) => onChange(nutrient.id, 'value', e.target.value)}
          aria-label={`${nutrient.label}の基準値`}
        />
        <input
          className="nutrient-row__unit-input"
          type="text"
          value={nutrient.unit}
          onChange={(e) => onUnitChange(nutrient.id, e.target.value)}
          aria-label="単位"
        />
      </div>

      <div className="nutrient-row__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M4 12h14m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div className="nutrient-row__result-area">
        <span className="nutrient-row__result-value">
          {result === null ? '—' : result}
        </span>
        <span className="nutrient-row__result-unit">{nutrient.unit}</span>
      </div>

      <button
        className="nutrient-row__remove"
        onClick={() => onRemove(nutrient.id)}
        disabled={!removable}
        aria-label={`${nutrient.label}を削除`}
        title={removable ? '削除' : '最低1項目は必要です'}
      >
        ×
      </button>
    </div>
  )
}

export default function App() {
  const [baseAmount, setBaseAmount] = useState('100')
  const [actualAmount, setActualAmount] = useState('')
  const [foodName, setFoodName] = useState('')
  const [nutrients, setNutrients] = useState(DEFAULT_NUTRIENTS)

  const baseNum = parseFloat(baseAmount)
  const actualNum = parseFloat(actualAmount)
  const validBase = Number.isFinite(baseNum) && baseNum > 0
  const validActual = Number.isFinite(actualNum) && actualNum > 0
  const factor = validBase && validActual ? actualNum / baseNum : null

  const scalePercent = useMemo(() => {
    if (!factor) return null
    return round(factor * 100)
  }, [factor])

  const handleNutrientChange = (id, field, value) => {
    setNutrients((prev) =>
      prev.map((n) => (n.id === id ? { ...n, [field]: value } : n))
    )
  }

  const handleUnitChange = (id, unit) => {
    setNutrients((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unit } : n))
    )
  }

  const handleRemove = (id) => {
    setNutrients((prev) => (prev.length > 1 ? prev.filter((n) => n.id !== id) : prev))
  }

  const handleAdd = () => {
    setNutrients((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, label: '項目', unit: 'g', value: '' },
    ])
  }

  const handleReset = () => {
    setBaseAmount('100')
    setActualAmount('')
    setFoodName('')
    setNutrients(DEFAULT_NUTRIENTS)
  }

  return (
    <div className="page">
      <header className="page__header">
        <div className="page__header-inner">
          <p className="page__eyebrow">NUTRITION LABEL CONVERTER</p>
          <h1 className="page__title">実量換算</h1>
          <p className="page__lede">
            「100gあたり」の成分表示と、実際の内容量。そのズレを、計算する。
          </p>
        </div>
      </header>

      <main className="page__main">
        <section className="setup-card">
          <div className="setup-card__field setup-card__field--name">
            <label htmlFor="foodName">食品名（任意）</label>
            <input
              id="foodName"
              type="text"
              placeholder="例）ミックスナッツ"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
            />
          </div>

          <div className="setup-card__amounts">
            <div className="setup-card__field">
              <label htmlFor="baseAmount">表示の基準量</label>
              <div className="setup-card__amount-input">
                <input
                  id="baseAmount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={baseAmount}
                  onChange={(e) => setBaseAmount(e.target.value)}
                />
                <span>g</span>
              </div>
              <p className="setup-card__hint">パッケージ表示が「100gあたり」ならそのまま100</p>
            </div>

            <div className="setup-card__scale" aria-hidden="true">
              <div className={`setup-card__scale-badge ${scalePercent !== null ? 'is-active' : ''}`}>
                {scalePercent !== null ? `× ${round(factor)}` : '× —'}
              </div>
            </div>

            <div className="setup-card__field">
              <label htmlFor="actualAmount">実際の内容量</label>
              <div className="setup-card__amount-input">
                <input
                  id="actualAmount"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  placeholder="例）85"
                  value={actualAmount}
                  onChange={(e) => setActualAmount(e.target.value)}
                />
                <span>g</span>
              </div>
              <p className="setup-card__hint">パッケージや個包装の実際の重さ</p>
            </div>
          </div>

          {scalePercent !== null && (
            <div className="setup-card__scale-bar" aria-hidden="true">
              <div className="setup-card__scale-bar-track">
                <div
                  className="setup-card__scale-bar-fill"
                  style={{ width: `${Math.min(scalePercent, 100)}%` }}
                />
                {scalePercent > 100 && (
                  <div className="setup-card__scale-bar-overflow">
                    実量が基準量を超えています（{scalePercent}%）
                  </div>
                )}
              </div>
              {scalePercent <= 100 && (
                <span className="setup-card__scale-bar-label">基準量の {scalePercent}%</span>
              )}
            </div>
          )}
        </section>

        <section className="table-card">
          <div className="table-card__header">
            <h2>
              {foodName ? foodName : '栄養成分'}
              <span className="table-card__header-sub">
                {validBase ? `（${baseAmount}gあたり → 実量換算）` : ''}
              </span>
            </h2>
          </div>

          <div className="table-card__columns" aria-hidden="true">
            <span className="table-card__col-label">項目</span>
            <span className="table-card__col-label">基準値</span>
            <span></span>
            <span className="table-card__col-label table-card__col-label--result">実量換算値</span>
            <span></span>
          </div>

          <div className="table-card__rows">
            {nutrients.map((n) => (
              <NutrientRow
                key={n.id}
                nutrient={n}
                factor={factor ?? 0}
                onChange={handleNutrientChange}
                onUnitChange={handleUnitChange}
                onRemove={handleRemove}
                removable={nutrients.length > 1}
              />
            ))}
          </div>

          {!validActual && (
            <p className="table-card__notice">
              「実際の内容量」を入力すると、換算値が表示されます。
            </p>
          )}

          <div className="table-card__actions">
            <button className="btn btn--ghost" onClick={handleAdd}>
              ＋ 項目を追加
            </button>
            <button className="btn btn--text" onClick={handleReset}>
              リセット
            </button>
          </div>
        </section>
      </main>

      <footer className="page__footer">
        <p>
          計算式：実量換算値 = 基準値 ÷ 基準量 × 実際の内容量
        </p>
      </footer>
    </div>
  )
}
