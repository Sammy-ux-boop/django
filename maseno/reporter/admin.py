from django.contrib import admin
from .models import Incidences , Subcounties
from leaflet.admin import LeafletGeoAdmin
# Register your models here.
class IncidencesAdmin(LeafletGeoAdmin):
    pass
    #list_display=('name','location')

class SubcountiesAdmin(LeafletGeoAdmin):
    pass
    list_display=('subcounty','county')

admin.site.register(Incidences,IncidencesAdmin)
admin.site.register(Subcounties,SubcountiesAdmin)

class Meta:
    verbose_name_plural ='Incidence'