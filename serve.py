#!/usr/bin/env python3
"""
TimeBridge VPN / LAN Sharing Server
Binds to 0.0.0.0 to allow team members on the same office VPN or local network
to access TimeBridge in their web browsers.
"""

import http.server
import socketserver
import socket
import subprocess
import sys
import os

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def get_network_ips():
    """Detects active IPv4 addresses on VPN, Wi-Fi, and LAN interfaces."""
    ips = []
    try:
        output = subprocess.check_output(['ifconfig'], text=True)
        current_iface = ""
        for line in output.splitlines():
            if line and not line.startswith(('\t', ' ')):
                current_iface = line.split(':')[0]
            if 'inet ' in line and '127.0.0.1' not in line:
                parts = line.strip().split()
                if len(parts) >= 2:
                    ip = parts[1]
                    ips.append((current_iface, ip))
    except Exception:
        # Fallback to socket hostname method
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ips.append(("primary", s.getsockname()[0]))
            s.close()
        except Exception:
            pass
    return ips

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map.update({
        '.json': 'application/manifest+json',
        '.webmanifest': 'application/manifest+json',
        '.svg': 'image/svg+xml',
        '.js': 'application/javascript',
        '.png': 'image/png',
        '.css': 'text/css',
    })

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def log_message(self, format, *args):
        # Clean logging: show client IP and path
        sys.stderr.write(f"[{self.log_date_time_string()}] {self.client_address[0]} - {args[0]}\n")

def main():
    os.chdir(DIRECTORY)
    ips = get_network_ips()

    # Enable SO_REUSEADDR so restarted servers can immediately bind
    socketserver.TCPServer.allow_reuse_address = True

    port = PORT
    max_attempts = 15

    for attempt in range(max_attempts):
        try:
            with socketserver.TCPServer(("0.0.0.0", port), CustomHTTPRequestHandler) as httpd:
                print("\n" + "=" * 64)
                print(" 🚀 TimeBridge Server is Live on your Office VPN / Network!")
                print("=" * 64)
                print(f"\n📍 Port: {port}")
                print("\n🔗 Share these URLs with your team members on the VPN:\n")
                
                seen_ips = set()
                for iface, ip in ips:
                    if ip not in seen_ips:
                        seen_ips.add(ip)
                        tag = " (VPN / Network)" if iface != "lo0" else " (Internal)"
                        print(f"   👉 http://{ip}:{port}{tag}")
                
                print(f"\n   💻 Local access on your Mac:")
                print(f"      http://localhost:{port}")
                print("\n" + "-" * 64)
                print(" 💡 Tips for sharing:")
                print(" 1. Teammates must be connected to the same office VPN.")
                print(" 2. Keep this terminal window open while teammates are using it.")
                print(" 3. Press [Ctrl + C] anytime to stop the server.")
                print("=" * 64 + "\n")
                
                httpd.serve_forever()
                break

        except OSError as e:
            if e.errno == 48 or "Address already in use" in str(e):
                print(f"Port {port} is occupied, trying port {port + 1}...")
                port += 1
            else:
                print(f"\n❌ Server error: {e}\n")
                break
        except KeyboardInterrupt:
            print("\n🛑 TimeBridge server stopped gracefully. Goodbye!\n")
            break

if __name__ == '__main__':
    main()
