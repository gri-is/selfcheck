from flask import Flask
app = Flask(__name__)
from flask import request
import requests 
from flask import Response
import xml.dom.minidom as xml

@app.route('/almaws/v1/users/<userid>&expand=loans,requests,fees&format=json')
def login(userid):
	url = "https://api-na.hosted.exlibrisgroup.com/almaws/v1/users/{}".format(userid)
	params = {}
	params['apiKey'] = 'l7xx63b4aabaf9264e54a680923760dbfa94'
	params['expand'] = "loans,requests,fees"
	params['format'] = "json"
	response = requests.get(url, params=params)
	if response.status_code == 200:
		return Response(response, mimetype="application/json")
	else:
		return response
	
@app.route('/almaws/v1/users/<userid>/loans&item_barcode=<barcode>', methods=['GET','POST'])
def loan(userid, barcode):
	libraryName = "GC"
	circDesk = "GRI Open S"
	url = "https://api-na.hosted.exlibrisgroup.com/almaws/v1/users/{}/loans".format(userid)
	params = {}
	#params['user_id_type'] = 'all_unique'
	params['apiKey'] = 'l7xx63b4aabaf9264e54a680923760dbfa94'
	params['item_barcode'] = barcode

	#test to see if book is already checked out
	bibsurl = "https://api-na.hosted.exlibrisgroup.com/almaws/v1/items"
	redirect = requests.get(bibsurl, params=params)
	redirecturl = str(redirect.url)
	index = redirecturl.find('?')
	output = redirecturl[:index] + "/loans" + redirecturl[index:]
	bibresponse = requests.get(output)
	
	if 'total_record_count="0"' in bibresponse.text:
		headers = {'Content-Type': 'application/xml', 'dataType': "xml"}
		xml = "<?xml version='1.0' encoding='UTF-8'?><item_loan><circ_desk>%s</circ_desk><library>%s</library></item_loan>" % (circDesk, libraryName)
		response = requests.post(url, params=params, headers=headers, data=xml)
		if response.status_code == 200:
			return Response(response, mimetype='xml')
		else:
			return response
	else:
		return bibresponse