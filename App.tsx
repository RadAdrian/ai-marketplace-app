
import React, { useState, useCallback, useEffect } from 'react';
import { AIAssistant, NewAIAssistant, User } from './types';
import { fetchAssistants, addAssistant } from './services/assistantService';
import { getCurrentUser, onAuthStateChange, signOut } from './services/authService';
import Header from './components/Header';
import Footer from './components/Footer';
import AssistantGrid from './components/AssistantGrid';
import AssistantDetailModal from './components/AssistantDetailModal';
import CreateAgentSection from './components/CreateAgentSection';
import CustomAICreationModal from './components/CustomAICreationModal';
import AuthModal from './components/AuthModal';
import Spinner from './components/Spinner';

// GUEST_CREATED_AI_KEY is no longer needed as guests cannot create assistants.

const App: React.FC = () => {
  const [assistants, setAssistants] = useState<AIAssistant[]>([]);
  const [isLoadingAssistants, setIsLoadingAssistants] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedAssistant, setSelectedAssistant] = useState<AIAssistant | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isCustomAICreationModalOpen, setIsCustomAICreationModalOpen] = useState<boolean>(false);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authModalMessage, setAuthModalMessage] = useState<string | undefined>(undefined);

  // guestHasCreatedAI state is removed.

  const loadAssistantsData = useCallback(async (currentUserId?: string) => {
    setIsLoadingAssistants(true);
    setFetchError(null);
    try {
      console.log(`[App - loadAssistantsData] Fetching assistants for user: ${currentUserId || 'guest'}`);
      const fetchedAssistants = await fetchAssistants(currentUserId);
      setAssistants(fetchedAssistants);
    } catch (error) {
      console.error("Failed to load assistants:", error);
      setFetchError(error instanceof Error ? error.message : "An unknown error occurred while fetching assistants.");
    } finally {
      setIsLoadingAssistants(false);
    }
  }, []);

  useEffect(() => {
    setIsAuthLoading(true);
    getCurrentUser().then(user => {
      console.log("[App useEffect] Initial currentUser:", user);
      setCurrentUser(user);
      setIsAuthLoading(false);
      loadAssistantsData(user?.id); // Load assistants based on initial auth state
    });

    const authSubscription = onAuthStateChange((event, session) => {
      console.log("[App useEffect] Auth event:", event, "Session:", session);
      const user = session?.user ?? null;
      setCurrentUser(user); // Update current user
      console.log("[App useEffect] CurrentUser updated by auth event:", user);


      if (event === "SIGNED_IN") {
        setIsAuthModalOpen(false);
        setAuthModalMessage(undefined);
        // Clear guest-related session storage (e.g., message counts)
        try {
            Object.keys(sessionStorage).forEach(key => {
                if (key.startsWith('guestMessageCount_')) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (e) {
            console.warn("Could not access sessionStorage to clear guest limits:", e);
        }
        loadAssistantsData(user?.id); // Reload assistants for the signed-in user
      } else if (event === "SIGNED_OUT") {
        loadAssistantsData(); // Reload assistants for guest (public ones)
      }
    });

    return () => {
      authSubscription?.unsubscribe();
    };
  }, [loadAssistantsData]);


  const handleSelectAssistant = useCallback((assistant: AIAssistant) => {
    setSelectedAssistant(assistant);
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setTimeout(() => setSelectedAssistant(null), 300); 
  }, []);

  const handleOpenAuthModal = useCallback((mode: 'login' | 'register', message?: string) => {
    setAuthModalMode(mode);
    setAuthModalMessage(message);
    setIsAuthModalOpen(true);
  }, []);

  const handleCloseAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
    setAuthModalMessage(undefined); 
  }, []);
  
  const handleAuthSuccess = useCallback(() => {
    // This is handled by onAuthStateChange's "SIGNED_IN" event.
  }, []);

  const handleOpenCustomAICreationModal = useCallback(() => {
    if (!currentUser) { 
        handleOpenAuthModal('register', 'Please log in or register to create custom AI assistants.');
        return;
    }
    setIsCustomAICreationModalOpen(true);
  }, [currentUser, handleOpenAuthModal]); 

  const handleCloseCustomAICreationModal = useCallback(() => {
    setIsCustomAICreationModalOpen(false);
  }, []);

  const handleAddAssistant = useCallback(async (newAssistantData: NewAIAssistant) => {
    console.log("[App.tsx handleAddAssistant] Attempting to add assistant. CurrentUser:", currentUser);
    if (!currentUser || !currentUser.id) { // Explicitly check currentUser.id as well
      console.error("[App.tsx handleAddAssistant] Called without a logged-in user or user.id is missing. CurrentUser:", currentUser);
      alert("You must be logged in to create an AI assistant. If you are logged in, please try refreshing the page.");
      if (!currentUser) { // Open auth modal only if currentUser itself is null
          handleOpenAuthModal('register', "Please log in or register to create AI assistants.");
      }
      return;
    }

    console.log('[App.tsx handleAddAssistant] CurrentUser ID being passed to service:', currentUser.id);
    try {
      const addedAssistant = await addAssistant(newAssistantData, currentUser.id); 
      setAssistants(prevAssistants => [addedAssistant, ...prevAssistants]);
      handleCloseCustomAICreationModal();
    } catch (error) {
      console.error("Failed to add assistant:", error);
      alert(`Error creating assistant: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }, [currentUser, handleCloseCustomAICreationModal, handleOpenAuthModal]);


  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Error signing out:", error);
      alert(`Error signing out: ${error.message}`);
    } else {
      setCurrentUser(null); 
      // onAuthStateChange handles loading public assistants
    }
  };
  
  if (isAuthLoading && isLoadingAssistants) { // Check both, as assistants load after auth.
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-neutral-100">
        <Spinner size="large"/>
        <p className="mt-4 text-xl">Loading application...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col text-neutral-100">
      <Header 
        user={currentUser} 
        onLogin={() => handleOpenAuthModal('login')}
        onRegister={() => handleOpenAuthModal('register')}
        onLogout={handleLogout}
        isAuthLoading={isAuthLoading}
      />
      <main className="flex-grow container mx-auto px-4 py-10 sm:py-16">
        <div className="text-center mb-16 sm:mb-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 !leading-tight">
            Discover Your Next <br className="hidden sm:block" /> <span className="text-primary-400">AI Powerhouse</span>
          </h1>
          <p className="text-lg sm:text-xl text-neutral-300 max-w-3xl mx-auto">
            Explore a universe of intelligent assistants ready to revolutionize your workflow, or forge your own custom AI agent tailored to your unique vision.
          </p>
        </div>

        {isLoadingAssistants && !fetchError && (
          <div className="flex justify-center items-center py-12">
            <Spinner size="large" />
            <p className="ml-4 text-xl text-neutral-300">Loading assistants...</p>
          </div>
        )}
        {fetchError && (
          <div className="text-center py-12 px-4 bg-neutral-800/50 rounded-lg shadow-xl">
            <p className="text-red-400 text-xl mb-2">Oops! Something went wrong.</p>
            <p className="text-neutral-300 mb-1">Could not load AI assistants.</p>
            <p className="text-neutral-400 text-sm mb-4">Error: {fetchError}</p>
            <button 
              onClick={() => loadAssistantsData(currentUser?.id)}
              className="mt-4 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
            >
              Try Again
            </button>
          </div>
        )}
        {!isLoadingAssistants && !fetchError && (
          <AssistantGrid assistants={assistants} onSelectAssistant={handleSelectAssistant} />
        )}
        
        <CreateAgentSection 
            onStartBuilding={handleOpenCustomAICreationModal} 
        />
      </main>
      <Footer />
      {selectedAssistant && (
        <AssistantDetailModal
          assistant={selectedAssistant}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          currentUser={currentUser}
          onAuthRequired={(message) => handleOpenAuthModal('register', message)}
        />
      )}
      <CustomAICreationModal
        isOpen={isCustomAICreationModalOpen}
        onClose={handleCloseCustomAICreationModal}
        onAddAssistant={handleAddAssistant}
      />
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        message={authModalMessage}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
