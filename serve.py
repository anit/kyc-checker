import http.server, ssl, os

os.chdir('/home/r41/lab/demos/redactor')
server = http.server.HTTPServer(('0.0.0.0', 8443), http.server.SimpleHTTPRequestHandler)
ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
ctx.load_cert_chain('cert.pem', 'key.pem')
server.socket = ctx.wrap_socket(server.socket, server_side=True)
print('Serving on https://192.168.0.106:8443')
server.serve_forever()
