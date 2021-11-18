//============================================================================
// Project:    SimpleX
// Module:     
// File:       utilities.js
// 
// SimpleX utility functions.
// 
// Copyright (C) Ryllan Kraft. 2002-2003.  All rights reserved.
//============================================================================

// The MS JScript File System Object, for accessing the Windows file system.
//var fso;
//if (typeof(ActiveXObject) != "undefined")
//  fso = new ActiveXObject("Scripting.FileSystemObject");

function getRadioValue(radioElement)
{
    var value;
    for (var i = 0; i < radioElement.length; i++)
    {
        var rad = radioElement[i];
        if (rad.checked)
        {
            value = rad.value;
            break;
        }
    }
    return value;
}

function showProps(obj, maxLevel, level)
{
    if (!maxLevel) maxLevel = 0;
    if (!level) level = 0;
    var result = '';
    var n = 0;
    for (var i in obj)
    {
        var val = '';
        val = obj[i];
        for (var k = 0; k < level; k++) result += '  ';
        result += '.' + i + ' = ' + val;
        result += '\n';
        if ((level < maxLevel) && (typeof(val) == "object"))
        {
            result += showProps(val, maxLevel, level + 1);
        }
        n++;
    }
    return result;
}

function urliseFile(file)
{
    file = file.split('\\');
    file = file.join('/')
    file = file.split(':');
    file = file.join('|')
    file = 'file://'+file;
    return file;
}

function moveimage(index, len)
{
    var imagefile = 'empty.gif';
    if (len > 1)
    {
        if (index == 0) imagefile = 'roundarrow.gif';
        else imagefile = 'uparrow.gif';
    }
    return imagefile;
}

function member(item, list)
{
    var result = false;
    for (var i in list)
    {
        if (item === list[i])
        {
            result = true;
            break;
        }
    }
    return result;
}

function remove(index, list)
{
    var result = list.slice(0, index);
    result = result.concat(list.slice(index + 1));
    return result;
}

function insert(index, list, item)
{
    var result = list.slice(0, index + 1);
    result = result.concat(item);
    result = result.concat(list.slice(index + 1));
    return result;
}

function moveitem(index, list)
{
//alert('list('+list.length+')='+list);
    var result = list;
    var len = list.length;
    if (len > 1)
    {
        var item = list[index];
        if (index == 0)
        {
            result = list.slice(1);
            result = result.concat(item);
        }
        else
        {
            var prev = list[index - 1];
            if (index == 1)
            {
                result = [item];
                result = result.concat(prev, list.slice(2));
            }
            else
            {
                result = list.slice(0, index - 1);
                result = result.concat(item, prev, list.slice(index + 1));
            }
        }
    }
    return result;
}

var debugstep = false;
var debugpause = false;
function debug(str)
{
    status = str;
    if (debugstep)
    {
        alert(str);
    }
    if (debugpause)
    {
        for (var i = 0; i < debugpause; i++) ;
    }
}

function isChanged(obj)
{
    var changed = false;
//alert("isChanged obj="+obj);
    if ((obj) && (typeof(obj) == "object"))
    {
        var type = obj.type;
        if (typeof(type) != "undefined")
        {
            type = type.toLowerCase();
//alert("isChanged type="+type +" name="+obj.name+" id="+obj.id);
            if ((type == "checkbox" || type == "radio"))
            {
                changed = (obj.checked != obj.defaultChecked)
            }
            else if (type == "text")
            {
                changed = (obj.value != obj.defaultValue);
            }
            else if (type == "textarea")
            {
                changed = (obj.value != obj.defaultValue);
            }
            else if ((type == "select-one") || (type == "select-multiple"))
            {
                var opts = obj.options;
//alert("isChanged select opts="+opts.length);
                for (var i = 0; i < opts.length; i++)
                {
                    var opt = opts[i];
                    changed = (opt.selected != opt.defaultSelected);
//alert("isChanged opt="+opt +" changed="+changed);
                    if (changed) break;
                }
            }
        }
        else
        {
            var elms = obj.elements;
            if (typeof(elms) != "undefined")
            {
                for (var i = 0; i < elms.length; i++)
                {
                    var elm = elms[i];
//alert("isChanged elm="+elm);
                    changed = isChanged(elm);
                    if (changed) break;
                }
            }
        }
    }
    return changed;
}

function escquote(str)
{
    var result = str.split("'");
    result = result.join("\\'");
    return result;
}

function deentitise(str)
{
    var result = str.split("<");
    result = result.join("&lt;");
    result = result.split(">");
    result = result.join("&gt;");
    return result;
}

function trim(str)
{
    var result = str;
    while (result.length > 0)
    {
        var ch = str.charAt(0);
        if ((ch == ' ') || (ch == '\n'))
        {
            result = result.substr(1);
        }
        else
        {
            break;
        }
    }
    while (result.length > 0)
    {
        var ch = str.charAt(result.length - 1);
        if ((ch == ' ') || (ch == '\n'))
        {
            result = result.substr(0, result.length - 1);
        }
        else
        {
            break;
        }
    }
    return result;
}
