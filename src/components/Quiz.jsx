import { useState } from 'react'
import { Check, ChevronRight, RotateCcw } from 'lucide-react'
import { QUIZ_QUESTIONS } from '../data/quiz.js'

export default function Quiz() {
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = QUIZ_QUESTIONS[step]
  const total = QUIZ_QUESTIONS.length

  const answer = (index) => {
    if (selected !== null) return
    setSelected(index)
    if (index === question.correct) {
      setScore((value) => value + 1)
    }
  }

  const next = () => {
    if (step === total - 1) {
      setFinished(true)
      return
    }
    setStep((value) => value + 1)
    setSelected(null)
  }

  const restart = () => {
    setStep(0)
    setSelected(null)
    setScore(0)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="quiz-card">
        <div className="quiz-finished">
          <div className="trophy">
            <Check size={34} />
          </div>
          <div className="eyebrow">RESULTADO</div>
          <h3>
            {score === total ? 'Excelente resultado' : 'Revisão concluída'}
          </h3>
          <p>
            Você acertou{' '}
            <strong>
              {score} de {total}
            </strong>{' '}
            questões.
          </p>
          <button className="quiz-next" type="button" onClick={restart}>
            Refazer quiz <RotateCcw size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="quiz-card">
      <div className="quiz-head">
        <div>
          <div className="eyebrow">QUIZ</div>
          <h3>
            Questão {step + 1} de {total}
          </h3>
        </div>
        <span className="quiz-count">
          {step + 1} <i>/ {total}</i>
        </span>
      </div>

      <div className="quiz-progress">
        {QUIZ_QUESTIONS.map((_, i) => (
          <span key={i} className={i <= step ? 'active' : ''} />
        ))}
      </div>

      <p className="question-text">{question.q}</p>

      <div className="quiz-options">
        {question.options.map((option, index) => {
          let stateClass = ''
          if (selected !== null) {
            if (index === question.correct) stateClass = 'correct'
            else if (index === selected) stateClass = 'wrong'
          }

          return (
            <button
              key={option}
              type="button"
              onClick={() => answer(index)}
              disabled={selected !== null}
              className={`quiz-option${stateClass ? ` ${stateClass}` : ''}`}
            >
              <span className="option-letter">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
              {selected === index && index === question.correct && (
                <Check size={17} />
              )}
            </button>
          )
        })}
      </div>

      {selected !== null && (
        <div
          className={`answer-note ${selected === question.correct ? 'good' : 'try-again'}`}
          aria-live="polite"
        >
          {question.why}
        </div>
      )}

      <button
        className="quiz-next"
        type="button"
        onClick={next}
        disabled={selected === null}
      >
        {step === total - 1 ? 'Ver resultado' : 'Próxima questão'}
        <ChevronRight size={17} />
      </button>
    </div>
  )
}
