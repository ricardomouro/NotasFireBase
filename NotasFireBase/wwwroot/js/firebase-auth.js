// wwwroot/js/firebase-auth.js
let auth = null;
let dotNetReference = null;
let firebaseConfig = null;  // Armazena a configuração para uso posterior

window.initializeFirebase = async (config, dotNetRef) => {
  const { initializeApp, getAuth, onAuthStateChanged } = window.firebaseModules;
  dotNetReference = dotNetRef;

  // Armazena a configuração
  firebaseConfig = config;

  // Initialize Firebase
  const app = initializeApp({
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId
  });
  auth = getAuth(app);

  // Set up auth state change listener
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const userInfo = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      };
      dotNetReference.invokeMethodAsync('OnAuthStateChanged', userInfo);
    } else {
      dotNetReference.invokeMethodAsync('OnAuthStateChanged', null);
    }
  });
};

window.signInWithGoogle = async () => {
  const { GoogleAuthProvider, signInWithPopup } = window.firebaseModules;
  try {
    const provider = new GoogleAuthProvider();
    // Força a seleção de conta toda vez
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

window.signOut = async () => {
  const { GoogleAuthProvider } = window.firebaseModules;
  try {
    // Limpa o cache de autenticação
    await auth.signOut();

    // Revoga o token de acesso
    const googleProvider = new GoogleAuthProvider();
    await auth.currentUser?.unlink(googleProvider.providerId);

    // Limpa o localStorage do Firebase usando o projectId da configuração
    if (firebaseConfig?.projectId) {
      localStorage.removeItem(`firebase:host:${firebaseConfig.projectId}.firebaseapp.com`);

      // Limpa outros possíveis itens relacionados ao Firebase
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.includes('firebase:') || key?.includes(firebaseConfig.projectId)) {
          localStorage.removeItem(key);
        }
      }
    }

    // Limpa cookies relacionados ao Firebase/Google
    document.cookie.split(";").forEach(function (c) {
      document.cookie = c.replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });

    // Recarrega a página para garantir um estado limpo
    window.location.reload();
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

window.getCurrentUser = () => {
  const user = auth.currentUser;
  if (user) {
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };
  }
  return null;
};

window.removeAuthStateChangedListener = () => {
  const { onAuthStateChanged } = window.firebaseModules;
  if (auth) {
    onAuthStateChanged(auth, () => { });
  }
};