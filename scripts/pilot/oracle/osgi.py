# OSGi (Equinox gogo) console over telnet, pilot server only. usage: python3 osgi.py "cmd1" "cmd2" ...
import socket, time, sys
s = socket.create_connection(('localhost', 12612)); s.settimeout(2)
IAC, DO, DONT, WILL, WONT, SB, SE = 255, 253, 254, 251, 252, 250, 240
def rd(wait=2.0):
    out = b''; end = time.time() + wait
    while time.time() < end:
        try:
            d = s.recv(65536)
            if not d: break
            out += d
        except socket.timeout:
            pass
    # answer negotiations
    i = 0; clean = b''
    while i < len(out):
        if out[i] == IAC and i + 2 < len(out) + 1:
            cmd = out[i+1] if i+1 < len(out) else 0
            opt = out[i+2] if i+2 < len(out) else 0
            if cmd == WILL: s.sendall(bytes([IAC, DO, opt]))
            elif cmd == DO:
                if opt == 24: s.sendall(bytes([IAC, WILL, 24]))
                elif opt == 31: s.sendall(bytes([IAC, WILL, 31, IAC, SB, 31, 0, 200, 0, 50, IAC, SE]))
                else: s.sendall(bytes([IAC, WONT, opt]))
            elif cmd == SB:
                j = out.find(bytes([IAC, SE]), i)
                if out[i+2] == 24: s.sendall(bytes([IAC, SB, 24, 0]) + b'VT100' + bytes([IAC, SE]))
                i = (j + 2) if j >= 0 else len(out); continue
            i += 3; continue
        clean += out[i:i+1]; i += 1
    return clean.decode('latin1')
rd(2); rd(1)
for c in sys.argv[1:]:
    s.sendall(c.encode() + b'\r\n')
    print(rd(float(__import__('os').environ.get('OSGI_WAIT', '4'))))
