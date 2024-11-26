using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using NotasFireBase.Services;
using System.Diagnostics.Metrics;

namespace NotasFireBase
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebAssemblyHostBuilder.CreateDefault(args);
            builder.RootComponents.Add<App>("#app");
            builder.RootComponents.Add<HeadOutlet>("head::after");

            builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

            // Adicione a configuração do Firebase
            builder.Services.AddScoped(_ => new FirebaseAuthConfig
            {
                ApiKey = "AIzaSyDnCxemaZtL1bR5_3RXH3u8UtV7JE5ufG8",
                AuthDomain = "notasfirebase-1bcb1.firebaseapp.com",
                ProjectId = "notasfirebase-1bcb1",
                StorageBucket = "notasfirebase-1bcb1.firebasestorage.app",
                MessagingSenderId = "395638444811",
                AppId= "1:395638444811:web:c3ac8d3f571c19ee04080e"
            });

            builder.Services.AddScoped<AuthService>();

            await builder.Build().RunAsync();
        }
    }
}
