import sys

from flask import Flask, Response, request
import requests 


app = Flask(__name__)


API_URL = 'https://api-na.hosted.exlibrisgroup.com/almaws/v1'
API_KEY = 'l7xx63b4aabaf9264e54a680923760dbfa94'
CIRC_DESK = 'GRI Open S'
LIB_NAME = 'GC'

LOAN_XML = """<?xml version='1.0' encoding='UTF-8'?>
  <item_loan>
    <circ_desk>{}</circ_desk>
    <library>{}</library>
  </item_loan>
""".format(CIRC_DESK, LIB_NAME)


@app.route('/')
def root():
    return app.send_static_file('self-check.html')


@app.route('/login/<userid>')
def login(userid):
    url = "{}/users/{}".format(API_URL, userid)
    params = {}
    params['apiKey'] = API_KEY
    params['expand'] = "loans,requests,fees"
    params['format'] = "json"
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return Response(response, mimetype="application/json")
    else:
        return response
    
@app.route('/checkout/<userid>/<barcode>')
def loan(userid, barcode):  
    #test to see if book is already checked out
    barcodeurl = "{}/items".format(API_URL)
    params = {'apiKey': API_KEY,
              'item_barcode': barcode,
              'format': 'json'}
    
    redirect = requests.get(barcodeurl, params=params, allow_redirects=True)
    url = redirect.url
    url, _ = url.split('?')
    url = '{}/loans'.format(url)
    
    #del params['item_barcode']
    loans_response = requests.get(url, params=params)
    print(loans_response.text)
    already_checked_out = loans_response.json().get('item_loan', False)
    if already_checked_out:
        return Response('Already Checked Out', 409)
    
    # Checkout the item    
    url = "{}/users/{}/loans".format(API_URL, userid)
    headers = {'Content-Type': 'application/xml', 'dataType': "xml"}
    response = requests.post(url, params=params, headers=headers, data=LOAN_XML)
    return Response(response, mimetype="application/json")
    

if __name__ == "__main__":
    app.run()
