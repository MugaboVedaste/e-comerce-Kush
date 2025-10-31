import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE','kush.settings')
django.setup()
from django.test import RequestFactory
from store import views
req = RequestFactory().get('/')
resp = views.landing_page(req)
content = resp.content.decode('utf-8')
print('len:', len(content))
print('contains "nnn"?', 'nnn' in content)
idx = content.find('nnn')
print('index', idx)
if idx != -1:
    print(content[max(0, idx-120): idx+120])
