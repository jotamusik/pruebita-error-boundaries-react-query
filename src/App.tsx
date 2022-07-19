import React from 'react'
import './App.css'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider, useQuery
} from 'react-query'


interface ErrorState {
  error: string
  displayError: (newError: string) => void
  clearError: () => void
}

const ErrorContext = React.createContext<ErrorState>({
  error: '',
  displayError: () => {},
  clearError: () => {},
})

const useErrorManager = () => React.useContext<ErrorState>(ErrorContext)

const ErrorContextProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [error, setError] = React.useState<string>('')
  const displayError = (errorToDisplay: string) => {
    setError(errorToDisplay)
  }
  const clearError = () => setError('')
  const stateValue = { error, displayError, clearError }

  return (
    <ErrorContext.Provider value={stateValue}>
      {children}
      <ErrorDisplayer/>
    </ErrorContext.Provider>
  )
}

const ErrorDisplayer: React.FC = () => {
  const { error } = useErrorManager()
  return (
    <div>
      {error && error.length > 0 && <p style={ {color: 'red'}}>{error}</p>}
    </div>
  )
}

const APICaller: React.FC = () => {
  const NOT_GLOBAL_ERROR_HANDLER = { notToBeHandleGlobally: true }
  const query = useQuery('petardasso', () => {
    throw Error('Peter es un chungasso')
  }, {
    meta: { ...NOT_GLOBAL_ERROR_HANDLER },
    onError: () => {
      console.log("TEAM SESSIONS ARE GREAT!")
    }
  })

  const { displayError, clearError } = useErrorManager()
  const throwButtonHandler = () => displayError('peter es un chungo')
  const clearButtonHandler = () => clearError()
  return (
    <>
      <div>
        <button onClick={throwButtonHandler}>Throw Error!</button>
        <button onClick={clearButtonHandler}>Clear Error</button>
      </div>

      <p>{query.data}</p>
    </>  )
}

const QueryClientProviderWithErrorHandling: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { displayError } = useErrorManager()
  const queryCache = new QueryCache({
    onError: (error, query) => {
      if (!query?.meta?.notToBeHandleGlobally) {
        displayError((error as Error).message)
      }
    }
  })
  const queryClient = new QueryClient({ queryCache })
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

function App() {
  return (
    <ErrorContextProvider>
      <QueryClientProviderWithErrorHandling>
        <APICaller/>
      </QueryClientProviderWithErrorHandling>
    </ErrorContextProvider>
  )
}

export default App
