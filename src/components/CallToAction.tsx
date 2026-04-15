import { useNavigate } from 'react-router-dom'

const CallToAction = () => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate('/community')
  }


  return (
    <section className="py-16 bg-card border-y border-border">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join our platform to discover amazing opportunities or share your own with the community.
        </p>
        <button
          onClick={handleClick}
          className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Get Started
        </button>
      </div>
    </section>
  )
}

export default CallToAction 