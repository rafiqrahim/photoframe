import os.path
__author__ = 'rafiq'

from django.shortcuts import render_to_response
import glob

def slide(request):
    section = generate_section()
    content =  generate_content()
    return render_to_response('index.html',locals())

def get_images_path():
    path = glob.glob(os.path.join(os.path.dirname(__file__), u'media/assets/images') + u'/*.jpg')
    clean_path = []
    for item in path:
        clean_path.append('/'.join(item.replace('/','\\').rsplit('\\')[-4:]).encode('utf8'))
    return clean_path

def get_images_name():
    images = get_images_path()
    image_name = []
    for image in images:
        image_name.append(image.rsplit('/')[-1][:-4])
    return image_name
        

def generate_content():
    image_name_list = get_images_name()
    table_items = []
    content = '<table>'
    for name in image_name_list:
        table_items.append("<td><a href='#/" + str(image_name_list.index(name) + 1) + "'>" + name + '</a></td>')
    while len(table_items) is not 0:
        try:
            content = content + '<tr>'
            for i in range(4):
                content = content + table_items.pop(0)
            content = content + '</tr>'
        except IndexError:
            pass

    return content + '</tr></table>'
        
        

def generate_section():
    section = ''
    images_path_list = get_images_path()
    image_name_list = get_images_name()
    for i in range(len(images_path_list)):
        image_path = images_path_list[i]
        image_name = image_name_list[i]
        section = section + "<section><h3>" + image_name +  "</h3><img src='" + image_path + "'></section>"
    return section

