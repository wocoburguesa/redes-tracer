import json
import csv
import pprint

from traceroute import Traceroute

latinamerica = ['Peru', 'Chile', 'Argentina', 'Brazil', 'Colombia', 'Ecuador', 'Bolivia']

def write_ips(filename):
    ips = {country: [] for country in latinamerica}
#    ips = dict.fromkeys(latinamerica, [])

    with open(filename, 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')

        counter = 0
        for row in reader:
            if row[5] in latinamerica:
                ips[row[5]].append(row[0])

    with open('ips.json', 'w') as ipsjson:
        ipsjson.write(json.dumps(ips, indent=4))

def get_ips(filename):
    with open(filename, 'r') as ipsfile:
        return json.loads(ipsfile.read())

def track(ips):
    sources_file = open('sources.json').read()

    sources = json.loads(sources_file)
    source_template = sources['LO']['url']

    country_hops = dict.fromkeys(latinamerica, {})

    #ACA CAMBIAS EL 4 SI ES QUE CORRE MAS RAPIDO EN TU PC
    for i in range(4):
        for country in ips.keys():
            ip = ips[country][0]
            sources['LO']['url'] = source_template.replace('_IP_ADDRESS_', ip)
#            pprint.pprint(sources, indent=4)
            t = Traceroute(ip_address=ip,
                           source=sources['LO'],
                           country='LO',
                           timeout=900)
#            t.ip_address = ip
            print 'Starting'
            hops = t.traceroute()
            print 'Finished'

            #write it to some structure
            country_hops[country][ip] = hops

            #delete it from ip list
            ips[country].remove(ip)

            pprint.pprint(hops)

    #replace original file with deleted rows
    with open('ips.json', 'w') as ipsjson:
        ipsjson.write(json.dumps(ips, indent=4))

    #write file with obtained hop results
    with open('results.json', 'w') as ipsjson:
        ipsjson.write(json.dumps(country_hops, indent=4))

if __name__ == '__main__':
   ips = get_ips('ips.json')
   track(ips)
#    write_ips('GeoIPCountryWhois.csv')
   print 'OK'
