import os.path
__author__ = 'rafiq'

from django.shortcuts import render_to_response
import glob

def show_pic(request):
    piclist = glob.glob(os.path.join(os.path.dirname(__file__), 'pictures') + '/*.jpg')
    pic = piclist[0].rsplit('\\')[-1]
    return render_to_response('base.html', locals())