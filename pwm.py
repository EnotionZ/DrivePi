#!/usr/bin/python
import sys
sys.path.append('./lib')
from Adafruit_PWM_Servo_Driver import PWM
import time

# Initialise the PWM device using the default address
# bmp = PWM(0x40, debug=True)
pwm = PWM(0x40, debug=True)
pwm.setPWMFreq(60)                        # Set frequency to 60 Hz

mid = 400
def reset():
  pwm.setPWM(0, 0, 0)
  pwm.setPWM(1, 0, 0)
  turn(0)

def drive(val):
  pwm.setPWM(0, 0, mid+val)
  pwm.setPWM(1, 0, mid-val)

turnMid = 379
def turn(val):
  pwm.setPWM(15, 0, turnMid+val)

reset()


