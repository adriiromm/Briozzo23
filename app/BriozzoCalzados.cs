// Abre la web de Briozzo Calzados en una ventana propia, sin barra de direcciones.
using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Windows.Forms;

static class BriozzoCalzados
{
    const string Web = "https://adriiromm.github.io/Briozzo23/";

    [STAThread]
    static void Main()
    {
        if (!HayConexion())
        {
            MessageBox.Show(
                "Briozzo Calzados necesita internet para abrirse. Revisá tu conexión y volvé a intentar.",
                "Briozzo Calzados", MessageBoxButtons.OK, MessageBoxIcon.Information);
            return;
        }

        string navegador = BuscarNavegador();
        if (navegador == null)
        {
            Process.Start(Web);
            return;
        }

        Process.Start(navegador, "--app=" + Web + " --window-size=1280,800");
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
        catch (WebException)
        {
            return false;
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
