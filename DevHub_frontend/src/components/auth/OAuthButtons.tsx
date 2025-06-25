import { FaGoogle, FaGithub, FaMicrosoft } from 'react-icons/fa';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '../../store/useAuthStore';

type OAuthProvider = 'google' | 'github' | 'microsoft';

interface ProviderConfig {
  name: string;
  icon: ReactNode;
  color: string;
}

const providerConfig: Record<OAuthProvider, ProviderConfig> = {
  google: {
    name: 'Google',
    icon: <FaGoogle className="h-5 w-5" />,
    color: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
  },
  github: {
    name: 'GitHub',
    icon: <FaGithub className="h-5 w-5" />,
    color: 'bg-gray-800 hover:bg-gray-900 text-white border-gray-800',
  },
  microsoft: {
    name: 'Microsoft',
    icon: <FaMicrosoft className="h-5 w-5" />,
    color: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300',
  },
};

interface OAuthButtonsProps {
  providers?: OAuthProvider[];
  label?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const OAuthButtons = ({
  providers = ['google'],
  label = 'Or Sign in with',
  onSuccess,
  onError,
}: OAuthButtonsProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuthStore();
  const from = (location.state as { from?: Location })?.from?.pathname || '/';
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get('error');
  const state = searchParams.get('state');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (state || error) {
        try {
          // Decode and validate state
          let returnTo = from;
          if (state) {
            const decodedState = JSON.parse(atob(state));
            if (!decodedState.returnTo) {
              throw new Error('Invalid state parameter');
            }
            returnTo = decodedState.returnTo;
          }

          if (error) {
            throw new Error(decodeURIComponent(error));
          }

          const user = await checkAuth();
          if (user) {
            toast.success(`Signed in with ${user.provider || 'OAuth'} successfully`);
            onSuccess?.();
            navigate(returnTo, { replace: true });
          } else {
            throw new Error('Authentication failed');
          }
        } catch (err) {
          console.error('OAuth callback error:', err);
          onError?.(err instanceof Error ? err : new Error('Authentication failed'));
          toast.error(err instanceof Error ? err.message : 'Failed to sign in with OAuth');
          navigate('/login', { replace: true });
        }
      }
    };

    handleOAuthCallback();
  }, [state, error, from, navigate, checkAuth, onSuccess, onError]);

  const handleOAuthLogin = (provider: OAuthProvider) => {
    // Generate state matching backend format
    const stateParam = btoa(JSON.stringify({ returnTo: from }));
    const backendUrl = import.meta.env.MODE === "development" ? "http://localhost:3000" : "";

    if (provider === 'google') {
      const redirectUrl = `${backendUrl}/api/auth/google?prompt=select_account&state=${encodeURIComponent(stateParam)}`;
      window.location.href = redirectUrl;
    } else {
      const redirectUrl = `${backendUrl}/api/auth/${provider}?state=${encodeURIComponent(stateParam)}`;
      window.location.href = redirectUrl;
    }
  };

  return (
    <div className="mt-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{label}</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3">
        {providers.map((provider) => (
          <div key={provider}>
            <button
              type="button"
              onClick={() => handleOAuthLogin(provider)}
              className={`w-full inline-flex justify-center py-2 px-4 border rounded-md shadow-sm text-sm font-medium ${providerConfig[provider].color} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200`}
            >
              <span className="sr-only">Sign in with {providerConfig[provider].name}</span>
              <span className="ml-2">{providerConfig[provider].name}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OAuthButtons;