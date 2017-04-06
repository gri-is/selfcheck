import os
import sys


path = os.path.dirname(os.path.abspath(__file__))
if path not in sys.path:
    sys.path.insert(0, path)

from selfcheckout import app as application
                                              
