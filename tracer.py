import json
import csv
import pprint

from traceroute import Traceroute

latinamerica = ['Peru', 'Chile', 'Argentina', 'Brazil', 'Colombia', 'Ecuador', 'Bolivia']

def get_ips(filename):
    ips = dict.fromkeys(latinamerica, [])

    with open(filename, 'r') as csvfile:
        reader = csv.reader(csvfile, delimiter=',')

        counter = 0
        for row in reader:
            if row[5] in latinamerica:
                ips[row[5]].append(row[0])

    with open('ips.json', 'w') as ipsjson:
        ipsjson.write(json.dumps(ips, indent=4))

    return ips

def track(ips):
    sources_file = open('sources.json').read()

    sources = json.loads(sources_file)
    source_template = sources['LO']['url']

    for country in ips.keys():
        for ip in ips[country]:

            sources['LO']['url'] = source_template.replace('_IP_ADDRESS_', ip)
            pprint.pprint(sources, indent=4)
            t = Traceroute(ip_address=ip,
                           source=sources['LO'],
                           country='LO')
#            t.ip_address = ip
            print 'Starting'
            hops = t.traceroute()
            print 'Finished'

            pprint.pprint(hops)

            raw_input()

if __name__ == '__main__':
    ips = get_ips('GeoIPCountryWhoIs.csv')
    track(ips)
    print 'OK'
