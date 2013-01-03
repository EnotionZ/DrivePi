import re
import tornado.ioloop
import tornado.web
import tornado.websocket
import pwm


class EchoWebSocket(tornado.websocket.WebSocketHandler):
  def open(self):
    print "WebSocket opened"

  def on_message(self, message):
    match = re.search(r'(\S+)\s(.+)', message)
    cmd = match.group(1)
    val = match.group(2)
    print '[Command: ' + cmd + ']    [value: ' + val + ']'
    self.write_message(u"[Command: " + cmd + "]    [value: " + val + "]")

    if(cmd == 'drive'):
      pwm.drive(int(float(val)))
    if(cmd == 'turn'):
      pwm.turn(-int(float(val)))

  def on_close(self):
    print "WebSocket closed"

class StaticFileHandler(tornado.web.StaticFileHandler):
  def initialize(self, path, default_filename=None):
    tornado.web.StaticFileHandler.initialize(self, path, "index.html")

application = tornado.web.Application([
  (r"/websocket", EchoWebSocket),
  (r"/(.*)", StaticFileHandler, {"path": "./static"},),
])

if __name__ == "__main__":
  application.listen(8888)
  tornado.ioloop.IOLoop.instance().start()
