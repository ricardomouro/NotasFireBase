using Microsoft.JSInterop;
using System;

namespace NotasFireBase.Services
{
    public class AuthService : IAsyncDisposable
    {
        private readonly IJSRuntime _jsRuntime;
        private readonly FirebaseAuthConfig _config;
        private DotNetObjectReference<AuthService>? _objectReference;

        public event Action<UserInfo?>? UserChanged;

        public AuthService(IJSRuntime jsRuntime, FirebaseAuthConfig config)
        {
            _jsRuntime = jsRuntime;
            _config = config;
        }

        public async Task InitializeFirebaseAsync()
        {
            _objectReference = DotNetObjectReference.Create(this);
            await _jsRuntime.InvokeVoidAsync("initializeFirebase", _config, _objectReference);
        }

        public async Task<UserInfo?> SignInWithGoogleAsync()
        {
            try
            {
                return await _jsRuntime.InvokeAsync<UserInfo>("signInWithGoogle");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error signing in with Google: {ex.Message}");
                return null;
            }
        }

        public async Task<UserInfo?> GetCurrentUserAsync()
        {
            try
            {
                return await _jsRuntime.InvokeAsync<UserInfo>("getCurrentUser");
            }
            catch
            {
                return null;
            }
        }

        public async Task SignOutAsync()
        {
            try
            {
                await _jsRuntime.InvokeVoidAsync("signOut");
                UserChanged?.Invoke(null);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error signing out: {ex.Message}");
            }
        }

        [JSInvokable]
        public void OnAuthStateChanged(UserInfo? user)
        {
            UserChanged?.Invoke(user);
        }

        public async ValueTask DisposeAsync()
        {
            if (_objectReference != null)
            {
                await _jsRuntime.InvokeVoidAsync("removeAuthStateChangedListener");
                _objectReference.Dispose();
            }
        }
    }

}