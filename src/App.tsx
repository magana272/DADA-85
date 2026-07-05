import { lazy, Suspense, useState } from 'react'
import './App.css'
import BasicCalculator from './features/BasicCalculator/BasicCalculator'
import ScientificCalculator from './features/ScientificCalculator/ScientificCalculator'
import ProgrammerCalculator from './features/ProgrammerCalculator/ProgrammerCalculator'
import CalculatorBack from './components/ui/CalculatorBack'

const Stage3D = lazy(() => import('./components/ui/stage3d/Stage3D'))

const CALC_MODES = ['basic', 'scientific', 'programmer'] as const
type CalcMode = (typeof CALC_MODES)[number]
type View = 'calculator' | 'laptop'

function App() {
  const [calcMode, setCalcMode] = useState<CalcMode>('basic')
  const [view, setView] = useState<View>('calculator')

  const calculator =
    calcMode === 'basic' ? <BasicCalculator />
      : calcMode === 'scientific' ? <ScientificCalculator />
        : <ProgrammerCalculator />

  return (
    <div>
      {}
      <Suspense
        fallback={
          <div className="stage3d">
            <div className="stage3d-loading">
              <div>
                DADA-85 BOOTING
                <br />
                {'░'.repeat(20)} 0%
                <span className="stage3d-loading-cursor">█</span>
              </div>
            </div>
          </div>
        }>
        <Stage3D view={view} back={<CalculatorBack />}>{calculator}</Stage3D>
      </Suspense>
      <div role="tablist" className="mode-switch">
        {CALC_MODES.map((m) => (
          <button
            key={m}
            role="tab"
            className={`tab ${view === 'calculator' && calcMode === m ? 'tab-active' : ''}`}
            onClick={() => {
              setCalcMode(m)
              setView('calculator')
            }}>
            {m}
          </button>
        ))}
        <button
          role="tab"
          className={`tab ${view === 'laptop' ? 'tab-active' : ''}`}
          onClick={() => setView('laptop')}>
          laptop
        </button>
      </div>
      <div className="crt-overlay" aria-hidden="true" />
      <p className="drag-hint">drag bg to orbit · grab the calculator to spin it · click the laptop</p>
    </div>
  )
}

export default App
