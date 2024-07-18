from django.db import models
from django.contrib.gis.db import models
class Incidences(models.Model):
    name = models.CharField(max_length=20)
    location = models.PointField(srid=4326)
    objects=models.Manager()

    def __unicode__(self):
        return self.name

class Subcounties(models.Model):
    country = models.CharField(max_length=254)
    provpcode = models.CharField(max_length=254)
    province = models.CharField(max_length=254)
    ctypcode = models.CharField(max_length=254)
    county = models.CharField(max_length=254)
    subcounty = models.CharField(max_length=254)
    
    geom = models.MultiPolygonField(srid=4326)
    
    def __unicode__(self):
        return self.subcounties
