from django.conf.urls.defaults import patterns, include, url
from photoframe.view import show_pic
import settings

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', show_pic),
    url(r'^pictures/(?P<path>.*)$', 'django.views.static.serve',{'document_root': settings.MEDIA_ROOT}),
    # Examples:
    # url(r'^$', 'photoframe.views.home', name='home'),
    # url(r'^photoframe/', include('photoframe.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # url(r'^admin/', include(admin.site.urls)),
)
