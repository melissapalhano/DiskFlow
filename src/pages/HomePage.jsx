import SiteFooter from '../components/layout/SiteFooter.jsx'
import SiteHeader from '../components/layout/SiteHeader.jsx'
import ConceptsSection from '../components/sections/ConceptsSection.jsx'
import Hero from '../components/sections/Hero.jsx'
import IntroStrip from '../components/sections/IntroStrip.jsx'
import QuizSection from '../components/sections/QuizSection.jsx'
import SimulatorSection from '../components/sections/SimulatorSection.jsx'

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <Hero />
      <IntroStrip />
      <ConceptsSection />
      <SimulatorSection />
      <QuizSection />
      <SiteFooter />
    </main>
  )
}
