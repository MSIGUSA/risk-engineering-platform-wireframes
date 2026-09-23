import { RepProvider } from './state/RepContext';
import { useRep } from './state/repHooks';
import TopNavigator from './components/TopNavigator';
import WorkspaceNavigation from './components/WorkspaceNavigation';
import WorkspacePanel from './components/WorkspacePanel';
import ContextSidebar from './components/ContextSidebar';
import './App.css';
import './rep.css';

export default function App() {
  return (
    <RepProvider>
      <RepShell />
    </RepProvider>
  );
}

function RepShell() {
  const { authenticatedUser } = useRep();
  const shellClasses = ['wb-shell', `rep-audience-${(authenticatedUser.role.startsWith('customer') && 'customer') || (authenticatedUser.role === 'vendor' && 'vendor') || 'workforce'}`].join(' ');

  return (
    <div className={shellClasses}>
      <TopNavigator />
      <div className="wb-body">
        <WorkspaceNavigation />
        <main className="wb-content">
          <WorkspacePanel />
        </main>
        <ContextSidebar />
      </div>
    </div>
  );
}
