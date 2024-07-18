import os
from django.contrib.gis.utils import LayerMapping
from .models import Subcounties

subcounties_mapping = {
    'country': 'country',
    'provpcode': 'provpcode',
    'province': 'province',
    'ctypcode': 'ctypcode',
    'county': 'county',
    'subcounty': 'subcounty',
    'geom': 'MULTIPOLYGON',
}

shapefile="subcounty.shp"
def run(verbose=True):
    lm=LayerMapping(Subcounties,shapefile,subcounties_mapping,transform=False,encoding='iso-8859-1')
    lm.save(strict=True,verbose=verbose)