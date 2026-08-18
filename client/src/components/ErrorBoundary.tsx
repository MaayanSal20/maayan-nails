import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean }

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('שגיאה נתפסה:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-blush px-6 text-center">
          <div>
            <h1 className="text-2xl font-serif text-wine mb-3">אופס, משהו השתבש</h1>
            <p className="text-wine/70 font-sans mb-6">
              נתקלנו בבעיה זמנית. נסי לרענן את הדף.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-rose text-cream px-6 py-2 rounded-full font-sans hover:bg-wine transition-colors"
            >
              רענון הדף
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary