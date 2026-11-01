// Abre la web de Briozzo Calzados en una ventana propia, sin barra de direcciones.
// Compilado con /define:PANEL abre la dashboard en una ventana del tamaño de un celular.
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Windows.Forms;

static class BriozzoCalzados
{
#if PANEL
    const string Nombre = "Panel Briozzo";
    const string Web = "https://adriiromm.github.io/Briozzo23/panel/";
    const string Ventana = "430,880";
#else
    const string Nombre = "Briozzo Calzados";
    const string Web = "https://adriiromm.github.io/Briozzo23/";
    const string Ventana = "1280,800";
#endif

    [STAThread]
    static void Main()
    {
        if (!HayConexion())
        {
            MessageBox.Show(
                Nombre + " necesita internet para abrirse. Revisá tu conexión y volvé a intentar.",
                Nombre, MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }

        string navegador = BuscarNavegador();
        if (navegador == null)
        {
            Process.Start(Web);
            return;
        }

        Process.Start(navegador, "--app=" + Web + " --window-size=" + Ventana);
    }

    static bool HayConexion()
    {
        try
        {
            ServicePointManager.SecurityProtocol = (SecurityProtocolType)3072; // TLS 1.2
            var pedido = (HttpWebRequest)WebRequest.Create(Web);
            pedido.Method = "HEAD";
            pedido.Timeout = 6000;
            using (pedido.GetResponse()) return true;
        }
        catch (WebException e)
        {
            // Si el servidor respondió, aunque sea con un error, hay internet.
            return e.Response != null;
        }
    }

    static string BuscarNavegador()
    {
        string[] carpetas =
        {
            Environment.GetEnvironmentVariable("ProgramFiles(x86)"),
            Environment.GetEnvironmentVariable("ProgramFiles"),
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData)
        };
        string[] programas =
        {
            @"Microsoft\Edge\Application\msedge.exe",
            @"Google\Chrome\Application\chrome.exe"
        };

        foreach (string programa in programas)
            foreach (string carpeta in carpetas)
            {
                if (string.IsNullOrEmpty(carpeta)) continue;
                string ruta = Path.Combine(carpeta, programa);
                if (File.Exists(ruta)) return ruta;
            }
        return null;
    }
}
