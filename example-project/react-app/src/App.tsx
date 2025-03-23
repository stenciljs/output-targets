import { useLocation } from 'react-router'
import { TestStage, type TestComponent } from 'react-test-components'
import './App.css'

function App() {
  const location = useLocation();
  const testComponent = location.pathname.slice(1) as TestComponent;

  return (
    <TestStage name={testComponent} />
  )
}

export default App
