//============================================================================
// Project:    SimpleX
// Module:     
// File:       editrequests.js
// 
// SimpleX edit requests functions.
// 
// Copyright (C) Ryllan Kraft. 2002-2003.  All rights reserved.
//============================================================================

var defaultDataname = 'New Dataitem';
var defaultOneofValue = 'A value';

function listRequests()
{
//alert('listRequests suppressOnload='+suppressOnload+' top.editPage='+top.editPage);
    if (!suppressOnload)
    {
        suppressOnload = false;
        var replace = false;
        if (top.editPage == 'Requests') replace = true;
        var str = listRequestsPage();
        setMainPage(str, replace);
    }
    suppressOnload = false;
}

function termListRequests()
{
    if (!suppressOnunload)
    {
        var main = top.frames["main"];
        if (main)
        {
            var str = invalidRequests();
            if (str)
            {
                alert('Invalid requests:' + str);
                listRequests();
            }
            else
            {
                if (isChanged(main.document.frmIO))
                {
                    var str = 'Do you want to save the changes to these requests';
                    var ans = confirm(str);
                    if (ans)
                    {
                        updateRequests(true/*dontRedraw*/);
                    }
                }
            }
        }
    }
    suppressOnunload = false;
}

function listRequestsPage()
{
    var str = pageHeader('Requests', 'top.listRequests()', 'top.termListRequests()');
    str += '<form name="frmIO" onclick="top.handleChanges()" onkeyup="top.handleChanges()">\n';
    if (kb.requests.length == 0)
    {
        str += '<p><a href="javascript:top.addRequest(0)">';
        str += '<img src="add.gif" alt="Add request"></a></p>\n';
    }
    else
    {
        str += '<table border="1">\n';
        for (var r in kb.requests)
        {
            str += genListRequest(r);
        }
        str += '</table><br>\n';
    }
    str += '<input type="button" name="btnUpdate" value="Update" disabled' + 
           ' onclick="top.updateRequests()">\n';
    str += '&nbsp;<input type="button" name="btnReset" value="Reset" disabled' +
           ' onclick="top.resetRequests()">\n';
    str += '</form>\n';
    str += '</body>\n</html>\n';
    return str;
}

function genListRequest(r)
{
    var str = '';
    var request = kb.requests[r];
    var dname = request.dataname;
    str += '<tr><td><a href="javascript:top.deleteRequest('+r+')">';
    str += '<img src="delete.gif" alt="Delete request"></a></td>';
    str += '<td>ask</td>';
    str += '<td>' + genSelectDataitem(dname, 'request', r) + '</td>';
    var style = request.style;
    str += '<td>' + genSelectRequestStyle(style, r) + '</td>';
    str += '<td></td><td></td><td><a href="javascript:top.moveRequest('+r+')">';
    str += '<img src="'+moveimage(r,kb.requests.length)+'" alt="Move request"></a></td>';
    str += '<td><a href="javascript:top.addRequest('+r+')">';
    str += '<img src="add.gif" alt="Add request"></a></td><tr>\n';
    prm = request.prompt;
    if (!prm) prm = '';
    str += '<tr><td></td>';
    str += '<td colspan="3"><input type="text" name="txtReqPrm' + r + '"';
    str += ' value="' + prm + '" style="width:100%"></td>';
    str += '<td></td></tr>';
    if (style == 'oneof')
    {
        if (request.attributes.length > 0)
        {
            for (a in request.attributes)
            {
                str += '<tr><td></td>';
                str += '<td><a href="javascript:top.deleteOption('+r+', '+a+')">';
                str += '<img src="delete.gif" alt="Delete option"></a></td>';
                var opt = request.attributes[a];
                if (!opt) opt = '';
                str += '<td colspan="2"><input type="text" name="txtReqOpt'+r+'_'+a+'"';
                str += ' value="' + opt + '" style="width:100%"></td>';
                str += '<td><a href="javascript:top.moveOption('+r+', '+a+')">';
                str += '<img src="'+moveimage(a,request.attributes.length)+'" alt="Move option"></a></td>';
                str += '<td><a href="javascript:top.addOption('+r+', '+a+')">';
                str += '<img src="add.gif" alt="Add option"></a></td><td></td><tr>\n';
            }
        }
        else
        {
            alert('genListRequest: Must have request \'oneof\' value');
        }
    }
    return str;
}

function genSelectRequestStyle(style, r)
{
    var str = '';
    if (!member(style, [false, 'yesno', 'oneof']))
    {
        alert('genSelectRequestStyle: Action type not a valid one');
    }
    var selnName = 'selStyle';
    selnName = selnName + r;
    str += '<select name="' + selnName + '"' +
           ' onchange="top.changedRequestStyle(this, '+r+')">';
    str += '<option';
    if (!style) str += ' selected';
    str += '>-';
    str += '<option';
    if (style == 'yesno') str += ' selected';
    str += '>yesno';
    str += '<option';
    if (style == 'oneof') str += ' selected';
    str += '>oneof</select>';
    return str;
}

function deleteRequest(r)
{
    var str = 'Are you sure you want to delete this request';
    var ans = confirm(str);
    if (ans)
    {
        if (isChanged(main.document.frmIO))
        {
            updateRequests(true/*dontRedraw*/);
        }
        kb.requests = remove(r, kb.requests);
        compileKB(); // May have removed dataitems.
        listRequests();
    }
}

function addRequest(r)
{
    if (isChanged(main.document.frmIO))
    {
        updateRequests(true/*dontRedraw*/);
    }
    var dataitem = getDataitem(0);
    var dname = defaultDataname;
    if (dataitem) dname = dataitem.dataname;
    kb.requests = insert(r, kb.requests, new Request(dname));
    compileKB(); // May have removed dataitems.
    listRequests();
}

function moveRequest(r)
{
    if (isChanged(main.document.frmIO))
    {
        updateRequests(true/*dontRedraw*/);
    }
    kb.requests = moveitem(r, kb.requests);
    listRequests();
}

function changedRequestStyle(seln, r)
{
    var style = seln.options[seln.selectedIndex].text;
    if (isChanged(main.document.frmIO))
    {
        updateRequests(true/*dontRedraw*/);
    }
    kb.requests[r].style = style;
    var atts;
    if (!style) atts = [];
    else if (style == 'yesno') atts = [];
    else if (style == 'oneof') atts = [defaultOneofValue];
    kb.requests[r].attributes = atts;
    listRequests();
}

function deleteOption(r, a)
{
    var request = kb.requests[r];
    if (request.attributes.length == 1)
    {
        alert('Request style \'oneof\' must have a value');
    }
    else
    {
        var str = 'Are you sure you want to delete this option from the request';
        var ans = confirm(str);
        if (ans)
        {
            if (isChanged(main.document.frmIO))
            {
                updateRequests(true/*dontRedraw*/);
            }
            request.attributes = remove(a, request.attributes)
            compileKB(); // May have removed dataitems.
            listRequests();
        }
    }
}

function addOption(r, a)
{
    if (isChanged(main.document.frmIO))
    {
        updateRequests(true/*dontRedraw*/);
    }
    var request = kb.requests[r];
    request.attributes = insert(a, request.attributes, defaultOneofValue);
    listRequests();
}

function moveOption(r, a)
{
    if (isChanged(main.document.frmIO))
    {
        updateRequests(true/*dontRedraw*/);
    }
    var request = kb.requests[r];
    request.attributes = moveitem(a, request.attributes);
    listRequests();
}

function resetRequests(r)
{
    listRequests();
}

function invalidRequests()
{
    var str = '';
/******************************************************************************
    var form = top.frames["main"].document.frmIO;
    if (form)
    {
        with (form)
        {
            for (var r in kb.requests)
            {
                var request = kb.requests[r];
                var elm = elements['selDataReq'+r];
                if (elm)
                {
					var dname = elm.options[elm.selectedIndex].text;
					if (!dname)
					{
					    str += '\nRequest';
					    if (r)
					    {
					        var index = Number(r) + 1;
					        str += ' ' + index;
					    }
					    str += ' needs valid dataname';
					}
				}
            }
        }
    }
******************************************************************************/
    return str;
}

function updateRequests(dontRedraw)
{
    var form = top.frames["main"].document.frmIO;
    if (form)
    {
        var str = invalidRequests();
        if (str)
        {
            alert('Invalid requests:' + str);
            dontRedraw = false;
        }
        else
        {
            with (form)
            {
                // Dont change selections: request style, output item. 
                // Change texts: prompt, oneof options.
                // Change selections: request data.

                for (var r in kb.requests)
                {
                    var request = kb.requests[r];
                    var elm = elements['selDataReq'+r];
                    var dname;
                    if (elm) dname = elm.options[elm.selectedIndex].text;
                    if (dname && (dname != newDataitemText))
                    {
                        request.dataname = dname;
                    }

                    elm = elements['txtReqPrm'+r];
                    request.prompt = elm.value;
                    if (request.style == 'oneof')
                    {
                        if (request.attributes.length > 0)
                        {
                            for (a in request.attributes)
                            {
                                elm = elements['txtReqOpt'+r+'_'+a];
                                request.attributes[a] = elm.value;
                            }
                        }
                        else
                        {
                            alert('updateRequests: Must have oneof attribute(s)');
                        }
                    }
                }
            }
        }
    }
    if (!dontRedraw)
    {
        listRequests();
    }
}
