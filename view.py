import os.path
__author__ = 'rafiq'

from django.shortcuts import render_to_response
import glob

def show_pic(request):
    piclist = glob.glob(os.path.join(os.path.dirname(__file__), u'media/assets/images') + u'/*.jpg')
    pic = '/'.join(piclist[0].replace('/','\\').rsplit('\\')[-4:]).encode('utf8')
    return render_to_response('base.html', locals())

def slide(request):
    return render_to_response('index.html',locals())