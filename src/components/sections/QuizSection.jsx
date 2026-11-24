import Quiz from '../Quiz.jsx'
import SectionLabel from '../SectionLabel.jsx'

export default function QuizSection() {
  return (
    <section className="quiz-section" id="quiz">
      <div className="quiz-intro">
        <SectionLabel number="03">REVISÃO</SectionLabel>
        <h2>
          Verifique sua
          <br />
          compreensão
        </h2>
        <p>
          Responda às questões para revisar os principais conceitos apresentados
          nesta página.
        </p>
      </div>
      <Quiz />
    </section>
  )
}
