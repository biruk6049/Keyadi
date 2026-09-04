import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Keyadi ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#100e0b] text-[#f3f1ec] font-sans">
          <div className="max-w-md w-full rounded-2xl p-6 border border-white/10 bg-white/5 backdrop-blur-xl text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4 text-xl">
              ⚠️
            </div>
            <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
            <p className="text-xs text-white/60 mb-3 leading-relaxed">
              Keyadi encountered an unexpected display issue. Your saved data and trackers are safe.
            </p>
            {this.state.error && (
              <div className="mb-4 rounded-xl bg-red-950/40 border border-red-500/20 p-3 text-left">
                <p className="text-xs font-mono text-red-300 font-semibold">{this.state.error.toString()}</p>
                {this.state.error.stack && (
                  <pre className="text-[10px] font-mono text-red-200/70 mt-1 max-h-32 overflow-auto whitespace-pre-wrap">
                    {this.state.error.stack.split('\n').slice(0, 5).join('\n')}
                  </pre>
                )}
              </div>
            )}
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 rounded-full bg-amber-500 text-black font-medium text-xs hover:opacity-90 transition shadow-lg"
            >
              Reload Dashboard
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
